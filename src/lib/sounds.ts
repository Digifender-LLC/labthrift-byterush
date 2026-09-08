// All sounds are synthesized with the Web Audio API — no audio files needed.
// Kept short and bright to deliver quick, satisfying feedback.

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  startAt: number,
  duration: number,
  {
    type = "sine",
    gain = 0.16,
    endFreq,
  }: { type?: OscillatorType; gain?: number; endFreq?: number } = {}
) {
  const ac = getCtx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + startAt;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Soft pop when advancing to the next card. */
export function playTap() {
  tone(660, 0, 0.09, { type: "triangle", gain: 0.12 });
  tone(990, 0.015, 0.07, { type: "sine", gain: 0.06 });
}

/** Low tick when going back a card. */
export function playBack() {
  tone(420, 0, 0.08, { type: "triangle", gain: 0.09 });
}

/** Rising sparkle when a lesson is completed. */
export function playComplete() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((f, i) => tone(f, i * 0.07, 0.22, { type: "sine", gain: 0.14 }));
  tone(1567.98, 0.3, 0.3, { type: "sine", gain: 0.08 });
}

/** Big fanfare for unlocking an achievement. */
export function playAchievement() {
  const chord = [523.25, 659.25, 783.99];
  chord.forEach((f) => tone(f, 0, 0.5, { type: "triangle", gain: 0.1 }));
  const chord2 = [587.33, 739.99, 880];
  chord2.forEach((f) => tone(f, 0.18, 0.6, { type: "triangle", gain: 0.11 }));
  tone(1174.66, 0.36, 0.5, { type: "sine", gain: 0.1 });
}

/** Warm swell when the daily streak is extended. */
export function playStreak() {
  tone(392, 0, 0.35, { type: "sine", gain: 0.12, endFreq: 784 });
  tone(587.33, 0.12, 0.3, { type: "sine", gain: 0.1 });
  [880, 1108.73, 1318.51].forEach((f, i) =>
    tone(f, 0.25 + i * 0.06, 0.25, { type: "sine", gain: 0.09 })
  );
}

/** Subtle whoosh when swiping to the next lesson. */
export function playSwipe() {
  tone(300, 0, 0.16, { type: "sine", gain: 0.05, endFreq: 720 });
}

/** Bright ding for XP gains. */
export function playXp() {
  tone(1318.51, 0, 0.12, { type: "sine", gain: 0.1 });
  tone(1567.98, 0.05, 0.14, { type: "sine", gain: 0.08 });
}

/** Cheerful two-note rise for a correct quiz answer. */
export function playCorrect() {
  tone(659.25, 0, 0.14, { type: "triangle", gain: 0.13 });
  tone(987.77, 0.09, 0.2, { type: "sine", gain: 0.12 });
  tone(1318.51, 0.18, 0.18, { type: "sine", gain: 0.08 });
}

/** Soft, kind "hmm" for a wrong answer — teaching, not punishing. */
export function playIncorrect() {
  tone(392, 0, 0.16, { type: "triangle", gain: 0.08 });
  tone(329.63, 0.1, 0.2, { type: "sine", gain: 0.06 });
}
