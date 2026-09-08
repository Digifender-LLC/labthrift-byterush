// Tech Dose (ByteRush) Worker: serves the static Next.js export from ./out
// via the assets binding, and a small JSON API under /api for passkey auth
// and progress sync. See DEPLOY.md and docs/shared-passkeys.md.

import { Hono } from "hono";
import type { Env } from "./env";
import { auth } from "./auth";
import { getSessionUser } from "./session";
import {
  getProgress,
  mirrorStructuredRows,
  putProgress,
} from "./db";
import {
  EMPTY_PROGRESS,
  isProgressPayload,
  mergeProgress,
} from "../src/lib/syncTypes";

const app = new Hono<{ Bindings: Env }>();

app.route("/api/auth", auth);

/**
 * GET /api/sync — the signed-in user's merged server-side progress.
 * PUT /api/sync — merge the client snapshot into the stored one and echo
 * the merged result, so devices converge instead of overwriting each other.
 */
app.get("/api/sync", async (c) => {
  const user = await getSessionUser(c, c.env.DB);
  if (!user) return c.json({ error: "Sign in first." }, 401);
  const progress = await getProgress(c.env.DB, user.id);
  return c.json({ progress });
});

app.put("/api/sync", async (c) => {
  const user = await getSessionUser(c, c.env.DB);
  if (!user) return c.json({ error: "Sign in first." }, 401);

  const body = await c.req.json().catch(() => null);
  const incoming = body && (body as { progress?: unknown }).progress;
  if (!isProgressPayload(incoming)) {
    return c.json({ error: "Malformed progress payload." }, 400);
  }

  const stored = (await getProgress(c.env.DB, user.id)) ?? EMPTY_PROGRESS;
  const merged = mergeProgress(incoming, stored);
  await putProgress(c.env.DB, user.id, merged);
  await mirrorStructuredRows(c.env.DB, user.id, merged);
  return c.json({ progress: merged });
});

// "Reset all progress" for a signed-in user: without this, the grow-only
// merge would resurrect old progress on the next sync. Inventory is kept —
// it describes their lab, not their learning progress.
app.delete("/api/sync", async (c) => {
  const user = await getSessionUser(c, c.env.DB);
  if (!user) return c.json({ error: "Sign in first." }, 401);
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM progress WHERE user_id = ?1").bind(user.id),
    c.env.DB.prepare("DELETE FROM quiz_answers WHERE user_id = ?1").bind(user.id),
  ]);
  return c.json({ ok: true });
});

// Unknown /api paths get a JSON 404; anything else falls through to the
// static assets (which handle their own 404 page via not_found_handling).
app.notFound((c) => {
  if (new URL(c.req.url).pathname.startsWith("/api/")) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
