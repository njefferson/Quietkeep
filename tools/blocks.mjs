#!/usr/bin/env node
// THE REGISTER THAT DECIDES v1 MAY NOT SIT EMPTY. — 2026-09-16
//
//   node tools/blocks.mjs
//
// ## What this is about, and it is the only thing that decides v1
//
// `NOTES.md` carries two definitions of version one and they contradict. One
// says v1 is reached when every Must item exists — "measured against the Must
// list and nothing else". The other, written four days EARLIER, says "Not a
// checklist of features", thirty consecutive working days, and "This is the
// only thing that decides v1 is finished".
//
// The Must list is nine mechanisms and all nine are struck through. The gate
// asks whether a day's work can be carried, which no list of mechanisms can
// answer. So 1.0.0's claim — every capability in place and in daily use — was
// true of the list and said nothing about the gate. Mechanism-completeness was
// measured and called product-completeness.
//
// ## Why the register exists and why it is empty
//
// The gate has run every working day since 0.17.0 and the app has failed it
// every working day. NOTES says the rest in its own words: "The failures are
// the dataset and this repo has none of them. Every day that reset is a defect
// report nobody wrote down."
//
// The Block register is where they go. It was REDEFINED on 2026-08-05, before
// it ever held an entry, because the first version asked for "one line per
// ended day: the date, what ended it" — which invites somebody's actual day
// into a public file, and it was about to receive one. The redefinition is the
// design: the SHAPE of what blocked a day, its CLASS, and the release that
// answers it. Never an instance; the instance lives outside the repo, enforced
// by the HIS_LIFE class in the hub's `privacy-check.mjs`.
//
// Six weeks later it reads `*(no entries yet)*` — because nothing ever asked.
// Every session closed by asking for a promote and an on-device pass, which
// hub LESSONS §40 names as the wrong two questions.
//
// ## What this checks, and what it refuses to pretend
//
// SHAPE ONLY, on `tools/questions.mjs`'s model, whose header states the rule:
// it "cannot know whether a status is TRUE, and a gate that pretended to would
// be the false receipt the file already was". So this cannot know whether an
// entry is honest, whether a class is right, or whether a release answered
// anything. It knows three things:
//
//   1. The register is there and its rules are still stated.
//   2. Every entry names a CLASS — hard block or adjustment — and either a
//      release that answered it or an open marker.
//   3. **It is not empty while `NOTES.md` describes the gate as running.**
//
// The third is the one with teeth, and it is the whole point. An empty register
// under a paragraph saying the gate resets daily is a contradiction the file
// makes about itself: either days are being lost and nothing is recording them,
// or the paragraph is wrong. Both are worth refusing a commit over. This check
// would have failed every day for six weeks.
//
// ## What it cannot do, said plainly
//
// It cannot make anybody write an entry, and it cannot tell a true entry from
// an invented one. A gate over an owner-maintained list never can — which is
// why the register's own rule is that a session may READ what is described and
// design from its shape, and may not write the particulars down.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const NOTES = join(root, 'NOTES.md');

let failed = 0;
const pass = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { failed += 1; console.log(`  FAIL  ${m}`); };

const text = readFileSync(NOTES, 'utf8');
const lines = text.split('\n');

console.log('\n=== the register that decides v1 ===\n');

// ── The register has to be there, and so do its rules ────────────────────────
// A gate whose subject is missing reports green on nothing, which is the
// fail-open this repo has paid for more than once.
const head = lines.findIndex((l) => /^### The Block register\s*$/.test(l));
if (head === -1) {
  fail('NOTES.md has no `### The Block register` heading — the instrument that '
    + 'decides v1 is gone, and this check cannot run');
  console.log('\n1 failure(s).\n');
  process.exit(1);
}

// Where it ends: the next heading of the same level or higher.
let end = lines.length;
for (let i = head + 1; i < lines.length; i += 1) {
  if (/^#{1,3} /.test(lines[i])) { end = i; break; }
}
const body = lines.slice(head, end);
const block = body.join('\n');
pass(`the register is at NOTES.md:${head + 1}, ${body.length} line(s)`);

// THE RULES ARE PART OF THE INSTRUMENT. The redefinition is the only reason
// this register is safe to keep, so a version of it that has lost the rule is
// the trap it was rescued from, back again.
const RULES = [
  ['never an instance', /never an instance/i],
  ['the instance lives outside the repo', /outside the repo/i],
  ['a class per entry', /hard block|adjustment/i],
];
for (const [name, re] of RULES) {
  (re.test(block) ? pass : fail)(
    `the register still states its rule — ${name}`);
}

// ── Every entry names a class and a resolution ───────────────────────────────
// An entry is a top-level list item in the register that is not the placeholder.
const PLACEHOLDER = /^\s*-\s*\*\(no entries yet\)\*\s*$/;
const entries = body.filter((l) => /^\s*-\s+\S/.test(l) && !PLACEHOLDER.test(l));
const emptyMarked = body.some((l) => PLACEHOLDER.test(l));

for (const e of entries) {
  const oneLine = e.trim().replace(/\s+/g, ' ');
  const shown = oneLine.length > 90 ? `${oneLine.slice(0, 90)}…` : oneLine;
  const hasClass = /hard block|adjustment/i.test(e);
  const hasEnd = /answered in \d|\bopen\b|not answered/i.test(e);
  if (!hasClass) {
    fail(`an entry names no class — say hard block or adjustment: ${shown}`);
  } else if (!hasEnd) {
    fail(`an entry names no resolution — say "answered in <release>" or that it `
      + `is still open: ${shown}`);
  } else {
    pass(`entry: ${shown}`);
  }
}

// ── AND IT IS NOT EMPTY WHILE THE GATE IS DESCRIBED AS RUNNING ───────────────
// The one assertion with teeth. Both halves are read out of the file rather
// than assumed, so this cannot fire on a repo that has stopped claiming the
// gate runs — if that paragraph is ever removed or rewritten, this check stops
// having an opinion rather than starting to lie.
const claimsRunning = /GATE HAS BEEN RUNNING SINCE|failed it every working day/i.test(text);
if (!claimsRunning) {
  pass('NOTES.md no longer claims the gate is running daily, so an empty '
    + 'register is not a contradiction — this check stands down');
} else if (entries.length === 0) {
  fail('the register is EMPTY while NOTES.md says the gate runs every working '
    + 'day and the app fails it every working day. Those cannot both be true: '
    + 'either days are being lost with nothing recording them, or that '
    + 'paragraph is wrong. An entry is the SHAPE of what blocked a day, its '
    + 'CLASS, and the release that answers it — never an instance. The worked '
    + 'example is in the register itself.');
} else {
  pass(`the gate is described as running and the register holds ${entries.length} `
    + `entr${entries.length === 1 ? 'y' : 'ies'}`);
}

if (entries.length > 0 && emptyMarked) {
  fail('the register holds entries AND still carries the `*(no entries yet)*` '
    + 'placeholder — one of the two is lying to whoever scans it');
}

console.log(`\n  ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}, `
  + `${claimsRunning ? 'gate described as running' : 'gate not described as running'}.\n`);
if (failed > 0) {
  console.log(`${failed} failure(s).\n`);
  process.exit(1);
}
console.log('The register says what it holds.\n');
process.exit(0);
