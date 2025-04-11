export interface MinioConfig {
  connect: {
    isGlobal: boolean;
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
  };
  bucket: {
    name: string;
  };
}
