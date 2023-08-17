import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('active-chat')
export class ActiveChat {
  @PrimaryColumn()
  id: string;

  @Column()
  socketId: string;

  @Column()
  userId: string;

  @Column()
  chatId: string;
}
