#!/usr/bin/env node
// THE APP ON THE STORE A PERSON ACTUALLY ARRIVES WITH.
//
// Every gate in this repo has only ever met `src/sample.ts` — thirteen tidy
// items. That is how an app which cannot be entered from an import stayed green
// on forty gates for months. This drives a realistic export from another planner
// through the ordinary import and then measures and photographs the result.
//
// It ASSERTS NOTHING, deliberately, exactly like `tools/look.mjs`: every defect
// that reached the device across seven releases was visible in a picture and
// came from none of the numbers. This is the second thing in this repo that
// looks rather than checks.
//
// ## What it found on the first run, 2026-08-21
//
// 840 actions imported, and the offer said **"Nothing is asking today."** Every
// part of that is working as designed — the importer correctly refuses to turn
// 518 already-passed dates into 518 fresh demands, so nothing carries a clock,
// so nothing is asking. Correct, and unusable: an app whose promise is *one
// thing, chosen for you* held 882 things and offered none of them.
//
// The reason line read *"they are waiting on you to decide"*, which is a demand
// to sort 882 things delivered at the moment of arrival — collision 8 and
// collision 1 together, on the first screen. The runway was 1.3 screens and 19
// controls, so the screen was not busy; it was empty in the one place that
// matters.
//
// ## The fixture is synthetic on purpose
//
// Nothing about a real person's work belongs in this repo. What this copies is
// the SHAPE the record already establishes: several hundred actions under a few
// dozen projects, most carrying due dates that have already gone, the oldest
// years back, and no contexts, roles, areas or goals anywhere — because another
// planner's export does not carry this app's vocabulary.
//
//   npm run import:look        (writes to /tmp/quietkeep-import)
//
import { chromium } from 'playwright-core';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const OUT = '/tmp/quietkeep-import';
mkdirSync(OUT, { recursive: true });

// ——— THE EXPORT ———
const AREAS = [
  ['Household', ['Fix the kitchen tap', 'Bleed the radiators', 'Replace the smoke alarm battery',
    'Descale the kettle', 'Clear the gutters', 'Service the boiler', 'Re-grout the bathroom']],
  ['Car', ['Book the MOT', 'Change the oil', 'Replace the wiper blades', 'Check tyre pressures',
    'Renew the insurance', 'Find the service history']],
  ['Admin', ['Renew the passport', 'File the tax return', 'Cancel the old subscription',
    'Update the address with the bank', 'Chase the refund', 'Scan the receipts']],
  ['Work', ['Draft the quarterly summary', 'Review the intake form', 'Reply to the vendor',
    'Update the runbook', 'Book the room for Tuesday', 'Collate the figures']],
  ['Garden', ['Prune the apple tree', 'Order compost', 'Fix the fence panel', 'Sharpen the shears']],
  ['Reading', ['Finish the biography', 'Return the library books', 'Find the second volume']],
  ['Family', ['Ring about the weekend', 'Post the birthday card', 'Sort the photographs']],
];
const SUFFIX = ['', ' again', ' properly', ' before winter', ' this time', ' for the flat',
  ' at the other house', ' — second attempt', ' with the new part', ' once the parts arrive'];

const pad = (n) => String(n).padStart(2, '0');
const dateNDaysAgo = (n) => {
  const d = new Date(Date.UTC(2026, 7, 21) - n * 864e5);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

let actions = 0, dated = 0, oldest = 0;
const lines = [];
let seed = 7;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

for (let round = 0; round < 6; round += 1) {
  for (const [area, items] of AREAS) {
    lines.push(`${area}${round ? ` ${round + 1}` : ''}:`);
    for (const item of items) {
      for (let k = 0; k < 4; k += 1) {
        const title = item + SUFFIX[Math.floor(rnd() * SUFFIX.length)];
        // Most carry a date, and every one of them has already gone — the shape
        // the record establishes for a real export.
        if (rnd() < 0.62) {
          const ago = 30 + Math.floor(rnd() * 2400);
          oldest = Math.max(oldest, ago);
          dated += 1;
          lines.push(`\t- ${title} @due(${dateNDaysAgo(ago)})`);
        } else {
          lines.push(`\t- ${title}`);
        }
        actions += 1;
      }
    }
  }
}
const file = join(OUT, 'export.taskpaper');
writeFileSync(file, lines.join('\n') + '\n');
console.log(`\nfixture: ${actions} actions under ${lines.filter((l) => l.endsWith(':')).length} projects`);
console.log(`         ${dated} carry a due date, every one already passed, oldest ${Math.round(oldest / 365)} years back`);
console.log(`         zero contexts, zero roles, zero areas, zero goals, zero people\n`);

// ——— DRIVE IT ———
const launch = { args: ['--no-sandbox'] };
if (existsSync('/opt/pw-browsers/chromium')) launch.executablePath = '/opt/pw-browsers/chromium';
const served = await serve(join(dirname(fileURLToPath(import.meta.url)), '..', 'public'));
const browser = await chromium.launch(launch);
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
});
const page = await ctx.newPage();
await page.goto(served.url || served, { waitUntil: 'load' });
await page.waitForSelector('body[data-ready=true]');

