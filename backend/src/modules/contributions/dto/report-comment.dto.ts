import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportCommentDto {
  @IsString()
  @MaxLength(250)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}
