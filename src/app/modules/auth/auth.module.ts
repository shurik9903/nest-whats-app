import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/app/modules/users/users.module';
import { JwtStrategy } from 'src/core/guards/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from 'src/core/guards/auth/strategies/jwt-refresh.strategy';
import { AuthController } from './controllers/auth.controller';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, JwtModule, UsersModule],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
