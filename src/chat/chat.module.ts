import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { ActiveChat } from './entities/activeChat.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Chat,
      Message,
      ActiveChat
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway]
})
export class ChatModule { }
