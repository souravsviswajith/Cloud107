import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class UserRepository {
  async findByUid(uid: string) {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(uid: string, email: string) {
    const result = await db.insert(users).values({
      uid,
      email,
    }).returning();
    return result[0];
  }
}
