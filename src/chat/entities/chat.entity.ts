import { Friendship } from 'src/auth/entities/friend.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  message: string;

  @Column('text')
  from: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column('uuid')
  roomId: string;

  @ManyToOne(() => Friendship, (friendRequest) => friendRequest.friendRooms, {
    onDelete: 'CASCADE',
  })
  room: Friendship;
}
