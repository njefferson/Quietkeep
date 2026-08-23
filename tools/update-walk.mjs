// A REAL second worker, and what the reader does about it (Doctrine §7h).
//
//   node tools/update-walk.mjs
//
// WHY THIS EXISTS SEPARATELY FROM THE UNIT TESTS. `test/update.test.ts` asserts
// two things: that `public/sw.js` contains no `skipWaiting()` inside `install`,
// and that `updateIsReady` decides correctly given plain objects. Both are worth
// having and NEITHER proves the behaviour. Reading source is not running it, and
// a hand-made registration object is a thing this repo wrote — it will agree
// with whatever this repo believes.
//
// §7h says so in its own words: *"Test it with a REAL second worker, not a
// mocked registration. Serve a genuinely different `sw.js` and let the browser's
// own update machinery run; a mock proves the mock works."* ADR-0072 shipped
// 1.18.1 to production with this explicitly recorded as NOT done. This is it.
//
// WHAT IT DRIVES. The browser starts an update only when the bytes at `/sw.js`
// change, so the server serves a genuinely different worker on the second fetch
// — a real file, with a real different cache name, installed by Chromium's own
// machinery on its own schedule. Nothing here simulates a registration.
//
// THE FOUR CLAIMS, which are the whole of §7h.1 and .2:
//   1. the new worker reaches `waiting` and STOPS there
//   2. it does NOT become the controller on its own — no `controllerchange`
//   3. the reader is told, in words they can see
//   4. and the reader's press is what promotes it, all the way to a page
//      running the new build
//
// Claim 2 is the one the old code failed, silently, from the first release.
//
// EXITS NON-ZERO on any failure.

import { chromium } from 'playwright-core';
import { existsSync, readFileSync } from 'node:fs';
import { serve } from './serve.mjs';
import { CURRENT } from '../src/ui/changelog.ts';
import { requireFreshBundle } from './bundle-fresh.mjs';

const ROOT = new URL('../public', import.meta.url).pathname;
requireFreshBundle(new URL('..', import.meta.url).pathname, 'the update walk');

const launchOpts = { args: ['--no-sandbox'] };
const SANDBOX_CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
if (existsSync(SANDBOX_CHROMIUM)) launchOpts.executablePath = SANDBOX_CHROMIUM;

