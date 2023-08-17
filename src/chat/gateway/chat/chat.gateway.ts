import { UseGuards } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { of, Subscription, take, tap } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ChatService } from 'src/chat/chat.service';
import { ActiveChat } from 'src/chat/entities/activeChat.entity';
import { Message } from 'src/chat/entities/message.entity';

@WebSocketGateway({ cors: { origin: ['http://localhost:5173'] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) { }

  //TODO remove this later
  onModuleInit() {
    this.chatService.removeActiveChat().pipe(take(1)).subscribe()
    this.chatService.removeMessages().pipe(take(1)).subscribe()
    this.chatService.removeChats().pipe(take(1)).subscribe()
  }

  @WebSocketServer()
  server: Server

  @UseGuards(JwtGuard)
  handleConnection(socket: Socket) {
    console.log('conection made');

    const jwt = socket.handshake.headers.authorization || null;
    this.authService.getJwtUser(jwt).subscribe((user: User) => {
      if (!user) {
        this.handleDisconnect(socket);
      } else {
        socket.data.user = user;
        this.getChat(socket, user.id)
      }
    })
  }

  getChat(socket: Socket, userId: string): Subscription {
    return this.chatService.getChatWithUsers(userId)
      .subscribe((chats) => {
        this.server.to(socket.id).emit('chats', chats)
      })
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnected');
    this.chatService.leaveChat(socket.id).pipe(take(1)).subscribe()
  }

  @SubscribeMessage('createChat')
  createChat(socket: Socket, friend: User) {
    this.chatService.createChat(socket.data.user, friend)
      .pipe(take(1)).subscribe(() => {
        this.getChat(socket, socket.data.user.id)
      });
  }

  @SubscribeMessage('sendMessage')
  handleMessage(socket: Socket, newMessage: Message) {
    if (!newMessage.chat) return of(null);

    const { user } = socket.data
    newMessage.user = user;

    if (newMessage.chat.id) {
      this.chatService
        .createMessage(newMessage)
        .pipe(take(1))
        .subscribe((message: Message) => {
          newMessage.id = message.id

          this.chatService.getActiveUsers(newMessage.chat.id).pipe(take(1))
            .subscribe((activeChat: ActiveChat[]) => {
              activeChat.forEach((activeChat: ActiveChat) => {
                this.server.to(activeChat.socketId).emit('newMessage', newMessage)
              })
            })
        })
    }
  }

  @SubscribeMessage('joinChat')
  joinChat(socket: Socket, friendId: string) {
    this.chatService.joinChat(friendId, socket.data.user.id, socket.id)
      .pipe(
        tap((activeChat: ActiveChat) => {
          this.chatService.getMessages(activeChat.chatId)
            .pipe(take(1))
            .subscribe((messages: Message[]) => {
              this.server.to(socket.id).emit('messages', messages)
            })
        })
      )
      .pipe(take(1))
      .subscribe()
  }

  @SubscribeMessage('leaveChat')
  leaveChat(socket: Socket) {
    this.chatService.leaveChat(socket.id)
      .pipe(take(1))
      .subscribe()
  }

}
