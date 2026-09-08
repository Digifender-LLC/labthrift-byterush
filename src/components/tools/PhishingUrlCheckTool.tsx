"use client";

// Educational phishing URL spot-check: a copied login page can be pixel
// perfect, but the address bar can't be faked the same way. This walks
// through a handful of realistic-looking URLs, has the learner guess legit
// vs. phishing, then reveals which part of the string is the *actual*
// domain and why. Every URL here is invented for practice — nothing is
// fetched, scanned, or resolved over the network.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Globe,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { playCorrect, playIncorrect, playTap } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface UrlSample {
  id: string;
  /** Full string as it'd appear in an address bar. */
  display: string;
  /** The actual registrable domain — the part right before the path. */
  realDomain: string;
  isPhish: boolean;
  tell: string;
  signals: string[];
}

const SAMPLES: UrlSample[] = [
  {
    id: "google-legit",
    display: "https://accounts.google.com/signin/v2",
    realDomain: "google.com",
    isPhish: false,
    tell: "\"accounts.\" is just a subdomain Google itself controls. The domain right before the path — google.com — is the real thing.",
    signals: ["Real domain matches the brand", "HTTPS, no extra words"],
  },
  {
    id: "google-subdomain-stack",
    display: "https://accounts.google.com.verify-secure.info/signin",
    realDomain: "verify-secure.info",
    isPhish: true,
    tell: "Everything before verify-secure.info — including \"accounts.google.com\" — is just a subdomain label. This page is hosted by whoever owns verify-secure.info, not Google.",
    signals: [
      "Real brand jammed into the subdomain",
      "Unfamiliar root domain right before the path",
    ],
  },
  {
    id: "proton-legit",
    display: "https://mail.proton.me/inbox",
    realDomain: "proton.me",
    isPhish: false,
    tell: "proton.me really is Proton's domain. An unfamiliar TLD or a shorter-than-expected name isn't automatically suspicious — read the whole domain, don't just vibe-check it.",
    signals: ["Root domain is genuinely owned by the brand"],
  },
  {
    id: "paypal-typosquat",
    display: "http://www.paypaI.com/security/confirm",
    realDomain: "paypaI.com",
    isPhish: true,
    tell: "That's a capital \"I\" standing in for a lowercase \"l\" — paypaI.com and paypal.com are two completely different domains, built to look identical in most fonts.",
    signals: ["Look-alike letter swap (typosquatting)", "Plain HTTP, not HTTPS"],
  },
  {
    id: "chase-brand-midstring",
    display: "https://secure-chase-login.com/id/restore",
    realDomain: "secure-chase-login.com",
    isPhish: true,
    tell: "\"chase\" appearing in the domain doesn't mean Chase owns it — secure-chase-login.com is one word, registered by whoever paid for it. Real banks don't need to spell out \"secure\" and \"login\" to prove it.",
    signals: [
      "Brand name buried inside an unrelated domain",
      "Manufactured urgency (\"restore\")",
    ],
  },
  {
    id: "irs-legit",
    display: "https://www.irs.gov/payments",
    realDomain: "irs.gov",
    isPhish: false,
    tell: ".gov domains are tightly controlled — government agencies are one of the few cases where the TLD itself is a solid trust signal.",
    signals: ["Restricted .gov domain matches the agency"],
  },
  {
    id: "raw-ip",
    display: "https://192.168.45.201/wp-admin/update-required",
    realDomain: "192.168.45.201",
    isPhish: true,
    tell: "There's no domain here at all — just a raw IP address. Real companies don't send login links to bare IPs; this is often what a hijacked router or device redirect looks like.",
    signals: ["Raw IP address instead of a domain", "No brand name anywhere in the URL"],
  },
];

function renderUrl(sample: UrlSample, colorClass: string) {
  const idx = sample.display.indexOf(sample.realDomain);
  if (idx === -1) return sample.display;
  const before = sample.display.slice(0, idx);
  const after = sample.display.slice(idx + sample.realDomain.length);
  return (
    <>
      <span className="text-muted-foreground">{before}</span>
      <span className={cn("font-extrabold", colorClass)}>{sample.realDomain}</span>
      <span className="text-muted-foreground">{after}</span>
    </>
  );
}

export function PhishingUrlCheckTool() {
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState<"phish" | "legit" | null>(null);
  const [score, setScore] = useState(0);

  const done = index >= SAMPLES.length;

  const reset = () => {
    playTap();
    setIndex(0);
    setGuess(null);
    setScore(0);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center">
        <ShieldCheck className="size-10 text-emerald-400" />
        <p className="text-2xl font-extrabold">
          {score} / {SAMPLES.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {score === SAMPLES.length
            ? "Perfect eye for a fake address bar."
            : "Every miss here is one you won't make on a real inbox."}
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-xl border border-primary bg-accent px-4 py-2.5 text-sm font-bold transition-transform active:scale-95"
        >
          <RotateCcw className="size-4" /> Try again
        </button>
      </div>
    );
  }

  const sample = SAMPLES[index];
  const correct = guess ? (guess === "phish") === sample.isPhish : null;
  const domainColor = !guess
    ? "text-foreground"
    : correct
      ? "text-emerald-400"
      : "text-rose-400";

  const submitGuess = (guessedPhish: boolean) => {
    if (guess) return;
    playTap();
    const isCorrect = guessedPhish === sample.isPhish;
    setGuess(guessedPhish ? "phish" : "legit");
    if (isCorrect) {
      playCorrect();
      setScore((s) => s + 1);
    } else {
      playIncorrect();
    }
  };

  const next = () => {
    playTap();
    setGuess(null);
    setIndex((i) => i + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
        <span>Is this a real login page?</span>
        <span>
          {index + 1} / {SAMPLES.length}
        </span>
      </div>

      {/* address bar mockup */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3">
        <Globe className="size-4 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 break-all font-mono text-[13px] leading-snug">
          {renderUrl(sample, domainColor)}
        </p>
      </div>

      {!guess ? (
        <div className="flex gap-2">
          <button
            onClick={() => submitGuess(false)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-sm font-bold transition-colors active:scale-95"
          >
            <ShieldCheck className="size-4 text-emerald-400" /> Looks legit
          </button>
          <button
            onClick={() => submitGuess(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-2 py-3 text-sm font-bold transition-colors active:scale-95"
          >
            <ShieldAlert className="size-4 text-rose-400" /> Looks like phishing
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={sample.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <p
              className={cn(
                "flex items-center gap-1.5 font-mono text-sm font-extrabold",
                correct ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {correct ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <XCircle className="size-4" />
              )}
              {sample.isPhish ? "This one's phishing" : "This one's legit"}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {sample.tell}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sample.signals.map((s) => (
                <span
                  key={s}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                    sample.isPhish
                      ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
                      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  )}
                >
                  {sample.isPhish && <TriangleAlert className="size-3" />}
                  {s}
                </span>
              ))}
            </div>
            <button
              onClick={next}
              className="mt-1 rounded-xl border border-primary bg-accent px-3 py-2.5 text-sm font-bold transition-transform active:scale-95"
            >
              {index + 1 === SAMPLES.length ? "See your score →" : "Next URL →"}
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        Every URL here is invented for practice — nothing is scanned or
        contacted. Bonus tell: a domain starting with xn-- means the browser
        is showing you a Unicode look-alike in disguise.
      </p>
    </div>
  );
}
