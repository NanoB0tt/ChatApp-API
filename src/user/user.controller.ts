import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { FriendRequestStatus } from 'src/auth/dto/createFriendRequest.dto';
import { FriendRequest } from 'src/auth/entities/friend.entity';
import { User } from 'src/auth/entities/user.entity';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(@Param('userId') userId: string): Observable<User> {
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Get('search/friend/:userName')
  findUserByName(@Param('userName') userName: string): Observable<User[]> {
    return this.userService.findUserByName(userName);
  }

  @UseGuards(JwtGuard)
  @Post('friend-request/send/:receiverId')
  sendFriendRequest(
    @Param('receiverId') receiverId: string,
    @Req() req: Request
  ): Observable<FriendRequest | { error: string }> {
    return this.userService.sendFriendRequest(receiverId, req.user as User)
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/status/:receiverId')
  getFriendRequestStatus(
    @Param('receiverId') receiverId: string,
    @Req() req: Request
  ): Observable<FriendRequestStatus | { error: string }> {
    return this.userService.getFriendRequestStatus(receiverId, req.user as User)
  }

  @UseGuards(JwtGuard)
  @Put('friend-request/response/:friendRequestId')
  respondToFriendRequest(
    @Param('friendRequestId') friendRequestId: string,
    @Body() statusResponse: FriendRequestStatus,
    @Req() req: Request
  ): Observable<FriendRequestStatus | { error: string }> {
    return this.userService.respondToFriendRequest(statusResponse.status, friendRequestId, req.user as User);
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/received-requests')
  getMyFriendRequests(
    @Req() req: Request
  ): Observable<FriendRequestStatus[]> {
    return this.userService.getMyFriendRequests(req.user as User)
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/friends')
  getMyFriends(
    @Req() req: Request
  ): Observable<User[]> {
    return this.userService.getMyFriends(req.user as User)
  }

}
