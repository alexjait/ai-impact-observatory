import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsIn(['en', 'es'])
  locale!: 'en' | 'es';

  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  captchaToken!: string;
}
