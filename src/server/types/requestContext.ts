export interface RequestContext {
  correlationId: string;
  requestId: string;
  userId?: string;
  email?: string;
  roles?: string[];
  startTime: number;
  ip?: string;
  userAgent?: string;
}

// `id` and `user` are owned by ./express.d.ts; this augmentation only adds
// the request context. Declaring the same members here with different
// modifiers (e.g. `id?` vs `id`) breaks interface merging (TS2687).
declare module 'express-serve-static-core' {
  interface Request {
    context: RequestContext;
  }
}
