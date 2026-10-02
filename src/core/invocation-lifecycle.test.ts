import {
  InvocationLifecycle,
  type InvocationStateRepository,
  type InvocationResultAdapter,
} from './invocation-lifecycle';
import type { CapabilityInvocation } from './invocation';

class MemoryInvocationRepository implements InvocationStateRepository {
  private readonly records = new Map<string, CapabilityInvocation>();
  private nextId = 1;

  async create(capability: string, s1Id: string): Promise<CapabilityInvocation> {
    const invocation: CapabilityInvocation = {
      invocationId: `inv-${this.nextId++}`,
      capability,
      status: 'accepted',
      createdAt: 1000,
    };
    this.records.set(invocation.invocationId, invocation);
    void s1Id;
    return invocation;
  }

  async get(invocationId: string): Promise<CapabilityInvocation | null> {
    return this.records.get(invocationId) ?? null;
  }

  async updateStatus(
    invocationId: string,
    status: CapabilityInvocation['status'],
  ): Promise<void> {
    const invocation = this.records.get(invocationId)!;
    this.records.set(invocationId, { ...invocation, status });
  }

  async setResult(invocationId: string, result: unknown): Promise<void> {
    const invocation = this.records.get(invocationId)!;
    this.records.set(invocationId, { ...invocation, result });
  }

  async setError(invocationId: string, error: string): Promise<void> {
    const invocation = this.records.get(invocationId)!;
    this.records.set(invocationId, { ...invocation, error });
  }

  async markStarted(invocationId: string): Promise<void> {
    const invocation = this.records.get(invocationId)!;
    this.records.set(invocationId, {
      ...invocation,
      status: 'running',
      startedAt: 2000,
    });
  }

  async markCompleted(invocationId: string): Promise<void> {
    const invocation = this.records.get(invocationId)!;
    this.records.set(invocationId, {
      ...invocation,
      completedAt: 3000,
    });
  }
}

const adapter: InvocationResultAdapter<{ exitCode: number }> = {
  adapt: (execution) => ({ success: execution.exitCode === 0 }),
};

describe('InvocationLifecycle', () => {
  it('moves an invocation through the accepted-to-completed lifecycle', async () => {
    const repository = new MemoryInvocationRepository();
    const lifecycle = new InvocationLifecycle(repository, adapter);

    const accepted = await lifecycle.accept('Display/GameRuntime', 'workload-1');
    expect(accepted.status).toBe('accepted');

    await lifecycle.markPending(accepted.invocationId);
    expect((await repository.get(accepted.invocationId))?.status).toBe('pending');

    await lifecycle.markRunning(accepted.invocationId);
    expect((await repository.get(accepted.invocationId))?.status).toBe('running');

    await lifecycle.complete(accepted.invocationId, { exitCode: 0 });

    expect(await repository.get(accepted.invocationId)).toMatchObject({
      status: 'completed',
      result: { success: true },
      startedAt: 2000,
      completedAt: 3000,
    });
  });

  it('rejects invalid lifecycle transitions', async () => {
    const repository = new MemoryInvocationRepository();
    const lifecycle = new InvocationLifecycle(repository, adapter);
    const accepted = await lifecycle.accept('Display/GameRuntime', 'workload-1');

    await expect(lifecycle.markRunning(accepted.invocationId)).rejects.toThrow(
      'Invalid invocation transition: accepted → pending',
    );
  });

  it('records a failed invocation without exposing execution internals', async () => {
    const repository = new MemoryInvocationRepository();
    const lifecycle = new InvocationLifecycle(repository, adapter);
    const accepted = await lifecycle.accept('Display/GameRuntime', 'workload-1');

    await lifecycle.markPending(accepted.invocationId);
    await lifecycle.fail(accepted.invocationId, 'Execution failed');

    expect(await repository.get(accepted.invocationId)).toMatchObject({
      status: 'failed',
      error: 'Execution failed',
      completedAt: 3000,
    });
  });
});
