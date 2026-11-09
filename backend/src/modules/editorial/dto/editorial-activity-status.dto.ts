import { EditorialStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class EditorialActivityStatusDto {
  @IsInt()
  @Min(0)
  @Max(5)
  officialAiStatus!: number;

  @IsString()
  rationale!: string;

  @IsOptional()
  @IsEnum(EditorialStatus)
  editorialStatus?: EditorialStatus;
}
