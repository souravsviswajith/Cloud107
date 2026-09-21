export enum ErrorCode {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  WORKSPACE_ERROR = 'WORKSPACE_ERROR',
  STREAMING_ERROR = 'STREAMING_ERROR',
  APPLICATION_ERROR = 'APPLICATION_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class ApiError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode = ErrorCode.SYSTEM_ERROR,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
