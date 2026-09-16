#!/usr/bin/env node
// THE TWO DOCUMENTS THAT DECIDE WHAT TO BUILD WERE THE ONLY UNGATED LISTS IN
// THE REPO. — 2026-09-16
//
//   node tools/roadmaps.mjs
//
// ## The mechanism, and it is the answer to "why is the app never finished"
//
// Effort flows to what is measured. `questions.mjs` gates the Open questions
// list, `collisions.mjs` gates the research catalog, `adr-index.mjs` gates the
// decision index, and around sixty gates hold the app to what it says about
// itself. Nothing at all held the two files that decide WHICH WORK HAPPENS.
//
// So both went stale, and staleness in a plan does not look like staleness. An
// out-of-date roadmap reads as a roadmap. `docs/what-it-should-be.md` was
// written at 1.42.x and still listed its load-bearing item as work to do; that
// item had shipped at 2.0.0, about a hundred releases earlier, and the document
// itself calls it the whole design. Measured on 2026-09-16: five weeks stale,
// and one of its four items refused by an ADR accepted nineteen days after the
// document was written. Meanwhile `docs/structural-assessment.md` carried a
// seven-phase remedy whose Phase 0 was six named dead ends, with no status line
// under any phase — its own header says "when a phase lands … this file gets a
// one-line status under that phase", which is prose, and prose is what this
// repo has repeatedly watched fail to refuse anything.
//
// And neither plan cited the other, while they CONFLICT: one pays to
// standardize a count the other proposes deleting. `NOTES.md` — the file every
// session is told to read first, and which calls itself the repo source of
// truth — named one of the two and had never named the other.
//
// ## What this checks
//
// SHAPE ONLY, on `questions.mjs`'s model, whose header states the limit both
// share: it cannot know whether a status is TRUE, and a gate that pretended to
// would be the false receipt the file already was. Five things:
//
//   1. The population, BOTH DIRECTIONS. A plan declares itself with a visible
//      line; `NOTES.md` carries a section naming them. Every plan named exists
//      and declares itself; every document that declares itself is named.
//   2. Each plan states when it was last measured and at which release, and
//      that release is one CHANGELOG.md actually carries.
//   3. Every item names a state from a closed set, and no item names two.
//   4. An item that says DONE, REFUSED or MOOT names the release or the record
//      that makes it so. This is the one with teeth: the first version of one
//      such line cited a SELECTOR, was wrong about it, and read exactly like
//      the corrected line that cites an ADR.
//   5. Each plan cites every other, because they conflict and a session reading
//      one has no way to learn that from inside it.
//
// The gap between the last measurement and the current release is PRINTED and
// never failed. A threshold would be arbitrary, and a gate that fires on an
// honest document is one people learn to route around — which is the lesson
// `privacy-check.mjs` and `tour-fresh` both cost a release each to establish.
//
// ## What it cannot do, said plainly
//
// It cannot know whether an item's state is honest, and it cannot know whether
// a cited release did what the line says it did. What it can do is make every
// claim explicit, refuse a claim with nothing behind it, and print how long it
// has been since anybody looked.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed += 1; };

console.log('\nThe plans of record say what state they are in\n');

// ── The declaration, and the section that names them ─────────────────────────
// A VISIBLE line rather than an HTML comment. The claim "this is a plan of
// record, held to these rules" is something a reader of the document needs as
// much as the gate does, and a marker nobody can see is a marker nobody
// maintains.
const DECLARES = /^\*\*Plan of record\.\*\*/m;
const SECTION = '### The plans of record';

const notes = read('NOTES.md');
const notesLines = notes.split('\n');

const head = notesLines.findIndex((l) => l.trim() === SECTION);
if (head === -1) {
  fail(`NOTES.md has no \`${SECTION}\` section. The file that calls itself the `
    + `repo source of truth named one of the two plans and never named the `
    + `other, which is how a session choosing what to build next never met it.`);
  console.log('\n1 failure(s).\n');
  process.exit(1);
}
let end = notesLines.length;
for (let i = head + 1; i < notesLines.length; i += 1) {
  if (/^#{1,3} /.test(notesLines[i])) { end = i; break; }
}
const section = notesLines.slice(head, end).join('\n');

/** Named as a markdown link to a path under docs/. */
const named = [...section.matchAll(/\]\((docs\/[\w./-]+\.md)\)/g)].map((m) => m[1]);
const unique = [...new Set(named)];

// NON-EMPTY FIRST, and at two rather than one: the whole point of the mutual
// citation check is that there is more than one plan, so a version of this that
// found a single document would report green on a check it never ran (hub
// LESSONS 100).
if (unique.length < 2) {
  fail(`\`${SECTION}\` names ${unique.length} plan(s). It has to name every `
    + `document that decides what gets built — there were two, and they `
    + `conflicted.`);
  console.log('\n1 failure(s).\n');
  process.exit(1);
}
ok(`NOTES.md names ${unique.length} plans of record`);

