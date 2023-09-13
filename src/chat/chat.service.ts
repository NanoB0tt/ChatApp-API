import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) { }

  async addMessage({ room, message }, from: string) {
    const chatMessage = { message, from };
    const chatExists = await this.chatRepository.findOne({
      where: { room }
    });
    if (chatExists) {
      const oldChat = chatExists.content
      return await this.chatRepository.save({
        room,
        content: [...oldChat, chatMessage]
      });
    }
    return await this.chatRepository.save({
      room,
      content: [chatMessage]
    });
  }

  async getAllMessages(room: string) {
    return await this.chatRepository.findOne({
      where: {
        room
      },
      select: ['content']
    })
  }

}
