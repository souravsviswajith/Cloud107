ALTER TABLE invocations
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

CREATE INDEX IF NOT EXISTS invocations_user_id_idx ON invocations(user_id);
