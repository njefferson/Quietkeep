// Quietkeep service worker.
//
// The cache name carries the version.capability.iteration triplet and is bumped
// with it (Doctrine §7, CLAUDE.md). Changing the triplet is what retires the old
// cache — that is the whole mechanism, so it is not optional.
const CACHE = 'quietkeep-3.15.0';

// The shell only. User data is NEVER cached here — it lives in IndexedDB, which
// this file does not touch and must not.
const SHELL = [
  './',
  './index.html',
  // The palette values, generated from docs/palettes.json (3.4.0). It is a
  // SEPARATE stylesheet and therefore a separate thing to precache: an
  // offline-first app that caches its rules and not its colours would come back
  // with no colours at all, which is a worse failure than not coming back.
  './palettes.css',
  './app.css',
  './app.js',
  './manifest.webmanifest',
  './why.html',
  './why.css',
  './manual.html',
  './manual.css',
  // The flowcharts (3.7.0). Precached for the same reason as the two above, and
  // the navigation branch below maps a page to its OWN cached body via SHELL —
  // so a page left out of this list does not merely miss offline, it falls back
  // to the app shell and silently lands the reader somewhere else (1.7.2).
  './paths.html',
  './paths.css',
  './brand/icon-192.png',
  './brand/icon-512.png',
  './brand/apple-touch-icon.png',
  './brand/favicon-32.png',
  // The walkthrough's illustrations (2.10.4). Precached because the first run
  // is the one screen these exist for, and a tutorial with five broken images
  // is worse than a tutorial with none. 277KB across ten files, 1x, generated.
  './tour/step-2-light.png',
  './tour/step-2-dark.png',
  './tour/step-3-light.png',
  './tour/step-3-dark.png',
  './tour/step-4-light.png',
  './tour/step-4-dark.png',
  './tour/step-5-light.png',
  './tour/step-5-dark.png',
  './tour/step-6-light.png',
  './tour/step-6-dark.png',
];

// WHAT THE READER CHOSE, READ BEFORE THE PAGE EXISTS (ADR-0111).
//
// A palette is stored in IndexedDB, which is asynchronous, so the app could not
// know which colours to wear until after it had already painted — one beat of
// the default on every cold start, in the right mode, so a hue settling rather
// than day turning into night. That was recorded as unfixable "without storing
// the choice somewhere this app deliberately does not store things", which is
// true of `localStorage` (banned outright, ADR-0002) and false in general.
//
// A SERVICE WORKER CAN READ INDEXEDDB, and this one already serves the shell on
// every launch. So it reads the choice and hands back HTML that already carries
// it, and the palette is right on the FIRST PAINTED PIXEL. Nothing new is
// stored, nothing is delayed, and the store stays the single source of truth —
// a hint in the URL or the manifest would go stale the moment somebody changed
// their mind after installing.
//
// Rejected: painting a cover over the app until the read lands. It would trade
// a hue settle for a blank screen — worse in light mode, where the veil is the
// bigger visual event — delay first paint for everybody on a cold start, and
// add a failure mode where a store that throws leaves the app blank until a
// timeout rescues it. This route is earlier than any veil can be: the attribute
// is in the markup before the parser reaches `<head>`.
//
// THE STORE IS READ, NEVER CREATED. `indexedDB.open` on a name that does not
// exist CREATES it — an empty v1 with no object stores — and Dexie opening
// afterwards at v2 would run only the v2 upgrade, so `events` and `snapshots`
// would never exist and a first-ever visitor would have a broken app. Hence the
// `databases()` guard, and the abort in `onupgradeneeded` behind it in case the
// two race. Every failure path here resolves to null, which serves the shell
// exactly as it was served before this existed.
// These three are DEFINED IN src/ AND COPIED HERE, because a service worker
// cannot import the app's modules. `npm run palettes:check` holds all three to
// their sources — the name is `quietkeep` and not `planner`, which is
// `DexieLogStore`'s own default and what this said first: every failure path
// below resolves to null, so a wrong name here is not a crash, it is the whole
// feature quietly doing nothing on every launch.
const DB_NAME = 'quietkeep';          // src/ui/session.ts, startSession's dbName
const KV_STORE = 'kv';                // src/dexie-store.ts, version(2)
const PALETTE_KEY = 'ui.palette';     // src/palette.ts, PALETTE_KEY
const THEME_KEY = 'ui.theme';         // src/theme.ts, THEME_KEY

