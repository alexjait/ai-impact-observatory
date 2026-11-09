import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class EvidenceProposalTranslationDto {
  @IsString()
  title!: string;

  @IsString()
  summary!: string;

  @IsString()
  context!: string;
}

class EvidenceProposalTranslationsDto {
  @ValidateNested()
  @Type(() => EvidenceProposalTranslationDto)
  es!: EvidenceProposalTranslationDto;

  @ValidateNested()
  @Type(() => EvidenceProposalTranslationDto)
  en!: EvidenceProposalTranslationDto;
}

class EvidenceProposalInputTranslationDto {
  @IsString()
  title!: string;

  @IsString()
  summary!: string;

  @IsString()
  context!: string;
}

export class CreateEvidenceProposalDto {
  @IsString()
  type!: string;

  @IsString()
  sourceText!: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  activityKeys!: string[];

  @IsOptional()
  @IsIn(['en', 'es'])
  inputLocale?: 'en' | 'es';

  @IsOptional()
  @ValidateNested()
  @Type(() => EvidenceProposalInputTranslationDto)
  translationInput?: EvidenceProposalInputTranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EvidenceProposalTranslationsDto)
  translations?: EvidenceProposalTranslationsDto;
}

export class UpdateEvidenceProposalDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  sourceText?: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  activityKeys?: string[];

  @IsOptional()
  @IsIn(['en', 'es'])
  inputLocale?: 'en' | 'es';

  @IsOptional()
  @ValidateNested()
  @Type(() => EvidenceProposalInputTranslationDto)
  translationInput?: EvidenceProposalInputTranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EvidenceProposalTranslationsDto)
  translations?: EvidenceProposalTranslationsDto;
}
