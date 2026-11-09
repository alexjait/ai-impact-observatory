import { HttpStatus } from '@nestjs/common';

import { createAppException } from '../../shared/app-exception';

export const PUBLIC_ERROR_CODES = {
  activityNotFound: 'PUBLIC_ACTIVITY_NOT_FOUND',
  evidenceNotFound: 'PUBLIC_EVIDENCE_NOT_FOUND',
} as const;

export const publicErrors = {
  activityNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      PUBLIC_ERROR_CODES.activityNotFound,
      'Activity not found.',
    ),
  evidenceNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      PUBLIC_ERROR_CODES.evidenceNotFound,
      'Evidence not found.',
    ),
} as const;
