#!/usr/bin/env node
// A SENTENCE WRITTEN FOR A READER HAS TO REACH ONE. — 2026-09-16
//
// ## What went wrong three times
//
// A live region (`role="status"`, `aria-live="polite"`) is how this app tells
// somebody what just happened. Written `visually-hidden`, it tells only a
// screen reader, and a sighted reader watches the screen change with nothing
// saying what changed or why.
//
// `#detail-live` shipped hidden and was found by the third cold read (3.23.8).
// `#triage-live` was found while fixing that one (3.23.11). `#nextup-live` was
// found by the seventh cold read, carrying 3.23.28's fix, and by then it was
// the THIRD instance of one mistake — each fixed alone, each time as though it
// were the only one.
//
// Then somebody counted instead of noticing: ten regions, EIGHT of them
// hidden, and the two that were not were exactly the two already fixed. So the
// previous fixes were themselves the evidence the class was being answered per
// instance. Six became visible in 3.24.5 and one was deleted for never having
// been written to at all.
//
// ## Why this is a DECLARED list and not a sweep
//
// "No hidden live region" is the obvious rule and it is WRONG. It would fail
// `#replan-sheet-live`, which is correct as it stands: both of its sentences
// are also written to the visible `#replan-sheet-error`, which is deliberately
// NOT itself a live region. That is the pattern worth copying, and a blanket
// rule fires on exactly the thing to imitate.
//
// A gate that fires on correct work is one people learn to route around —
// `privacy-check.mjs`'s own lesson, and `help-check.mjs`'s. So each hidden
// region NAMES the visible element that says the same thing, and the gate
// holds the naming rather than the hiding.
//
// ## The rule
//
// Every element in `public/index.html` with `role="status"`, `role="alert"` or
// `aria-live` is either
//
//   VISIBLE — no `visually-hidden` class — or
//   DECLARED in `.live-allow` as `region :: visible :: why`, ids bare
//
// and a declaration is only honored when the element it names
//
//   EXISTS in the markup, and
//   IS NOT ITSELF A LIVE REGION.
//
// That last condition is the one with teeth. `#status` is itself `aria-live`,
// so "the sentence also goes to `#status`" does not make a hidden region
// acceptable — it makes a screen reader hear the same sentence twice. The
// declaration has to name somewhere a sighted reader can read and a screen
// reader is not told about again.
//
// BOTH DIRECTIONS, so a declaration cannot outlive what it exempts: a row
// naming a region that is no longer hidden FAILS, the way `.quote-allow` and
// `.third-person-allow` fail on a stale row. Every covered region prints on
// every run.
//
// STATIC AND SOURCE-ONLY. Whether a class is on an element is a fact about the
// file, so this needs no browser and runs in milliseconds. What it cannot ask
// is whether the sentence ever ARRIVES — a region can be visible and still be
// written and hidden in the same turn, which is true of `#replan-live` and
// `#reentry-live` today and is recorded in NOTES.md as a design question. The
// accessibility walk's registry is what measures a sentence where it appears.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const HTML = join(ROOT, 'public/index.html');
const ALLOW = join(ROOT, '.live-allow');

let failed = 0;
const pass = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { failed += 1; console.log(`  FAIL  ${m}`); };

const html = readFileSync(HTML, 'utf8');

/** Every element that announces: id, class, and whether it is hidden. */
const regions = new Map();
for (const m of html.matchAll(/<(\w+)\s+([^>]*?)>/g)) {
  const attrs = m[2];
  const announces = /\baria-live\s*=/.test(attrs)
    || /\brole\s*=\s*"(status|alert)"/.test(attrs);
  if (!announces) continue;
  const id = (attrs.match(/\bid\s*=\s*"([^"]+)"/) || [])[1];
  if (!id) {
    fail(`a live region with no id — it cannot be declared, named or measured: <${m[1]} ${attrs.slice(0, 60)}…>`);
    continue;
  }
  const cls = (attrs.match(/\bclass\s*=\s*"([^"]*)"/) || [, ''])[1];
  regions.set(id, { tag: m[1], cls, hidden: /\bvisually-hidden\b/.test(cls) });
}

