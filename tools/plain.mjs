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

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'public/index.html'), 'utf8');
const plain = readFileSync(join(root, 'src/plain.ts'), 'utf8');

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
const listOf = (name) => {
  const i = plain.indexOf(`export const ${name} = [`);
  if (i < 0) return null;
  const j = plain.indexOf('] as const;', i);
  const body = plain.slice(i, j).replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  return new Set([...body.matchAll(/'#([a-z0-9-]+)'/g)].map(m => m[1]));
};

const hidden = listOf('PLAIN_HIDDEN');
const kept = listOf('PLAIN_KEPT');
const chrome = listOf('PLAIN_CHROME_HIDDEN');

for (const [name, set] of [['PLAIN_HIDDEN', hidden], ['PLAIN_KEPT', kept], ['PLAIN_CHROME_HIDDEN', chrome]]) {
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

const chromeGone = [...chrome].filter(id => !html.includes(`id="${id}"`));
(chromeGone.length === 0 ? ok : fail)(
  'and the chrome it strips is all still in the page'
  + (chromeGone.length ? ` — ${chromeGone.join(', ')}` : ''));

// AND CAPTURE IS NEVER STRIPPED. Capture relief is unconditional (the thesis,
// and Doctrine §7e), so a future edit that quietly adds it to the chrome list
// would take away the one thing this app promises from every state.
const mustSurvive = ['capture', 'gauge', 'open-more'];
const wrongly = mustSurvive.filter(id => chrome.has(id));
(wrongly.length === 0 ? ok : fail)(
  'capture, the proof line and the way to anywhere are never stripped'
  + (wrongly.length ? ` — ${wrongly.join(', ')} is in PLAIN_CHROME_HIDDEN` : ''));

console.log(failed
  ? '\nA line on the offer card has not said whether it survives.\n'
  : '\nThe card and the strip account for each other.\n');
process.exit(failed ? 1 : 0);
