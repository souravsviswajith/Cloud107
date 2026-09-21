import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, getPrincipal } from '../../middleware/auth';
import { OperationService } from '../../services/operationService';
import { successResponse } from '../../utils/response';

export const operationsRouter = Router();
const operationService = new OperationService();

operationsRouter.use(requireAuth);

operationsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    const operations = await operationService.listOperations(req.query, principal);
    res.json(successResponse(operations, req));
  } catch (error: unknown) {
    next(error);
  }
});

operationsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    const operation = await operationService.getOperation(req.params.id, principal);
    res.json(successResponse(operation, req));
  } catch (error: unknown) {
    next(error);
  }
});
