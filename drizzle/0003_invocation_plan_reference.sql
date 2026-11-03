ALTER TABLE invocations
ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES execution_plans(id);
