import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatController } from './chat.controller';
import { Friendship } from 'src/auth/entities/friend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Friendship]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController]
})
export class ChatModule { }
