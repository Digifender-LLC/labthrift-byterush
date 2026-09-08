import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { UserRow } from "./db";

export const SESSION_COOKIE = "byterush_session";
export const CHALLENGE_COOKIE = "byterush_challenge";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Only a SHA-256 hash of the session token is stored in D1. */
async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

export async function createSession(
  c: Context,
  db: D1Database,
  userId: string
): Promise<void> {
  const token = randomToken();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await db
    .prepare(
      `INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
       VALUES (?1, ?2, ?3, ?4)`
    )
    .bind(await hashToken(token), userId, Date.now(), expiresAt)
    .run();
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function getSessionUser(
  c: Context,
  db: D1Database
): Promise<UserRow | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const now = Date.now();
  // Best-effort hygiene: expired rows are cheap to purge on read.
  await db
    .prepare("DELETE FROM sessions WHERE expires_at <= ?1")
    .bind(now)
    .run();
  const row = await db
    .prepare(
      `SELECT u.id, u.username, u.created_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?1 AND s.expires_at > ?2`
    )
    .bind(await hashToken(token), now)
    .first<UserRow>();
  return row ?? null;
}

export async function destroySession(
  c: Context,
  db: D1Database
): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await db
      .prepare("DELETE FROM sessions WHERE token_hash = ?1")
      .bind(await hashToken(token))
      .run();
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}
