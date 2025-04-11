export interface TokenConfig {
  token: {
    secret: string;
    expire: string;
  };
  refresh: {
    secret: string;
    expire: string;
  };
}
