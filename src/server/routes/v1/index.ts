import { Router } from 'express';
import { healthRouter } from './health';
import { usersRouter } from './users';
import { workspacesRouter } from './workspaces';
import { applicationsRouter } from './applications';
import { nodesRouter } from './nodes';
import { operationsRouter } from './operations';
import { capabilitiesRouter } from './capabilities';

const router = Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);
router.use('/workspaces', workspacesRouter);
router.use('/applications', applicationsRouter);
router.use('/nodes', nodesRouter);
router.use('/operations', operationsRouter);
router.use('/capabilities', capabilitiesRouter);

export default router;
