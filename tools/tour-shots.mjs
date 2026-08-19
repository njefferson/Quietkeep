#!/usr/bin/env node
// THE WALKTHROUGH SHOWS YOU THE THING IT IS TALKING ABOUT.
//
// Six steps of prose describing an app the reader is looking at and cannot see
// yet — "the box at the top", "it offers you a small number of things" — with no
// picture of any of it. This renders the actual region each step describes, in
// both themes, and writes it into `public/tour/`.
//
//   npm run tour:shots            (regenerate)
//   npm run tour:check            (fail if they were generated against a
//                                  different UI — see the drift note below)
//
// CROPS, NOT SCREENS, and the reason is not only weight. A full screen at 2x is
// about 64KB and ten of them is three quarters of a megabyte in a shell that has
// to precache for offline — but the better argument is that a picture of the
// whole screen does not point at anything. The step about the capture box should
// show the capture box.
//
// GENERATED, NEVER DRAWN, and never hand-updated. A help document illustrated
// with pictures of a UI that has moved on is worse than one with no pictures,
// because prose that is out of date reads as out of date and a screenshot reads
// as proof. This repo has found that same stale-record defect in four places;
// the fix that worked every time is one source plus a gate that fails on drift.
// So these come out of the running app, and `--check` refuses to pass once the
// files that decide what the app looks like have changed underneath them.
//
// NOT BYTE-REPRODUCIBLE, and that is a property to know rather than a defect to
// chase. Two of these pictures show things that legitimately differ run to run:
// the sorting card holds whichever sample item is next in the queue, and the
// storage panel reports the browser's real figures for free space. Regenerating
// with nothing changed still rewrites four of the ten files.
//
// So there is deliberately NO "CI re-renders and compares the bytes" check. It
// would be permanently red, and a gate that is always red is a gate everybody
// learns to ignore — which is worse than the staleness it was meant to catch.
// Freshness is enforced at the moment of the change instead, by the pre-commit
// hook (`--staged`), with `--check` as the cheap backstop in CI.
//
// It also means `--if-stale` earns its keep: an unconditional regeneration on
// every build would put four changed binaries in every single diff.
//
// WHAT IT DOES NOT DO: write the alt text. That is in `src/ui/tour.ts`, by hand,
// because alt text says what a picture MEANS to somebody who cannot see it, and
// nothing that crops a rectangle knows that.

import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serve } from './serve.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'public/tour');
const MANIFEST = join(OUT, 'manifest.json');
const CHECK = process.argv.includes('--check');

/**
 * The files that decide what is IN these pictures. If any of them moves, the
 * pictures are of a previous app and the gate says so.
 *
 * NARROW ON PURPOSE, and the list has already been wrong once. It began with
 * `src/ui/tour.ts` in it — the file holding the walkthrough's own words — which
 * cannot change what the app LOOKS like, so the gate went red the moment the
 * alt text was written and demanded a regeneration that could not have altered
 * a single pixel. A gate that cries wolf gets satisfied by reflex, and then it
 * is not a gate. `app.js` is out for the same reason from the other direction:
 * it is a build artefact of `src/`, so hashing it would fail on any rebuild.
 *
 * `about.ts` and `clarify.ts` ARE here — they render the storage facts and the
 * sorting choices that two of these pictures consist of.
 */
const SOURCES = [
  'public/index.html', 'public/app.css',
  'src/ui/work.ts', 'src/ui/clarify.ts', 'src/ui/about.ts',
];

const uiHash = () => {
  const h = createHash('sha256');
  for (const rel of SOURCES) h.update(readFileSync(join(root, rel)));
  return h.digest('hex').slice(0, 16);
};

/**
 * One entry per illustrated step. `step` is the 1-based index in `stepsNow()`.
 *
 * `reach` puts the app into the state where the region exists, and returns the
 * selector to crop. Written as a function rather than a bare selector because
 * half of these do not exist on a first-run screen — the offer card needs
 * something to offer — and a crop of an element that is not there would be a
 * blank rectangle shipped as an illustration.
 */
