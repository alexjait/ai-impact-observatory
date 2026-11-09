import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

class EditorialSummaryTranslationDto {
  @IsString()
  editorialSummary!: string;
}

class EditorialSummaryTranslationsDto {
  @ValidateNested()
  @Type(() => EditorialSummaryTranslationDto)
  en!: EditorialSummaryTranslationDto;

  @ValidateNested()
  @Type(() => EditorialSummaryTranslationDto)
  es!: EditorialSummaryTranslationDto;
}

export class EditorialActivitySummaryDto {
  @ValidateNested()
  @Type(() => EditorialSummaryTranslationsDto)
  translations!: EditorialSummaryTranslationsDto;
}
