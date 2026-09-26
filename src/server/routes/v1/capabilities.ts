import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { CapabilityInvoker, type CapabilityRequest } from '../../../core/capability-invocation';
import { InMemoryCapabilityRegistry, type CapabilityRegistry } from '../../../core/capability-registry';
import { Cloud107InvocationDispatcher, HttpCloud107Client } from '../../../core/invocation-dispatcher';
import { InvocationLifecycle, type InvocationResultAdapter } from '../../../core/invocation-lifecycle';
import type { StoredProcessExecution } from '../../repositories/executionStateRepository';
import { InvocationRepository } from '../../repositories/invocationRepository';
import { WorkloadStateRepository } from '../../repositories/workloadStateRepository';
import { successResponse, errorResponse } from '../../utils/response';

const invocationRequestSchema = z.object({
  arguments: z.record(z.string(), z.unknown()).optional(),
  environment: z.record(z.string(), z.string()).optional(),
  resourceOverrides: z
    .object({
      memory: z.number().positive().optional(),
      cpuCores: z.number().positive().optional(),
    })
    .optional(),
}).strict();

export interface CapabilityRoutesDependencies {
  registry: CapabilityRegistry;
  dispatcher: Cloud107InvocationDispatcher;
  workloads: WorkloadStateRepository;
  invocations: InvocationRepository;
}

export function createCapabilitiesRouter(
  dependencies?: Partial<CapabilityRoutesDependencies>,
): Router {
  const invocations = dependencies?.invocations ?? new InvocationRepository();
  const workloads = dependencies?.workloads ?? new WorkloadStateRepository();
  const registry = dependencies?.registry ?? new InMemoryCapabilityRegistry();

  const resultAdapter: InvocationResultAdapter<StoredProcessExecution> = {
    adapt: (execution) => ({
      exitCode: execution.exitCode,
      output: execution.stdout,
    }),
  };

  const lifecycle = new InvocationLifecycle(invocations, resultAdapter);
  const dispatcher =
    dependencies?.dispatcher ??
    new Cloud107InvocationDispatcher(
      invocations,
      lifecycle,
      new HttpCloud107Client(
        process.env.CLOUD107_BASE_URL ?? 'http://localhost:3000',
      ),
    );

  const invoker = new CapabilityInvoker(registry);
  const router = Router();

  router.post(
    '/:capability/invoke',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = invocationRequestSchema.parse(req.body ?? {});
        const capabilityRequest: CapabilityRequest = {
          capability: req.params.capability,
          arguments: parsed.arguments,
          environment: parsed.environment,
          resourceOverrides: parsed.resourceOverrides,
        };

        const s1 = invoker.invoke(capabilityRequest);
        await workloads.create(s1);

        const invocation = await lifecycle.accept(
          capabilityRequest.capability,
          s1.identity.id,
        );

        void dispatcher.submit(invocation, s1).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error(
            `Invocation dispatch failed for ${invocation.invocationId}: ${message}`,
          );
        });

        return res.status(202).json(successResponse(invocation, req));
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json(errorResponse('Invalid invocation request', 400, req, error.issues));
        }

        if (error instanceof Error && error.message.startsWith('Capability not found:')) {
          return res
            .status(404)
            .json(errorResponse(error.message, 404, req));
        }

        return next(error);
      }
    },
  );

  router.get(
    '/:invocationId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const invocation = await invocations.get(req.params.invocationId);

        if (!invocation) {
          return res
            .status(404)
            .json(errorResponse('Invocation not found', 404, req));
        }

        return res.json(successResponse(invocation, req));
      } catch (error) {
        return next(error);
      }
    },
  );

  return router;
}

export const capabilitiesRouter = createCapabilitiesRouter();
