import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { AuthValidation } from 'src/core/validation/auth.validation';

export class AuthRequestDto {
  @IsNotEmpty({ groups: [AuthValidation.OnPhone, AuthValidation.OnCode] })
  @IsString()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty({ groups: [AuthValidation.OnCode] })
  @IsString()
  code: string;
}
