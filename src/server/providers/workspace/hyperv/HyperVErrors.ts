import { ApiError, ErrorCode } from '../../../errors/ApiError';

export class HyperVError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 500, ErrorCode.WORKSPACE_ERROR, details);
    this.name = 'HyperVError';
  }
}

export class HyperVTimeoutError extends HyperVError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.name = 'HyperVTimeoutError';
    this.statusCode = 504; // Gateway Timeout
  }
}
