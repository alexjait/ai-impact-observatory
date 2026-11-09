import { EditorialStatus } from '@prisma/client';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class EditorialBulkStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];

  @IsEnum(EditorialStatus)
  editorialStatus!: EditorialStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  officialAiStatus?: number;

  @IsString()
  rationale!: string;
}
