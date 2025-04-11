import { UploadService } from './services/upload.service';
import { UploadController } from './controllers/upload.controller';
import { Module } from '@nestjs/common';
import { MinioModule } from 'src/database/minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
