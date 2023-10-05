import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Message } from 'src/user/interfaces/interfaces';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client conected: ', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconected: ', client.id);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() message: string, @ConnectedSocket() client: Socket) {
    client.join(message);
  }

  @SubscribeMessage('sendMessage')
  activeConnection(
    @MessageBody() message: Message,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(message.roomId).emit('privateMessage', {
      message: message.message,
      createdAt: message.createdAt,
      from: client.handshake.auth.id,
    });
  }

  @SubscribeMessage('invitationSend')
  invitation(@MessageBody() message: User) {
    const friendRequest = {
      status: 'pending',
      creator: message,
    };
    this.server.emit('invitationRecieved', friendRequest);
  }

  @SubscribeMessage('responseToRequest')
  response(@MessageBody() message: User) {
    this.server.emit('addFriend', message);
  }
}
