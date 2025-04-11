import { Inject, Injectable } from '@nestjs/common';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Client } from 'minio';
import { v7 as uuidv7 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { MinioConfig } from 'src/config/interfaces/minio.interface';
import { ImageUploadException } from 'src/core/exceptions/ImageUpload.exception';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {}

  async upload(userId: string, file: Express.Multer.File) {
    try {
      await this.createBucket();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ImageUploadException('Image upload failed' + error.message);
      }
      throw new Error(String(error as string));
    }

    if (file.size <= 0 || file.originalname === null) {
      throw new ImageUploadException('Image must have name.');
    }

    const filename: string = this.generateFileName(file);
    let inputStream: Readable;

    try {
      inputStream = Readable.from(file.buffer);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ImageUploadException('Image upload failed' + error.message);
      }
      throw new Error(String(error as string));
    }

    await this.saveImage(inputStream, `${userId}-${filename}`);

    return filename;
  }

  private async createBucket() {
    const minioConfig: MinioConfig = this.configService.getOrThrow('minio');

    const found: boolean = await this.minioClient.bucketExists(
      minioConfig.bucket.name,
    );

    if (!found) {
      await this.minioClient.makeBucket(minioConfig.bucket.name);
    }
  }

  private generateFileName(file: Express.Multer.File): string {
    const extension: string = file.originalname.split('.').pop();
    return uuidv7() + '.' + extension;
  }

  private async saveImage(inputStream: Readable, filename: string) {
    const minioConfig: MinioConfig = this.configService.getOrThrow('minio');

    await this.minioClient.putObject(
      minioConfig.bucket.name,
      filename,
      inputStream,
    );
  }
}
