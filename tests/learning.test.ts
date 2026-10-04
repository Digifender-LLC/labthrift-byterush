import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useApp, attachAccount, detachAccount, toProgressPayload } from '../src/lib/store';
import { EMPTY_PROGRESS, localDay, markActivity, mergeProgress, normalizeProgress, offsetDay, type ProgressPayload } from '../src/lib/syncTypes';
import { actOnProject } from '../src/lib/projectProgress';
import { buildFeed } from '../src/lib/feed';
import { LESSONS } from '../src/lib/content';
import { QUIZZES } from '../src/lib/quizzes';
import { gearBoost, LESSON_GEAR } from '../src/lib/inventory';
import { PROJECTS, BEGINNER_PROJECTS } from '../src/lib/projects';

const clean = () => useApp.setState({ ...EMPTY_PROGRESS, user: null, progressUserId: null, pendingAttach: null, pendingReset: null, celebrations: [] });
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
const lessonIds = (feed: ReturnType<typeof buildFeed>) => feed.flatMap(i => i.kind === 'lesson' ? [i.lesson.id] : []);

test('lessons and quizzes keep distinct, first-attempt rewards beside project steps (SR-B5, SR-B12)', () => {
 clean();
 const [lesson, other] = LESSONS.filter(l => QUIZZES[l.id]);
 const q = QUIZZES[lesson.id], q2 = QUIZZES[other.id];
 const s = () => useApp.getState();
 s().readCard();assert.equal(s().learningXp, 10);
 s().completeLesson(lesson.id);
 assert.equal(s().learningXp, 35);assert.equal(s().dailyBonusDays.length, 1);assert.equal(s().xp, 85);
 s().completeLesson(lesson.id);assert.equal(s().xp, 85);assert.deepEqual(s().completedLessons, [lesson.id]);
 assert.equal(s().answerQuiz(q, q.correctIndex), true);assert.equal(s().xp, 100);
 assert.equal(s().answerQuiz(q, (q.correctIndex + 1) % q.options.length), false);
 assert.deepEqual(s().quizAnswers[q.id], { choice: q.correctIndex, correct: true, lessonId: lesson.id });
 assert.equal(s().answerQuiz(q2, (q2.correctIndex + 1) % q2.options.length), false);assert.equal(s().xp, 100);
 assert.equal(s().quizAnswers[q2.id].correct, false);
 // A project step today earns its own 10 XP but shares the lesson's daily bonus.
 s().projectAction('first-ssh', { type: 'resume' });s().projectAction('first-ssh', { type: 'advance', next: 'gloss' });
 assert.equal(s().xp, 110);assert.equal(s().dailyBonusDays.length, 1);assert.equal(s().learningXp, 50);
 assert.deepEqual(s().completedLessons, [lesson.id]);assert.equal(Object.keys(s().quizAnswers).length, 2);
 // Another device's v1 snapshot adds its lessons and quizzes without dropping projects or double-counting.
 const local = toProgressPayload(s());
 const legacy: ProgressPayload = { xp: 40, cardsRead: 4, completedLessons: [other.id], streak: 0, bestStreak: 0, lastActiveDay: null,
  unlockedAchievements: [], followedTopics: [], quizAnswers: { legacy: { choice: 0, correct: true, lessonId: other.id } }, inventory: {} };
 const merged = mergeProgress(legacy, local);
 assert.deepEqual(merged.completedLessons, [lesson.id, other.id].sort());
 assert.ok(merged.quizAnswers.legacy && merged.quizAnswers[q.id]);
 assert.deepEqual(merged.projects, local.projects);assert.equal(merged.learningXp, 50);assert.equal(merged.xp, 110);
 assert.deepEqual(mergeProgress(merged, local), merged);
 clean();
});

