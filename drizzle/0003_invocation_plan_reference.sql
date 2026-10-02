ALTER TABLE invocations
ADD COLUMN plan_id TEXT REFERENCES execution_plans(id);
