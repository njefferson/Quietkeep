#!/usr/bin/env node
// EVERY HOSTED PAGE THE APP LINKS TO, MEASURED — and only when one changes.
//
// WHY NOT PART OF `npm run a11y`. That walk drives the APP: it opens surfaces,
// sets state, and re-measures every one on every run because an app state can
// regress from a change made anywhere. A static document shares no code with the
// app and cannot regress from an app change. Re-walking these on every run would
// add browser minutes to every release to re-prove a fact that could not have
// moved.
//
// So each page is stamped on ITS OWN content — the page plus the stylesheets it
// links. Change one and only that one walks. Change none and this exits in a
// fraction of a second and says so.
//
// **`manual.html` AND `why.html` HAD SHIPPED SINCE 2.29.0 UNMEASURED.** The app
// walk has never looked at them and nothing else did either. That was found when
// the flowcharts page was added and asked what the precedent was; the answer was
// that there wasn't one.
//
// THE POPULATION IS WHAT THE APP LINKS TO, derived from `index.html` rather than
// listed here — the same rule `help-check` and `deployed-check` use. That is not
// a convenience: `plan.html` is `noindex`, linked from nowhere, and its own
// header says it is "a working page for one reader, not a surface ... if it ever
// gains a route from the app it becomes a surface and joins that list in the same
// commit". Deriving from the links honours that decision automatically, where a
// hand-written exception would have to be remembered.
//
//   node tools/pages-a11y.mjs           walks the pages whose stamp is stale
//   node tools/pages-a11y.mjs --force   walks all of them regardless

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AXE = join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');
const STAMP = join(ROOT, '.pages-a11y-stamp');

