import { Router } from 'express';
import { healthRouter } from './health';
import { usersRouter } from './users';
import { workspacesRouter } from './workspaces';
import { applicationsRouter } from './applications';
import { nodesRouter } from './nodes';
import { workloadsRouter } from './workloads';
import { schedulingRouter } from './scheduling';
import { capabilitiesRouter, invocationsRouter } from './capabilities';

const router = Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);
router.use('/workspaces', workspacesRouter);
router.use('/applications', applicationsRouter);
router.use('/nodes', nodesRouter);
router.use('/workloads', workloadsRouter);
router.use('/execution', schedulingRouter);
router.use('/107/capabilities', capabilitiesRouter);
router.use('/107/invocations', invocationsRouter);

export default router;
