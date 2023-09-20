import { Chat } from "src/chat/entities/chat.entity";
import { FriendRequest_Status } from "src/user/interfaces/interfaces";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('friendship')
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  creatorId: string;

  @Column()
  receiverId: string;

  @ManyToOne(() => User, (user) => user.sentFriendRequests)
  creator: User;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  receiver: User;

  @Column()
  status: FriendRequest_Status;

  @OneToMany(() => Chat, (chat) => chat.room)
  friendRooms: Chat[];
}