await page.evaluate(() => document.querySelector('#more')?.showModal());
await page.waitForSelector('#more[open]');
await page.tap('.more-go[data-go="group-data"]');
await page.waitForSelector('#sheet-group-data[open]');
await page.setInputFiles('#other-file', file);
await page.waitForTimeout(800);
const note = await page.textContent('#other-note').catch(() => '');
console.log(`the app's own reading of the file: ${(note || '(nothing said)').trim().slice(0, 220)}\n`);
await page.tap('#other-go');
await page.waitForTimeout(6000);
await page.evaluate(() => { for (const d of document.querySelectorAll('dialog')) if (d.open) d.close(); });
await page.waitForTimeout(2000);

const settle = async () => {
  await page.evaluate(() => {
    for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
    const r = document.querySelector('#runway'); if (r) r.scrollTop = 0;
  });
  await page.waitForTimeout(700);
};

// ——— WHAT IS ON THE SCREEN ———
await settle();
const survey = await page.evaluate(() => {
  const vis = (el) => el.checkVisibility() && el.getBoundingClientRect().height > 0;
  const t = (s) => document.querySelector(s)?.textContent?.trim().replace(/\s+/g, ' ') ?? null;
  const sections = [...document.querySelectorAll('main section[id]')]
    .filter(vis).map((s) => s.id);
  const controls = [...document.querySelectorAll('button, input, select, summary, a[href]')]
    .filter((e) => vis(e) && !e.closest('dialog')).length;
  const runway = document.querySelector('#runway');
  return {
    sections,
    controls,
    offer: t('#nextup-title'),
    why: t('#nextup-why'),
    gauge: t('#gauge'),
    replan: t('#replan-count'),
    people: t('#people-count'),
    menu: t('#menu-open'),
    review: t('#review-count') ?? t('#review-heading'),
    screens: runway ? +(runway.scrollHeight / window.innerHeight).toFixed(1) : null,
  };
});
console.log('AFTER THE IMPORT, AT 390px\n');
console.log(`  visible sections   ${survey.sections.join(', ')}`);
console.log(`  controls on screen ${survey.controls}`);
console.log(`  runway             ${survey.screens} screens`);
console.log(`  the one thing      ${survey.offer ?? '(nothing offered)'}`);
console.log(`  and it says why    ${survey.why ?? '(no reason line)'}`);
console.log(`  the proof line     ${survey.gauge ?? '(none)'}`);
console.log(`  needs a new plan   ${survey.replan ?? '(hidden)'}`);
console.log(`  with other people  ${survey.people ?? '(hidden)'}`);
console.log(`  the Menu           ${survey.menu ?? '(hidden)'}`);
console.log(`  worth a look       ${survey.review ?? '(hidden)'}\n`);

const shot = async (name) => {
  await settle();
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  console.log(`  ${join(OUT, `${name}.png`)}`);
};
await shot('01-the-morning-after-an-import');

// The whole runway, not only the first screen.
const need = await page.evaluate(() => {
  const r = document.querySelector('#runway'); const f = document.querySelector('.frame');
  return r ? Math.ceil(r.scrollHeight + (f?.getBoundingClientRect().height ?? 0) + 24) : null;
});
if (need) {
  await page.setViewportSize({ width: 390, height: Math.min(need, 6000) });
  await page.waitForTimeout(800);
  await shot('02-the-whole-runway');
  await page.setViewportSize({ width: 390, height: 844 });
}

await browser.close();
await served.server?.close?.();
process.exit(0);
