// Cloud107 request augmentation for Express.
//
// IMPORTANT: this file must remain a *module* (note the `export {}` below).
// As a global script, `declare module 'express-serve-static-core'` would
// *replace* the real Express types instead of augmenting them, erasing
// Request/Response/NextFunction members program-wide.
export {};

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    user?: {
      uid: string;
      email?: string;
      roles?: string[];
    };
  }
}
