#!/usr/bin/env node
// WHAT SURVIVES THE WORST DAY, RECORDED — so adding to it is refused in
// milliseconds instead of found four minutes into a browser walk. 2026-08-23.
//
// ## The gap this closes
//
// "Just one thing" is defined by SUBTRACTION: `src/plain.ts` lists what is
// stripped and what is kept, and `plain.mjs` generates the CSS. That mechanism
// works at REGION granularity, and it forces a decision well — a new region of
// the work surface in neither list fails the gate, which is the design doing
// its job rather than a gate catching a mistake.
//
// It cannot see INSIDE a kept region. `#foot` is kept because the accessibility
// statement is an obligation; a link added inside it needed no declaration,
// because no new region appeared. It went straight into the mode built for the
// day somebody can least afford a busy screen, and what caught it was the a11y
// walk's ceilings — correct, and four minutes late.
//
// Hub LESSONS 121: a rule that says "never show X here" is kept by the SHAPE
// having no X, not by everyone remembering. This is the cheaper half of that —
// it does not stop the addition, it refuses to let it pass unnoticed.
//
// ## What this number is, and what it is NOT
//
// **It is not a second ceiling and it must never be read as one.** The a11y
// walk owns the ceilings, and only it can: visibility on that screen depends on
// runtime state, and two of the ten controls it counts live inside a section
// that is `hidden` in the markup and shown when an update is waiting. No static
// read can know that.
//
// This counts what the MARKUP puts outside the offer once the generated strip
// has been applied, ignoring runtime state entirely. The number is meaningless
// on its own. It is meaningful when it CHANGES, which is the whole design: a
// baseline, a diff, and a name for what moved.
//
//   node tools/plain-surface.mjs            (check against the manifest)
//   node tools/plain-surface.mjs --write    (record a new baseline)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, 'docs', 'plain-surface.json');

// Comments blanked to spaces before any search — three gates in this repo
// learned that on one day (hub LESSONS 125), and offsets stay offsets.
const html = readFileSync(join(ROOT, 'public', 'index.html'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));
const plainTs = readFileSync(join(ROOT, 'src', 'plain.ts'), 'utf8');

/** The ids the generated strip hides. Read from the source of truth rather than
 *  from the generated CSS: the CSS is an artefact of this list, and reading the
 *  artefact would make this agree with a stale one. */
const listOf = (name) => {
  const at = plainTs.indexOf(`export const ${name} = [`);
  if (at < 0) return null;
  const body = plainTs.slice(at, plainTs.indexOf('] as const;', at))
    // COMMENTS ARE NOT ENTRIES, and this file is mostly comments — each id in
    // those lists carries a paragraph saying why. A plant that commented an
    // entry OUT did not fail, because the id was still sitting in the comment
    // beside it and this regex read it as live. So a stripped thing could be
    // un-stripped and this gate would report the worst day unchanged.
    //
    // Third variant of the same class in one day: `controls.mjs` read a
    // commented `<section>` as an open landmark, `plain.mjs` sliced `<main>`
    // out of a comment, and now this. Hub LESSONS 125 is the entry; the rule is
    // strip before any search, in every language, not only in HTML.
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  return new Set([...body.matchAll(/'#([A-Za-z0-9_-]+)'/g)].map(m => m[1]));
};
const hidden = listOf('PLAIN_CHROME_HIDDEN');
const hiddenCard = listOf('PLAIN_HIDDEN');
if (!hidden || !hiddenCard) {
  console.error('\n  Could not read the plain lists from src/plain.ts — this gate cannot run.\n');
  process.exit(1);
}

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);
const CONTROL = new Set(['button','select','textarea','summary']);
const TEXT = new Set(['p','h1','h2','h3','li']);

const isStripped = (tag, attrs) => {
  const id = /\sid="([^"]+)"/.exec(attrs)?.[1] ?? null;
  const cls = /\sclass="([^"]*)"/.exec(attrs)?.[1] ?? '';
  return (id && (hidden.has(id) || hiddenCard.has(id)))
    || id === 'nextup' || tag === 'dialog'
    || cls.split(/\s+/).includes('visually-hidden');
};

/**
 * BLANK EVERY STRIPPED SUBTREE FIRST, then measure what is left.
 *
 * The first version of this file measured controls with a containment stack and
 * words by taking a text element's inner HTML — which is the EXACT defect found
 * in `a11y.mjs` an hour earlier and fixed there: controls were filtered by
 * containment and words were not, so a `<p>` reported the words of a stripped
 * `<span>` inside it. It produced `foot: 12 words` for a footer showing eight.
 *
 * Writing the same bug into a new gate one hour after fixing it in the old one
 * is the argument for doing this once, structurally, rather than per measure:
 * remove what is not there, and then every count is of what is left.
 *
 * Blanked to spaces rather than deleted, so offsets stay offsets.
 */
