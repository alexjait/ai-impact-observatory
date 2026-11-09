import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Granularity } from '@prisma/client';

class ActivityProposalTranslationDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;
}

class ActivityProposalTranslationsDto {
  @ValidateNested()
  @Type(() => ActivityProposalTranslationDto)
  es!: ActivityProposalTranslationDto;

  @ValidateNested()
  @Type(() => ActivityProposalTranslationDto)
  en!: ActivityProposalTranslationDto;
}

class ActivityProposalInputTranslationDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;
}

export class CreateActivityProposalDto {
  @IsEnum(Granularity)
  granularity!: Granularity;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  industryKeys!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  categoryKeys!: string[];

  @IsOptional()
  @IsIn(['en', 'es'])
  inputLocale?: 'en' | 'es';

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityProposalInputTranslationDto)
  translationInput?: ActivityProposalInputTranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityProposalTranslationsDto)
  translations!: ActivityProposalTranslationsDto;
}

export class UpdateActivityProposalDto {
  @IsOptional()
  @IsEnum(Granularity)
  granularity?: Granularity;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  industryKeys?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  categoryKeys?: string[];

  @IsOptional()
  @IsIn(['en', 'es'])
  inputLocale?: 'en' | 'es';

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityProposalInputTranslationDto)
  translationInput?: ActivityProposalInputTranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityProposalTranslationsDto)
  translations?: ActivityProposalTranslationsDto;
}
