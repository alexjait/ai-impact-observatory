import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { TranslationService } from './translation.service';

@Module({
  imports: [AuthModule],
  controllers: [ContributionsController],
  providers: [ContributionsService, TranslationService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
