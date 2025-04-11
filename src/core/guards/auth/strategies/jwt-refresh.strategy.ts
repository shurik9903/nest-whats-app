import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { tokenPayload } from 'src/core/interfaces/token-payload.interface';
import { User } from 'src/database/mongodb/schemas/User.schema';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => String(request.cookies?.Refresh),
      ]),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: tokenPayload): Promise<User> {
    return this.authService.verifyUserRefreshToken(
      String(request.cookies?.Refresh),
      payload.userId,
    );
  }
}
