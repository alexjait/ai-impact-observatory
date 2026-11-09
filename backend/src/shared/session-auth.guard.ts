import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { AuthService } from '../modules/auth/auth.service';
import { env } from './env';
import { sharedErrors } from './shared.errors';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      cookies?: Record<string, string>;
      user?: unknown;
    }>();

    const token = request.cookies?.[env.sessionCookieName];
    if (!token) {
      throw sharedErrors.authenticationRequired();
    }

    const user = await this.authService.validateSessionToken(token);
    if (!user) {
      throw sharedErrors.sessionInvalid();
    }

    request.user = user;
    return true;
  }
}
