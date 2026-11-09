import { HttpException, HttpStatus } from '@nestjs/common';

export type AppErrorPayload = {
  error: string;
  code: string;
  message: string;
  statusCode: number;
};

export function createAppException(
  statusCode: HttpStatus,
  error: string,
  code: string,
  message: string,
): HttpException {
  return new HttpException(
    {
      error,
      code,
      message,
      statusCode,
    } satisfies AppErrorPayload,
    statusCode,
  );
}
