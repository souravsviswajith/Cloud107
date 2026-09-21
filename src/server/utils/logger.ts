import { RequestContext } from '../types/requestContext';

/**
 * Standardized logger instance
 */
export const logger = {
  info: (message: string, meta: Record<string, unknown> = {}, context?: RequestContext) => {
    console.log(
      JSON.stringify({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        ...meta,
        ...context,
      }),
    );
  },
  error: (message: string, meta: Record<string, unknown> = {}, context?: RequestContext) => {
    console.error(
      JSON.stringify({
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
        ...meta,
        ...context,
      }),
    );
  },
  warn: (message: string, meta: Record<string, unknown> = {}, context?: RequestContext) => {
    console.warn(
      JSON.stringify({
        level: 'warn',
        message,
        timestamp: new Date().toISOString(),
        ...meta,
        ...context,
      }),
    );
  },
  debug: (message: string, meta: Record<string, unknown> = {}, context?: RequestContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        JSON.stringify({
          level: 'debug',
          message,
          timestamp: new Date().toISOString(),
          ...meta,
          ...context,
        }),
      );
    }
  },
};
