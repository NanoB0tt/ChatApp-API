import { User } from "src/auth/entities/user.entity";
import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity('chat')
export class Chat {
  @PrimaryColumn()
  id: string;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @UpdateDateColumn()
  lastUpdated: Date;
}
