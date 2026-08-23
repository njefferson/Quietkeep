#!/usr/bin/env node
// EVERY LINE ON THE OFFER CARD DECLARES WHETHER IT SURVIVES THE WORST DAY.
//
// "Just one thing" strips the offer back to the thing and the acts. What it
// strips is a hand-written list in `src/plain.ts`, and that list went stale
// three times without a word: `#nextup-left`, `#nextup-fixed` and
// `#nextup-written` were all added to the card in later releases and none of
// them was ever added to the list.
//
// So on the day the mode exists for — the day when operating the tool is itself
// one of the skills that has gone — the card still said how much of today was
// left, named the next unmoveable thing, and stated when the item was written.
// Measured on the thirteen-item sample: eight things survived the strip and
// three of them should not have.
//
// That is this repo's oldest defect wearing a new hat. A hand-written list of
// things, and nothing checking it against the set it covers: the a11y walk's
// list of doors went stale inside a day, the target audit's list of element
// types hid four undersized controls for months, and the contents sheet is
// derived precisely so it cannot happen there.
//
// The fix is not a better list. It is that the two lists TOGETHER must account
// for every element of the card, so adding a line forces the question "does this
// survive" at the moment the line is written rather than three releases later
// when somebody counts.
//
//   node tools/plain.mjs        (exits non-zero on anything undeclared)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public/index.html'), 'utf8');
const plain = readFileSync(join(root, 'src/plain.ts'), 'utf8');
const cssPath = join(root, 'public/app.css');
const css = readFileSync(cssPath, 'utf8');

const WRITE = process.argv.includes('--write');
for (const a of process.argv.slice(2)) {
  if (a !== '--write') {
    console.error(`unknown argument ${a} — this gate takes --write or nothing.`);
    process.exit(2);
  }
}

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed += 1; };

console.log('\nWhat survives the worst day\n');

// The card, comments stripped: a commented-out id is not on screen.
const start = html.indexOf('<section id="nextup"');
const end = html.indexOf('</section>', start);
if (start < 0 || end < 0) {
  fail('could not find the offer card in public/index.html');
  process.exit(1);
}
const card = html.slice(start, end).replace(/<!--[\s\S]*?-->/g, '');
const onCard = [...new Set([...card.matchAll(/id="(nextup-[a-z0-9-]+)"/g)].map(m => m[1]))].sort();

/** The ids named in one of `plain.ts`'s lists, comments stripped for the same
 *  reason — a selector mentioned in prose is not a selector that runs. */
const orderOf = (name) => {
  const i = plain.indexOf(`export const ${name} = [`);
  if (i < 0) return null;
  const j = plain.indexOf('] as const;', i);
  const body = plain.slice(i, j).replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  return [...body.matchAll(/'#([a-z0-9-]+)'/g)].map(m => m[1]);
};
const listOf = (name) => {
  const a = orderOf(name);
  return a === null ? null : new Set(a);
};

const hidden = listOf('PLAIN_HIDDEN');
const kept = listOf('PLAIN_KEPT');
const chromeOrder = orderOf('PLAIN_CHROME_HIDDEN');
const chrome = listOf('PLAIN_CHROME_HIDDEN');
const chromeKept = listOf('PLAIN_CHROME_KEPT');

for (const [name, set] of [['PLAIN_HIDDEN', hidden], ['PLAIN_KEPT', kept],
  ['PLAIN_CHROME_HIDDEN', chrome], ['PLAIN_CHROME_KEPT', chromeKept]]) {
  if (set === null) { fail(`${name} is not in src/plain.ts — this gate cannot run`); }
}
if (failed) process.exit(1);

// NON-EMPTY FIRST. Delete the card's markup and every loop below has nothing to
// iterate, and a gate with nothing to iterate reports green about a screen that
// is gone (hub LESSONS 100).
(onCard.length >= 15 ? ok : fail)(
  `the offer card is there to be checked (${onCard.length} elements found, expected at least 15)`);

