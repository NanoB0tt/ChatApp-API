import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 12));
  }

  createUser(user: CreateUserDto): Observable<User> {
    const { userName, email, password } = user;

    return this.hashPassword(password).pipe(
      switchMap((hashedPassword: string) => {
        return from(this.userRepository.save({
          userName,
          email,
          password: hashedPassword
        })).pipe(
          map((user: User) => {
            delete user.password;
            return user;
          })
        );
      }),
      catchError(err => {
        return this.handleDBErrors(err)
      })
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return from(
      this.userRepository.findOne(
        {
          where: { email },
          select: { email: true, password: true }
        },
      ),
    ).pipe(
      switchMap((user: User) => {
        if (!user)
          throw new UnauthorizedException('not valid credentials (email)')
        return from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              delete user.password;
              return user;
            } else {
              throw new UnauthorizedException('not valid credentials (password)')
            }
          })
        )
      }
      ),
    );
  }

  login(user: LoginUserDto): Observable<string> {
    const { email, password } = user;
    return this.validateUser(email, password).pipe(
      switchMap((user: User) => {
        if (user) {
          // create JWT - credentials
          return from(this.jwtService.signAsync({ user }));
        }
      }),
    );
  }

  private handleDBErrors(error: any): Observable<never> {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Please check server logs');
  }

}
