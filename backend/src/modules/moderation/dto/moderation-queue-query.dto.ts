import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ModerationQueueQueryDto {
  @IsOptional()
  @IsIn(['activity_proposals', 'evidence_proposals', 'comments', 'activities'])
  type?: 'activity_proposals' | 'evidence_proposals' | 'comments' | 'activities';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsIn(['en', 'es'])
  locale?: 'en' | 'es';
}
