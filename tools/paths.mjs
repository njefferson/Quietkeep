#!/usr/bin/env node
// EVERY PATH THROUGH QUIETKEEP, as a hosted page (3.7.0).
//
// ONE SOURCE, TWO OUTPUTS. `docs/paths.html` is authored and self-contained —
// one file with its styles inline, which is what an Artifact has to be. The
// shipped page cannot be that: the site's CSP is `style-src 'self'; font-src
// 'self'`, so an inline <style> is refused outright and the page would render
// in whatever the browser picked. `tools/thesis.mjs` learned this in 1.7.2,
// when the first deployed thesis shipped unstyled and nobody noticed until the
// smoke walk navigated there.
//
// So this splits the source into `public/paths.html` + `public/paths.css`, and
// `--check` regenerates and diffs both. The source keeps being the one place
// the content is written; the split is mechanical and gated.
//
// IT REUSES `doc-page.mjs`'s `page()` rather than writing a second shell. That
// module exists precisely because a second copy of a converter drifts, and the
// drift is invisible — both pages render and only one is right.
//
// The STYLES are this page's own, not the shared doc CSS: nothing else in the
// repo draws a flow diagram. That means the shell's own chrome — the back link
// — must be styled here too, which the shared sheet would otherwise have done.
//
//   node tools/paths.mjs            writes both files
//   node tools/paths.mjs --check    fails on drift

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { page } from './doc-page.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'docs', 'paths.html');
const HTML_OUT = join(ROOT, 'public', 'paths.html');
const CSS_OUT = join(ROOT, 'public', 'paths.css');

const src = readFileSync(SRC, 'utf8');

const styleAt = src.indexOf('<style>');
const styleEnd = src.indexOf('</style>');
if (styleAt < 0 || styleEnd < 0) {
  console.error('\ndocs/paths.html has no <style> block — nothing to split out.\n');
  process.exit(1);
}
const styles = src.slice(styleAt + '<style>'.length, styleEnd).trim();
const body = src.slice(styleEnd + '</style>'.length).trim();

const titleMatch = src.match(/<title>([^<]+)<\/title>/);
if (!titleMatch) {
  console.error('\ndocs/paths.html has no <title> — the shell needs one.\n');
  process.exit(1);
}

// The back link is the shell's, so its styling is owed here. Deliberately the
// same shape the shared doc CSS gives it, so the two hosted-page families do
// not read as different products.
const CSS = `${styles}

/* ── the shell's own chrome (tools/doc-page.mjs adds it) ────────────────── */
main { max-width: none; margin: 0; }
.back {
  /* inline-flex + min-height, not inline-block: at 390px this measured 21px
     tall and the page's own walk refused it (WCAG 2.5.8 wants 24). */
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  margin: clamp(1.6rem, 5vw, 2.4rem) 0 0 clamp(1.1rem, 4vw, 2rem);
  font: 600 .9375rem/1.4 var(--display);
  color: var(--accent);
}
main > footer {
  max-width: var(--col);
  margin: 0 auto;
  padding: 0 clamp(1.1rem, 4vw, 2rem) 3rem;
  color: var(--ink-soft);
  font-size: .875rem;
}
main > footer a {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  color: var(--accent);
}
`;

const HTML = page(body, {
  title: titleMatch[1],
  description: 'Every way in, through and out of Quietkeep, drawn as the steps you take.',
  css: '/paths.css',
  footer: '<a href="/manual.html">How it works</a> · <a href="/">Back to Quietkeep</a>',
});

if (process.argv.includes('--check')) {
  let haveHtml = '', haveCss = '';
  try { haveHtml = readFileSync(HTML_OUT, 'utf8'); } catch { /* missing => differs */ }
  try { haveCss = readFileSync(CSS_OUT, 'utf8'); } catch { /* missing => differs */ }
  if (haveHtml !== HTML || haveCss !== CSS) {
    console.error('\npaths.html or paths.css has drifted from docs/paths.html.');
    console.error('Run `npm run paths` and commit the result.\n');
    process.exit(1);
  }
  console.log('\npaths.html and paths.css match docs/paths.html.\n');
  process.exit(0);
}

writeFileSync(HTML_OUT, HTML);
writeFileSync(CSS_OUT, CSS);
console.log(`\nwrote public/paths.html (${Math.round(HTML.length / 1024)}KB) and public/paths.css (${Math.round(CSS.length / 1024)}KB)\n`);
