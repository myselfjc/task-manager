export class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function UnauthorizedError(message: string = 'Unauthorized'): AppError {
  return new AppError(message, 401, 'UNAUTHORIZED');
}

export function NotFoundError(message: string = 'Not found'): AppError {
  return new AppError(message, 404, 'NOT_FOUND');
}

export function ConflictError(message: string): AppError {
  return new AppError(message, 409, 'CONFLICT');
}

export function BadRequestError(message: string): AppError {
  return new AppError(message, 400, 'BAD_REQUEST');
}

export function InternalError(message: string = 'Internal server error'): AppError {
  return new AppError(message, 500, 'INTERNAL_ERROR');
}
