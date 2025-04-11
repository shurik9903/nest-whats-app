import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/database/mongodb/schemas/User.schema';
import { UsersRepository } from './query/users.repository';
import { UploadService } from '../upload/services/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UploadService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
