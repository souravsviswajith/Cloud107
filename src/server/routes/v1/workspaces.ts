import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, getDbUser } from '../../middleware/auth';
import { WorkspaceService } from '../../services/workspaceService';
import { successResponse, errorResponse } from '../../utils/response';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import { Workspace } from '../../types';

export const workspacesRouter = Router();
const workspaceService = new WorkspaceService();

// Apply auth middleware to all routes
workspacesRouter.use(requireAuth);

// Validation schema for creating a workspace
const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100),
});

workspacesRouter.get('/', async (req, res, next) => {
  try {
    const user = await getDbUser(req);
    logger.info('Fetching workspaces', { userId: user.id, correlationId: req.id });
    const workspaces = await workspaceService.listWorkspaces(user.id);
    res.json(successResponse(workspaces, req));
  } catch (error) {
    logger.error('Failed to list workspaces', { error, correlationId: req.id });
    next(error);
  }
});

workspacesRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await getDbUser(req);
    logger.info('Fetching workspace', {
      workspaceId: req.params.id,
      userId: user.id,
      correlationId: req.id,
    });
    const workspace = await workspaceService.getWorkspace(req.params.id, user.id);
    if (!workspace) {
      logger.warn('Workspace not found', {
        workspaceId: req.params.id,
        userId: user.id,
        correlationId: req.id,
      });
      res.status(404).json(errorResponse('Workspace not found', 404, req));
      return;
    }
    res.json(successResponse(workspace, req));
  } catch (error) {
    logger.error('Failed to get workspace', { error, correlationId: req.id });
    next(error);
  }
});

workspacesRouter.post('/', async (req, res, next) => {
  try {
    const parsed = createWorkspaceSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('Invalid workspace creation request', {
        errors: parsed.error.errors,
        correlationId: req.id,
      });
      res.status(400).json(errorResponse(parsed.error.errors[0].message, 400, req));
      return;
    }
    const user = await getDbUser(req);
    logger.info('Creating workspace', {
      name: parsed.data.name,
      userId: user.id,
      correlationId: req.id,
    });
    const workspace = await workspaceService.createWorkspace(parsed.data.name, user.id);
    res.status(201).json(successResponse(workspace, req));
  } catch (error) {
    logger.error('Failed to create workspace', { error, correlationId: req.id });
    next(error);
  }
});

const handleWorkspaceAction =
  (actionName: string, actionFn: (id: string, userId: number) => Promise<Workspace>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getDbUser(req);
      logger.info(`Executing action: ${actionName}`, {
        workspaceId: req.params.id,
        userId: user.id,
        correlationId: req.id,
      });
      const workspace = await actionFn(req.params.id, user.id);
      res.json(successResponse(workspace, req));
    } catch (error: unknown) {
      const msg = (error as Error).message;
      logger.error(`Action ${actionName} failed`, {
        error: msg,
        workspaceId: req.params.id,
        correlationId: req.id,
      });
      if (msg.includes('not found')) {
        res.status(404).json(errorResponse(msg, 404, req));
      } else {
        next(error);
      }
    }
  };

workspacesRouter.post(
  '/:id/start',
  handleWorkspaceAction('start', workspaceService.startWorkspace.bind(workspaceService)),
);
workspacesRouter.post(
  '/:id/stop',
  handleWorkspaceAction('stop', workspaceService.stopWorkspace.bind(workspaceService)),
);
workspacesRouter.post(
  '/:id/restart',
  handleWorkspaceAction('restart', workspaceService.restartWorkspace.bind(workspaceService)),
);
workspacesRouter.post(
  '/:id/suspend',
  handleWorkspaceAction('suspend', workspaceService.suspendWorkspace.bind(workspaceService)),
);
workspacesRouter.post(
  '/:id/connect',
  handleWorkspaceAction('connect', workspaceService.connectWorkspace.bind(workspaceService)),
);
workspacesRouter.post(
  '/:id/disconnect',
  handleWorkspaceAction('disconnect', workspaceService.disconnectWorkspace.bind(workspaceService)),
);

workspacesRouter.delete('/:id', async (req, res, next) => {
  try {
    const user = await getDbUser(req);
    logger.info('Deleting workspace', {
      workspaceId: req.params.id,
      userId: user.id,
      correlationId: req.id,
    });
    await workspaceService.deleteWorkspace(req.params.id, user.id);
    res.json(successResponse({ success: true }, req));
  } catch (error) {
    logger.error('Failed to delete workspace', { error, correlationId: req.id });
    next(error);
  }
});
