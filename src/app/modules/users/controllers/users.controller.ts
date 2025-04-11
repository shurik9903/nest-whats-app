import {
  Body,
  Controller,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CurrentUser } from 'src/core/types/current-user.decorator';
import { UserValidation } from 'src/core/validation/user.validation';
import { UserDto } from '../dto/user.dto';
import { UserRequestDto } from '../dto/user.request.dto';
import { JwtAuthGuard } from 'src/core/guards/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('update')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ groups: [UserValidation.OnUpdate] }))
  async refreshToken(
    @CurrentUser()
    user: UserDto,
    @Body() data: UserRequestDto,
  ) {
    await this.userService.update({
      ...data,
      _id: user._id,
      phoneNumber: user.phoneNumber,
    });
  }

  @Post('image/profile')
  @UseInterceptors(FileInterceptor('picture'))
  @UseGuards(JwtAuthGuard)
  async imageProfileUpload(
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
    return await this.userService.profileUpload(user, file);
  }
}
