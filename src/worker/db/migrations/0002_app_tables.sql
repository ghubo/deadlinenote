-- DeadlineNote application tables.
-- This baseline is intended for the private pre-public reset.

CREATE TABLE IF NOT EXISTS subjects (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK(length(name) <= 120),
  color      TEXT NOT NULL DEFAULT 'blue' CHECK(color IN ('blue', 'red', 'green', 'purple', 'orange', 'teal', 'pink', 'yellow')),
  semester   TEXT CHECK(semester IS NULL OR length(semester) <= 80),
  UNIQUE(user_id, id)
);

CREATE TABLE IF NOT EXISTS notes (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  subject_id       TEXT NOT NULL,
  title            TEXT NOT NULL CHECK(length(title) <= 160),
  content          TEXT NOT NULL DEFAULT '' CHECK(length(content) <= 50000),
  tags             TEXT CHECK(tags IS NULL OR length(tags) <= 2000),
  last_reviewed_at INTEGER,
  review_count     INTEGER NOT NULL DEFAULT 0 CHECK(review_count >= 0),
  mastery_score    REAL    NOT NULL DEFAULT 0.0 CHECK(mastery_score >= 0 AND mastery_score <= 1),
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL,
  UNIQUE(user_id, id),
  FOREIGN KEY (user_id, subject_id) REFERENCES subjects(user_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS deadlines (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  title      TEXT NOT NULL CHECK(length(title) <= 160),
  type       TEXT NOT NULL CHECK(type IN ('exam', 'assignment', 'quiz')),
  due_date   INTEGER NOT NULL CHECK(due_date > 0),
  UNIQUE(user_id, id),
  FOREIGN KEY (user_id, subject_id) REFERENCES subjects(user_id, id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  note_id          TEXT,
  subject_id       TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 25 CHECK(duration_minutes >= 5 AND duration_minutes <= 180),
  started_at       INTEGER NOT NULL,
  completed_at     INTEGER,
  status           TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'abandoned')),
  UNIQUE(user_id, id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  CHECK(completed_at IS NULL OR completed_at >= started_at)
);

CREATE TABLE IF NOT EXISTS review_logs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  note_id     TEXT NOT NULL,
  reviewed_at INTEGER NOT NULL,
  result      TEXT NOT NULL CHECK(result IN ('easy', 'medium', 'hard')),
  FOREIGN KEY (user_id, note_id) REFERENCES notes(user_id, id) ON DELETE CASCADE
);
