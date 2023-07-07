import { Body, Controller, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
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
  login(@Body() user: LoginUserDto): Observable<User & { token: string }> {
    return this.authService.login(user)
  }
}
