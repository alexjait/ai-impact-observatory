import { Transform, Type } from 'class-transformer';
import { EditorialStatus, Granularity } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class EditorialCatalogActivitiesQueryDto {
  @IsOptional()
  @IsEnum(EditorialStatus)
  status?: EditorialStatus;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(Granularity)
  granularity?: Granularity;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  officialAiStatus?: number;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['en', 'es'])
  locale?: 'en' | 'es';

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
}
