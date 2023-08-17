import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, mergeMap, Observable, of, switchMap, take } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { ActiveChat } from './entities/activeChat.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatInterface } from './interfaces/chat.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(ActiveChat)
    private readonly activeChatRepository: Repository<ActiveChat>,
  ) { }

  getChat(creatorId: string, friendId: string): Observable<Chat | undefined> {
    return from(this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin('chat.users', 'users')
      .where('user.id = :creatorId', { creatorId })
      .orWhere('user.id = :friendId', { friendId })
      .groupBy('chat.id')
      .having('COUNT(*) > 1')
      .getOne(),
    )
  }

  createChat(creator: User, friend: User): Observable<Chat> {
    return this.getChat(creator.id, friend.id).pipe(
      switchMap((chat: Chat) => {
        const doesChatExist = !!chat;
        if (!doesChatExist) {
          const newChat: ChatInterface = {
            users: [creator, friend]
          }
          return from(this.chatRepository.save(newChat))
        }
        return of(chat)
      })
    );
  }

  getChatsForUser(userId: string): Observable<Chat[]> {
    return from(this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin('chat.users', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('chat.lastUpdated', 'DESC')
      .getMany(),
    );
  }

  getUsersInChat(chatId: string): Observable<Chat[]> {
    return from(this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.users', 'user')
      .where('chat.id = :chatId', { chatId })
      .getMany(),
    );
  }

  getChatWithUsers(userId: string): Observable<Chat[]> {
    return this.getChatsForUser(userId).pipe(
      take(1),
      switchMap((chat: Chat[]) => chat),
      mergeMap((chat: Chat) => {
        return this.getUsersInChat(chat.id)
      })
    );
  }

  joinChat(friendId: string, userId: string, socketId: string): Observable<ActiveChat> {
    return this.getChat(userId, friendId).pipe(
      switchMap((chat: Chat) => {
        if (!chat) {
          console.warn(`No chat exists fro userId: ${userId} and friendId: ${friendId}`)
          return of();
        }
        const chatId = chat.id;
        return from(this.activeChatRepository.findOne({
          where: { userId }
        })).pipe(
          switchMap((activeChat: ActiveChat) => {
            if (activeChat) {
              return from(
                this.activeChatRepository.delete({ userId }),
              ).pipe(
                switchMap(() => {
                  return from(
                    this.activeChatRepository.save({
                      socketId,
                      userId,
                      chatId,
                    }),
                  );
                }),
              );
            } else {
              return from(
                this.activeChatRepository.save({
                  socketId,
                  userId,
                  chatId,
                }),
              );
            }
          }),
        );
      }),
    )
  }

  leaveChat(socketId: string): Observable<DeleteResult> {
    return from(this.activeChatRepository.delete({ socketId }));
  }

  getActiveUsers(chatId: string): Observable<ActiveChat[]> {
    return from(
      this.activeChatRepository.find({
        where: [{ chatId }],
      }),
    );
  }

  createMessage(message: Message): Observable<Message> {
    return from(this.messageRepository.save(message));
  }

  getMessages(chatId: string): Observable<Message[]> {
    return from(
      this.messageRepository
        .createQueryBuilder('message')
        .innerJoinAndSelect('message.user', 'user')
        .where('message.chat.id = :chatId', { chatId })
        .orderBy('message.createdAt', 'ASC')
        .getMany(),
    );
  }

  //TODO remove this later (Helper methods)

  removeActiveChat() {
    return from(
      this.activeChatRepository.createQueryBuilder().delete().execute(),
    );
  }

  removeMessages() {
    return from(
      this.messageRepository.createQueryBuilder().delete().execute(),
    );
  }

  removeChats() {
    return from(
      this.chatRepository.createQueryBuilder().delete().execute(),
    );
  }

}
