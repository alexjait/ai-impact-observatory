import { IsBoolean, IsEmail, IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PASSWORD_COMPLEXITY_MESSAGE =
  'Password must be at least 8 characters long and include uppercase, lowercase, and a number.';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsIn(['en', 'es'])
  locale!: 'en' | 'es';

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: PASSWORD_COMPLEXITY_MESSAGE,
  })
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName!: string;

  @IsBoolean()
  termsAccepted!: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  captchaToken!: string;
}
