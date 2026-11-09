import { Type } from 'class-transformer';
import { EditorialStatus, ReliabilityFlag } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class EditorialEvidenceUpsertTranslationDto {
  @IsString()
  title!: string;

  @IsString()
  summary!: string;

  @IsString()
  context!: string;

  @IsString()
  slug!: string;
}

class EditorialEvidenceUpsertTranslationsDto {
  @ValidateNested()
  @Type(() => EditorialEvidenceUpsertTranslationDto)
  en!: EditorialEvidenceUpsertTranslationDto;

  @ValidateNested()
  @Type(() => EditorialEvidenceUpsertTranslationDto)
  es!: EditorialEvidenceUpsertTranslationDto;
}

export class EditorialEvidenceUpsertDto {
  @IsString()
  type!: string;

  @IsString()
  sourceText!: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @IsEnum(ReliabilityFlag)
  reliabilityFlag?: ReliabilityFlag;

  @IsOptional()
  @IsEnum(EditorialStatus)
  editorialStatus?: EditorialStatus;

  @IsArray()
  @IsString({ each: true })
  activityIds!: string[];

  @ValidateNested()
  @Type(() => EditorialEvidenceUpsertTranslationsDto)
  translations!: EditorialEvidenceUpsertTranslationsDto;
}
