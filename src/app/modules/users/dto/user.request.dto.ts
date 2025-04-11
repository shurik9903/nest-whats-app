import { MaxLength, MinLength } from 'class-validator';

export class UserRequestDto {
  @MinLength(4)
  @MaxLength(100)
  username?: string;

  profilePic?: string;
}
