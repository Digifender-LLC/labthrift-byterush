export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /**
   * WebAuthn Relying Party ID. Production uses the registrable parent domain
   * `labthrift.com` so passkeys created here can also be shared with
   * plan.labthrift.com. See docs/shared-passkeys.md.
   */
  WEBAUTHN_RP_ID: string;
  /** Human-friendly name shown in passkey prompts. */
  WEBAUTHN_RP_NAME: string;
  /** Comma-separated list of origins allowed to complete ceremonies. */
  WEBAUTHN_ALLOWED_ORIGINS: string;
}

export function allowedOrigins(env: Env): string[] {
  return env.WEBAUTHN_ALLOWED_ORIGINS.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}
