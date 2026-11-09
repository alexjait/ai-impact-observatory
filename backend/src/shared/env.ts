const getNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: getNumber(process.env.PORT, 3001),
  trustProxy: getBoolean(process.env.TRUST_PROXY, false),
  throttleDefaultTtlMs: getNumber(process.env.THROTTLE_DEFAULT_TTL_MS, 60_000),
  throttleDefaultLimit: getNumber(
    process.env.THROTTLE_DEFAULT_LIMIT,
    (process.env.NODE_ENV ?? 'development') === 'production' ? 60 : 180,
  ),
  throttleAuthTtlMs: getNumber(process.env.THROTTLE_AUTH_TTL_MS, 60_000),
  throttleAuthLimit: getNumber(process.env.THROTTLE_AUTH_LIMIT, 10),
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? '',
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3001',
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:3000',
  corsAllowedOrigins:
    process.env.CORS_ALLOWED_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [process.env.APP_BASE_URL ?? 'http://localhost:3000'],
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'aiio_session',
  socialSignupCookieName: process.env.SOCIAL_SIGNUP_COOKIE_NAME ?? 'aiio_social_signup',
  sessionTtlHours: getNumber(process.env.SESSION_TTL_HOURS, 720),
  passwordResetTtlMinutes: getNumber(process.env.PASSWORD_RESET_TTL_MINUTES, 60),
  authFlowTtlMinutes: getNumber(process.env.AUTH_FLOW_TTL_MINUTES, 15),
  emailVerificationTtlHours: getNumber(process.env.EMAIL_VERIFICATION_TTL_HOURS, 24),
  defaultLocale: (process.env.DEFAULT_LOCALE ?? 'en') as 'en' | 'es',
  bootstrapAdminEmail: process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase() ?? '',
  authCookieSecure: getBoolean(process.env.AUTH_COOKIE_SECURE, false),
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? '',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3001/api/v1/auth/google/callback',
  authConflictPath: process.env.AUTH_CONFLICT_PATH ?? '/auth/conflict',
  socialSignupPath: process.env.SOCIAL_SIGNUP_PATH ?? '/auth/social/complete',
  seedCsvPath:
    process.env.SEED_CSV_PATH ?? '../docs/seed_portal_impacto_ia_bilingue_completo_final.csv',
  translationProvider: (process.env.TRANSLATION_PROVIDER ?? 'mymemory').toLowerCase(),
  translationApiBaseUrl:
    process.env.TRANSLATION_API_BASE_URL ?? 'https://api.mymemory.translated.net',
  translationContactEmail: process.env.TRANSLATION_CONTACT_EMAIL ?? '',
};
