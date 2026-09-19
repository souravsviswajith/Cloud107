import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContext } from '../types/requestContext';

/**
 * Middleware to initialize request context
 */
export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  const requestId = uuidv4();

  const context: RequestContext = {
    correlationId,
    requestId,
    startTime: Date.now(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  };

  req.context = context;
  req.id = correlationId; // For backwards compatibility

  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Request-ID', requestId);

  next();
};
