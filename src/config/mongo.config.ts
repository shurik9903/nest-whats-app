import { env } from 'process';

export default () => ({
  mongo: {
    uri: env.MONGO_URI,
    pass: String(env.MONGO_PASSWORD),
    user: env.MONGO_USER,
    authSource: 'admin',
  },
});
