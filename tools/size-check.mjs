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
//   2. Rendered height of EVERY destination at phone width — scroll distance,
//      which is what "I could not find it" actually feels like. Words alone miss
//      this: the same text in bigger type is a longer scroll.
//   3. Controls — 148 buttons is its own kind of unreadable, and cutting prose
//      does not touch it.
//
// PER SURFACE, NOT PER PANEL (1.40.0). This measured `#about-body` alone, when
// the ⓘ was the only screen and the four groups folded inside it. Splitting them
// into their own sheets made that number fall by three quarters without a word
// being cut — the reading did not go anywhere, it went somewhere the gate could
// not see. A budget that a refactor satisfies is not measuring the thing it was
// written to measure.
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
  // Per DESTINATION, and every one is held to it. 3,000px is a shade over three
  // phone screens — far enough to be a scroll, near enough that the bottom of a
  // screen is a place you can get to rather than a place you give up before.
  //
  // Set from what the four sheets actually measure at 1.40.0 (Settings is the
  // tallest and has the most headroom to lose). It replaces `panelPx: 9000`,
  // which was set against a thirteen-screen panel and was never a limit anybody
  // could hit — a budget nothing can exceed is a comment.
  surfacePx: 3000,
  // The sum, so that "make it six screens instead of one" cannot pass by
  // dividing. What a person has to get through does not shrink because it was
  // filed, and this number is here to say so out loud: splitting Settings into
  // three destinations in 1.40.0 moved 10,830px around and cut NOTHING. Travel
  // was the complaint and travel is what the per-surface budget fixes; the total
  // is still an app with ten screens of explanation in it.
  //
  // Set just above today's measurement, as a ratchet. It is not a target that
  // has been met — the honest thing is to say here that it is too high rather
  // than to launder it as an achievement.
  allSurfacesPx: 11000,
  // The current release's notes, measured alone. Their own budget rather than a
  // share of the ratchet above, because they rotate out and standing prose does
  // not — see the long note at the measurement.
  //
  // 1200. Two reader-facing bullets measure 606px; four longer ones measured
  // 1049px before two were cut for being about the test suite rather than about
  // the app (§5). So this is room for a genuinely big release to say what it did
  // AND what it did not fix, and not room for an essay — ten bullets would be
  // near 3,000 and would fail.
  //
  // IT WAS 600 FOR TEN MINUTES AND THAT NUMBER WAS WRONG. It came from the
  // DELTA between this release's notes and the previous one's (390px), not from
  // the height of the block itself (1,049px) — a number measured for one purpose
  // and reused for another without re-reading what it was. The gate then failed
  // by six pixels, which is the exact trap hub LESSONS §62 records: three pixels
  // short, with the product's honesty measurably worse. Six pixels is never a
  // reason to cut a sentence.
  notesPx: 1200,
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
  //
  // 210 -> 212 on 2026-08-11 (ADR-0088), and it is the same argument as the
  // raise above rather than the harder one. Two sheets took the place of two
  // inline folds; a sheet owes its own Close, outside the scrolling body, or
  // the way out scrolls away (§4). So this is +2 controls that exist ONLY to
  // leave surfaces that already existed — and the change DELETED scroll rather
  // than adding any: the ⓘ went from 2281px to 2084px in the same commit, and
  // the workspace shed up to 43,277px of fold.
  //
  // Worth stating plainly since the count only ever rises here: nothing on the
  // workspace gained a control, and the two it did gain cannot be reached
  // without first pressing something that was already there.
  controls: 212,
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

  // Every destination More can land somebody on, measured at its own scroller.
  // The names are the reader's, not the ids, because the number means nothing
  // without knowing which screen it is.
  const SURFACES = [
    ['the ⓘ', 'about', '#about-body'],
    ['How it works', 'sheet-group-why', '#sheet-group-why .sheet-body'],
    ['Help', 'sheet-group-help', '#sheet-group-help .sheet-body'],
    ['Your data', 'sheet-group-data', '#sheet-group-data .sheet-body'],
    ['Things you can do', 'sheet-group-actions', '#sheet-group-actions .sheet-body'],
    ['Settings', 'sheet-group-extras', '#sheet-group-extras .sheet-body'],
  ];
  let total = 0;
  for (const [name, id, scroller] of SURFACES) {
    await page.evaluate((want) => {
      for (const d of document.querySelectorAll('dialog')) if (d.id !== want && d.open) d.close();
      const t = document.querySelector('#' + want);
      if (t && !t.open) {
        if (want === 'about') document.querySelector('#open-about')?.click();
        else t.showModal();
      }
    }, id);
    await page.waitForSelector(`#${id}[open]`);
    const px = await page.evaluate((sel) => document.querySelector(sel)?.scrollHeight ?? 0, scroller);
    // THIS RELEASE'S PATCH NOTES ARE NOT STANDING PROSE, AND THE RATCHET IS
    // ABOUT STANDING PROSE.
    //
    // The total below is a ratchet against sprawl — its own comment says so:
    // "an app with ten screens of explanation in it". Explanation accumulates
    // and never leaves, which is what makes a ratchet the right instrument.
    //
    // The current release's notes are the opposite. Only the newest release is
    // shown and the previous one folds away, so this block ROTATES rather than
    // accumulating, and its size is whatever this release happened to change.
    // Measured on 2026-08-11: a four-bullet note costs 390px, and the ratchet
    // had 98px of headroom. So a perfectly ordinary release fails it, and the
    // only edit that makes the number go down is deleting patch notes — which
    // Doctrine §7d requires, INCLUDING what is still broken.
    //
    // That is hub LESSONS §62 exactly: a height budget that costs the product a
    // sentence every time it binds is measuring a state nobody reads in. There,
    // five bullets became three and three became shorter, buying 272px and
    // leaving the next release facing the same squeeze from a worse start. The
    // per-surface budgets are nowhere near their limit here — the ⓘ is 2,671
    // against 3,000 — so the READER's experience was never in question.
    //
    // So the notes are measured on their own terms and excluded from the
    // ratchet. Not exempted: `notesPx` bounds them, and it bounds the thing that
    // could actually go wrong — one release writing an essay.
    const notesPx = id === 'about'
      ? await page.evaluate(() => {
        const list = document.querySelector('#about-body .note-list');
        return list ? Math.round(list.getBoundingClientRect().height) : 0;
      })
      : 0;
    if (notesPx) {
      (notesPx <= BUDGET.notesPx ? ok : fail)(
        `this release's notes are ${notesPx}px of that (budget ${BUDGET.notesPx}) — they rotate, so they are not in the total`);
    }
    total += px - notesPx;
    (px <= BUDGET.surfacePx ? ok : fail)(
      `${name} is ${px}px of scroll at 390px wide (budget ${BUDGET.surfacePx})`);
  }
  (total <= BUDGET.allSurfacesPx ? ok : fail)(
    `${total}px of standing prose across all ${SURFACES.length} destinations (budget ${BUDGET.allSurfacesPx})`);
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
