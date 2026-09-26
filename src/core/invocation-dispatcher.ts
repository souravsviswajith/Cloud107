import type { CapabilityInvocation } from './invocation';
import type { InvocationLifecycle } from './invocation-lifecycle';
import type { WorkloadRepresentation } from './workload';
import type { ExecutionPlan } from './execution-plan';
import type { InvocationStateRepository } from './invocation-lifecycle';
import type { StoredProcessExecution } from '../server/repositories/executionStateRepository';

export interface Cloud107Client {
  scheduleAndPlan(workloadId: string): Promise<{ plan: ExecutionPlan }>;
  getExecutions(workloadId: string): Promise<StoredProcessExecution[]>;
}

export interface CapabilityInvocationDispatcher {
  submit(
    invocation: CapabilityInvocation,
    s1: WorkloadRepresentation,
  ): Promise<void>;
  completeInvocation(
    invocationId: string,
    s4: StoredProcessExecution,
  ): Promise<void>;
  failInvocation(invocationId: string, error: string): Promise<void>;
}

export class HttpCloud107Client implements Cloud107Client {
  constructor(private readonly baseUrl: string) {}

  async scheduleAndPlan(workloadId: string): Promise<{ plan: ExecutionPlan }> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/execution/schedule-and-plan`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workloadId }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Cloud107 scheduling failed: ${response.status}${body ? ` ${body}` : ''}`,
      );
    }

    return (await response.json()) as { plan: ExecutionPlan };
  }

  async getExecutions(workloadId: string): Promise<StoredProcessExecution[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/workloads/${encodeURIComponent(workloadId)}/executions`,
    );

    if (!response.ok) {
      throw new Error(
        `Cloud107 execution lookup failed: ${response.status}`,
      );
    }

    const body = (await response.json()) as
      | { executions: StoredProcessExecution[] }
      | { data: { executions: StoredProcessExecution[] } };

    return 'executions' in body
      ? body.executions
      : body.data.executions;
  }
}

export class Cloud107InvocationDispatcher
  implements CapabilityInvocationDispatcher
{
  private readonly pollIntervalMs: number;
  private readonly pollTimeoutMs: number;

  constructor(
    private readonly invocationRepository: InvocationStateRepository,
    private readonly invocationLifecycle: InvocationLifecycle<StoredProcessExecution>,
    private readonly cloud107Client: Cloud107Client,
    options: { pollIntervalMs?: number; pollTimeoutMs?: number } = {},
  ) {
    this.pollIntervalMs = options.pollIntervalMs ?? 1000;
    this.pollTimeoutMs = options.pollTimeoutMs ?? 30000;
  }

  async submit(
    invocation: CapabilityInvocation,
    s1: WorkloadRepresentation,
  ): Promise<void> {
    try {
      await this.invocationLifecycle.markPending(invocation.invocationId);

      const { plan } = await this.cloud107Client.scheduleAndPlan(
        s1.identity.id,
      );

      if (!plan.executable) {
        throw new Error(
          plan.reasonNotExecutable ?? 'Cloud107 execution plan is not executable',
        );
      }

      if (this.invocationRepository.updatePlanId) {
        await this.invocationRepository.updatePlanId(
          invocation.invocationId,
          plan.planId,
        );
      }

      void this.observeExecution(invocation.invocationId, s1.identity.id);
    } catch (error) {
      await this.failInvocation(
        invocation.invocationId,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async completeInvocation(
    invocationId: string,
    s4: StoredProcessExecution,
  ): Promise<void> {
    await this.invocationLifecycle.complete(invocationId, s4);
  }

  async failInvocation(invocationId: string, error: string): Promise<void> {
    await this.invocationLifecycle.fail(invocationId, error);
  }

  private async observeExecution(
    invocationId: string,
    workloadId: string,
  ): Promise<void> {
    const deadline = Date.now() + this.pollTimeoutMs;

    while (Date.now() < deadline) {
      try {
        const executions = await this.cloud107Client.getExecutions(workloadId);

        if (executions.length > 0) {
          const execution = executions[executions.length - 1];

          await this.invocationLifecycle.markRunning(invocationId);

          if (execution.exitCode === 0) {
            await this.completeInvocation(invocationId, execution);
          } else {
            await this.failInvocation(
              invocationId,
              execution.stderr || `Process exited with code ${execution.exitCode}`,
            );
          }
          return;
        }
      } catch (error) {
        await this.failInvocation(
          invocationId,
          error instanceof Error ? error.message : String(error),
        );
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }

    await this.failInvocation(
      invocationId,
      `Execution observation timed out after ${this.pollTimeoutMs}ms`,
    );
  }
}
