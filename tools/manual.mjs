#!/usr/bin/env node
// Generate the hosted manual from docs/manual.md, the same way `thesis.mjs`
// generates `why.html` — same converter, same styles, same page shell, from
// `doc-page.mjs`, so the two pages cannot drift apart in how they render.
//
// WHY A SEPARATE PAGE AND NOT MORE OF THE (i). The ⓘ answers what this app is,
// what it is not, how to install it, what changed, and who to tell — Doctrine
// §7e's list, and it is already six destinations deep. A feature reference is a
// different kind of reading: you arrive at it knowing what you want, you scan
// for one heading, and you leave. Putting it behind the ⓘ would make both worse,
// and `size-check.mjs` holds every ⓘ destination to 3,000px of scroll for
// exactly that reason.
//
// WHY GENERATED. A hand-written manual goes stale, and a stale manual is worse
// than none: it reads as authoritative and is wrong. This repo has paid for that
// shape repeatedly — the staged-candidate block that was two promotes out of
// date through three sessions, the settled-decisions list that still said "no
// undo, deliberately" three days after undo shipped. `--check` regenerates and
// diffs, so the page and its source can never disagree.
//
// WHAT `--check` CANNOT SEE is whether the manual is TRUE. That is
// `manual-coverage.mjs`, which holds it to the surfaces that actually exist.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { convert, CSS, page } from './doc-page.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'docs', 'manual.md');
const OUT = join(ROOT, 'public', 'manual.html');
const CSS_OUT = join(ROOT, 'public', 'manual.css');

const META = {
  title: 'How it works',
  description: 'Everything Quietkeep can do, what each screen is for, and where to look when something is not where you expected — in three depths, so you can stop at whichever one answers your question.',
  css: '/manual.css',
  footer: 'This is the manual, generated from one source so it cannot drift from the app.\n    The reasoning behind any of it is in <a href="/why.html">Why it works this way</a>.\n    <a href="/">Back to the app.</a>',
};

const html = page(convert(readFileSync(SRC, 'utf8')), META);

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(OUT, 'utf8'); } catch { /* missing => differs */ }
  let currentCss = '';
  try { currentCss = readFileSync(CSS_OUT, 'utf8'); } catch { /* missing => differs */ }
  if (current !== html || currentCss !== CSS) {
    console.error('\nmanual.html or manual.css has drifted from docs/manual.md.');
    console.error('Run `npm run manual` and commit the result.\n');
    process.exit(1);
  }
  console.log('\nmanual.html and manual.css match docs/manual.md.\n');
} else {
  writeFileSync(OUT, html);
  writeFileSync(CSS_OUT, CSS);
  console.log(`wrote ${OUT} and manual.css`);
}