const failures = [];
const ok = (m) => console.log(`  ok    ${m}`);
const bad = (m) => { failures.push(m); console.error(`  FAIL  ${m}`); };
const is = (actual, expected, what) =>
  actual === expected ? ok(`${what}: ${actual}`)
    : bad(`${what}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);

// The second worker. A real file, differing from the shipped one only in its
// cache name — which is the one thing that must change between releases
// (LESSONS §21), and is what makes "which build is this device holding"
// answerable at all.
const NEXT = 'quietkeep-99.0.0';
const realSw = readFileSync(`${ROOT}/sw.js`, 'utf8');
const nextSw = realSw.replace(/quietkeep-[\d.]+/g, NEXT);
if (nextSw === realSw) {
  console.error('could not build a different worker — the cache name did not match.');
  process.exit(1);
}

const { server, url, overrides, redirects, seen } = await serve(ROOT);
const browser = await chromium.launch(launchOpts);

console.log('=== a real second worker · Doctrine §7h ===\n');

try {
  const ctx = await browser.newContext({ timezoneId: 'America/Denver', locale: 'en-US' });
  const page = await ctx.newPage();

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready=true]');
  await page.click('#tour-skip').catch(() => {});

  // The first load races the very first registration, so wait for this page to
  // actually be under a worker before calling anything about it an update.
  // `clients.claim()` in activate is what makes this arrive without a reload.
  await page.waitForFunction(() => navigator.serviceWorker.controller != null, null, { timeout: 15000 });
  is(await page.evaluate(() => navigator.serviceWorker.controller != null), true,
    'a worker controls the page before anything is asked of it');
  is(await page.evaluate(async () => (await caches.keys()).find(k => k.startsWith('quietkeep')) ?? null),
    `quietkeep-${CURRENT.triplet}`,
    'and the cache it built carries the running release');

  // Watch for a takeover we did not ask for. This flag IS claim 2, and it is
  // the assertion the shipped-for-eighteen-releases behaviour would fail.
  await page.evaluate(() => {
    globalThis.__swTookOver = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { globalThis.__swTookOver = true; });
  });

  // --- serve a genuinely different worker ------------------------------------
  overrides.set('/sw.js', nextSw);
  overrides.set('/./sw.js', nextSw);

  // The browser's own machinery from here. `update()` asks it to re-fetch; what
  // it does with the new bytes is Chromium's decision, not ours.
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });

  // Polled from Node rather than with `waitForFunction`, whose predicate here
  // returned a Promise — always truthy on the first poll, so the wait resolved
  // instantly and the assertion fired before the worker had finished
  // installing. It read as a product failure and was a harness one; the swallowed
  // `.catch` hid the difference. (LESSONS §24 — a failing test can mean the
  // expectation, or the instrument, was wrong.)
  const waitingNow = async () =>
    page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting != null);
  for (let i = 0; i < 60 && !(await waitingNow()); i++) await page.waitForTimeout(500);

  is(await waitingNow(), true, '1. the new worker installed and is WAITING');

  // Give it room to misbehave before believing it did not. A takeover that
  // happens 200ms after the assertion is still a takeover.
  await page.waitForTimeout(1500);
  is(await page.evaluate(() => globalThis.__swTookOver), false,
    '2. and it did NOT take over on its own — no controllerchange');
  is(await page.evaluate(() => navigator.serviceWorker.controller != null), true,
    '   the page is still under the OLD worker, which is the point');

  // --- the reader is told ----------------------------------------------------
  await page.waitForSelector('#update:not([hidden])', { timeout: 10000 }).catch(() => {});
  is(await page.evaluate(() => document.querySelector('#update')?.checkVisibility() === true), true,
    '3. the reader is told, on a surface they can see');
  const words = await page.evaluate(() => document.querySelector('#update-words')?.textContent ?? '');
  is(/newer version is ready/i.test(words), true, '   in words that say a version is ready');
  is(/waits until you say so|keeps working/i.test(words), true,
    '   and that say nothing moves until they choose');

  // Every interrupting surface carries its way out (§4), and this one is not
  // conditional on accepting anything.
  is(await page.evaluate(() => document.querySelector('#update-dismiss')?.checkVisibility() === true), true,
    '   with a way out that does not require accepting it');

  // --- and the reader's press is what promotes it ---------------------------
  const cachesBefore = await page.evaluate(async () => (await caches.keys()).filter(k => k.startsWith('quietkeep')));
  is(cachesBefore.includes(NEXT), true,
    '   the new build is downloaded and held, waiting rather than serving');

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {}),
    page.click('#update-reload'),
  ]);
  await page.waitForSelector('body[data-ready=true]', { timeout: 15000 });
  await page.waitForFunction(() => navigator.serviceWorker.controller != null, null, { timeout: 15000 });

  const after = await page.evaluate(async () => ({
    caches: (await caches.keys()).filter(k => k.startsWith('quietkeep')),
    waiting: (await navigator.serviceWorker.getRegistration())?.waiting != null,
  }));
  is(after.caches.includes(NEXT), true, '4. after the press, the device is running the new build');
  is(after.caches.length, 1, '   and the old cache was swept, so nothing is left half-updated');
  is(after.waiting, false, '   with nothing left waiting');

  // A newcomer is never told (§7h.3) — asserted on a genuinely fresh profile,
  // because "no controller yet" is a state only a first-ever visit has.
  const fresh = await browser.newContext({ timezoneId: 'America/Denver', locale: 'en-US' });
  const p2 = await fresh.newPage();
  await p2.goto(url, { waitUntil: 'load' });
  await p2.waitForSelector('body[data-ready=true]');
  await p2.waitForTimeout(1200);
  is(await p2.evaluate(() => document.querySelector('#update')?.checkVisibility() === true), false,
    '5. a first-ever visitor is never told an update is ready (§7h.3)');
  await fresh.close();

  // --- what a capture puts on the wire (1.37.0) ------------------------------
  //
  // `/capture?text=…` is the documented public entrance, so whatever somebody
  // captures arrives as a query string. Until 1.37.0 the worker fetched the
  // request as given, which put that text in the request line to the host on
  // every online navigation — the no-telemetry promise breaking on the app's
  // widest way in.
  //
  // Asserted from the SERVER's side on purpose. Reading `sw.js` for the absence
  // of `fetch(req)` would only prove the source says the right thing; this is
  // the only vantage point that can say what actually left the browser. It runs
  // here because this is the tool that already has a REAL worker controlling a
  // REAL page — the same reason §7h is walked rather than mocked.
  const CANARY = 'zzcanary-brief-with-the-board-about-the-thing';
  const before = seen.length;
  await page.goto(`${url}capture?text=${encodeURIComponent(CANARY)}`, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready=true]');
  const leaked = seen.slice(before).filter((r) => r.includes('zzcanary'));
  is(leaked.length, 0, '6. what you capture from a link never reaches the host');
  if (leaked.length) for (const r of leaked) console.log(`      leaked: ${r}`);

  // And the strip is invisible to the app, which is the half that makes it a fix
  // rather than a removal: `respondWith` cannot change the document's URL, so the
  // page still reads the text out of `location` and captures it. Without this
  // assertion the cheapest way to pass the one above would be to BREAK the
  // entrance — losing the capture, which is the exact shape this repo already
  // paid for once when a failed URL capture destroyed the only copy of it.
  //
  // Asserted on the app's own confirmation rather than on `location.search`:
  // `handleUrlEntrances` scrubs the query the moment it has the text, so a
  // refresh cannot fire the same capture twice. The address bar is empty by
  // design a few milliseconds in.
  is((await page.locator('#status').textContent())?.includes('Held from a link'), true,
    '   and the app still captured it, so the entrance still works');

  // --- 7 · and it survives an edge that REDIRECTS (1.40.2) -------------------
  //
  // Reported from an iPad, on the Shortcut path, in the browser's own words:
  //
  //   Safari can't open the page.
  //   The error was: "Response served by service worker has redirections".
  //
  // A redirected response is a network error when it answers a navigation — the
  // document's URL and the response's URL would disagree. Every engine enforces
  // it; Chromium reports the same thing as ERR_FAILED.
  //
  // The query strip is what exposed it. A real navigation request carries
  // `redirect: "manual"`, so a 3xx comes back as an opaqueredirect the browser
  // follows itself; the constructed request that replaces it defaults to
  // `redirect: "follow"`, so fetch chases the 3xx and returns a response
  // flagged `redirected`. Only on a navigation carrying a query — the capture
  // entrance and nothing else.
  //
  // WHY ELEVEN GREEN GATES MISSED A BREAKAGE EVERY ENGINE AGREES ON: this
  // server answered every path 200 or 404. It had no way to redirect, so the
  // one edge behaviour that triggers this was the one behaviour no local run
  // had. It was never an engine difference — it was a hole in the rig, which is
  // the more embarrassing answer and the more useful one.
  //
  // Two false trails on the way, both worth the lines because both looked
  // exactly like "the fix does not work":
  //   - Redirecting to `/index.html` proved nothing. The browser's own HTTP
  //     cache answered the redirect with no request, so the canary could never
  //     appear and the check failed with the fix correctly in place. It points
  //     at a path nothing has ever fetched.
  //   - `upgrade-insecure-requests` in the shipped CSP rewrote the redirect to
  //     `https://127.0.0.1:<port>` and killed it with ERR_SSL_PROTOCOL_ERROR.
  //     `serve.mjs` now drops that one directive over http, where it is inert in
  //     production and destructive locally; the comment there says why.
  //
  // PLANTED RED FIRST, both halves: with `unredirect` removed from sw.js the
  // navigation itself fails with ERR_FAILED, and the shell never reaches the
  // cache because `cache.put` refuses a redirected response.
  const REDIRECT_CANARY = 'zzredirect-the-thing-i-said-in-the-meeting';
  const SHELL_CANARY = '<!--zzshell-canary-->';
  const realShell = readFileSync(`${ROOT}/index.html`, 'utf8');
  // Redirected to a path NEVER FETCHED BEFORE, on purpose. Pointing it at
  // `/index.html` proved nothing: the browser's own HTTP cache answered the
  // redirect without a request, so the canary could never appear and the check
  // failed identically whether the fix was present or not.
  overrides.set('/shell-probe.html', realShell.replace('</body>', `${SHELL_CANARY}</body>`));
  // BOTH PATHS REDIRECT, and that is deliberate (1.40.5). The worker no longer
  // asks for `/capture` at all — it asks for the shell — so a plant on `/capture`
  // alone would now pass by never being reached, which is the fix working and
  // the repair going unmeasured. Redirecting the shell too keeps `unredirect`
  // under test: it is the layer that catches an edge which redirects something
  // the worker DOES ask for.
  redirects.set('/capture', '/shell-probe.html');
  redirects.set('/index.html', '/shell-probe.html');

  // Caught rather than thrown, so the defect reports itself as a named failure
  // instead of a stack trace. An uncaught goto here says "Error" and leaves the
  // next reader to work out which of eleven checks was running.
  let navError = null;
  await page.goto(`${url}capture?text=${encodeURIComponent(REDIRECT_CANARY)}`, { waitUntil: 'load' })
    .catch((e) => { navError = String(e.message).split('\n')[0]; });
  is(navError, null, '7. a redirecting edge does not break the capture entrance');
  await page.waitForSelector('body[data-ready=true]', { timeout: 15000 }).catch(() => {});
  is((await page.locator('#status').textContent())?.includes('Held from a link'), true,
    '   and the capture still lands');
  // The strip still holds on this path — a redirect must not become a way for
  // the text to reach the host by the back door.
  is(seen.filter((r) => r.includes('zzredirect')).length, 0,
    '   with the text still off the wire, redirect or no redirect');
  // And the shell WAS written. This is the assertion that fails on the defect.
  // Whichever quietkeep cache is live, NOT the running release's name: by this
  // point the walk has promoted the second worker, so the cache in play is the
  // one NEXT built. Naming the release here read an empty cache and failed for
  // the wrong reason — the assertion agreeing with the defect by accident.
  const cachedShell = await page.evaluate(async () => {
    for (const name of await caches.keys()) {
      if (!name.startsWith('quietkeep')) continue;
      const hit = await (await caches.open(name)).match('./index.html');
      if (hit) return await hit.text();
    }
    return null;
  });
  is(typeof cachedShell === 'string' && cachedShell.includes(SHELL_CANARY), true,
    '   and the shell reached the cache — a redirected response is refused by cache.put');

  redirects.delete('/capture');
  redirects.delete('/index.html');
  overrides.delete('/shell-probe.html');
} finally {
  await browser.close();
  server.close();
}

console.log('');
if (failures.length) {
  console.error(`${failures.length} failure(s). Doctrine §7h: the reader decides when the app changes.`);
  process.exit(1);
}
console.log('A real second worker waits, says so, and lands only when the reader says.');
