#!/usr/bin/env node
// THE HOSTED FLOWCHARTS PAGE, MEASURED — and measured only when it changes.
//
// WHY IT IS NOT PART OF `npm run a11y`. That walk drives the APP: it opens
// surfaces, sets state, and re-measures every one on every run because an app
// state can regress from a change made anywhere. A static document shares no
// code with the app and cannot regress from an app change. Re-walking it on
// every run would add browser minutes to every release to re-prove a fact that
// could not have moved.
//
// So this is stamped on the CONTENT it measures. Change `public/paths.html` or
// `public/paths.css` and the stamp no longer matches and the walk runs. Change
// nothing and it says so and exits 0. Run at creation, then only on change.
//
// **AND IT IS THE FIRST HOSTED PAGE EVER MEASURED.** `manual.html`, `why.html`
// and `plan.html` have shipped since 2.29.0 with no accessibility check of any
// kind — the app walk has never looked at them and nothing else does either.
// That is a real hole and this file does not close it; it closes one quarter of
// it, and names the rest so the next session does not have to rediscover it.
//
//   node tools/paths-a11y.mjs           walks if the stamp is stale
//   node tools/paths-a11y.mjs --force   walks regardless

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AXE = join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');
const STAMP = join(ROOT, '.paths-a11y-stamp');
const WATCHED = ['public/paths.html', 'public/paths.css'];

const hash = () => {
  const h = createHash('sha256');
  for (const rel of WATCHED) h.update(readFileSync(join(ROOT, rel)));
  return h.digest('hex').slice(0, 16);
};

const now = hash();
const recorded = existsSync(STAMP)
  ? (readFileSync(STAMP, 'utf8').match(/^page=([0-9a-f]+)$/m) ?? [])[1] ?? null
  : null;

if (!process.argv.includes('--force') && recorded === now) {
  console.log(`\nThe flowcharts page is unchanged since it was measured (${now}).`);
  console.log(`Watched: ${WATCHED.join(', ')}. Nothing to walk.\n`);
  process.exit(0);
}

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

const launchOpts = { args: ['--no-sandbox'] };
const SANDBOX = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
if (existsSync(SANDBOX)) launchOpts.executablePath = SANDBOX;

console.log(`\nThe flowcharts page, measured (${recorded ? `was ${recorded}, ` : 'never measured before, '}now ${now})\n`);

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

for (const theme of ['light', 'dark']) {
  for (const [label, width, fontPx] of [['390px', 390, 16], ['320px at 200%', 320, 32]]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 }, colorScheme: theme, hasTouch: true, isMobile: true,
    });
    const page = await ctx.newPage();
    const refusals = [];
    page.on('console', (m) => { if (/Refused to|Content Security Policy/i.test(m.text())) refusals.push(m.text().slice(0, 140)); });
    page.on('pageerror', (e) => refusals.push('ERROR ' + String(e).slice(0, 140)));
    await page.goto(`${base}/paths.html`, { waitUntil: 'networkidle' });
    if (fontPx !== 16) await page.evaluate((px) => { document.documentElement.style.fontSize = `${px}px`; }, fontPx);
    await page.waitForTimeout(300);
    const at = `${theme}/${label}`;

    (refusals.length === 0 ? ok : fail)(`${at}: the page loads with nothing refused${refusals.length ? ` — ${refusals[0]}` : ''}`);

    // THE STYLES ACTUALLY APPLIED. Everything below is satisfied by unstyled
    // markup, so this is the assertion that makes the rest mean anything.
    const styled = await page.evaluate(() => {
      const proc = document.querySelector('.proc');
      const act = document.querySelector('.flow li.act');
      if (!proc || !act) return null;
      return {
        border: getComputedStyle(proc).borderTopWidth,
        amber: getComputedStyle(act).boxShadow !== 'none',
        bg: getComputedStyle(document.body).backgroundColor,
      };
    });
    (styled && styled.border !== '0px' && styled.amber ? ok : fail)(
      `${at}: the stylesheet applied — ${styled ? `.proc border ${styled.border}, act marker ${styled.amber ? 'drawn' : 'ABSENT'}, body ${styled.bg}` : 'NO CONTENT FOUND'}`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    (overflow <= 1 ? ok : fail)(`${at}: horizontal overflow ${overflow}px (must be ≤1)`);

    // Every link is a target a finger takes.
    const small = await page.evaluate(() => {
      const bad = [];
      for (const a of document.querySelectorAll('a')) {
        const r = a.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.height < 24 || r.width < 24) bad.push(`${(a.textContent || '').trim().slice(0, 28)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      return bad;
    });
    (small.length === 0 ? ok : fail)(`${at}: every link is at least 24px both ways${small.length ? ` — ${small.slice(0, 3).join(' · ')}` : ''}`);

    await page.addScriptTag({ url: '/axe.min.js' });
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      return r.violations.map((v) => `${v.id} (${v.nodes.length})`);
    });
    (axe.length === 0 ? ok : fail)(`${at}: axe — ${axe.length} violation(s)${axe.length ? ` — ${axe.join(', ')}` : ''}`);

    await ctx.close();
  }
}

await browser.close();
server.close();

if (failed === 0) {
  writeFileSync(STAMP, `# Written by tools/paths-a11y.mjs on a clean run only.\npage=${now}\n`);
  console.log('\nThe flowcharts page passes: both themes, phone width and 200% text.');
  console.log('  receipt written to .paths-a11y-stamp — it will not walk again until the page changes.\n');
} else {
  console.log(`\n${failed} check(s) failed. No receipt written.\n`);
}
process.exit(failed === 0 ? 0 : 1);
