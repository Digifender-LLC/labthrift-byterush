import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const ORIGIN = 'https://app.labthrift.test';

/** One browser profile: a shared CacheStorage, a switchable network, and installable worker builds. */
function browser() {
 const stores = new Map();
 const net = { online: true, hits: [] };
 const caches = {
  open: async (name) => {
   if (!stores.has(name)) stores.set(name, new Map());
   const store = stores.get(name);
   return {
    match: async (req) => store.get(new URL(req.url ?? req, ORIGIN).href)?.clone(),
    put: async (req, res) => { store.set(new URL(req.url ?? req, ORIGIN).href, res); },
    addAll: async (urls) => { for (const u of urls) store.set(new URL(u, ORIGIN).href, await network(new Request(new URL(u, ORIGIN)))); },
   };
  },
  match: async (req) => { for (const store of stores.values()) { const hit = store.get(new URL(req.url ?? req, ORIGIN).href); if (hit) return hit.clone(); } },
  keys: async () => [...stores.keys()],
  delete: async (name) => stores.delete(name),
 };
 async function network(req) {
  if (!net.online) throw new TypeError('Failed to fetch');
  const path = new URL(req.url).pathname;net.hits.push(path);
  return new Response(`${path} @ ${net.release ?? 'r1'}`, { status: 200, headers: { 'Content-Type': path.startsWith('/api/') ? 'application/json' : 'text/html' } });
 }
 /** Evaluates a build of sw.js, as scripts/cache-assets.mjs emits it, and runs install + activate. */
 async function install(version, assets = []) {
  const built = source.replace(/const CACHE_VERSION = "[^"]+";/, `const CACHE_VERSION = ${JSON.stringify(version)};`)
   .replace('const PRECACHE_URLS = [', 'const PRECACHE_URLS = [\n' + assets.map(a => JSON.stringify(a) + ',').join('\n'));
  const handlers = {};const state = { skipped: false, claimed: false };
  const self = { location: new URL(ORIGIN), addEventListener: (t, f) => { handlers[t] = f; }, skipWaiting: async () => { state.skipped = true; }, clients: { claim: async () => { state.claimed = true; } } };
  vm.runInNewContext(built, { self, caches, fetch: network, Response, Request, URL, Promise, console });
  const lifecycle = async (type) => { let p;handlers[type]({ waitUntil: (x) => { p = x; } });await p; };
  await lifecycle('install');await lifecycle('activate');
  const request = async (path, init = {}) => {
   let responded;
   const req = new Request(new URL(path, ORIGIN), init);
   handlers.fetch({ request: init.navigate ? Object.defineProperty(req, 'mode', { value: 'navigate' }) : req, respondWith: (r) => { responded = r; } });
   return responded === undefined ? undefined : await responded;
  };
  return { request, state };
 }
 return { stores, net, install };
}

test('install precaches the shell and every bundled asset, then takes control', async () => {
 const b = browser();
 const sw = await b.install('byterush-r1', ['/_next/static/chunks/projects-r1.js']);
 assert.ok(sw.state.skipped && sw.state.claimed);
 const shell = [...b.stores.get('byterush-shell-byterush-r1').keys()].map(u => new URL(u).pathname);
 for (const path of ['/', '/topics', '/profile', '/offline.html', '/manifest.webmanifest', '/_next/static/chunks/projects-r1.js']) assert.ok(shell.includes(path), path);
});

test('loaded projects reload offline from cache while API calls are never cached (SR-B10)', async () => {
 const b = browser();
 const sw = await b.install('byterush-r1', ['/_next/static/chunks/projects-r1.js']);
 assert.equal(await (await sw.request('/api/sync')).text(), '/api/sync @ r1');
 await sw.request('/api/sync', { method: 'PUT', body: '{}' }).then(r => assert.equal(r, undefined));
 for (const store of b.stores.values()) assert.ok(![...store.keys()].some(u => u.includes('/api/')), 'API response was cached');
 b.net.online = false;
 assert.equal(await (await sw.request('/', { navigate: true })).text(), '/ @ r1');
 assert.equal(await (await sw.request('/_next/static/chunks/projects-r1.js')).text(), '/_next/static/chunks/projects-r1.js @ r1');
 assert.equal(await (await sw.request('/never-visited', { navigate: true })).text(), '/offline.html @ r1');
 await assert.rejects(sw.request('/api/sync'));
});

test('an upgrade drops the previous release caches and still serves the new shell offline', async () => {
 const b = browser();
 const v1 = await b.install('byterush-r1', ['/_next/static/chunks/projects-r1.js']);
 await v1.request('/_next/static/media/font.woff2');
 b.stores.set('unrelated-app-cache', new Map());
 b.net.release = 'r2';
 const v2 = await b.install('byterush-r2', ['/_next/static/chunks/projects-r2.js']);
 assert.deepEqual([...b.stores.keys()].sort(), ['byterush-shell-byterush-r2', 'unrelated-app-cache']);
 b.net.online = false;
 assert.equal(await (await v2.request('/', { navigate: true })).text(), '/ @ r2');
 assert.equal(await (await v2.request('/_next/static/chunks/projects-r2.js')).text(), '/_next/static/chunks/projects-r2.js @ r2');
 assert.equal((await v2.request('/_next/static/chunks/projects-r1.js')).status, 504);
});
