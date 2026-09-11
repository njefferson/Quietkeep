#!/usr/bin/env node
// THE CLOSED REASON VOCABULARY — V2 stage 7.
//
// Every offer states its warrant in one sentence from a closed set. Not because
// the words are precious: **determinism is the product**. An offer with an
// unaccountable warrant cannot be refused on grounds, and a reader who cannot
// predict what the app will say cannot tell a change they caused from one they
// did not — which is the mechanism by which control is learned. A vocabulary
// that drifts destroys that quietly, one plausible literal at a time.
//
// Before `REASON_WORDS`, seven push sites each wrote their own literal and TWO
// of them had independently written "ready again". A third could have written
// "ready, again" and nothing in this repo would have noticed.
//
// WHAT THIS CHECKS, and it is deliberately narrow:
//   1. The record is TOTAL over `NextUpReason` — every reason has words.
//      (The compiler enforces this too; the gate says so out loud, because a
//      `Record<K, V>` quietly stops being total if the key type widens.)
//   1b. The COVERAGE record is total over `CoverReason` — same property, second
//      record, and ungated for its whole life until 3.23.29. Two `REASON_WORDS`
//      of the same name exist; this read only one of them.
//   2. No `words:` in the offer projection is an inline literal. Every one goes
//      through the record, so there is exactly ONE writer — the property
//      `place` already has, and the reason `place` has never disagreed with
//      itself.
//
// It does NOT check the sentences themselves. What they say is taste and lives
// in review; what this holds is that there is one place to look.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/nextup.ts'), 'utf8');
// THE SECOND RECORD OF THE SAME NAME, and it was ungated for its whole life
// (3.23.29). `src/ui/work.ts` carries its own `REASON_WORDS`, keyed on
// `CoverReason` from `gate.ts`, for the coverage sheet's count lines. This gate
// read `src/nextup.ts` alone, so both checks below passed while a brand-new
// `CoverReason` had no words at all — measured by planting exactly that: green,
// and the sheet would have printed `undefined` beside a count on the one surface
// in this app whose entire job is being checkable from the outside. Two records
// with one name, and only one of them looked at.
const gate = readFileSync(join(root, 'src/gate.ts'), 'utf8');
const work = readFileSync(join(root, 'src/ui/work.ts'), 'utf8');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

console.log('\nThe closed reason vocabulary (V2 stage 7)\n');

// --- 1 · the record is total -------------------------------------------------
const typeLine = src.match(/export type NextUpReason\s*=\s*([^;]+);/);
if (!typeLine) {
  fail('NextUpReason is not declared where this gate can read it');
} else {
  const reasons = [...typeLine[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
  // The declaration's TYPE contains `=>`, so anything anchored on the first `=`
  // stops inside it — which is exactly what the first version of this gate did,
  // and it reported the record as missing while the record sat right there. Take
  // the text between the declaration and its closing brace instead.
  const at = src.indexOf('export const REASON_WORDS');
  const close = at < 0 ? -1 : src.indexOf('\n};', at);
  const body = at < 0 || close < 0 ? null : [null, src.slice(at, close)];
  if (!body) {
    fail('REASON_WORDS is not declared where this gate can read it');
  } else {
    const missing = reasons.filter(r => {
      const bare = new RegExp(`(^|[\\s,{])${r}\\s*:`, 'm');
      const quoted = new RegExp(`'${r}'\\s*:`);
      return !bare.test(body[1]) && !quoted.test(body[1]);
    });
    if (missing.length) fail(`no words for: ${missing.join(', ')} — every reason states one`);
    else ok(`every one of the ${reasons.length} reasons has words in REASON_WORDS`);
  }
}

// --- 1b · the COVERAGE record is total over CoverReason ----------------------
// Same property, second record. The compiler enforces it too now — `work.ts`
// types it `Record<CoverReason, string>` rather than `Record<string, string>` —
// and this says so out loud for the reason the header already gives: that
// enforcement evaporates the moment somebody widens the key back to `string`,
// which is the state it was found in.
{
  const decl = gate.match(/export type CoverReason\s*=\s*([^;]+);/);
  const at = work.indexOf('const REASON_WORDS');
  const close = at < 0 ? -1 : work.indexOf('\n  };', at);
  if (!decl) {
    fail('CoverReason is not declared in src/gate.ts where this gate can read it');
  } else if (at < 0 || close < 0) {
    fail('the coverage REASON_WORDS is not declared where this gate can read it');
  } else {
    const reasons = [...decl[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
    const body = work.slice(at, close);
    const missing = reasons.filter(r => {
      const bare = new RegExp(`(^|[\\s,{])${r}\\s*:`, 'm');
      const quoted = new RegExp(`'${r}'\\s*:`);
      return !bare.test(body) && !quoted.test(body);
    });
    if (missing.length) {
      fail(`the coverage sheet has no words for: ${missing.join(', ')} — a count with no reason is not checkable`);
    } else {
      ok(`every one of the ${reasons.length} coverage reasons has words in work.ts`);
    }
    // AND KEYED ON THE TYPE, so the compiler carries it between runs of this.
    if (!/const REASON_WORDS: Record<CoverReason, string>/.test(work)) {
      fail('the coverage REASON_WORDS is not typed Record<CoverReason, string> — widen the key and totality is gone');
    } else {
      ok('and the record is keyed on CoverReason, so the compiler holds it too');
    }
  }
}

// --- 2 · one writer ----------------------------------------------------------
// A `words:` whose value is a string literal or a bare template is a second
// writer. The record's own declaration is skipped: it is where the literals
// belong.
const recordStart = src.indexOf('export const REASON_WORDS');
const recordEnd = src.indexOf('\n};', recordStart);
const outside = recordStart < 0
  ? src
  : src.slice(0, recordStart) + src.slice(recordEnd);

const inline = [];
for (const m of outside.matchAll(/\bwords:\s*(.+)/g)) {
  const value = m[1].trim();
  if (value.startsWith('string')) continue;                 // the interface field
  if (value.startsWith('REASON_WORDS')) continue;           // the one writer
  inline.push(value.replace(/,$/, '').slice(0, 60));
}
if (inline.length) {
  for (const v of inline) {
    fail(`a second writer of the offer's words: ${v} — route it through REASON_WORDS`);
  }
} else {
  ok('no push site writes its own sentence — REASON_WORDS is the only writer');
}

console.log(failed
  ? `\n${failed} failure(s). The vocabulary has more than one author.\n`
  : '\nEvery offer says why, in words from one closed set with one author.\n');
process.exit(failed ? 1 : 0);
