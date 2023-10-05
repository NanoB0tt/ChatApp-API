import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { join } from 'path';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getImage(imageName: string) {
    const path = join(__dirname, '../../images', imageName);

    if (!existsSync(path)) {
      throw new BadRequestException('Image not found');
    }

    return path;
  }

  async updateUserImageById(id: string, imagePath: string) {
    const user: User = new User();
    user.id = id;
    user.imagePath = imagePath;
    return await this.userRepository.update(id, user);
  }
}
