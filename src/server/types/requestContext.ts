export interface RequestContext {
  correlationId: string;
  requestId: string;
  userId?: string;
  email?: string;
  startTime: number;
  ip?: string;
  userAgent?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    context: RequestContext;
    // Keeping for backwards compatibility
    user?: { uid: string; email?: string };
    id?: string;
  }
}
