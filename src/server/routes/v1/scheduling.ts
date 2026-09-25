import { Router } from 'express';
import { parseWorkload } from '../../../core/validation';
import { planWorkload } from '../../../core/t2-client';
import { Scheduler } from '../../../core/scheduler';
import { InMemoryNodeRegistry, type NodeRegistry } from '../../../core/node-registry';
import { toPlannerNode } from '../../../core/node-capability-adapter';

export function createSchedulingRouter(
  registry: NodeRegistry = new InMemoryNodeRegistry(),
  plannerEndpoint = process.env.C107_PLANNER_ENDPOINT ?? 'http://localhost:5107',
) {
  const router = Router();
  const scheduler = new Scheduler(registry);

  router.post('/schedule-and-plan', async (req, res, next) => {
    try {
      const workload = parseWorkload(req.body?.workload);
      const result = scheduler.schedule(workload);

      if (!result.selected) {
        return res.status(409).json({
          error: 'No compatible node found',
          candidates: result.candidates,
        });
      }

      const plan = await planWorkload(
        workload,
        toPlannerNode(result.selected),
        plannerEndpoint,
      );

      return res.json({
        scheduled: result.selected,
        plan,
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

export const schedulingRouter = createSchedulingRouter();
