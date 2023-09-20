import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Friendship } from 'src/auth/entities/friend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship]),
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }
