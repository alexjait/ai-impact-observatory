import { Module } from '@nestjs/common';

import { PublicSettingsService } from '../admin/public-settings.service';
import { AuthModule } from '../auth/auth.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [AuthModule],
  controllers: [PublicController],
  providers: [PublicService, PublicSettingsService],
})
export class PublicModule {}
