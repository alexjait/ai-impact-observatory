import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { ContactModule } from './modules/contact/contact.module';
import { EditorialModule } from './modules/editorial/editorial.module';
import { HealthModule } from './modules/health/health.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { PublicModule } from './modules/public/public.module';
import { PrismaModule } from './prisma/prisma.module';
import { env } from './shared/env';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        // General browsing and authenticated app navigation
        name: 'default',
        ttl: env.throttleDefaultTtlMs,
        limit: env.throttleDefaultLimit,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    PublicModule,
    ContactModule,
    ContributionsModule,
    ModerationModule,
    EditorialModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
