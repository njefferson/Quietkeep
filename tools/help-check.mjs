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
import { execFileSync } from 'node:child_process';
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
// RAW, not normalized. `norm` lowercases for comparison; storing its output
// would make every message this gate prints name the controls in words nobody
// sees. A gate is read when it fails, which is the worst moment to be wrong
// about what a thing is called.
const destinations = [...shell.matchAll(/class="more-go"[^>]*>([^<]+)</g)]
  .map((m) => m[1].replace(/\s+/g, ' ').trim());
const treeLabel = (shell.match(/id="tree-open"[^>]*>([^<]+)</) ?? [])[1];
// THE DOOR ITSELF, not what is behind it. `destinations` above reads the seven
// rooms; nothing read the label on the control that opens them, so 3.9.2
// renamed it and three help surfaces went on naming a button that no longer
// existed — the identical failure 3.6.1 paid for with the tree label, one
// control along, caught by hand both times.
const moreDoor = (shell.match(/id="open-more"[^>]*>([^<]+)</) ?? [])[1];

// A SCREEN'S OWN NAME (3.23.14). Every set above is a set of CONTROLS, and a
// surface's name was not one of them — so the sorting screen carried three
// names at once and every gate in the repo was green. The hub door said "Sort
// what you put down", the opener inside the section said "Sort what you have
// put down", and the manual called it "Sort things out", which is what the
// batch DIALOG was called. A cold reader met three screens.
//
// AND THE COLLISION MADE A COVERAGE GATE LIE. `manual-coverage.mjs` requires
// every surface with a heading to be named in the manual; the manual's two
// descriptions of TRIAGE satisfied that requirement for the DIALOG, which then
// went its whole life undescribed while the gate reported full coverage. That
// is the more expensive half: a wrong name confuses one reader, a name shared
// with another surface switches off a check over a real hole.
const stanceNames = [...shell.matchAll(/data-stance-name="([^"]+)"/g)].map((m) => m[1]);

