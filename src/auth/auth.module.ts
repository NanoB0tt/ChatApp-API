import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/chat/entities/chat.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Friendship } from './entities/friend.entity';
import { User } from './entities/user.entity';

import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship, Chat]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '2h' },
      }),
    }),
  ],
  providers: [AuthService, JwtGuard, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, JwtModule, AuthService]
})
export class AuthModule { }
