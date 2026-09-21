import { db } from '../../db';
import { operations } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  NodeOperation,
  OperationStatus,
  OperationType,
  OPERATION_STATUSES,
  OPERATION_TYPES,
} from '../../types';

export interface CreateOperationInput {
  id: string;
  nodeId: string | null;
  userId: number;
  type: OperationType;
  status: OperationStatus;
  payload?: Record<string, unknown> | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOperationStatus(value: unknown): value is OperationStatus {
  return typeof value === 'string' && (OPERATION_STATUSES as readonly string[]).includes(value);
}

function isOperationType(value: unknown): value is OperationType {
  return typeof value === 'string' && (OPERATION_TYPES as readonly string[]).includes(value);
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  throw new Error('Invalid timestamp value in operation record');
}

function toNullableIsoString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return toIsoString(value);
}

function toNullableJsonObject(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid JSON value in operation record');
  }
  return { ...value };
}

/**
 * PostgreSQL-backed repository for the asynchronous operation ledger.
 *
 * Lifecycle transitions are enforced mechanically at the SQL layer via
 * conditional updates:
 *   - `markRunning` only transitions `pending -> running`
 *   - `complete` / `fail` only transition `running -> completed | failed`
 * A `null` return means the transition was invalid (already moved on).
 */
export class OperationRepository {
  async create(input: CreateOperationInput): Promise<NodeOperation> {
    const result = await db
      .insert(operations)
      .values({
        id: input.id,
        nodeId: input.nodeId,
        userId: input.userId,
        type: input.type,
        status: input.status,
        payload: input.payload ?? null,
      })
      .returning();
    return this.mapOperation(result[0] as unknown);
  }

  async findById(id: string): Promise<NodeOperation | null> {
    const result = await db.select().from(operations).where(eq(operations.id, id)).limit(1);
    return result.length > 0 ? this.mapOperation(result[0] as unknown) : null;
  }

  async findByIdAndUserId(id: string, userId: number): Promise<NodeOperation | null> {
    const result = await db
      .select()
      .from(operations)
      .where(and(eq(operations.id, id), eq(operations.userId, userId)))
      .limit(1);
    return result.length > 0 ? this.mapOperation(result[0] as unknown) : null;
  }

  async findByUserId(userId: number, limit = 50, offset = 0): Promise<NodeOperation[]> {
    const results = await db
      .select()
      .from(operations)
      .where(eq(operations.userId, userId))
      .orderBy(desc(operations.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((row: unknown) => this.mapOperation(row));
  }

  async findAll(limit = 50, offset = 0): Promise<NodeOperation[]> {
    const results = await db
      .select()
      .from(operations)
      .orderBy(desc(operations.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((row: unknown) => this.mapOperation(row));
  }

  async findByNodeIdAndUserId(
    nodeId: string,
    userId: number,
    limit = 50,
    offset = 0,
  ): Promise<NodeOperation[]> {
    const results = await db
      .select()
      .from(operations)
      .where(and(eq(operations.nodeId, nodeId), eq(operations.userId, userId)))
      .orderBy(desc(operations.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((row: unknown) => this.mapOperation(row));
  }

  async findByNodeId(nodeId: string, limit = 50, offset = 0): Promise<NodeOperation[]> {
    const results = await db
      .select()
      .from(operations)
      .where(eq(operations.nodeId, nodeId))
      .orderBy(desc(operations.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((row: unknown) => this.mapOperation(row));
  }

  /**
   * Transitions `pending -> running`. Returns `null` when the operation is
   * no longer pending (concurrent worker or duplicate dispatch).
   */
  async markRunning(id: string): Promise<NodeOperation | null> {
    const result = await db
      .update(operations)
      .set({ status: 'running', updatedAt: new Date() })
      .where(and(eq(operations.id, id), eq(operations.status, 'pending')))
      .returning();
    return result.length > 0 ? this.mapOperation(result[0] as unknown) : null;
  }

  /**
   * Transitions `running -> completed` and records the provider outcome.
   */
  async complete(
    id: string,
    resultPayload: Record<string, unknown>,
  ): Promise<NodeOperation | null> {
    const now = new Date();
    const result = await db
      .update(operations)
      .set({
        status: 'completed',
        result: resultPayload,
        error: null,
        completedAt: now,
        updatedAt: now,
      })
      .where(and(eq(operations.id, id), eq(operations.status, 'running')))
      .returning();
    return result.length > 0 ? this.mapOperation(result[0] as unknown) : null;
  }

  /**
   * Transitions `running -> failed` and records the failure message.
   */
  async fail(id: string, errorMessage: string): Promise<NodeOperation | null> {
    const now = new Date();
    const result = await db
      .update(operations)
      .set({
        status: 'failed',
        error: errorMessage,
        completedAt: now,
        updatedAt: now,
      })
      .where(and(eq(operations.id, id), eq(operations.status, 'running')))
      .returning();
    return result.length > 0 ? this.mapOperation(result[0] as unknown) : null;
  }

  private mapOperation(record: unknown): NodeOperation {
    if (!isRecord(record)) {
      throw new Error('Invalid operation record: expected an object');
    }
    const status: unknown = record.status;
    const type: unknown = record.type;
    if (!isOperationStatus(status)) {
      throw new Error('Invalid operation record: unknown status');
    }
    if (!isOperationType(type)) {
      throw new Error('Invalid operation record: unknown type');
    }
    if (typeof record.id !== 'string' || typeof record.userId !== 'number') {
      throw new Error('Invalid operation record: missing required fields');
    }
    const nodeId: unknown = record.nodeId;
    if (nodeId !== null && nodeId !== undefined && typeof nodeId !== 'string') {
      throw new Error('Invalid operation record: nodeId must be a string or null');
    }
    const error: unknown = record.error;
    if (error !== null && error !== undefined && typeof error !== 'string') {
      throw new Error('Invalid operation record: error must be a string or null');
    }
    return {
      id: record.id,
      nodeId: (nodeId as string | null | undefined) ?? null,
      userId: record.userId,
      type,
      status,
      payload: toNullableJsonObject(record.payload),
      result: toNullableJsonObject(record.result),
      error: (error as string | null | undefined) ?? null,
      createdAt: toIsoString(record.createdAt),
      updatedAt: toIsoString(record.updatedAt),
      completedAt: toNullableIsoString(record.completedAt),
    };
  }
}
