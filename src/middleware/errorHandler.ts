import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

function isAppError(err: Error): err is AppError {
  return err instanceof AppError;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = isAppError(err) ? err.statusCode : 500;
  const code = isAppError(err) ? err.code : 'INTERNAL_ERROR';
  const message = err.message ?? 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
