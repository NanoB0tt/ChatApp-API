import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { FriendRequestStatus, FriendRequest_Status } from 'src/auth/dto/createFriendRequest.dto';
import { FriendRequest } from 'src/auth/entities/friend.entity';
import { User } from 'src/auth/entities/user.entity';
import { DataSource, Like, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FriendRequest)
    private readonly friendRepository: Repository<FriendRequest>,
  ) { }

  findUserById(id: string): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: { id }
      })
    ).pipe(
      map((user: User) => {
        delete user.password;
        return user;
      })
    )
  }

  findUserByName(name: string): Observable<User[]> {
    return from(
      this.userRepository.find({
        where: { userName: Like(`%${name}%`) },
        select: ['id', 'userName', 'email', 'imagePath'],
      })
    );
  }

  sendFriendRequest(
    receiverId: string, creator: User
  ): Observable<FriendRequest | { error: string }> {
    if (receiverId === creator.id)
      return of({ error: 'It is not possible to add yourself!' });
    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
          switchMap((hasRequestBeenSentOrReceived: boolean) => {
            if (hasRequestBeenSentOrReceived)
              return of({ error: 'A friend request has already been sent of received to your account!' })
            let friendRequest: FriendRequest = {
              creatorId: creator.id,
              receiverId: receiver.id,
              creator: creator,
              receiver: receiver,
              status: 'pending'
            }
            return from(this.friendRepository.save(friendRequest))
          })
        )
      })
    )
  }

  getFriendRequestStatus(
    receiverId: string,
    currentUser: User
  ): Observable<FriendRequestStatus> {
    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        return from(
          this.friendRepository.findOne({
            where:
            {
              creator: currentUser,
              receiver
            },
          }),
        );
      }),
      switchMap((friendRequest: FriendRequest) => {
        return of({ status: friendRequest.status })
      }),
    );
  }

  respondToFriendRequest(
    statusResponse: FriendRequest_Status,
    friendRequestId: string,
    req: User
  ): Observable<FriendRequestStatus> {
    return this.getFriendRequestUserById(friendRequestId, req).pipe(
      switchMap((friendRequest: FriendRequest) => {
        return from(this.friendRepository.save({
          ...friendRequest,
          status: statusResponse,
        }))
      })
    )
  }

  getMyFriendRequests(user: User): Observable<FriendRequest[]> {
    return from(this.friendRepository.find({
      where: {
        receiver: user,
        status: 'pending'
      },
      relations: ['creator'],
      select: ['creator', 'status']
    }))
  }

  getMyFriends(user: User): Observable<User[]> {
    return from(this.friendRepository.find({
      where: {
        receiver: user,
        status: 'accepted',
      },
      relations: ['creator'],
    })).pipe(map(users => (
      users.map(user => user.creator)
    ))
    )
  }

  private getFriendRequestUserById(friendRequestId: string, req: User): Observable<FriendRequest> {
    return from(this.friendRepository.findOne({
      where: { creatorId: friendRequestId, receiverId: req.id }
    }))
  }

  private hasRequestBeenSentOrReceived(creator: User, receiver: User): Observable<boolean> {
    return from(this.friendRepository.findOne({
      where: [
        { creator, receiver },
        { creator: receiver, receiver: creator },
      ]
    }),
    ).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if (!friendRequest)
          return of(false);
        return of(true);
      })
    );
  }

}

