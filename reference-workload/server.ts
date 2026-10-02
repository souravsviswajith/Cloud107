import express from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const workDir = process.env.WORK_DIR ?? '/tmp/cloud107-ref';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('DATABASE_URL is required');

const pool = new Pool({ connectionString: databaseUrl });

interface ProcessRequest { jobId: string; values: unknown; }

app.post('/process', async (req, res) => {
  try {
    const { jobId, values } = req.body as ProcessRequest;
    if (typeof jobId !== 'string' || jobId.length === 0 ||
        !Array.isArray(values) ||
        !values.every((value) => typeof value === 'number' && Number.isFinite(value))) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    if (values.length === 0) return res.status(400).json({ error: 'values must not be empty' });

    await mkdir(workDir, { recursive: true });
    await writeFile(workDir + '/' + jobId + '.input', JSON.stringify(values));

    const count = values.length;
    const sum = values.reduce((total, value) => total + value, 0);
    const mean = sum / count;
    const result = { jobId, count, sum, mean };

    await writeFile(workDir + '/' + jobId + '.output', JSON.stringify(result));
    await pool.query(
      'INSERT INTO executions (job_id, input_count, sum, mean) VALUES ($1, $2, $3, $4)',
      [jobId, count, sum, mean],
    );

    return res.json({ result, workDir });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log('Reference service listening on :' + port);
});

const shutdown = async () => {
  server.close();
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
