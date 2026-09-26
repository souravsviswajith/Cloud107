import express from 'express';
import { createServer, type Server } from 'node:http';
import {
  createCapabilitiesRouter,
  createInvocationsRouter,
} from '../../src/server/routes/v1/capabilities';
import {
  Cloud107InvocationDispatcher,
  type Cloud107Client,
} from '../../src/core/invocation-dispatcher';
import {
  InvocationLifecycle,
  type InvocationResultAdapter,
} from '../../src/core/invocation-lifecycle';
import {
  createInvocationId,
  type CapabilityInvocation,
} from '../../src/core/invocation';
import { InMemoryCapabilityRegistry } from '../../src/core/capability-registry';
import type { ExecutionPlan } from '../../src/core/execution-plan';
import type { WorkloadRepresentation } from '../../src/core/workload';
import type { StoredProcessExecution } from '../../src/server/repositories/executionStateRepository';
import { InvocationRepository } from '../../src/server/repositories/invocationRepository';
import { WorkloadStateRepository } from '../../src/server/repositories/workloadStateRepository';

class InMemoryInvocationRepository extends InvocationRepository {
  private readonly records = new Map<string, CapabilityInvocation>();
  private readonly s1Ids = new Map<string, string>();
  private readonly planIds = new Map<string, string>();

  override async create(
    capability: string,
    s1Id: string,
  ): Promise<CapabilityInvocation> {
    const invocation: CapabilityInvocation = {
      invocationId: createInvocationId(),
      capability,
      status: 'accepted',
      createdAt: Date.now(),
    };

    this.records.set(invocation.invocationId, invocation);
    this.s1Ids.set(invocation.invocationId, s1Id);
    return { ...invocation };
  }

  override async get(
    invocationId: string,
  ): Promise<CapabilityInvocation | null> {
    const invocation = this.records.get(invocationId);
    return invocation ? { ...invocation } : null;
  }

  override async updateStatus(
    invocationId: string,
    status: CapabilityInvocation['status'],
  ): Promise<void> {
    const invocation = this.require(invocationId);
    invocation.status = status;
  }

  override async setResult(invocationId: string, result: unknown): Promise<void> {
    const invocation = this.require(invocationId);
    invocation.result = result;
    delete invocation.error;
  }

  override async setError(invocationId: string, error: string): Promise<void> {
    const invocation = this.require(invocationId);
    invocation.error = error;
  }

  override async markStarted(invocationId: string): Promise<void> {
    const invocation = this.require(invocationId);
    invocation.startedAt = Date.now();
    invocation.status = 'running';
  }

  override async markCompleted(invocationId: string): Promise<void> {
    const invocation = this.require(invocationId);
    invocation.completedAt = Date.now();
  }

  override async updatePlanId(
    invocationId: string,
    planId: string,
  ): Promise<void> {
    this.planIds.set(invocationId, planId);
  }

  private require(invocationId: string): CapabilityInvocation {
    const invocation = this.records.get(invocationId);
    if (!invocation) {
      throw new Error(`Invocation not found: ${invocationId}`);
    }
    return invocation;
  }
}

class InMemoryWorkloadStateRepository extends WorkloadStateRepository {
  readonly workloads = new Map<string, WorkloadRepresentation>();

  override async create(
    workload: WorkloadRepresentation,
  ): Promise<WorkloadRepresentation> {
    this.workloads.set(workload.identity.id, workload);
    return workload;
  }

  override async findById(
    id: string,
  ): Promise<WorkloadRepresentation | null> {
    return this.workloads.get(id) ?? null;
  }
}

class MockCloud107Client implements Cloud107Client {
  scheduleAndPlanWasCalled = false;
  scheduledWorkloadId: string | undefined;
  private s4: StoredProcessExecution | undefined;

  async scheduleAndPlan(
    workloadId: string,
  ): Promise<{ plan: ExecutionPlan }> {
    this.scheduleAndPlanWasCalled = true;
    this.scheduledWorkloadId = workloadId;

    return {
      plan: {
        workloadId,
        nodeId: 'test-node',
        resolved: {
          dependencies: [],
          capabilities: {
            required: [],
            available: [],
            satisfied: true,
          },
          resources: {
            memoryAvailable: 8_000_000_000,
            memoryRequired: 0,
            coresAvailable: 8,
            coresRequired: 0,
            satisfied: true,
          },
        },
        authorization: {
          authorized: true,
        },
        executable: true,
        planId: 'plan-test-001',
        createdAt: Date.now(),
      },
    };
  }

