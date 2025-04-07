import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtRefreshAuthGuard } from 'src/core/guards/auth/jwt-refresh.guard';
import { JwtAuthGuard } from 'src/core/guards/auth/jwt-auth.guard';
import { CurrentUser } from 'src/core/types/current-user.decorator';
import { AuthDto } from '../../users/dto/auth.dto';
import { User } from 'src/database/mongodb/schemas/User.schema';
import { AuthValidation } from 'src/core/validation/auth.validation';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('phone')
  @UsePipes(new ValidationPipe({ groups: [AuthValidation.OnPhone] }))
  async phone(
    @Body()
    user: AuthDto,
  ) {
    const userEntity: User = {
      ...user,
    };

    await this.authService.phone(userEntity);
  }

  @Post('phone/verify')
  @UsePipes(new ValidationPipe({ groups: [AuthValidation.OnCode] }))
  async phoneVerify(
    @Body()
    user: AuthDto,
    // @Res (Response) - получение Response. passthrough - пропустить запрос.
    @Res({ passthrough: true }) response: Response,
  ) {
    const userEntity: User = {
      phoneNumber: user.phoneNumber,
      otp: { code: user.code },
    };

    await this.authService.phoneVerify(userEntity, response);
  }

  @Post('refresh')
  @UsePipes(new ValidationPipe({ groups: [AuthValidation.OnToken] }))
  // Обновить JWT-Refresh токен
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser()
    user: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  @Post('logout')
  @UsePipes(new ValidationPipe({ groups: [AuthValidation.OnToken] }))
  // Удалить JWT-Refresh токен
  @UseGuards(JwtAuthGuard)
  async deleteToken(
    @CurrentUser()
    user: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user, response);
  }
}
