import { MaxLength, MinLength } from 'class-validator';

export class UserDto {
  @MinLength(4)
  @MaxLength(100)
  username?: string;

  profilePic?: string;

  isOnline?: boolean;

  phoneNumber?: string;

  groupId?: string[];

  refreshToken?: string;

  otp: {
    code: string;
  };
}
