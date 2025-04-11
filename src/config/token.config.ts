import { env } from 'process';
import { TokenConfig } from './interfaces/token.interface';
export default (): { jwt: TokenConfig } => ({
  jwt: {
    token: {
      secret: env.JWT_ACCESS_TOKEN_SECRET,
      expire: env.JWT_ACCESS_TOKEN_EXPIRATION_MS,
    },
    refresh: {
      secret: env.JWT_REFRESH_TOKEN_SECRET,
      expire: env.JWT_REFRESH_TOKEN_EXPIRATION_MS,
    },
  },
});
