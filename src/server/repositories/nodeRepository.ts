import { db } from '../../db';
import { nodes } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ComputeNode, NodeState } from '../../types';

export interface CreateNodeInput {
  id: string;
  name: string;
  providerId: string;
  state: NodeState;
  userId: number;
  vcpuCount: number;
  memoryBytes: number;
  diskSizeBytes: number;
  primaryIpAddress?: string | null;
  metadata?: Record<string, string>;
  startedAt?: Date | null;
}

export interface UpdateNodeInput {
  name?: string;
  state?: NodeState;
  primaryIpAddress?: string | null;
  metadata?: Record<string, string>;
  startedAt?: Date | null;
}

const NODE_STATES: readonly string[] = Object.values(NodeState);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNodeState(value: unknown): value is NodeState {
  return typeof value === 'string' && (NODE_STATES as readonly string[]).includes(value);
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  throw new Error('Invalid timestamp value in node record');
}

function toNullableIsoString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return toIsoString(value);
}

function toStringMetadata(value: unknown): Record<string, string> {
  if (value === null || value === undefined) {
    return {};
  }
  if (!isRecord(value)) {
    throw new Error('Invalid metadata value in node record');
  }
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string') {
      result[key] = entry;
    } else if (typeof entry === 'number' || typeof entry === 'boolean') {
      result[key] = String(entry);
    }
  }
  return result;
}

/**
 * PostgreSQL-backed repository for compute node state.
 * All row mapping goes through `unknown` narrowing — no `any` anywhere.
 */
export class NodeRepository {
  async findAll(limit = 100, offset = 0): Promise<ComputeNode[]> {
    const results = await db
      .select()
      .from(nodes)
      .orderBy(desc(nodes.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((row: unknown) => this.mapNode(row));
  }

  async findAllByUserId(userId: number, limit = 100, offset = 0): Promise<ComputeNode[]> {
    const results = await db
      .select()
      .from(nodes)
      .where(eq(nodes.userId, userId))
      .orderBy(desc(nodes.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((row: unknown) => this.mapNode(row));
  }

  async findAllByState(state: NodeState, limit = 100, offset = 0): Promise<ComputeNode[]> {
    const results = await db
      .select()
      .from(nodes)
      .where(eq(nodes.state, state))
      .orderBy(desc(nodes.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((row: unknown) => this.mapNode(row));
  }

  async findByUserIdAndState(
    userId: number,
    state: NodeState,
    limit = 100,
    offset = 0,
  ): Promise<ComputeNode[]> {
    const results = await db
      .select()
      .from(nodes)
      .where(and(eq(nodes.userId, userId), eq(nodes.state, state)))
      .orderBy(desc(nodes.createdAt))
      .limit(limit)
      .offset(offset);
    return results.map((row: unknown) => this.mapNode(row));
  }

  async findById(id: string): Promise<ComputeNode | null> {
    const result = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1);
    return result.length > 0 ? this.mapNode(result[0] as unknown) : null;
  }

  async findByIdAndUserId(id: string, userId: number): Promise<ComputeNode | null> {
    const result = await db
      .select()
      .from(nodes)
      .where(and(eq(nodes.id, id), eq(nodes.userId, userId)))
      .limit(1);
    return result.length > 0 ? this.mapNode(result[0] as unknown) : null;
  }

  async create(input: CreateNodeInput): Promise<ComputeNode> {
    const result = await db
      .insert(nodes)
      .values({
        id: input.id,
        name: input.name,
        providerId: input.providerId,
        state: input.state,
        userId: input.userId,
        vcpuCount: input.vcpuCount,
        memoryBytes: input.memoryBytes,
        diskSizeBytes: input.diskSizeBytes,
        primaryIpAddress: input.primaryIpAddress ?? null,
        metadata: input.metadata ?? {},
        startedAt: input.startedAt ?? null,
      })
      .returning();
    return this.mapNode(result[0] as unknown);
  }

  async update(id: string, userId: number, input: UpdateNodeInput): Promise<ComputeNode | null> {
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) {
      patch.name = input.name;
    }
    if (input.state !== undefined) {
      patch.state = input.state;
    }
    if (input.primaryIpAddress !== undefined) {
      patch.primaryIpAddress = input.primaryIpAddress;
    }
    if (input.metadata !== undefined) {
      patch.metadata = input.metadata;
    }
    if (input.startedAt !== undefined) {
      patch.startedAt = input.startedAt;
    }
    const result = await db
      .update(nodes)
      .set(patch as Partial<typeof nodes.$inferInsert>)
      .where(and(eq(nodes.id, id), eq(nodes.userId, userId)))
      .returning();
    return result.length > 0 ? this.mapNode(result[0] as unknown) : null;
  }

  async updateState(id: string, userId: number, state: NodeState): Promise<ComputeNode | null> {
    return this.update(id, userId, { state });
  }

  async delete(id: string, userId: number): Promise<void> {
    await db.delete(nodes).where(and(eq(nodes.id, id), eq(nodes.userId, userId)));
  }

  private mapNode(record: unknown): ComputeNode {
    if (!isRecord(record)) {
      throw new Error('Invalid node record: expected an object');
    }
    const state: unknown = record.state;
    if (!isNodeState(state)) {
      throw new Error('Invalid node record: unknown state');
    }
    if (
      typeof record.id !== 'string' ||
      typeof record.name !== 'string' ||
      typeof record.providerId !== 'string' ||
      typeof record.userId !== 'number' ||
      typeof record.vcpuCount !== 'number' ||
      typeof record.memoryBytes !== 'number' ||
      typeof record.diskSizeBytes !== 'number'
    ) {
      throw new Error('Invalid node record: missing required fields');
    }
    const primaryIpAddress: unknown = record.primaryIpAddress;
    if (
      primaryIpAddress !== null &&
      primaryIpAddress !== undefined &&
      typeof primaryIpAddress !== 'string'
    ) {
      throw new Error('Invalid node record: primaryIpAddress must be a string or null');
    }
    return {
      id: record.id,
      name: record.name,
      providerId: record.providerId,
      state,
      userId: record.userId,
      vcpuCount: record.vcpuCount,
      memoryBytes: record.memoryBytes,
      diskSizeBytes: record.diskSizeBytes,
      primaryIpAddress: (primaryIpAddress as string | null | undefined) ?? null,
      metadata: toStringMetadata(record.metadata),
      createdAt: toIsoString(record.createdAt),
      updatedAt: toIsoString(record.updatedAt),
      startedAt: toNullableIsoString(record.startedAt),
    };
  }
}
