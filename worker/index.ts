// Tech Dose (ByteRush) Worker: serves the static Next.js export from ./out
// via the assets binding, and a small JSON API under /api for passkey auth
// and progress sync. See DEPLOY.md and docs/shared-passkeys.md.

import { Hono } from "hono";
import type { Env } from "./env";
import { auth } from "./auth";
import { getSessionUser } from "./session";
import { getProgress, updateProgress } from "./db";
import { isProgressPayload, mergeProgress, resetSnapshot } from "../src/lib/syncTypes";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", async (c, next) => { await next(); c.header("Cache-Control", "no-store"); });
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

  const progress = await updateProgress(c.env.DB, user.id, stored => {
    // Only DELETE can advance a generation. v1 clients after a reset receive
    // the current snapshot; omission cannot resurrect pre-reset progress.
    if ((incoming.generation ?? 0) !== stored.generation) return stored;
    return mergeProgress(incoming, stored);
  });
  return c.json({ progress });
});

app.delete("/api/sync", async (c) => {
  const user = await getSessionUser(c, c.env.DB);
  if (!user) return c.json({ error: "Sign in first." }, 401);
  const body = await c.req.json().catch(() => null);
  if (body !== null && (typeof body.id !== "string" || body.id.length > 100 || !Number.isSafeInteger(body.generation) || body.generation < 0))
    return c.json({ error: "Malformed reset request." }, 400);
  const id = body?.id ?? crypto.randomUUID();
  const progress = await updateProgress(c.env.DB, user.id, stored => {
    if (stored.resetId === id || (body && body.generation !== stored.generation)) return stored;
    return resetSnapshot(stored, id);
  });
  return c.json({ ok: true, progress });
});
app.onError((err, c) => {
  console.error("Worker request failed:", err.message);
  return c.json({ error: "Temporarily unavailable. Your device will retry sync." }, 503);
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