  async getExecutions(
    _workloadId: string,
  ): Promise<StoredProcessExecution[]> {
    return this.s4 ? [this.s4] : [];
  }

  completeWithS4(s4: StoredProcessExecution): void {
    this.s4 = s4;
  }
}

const registry = new InMemoryCapabilityRegistry([
  {
    capability: 'Display/GameRuntime',
    artifactId: 'game-dwy',
    version: '1.0.0',
    hash: `sha256:${'a'.repeat(64)}`,
    entrypoint: '/opt/game-dwy/bin/game',
    constraints: [{ os: 'unix', architectures: ['x86_64'] }],
    metadata: {
      internalProject: 'Game/DWY',
      description: 'Interactive game runtime',
    },
  },
]);

const resultAdapter: InvocationResultAdapter<StoredProcessExecution> = {
  adapt: (execution) => ({
    exitCode: execution.exitCode,
    output: execution.stdout,
  }),
};

async function startTestServer(
  cloud107: MockCloud107Client,
  invocations: InMemoryInvocationRepository,
  workloads: InMemoryWorkloadStateRepository,
): Promise<{ server: Server; baseUrl: string }> {
  const lifecycle = new InvocationLifecycle(invocations, resultAdapter);
  const dispatcher = new Cloud107InvocationDispatcher(
    invocations,
    lifecycle,
    cloud107,
    {
      pollIntervalMs: 5,
      pollTimeoutMs: 1_000,
    },
  );

  const app = express();
  app.use(express.json());
  app.use(
    '/api/v1/107/capabilities',
    createCapabilitiesRouter({
      registry,
      dispatcher,
      workloads,
      invocations,
    }),
  );
  app.use(
    '/api/v1/107/invocations',
    createInvocationsRouter(invocations),
  );

  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Test server did not expose an address');
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

async function waitForCompletedInvocation(
  baseUrl: string,
  invocationId: string,
): Promise<CapabilityInvocation> {
  const deadline = Date.now() + 1_000;

  while (Date.now() < deadline) {
    const response = await fetch(
      `${baseUrl}/api/v1/107/invocations/${invocationId}`,
    );

    if (!response.ok) {
      throw new Error(`Invocation lookup failed: ${response.status}`);
    }

    const body = (await response.json()) as {
      data: CapabilityInvocation;
    };

    if (
      body.data.status === 'completed' ||
      body.data.status === 'failed'
    ) {
      return body.data;
    }

    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  throw new Error('Timed out waiting for invocation completion');
}

describe('107 Product: Invocation Flow (Integrated)', () => {
  it('invokes a capability and observes the result through the product API', async () => {
    const mockCloud107 = new MockCloud107Client();
    const invocationRepo = new InMemoryInvocationRepository();
    const workloadRepo = new InMemoryWorkloadStateRepository();
    const { server, baseUrl } = await startTestServer(
      mockCloud107,
      invocationRepo,
      workloadRepo,
    );

    try {
      const response = await fetch(
        `${baseUrl}/api/v1/107/capabilities/Display%2FGameRuntime/invoke`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            arguments: {
              maxPlayers: 8,
              mode: 'lan',
            },
          }),
        },
      );

      expect(response.status).toBe(202);

      const accepted = (await response.json()) as {
        success: boolean;
        data: CapabilityInvocation;
      };

      expect(accepted.success).toBe(true);
      expect(accepted.data.status).toBe('accepted');

      const invocationId = accepted.data.invocationId;
      const persistedS1 = workloadRepo.workloads.get(
        mockCloud107.scheduledWorkloadId ?? '',
      );

      expect(persistedS1).toBeDefined();
      expect(persistedS1?.operation.arguments).toEqual([
        '--max-players',
        '8',
        '--mode',
        'lan',
      ]);

      expect(mockCloud107.scheduleAndPlanWasCalled).toBe(true);
      expect(mockCloud107.scheduledWorkloadId).toBe(
        persistedS1?.identity.id,
      );

      const s4: StoredProcessExecution = {
        pid: 107,
        exitCode: 0,
        signal: null,
        stdout: 'success',
        stderr: '',
        duration: 12,
      };

      mockCloud107.completeWithS4(s4);

      const completed = await waitForCompletedInvocation(
        baseUrl,
        invocationId,
      );

      expect(completed.status).toBe('completed');
      expect(completed.result).toEqual(resultAdapter.adapt(s4));
      expect(completed).not.toHaveProperty('s1_id');
      expect(completed).not.toHaveProperty('plan_id');
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
