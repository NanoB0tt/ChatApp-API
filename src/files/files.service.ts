import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {

  getImage(imageName: string) {
    const path = join(__dirname, '../../images', imageName);

    if (!existsSync(path)) {
      throw new BadRequestException('Image not found');
    }

    return path;
  }
}
