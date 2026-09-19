import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '../services/authenticationService';
import { UserService } from '../services/userService';
import { ApiError, ErrorCode } from '../errors/ApiError';


const authService = new AuthenticationService();
const userService = new UserService();

/**
 * Middleware to require authentication for routes
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError('Unauthorized: Missing token', 401, ErrorCode.AUTHENTICATION_FAILED));
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await authService.verifyToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || 'operator@cloud107.local',
    };
    if (req.context) {
      req.context.userId = decodedToken.uid;
      req.context.email = decodedToken.email || 'operator@cloud107.local';
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to get the database user for the current request
 */
export const getDbUser = async (req: Request) => {
  if (!req.user) {
    throw new ApiError('User not authenticated', 401, ErrorCode.UNAUTHORIZED);
  }
  const { uid, email } = req.user;
  return await userService.getOrCreateUser(uid, email || '');
};
