#!/usr/bin/env node
// THE MANUAL IS HELD TO THE APP THAT EXISTS. — 2026-08-23
//
// `manual.mjs --check` proves the page matches its source. It cannot prove the
// source is TRUE, and a manual that is merely current is the more dangerous of
// the two failures: it reads as authoritative and is wrong.
//
// This repo's record on that shape is long. The staged-candidate block in
// NOTES.md was two promotes out of date through three sessions and only
// `handoff-check.mjs` noticed. A settled-decisions list still read "no undo,
// deliberately, for now" three days after undo shipped. In both cases the
// document looked maintained, which is exactly why nobody re-read it.
//
// So: every surface the app actually has must be named in the manual, and every
// surface the manual claims must actually exist. Both directions, because one
// alone rots in the other.
//
//   node tools/manual-coverage.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'public', 'index.html'), 'utf8')
  // Comments are not markup. Three gates in this repo learned that the hard
  // way on one day — see hub LESSONS 125. Strip before any search.
  .replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));
const manual = readFileSync(join(ROOT, 'docs', 'manual.md'), 'utf8');

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

const decode = (s) => s
  .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
  .replace(/&mdash;/g, '—').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

/** Curly and straight apostrophes are the SAME WORD to a reader, and the app
 *  writes `&rsquo;` where markdown writes `'`. Comparing them raw reports four
 *  surfaces missing that are named on the page in front of you, which would
 *  train somebody to distrust this gate — the one thing a gate cannot afford. */
const norm = (s) => s.toLowerCase().replace(/[’‘']/g, "'").replace(/\s+/g, ' ').trim();

/** Every surface, by the HEADING A READER SEES — which is what the manual can
 *  honestly name. An id is not a name; nobody meets `#sheet-group-why`. */
const surfaces = [];
for (const m of html.matchAll(/<(section|dialog)\b[^>]*\sid="([^"]+)"[^>]*>/g)) {
  const after = html.slice(m.index + m[0].length, m.index + m[0].length + 800);
  const h = /<h[123][^>]*>([\s\S]*?)<\/h[123]>/.exec(after);
  if (!h) continue;                       // filled at runtime; nothing to name
  const title = decode(h[1].replace(/<[^>]+>/g, ''));
  if (title) surfaces.push({ id: m[2], title });
}

(surfaces.length >= 25 ? ok : fail)(
  `there are surfaces to check (${surfaces.length} with a heading a reader sees, expected at least 25)`);

// --- direction one: the app's surfaces are all in the manual ---------------
//
// Matched on the heading's own words, case-insensitively, because that is what
// somebody reads on screen and then looks for here. A surface whose heading
// changes and whose manual entry does not is exactly the drift being caught.
const manualNorm = norm(manual);
const missing = surfaces.filter(s => !manualNorm.includes(norm(s.title)));
(missing.length === 0 ? ok : fail)(
  'every surface a reader can meet is named in the manual'
  + (missing.length
    ? ` — ${missing.map(s => `"${s.title}" (#${s.id})`).join(', ')} ${missing.length === 1 ? 'is' : 'are'} not.`
      + ' Add it to docs/manual.md, then `npm run manual`.'
    : ''));

// --- direction two: the manual claims nothing that is gone -----------------
//
// A manual naming a screen that no longer exists sends somebody looking for it,
// which is worse than silence. Checked over the manual's own bolded screen
// names rather than over prose, so an ordinary sentence cannot trip it.
// SCOPED TO THE SECTION THAT CLAIMS TO LIST SCREENS, and the first version was
// not. It read every bolded item in the file, so "Nothing leaves the device" —
// a promise in the refusals list — was reported as a screen the app does not
// have. A gate that flags honest prose gets routed around, which is worse than
// the drift it was built for.
const every = manual.slice(manual.indexOf('## Every screen'));
const screensSection = every.slice(0, every.indexOf('\n## ') === -1 ? undefined : every.indexOf('\n## '));
const claimed = [...screensSection.matchAll(/^- \*\*([^*]+)\*\*/gm)]
  .map(m => m[1].trim().replace(/\s*[—·].*$/, '').trim())
  .filter(t => t.length > 3);
const known = new Set(surfaces.map(s => norm(s.title)));
const htmlNorm = norm(decode(html.replace(/<[^>]+>/g, ' ')));
const ghosts = claimed.filter(t => !known.has(norm(t)) && !htmlNorm.includes(norm(t)));
(ghosts.length === 0 ? ok : fail)(
  'the manual names nothing the app does not have'
  + (ghosts.length ? ` — ${ghosts.map(g => `"${g}"`).join(', ')} appears nowhere in the app.` : ''));

console.log(`\n${failed === 0
  ? `The manual accounts for all ${surfaces.length} surfaces, and claims none that are gone.`
  : `${failed} coverage failure(s).`}\n`);
process.exit(failed === 0 ? 0 : 1);
