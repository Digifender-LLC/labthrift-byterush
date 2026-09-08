"use client";

// Thin fetch client for the Worker API (same origin, cookie sessions).
// This module never imports the store — the store calls into it.

import type { ProgressPayload, PublicUser } from "./syncTypes";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/browser";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new ApiError(
      data.error ?? "Something went wrong — try again.",
      res.status
    );
  }
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export function fetchRegistrationOptions(username: string) {
  return request<{ options: PublicKeyCredentialCreationOptionsJSON }>(
    "/api/auth/register/options",
    { method: "POST", json: { username } }
  );
}

export function verifyRegistration(response: RegistrationResponseJSON) {
  return request<{ user: PublicUser }>("/api/auth/register/verify", {
    method: "POST",
    json: { response },
  });
}

export function fetchLoginOptions(username?: string) {
  return request<{ options: PublicKeyCredentialRequestOptionsJSON }>(
    "/api/auth/login/options",
    { method: "POST", json: username ? { username } : {} }
  );
}

export function verifyLogin(response: AuthenticationResponseJSON) {
  return request<{ user: PublicUser }>("/api/auth/login/verify", {
    method: "POST",
    json: { response },
  });
}

export function fetchMe() {
  return request<{ user: PublicUser | null }>("/api/auth/me");
}

export function logout() {
  return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

// ── Sync ────────────────────────────────────────────────────────────────────

export function fetchServerProgress() {
  return request<{ progress: ProgressPayload | null }>("/api/sync");
}

/** Sends the local snapshot; the server merges and returns the result. */
export function pushProgress(progress: ProgressPayload) {
  return request<{ progress: ProgressPayload }>("/api/sync", {
    method: "PUT",
    json: { progress },
  });
}

/** Wipes the account's synced progress (used by "Reset all progress"). */
export function deleteServerProgress() {
  return request<{ ok: boolean }>("/api/sync", { method: "DELETE" });
}
