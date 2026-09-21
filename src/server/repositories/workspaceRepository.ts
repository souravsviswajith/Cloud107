import { db } from '../../db';
import { workspaces } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { Workspace, WorkspaceState } from '../../types';

export class WorkspaceRepository {
  async findAllByUserId(userId: number): Promise<Workspace[]> {
    const results = await db.select().from(workspaces).where(eq(workspaces.userId, userId));
    return results.map(this.mapWorkspace);
  }

  async findByIdAndUserId(id: string, userId: number): Promise<Workspace | null> {
    const result = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, id), eq(workspaces.userId, userId)))
      .limit(1);
    return result.length > 0 ? this.mapWorkspace(result[0]) : null;
  }

  async create(
    id: string,
    name: string,
    userId: number,
    state: WorkspaceState,
  ): Promise<Workspace> {
    const result = await db
      .insert(workspaces)
      .values({
        id,
        name,
        state,
        userId,
      })
      .returning();
    return this.mapWorkspace(result[0]);
  }

  async updateState(id: string, userId: number, state: WorkspaceState): Promise<Workspace | null> {
    const result = await db
      .update(workspaces)
      .set({ state, updatedAt: new Date() })
      .where(and(eq(workspaces.id, id), eq(workspaces.userId, userId)))
      .returning();
    return result.length > 0 ? this.mapWorkspace(result[0]) : null;
  }

  async delete(id: string, userId: number): Promise<void> {
    await db.delete(workspaces).where(and(eq(workspaces.id, id), eq(workspaces.userId, userId)));
  }

  private mapWorkspace(record: Record<string, unknown>): Workspace {
    return {
      id: record.id as string,
      name: record.name as string,
      state: record.state as WorkspaceState,
      userId: record.userId as number,
      createdAt: (record.createdAt as Date).toISOString(),
      updatedAt: (record.updatedAt as Date).toISOString(),
    };
  }
}
