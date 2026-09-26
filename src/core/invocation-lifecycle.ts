import type {
  CapabilityInvocation,
  CapabilityInvocationStatus,
} from './invocation';

export interface InvocationStateRepository {
  create(capability: string, s1Id: string): Promise<CapabilityInvocation>;
  get(invocationId: string): Promise<CapabilityInvocation | null>;
  updateStatus(
    invocationId: string,
    status: CapabilityInvocationStatus,
  ): Promise<void>;
  setResult(invocationId: string, result: unknown): Promise<void>;
  setError(invocationId: string, error: string): Promise<void>;
  markStarted(invocationId: string): Promise<void>;
  markCompleted(invocationId: string): Promise<void>;
}

export interface InvocationResultAdapter<TExecution> {
  adapt(execution: TExecution): unknown;
}

export class InvocationLifecycle<TExecution> {
  constructor(
    private readonly repository: InvocationStateRepository,
    private readonly resultAdapter: InvocationResultAdapter<TExecution>,
  ) {}

  async accept(
    capability: string,
    s1Id: string,
  ): Promise<CapabilityInvocation> {
    return this.repository.create(capability, s1Id);
  }

  async markPending(invocationId: string): Promise<void> {
    await this.transition(invocationId, 'accepted', 'pending');
  }

  async markRunning(invocationId: string): Promise<void> {
    await this.transition(invocationId, 'pending', 'running');
    await this.repository.markStarted(invocationId);
  }

  async complete(invocationId: string, execution: TExecution): Promise<void> {
    await this.requireStatus(invocationId, 'running');
    await this.repository.setResult(
      invocationId,
      this.resultAdapter.adapt(execution),
    );
    await this.repository.markCompleted(invocationId);
    await this.repository.updateStatus(invocationId, 'completed');
  }

  async fail(invocationId: string, error: string): Promise<void> {
    const invocation = await this.requireInvocation(invocationId);

    if (invocation.status !== 'pending' && invocation.status !== 'running') {
      throw new Error(
        `Invalid invocation transition: ${invocation.status} → failed`,
      );
    }

    await this.repository.setError(invocationId, error);
    await this.repository.markCompleted(invocationId);
    await this.repository.updateStatus(invocationId, 'failed');
  }

  private async transition(
    invocationId: string,
    from: CapabilityInvocationStatus,
    to: CapabilityInvocationStatus,
  ): Promise<void> {
    await this.requireStatus(invocationId, from);
    await this.repository.updateStatus(invocationId, to);
  }

  private async requireStatus(
    invocationId: string,
    expected: CapabilityInvocationStatus,
  ): Promise<void> {
    const invocation = await this.requireInvocation(invocationId);

    if (invocation.status !== expected) {
      throw new Error(
        `Invalid invocation transition: ${invocation.status} → ${expected}`,
      );
    }
  }

  private async requireInvocation(
    invocationId: string,
  ): Promise<CapabilityInvocation> {
    const invocation = await this.repository.get(invocationId);

    if (!invocation) {
      throw new Error(`Invocation not found: ${invocationId}`);
    }

    return invocation;
  }
}