const blanked = (() => {
  let out = html;
  const depth = [];
  for (const m of html.matchAll(/<(\/?)([a-z][a-z0-9-]*)\b([^>]*)>/g)) {
    const [full, slash, tag, attrs] = m;
    const selfClosing = VOID.has(tag) || /\/$/.test(attrs);
    if (slash) {
      if (depth.length && depth[depth.length - 1].tag === tag) {
        const f = depth.pop();
        if (f.strip) {
          const end = m.index + full.length;
          out = out.slice(0, f.start) + out.slice(f.start, end).replace(/[^\n]/g, ' ') + out.slice(end);
        }
      }
      continue;
    }
    if (selfClosing) {
      if (isStripped(tag, attrs) && !depth.some(f => f.strip)) {
        out = out.slice(0, m.index) + full.replace(/[^\n]/g, ' ') + out.slice(m.index + full.length);
      }
      continue;
    }
    depth.push({ tag, start: m.index, strip: isStripped(tag, attrs) || depth.some(f => f.strip) });
  }
  return out;
})();

const controls = [];
const lines = [];
const stack = [];
const regionOf = () => {
  for (let i = stack.length - 1; i >= 0; i--) if (stack[i]) return stack[i];
  return '(document)';
};
for (const m of blanked.matchAll(/<(\/?)([a-z][a-z0-9-]*)\b([^>]*)>/g)) {
  const [, slash, tag, attrs] = m;
  if (slash) { if (!VOID.has(tag)) stack.pop(); continue; }
  const id = /\sid="([^"]+)"/.exec(attrs)?.[1] ?? null;
  if (CONTROL.has(tag) || (tag === 'a' && /\shref=/.test(attrs)) || tag === 'input') {
    controls.push({ region: regionOf(), what: id ? `#${id}` : `<${tag}>` });
  }
  if (TEXT.has(tag)) {
    const close = blanked.indexOf(`</${tag}>`, m.index);
    const inner = close < 0 ? '' : blanked.slice(m.index + m[0].length, close);
    const words = (inner.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, 'x').match(/\S+/g) ?? []).length;
    if (words > 0) lines.push({ region: regionOf(), what: id ? `#${id}` : `<${tag}>`, words });
  }
  if (!(VOID.has(tag) || /\/$/.test(attrs))) stack.push(id);
}

/** Per region, so a failure NAMES where the growth happened. */
const byRegion = {};
for (const c of controls) (byRegion[c.region] ??= { controls: 0, words: 0 }).controls += 1;
for (const l of lines) (byRegion[l.region] ??= { controls: 0, words: 0 }).words += l.words;
const now = Object.fromEntries(Object.entries(byRegion).sort(([a], [b]) => a < b ? -1 : 1));

console.log('\nWhat survives "Just one thing", as the markup leaves it\n');
(controls.length >= 5 ? ok : fail)(
  `there is a surface to measure (${controls.length} controls, ${lines.length} lines of text)`);

if (process.argv.includes('--write')) {
  writeFileSync(MANIFEST, JSON.stringify(now, null, 2) + '\n');
  console.log(`  wrote ${MANIFEST}\n`);
  process.exit(failed === 0 ? 0 : 1);
}

let was = null;
try { was = JSON.parse(readFileSync(MANIFEST, 'utf8')); } catch { /* first run */ }
if (!was) {
  console.log('\n  FAIL  no manifest at docs/plain-surface.json — run with --write and commit it.\n');
  process.exit(1);
}

const moved = [];
for (const key of new Set([...Object.keys(was), ...Object.keys(now)])) {
  const a = was[key] ?? { controls: 0, words: 0 };
  const b = now[key] ?? { controls: 0, words: 0 };
  if (a.controls !== b.controls) moved.push(`${key}: ${a.controls} → ${b.controls} controls`);
  if (a.words !== b.words) moved.push(`${key}: ${a.words} → ${b.words} words`);
}

(moved.length === 0 ? ok : fail)(
  'nothing new survives the strip'
  + (moved.length ? `\n        ${moved.join('\n        ')}` : ''));

if (moved.length) {
  console.log('');
  console.log('  This is the mode for the day somebody can least afford a busy screen.');
  console.log('  Either strip it — add the id to PLAIN_CHROME_HIDDEN in src/plain.ts,');
  console.log('  then `node tools/plain.mjs --write` — or decide it belongs and record');
  console.log('  the new baseline with `npm run plain:surface -- --write`.');
  console.log('');
  console.log('  The a11y walk owns the real ceilings and still has to pass. This only');
  console.log('  tells you now instead of four minutes from now.');
}

console.log(`\n${failed === 0 ? 'The worst day is unchanged.' : `${failed} change(s) to account for.`}\n`);
process.exit(failed === 0 ? 0 : 1);
