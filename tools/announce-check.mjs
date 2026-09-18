#!/usr/bin/env node
// ONE SENTENCE, ONE LIVE REGION (ADR-0126). — 2026-09-16
//
// ## What went wrong
//
// `#status` is `role="status" aria-live="polite"`, and so is every surface's own
// `*-live` region. Five files reached for `#status` themselves, so a surface
// could write its own region AND the lasting one with the same words — which is
// one sentence announced twice to a screen reader. Seven sites did exactly that
// and nothing could see it, because the duplication was spread across two files
// and looked locally correct in both.
//
// It arrived as the fix for the opposite defect. `work.ts`'s helper wrote both
// on purpose, because `#nextup-live` was `visually-hidden` and a sighted reader
// learned nothing from a failure; `replan.ts` wrote both because resolving the
// last card hides the section that carries the sentence. Both reasonings were
// right. 3.24.5 made six of those regions visible and left the second write
// standing with its premise gone.
//
// ## The rule, and why it needs no list
//
// A file that OWNS a live region may not name `#status`. It calls `sayLasting`
// in `src/ui/announce.ts`, which writes exactly one region and never touches a
// local one — so a double announcement stops being something to notice and
// becomes something that cannot be expressed.
//
// The population is DERIVED, not declared: a file owns a live region if it
// names a `*-live` selector or sets `aria-live` itself. So `app.ts` is not in
// it — the capture surface owns `#status`, names it once, and builds a control
// inside it for the held-from-a-link undo, which is why the accessor stays a
// real element there rather than becoming a string helper. Nothing is exempt
// and nothing has to be remembered; add a surface with a live region and this
// holds it the same day.
//
// ## What it cannot see, stated rather than implied
//
// Whether the sentence ARRIVES. A region can be visible, written, and hidden in
// the same turn — the defect ADR-0126 exists for — and that is a fact about the
// act, not about the file. `tools/live-check.mjs` records the same limit for the
// same reason. This gate holds the narrower thing completely: no act can put one
// sentence in two announcing places.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const ANNOUNCER = 'src/ui/announce.ts';

let failed = 0;
const pass = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { failed += 1; console.log(`  FAIL  ${m}`); };

/** Every tracked TypeScript file under `src/`, path relative to the repo root. */
const walk = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { out.push(...walk(full)); continue; }
    if (name.endsWith('.ts')) out.push(full.slice(ROOT.length + 1));
  }
  return out.sort();
};

console.log('\n=== one sentence, one live region ===\n');

const files = walk(SRC);
if (files.length === 0) {
  fail('no source files found at all — this gate is measuring nothing');
}

// A file addresses a live region when it names one by the app's convention or
// sets the attribute itself. Both spellings, because the sync surface builds
// its region at runtime and has no id to match.
const ADDRESSES = /['"#][\w-]*-live\b|setAttribute\(\s*['"]aria-live['"]/;
// Naming the lasting region, by selector or by id. `sayLasting` is the route.
const NAMES_STATUS = /['"]#status['"]|getElementById\(\s*['"]status['"]/;
// AND THE RULE IS ABOUT WRITING, NOT NAMING — which the first version of this
// gate got wrong and `src/plain.ts` proved in one run. That file names `#status`
// and half the app's live regions, because it is the DECLARATION of what
// survives the stripped surface; it assigns nothing and can announce nothing.
// A list of selectors cannot say a sentence twice. So a file joins the
// population only when it also writes text into the DOM.
const WRITES = /\.textContent\s*=|\.replaceChildren\(|\.append\(/;

const owners = [];
const namers = [];
for (const rel of files) {
  const src = readFileSync(join(ROOT, rel), 'utf8');
  if (!WRITES.test(src)) continue;
  if (ADDRESSES.test(src)) owners.push(rel);
  if (rel !== ANNOUNCER && NAMES_STATUS.test(src)) namers.push(rel);
}

if (owners.length === 0) {
  fail('no file owns a live region — the convention this reads has changed and '
    + 'this gate is now measuring nothing');
} else {
  pass(`${owners.length} file(s) own a live region: ${owners.join(', ')}`);
}

// THE ANNOUNCER HAS TO BE THERE AND HAS TO BE THE ONLY WRITER IN IT. A gate
// whose subject is missing reports green on every file, which is the fail-open
// this repo has paid for more than once.
let announcer = '';
try { announcer = readFileSync(join(ROOT, ANNOUNCER), 'utf8'); } catch { /* reported below */ }
if (!announcer) {
  fail(`${ANNOUNCER} is missing — the rule has no single decision point, so `
    + 'every check below is about nothing');
} else if (!NAMES_STATUS.test(announcer)) {
  fail(`${ANNOUNCER} does not name #status — it is supposed to be the one place `
    + 'that does, so either it has been rewritten or the region has been renamed');
} else if (ADDRESSES.test(announcer)) {
  fail(`${ANNOUNCER} names a local live region as well as #status — the one `
    + 'function that exists to stop a sentence having two homes must not have two');
} else {
  pass(`${ANNOUNCER} names the lasting region and no local one`);
}

for (const rel of owners) {
  if (namers.includes(rel)) {
    fail(`${rel} owns a live region AND names #status — one act can put one `
      + 'sentence in two announcing places from here, which a screen reader reads '
      + `twice. Call sayLasting() from ${ANNOUNCER} instead, and do not also write `
      + 'the local region.');
  } else {
    pass(`${rel} owns a live region and leaves the lasting one to the announcer`);
  }
}

// The other direction, so a file that stops owning a region does not quietly
// regain the right to reach for `#status`.
for (const rel of namers) {
  if (!owners.includes(rel)) {
    pass(`${rel} names #status and owns no live region of its own`);
  }
}

console.log(`\n  ${files.length} source file(s) read, ${owners.length} owning a live region.\n`);
if (failed > 0) {
  console.log(`${failed} failure(s).\n`);
  process.exit(1);
}
console.log('No act can put one sentence in two announcing places.\n');
process.exit(0);
