import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest_Status } from 'src/auth/dto/createFriendRequest.dto';
import { FriendRequest } from 'src/auth/entities/friend.entity';
import { User } from 'src/auth/entities/user.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FriendRequest)
    private readonly friendRepository: Repository<FriendRequest>,
  ) { }

  async findUserById(id: string) {
    try {
      const user: User = await this.userRepository.findOne({
        where: { id }
      });

      delete user.password;
      return user;

    } catch (error) {
      throw new InternalServerErrorException('id not found')
    }
  }

  async findUserByName(name: string, user: User) {
    /* const query = await this.friendRepository */
    /*   .query(` */
    /*          SELECT */
    /*          "userName", "creatorId", "receiverId" */
    /*          FROM */
    /*          users */
    /*          LEFT JOIN friends ON "receiverId" = users.id */
    /*          OR "creatorId" = users.id */
    /*          WHERE ("userName" ILIKE $1 AND "userName" != $2) */
    /*          AND */
    /*          (("creatorId" IS NULL OR "creatorId" != $3) AND ("receiverId" IS NULL OR "receiverId" != $3)) */
    /*          `, [`%${name}%`, user.userName, user.id]) */
    /* console.log(query) */

    const result = await this.userRepository
      .createQueryBuilder("users")
      .leftJoinAndSelect(FriendRequest, "friends",
        `friends.receiverId = users.id
         OR
         friends.creatorId = users.id`)
      .where(`
             users.userName ILIKE :name
             AND
             users.userName != :myName`,
        {
          name: `%${name}%`,
          myName: user.userName
        })
      .andWhere(`
             (friends.creatorId IS NULL OR friends.creatorId != :userId)
             AND
             (friends.receiverId IS NULL OR friends.receiverId != :userId)
                  `,
        {
          userId: user.id
        })
      .getMany()

    return result
  }

  async sendFriendRequest(receiverId: string, creator: User) {
    if (receiverId === creator.id)
      return { error: 'It is not possible to add yourself!' };
    const receiver = await this.findUserById(receiverId);
    const requestSentReceived = await this.hasRequestBeenSentOrReceived(creator, receiver);
    if (requestSentReceived)
      return { error: 'A friend request has already been sent of received to your account!' };
    let friendRequest: FriendRequest = {
      creatorId: creator.id,
      receiverId: receiver.id,
      creator: creator,
      receiver: receiver,
      status: 'pending',
      room: null
    }
    return await this.friendRepository.save(friendRequest);
  }

  async getFriendRequestStatus(receiverId: string, currentUser: User) {
    try {
      const receiver = await this.findUserById(receiverId);
      const friendRequest = await this.friendRepository.findOne({
        where:
        {
          creator: currentUser,
          receiver
        },
      });
      return { status: friendRequest.status }

    } catch (error) {
      throw new InternalServerErrorException(`You didn't send a friend request to this account`);
    }
  }

  async respondToFriendRequest(statusResponse: FriendRequest_Status, friendRequestId: string, req: User) {
    const friendRequest = await this.getFriendRequestUserById(friendRequestId, req);

    if (statusResponse === 'accepted') {
      return await this.friendRepository.save({
        ...friendRequest,
        status: statusResponse,
        room: uuid()
      })
    } else {
      return await this.friendRepository.save({
        ...friendRequest,
        status: statusResponse,
      })
    }
  }

  async receivedRequests(user: User) {
    return await this.friendRepository.find({
      where: {
        receiver: user,
        status: 'pending'
      },
      relations: ['creator'],
      select: ['creator', 'status']
    });
  }

  async getMyFriends(user: User) {
    const friends = await this.friendRepository.find({
      where: [
        {
          creator: user,
          status: 'accepted'
        },
        {
          receiver: user,
          status: 'accepted'
        }
      ],
      relations: ['creator', 'receiver'],
    });

    return friends.map(friend => {
      if (friend.creatorId === user.id) {
        return friend.receiver;
      } else {
        return friend.creator;
      }
    });

  }

  async getFriendsRoom(friendId: string, user: User) {
    const friend = await this.findUserById(friendId)
    const relation = await this.friendRepository.findOne({
      where: [
        {
          creator: user,
          receiver: friend,
          status: 'accepted'
        },
        {
          creator: friend,
          receiver: user,
          status: 'accepted'
        }
      ],
    });

    return { room: relation.room };
  }

  private async getFriendRequestUserById(friendRequestId: string, req: User) {
    return await this.friendRepository.findOne({
      where: { creatorId: friendRequestId, receiverId: req.id }
    })
  }

  private async hasRequestBeenSentOrReceived(creator: User, receiver: User) {
    const friendRequest = await this.friendRepository.findOne({
      where: [
        { creator, receiver },
        { creator: receiver, receiver: creator },
      ]
    });
    if (!friendRequest)
      return false;
    return true;
  }

}

