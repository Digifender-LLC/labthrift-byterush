# Deploying Tech Dose (ByteRush) to Cloudflare

This document covers deploying this repo (Origin `zemdregon/tech-dose`, product
name **ByteRush**, shipped here as **Tech Dose**) to Cloudflare Workers at
`app.labthrift.com`, plus a `workers.dev` preview URL.

## What this app is now

A static Next.js export (`./out`) **plus a Worker script and a D1 database**:

- The UI is still a fully static, client-first Next.js app served as Worker
  assets. Anonymous use works exactly as before, with all progress in
  `localStorage`.
- `worker/index.ts` (Hono) owns `/api/*`: passkey (WebAuthn) registration and
  sign-in, cookie sessions, and progress sync (XP, streaks, lessons,
  guided projects, achievements, quiz answers, homelab inventory, reset
  generations) backed by **D1**.
- Auth is username + passkey only — no email, no password, no PII. The
  WebAuthn RP ID is the parent domain `labthrift.com`, which keeps future
  passkey sharing with `plan.labthrift.com` possible. Today the two apps have
  separate account stores, so a ByteRush account does not sign in to Plan; see
  [`docs/shared-passkeys.md`](./docs/shared-passkeys.md), including why the
  `workers.dev` preview can't run real ceremonies.

## How it's built

`next.config.ts` sets `output: "export"`. `next build` produces a static
`./out` directory — this is what Wrangler uploads as Worker static assets.
Wrangler bundles `worker/index.ts` itself at deploy time (no separate build
step for the Worker).

```bash
npm install
npm run build   # -> ./out
```

## Wrangler configuration (`wrangler.jsonc`)

- `main: "worker/index.ts"` — the Hono API Worker.
- `compatibility_flags: ["nodejs_compat"]`.
- `assets.directory: "./out"` + `assets.binding: "ASSETS"` — static export,
  also reachable from the Worker for 404 fallthrough.
- `assets.run_worker_first: ["/api/*"]` — API requests always hit the Worker.
- `assets.not_found_handling: "404-page"` / `html_handling:
  "auto-trailing-slash"` — unchanged static-site behavior for pages.
- `d1_databases` — binding `DB`, database `tech-dose-db`, migrations in
  `./migrations`.
- `vars` — `WEBAUTHN_RP_ID` (`labthrift.com`), `WEBAUTHN_RP_NAME`,
  `WEBAUTHN_ALLOWED_ORIGINS` (`https://app.labthrift.com`).
- `workers_dev: true` + `preview_urls: true` — keeps the
  `tech-dose.<your-subdomain>.workers.dev` preview alongside the custom
  domain.
- `routes: [{ pattern: "app.labthrift.com", custom_domain: true }]` — the
  production custom domain.

## Prerequisites (one-time, per Cloudflare account)

1. **Cloudflare API token / OAuth.** This sandbox has no Cloudflare
   credentials, so deployment must run from a machine that does (the
   Labthrift box already has wrangler OAuth). For CI/agents, add a
   `CLOUDFLARE_API_TOKEN` (and `CLOUDFLARE_ACCOUNT_ID` if the account has
   several) with `Workers Scripts: Edit`, `Workers Routes: Edit`, and
   `D1: Edit` permissions.
2. **Create the D1 database and record its id** (first deploy only):

   ```bash
   npx wrangler d1 create tech-dose-db
   ```

   Paste the returned `database_id` into `wrangler.jsonc` (replacing
   `REPLACE_WITH_D1_DATABASE_ID`), commit, and keep it — the id is not a
   secret.
3. **`labthrift.com` must be an active Cloudflare zone on the target
   account** — it already is, since `plan.labthrift.com` is live there.
4. **`app.labthrift.com` must not already have a conflicting DNS record**
   (Custom Domains manage DNS + TLS). If the static-only version of this app
   is already deployed on the custom domain, redeploying in place is fine.

## Deploying

