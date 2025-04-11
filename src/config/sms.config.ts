import { env } from 'process';

export default () => ({
  sms: {
    sid: env.SMS_ACCOUNT_SID,
    token: env.SMS_AUTH_TOKEN,
  },
});