// The non-default families, generated from docs/palettes.json — `npm run
// palettes:check` fails on drift. The DEFAULT is deliberately absent: the
// generated stylesheet declares it unattributed, so "no attribute" is what the
// default looks like, and an unknown value falls back to exactly that. This
// list is also what makes the injection safe — a value that is not one of these
// never reaches the markup.
const PALETTE_VALUES = ['instrument', 'paper', 'mono', 'soft'];

// AND THE MODE, WHICH FLASHES HARDER THAN THE HUE. Measured: on a device set to
// dark with `light` chosen, `data-theme` was absent when `<html>` was parsed and
// arrived afterwards — a beat of night before the day it was asked for, which is
// a bigger event than cream settling to paper. Same store, same read, same
// injection. `device` is absent rather than named, exactly as `applyTheme`
// leaves it, so the media query answers on its own.

const THEME_VALUES = ['light', 'dark'];

const NOTHING = { palette: null, theme: null };

const chosenLook = async () => {
  try {
    if (!indexedDB.databases) return NOTHING;
    const dbs = await indexedDB.databases();
    if (!dbs.some((d) => d.name === DB_NAME)) return NOTHING;
  } catch { return NOTHING; }
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; resolve(v); };
    // A navigation may never wait on a store. A quarter of a second is far past
    // a healthy read of two keys and far short of anything a reader would feel.
    const timer = setTimeout(() => finish(NOTHING), 250);
    const settle = (v) => { clearTimeout(timer); finish(v); };
    let open;
    try { open = indexedDB.open(DB_NAME); } catch { return settle(NOTHING); }
    open.onerror = () => settle(NOTHING);
    open.onblocked = () => settle(NOTHING);
    open.onupgradeneeded = (e) => {
      // The guard above should mean this never fires. If it does, the database
      // did not exist and this open is creating it — abort, so it does not.
      try { e.target.transaction.abort(); } catch { /* nothing to undo */ }
      settle(NOTHING);
    };
    open.onsuccess = () => {
      const db = open.result;
      try {
        if (!db.objectStoreNames.contains(KV_STORE)) { db.close(); return settle(NOTHING); }
        // ONE transaction for both keys: two opens would double the only cost
        // this feature has.
        const store = db.transaction(KV_STORE, 'readonly').objectStore(KV_STORE);
        const out = { palette: null, theme: null };
        let left = 2;
        const arrived = () => { if (--left === 0) { db.close(); settle(out); } };
        const read = (key, allowed, field) => {
          const get = store.get(key);
          get.onerror = arrived;
          get.onsuccess = () => {
            const v = get.result && get.result.value;
            if (allowed.includes(v)) out[field] = v;
            arrived();
          };
        };
        read(PALETTE_KEY, PALETTE_VALUES, 'palette');
        read(THEME_KEY, THEME_VALUES, 'theme');
      } catch { try { db.close(); } catch { /* already closed */ } settle(NOTHING); }
    };
  });
};

/** Put the choice on `<html>` in the bytes, before anything parses them. */
const dressShell = async (res, look) => {
  const attrs = [
    look.palette ? ` data-palette="${look.palette}"` : '',
    look.theme ? ` data-theme="${look.theme}"` : '',
  ].join('');
  if (!attrs || !res || !res.ok) return res;
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;
  let html;
  try { html = await res.clone().text(); } catch { return res; }
  const out = html.replace(/<html(?=[\s>])/i, `<html${attrs}`);
  if (out === html) return res;   // markup changed shape — serve it untouched
  return new Response(out, {
    status: res.status, statusText: res.statusText, headers: res.headers,
  });
};

// THE NEW WORKER WAITS. It does not take over on its own (Doctrine §7h.1).
//
// This file used to call skipWaiting() here, with the comment "take over
// promptly: a half-updated shell is worse than a brief wait". That reasoning is
// backwards and the cost of it was real. Taking over promptly does not replace
// the open page — the page keeps running the PREVIOUS release's HTML and
// modules, while activate below deletes the old cache, so every request that
// page makes afterwards is served the NEW file. Old markup, new modules, no
// reload, and nothing said to anybody. That IS the half-updated shell, and
// skipWaiting is what creates it rather than what avoids it.
//
// Waiting produces the opposite: the reader keeps a CONSISTENT old app until
// they choose to move. An old app that works is a smaller problem than a mixed
// one that does not.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {
      // A failed precache must not block install. The app still works online,
      // and capture — the one thing that must never break — needs no network.
    }),
  );
});

