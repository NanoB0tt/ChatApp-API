import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Friendship } from "./friend.entity";

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

  @OneToMany(() => Friendship, (friendRequest) => friendRequest.creator)
  sentFriendRequests: Friendship[];

  @OneToMany(() => Friendship, (friendRequest) => friendRequest.receiver)
  receivedFriendRequests: Friendship[];

}
