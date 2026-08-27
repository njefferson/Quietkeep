#!/usr/bin/env node
// THE WORDS THE HELP QUOTES ARE THE WORDS THE APP SAYS. — 2026-08-27
//
// `manual.mjs --check` proves the manual page matches its source, and
// `manual-coverage.mjs` proves every surface is named. Neither looks at the
// words ON the controls, and neither looks at the walkthrough or the flowcharts
// at all. So a route could be renamed and three help surfaces would go on
// naming the old one, correctly generated, fully covered, and wrong.
//
// THAT IS NOT HYPOTHETICAL. 3.6.1 renamed one control and the flowcharts page
// went on saying the old name until somebody happened to look. The page was
// current in every mechanical sense: it had been regenerated and republished
// that same day.
//
// WHAT THIS CHECKS, both directions, because one alone rots in the other:
//   forward  — every label in an app SET appears verbatim in each help surface
//              declared to cover that set.
//   backward — no help surface names a RETIRED label, anywhere.
//
// WHY DECLARED COVERAGE RATHER THAN A SWEEP. "Every label must appear in every
// help file" is false — the walkthrough is six screens and must not enumerate
// the app. A gate that fires on honest prose is one people route around, which
// is the lesson `privacy-check.mjs` is built on. So each surface DECLARES which
// sets it reproduces, and is held to those exactly.
//
//   node tools/help-check.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

// Comments are not markup, and are not code either. Strip before any search:
// a label mentioned in a comment must not satisfy a check about what SHIPS.
// Three gates in this repo learned that on one day (hub LESSONS 125).
const stripHtmlComments = (s) => s.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));
const stripJsComments = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  .replace(/^[ \t]*\/\/.*$/gm, '');

/** Curly and straight apostrophes are the same word to a reader; the app writes
 *  one and markdown writes the other. Compare them the way they are read. */
/** CASE IS NOT A DIFFERENCE A READER SEES in running prose: the manual writes
 *  "next action" mid-sentence for the button marked "Next action", and holding
 *  those apart would fire on honest writing. It does NOT excuse a different
 *  word — "do it now" for a button marked "Do now" is a real miss and this
 *  found one. */
