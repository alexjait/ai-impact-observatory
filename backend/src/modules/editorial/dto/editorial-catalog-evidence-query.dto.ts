import { Type } from 'class-transformer';
import { EditorialStatus, ReliabilityFlag } from '@prisma/client';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class EditorialCatalogEvidenceQueryDto {
  @IsOptional()
  @IsEnum(EditorialStatus)
  status?: EditorialStatus;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  activityId?: string;

  @IsOptional()
  @IsEnum(ReliabilityFlag)
  reliabilityFlag?: ReliabilityFlag;

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
