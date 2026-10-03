// Test double for worker/session.ts: the caller names its user in a header.
import type { Context } from "hono";
export async function getSessionUser(c: Context) {
  const id = c.req.header("x-test-user");
  return id ? { id, username: id, created_at: 0 } : null;
}