test('one shared 50 XP bonus per local calendar day; streaks follow calendar days (FR-B9, FR-B10)', () => {
 let p = markActivity(EMPTY_PROGRESS, '2026-12-31');
 p = actOnProject(p, 'first-ssh', { type: 'resume' }, '2026-12-31', 1);
 p = actOnProject(p, 'first-ssh', { type: 'advance', next: 'gloss' }, '2026-12-31', 2);
 assert.deepEqual(p.dailyBonusDays, ['2026-12-31']);assert.equal(p.xp, 60);
 p = actOnProject(p, 'first-ssh', { type: 'advance', next: 'where' }, '2027-01-01', 3);
 assert.equal(p.dailyBonusDays.length, 2);assert.equal(p.streak, 2);assert.equal(p.xp, 120);
 p = markActivity(p, '2027-01-03');assert.equal(p.streak, 1);assert.equal(p.bestStreak, 2);assert.equal(p.xp, 170);
 assert.equal(markActivity(p, '2027-01-03').xp, 170);
 // Two devices active on the same day still earn a single bonus once merged.
 const lessonDevice = markActivity(EMPTY_PROGRESS, '2026-10-03');
 let projectDevice = actOnProject(EMPTY_PROGRESS, 'first-backup', { type: 'resume' }, '2026-10-03', 1);
 const opening = PROJECTS.find(x => x.id === 'first-backup')!.beats.start;
 assert.deepEqual(actOnProject(projectDevice, 'first-backup', { type: 'advance', next: undefined as never }, '2026-10-03', 2), projectDevice);
 projectDevice = actOnProject(projectDevice, 'first-backup', { type: 'advance', next: opening.choices![0].next }, '2026-10-03', 2);
 assert.equal(projectDevice.projects['first-backup'].path.length, 2);
 const both = mergeProgress(lessonDevice, projectDevice);
 assert.deepEqual(both.dailyBonusDays, ['2026-10-03']);assert.equal(both.xp, 60);
 // Calendar arithmetic is independent of DST and leap years.
 assert.equal(offsetDay('2028-02-28', 1), '2028-02-29');assert.equal(offsetDay('2027-02-28', 1), '2027-03-01');
 assert.equal(offsetDay('2026-03-08', 1), '2026-03-09');assert.equal(offsetDay('2026-11-01', -1), '2026-10-31');
 assert.equal(normalizeProgress({ ...EMPTY_PROGRESS, activityDays: ['2026-03-07', '2026-03-08', '2026-03-09'] }).streak, 3);
 // The day key is the learner's local date, not the UTC date.
 const tz = process.env.TZ;
 try {
  for (const zone of ['UTC', 'Pacific/Kiritimati', 'America/Los_Angeles', 'Asia/Kolkata']) {
   process.env.TZ = zone;
   for (const at of [Date.UTC(2026, 9, 3, 10, 30), Date.UTC(2026, 9, 3, 23, 59), Date.UTC(2026, 9, 4, 0, 1)]) {
    const d = new Date(at);
    assert.equal(localDay(d), new Intl.DateTimeFormat('en-CA', { timeZone: zone }).format(d), `${zone} ${d.toISOString()}`);
   }
  }
 } finally { if (tz === undefined) delete process.env.TZ; else process.env.TZ = tz; }
});

test('feed honors topics and gear relevance, keeps a stable order and lists every project (FR-B1, FR-B6)', () => {
 const linux = LESSONS.filter(l => l.topicId === 'linux').map(l => l.id);
 const only = buildFeed(['linux'], [], {}, {}, 'lessons');
 assert.deepEqual(lessonIds(only), linux);
 assert.deepEqual(lessonIds(buildFeed(['linux'], [linux[0]], {}, {}, 'lessons')), [...linux.slice(1), linux[0]]);
 assert.deepEqual(buildFeed(['linux', 'homelab'], [], {}), buildFeed(['linux', 'homelab'], [], {}));
 // Owned or planned gear lifts matching lessons; a pass never does.
 const homelab = LESSONS.filter(l => l.topicId === 'homelab').map(l => l.id);
 const boosted = lessonIds(buildFeed(['homelab'], [], { nas: 'have' }, {}, 'lessons'));
 const boosts = boosted.map(id => gearBoost(id, { nas: 'have' }));
 assert.ok(boosts[0] > 0);assert.deepEqual(boosts, [...boosts].sort((a, b) => b - a));
 assert.ok(boosted.every(id => homelab.includes(id)) && boosted.length === homelab.length);
 assert.ok(Object.values(LESSON_GEAR).some(g => g.includes('nas')));
 assert.deepEqual(lessonIds(buildFeed(['homelab'], [], { nas: 'pass' }, {}, 'lessons')), homelab);
 // Projects lists all 17 once; a resumable project leads, and skipped work stays discoverable.
 let p = actOnProject(EMPTY_PROGRESS, 'lab-plan-passkeys', { type: 'resume' }, '2026-10-03', 5);
 p = actOnProject(p, 'first-ssh', { type: 'skip' }, '2026-10-03', 6);
 const all = buildFeed([], [], {}, p.projects, 'projects').map(i => i.kind === 'project' ? i.project.id : '');
 assert.equal(all.length, 17);assert.equal(new Set(all).size, 17);assert.equal(all[0], 'lab-plan-passkeys');
 assert.deepEqual(all.slice(1, 7), BEGINNER_PROJECTS);assert.ok(all.includes('first-ssh'));
 const mixed = buildFeed(['homelab'], [], {}, p.projects);
 assert.equal(mixed[0].kind === 'project' && mixed[0].project.id, 'lab-plan-passkeys');
 assert.ok(!mixed.some(i => i.kind === 'project' && i.project.id === 'first-ssh'));
});

