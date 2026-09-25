import { db } from '../../db';
import { executionPlans, processExecutions } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { ExecutionPlan } from '../../core/execution-plan';

export interface StoredProcessExecution {
  pid: number;
  exitCode: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  duration: number;
}

export class ExecutionStateRepository {
  async createPlan(plan: ExecutionPlan): Promise<ExecutionPlan> {
    const record = await db
      .insert(executionPlans)
      .values({
        id: plan.planId,
        workloadId: plan.workloadId,
        s2: plan,
      })
      .returning({ s2: executionPlans.s2 });

    return record[0].s2 as ExecutionPlan;
  }

  async createProcessExecution(
    planId: string,
    result: StoredProcessExecution,
  ): Promise<StoredProcessExecution> {
    const record = await db
      .insert(processExecutions)
      .values({
        id: `exec_${crypto.randomUUID()}`,
        planId,
        s4: result,
        stdout: result.stdout,
        stderr: result.stderr,
      })
      .returning({ s4: processExecutions.s4 });

    return record[0].s4 as StoredProcessExecution;
  }

  async findByWorkloadId(workloadId: string): Promise<StoredProcessExecution[]> {
    const plans = await db
      .select({ id: executionPlans.id })
      .from(executionPlans)
      .where(eq(executionPlans.workloadId, workloadId));

    if (plans.length === 0) return [];

    const results: StoredProcessExecution[] = [];
    for (const plan of plans) {
      const executions = await db
        .select({ s4: processExecutions.s4 })
        .from(processExecutions)
        .where(eq(processExecutions.planId, plan.id));

      results.push(...executions.map((execution) => execution.s4 as StoredProcessExecution));
    }

    return results;
  }
}
