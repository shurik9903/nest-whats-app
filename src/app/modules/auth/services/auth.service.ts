import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { tokenPayload } from 'src/core/interfaces/token-payload.interface';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { AuthenticationException } from 'src/core/exceptions/Authentication.exception';
import { UsersService } from '../../users/services/users.service';
import { AuthRequestDto } from '../dto/auth.request.dto';
import { generateOTP } from 'src/core/utils/codeGenerator';
import { User } from 'src/database/mongodb/schemas/User.schema';
import dayjs from 'dayjs';
import { sendSMS } from 'src/core/utils/SMSSender';
import { ResourceNotFoundException } from 'src/core/exceptions/ResourceNotFound.exception';
import { TokenConfig } from '../../../../config/interfaces/token.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async phone(user: User) {
    let findUser: User | undefined = null;

    try {
      findUser = await this.usersService.getByPhone(user.phoneNumber);
    } catch (error: unknown) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }

    if (findUser?.otp?.repeatAt > dayjs().toDate()) {
      const await_minutes =
        Math.abs(dayjs().diff(findUser?.otp?.repeatAt, 'minute')) + 1;

      throw new HttpException(
        `Too frequent request for SMS. Repeat the attempt in ${await_minutes} minutes.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const codeOTP = generateOTP(6);

    const userEntity: User = new User();
    userEntity.otp = { code: codeOTP };

    if (findUser === null) {
      userEntity.phoneNumber = user.phoneNumber;
      await this.usersService.insert(userEntity);
    } else {
      userEntity._id = findUser._id;
      await this.usersService.update(userEntity);
    }

    await sendSMS(user.phoneNumber, `You code for entry: ${codeOTP}`);
  }

  async phoneVerify(user: User, response: Response) {
    const findUser: User = await this.usersService.getByPhone(user.phoneNumber);

    if (findUser?.otp?.expiresAt < dayjs().toDate()) {
      const codeOTP = generateOTP(6);

      const userEntity: User = new User();
      userEntity.otp = { code: codeOTP };
      userEntity._id = findUser._id;

      await this.usersService.update(userEntity);

      await sendSMS(user.phoneNumber, `You code for entry: ${codeOTP}`);

      throw new HttpException(
        'The code lifetime is over. New code is sent to your phone.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (findUser.otp.code !== String(user.otp.code)) {
      throw new HttpException('Wrong code!', HttpStatus.BAD_REQUEST);
    }

    findUser.otp = null;
    findUser.isPhoneVerified = true;
    findUser.isOnline = true;

    const updateUser: User = await this.usersService.update(findUser);

    await this.login(updateUser, response);
  }

  async login(user: User, response: Response) {
    const token: TokenConfig = this.configService.getOrThrow('jwt');

    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() + parseInt(token.token.expire),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() + parseInt(token.refresh.expire),
    );

    const tokenPayload: tokenPayload = {
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: token.token.secret,
      expiresIn: `${token.token.expire}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: token.refresh.secret,
      expiresIn: `${token.refresh.expire}ms`,
    });

    await this.usersService.updateRefreshTokenById(
      user._id.toString(),
      await hash(refreshToken, 10),
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    const user: User = await this.usersService.getById(userId);
    const authenticated: boolean = await compare(
      refreshToken,
      user.refreshToken,
    );

    if (!authenticated) {
      throw new AuthenticationException('Refresh token is not valid');
    }

    return user;
  }

  async logout(user: AuthRequestDto, response: Response) {
    await this.usersService.updateRefreshTokenByPhone(user.phoneNumber, '');

    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
  }
}
