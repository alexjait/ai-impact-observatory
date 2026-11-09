import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

class EditorialSourceTranslationDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsString()
  slug!: string;
}

class EditorialSourceTranslationsDto {
  @ValidateNested()
  @Type(() => EditorialSourceTranslationDto)
  en!: EditorialSourceTranslationDto;

  @ValidateNested()
  @Type(() => EditorialSourceTranslationDto)
  es!: EditorialSourceTranslationDto;
}

export class EditorialActivitySourceDto {
  @ValidateNested()
  @Type(() => EditorialSourceTranslationsDto)
  translations!: EditorialSourceTranslationsDto;
}
