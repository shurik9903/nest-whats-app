import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...config.getOrThrow<MongooseModuleFactoryOptions>('mongo'),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class MongodbModule {}
