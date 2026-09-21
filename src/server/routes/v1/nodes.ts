import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, getPrincipal } from '../../middleware/auth';
import { CapabilityService } from '../../services/capabilityService';
import { successResponse } from '../../utils/response';
import { logger } from '../../utils/logger';

export const nodesRouter = Router();
const capabilityService = new CapabilityService();

nodesRouter.use(requireAuth);

nodesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    const nodes = await capabilityService.listNodes(req.query, principal);
    res.json(successResponse(nodes, req));
  } catch (error: unknown) {
    next(error);
  }
});

nodesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    logger.info('Provisioning node', {
      userId: principal.id,
      correlationId: req.id,
    });
    const body: unknown = req.body;
    const result = await capabilityService.provisionNode(body, principal);
    res.status(201).json(successResponse(result, req));
  } catch (error: unknown) {
    logger.error('Failed to provision node', { correlationId: req.id });
    next(error);
  }
});

nodesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    const node = await capabilityService.getNode(req.params.id, principal);
    res.json(successResponse(node, req));
  } catch (error: unknown) {
    next(error);
  }
});

nodesRouter.get('/:id/operations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    const operations = await capabilityService.listNodeOperations(
      req.params.id,
      req.query,
      principal,
    );
    res.json(successResponse(operations, req));
  } catch (error: unknown) {
    next(error);
  }
});

nodesRouter.get('/:id/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    const result = await capabilityService.getNodeMetrics(req.params.id, principal);
    res.json(successResponse(result, req));
  } catch (error: unknown) {
    next(error);
  }
});

nodesRouter.post('/:id/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    logger.info('Starting node', { nodeId: req.params.id, userId: principal.id });
    const result = await capabilityService.startNode(req.params.id, principal);
    res.json(successResponse(result, req));
  } catch (error: unknown) {
    next(error);
  }
});

nodesRouter.post('/:id/stop', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    logger.info('Stopping node', { nodeId: req.params.id, userId: principal.id });
    const body: unknown = req.body;
    const result = await capabilityService.stopNode(req.params.id, body, principal);
    res.json(successResponse(result, req));
  } catch (error: unknown) {
    next(error);
  }
});

nodesRouter.post('/:id/terminate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    logger.info('Terminating node', { nodeId: req.params.id, userId: principal.id });
    const result = await capabilityService.terminateNode(req.params.id, principal);
    res.json(successResponse(result, req));
  } catch (error: unknown) {
    next(error);
  }
});

nodesRouter.post('/:id/attach-network', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await getPrincipal(req);
    logger.info('Attaching network', { nodeId: req.params.id, userId: principal.id });
    const body: unknown = req.body;
    const result = await capabilityService.attachNetwork(req.params.id, body, principal);
    res.json(successResponse(result, req));
  } catch (error: unknown) {
    next(error);
  }
});
