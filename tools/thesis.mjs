// Generate the hosted "Why it works this way" page from the rationale doc.
//
// SINGLE SOURCE OF TRUTH: docs/planning-for-humans.md is the thesis. This turns
// it into public/why.html — a self-contained, theme-aware, accessible page in
// Quietkeep's own palette — so a curious person reads it inside the app instead
// of being sent to a GitHub markdown file. The page is generated and committed;
// `--check` re-generates and diffs so the two can never drift (the CHANGELOG.md
// pattern, `tools/changelog.mjs`).
//
// The converter handles exactly the markdown the doc uses: h1–h4, paragraphs,
// bullet lists (one level of nesting), numbered lists, blockquotes, `---` rules,
// and inline **bold** / *italic* / `code` / [links](url). No dependency: a doc
// page does not earn one, and the doc's shapes are known and few.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'docs', 'planning-for-humans.md');
const OUT = join(ROOT, 'public', 'why.html');
// The page's styles live in a FILE, not a <style> block: the site's CSP is
// style-src 'self', which refuses inline styles — the first deployed thesis
// rendered unstyled and nobody saw it until the smoke walk navigated there
// (1.7.2). Generated together, checked together.
const CSS_OUT = join(ROOT, 'public', 'why.css');


// THE CONVERTER, THE STYLES AND THE PAGE SHELL LIVE IN `doc-page.mjs` (2.29.0),
// because a second hosted page needs them and a second copy is how the two
// would silently diverge. Extracted without changing a character; `--check`
// below is the proof, since it regenerates this page and diffs it against the
// committed file.
import { convert, CSS, page } from './doc-page.mjs';

const META = {
  title: 'Why it works this way',
  description: 'The reasoning behind Quietkeep — how memory, attention and motivation actually work, and how that shaped every choice — with each source named and tagged by how well established it is.',
  css: '/why.css',
  footer: 'This is the reasoning behind Quietkeep, kept in step with the app itself. It\n    names findings and the people associated with them; it is not a literature\n    review, and where a construct is contested it says so. <a href="/">Back to the app.</a>',
};

const html = page(convert(readFileSync(SRC, "utf8")), META);

/**
 * WHAT `--check` COULD NEVER SEE.
 *
 * `--check` regenerates and diffs against the committed file, so it proves the
 * page is CURRENT and says nothing about whether it is right. A converter that
 * produces the same wreckage every run passes it for ever — and did: the public
 * page carried a stranded continuation paragraph for every wrapped bullet in the
 * document, and printed emphasis markers as visible text, with the gate green
 * the whole time. It is the hub's LESSON 63 arriving from the other side: there,
 * a page that renders can be a page that does nothing; here, a page a check
 * calls up-to-date can be a page nobody could read.
 *
 * These are the two exact signatures of that failure, and neither is a
 * heuristic. Both were run against the old converter and both go red on it.
 */
const defects = [];
// The document uses `*` only as a marker. One surviving in the output means a
// span opened and never closed — which is what happened when `inline()` ran per
// line and an italic wrapped across the break.
const strays = (html.match(/\*/g) ?? []).length;
if (strays > 0) defects.push(`${strays} literal asterisk(s) in the output — an emphasis span is unpaired`);
// A paragraph starting with whitespace is a continuation line that was emitted
// as its own block instead of joining the item above it.
const stranded = (html.match(/<p>\s/g) ?? []).length;
if (stranded > 0) defects.push(`${stranded} paragraph(s) begin with whitespace — a wrapped list item was stranded`);
if (defects.length > 0) {
  console.error('the generated page is malformed:');
  for (const d of defects) console.error(`  ${d}`);
  console.error('\nFix tools/thesis.mjs or the source markdown. A page that is up to date\nis not the same claim as a page that is readable.');
  process.exit(1);
}

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(OUT, 'utf8'); } catch { /* missing => differs */ }
  let currentCss = '';
  try { currentCss = readFileSync(CSS_OUT, 'utf8'); } catch { /* missing => differs */ }
  if (current !== html || currentCss !== CSS) {
    console.error('public/why.html or why.css is out of date — run `npm run thesis`.');
    process.exit(1);
  }
  console.log('why.html and why.css match docs/planning-for-humans.md.');
} else {
  writeFileSync(OUT, html);
  writeFileSync(CSS_OUT, CSS);
  console.log(`wrote ${OUT} and why.css`);
}
