// After `npm run build`: every project graph must ship inside an asset the service worker precaches,
// so a loaded project can reload offline (SR-B10). API paths must never be precached.
import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const sw = await readFile('out/sw.js', 'utf8');
const list = sw.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/);
assert.ok(list, 'out/sw.js has no PRECACHE_URLS; run npm run build first');
const urls = [...list[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
assert.ok(!urls.some(u => u.startsWith('/api/')), 'an API path is precached');
const bundled = (await Promise.all(urls.filter(u => u.startsWith('/_next/static/')).map(u => readFile('out' + u, 'utf8')))).join('\n');
const dir = 'src/content/projects';
const projects = (await readdir(dir)).filter(f => f.endsWith('.json') && !['schema.json', 'stack-items.json'].includes(f));
const missing = [];
for (const f of projects) {
  const p = JSON.parse(await readFile(`${dir}/${f}`, 'utf8'));
  const beat = p.beats[p.startBeat].body.slice(0, 40);
  if (!bundled.includes(p.id) || !bundled.includes(JSON.stringify(beat).slice(1, -1).slice(0, 30))) missing.push(p.id);
}
assert.deepEqual(missing, [], `project graphs missing from precached assets: ${missing.join(', ')}`);
console.log(`Offline shell precaches ${urls.length} URLs covering all ${projects.length} project graphs.`);
