#!/usr/bin/env node
// A PUSH IS NOT A RELEASE — and on this app a push can be *less* than a release.
//
// WHAT HAPPENED (2026-08-09, found the next day). A commit announcing itself as
// "1.36.3 (CAPABILITY)" added a new user-visible line to the main screen, its
// clock logic, and its markup. It did not add a release entry, and it did not
// touch `public/sw.js`. Both omissions have the same cause: from 1.36.2 a
// CAPABILITY release is 1.37.0, not 1.36.3 — `changelog.mjs` would have refused
// the entry — and the response to that refusal was to skip the entry rather than
// fix the number.
//
// THE CONSEQUENCE IS NOT COSMETIC, and it is why this gate exists rather than a
// note in a checklist. `public/app.js` and `./index.html` are SHELL entries,
// served cache-first out of a cache named for the triplet. A worker is only
// installed when `sw.js`'s BYTES change. Unchanged bytes mean no new worker, no
// new cache, and no §7h "a new version is ready" — so every already-installed
// reader keeps being served the previous bundle, for ever, while the edge holds
// the new one. The feature was deployed and could not arrive. That is LESSONS
// §53 in a new shape: not a deploy that failed, a deploy that succeeded at
// publishing something no existing reader can receive.
//
// AND EVERY GATE WAS GREEN. `changelog:check` compares the changelog head
// against the cache name; both said 1.36.2, consistently, about a stale number.
// A gate that checks two things agree cannot notice they have agreed to stand
// still — which is the whole reason this one measures against the WORKING TREE
// instead.
//
// WHAT THIS CHECKS. Every file that reaches a reader through the cache must be
// unchanged since the commit that introduced the current head triplet. If any
// has moved, the triplet is stale and the release has not been cut.
//
// WHAT IT DELIBERATELY DOES NOT CHECK. Not `sw.js` — bumping it IS the release
// act, so requiring it to be unchanged would be circular. Not `test/`,
// `tools/`, `docs/` or any `.md`: those never reach a reader and gating them
// would make the common case red for no reason, which is how a gate teaches
// people to ignore it.

import { readFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURRENT } from '../src/ui/changelog.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

// The surface a reader actually receives. `src/` in full, because every one of
// it is bundled into the single `app.js` that SHELL caches.
const SURFACE = [
  'src',
  'public/index.html',
  'public/app.css',
  'public/why.html',
  'public/manual.html',
  'public/why.css',
  'public/manifest.webmanifest',
];

// The release note itself moves in the release commit by definition; measuring
// it would make every release fail its own gate.
const EXEMPT = new Set(['src/ui/changelog.ts']);

console.log('\nRelease integrity — has the shipped surface moved since the triplet?\n');

const triplet = CURRENT.triplet;
console.log(`  head triplet: ${triplet}\n`);

// A shallow clone cannot answer the question. Saying "ok" here would be the
// false receipt this repo has already been bitten by twice — so it fails and
// says what to change.
if (git('rev-parse', '--is-shallow-repository') === 'true') {
  fail('shallow clone — history is not deep enough to find the release commit.');
  console.log('        Add `with: { fetch-depth: 0 }` to the checkout step that runs this.');
  process.exit(1);
}

// The commit that INTRODUCED this triplet. `-S` finds commits where the count of
// the string changed; the oldest such commit is where it was added.
const introduced = git(
  'log', '--format=%H', '-S', `triplet: '${triplet}'`, '--', 'src/ui/changelog.ts',
).split('\n').filter(Boolean).pop();

if (!introduced) {
  // The head triplet exists only in the working tree: this IS the release being
  // cut right now, and there is nothing yet to be stale against.
  ok(`${triplet} is not committed yet — this is the release commit. Nothing to check against.`);
  console.log('\nRelease integrity holds.\n');
  process.exit(0);
}

console.log(`  introduced in: ${git('log', '-1', '--format=%h %s', introduced)}\n`);

const moved = git('diff', '--name-only', introduced, '--', ...SURFACE)
  .split('\n').filter(Boolean).filter((f) => !EXEMPT.has(f));

