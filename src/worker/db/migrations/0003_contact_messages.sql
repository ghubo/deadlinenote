CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT    PRIMARY KEY,
  name       TEXT    NOT NULL CHECK(length(name) <= 120),
  email      TEXT    NOT NULL CHECK(length(email) <= 254),
  message    TEXT    NOT NULL CHECK(length(message) <= 4000),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_rate_limits (
  key        TEXT    PRIMARY KEY,
  count      INTEGER NOT NULL DEFAULT 0 CHECK(count >= 0),
  reset_at   INTEGER NOT NULL
);