const shell = readFileSync(join(ROOT, 'public', 'index.html'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, ' ');
const PAGES = [...new Set([...shell.matchAll(/href="\/([a-z0-9-]+\.html)"/g)].map((m) => m[1]))].sort();

if (PAGES.length === 0) {
  console.error('\nThe app links to no hosted page, so this walk would measure nothing.\n');
  process.exit(1);
}

/** A page's identity is itself plus the stylesheets it pulls in — parsed from
 *  the page, so a new stylesheet is covered without anyone remembering. */
const watchedFor = (file) => {
  const body = readFileSync(join(ROOT, 'public', file), 'utf8');
  const css = [...body.matchAll(/rel="stylesheet" href="\/([^"]+)"/g)].map((m) => m[1]);
  return [file, ...css];
};

const hashOf = (file) => {
  const h = createHash('sha256');
  for (const rel of watchedFor(file)) h.update(readFileSync(join(ROOT, 'public', rel)));
  return h.digest('hex').slice(0, 16);
};

const stampText = existsSync(STAMP) ? readFileSync(STAMP, 'utf8') : '';
const recordedFor = (file) =>
  (stampText.match(new RegExp(`^${file.replace('.', '\\.')}=([0-9a-f]+)$`, 'm')) ?? [])[1] ?? null;

const force = process.argv.includes('--force');
const state = PAGES.map((file) => ({ file, now: hashOf(file), was: recordedFor(file) }));
const due = state.filter((p) => force || p.now !== p.was);

if (due.length === 0) {
  console.log(`\nNo hosted page has changed since it was measured. Nothing to walk.`);
  for (const p of state) console.log(`  --    ${p.file} (${p.now}) — watching ${watchedFor(p.file).join(', ')}`);
  console.log('');
  process.exit(0);
}

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

const launchOpts = { args: ['--no-sandbox'] };
const SANDBOX = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
if (existsSync(SANDBOX)) launchOpts.executablePath = SANDBOX;

console.log(`\nHosted pages, measured — ${due.length} of ${PAGES.length} due\n`);
for (const p of state) {
  if (due.includes(p)) console.log(`  ..    ${p.file}: ${p.was ? `was ${p.was}, ` : 'never measured before, '}now ${p.now}`);
  else console.log(`  --    ${p.file}: unchanged (${p.now})`);
}
console.log('');

// SERVED, NOT file://, because the page must be measured under the headers it
// ships behind. A CSP that refuses the stylesheet turns every check below into
// a measurement of unstyled markup — which passes contrast, targets and axe by
// having no styling to fail (hub LESSONS 158).
// AXE IS SERVED FROM THE ORIGIN, not injected. This page ships behind
// `script-src 'self'`, which refuses an inline <script> — and BOTH forms of
// Playwright's addScriptTag are inline, `path` included. Serving it as a
// same-origin file is the only injection the page's real policy allows, and
// keeping the real policy is the point: a walk run under a relaxed CSP is not a
// walk of the page that ships.
const overrides = new Map([['/axe.min.js', readFileSync(AXE, 'utf8')]]);
const { server, url } = await serve(join(ROOT, 'public'), 0, overrides);
const base = url.replace(/\/$/, '');
const browser = await chromium.launch(launchOpts);

for (const { file } of due) {
 for (const theme of ['light', 'dark']) {
  for (const [label, width, fontPx] of [['390px', 390, 16], ['320px at 200%', 320, 32]]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 }, colorScheme: theme, hasTouch: true, isMobile: true,
    });
    const page = await ctx.newPage();
    const refusals = [];
    page.on('console', (m) => { if (/Refused to|Content Security Policy/i.test(m.text())) refusals.push(m.text().slice(0, 140)); });
    page.on('pageerror', (e) => refusals.push('ERROR ' + String(e).slice(0, 140)));
    await page.goto(`${base}/${file}`, { waitUntil: 'networkidle' });
    if (fontPx !== 16) await page.evaluate((px) => { document.documentElement.style.fontSize = `${px}px`; }, fontPx);
    await page.waitForTimeout(300);
    const at = `${file} ${theme}/${label}`;

    (refusals.length === 0 ? ok : fail)(`${at}: the page loads with nothing refused${refusals.length ? ` — ${refusals[0]}` : ''}`);

    // THE STYLES ACTUALLY APPLIED. Everything below is satisfied by unstyled
    // markup — contrast, targets and axe are all content with a page that has no
    // styling to fail (hub LESSONS 158) — so this is the assertion that makes the
    // rest mean anything. Asked in a way EVERY page can answer: an unstyled
    // document has a transparent body and default margins, and each of these
    // sets its own background from a token.
    const styled = await page.evaluate(() => {
      const bg = getComputedStyle(document.body).backgroundColor;
      const transparent = bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
      return { bg, transparent, sheets: document.styleSheets.length, text: document.body.textContent.trim().length };
    });
    (!styled.transparent && styled.sheets > 0 && styled.text > 200 ? ok : fail)(
      `${at}: the stylesheet applied — body ${styled.bg}, ${styled.sheets} sheet(s), ${styled.text} chars` +
      (styled.transparent ? ' — TRANSPARENT BODY, so the stylesheet did not land' : ''));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    (overflow <= 1 ? ok : fail)(`${at}: horizontal overflow ${overflow}px (must be ≤1)`);

    // Every link a finger takes is at least 24px (WCAG 2.5.8) — MINUS the
    // exception the success criterion itself states.
    //
    // THE FIRST VERSION DID NOT HONOUR IT and flagged four links across two
    // pages, every one of them a citation inside a sentence: "…rather than by a
    // sweep (ADR-0011)." Making those 24px tall means padding a word in the
    // middle of a paragraph, which damages the reading to satisfy a rule that
    // explicitly does not apply to it. 2.5.8's *Inline* exception exists for
    // exactly this: a target "in a sentence or its size is otherwise
    // constrained by the line-height of non-target text".
    //
    // A gate that fires on honest prose is one people learn to route around —
    // the same argument `privacy-check.mjs` is built on — and the damage is
    // worse than the miss, because it also trains somebody to change good pages.
    //
    // Inline is decided structurally: the link computes to `display: inline` AND
    // its parent holds text that is not the link. A link alone in its block is a
    // standalone target and is still held to the floor.
    const small = await page.evaluate(() => {
      const bad = [];
      for (const a of document.querySelectorAll('a')) {
        const r = a.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const inline = getComputedStyle(a).display === 'inline';
        const surrounding = ((a.parentElement?.textContent ?? '').replace(a.textContent ?? '', '')).trim();
        if (inline && surrounding.length > 0) continue;
        if (r.height < 24 || r.width < 24) bad.push(`${(a.textContent || '').trim().slice(0, 28)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      return bad;
    });
    (small.length === 0 ? ok : fail)(`${at}: every standalone link is at least 24px both ways${small.length ? ` — ${small.slice(0, 3).join(' · ')}` : ''}`);

    await page.addScriptTag({ url: '/axe.min.js' });
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      return r.violations.map((v) => `${v.id} (${v.nodes.length})`);
    });
    (axe.length === 0 ? ok : fail)(`${at}: axe — ${axe.length} violation(s)${axe.length ? ` — ${axe.join(', ')}` : ''}`);

    await ctx.close();
  }
 }
}

await browser.close();
server.close();

if (failed === 0) {
  // Every page's hash, not only the ones walked: a page that was already
  // current stays current, and one that just passed is now recorded.
  const lines = state.map((p) => `${p.file}=${p.now}`).join('\n');
  writeFileSync(STAMP, `# Written by tools/pages-a11y.mjs on a clean run only.\n${lines}\n`);
  console.log(`\n${due.length} hosted page(s) pass: both themes, phone width and 200% text.`);
  console.log('  receipt written to .pages-a11y-stamp — none walks again until it changes.\n');
} else {
  // NO RECEIPT AT ALL on a failure, including for pages that passed in the same
  // run. A partial receipt would let the next run skip a page this one never
  // reached, which is the quiet kind of gap.
  console.log(`\n${failed} check(s) failed. No receipt written, for any page.\n`);
}
process.exit(failed === 0 ? 0 : 1);
