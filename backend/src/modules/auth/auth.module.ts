import { Module } from '@nestjs/common';

import { RolesGuard } from '../../shared/roles.guard';
import { SessionAuthGuard } from '../../shared/session-auth.guard';
import { AuthEmailService } from './auth-email.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TurnstileService } from './turnstile.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthEmailService, TurnstileService, SessionAuthGuard, RolesGuard],
  exports: [AuthService, TurnstileService, SessionAuthGuard, RolesGuard],
})
export class AuthModule {}
