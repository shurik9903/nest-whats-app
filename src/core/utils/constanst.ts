export const env_constants = {
  DBUri: process.env.DB_URI,

  SMSAccountSID: process.env.SMS_ACCOUNT_SID,
  SMSAuthToken: process.env.SMS_AUTH_TOKEN,

  jwtAccessSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwtAccessExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS,

  jwtRefreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  jwtRefreshExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS,
};
