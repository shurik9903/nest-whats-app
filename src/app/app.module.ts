import { MongodbModule } from './../database/mongodb/mongodb.module';
import { MinioModule } from './../database/minio/minio.module';
import { UploadModule } from './modules/upload/upload.module';
import { CoreModule } from './../core/core.module';
import { UsersModule } from './modules/users/users.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import config from 'src/config';

@Module({
  imports: [
    MongodbModule,
    MinioModule,
    UploadModule,
    CoreModule,
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true, load: [...config] }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
