#!/usr/bin/env node
// EVERY SURFACE IS AUDITED, AND THIS IS WHAT SAYS SO.
//
// `tools/a11y.mjs` measures contrast and accessible names against a REGISTRY:
// ninety-seven hand-written entries mapping a state name to a list of CSS
// selectors. Nothing checked that list against the set it is supposed to cover,
// so a surface could be built, shipped, and never measured, and every gate would
// stay green because a gate that is not told about a thing reports nothing about
// it rather than reporting a gap.
//
// **It had already happened.** `#upkeep` — a real section of the work surface,
// with its own heading and its own chips — had no REGISTRY entry at all. Its
// contrast and its accessible names had never been checked in either theme.
// Found by reading the file rather than by running it, which is the definition
// of a gap a gate should have held.
//
// ## This is `plain.mjs`'s trick, one surface out
//
// `tools/plain.mjs` already refuses to let the offer card drift from the list
// that strips it: it derives the true set of ids from the markup and fails on
// anything in neither list, in both directions. That is the only registry in
// this repo that cannot silently go stale, and this is the same move applied to
// the a11y walk's list.
//
// The repo's history is one long argument for it: `data-door` went stale inside
// a day, the target audit's element types hid four undersized controls for
// months, and the contents sheet is derived precisely so it cannot happen there.
// A hand-written list of things, with nothing checking it against the set it
// covers, is this codebase's most expensive recurring shape.
//
// ## What counts as a surface, and why the definition is cheap
//
// A `<section id="…">` in `public/index.html`. That is the marker the app
// already uses — seventeen of them, no nesting, every one with an id — so this
// gate needs no browser and no new convention. A section is COVERED when any
// REGISTRY selector names it or names something inside it.
//
// BOTH DIRECTIONS, like `plain.mjs`: a selector naming an id that no longer
// exists is a rule that has quietly stopped applying, which is how coverage
// shrinks without anybody deciding to shrink it.
//
// ## WHAT THIS GATE DOES NOT COVER, said out loud
//
// A section that is EMPTY in the markup and filled at runtime — the Menu sheet
// is one — has nothing a static reader can check, so this gate skips it and
// PRINTS that it skipped it. Both of the first draft's false alarms were this
// case: `#menu` looked uncovered while `'menu open'` audits its rows by class,
// and `#replan-new-date` looked dangling while `src/ui/replan.ts` creates it at
// runtime. A gate that cries wolf twice is one people learn to route around,
// which is the failure `privacy-check.mjs` names in its own header.
//
// Runtime-created ids ARE resolved for the dangling check, by reading the
// assignments in `src/`. Runtime-created CONTENT cannot be attributed to a
// section without a browser, and that half stays the walk's own business.
//
//   node tools/surfaces.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Every `.ts` under src/, for the runtime-id sweep below. */
const walkSrc = (dir = join(root, 'src')) => readdirSync(dir).flatMap((e) => {
  const p = join(dir, e);
  return statSync(p).isDirectory() ? walkSrc(p) : (p.endsWith('.ts') ? [p] : []);
});
const html = readFileSync(join(root, 'public/index.html'), 'utf8');
const walk = readFileSync(join(root, 'tools/a11y.mjs'), 'utf8');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed += 1; };

console.log('\nEvery surface is on the accessibility walk\n');

/** Comments stripped: a commented-out section is not a surface, and a selector
 *  mentioned in prose is not a selector that runs. */
const markup = html.replace(/<!--[\s\S]*?-->/g, ' ');

// ——— THE SURFACES ———
const allSections = [...markup.matchAll(/<section id="([a-z0-9-]+)"[\s\S]*?<\/section>/g)]
  .map((m) => ({
    id: m[1],
    html: m[0],
    ids: [...new Set([...m[0].matchAll(/id="([a-z0-9-]+)"/g)].map((x) => x[1]))],
    classes: [...new Set([...m[0].matchAll(/class="([^"]+)"/g)]
      .flatMap((x) => x[1].trim().split(/\s+/)))],
  }));

/** Filled at runtime, so a static reader can see nothing inside it. Skipped and
 *  SAID rather than skipped and hidden — a silent skip is how a gate reports
 *  green about a surface it never looked at. */
const runtimeOnly = allSections.filter((s) => !/<[a-z]/i.test(
  s.html.replace(/^<section[^>]*>/, '').replace(/<\/section>$/, '')));
const sections = allSections.filter((s) => !runtimeOnly.includes(s));

