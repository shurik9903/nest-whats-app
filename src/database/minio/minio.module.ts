/*
https://docs.nestjs.com/modules
*/

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestMinioModule } from 'nestjs-minio';
import { MinioConfig } from 'src/config/interfaces/minio.interface';

@Global()
@Module({
  imports: [
    NestMinioModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => {
        const minioConfig: MinioConfig =
          config.getOrThrow<MinioConfig>('minio');
        return { ...minioConfig.connect };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class MinioModule {}
