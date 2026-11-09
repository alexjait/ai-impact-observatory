import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export const AUTH_ERROR_CODES = {
  captchaValidationNotConfigured: 'AUTH_CAPTCHA_VALIDATION_NOT_CONFIGURED',
  captchaValidationFailed: 'AUTH_CAPTCHA_VALIDATION_FAILED',
  captchaValidationUnavailable: 'AUTH_CAPTCHA_VALIDATION_UNAVAILABLE',
  registerTermsRequired: 'AUTH_REGISTER_TERMS_REQUIRED',
  registerEmailAlreadyRegistered: 'AUTH_REGISTER_EMAIL_ALREADY_REGISTERED',
  invalidCredentials: 'AUTH_INVALID_CREDENTIALS',
  emailNotVerified: 'AUTH_EMAIL_NOT_VERIFIED',
  passwordResetTokenInvalid: 'AUTH_PASSWORD_RESET_TOKEN_INVALID',
  googleCallbackMissingParams: 'AUTH_GOOGLE_CALLBACK_MISSING_PARAMS',
  googleEmailMissing: 'AUTH_GOOGLE_EMAIL_MISSING',
  googleEmailNotVerified: 'AUTH_GOOGLE_EMAIL_NOT_VERIFIED',
  socialSignupTermsRequired: 'AUTH_SOCIAL_SIGNUP_TERMS_REQUIRED',
  socialSignupContextMissing: 'AUTH_SOCIAL_SIGNUP_CONTEXT_MISSING',
  socialSignupContextInvalid: 'AUTH_SOCIAL_SIGNUP_CONTEXT_INVALID',
  emailVerificationTokenInvalid: 'AUTH_EMAIL_VERIFICATION_TOKEN_INVALID',
  googleSignInNotConfigured: 'AUTH_GOOGLE_SIGN_IN_NOT_CONFIGURED',
  userNotFound: 'AUTH_USER_NOT_FOUND',
  authFlowStateInvalid: 'AUTH_FLOW_STATE_INVALID',
  googleTokenExchangeFailed: 'AUTH_GOOGLE_TOKEN_EXCHANGE_FAILED',
  googleAccessTokenMissing: 'AUTH_GOOGLE_ACCESS_TOKEN_MISSING',
  googleProfileFetchFailed: 'AUTH_GOOGLE_PROFILE_FETCH_FAILED',
  emailDeliveryNotConfigured: 'AUTH_EMAIL_DELIVERY_NOT_CONFIGURED',
  verificationEmailSendFailed: 'AUTH_VERIFICATION_EMAIL_SEND_FAILED',
  welcomeEmailSendFailed: 'AUTH_WELCOME_EMAIL_SEND_FAILED',
  passwordResetEmailSendFailed: 'AUTH_PASSWORD_RESET_EMAIL_SEND_FAILED',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

type AuthErrorPayload = {
  error: string;
  code: AuthErrorCode;
  message: string;
  statusCode: number;
};

const buildPayload = (
  statusCode: number,
  error: string,
  code: AuthErrorCode,
  message: string,
): AuthErrorPayload => ({
  error,
  code,
  message,
  statusCode,
});

const createAuthException = (
  statusCode: HttpStatus,
  error: string,
  code: AuthErrorCode,
  message: string,
): HttpException =>
  new HttpException(buildPayload(statusCode, error, code, message), statusCode);

export const authErrors = {
  captchaValidationNotConfigured: () =>
    createAuthException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service Unavailable',
      AUTH_ERROR_CODES.captchaValidationNotConfigured,
      'Captcha validation is not configured.',
    ),
  captchaValidationFailed: () =>
    createAuthException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      AUTH_ERROR_CODES.captchaValidationFailed,
      'Captcha validation failed.',
    ),
  captchaValidationUnavailable: () =>
    createAuthException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service Unavailable',
      AUTH_ERROR_CODES.captchaValidationUnavailable,
      'Captcha validation is temporarily unavailable.',
    ),
  registerTermsRequired: () =>
    createAuthException(
      HttpStatus.CONFLICT,
      'Conflict',
      AUTH_ERROR_CODES.registerTermsRequired,
      'Terms must be accepted to register.',
    ),
  registerEmailAlreadyRegistered: () =>
    createAuthException(
      HttpStatus.CONFLICT,
      'Conflict',
      AUTH_ERROR_CODES.registerEmailAlreadyRegistered,
      'Email is already registered.',
    ),
  invalidCredentials: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.invalidCredentials,
      'Invalid credentials.',
    ),
  emailNotVerified: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.emailNotVerified,
      'Verify your email before signing in.',
    ),
  passwordResetTokenInvalid: () =>
    createAuthException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      AUTH_ERROR_CODES.passwordResetTokenInvalid,
      'Password reset token is invalid or expired.',
    ),
  googleCallbackMissingParams: () =>
    createAuthException(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      AUTH_ERROR_CODES.googleCallbackMissingParams,
      'Google callback is missing code or state.',
    ),
  googleEmailMissing: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.googleEmailMissing,
      'Google account did not provide an email.',
    ),
  googleEmailNotVerified: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.googleEmailNotVerified,
      'Google account email must be verified.',
    ),
  socialSignupTermsRequired: () =>
    createAuthException(
      HttpStatus.CONFLICT,
      'Conflict',
      AUTH_ERROR_CODES.socialSignupTermsRequired,
      'Terms must be accepted to complete social signup.',
    ),
  socialSignupContextMissing: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.socialSignupContextMissing,
      'Missing social signup context.',
    ),
  socialSignupContextInvalid: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.socialSignupContextInvalid,
      'Invalid social signup context.',
    ),
  emailVerificationTokenInvalid: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.emailVerificationTokenInvalid,
      'Email verification token is invalid or expired.',
    ),
  googleSignInNotConfigured: () =>
    createAuthException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service Unavailable',
      AUTH_ERROR_CODES.googleSignInNotConfigured,
      'Google sign-in is not configured.',
    ),
  userNotFound: () =>
    createAuthException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      AUTH_ERROR_CODES.userNotFound,
      'User not found.',
    ),
  authFlowStateInvalid: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.authFlowStateInvalid,
      'Authentication flow state is invalid or expired.',
    ),
  googleTokenExchangeFailed: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.googleTokenExchangeFailed,
      'Google token exchange failed.',
    ),
  googleAccessTokenMissing: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.googleAccessTokenMissing,
      'Google token exchange did not return an access token.',
    ),
  googleProfileFetchFailed: () =>
    createAuthException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      AUTH_ERROR_CODES.googleProfileFetchFailed,
      'Google profile fetch failed.',
    ),
  emailDeliveryNotConfigured: () =>
    createAuthException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service Unavailable',
      AUTH_ERROR_CODES.emailDeliveryNotConfigured,
      'Email delivery is not configured.',
    ),
  verificationEmailSendFailed: () =>
    createAuthException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service Unavailable',
      AUTH_ERROR_CODES.verificationEmailSendFailed,
      'Verification email could not be sent.',
    ),
  welcomeEmailSendFailed: () =>
    createAuthException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service Unavailable',
      AUTH_ERROR_CODES.welcomeEmailSendFailed,
      'Welcome email could not be sent.',
    ),
  passwordResetEmailSendFailed: () =>
    createAuthException(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service Unavailable',
      AUTH_ERROR_CODES.passwordResetEmailSendFailed,
      'Password reset email could not be sent.',
    ),
} as const;
