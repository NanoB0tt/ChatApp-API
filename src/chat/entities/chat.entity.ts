import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('chat')
export class Chat {
  @PrimaryColumn()
  room: string;

  @Column('json')
  content: { message: string, from: string }[];

}
