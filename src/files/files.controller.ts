import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileNamer, fileFilter } from './helpers';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/auth/entities/user.entity';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('profilePic/:imageName')
  findImage(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this.filesService.getImage(imageName);
    res.sendFile(path);
  }

  @Post('upload')
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './images',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const user = req.user as User;
    const id = user.id;

    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/profilePic/${
      file.filename
    }`;
    this.filesService.updateUserImageById(id, secureUrl);

    return { secureUrl };
  }
}
