import { Router } from 'express';
import { db } from '../../../db';
import { sql } from 'drizzle-orm';
import { successResponse, errorResponse } from '../../utils/response';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    // Check DB connection
    await db.execute(sql`SELECT 1`);
    res.json(successResponse({ status: 'ok', database: 'connected' }, req));
  } catch (error: unknown) {
    console.error('Health check DB error:', error);
    res.status(503).json(errorResponse('Database connection failed', 503, req));
  }
});
