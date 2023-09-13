import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) { }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client conected: ', client.id)
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconected: ', client.id)
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(message);
    console.log('this is the room name: ', message);
    console.log('this are the rooms Im in: ', client.rooms);
  }

  @SubscribeMessage('sendMessage')
  activeConnection(
    @MessageBody() message: { message: string, to: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(message.to).emit('privateMessage', {
      message: message.message,
      from: client.handshake.auth.id
    });
    console.log('message: ', message.message, 'to: ', message.to, 'from: ', client.handshake.auth.id);
  }

  @SubscribeMessage('invitationSend')
  invitation(
    @MessageBody() message: User
  ) {
    const friendRequest = {
      status: 'pending',
      creator: message
    }
    this.server.emit('invitationRecieved', friendRequest);
  }

  @SubscribeMessage('responseToRequest')
  response(
    @MessageBody() message: User,
  ) {
    this.server.emit('addFriend', message);
  }

}