// ——— THE SELECTORS THE WALK ACTUALLY AUDITS ———
// The REGISTRY block, plus the top-level arrays it spreads into itself. Only
// these: a selector that appears elsewhere in the walk is something the driver
// CLICKS, and being clicked is not being measured.
const regStart = walk.indexOf('const REGISTRY = {');
const regEnd = walk.indexOf('\n};', regStart);
if (regStart < 0 || regEnd < 0) {
  fail('could not find the REGISTRY block in tools/a11y.mjs — this gate cannot run');
  process.exit(1);
}
const arrays = [...walk.matchAll(/^const [A-Z_]+ = \[[\s\S]*?\n\];/gm)].map((m) => m[0]);
const selectorSource = walk.slice(regStart, regEnd) + '\n' + arrays.join('\n');
const selectors = [...new Set(
  [...selectorSource.matchAll(/'([#.][^']+)'/g)].map((m) => m[1]))];

// NON-EMPTY FIRST, both sides. Every check below passes trivially against an
// empty list, and an extractor that has stopped extracting reports success in
// the same words as a clean tree (hub LESSONS 100).
(allSections.length >= 15 ? ok : fail)(
  `there are surfaces to check (${allSections.length} sections found, expected at least 15)`);
if (runtimeOnly.length) {
  console.log(`  note  ${runtimeOnly.length} section(s) are filled at runtime and cannot be read here`
    + ` — ${runtimeOnly.map((s) => `#${s.id}`).join(', ')}. The walk covers them by class.`);
}
(selectors.length >= 100 ? ok : fail)(
  `the walk has a registry to check against (${selectors.length} selectors found, expected at least 100)`);
if (failed) process.exit(1);

/** A SHARED CLASS IS NOT COVERAGE, and the first draft of this gate got that
 *  wrong in exactly the way it exists to catch. `.section` sits on every section
 *  heading in the app, so matching it made all seventeen look measured while the
 *  walk had never checked a single thing specific to some of them — a passing
 *  branch measuring something other than the thing.
 *
 *  So a class only counts when it appears in ONE section. An id always counts,
 *  because ids are unique by construction. A compound selector is matched on its
 *  parts: `.intro p` and `#sheet-x .body` both reach real elements. */
const parts = (sel) => sel.split(/[\s>+~,]+/).filter(Boolean);
const shared = new Set();
{
  const seen = new Map();
  for (const s of sections) {
    for (const c of s.classes) {
      if (seen.has(c) && seen.get(c) !== s.id) shared.add(c);
      seen.set(c, s.id);
    }
  }
}
const covers = (s) => selectors.some((sel) => parts(sel).some((p) => {
  if (p.startsWith('#')) return p.slice(1) === s.id || s.ids.includes(p.slice(1));
  if (p.startsWith('.')) return s.classes.includes(p.slice(1)) && !shared.has(p.slice(1));
  return false;
}));

const uncovered = sections.filter((s) => !covers(s));
(uncovered.length === 0 ? ok : fail)(
  'every surface has at least one selector the walk measures'
  + (uncovered.length
    ? ` — ${uncovered.map((s) => `#${s.id}`).join(', ')} ${uncovered.length === 1 ? 'is' : 'are'} in no REGISTRY entry,`
      + ' so contrast and accessible names have never been checked there.'
      + ' Add it to REGISTRY *and* give it a driver call — both halves, or it still ships unmeasured.'
    : ''));

// BOTH DIRECTIONS. A selector naming an element that is gone measures nothing
// and says nothing about it, which is how coverage shrinks silently.
// Ids the MARKUP declares, plus ids `src/` assigns at runtime — `input.id =
// 'replan-new-date'` is as real as one written in the html, and calling it
// dangling was this gate's second false alarm.
const everyId = new Set([...markup.matchAll(/id="([a-z0-9-]+)"/g)].map((m) => m[1]));
for (const f of walkSrc()) {
  for (const m of readFileSync(f, 'utf8').matchAll(/\.id\s*=\s*'([a-z0-9-]+)'/g)) everyId.add(m[1]);
  for (const m of readFileSync(f, 'utf8').matchAll(/id="([a-z0-9-]+)"/g)) everyId.add(m[1]);
}
const dangling = selectors
  .flatMap(parts)
  .filter((p) => p.startsWith('#'))
  .map((p) => p.slice(1))
  .filter((id) => !everyId.has(id));
(dangling.length === 0 ? ok : fail)(
  'no audited selector names an element that is not in the markup'
  + (dangling.length ? ` — ${[...new Set(dangling)].join(', ')}` : ''));

console.log(failed
  ? '\nA surface exists that nothing measures. That is not a green walk, it is a\nwalk that was never told.\n'
  : '\nThe markup and the walk account for each other.\n');
process.exit(failed ? 1 : 0);
