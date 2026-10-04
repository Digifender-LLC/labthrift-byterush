import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../worker/index';
import { EMPTY_PROGRESS, type ProgressPayload } from '../src/lib/syncTypes';
import { actOnProject } from '../src/lib/projectProgress';
import { PROJECT_BY_ID } from '../src/lib/projects';

/** In-memory D1 covering the progress-row statements used by updateProgress. */
function fakeD1() {
 const rows = new Map<string, { data: string; updated_at: number }>();
 let beforeBatch: (() => void) | null = null;
 type Stmt = { sql: string; args: unknown[]; bind: (...a: unknown[]) => Stmt; first: () => Promise<unknown> };
 const stmt = (sql: string, args: unknown[] = []): Stmt => ({ sql, args, bind: (...a) => stmt(sql, a), first: async () => {
  const row = rows.get(args[0] as string);
  if (sql.startsWith('SELECT data, updated_at FROM progress')) return row ? { ...row } : null;
  if (sql.startsWith('SELECT data FROM progress')) return row ? { data: row.data } : null;
  throw new Error('unexpected query ' + sql);
 } });
 const exec = ({ sql, args }: Stmt) => {
  const [id, data, rev, expected] = args as [string, string, number, number];
  if (sql.startsWith('UPDATE progress')) { if (rows.get(id)?.updated_at !== expected) return 0; rows.set(id, { data, updated_at: rev }); return 1; }
  if (sql.startsWith('INSERT INTO progress')) { if (rows.has(id)) return 0; rows.set(id, { data, updated_at: rev }); return 1; }
  return 0; // Gated mirror statements; exercised against real D1 by tests/sync-integration.mjs.
 };
 return { rows, onNextBatch: (f: () => void) => { beforeBatch = f; }, prepare: (sql: string) => stmt(sql),
  batch: async (list: Stmt[]) => { const f = beforeBatch; beforeBatch = null; f?.(); return list.map(s => ({ meta: { changes: exec(s) } })); } };
}
const setup = () => {
 const DB = fakeD1();
 const env = { DB, ASSETS: { fetch: async () => new Response('asset') } };
 const call = async (method: string, path: string, body?: unknown, user: string | null = 'u1') => {
  const res = await app.fetch(new Request('http://byterush.test' + path, { method, headers: { 'Content-Type': 'application/json', ...(user ? { 'x-test-user': user } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) }), env as never);
  return { res, data: await res.json().catch(() => null) as { progress: ProgressPayload & { generation: number; projects: Record<string, unknown>; rewardIds: string[] } } | null };
 };
 const sync = async (method: string, body?: unknown, user = 'u1') => {
  const { res, data } = await call(method, '/api/sync', body, user);
  assert.equal(res.status, 200, `${method} /api/sync: ${JSON.stringify(data)} for ${String(JSON.stringify(body)).slice(0, 400)}`);
  return data!.progress;
 };
 return { DB, call, sync };
};
const day = '2026-10-03';
const step = (id: string, now: number, base: ProgressPayload = EMPTY_PROGRESS) => {
 const p = actOnProject(base, id, { type: 'resume' }, day, now);
 const first = PROJECT_BY_ID[id].beats[PROJECT_BY_ID[id].startBeat];
 return actOnProject(p, id, { type: 'advance', next: first.continue ?? first.choices![0].next }, day, now + 1);
};

test('API answers are never cacheable and reject anonymous or malformed sync requests (SR-B10)', async () => {
 const { call } = setup();
 for (const [method, path, body, user] of [['GET', '/api/sync', undefined, null], ['PUT', '/api/sync', { progress: { xp: -1 } }, 'u1'], ['DELETE', '/api/sync', { id: 7, generation: 0 }, 'u1'], ['GET', '/api/nope', undefined, 'u1']] as const) {
  const { res } = await call(method, path, body, user);
  assert.equal(res.headers.get('Cache-Control'), 'no-store', `${method} ${path}`);
  assert.equal(res.status, user ? (path === '/api/nope' ? 404 : 400) : 401);
 }
 const ok = await call('GET', '/api/sync');assert.equal(ok.res.headers.get('Cache-Control'), 'no-store');assert.equal(ok.data!.progress, null);
 assert.equal(await (await call('GET', '/topics')).res.status, 200);
});

test('retries, two devices and legacy clients converge without duplicate rewards or lost projects (SR-B4, SR-B6)', async () => {
 const { sync } = setup();
 const a = step('first-ssh', 10), b = step('first-backup', 20);
 const first = await sync('PUT', { progress: a });assert.equal(first.xp, 60);
 const retry = await sync('PUT', { progress: a });assert.deepEqual(retry, first);
 const merged = await sync('PUT', { progress: b });
 assert.equal(merged.xp, 70);assert.deepEqual(Object.keys(merged.projects).sort(), ['first-backup', 'first-ssh']);
 // A v1 client echoes the total it saw but omits every project field.
 const legacy = { xp: merged.xp, cardsRead: 3, completedLessons: ['homelab-why'], streak: 1, bestStreak: 1, lastActiveDay: day, unlockedAchievements: [], followedTopics: ['homelab'], quizAnswers: {}, inventory: {} };
 const after = await sync('PUT', { progress: legacy });
 assert.equal(after.xp, 70);assert.deepEqual(after.rewardIds, merged.rewardIds);assert.deepEqual(after.completedLessons, ['homelab-why']);
 // Another account never sees this snapshot.
 assert.equal(await sync('GET', undefined, 'u2'), null);
});

test('reset is idempotent and stale or legacy snapshots cannot resurrect old progress (FR-B13, SR-B9)', async () => {
 const { sync } = setup();
 const old = step('first-ssh', 10);
 await sync('PUT', { progress: { ...old, inventory: { nas: 'have' }, followedTopics: ['linux'] } });
 const reset = await sync('DELETE', { id: 'r1', generation: 0 });
 assert.equal(reset.generation, 1);assert.equal(reset.xp, 0);assert.deepEqual(reset.inventory, { nas: 'have' });assert.deepEqual(reset.followedTopics, ['linux']);
 assert.deepEqual(await sync('DELETE', { id: 'r1', generation: 0 }), reset);
 assert.equal((await sync('DELETE', { id: 'r2', generation: 0 })).generation, 1);
 assert.deepEqual(await sync('PUT', { progress: old }), reset);
 const { generation, ...v1 } = old;void generation;
 assert.deepEqual(await sync('PUT', { progress: { ...v1, schemaVersion: undefined } }), reset);
 const fresh = step('first-backup', 30, reset);
 assert.equal((await sync('PUT', { progress: fresh })).xp, 60);
});

test('a concurrent write between read and commit is retried and merged, not overwritten (SR-B7)', async () => {
 const { DB, sync } = setup();
 await sync('PUT', { progress: step('first-ssh', 10) });
 DB.onNextBatch(() => {
  const row = DB.rows.get('u1')!;const stored = JSON.parse(row.data);
  const other = step('first-backup', 20, stored);
  DB.rows.set('u1', { data: JSON.stringify(other), updated_at: row.updated_at + 1 });
 });
 const result = await sync('PUT', { progress: step('first-file-share', 30) });
 assert.deepEqual(Object.keys(result.projects).sort(), ['first-backup', 'first-file-share', 'first-ssh']);
 assert.deepEqual(JSON.parse(DB.rows.get('u1')!.data), result);
});
