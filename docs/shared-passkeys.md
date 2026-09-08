# Shared passkeys across labthrift.com

Tech Dose uses WebAuthn passkeys (username + passkey, no email, no password),
following the same house rules as Labthrift Plan (`plan.labthrift.com`).

Within the Labthrift ecosystem, [labthrift.com](https://labthrift.com) guides
are the reference material, Plan is the planning tool, and this app — Tech
Dose at `app.labthrift.com` — is the snackable learning player.

## RP ID: the parent domain

The WebAuthn **Relying Party ID is `labthrift.com`** — the registrable parent
domain — not `app.labthrift.com`. Per the
[WebAuthn RP ID rules](https://www.w3.org/TR/webauthn-3/#rp-id), a credential
bound to `labthrift.com` can be exercised from any subdomain:

- `app.labthrift.com` (this app)
- `plan.labthrift.com` (Labthrift Plan)

so a passkey created on one can eventually sign in to the other, once their
backends agree on a shared account store. Each app currently keeps its own
users/credentials tables; the parent-domain RP ID is what keeps that future
consolidation possible without re-enrolling anyone.

The RP ID and allowed origins are Worker vars in `wrangler.jsonc`:

```jsonc
"vars": {
  "WEBAUTHN_RP_ID": "labthrift.com",
  "WEBAUTHN_RP_NAME": "Tech Dose",
  "WEBAUTHN_ALLOWED_ORIGINS": "https://app.labthrift.com"
}
```

`WEBAUTHN_ALLOWED_ORIGINS` is a comma-separated list checked on every
`register/verify` and `login/verify` call. `https://app.labthrift.com` is the
only required entry; add further labthrift.com hosts here only if they should
complete ceremonies against this Worker.

## Preview vs production

**The `workers.dev` preview (`tech-dose.lmao.workers.dev`) cannot run real
passkey ceremonies.** Browsers require the RP ID to be a registrable suffix of
the caller's origin, and `labthrift.com` is not a suffix of
`*.workers.dev`. The preview still serves the app and the anonymous
localStorage mode fully works there — only account creation / sign-in will be
rejected by the browser before any network call happens.

Production ceremonies happen only on `*.labthrift.com` hosts; the preview is
for everything else.

Note that `labthrift.com` is the only live domain — there is no
`labthrift.net`.

### Local development

`localhost` is special-cased by browsers as its own valid RP ID, so the full
flow is testable locally:

```bash
cp .dev.vars.example .dev.vars      # sets RP ID + origin to localhost
npx wrangler d1 migrations apply DB --local
npm run build
npx wrangler dev                    # http://localhost:8787
```

`.dev.vars` overrides the production `vars` only for `wrangler dev`; it is
gitignored and never deploys.

## What the server stores (privacy)

Accounts are deliberately minimal — there is no email, phone, or contact
field anywhere in the schema (see `migrations/0001_init.sql`):

- `users`: id + username
- `credentials`: the passkey's public key, counter, transports
- `sessions`: SHA-256 hashes of session tokens (never the tokens themselves)
- `progress` / `quiz_answers` / `inventory`: learning progress, quiz history,
  and the self-reported homelab gear profile

Anonymous use remains fully supported: without an account everything lives in
`localStorage`, and on first sign-in that local progress is merged into the
account (never wiped).
