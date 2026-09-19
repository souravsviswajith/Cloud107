// Removed Request import since we are augmenting express-serve-static-core directly
declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    user?: {
      uid: string;
      email?: string;
    };
  }
}
