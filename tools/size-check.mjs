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
  // 3300 -> 3340 on 2026-08-17 (ADR-0096). Roles add one labelled field to the
  // detail sheet with its hint, and one readout sheet whose whole content is a
  // sentence saying it is NOT a score. That sentence is the thing that makes the
  // readout legal under law 7, so cutting it to fit a word budget would cut the
  // safeguard and keep the numbers — exactly backwards.
  // 3340 -> 3390 on 2026-08-17 (ADR-0098). One Settings block: a heading, two
  // sentences of scope, a label and the note. The scope sentences ARE the
  // feature — the request was for a size that touches this app and nothing else,
  // so a control that did not say so would be answering a different question.
  // 3390 -> 3394 on 2026-08-22 (2.20.0): two words in the relation picker
  // ("I said I would") and the second count line in "With other people". The
  // section was already there and already said what it was for; it had one of
  // its two halves. This is the smaller half arriving, not a new surface.
  // 3394 -> 3455 on 2026-08-22 (2.21.0): the situation sheet. A heading, one
  // paragraph saying what the two inputs do and that nothing is taken away
  // (the law-1 sentence every filter surface here carries), a label, a
  // placeholder and a hint. **The two inputs themselves moved rather than
  // arrived** — they were in the pile and the pile is the last place somebody
  // answering "what is my situation" looks. What a reader meets on the first
  // screen goes DOWN by two rows and up by one door; this budget counts words
  // in the markup and cannot see that, which is the fourth time in six
  // releases it has read the wrong way round.
  words: 3455,
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
  // 1200 -> 1300 on 2026-08-19 (2.10.1). Four pixels over, and this file's own
  // note twenty lines up settles it: "six pixels is never a reason to cut a
  // sentence" — hub LESSONS §62, where three pixels of headroom were bought by
  // making the product measurably less honest. The release that reports having
  // finally LOOKED at the screen is not the one to trim for four pixels.
  //
  // 1300 -> 1400 THE SAME DAY, IN THE SAME RELEASE, and the second raise is the
  // one worth reading. 1300 was set against six bullets and then a seventh was
  // written — the `#menu-open` move, which `controls.mjs` REQUIRES in the running
  // release's notes — so the budget had been fitted to a block that was not
  // finished. Raising a ceiling to clear a measurement taken before the work was
  // done is not a deliberate raise, it is a ratchet chasing its own tail.
  //
  // The seventh bullet was first folded into the third to save the height. IT
  // SAVED NOTHING — 1330px before and 1330px after, because the height is the
  // words and the words did not change — and it cost the declaration the shape
  // `controls.mjs` asks for, which leads with WHERE. Merging prose to satisfy a
  // pixel budget is the §62 trap wearing a disguise: it looks like editing and it
  // is the same trade, honesty for headroom, with the honesty spent on layout
  // instead of on a cut sentence.
  //
  // So: seven bullets measure 1330. 1400 is that with one line spare, and ten
  // bullets are still near 3,000 and still fail, which is what this number is
  // actually for.
  notesPx: 1400,
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
  //
  // 212 -> 213 on 2026-08-12 (ADR-0089), and it is the third instance of the
  // same trade rather than a new one: the Menu became a sheet, and a sheet owes
  // its own Close outside the scrolling body or the way out scrolls away (§4).
  // One control, unreachable without first pressing `#menu-open`, which has
  // been on that surface all along.
  //
  // THE COUNT IS NOT THE MEASUREMENT THAT MATTERED HERE, and saying so is the
  // point of a comment rather than a number: this release took 2,597px of fold
  // off the work surface, and the three ADR-0088/0089 sheets between them took
  // 45,874px. A gate that can only see +1 control would have read all of that
  // as a regression. It is a ratchet against sprawl, not a scoreboard.
  //
  // 213 -> 214 on 2026-08-12 (ADR-0090), and this one is the HARDER argument,
  // so it gets the longer reason: it adds a control to the work surface, which
  // is the surface this budget exists to protect, and it is not a way out of a
  // sheet like the last three.
  //
  // What buys it: the affordance is not new. `.skip` has said "Skip to what you
  // are holding" since the first release and is positioned off-screen until
  // focused, so it has served a keyboard and a screen reader and nobody else —
  // and `#capture` carries `autofocus`, so it is not even in the forward tab
  // order. This makes an existing decision reachable by finger rather than
  // adding a new capability.
  //
  // And it is CONDITIONAL, which nothing else counted here is: it renders only
  // when a section is live above the list and the list has rows. On a quiet day
  // and on an empty store the count is 213, not 214. This number is the worst
  // case, which is the right thing for a ceiling to measure.
  // 214 -> 215 on 2026-08-12 (ADR-0091) for the way BACK. Reported from a
  // device, as a question: how do I get back. There was no answer — nothing
  // anywhere in the app returned the reader to the top, so the jump added the
  // release before was a one-way trip up to five screens down.
  //
  // A budget that refuses the return leg of a route it already permitted is a
  // budget being read as a score. The ceiling exists to stop sprawl, and a way
  // out of somewhere the app sent you is not sprawl.
  // 215 -> 219 on 2026-08-17 (ADR-0092), and this is the FEATURE argument the
  // 205->210 note said should be harder to win. It is won on what was missing
  // rather than on what is being added.
  //
  // The four: the context input and its Add on the detail sheet, the "Where you
  // are" chooser on the work surface, and the offered card's title becoming a
  // button. The last one is a control that was ALREADY THERE and was a <p> — the
  // one item the app actively hands you was the only thing on the screen that
  // could not be opened, so changing it meant navigating away to find it again.
  //
  // Contexts are the axis this app did not have. The tree gives a thing one
  // parent — where it LIVES. Nothing said where it could be DONE, so every list
  // was every list and "show me what I can do at home" had no answer. That is a
  // planner's building block, not an embellishment, and this budget exists to
  // stop sprawl rather than to stop the app being finished.
  // 219 -> 222 on 2026-08-17 (ADR-0093), and this trio REMOVES reading rather
  // than adding it, which is the only argument this ceiling should accept twice
  // in one day.
  //
  // The three: a Contents door in the header beside More, a second at the end of
  // the held list beside Back to the top, and the Close on the sheet they open.
  // The rows inside are not a fourth — they are one per live block, they replace
  // travelling past that block, and they exist only while the block does.
  //
  // IT IS THREE AND NOT TWO because the door is not fixed, and that cost a
  // control. A floating one measured taking the tap from three Done buttons
  // (ADR-0093), so there are two in flow instead — one at each end of the page.
  // A budget is the wrong instrument for arbitrating that: the choice was
  // between a cheaper control that steals presses and a dearer one that does
  // not.
  //
  // The count this budget actually measures is CONTROLS, and the thing it is
  // protecting is the reader's effort. Those come apart here: the page was
  // measured at 3.0 screens on thirteen sample things and 8 live blocks on a
  // real store, with no index of what was even on it and no way to reach any
  // block but the two at the ends. Two controls that answer "what is here and
  // how do I get to it" buy back more than they cost, and refusing them on a
  // count would be the budget read as a score — the failure its own 214 -> 215
  // note names.
  // 222 -> 226 on 2026-08-17 (ADR-0096), and this is the FEATURE argument again
  // rather than the cheap one. The four: the role input and its Add on the
  // detail sheet, the "Where the attention is" door, and that sheet's Close.
  //
  // It is the same trade contexts won at 215 -> 219 and it is won on the same
  // ground: an axis the app did not have. The tree says where a thing LIVES and
  // a context says where it can be DONE; nothing said WHO it was for, so "am I
  // putting enough into each part of my life" had no answer anywhere in the
  // product. Two of the four exist only to leave or reach a surface, and the
  // door is hidden entirely until a role has been named — on a store with none,
  // the count is 224.
  // 226 -> 228 on 2026-08-17 (ADR-0098): the size chooser and its Set, in
  // Settings, beside the timer length and the day boundary they are shaped after.
  // Both are set calmly rather than in the moment they would matter, which is
  // the same reason the timer's length lives there.
  //
  // It BUYS BACK reading rather than adding it, which is the argument this
  // ceiling accepts: a reader who sets the app smaller fits more of their own
  // work on a screen, and every measurement this month has been about how far
  // somebody has to travel to reach their own list.
  // 228 -> 229 on 2026-08-18 (ADR-0099), and the +1 is an ACCOUNTING artefact
  // of this rule, not growth. Three doors left the runway: `#sort-open` (a
  // button, counted) and the two `<summary>` elements on the worry and load
  // entries (NOT counted — this regex reads button/input/select/textarea, and a
  // summary is none of them). Two sheet Closes arrived, both counted. So the
  // page shed three controls a finger can press and the number went UP by one.
  //
  // THE REGEX IS THE DEFECT, and it is the same one 2.8.0 found in the a11y
  // walk's target audit an inch away from here: a hand-written list of element
  // TYPES that omits the ones this app happens to use as controls. It is not
  // widened in this release because doing so reprices every historical figure
  // in this comment at the same time as a layout change, and then neither the
  // count nor the layout could be read against what came before. It is worth
  // doing on its own.
  //
  // What the release actually did to the first screen was measured rather than
  // counted, at 390x844: fourteen controls to thirteen on an empty store,
  // fifteen to fourteen with the sample on, and Next up from 0.48 screens to
  // 0.43.
  // 229 -> 230 on 2026-08-19 (2.10.1): "Start smaller" is a door now. The card
  // carried an always-open text field, a filled submit beside it and four lines
  // of prose explaining what a first step is — a manual printed on the thing you
  // are trying to begin. One button replaces the standing form, so the COUNT
  // goes up by one and what is on the card at rest goes down by three, plus the
  // paragraph. This budget counts controls in the markup and cannot see that,
  // which is the second time in three releases it has read the wrong way round;
  // the note is the record, as it is meant to be.
  //
  // 230 -> 232 on 2026-08-22 (2.18.0): "What you're working toward" is a sheet,
  // so it costs a door and a Close, the same two every sheet here costs. Neither
  // is on the first screen at rest: the door is `hidden` until a horizon exists,
  // which for a store that has never made one is always, and the Close lives
  // inside the dialog. So the count goes up by two and what a new reader meets
  // does not change at all — the third time in five releases this budget has
  // read the wrong way round, and the note is the record.
  //
  // 232 -> 233 on 2026-08-22 (2.19.0): "How long you have" is one chooser, and
  // unlike the place chooser beside it, it is never hidden — an unestimated
  // thing fits every answer, so it works on the first day and withholding it
  // would be withholding a control that works. It sits inside `#held`, so it is
  // one more control on the pile's own row and none on the first screen.
  // 233 -> 237 on 2026-08-22 (2.21.0): a door, a Close, a name field and its
  // button. The two choosers moved into the sheet rather than being added, so
  // the count rises by exactly the four the sheet itself costs — the same two
  // per sheet every other one here costs, plus the one control that makes a
  // situation recallable and nothing else.
  // 237 -> 238 on 2026-08-22 (2.22.0): "Show me" beside the report's four
  // export buttons. It is inside the ⓘ panel, so nothing on the first screen
  // changes — and it is the one control there that WRITES NOTHING, which is
  // why it exists: every other route records the export and moves the mark, so
  // reading the report cost you the period you read it for.
  controls: 238,
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
