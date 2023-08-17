import { User } from "src/auth/entities/user.entity";

export interface ChatInterface {
  id?: string;
  users?: User[];
  lastUpdated?: Date;
}
