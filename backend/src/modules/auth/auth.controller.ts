import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../shared/current-user.decorator';
import type { AuthenticatedUser } from '../../shared/auth.types';
import { env } from '../../shared/env';
import { SessionAuthGuard } from '../../shared/session-auth.guard';
import { AuthService } from './auth.service';
import { CompleteSocialSignupDto } from './dto/complete-social-signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
@Throttle({
  default: {
    ttl: env.throttleAuthTtlMs,
    limit: env.throttleAuthLimit,
  },
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('auth/providers')
  getProviders() {
    return this.authService.getAvailableProviders();
  }

  @Post('auth/register')
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
  ): Promise<{ accepted: true }> {
    return this.authService.register(dto, this.getRequestIp(request));
  }

  @Post('auth/login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: AuthenticatedUser }> {
    const result = await this.authService.login(dto, this.getRequestIp(request));
    this.attachSessionCookie(response, result.token);
    return { user: result.user };
  }

  @Get('auth/google/start')
  async startGoogleAuth(
    @Query('returnTo') returnTo: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const redirectTo = await this.authService.initiateGoogleAuth(returnTo);
    response.redirect(302, redirectTo);
  }

  @Get('auth/google/callback')
  async handleGoogleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.authService.handleGoogleCallback(code, state);

    if (result.kind === 'session') {
      this.attachSessionCookie(response, result.token);
      response.redirect(302, result.redirectTo);
      return;
    }

    if (result.kind === 'social-signup') {
      this.attachSocialSignupCookie(response, result.signupContextToken);
      response.redirect(302, result.redirectTo);
      return;
    }

    response.redirect(302, result.redirectTo);
  }

  @Get('auth/verify-email')
  async verifyEmail(
    @Query('token') token: string | undefined,
    @Query('locale') locale: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const loginUrl = new URL(`${env.appBaseUrl}/auth/login`);
    loginUrl.searchParams.set('emailVerification', 'invalid');
    if (locale === 'en' || locale === 'es') {
      loginUrl.searchParams.set('locale', locale);
    }

    if (!token) {
      response.redirect(302, loginUrl.toString());
      return;
    }

    try {
      const result = await this.authService.verifyEmail(token, locale);
      response.redirect(302, result.returnTo);
    } catch {
      response.redirect(302, loginUrl.toString());
    }
  }

  @Post('auth/social/complete-signup')
  async completeSocialSignup(
    @Body() dto: CompleteSocialSignupDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: AuthenticatedUser; returnTo: string }> {
    const signupContextToken = response.req.cookies?.[env.socialSignupCookieName] as string | undefined;
    const result = await this.authService.completeSocialSignup(dto, signupContextToken);
    response.clearCookie(env.socialSignupCookieName);
    this.attachSessionCookie(response, result.token);

    return {
      user: result.user,
      returnTo: result.returnTo,
    };
  }

  @Post('auth/logout')
  @HttpCode(204)
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    const sessionToken = response.req.cookies?.[env.sessionCookieName] as string | undefined;
    if (sessionToken) {
      await this.authService.logout(sessionToken);
    }

    response.clearCookie(env.sessionCookieName);
    response.clearCookie(env.socialSignupCookieName);
  }

  @Post('auth/password/forgot')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() request: Request,
  ): Promise<{ accepted: true }> {
    return this.authService.forgotPassword(dto, this.getRequestIp(request));
  }

  @Post('auth/password/reset')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() request: Request,
  ): Promise<{ success: true }> {
    return this.authService.resetPassword(dto, this.getRequestIp(request));
  }

  @UseGuards(SessionAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: AuthenticatedUser): Promise<AuthenticatedUser> {
    return this.authService.getProfile(user.id, user.sessionId);
  }

  @UseGuards(SessionAuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthenticatedUser> {
    return this.authService.updateProfile(user.id, user.sessionId, dto);
  }

  private attachSessionCookie(response: Response, token: string): void {
    response.cookie(env.sessionCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.authCookieSecure,
      path: '/',
      maxAge: env.sessionTtlHours * 60 * 60 * 1000,
    });
  }

  private attachSocialSignupCookie(response: Response, token: string): void {
    response.cookie(env.socialSignupCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.authCookieSecure,
      path: '/',
      maxAge: env.authFlowTtlMinutes * 60 * 1000,
    });
  }

  private getRequestIp(request: Request): string | undefined {
    return request.ip || request.socket.remoteAddress || undefined;
  }
}
