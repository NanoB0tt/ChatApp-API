import { User } from "../entities/user.entity";

export type FriendRequest_Status = 'pending' | 'accepted' | 'declined';

export interface FriendRequestStatus {
  status: FriendRequest_Status;
}

export class CreateFriendRequest {
  id: string;
  creator: User;
  receiver: User;
  status: FriendRequest_Status;
}
