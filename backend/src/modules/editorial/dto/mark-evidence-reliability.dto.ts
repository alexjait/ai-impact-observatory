import { ReliabilityFlag } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class MarkEvidenceReliabilityDto {
  @IsEnum(ReliabilityFlag)
  flag!: ReliabilityFlag;

  @IsString()
  reason!: string;
}
