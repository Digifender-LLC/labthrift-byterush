import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { allowedOrigins, type Env } from "./env";
import {
  consumeChallenge,
  createUser,
  getCredentialById,
  getCredentialsForUser,
  getUserByUsername,
  insertCredential,
  storeChallenge,
} from "./db";
import {
  CHALLENGE_COOKIE,
  createSession,
  destroySession,
  getSessionUser,
} from "./session";

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9_-]{1,30})[a-z0-9]$/i;

function setChallengeCookie(
  c: Parameters<typeof setCookie>[0],
  challengeId: string
) {
  setCookie(c, CHALLENGE_COOKIE, challengeId, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/api/auth",
    maxAge: 300,
  });
}

export const auth = new Hono<{ Bindings: Env }>();

// ── Registration ────────────────────────────────────────────────────────────

auth.post("/register/options", async (c) => {
  const { username } = await c.req.json<{ username?: string }>().catch(() => ({
    username: undefined,
  }));
  if (!username || !USERNAME_RE.test(username)) {
    return c.json(
      { error: "Pick a username: 3–32 letters, numbers, dashes or underscores." },
      400
    );
  }

  const existing = await getUserByUsername(c.env.DB, username);
  if (existing) {
    return c.json({ error: "That username is taken — try another one." }, 409);
  }

  const options = await generateRegistrationOptions({
    rpName: c.env.WEBAUTHN_RP_NAME,
    rpID: c.env.WEBAUTHN_RP_ID,
    userName: username,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required", // discoverable, so username-less sign-in works
      userVerification: "preferred",
    },
  });

  const challengeId = await storeChallenge(
    c.env.DB,
    "registration",
    options.challenge,
    username
  );
  setChallengeCookie(c, challengeId);
  return c.json({ options });
});

auth.post("/register/verify", async (c) => {
  const challengeId = getCookie(c, CHALLENGE_COOKIE);
  if (!challengeId) {
    return c.json({ error: "That took too long — try again." }, 400);
  }
  deleteCookie(c, CHALLENGE_COOKIE, { path: "/api/auth" });

  const challenge = await consumeChallenge(c.env.DB, challengeId, "registration");
  if (!challenge || !challenge.username) {
    return c.json({ error: "That took too long — try again." }, 400);
  }

  const body = await c.req
    .json<{ response?: RegistrationResponseJSON }>()
    .catch(() => ({ response: undefined }));
  if (!body.response) return c.json({ error: "Missing passkey response." }, 400);

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: allowedOrigins(c.env),
      expectedRPID: c.env.WEBAUTHN_RP_ID,
      requireUserVerification: false,
    });
  } catch (err) {
    console.error("register verify failed", err);
    return c.json({ error: "We couldn't verify that passkey." }, 400);
  }
  if (!verification.verified || !verification.registrationInfo) {
    return c.json({ error: "We couldn't verify that passkey." }, 400);
  }

  // Re-check the username: someone could have raced us since /options.
  if (await getUserByUsername(c.env.DB, challenge.username)) {
    return c.json({ error: "That username is taken — try another one." }, 409);
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  const user = await createUser(c.env.DB, challenge.username);
  await insertCredential(c.env.DB, {
    id: credential.id,
    user_id: user.id,
    public_key: isoBase64URL.fromBuffer(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports
      ? JSON.stringify(credential.transports)
      : null,
    backed_up: credentialBackedUp ? 1 : 0,
    device_type: credentialDeviceType,
  });
  await createSession(c, c.env.DB, user.id);

  return c.json({ user: { id: user.id, username: user.username } });
});

// ── Authentication ──────────────────────────────────────────────────────────

auth.post("/login/options", async (c) => {
  const { username } = await c.req
    .json<{ username?: string }>()
    .catch(() => ({ username: undefined }));

  // With a username we scope to that user's credentials; without one we rely
  // on discoverable credentials and let the browser offer matching passkeys.
  let allowCredentials:
    | { id: string; transports?: string[] }[]
    | undefined;
  if (username) {
    const user = await getUserByUsername(c.env.DB, username);
    if (user) {
      const creds = await getCredentialsForUser(c.env.DB, user.id);
      allowCredentials = creds.map((cr) => ({
        id: cr.id,
        transports: cr.transports
          ? (JSON.parse(cr.transports) as string[])
          : undefined,
      }));
    }
    // Unknown username still gets generic options — the ceremony will fail
    // naturally, and we don't confirm which usernames exist.
  }

  const options = await generateAuthenticationOptions({
    rpID: c.env.WEBAUTHN_RP_ID,
    userVerification: "preferred",
    allowCredentials,
  });

  const challengeId = await storeChallenge(
    c.env.DB,
    "authentication",
    options.challenge,
    username ?? null
  );
  setChallengeCookie(c, challengeId);
  return c.json({ options });
});

auth.post("/login/verify", async (c) => {
  const challengeId = getCookie(c, CHALLENGE_COOKIE);
  if (!challengeId) {
    return c.json({ error: "That took too long — try again." }, 400);
  }
  deleteCookie(c, CHALLENGE_COOKIE, { path: "/api/auth" });

  const challenge = await consumeChallenge(
    c.env.DB,
    challengeId,
    "authentication"
  );
  if (!challenge) {
    return c.json({ error: "That took too long — try again." }, 400);
  }

  const body = await c.req
    .json<{ response?: AuthenticationResponseJSON }>()
    .catch(() => ({ response: undefined }));
  if (!body.response) return c.json({ error: "Missing passkey response." }, 400);

  const credentialRow = await getCredentialById(c.env.DB, body.response.id);
  if (!credentialRow) {
    return c.json(
      { error: "We don't recognize that passkey. Try creating an account first." },
      404
    );
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: allowedOrigins(c.env),
      expectedRPID: c.env.WEBAUTHN_RP_ID,
      requireUserVerification: false,
      credential: {
        id: credentialRow.id,
        publicKey: isoBase64URL.toBuffer(credentialRow.public_key),
        counter: credentialRow.counter,
        transports: credentialRow.transports
          ? (JSON.parse(credentialRow.transports) as string[])
          : undefined,
      },
    });
  } catch (err) {
    console.error("login verify failed", err);
    return c.json({ error: "We couldn't verify that passkey." }, 400);
  }
  if (!verification.verified) {
    return c.json({ error: "We couldn't verify that passkey." }, 400);
  }

  await c.env.DB.prepare("UPDATE credentials SET counter = ?2 WHERE id = ?1")
    .bind(credentialRow.id, verification.authenticationInfo.newCounter)
    .run();

  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?1")
    .bind(credentialRow.user_id)
    .first<{ id: string; username: string }>();
  if (!user) return c.json({ error: "Account not found." }, 404);

  await createSession(c, c.env.DB, user.id);
  return c.json({ user: { id: user.id, username: user.username } });
});

// ── Session ─────────────────────────────────────────────────────────────────

auth.get("/me", async (c) => {
  const user = await getSessionUser(c, c.env.DB);
  return c.json({
    user: user ? { id: user.id, username: user.username } : null,
  });
});

auth.post("/logout", async (c) => {
  await destroySession(c, c.env.DB);
  return c.json({ ok: true });
});
