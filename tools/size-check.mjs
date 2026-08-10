#!/usr/bin/env node
// HOW MUCH DOES A PERSON HAVE TO READ? — the measurement nobody was taking.
//
// Reported 2026-08-09, on a real device, in the plainest possible terms: finding
// how to send something to the calendar took minutes of scrolling and reading,
// and the app reads like an encyclopedia. It did. The shell held 5,702 words and
// 148 controls, in an app whose thesis is *one thing, chosen for you*, built for
// people who lose the thread when there is too much on screen.
//
// THE MECHANISM IS THE POINT, because it will do this again. Every rule in the
// doctrine says explain it, say why, never let anything be silent, add the hint,
// state the reason. Applied release by release they are all defensible and each
// addition is small. Nothing ever measured the SUM. There were eleven gates in
// this repo and not one of them counted anything a reader has to get through, so
// the total grew for weeks with every gate green.
//
// A budget is the only thing that turns "keep it short" from an intention into a
// gate. These numbers are not aspirations — they are slightly above what the app
// measures today, so the next thing that pushes past them has to be worth
// pushing past them, and somebody has to decide that on purpose.
//
// WHAT IT MEASURES, and each is a different way of being too long:
//   1. Words in the shell — total reading, wherever it hides.
//   2. Rendered height of the ⓘ panel at phone width — scroll distance, which is
//      what "I could not find it" actually feels like. Words alone miss this:
//      the same text in bigger type is a longer scroll.
//   3. Controls — 148 buttons is its own kind of unreadable, and cutting prose
//      does not touch it.
//
// RAISING A BUDGET IS ALLOWED. Lowering it silently is not the point either.
// What is refused is drifting past one without noticing, which is exactly what
// happened.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Set 2026-08-09, just above what the app measures after the reduction from
// 5,702 words. A ceiling to stop drift, NOT a claim that the current numbers are
// right — 199 controls is a lot for this product and the honest thing is to say
// so here rather than to launder it as a target that has been met. Cutting
// controls is a different and larger job than cutting prose; this stops the
// number growing while nobody is looking, which is the failure that happened.
const BUDGET = {
  words: 3300,
  panelPx: 9000,        // folded, which is the state a reader meets
  // 205 -> 210 on 2026-08-09, ONE COMMIT after this gate was written, because it
  // caught its own author: adding navigation ("More", five destinations and a
  // close) took the count from 199 to 207.
  //
  // Raised on purpose and with a reason, which is the whole contract. The trade
  // is deliberate — eight controls that exist ONLY to make the other 199
  // reachable are not the same as eight more things to do, and an app with no
  // navigation is what put everything behind one button in the first place.
  // If this ever needs raising for eight more FEATURES, that is a different
  // argument and it should be a harder one to win.
  controls: 210,
};

const launchOpts = process.env.PLAYWRIGHT_CHROMIUM
  ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM }
  : {};

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

// --- 1 · words, straight off the shipped markup ------------------------------
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const visible = html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ');
const words = visible.split(/\s+/).filter(Boolean).length;
const controls = (html.replace(/<!--[\s\S]*?-->/g, '').match(/<button|<input|<select|<textarea/g) ?? []).length;

console.log('\nHow much is there to get through\n');
(words <= BUDGET.words ? ok : fail)(`${words} words in the shell (budget ${BUDGET.words})`);
(controls <= BUDGET.controls ? ok : fail)(`${controls} controls (budget ${BUDGET.controls})`);

// --- 2 · scroll distance, rendered, at the width it is read on ---------------
const { server, url } = await serve(ROOT);
const browser = await chromium.launch(launchOpts);
try {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },   // a phone, which is the hard case
    timezoneId: 'America/Denver', locale: 'en-US',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready=true]');
  await page.click('#tour-skip').catch(() => {});
  await page.click('#open-about');
  await page.waitForSelector('#about-body');

  // Folded, which is the state a reader actually meets it in.
  const px = await page.evaluate(() => document.querySelector('#about-body')?.scrollHeight ?? 0);
  (px <= BUDGET.panelPx ? ok : fail)(
    `the ⓘ panel is ${px}px of scroll at 390px wide, folded (budget ${BUDGET.panelPx})`);

  // And unfolded, because every group opening at once is a state one press away
  // and it is where this went wrong before.
  await page.evaluate(() => {
    for (const b of document.querySelectorAll('.about-group-toggle')) {
      if (b.getAttribute('aria-expanded') !== 'true') b.click();
    }
  });
  const pxOpen = await page.evaluate(() => document.querySelector('#about-body')?.scrollHeight ?? 0);
  console.log(`        (everything unfolded: ${pxOpen}px — recorded, not budgeted)`);
} finally {
  await browser.close();
  server.close();
}

console.log('');
if (failed) {
  console.error(`${failed} budget(s) exceeded.\n`);
  console.error('Raising a budget is allowed and should be deliberate. Drifting past');
  console.error('one without noticing is what this exists to stop.\n');
  process.exit(1);
}
console.log('Within budget.\n');
