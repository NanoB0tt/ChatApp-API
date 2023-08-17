import { User } from "src/auth/entities/user.entity";
import { Chat } from "../entities/chat.entity";

export interface MessageInterface {
  id: string;
  message: string;
  user: User;
  conversation: Chat;
  createdAt: Date;
}