const SHOTS = [
  {
    step: 2,
    name: 'capture',
    async reach(page) {
      await page.evaluate(() => {
        const c = document.querySelector('#capture');
        c.value = 'ring the plumber back about the tap';
        c.dispatchEvent(new Event('input', { bubbles: true }));
      });
      return '#capture-form';
    },
  },
  {
    step: 3,
    name: 'sorting',
    // The prompt and the choices it offers, which is the whole lesson.
    // To the LAST choice, not to `#triage` itself. The section's own box ends
    // above its final row of buttons, so framing to the section shipped a
    // picture cut through "Put it somewhere" — and nothing was wrong with the
    // clip, which is why the cut-detection above stayed quiet. The element was
    // honoured exactly; it was the wrong element.
    frame: { from: '#triage', to: '#triage-actions button' },
    async reach(page) {
      await seed(page);
      // The inline one-card-at-a-time pass on the main screen — which is what
      // this step describes, and not the `Sort things out` batch picker.
      await page.evaluate(() => { document.querySelector('#triage-open')?.click(); });
      await page.waitForSelector('#triage:not([hidden])', { timeout: 15000 });
      await page.waitForTimeout(500);
      return '#triage';
    },
  },
  {
    step: 4,
    name: 'offer',
    // Heading to the quiet verbs, and stopping there. The also-available rows
    // below are the subject of a different sentence, and including them makes
    // the picture argue with the step's own words about being handed ONE thing.
    frame: { from: '#nextup-heading', to: '#nextup-plain' },
    async reach(page) {
      await seed(page);
      await page.waitForSelector('#nextup:not([hidden])');
      return '#nextup';
    },
  },
  {
    step: 5,
    name: 'quiet-day',
    async reach(page) {
      await seed(page);
      await page.waitForSelector('#nextup-plain');
      await page.click('#nextup-plain');
      await page.waitForTimeout(1200);
      return '#nextup';
    },
  },
  {
    step: 6,
    name: 'your-data',
    // What the browser has promised, and the button that writes the copy —
    // which is exactly what this step's words are about. Cropping the whole
    // panel showed a file picker and a paragraph about the append-only log,
    // neither of which the step mentions.
    frame: { from: '#storage-body', to: '#export' },
    async reach(page) {
      // "It is yours, and it is all here" is about the copy you keep, so the
      // picture is the block that says what the browser has promised and hands
      // you the export — not the panel's masthead.
      // THROUGH THE DOOR, NOT `showModal()`. Opening the dialog directly skips
      // the code that asks the browser about persistence and fills the list, so
      // the facts never arrive and the frame is a gap. The route a person takes
      // is the route that paints.
      await page.evaluate(() => document.querySelector('#more')?.showModal());
      await page.waitForSelector('#more[open]');
      await page.click('.more-go[data-go="group-data"]');
      await page.waitForSelector('#sheet-group-data[open]');
      // WAIT FOR THE ANSWER, DO NOT RACE IT. `#storage-body` is a <dl> filled
      // once the browser has answered about persistence, and framing before
      // that produced a picture of a heading, a gap where the facts belong, and
      // a button — which is the same "revealing a surface before it can say
      // anything" mistake the a11y walk already carries a note about.
      await page.waitForFunction(
        () => (document.querySelector('#storage-body')?.children.length ?? 0) > 0,
        { timeout: 15000 });
      await page.waitForTimeout(400);
      return '#sheet-group-data .sheet-body';
    },
  },
];

/** The thirteen-item sample, through the app's own control. */
async function seed(page) {
  const already = await page.evaluate(() =>
    Boolean(document.querySelector('#nextup') && !document.querySelector('#nextup').hidden));
  if (already) return;
  await page.evaluate(() => document.querySelector('#more')?.showModal());
  await page.waitForSelector('#more[open]');
  await page.click('.more-go[data-go="group-actions"]');
  await page.waitForSelector('#sheet-group-actions[open]');
  await page.click('#sample');
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
  });
  await page.waitForTimeout(400);
}

// --- the drift check, which needs no browser -------------------------------
if (CHECK) {
  let failed = 0;
  const ok = (m) => console.log(`  ok    ${m}`);
  const bad = (m) => { console.log(`  FAIL  ${m}`); failed += 1; };
  console.log('\nThe walkthrough pictures are of THIS app\n');

  if (!existsSync(MANIFEST)) {
    bad('public/tour/manifest.json is missing — run `npm run tour:shots`');
    process.exit(1);
  }
  const man = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const now = uiHash();
  (man.ui === now ? ok : bad)(
    man.ui === now
      ? `generated against the current markup, stylesheet and step text (${now})`
      : `generated against ${man.ui}, but the UI is now ${now} — the pictures are of a`
        + ' previous version of this app. Run `npm run tour:shots`.'
        + ` Watched: ${SOURCES.join(', ')}`);

  // EVERY DECLARED SHOT IS ON DISK, BOTH THEMES. A manifest that agrees with
  // itself while the files are missing is the gate passing about nothing.
  for (const s of SHOTS) {
    for (const theme of ['light', 'dark']) {
      const rel = `public/tour/step-${s.step}-${theme}.png`;
      (existsSync(join(root, rel)) ? ok : bad)(`${rel} is there`);
    }
  }
  // AND NOTHING ELSE IS. An orphan left by a renamed step ships bytes nobody
  // reads and gets precached for offline along with the rest.
  const want = new Set(SHOTS.flatMap((s) => ['light', 'dark'].map((t) => `step-${s.step}-${t}.png`)));
  const orphans = readdirSync(OUT).filter((f) => f.endsWith('.png') && !want.has(f));
  (orphans.length === 0 ? ok : bad)(
    `no orphaned pictures${orphans.length ? ` — ${orphans.join(', ')}` : ''}`);

  console.log(failed ? '\nThe pictures do not match the app.\n' : '\nThey match.\n');
  process.exit(failed ? 1 : 0);
}