if (regions.size === 0) {
  fail('no live regions found at all — this gate is measuring nothing, which is never the right answer');
}

/** `region :: visible :: why`, one per line, ids BARE, `#` starts a comment. */
const declared = new Map();
if (existsSync(ALLOW)) {
  for (const raw of readFileSync(ALLOW, 'utf8').split('\n')) {
    const line = raw.trim();
    // IDS ARE BARE HERE — `replan-sheet-live`, not `#replan-sheet-live` — so
    // that `#` can mean "comment" and nothing else. Two bugs in a row taught
    // that. Writing ids with a leading `#` made every row look like a comment
    // and the gate reported the region undeclared beside "0 declared", which is
    // a file being IGNORED rather than wrong. Treating "# with a `::` in it" as
    // a row then swallowed the format example in the header comment, which has
    // a `::` in it by definition. A separator that can also start a line is not
    // a separator; taking the `#` out of the data removes the ambiguity instead
    // of arbitrating it. A leading `#` on an id is still tolerated below.
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('::').map((s) => s.trim());
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      fail(`.live-allow: a row must read "region :: visible :: why", ids without a leading # — got "${line}"`);
      continue;
    }
    declared.set(parts[0].replace(/^#/, ''), { visible: parts[1].replace(/^#/, ''), why: parts[2] });
  }
}

// THE POPULATION IS EVERY ANNOUNCING ELEMENT, not the `*-live` family. The
// audit that prompted this gate counted ten and it was counting one naming
// convention; there are 36, because every `.storage-note` in the ⓘ panel is
// `role="status" aria-live="polite"` too. Deriving the population from the
// ATTRIBUTES rather than from a name is what makes that true without anybody
// having to notice — the same reason `pages-a11y.mjs` derives its pages from
// the app's own links rather than from a list.
console.log('\n=== every sentence written for a reader reaches one ===\n');

for (const [id, r] of [...regions].sort()) {
  if (!r.hidden) {
    pass(`#${id} shows its own sentence`);
    continue;
  }
  const d = declared.get(id);
  if (!d) {
    fail(`#${id} is a live region carrying class "${r.cls}" — a sighted reader is told nothing. `
      + 'Either drop `visually-hidden` (the `.receipt` class is the shape six others use), '
      + 'or declare in .live-allow which visible element says the same thing.');
    continue;
  }
  if (!regions.has(d.visible) && !new RegExp(`\\bid\\s*=\\s*"${d.visible}"`).test(html)) {
    fail(`#${id} names #${d.visible} as its visible counterpart, and no element with that id exists`);
    continue;
  }
  if (regions.has(d.visible)) {
    fail(`#${id} names #${d.visible}, which is ITSELF a live region — so a screen reader is `
      + 'told the same sentence twice. A counterpart has to be somewhere a sighted reader can '
      + 'read and a screen reader is not told about again.');
    continue;
  }
  pass(`#${id} is hidden, and #${d.visible} says the same thing — ${d.why}`);
}

// The other direction: a row cannot outlive the thing it exempts.
for (const [id, d] of [...declared].sort()) {
  if (!regions.has(id)) {
    fail(`.live-allow declares #${id}, which is not a live region in the markup — `
      + 'the row has outlived what it exempted');
  } else if (!regions.get(id).hidden) {
    fail(`.live-allow declares #${id} as needing a counterpart (${d.why}), and it is VISIBLE now — `
      + 'drop the row');
  }
}

console.log(`\n  ${regions.size} live region(s) read, ${declared.size} declared.\n`);
if (failed > 0) {
  console.log(`${failed} failure(s).\n`);
  process.exit(1);
}
console.log('Every region either shows its sentence or names what does.\n');
process.exit(0);