// THE OPENER IS THE SAME SCREEN, so it says the same words. Both sides are read
// out of the markup; nothing here is a list of what they ought to be. A section
// without an opener owes nothing — most stances have none.
const openerMismatch = [];
for (const m of shell.matchAll(/<section\b[^>]*\sdata-stance-name="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)) {
  const opener = /<button\b[^>]*\bdata-stance-opener\b[^>]*>([^<]+)</.exec(m[2]);
  if (opener && norm(opener[1]) !== norm(m[1])) openerMismatch.push([m[1], opener[1].trim()]);
}

const SETS = {
  routes:       { what: 'the sort routes',        from: 'src/ui/clarify.ts CLARIFY ROUTES', values: routes },
  containers:   { what: 'the container words',    from: 'src/tree.ts CONTAINER_ORDER',      values: containerWords },
  kinds:        { what: 'the kind words',         from: 'src/kind-words.ts KIND_WORDS',     values: kinds },
  // Read and printed, but claimed by nothing yet: no help surface enumerates
  // all seven, and declaring one that does not would make this gate a wish.
  destinations: { what: 'the destination labels', from: 'public/index.html .more-go',       values: destinations },
  treeLabel:    { what: 'the tree label',         from: 'public/index.html #tree-open',     values: treeLabel ? [treeLabel] : [] },
  moreDoor:     { what: 'the way-to-everything door', from: 'public/index.html #open-more',  values: moreDoor ? [moreDoor] : [] },
  // CLAIMED BY NOTHING, and that is itself a finding rather than a gap in this
  // gate. Declaring the manual here was tried and went red on six of the ten:
  // the manual names every screen by its HEADING ("Next up", "Needs a new
  // plan") and no help surface anywhere names the words on the DOOR you press
  // to arrive ("See what is next", "What slipped"). A reader navigating by what
  // the buttons say cannot find those words in the help at all. Left read and
  // printed until the copy answers it; the binding check on these is the
  // opener/door agreement below, which needs no declaration because both sides
  // come out of the same markup.
  stanceNames:  { what: 'the screen names',       from: 'public/index.html data-stance-name', values: stanceNames },
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
  ['docs/manual.md',    'moreDoor',  'the section on what else the app can do, and the control list'],
  ['docs/paths.html',   'moreDoor',  'the export path says which door Your data is behind'],
  ['public/paths.html', 'moreDoor',  'the shipped page a reader loads'],
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
//
// AND SOME RENAMES CANNOT JOIN THIS LIST, which is worth saying where the list
// is. 3.9.2 retired `Everything else` from the way-to-everything door, and the
// phrase is ordinary English — the manual's second paragraph is "That is the
// whole product. Everything else is how it does it." A backward rule here would
// fire on honest prose, which this repo has already measured as worse than a
// miss (`privacy-check.mjs`, and the inline-citation exception in
// `pages-a11y.mjs`). The forward rule catches that rename instead: the door is
// its own SET now and three surfaces are held to it. Distinctive names get both
// directions; ordinary words get one, on purpose.
const RETIRED = [
  ['How it hangs together', 'renamed in 3.6.1 to the current tree label'],
  // 3.23.7. The situation sheet asked "who" twice — a single-valued filter
  // labeled `Who is here` sitting 25 lines above a multi-select labeled
  // `Who is in it?`, teaching the reader the answer is one person before the
  // second one appeared. Both controls are right and ADR-0118 says so; only
  // the labels never carried the distinction ADR-0119 states in words.
  ['Who is in it?', 'renamed in 3.23.7 to Who is in the room?'],
  ['Who is here', 'renamed in 3.23.7 to Who is in front of you now'],
  ['Sort what you have put down', 'the opener said this while the door said "Sort what you put down"; one name since 3.23.14'],
  ['Just sort it', 'renamed in 3.23.13 to Choose where it goes'],
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

(openerMismatch.length === 0 ? ok : fail)(
  'every stance opener says its own screen\'s name' +
  (openerMismatch.length
    ? ` — ${openerMismatch.map(([n, o]) => `the door says "${n}", the opener says "${o}"`).join('; ')}`
    : ''));

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

// ── THE FLOWCHARTS NAME CONTROLS THAT EXIST ─────────────────────────────────
// The SETS above are closed lists the app defines in one place, and a control
// outside all of them — a button on one sheet, a label on one group — is named
// by the flowcharts and held by nothing. `docs/paths.html` marks every control
// it names with `<b>`, which is what makes this checkable without a second list:
// the page already declares which of its words are the app's.
//
// It found two on its first run, both from renames nobody carried across. The
// upkeep path said the control is "This one repeats"; the app's label has been
// "Make it repeat". The replan path said "all of them at once"; the line reads
// "All ⟨n⟩ at once". Neither is in any SET, so nothing here could see them.
//
// WHAT IS EXCLUDED, AND WHY IT IS BY POSITION RATHER THAN BY A LIST.
//   · `<b>` inside `p.never` is the page's own label "What it never does", and
//     inside a heading or the contents it is a section name. Neither is a
//     control, and both are the page talking about itself.
//   · A name containing ⟨…⟩ is a template with a hole in it — "Part of ⟨name⟩",
//     "All ⟨n⟩ at once" — and the app fills the hole at runtime, so no verbatim
//     match exists to look for. The literal text around it is not worth a
//     substring check that would pass on almost anything.
// An exclusion by POSITION cannot go stale the way a list of allowed strings
// does: add a new `.never` paragraph and it is covered without an edit here.
//
// AND THE APP'S COPY IS READ WITH COMMENTS AND THE RELEASE NOTES STRIPPED. The
// notes legitimately keep every retired name — that is what they are for — so
// searching them would make this gate pass on precisely the words it exists to
// find, and a comment naming an old control would do the same. This repo has
// paid for that twice already (hub LESSONS 125).
const paths = read('docs', 'paths.html');
const pathsBody = stripHtmlComments(paths)
  .replace(/<p class="never">[\s\S]*?<\/p>/g, ' ')
  .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/g, ' ')
  .replace(/<div class="toc-set">[\s\S]*?<\/div>/g, ' ');
const named = [...new Set([...pathsBody.matchAll(/<b>([^<]+)<\/b>/g)].map((m) => m[1].trim()))]
  .filter((n) => !/[⟨⟩]/.test(n));

const appCopy = norm(
  execFileSync('git', ['ls-files', 'src', 'public/index.html'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f && f !== 'src/ui/changelog.ts' && /\.(ts|html)$/.test(f))
    .map((f) => {
      const raw = read(...f.split('/'));
      return f.endsWith('.html') ? stripHtmlComments(raw) : stripJsComments(raw);
    })
    .join('\n'));

const gone = named.filter((n) => !appCopy.includes(norm(n)));
(named.length > 0 ? ok : fail)(
  `the flowcharts name ${named.length} of the app's controls` +
  (named.length ? '' : ' — FOUND NONE, so the check below is vacuous'));
(gone.length === 0 ? ok : fail)(
  'every control the flowcharts name is a control the app has' +
  (gone.length ? ` — NOT IN THE APP'S COPY: ${gone.join(', ')}` : ''));

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
