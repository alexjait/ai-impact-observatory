import {
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import {
  AuthFlowPurpose,
  AuthProvider,
  RoleKey,
  type Prisma,
  type User,
} from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../shared/auth.types';
import { env } from '../../shared/env';
import { CompleteSocialSignupDto } from './dto/complete-social-signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthEmailService } from './auth-email.service';
import { authErrors } from './auth.errors';
import { TurnstileService } from './turnstile.service';

const SESSION_TOKEN_BYTES = 32;
const PASSWORD_SALT_ROUNDS = 12;

type GoogleProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

type SupportedLocale = 'en' | 'es';

type SocialAuthCallbackResult =
  | { kind: 'session'; token: string; redirectTo: string }
  | { kind: 'social-signup'; signupContextToken: string; redirectTo: string }
  | { kind: 'conflict'; redirectTo: string };

type AuthUserWithRelations = User & {
  authIdentities: Array<{
    provider: AuthProvider;
    passwordHash: string | null;
  }>;
  roleAssignments: Array<{
    role: {
      key: RoleKey;
    };
  }>;
};

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authEmailService: AuthEmailService,
    private readonly turnstileService: TurnstileService,
  ) {}

  async register(dto: RegisterDto, remoteIp?: string): Promise<{ accepted: true }> {
    await this.turnstileService.verifyOrThrow(dto.captchaToken, remoteIp);

    if (!dto.termsAccepted) {
      throw authErrors.registerTermsRequired();
    }

    this.authEmailService.ensureEmailSendingAvailable();

    const email = dto.email.trim().toLowerCase();
    const locale = dto.locale;
    const existingIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_email: {
          provider: AuthProvider.local,
          email,
        },
      },
    });
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingIdentity || existingUser) {
      throw authErrors.registerEmailAlreadyRegistered();
    }

    const passwordHash = await hash(dto.password, PASSWORD_SALT_ROUNDS);
    const created = await this.prisma.$transaction(async (tx) => {
      const user = await this.createUserWithDefaultRole(
        email,
        dto.displayName.trim(),
        new Date(),
        tx,
      );

      const identity = await tx.authIdentity.create({
        data: {
          userId: user.id,
          provider: AuthProvider.local,
          providerUserId: email,
          email,
          passwordHash,
          displayNameSnapshot: dto.displayName.trim(),
          lastLoginAt: new Date(),
        },
      });

      const verificationToken = await this.createAuthFlowState(
        {
          purpose: AuthFlowPurpose.email_verification,
          provider: AuthProvider.local,
          userId: user.id,
          authIdentityId: identity.id,
          payloadJson: { locale },
          expiresInMs: env.emailVerificationTtlHours * 60 * 60 * 1000,
        },
        tx,
      );

      return { user, verificationToken };
    });

    try {
      await this.authEmailService.sendVerificationEmail({
        userId: created.user.id,
        email,
        displayName: created.user.displayName,
        locale,
        verificationUrl: this.buildApiUrl(
          `/auth/verify-email?token=${encodeURIComponent(created.verificationToken)}&locale=${encodeURIComponent(locale)}`,
        ),
      });
    } catch (error) {
      await this.prisma.user.delete({
        where: { id: created.user.id },
      });

      throw error;
    }

    return { accepted: true };
  }

  async login(dto: LoginDto, remoteIp?: string): Promise<{ token: string; user: AuthenticatedUser }> {
    await this.turnstileService.verifyOrThrow(dto.captchaToken, remoteIp);

    const email = dto.email.trim().toLowerCase();
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_email: {
          provider: AuthProvider.local,
          email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!identity?.user || !identity.passwordHash || !identity.user.isActive) {
      throw authErrors.invalidCredentials();
    }

    if (!identity.emailVerifiedAt) {
      throw authErrors.emailNotVerified();
    }

    const isValid = await compare(dto.password, identity.passwordHash);
    if (!isValid) {
      throw authErrors.invalidCredentials();
    }

    await this.prisma.authIdentity.update({
      where: { id: identity.id },
      data: { lastLoginAt: new Date() },
    });

    const session = await this.createSession(identity.user.id, identity.id);
    const authUser = await this.getAuthenticatedUserById(identity.user.id, session.id);

    return { token: session.token, user: authUser };
  }

  async logout(sessionToken: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { tokenHash: this.hashToken(sessionToken) },
    });
  }

  async getProfile(userId: string, sessionId: string): Promise<AuthenticatedUser> {
    return this.getAuthenticatedUserById(userId, sessionId);
  }

  async updateProfile(userId: string, sessionId: string, dto: UpdateProfileDto): Promise<AuthenticatedUser> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName?.trim(),
      },
    });

    return this.getAuthenticatedUserById(userId, sessionId);
  }

  async forgotPassword(dto: ForgotPasswordDto, remoteIp?: string): Promise<{ accepted: true }> {
    await this.turnstileService.verifyOrThrow(dto.captchaToken, remoteIp);

    const email = dto.email.trim().toLowerCase();
    const locale = dto.locale;
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_email: {
          provider: AuthProvider.local,
          email,
        },
      },
      include: {
        user: true,
      },
    });

    if (!identity?.user || !identity.passwordHash) {
      return { accepted: true };
    }

    this.authEmailService.ensureEmailSendingAvailable();

    const token = randomBytes(SESSION_TOKEN_BYTES).toString('hex');
    const expiresAt = new Date(Date.now() + env.passwordResetTtlMinutes * 60 * 1000);

    const resetToken = await this.prisma.passwordResetToken.create({
      data: {
        userId: identity.user.id,
        authIdentityId: identity.id,
        tokenHash: this.hashToken(token),
        expiresAt,
      },
    });

    try {
      await this.authEmailService.sendPasswordResetEmail({
        resetTokenId: resetToken.id,
        email,
        displayName: identity.user.displayName,
        locale,
        resetUrl: this.buildAppUrl(
          `/auth/reset-password?token=${encodeURIComponent(token)}&locale=${encodeURIComponent(locale)}`,
        ),
      });
    } catch (error) {
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      throw error;
    }

    return { accepted: true };
  }

  async resetPassword(dto: ResetPasswordDto, remoteIp?: string): Promise<{ success: true }> {
    await this.turnstileService.verifyOrThrow(dto.captchaToken, remoteIp);

    const tokenHash = this.hashToken(dto.token);
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        authIdentity: true,
      },
    });

    if (!resetToken?.authIdentity || resetToken.authIdentity.provider !== AuthProvider.local) {
      throw authErrors.passwordResetTokenInvalid();
    }

    const passwordHash = await hash(dto.newPassword, PASSWORD_SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.authIdentity.update({
        where: { id: resetToken.authIdentity.id },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.session.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return { success: true };
  }

  getAvailableProviders() {
    return {
      local: { enabled: true },
      google: {
        enabled: Boolean(
          env.googleClientId &&
            env.googleClientSecret &&
            env.googleRedirectUri,
        ),
      },
    };
  }

  async initiateGoogleAuth(returnTo?: string): Promise<string> {
    this.assertGoogleEnabled();

    const stateToken = await this.createAuthFlowState({
      purpose: AuthFlowPurpose.google_oauth,
      provider: AuthProvider.google,
      returnTo,
    });

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', env.googleClientId);
    url.searchParams.set('redirect_uri', env.googleRedirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', stateToken);
    url.searchParams.set('prompt', 'select_account');

    return url.toString();
  }

  async handleGoogleCallback(code?: string, stateToken?: string): Promise<SocialAuthCallbackResult> {
    this.assertGoogleEnabled();

    if (!code || !stateToken) {
      throw authErrors.googleCallbackMissingParams();
    }

    const flowState = await this.consumeAuthFlowState(stateToken, AuthFlowPurpose.google_oauth);
    const profile = await this.exchangeGoogleCodeForProfile(code);
    const email = profile.email?.trim().toLowerCase();

    if (!email) {
      throw authErrors.googleEmailMissing();
    }

    if (profile.email_verified === false) {
      throw authErrors.googleEmailNotVerified();
    }

    const googleIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.google,
          providerUserId: profile.sub,
        },
      },
      include: {
        user: true,
      },
    });

    if (googleIdentity?.user) {
      if (!googleIdentity.user.termsAcceptedAt) {
        const signupContextToken = await this.createAuthFlowState({
          purpose: AuthFlowPurpose.social_signup,
          provider: AuthProvider.google,
          userId: googleIdentity.user.id,
          authIdentityId: googleIdentity.id,
          returnTo: flowState.returnTo ?? undefined,
        });

        return {
          kind: 'social-signup',
          signupContextToken,
          redirectTo: this.buildAppUrl(env.socialSignupPath),
        };
      }

      await this.prisma.authIdentity.update({
        where: { id: googleIdentity.id },
        data: {
          email,
          emailVerifiedAt: profile.email_verified ? new Date() : null,
          displayNameSnapshot: profile.name ?? googleIdentity.displayNameSnapshot,
          avatarUrl: profile.picture ?? googleIdentity.avatarUrl,
          lastLoginAt: new Date(),
        },
      });

      const session = await this.createSession(googleIdentity.user.id, googleIdentity.id);
      return {
        kind: 'session',
        token: session.token,
        redirectTo: this.resolveReturnTo(flowState.returnTo),
      };
    }

    const localIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_email: {
          provider: AuthProvider.local,
          email,
        },
      },
    });

    if (localIdentity) {
      const conflictUrl = new URL(this.buildAppUrl(env.authConflictPath));
      conflictUrl.searchParams.set('reason', 'google_email_conflict');
      conflictUrl.searchParams.set('email', email);

      return {
        kind: 'conflict',
        redirectTo: conflictUrl.toString(),
      };
    }

    const user = await this.createUserWithDefaultRole(
      email,
      profile.name?.trim() || this.buildFallbackDisplayName(email),
      null,
    );

    const identity = await this.prisma.authIdentity.create({
      data: {
        userId: user.id,
        provider: AuthProvider.google,
        providerUserId: profile.sub,
        email,
        emailVerifiedAt: profile.email_verified ? new Date() : null,
        displayNameSnapshot: profile.name ?? null,
        avatarUrl: profile.picture ?? null,
      },
    });

    const signupContextToken = await this.createAuthFlowState({
      purpose: AuthFlowPurpose.social_signup,
      provider: AuthProvider.google,
      userId: user.id,
      authIdentityId: identity.id,
      returnTo: flowState.returnTo ?? undefined,
    });

    return {
      kind: 'social-signup',
      signupContextToken,
      redirectTo: this.buildAppUrl(env.socialSignupPath),
    };
  }

  async completeSocialSignup(
    dto: CompleteSocialSignupDto,
    signupContextToken?: string,
  ): Promise<{ token: string; user: AuthenticatedUser; returnTo: string }> {
    if (!dto.termsAccepted) {
      throw authErrors.socialSignupTermsRequired();
    }

    if (!signupContextToken) {
      throw authErrors.socialSignupContextMissing();
    }

    const flowState = await this.consumeAuthFlowState(
      signupContextToken,
      AuthFlowPurpose.social_signup,
    );

    if (!flowState.userId || !flowState.authIdentityId) {
      throw authErrors.socialSignupContextInvalid();
    }

    const identity = await this.prisma.authIdentity.findUnique({
      where: { id: flowState.authIdentityId },
      include: { user: true },
    });

    if (!identity?.user || identity.provider !== AuthProvider.google) {
      throw authErrors.socialSignupContextInvalid();
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: identity.user.id },
        data: {
          termsAcceptedAt: identity.user.termsAcceptedAt ?? new Date(),
        },
      }),
      this.prisma.authIdentity.update({
        where: { id: identity.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    const session = await this.createSession(identity.user.id, identity.id);
    const authUser = await this.getAuthenticatedUserById(identity.user.id, session.id);

    return {
      token: session.token,
      user: authUser,
      returnTo: this.resolveReturnTo(flowState.returnTo),
    };
  }

  async validateSessionToken(sessionToken: string): Promise<AuthenticatedUser | null> {
    const session = await this.prisma.session.findUnique({
      where: {
        tokenHash: this.hashToken(sessionToken),
      },
      include: {
        user: {
          include: {
            authIdentities: {
              select: {
                provider: true,
                passwordHash: true,
              },
            },
            roleAssignments: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
      return null;
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return this.mapAuthenticatedUser(session.user, session.id);
  }

  async verifyEmail(token: string, requestedLocale?: string): Promise<{ returnTo: string }> {
    const flowState = await this.consumeAuthFlowState(token, AuthFlowPurpose.email_verification);
    const locale = this.getFlowLocale(flowState.payloadJson, requestedLocale);

    if (!flowState.userId || !flowState.authIdentityId) {
      throw authErrors.emailVerificationTokenInvalid();
    }

    const identity = await this.prisma.authIdentity.findUnique({
      where: { id: flowState.authIdentityId },
      include: { user: true },
    });

    if (!identity?.user || identity.provider !== AuthProvider.local) {
      throw authErrors.emailVerificationTokenInvalid();
    }

    const shouldSendWelcome = !identity.emailVerifiedAt;

    await this.prisma.authIdentity.update({
      where: { id: identity.id },
      data: {
        emailVerifiedAt: identity.emailVerifiedAt ?? new Date(),
      },
    });

    if (shouldSendWelcome) {
      try {
        await this.authEmailService.sendWelcomeEmail({
          userId: identity.user.id,
          email: identity.email,
          displayName: identity.user.displayName,
          locale,
        });
      } catch (error) {
        console.error(error);
      }
    }

    return {
      returnTo: this.buildAppUrl(
        `/auth/login?emailVerification=success&locale=${encodeURIComponent(locale)}`,
      ),
    };
  }

  private assertGoogleEnabled(): void {
    if (!this.getAvailableProviders().google.enabled) {
      throw authErrors.googleSignInNotConfigured();
    }
  }

  async onApplicationBootstrap() {
    await this.ensureDefaultRoles();
  }

  private async ensureDefaultRoles(): Promise<void> {
    const roleSpecs = [
      { key: RoleKey.REGISTERED, label: 'Registered user' },
      { key: RoleKey.MODERATOR, label: 'Moderator' },
      { key: RoleKey.EDITOR, label: 'Editor' },
      { key: RoleKey.ADMIN, label: 'Administrator' },
    ];

    await Promise.all(
      roleSpecs.map((role) =>
        this.prisma.role.upsert({
          where: { key: role.key },
          update: { label: role.label },
          create: role,
        }),
      ),
    );
  }

  private async createUserWithDefaultRole(
    email: string,
    displayName: string,
    termsAcceptedAt: Date | null,
    prisma: PrismaService | Prisma.TransactionClient = this.prisma,
  ): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        termsAcceptedAt,
      },
    });

    const defaultRoles: RoleKey[] = [RoleKey.REGISTERED];
    if (env.bootstrapAdminEmail && email === env.bootstrapAdminEmail) {
      defaultRoles.push(RoleKey.ADMIN);
    }

    await this.assignRoles(user.id, defaultRoles, prisma);

    return user;
  }

  private async assignRoles(
    userId: string,
    roles: RoleKey[],
    prisma: PrismaService | Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    const records = await prisma.role.findMany({
      where: { key: { in: roles } },
    });

    await Promise.all(
      records.map((role) =>
        prisma.userRoleAssignment.upsert({
          where: {
            userId_roleId: {
              userId,
              roleId: role.id,
            },
          },
          update: {},
          create: {
            userId,
            roleId: role.id,
          },
        }),
      ),
    );
  }

  private async createSession(userId: string, authIdentityId?: string): Promise<{ id: string; token: string }> {
    const token = randomBytes(SESSION_TOKEN_BYTES).toString('hex');
    const expiresAt = new Date(Date.now() + env.sessionTtlHours * 60 * 60 * 1000);
    const session = await this.prisma.session.create({
      data: {
        userId,
        authIdentityId,
        tokenHash: this.hashToken(token),
        expiresAt,
      },
    });

    return { id: session.id, token };
  }

  private async getAuthenticatedUserById(userId: string, sessionId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        authIdentities: {
          select: {
            provider: true,
            passwordHash: true,
          },
        },
        roleAssignments: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw authErrors.userNotFound();
    }

    return this.mapAuthenticatedUser(user, sessionId);
  }

  private mapAuthenticatedUser(user: AuthUserWithRelations, sessionId: string): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roleAssignments.map((assignment) => assignment.role.key),
      sessionId,
      authMethods: [...new Set(user.authIdentities.map((identity) => identity.provider))],
      hasLocalPassword: user.authIdentities.some(
        (identity) =>
          identity.provider === AuthProvider.local &&
          typeof identity.passwordHash === 'string' &&
          identity.passwordHash.length > 0,
      ),
    };
  }

  private async createAuthFlowState(input: {
    purpose: AuthFlowPurpose;
    provider?: AuthProvider;
    userId?: string;
    authIdentityId?: string;
    returnTo?: string;
    payloadJson?: Prisma.InputJsonValue;
    expiresInMs?: number;
  },
  prisma: PrismaService | Prisma.TransactionClient = this.prisma,
  ): Promise<string> {
    const token = randomBytes(SESSION_TOKEN_BYTES).toString('hex');
    const expiresAt = new Date(
      Date.now() + (input.expiresInMs ?? env.authFlowTtlMinutes * 60 * 1000),
    );

    await prisma.authFlowState.create({
      data: {
        purpose: input.purpose,
        provider: input.provider,
        userId: input.userId,
        authIdentityId: input.authIdentityId,
        returnTo: input.returnTo,
        payloadJson: input.payloadJson,
        tokenHash: this.hashToken(token),
        expiresAt,
      },
    });

    return token;
  }

  private async consumeAuthFlowState(token: string, purpose: AuthFlowPurpose) {
    const tokenHash = this.hashToken(token);
    const flowState = await this.prisma.authFlowState.findFirst({
      where: {
        tokenHash,
        purpose,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!flowState) {
      throw authErrors.authFlowStateInvalid();
    }

    await this.prisma.authFlowState.update({
      where: { id: flowState.id },
      data: { usedAt: new Date() },
    });

    return flowState;
  }

  private async exchangeGoogleCodeForProfile(code: string): Promise<GoogleProfile> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: env.googleRedirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw authErrors.googleTokenExchangeFailed();
    }

    const tokenPayload = (await tokenResponse.json()) as {
      access_token?: string;
    };

    if (!tokenPayload.access_token) {
      throw authErrors.googleAccessTokenMissing();
    }

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw authErrors.googleProfileFetchFailed();
    }

    return (await profileResponse.json()) as GoogleProfile;
  }

  private buildAppUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${env.appBaseUrl}${normalizedPath}`;
  }

  private buildApiUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${env.apiBaseUrl}/api/v1${normalizedPath}`;
  }

  private resolveReturnTo(returnTo?: string | null): string {
    if (!returnTo) {
      return env.appBaseUrl;
    }

    if (returnTo.startsWith('/')) {
      return this.buildAppUrl(returnTo);
    }

    try {
      const parsed = new URL(returnTo);
      const allowed = new URL(env.appBaseUrl);
      if (parsed.origin === allowed.origin) {
        return returnTo;
      }
    } catch {
      // Invalid URL — fall through to safe default
    }

    return env.appBaseUrl;
  }

  private buildFallbackDisplayName(email: string): string {
    return email.split('@')[0]?.trim() || 'Google user';
  }

  private getFlowLocale(
    payloadJson: Prisma.JsonValue | null | undefined,
    fallbackLocale?: string,
  ): SupportedLocale {
    if (!payloadJson || typeof payloadJson !== 'object' || Array.isArray(payloadJson)) {
      return fallbackLocale === 'es' ? 'es' : env.defaultLocale;
    }

    const locale = (payloadJson as { locale?: unknown }).locale;
    if (locale === 'es' || locale === 'en') {
      return locale;
    }

    return fallbackLocale === 'es' ? 'es' : env.defaultLocale;
  }

  private hashToken(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
