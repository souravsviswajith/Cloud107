import { db } from '../../db';
import { invocations } from '../../db/schema';
import { eq } from 'drizzle-orm';
import {
  createInvocationId,
  type CapabilityInvocation,
  type CapabilityInvocationStatus,
} from '../../core/invocation';

export class InvocationRepository {
  async create(
    capability: string,
    s1Id: string,
  ): Promise<CapabilityInvocation> {
    const invocationId = createInvocationId();
    const createdAt = new Date();

    await db.insert(invocations).values({
      id: invocationId,
      capability,
      status: 'accepted',
      s1Id,
      createdAt,
    });

    return {
      invocationId,
      capability,
      status: 'accepted',
      createdAt: createdAt.getTime(),
    };
  }

  async get(invocationId: string): Promise<CapabilityInvocation | null> {
    const records = await db
      .select()
      .from(invocations)
      .where(eq(invocations.id, invocationId))
      .limit(1);

    const record = records[0];
    if (!record) return null;

    return this.toInvocation(record);
  }

  async updatePlanId(invocationId: string, planId: string): Promise<void> {
    await db
      .update(invocations)
      .set({ planId })
      .where(eq(invocations.id, invocationId));
  }

  async updateStatus(
    invocationId: string,
    status: CapabilityInvocationStatus,
  ): Promise<void> {
    await db
      .update(invocations)
      .set({ status })
      .where(eq(invocations.id, invocationId));
  }

  async setResult(invocationId: string, result: unknown): Promise<void> {
    await db
      .update(invocations)
      .set({ result, error: null })
      .where(eq(invocations.id, invocationId));
  }

  async setError(invocationId: string, error: string): Promise<void> {
    await db
      .update(invocations)
      .set({ error })
      .where(eq(invocations.id, invocationId));
  }

  async markStarted(invocationId: string): Promise<void> {
    await db
      .update(invocations)
      .set({
        status: 'running',
        startedAt: new Date(),
      })
      .where(eq(invocations.id, invocationId));
  }

  async markCompleted(invocationId: string): Promise<void> {
    await db
      .update(invocations)
      .set({
        completedAt: new Date(),
      })
      .where(eq(invocations.id, invocationId));
  }

  private toInvocation(record: typeof invocations.$inferSelect): CapabilityInvocation {
    return {
      invocationId: record.id,
      capability: record.capability,
      status: record.status as CapabilityInvocationStatus,
      ...(record.result !== null ? { result: record.result } : {}),
      ...(record.error !== null ? { error: record.error } : {}),
      createdAt: record.createdAt.getTime(),
      ...(record.startedAt
        ? { startedAt: record.startedAt.getTime() }
        : {}),
      ...(record.completedAt
        ? { completedAt: record.completedAt.getTime() }
        : {}),
    };
  }
}
