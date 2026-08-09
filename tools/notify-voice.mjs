#!/usr/bin/env node
// NO SENTENCE LEAVES THIS APP UNMEASURED — collision 15, and a gate written
// BEFORE the thing it guards exists.
//
// A push notification is the one surface that reaches somebody who did not open
// the app. It arrives unannounced, on a lock screen, possibly in front of other
// people, on a day the reader may be at their worst. Every voice rule this
// product has matters more there than anywhere in the UI, and there is no
// version of "we will tighten the copy later" — the first bad push has already
// landed on somebody by the time anyone reads it.
//
// So the gate ships first. Nothing emits a notification today; this exists so
// that the commit which adds one cannot also be the commit that ships an
// unmeasured sentence. Cheap now, impossible to retrofit.
//
// ## How it works
//
// If any notification-producing call appears in the app or the service worker,
// its words must come from `NOTIFY_WORDS` — one declared record, in one file,
// the same shape `REASON_WORDS` uses for the offer. Every string in that record
// is then held to the voice rules.
//
// Until such a call exists, the gate says so out loud rather than passing
// silently, because a gate that reports "ok" while guarding nothing is the
// false-receipt shape this repo has already been bitten by twice.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Every way a browser is asked to show a notification. */
const EMITTERS = /\b(showNotification|new\s+Notification)\s*\(/;

/**
 * Words a notification may never carry, each with the rule it breaks.
 *
 * Deliberately narrow — a false positive here teaches somebody to route around
 * the gate, which is worse than the gate not existing.
 */
const FORBIDDEN = [
  [/\boverdue\b/i, 'ADR-0010 and law 5: there is no "overdue" anywhere, including here'],
  [/\bstreak\b/i, 'law 5: no streaks, ever'],
  [/\byou (should|need to|must|have to)\b/i, 'the voice is never prescriptive'],
  [/\b(still|again|yet)\b.*\bnot\b/i, 'a sentence that recites what you have not done is a shame surface'],
  [/\b(\d+)\s+(times|days in a row|missed|overdue|behind)\b/i, 'a tally about the person (law 5, law 7)'],
  [/\b(well done|good job|great work|proud)\b/i, 'an approving opinion is still an opinion about the person'],
  [/\b(don'?t forget|remember to|reminder:)\b/i, 'it implies you failed to hold it, which is what the app is for'],
];

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|mjs|js)$/.test(name)) out.push(p);
  }
  return out;
};

console.log('\nNo sentence leaves this app unmeasured (collision 15)\n');

const files = [...walk(join(root, 'src')), join(root, 'public/sw.js')];
const emitting = files.filter(f => EMITTERS.test(readFileSync(f, 'utf8')));

if (emitting.length === 0) {
  ok('nothing emits a notification yet — this gate is armed for the commit that adds one');
  console.log('\nArmed, and guarding nothing yet. That is the point of writing it now.\n');
  process.exit(0);
}

// Something emits. From here the words must be declared and clean.
const wordsFile = join(root, 'src/notify-words.ts');
let words = '';
try { words = readFileSync(wordsFile, 'utf8'); } catch { /* missing */ }

if (!words) {
  fail(`${emitting.length} file(s) emit notifications and src/notify-words.ts does not exist`);
  console.log('        Every notification sentence lives in ONE declared record, the way');
  console.log('        the offer\'s reasons live in REASON_WORDS. A push reaches somebody');
  console.log('        who did not open the app, on a day they may be at their worst.\n');
  process.exit(1);
}

for (const f of emitting) {
  const src = readFileSync(f, 'utf8');
  // A literal string handed to a notification is a second author.
  const inline = [...src.matchAll(/\b(?:showNotification|new\s+Notification)\s*\(\s*(['"`])/g)];
  if (inline.length) {
    fail(`${f.replace(root + '/', '')} passes a literal to a notification — route it through NOTIFY_WORDS`);
  }
}

const strings = [...words.matchAll(/['"`]([^'"`\n]{4,})['"`]/g)].map(m => m[1]);
let dirty = 0;
for (const s of strings) {
  for (const [re, why] of FORBIDDEN) {
    if (re.test(s)) { fail(`"${s.slice(0, 48)}" — ${why}`); dirty++; }
  }
}
if (!dirty) ok(`${strings.length} declared notification sentence(s), and none breaks a voice rule`);

console.log(failed
  ? `\n${failed} failure(s). A sentence would have reached somebody unmeasured.\n`
  : '\nEvery sentence that can reach a lock screen is declared and measured.\n');
process.exit(failed ? 1 : 0);
