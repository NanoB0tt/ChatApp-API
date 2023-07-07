import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { join } from 'path';
import { from, map, Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  getImage(imageName: string) {
    const path = join(__dirname, '../../images', imageName);

    if (!existsSync(path)) {
      throw new BadRequestException('Image not found');
    }

    return path;
  }

  updateUserImageById(id: string, imagePath: string): Observable<UpdateResult> {
    const user: User = new User();
    user.id = id;
    user.imagePath = imagePath;
    return from(this.userRepository.update(id, user));
  }

  findImageNameByUserId(id: string): Observable<string> {
    return from(this.userRepository.findOne({
      where: { id }
    })).pipe(
      map((user: User) => {
        delete user.password;
        return user.imagePath;
      })
    );
  }
}
