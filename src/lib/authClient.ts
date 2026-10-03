"use client";

// Passkey (WebAuthn) flows for the browser, plus the sign-in sync handshake.
// Sign-up and sign-in both end the same way: the local anonymous progress is
// pushed to the server, merged with whatever the account already has, and the
// merged result is applied locally. Switching accounts replaces account-owned state.

import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  ApiError,
  fetchLoginOptions,
  fetchMe,
  fetchRegistrationOptions,
  logout as apiLogout,
  verifyLogin,
  verifyRegistration,
} from "./api";
import { attachAccount, detachAccount, useApp } from "./store";
import type { PublicUser } from "./syncTypes";

export function passkeysSupported(): boolean {
  return typeof window !== "undefined" && browserSupportsWebAuthn();
}

/**
 * Create an account: username + a brand-new passkey. Existing local progress
 * is imported into the account right after.
 */
export async function registerWithPasskey(username: string): Promise<PublicUser> {
  const { options } = await fetchRegistrationOptions(username.trim());
  // SimpleWebAuthn browser v11+ takes { optionsJSON }, not bare options.
  const response = await startRegistration({ optionsJSON: options });
  const { user } = await verifyRegistration(response);
  await attachAccount(user);
  return user;
}

/**
 * Sign in with a passkey. Username is optional — without it the browser
 * offers any discoverable passkey for this site.
 */
export async function loginWithPasskey(username?: string): Promise<PublicUser> {
  const { options } = await fetchLoginOptions(username?.trim() || undefined);
  const response = await startAuthentication({ optionsJSON: options });
  const { user } = await verifyLogin(response);
  await attachAccount(user);
  return user;
}

/** Signs out and clears account-owned state before anonymous learning resumes. */
export async function signOut(): Promise<void> {
  try {
    await apiLogout();
  } finally {
    detachAccount();
  }
}

/** Human-friendly message for auth failures, including user cancellation. */
export function authErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) {
    // User dismissed the platform passkey prompt.
    if (err.name === "NotAllowedError") {
      return "Passkey prompt was closed. No worries — try again whenever.";
    }
    if (err.name === "InvalidStateError") {
      return "This device already has a passkey for that account. Try signing in instead.";
    }
  }
  return "Something went wrong — try again.";
}

// ── Session bootstrap ────────────────────────────────────────────────────────

let bootstrapped = false;

/**
 * Runs once per page load: reconciles the persisted `user` with the actual
 * cookie session, and kicks off a merge-sync when signed in. Safe to call
 * from multiple components.
 */
export function bootstrapAuth(): void {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  void (async () => {
    try {
      const { user } = await fetchMe();
      const store = useApp.getState();
      if (user) {
        await attachAccount(user);
      } else if (store.user) {
        // Session expired or was revoked server-side.
        store.setUser(null);
      }
    } catch {
      // Offline / API unreachable — anonymous localStorage mode just works.
    }
  })();
}
