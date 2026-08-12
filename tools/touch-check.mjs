#!/usr/bin/env node
// A ROUTE A FINGER CANNOT TAKE IS NOT A ROUTE. — 2026-08-12
//
// This app's reference platform is an iPad, used by touch. Its accessibility
// apparatus is unusually strong: contrast computed per state, focus rings
// focused-and-measured, target sizes, axe in both themes at a stressed
// viewport. Every one of those is a CONFORMANCE measure, and conformance is
// defined for input methods in general.
//
// Nobody measured the one input method the app is actually used with.
//
// `public/index.html` has carried `<a class="skip" href="#cards">Skip to what
// you are holding</a>` since the first commit — the textbook WCAG 2.4.1
// bypass-blocks pattern, positioned off-canvas until focused. In the SAME
// commit, `#capture` got `autofocus`, which puts the document's focus AFTER the
// skip link: it was never reachable by tabbing forward, from the first line
// that existed. By finger it was never reachable at all.
//
// It shipped that way for 142 releases with every gate green, because every
// gate was asking whether the app conformed rather than whether a route could
// be taken by the hand that would take it. Meanwhile the held list sat 3.0
// screens down at 820x1180 and 4.9 at 390x844 on a full store — measured — and
// the way past it existed and could not be pressed.
//
// ## The rule
//
// An interactive element that CSS parks off-canvas (revealed only on focus) is
// a keyboard route. It is allowed — it is the right pattern for keyboards — but
// it must NAME the finger's route to the same place, with
// `data-touch-partner="#id"`. The partner must exist, be on-canvas, and meet the
// target floor.
//
// The declaration is the point. It is one attribute, and it converts "we built
// the standard pattern" into "we said how a finger does this", which is the
// question that was never asked.
//
//   node tools/touch-check.mjs        (exits non-zero on any unpartnered route)

import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { serve } from './serve.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const launchOpts = { args: ['--no-sandbox'] };
const CHROME = process.env.CHROMIUM_PATH || process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium';
if (existsSync(CHROME)) launchOpts.executablePath = CHROME;

/** The reference platform, and the phone that is the harder case. */
const VIEWPORTS = [['iPad portrait', 820, 1180], ['phone', 390, 844]];
/** WCAG 2.5.8 / this repo's own floor. */
const TARGET = 44;

let failed = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failed++; };

const { server, url } = await serve(ROOT);
const browser = await chromium.launch(launchOpts);

console.log('\nEvery route has a way a finger can take it\n');

try {
  for (const [label, width, height] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForSelector('body[data-ready=true]');
    await page.evaluate(() => {
      for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
    });

    const findings = await page.evaluate((floor) => {
      const INTERACTIVE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const out = [];
      for (const el of document.querySelectorAll(INTERACTIVE)) {
        const r = el.getBoundingClientRect();
        // Parked off-canvas by CSS — the focus-reveal idiom. A merely
        // scrolled-past element has a sane x; this is about elements whose own
        // styling puts them where no finger goes.
        const parked = r.right < 0 || r.left > document.documentElement.clientWidth * 4;
        if (!parked) continue;
        // `.visually-hidden` text is not a route; it is a label. Only things
        // that GO somewhere count.
        const goesSomewhere = el.matches('a[href^="#"]') || el.tagName === 'BUTTON';
        if (!goesSomewhere) continue;

        const id = el.id || el.className || el.tagName.toLowerCase();
        const partnerSel = el.dataset.touchPartner ?? null;
        if (!partnerSel) { out.push({ id, problem: 'no data-touch-partner' }); continue; }
        const p = document.querySelector(partnerSel);
        if (!p) { out.push({ id, problem: `partner ${partnerSel} does not exist` }); continue; }
        const pr = p.getBoundingClientRect();
        if (pr.right < 0 || pr.left > document.documentElement.clientWidth * 4) {
          out.push({ id, problem: `partner ${partnerSel} is parked off-canvas too` }); continue;
        }
        // A partner that is `hidden` right now is fine — many are conditional —
        // but it must be a real control with a real target when it renders.
        if (!p.hidden && (pr.height < floor || pr.width < floor)) {
          out.push({ id, problem: `partner ${partnerSel} is ${Math.round(pr.width)}x${Math.round(pr.height)}, under the ${floor}px floor` });
          continue;
        }
        // Where an anchor names a target, the partner should go to the same
        // place. Checked only when it is checkable — a button's destination is
        // in its handler and this gate does not read JavaScript.
        const href = el.getAttribute('href');
        const pHref = p.getAttribute?.('href');
        if (href && pHref && href !== pHref) {
          out.push({ id, problem: `partner goes to ${pHref}, this goes to ${href}` });
        }
      }
      return out;
    }, TARGET);

    if (findings.length === 0) {
      ok(`${label}: every off-canvas route names a partner a finger can reach`);
    } else {
      for (const f of findings) fail(`${label}: "${f.id}" — ${f.problem}`);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close?.();
}

if (failed > 0) {
  console.error(`\n${failed} route(s) a finger cannot take.\n`);
  console.error('A focus-revealed control is a KEYBOARD route. It is the right');
  console.error('pattern and it is not sufficient here: this app is used on a');
  console.error('tablet, by touch. Name the finger\'s route to the same place with');
  console.error('data-touch-partner="#id", or make this control reachable itself.\n');
  process.exit(1);
}
console.log('\nEvery off-canvas route names a way a finger can take it.\n');
