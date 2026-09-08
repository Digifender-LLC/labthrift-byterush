import type { InventoryStatus, ProgressPayload } from "../src/lib/syncTypes";

export interface UserRow {
  id: string;
  username: string;
  created_at: number;
}

export interface CredentialRow {
  id: string; // base64url credential ID
  user_id: string;
  public_key: string; // base64url-encoded COSE public key
  counter: number;
  transports: string | null; // JSON array
  backed_up: number;
  device_type: string | null;
  created_at: number;
}

export async function getUserByUsername(
  db: D1Database,
  username: string
): Promise<UserRow | null> {
  return db
    .prepare("SELECT * FROM users WHERE username = ?1 COLLATE NOCASE")
    .bind(username)
    .first<UserRow>();
}

export async function getUserById(
  db: D1Database,
  id: string
): Promise<UserRow | null> {
  return db.prepare("SELECT * FROM users WHERE id = ?1").bind(id).first<UserRow>();
}

export async function createUser(
  db: D1Database,
  username: string
): Promise<UserRow> {
  const user: UserRow = {
    id: crypto.randomUUID(),
    username,
    created_at: Date.now(),
  };
  await db
    .prepare("INSERT INTO users (id, username, created_at) VALUES (?1, ?2, ?3)")
    .bind(user.id, user.username, user.created_at)
    .run();
  return user;
}

export async function getCredentialById(
  db: D1Database,
  credentialId: string
): Promise<CredentialRow | null> {
  return db
    .prepare("SELECT * FROM credentials WHERE id = ?1")
    .bind(credentialId)
    .first<CredentialRow>();
}

export async function getCredentialsForUser(
  db: D1Database,
  userId: string
): Promise<CredentialRow[]> {
  const { results } = await db
    .prepare("SELECT * FROM credentials WHERE user_id = ?1")
    .bind(userId)
    .all<CredentialRow>();
  return results;
}

export async function insertCredential(
  db: D1Database,
  row: Omit<CredentialRow, "created_at">
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO credentials
         (id, user_id, public_key, counter, transports, backed_up, device_type, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
    )
    .bind(
      row.id,
      row.user_id,
      row.public_key,
      row.counter,
      row.transports,
      row.backed_up,
      row.device_type,
      Date.now()
    )
    .run();
}

export async function updateCredentialCounter(
  db: D1Database,
  credentialId: string,
  counter: number
): Promise<void> {
  await db
    .prepare("UPDATE credentials SET counter = ?2 WHERE id = ?1")
    .bind(credentialId, counter)
    .run();
}

// ─── Challenges ────────────────────────────────────────────────────────────

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export async function storeChallenge(
  db: D1Database,
  kind: "registration" | "authentication",
  challenge: string,
  username: string | null
): Promise<string> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO challenges (id, kind, username, challenge, expires_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    )
    .bind(id, kind, username, challenge, Date.now() + CHALLENGE_TTL_MS)
    .run();
  return id;
}

export interface ChallengeRow {
  id: string;
  kind: string;
  username: string | null;
  challenge: string;
  expires_at: number;
}

/** Fetches and deletes the challenge — each one is single-use. */
export async function consumeChallenge(
  db: D1Database,
  id: string,
  kind: "registration" | "authentication"
): Promise<ChallengeRow | null> {
  const row = await db
    .prepare("SELECT * FROM challenges WHERE id = ?1")
    .bind(id)
    .first<ChallengeRow>();
  if (!row) return null;
  await db.prepare("DELETE FROM challenges WHERE id = ?1").bind(id).run();
  // Opportunistically clear other expired challenges.
  await db
    .prepare("DELETE FROM challenges WHERE expires_at < ?1")
    .bind(Date.now())
    .run();
  if (row.kind !== kind || row.expires_at < Date.now()) return null;
  return row;
}

// ─── Progress / quiz / inventory ───────────────────────────────────────────

export async function getProgress(
  db: D1Database,
  userId: string
): Promise<ProgressPayload | null> {
  const row = await db
    .prepare("SELECT data FROM progress WHERE user_id = ?1")
    .bind(userId)
    .first<{ data: string }>();
  if (!row) return null;
  try {
    return JSON.parse(row.data) as ProgressPayload;
  } catch {
    return null;
  }
}

export async function putProgress(
  db: D1Database,
  userId: string,
  payload: ProgressPayload
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO progress (user_id, data, updated_at) VALUES (?1, ?2, ?3)
       ON CONFLICT (user_id) DO UPDATE SET data = ?2, updated_at = ?3`
    )
    .bind(userId, JSON.stringify(payload), Date.now())
    .run();
}

/**
 * Mirrors the quiz answers and inventory from the payload into structured
 * tables so they can be queried directly (analytics, future tailoring).
 * Quiz rows keep the first recorded attempt; inventory rows track the latest.
 */
export async function mirrorStructuredRows(
  db: D1Database,
  userId: string,
  payload: ProgressPayload
): Promise<void> {
  const now = Date.now();
  const statements: D1PreparedStatement[] = [];

  for (const [questionId, a] of Object.entries(payload.quizAnswers)) {
    statements.push(
      db
        .prepare(
          `INSERT INTO quiz_answers
             (user_id, question_id, lesson_id, choice_index, correct, answered_at)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6)
           ON CONFLICT (user_id, question_id) DO NOTHING`
        )
        .bind(userId, questionId, a.lessonId, a.choice, a.correct ? 1 : 0, now)
    );
  }

  for (const [itemId, status] of Object.entries(payload.inventory)) {
    statements.push(
      db
        .prepare(
          `INSERT INTO inventory (user_id, item_id, status, updated_at)
           VALUES (?1, ?2, ?3, ?4)
           ON CONFLICT (user_id, item_id) DO UPDATE SET status = ?3, updated_at = ?4`
        )
        .bind(userId, itemId, status satisfies InventoryStatus, now)
    );
  }

  if (statements.length > 0) await db.batch(statements);
}
