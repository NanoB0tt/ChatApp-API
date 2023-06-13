import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

}
