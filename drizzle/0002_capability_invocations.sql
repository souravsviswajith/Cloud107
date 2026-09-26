CREATE TABLE invocations (
  id TEXT PRIMARY KEY,
  capability TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('accepted', 'pending', 'running', 'completed', 'failed')
  ),
  s1_id TEXT REFERENCES workloads(id),
  result JSONB,
  error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
