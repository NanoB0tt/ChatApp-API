import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getChatAdapter } from './chat.adapter';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async addMessage({ room, message }, from: string) {
    const data = await this.chatRepository.save({
      roomId: room,
      message,
      from,
    });
    return getChatAdapter(data);
  }

  async getAllMessages(room: string) {
    const data = await this.chatRepository.find({
      where: {
        roomId: room,
      },
    });
    return getChatAdapter(data);
  }
}
