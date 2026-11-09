import { Type } from 'class-transformer';
import { EditorialStatus, Granularity } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class EditorialActivityUpsertTranslationDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsOptional()
  @IsString()
  editorialSummary?: string;

  @IsString()
  slug!: string;
}

class EditorialActivityUpsertTranslationsDto {
  @ValidateNested()
  @Type(() => EditorialActivityUpsertTranslationDto)
  en!: EditorialActivityUpsertTranslationDto;

  @ValidateNested()
  @Type(() => EditorialActivityUpsertTranslationDto)
  es!: EditorialActivityUpsertTranslationDto;
}

export class EditorialActivityUpsertDto {
  @IsEnum(Granularity)
  granularity!: Granularity;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  officialAiStatus?: number | null;

  @IsOptional()
  @IsEnum(EditorialStatus)
  editorialStatus?: EditorialStatus;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  industryKeys!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  categoryKeys!: string[];

  @ValidateNested()
  @Type(() => EditorialActivityUpsertTranslationsDto)
  translations!: EditorialActivityUpsertTranslationsDto;
}
