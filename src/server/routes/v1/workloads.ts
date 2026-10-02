import { Router, Request, Response, NextFunction } from 'express';
import { WorkloadService } from '../../services/workloadService';
import { NodeService } from '../../services/nodeService';
import { ProviderResolver } from '../../providers/providerResolver';
import { parseWorkload } from '../../../core/validation';
import { WorkloadStateRepository } from '../../repositories/workloadStateRepository';
import { ExecutionStateRepository } from '../../repositories/executionStateRepository';
import { successResponse, errorResponse } from '../../utils/response';

export const workloadsRouter = Router();

const providerResolver = new ProviderResolver();
const nodeService = new NodeService(providerResolver);
const workloadService = new WorkloadService(nodeService, providerResolver);
const workloadStateRepository = new WorkloadStateRepository();
const executionStateRepository = new ExecutionStateRepository();


workloadsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workload = parseWorkload(req.body?.workload);
    const stored = await workloadStateRepository.create(workload);
    res.status(201).json(successResponse(stored, req));
  } catch (error: unknown) {
    const msg = (error as Error).message;
    if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
      return res.status(409).json(errorResponse('Workload already exists', 409, req));
    }
    next(error);
  }
});

workloadsRouter.get('/:id/executions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workload = await workloadStateRepository.findById(req.params.id);
    if (!workload) {
      return res.status(404).json(errorResponse(`Workload ${req.params.id} not found`, 404, req));
    }

    const executions = await executionStateRepository.findByWorkloadId(req.params.id);
    res.json(successResponse({ workload, executions }, req));
  } catch (error) {
    next(error);
  }
});

workloadsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workload = await workloadStateRepository.findById(req.params.id);
    if (!workload) {
      return res.status(404).json(errorResponse(`Workload ${req.params.id} not found`, 404, req));
    }
    res.json(successResponse(workload, req));
  } catch (error) {
    next(error);
  }
});

workloadsRouter.post('/deploy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nodeId, urn, filePath } = req.body;
    if (!nodeId || !urn || !filePath) {
      return res.status(400).json(errorResponse('Missing required fields: nodeId, urn, filePath', 400, req));
    }
    const workload = await workloadService.deployWorkload(nodeId, urn, filePath);
    res.status(202).json(successResponse(workload, req));
  } catch (error: unknown) {
    const msg = (error as Error).message;
    if (msg.includes('not found')) {
      return res.status(404).json(errorResponse(msg, 404, req));
    }
    next(error);
  }
});

workloadsRouter.get('/:nodeId/:workloadId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workload = await workloadService.inspectWorkload(req.params.nodeId, req.params.workloadId);
    res.json(successResponse(workload, req));
  } catch (error: unknown) {
    const msg = (error as Error).message;
    if (msg.includes('not found')) {
      return res.status(404).json(errorResponse(msg, 404, req));
    }
    next(error);
  }
});

workloadsRouter.get('/:nodeId/:workloadId/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lines = req.query.lines ? parseInt(req.query.lines as string, 10) : 100;
    const logs = await workloadService.getWorkloadLogs(req.params.nodeId, req.params.workloadId, lines);
    res.json(successResponse({ logs }, req));
  } catch (error: unknown) {
    const msg = (error as Error).message;
    if (msg.includes('not found')) {
      return res.status(404).json(errorResponse(msg, 404, req));
    }
    next(error);
  }
});