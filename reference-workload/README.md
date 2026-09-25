# Cloud107 Reference Workload

A deliberately small deployment workload for validating Cloud107's existing execution path.

## Workload behavior

```json
{
  "jobId": "demo-001",
  "values": [10, 20, 30, 40]
}
```

The service validates the request, performs filesystem input/output, computes count/sum/mean deterministically, records application state in PostgreSQL, and returns the result.

Cloud107 execution state remains separate from the application's `executions` table.

## Build

The build produces one Linux executable at `dist/reference-service`.

It uses Node.js 22's single-executable application preparation flow with a bundled CommonJS service and `postject` injection.

```bash
npm ci
./build.sh
```

## Runtime configuration

Required: `DATABASE_URL`

Optional: `PORT` (default `3000`), `WORK_DIR` (default `/tmp/cloud107-ref`).

Apply `schema.sql` to the application database before invoking `/process`.
