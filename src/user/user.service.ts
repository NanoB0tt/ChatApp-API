import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from 'src/auth/entities/friend.entity';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { FriendRequest, FriendRequest_Status } from './interfaces/interfaces';
import { readdir, unlink } from 'fs';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendRepository: Repository<Friendship>,
  ) {}

  async findUserById(id: string) {
    try {
      const user: User = await this.userRepository.findOne({
        where: { id },
      });

      delete user.password;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('id not found');
    }
  }

  async findUserByName(name: string, user: User) {
    const result = await this.userRepository.query(
      `	SELECT * FROM users
	      WHERE "users"."userName" ILIKE $1
        AND "users"."id" != $2
        AND "users"."id" NOT IN (
	        SELECT CASE
		        WHEN   "friendship"."creatorId" = $2 THEN "friendship"."receiverId"
	          WHEN "friendship"."receiverId" = $2 THEN "friendship"."creatorId"
	        END
	        FROM friendship
	        WHERE
          ( "friendship"."receiverId" = $2
          AND
          "friendship"."status" = 'accepted')
          OR
          ( "friendship"."creatorId" = $2
          AND
          "friendship"."status" = 'accepted')
	      )`,
      [`%${name}%`, user.id],
    );
    return result;
  }

  async sendFriendRequest(receiverId: string, creator: User) {
    if (receiverId === creator.id)
      return { error: 'It is not possible to add yourself!' };
    const receiver = await this.findUserById(receiverId);
    const requestSentReceived = await this.hasRequestBeenSentOrReceived(
      creator,
      receiver,
    );
    if (requestSentReceived)
      return {
        error:
          'A friend request has already been sent of received to your account!',
      };
    let friendRequest: FriendRequest = {
      creatorId: creator.id,
      receiverId: receiver.id,
      status: 'pending',
    };
    return await this.friendRepository.save(friendRequest);
  }

  async getFriendRequestStatus(receiverId: string, currentUser: User) {
    try {
      const receiver = await this.findUserById(receiverId);
      const friendRequest = await this.friendRepository.findOne({
        where: {
          creator: currentUser,
          receiver,
        },
      });
      return { status: friendRequest.status };
    } catch (error) {
      throw new InternalServerErrorException(
        `You didn't send a friend request to this account`,
      );
    }
  }

  async respondToFriendRequest(
    statusResponse: FriendRequest_Status,
    friendRequestId: string,
    req: User,
  ) {
    const friendRequest = await this.getFriendRequestUserById(
      friendRequestId,
      req,
    );
    return await this.friendRepository.save({
      ...friendRequest,
      status: statusResponse,
    });
  }

  async receivedRequests(user: User) {
    return await this.friendRepository.find({
      where: {
        receiver: user,
        status: 'pending',
      },
      relations: ['creator'],
      select: ['creator', 'status'],
    });
  }

  async getMyFriends(user: User) {
    const friends = await this.friendRepository.find({
      where: [
        {
          creator: user,
          status: 'accepted',
        },
        {
          receiver: user,
          status: 'accepted',
        },
      ],
      relations: ['creator', 'receiver'],
    });

    return friends.map((friend) => {
      if (friend.creatorId === user.id) {
        return friend.receiver;
      } else {
        return friend.creator;
      }
    });
  }

  async getFriendsRoom(friendId: string, user: User) {
    const friend = await this.findUserById(friendId);
    const relation = await this.friendRepository.findOne({
      where: [
        {
          creator: user,
          receiver: friend,
          status: 'accepted',
        },
        {
          creator: friend,
          receiver: user,
          status: 'accepted',
        },
      ],
    });

    return { room: relation.id };
  }

  private async getFriendRequestUserById(friendRequestId: string, req: User) {
    return await this.friendRepository.findOne({
      where: { creatorId: friendRequestId, receiverId: req.id },
    });
  }

  private async hasRequestBeenSentOrReceived(creator: User, receiver: User) {
    const friendRequest = await this.friendRepository.findOne({
      where: [
        { creator, receiver },
        { creator: receiver, receiver: creator },
      ],
    });
    if (!friendRequest) return false;
    return true;
  }

  @Cron(CronExpression.EVERY_WEEKDAY)
  async handleDatabaseDelete() {
    this.userRepository.query('DELETE FROM users');
    const directory = join(__dirname, '../../images');
    readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        unlink(join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    });
  }
}
