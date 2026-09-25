import { Router } from 'express';
import { parseWorkload } from '../../../core/validation';
import { planWorkload } from '../../../core/t2-client';
import { Scheduler } from '../../../core/scheduler';
import { InMemoryNodeRegistry, type NodeRegistry } from '../../../core/node-registry';
import { toPlannerNode } from '../../../core/node-capability-adapter';
import { WorkloadStateRepository } from '../../repositories/workloadStateRepository';
import { ExecutionStateRepository } from '../../repositories/executionStateRepository';

export interface SchedulingState {
  workloads: WorkloadStateRepository;
  executions: ExecutionStateRepository;
}

export function createSchedulingRouter(
  registry: NodeRegistry = new InMemoryNodeRegistry(),
  plannerEndpoint = process.env.C107_PLANNER_ENDPOINT ?? 'http://localhost:5107',
  state?: SchedulingState,
) {
  const router = Router();
  const scheduler = new Scheduler(registry);

  router.post('/schedule-and-plan', async (req, res, next) => {
    try {
      const workload = req.body?.workloadId
        ? await state?.workloads.findById(req.body.workloadId)
        : parseWorkload(req.body?.workload);

      if (!workload) {
        return res.status(404).json({
          error: `Workload ${req.body?.workloadId ?? 'unknown'} not found`,
        });
      }

      if (state && !req.body?.workloadId) {
        await state.workloads.create(workload);
      }

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

      if (state) {
        await state.executions.createPlan(plan);
      }

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

export const schedulingRouter = createSchedulingRouter(
  new InMemoryNodeRegistry(),
  process.env.C107_PLANNER_ENDPOINT ?? 'http://localhost:5107',
  {
    workloads: new WorkloadStateRepository(),
    executions: new ExecutionStateRepository(),
  },
);
