import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from '../services/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/core/guards/auth/jwt-auth.guard';
import { CurrentUser } from 'src/core/types/current-user.decorator';
import { UserDto } from '../../users/dto/user.dto';
import { Readable } from 'stream';

@Controller('file')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('picture'))
  @UseGuards(JwtAuthGuard)
  async upload(
    @CurrentUser()
    user: UserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 20 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.uploadService.upload(user._id, file);
  }

  @Get('url/:fileName')
  @UseGuards(JwtAuthGuard)
  async url(
    @CurrentUser()
    user: UserDto,
    @Param('fileName') fileName: string,
  ): Promise<string> {
    return await this.uploadService.fileUrl(user._id, fileName);
  }

  @Get('download/:fileName')
  @UseGuards(JwtAuthGuard)
  async download(
    @CurrentUser()
    user: UserDto,
    @Param('fileName') fileName: string,
  ): Promise<StreamableFile> {
    const readStream: Readable = await this.uploadService.download(
      user._id,
      fileName,
    );
    return new StreamableFile(readStream);
  }

  @Delete('delete/:fileName')
  @UseGuards(JwtAuthGuard)
  async delete(
    @CurrentUser()
    user: UserDto,
    @Param('fileName') fileName: string,
  ) {
    await this.uploadService.delete(user._id, fileName);
  }
}
