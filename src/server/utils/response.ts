import { Request } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string | number;
    details?: unknown;
  };
  correlationId?: string;
  timestamp: string;
}

export const successResponse = <T>(data: T, req?: Request): ApiResponse<T> => {
  return {
    success: true,
    data,
    correlationId: req?.context?.correlationId || req?.id,
    timestamp: new Date().toISOString(),
  };
};

export const errorResponse = (
  message: string,
  code: string | number = 500,
  req?: Request,
  details?: unknown
): ApiResponse => {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
    correlationId: req?.context?.correlationId || req?.id,
    timestamp: new Date().toISOString(),
  };
};
