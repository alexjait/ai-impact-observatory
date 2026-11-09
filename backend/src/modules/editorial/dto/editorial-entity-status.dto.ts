import { EditorialStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class EditorialEntityStatusDto {
  @IsEnum(EditorialStatus)
  editorialStatus!: EditorialStatus;

  @IsOptional()
  @IsString()
  rationale?: string;
}
