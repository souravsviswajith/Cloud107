import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { ApiError, ErrorCode } from '../errors/ApiError';
import { logger } from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    logger.error(`ApiError: ${err.message}`, { code: err.code, details: err.details }, req.context);
    res.status(err.statusCode).json(errorResponse(err.message, err.code, req, err.details));
    return;
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack }, req.context);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json(errorResponse(message, ErrorCode.SYSTEM_ERROR, req));
};