const undeclared = onCard.filter(id => !hidden.has(id) && !kept.has(id));
(undeclared.length === 0 ? ok : fail)(
  `every element of the offer card says whether it survives "Just one thing"`
  + (undeclared.length
    ? ` — ${undeclared.join(', ')} ${undeclared.length === 1 ? 'is' : 'are'} in neither list.`
      + ' Add each to PLAIN_HIDDEN (information, which is the cost being cut) or to'
      + ' PLAIN_KEPT (the thing itself, or an act on it).'
    : ''));

// BOTH DIRECTIONS. A selector naming an element that no longer exists is a rule
// that silently stops applying, which is how the strip could quietly shrink.
const gone = [...hidden, ...kept]
  .filter(id => id.startsWith('nextup-') && !onCard.includes(id));
(gone.length === 0 ? ok : fail)(
  'no rule names a card element that is not there'
  + (gone.length ? ` — ${gone.join(', ')}` : ''));

const chromeGone = [...chrome, ...chromeKept].filter(id => !html.includes(`id="${id}"`));
(chromeGone.length === 0 ? ok : fail)(
  'and the chrome it names is all still in the page'
  + (chromeGone.length ? ` — ${chromeGone.join(', ')}` : ''));

// AND THE DIRECTION THAT WAS BROWSER-ONLY (2.23.2).
//
// Above, the offer CARD is checked both ways: every element declared, and every
// declaration real. The chrome had only one of those halves — a declared region
// must exist, but an existing region need not be declared. The other half lived
// in the a11y walk, which drives a browser.
//
// `src/plain.ts` says the gate "walks the rendered header, `<main>` and the
// footer and fails on any region in neither — so a new surface answers 'does
// this survive the worst day' in the commit that creates it". That is true of
// the WALK. A session that runs `npm run plain:check`, reads that sentence and
// concludes the question is answered is wrong, and 2.23.1 is what that costs:
// three regions moved out of `#held` (which covered them by covering it) into
// `<main>`, every static gate green, and the walk red in CI ten minutes later.
//
// The regions of `<main>` are readable from the file. This is not a smaller
// version of the walk's check — the walk sees runtime-inserted regions this
// cannot — but it catches the case that actually happens, which is markup being
// moved, and it catches it at the commit instead of in CI.
// STRIP FIRST, THEN SLICE. The first `<main` in this file is inside a COMMENT,
// 7.5KB before the real one, so slicing on the raw text found prose and the
// region list came back empty. THIRD gate in one day with this exact defect —
// `controls.mjs` read a commented `<section id="held">` as an open landmark,
// and `narrows-check.mjs` had it on its first run. Blanked to spaces rather
// than deleted so offsets stay offsets.
const source = html.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));
const mainStart = source.indexOf('<main');
const mainEnd = source.indexOf('</main>', mainStart);
const mainHtml = mainStart < 0 ? '' : source.slice(mainStart, mainEnd);

/** Direct element children of <main> carrying an id — the regions of the work
 *  surface, which is exactly what the two chrome lists account for. */
const regions = [];
{
  let depth = 0;
  for (const m of mainHtml.matchAll(/<(\/?)([a-z][a-z0-9-]*)\b([^>]*)>/g)) {
    const [, slash, tag, attrs] = m;
    if (tag === 'main') continue;
    const selfClosing = /\/$/.test(attrs) || ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tag);
    if (slash) { depth = Math.max(0, depth - 1); continue; }
    if (depth === 0) {
      const id = /\sid="([^"]+)"/.exec(attrs)?.[1];
      if (id) regions.push(id);
    }
    if (!selfClosing) depth++;
  }
}

(regions.length >= 8 ? ok : fail)(
  `the work surface is there to be checked (${regions.length} regions of <main> found, expected at least 8)`);

const unaccounted = regions.filter(id => !chrome.has(id) && !chromeKept.has(id));
(unaccounted.length === 0 ? ok : fail)(
  'every region of the work surface says whether it survives "Just one thing"'
  + (unaccounted.length
    ? ` — ${unaccounted.map(i => '#' + i).join(', ')} ${unaccounted.length === 1 ? 'is' : 'are'} in neither list.`
      + ' Add each to PLAIN_CHROME_HIDDEN or PLAIN_CHROME_KEPT in src/plain.ts.'
    : ''));

