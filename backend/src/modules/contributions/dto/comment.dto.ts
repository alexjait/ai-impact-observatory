import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(5000)
  text!: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}