test('a late response from a former account never lands in the new account (SR-B8)', async () => {
 clean();
 const pending: { resolve: (r: Response) => void; method: string }[] = [];
 const puts: unknown[] = [];
 globalThis.fetch = (async (_url: string, init?: RequestInit) => {
  if (init?.method === 'PUT') { const body = JSON.parse(init.body as string);puts.push(body.progress);return json({ progress: body.progress }); }
  return new Promise<Response>(resolve => pending.push({ resolve, method: init?.method ?? 'GET' }));
 }) as typeof fetch;
 const aServer = actOnProject(EMPTY_PROGRESS, 'first-ssh', { type: 'resume' }, '2026-10-03', 1);
 const a = attachAccount({ id: 'a', username: 'a' });
 const b = attachAccount({ id: 'b', username: 'b' });
 assert.equal(pending.length, 2);
 pending[1].resolve(json({ progress: null }));await b;
 pending[0].resolve(json({ progress: aServer }));await a;
 assert.equal(useApp.getState().user?.id, 'b');assert.deepEqual(useApp.getState().projects, {});
 assert.ok(puts.every(p => !(p as { projects: Record<string, unknown> }).projects['first-ssh']));
 detachAccount();clean();
});

test('an interrupted anonymous attach retries into the same account only (FR-B12, SR-B9)', async () => {
 clean();
 let remote: Record<string, ProgressPayload> = { a: { ...EMPTY_PROGRESS }, b: { ...EMPTY_PROGRESS } };
 let who = 'a', offline = true;
 globalThis.fetch = (async (_url: string, init?: RequestInit) => {
  if (offline) throw new Error('offline');
  if (init?.method === 'PUT') remote[who] = mergeProgress(JSON.parse(init.body as string).progress, remote[who]);
  return json({ progress: remote[who] });
 }) as typeof fetch;
 useApp.setState(actOnProject(EMPTY_PROGRESS, 'first-ssh', { type: 'resume' }, '2026-10-03', 1));
 useApp.getState().projectAction('first-ssh', { type: 'advance', next: 'gloss' });
 await assert.rejects(attachAccount({ id: 'a', username: 'a' }));
 assert.equal(useApp.getState().pendingAttach, 'a');assert.ok(useApp.getState().projects['first-ssh']);
 // Reconnecting as the intended account completes the attachment.
 offline = false;await attachAccount({ id: 'a', username: 'a' });
 assert.ok(remote.a.projects!['first-ssh']);assert.equal(useApp.getState().pendingAttach, null);
 // Signing in as someone else replaces, rather than merges, the attached work.
 who = 'b';await attachAccount({ id: 'b', username: 'b' });
 assert.deepEqual(useApp.getState().projects, {});assert.deepEqual(remote.b.projects, {});
 // An interrupted attach to A followed by signing in as B never gives A's anonymous work to B.
 detachAccount();remote = { a: { ...EMPTY_PROGRESS }, b: { ...EMPTY_PROGRESS } };
 useApp.getState().projectAction('first-backup', { type: 'resume' });
 offline = true;who = 'a';await assert.rejects(attachAccount({ id: 'a', username: 'a' }));
 offline = false;who = 'b';await attachAccount({ id: 'b', username: 'b' });
 assert.deepEqual(useApp.getState().projects, {});assert.deepEqual(remote.b.projects, {});
 detachAccount();clean();
});
