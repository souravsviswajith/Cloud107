import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SQL_HOST: z.string().min(1, "SQL_HOST is required"),
  SQL_USER: z.string().min(1, "SQL_USER is required"),
  SQL_PASSWORD: z.string().min(1, "SQL_PASSWORD is required"),
  SQL_DB_NAME: z.string().min(1, "SQL_DB_NAME is required"),
  C107_AUTH_SECRET: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn('⚠️ Invalid environment variables. Some features may not work:', _env.error.format());
}

export const env = _env.success ? _env.data : process.env;
