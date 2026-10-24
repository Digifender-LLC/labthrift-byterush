import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useApp } from '../src/lib/store';
import { EMPTY_PROGRESS } from '../src/lib/syncTypes';
import { playComplete, playSwipe, playTap, setMuted } from '../src/lib/sounds';

const win = globalThis.window as unknown as Record<string, unknown>;
let oscillators = 0;
class FakeAudioContext {
 state = 'running';
 currentTime = 0;
 destination = {};
 resume() {}
 createGain() { const param = { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }; return { gain: param, connect: (n: unknown) => n }; }
 createOscillator() { oscillators++; const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {} }; return { frequency: param, connect: (n: unknown) => n, start() {}, stop() {}, type: 'sine' }; }
}
win.AudioContext = FakeAudioContext;
const playAll = () => { playTap(); playSwipe(); playComplete(); };
const reset = () => { useApp.setState({ ...EMPTY_PROGRESS, soundEnabled: true, user: null, progressUserId: null, pendingAttach: null, pendingReset: null, celebrations: [] }); setMuted(false); oscillators = 0; };

test('mute silences every sound and unmute restores them (B01 mute)', () => {
 reset();
 playAll();
 assert.ok(oscillators > 0);
 oscillators = 0;
 useApp.getState().setSoundEnabled(false);
 playAll();
 assert.equal(oscillators, 0);
 useApp.getState().setSoundEnabled(true);
 playAll();
 assert.ok(oscillators > 0);
});

test('the mute preference persists, survives reload, and is not cleared by reset (B01 mute)', async () => {
 reset();
 useApp.getState().setSoundEnabled(false);
 const stored = JSON.parse(localStorage.getItem('byterush-store') as string);
 assert.equal(stored.state.soundEnabled, false);
 useApp.getState().resetProgress();
 assert.equal(useApp.getState().soundEnabled, false);
 setMuted(false);
 await useApp.persist.rehydrate();
 assert.equal(useApp.getState().soundEnabled, false);
 oscillators = 0;
 playAll();
 assert.equal(oscillators, 0);
});
