import { db } from '../../db';
import { workloads } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { WorkloadRepresentation } from '../../core/workload';

export class WorkloadStateRepository {
  async create(workload: WorkloadRepresentation): Promise<WorkloadRepresentation> {
    const record = await db
      .insert(workloads)
      .values({
        id: workload.identity.id,
        s1: workload,
      })
      .returning({ s1: workloads.s1 });

    return record[0].s1 as WorkloadRepresentation;
  }

  async findById(id: string): Promise<WorkloadRepresentation | null> {
    const records = await db
      .select({ s1: workloads.s1 })
      .from(workloads)
      .where(eq(workloads.id, id))
      .limit(1);

    return records.length > 0 ? (records[0].s1 as WorkloadRepresentation) : null;
  }
}
