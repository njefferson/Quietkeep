#!/usr/bin/env node
// THE APP HAS NO PRONOUN FOR ANYBODY, AND THIS IS WHAT KEEPS IT THAT WAY.
//
// Raised 2026-08-21, from a concern that reaches past neurodivergence and
// accessibility to marginalised readers generally: should the app let a reader
// set how it addresses them?
//
// Measured before answering, and the measurement pointed away from a setting.
// The app speaks in the SECOND PERSON — "you" — so there is no pronoun for the
// reader to get wrong, because the app never needs one. A person the reader has
// recorded is rendered by NAME: `peopleWords` takes a count, not a person, and
// no code path anywhere can generate a pronoun for anybody. Zero gendered
// third-person pronouns in any shipped string on the day this was written.
//
// ## So the property already held, and nothing asserted it
//
// That is the same shape as this family's other expensive misses: `data-door`,
// the element types in the target audit, the a11y walk's list of surfaces, and —
// two days before this file — the owner's own name in two public repositories.
// Each was a property everybody assumed and nothing checked, and each stayed
// true right up until the commit where it quietly stopped being true.
//
// A gate is cheap here precisely BECAUSE the tree is already clean. There is
// nothing to fix, so this costs one file and holds a promise permanently.
//
// ## Why a gate rather than a setting
//
// A setting for the READER is unnecessary: second person needs none. A pronoun
// FIELD for recorded people is a datum about third parties that the reader must
// maintain, that is silently wrong the moment it is stale or was guessed, and
// that the app has no current need for. **Not collecting it is stronger than
// collecting it correctly**, and it matches the app's posture everywhere else.
//
// If a surface ever genuinely needs the third person for a recorded person, the
// answer is *they* — never wrong, needs no field, costs nothing. That decision
// is ADR-0106; this file is its teeth.
//
// ## What is checked, and the one exemption
//
// RULE 1 — no gendered third-person pronoun in any shipped string. Applies to
// every string literal under `src/` and to the visible text of both pages,
// `index.html` and `why.html`. No exemption anywhere: a gendered pronoun in the
// thesis essay is as wrong as one on the offer card.
//
// RULE 2 — the app's own voice says "you", never "the user". Applies to
// `index.html` and to `src/` strings only. `why.html` is EXEMPT and the reason
// is a register difference rather than a convenience: it is a design essay
// ABOUT the product, addressed to somebody deciding whether to trust it, and
// "the user" there names the population an argument is about. That is a
// different act from the product speaking to the person holding it.
//
//   node tools/voice-pronouns.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed += 1; };

console.log('\nThe app has no pronoun for anybody\n');

/** Every `.ts` under src/, recursively. */
const walk = (dir) => readdirSync(dir).flatMap((e) => {
  const p = join(dir, e);
  return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.ts') ? [p] : []);
});

/** String literals only. A comment is a note to whoever maintains this and is
 *  not something a reader ever sees, so it is not this gate's business —
 *  `third-person-check.mjs` in the hub covers comments, for a different rule. */
const stringsOf = (text) => {
  const noComments = text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
  return [...noComments.matchAll(/'([^'\\\n]{4,})'|"([^"\\\n]{4,})"|`([^`\\]{4,})`/g)]
    .map((m) => m[1] ?? m[2] ?? m[3]);
};

/** Visible text of a page: comments, scripts and styles removed, tags dropped. */
const visibleText = (html) => html
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ');

/** This line is pattern source, and it is declared in `.third-person-allow`
 *  rather than wrapped in the family's `privacy-gate:patterns-*` sentinel. That
 *  sentinel is not a general "skip this" marker: `privacy-mirror-check.mjs`
 *  treats any file carrying it as a MIRROR of the hub's disclosure patterns and
 *  compares the regex literals inside it against the canon. Wrapping this line
 *  was tried and turned that gate red, claiming a stale mirror. Two gates, one
 *  marker, different meanings — so the exemption goes in the list instead. */
const GENDERED = /\b(?:he|him|his|she|her|hers)\b/i;
const THIRD_PERSON_READER = /\bthe user\b/i;

const srcFiles = walk(join(root, 'src'));
const srcStrings = srcFiles.flatMap((f) =>
  stringsOf(readFileSync(f, 'utf8')).map((s) => [f.slice(root.length + 1), s]));

const pages = ['public/index.html', 'public/why.html']
  .map((p) => [p, visibleText(readFileSync(join(root, p), 'utf8'))]);

// NON-EMPTY FIRST. Every one of the checks below passes trivially against an
// empty list, and a regex that stops matching what it used to match reports
// success in exactly the same words as a clean tree (hub LESSONS 100). If the
// literal-extractor breaks, this is the line that says so.
(srcStrings.length >= 400 ? ok : fail)(
  `there are shipped strings to check (${srcStrings.length} found across ${srcFiles.length} files, expected at least 400)`);
(pages.every(([, t]) => t.length > 2000) ? ok : fail)(
  'both pages yielded visible text to check'
  + pages.map(([p, t]) => ` — ${p}: ${t.length} chars`).join(','));

// RULE 1 — no gendered third-person pronoun, anywhere a reader can see.
const genderedStrings = srcStrings.filter(([, s]) => GENDERED.test(s));
const genderedPages = pages.filter(([, t]) => GENDERED.test(t));
(genderedStrings.length === 0 && genderedPages.length === 0 ? ok : fail)(
  'no gendered third-person pronoun in any shipped string'
  + (genderedStrings.length ? ` — ${genderedStrings.slice(0, 4).map(([f]) => f).join(', ')}` : '')
  + (genderedPages.length ? ` — ${genderedPages.map(([p]) => p).join(', ')}` : ''));

// RULE 2 — the reader is "you". `why.html` is exempt; see the header.
const readerStrings = srcStrings.filter(([, s]) => THIRD_PERSON_READER.test(s));
const [, indexText] = pages.find(([p]) => p.endsWith('index.html'));
const readerPage = THIRD_PERSON_READER.test(indexText);
(readerStrings.length === 0 && !readerPage ? ok : fail)(
  'the app addresses the reader as "you", never as "the user"'
  + (readerStrings.length ? ` — ${readerStrings.slice(0, 4).map(([f]) => f).join(', ')}` : '')
  + (readerPage ? ' — public/index.html' : ''));

console.log(failed
  ? '\nA pronoun reached a surface. The reader is "you"; another person is their\nname; where neither works, "they" (ADR-0106).\n'
  : '\nNo pronoun for anybody, and nothing to configure.\n');
process.exit(failed ? 1 : 0);
