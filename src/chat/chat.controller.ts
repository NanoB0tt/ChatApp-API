import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ChatService } from './chat.service';
import { Request } from 'express';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService
  ) { }

  @UseGuards(JwtGuard)
  @Post('addMessage')
  addMessage(@Body() body: { room: string, message: string }, @Req() req: Request) {
    const user = req.user as User
    return this.chatService.addMessage(body, user.id)
  }

  @UseGuards(JwtGuard)
  @Get('getAllMessages/:room')
  getAllMessages(@Param('room') room: string) {
    return this.chatService.getAllMessages(room)
  }

}