// --- generating -------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) rmSync(join(OUT, f));

const launchOpts = { args: ['--no-sandbox'] };
const CHROME = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
if (existsSync(CHROME)) launchOpts.executablePath = CHROME;

const served = await serve(join(root, 'public'));
const browser = await chromium.launch(launchOpts);
console.log('\nPicturing the walkthrough\n');

let bytes = 0;
for (const theme of ['light', 'dark']) {
  for (const shot of SHOTS) {
    // A FRESH CONTEXT PER SHOT. These states are not reachable from each other
    // in one direction — "Just one thing" does not un-press, and the sorting
    // queue empties as it is used — and a walk that limps between them would
    // photograph whatever it happened to be left holding.
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      colorScheme: theme,
      hasTouch: true,
      isMobile: true,
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    await page.goto(served.url || served, { waitUntil: 'load' });
    await page.waitForSelector('body[data-ready=true]');
    await page.evaluate(() => {
      for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
    });
    await page.waitForTimeout(400);

    const sel = await shot.reach(page);
    const el = page.locator(sel).first();
    await el.waitFor({ state: 'visible', timeout: 15000 });
    // GROW THE VIEWPORT TO THE REGION FIRST. An element taller than the window
    // does not photograph as itself: the offer card came out cut through the
    // middle of an item with a screen of dead space under it, which is a broken
    // illustration that still writes a plausible-looking file. Same trap as
    // `fullPage` on a document that does not scroll.
    // The region's own height PLUS room for wherever it sits inside its
    // container. Scrolling it to the top of the window does not put it at y=0
    // when it lives inside a dialog with its own chrome, and the first version
    // subtracted that offset from the available height — so the sorting card
    // came out cut through its fourth row of choices.
    const need = await el.evaluate((n) => {
      const r = n.getBoundingClientRect();
      return Math.ceil(Math.max(r.height, n.scrollHeight)) + 260;
    });
    if (need > 844) {
      await page.setViewportSize({ width: 390, height: Math.min(need, 2600) });
      await page.waitForTimeout(400);
    }
    // NOTHING FOCUSED IN A PICTURE. A focus ring frozen into an illustration
    // says "this control is selected" to every reader forever, and the ring in
    // the shot would be one the reader's own finger never produces.
    await page.evaluate(() => document.activeElement?.blur?.());
    await page.waitForTimeout(200);

    const file = join(OUT, `step-${shot.step}-${theme}.png`);
    // A DELIBERATE FRAME, not whatever the element happens to be. `maxHeight`
    // stops a long region turning into a tall thin strip nobody can read at the
    // width it is shown — the tutorial wants the part being described, and the
    // rest of the card is not the lesson.
    let framed = false;
    // A NAMED TOP AND BOTTOM beats a height in pixels, which is a guess that
    // lands wherever it lands — the first pass cut the offer card through the
    // middle of "About 18h 22m left today.", which is the shape hub LESSONS §62
    // is about and looks like carelessness in something meant to teach.
    if (shot.frame) {
      await page.locator(shot.frame.from).first()
        .evaluate((n) => n.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(350);
      const top = await page.locator(shot.frame.from).first().boundingBox();
      // THE LOWEST BOTTOM ACROSS ALL MATCHES, not one element's box. These
      // choices are a wrapping grid, so the last button in DOM order is not the
      // one furthest down the screen — framing to it cut the final row in half,
      // twice, while every check above reported the clip as honoured.
      const bot = await page.evaluate((sel) => {
        const boxes = [...document.querySelectorAll(sel)]
          .map((n) => n.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0);
        if (!boxes.length) return null;
        const y = Math.max(...boxes.map((r) => r.bottom));
        return { y, height: 0 };
      }, shot.frame.to);
      if (!bot) throw new Error(`step ${shot.step} ${theme}: frame target ${shot.frame.to} matched nothing visible`);
      const pad = shot.frame.pad ?? 12;

      // GROW THE WINDOW TO THE FRAME, THEN CLIP — in that order. Clipping first
      // and taking "whatever is left below y" truncates in silence, and it did:
      // the sorting card shipped cut through its final row of choices while
      // every guard reported the clip honoured. The guard was real; it had been
      // edited into the OTHER branch of this function and never ran here.
      const want = Math.ceil(top.y + (bot.y - top.y) + pad * 2 + 8);
      if (want > page.viewportSize().height) {
        await page.setViewportSize({ width: 390, height: Math.min(want + 120, 3000) });
        await page.waitForTimeout(350);
        await page.locator(shot.frame.from).first()
          .evaluate((n) => n.scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.waitForTimeout(300);
      }

      const view = page.viewportSize();
      const top2 = await page.locator(shot.frame.from).first().boundingBox();
      const bot2 = await page.evaluate((sel) => {
        const boxes = [...document.querySelectorAll(sel)]
          .map((n) => n.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0);
        return boxes.length ? Math.max(...boxes.map((r) => r.bottom)) : null;
      }, shot.frame.to);
      const y = Math.max(0, top2.y - pad);
      const wanted = (bot2 + pad) - y;
      const height = Math.min(wanted, view.height - y - 1);

      // A COLLAPSED FRAME STILL WRITES A PLAUSIBLE FILE. Aiming at
      // `#storage-body` — a <dl> filled at runtime, empty in this state —
      // produced a strip of whitespace with a heading cut across the top, and
      // it landed in `public/` looking like a successful shot.
      //
      // HEIGHT, NOT BYTES. The first guard here compared file size and promptly
      // rejected the capture box at 5.5KB, which is small because it is a tight
      // crop of one row and is exactly the picture wanted. Size says nothing
      // about whether a frame collapsed; height does.
      if (height < 56) {
        throw new Error(`step ${shot.step} ${theme}: the frame ${shot.frame.from} → ${shot.frame.to}`
          + ` came out ${Math.round(height)}px tall. That is a collapsed frame, not an`
          + ' illustration — check both selectors exist AND are populated in this state.');
      }
      // AND IT NEVER SHIPS A CUT ONE. An illustration sliced through a word is
      // the defect this whole release is about, printed into a picture.
      if (height + 2 < wanted) {
        throw new Error(`step ${shot.step} ${theme}: the frame needs ${Math.round(wanted)}px`
          + ` and only ${Math.round(height)}px of window is available below y=${Math.round(y)}.`
          + ' It would be cut through whatever sits at that boundary.');
      }
      await page.screenshot({
        path: file,
        clip: { x: Math.max(0, top2.x - pad), y, width: Math.min(view.width - Math.max(0, top2.x - pad), 390), height },
      });
      framed = true;
    }
    if (!framed && shot.maxHeight) {
      // Clip coordinates are VIEWPORT-relative, and the first version measured a
      // box that had been scrolled — Playwright answered "clipped area is either
      // empty or outside the resulting image", which is the honest error and not
      // a silent bad picture. Put the region at the top of the window, measure it
      // there, and take what fits.
      await el.evaluate((n) => n.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(350);
      const box = await el.boundingBox();
      const view = page.viewportSize();
      const height = Math.min(shot.maxHeight, box.height, view.height - Math.max(0, box.y) - 1);
      if (box && height > 80) {
        await page.screenshot({
          path: file,
          clip: {
            x: Math.max(0, box.x),
            y: Math.max(0, box.y),
            width: Math.min(box.width, view.width - Math.max(0, box.x)),
            height,
          },
        });
        framed = true;
      }
    }
    if (!framed) await el.screenshot({ path: file });
    const size = readFileSync(file).length;
    bytes += size;
    console.log(`  step ${shot.step} ${theme.padEnd(5)} ${shot.name.padEnd(10)} ${(size / 1024).toFixed(1)}KB  ${sel}`);
    await ctx.close();
  }
}

writeFileSync(MANIFEST, `${JSON.stringify({
  ui: uiHash(),
  sources: SOURCES,
  shots: SHOTS.map((s) => ({ step: s.step, name: s.name })),
}, null, 2)}\n`);

console.log(`\n  ${(bytes / 1024).toFixed(0)}KB total across ${SHOTS.length * 2} pictures`);
console.log('  manifest written — `npm run tour:check` now holds them to this UI\n');

await browser.close();
if (served.close) await served.close();
process.exit(0);
