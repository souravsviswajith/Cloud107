import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ApplicationService } from '../../services/applicationService';
import { getDbUser } from '../../middleware/auth';
import { successResponse, errorResponse } from '../../utils/response';
import { logger } from '../../utils/logger';
import { z } from 'zod';

export const applicationsRouter = Router();
const applicationService = new ApplicationService();

applicationsRouter.use(requireAuth);

applicationsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applications = await applicationService.listApplications();
    res.json(successResponse(applications, req));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationService.getApplication(req.params.id);
    if (!application) {
      res.status(404).json(errorResponse('Application not found', 404, req));
      return;
    }
    res.json(successResponse(application, req));
  } catch (error) {
    next(error);
  }
});

const launchSchema = z.object({
  workspaceId: z.string().uuid(),
});

applicationsRouter.post('/:id/launch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getDbUser(req);
    const body = launchSchema.parse(req.body);

    logger.info(`Launching application`, {
      applicationId: req.params.id,
      workspaceId: body.workspaceId,
      userId: user.id,
    });

    const session = await applicationService.launchApplication(
      req.params.id,
      body.workspaceId,
      user.id,
    );
    res.json(successResponse(session, req));
  } catch (error) {
    next(error);
  }
});

applicationsRouter.post(
  '/sessions/:id/stop',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getDbUser(req);

      logger.info(`Stopping application session`, {
        sessionId: req.params.id,
        userId: user.id,
      });

      const session = await applicationService.stopApplication(req.params.id, user.id);
      res.json(successResponse(session, req));
    } catch (error) {
      next(error);
    }
  },
);
