-- Tech Dose (ByteRush) initial schema: passkey accounts + synced progress.
-- Applied with: wrangler d1 migrations apply DB [--local | --remote]

CREATE TABLE users (
  id         TEXT PRIMARY KEY,               -- UUID
  username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at INTEGER NOT NULL                -- epoch ms
);

-- One row per registered passkey. A user can have several (phone, laptop...).
CREATE TABLE credentials (
  id          TEXT PRIMARY KEY,              -- base64url WebAuthn credential ID
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key  TEXT NOT NULL,                 -- base64url COSE public key
  counter     INTEGER NOT NULL DEFAULT 0,    -- signature counter (replay guard)
  transports  TEXT,                          -- JSON array, e.g. ["internal","hybrid"]
  backed_up   INTEGER NOT NULL DEFAULT 0,
  device_type TEXT,                          -- 'singleDevice' | 'multiDevice'
  created_at  INTEGER NOT NULL
);
CREATE INDEX idx_credentials_user ON credentials(user_id);

-- Single-use WebAuthn challenges, referenced by a short-lived cookie.
CREATE TABLE challenges (
  id         TEXT PRIMARY KEY,               -- UUID
  kind       TEXT NOT NULL,                  -- 'registration' | 'authentication'
  username   TEXT,                           -- set for registration
  challenge  TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Sessions store only a SHA-256 hash of the cookie token.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Full synced snapshot (XP, streaks, lessons, achievements, quiz answers,
-- inventory) as JSON — the source the app hydrates from on sign-in.
CREATE TABLE progress (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data       TEXT NOT NULL,                  -- JSON ProgressPayload
  updated_at INTEGER NOT NULL
);

-- Structured mirror of quiz answers (first attempt per question).
CREATE TABLE quiz_answers (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id  TEXT NOT NULL,
  lesson_id    TEXT NOT NULL,
  choice_index INTEGER NOT NULL,
  correct      INTEGER NOT NULL,             -- 0 | 1
  answered_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, question_id)
);

-- Structured mirror of the homelab inventory / intent profile.
CREATE TABLE inventory (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id    TEXT NOT NULL,                  -- e.g. 'pi-hole', 'tailscale'
  status     TEXT NOT NULL,                  -- 'have' | 'planned' | 'pass'
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, item_id)
);
