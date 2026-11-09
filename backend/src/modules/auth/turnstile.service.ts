import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { env } from '../../shared/env';
import { authErrors } from './auth.errors';

type TurnstileVerifyResponse = {
  success: boolean;
  'error-codes'?: string[];
};

@Injectable()
export class TurnstileService {
  private static readonly SITEVERIFY_URL =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  async verifyOrThrow(token: string | undefined, remoteIp?: string): Promise<void> {
    if (!env.turnstileSecretKey) {
      throw authErrors.captchaValidationNotConfigured();
    }

    if (!token?.trim()) {
      throw authErrors.captchaValidationFailed();
    }

    let payload: TurnstileVerifyResponse;
    try {
      const body = new URLSearchParams({
        secret: env.turnstileSecretKey,
        response: token.trim(),
        idempotency_key: randomUUID(),
      });

      if (remoteIp?.trim()) {
        body.set('remoteip', remoteIp.trim());
      }

      const response = await fetch(TurnstileService.SITEVERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Turnstile responded with ${response.status}.`);
      }

      payload = (await response.json()) as TurnstileVerifyResponse;
    } catch (error) {
      console.error(error);
      throw authErrors.captchaValidationUnavailable();
    }

    if (!payload.success) {
      throw authErrors.captchaValidationFailed();
    }
  }
}
