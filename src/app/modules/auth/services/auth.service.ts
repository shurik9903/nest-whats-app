import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { tokenPayload } from 'src/core/interfaces/token-payload.interface';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { AuthenticationException } from 'src/core/exceptions/AuthenticationException';
import { UsersService } from '../../users/services/users.service';
import { AuthDto } from '../../users/dto/auth.dto';
import { generateOTP } from 'src/core/utils/codeGenerator';
import { User } from 'src/database/mongodb/schemas/User.schema';
import dayjs from 'dayjs';
import { sendSMS } from 'src/core/utils/SMSSender';
import { ResourceNotFoundException } from 'src/core/exceptions/ResourceNotFoundException';

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

    if (findUser?.otp && findUser?.otp?.expiresAt > dayjs().toDate()) {
      throw new HttpException(
        `Too frequent request for SMS. Repeat the attempt in ${Math.abs(dayjs().diff(findUser?.otp?.expiresAt, 'minute'))} minutes.`,
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
      await this.usersService.update(findUser._id.toString(), userEntity);
    }

    await sendSMS(user.phoneNumber, `You code for entry: ${codeOTP}`);
  }

  async phoneVerify(user: User, response: Response) {
    const findUser: User = await this.usersService.getByPhone(user.phoneNumber);

    console.log(user);
    console.log(findUser);

    if (findUser.otp.code !== String(user.otp.code)) {
      throw new HttpException('Wrong code!', HttpStatus.BAD_REQUEST);
    }

    findUser.otp = null;

    const updateUser: User = await this.usersService.update(
      findUser._id.toString(),
      findUser,
    );

    await this.login(updateUser, response);
  }

  async login(user: User, response: Response) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: tokenPayload = {
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
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

  async logout(user: AuthDto, response: Response) {
    await this.usersService.updateRefreshTokenByPhone(user.phoneNumber, '');

    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
  }
}
