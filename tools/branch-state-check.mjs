#!/usr/bin/env node
// THE BLOCK THAT SAYS WHERE THE BRANCHES ARE MUST SAY WHERE THEY ARE. 2026-08-23.
//
// ## Why this exists — three recurrences, none of them found by anything
//
// `NOTES.md` carries a block naming the version on staging and the version in
// production. It has been wrong three times:
//
//   said 2.12.2 / 2.11.0 until 2026-08-20, through two promotes
//   said 2.14.1 / 2.13.0 until 2026-08-22, through eleven releases and a promote
//   said 2.24.0 / 2.24.1 until 2026-08-23, through five releases and two promotes
//
// The third happened on the same day the paragraph recording the second was
// written into the same block. Nothing caught any of them. The first was found
// by `handoff-check.mjs`, which is not in this repo's Spine and has to be
// remembered; the second by a lesson arriving from another repo's session; the
// third only because a production version arrived from the device and the block
// had to be opened to record it.
//
// A line that looks maintained is the one nobody re-reads. So this is not a
// fourth note — every number in that block is derivable from git without a
// network call, which makes it a gate's job.
//
// ## What it compares
//
// The STAGING line against `public/sw.js` in the working tree — what is being
// committed, which is what staging is about to carry.
//
// The PRODUCTION line against `public/sw.js` at `origin/main` — what production
// actually serves. Not the tree: on staging the tree is ahead of production by
// definition, and taking the tree would make the two lines agree always and
// mean nothing.
//
// ## What it does NOT compare, on purpose
//
// **The SHAs beside each version.** They are documentation. Gating the staging
// SHA is impossible — a commit cannot name its own hash — and gating the
// production SHA would make the block unfixable for a window after every
// promote. The three recorded failures were all VERSION failures; the SHA was
// never the thing that misled anybody.
//
// ## Why it is a commit guard and NOT a Spine step
//
// It reads `origin/main` as of the moment of the commit, which is the state
// production is in while you are working. CI cannot reproduce that: on `main`
// the Spine runs AT the promote, where `origin/main` is already the merge, so
// the production line would name the version production had a second ago and
// the step would be red by construction on every promote. A gate that is red
// for a window teaches people to ignore red — the same reason the hub keeps
// `doctrine-sync.mjs` out of CI, and the same shape as `branch-guard.mjs`'s
// `.git/hooks` assertion, which the hub records as a fact about ONE CLONE that
// can never hold on a runner.
//
// A commit guard is not the weak "somebody has to remember" state: `.branch-guard`
// declares it with `also=`, so it runs on every commit including a promote.
//
// **It is deliberately NOT in `npm run check` either, and that is not an
// oversight.** Hub LESSONS 127 is two gates that sat in the check chain and
// never once ran on a runner, and its fix is a parity check comparing the chain
// against the workflow's steps — to which a gate absent from CI on purpose
// looks exactly like a gate absent by accident. `.branch-guard` is the list
// this one belongs to, and this paragraph is here so the absence reads as a
// decision when that parity check arrives.
//
// ## And there is exactly ONE place that may say it
//
// Within minutes of this gate passing, `docs/plan-routed.md` was found carrying
// its own "Production: 2.24.1 / Staging: 2.24.1" resume block — five releases
// and three promotes out of date, in a file this gate does not read. The defect
// had simply moved house.
//
// Policing every copy is the wrong answer; NOTES.md's own block complains about
// "one file, two answers" three paragraphs above where it was itself wrong. So
// the second half of this gate REFUSES the second copy: a present-tense claim
// about what a branch carries, in any tracked markdown other than NOTES.md, is
// a failure whatever version it names — including a correct one. A copy that is
// right today is a copy that goes wrong on the next promote.
//
//   node tools/branch-state-check.mjs

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HEADING = '### Staged and waiting on the owner';

let failed = 0;
let staleBlock = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };
// The two halves fail for different reasons and want different advice. Printing
// "fix the block in NOTES.md" at somebody whose block is correct and whose
// SECOND COPY is stale sends them to the one file that is right.
const failBlock = (m) => { fail(m); staleBlock++; };

console.log('\n=== the branch-state block says where the branches are ===\n');

// --- the block -------------------------------------------------------------

