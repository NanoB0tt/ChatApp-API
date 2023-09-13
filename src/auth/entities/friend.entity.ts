import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { FriendRequest_Status } from "../dto/createFriendRequest.dto";
import { User } from "./user.entity";

@Entity('friends')
export class FriendRequest {
  @PrimaryColumn()
  creatorId: string;

  @PrimaryColumn()
  receiverId: string;

  @ManyToOne(() => User, (user) => user.sentFriendRequests)
  creator: User;

  @ManyToOne(() => User, (user) => user.receivedFriendRequests)
  receiver: User;

  @Column()
  status: FriendRequest_Status;

  @Column('uuid', { nullable: true })
  room: string
}
