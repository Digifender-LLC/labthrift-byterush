"use client";

// Passkey account card on the profile page: sign-up, sign-in, or the
// signed-in summary. Anonymous mode always remains one tap away.

import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, KeyRound, LogOut, UserCircle2 } from "lucide-react";
import {
  authErrorMessage,
  loginWithPasskey,
  passkeysSupported,
  registerWithPasskey,
  signOut,
} from "@/lib/authClient";
import { useApp } from "@/lib/store";
import { playComplete, playTap } from "@/lib/sounds";
import { Button } from "@/components/ui/button";

type Mode = "signup" | "signin";

export function AccountCard() {
  const user = useApp((s) => s.user);
  const [mode, setMode] = useState<Mode>("signup");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await registerWithPasskey(username);
      } else {
        await loginWithPasskey(username || undefined);
      }
      playComplete();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/15 to-indigo-600/10 p-5"
      >
        <div className="flex items-center gap-3">
          <UserCircle2 className="size-10 text-sky-300" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold">@{user.username}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Cloud className="size-3.5" /> Passkey account · progress syncs
              automatically
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-bold"
            onClick={() => {
              playTap();
              void signOut();
            }}
          >
            <LogOut className="size-3.5" /> Sign out
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-border bg-card p-5"
    >
      <p className="flex items-center gap-2 text-sm font-bold">
        <KeyRound className="size-4 text-sky-400" />
        {mode === "signup" ? "Save your progress" : "Welcome back"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {mode === "signup"
          ? "Pick a username and create a passkey — no email, no password. Everything you've earned on this device comes with you."
          : "Sign in with your passkey. Username is optional — your device remembers."}
      </p>

      {!passkeysSupported() ? (
        <p className="mt-3 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
          This browser doesn&apos;t support passkeys, so accounts aren&apos;t
          available here. Everything still works — your progress stays on this
          device.
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-col gap-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={
                mode === "signup" ? "pick a username" : "username (optional)"
              }
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={32}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground/60 focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !busy) void submit();
              }}
            />
            <Button
              className="w-full rounded-xl font-bold"
              disabled={busy || (mode === "signup" && username.trim().length < 3)}
              onClick={() => void submit()}
            >
              {busy
                ? "Waiting for your passkey…"
                : mode === "signup"
                  ? "Create account with passkey"
                  : "Sign in with passkey"}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-xs font-semibold text-rose-400">{error}</p>
          )}
          <button
            className="mt-3 text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => {
              playTap();
              setError(null);
              setMode(mode === "signup" ? "signin" : "signup");
            }}
          >
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>
        </>
      )}
    </motion.div>
  );
}
