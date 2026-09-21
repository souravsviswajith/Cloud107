-- Capability API (Release Candidate): persistent node state + operation ledger.
-- Replaces the scaffold's in-memory arrays with PostgreSQL-backed tables.
-- Mirrors src/db/schema.ts (`nodes`, `operations`).
-- Apply with: psql "$DATABASE_URL" -f drizzle/0001_capability_nodes_operations.sql
-- (or generate/apply via drizzle-kit once SQL_* env vars are configured).

CREATE TABLE IF NOT EXISTS "nodes" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "provider_id" text NOT NULL DEFAULT 'local-unix',
  "state" text NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "vcpu_count" integer NOT NULL,
  "memory_bytes" bigint NOT NULL,
  "disk_size_bytes" bigint NOT NULL,
  "primary_ip_address" text,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "started_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "operations" (
  "id" text PRIMARY KEY,
  "node_id" text REFERENCES "nodes"("id") ON DELETE SET NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "payload" jsonb,
  "result" jsonb,
  "error" text,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "nodes_user_id_idx" ON "nodes" ("user_id");
CREATE INDEX IF NOT EXISTS "nodes_state_idx" ON "nodes" ("state");
CREATE INDEX IF NOT EXISTS "operations_user_id_idx" ON "operations" ("user_id");
CREATE INDEX IF NOT EXISTS "operations_node_id_idx" ON "operations" ("node_id");
CREATE INDEX IF NOT EXISTS "operations_status_idx" ON "operations" ("status");