// ── Both directions ──────────────────────────────────────────────────────────
// A named file that does not declare itself, and a declaring file nobody named,
// are the same defect from opposite sides. The second is the one that happened.
const tracked = execFileSync('git', ['ls-files', 'docs'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter((p) => p.endsWith('.md'));

const declaring = tracked.filter((p) => DECLARES.test(read(p)));

for (const p of unique) {
  if (!existsSync(join(root, p))) {
    fail(`NOTES.md names \`${p}\` and there is no such file`);
  } else if (!declaring.includes(p)) {
    fail(`\`${p}\` is named as a plan of record and does not declare itself. `
      + `Its first line after the title block is \`**Plan of record.**\`, which `
      + `is what tells a reader the rules this file is held to.`);
  }
}
for (const p of declaring) {
  if (!unique.includes(p)) {
    fail(`\`${p}\` declares itself a plan of record and NOTES.md does not name `
      + `it. A plan a session never meets decides nothing.`);
  }
}
if (failed === 0) ok('every plan is named and declares itself, both directions');

// ── Each plan's own shape ────────────────────────────────────────────────────
const TRIPLET = /\b(\d+)\.(\d+)\.(\d+)\b/;
const ADR = /\bADR-\d{4}\b/;
/** Closed, so nobody can invent a hedge that reads like a state. */
const STATES = ['DONE', 'OPEN', 'REFUSED', 'MOOT', 'BLOCKED'];
const STATE_RE = new RegExp(`\\b(${STATES.join('|')})\\b`, 'g');
/** A state that asserts the item is settled owes evidence. OPEN and BLOCKED
 *  assert nothing about the past, so they owe none. */
const OWES_EVIDENCE = ['DONE', 'REFUSED', 'MOOT'];

const changelog = read('CHANGELOG.md');
const releases = [...changelog.matchAll(/^## (\d+\.\d+\.\d+) —/gm)].map((m) => m[1]);
if (releases.length === 0) {
  fail('CHANGELOG.md yielded no release headings — this check cannot verify a '
    + 'measurement point, so fix the pattern here in the same commit');
}

for (const p of unique.filter((q) => declaring.includes(q))) {
  const text = read(p);
  const lines = text.split('\n');
  console.log(`\n  ${p}`);

  // WHEN IT WAS LAST LOOKED AT, AND AGAINST WHAT. A plan with no measurement
  // point cannot be stale, which is the problem: nothing about it is checkable
  // and every reader supplies their own assumption about its age.
  const status = lines.findIndex((l) => /^## STATUS — measured \d{4}-\d{2}-\d{2}, at \d+\.\d+\.\d+\b/.test(l));
  if (status === -1) {
    fail(`${p} has no \`## STATUS — measured <date>, at <release>\` heading. `
      + `Without one there is no way to tell a current plan from a five-week-old `
      + `one, and they read identically.`);
    continue;
  }
  const at = TRIPLET.exec(lines[status].split(', at ')[1])[0];
  const when = /(\d{4}-\d{2}-\d{2})/.exec(lines[status])[1];
  if (releases.length && !releases.includes(at)) {
    fail(`${p} says it was measured at ${at}, which is not a release in `
      + `CHANGELOG.md. A measurement point that never shipped is a false receipt.`);
  } else if (releases.length) {
    const since = releases.indexOf(at);
    ok(`measured ${when} at ${at} — ${since} release(s) have shipped since`);
  }

  // THE ITEMS. Top-level bullets of the STATUS section; the block runs to the
  // next one, because the evidence for a state is usually two lines below it.
  let stop = lines.length;
  for (let i = status + 1; i < lines.length; i += 1) {
    if (/^#{1,2} /.test(lines[i])) { stop = i; break; }
  }
  const starts = [];
  for (let i = status + 1; i < stop; i += 1) if (/^- \S/.test(lines[i])) starts.push(i);

  if (starts.length === 0) {
    fail(`${p}'s STATUS section holds no items. It is the section a session `
      + `reads to learn what remains.`);
    continue;
  }

  for (let k = 0; k < starts.length; k += 1) {
    const s = starts[k];
    const last = k + 1 < starts.length ? starts[k + 1] : stop;
    const block = lines.slice(s, last).join('\n');
    const label = lines[s].replace(/^- /, '').replace(/\*\*/g, '').trim().slice(0, 72);

    const found = [...new Set((lines[s].match(STATE_RE) || []))];
    if (found.length === 0) {
      fail(`an item names no state — say one of ${STATES.join(', ')} on its `
        + `first line: ${label}`);
      continue;
    }
    // THE CONTRADICTION Q-11 CARRIED FOR TWO DAYS, one document over. A line
    // that says two things says nothing, and the reader takes whichever they
    // read first.
    if (found.length > 1) {
      fail(`an item names ${found.length} states (${found.join(', ')}) on one `
        + `line: ${label}`);
      continue;
    }
    const [state] = found;
    if (OWES_EVIDENCE.includes(state) && !TRIPLET.test(block) && !ADR.test(block)) {
      fail(`an item says ${state} and names neither a release nor an ADR. `
        + `Say what makes it so — the first version of one of these cited a `
        + `selector and was wrong about it: ${label}`);
      continue;
    }
    ok(`${state} — ${label}`);
  }

  // THEY CONFLICT, SO EACH HAS TO SAY THE OTHER EXISTS. One plan pays to
  // standardize a count the other proposes deleting, and a session reading
  // either one cannot learn that from inside it.
  for (const other of unique) {
    if (other === p) continue;
    (text.includes(basename(other)) ? ok : fail)(
      `cites ${basename(other)}`
      + (text.includes(basename(other)) ? '' : ' — it does not, and the two plans conflict'));
  }
}

if (failed > 0) {
  console.error(`\n${failed} failure(s).`);
  console.error('\nThese are the documents that decide what gets built. Every other');
  console.error('list in this repo is gated; for as long as these two were not, the');
  console.error('one thing nothing measured was which work happens.\n');
  process.exit(1);
}
console.log('\nEvery plan says what state it is in, and what makes each state so.\n');
