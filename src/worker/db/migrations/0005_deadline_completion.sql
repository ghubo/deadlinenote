ALTER TABLE deadlines ADD COLUMN completed_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_deadlines_user_completion_due
  ON deadlines(user_id, completed_at, due_date ASC);
