import { IsString } from 'class-validator';

export class ModerationActionDto {
  @IsString()
  reason!: string;
}
