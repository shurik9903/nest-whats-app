import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/app/modules/users/services/users.service';
import { tokenPayload } from 'src/core/interfaces/token-payload.interface';
import { User } from 'src/database/mongodb/schemas/User.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => String(request.cookies?.Authentication),
      ]),
      secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: tokenPayload): Promise<User> {
    return this.userService.getById(payload.userId);
  }
}
