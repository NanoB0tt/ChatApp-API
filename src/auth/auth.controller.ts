import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() user: CreateUserDto): Observable<User> {
    return this.authService.createUser(user);
  }

  @Post('login')
  login(@Body() user: LoginUserDto): Observable<{ token: string }> {
    return this.authService
      .login(user)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }

  /* @Get('search') */
  /* searchUserName(@Param('userName') userName: string): Observable<User[]> { */
  /*   return this.authService.findUserByName(userName); */
  /* } */
}
