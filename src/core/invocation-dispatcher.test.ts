import {
  Cloud107InvocationDispatcher,
  type Cloud107Client,
} from './invocation-dispatcher';
import {
  InvocationLifecycle,
  type InvocationStateRepository,
} from './invocation-lifecycle';
import type { CapabilityInvocation } from './invocation';
import type { ExecutionPlan } from './execution-plan';
import type { WorkloadRepresentation } from './workload';
import type { StoredProcessExecution } from '../server/repositories/executionStateRepository';

class MemoryRepository implements InvocationStateRepository {
  private readonly records = new Map<string, CapabilityInvocation>();
  private planIds = new Map<string, string>();

  async create(capability: string): Promise<CapabilityInvocation> {
    const invocation = {
      invocationId: crypto.randomUUID(),
      capability,
      status: 'accepted' as const,
      createdAt: Date.now(),
    };
    this.records.set(invocation.invocationId, invocation);
    return invocation;
  }

  async get(id: string) {
    return this.records.get(id) ?? null;
  }

  async updateStatus(id: string, status: CapabilityInvocation['status']) {
    const invocation = this.records.get(id)!;
    this.records.set(id, { ...invocation, status });
  }

  async setResult(id: string, result: unknown) {
    const invocation = this.records.get(id)!;
    this.records.set(id, { ...invocation, result });
  }

  async setError(id: string, error: string) {
    const invocation = this.records.get(id)!;
    this.records.set(id, { ...invocation, error });
  }

  async markStarted(id: string) {
    const invocation = this.records.get(id)!;
    this.records.set(id, {
      ...invocation,
      status: 'running',
      startedAt: Date.now(),
    });
  }

  async markCompleted(id: string) {
    const invocation = this.records.get(id)!;
    this.records.set(id, { ...invocation, completedAt: Date.now() });
  }

  async updatePlanId(id: string, planId: string) {
    this.planIds.set(id, planId);
  }
}

const workload = {
  identity: {
    id: 'workload-1',
    name: 'Display/GameRuntime',
    version: '1.0.0',
    provenance: { source: 'test', hash: 'sha256:' + 'a'.repeat(64) },
  },
  operation: { entrypoint: '/opt/game' },
  resources: {},
  capabilities: {},
  constraints: [],
  dependencies: [],
} as WorkloadRepresentation;

const plan = {
  workloadId: 'workload-1',
  nodeId: 'node-1',
  resolved: {
    dependencies: [],
    capabilities: { required: [], available: [], satisfied: true },
    resources: {
      memoryAvailable: 1024,
      memoryRequired: 0,
      coresAvailable: 2,
      coresRequired: 0,
      satisfied: true,
    },
  },
  authorization: { authorized: true },
  executable: true,
  planId: 'plan-1',
  createdAt: Date.now(),
} as ExecutionPlan;

const execution: StoredProcessExecution = {
  pid: 107,
  exitCode: 0,
  signal: null,
  stdout: 'ok',
  stderr: '',
  duration: 10,
};

describe('Cloud107InvocationDispatcher', () => {
  it('keeps an accepted invocation pending until S4 is observable', async () => {
    const repository = new MemoryRepository();
    const lifecycle = new InvocationLifecycle(repository, {
      adapt: (s4: StoredProcessExecution) => ({
        output: s4.stdout,
        exitCode: s4.exitCode,
      }),
    });

    let executions: StoredProcessExecution[] = [];
    const client: Cloud107Client = {
      scheduleAndPlan: async () => ({ plan }),
      getExecutions: async () => executions,
    };

    const dispatcher = new Cloud107InvocationDispatcher(
      repository,
      lifecycle,
      client,
      { pollIntervalMs: 1, pollTimeoutMs: 50 },
    );

    const invocation = await lifecycle.accept(
      'Display/GameRuntime',
      workload.identity.id,
    );

    await dispatcher.submit(invocation, workload);

    expect((await repository.get(invocation.invocationId))?.status).toBe('pending');

    executions = [execution];
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(await repository.get(invocation.invocationId)).toMatchObject({
      status: 'completed',
      result: { output: 'ok', exitCode: 0 },
    });
  });

  it('fails when Cloud107 returns a non-executable plan', async () => {
    const repository = new MemoryRepository();
    const lifecycle = new InvocationLifecycle(repository, {
      adapt: (s4: StoredProcessExecution) => s4,
    });

    const client: Cloud107Client = {
      scheduleAndPlan: async () => ({
        plan: { ...plan, executable: false, reasonNotExecutable: 'No compatible node' },
      }),
      getExecutions: async () => [],
    };

    const dispatcher = new Cloud107InvocationDispatcher(
      repository,
      lifecycle,
      client,
      { pollIntervalMs: 1, pollTimeoutMs: 10 },
    );

    const invocation = await lifecycle.accept(
      'Display/GameRuntime',
      workload.identity.id,
    );

    await dispatcher.submit(invocation, workload);

    expect(await repository.get(invocation.invocationId)).toMatchObject({
      status: 'failed',
      error: 'No compatible node',
    });
  });
});