```bash
# one-time auth (interactive) — or export CLOUDFLARE_API_TOKEN instead
npx wrangler login

# 1. apply D1 migrations to the remote database
npm run d1:migrate          # = wrangler d1 migrations apply DB --remote

# 2. build + deploy
npm run cf:deploy           # = npm run build && wrangler deploy
```

Run migrations **before** deploying a Worker version that expects the new
tables. `wrangler d1 migrations apply` is incremental and idempotent — it only
runs migrations that haven't been applied yet.

To sanity-check the config and bundle without credentials:

```bash
npx wrangler deploy --dry-run
```

## Local development (full stack)

```bash
cp .dev.vars.example .dev.vars        # localhost RP ID for WebAuthn
npm run d1:migrate:local              # local sqlite-backed D1
npm run build                         # produce ./out for the assets binding
npm run cf:preview                    # = wrangler dev -> http://localhost:8787
```

Passkeys work end-to-end on `localhost` (browsers treat it as a valid RP ID).
For UI-only iteration without the API, plain `npm run dev` still works — the
app degrades gracefully to anonymous localStorage mode when `/api` is absent.

## Packaging a deploy artifact (no Cloudflare access required)

```bash
npm run cf:package
# = npm run build && scripts/package-artifact.sh
# -> tech-dose-cloudflare-<git-sha>.tar.gz
```

The tarball contains `./out`, `wrangler.jsonc`, `package.json`, and this
file. Whoever has Cloudflare credentials can extract it and run
`npx wrangler deploy` from the extracted directory. Note the Worker script
(`worker/`), migrations, and `node_modules` (for bundling `hono` /
`@simplewebauthn/server`) are needed too — run `npm install` in the extracted
directory first.

## Verifying after deploy

- `https://app.labthrift.com/` — production. Click through `/`, `/topics`,
  `/profile`.
- `GET https://app.labthrift.com/api/auth/me` — should return
  `{"user":null}` (JSON, not the 404 page) — proves the Worker script is
  routing.
- On `/profile`, create an account (username + passkey), complete a lesson
  and answer its quiz, and advance one project step (Feed → Projects), then
  open the site in another browser and sign in — the lesson, project
  position, and XP should follow you.
- Record what you verified in
  [`docs/design/release-status.md`](./docs/design/release-status.md).
- `https://tech-dose.<subdomain>.workers.dev/` — preview: pages and anonymous
  mode work; passkey ceremonies are expected to fail there (RP ID
  `labthrift.com` doesn't match `workers.dev` — see
  [`docs/shared-passkeys.md`](./docs/shared-passkeys.md)).

## PWA install (Add to Home Screen)

ByteRush ships as an installable PWA. Static assets live in `public/` and
copy to `./out` on build:

- `manifest.webmanifest` — linked from Next metadata in `src/app/layout.tsx`
- `sw.js` — registered by `src/components/PwaRegister.tsx`
- `offline.html` — offline fallback for navigations
- `icons/` — 192×192, 512×512, and `apple-touch-icon` PNGs

**Before each deploy**, bump `CACHE_VERSION` in `public/sw.js` so clients
pick up a fresh cache.

### Testing install locally

```bash
npm run build
npm run cf:preview    # http://localhost:8787
```

1. Open the preview URL in Chrome (desktop or Android).
2. DevTools → **Application** → **Manifest**: confirm name, icons, and
   `display: standalone`.
3. DevTools → **Application** → **Service Workers**: confirm `/sw.js` is
   activated.
4. Use the address-bar **Install app** control (or Chrome menu → Install
   ByteRush). The window should open without browser chrome.
5. Toggle **Offline** in DevTools → Network, reload — you should see
   `offline.html` or a cached shell.

### Testing on production (`app.labthrift.com`)

- **Chrome / Edge (desktop or Android):** visit the site, then Install app
  from the omnibox or browser menu.
- **Safari (iOS):** Share → **Add to Home Screen**. The icon uses
  `apple-touch-icon.png`; launch should be standalone with the dark theme
  status bar (`appleWebApp` metadata).

Lighthouse **Progressive Web App** audit should report a valid manifest,
registered service worker, and installability (HTTPS is required — satisfied
on the custom domain).
