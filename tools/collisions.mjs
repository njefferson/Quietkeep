#!/usr/bin/env node
// THE COLLISION CATALOGUE HAS TO STAY HONEST — V2 stage 7.
//
// `docs/nd-collisions.md` was a false receipt in both directions: written once,
// touched once more to scrub attributions, while five of its routing proposals
// shipped. It claimed as unbuilt things that were built, and it stated
// well-replicated experimental findings and phrases somebody coined on a forum
// in exactly the same voice — so the app was built against both without anyone
// having to notice which was which.
//
// Nothing checked it, which is the whole reason it drifted. This is the check.
//
// ## What it holds, and what it deliberately does not
//
// It holds SHAPE, not content: every entry states how strong its evidence is,
// from a closed set, and states a routing mark, from a closed set. That is
// enough to stop the two failures that actually happened — an entry with no
// stated confidence, and a new entry written in the old undifferentiated voice.
//
// It does NOT check whether a routing mark is still true. That needs a human who
// knows what shipped, and a gate that pretended to know would be the same class
// of false receipt the file itself was. What this does is make the CLAIM
// explicit, so a person reading it can see what they are trusting.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const doc = readFileSync(join(root, 'docs/nd-collisions.md'), 'utf8');

/** What a stated confidence may be. Closed, so a new entry cannot invent a
 *  hedge that reads like a grade. */
const STRENGTHS = ['Strong', 'Moderate', 'Contested', 'Community', 'Disproven'];
/** What a routing mark may be. */
const ROUTES = ['V2-candidate', 'later', 'refuse', 'SHIPPED'];

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

console.log('\nThe collision catalogue stays honest (V2 stage 7)\n');

// Entries are `### N. Title`, and the body runs to the next one.
const marks = [...doc.matchAll(/^### (\d+)\.\s*(.+)$/gm)];
if (marks.length < 20) {
  fail(`only ${marks.length} entries found — the catalogue has been gutted or its headings changed shape`);
} else {
  ok(`${marks.length} entries`);
}

let noEvidence = 0;
let noRouting = 0;
let badStrength = 0;

for (let i = 0; i < marks.length; i++) {
  const start = marks[i].index;
  const end = i + 1 < marks.length ? marks[i + 1].index : doc.length;
  const body = doc.slice(start, end);
  const n = marks[i][1];
  const title = marks[i][2].slice(0, 44);

  const ev = body.match(/^- \*\*EVIDENCE\*\* — (.*)$/m);
  if (!ev) {
    fail(`entry ${n} (${title}) states no EVIDENCE — a reader cannot tell a replicated finding from a coined phrase`);
    noEvidence++;
  } else if (!STRENGTHS.some(g => ev[1].includes(`**${g}`))) {
    fail(`entry ${n} (${title}) grades itself outside the closed set: ${ev[1].slice(0, 50)}`);
    badStrength++;
  }

  const rt = body.match(/^- \*\*ROUTING PROPOSAL\*\* — (.*)$/m);
  if (!rt) {
    fail(`entry ${n} (${title}) states no ROUTING PROPOSAL`);
    noRouting++;
  } else if (!ROUTES.some(r => rt[1].includes(r))) {
    fail(`entry ${n} (${title}) routes itself outside the closed set: ${rt[1].slice(0, 50)}`);
  }
}

if (!noEvidence && !badStrength) ok('every entry says how strong its evidence is, from the closed set');
if (!noRouting) ok('every entry says how it routes, from the closed set');

// The scale itself has to be in the file, or the marks are private notation.
for (const g of STRENGTHS) {
  if (!new RegExp(`\\*\\*${g}\\*\\* —`).test(doc)) {
    fail(`the header does not define "${g}" — a grade nobody can look up is a grade nobody can check`);
  }
}
if (!failed) ok('and the header defines every grade it uses');

// THE FILE MUST AGREE WITH ITSELF ABOUT WHAT IS BUILT (2026-08-10).
//
// The gate above holds every ENTRY honest and never looked at the TOP 5 list at
// the bottom — a ranking of what to build next, written once and never revised.
// Four of its five had shipped, each recorded as `SINCE WRITTEN — SHIPPED` in
// the very entry the list points at. **One document, two answers, and only one
// half was gated.**
//
// This does NOT decide what shipped — the note at the top of this file is right
// that a gate pretending to know would be the same false receipt. It checks
// something a script CAN know: that two statements of the same fact, in one
// file, do not contradict each other. That is the general cure for this class,
// and it needs no knowledge of the app at all.
const top5 = doc.slice(doc.indexOf('## TOP 5 ROUTING PROPOSALS'));
const shipped = new Set();
for (const m of doc.matchAll(/^### (\d+)\./gm)) {
  const body = doc.slice(m.index, doc.indexOf('\n### ', m.index + 1) + 1 || undefined);
  if (/\*\*SINCE WRITTEN\*\* — \*\*SHIPPED/.test(body)) shipped.add(m[1]);
}
let disagreed = 0;
for (const m of top5.matchAll(/\(entry (\d+)\)\*\* — \*\*([^*]+)\*\*/g)) {
  const [, entry, claim] = m;
  const listSaysShipped = /SHIPPED/.test(claim);
  const entrySaysShipped = shipped.has(entry);
  if (listSaysShipped !== entrySaysShipped) {
    fail(`the TOP 5 list and entry ${entry} disagree about whether it shipped `
      + `(list: ${listSaysShipped ? 'SHIPPED' : 'not shipped'}, `
      + `entry: ${entrySaysShipped ? 'SHIPPED' : 'not shipped'})`);
    disagreed++;
  }
}
if (!disagreed) ok('the TOP 5 list agrees with every entry it points at about what shipped');

console.log(failed
  ? `\n${failed} failure(s). The catalogue is claiming more than it can back.\n`
  : '\nEvery entry states what it is built on and how it routes.\n');
process.exit(failed ? 1 : 0);