const norm = (s) => s.replace(/[’‘']/g, "'").replace(/&rsquo;/g, "'")
  .replace(/&mdash;/g, '—').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim().toLowerCase();

// ── THE APP'S OWN SETS ───────────────────────────────────────────────────────
// Each is READ FROM THE SOURCE THAT DEFINES IT, never restated here. A list
// typed into a gate is a second copy, and this whole file exists because second
// copies drift.

const clarify = stripJsComments(read('src', 'ui', 'clarify.ts'));
const routes = [...clarify.matchAll(/\{\s*route:\s*'[^']+',\s*label:\s*'([^']+)'/g)].map((m) => m[1]);

const tree = stripJsComments(read('src', 'tree.ts'));
const containerWords = [...tree.matchAll(/\['(?:project|outcome|area|goal)',\s*'([^']+)'\]/g)]
  .map((m) => m[1].split(' — ')[0]);

const kindWords = stripJsComments(read('src', 'kind-words.ts'));
const kinds = [...kindWords.matchAll(/^\s*(?:project|outcome|area|goal):\s*'([^']+)'/gm)].map((m) => m[1]);

const shell = stripHtmlComments(read('public', 'index.html'));
// RAW, not normalised. `norm` lowercases for comparison; storing its output
// would make every message this gate prints name the controls in words nobody
// sees. A gate is read when it fails, which is the worst moment to be wrong
// about what a thing is called.
const destinations = [...shell.matchAll(/class="more-go"[^>]*>([^<]+)</g)]
  .map((m) => m[1].replace(/\s+/g, ' ').trim());
const treeLabel = (shell.match(/id="tree-open"[^>]*>([^<]+)</) ?? [])[1];

const SETS = {
  routes:       { what: 'the sort routes',        from: 'src/ui/clarify.ts CLARIFY ROUTES', values: routes },
  containers:   { what: 'the container words',    from: 'src/tree.ts CONTAINER_ORDER',      values: containerWords },
  kinds:        { what: 'the kind words',         from: 'src/kind-words.ts KIND_WORDS',     values: kinds },
  // Read and printed, but claimed by nothing yet: no help surface enumerates
  // all seven, and declaring one that does not would make this gate a wish.
  destinations: { what: 'the destination labels', from: 'public/index.html .more-go',       values: destinations },
  treeLabel:    { what: 'the tree label',         from: 'public/index.html #tree-open',     values: treeLabel ? [treeLabel] : [] },
};

// ── WHO COVERS WHAT ──────────────────────────────────────────────────────────
// A surface appears here only for a set it genuinely reproduces. Adding a row
// is a claim that the file lists that set in full; it is not a wish.
const COVERS = [
  ['docs/paths.html',   'routes',    'the sort fork lists every choice'],
  // THE SHIPPED COPY IS CHECKED SEPARATELY from its source. `paths:check`
  // proves they match today; this proves the one a reader actually loads names
  // the app that exists, and does not depend on that other gate having run.
  ['public/paths.html', 'routes',    'the shipped page a reader loads'],
  ['public/paths.html', 'kinds',     'the shipped page a reader loads'],
  ['public/paths.html', 'treeLabel', 'the shipped page a reader loads'],
  ['docs/paths.html', 'kinds',        'the tree path names what each row says'],
  ['docs/paths.html', 'treeLabel',    'the find-a-project path names the destination'],
  ['docs/manual.md',  'routes',       'the sorting section lists them'],
  ['docs/manual.md',  'treeLabel',    'named where the tree is described'],
  ['src/ui/tour.ts',  'routes',       "step 3's alt text enumerates the choices"],
];

// ── RETIRED: never in any help surface, EXCEPT where it is marked as history ──
// The release notes are the RECORD and legitimately keep the old words, so this
// list is checked against help surfaces only. Add a line the day a rename lands.
//
// A HELP PAGE MAY SAY WHAT A THING USED TO BE CALLED, and should — somebody who
// learned the old name needs the bridge. It has to SAY it is history: wrap it in
// `<span data-was>`. The exemption is per-mention and visible in the markup,
// never a whole-file pass, because a file-level exemption is where this repo's
// privacy gate found its material collecting.
const RETIRED = [
  ['How it hangs together', 'renamed in 3.6.1 to the current tree label'],
];

const HELP = [...new Set(COVERS.map((c) => c[0]))];

console.log('\nThe words the help quotes are the words the app says\n');

for (const [key, set] of Object.entries(SETS)) {
  (set.values.length > 0 ? ok : fail)(
    `${set.what} read from ${set.from} — ${set.values.length} of them` +
    (set.values.length ? ` (${set.values.join(', ')})` : ' — READ NOTHING, so every check below is vacuous'));
}

for (const [file, key, why] of COVERS) {
  const set = SETS[key];
  if (!set) { fail(`${file} declares coverage of "${key}", which is not a set this gate knows`); continue; }
  const body = norm(file.endsWith('.ts') ? stripJsComments(read(...file.split('/')))
                  : file.endsWith('.html') ? stripHtmlComments(read(...file.split('/')))
                  : read(...file.split('/')));
  const missing = set.values.filter((v) => !body.includes(norm(v)));
  (missing.length === 0 ? ok : fail)(
    `${file} carries ${set.what} — ${why}` +
    (missing.length ? ` — MISSING: ${missing.join(', ')}` : ''));
}

for (const file of HELP) {
  const raw = read(...file.split('/'));
  const stripped = file.endsWith('.ts') ? stripJsComments(raw)
                 : file.endsWith('.html') ? stripHtmlComments(raw) : raw;
  // Marked history is not a live claim. Blank the marked spans, then look.
  const body = norm(stripped.replace(/<span data-was>[\s\S]*?<\/span>/g, ' '));
  for (const [phrase, why] of RETIRED) {
    (!body.includes(norm(phrase)) ? ok : fail)(
      `${file} does not say "${phrase}" — ${why}`);
  }
}

// ── AND EVERY PAGE THE APP LINKS TO SURVIVES BEING OFFLINE ───────────────────
// The worker maps a navigation to its OWN cached body via SHELL, so a hosted
// page left out of that list does not merely miss offline — it falls back to
// the app shell and lands the reader somewhere else entirely (the 1.7.2 defect,
// found on device). Nothing asserted this, which is how `plan.html` ended up
// uncached and unnoticed.
//
// THE POPULATION IS DERIVED FROM THE LINKS, not from a list kept here. A page
// nobody can reach owes nothing — `plan.html` is `noindex` and linked from
// nowhere, and passes by being unreachable rather than by being excused.
const sw = read('public', 'sw.js');
const linked = [...new Set([...shell.matchAll(/href="\/([a-z0-9-]+\.html)"/g)].map((m) => m[1]))];
const uncached = linked.filter((f) => !sw.includes(`'./${f}'`));
(linked.length > 0 ? ok : fail)(
  `the app links to ${linked.length} hosted page(s) — ${linked.join(', ') || 'NONE FOUND, so the check below is vacuous'}`);
(uncached.length === 0 ? ok : fail)(
  `every page the app links to is precached by the worker` +
  (uncached.length ? ` — NOT CACHED: ${uncached.join(', ')}, so offline they fall back to the app shell` : ''));

console.log(failed === 0
  ? '\nEvery help surface names the app that exists.\n'
  : `\n${failed} check(s) failed — the help and the app disagree about what things are called.\n`);
process.exit(failed === 0 ? 0 : 1);
