import { IsIn, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from './pagination-query.dto';

export class ListActivitiesQueryDto extends PaginationQueryDto {
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

  @IsOptional()
  @IsIn(['recent', 'title'])
  sort?: 'recent' | 'title' = 'recent';
}
