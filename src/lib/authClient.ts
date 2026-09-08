"use client";

// Passkey (WebAuthn) flows for the browser, plus the sign-in sync handshake.
// Sign-up and sign-in both end the same way: the local anonymous progress is
// pushed to the server, merged with whatever the account already has, and the
// merged result is applied locally — nothing is ever wiped.

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
import { pullServerProgress, syncNow, useApp } from "./store";
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
  useApp.getState().setUser(user);
  useApp.getState().setProgressUserId(user.id);
  await syncNow(); // imports this device's anonymous progress
  return user;
}

/**
 * Sign in with a passkey. Username is optional — without it the browser
 * offers any discoverable passkey for this site.
 */
export async function loginWithPasskey(username?: string): Promise<PublicUser> {
  const priorOwner = useApp.getState().progressUserId;
  const { options } = await fetchLoginOptions(username?.trim() || undefined);
  const response = await startAuthentication({ optionsJSON: options });
  const { user } = await verifyLogin(response);
  useApp.getState().setUser(user);
  // Don't merge another account's local progress into this sign-in.
  if (priorOwner && priorOwner !== user.id) {
    await pullServerProgress();
  } else {
    await syncNow();
  }
  useApp.getState().setProgressUserId(user.id);
  return user;
}

/** Signs out server-side; progress stays on this device (anonymous mode). */
export async function signOut(): Promise<void> {
  try {
    await apiLogout();
  } finally {
    useApp.getState().setUser(null);
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
        store.setUser(user);
        store.setProgressUserId(user.id);
        await syncNow();
      } else if (store.user) {
        // Session expired or was revoked server-side.
        store.setUser(null);
      }
    } catch {
      // Offline / API unreachable — anonymous localStorage mode just works.
    }
  })();
}
