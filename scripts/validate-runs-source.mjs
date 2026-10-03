#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "projects");
const files = (await readdir(root)).filter((f) => f.endsWith(".json") && !["schema.json", "stack-items.json"].includes(f));
let errors = 0;

const STATUS = new Set(["interested", "installed", "skipped"]);

function checkSetsStatus(f, where, arr) {
  if (arr === undefined) return;
  if (!Array.isArray(arr)) {
    console.error(f, where, "setsStatus must be array");
    errors++;
    return;
  }
  for (const s of arr) {
    if (!s?.itemId || !STATUS.has(s.status)) {
      console.error(f, where, "bad setsStatus entry", s);
      errors++;
    }
  }
}

for (const f of files) {
  const raw = await readFile(join(root, f), "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(f, "JSON parse error", e.message);
    errors++;
    continue;
  }
  const req = ["id", "title", "summary", "sourceGuide", "startBeat", "beats"];
  for (const k of req) {
    if (!(k in data)) {
      console.error(f, "missing", k);
      errors++;
    }
  }
  if (data.id + ".json" !== f) {
    console.error(f, "id/filename mismatch", data.id);
    errors++;
  }
  if (!data.beats?.[data.startBeat]) {
    console.error(f, "startBeat missing in beats");
    errors++;
  }
  for (const key of ["topics", "recommendsIfInterested", "recommendsIfInstalled"]) {
    if (key in data && !Array.isArray(data[key])) {
      console.error(f, key, "must be array");
      errors++;
    }
  }
  for (const [id, beat] of Object.entries(data.beats || {})) {
    if (beat.id !== id) {
      console.error(f, "beat key/id mismatch", id);
      errors++;
    }
    if (!beat.body) {
      console.error(f, id, "empty body");
      errors++;
    }
    const modes = [!!beat.continue, Array.isArray(beat.choices), !!beat.end].filter(Boolean).length;
    if (modes !== 1) {
      console.error(f, id, "need exactly one of continue|choices|end");
      errors++;
    }
    if (beat.continue && !data.beats[beat.continue]) {
      console.error(f, id, "continue → missing", beat.continue);
      errors++;
    }
    checkSetsStatus(f, id, beat.setsStatus);
    for (const ch of beat.choices || []) {
      if (!data.beats[ch.next]) {
        console.error(f, id, "choice → missing", ch.next);
        errors++;
      }
      checkSetsStatus(f, `${id}/${ch.label}`, ch.setsStatus);
    }
  }
}

const stackPath = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "projects", "stack-items.json");
const stack = JSON.parse(await readFile(stackPath, "utf8"));
if (!Array.isArray(stack) || !stack.length) {
  console.error("stack-items.json empty");
  errors++;
}
for (const item of stack) {
  if (!item.id || !item.label || !item.blurb || !Array.isArray(item.topics)) {
    console.error("stack-items bad entry", item);
    errors++;
  }
}

// Graph integrity: reachable from start, no dangling, prefer documenting terminals
for (const f of files) {
  const data = JSON.parse(await readFile(join(root, f), "utf8"));
  const beats = data.beats || {};
  const seen = new Set();
  const stackIds = [data.startBeat];
  while (stackIds.length) {
    const cur = stackIds.pop();
    if (seen.has(cur) || !beats[cur]) continue;
    seen.add(cur);
    const beat = beats[cur];
    if (beat.continue) stackIds.push(beat.continue);
    for (const ch of beat.choices || []) stackIds.push(ch.next);
  }
  for (const id of Object.keys(beats)) {
    if (!seen.has(id)) {
      console.error(f, "unreachable beat", id);
      errors++;
    }
  }
  const terminals = Object.values(beats).filter((b) => b.end);
  if (terminals.length < 1) {
    console.error(f, "no terminal end beat");
    errors++;
  }
}

if (errors) {
  console.error(`FAILED with ${errors} error(s)`);
  process.exit(1);
}
console.log(`OK ${files.length} runs, ${stack.length} stack items`);
