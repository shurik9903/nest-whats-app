import { env } from 'process';
import { MinioConfig } from './interfaces/minio.interface';

export default (): { minio: MinioConfig } => ({
  minio: {
    connect: {
      isGlobal: true,
      endPoint: env.MINIO_HOST || 'localhost',
      port: env.MINIO_PORT ? Number(env.MINIO_PORT) : 9000,
      useSSL: false,
      accessKey: env.MINIO_ACCESS_KEY || 'minio',
      secretKey: env.MINIO_SECRET_KEY || 'minio@123',
    },
    bucket: {
      name: env.MINIO_BUCKET,
    },
  },
});
