import { IsBoolean } from 'class-validator';

export class CompleteSocialSignupDto {
  @IsBoolean()
  termsAccepted!: boolean;
}