const notes = readFileSync(join(ROOT, 'NOTES.md'), 'utf8');
const at = notes.indexOf(HEADING);
if (at < 0) {
  console.log(`  FAIL  NOTES.md has no "${HEADING}" heading.`);
  console.log('\n  Renamed or removed? This gate is anchored on it. Re-point the');
  console.log('  HEADING constant in this file in the same commit.\n');
  process.exit(1);
}
const rest = notes.slice(at + HEADING.length);
const end = rest.search(/\n#{1,3} /);
const block = end < 0 ? rest : rest.slice(0, end);

/** The triplet claimed by the bullet whose URL is exactly this one, and a
 *  refusal if it claims more than one.
 *  Start-anchored: `https://quietkeep.pages.dev` is a SUBSTRING of
 *  `https://staging.quietkeep.pages.dev`, so a loose search reads the staging
 *  bullet as the production one and the gate compares a line with itself. */
const versionOn = (url) => {
  const line = block
    .split('\n- ')
    .find((b) => b.startsWith(`**${url}**`));
  if (line === undefined) return { missing: true };
  // MATCH ALL AND REFUSE AN AMBIGUOUS BULLET, never take the first (hub
  // LESSONS 129). `exec` here would read "up from **2.24.1** to **2.29.0**" as
  // a claim of 2.24.1 and compare the wrong number, silently, with nothing at
  // the call site looking conditional.
  const all = [...line.matchAll(/\*\*(\d+\.\d+\.\d+)\*\*/g)].map((m) => m[1]);
  if (all.length === 0) return { unversioned: true };
  if (new Set(all).size > 1) return { ambiguous: all };
  return { version: all[0] };
};

// --- what the branches actually carry --------------------------------------

/** The release triplet out of a service worker's cache name. Anchored at the
 *  END: the Sync edition's cache is `quietkeep-sync-<triplet>`, so a prefix
 *  match returns `sync-2.29.0` and every comparison below fails obscurely. */
const tripletIn = (sw, where) => {
  // Comments blanked before the search — three gates in this repo learned that
  // on one day (hub LESSONS 125), and a `const CACHE` quoted in a comment is
  // exactly the shape that would be read as the declaration.
  const code = sw.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
  // ALL of them, and exactly one is required. Hub LESSONS 129: anchoring on the
  // first match measures whichever declaration happens to sit highest, and a
  // second one appearing later is the change nobody would look for here.
  const names = [...code.matchAll(/const CACHE = '([^']+)'/g)].map((m) => m[1]);
  if (names.length !== 1) {
    failBlock(`expected exactly one cache declaration at ${where}, found ${names.length}`);
    return null;
  }
  const m = /(\d+\.\d+\.\d+)$/.exec(names[0]);
  if (!m) {
    failBlock(`no release triplet in the cache name at ${where} — read "${names[0]}"`);
    return null;
  }
  return m[1];
};

const treeTriplet = tripletIn(
  readFileSync(join(ROOT, 'public', 'sw.js'), 'utf8'), 'public/sw.js');

let mainTriplet = null;
let mainSha = null;
try {
  mainSha = execFileSync('git', ['rev-parse', '--short', 'origin/main'],
    { cwd: ROOT, encoding: 'utf8' }).trim();
  mainTriplet = tripletIn(execFileSync('git', ['show', 'origin/main:public/sw.js'],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }), 'origin/main');
} catch {
  // NEVER A SKIP. A missing ref is the one condition under which this gate
  // would silently agree with anything, which is the fail-open the whole
  // mechanism exists to avoid.
  failBlock('cannot read public/sw.js at origin/main — the ref is missing.'
    + '\n        `git fetch origin main` and run this again.');
}

// --- the two comparisons ---------------------------------------------------

const check = (label, url, actual) => {
  if (actual === null) return;
  const got = versionOn(url);
  if (got.missing) {
    failBlock(`no ${label} bullet starting "- **${url}**" in the block`);
  } else if (got.unversioned) {
    failBlock(`the ${label} bullet names no bolded triplet`);
  } else if (got.ambiguous) {
    failBlock(`the ${label} bullet names more than one triplet — ${got.ambiguous.join(', ')}`
      + '\n        Which is the claim? Say one, and put the history in prose.');
  } else if (got.version !== actual) {
    failBlock(`${label} says ${got.version}, and ${url} carries ${actual}`);
  } else {
    ok(`${label} says ${got.version}, and that is what it carries`);
  }
};

check('staging', 'https://staging.quietkeep.pages.dev', treeTriplet);
check('production', 'https://quietkeep.pages.dev', mainTriplet);

if (mainSha) {
  console.log(`\n  production read at origin/main ${mainSha}, as last fetched.`);
}

// --- and nowhere else may say it -------------------------------------------

/** Every tracked markdown file, so a new document cannot quietly open a second
 *  copy. `git ls-files` rather than a directory walk: untracked scratch and
 *  node_modules are not this gate's business, and a file has to be tracked
 *  before it can go stale in anybody's clone. */
const tracked = execFileSync('git', ['ls-files', '*.md'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  .split('\n').filter(Boolean).filter((f) => f !== 'NOTES.md');

/** A present-tense claim about what a branch carries. Deliberately narrow: the
 *  bullet shape these blocks actually use, with a triplet on the same line. A
 *  sentence of prose recounting what production HELD in the past is a different
 *  kind of statement and stays legal — a false positive here would teach the
 *  next session to route around the gate. */
const CLAIM = /^\s*[-*]\s+\*\*(Production|Staging|Main)\b[^*]*\*\*[^\n]*?(\d+\.\d+\.\d+)/gm;

const copies = [];
for (const file of tracked) {
  const text = readFileSync(join(ROOT, file), 'utf8');
  for (const m of text.matchAll(CLAIM)) {
    const line = text.slice(0, m.index).split('\n').length;
    copies.push(`${file}:${line} says ${m[1]} is ${m[2]}`);
  }
}

(copies.length === 0 ? ok : fail)(
  'no second copy of what the branches carry'
  + (copies.length ? `\n        ${copies.join('\n        ')}` : ''));

if (copies.length) {
  console.log('');
  console.log('  NOTES.md\'s branch-state block is the one place that says this, and');
  console.log('  it is the only one held to git. Delete the claim and point at it —');
  console.log('  a copy that is right today goes wrong on the next promote, which');
  console.log('  is how this defect moved out of NOTES.md and into a plan file.');
}

if (staleBlock) {
  console.log('');
  console.log('  Fix the block in NOTES.md, not this gate. If the production line');
  console.log('  looks right to you, `git fetch origin main` first — a stale');
  console.log('  remote-tracking ref makes this compare against yesterday.');
  console.log('');
  console.log('  This block has been wrong three times, through eighteen releases');
  console.log('  and five promotes, and nothing ever found it. That is what this is.');
}

console.log(`\n${failed === 0 ? 'The block says where the branches are.' : `${failed} line(s) out of date.`}\n`);
process.exit(failed === 0 ? 0 : 1);
