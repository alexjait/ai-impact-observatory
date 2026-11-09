import { HttpStatus } from '@nestjs/common';

import { createAppException } from './app-exception';

export const SHARED_ERROR_CODES = {
  authenticationRequired: 'SHARED_AUTHENTICATION_REQUIRED',
  sessionInvalid: 'SHARED_SESSION_INVALID',
  missingAuthenticatedUserContext: 'SHARED_MISSING_AUTHENTICATED_USER_CONTEXT',
  permissionDenied: 'SHARED_PERMISSION_DENIED',
} as const;

export const sharedErrors = {
  authenticationRequired: () =>
    createAppException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      SHARED_ERROR_CODES.authenticationRequired,
      'Authentication required.',
    ),
  sessionInvalid: () =>
    createAppException(
      HttpStatus.UNAUTHORIZED,
      'Unauthorized',
      SHARED_ERROR_CODES.sessionInvalid,
      'Session is invalid or expired.',
    ),
  missingAuthenticatedUserContext: () =>
    createAppException(
      HttpStatus.FORBIDDEN,
      'Forbidden',
      SHARED_ERROR_CODES.missingAuthenticatedUserContext,
      'Missing authenticated user context.',
    ),
  permissionDenied: () =>
    createAppException(
      HttpStatus.FORBIDDEN,
      'Forbidden',
      SHARED_ERROR_CODES.permissionDenied,
      'You do not have permission to access this resource.',
    ),
} as const;
