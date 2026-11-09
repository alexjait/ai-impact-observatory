import { IsBoolean } from 'class-validator';

export class UpdatePublicSettingsDto {
  @IsBoolean()
  publicCommentsEnabled!: boolean;
}
