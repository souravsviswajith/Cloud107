import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { UserService } from '../../services/userService';
import { successResponse } from '../../utils/response';

export const usersRouter = Router();
const userService = new UserService();

usersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { uid, email } = req.user!;
    const user = await userService.getOrCreateUser(uid, email || '');
    res.json(successResponse(user, req));
  } catch (error) {
    next(error);
  }
});
