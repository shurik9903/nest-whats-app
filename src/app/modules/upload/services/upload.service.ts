import { Inject, Injectable } from '@nestjs/common';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Client } from 'minio';
import { v7 as uuidv7 } from 'uuid';
import { ImageUploadException } from 'src/core/exceptions/ImageUpload.exception';
import { Readable } from 'stream';
import { UploadedObjectInfo } from 'minio/dist/main/internal/type';
import { ConfigService } from '@nestjs/config';
import { MinioConfig } from 'src/config/interfaces/minio.interface';

@Injectable()
export class UploadService {
  private minioConfig: MinioConfig;

  constructor(
    @Inject(MINIO_CONNECTION) private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    this.minioConfig = this.configService.getOrThrow('minio');
  }

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

    const fileName: string = this.generateFileName(file);
    let inputStream: Readable;

    try {
      inputStream = Readable.from(file.buffer);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ImageUploadException('Image upload failed' + error.message);
      }
      throw new Error(String(error as string));
    }

    await this.saveFile(inputStream, `${userId}-${fileName}`);

    return fileName;
  }

  async download(userId: string, fileName: string): Promise<Readable> {
    return await this.getFile(`${userId}-${fileName}`);
  }

  async delete(userId: string, fileName: string) {
    await this.deleteFile(`${userId}-${fileName}`);
  }

  async fileUrl(userId: string, fileName: string) {
    return await this.getFileUrl(`${userId}-${fileName}`);
  }

  private async createBucket() {
    const found: boolean = await this.minioClient.bucketExists(
      this.minioConfig.bucket.name,
    );

    if (!found) {
      await this.minioClient.makeBucket(this.minioConfig.bucket.name);
    }
  }

  private generateFileName(file: Express.Multer.File): string {
    const extension: string = file.originalname.split('.').pop();
    return uuidv7() + '.' + extension;
  }

  private async saveFile(
    inputStream: Readable,
    filename: string,
  ): Promise<UploadedObjectInfo> {
    return await this.minioClient.putObject(
      this.minioConfig.bucket.name,
      filename,
      inputStream,
    );
  }

  private async deleteFile(filename: string) {
    await this.minioClient.removeObject(
      this.minioConfig.bucket.name,
      filename,
      {
        forceDelete: true,
      },
    );
  }

  private async getFile(filename: string): Promise<Readable> {
    return await this.minioClient.getObject(
      this.minioConfig.bucket.name,
      filename,
    );
  }

  private async getFileUrl(filename: string): Promise<string> {
    // Возможность указать дату создания и время жизни ссылки на файл
    return await this.minioClient.presignedUrl(
      'GET',
      this.minioConfig.bucket.name,
      filename,
    );
  }
}
