export type FriendRequest_Status = 'pending' | 'accepted' | 'declined';

export interface FriendRequestStatus {
  status: FriendRequest_Status;
}

export interface FriendRequest {
  creatorId: string;
  receiverId: string;
  status: FriendRequest_Status;
}

export interface Message {
  roomId: string;
  message: string;
  createdAt: string;
}