// A CHANGED SOURCE FILE IS NOT A CHANGED BUNDLE, and this gate used to treat
// them as the same thing.
//
// `src/` is in SURFACE because all of it is bundled into the one `app.js` a
// reader receives. That is right about WHY it matters and wrong about WHAT to
// measure: a comment, a reflow or a renamed local changes the file and reaches
// nobody. Two comment edits — a scrub removing quoted speech — failed this gate
// on a production promote whose built `public/app.js` was byte-identical, hash
// for hash, to the release it was said to be newer than.
//
// So for the `src/` portion the bundle itself is built from both trees and
// compared. The static files stay an exact name diff: those ARE served, byte for
// byte, with no build in between.
//
// This is `size:check`'s lesson arriving here — it measures the BUILT app for
// the same reason, and its own comment says a plant in `src/` without a rebuild
// never reaches it. Measuring the built output is the gate being right.
//
// A BUILD THAT FAILS IS A FAILURE, never a pass. If the old tree cannot be
// built, this gate cannot answer its question, and answering anyway is the false
// receipt the file's header is about.
const TMP = '.release-check-build';
const bundleHash = (entryPrefix, outfile) => {
  execSync(
    `npx --no-install esbuild ${entryPrefix}src/ui/entry.ts --bundle --format=esm `
    + `--target=es2022 --outfile=${outfile} --log-level=error`,
    { cwd: ROOT, stdio: 'pipe' },
  );
  // NORMALISE THE MODULE BANNERS FIRST. esbuild writes `// <path>` above each
  // module, so a tree built from a subdirectory differs from the same tree built
  // in place — in those comments and nothing else. Hashing without this compares
  // where the files were, not what they say, and reports every source change as
  // a bundle change, which is the false positive this whole block exists to
  // remove. Found by diffing the two bundles instead of trusting the hashes.
  const text = readFileSync(join(ROOT, outfile), 'utf8').split(`${TMP}/`).join('');
  return createHash('sha256').update(text).digest('hex');
};

const srcMoved = moved.filter((f) => f.startsWith('src/'));
const staticMoved = moved.filter((f) => !f.startsWith('src/'));
let srcReachesReader = srcMoved.length > 0;

if (srcMoved.length > 0) {
  try {
    rmSync(join(ROOT, TMP), { recursive: true, force: true });
    mkdirSync(join(ROOT, TMP), { recursive: true });
    execSync(`git archive ${introduced} src | tar -x -C ${TMP}`, { cwd: ROOT, stdio: 'pipe' });
    const then = bundleHash(`${TMP}/`, `${TMP}/then.js`);
    const now = bundleHash('', `${TMP}/now.js`);
    srcReachesReader = then !== now;
    if (!srcReachesReader) {
      ok(`${srcMoved.length} source file(s) changed but the BUILT bundle is byte-identical `
        + `(sha256 ${now.slice(0, 12)}) — no reader receives a different byte`);
    }
  } catch (err) {
    fail(`could not build both trees to compare bundles: ${String(err.message).split('\n')[0]}`);
    console.log('        This gate cannot answer its question without that comparison,');
    console.log('        and a pass here would be a receipt for something never checked.');
    rmSync(join(ROOT, TMP), { recursive: true, force: true });
    process.exit(1);
  } finally {
    rmSync(join(ROOT, TMP), { recursive: true, force: true });
  }
}

const reallyMoved = [...staticMoved, ...(srcReachesReader ? srcMoved : [])];

if (reallyMoved.length === 0) {
  ok('no shipped file has changed since the triplet was cut');
} else {
  const moved = reallyMoved;
  fail(`${moved.length} shipped file(s) changed since ${triplet} was cut, so the triplet is stale:`);
  for (const f of moved) console.log(`          ${f}`);
  console.log('');
  console.log('        These are served cache-first from a cache named for the triplet.');
  console.log('        Until it moves, `sw.js` keeps its bytes, no new worker installs,');
  console.log('        and every already-installed reader keeps the OLD bundle — the');
  console.log('        change is published and cannot arrive.');
  console.log('');
  console.log('        Cut the release: add an entry to src/ui/changelog.ts (one kind,');
  console.log('        and the taxonomy decides the number — CAPABILITY bumps slot 1),');
  console.log('        bump CACHE in public/sw.js to match, then `npm run changelog`.');
}

console.log('');
if (failed) {
  console.error(`Release integrity: ${failed} failure(s).\n`);
  process.exit(1);
}
console.log('Release integrity holds.\n');
