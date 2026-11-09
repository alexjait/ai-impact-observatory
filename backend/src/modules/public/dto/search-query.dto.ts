import { IsIn, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from './pagination-query.dto';

export class SearchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['en', 'es'])
  locale?: 'en' | 'es';

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  granularity?: string;

  @IsOptional()
  @IsString()
  aiStatus?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  followed?: 'true' | 'false';
}
