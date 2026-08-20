#!/usr/bin/env node
// EVERY OPEN QUESTION SAYS WHETHER IT IS STILL OPEN.
//
//   node tools/questions.mjs        (exits non-zero on a question that does not)
//
// `NOTES.md`'s question list is where a session looks to answer "what is waiting
// on him". It could not answer that.
//
// **TEN OF FOURTEEN QUESTIONS HAD NO STATUS LINE AT ALL**, so open was inferred
// from absence — and every one of the ten was in fact closed, several of them
// for weeks, one of them BUILT. The list of open questions contained no open
// questions and said nothing to that effect.
//
// **AND THE ONE THAT DID SAY WAS WRONG.** Q-11 carried a `CLOSED` bullet and,
// four lines below it, a Status line reading *asked, not answered — and NOBODY
// PUT THE QUESTION TO HIM*. Three other files already held the answer: the
// research entry that refuses the alternative in terms, the ADR recording that
// refusal, and a source comment saying the ranking reading was established by
// measurement rather than by asking. The question was answered everywhere except
// where it was tracked, and the tracked line is the one a person scans.
//
// So this checks SHAPE, the way `collisions.mjs` does for the research
// catalogue, and for the same reason: it cannot know whether a status is TRUE,
// and a gate that pretended to would be the false receipt the file already was.
// What it can do is make the claim explicit and refuse a block that contradicts
// itself, so a person reading the list can see what they are trusting.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lines = readFileSync(join(root, 'NOTES.md'), 'utf8').split('\n');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

console.log('\nEvery question says whether it is still open\n');

/** A question opens a top-level list item; the block runs to the next one. */
const starts = [];
lines.forEach((l, i) => { if (/^- \*\*Q-\d+/.test(l)) starts.push(i); });

// NON-EMPTY FIRST. A heading rename or a reflow would leave this iterating
// nothing and reporting green about a list it never found (hub LESSONS 100).
if (starts.length < 10) {
  fail(`only ${starts.length} question block(s) found — the list has moved or changed shape`);
  console.error('\nThis gate reads `- **Q-NN` at the start of a line. If the list was\n'
    + 'reformatted, fix the pattern here in the same commit.\n');
  process.exit(1);
}
ok(`${starts.length} question blocks`);

/** What a status may claim. Closed, so nobody can invent a hedge that reads like one. */
const OPEN = /^\s*- Status:\s*\*\*(?:Open|OPEN|Asked)\b/;
const SETTLED = /^\s*- Status:\s*\*\*(?:Closed|CLOSED|Answered|ANSWERED|Deferred|DEFERRED)\b/;
/** A bullet claiming the work is done, anywhere in the block. */
const DONE_BULLET = /^\s*- \*\*(?:CLOSED|Closed|ANSWERED|Answered|BUILT|SHIPPED)\b/;

let noStatus = 0;
let badStatus = 0;
let contradiction = 0;

for (let k = 0; k < starts.length; k++) {
  const s = starts[k];
  const end = k + 1 < starts.length ? starts[k + 1] : lines.length;
  const block = lines.slice(s, end);
  const id = /^- \*\*(Q-\d+)/.exec(block[0])[1];

  const statusLines = block.filter((l) => /^\s*- Status:/.test(l));
  if (statusLines.length === 0) {
    fail(`${id} states no Status. Open is not a thing to infer from silence — say which it is.`);
    noStatus++;
    continue;
  }
  const status = statusLines[0];
  const isOpen = OPEN.test(status);
  const isSettled = SETTLED.test(status);
  if (!isOpen && !isSettled) {
    fail(`${id} has a Status that names none of Open, Closed, Answered, Deferred:`);
    console.log(`          ${status.trim().slice(0, 96)}`);
    badStatus++;
    continue;
  }

  // THE CONTRADICTION Q-11 CARRIED FOR TWO DAYS. A block saying CLOSED inside
  // itself while its Status still says open is worse than either alone: the
  // reader who scrolls finds the close and the reader who scans finds the
  // question, and the second is the common case.
  if (isOpen && block.some((l) => DONE_BULLET.test(l))) {
    fail(`${id} says Open in its Status while a bullet inside it says CLOSED, ANSWERED, BUILT or SHIPPED.`);
    contradiction++;
  }
}

if (noStatus === 0) ok('every question states a Status');
if (badStatus === 0) ok('every Status names one of Open, Closed, Answered, Deferred');
if (contradiction === 0) ok('no question contradicts itself about whether it is open');

const open = starts.filter((s, k) => {
  const end = k + 1 < starts.length ? starts[k + 1] : lines.length;
  return lines.slice(s, end).some((l) => OPEN.test(l));
}).length;
console.log(`\n  ${open} question(s) currently open, ${starts.length - open} settled.`);

if (failed > 0) {
  console.error('\nThe question list is where somebody looks to answer "what is waiting');
  console.error('on him". Ten of fourteen once had no status at all, and every one of');
  console.error('the ten was already closed.\n');
  process.exit(1);
}
console.log('\nThe list says what is open, and nothing in it disagrees with itself.\n');
