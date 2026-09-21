import { db } from '../../db';
import { applications, applicationSessions } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { Application, ApplicationSession, ApplicationSessionStatus } from '../../types';

export class ApplicationRepository {
  async findAll(): Promise<Application[]> {
    const records = await db.select().from(applications);
    return records.map(this.mapApplication);
  }

  async findById(id: string): Promise<Application | null> {
    const record = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return record.length > 0 ? this.mapApplication(record[0]) : null;
  }

  async create(app: Omit<Application, 'createdAt' | 'updatedAt'>): Promise<Application> {
    const record = await db
      .insert(applications)
      .values({
        id: app.id,
        name: app.name,
        category: app.category,
        icon: app.icon,
        color: app.color,
        enabled: app.enabled ?? true,
        installed: app.installed ?? true,
      })
      .returning();
    return this.mapApplication(record[0]);
  }

  async createSession(
    session: Omit<ApplicationSession, 'createdAt' | 'updatedAt'>,
  ): Promise<ApplicationSession> {
    const record = await db
      .insert(applicationSessions)
      .values({
        id: session.id,
        applicationId: session.applicationId,
        workspaceId: session.workspaceId,
        userId: session.userId,
        status: session.status,
      })
      .returning();
    return this.mapSession(record[0]);
  }

  async updateSessionStatus(id: string, status: string): Promise<ApplicationSession | null> {
    const record = await db
      .update(applicationSessions)
      .set({ status, updatedAt: new Date() })
      .where(eq(applicationSessions.id, id))
      .returning();
    return record.length > 0 ? this.mapSession(record[0]) : null;
  }

  async findSessionById(id: string): Promise<ApplicationSession | null> {
    const record = await db
      .select()
      .from(applicationSessions)
      .where(eq(applicationSessions.id, id))
      .limit(1);
    return record.length > 0 ? this.mapSession(record[0]) : null;
  }

  async findActiveSession(
    applicationId: string,
    workspaceId: string,
  ): Promise<ApplicationSession | null> {
    const records = await db
      .select()
      .from(applicationSessions)
      .where(
        and(
          eq(applicationSessions.applicationId, applicationId),
          eq(applicationSessions.workspaceId, workspaceId),
          eq(applicationSessions.status, 'running'),
        ),
      )
      .limit(1);
    return records.length > 0 ? this.mapSession(records[0]) : null;
  }

  private mapApplication(record: Record<string, unknown>): Application {
    return {
      id: record.id as string,
      name: record.name as string,
      category: record.category as string,
      icon: record.icon as string,
      color: (record.color as string) ?? undefined,
      enabled: record.enabled as boolean,
      installed: record.installed as boolean,
      createdAt: (record.createdAt as Date).toISOString(),
      updatedAt: (record.updatedAt as Date).toISOString(),
    };
  }

  private mapSession(record: Record<string, unknown>): ApplicationSession {
    return {
      id: record.id as string,
      applicationId: record.applicationId as string,
      workspaceId: record.workspaceId as string,
      userId: record.userId as number,
      status: record.status as ApplicationSessionStatus,
      createdAt: (record.createdAt as Date).toISOString(),
      updatedAt: (record.updatedAt as Date).toISOString(),
    };
  }
}
