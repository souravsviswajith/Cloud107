import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '../services/authenticationService';
import { UserService } from '../services/userService';
import { ApiError, ErrorCode } from '../errors/ApiError';
import type { AuthPrincipal } from '../policies/capabilityPolicy';

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
    const roles = Array.isArray(decodedToken.roles)
      ? decodedToken.roles.filter((role): role is string => typeof role === 'string')
      : [];
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || 'operator@cloud107.local',
      roles,
    };
    if (req.context) {
      req.context.userId = decodedToken.uid;
      req.context.email = decodedToken.email || 'operator@cloud107.local';
      req.context.roles = roles;
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

/**
 * Helper to get the fully-resolved authorization principal for the current
 * request: the persistent DB identity plus the verified token roles.
 * Capability API services authorize against this principal via policy checks.
 */
export const getPrincipal = async (req: Request): Promise<AuthPrincipal> => {
  const dbUser = await getDbUser(req);
  const roles = Array.isArray(req.user?.roles)
    ? req.user.roles.filter((role): role is string => typeof role === 'string')
    : [];
  return {
    id: dbUser.id,
    uid: dbUser.uid,
    email: dbUser.email,
    roles,
  };
};