const both = [...chrome].filter(id => chromeKept.has(id));
(both.length === 0 ? ok : fail)(
  'no region is declared as both stripped and surviving'
  + (both.length ? ` — ${both.join(', ')}` : ''));

// AND THE WAY OUT IS NOT INSIDE THE THING IT UNDOES (2.14.0).
//
// `#nextup-plain-off` lived inside the offer card, which is hidden whenever
// nothing is asking — so *mode on, nothing to offer* was a screen with capture,
// the proof line and no way back. The mode survives a reload by design, so
// turning it on and then finishing the last thing is the whole route in. It was
// survivable while the work surface still stood underneath; the release that
// took the surface away turned it into a blank screen.
//
// This asserts the CONTAINMENT, not the intention. A comment saying the exit
// must stay outside the card is what the card's own comment said while the exit
// was inside it.
const offerStart = html.indexOf('<section id="nextup"');
const offerEnd = html.indexOf('</section>', offerStart);
const offer = html.slice(offerStart, offerEnd);
(!offer.includes('id="nextup-plain-off"') ? ok : fail)(
  'the way out of "Just one thing" is not inside the offer card, which hides when nothing is asking');

// AND CAPTURE IS NEVER STRIPPED. Capture relief is unconditional (the thesis,
// and Doctrine §7e), so a future edit that quietly adds it to the chrome list
// would take away the one thing this app promises from every state.
const mustSurvive = ['capture', 'capture-form', 'gauge', 'open-more'];
const wrongly = mustSurvive.filter(id => chrome.has(id));
(wrongly.length === 0 ? ok : fail)(
  'capture, the proof line and the way to anywhere are never stripped'
  + (wrongly.length ? ` — ${wrongly.join(', ')} is in PLAIN_CHROME_HIDDEN` : ''));

// --- the stylesheet is an artefact of the list -------------------------------
//
// THE STRIP IS A CSS RULE (2.14.0), because the list is the whole work surface
// now and every section on it is painted by an owner that would undo a `hidden`
// set from anywhere in the pass. A rule cannot be outrun by a repaint.
//
// It is generated rather than hand-written, and generated INTO `app.css` rather
// than injected at runtime: the app's CSP is `style-src 'self'` and refuses an
// injected `<style>`, which is right — and which the first version of this
// found the hard way, stripping nothing at all while its source read correctly.
//
// So this is the same shape as CHANGELOG.md and the pre-commit hook: one
// source, an artefact in the tree, and a gate that fails on drift rather than
// trusting anybody to re-run the generator.
const OPEN = '/* GENERATED by tools/plain.mjs --write — do not edit by hand. */';
const CLOSE = '/* end generated */';
const block = [
  OPEN,
  '/* JUST ONE THING, the app\'s own furniture. `src/plain.ts` is the source and',
  '   says why each one goes; this is only the rule that makes it so. */',
  chromeOrder.map(id => `body[data-plain="1"] #${id}`).join(',\n'),
  '  { display: none !important; }',
  CLOSE,
].join('\n');

const i = css.indexOf(OPEN);
const j = css.indexOf(CLOSE);
const current = i >= 0 && j > i ? css.slice(i, j + CLOSE.length) : null;

if (WRITE) {
  const next = current === null
    ? `${css.trimEnd()}\n\n${block}\n`
    : css.slice(0, i) + block + css.slice(j + CLOSE.length);
  writeFileSync(cssPath, next);
  console.log(`  wrote  the generated block in public/app.css (${chromeOrder.length} selectors)`);
} else if (current === null) {
  fail('public/app.css has no generated block — run `node tools/plain.mjs --write`');
} else {
  (current === block ? ok : fail)(
    `the rule in public/app.css is the list (${chromeOrder.length} selectors)`
    + (current === block ? '' : ' — it has drifted. Run `node tools/plain.mjs --write`.'));
}

console.log(failed
  ? '\nA line on the offer card has not said whether it survives.\n'
  : '\nThe card and the strip account for each other.\n');
process.exit(failed ? 1 : 0);