// ...and the READER'S DECISION is the only thing that releases it (§7h.1).
//
// Nothing else may call skipWaiting: not a timer, not install, not activate. The
// page posts this after it has told somebody a newer version is ready and they
// have pressed the control that says so. That is the entire contract, and it is
// why the message is checked by name rather than treated as a bare ping.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Per-key, contained: one failed delete must not abort the sweep or skip
    // clients.claim() — reads below are pinned to CACHE, so a straggler old
    // cache is dead weight, never the winner (the audit showed caches.match
    // with no cacheName preferring the OLDEST cache).
    for (const key of await caches.keys()) {
      if (key !== CACHE) { try { await caches.delete(key); } catch { /* retried next activate */ } }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for navigations so a deployed update is picked up — but the
  // network gets a BOUNDED head start, not a blank cheque. On a stalled-but-
  // present connection ("lie-fi"), an unbounded fetch hangs far past the
  // 2-second capture budget, and the gap between thought and safety is the
  // whole product. If the deadline passes, the cached shell serves immediately
  // and the fetch keeps running in the background to freshen the cache for
  // next time.
  if (req.mode === 'navigate') {
    const NAV_DEADLINE_MS = 2000;
    // Which shell page IS this navigation? './index.html' for the app itself,
    // './why.html' for the thesis. Two defects lived here (found on device,
    // 1.7.2): the freshen wrote EVERY navigation's body under './index.html' —
    // so one visit to the thesis would have replaced the cached app shell with
    // an essay — and the fallback served the app shell for every navigation,
    // so tapping "Planning for Humans" on a slow connection silently landed
    // on the main screen instead of the cached page it asked for.
    const pageKey = SHELL.includes(`.${url.pathname}`) ? `.${url.pathname}` : './index.html';

    // THE QUERY NEVER GOES TO THE NETWORK (1.37.0).
    //
    // `/capture?text=…` is the documented public entrance — three ADRs name it
    // and the ⓘ panel hands it out — so whatever somebody captures arrives here
    // as a query string. `fetch(req)` would put that in the request line to the
    // edge on EVERY online navigation, win or lose the race below. For "buy
    // milk" that is small; for the meeting notes this endpoint exists to carry
    // it is the no-telemetry promise breaking on the app's widest way in.
    //
    // The server has no use for it. `_redirects` rewrites `/capture` to the
    // shell as a static file, and the app reads the text from `location`, which
    // the browser set from the navigation itself — `respondWith` cannot change
    // the document's URL, so stripping the query here is invisible to the page
    // and takes the text off the wire. V-16 already established that a fragment
    // is never transmitted by any browser — which is why the sync key rides in
    // one; this gives the query the same property for anyone with the worker
    // installed.
    //
    // Not a substitute for the fragment entrance: the FIRST visit, before this
    // worker exists, still sends whatever it was given. That is why the private
    // entrance is a separate piece of work and this is not the end of it.
    // ASK FOR THE SHELL, NOT THE PATH (1.40.5).
    //
    // This fetched `url.pathname` with the query removed — so a navigation to
    // `/capture?text=…` went to the network as `/capture`. That is a path whose
    // only existence is a `_redirects` rule, and asking the edge for it invites
    // exactly the answer that cannot serve a navigation: a redirect.
    //
    // The page being served here is ALWAYS the shell. `pageKey` already worked
    // that out, and for anything that is not itself a shell page it is
    // `./index.html`. So ask for the shell by the name the cache knows it by,
    // resolved against this worker's scope. It is a real file, it is in SHELL,
    // it is precached, and it is the one URL on this origin least likely to be
    // answered with anything but 200.
    //
    // Three things this gets at once: the query still never reaches the wire
    // (1.37.0's whole point), the redirect that broke Safari is not requested in
    // the first place rather than repaired afterwards, and the body fetched is
    // the body that gets cached under `pageKey` — previously those could differ.
    //
    // WHY NOT JUST KEEP THE REPAIR BELOW. Because the repair only handles a
    // response that arrives flagged `redirected`, and this session could not
    // observe what the edge actually answers — outbound to the deployed host is
    // blocked from here. Not requesting a redirectable path removes the class;
    // the repair stays underneath it for anything that redirects anyway.
    const netReq = url.search
      ? new Request(new URL(pageKey, self.location.href).href,
        { headers: req.headers, credentials: 'same-origin' })
      : req;

    // A REDIRECTED RESPONSE CANNOT ANSWER A NAVIGATION (found on device, 1.40.2
    // — reported by Safari, which was right, and is not alone).
    //
    //   Safari can't open the page.
    //   The error was: "Response served by service worker has redirections".
    //
    // The Service Worker spec makes a redirected response a network error when
    // it answers a navigation, because the document's URL and the response's
    // URL would disagree and nothing can reconcile them. EVERY engine enforces
    // it — Chromium calls the same thing ERR_FAILED — so this was never a
    // Safari quirk. It went unseen because no local server ever issued a
    // redirect for the walk to follow.
    //
    // The strip above is what exposed it. A real navigation request carries
    // `redirect: "manual"`, so `fetch(req)` hands a 3xx back as an
    // opaqueredirect for the browser to follow itself — safe, and what every
    // other navigation here still does. `new Request(url)` does NOT inherit
    // that: it defaults to `redirect: "follow"`, so fetch chases the 3xx and
    // returns a response flagged `redirected`. Fatal, and ONLY on a navigation
    // carrying a query — which is the capture entrance and nothing else.
    //
    // Rebuilt rather than re-requested. The bytes are correct and already here;
    // what is wrong is a flag about how they were obtained, and a fresh
    // Response carries the body without the history. This also fixes a second,
    // silent failure: `cache.put` REJECTS a redirected response, so the freshen
    // was throwing and the shell was never being updated on this path either.
    const unredirect = (res) => res.redirected
      ? new Response(res.body, {
        status: res.status, statusText: res.statusText, headers: res.headers,
      })
      : res;

    event.respondWith((async () => {
      // STARTED HERE, BESIDE THE FETCH, so the read costs no wall clock — it
      // resolves long before the network does and well inside the cache path.
      // Only the app shell: `why.html` and `manual.html` link their own
      // stylesheets and never the palette's, so there is nothing to dress.
      // BOTH SPELLINGS OF THE SHELL. `pageKey` comes from the pathname, so the
      // root is './' and only a direct hit on /index.html is './index.html' —
      // testing for the second alone would have skipped the ordinary launch,
      // which is every launch.
      const isShell = pageKey === './' || pageKey === './index.html';
      const wearing = isShell ? chosenLook() : Promise.resolve(NOTHING);

      const freshen = fetch(netReq).then(async (raw) => {
        const fresh = unredirect(raw);
        // CACHED UNDRESSED, ON PURPOSE. The attribute is put on at SERVE time,
        // so the cached shell stays neutral and a reader who changes their mind
        // is not served last week's choice out of a cache nobody thought to
        // invalidate. Dressing before the put is the version of this that looks
        // identical and is wrong.
        if (fresh.ok) (await caches.open(CACHE)).put(pageKey, fresh.clone());
        return fresh;
      });
      // Keep freshening even after we answer from cache; swallow its failure.
      event.waitUntil(freshen.catch(() => {}));

      const timeout = new Promise((resolve) =>
        setTimeout(() => resolve(null), NAV_DEADLINE_MS));
      const winner = await Promise.race([freshen.catch(() => null), timeout]);
      // `.ok` matters: a reachable origin serving a 503 is a LOSS, not a win —
      // the audit showed an installed app rendering the deploy's error page
      // while a complete cached shell sat unused.
      // BOTH BRANCHES ARE DRESSED. Fixing only the cached one would leave the
      // flash in place for every online cold start, which is most of them.
      if (winner && winner.ok) return dressShell(winner, await wearing);
      const cached = await (await caches.open(CACHE)).match(pageKey)
        ?? await (await caches.open(CACHE)).match('./index.html');
      if (cached) return dressShell(cached, await wearing);
      // No cache to fall back on (first visit): the network is all there is,
      // however long it takes. If it errored above, hand that answer over.
      // Undressed deliberately — a first-ever visit has no choice to honour.
      return winner ?? freshen.catch(() => Response.error());
    })());
    return;
  }

  // Cache-first for the SHELL only, read from THIS version's cache — an
  // unscoped caches.match() prefers the oldest cache in creation order, which
  // pins a stale bundle if one old cache ever survives (audit). Non-shell GETs
  // pass through uncached, so the cache cannot grow without bound.
  const rel = `.${url.pathname}`;
  if (!SHELL.includes(rel) && !url.pathname.endsWith('/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) return hit;
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  })());
});
