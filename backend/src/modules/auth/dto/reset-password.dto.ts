import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PASSWORD_COMPLEXITY_MESSAGE =
  'Password must be at least 8 characters long and include uppercase, lowercase, and a number.';

export class ResetPasswordDto {
  @IsString()
  @MaxLength(128)
  token!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: PASSWORD_COMPLEXITY_MESSAGE,
  })
  newPassword!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  captchaToken!: string;
}
