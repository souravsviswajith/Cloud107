import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, getPrincipal } from '../../middleware/auth';
import { CapabilityService } from '../../services/capabilityService';
import { successResponse } from '../../utils/response';

export const capabilitiesRouter = Router();
const capabilityService = new CapabilityService();

capabilitiesRouter.use(requireAuth);

capabilitiesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getPrincipal(req);
    res.json(
      successResponse(
        {
          providerId: capabilityService.providerId,
          capabilities: capabilityService.getCapabilities(),
        },
        req,
      ),
    );
  } catch (error: unknown) {
    next(error);
  }
});

capabilitiesRouter.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    const result = await capabilityService.getHealth(principal);
    res.json(successResponse(result, req));
  } catch (error: unknown) {
    next(error);
  }
});
