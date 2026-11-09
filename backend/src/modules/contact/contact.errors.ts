import { HttpStatus } from '@nestjs/common';

import { createAppException } from '../../shared/app-exception';

export const CONTACT_ERROR_CODES = {
  messageNotFound: 'CONTACT_MESSAGE_NOT_FOUND',
} as const;

export const contactErrors = {
  messageNotFound: () =>
    createAppException(
      HttpStatus.NOT_FOUND,
      'Not Found',
      CONTACT_ERROR_CODES.messageNotFound,
      'Contact message was not found.',
    ),
} as const;
