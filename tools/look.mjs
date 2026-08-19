#!/usr/bin/env node
// LOOK AT IT.
//
// This repo has twenty tools that measure the app and, until this one, none that
// showed it. Asked whether a version designed whole would look like the version
// arrived at by iteration, the answer given was pixel offsets and control counts,
// and the app was never once rendered and looked at.
//
// Every defect reported from the device across seven releases was visible at a
// glance in a picture and came from none of the numbers: text that scaled the
// letters and not the boxes, a proof line cut through the middle of its own
// sentence, two buttons touching, and a screen showing exactly one task that was
// still too busy to begin in. The gates were green for all of them, correctly —
// they measured what they measured.
//
// So this asserts nothing. No counts, no budgets, no exit code to satisfy. It
// takes the screen as a person meets it and writes it to a file, because the
// missing step was never a check, it was looking.
//
//   npm run look                  (writes to /tmp/quietkeep-look unless told otherwise)
//   npm run look -- --out ./shot  (somewhere else)
//   npm run look -- --width 768   (the tablet it is actually used on)
//
// REAL INPUT EVENTS ONLY, and that is not a detail. The first version of this
// drove the app with `element.click()` inside `page.evaluate`, which is a
// synthetic click: Chromium does not count it as a user interaction and leaves
// the focus modality wherever it was. The picture it produced of "Just one thing"
// had a 3px focus ring painted around the heading — the loudest box on a screen
// whose entire purpose is that nothing is loud — and that ring is not in the app.
// Tapping the same control with `page.tap` gives `:focus-visible: false` and
// `outline: 0px`, which is what a finger actually gets.
//
// A tool built to show the truth about a screen had been quietly rendering a
// state no person can reach. That is this repo's oldest defect — the gate whose
// passing branch measures something other than the thing — and it very nearly
// bought a "fix" to correct behaviour that was already correct.

import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { serve } from './serve.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const OUT = resolve(arg('out', '/tmp/quietkeep-look'));
const WIDTH = Number(arg('width', 390));
const HEIGHT = Number(arg('height', 844));
mkdirSync(OUT, { recursive: true });

const launchOpts = { args: ['--no-sandbox'] };
const CHROME = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
if (existsSync(CHROME)) launchOpts.executablePath = CHROME;

const served = await serve(join(root, 'public'));
const browser = await chromium.launch(launchOpts);
// `hasTouch` so a tap is a tap. Without it Playwright's tap throws and the
// fallback is a mouse click, which is a different modality and a different
// picture — see the note above.
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();
await page.goto(served.url || served, { waitUntil: 'load' });
await page.waitForSelector('body[data-ready=true]');

/** Sheets left open by the previous step would be in the picture of the next
 *  one, and the runway holds its scroll across a state change. */
const settle = async () => {
  await page.evaluate(() => {
    for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
    const r = document.querySelector('#runway');
    if (r) r.scrollTop = 0;
  });
  await page.waitForTimeout(700);
};

const shot = async (name, opts = {}) => {
  await settle();
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path, ...opts });
  console.log(`  ${path}`);
};

console.log(`\nThe app at ${WIDTH}×${HEIGHT}, as a finger meets it\n`);

await shot('01-first-run');

// Nothing in the store is the state every newcomer starts in, and it is the one
// state the sample never shows.
await page.evaluate(() => document.querySelector('#more')?.showModal());
await page.waitForSelector('#more[open]');
await page.tap('.more-go[data-go="group-actions"]');
await page.waitForSelector('#sheet-group-actions[open]');
await page.tap('#sample');
await page.waitForTimeout(2500);
await shot('02-with-things-in-it');

// The whole runway, not only the first screen. What is below the fold is the
// half nobody looks at and the half that grows without anyone deciding to.
//
// `fullPage: true` DOES NOT DO THIS, and its picture looks exactly like a
// correct one. Since 2.9.0 the shell is a fixed-height body with the list in an
// inner scroller (`#runway`), so the DOCUMENT does not scroll — `fullPage`
// faithfully captures a document that is exactly one screen tall and returns the
// first screen under a filename that says whole page. The first version of this
// tool shipped that, in the release whose entire subject was that nobody had
// looked below the fold.
//
// So the viewport is grown to the content instead. That changes no state and no
// attribute; it is the same app, rendered tall. And the shot is only taken once
// the runway has been PROVED to have nothing left below it — a picture claiming
// to be everything has to be able to show it is.
await settle();
{
  const need = await page.evaluate(() => {
    const r = document.querySelector('#runway');
    const f = document.querySelector('.frame');
    if (!r) return null;
    return Math.ceil(r.scrollHeight + (f?.getBoundingClientRect().height ?? 0) + 24);
  });
  if (need === null) {
    console.log('  (no #runway — the shell has changed shape and this shot needs rewriting)');
  } else {
    await page.setViewportSize({ width: WIDTH, height: Math.max(HEIGHT, need) });
    await page.waitForTimeout(700);
    const left = await page.evaluate(() => {
      const r = document.querySelector('#runway');
      if (!r) return -1;
      r.scrollTop = r.scrollHeight; // if anything is below, this moves.
      const below = r.scrollTop;
      r.scrollTop = 0;
      return below;
    });
    if (left > 1) {
      console.log(`  WARNING: ${left}px of the runway is still below this picture — it is not the whole page.`);
    }
    await shot('03-the-whole-page', { fullPage: true });
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.waitForTimeout(500);
  }
}

// And the mode that exists to answer the worst day. If this one is busy, the
// mode does not work, which is exactly what was reported.
const reachable = await page.evaluate(() => {
  const b = document.querySelector('#nextup-plain');
  return Boolean(b && b.checkVisibility());
});
if (reachable) {
  await page.tap('#nextup-plain');
  await page.waitForTimeout(1500);
  await shot('04-just-one-thing');
} else {
  console.log('  (could not reach "Just one thing" — it is not on screen)');
}

console.log('\nNow open them.\n');
await browser.close();
if (served.close) await served.close();
process.exit(0);
