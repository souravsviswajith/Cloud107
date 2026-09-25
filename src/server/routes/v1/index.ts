import { Router } from 'express';
import { healthRouter } from './health';
import { usersRouter } from './users';
import { workspacesRouter } from './workspaces';
import { applicationsRouter } from './applications';
import billingRouter from './billing';

const router = Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);
router.use('/workspaces', workspacesRouter);
router.use('/applications', applicationsRouter);
router.use('/billing', billingRouter);

export default router;
