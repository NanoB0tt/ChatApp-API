import { Chat } from "src/chat/entities/chat.entity";
import { Message } from "src/chat/entities/message.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FriendRequest } from "./friend.entity";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  userName: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column({ nullable: true })
  imagePath: string;

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.creator)
  sentFriendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
  receivedFriendRequests: FriendRequest[];

  @ManyToMany(() => Chat, (chat) => chat.users)
  chat: Chat[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
