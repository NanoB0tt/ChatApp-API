import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() user: CreateUserDto) {
    return this.authService.createUser(user);
  }

  @Post('login')
  login(@Body() user: LoginUserDto) {
    return this.authService.login(user)
  }
}
