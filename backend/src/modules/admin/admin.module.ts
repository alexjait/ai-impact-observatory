import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PublicSettingsController } from './public-settings.controller';
import { PublicSettingsService } from './public-settings.service';
import { AdminSeedImportsController } from './seed-imports.controller';
import { SeedImportsService } from './seed-imports.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminSeedImportsController, PublicSettingsController],
  providers: [SeedImportsService, PublicSettingsService],
  exports: [PublicSettingsService],
})
export class AdminModule {}
