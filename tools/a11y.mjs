// The app's accessibility gate — computed, never eyeballed (B-08).
//
// brand.mjs checks the TOKENS. This checks the RENDERED APP: what a person is
// actually shown, in both themes, in every reachable state including the ones
// the first version never rendered — the everyday (i) dialog, the dialog at the
// stressed viewport, focus rings, the placeholder.
//
// The first version of this gate was handed to an adversarial audit, which
// deleted focus rings, dropped the placeholder to 1.44:1, shrank targets to
// 20px and made borders invisible — and the gate printed 66 ok, 0 FAIL. Every
// mechanism below that looks paranoid exists because that run happened:
//  - registries audit EVERY visible match of a selector (worst case), not the first
//  - pseudo-elements are sampled (::placeholder)
//  - focus rings are focused-and-measured, not assumed
//  - targets check width AND height, in every state including the dialog
//  - axe runs per state AND at the stressed viewport; `incomplete` is printed
//    by rule id, and the registry pass covers the pairs axe drops there
//  - the dialog's own scrollWidth is checked: it is a scroll container, so
//    page-level overflow stays 0 while content escapes sideways inside it
//
//   npm run a11y        (exits non-zero on any failure)

import { chromium } from 'playwright-core';
import * as esbuild from 'esbuild';
import { existsSync, writeFileSync, rmSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { requireFreshBundle } from './bundle-fresh.mjs';

/** ONE SURFACE AT A TIME (1.40.0) — see the note in tools/smoke.mjs. */
/**
 * INTO A JOB, THROUGH ITS DOOR (3.0.0, ADR-0108).
 *
 * The landing view is the hub now, and a section is on screen only while it is
 * the stance. A walk that revealed one any other way would be measuring a state
 * no finger can reach, which is the defect `tools/look.mjs`'s header is about
 * and which this file has paid for twice.
 *
 * Comes up first: the door only exists on the hub. Idempotent, so a caller that
 * is already in the job it wants pays one repaint and nothing else.
 *
 * A stance whose door is absent is a FAILURE rather than a skip — the section
 * has nothing in it, so the audit that follows would silently measure nothing
 * and report green, which is the fail-open shape this repo keeps rediscovering.
 */
const enterStance = async (pg, id) => {
  await pg.evaluate(() => {
    for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
  });
  const inOne = await pg.evaluate(() =>
    document.querySelector('#runway')?.getAttribute('data-stance') ?? null);
  if (inOne === id) return;
  if (inOne !== null) await pg.click('#stance-back');
  const door = `#hub-doors .hub-go[data-stance-id="${id}"]`;
  if (await pg.locator(door).count() === 0) {
    fail(`no door to "${id}" on the hub — the section is empty, so anything measured after this measures nothing`);
    return;
  }
  await pg.click(door);
  await pg.waitForSelector(`#runway[data-stance="${id}"]`);
};

/** Back to the hub. */
const leaveStance = async (pg) => {
  const inOne = await pg.evaluate(() =>
    document.querySelector('#runway')?.getAttribute('data-stance') ?? null);
  if (inOne !== null) await pg.click('#stance-back');
};

/**
 * Which job does this selector live in, and are we in it?
 *
 * Reads the DOM rather than a map: the section a control sits in is a fact about
 * the page, and a table here would be the hand-written list of surfaces this
 * repo has watched go stale inside a day.
 *
 * Silent when there is nothing to do — a selector that matches nothing, or one
 * in the frame or a dialog, is not this function's business. It must not fail:
 * the caller's own click is about to fail with a far better message if the
 * element is genuinely unreachable, and a second error here would bury it.
 */
/** The unwrapped `waitForSelector`, so the shim never re-enters itself. */
const RAW_WAIT = new WeakMap();
const rawWaitOf = (pg) => RAW_WAIT.get(pg) ?? pg.waitForSelector.bind(pg);

/**
 * ARRIVE — and HOW to arrive is not decided here (3.0.0, ADR-0108).
 *
 * It is `src/reach.ts`, which the app itself imports. This file used to carry
 * its own copy of the rule and the copy had already drifted: no handling for
 * Playwright's non-CSS pseudos, no way to name a job whose markup is not built
 * yet, and — the one that cost a CI round in the smoke walk — no press of a
 * job's own opener, so a job could be stood in without ever being opened.
 *
 * A divergent second gate is not a smaller gate, it is a different one.
 *
 * TRUE means the selector NAMED a job, which is what the caller's loop wants to
 * know: stop looking, this one answered. That includes "already there", and the
 * old copy returned FALSE for it — so the loop walked on to the next selector
 * and navigated away from the very state it had just driven.
 */
const REACH_SRC = (await esbuild.build({
  entryPoints: [new URL('../src/reach.ts', import.meta.url).pathname],
  bundle: true, format: 'iife', globalName: '__reach', write: false,
  target: 'es2022', logLevel: 'silent',
  // esbuild's IIFE declares `var __reach`, and Playwright wraps an init script
  // in a function, so without this the `var` never reaches the page.
  footer: { js: ';globalThis.__reach = __reach;' },
})).outputFiles[0].text;

const ensureStanceFor = async (pg, selector) => {
  const first = await pg.evaluate((sel) =>
    globalThis.__reach ? globalThis.__reach.reach(sel) : null, selector).catch(() => null);
  if (!first) return false;
  if (first.at === 'waiting') {
    // A job becomes live a beat after the write that fills it. Generous on
    // purpose: nothing is proven by this being short, and giving up early makes
    // the walk decline silently, which is indistinguishable from having no need.
    try { await rawWaitOf(pg)(first.door, { timeout: 10000 }); } catch { return false; }
    await pg.evaluate((sel) =>
      globalThis.__reach ? globalThis.__reach.reach(sel) : null, selector).catch(() => null);
  }
  return first.at !== 'nowhere';
};

const openSurface = async (pg, id) => {
  // THROUGH THE REAL DOOR (1.40.0). A sheet reached with `showModal()` skips
  // `openSheet`, and `openSheet` is where each sheet's open-time repaint runs —
  // so a walk that opened them directly could not have caught the stale-panel
  // defect this release introduced and closed. More itself is opened
  // programmatically: it has no repaint of its own, and `click('#open-more')`
  // was observed resolving without the dialog opening (a11y only, cause never
  // found), which is a flake in the instrument and not a claim about the app.
  await pg.evaluate(() => {
    for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
  });
  // The two sheets opened from the workspace (2.0.5, ADR-0088) are not in More
  // — ADR-0083 caps it at six destinations — so they are reached the way a
  // reader reaches them: by pressing the control that states the claim.
  // 2.0.7: read off the sheet rather than held in a map here. A hand-written
  // list of doors goes stale exactly like a hand-written list of surfaces, and
  // this one did within a day of being written — a third sheet is what made
  // that obvious.
  const door = await pg.evaluate((want) =>
    document.querySelector(`#${want}`)?.dataset.door ?? null, id);
  if (door) {
    await pg.evaluate((sel) => document.querySelector(sel)?.click(), door);
    await pg.waitForSelector(`#${id}[open]`);
    return;
  }
  if (id === 'about') {
    // PROGRAMMATIC, not a real click. A mouse click focuses the button, and a
    // native dialog hands focus back to its invoker on close — which would make
    // 'closing the panel returns you to capture' pass or fail on how the WALK
    // opened it rather than on what the app does.
    await pg.evaluate(() => document.querySelector('#open-about')?.click());
  } else if (id === 'more') {
    await pg.evaluate(() => document.querySelector('#more')?.showModal());
  } else {
    await pg.evaluate(() => document.querySelector('#more')?.showModal());
    await pg.waitForSelector('#more[open]');
    await pg.click(`.more-go[data-go="${id.replace(/^sheet-/, '')}"]`);
  }
  await pg.waitForSelector(`#${id}[open]`);
};

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AXE = join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');
requireFreshBundle(ROOT, 'the a11y walk');
// THE HASH IS TAKEN NOW, NOT AT THE END (2026-08-28). `requireFreshBundle` on
// the line above proves the bundle matches `src/` AT THIS MOMENT, and this is
// the tree that the next four minutes actually measure. Reading it at the end
// would certify whatever the tree had become — and on 3.8.0 the release notes
// were edited while the browser was still working, which the receipt would have
// covered without anything having looked at them.
const { uiHash: uiHashAtStart } = await import('./a11y-stamp.mjs');
const UI_AT_START = uiHashAtStart();

const launchOpts = { args: ['--no-sandbox'] };
const SANDBOX_CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
if (existsSync(SANDBOX_CHROMIUM)) launchOpts.executablePath = SANDBOX_CHROMIUM;

/* --- THE COLOUR INVENTORY (3.3.0, ADR-0110) ---------------------------------
 *
 * WHY THIS EXISTS. This walk made 1,660 contrast assertions in its last run, for
 * TWO palettes — about 830 each, four minutes of browser each. A third palette
 * costs another four, a sixth costs twenty-four, and every one of those runs
 * re-measures the same thing: which pairs the UI produces.
 *
 * It does not have to. Contrast is a property of a PAIR, and swapping a palette
 * changes token VALUES — never which token a selector resolves to, nor the size
 * and weight it renders at. So the browser is needed for the structural half
 * only, and that half is the same for every palette.
 *
 * `--inventory` runs this walk under a SENTINEL PALETTE: each colour role is
 * painted a unique probe value, so every computed colour maps to exactly one
 * role BY CONSTRUCTION rather than by luck. What comes out is (state, selector,
 * fg role, bg role, size, weight) — the structure — which `palette-gate.mjs`
 * then reads and checks by arithmetic, for any number of palettes, in
 * milliseconds and with no browser at all.
 *
 * AND IT FINDS SOMETHING NOTHING ELSE COULD. A colour hard-coded in the
 * stylesheet is contrast-checked like any other today, so it passes — and then
 * survives every palette swap unchanged and looks wrong in all but one. Under
 * the sentinel palette it is a colour that is not a sentinel, which is a hard
 * failure here. Measured before this was built: the rendered app had none.
 *
 * IT IS THE SAME WALK. Not a second driver and not a second list of states — the
 * registry, the state driving and the sampler are the ones that were already
 * here, because a copy of any of the three is the defect this repo has paid for
 * more than once. */
const INVENTORY_MODE = process.argv.includes('--inventory');
/** The seven colour roles, and a probe value each that nothing would hard-code. */
/* Multi-line, ending `\n];`, because that is the shape `surfaces.mjs` reads an
 * uppercase const array in — its lazy `[\s\S]*?\n\];` ran past a one-line
 * version and swallowed the comments after it, then reported two of their
 * fragments as selectors naming elements that are not in the markup. The gate
 * was right; the formatting was not. */
const ROLES = [
  'bg', 'surface', 'ink', 'ink-soft', 'line', 'accent', 'warm',
];
const SENTINEL = new Map(ROLES.map((r, i) => [`${11 + i * 17},${29 + i * 3},${(i + 1) * 31}`, r]));
/* `!important`, and it is the right tool exactly once. The dark palette is set
 * under `:root:not([data-theme="light"])`, which outranks a plain `:root` — so
 * the first version of this probe was quietly overridden and sampled the REAL
 * colours, then reported all 5,267 of them as colours no role owned. The
 * detection was working; it had caught its own installer. A probe is not product
 * CSS and has no cascade to be polite to. */
const sentinelCss = ROLES.map((r, i) =>
  `--${r}: rgb(${11 + i * 17}, ${29 + i * 3}, ${(i + 1) * 31}) !important;`).join(' ');
/** Selectors whose colours the USER AGENT paints — declared, with a reason. */
const UA_OWNED = new Map(
  (existsSync('.colour-ua-owned') ? readFileSync('.colour-ua-owned', 'utf8') : '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && l.includes('|') && !l.startsWith('# '))
    .map((l) => {
      const i = l.indexOf('|');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
/** Which of them actually turned up, so a stale declaration cannot survive. */
const uaSeen = new Set();
/** Every selector found rendering a colour no role owns, deduplicated. */
const unowned = new Map();
/** Rows collected while the walk drives. Written once, at the end. */
const inventory = [];
/* BOTH THEMES ARE STILL WALKED, and the rows are deduped across them.
 * Under a sentinel palette the two themes render the same roles, so one pass
 * would almost certainly do — but "almost certainly" is an assumption about
 * every rule in a 3,000-line stylesheet, and the extraction runs once per
 * release rather than once per palette, so it is not the cost worth shaving.
 * Walking both and deduping needs no such assumption. */
const recorded = new Set();

const failures = [];

/**
 * Every card must have ONE visible box that contains all of its own controls.
 *
 * The bug: the border lived on the title button rather than on the card, and the
 * actions were siblings that wrapped independently — so on a long title "Done"
 * landed alone on the next line, left-aligned, directly above a DIFFERENT item.
 * Found at 1,429 rows on a real store. A completion control that appears to belong to the
 * thing below it is a mis-tap, not a cosmetic complaint, and no contrast or target
 * check can see it.
 *
 * The FIRST version of this asserted the buttons sat inside the card element's
 * bounding rect — which is a tautology, because a flex container always grows to
 * enclose its children wherever the border happens to be drawn. It passed with the
 * bug reintroduced. What matters is the box somebody can SEE: there must exist an
 * element, the card or something in it, that draws a border and encloses every
 * control the card owns. Stated that way it is about the rendered result rather
 * than about which selector carries the style, so it survives any rewrite.
 */
async function auditCardContainment(page, state, theme) {
  const bad = await page.evaluate(() => {
    const out = [];
    const bordered = (el) => {
      const st = getComputedStyle(el);
      return ['Top', 'Right', 'Bottom', 'Left'].every(side => {
        const w = parseFloat(st[`border${side}Width`]);
        const c = st[`border${side}Color`];
        return w > 0 && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent';
      });
    };
    const holds = (outer, inner) =>
      inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1
      && inner.left >= outer.left - 1 && inner.right <= outer.right + 1;

    for (const card of document.querySelectorAll('#cards .card')) {
      const controls = [...card.querySelectorAll('button')]
        .map(b => b.getBoundingClientRect()).filter(r => r.width > 0);
      if (controls.length === 0) continue;
      // Candidate boxes: the card, and any NON-button element inside it that draws
      // a border. A button cannot be the box that contains its siblings.
      const candidates = [card, ...card.querySelectorAll('*')]
        .filter(el => el.tagName !== 'BUTTON' && bordered(el))
        .map(el => el.getBoundingClientRect());
      if (!candidates.some(box => controls.every(c => holds(box, c)))) {
        out.push(`no single visible box holds every control of "${(card.textContent || '').replace(/\s+/g, ' ').slice(0, 44)}"`);
      }
    }
    return out;
  });
  const label = `${theme}/${state}: each card has one visible box around all its controls`;
  if (bad.length > 0) fail(`${label} — ${bad.slice(0, 2).join('; ')}`);
  else pass(`${label}: yes`);
}
/* In `--inventory` the sentinel palette makes every ordinary assertion
 * meaningless — the colours are probes, not the product's. So this run reports
 * nothing but what the extraction itself finds, and `inventoryFail` is the one
 * thing that can still make it exit non-zero. An extraction that quietly printed
 * 1,660 failures would train everybody to ignore its output. */
const fail = (m) => {
  if (INVENTORY_MODE) return;
  failures.push(m); console.error(`  FAIL  ${m}`);
};
const pass = (m) => { if (!INVENTORY_MODE) console.log(`  ok    ${m}`); };
const inventoryFail = (m) => { failures.push(m); console.error(`  FAIL  ${m}`); };

// Entries: 'sel' or {sel, pseudo}. Every VISIBLE match is audited; the worst
// ratio is what gets judged. A selector matching nothing visible FAILS.
// THE REGISTRY FOLLOWS THE SURFACES (1.40.0).
//
// DIALOG_COMMON was one list because the panel was one dialog. Help, Settings,
// Your data and How it works are their own sheets now, so a single list spans
// four screens and can never all be visible at once — every entry would report
// "matches nothing visible" on three states out of four. Split by where each id
// actually lives, derived from the shipped markup.
const DIALOG_COMMON = [
  '#about-title',
  '.version',
  '.about-section',
  '#about-close',
  '#about-dismiss',
  '.note-triplet',
  '.note-kind',
  '.note-list li',
  '.about-p',
  '.about-p a',
];

// Every sheet carries the same three things — its own title, its body text and
// its way out — so they are held once rather than repeated four times. A sheet
// that loses its Close is the §4 failure, and it would fail here first.
const SHEET_CHROME = (id) => [`#${id}-title`, '.about-p', `#${id}-close`];

const DATA_SHEET = [
  ...SHEET_CHROME('sheet-group-data'),
  '.about-section',
  '#storage-body dt',
  '#storage-body dd',
  '#storage-note',
  '#export',
  '#storage-ask',
  '#notnow-open',
  '#import-file',
  'label[for="import-file"]',
  // The two data ACTS joined Your data in 1.40.0 — bringing work in from another
  // planner, and clearing out. Both are things you do TO your data, and both had
  // been filed under Settings on the grounds that neither is the main screen.
  '#other-file',
  'label[for="other-file"]',
  '#other-note',
  // `#other-facts li` is NOT here, and that is the rule this list runs on: a
  // registry entry that matches nothing visible FAILS, so a selector whose
  // elements exist only after a file is chosen belongs to that state and not to
  // the sheet at rest. It is measured under 'another planner, file chosen'.
  '#purge-summary',
  '#purge-backup',
  '#purge-pick-clear',
  '#purge-pick-erase',
  '#purge-note',
  '#purge-backup-note',
];

// THE VERBS LEFT (1.40.0). Settings holds switches: things set once and then
// obeyed. Everything you DO — send to the calendar, print, tell somebody where
// things are, try it with something in it — is its own destination now.
const EXTRAS_SHEET = [
  ...SHEET_CHROME('sheet-group-extras'),
  '.about-section',
  '#badge-explainer',
  '#badge-toggle',
  '#badge-note',
  '#slot-day',
  '#slot-set',
  '#day-boundary',
  '#day-boundary-set',
  '#timer-length',
  '#timer-length-set',
];

// COLOUR IS ITS OWN SURFACE FROM 3.5.1, so it is its own entry here — in the
// same commit that created it, because a surface the walk does not know about
// ships unmeasured and looks exactly like one that passed (hub LESSONS 28).
//
// The picture is `alt=""` and carries no text, so what is measured is the name
// beside it and the mark before that: the ring the tile's own `::before` draws,
// which is what says "this is the one you have" without saying it in hue.
const COLOUR_SHEET = [
  ...SHEET_CHROME('sheet-group-colour'),
  // No `.about-section` — this sheet has no section headings, because its title
  // IS the one it would carry. A selector that matches nothing is an assertion
  // that cannot fail.
  '.palette-pick legend',
  '.palette-name',
];

const ACTIONS_SHEET = [
  ...SHEET_CHROME('sheet-group-actions'),
  '.about-section',
  '.about-sub',
  '.about-caveat',
  '.anchor-label',
  '#calendar',
  '#tour-replay',
  '#today-print',
  '#report-copy',
  '#report-markdown',
  '#report-csv',
  '#report-print',
  '#anchor-name',
  '#anchor-recurrence',
  '#anchor-period',
  '#capture-endpoint',
  '#capture-endpoint-copy',
  '#sample',
  '#sample-note',
  '#big-sample',
  '#big-sample-note',
];

const WHY_SHEET = [
  ...SHEET_CHROME('sheet-group-why'),
  '.about-section',
  '.about-list li',
  '.about-list strong',
];

// Help is nine disclosures and nothing else. The SUMMARY is the control and the
// answer inside it is text nobody sees until they open one, so both are held —
// a closed `<details>` matches nothing visible, which is why the driver opens
// them before this state is audited.
const HELP_SHEET = [
  ...SHEET_CHROME('sheet-group-help'),
  '.help-q summary',
  '.about-p a',
];

const CLEARING_OUT = [
  '.purge-label',
  '#purge-word',
  '#purge-go',
  '#purge-cancel',
  '#purge-consequence',
];

// The stuck-update paragraph, taken from the SOURCE rather than copied here.
// A copy would drift, and the whole point of auditing this state is that the
// real words are long enough to change how the strip lays out. If the constant
// is renamed, this throws rather than silently auditing a shorter string —
// a gate that quietly measures the wrong text is worse than one that stops.
const UPDATE_STUCK_WORDS = (() => {
  const src = readFileSync(new URL('../src/ui/update.ts', import.meta.url), 'utf8');
  const m = /export const UPDATE_STUCK_WORDS\s*=\s*\n?\s*'((?:[^'\\]|\\.)*)'/.exec(src);
  if (!m) throw new Error('a11y: UPDATE_STUCK_WORDS not found in src/ui/update.ts — the stuck state cannot be audited');
  return m[1].replace(/\\'/g, "'");
})();

const REGISTRY = {
  // The walkthrough (src/ui/tour.ts) is the first surface a new person meets now,
  // so it is audited as its own state. #tour-back is hidden on the first step, so
  // it is not registered here where it would match nothing visible (it shares
  // button.ghost with #tour-skip, which IS checked); it is exercised by the
  // driver stepping forward.
  // `.ui-name` is a control's name inside a sentence (2.31.0) — `--ink` on the
  // panel surface, one step stronger than the `--ink-soft` prose around it. It
  // joins the registry in the commit that introduces it, which is this repo's
  // rule for a new foreground/background pair: it passes comfortably today, and
  // the point of registering it is that a later change to either token moves
  // the check with it rather than past it.
  'walkthrough': ['#tour-progress', '#tour-heading', '.tour-p', '.ui-name', '#tour-skip', '#tour-next'],
  // THE INTRO IS BACK, AND IT WAS NEVER MEANT TO BE GONE. This comment used to
  // say the intro "no longer shows" because the walkthrough owned first run —
  // recorded as a design consequence when it was a defect: `show(true)` had one
  // caller, inside the branch the walkthrough's Skip made unreachable, so the
  // one block written to explain the storage question was dead markup that no
  // walk asserted and nobody had seen. It now shows whenever the browser has not
  // agreed to keep the store, which is the state it describes, and it carries
  // the only persistence control that is not inside a collapsed group.
  'first-run dialog': [...DIALOG_COMMON, '.intro p', '.intro-aside', '#intro-ask'],
  // The ⓘ as every return visit meets it. Identical to the first-run list minus
  // the intro, which is the whole difference between the two states: the intro
  // shows only while the browser has not agreed to keep the store.
  'dialog, return visit': DIALOG_COMMON,
  // THE FOUR SHEETS (1.40.0). Help, Settings, Your data and How it works were
  // folding groups inside the ⓘ and are their own destinations now, reached from
  // More. Each is audited as its own state, which is what "a new surface joins
  // the gate in the same commit" means when the surface is a screen rather than
  // a control: a state the gate never opens is a state nothing measures
  // (LESSONS §28), and four groups audited as one dialog measured the FIRST
  // group's contrast and nothing below it.
  'how it works': WHY_SHEET,
  'help': HELP_SHEET,
  'your data': DATA_SHEET,
  // 1.14.0: the copy note is hidden when there is nothing to say, and on a first
  // run there genuinely is not — an empty store with no export is not told it is
  // behind. It renders from the return visit onward, so it is a second state
  // rather than an entry in the first, where it would match nothing visible.
  'your data, return visit': [...DATA_SHEET, '#copy-note'],
  'settings': EXTRAS_SHEET,
  'colours': COLOUR_SHEET,
  'things you can do': ACTIONS_SHEET,
  // Clearing out is inside Settings and only exists once a mode is chosen, so it
  // is driven rather than assumed — it is the one surface standing between a
  // person and their history, and it would be exempt from every audit if the
  // walk stopped at the sheet that contains it.
  'clearing out': CLEARING_OUT,
  'empty store': [
    '.wordmark', '#capture', { sel: '#capture', pseudo: '::placeholder' },
    '#capture-form button[type=submit]',
    // Hold what I copied (1.41.0). It is revealed only where the browser can
    // read a clipboard — Chromium can, so it is visible here and is audited on
    // the state a reader meets first, beside the box it fills.
    // Search is a tool that is always on screen even before anything is held,
    // so its input and placeholder are audited here where they first appear.
    '.search-input', { sel: '#search-input', pseudo: '::placeholder' },
    // Sort mode's door was here until 2.8.1 (ADR-0099) moved it into Contents.
    // It is measured as a `.contents-go` row on the 'contents open' state now,
    // on the surface it actually lives on — leaving it here would have named a
    // selector matching nothing visible, which this gate fails on by design.
    'button.info', '.section', '.gauge', '.gauge-fact', '.gauge-door', '.empty', '.foot', '.foot a', '.build',
    '#update-words', '#update-save', '#update-reload', '#update-dismiss',
    // The way back (1.14.0, ADR-0062). This is the ONLY state it appears in —
    // it shows on an empty store and nowhere else — so it is audited exactly
    // where somebody meets it, on the screen they reach after a cleared browser.
    '.restore-note', '#restore-go',
  ],
  // The arrangement controls (1.21.0, ADR-0074). Their own state because the
  // group is hidden unless the sheet is showing something that REPEATS — an
  // entry folded into 'detail sheet' would match nothing visible there and fail
  // by design, which is the registry rule working correctly.
  'arrangement group': ['#detail-arrangement-label', '#detail-arrangement-hint',
    '#detail-arrangement-set', '#detail-arrangement-stop', '#detail-arrangement-depends',
    // WHERE IT STANDS AND WHAT WOULD CHANGE IT (3.18.0, ADR-0121). Inside this
    // state rather than a new one: the two boxes live in the same group, appear
    // under the same condition, and extending a state that is already driven is
    // cheaper than standing up another that would need its own route.
    '#detail-stands', '#detail-stands-hint', '#detail-stands-set',
    '#detail-changes', '#detail-changes-hint', '#detail-changes-set'],
  // RUNNING WITHOUT YOU (3.18.0, ADR-0121). `arrangementCards` had no caller at
  // all until this release, so none of this had ever been on a screen. Its DOOR
  // is registered here rather than with the sheet: opening a sheet closes the
  // surface the door is on, so an entry for it on this state would match
  // nothing visible — the mistake 'in the room' made first time.
  'running without you': ['#arrangements-open', '#sheet-arrangements-title',
    '#sheet-arrangements-close', '#arrangements-words',
    '#arrangements-list .roles-name', '#arrangements-list .roles-held',
    '#arrangements-list .arrangement-said'],
  // The header clock, opt-in (1.22.0). Two states, because the switch and the
  // thing it switches on are never on screen together — the toggle is in a
  // modal and the clock is in the header behind it.
  'clock opt-in': ['#clock-on'],
  // When your day ends (V2 stage 5). A select and its button, in the panel where
  // the timer length is chosen — the same shape, set in the same calm place.
  'day boundary': ['#day-boundary', '#day-boundary-set', '#day-boundary-note'],
  // The way in from outside (V2 stage 6). The address is a `<code>` block
  // somebody has to READ off a screen and then trust, so it is measured like
  // any other text — a monospace block on an inset background is exactly the
  // pairing that quietly fails contrast.
  'capture address': ['#capture-endpoint', '#capture-endpoint-copy', '#capture-endpoint-note'],
  // The clock itself, after the panel has been closed. `.clock-face` is an SVG
  // and the sampler reads an element's `color`, so this measures the dial only
  // because the strokes are `currentColor` — see the note in app.css. `.clock-rim`
  // is NOT here: it is --line, a graphical object at 3:1 (WCAG 1.4.11), and this
  // sampler would judge it against 4.5:1 and fail a correct colour. It is held
  // by the `line/bg` pair in tools/brand.mjs instead.
  'clock on': ['.clock-face', '.clock-words'],
  // The update strip's stuck state (1.20.2). #update-reload is deliberately
  // ABSENT: the state hides it, and a registry entry matching nothing visible
  // fails by design — listing it here would demand the control be shown, which
  // is the opposite of what this state is.
  'update stuck': ['#update-words', '#update-save', '#update-dismiss'],
  // Sort mode (1.3.0): the picker — sentences and counts, never lists — and
  // the one-card conveyor. The count and the entry line are the quiet tokens;
  // the route hints are the lowest-contrast text, named like triage's own.
  'sort picker': ['#sort-title', '.sort-choice', '.sort-choice-words', '.sort-choice-count',
    '#sort-query', { sel: '#sort-query', pseudo: '::placeholder' }, '#sort-query-go', '#sort-close'],
  'sort card': ['#sort-entry', '#sort-card', '#sort-where',
    '#sort-actions .route', '#sort-actions .route-label', '#sort-actions .route-hint',
    '#sort-back', '#sort-close', '#sort-act-all'],
  // Wholesale (1.5.0, ADR-0049): the verbs, the preview sentence, the place
  // filter's placeholder, and the run controls.
  'sort bulk verbs': ['#sort-bulk-title', '#sort-bulk-verbs .route',
    '#sort-bulk-verbs .route-label', '#sort-bulk-verbs .route-hint',
    '#sort-bulk-preview', '#sort-bulk-go', '#sort-bulk-cancel', '#sort-bulk-export'],
  // The destructive confirm, revealed by choosing Let-them-go — the
  // purge-confirm rule: a control that only exists after a click is still a
  // control somebody reads.
  'sort bulk confirm': ['#sort-bulk-confirm .detail-inline', '#sort-bulk-word',
    '#sort-bulk-preview', '#sort-bulk-go'],
  // Things you let go (1.5.0, ADR-0050): the count and the one-verb rows.
  'trash view': ['#trash-open', '#trash-total', '.trash-row'],
  // The picker's create-in-place offer, which only exists once unknown words
  // have been typed — a control someone meets mid-filing is still a control.
  // The kind picker joins this in the SAME COMMIT it is built (hub LESSONS 28),
  // which is the rule that exists because a surface added without its entry
  // ships unmeasured and every gate stays green about it. Its label is checked
  // too: a bare select answers to nothing.
  'detail sheet, creating a place': [
    '#detail-parent-filter', '#detail-parent-create',
    '#detail-parent-kind', 'label[for="detail-parent-kind"]',
  ],
  // THE PLACES YOU ALREADY HAVE, AS TAPS (3.8.0), and the toggle that turns them
  // into the way to take a wrong one back out.
  //
  // A native `<datalist>` used to sit on all three of the detail sheet's naming
  // fields, and it was the only control anywhere in this app that this file
  // structurally could not measure: the browser draws that popup itself, over
  // the keyboard, and nothing here can read its colours, its target sizes or
  // its focus ring. It also took the caret out of the field mid-word on the
  // device this app is used on, which is what actually ended a session.
  //
  // So it came off, and this is what replaced it — joining the gate in the SAME
  // COMMIT that builds it, which is hub LESSONS 28's rule and the reason a
  // surface here has never shipped unmeasured.
  'detail sheet, the places you have': [
    '#detail-context-picks button', '#detail-context-fix button',
  ],
  // The SAME buttons wearing their REMOVAL words, and it is a separate state
  // rather than a fold of the one above because words are exactly what SC 2.5.3
  // and the name audits read. "At my desk" and "At my desk — not a place" are
  // two different controls to everything that measures a control by what it
  // says, and only one of them would have been measured.
  'detail sheet, correcting a place': [
    '#detail-context-picks button', '#detail-context-fix button',
  ],
  // The sheet open on a CONTAINER, with a rhythm set on it (2.17.0). Its own
  // state and not a fold of 'detail sheet', because these three controls carry
  // DIFFERENT WORDS here — a goal is told it will come back, not that it will
  // repeat — and words are what SC 2.5.3 and the name audits read. Measured on
  // the variant a reader of a goal actually meets rather than on the default
  // strings, which is the difference between auditing the markup and auditing
  // the app. `#detail-repeat-stop` is in the list on purpose: it is revealed
  // only once a cadence exists, and it was hidden from every container by a
  // predicate keyed on kind — a state you could enter and not leave.
  'detail sheet, a container with a rhythm': [
    '#detail-repeat-label', '#detail-repeat-set', '#detail-repeat-stop',
    '#detail-every', '#detail-slack', '#detail-repeat-hint',
  ],
  // The situation field (1.29.0). Scoped to its own group: `.detail-label`
  // unscoped answers for every group on the sheet, so a registry entry written
  // that way measures the note's label and reports the situation's as covered.
  // How heavy this one is (1.34.0). Driven with a weight actually CHOSEN, so
  // the pressed state and the clear control are measured in the shape a reader
  // meets rather than in the easiest one to reach.
  // The settled state (1.35.0) — the surface with nothing being asked. Its own
  // driven state, because it only exists after an act and nothing else on the
  // offer surface is on screen at the same time.
  // Just one thing (1.36.0) — the minimum state. Driven with it actually ON,
  // because the way out only exists then and the type sizes differ.
  'one thing': ['#nextup-title', '#nextup-done', '#nextup-skip', '#nextup-plain-off'],
  'settled': ['#nextup-settled-what', '#nextup-settled-quiet', '#nextup-resume'],
  'weight': ['#detail-weight-group .detail-label', '#detail-weight-light',
    '#detail-weight-ordinary', '#detail-weight-heavy', '#detail-weight-clear',
    '#detail-weight-now', '#detail-weight-hint'],
  'situation field': ['#detail-situation', '#detail-situation-group .detail-label',
    '#detail-situation-set', '#detail-situation-hint'],
  // What this waits for (1.30.0). The state is driven with an anchor actually
  // SET, because `#detail-after-clear` and `#detail-after-now` only exist once
  // there is something to stop waiting for — measuring the group empty would
  // report two controls as covered that the reader never sees measured.
  'waits for': ['#detail-after', '#detail-after-filter', '#detail-after-group .detail-label',
    '#detail-after-set', '#detail-after-clear', '#detail-after-now', '#detail-after-hint'],
  // Put down (1.32.0). The verb and its hint are on the ordinary sheet; the way
  // BACK only exists once something has been put down, so it is driven as its
  // own state rather than measured in a shape no reader ever meets.
  'put it down': ['#detail-release', '#detail-release-hint'],
  'picked back up': ['#detail-reclaim'],
  // Room for many lines (1.38.0). The many-line field and the button that opens
  // it. `#capture-room` is registered HERE rather than in the base state because
  // its label CHANGES with the mode ("More room" / "One line") and it disappears
  // entirely once there is more than one line to lose.
  'more room': ['#capture-many'],
  // Where things are (1.39.0). The destination list is a new surface, and a new
  // surface joins this gate in the same commit or it ships unmeasured.
  'more': ['#more-title', '.more-go', '#more-close'],
  // `#triage-open` (1.39.2) is the door onto the inbox — it exists only while
  // something is waiting and the surface is suppressed, which is the state right
  // after a capture. Added to THIS entry rather than a second 'with cards' key:
  // a duplicate key in an object literal silently wins, and the registry would
  // have shrunk to one selector while still reporting a pass.
  // THE INVENTORY, FOLDED (2.12.0, ADR-0102) — the state it arrives in, which
  // is now the one a reader actually meets. Registered in the same commit that
  // created it: a new surface that does not join this list ships unmeasured
  // (hub LESSONS §28), and this one is the whole landing surface's shape.
  'inventory folded': ['#held-heading', '.held-fold-label', '.held-fold-where'],
  'with cards': ['.card-title', '.card-when', '#status', '.group-head',
    // The way to anywhere (2.3.0, ADR-0093). BOTH doors, because there are two
    // and a registry that names one of them measures half a control pair — the
    // header's, beside More, and the one at the end of the list beside Back to
    // the top. Neither is fixed; app.css carries the measurement that ruled a
    // floating control out. `#held-heading` is the list's own heading, which
    // existed as a loose <h2> and is a real region's name now.
    '#contents-open', '#contents-open-end', '#held-heading'],
  // The door onto the inbox (1.39.2), which exists ONLY between a capture and
  // the moment somebody asks to sort — the app no longer answers your typing
  // with a question about it. Its own driven state, because that window is the
  // only place it is on screen, and a registry entry matching nothing visible
  // is the false receipt `#nextup-left` already cost a release for.
  // 'the door onto the inbox' WAS HERE and is gone (3.0.0, ADR-0108).
  // `#triage-open` is no longer a screen anybody meets: the hub's own door is
  // the way into sorting, and entering the job presses this on the reader's
  // behalf. It is audited as part of 'the hub' now. Kept as the mechanism rather
  // than deleted, because on a store with no hub it is still the only way in —
  // but it is never a thing on screen to be measured.
  // Search results — only exist once you have typed, so a state of their own.
  // The summary is the quiet count; the "where" is the held status word, the
  // lowest-contrast text on the row and the whole point of showing it.
  'search results': ['.search-summary', '.search-open', '.search-title', '.search-where'],
  // The last-action undo the triage route raises. `.triage-undo-btn` is the
  // `.linklike` accent-on-background pair the app's links use; the "where" line
  // is the quiet token naming the destination.
  'route undo': ['.triage-undo-where', '.triage-undo-btn'],
  // The filed receipt, with its unanswered question and the way to answer it
  // (V2 stage 3). Its own state because the control appears ONLY on the no-date
  // branch — folding it into 'route undo' would demand it be visible after an
  // ordinary route, which is the opposite of what it is.
  'filed receipt': ['.triage-undo-where', '.triage-place-when', '.triage-place-set',
    '.triage-undo-btn'],
  // `.card-place` — the line that says "in Errands · under Home", and from
  // 1.27.0 also what a returned place is holding.
  //
  // IT USED TO RIDE ON 'filed receipt' because the filing had just happened and
  // the item's card would then say where it went. Under the hub (3.0.0) a state
  // cannot span two jobs: the receipt is in Sort and the card is in the pile, so
  // one state asking for both would always be measuring something off-screen.
  // Its own state, in the job where the card actually is.
  'a card that says where it went': ['.card-place'],
  // The triage surface, in both of its passes. Heat shows Hot/Cold; clarify
  // shows the six routes, each a label over a hint. Every visible pair is
  // audited — the hint is the lowest-contrast text on the surface, so it is
  // named explicitly rather than left to axe alone.
  // 1.25.0 adds "Not this one" to BOTH passes, so both entries gain its parts.
  // On the heat pass it is the only control carrying a hint, which is
  // deliberate — "nothing is recorded" is the whole reassurance — and it is
  // therefore the lowest-contrast text on that surface.
  'heat pass': ['.triage-gauge', '.triage-prompt', '.triage-card', '.route',
    '.route-label', '.route-hint'],
  'clarify': ['.triage-gauge', '.triage-prompt', '.triage-card',
    '.route', '.route-label', '.route-hint',
    // When it was written (1.23.0). Reuses .sort-where's measured pair, so no
    // unmeasured colour ships — but it is registered rather than assumed,
    // because it is the quietest text on the surface and the first thing a
    // recolour would take below the floor.
    '#triage-where'],
  // WHERE it goes (1.19.0). A new surface joins this list in the SAME commit it
  // is built, or it ships unmeasured — hub LESSONS §28, which cost a release
  // elsewhere. The place picker carries a text field, so it is also the state
  // that exercises the contrast registry's input handling.
  'place picker': ['.triage-gauge', '.triage-prompt', '.triage-card',
    '.route', '.route-label', '.route-hint'],
  // WHERE IT CAN BE DONE (3.13.0). The place picker's shape on the other axis,
  // registered in the same commit that built it or it ships unmeasured.
  'context picker': ['.triage-gauge', '.triage-prompt', '.triage-card',
    '.route', '.route-label', '.route-hint'],
  // What a just-routed "Do now" offers. The timer is an offering, not a gate,
  // so this state exists before any stopwatch is running — and it carries the
  // Done the flow previously had no way to express at all.
  'do now offered': ['.donow', '.donow-label', '.donow-done'],
  // Work mode. The "why" lines and the behind-list are the lowest-contrast text
  // on these surfaces, so they are named rather than left to axe alone.
  // `#nextup-left` (V2 stage 5, "the one permitted number") WAS listed here and
  // the element is gone from the card (2.12.2, ADR-0103). Its cautionary value
  // is not — every note below citing it is about a registry entry matching
  // nothing, which is what it did before it was moved into this list, and that
  // lesson outlives the element.
  // `#nextup-fixed` (the next fixed thing today, collisions 7 and 9) is
  // DELIBERATELY not listed, and this note is here so nobody "fixes" that by
  // adding it — `#nextup-left` was put in the always-measured list on exactly
  // this reasoning and failed, because a selector that matches nothing is a
  // failure rather than a pass. It renders only when something IS fixed today,
  // and it carries `.nextup-count`, which is measured right here. An entry would
  // add the appearance of coverage rather than coverage.
  // `#nextup-written` (2.0.3) carries `.nextup-why` and would be measured by that
  // class alone — named anyway, because "it happens to match a selector already
  // in the list" is how a surface ends up unmeasured the moment its class
  // changes (hub LESSONS 28: a new surface joins this list in the SAME commit).
  // `#to-held` (2.0.8, ADR-0090) is registered HERE because this is the state
  // that reliably has it: it renders only when a section is live above the list
  // AND the list has rows, which is exactly what 'next up' stages. A registry
  // entry matching nothing visible is the false receipt `#nextup-left` cost a
  // release for, so it goes where it is actually on screen.
  // `#nextup-dated` (2.19.1) IS listed, and the note about `#nextup-fixed` two
  // paragraphs up is why the two differ rather than an argument against this.
  // That one renders only when something is fixed today, so an entry naming it
  // would match nothing on most runs — the false receipt `#nextup-left` cost a
  // release for. This one renders on EVERY ordinary offer, zero included, so it
  // always has content to measure. Named rather than left to `.nextup-count`,
  // for `#nextup-written`'s reason: "it happens to match a selector already in
  // the list" is how a surface goes unmeasured the moment its class changes.
  'next up': ['#nextup-heading', '.nextup-title', '.nextup-why', '#nextup-written', '.nextup-count',
    '#nextup-dated',
    '#nextup-done', '#nextup-skip', '#gauge',
    // `.card-done`, `#tree-open`, `#to-held` and `#to-top` used to ride here.
    // Under the hub (3.0.0) a state cannot span three places: the cards are in
    // the pile, the tree door is page navigation that lives on the hub, and the
    // two jumps were about a long scrolling page that no longer exists. Each is
    // measured where it actually is.

    // When you cannot start (1.24.0). The heavy control is on the card whenever
    // there is a head, so it belongs in this state. THE INVITATION IS NOW ONE
    // WORD (2.10.1): the field, its placeholder, its submit and its hint left
    // this state when the form stopped standing open, and moved to the state
    // below where somebody has asked for them. They were all four still listed
    // here and all four failed on the next run — which is the design working,
    // and the same false receipt `#nextup-left` cost a release for, caught this
    // time by the gate rather than by a reader.
    '#nextup-bite-open', '#nextup-heavy'],
  // The invitation has been ASKED FOR — a state that did not exist before 2.10.1,
  // registered in the same commit that created it (hub LESSONS §28). The field
  // stands open only from here, so this is the only state its colours are on
  // screen to be measured in.
  'first step asked for': ['#nextup-bite-input', { sel: '#nextup-bite-input', pseudo: '::placeholder' },
    '#nextup-bite-form button[type=submit]', '#nextup-bite-hint', '.nextup-title'],
  // A first step has been named. Its own state, because the invitation is
  // replaced by the step once one exists — two open invitations to name a first
  // step is a second decision on a surface built to hold one.
  'first step named': ['#nextup-bite', '#nextup-bite-done', '#nextup-done', '.nextup-title'],
  // `#coverage-count` is where the held total lives now. It came OFF the gauge —
  // an aggregate on the landing surface is a number that only rises — and into
  // the thing the gauge opens, where it answers a question the reader just
  // asked. New surface, registered in the same commit that created it.
  // The proof is registered with the inventory it now sits above (ADR-0084).
  // `.proof-broken` and `.proof-exceptions` are deliberately ABSENT: they render
  // only when the promise fails, and the walk's store is one the gate accepted,
  // so it cannot fail. A registry entry matching nothing visible is the false
  // receipt `#nextup-left` already cost a release for.
  //
  // `#gauge` LEFT this state in 2.0.5 (ADR-0088). The claim is a sheet now, and
  // the gauge is on the surface underneath — which a modal makes inert. Keeping
  // it here would have measured a control nobody can reach from this state,
  // which is the false receipt this file already pays for twice below. It is
  // still measured, in 'next up', where a reader can actually press it.
  // WHERE YOU ARE (2.2.0, ADR-0092). Its OWN driven state, because the chooser
  // and its standing line render only once a context exists and one is chosen —
  // registering them on 'next up' put three entries in a state whose store has
  // no context at all, and the gate correctly called all three false receipts.
  // `#where-notplace` and its line are only on screen while a place is chosen,
  // which is exactly this state — the walk selects one three lines below the
  // audit. Their own ids because a shared class is not coverage (2.34.0).
  'where you are': ['#where', '#where-note', '.card-where',
    '#where-notplace', '#where-notplace-hint'],
  // AND THE STATE BEFORE A CHOICE (2.37.0). `#where-hint` is on screen only
  // while the chooser sits at "anywhere" and nothing has been put down yet, so
  // it is never visible in 'where you are' above — where a place IS chosen.
  // Its own entry for the same reason 'the first place, asked for' has one: two
  // lines that are never on screen together cannot share a state, or one of
  // them always matches nothing and the gate correctly calls it a false receipt.
  'where you are, nothing chosen': ['#where', '#where-hint'],
  // ASK ONCE (2.28.0). Its own state, because it is only on screen BEFORE any
  // place exists and the chooser above is only on screen after — the two are
  // never visible together, so folding them into one entry would mean one of
  // the two selectors always matched nothing.
  'the first place, asked for': ['#where-first', 'label[for="where-first"]',
    { sel: '#where-first', pseudo: '::placeholder' }, '#where-first-set', '#where-first-hint'],
  // WHO IS HERE (2.26.0) — its own entry rather than a fold into the two
  // above, because a shared class is not coverage and the ids are what pin a
  // surface. `#with-row` is hidden until somebody has been named, so it is not
  // listed: a registry entry naming a hidden thing is a false receipt, which is
  // the finding 2.24.0 cost.
  'who is here': ['#with-who', 'label[for="with-who"]', '#with-note'],
  // HOW LONG YOU HAVE (2.19.0). Its own entry, and the note is in it: the
  // standing line only renders while the filter is ON, so an entry naming only
  // the chooser would report the surface measured while the one line that says
  // what is being hidden had never been looked at.
  'how long you have': ['#how-long', 'label[for="how-long"]', '#how-long-note'],
  // WHAT'S THE SITUATION (2.21.0). Its own entry rather than a fold into the
  // two above: those name the inputs, which MOVED into this sheet, and this
  // names the sheet's own chrome and the saved list. Keyed on IDs — the rows
  // borrow `.roles-row` and `.roles-held` from two other sheets, and a shared
  // class is not coverage.
  'the situation': ['#situation-open', '#sheet-situation-title', '#sheet-situation-close',
    '#situation-words', '#situation-save-label', '#situation-name', '#situation-save',
    '#situation-save-hint', '#situation-list .linklike', '#situation-list .roles-held'],
  // WHO IT IS FOR (2.6.0, ADR-0096). Its own driven state for the reason 'where
  // you are' has one: the door and the readout render only once a role exists,
  // so registering them on a state whose store has none would be three false
  // receipts — the failure `#nextup-left` already cost a release for.
  // WHO IS IN IT (3.16.0, ADR-0119). ITS OWN STATE, not folded into 'the
  // situation' above, for the reason that entry's own note gives: the row is
  // hidden until somebody has been named and the situation sheet is walked
  // before anybody has. Registering it there would be three false receipts.
  // The room's DOOR is measured here and not with the room, because opening the
  // room closes the sheet the door is on (ADR-0083 forbids stacked modals) — so
  // a registry entry for it on that state matches nothing visible, which is
  // exactly what the gate said the first time this was wired.
  'who is in it': ['#situation-who-label', '#situation-who .situation-who-one',
    '#situation-who-hint', '#situation-list .situation-room'],
  // THE ROOM (3.16.0, ADR-0119). The door is registered HERE rather than with
  // the situation sheet for the same reason: `.situation-room` renders only on
  // a saved situation that still names a live person.
  //
  // `#meeting-crosses-label` and `#meeting-lines-label` are deliberately ABSENT.
  // Both render only when the room's work sits under a horizon or carries a
  // role, and the thing driven into this room is a plain action with neither —
  // so naming them would be a receipt for something that is not on screen. What
  // that costs is written in ADR-0119 rather than left to be discovered.
  'in the room': ['#sheet-meeting-title',
    '#sheet-meeting-close', '#meeting-words', '#meeting-people .roles-name',
    '#meeting-people .roles-held', '#meeting-people .meeting-thing'],
  // EVERYTHING WORTH A LOOK (3.17.0, ADR-0120). The capped list is measured on
  // the 'review' state above; this is the same rows without the cap, and its own
  // chrome. The DOOR is `#review-count`, which is on the review surface, so it
  // is covered by that state's `.review-count` and not registered here — the
  // mistake 'in the room' made first time, when a door registered with the sheet
  // it opens matched nothing, because opening the sheet closed the surface the
  // door was on.
  'everything worth a look': ['#sheet-review-title', '#sheet-review-close',
    '#review-all-words', '#review-all .review-title', '#review-all .review-why'],
  'where the attention is': ['#roles-open'],
  // WHERE THE TIME ACTUALLY WENT joined this in 2.24.0, by ID. The two lists in
  // this sheet share `.roles-name` and `.roles-held`, and the note below is the
  // reason that is not enough: a shared class is not coverage. Without these
  // four ids the second readout would ride on the first one's classes and be
  // reported as measured while nothing had looked at its headings or its words.
  'roles open': ['#sheet-roles-title', '#sheet-roles-close', '#roles-words',
    '.roles-name', '.roles-held', '#roles-unnamed',
    '#roles-load-heading', '#roles-attention-heading', '#roles-attention-words',
    // The places readout (2.33.0). Its rows reuse `.roles-name`/`.roles-held`
    // above, but the heading and its line are their own ids — a shared class is
    // not coverage, which is the note four lines down.
    '#places-heading', '#places-words'],
  // WHAT YOU ARE WORKING TOWARD (2.18.0). Its own entry rather than a fold into
  // 'roles open': the two sheets share `.roles-name` and `.roles-held`, and a
  // shared class is not coverage — `surfaces.mjs` records the draft that counted
  // `.section` and reported all seventeen sections measured. The ids are what
  // pin this surface, and the two shared classes ride along so the rows are
  // measured where they actually render.
  'what you are working toward': ['#horizons-open'],
  'horizons open': ['#sheet-horizons-title', '#sheet-horizons-close',
    '#horizons-words', '#horizons-list .roles-name', '#horizons-list .roles-held'],
  // THE AMBIENT HORIZON on the focus surface (2.7.1, collisions entry 7). It
  // shares `.focus-held`'s measured pair — the class adds nothing but a second
  // element — but it gets its own registry line because it renders only when a
  // fixed thing is actually ahead today, which is a different state from the
  // interruption count beside it.
  'focus, with a fixed thing ahead': ['#focus-fixed'],
  // What is on this page (2.3.0, ADR-0093). Driven from a store with several
  // blocks live, because a contents list with one row measures the chrome and
  // nothing else — and the count line only renders for blocks that publish one,
  // so the state has to be one where at least one does.
  'contents open': ['#sheet-contents-title', '#sheet-contents-close',
    '.contents-group', '.contents-name', '.contents-count'],
  'coverage open': ['#sheet-coverage-title', '#sheet-coverage-close',
    '#coverage-count', '.coverage-title', '.coverage-when', '.coverage-open',
    '.proof-holds', '.proof-count', '.proof-reason'],
  // The tree, open (1.6.0, ADR-0013/item 39): rows are doors, depth is
  // indentation, and the branch remainder is a real button. Its own sheet since
  // 2.0.5, so `#tree-open` left for the same reason `#gauge` did.
  // `.tree-kind` IS REGISTERED SO THE GATE CAN SEE ITS BLOCK LANDED (3.6.0).
  // The word is `--ink-soft` inside a row whose own colour is `--ink`; if the
  // stylesheet block had never applied — a `replace()` that matched no anchor,
  // hub LESSONS 158 — the span would inherit `--ink` and every check in this
  // suite would still pass, because unstyled markup is exactly what contrast,
  // targets, landmarks and axe are all satisfied by. Naming it here is what
  // makes the difference between applied and not applied measurable at all.
  'tree open': ['#sheet-tree-title', '#sheet-tree-close', '.tree-open-row', '.tree-title',
    '.tree-kind'],
  // Composed Today's strip (1.6.0, ADR-0051): quiet doors above Next up.
  'composed strip': ['#composed-heading', '.composed-open', '#composed .detail-hint'],
  // The session close (1.6.0, ADR-0052): the words are the whole surface.
  'close strip': ['#close-heading', '#close-win', '#close-gauge', '#close-ok'],
  // Composed Today's opt-in Extra (1.6.0) — the comms opt-in's shape. The
  // status note is audited via the dialog pass once it carries words.
  'today opt-in': ['#today-start'],
  // Contexts on the detail sheet (2.2.0, ADR-0092) — the input, its Add, and the
  // list of places, each of which is the control that takes itself off.
  // The detail sheet. The hint and the inline labels are the lowest-contrast
  // text on it, and the number inputs are the smallest targets.
  // `#detail-more` (1.39.1) folds the rare two-thirds of the sheet away. Added to
  // THIS entry rather than a second 'detail sheet' key — a duplicate key in an
  // object literal silently wins, so the registry would have shrunk to one
  // selector while still reporting a pass.
  'detail sheet': ['#detail-more', '#detail-title', '.detail-state', '.detail-label', '.detail-inline',
    '#detail-context', { sel: '#detail-context', pseudo: '::placeholder' }, '#detail-context-set',
    '#detail-context-hint',
    // WHICH KIND OF WANT (2.23.0). Named rather than left to a class, for
    // `#detail-written`'s reason: "it happens to match a selector already in
    // the list" is how a control goes unmeasured the moment its markup changes.
    // Safe to name here because it renders on every non-trashed node's sheet,
    // unlike `#nextup-fixed` — the false-receipt trap this file already carries
    // a note about.
    '#detail-menu-category',
    // A FIRST STEP, FROM ANYWHERE (2.23.0). The offer card's own invitation is
    // registered in its own state; this is the second door, on the sheet, and
    // it renders on every non-trashed node so naming it is safe.
    '#detail-step-label', '#detail-step', '#detail-step-set', '#detail-step-hint',
    '.detail-hint', '#detail-name', '#detail-date', '#detail-every', '#detail-rename',
    '#detail-date-set', '#detail-close',
    // 1.3.0's verbs: the defer date, the estimate, and the picker's filter.
    '#detail-start', '#detail-start-set', '#detail-estimate', '#detail-estimate-set',
    '#detail-parent-filter', { sel: '#detail-parent-filter', pseudo: '::placeholder' },
    // `#detail-took` (V2 stage 5) is DELIBERATELY not listed on its own, and
    // this note is here so nobody "fixes" that by adding it. It renders only
    // when the item has been timed, so an entry would match nothing on this
    // state and the gate would fail exactly as it did when it was first put in
    // the always-measured list. It carries `.detail-hint`, which IS measured
    // above, so its colours are held by that selector — what an entry would add
    // is the appearance of coverage rather than coverage itself.
    // The dependency picker. A <select> and a number box are the two smallest
    // targets on the densest surface in the app.
    '#detail-feeds', '#detail-lead', '#detail-feeds-set',
    // Containment (law 4). `#detail-place` is the sheet's answer to "where does
    // this sit" and it is stated as ordinary `--ink`, not a quieter token —
    // structural facts are not asides.
    '#detail-parent', '#detail-parent-set', '#detail-make-project',
    '#detail-person', '#detail-relation', '#detail-person-set',
    // 1.4.0: the note editor and the history disclosure's summary line — the
    // textarea is the sheet's only multi-line input, no placeholder by design.
    '#detail-note', '#detail-note-set', '#detail-history summary',
    // 1.7.0: the fold verb's filter and button are always on a live sheet; the
    // SELECT is not here — with nothing else held it renders disabled, so it
    // is audited in 'detail sheet, folding', where legal targets exist.
    '#detail-merge-filter', { sel: '#detail-merge-filter', pseudo: '::placeholder' },
    '#detail-merge-set',
    // 1.8.0: the decline is offered on every live off-Menu work item.
    '#detail-decline'],
  // The fold, with somewhere to fold into (1.7.0, ADR-0053): the select is
  // live only when another legal target exists, so it gets its own state
  // rather than a selector the base sheet can only match disabled.
  'detail sheet, folding': ['#detail-merge-filter', '#detail-merge',
    '#detail-merge-set', '#detail-merge-hint'],
  // The way back, the moment after a fold: the ghost button and the promise
  // beside it are the whole surface a folded thing has left.
  'detail sheet, folded away': ['#detail-unmerge', '#detail-unmerge-group .detail-hint'],
  // The survivor's side: what folded into it, each with its own way back.
  'detail sheet, survivor': ['#detail-merged-group .detail-label',
    '#detail-merged-list .detail-feed', '#detail-merged-list button'],
  // The lens (1.7.0, ADR-0054): the row above the held list, and the law-1
  // line that renders ONLY while a lens is active — audited in that state.
  'lens row': ['.lens-row .detail-inline', '#lens', '#lens-note'],
  // Who cares how it goes (1.9.0, ADR-0057): a name and one ghost verb.
  'detail sheet, who cares': ['#detail-stakeholders-label',
    '#detail-stakeholder-list .detail-feed', '#detail-stakeholder-list button'],
  // THE DIRECTORY ROW (3.20.0, ADR-0122): the pointer's rendered words and its
  // take-back control, registered in the same commit that built them. The words
  // are the feature — a fact about where the rest of a thing sits — and the
  // negative assertion beside this state holds them to carrying no age.
  'detail sheet, who holds the rest': ['#detail-people-list .detail-feed',
    '#detail-people-list button'],
  // A person's own sheet (1.12.0): what is with them. The relation and the
  // duration are the quietest text, and both are FACTS — never a grade.
  // Scoped to the GROUP, not to one of its two lists: what someone owes you
  // and where else they come up render through identical bindings, and which
  // list is populated depends on the kind of thing they are linked to. A
  // registry entry that only matches one of them is a gate that passes or
  // fails on fixture shape rather than on contrast.
  'detail sheet, a person': ['#detail-person-count',
    '#detail-person-group .detail-feed', '#detail-person-group button', '.detail-when'],
  // A ROLE'S OWN SHEET (3.12.0, ADR-0115) — the person state's shape one axis
  // over, and registered in the same commit that built it, or it ships
  // unmeasured (hub LESSONS 28).
  'detail sheet, a line': ['#detail-line-count',
    '#detail-line-group .detail-feed', '#detail-line-group button', '.detail-when'],
  // The decision log (1.9.0): the day on a row is the quietest text here, and
  // it is a DAY — never a count, never a verdict.
  'detail sheet, decisions': ['#detail-decision', '#detail-decision-set',
    '#detail-decision-hint', '#detail-decision-count',
    '#detail-decision-list .detail-feed', '.detail-when'],
  // The journal (1.13.0, ADR-0061). Three states a person actually meets: no
  // passphrase yet, closed, and open. The warning is the quietest long text on
  // the surface and it is the one sentence ADR-0005 insists must be readable.
  'journal, no passphrase': ['#journal-state', '#journal-warning',
    '#journal-new', '#journal-set'],
  'journal, closed': ['#journal-state', '#journal-pass', '#journal-unlock'],
  'journal, open': ['#journal-state', '#journal-text', '#journal-write',
    '#journal-hint', '#journal-list li'],
  // The Not Now ledger, open (1.8.0, ADR-0056): the trash view's species —
  // the fact line is the quietest text and it is the row's whole content.
  'ledger open': ['#notnow-open', '#notnow-total', '#notnow-list .trash-row', '.trash-when'],
  // The diagnostic report, taken (1.18.0, §7f). Monospace at 0.8125rem is the
  // smallest type in the app, and it is text somebody reads carefully before
  // sending it to another person — so it is exactly the wrong place to trust
  // that a registered pair "probably" holds. The controls are audited with it.
  'diagnostic taken': ['#diagnostic-text', '#diagnostic-note',
    '#diagnostic-show', '#diagnostic-copy', '#diagnostic-save'],
  // The sheet once something IS declined: the standing words and the way back.
  'detail sheet, declined': ['#detail-declined-words', '#detail-carry'],
  // The sheet when a request slot is set: the park button names the real day.
  'detail sheet, slot offered': ['#detail-slot-park'],
  // Per-node history, open (1.4.0). The cure lines are the quietest text in
  // the whole app's story — --ink-soft, indented — and exactly the lines that
  // explain the app's own writes, so they must clear the gate, not hide.
  'detail sheet, history open': ['#detail-history summary',
    '#detail-history-lines .log-line', '#detail-history-lines .log-cure'],
  // The record itself, open behind (i) (1.4.0, ADR-0048). Day headings, the
  // stated total, and the plain-words lines.
  'log view': ['#log-open', '#log-total', '.log-day-title', '#log-days .log-line'],
  // The same sheet once something IS inside something. `#detail-place` renders
  // ONLY here, so it lives in its own registry entry rather than in the base
  // sheet — where it matched nothing and the gate said so, which is the check
  // working. It is stated as ordinary `--ink`, not a quieter token: a structural
  // fact is not an aside.
  // `.detail-place-open` IS LISTED SEPARATELY from `#detail-place` (3.6.0) and
  // the separation is the whole point. The line became a button, and the button
  // carries `--accent` while the paragraph around it carries `--ink-soft`. A
  // registry naming only the paragraph measures a colour that is no longer on
  // screen and reports it green — the same shape as the visual gate that read a
  // computed style off the wrong element (hub LESSONS 142).
  'detail sheet, inside something': ['#detail-place', '.detail-place-open', '#detail-title',
    '.detail-label', '#detail-parent', '#detail-parent-set', '#detail-close'],
  // Dates that have gone by. This surface must read as calm, so its contrast is
  // carried entirely by the ordinary text tokens — there is no alert colour to
  // check, and that absence is the point (law 3, ADR-0034).
  // Today on paper. The control lives in the panel; the card itself is never on
  // screen, so what is audited here is the button and the honesty line beside it.
  'today on paper': ['#today-print', '.about-section', '.about-p'],
  // The bother flow. The choice hints are the lowest-contrast text and they are
  // load-bearing: they say what each answer will DO, and a forced choice with
  // unlabelled consequences is a guess. All three choices are styled identically
  // on purpose — "not mine to carry" is not a lesser option and must not look
  // like one.
  'bother': ['#bother-prompt', '.bother-card', '.bother-choice',
    '.bother-choice-label', '.bother-choice-hint'],
  'bother entry': ['#sheet-bother-entry-title', '#sheet-bother-entry-close', '#bother-text',
    { sel: '#bother-text', pseudo: '::placeholder' },
    '#bother-form button[type=submit]', '.detail-hint'],
  // Load, not work (1.15.0, ADR-0065). The `bother entry` shape, audited the
  // same way: opened by the driver, because a collapsed control is still a
  // control. `#nextup-load` is in its OWN state below — it renders only while
  // something is on you, and registering it here would name a selector that
  // matches nothing visible, which this gate fails on by design.
  // How big this app is (2.8.0, ADR-0098) — its own state, driven in Settings.
  'app size': ['#ui-scale', '#ui-scale-set', '#ui-scale-note'],
  'load entry': ['#sheet-load-entry-title', '#sheet-load-entry-close',
    '#load-hint', '#capacity-level',
    '#pebble-text', { sel: '#pebble-text', pseudo: '::placeholder' },
    '#pebble-weight', '#pebble-form button[type=submit]', '.detail-label'],
  // The door's own state line (2.8.1, ADR-0099). Its OWN state, driven after a
  // weight is on, because it is `hidden` while there is nothing to report — an
  // entry here would name a selector matching nothing visible on an untouched
  // store, which this gate fails on by design and rightly.
  'load door state': ['#sheet-load-entry-count'],
  'load carried': ['#pebble-list li', '#pebble-list li button', '#nextup-load'],
  // The Menu (law 6). The money line is the lowest-contrast text and it is the
  // whole of what a save-for says. There is NO bar and no colour keyed to the
  // numbers anywhere on this surface, and that absence is the measurement.
  // `#menu-open` left in 2.0.7 for the reason `#gauge` left 'coverage open': the
  // Menu is a sheet now and its control is on the inert surface underneath.
  'menu open': ['#sheet-menu-title', '#sheet-menu-close', '.menu-cat', '.menu-item', '.menu-title'],
  // UPKEEP, and it took a coverage gate to notice it was missing. This section
  // has a heading and its own chips, and it had NO entry here at all — contrast
  // and accessible names were never checked on it, in either theme, for its
  // whole life. Nobody forgot to add it so much as nobody could: the sample's
  // one upkeep item was done 40 days into a 60-day rhythm, so it is comfortable
  // and the section is correctly hidden, and no fixture in any walk ever
  // reached the state. A surface no test can arrive at is a surface no test
  // measures. The fixture now carries a ready upkeep and this is audited last
  // in each theme, on the sample, where nothing downstream can be perturbed.
  'upkeep ready': ['#upkeep-heading', '.chip', '.chip-title', '.chip-why'],
  // Coming back (law 8). The reassurance is the CONTENT, so it gets full ink;
  // the counts beneath it are the lesser fact and sit in the quiet token. There
  // is nothing here keyed to how long you were away — no colour, no threshold —
  // because a lapse is not a severity.
  'reentry': ['#reentry-heading', '.reentry-words', '.reentry-waiting',
    '.reentry-amnesty-words', '#reentry-amnesty-go', '#reentry-dismiss'],
  // The comms sweep on the focus-exit ramp. Its line is an OFFER, stated in
  // `--ink` rather than a quieter token — it is the content of the surface, not
  // an aside — and there is no badge, no count and no colour anywhere on it.
  'comms ramp': ['#comms-heading', '.comms-words', '#comms-done', '#comms-later'],
  // Its opt-in, in the panel. Off until asked for.
  'comms opt-in': ['#comms-start', '.about-p', '.about-section'],
  // The track portfolio. The facts line is the lowest-contrast text and it is the
  // whole content of the row — who, when an answer is owed, what is outstanding.
  // There is no colour here that means "at risk" and there will not be one: a hue
  // aimed at someone else's work is this app grading them (B-01, law 5).
  'portfolio': ['#portfolio-heading', '.portfolio-count', '.portfolio-open',
    '.portfolio-title', '.portfolio-why'],
  // The sheet's controls for it, which only a container ever shows. `#detail-track`
  // is NOT here: once the thing is tracked it is replaced by `#detail-untrack`,
  // which is the control this state actually offers. The gate said so rather than
  // silently skipping a selector it could not find, which is the registry rule
  // working — the same way it did for `#detail-place` in 0.13.0.
  'detail sheet, carried': ['#detail-untrack', '#detail-suspense', '#detail-suspense-set',
    '.detail-inline', '#detail-close'],
  // The status report's controls, in the panel that talks about handing things
  // over. Four buttons and the line that confirms one worked.
  'report controls': ['#report-show', '#report-copy', '#report-markdown', '#report-csv', '#report-print',
    '.about-p', '.about-section'],
  // The person lens. How long something has been with someone is the
  // lowest-contrast text here and it is load-bearing — it is the fact you use to
  // decide whether to mention it. Same ink tokens as everything else: there is
  // no colour that means "they have had this a while", and there will not be.
  'people': ['#people-heading', '.people-count', '.people-open',
    '.people-title', '.people-why'],
  // THE OTHER DIRECTION (2.20.0). Its own entry, keyed on IDS, because the two
  // lists in this section share every class — and a shared class is not
  // coverage. `tools/surfaces.mjs` records the draft that counted `.section`
  // and reported all seventeen sections measured; this is the same mistake one
  // scale down, and the entry above would have made it silently.
  'people, the other direction': ['#people-promised-count',
    '#people-promised .people-title', '#people-promised .people-why'],
  // The sheet's write side. A free-text box with a datalist and a select are the
  // two smallest targets on it.
  'detail sheet, with someone': ['#detail-person',
    { sel: '#detail-person', pseudo: '::placeholder' },
    '#detail-relation', '#detail-person-set', '.detail-label', '.detail-hint'],
  // Focus. The elapsed line and the interrupt hint are the lowest-contrast text
  // here, and both are load-bearing: one says how long you have been at it, the
  // other says your way back is already saved. Nothing on this surface counts
  // down and nothing goes red — there is no alert token to measure, which is the
  // measurement (law 5, B-01).
  //
  // `.focus-elapsed` is NOT here, and the honest reason is that this gate cannot
  // reach it. The line renders only once a whole minute has passed — `focusWords`
  // returns null below that, because "0 minutes so far" is a number pretending to
  // be information — and a walk that sat for sixty seconds twice over would be
  // paying a minute of CI to measure a pair that IS measured: it is `--ink-soft`
  // on `--surface`, the same pair as `.review-count` and `.replan-count` directly
  // above. That is an ARGUMENT, not a measurement, and it is recorded as one in
  // ACCESSIBILITY.md B-13 — same treatment as `.replan-context`.
  'focus': ['#focus-heading', '.focus-title', '#focus-interrupt',
    { sel: '#focus-interrupt', pseudo: '::placeholder' },
    '#focus-interrupt-form button[type=submit]', '.detail-hint', '#focus-done', '#focus-stop'],
  // The same surface once something has been written down during it.
  'focus, interrupted': ['#focus-held', '.focus-title', '#focus-done', '#focus-stop'],
  // Stopping. The five words are optional, and the sheet has to say so without
  // making the empty answer look like a failure to answer.
  'focus sheet': ['#focus-sheet-title', '.detail-label', '#focus-cue',
    { sel: '#focus-cue', pseudo: '::placeholder' },
    '.detail-hint', '#focus-sheet-stop', '#focus-sheet-cancel'],
  // Review, exceptions only. Its rows are the app telling you something is
  // structurally wrong, so they must be as calm as everything else — same ink
  // tokens, no alert colour to check, and that absence is the point.
  'review': ['#review-heading', '.review-count', '.review-open',
    '.review-title', '.review-why'],
  'replan': ['#replan-heading', '.replan-count', '.replan-open',
    '.replan-card-title', '.replan-card-when',
    // The way past a card (V2 stage 3). A new control on an already-driven
    // state, so it joins the registry in the same commit that creates it —
    // hub LESSONS §28, which cost a release here once already.
    '.replan-skip'],
  // The sheet. The option hints are the lowest-contrast text in the app after
  // the route hints, and they are load-bearing: they say what each choice does.
  //
  // `.replan-context` is NOT here, and the honest reason is not the one the
  // first version gave. It claimed the omission "keeps this list honest"; in
  // fact that line renders only for a node with a `suspense` clock, and NO
  // surface in the app can write one yet — so it is unreachable in every gate,
  // and its contrast is simply UNMEASURED (audit). Its wording and its guards
  // are covered by unit tests in `test/replan.test.ts`; its rendered contrast is
  // not, and will not be until `suspense.set` has a surface. It uses the same
  // `--ink-soft`-on-`--surface` pair as `.replan-when` directly above it, which
  // IS measured here — an argument, not a measurement, and recorded as such.
  // ALL OF THEM AT ONCE (3.9.0, ADR-0012). Only up when more than one date has
  // gone by, so the walk has to make a second one — see the driving code, which
  // sets it through the app's own detail sheet rather than seeding the store.
  //
  // `.replan-bulk-go` carries no colour of its own: it joins `.replan-choice`'s
  // rule, and its hint joins `.replan-choice-hint`'s, so every pair here is one
  // the registry already measures. Listed anyway, because what is asserted is
  // the RENDERED pair on the element a reader actually meets, and "it shares a
  // rule" is a claim about the stylesheet rather than about the screen.
  'replan, all at once': ['.replan-bulk-words', '.replan-bulk-go',
    '.replan-bulk-label', '.replan-bulk-hint'],
  'replan sheet': ['#replan-sheet-title', '.replan-when',
    '#replan-sheet-ask', '.replan-choice', '.replan-choice-label', '.replan-choice-hint',
    '.replan-option-label', '.replan-option-hint', '#replan-new-date',
    '.replan-set', '#replan-close'],
  // The failure state, which no walk ever rendered. An error message is exactly
  // the text that gets forgotten, and it appears at the moment a person is
  // already stuck.
  'replan sheet, refused': ['#replan-sheet-error', '#replan-sheet-title', '.replan-when'],
  // A file has been chosen and described. This is the state that carries the
  // destructive control, so it is the one most worth measuring — and the note
  // above it is the sentence someone reads before replacing everything they
  // have.
  'import, file chosen': ['#import-note', '#import-union', '#import-backup', '#import-go', '#import-explainer'],
  // HOME (3.0.0, ADR-0108) — the screen every session now starts on, so it is
  // the one state that must never ship unmeasured. The doors are the only
  // controls; each carries a place name and, when its surface publishes one, a
  // sentence about what is behind it.
  'the hub': ['#hub-heading', '.hub-go', '.hub-name', '.hub-count'],
  // And the row that is present inside every job: the way back, and the way to
  // put a thought down without leaving the job to find the box.
  'inside a job': ['#stance-back', '#stance-capture'],
  // The other import: somebody else's planner, described. 2.36.0 split that
  // description into a lead and a list of facts, and the list is the part that
  // says what will NOT come across — the finished rows, the rhythms, the labels
  // that are not places. It is the last thing read before the button that acts.
  'another planner, file chosen': ['#other-note', '#other-facts li', '#other-go'],
};

const srgb = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/** Runs in the page. For each entry, sample EVERY visible match, resolving fg
 *  (optionally of a pseudo-element) against the nearest opaque ancestor bg. */
function sampler(entries) {
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  const bgOf = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.99) return c.rgb;
    }
    return null;
  };
  return entries.map((entry) => {
    const sel = typeof entry === 'string' ? entry : entry.sel;
    const pseudo = typeof entry === 'string' ? undefined : entry.pseudo;
    const els = [...document.querySelectorAll(sel)].filter((el) => el.getClientRects().length > 0);
    if (els.length === 0) return { sel, pseudo, missing: true };
    const samples = els.map((el) => {
      const cs = getComputedStyle(el, pseudo);
      const fg = parse(cs.color);
      return {
        fg: fg ? fg.rgb : null,
        bg: bgOf(el),
        size: parseFloat(cs.fontSize),
        weight: parseInt(cs.fontWeight, 10) || 400,
      };
    });
    return { sel, pseudo, missing: false, samples, count: els.length };
  });
}

/**
 * The same, for an audit — which measures without pressing anything, and so
 * would sit on the hub reporting that a job's selectors match nothing visible.
 *
 * The state's own registry entry names what it is about, so the first selector
 * that resolves is the one that says which job this state lives in. Nothing to
 * look up and nothing to keep in step.
 */
const ensureStanceForSelectors = async (pg, list) => {
  if (!list) return;
  const sels = list
    .map((e) => (typeof e === 'string' ? e : e?.sel))
    .filter((x) => typeof x === 'string');
  if (sels.length === 0) return;

  // ALREADY SOMEWHERE THAT HOLDS ONE OF THESE? THEN STAY.
  //
  // The first version looped and ensured for EVERY selector, which navigated
  // away mid-state and undid what the state had just driven. `place picker`
  // lists a bare `.route`, and `.route` exists in more than one section, so
  // `querySelector` answered with whichever came first in the document — the
  // walk left the sort surface, the picker it had just opened was gone, and the
  // failure surfaced three steps later as an input that would not appear.
  //
  // A state is where its controls are. If the job on screen already holds any of
  // them, that is the job, and nothing should move.
  const settled = await pg.evaluate((list2) => {
    const runway = document.querySelector('#runway');
    if (!runway || !runway.hasAttribute('data-hub')) return true;
    const here = runway.getAttribute('data-stance');
    if (!here) return false;
    // THE WHOLE JOB, not just its section — the same `belongs()` rule the app
    // paints by. A job's furniture can sit OUTSIDE its section: `#triage-undo`
    // is a child of <main>, so a state about the filed receipt found none of its
    // controls "inside" `#triage`, decided it was not settled, and walked off to
    // whichever section held the next selector. `.card-place` lives on cards, so
    // the walk left the sort surface and the receipt it was about to measure
    // went with it.
    const parts = [document.getElementById(here), ...document.querySelectorAll(
      `#runway main > [data-stance-part="${here}"], #runway main > [data-narrows*="#${here}"]`)];
    return parts.some((el) => el && list2.some((sel) => {
      try { return el.matches(sel) || !!el.querySelector(sel); } catch { return false; }
    }));
  }, sels);
  if (settled) return;

  // Otherwise the FIRST selector that names a job wins, and only that one.
  for (const sel of sels) {
    const moved = await ensureStanceFor(pg, sel);
    if (moved) return;
  }
};

/** The same, for a state's registry entry. */
const ensureStanceForState = (pg, registryKey) =>
  ensureStanceForSelectors(pg, REGISTRY[registryKey]);

/**
 * Turn one state's samples into role pairs.
 *
 * THE FLOOR IS RECORDED, NOT RE-DERIVED. Whether a pair needs 4.5:1 or 3:1 is
 * decided by rendered size and weight, and those are palette-independent — so
 * working it out once here is 830 computations instead of 830 per palette, and
 * it is the same answer every time.
 *
 * THE WORST SAMPLE IS THE ONE KEPT, matching what the assertion below does: a
 * selector can match many nodes at different sizes, and the pair that binds is
 * the one with the least headroom. Which sample that is depends on the palette,
 * so what is kept is every DISTINCT (fg, bg, floor) the selector produces —
 * arithmetic later picks the worst for each palette rather than this guessing on
 * its behalf.
 */
function record(stateName, rows) {
  for (const r of rows) {
    if (r.missing) {
      inventoryFail(`${stateName}: registry entry "${r.sel}${r.pseudo ?? ''}" matches nothing visible`);
      continue;
    }
    const seen = new Set();
    for (const smp of r.samples) {
      const key = (c) => (c ? c.join(',') : null);
      const fgRole = SENTINEL.get(key(smp.fg));
      const bgRole = SENTINEL.get(key(smp.bg));
      // A COLOUR THE TOKENS DO NOT OWN. It renders, it is opaque, and no role
      // produced it — so no palette can change it, and it would look wrong in
      // every palette but the one it was picked for. Invisible to the old gate,
      // which measured it like any other colour and passed it.
      if (!fgRole || !bgRole) {
        const why = UA_OWNED.get(r.sel);
        if (why) {
          // DECLARED, so it is recorded rather than refused — the arithmetic gate
          // is told this pair exists and that no palette reaches it, which is a
          // different and more useful thing than not being told at all.
          uaSeen.add(r.sel);
          const line = `${stateName}|${r.sel}|ua`;
          if (!recorded.has(line)) {
            recorded.add(line);
            inventory.push({ state: stateName, sel: r.sel, uaOwned: true, why });
          }
          continue;
        }
        if (!unowned.has(r.sel)) {
          unowned.set(r.sel, `${stateName}: fg ${key(smp.fg)}, bg ${key(smp.bg)}`);
          inventoryFail(
            `"${r.sel}${r.pseudo ?? ''}" renders a colour no role owns `
            + `(${stateName}: fg ${key(smp.fg)}, bg ${key(smp.bg)}). `
            + 'Give it a role, or declare it in .colour-ua-owned with a reason.');
        }
        continue;
      }
      const large = smp.size >= 24 || (smp.size >= 18.66 && smp.weight >= 600);
      const floor = large ? 3 : 4.5;
      const line = `${stateName}|${r.sel}${r.pseudo ?? ''}|${fgRole}|${bgRole}|${floor}`;
      if (seen.has(line) || recorded.has(line)) continue;
      seen.add(line); recorded.add(line);
      inventory.push({ state: stateName, sel: `${r.sel}${r.pseudo ?? ''}`, fg: fgRole, bg: bgRole, floor });
    }
  }
}

async function auditContrast(page, stateName, theme, registryKey = stateName) {
  await ensureStanceForState(page, registryKey);
  const rows = await page.evaluate(sampler, REGISTRY[registryKey]);
  // THE CHOKE POINT, which is why the inventory is collected here and not in a
  // driver of its own: every state in this walk reaches its registry through
  // this one call, so recording here reaches all of them and can never fall
  // behind the list.
  if (INVENTORY_MODE) { record(stateName, rows); return; }
  for (const r of rows) {
    const label = `${r.sel}${r.pseudo ?? ''}`;
    if (r.missing) { fail(`${theme}/${stateName}: registry entry "${label}" matches nothing visible — the gate no longer sees it`); continue; }
    let worst = null;
    let bad = false;
    for (const smp of r.samples) {
      if (!smp.fg || !smp.bg) { bad = true; fail(`${theme}/${stateName}: could not resolve colours for "${label}"`); break; }
      const large = smp.size >= 24 || (smp.size >= 18.66 && smp.weight >= 600);
      const need = large ? 3 : 4.5;
      const got = ratio(smp.fg, smp.bg);
      if (worst === null || got / need < worst.got / worst.need) worst = { got, need };
    }
    if (bad || worst === null) continue;
    (worst.got >= worst.need ? pass : fail)(
      `${theme.padEnd(5)} ${stateName.padEnd(22)} ${label.padEnd(32)} ${worst.got.toFixed(2)}:1 (needs ${worst.need}:1, ${r.count} node${r.count === 1 ? '' : 's'})`,
    );
  }
}

async function auditAxe(page, stateName, theme) {
  await ensureStanceForState(page, stateName);
  await page.addScriptTag({ path: AXE });
  const res = await page.evaluate(() =>
    axe.run(document, { resultTypes: ['violations', 'incomplete'] }));
  if (res.violations.length === 0) {
    const inc = res.incomplete.map((i) => i.id).join(', ');
    pass(`${theme}/${stateName}: axe — 0 violations${res.incomplete.length ? ` (incomplete: ${inc}; those pairs are held by the registry pass, not waved through)` : ''}`);
  } else {
    for (const v of res.violations) {
      fail(`${theme}/${stateName}: axe ${v.id} (${v.impact}) — ${v.help} — ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target?.join(' ')}`);
    }
  }
}

/**
 * WCAG 2.2 SC 2.5.3 (label in name), and Doctrine §4's no-two-controls rule.
 *
 * Hub LESSONS §29 is why this is not a substring test. Doctrine §7e asks for the
 * information surface to be a letter `i`, the obvious markup is
 * `<button aria-label="About …">i</button>`, and a substring check PASSES it
 * because `"about…".includes("i")` is true. It passes for a reason unrelated to
 * the criterion: 2.5.3 exists so somebody driving by voice can say what is
 * written on the button, and "i" is not a phrase anyone can say.
 *
 * So the rule here has two halves:
 *
 *  - **A single visible character plus an `aria-label` FAILS outright.** One
 *    character is a symbol wearing a letter's clothing. The honest markup is the
 *    one icons already use — mark the glyph `aria-hidden`, put a real sentence in
 *    a `.visually-hidden` span — and then there is no visible text for 2.5.3 to
 *    be about and voice control gets a phrase instead of a keystroke.
 *  - **Otherwise the visible words must appear in the accessible name**, which is
 *    the criterion as written.
 *
 * VISIBLE text excludes `aria-hidden` (not part of a name) and
 * `.visually-hidden` (in the name, not on the screen) — the criterion's own
 * exclusions. A control with no visible text is out of scope rather than passed:
 * 2.5.3 is about text a person can read aloud, and there is none.
 *
 * The second half is §4's: no two controls on one surface may answer to the same
 * ACCESSIBLE NAME, because "activate Place" with two answers is a coin toss for
 * anyone driving by voice or stepping a list. On the name, not the visible text —
 * two Hide buttons are fine when their names differ.
 */
async function auditNames(page, stateName, theme) {
  await ensureStanceForState(page, stateName);
  const found = await page.evaluate(() => {
    const norm = (s) => (s ?? '')
      .toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Text nodes joined with a SPACE. `textContent` concatenates across element
    // boundaries, so a card's title and its status ran together as
    // "a held thoughtnot sorted yet" — which then reported a duplicate under a
    // name no reader would recognise, and made every message wrong.
    const textOf = (el) => {
      const parts = [];
      const walk = (n) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3) parts.push(c.nodeValue);
          else if (c.nodeType === 1) walk(c);
        }
      };
      walk(el);
      return parts.join(' ');
    };
    const visibleTextOf = (el) => {
      // A <select> has no visible LABEL of its own — its contents are options,
      // and reading them as "the words on the control" produced the whole option
      // list as one string. 2.5.3 is about words rendered ON the control, so a
      // select is out of scope here rather than wrongly failed.
      if (el.tagName === 'SELECT') return '';
      const c = el.cloneNode(true);
      for (const n of c.querySelectorAll('[aria-hidden="true"], .visually-hidden')) n.remove();
      return norm(textOf(c));
    };
    const nameOf = (el) => {
      const lab = el.getAttribute('aria-label');
      if (lab) return norm(lab);
      const by = el.getAttribute('aria-labelledby');
      if (by) {
        return norm(by.split(/\s+/).map(id => document.getElementById(id)?.textContent ?? '').join(' '));
      }
      const c = el.cloneNode(true);
      for (const n of c.querySelectorAll('[aria-hidden="true"]')) n.remove();
      return norm(textOf(c));
    };

    const labelInName = [];
    const symbolWithLabel = [];
    const byName = new Map();

    for (const el of document.querySelectorAll('button, a[href], [role=button], input, select, textarea, summary')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (el.checkVisibility && !el.checkVisibility()) continue;

      const where = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : `.${String(el.className).split(' ')[0]}`}`;
      const name = nameOf(el);
      const visible = visibleTextOf(el);

      if (name) {
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name).push(where);
      }

      if (visible && el.hasAttribute('aria-label')) {
        if (/^[a-z0-9]$/.test(visible)) {
          symbolWithLabel.push(`${where} shows "${visible}" with aria-label "${el.getAttribute('aria-label')}"`);
        } else if (!name.includes(visible)) {
          labelInName.push(`${where} shows "${visible}" but is announced "${name}"`);
        }
      }
    }

    const dupes = [...byName.entries()]
      .filter(([, els]) => els.length > 1)
      .map(([n, els]) => `"${n}" answers for ${els.join(' and ')}`);

    return { labelInName, symbolWithLabel, dupes };
  });

  (found.symbolWithLabel.length === 0 ? pass : fail)(
    `${theme}/${stateName}: no control is a single character wearing an aria-label (LESSONS §29)`
    + (found.symbolWithLabel.length ? ` — ${found.symbolWithLabel.join('; ')}` : ''),
  );
  (found.labelInName.length === 0 ? pass : fail)(
    `${theme}/${stateName}: SC 2.5.3 — the visible words are in the spoken name`
    + (found.labelInName.length ? ` — ${found.labelInName.join('; ')}` : ''),
  );
  // §4's no-two-names rule is REPORTED, not gated — and the reason is the point.
  //
  // Most collisions this finds are two of the READER'S OWN items sharing a
  // title: a card in a list and the same card in search, or two errands both
  // called "the same errand twice". The app cannot make a person's titles
  // unique, and a real store holds 1,405 actions, so a gate on this would
  // go red on real data rather than on a defect. **A check that fails on the
  // user's content is not measuring the app.**
  //
  // It stays visible because the app-authored collisions are real and worth
  // seeing — `#about-dismiss`/`#about-close` both answering to "Close", the
  // three `Set` buttons in the detail sheet — and those were fixed on the run
  // that found them. Making it a gate needs a way to tell an app-authored name
  // from a content-derived one, which is a design question and not a regex.
  if (found.dupes.length) {
    console.log(`  note  ${theme}/${stateName}: names shared by more than one control (§4, not gated — see auditNames) — ${found.dupes.join('; ')}`);
  } else {
    pass(`${theme}/${stateName}: no two controls answer to one name (§4)`);
  }
}

/**
 * NO TWO CONTROLS SHARE PIXELS, AND NONE MERELY TOUCH (2.9.3).
 *
 * Reported from a device: "Bring a copy back" and "What's on this page" overlap.
 * Measured: 0.0px apart, at every viewport and every text size, and always. A
 * human found it because nothing here was looking — every check in this file
 * asked whether a control was big enough, never whether it was SEPARATE from the
 * next one.
 *
 * Two full-width controls with nothing between them read as one, and a finger on
 * the seam gets whichever is on top with no way to tell which was pressed. That
 * is worse than a target being small: a small target is a miss, and this is a
 * silent hit on the wrong thing — the same objection that removed the floating
 * Contents button.
 *
 * TOUCHING COUNTS, not only overlapping. The first version of this asked whether
 * the boxes intersected and reported "none" on the very defect it was written
 * for, because they did not intersect — they abutted. Asking the narrower
 * question and getting a green answer is how a check gets written and still
 * measures nothing.
 *
 * Only pairs that share a COLUMN: two controls side by side are a row and their
 * horizontal gap is a different question. Nesting is skipped — a button inside a
 * label legitimately shares space.
 */
async function auditSeparation(page, stateName, theme) {
  const found = await page.evaluate(() => {
    const vis = el => el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true });
    const name = el => el.id || (typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase());
    const between = (a, b) => {
      let n = a;
      while (n && !n.contains(b)) n = n.parentElement;
      if (!n) return 'no common parent';
      const cs = getComputedStyle(n);
      const g = cs.rowGap === 'normal' ? '0' : cs.rowGap;
      return `${name(n)} [${cs.display}, row-gap ${g}, margin-bottom ${cs.marginBottom}]`;
    };

    // EACH SCROLLER'S OWN CONTENT SPACE, and this is the whole correctness of it.
    //
    // Two earlier versions were both wrong, in opposite directions.
    //
    // Viewport coordinates alone reported that the capture box overlapped a
    // people row by 237px — it does not and never has; that is a control scrolled
    // up out of the runway, still reporting where its box WOULD be. A gate that
    // fires on correct work teaches everybody to route around the red.
    //
    // Clipping each box to what is visible fixed that and introduced something
    // worse: anything below the fold was never compared at all. Planted with the
    // exact defect that was reported from a device, the gate went GREEN — the two
    // buttons sit past the bottom of the runway in every state the walk drives.
    //
    // So elements are grouped by their nearest scrolling ancestor and compared in
    // that scroller's content coordinates. Nothing is skipped for being scrolled
    // away, and two things in different scrollers are never compared, because
    // they cannot share pixels however either one is scrolled.
    const scrollerOf = (el) => {
      for (let n = el.parentElement; n; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (/auto|scroll/.test(cs.overflowY)) return n;
      }
      return document.documentElement;
    };

    const groups = new Map();
    for (const el of document.querySelectorAll('button, input, select, textarea, summary, a[href], [role=button]')) {
      if (!vis(el) || el.closest('dialog')) continue;
      const sc = scrollerOf(el);
      const scr = sc.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const box = {
        top: r.top - scr.top + sc.scrollTop,
        bottom: r.bottom - scr.top + sc.scrollTop,
        left: r.left - scr.left + sc.scrollLeft,
        right: r.right - scr.left + sc.scrollLeft,
      };
      if (box.bottom - box.top < 1 || box.right - box.left < 1) continue;
      if (!groups.has(sc)) groups.set(sc, []);
      groups.get(sc).push({ el, box });
    }

    const out = new Set();
    for (const items of groups.values()) {
      for (let i = 0; i < items.length; i += 1) {
        for (let j = i + 1; j < items.length; j += 1) {
          const a = items[i].el, b = items[j].el;
          if (a.contains(b) || b.contains(a)) continue;
          const ra = items[i].box, rb = items[j].box;
          const dx = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const dy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (dx <= 1) continue;
          if (dy > 1) { out.add(`${name(a)} × ${name(b)} overlap by ${Math.round(dx)}×${Math.round(dy)}px`); continue; }
          const gap = ra.top < rb.top ? rb.top - ra.bottom : ra.top - rb.bottom;
          if (gap >= -1 && gap < 3) out.add(`${name(a)} / ${name(b)} are ${gap.toFixed(1)}px apart, inside ${between(a, b)}`);
        }
      }
    }
    return [...out];
  });
  (found.length === 0 ? pass : fail)(
    `${theme}/${stateName}: no two controls overlap or touch`
    + `${found.length ? ` — ${found.slice(0, 6).join('; ')}` : ''}`);
}

/**
 * OPEN A SURFACE THE WAY A READER DOES (2.8.1, ADR-0099).
 *
 * Three entries came off the runway and are reached from Contents now. This
 * walk could open their dialogs with one line of `showModal()` and every audit
 * below would pass — measuring a surface while proving nothing whatever about
 * whether anybody can reach it.
 *
 * That is not a hypothetical. Hub LESSONS §95 is a skip link this app shipped
 * for 142 releases, correct in every particular and reachable by nobody, with
 * contrast and targets and axe green throughout. A driver that opens a dialog
 * directly is the same mistake wearing a test's clothes.
 *
 * So the walk takes the reader's route: press Contents, find the row, press it.
 * A door that stops working fails here, on the release that breaks it.
 *
 * AND IT SAYS WHY IT COULD NOT. Planted by stripping `data-contents-door` from
 * the markup, the first version of this simply timed out after thirty seconds
 * on a click — non-zero, correctly, and pointing at nothing. A gate that fails
 * without naming its cause sends somebody to read the sheet it was opening
 * rather than the marker that went missing; this file has already paid for that
 * once, in a see-through check that named two real surfaces for the wrong
 * reason.
 */
async function openViaContents(page, id) {
  await page.evaluate(() => {
    for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
  });
  await page.click('#contents-open');
  await page.waitForSelector('#sheet-contents[open]');
  const row = `#contents-doors .contents-go[data-open="${id}"]`;
  if (await page.locator(row).count() === 0) {
    fail(`#${id} has no row in Contents — it is on the page and nobody can reach it`);
    throw new Error(`no Contents row for #${id}`);
  }
  await page.click(row);
  await page.waitForSelector(`#${id}[open]`, { timeout: 4000 }).catch(() => {
    fail(`#${id}'s row in Contents does not open it`);
    throw new Error(`#${id} did not open`);
  });
}

/** Separation and size together, at every state the walk already drives.
 *  ONE call site, deliberately: a second list of states to keep in step is the
 *  defect this file has paid for three times (doors, element types, surfaces). */
/* PHOTOGRAPH IT WHILE YOU ARE HERE.
 *
 * This walk drives every route in, through and out of the app — 93 audited
 * states across both themes — and until now it has never once produced a
 * picture of any of them. It measured contrast ratios and target rectangles at
 * each stop and reported green, correctly, through seven releases of defects
 * that were obvious on sight: the task drawn as a form field, six verbs as six
 * boxes, a proof line cut mid-sentence, a screen showing one task that was too
 * busy to begin in. Not one of those is a ratio or a rectangle.
 *
 * The traversal was never the missing part. It is here, it is proven, and it
 * is the only code that knows how to reach a route like "load door, stuck
 * update strip, dark, at 200%". So the shot is taken from inside the audit
 * rather than from a second walk that would have to learn all of it again and
 * would drift the day a route changed.
 *
 *   LOOK=1 npm run a11y            (writes every state to /tmp/quietkeep-look)
 *   LOOK=/some/dir npm run a11y
 *
 * Off by default: it is a few hundred files and CI has no eyes. This asserts
 * nothing and cannot fail the gate — a picture is for a person to look at, and
 * an exit code would only invite somebody to satisfy it instead of looking. */
const LOOK = process.env.LOOK ? (process.env.LOOK === '1' ? '/tmp/quietkeep-look' : process.env.LOOK) : null;
if (LOOK) mkdirSync(LOOK, { recursive: true });
let shotSeq = 0;
const shotNames = new Set();

async function photograph(page, stateName, theme) {
  if (!LOOK) return;
  const slug = `${String(++shotSeq).padStart(3, '0')}-${theme}-${stateName}`
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
  shotNames.add(slug);
  try {
    await page.screenshot({ path: join(LOOK, `${slug}.png`) });
  } catch (err) {
    // A picture failing is never a reason to fail the walk that was measuring.
    console.log(`  ..    (could not photograph ${theme}/${stateName}: ${err.message})`);
  }
}

async function auditSeparationAndTargets(page, stateName, theme) {
  await ensureStanceForState(page, stateName);
  await auditSeparation(page, stateName, theme);
  await auditTargets(page, stateName, theme);
  await photograph(page, stateName, theme);
}

async function auditTargets(page, stateName, theme) {
  const small = await page.evaluate(() => {
    const out = [];
    // DERIVED, NOT HAND-LISTED (2.8.0). This read
    // `'button, input, a, [role=button]'` — which omits `select` and `summary`,
    // both of which this app uses as real controls. So a 19px `<select>` in the
    // load entry and a 21px `<summary>` on its door were invisible to the floor
    // by construction, and every run reported green about them. A hand-written
    // list of element TYPES is the same defect as a hand-written list of
    // surfaces, one level down — and this file already learned that twice.
    for (const el of document.querySelectorAll(
      'button, input, select, textarea, summary, a[href], [role=button], [tabindex]:not([tabindex="-1"])')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      // Height carries B-06's 44px floor; width gets WCAG 2.2 2.5.8's 24px —
      // a 20px-wide sliver passed the first gate (audit).
      if (r.height < 44 || r.width < 24) {
        out.push(`${el.tagName.toLowerCase()}#${el.id || el.className} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return out;
  });
  (small.length === 0 ? pass : fail)(
    `${theme}/${stateName}: targets ≥44px tall, ≥24px wide${small.length ? ` — ${small.join(', ')}` : ''}`,
  );

  // AND A CEILING (1.24.1). A FLOOR WITH NO CEILING IS HALF A MEASUREMENT.
  //
  // `.detail-row input[type=date] { flex: 1 1 10rem }` is a sensible minimum
  // WIDTH while the row is a row. Below 26rem the row becomes a column, and
  // flex-basis sizes the MAIN axis — so it became a minimum HEIGHT, and "Give
  // it a date" rendered as a ~160px empty box on every phone. It shipped for
  // releases and every a11y pass was green, because a target that is far too
  // big is still comfortably bigger than 44px.
  //
  // THE BOUND IS THREE TIMES THE FLOOR, IN THE READER'S OWN REM.
  //
  // Every target in this app is sized from `--target` (2.75rem = the 44px
  // floor). Nothing here is legitimately more than three of those tall, and a
  // control that is has been stretched by a layout rule rather than designed.
  // Expressed in rem so it scales with the reader's text setting exactly as
  // `--target` does, and therefore holds at 320px/200% as well as at default.
  //
  // THE FIRST VERSION OF THIS CHECK USED A QUARTER OF THE VIEWPORT AND DID NOT
  // CATCH THE DEFECT IT WAS WRITTEN FOR. The date box was 10rem — 160px against
  // a 211px quarter-screen — so the plant passed and the gate would have shipped
  // looking like protection. Found by planting it, which is the only reason a
  // number like this can be trusted at all.
  const huge = await page.evaluate(() => {
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const cap = root * 2.75 * 3;
    const out = [];
    // FIELDS ONLY — never buttons. An <input> or a <select> is a single line by
    // construction: no content it can hold makes one three targets tall, so any
    // that is has been stretched by layout. A BUTTON is content-sized, and this
    // app has real ones that wrap to two and three lines — the place picker's
    // routes carry a label over a hint and measure 143px legitimately. Including
    // buttons made this gate fire on correct work on its first run, which is the
    // one thing a gate in this repo may not do: it teaches everybody to route
    // around the red.
    for (const el of document.querySelectorAll('input:not([type=checkbox]):not([type=radio]), select')) {
      const r = el.getBoundingClientRect();
      if (r.height === 0) continue;
      if (r.height > cap) {
        out.push(`${el.tagName.toLowerCase()}#${el.id || el.className} ${Math.round(r.width)}x${Math.round(r.height)} (cap ${Math.round(cap)})`);
      }
    }
    return out;
  });
  (huge.length === 0 ? pass : fail)(
    `${theme}/${stateName}: no control is taller than 3× the 44px target floor${huge.length ? ` — ${huge.join(', ')}` : ''}`,
  );
}

/** Tab to each control the way a keyboard user does — programmatic focus does
 *  NOT set :focus-visible on buttons, so the first version observed no ring and
 *  passed a build with `outline:none` (audit). Real Tabbing sets the keyboard
 *  modality, so what we measure is what a keyboard user is actually shown. */
/** Every focusable control this state actually presents, as `#id` selectors.
 *
 *  WHY THIS EXISTS. `auditFocusRings` took a hand-written list, so a state was
 *  covered only if somebody remembered to write one — and 18 of the 112 audited
 *  states had no ring pass at all. Not a judgement that their rings did not
 *  matter; nobody had decided anything. The list was the gap.
 *
 *  Scoped to the topmost open dialog when there is one, because that is the
 *  surface the reader is on and everything behind it is inert. Ids only: this
 *  walk matches `activeElement` against selectors, and a positional selector
 *  would silently match the wrong control the moment anything reorders. A
 *  control with no id is REPORTED rather than skipped quietly. */
const controlsInState = (page) => page.evaluate(() => {
  const root = document.querySelector('dialog[open]') ?? document;
  const FOCUSABLE = 'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
  const out = [], anonymous = [];
  for (const el of root.querySelectorAll(FOCUSABLE)) {
    if (el.disabled || el.closest('[hidden]') || el.getAttribute('aria-hidden') === 'true') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (getComputedStyle(el).visibility === 'hidden') continue;
    if (el.id) { out.push('#' + CSS.escape(el.id)); continue; }
    // NO ID IS NOT NO SELECTOR. Ids-only left 32 real controls unchecked —
    // `.donow-done`, `.hub-go`, `.replan-choice` and others that simply never
    // needed one. A class selector may match several instances, and that is
    // fine here: the ring comes from ONE CSS rule, so tabbing to any instance
    // measures the rule. What it must not do is match nothing, which is why the
    // class is taken from the element itself rather than guessed.
    const cls = (el.className || '').toString().trim().split(/\s+/).filter(Boolean)[0];
    if (cls) out.push(el.tagName.toLowerCase() + '.' + CSS.escape(cls));
    else anonymous.push(el.tagName.toLowerCase() + ' (no id, no class)');
  }
  return { ids: [...new Set(out)], anonymous: [...new Set(anonymous)] };
});

async function auditFocusRings(page, stateName, theme, selectors) {
  // DERIVED WHEN NOT GIVEN. See `controlsInState`.
  if (!selectors) {
    const found = await controlsInState(page);
    if (found.ids.length === 0) {
      fail(`${theme}/${stateName}: no focusable control found, so the ring pass measured nothing`);
      return;
    }
    if (found.anonymous.length > 0) {
      pass(`${theme}/${stateName}: ${found.anonymous.length} control(s) carry neither id nor class and cannot be addressed (${found.anonymous.slice(0, 3).join(', ')})`);
    }
    selectors = found.ids;
  }
  // THROUGH THE SAME GUARD AS EVERY OTHER AUDIT. This looped and ensured for
  // each selector in turn, with no check for already being somewhere that holds
  // them — so a list containing one control that also exists in another job
  // navigated away mid-state and undid what the state had driven. Fixed once in
  // `ensureStanceForState` and left broken here, which is the whole argument for
  // one helper rather than two call sites doing the same thing by hand.
  await ensureStanceForSelectors(page, selectors);
  const remaining = new Set(selectors);
  // Start from a clean slate, then walk forward with Tab. The budget is a
  // reachability proxy, sized to the DENSEST surface: the detail sheet's
  // suspense control sat at stop ~40 once 1.4.0's note editor landed ahead of
  // it, and the walk declaring it unreachable at 40 was the budget lying, not
  // the sheet failing. 60 covers today's worst case with headroom; a control
  // genuinely beyond that is a real finding.
  // `blur()` alone does NOT reset the sequential-focus starting point in
  // Chromium: the next Tab resumes from wherever focus last was, so the walk
  // had to WRAP the whole surface to reach anything behind it. That made the
  // budget a function of where the previous audit happened to leave focus —
  // and 1.18.0's four new controls pushed two states over it, reporting
  // "#journal-write is not keyboard-focusable" about a button that plainly is.
  //
  // Focusing the open dialog itself puts the starting point at the top of that
  // surface, so the walk is deterministic and bounded by the surface's own
  // size rather than by audit order.
  await page.evaluate(() => {
    document.activeElement?.blur?.();
    const dlg = document.querySelector('dialog[open]');
    if (dlg) { dlg.setAttribute('tabindex', '-1'); dlg.focus(); }
  });
  // RAISED FROM 60 TO 90 IN 1.24.1, and this is the third time this number has
  // had to move — so what it is gets said plainly. It is not a limit on the
  // app. It is how far this walk is willing to Tab before it gives up, and the
  // right size is "past the densest surface, with room".
  //
  // 1.24.0 put three more controls on the work surface — the first-step field,
  // its submit and "This one is heavy" — ahead of the tree. That tipped
  // `#tree-open` over 60, and the walk reported it as "not keyboard-focusable"
  // about a button that plainly is. The tell was that LIGHT failed and DARK
  // passed in the same run: one tab order, two verdicts, which is a budget at
  // its edge and never a broken control.
  const TAB_BUDGET = 90;
  for (let i = 0; i < TAB_BUDGET && remaining.size > 0; i++) {
    await page.keyboard.press('Tab');
    const hit = await page.evaluate((sels) => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const match = sels.find((s) => el.matches(s));
      if (!match) return null;
      const cs = getComputedStyle(el);
      const w = parseFloat(cs.outlineWidth) || 0;
      const off = parseFloat(cs.outlineOffset) || 0;
      const parseC = (str) => {
        const m = str.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(',').map(Number);
        return (p[3] ?? 1) > 0.99 ? [p[0], p[1], p[2]] : null;
      };
      const bgOf = (node) => {
        for (let n = node; n; n = n.parentElement) {
          const c = parseC(getComputedStyle(n).backgroundColor);
          if (c) return c;
        }
        return null;
      };
      // DO THE RING'S PIXELS REACH THE SCREEN? Everything above this reads
      // COMPUTED STYLE, where `outline-width` is 3px whether or not a single
      // one of those pixels is painted — which is exactly how the app shipped
      // 142 releases with the capture box's ring cut flush on all four sides.
      //
      // A scroll container clips. `overflow-y: auto` forces the used value of
      // `overflow-x` to `auto` as well, so the frame clipped horizontally as a
      // side effect of a vertical cap, and the runway clipped horizontally on
      // purpose — between them that is nearly every control in the app, each
      // losing 5px of a 3px outline at 2px offset wherever it touched the
      // column's edge. Green on every contrast, target and axe check throughout.
      //
      // So: build the ring's own rect and ask every clipping ancestor whether
      // it contains it. Reported per axis because the two fail for different
      // reasons — sideways is always a clip box drawn too tight, and downward
      // is usually a scroller that has aligned the element flush with its edge
      // and wants `scroll-padding`.
      const box = el.getBoundingClientRect();
      const ring = { l: box.left - off - w, t: box.top - off - w,
                     r: box.right + off + w, b: box.bottom + off + w };
      const clip = [];
      for (let n = el.parentElement; n; n = n.parentElement) {
        const c = getComputedStyle(n);
        // STOP AT AN OPEN DIALOG. It renders in the TOP LAYER, so nothing
        // outside it clips it however the DOM is nested — and every dialog in
        // this app sits inside the runway, whose box is smaller and elsewhere.
        // Walking past it reported three controls as 57px, 88px and 179px
        // outside a scroller that was not clipping them at all. Test the dialog
        // itself, which does clip its own contents, then stop.
        const top = n.tagName === 'DIALOG' && n.hasAttribute('open');
        if (c.overflowX === 'visible' && c.overflowY === 'visible') { if (top) break; continue; }
        const q = n.getBoundingClientRect();
        const name = n.tagName.toLowerCase() + (n.id ? '#' + n.id : '')
          + (n.classList[0] ? '.' + n.classList[0] : '');
        // Half a pixel of slack throughout: sub-pixel layout, not a clipped ring.
        //
        // THREE OUTCOMES PER AXIS, and telling them apart is the whole
        // difference between a gate and a noise generator. The first run of
        // this check reported 62px, 93px and 184px alongside the real 5px
        // findings, in the same words — and a control that does not FIT in its
        // scroller has part of itself off screen by arithmetic, which is not a
        // defect and is certainly not a clipped ring.
        //
        //   the control is bigger than the box     — nothing to report
        //   the control fits but is not in view    — a different defect, said
        //                                            in different words
        //   the control is in view, its ring is not — the one this is for
        for (const ax of ['x', 'y']) {
          const [lo, hi] = ax === 'x' ? ['left', 'right'] : ['top', 'bottom'];
          const [rlo, rhi] = ax === 'x' ? ['l', 'r'] : ['t', 'b'];
          if (box[hi] - box[lo] > q[hi] - q[lo] + 0.5) continue;
          const word = ax === 'x' ? 'horizontally' : 'vertically';
          const self = Math.max(q[lo] - box[lo], box[hi] - q[hi]);
          if (self > 0.5) {
            clip.push(`the control ITSELF is ${Math.round(self)}px outside ${name} ${word} — not a ring cut`);
            continue;
          }
          const out = Math.max(q[lo] - ring[rlo], ring[rhi] - q[hi]);
          if (out > 0.5) clip.push(`${Math.round(out)}px ${word} by ${name}`);
        }
        if (top) break;
      }
      return {
        match,
        visible: cs.outlineStyle,
        width: parseFloat(cs.outlineWidth),
        colour: parseC(cs.outlineColor),
        bg: bgOf(el.parentElement ?? el),
        focusVisible: el.matches(':focus-visible'),
        clip,
      };
    }, [...remaining]);
    if (!hit) continue;
    remaining.delete(hit.match);
    const srgb2 = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const lum2 = ([r, g, b]) => 0.2126 * srgb2(r) + 0.7152 * srgb2(g) + 0.0722 * srgb2(b);
    const rat = (a, b) => { const [x, y] = [lum2(a), lum2(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    const contrast = hit.colour && hit.bg ? rat(hit.colour, hit.bg) : 0;
    const ok = hit.visible !== 'none' && hit.width >= 2 && contrast >= 3;
    (ok ? pass : fail)(
      `${theme.padEnd(5)} ${stateName.padEnd(22)} focus ring ${hit.match.padEnd(20)} ${hit.visible} ${hit.width}px @ ${contrast.toFixed(2)}:1 (needs solid ≥2px ≥3:1)`,
    );
    ((hit.clip ?? []).length === 0 ? pass : fail)(
      `${theme.padEnd(5)} ${stateName.padEnd(22)} ring reaches the screen ${hit.match.padEnd(20)}`
      + ((hit.clip ?? []).length ? ` — CLIPPED ${hit.clip.join(', ')}` : ''),
    );
  }
  for (const sel of remaining) {
    // The message names the BUDGET, not a verdict on the control. Twice now
    // this line has sent somebody to inspect a button that was perfectly
    // focusable and simply sat past the walk's patience.
    fail(`${theme}/${stateName}: "${sel}" not reached within ${TAB_BUDGET} tab stops — either it is not keyboard-focusable, or the surface has grown past the budget`);
  }
}

const { server, url } = await serve(join(ROOT, 'public'));
const browser = await chromium.launch(launchOpts);

try {
  for (const theme of ['light', 'dark']) {
    console.log(`\n=== ${theme} theme ===`);
    const ctx = await browser.newContext({
      timezoneId: 'America/Denver',
      locale: 'en-US',
      colorScheme: theme,
      reducedMotion: 'reduce',   // B-05: everything must hold with motion off
      viewport: { width: 390, height: 844 },
      // This gate injects axe as a script, which the app's own strict CSP
      // (script-src 'self') correctly refuses — the CSP working is proven by
      // smoke.mjs, which runs UNDER the policy and fails on any violation.
      // Accessibility (contrast, rings, structure) is unaffected by CSP, so this
      // context bypasses it to let the instrument run. Division of labour:
      // smoke owns the CSP; a11y owns accessibility.
      bypassCSP: true,
    });
    const page = await ctx.newPage();
  page.setDefaultTimeout(12000);
  // FAIL FAST (3.0.1). Playwright's default is thirty seconds and this walk has
  // a dozen places that can hit one, so a FAILING run spent minutes doing
  // nothing while a passing run never waits at all — nothing healthy here takes
  // twelve seconds. Cuts a red run to a third of its length and leaves a green
  // one untouched. Explicit timeouts still win where one is stated.
    await page.addInitScript({ content: REACH_SRC });
    // THE SENTINEL PALETTE, if this is an extraction. An init script rather than
    // a one-off, because the walk reloads and navigates and a palette that came
    // off half way through would produce an inventory that looked complete.
    // A style ELEMENT on :root rather than inline properties: the dark blocks set
    // the same tokens under `[data-theme]`, and an author rule of equal
    // specificity later in the cascade beats them without needing `!important`
    // anywhere near the product's own stylesheet.
    if (INVENTORY_MODE) {
      await page.addInitScript({ content:
        `document.addEventListener('DOMContentLoaded', () => {
           const el = document.createElement('style');
           el.textContent = ':root, :root[data-theme="dark"], :root[data-theme="light"] { ${sentinelCss} }';
           document.head.append(el);
         }, { once: true });` });
    }

    // GO TO THE JOB BEFORE PRESSING SOMETHING IN IT (3.0.0, ADR-0108).
    //
    // The landing view is the hub, and a section is on screen only while it is
    // the stance — so roughly twenty-five states in this file drive a control
    // that is no longer visible when they reach it. The alternative to this was
    // twenty-five hand-placed calls, each needing its own four-minute run to
    // verify, and a twenty-sixth state added later with nobody remembering.
    //
    // DERIVED FROM THE SELECTOR ITSELF, so it cannot go stale: resolve what is
    // about to be pressed, walk up to its `section[data-stance-name]`, and enter
    // that one if it is not already the stance. A control in the frame, in a
    // dialog, or on the hub resolves to no section and nothing happens.
    //
    // This is not the walk faking a state. It is the walk taking the route a
    // finger takes, which is the whole standard this file is held to — a walk
    // that revealed a section any other way would be measuring a screen no
    // person can arrive at.
    const rawClick = page.click.bind(page);
    page.click = async (selector, ...rest) => {
      if (typeof selector === 'string') await ensureStanceFor(page, selector);
      return rawClick(selector, ...rest);
    };
    const rawTap = page.tap.bind(page);
    page.tap = async (selector, ...rest) => {
      if (typeof selector === 'string') await ensureStanceFor(page, selector);
      return rawTap(selector, ...rest);
    };
    // Every verb that touches a control, not only the two that press one — the
    // first version wrapped click and tap alone and the walk fell over on
    // `fill`, which is the same problem wearing a different name.
    // Waiting for something inside a job implies being in that job. Without
    // this, `waitForSelector('#triage-open:not([hidden])')` times out on a
    // control that is present and merely off-screen — and the call site swallows
    // the timeout, so the NEXT wait hangs with nothing saying why.
    const rawWait = page.waitForSelector.bind(page);
    RAW_WAIT.set(page, rawWait);
    page.waitForSelector = async (selector, ...rest) => {
      if (typeof selector !== 'string') return rawWait(selector, ...rest);
      await ensureStanceFor(page, selector);
      try {
        return await rawWait(selector, ...rest);
      } catch (err) {
        // One retry: a job becomes live only once the write has folded, so the
        // decision can be taken a beat too early. See the same note in smoke.
        await ensureStanceFor(page, selector);
        return rawWait(selector, ...rest).catch(() => { throw err; });
      }
    };
    for (const verb of ['fill', 'focus', 'selectOption', 'hover', 'check', 'uncheck']) {
      const raw = page[verb].bind(page);
      page[verb] = async (selector, ...rest) => {
        if (typeof selector === 'string') await ensureStanceFor(page, selector);
        return raw(selector, ...rest);
      };
    }

    await page.goto(url, { waitUntil: 'load' });
    await page.waitForSelector('body[data-ready=true]');

    // Fill-and-verify for the search box. A plain fill has been observed (here
    // and in smoke, at more than one site) to resolve without the value
    // landing when a commit-triggered refresh is in flight — rarely, and only
    // on loaded runners. Verifying keeps the check honest: a lost fill
    // retries; a genuinely broken search still fails, with the observed value.
    const fillSearch = async (text) => {
      for (let tries = 0; ; tries++) {
        // The mechanism, finally caught: filling while a modal dialog is open
        // (or still closing) resolves without the value landing — the fill's
        // focus step cannot reach an element the dialog has made inert, so
        // the inserted text goes to whatever holds focus. Wait the modal out.
        await page.waitForFunction(() => !document.querySelector('dialog[open]'),
          null, { timeout: 5000 }).catch(() => {});
        await page.fill('#search-input', text);
        const landed = await page.waitForFunction(
          (t) => document.querySelector('#search-input')?.value === t, text,
          { timeout: 2000 },
        ).then(() => true).catch(() => false);
        if (landed) return;
        if (tries >= 2) {
          fail(`${theme}: the search fill "${text}" would not land after ${tries + 1} tries`);
          return;
        }
      }
    };

    // The update line is hidden until a newer version exists, so it is revealed for
    // the audit — a control somebody only meets on an update day is still a control,
    // and leaving it out would exempt exactly the surfaces people meet under strain.
    await page.evaluate(() => {
      const u = document.querySelector('#update');
      const w = document.querySelector('#update-words');
      if (u && w) { w.textContent = 'A newer version is ready.'; u.hidden = false; }
    });

    // State 0: the walkthrough, which is the FIRST surface a new person meets —
    // before the (i) panel, which is now gated behind it.
    await page.waitForSelector('#tour[open]');
    await auditContrast(page, 'walkthrough', theme);
    await auditAxe(page, 'walkthrough', theme);
    await auditNames(page, 'walkthrough', theme);
    await auditSeparationAndTargets(page, 'walkthrough', theme);
    await auditFocusRings(page, 'walkthrough', theme);
    // Step to the end. The last step's "Get started" hands off to the (i) panel
    // for the storage step, which is exactly what State 1 audits.
    // Driven to the END rather than clicked a fixed number of times. Four clicks
    // silently meant "there are four steps", so adding two real ones timed the
    // whole gate out instead of auditing a longer walkthrough. A step count is
    // content; "Get started" is the guarantee.
    // ON `data-last`, NOT ON THE WORDING (3.9.1). This watched for the literal
    // "Get started" and the comment above defended that as the guarantee — then
    // the button was renamed and this timed out for twelve seconds a step. Which
    // step is last is a fact about the walkthrough; what the button says is copy,
    // and copy is meant to be rewritable without stopping a gate.
    for (let guard = 0; guard < 20; guard++) {
      const last = await page.locator('#tour-next[data-last="yes"]').count() > 0;
      await page.click('#tour-next');
      if (last) break;
    }

    // State 1: THE FOUR DESTINATIONS, each walked as its own screen (1.40.0).
    //
    // These were folding groups inside one dialog and the gate audited them as
    // one state. That measured whatever the first open group happened to show
    // and reported the other three as covered — the same false receipt shape as
    // a registry entry matching nothing. Four screens, four states, driven.
    //
    // The walkthrough's last step hands off to Your data, because that is where
    // the storage question is answered, so this starts where a new person lands.
    await openSurface(page, 'sheet-group-data');
    await page.waitForSelector('#storage-body dt');
    await auditContrast(page, 'your data', theme);
    await auditAxe(page, 'your data', theme);
    await auditNames(page, 'your data', theme);
    await auditSeparationAndTargets(page, 'your data', theme);
    await auditFocusRings(page, 'your data', theme,
      ['#export', '#storage-ask', '#notnow-open', '#sheet-group-data-close']);

    // Help is nine closed disclosures. Opened first: a `<details>` nobody has
    // pressed matches nothing visible, so auditing it shut would measure the
    // summaries and silently exempt every answer under them.
    await openSurface(page, 'sheet-group-help');
    await page.evaluate(() =>
      document.querySelectorAll('#sheet-group-help details').forEach((d) => { d.open = true; }));
    await auditContrast(page, 'help', theme);
    await auditAxe(page, 'help', theme);
    await auditNames(page, 'help', theme);
    await auditSeparationAndTargets(page, 'help', theme);
    await auditFocusRings(page, 'help', theme, ['.help-q summary', '#sheet-group-help-close']);

    await openSurface(page, 'sheet-group-why');
    await auditContrast(page, 'how it works', theme);
    await auditAxe(page, 'how it works', theme);
    await auditNames(page, 'how it works', theme);
    await auditSeparationAndTargets(page, 'how it works', theme);
    await auditFocusRings(page, 'how it works', theme, ['#sheet-group-why-close']);

    await openSurface(page, 'sheet-group-actions');
    await auditContrast(page, 'things you can do', theme);
    await auditAxe(page, 'things you can do', theme);
    await auditNames(page, 'things you can do', theme);
    await auditSeparationAndTargets(page, 'things you can do', theme);
    await auditFocusRings(page, 'things you can do', theme,
      ['#calendar', '#today-print', '#sample', '#sheet-group-actions-close']);

    await openSurface(page, 'sheet-group-extras');
    await auditContrast(page, 'settings', theme);
    await auditAxe(page, 'settings', theme);
    await auditNames(page, 'settings', theme);
    await auditSeparationAndTargets(page, 'settings', theme);
    await auditFocusRings(page, 'settings', theme,
      ['#badge-toggle', '#day-boundary-set', '#sheet-group-extras-close']);


    // HOW BIG THIS APP IS (2.8.0, ADR-0098), driven end to end rather than
    // asserted as markup: choosing a size must CHANGE the document, pressing Set
    // must keep it, and the note must state the scope — this app, this device —
    // because scope is the entire request.
    await auditContrast(page, 'app size', theme);
    await auditSeparationAndTargets(page, 'app size', theme);
    await auditFocusRings(page, 'app size', theme);
    const before = await page.evaluate(() => document.documentElement.style.fontSize);
    await page.selectOption('#ui-scale', '1.3');
    await page.waitForTimeout(120);
    const previewed = await page.evaluate(() => document.documentElement.style.fontSize);
    (previewed !== before && /%$/.test(previewed) ? pass : fail)(
      `${theme}/app size: choosing a size shows it immediately, before committing ("${previewed}")`);
    // RELATIVE, never absolute — an absolute px root would overrule the reader's
    // own device setting, which is the opposite of what was asked for.
    (!/px/.test(previewed) ? pass : fail)(
      `${theme}/app size: it multiplies the reader's own base rather than replacing it`);
    await page.click('#ui-scale-set');
    await page.waitForTimeout(120);
    const note = await page.evaluate(() =>
      document.querySelector('#ui-scale-note')?.textContent ?? '');
    (/this app/i.test(note) && /this device/i.test(note) ? pass : fail)(
      `${theme}/app size: the note states the scope ("${note.slice(0, 60)}")`);
    (!/\d/.test(note) ? pass : fail)(
      `${theme}/app size: it says no figure at the reader`);
    // AND THE FLOOR HOLDS AT THE SIZE IT JUST SET. This is the assertion the
    // whole release turns on: a size control that can take a target under 44px
    // is a control that breaks the app for a finger.
    const shortAfter = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('button, input, select, summary, a[href]')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.height < 44) out.push(`${el.tagName.toLowerCase()}#${el.id} ${Math.round(r.height)}px`);
      }
      return out;
    });
    (shortAfter.length === 0 ? pass : fail)(
      `${theme}/app size: every target still clears 44px at the chosen size`
      + `${shortAfter.length ? ` — ${shortAfter.slice(0, 4).join(', ')}` : ''}`);
    // Put it back, so every state after this is measured at the ordinary size.
    await page.selectOption('#ui-scale', '1');
    await page.click('#ui-scale-set');
    await page.waitForTimeout(120);

    // The clearing confirmation is revealed by choosing a mode, so it is opened
    // here: a control that only exists after a click is still a control somebody
    // reads, and leaving it out of the audit would exempt the typed-word box —
    // the one surface in the app standing between a person and their history.
    // It lives under Your data since 1.40.0 — clearing your data is a thing you
    // do TO your data, not a preference.

    // And the ⓘ itself, which keeps what the app IS — the intro, the release
    // notes, the diagnostic and the way to the calendar.
    //
    // WAIT FOR THE PAINT, DO NOT RACE IT. `show()` hides `#about-intro`
    // synchronously and `paintStorage` un-hides it a tick later, when the
    // browser has answered about persistence. This audit used to run
    // immediately after the panel opened, so the gap was small enough never to
    // lose; the four sheets now walked before it changed nothing about the race
    // and everything about which side of it a loaded runner lands on. It passed
    // locally and failed in CI on all three intro entries — a timing-dependent
    // failure, which is a defect that has told you its reproduction rate
    // (LESSONS §71), so the condition is waited for rather than the run retried.
    //
    // Not a weakened check: if the intro genuinely never shows, the wait times
    // out and the three registry entries fail exactly as they did here.
    // COLOURS (3.5.1), AND IT SITS HERE RATHER THAN BESIDE SETTINGS FOR A
    // REASON THAT COST A RUN. Everything between the settings audit above and
    // this point drives controls INSIDE the settings sheet — the text size is
    // chosen, set, and put back — and none of it reopens that sheet, because it
    // is a continuation. `openSurface` closes every open dialog first (ADR-0083:
    // one surface at a time), so a colours audit placed next to its sibling in
    // the panel shut Settings under the states that were still using it, and
    // three registry entries reported "matches nothing visible" about controls
    // that were simply on a screen no longer open.
    //
    // Five pictures, five radios stretched over them, and a
    // name apiece. The targets are the reason this surface needs driving rather
    // than trusting: the radios were 13x13 natives when they first shipped —
    // under the floor in every state that showed them — and the fix was to make
    // the INPUT the size of the tile, which only a measurement can confirm.
    await openSurface(page, 'sheet-group-colour');
    await auditContrast(page, 'colours', theme);
    await auditAxe(page, 'colours', theme);
    await auditNames(page, 'colours', theme);
    await auditSeparationAndTargets(page, 'colours', theme);
    await auditFocusRings(page, 'colours', theme,
      // The tiles ARE the control now — there is no confirm button to focus.
      ['#sheet-group-colour-close']);

    await openSurface(page, 'about');
    await page.waitForFunction(
      () => document.querySelector('#about-intro')?.checkVisibility() === true,
      null, { timeout: 5000 },
    ).catch(() => { /* the audits below say what happened */ });
    await auditContrast(page, 'first-run dialog', theme);
    await auditAxe(page, 'first-run dialog', theme);
    await auditNames(page, 'first-run dialog', theme);
    await auditSeparationAndTargets(page, 'first-run dialog', theme);
    await auditFocusRings(page, 'first-run dialog', theme);
    await page.click('#about-close');

    // State 2: the empty store.
    await auditContrast(page, 'empty store', theme);
    await auditAxe(page, 'empty store', theme);
    await auditNames(page, 'empty store', theme);
    await auditSeparationAndTargets(page, 'empty store', theme);
    await auditFocusRings(page, 'empty store', theme,
      ['#capture', '#capture-form button[type=submit]',
        'button.info', '.skip', '#restore-go']);

    // AND NOTHING IS INVENTED TO DO OVER AN EMPTY PLANNER (2.10.3). Found by
    // photographing the clearing-out sheet on a store with nothing in it: it
    // said "This clears 0 things — everything you are keeping here, people,
    // weights and private entries included", warned that no copy had been
    // saved, made "Save a copy first" the loudest control on the panel, and
    // asked for the word `clear` to be typed out in full — to authorise doing
    // nothing. `purgeSummary` one line above had always said "There is nothing
    // here to clear."; the confirmation under it had never been told.
    //
    // A chore invented out of nothing is the thing this app is least allowed to
    // do — the same defect 2.9.4 fixed on the diagnostic report, on the other
    // surface nobody had ever looked at. Asserted HERE because this is the walk's
    // only genuinely empty store; the seeded confirmation is audited later.
    await openSurface(page, 'sheet-group-data');
    await page.click('#purge-pick-clear');
    await page.waitForTimeout(400);
    const overNothing = await page.evaluate(() => ({
      held: document.querySelector('#purge-summary')?.textContent ?? '',
      ceremony: !document.querySelector('#purge-confirm').hidden,
      words: document.querySelector('#purge-consequence')?.textContent ?? '',
      backupLeads: !document.querySelector('#purge-backup').classList.contains('ghost'),
    }));
    // NON-VACUOUS FIRST: all three below are trivially true of a store that is
    // not empty, so the emptiness is asserted before anything rests on it.
    (/nothing here to clear/.test(overNothing.held) ? pass : fail)(
      `${theme}/empty store: the store really is empty here ("${overNothing.held.slice(0, 40)}")`);
    (!overNothing.ceremony ? pass : fail)(
      `${theme}/empty store: clearing nothing stages no typed-word ceremony`);
    (/does nothing/.test(overNothing.words) ? pass : fail)(
      `${theme}/empty store: and it says so plainly ("${overNothing.words.slice(0, 52)}")`);
    (!overNothing.backupLeads ? pass : fail)(
      `${theme}/empty store: no backup chore leads over an empty planner`);
    // Left as it was found: everything after this reads the surface underneath,
    // and a modal sheet makes it inert. NO CANCEL TO PRESS — `#purge-cancel`
    // lives inside the confirmation block, which is exactly what is withheld
    // here, so reaching for it timed out on the first run. A cleanup written
    // against the old behaviour is the same drift the state itself was about.
    await page.evaluate(() => {
      for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
    });
    await page.waitForTimeout(200);

    // State 2m: MORE — the destination list (1.39.0). Its own driven state
    // because it is a modal that nothing else is on screen with, and because
    // it is the first navigation this app has ever had.
    //
    // Driven through `openSurface` rather than `page.click('#open-more')`. The
    // click was observed here, in this walk only, resolving without the dialog
    // opening — nothing overlapped it, nothing was inert, no page error, and a
    // programmatic `.click()` on the same element in the same state opened it.
    // The cause was never found; what IS known is that this walk has been
    // through fifteen dialogs by the time it arrives, and every other state is
    // driven the same way. An intermittent failure is a defect that has told you
    // its reproduction rate, so it is written down rather than retried.
    await openSurface(page, 'more');
    await auditContrast(page, 'more', theme);
    await auditAxe(page, 'more', theme);
    await auditNames(page, 'more', theme);
    await auditSeparationAndTargets(page, 'more', theme);
    await auditFocusRings(page, 'more', theme, ['.more-go', '#more-close']);
    await page.click('#more-close');

    // State 2r: ROOM FOR MANY LINES (1.38.0). Driven with the room actually
    // OPEN, because that is when the textarea exists to be measured at all and
    // when `#capture` is hidden — measuring the collapsed form would report a
    // field nobody has met and miss the one they typed a meeting into.
    //
    // `#capture-room` is deliberately NOT in the registry list for this state:
    // it hides itself once there is more than one line, because collapsing back
    // would join them. A registry entry matching nothing visible is the false
    // receipt `#nextup-left` already cost a release for.
    await page.click('#capture-room');
    await page.fill('#capture-many', 'ring the school\nbins out\nbook the car in');
    await auditContrast(page, 'more room', theme);
    await auditAxe(page, 'more room', theme);
    await auditNames(page, 'more room', theme);
    await auditSeparationAndTargets(page, 'more room', theme);
    await auditFocusRings(page, 'more room', theme,
      ['#capture-many', '#capture-form button[type=submit]']);
    await page.fill('#capture-many', '');
    await page.click('#capture-room');

    // State 2u: the update strip's SECOND state — the one shown when the swap
    // does not take (1.20.2). The state above audits the strip's ordinary words;
    // this is a different paragraph, four times longer, with #update-reload
    // REMOVED because pressing it again cannot help. A state the gate never
    // opens is a state nothing measures (LESSONS §28), and this one shipped
    // unmeasured — it is reached only on the update day, on a device that
    // refuses the swap, which is the least likely surface to be looked at and
    // the worst one to get wrong.
    //
    // Driven exactly as mountUpdatePrompt drives it, so the gate reads the DOM
    // the reader gets rather than a mock of it.
    await page.evaluate((words) => {
      document.querySelector('#update-words').textContent = words;
      document.querySelector('#update').dataset.state = 'stuck';
    }, UPDATE_STUCK_WORDS);
    // AND PROVE THE STATE ACTUALLY TOOK. The two lines above used to re-enact
    // `mountUpdatePrompt`'s effects by hand, and the day the real code grew a
    // second effect this walk went on photographing a state the reader never
    // gets — with every assertion below it green, because they were all true of
    // the half-driven state. Setting one token the app also sets removes the
    // copy; checking the token did something removes the assumption.
    const stuckTook = await page.evaluate(() => {
      const reload = document.querySelector('#update-reload');
      const save = document.querySelector('#update-save');
      return {
        reloadGone: !reload.checkVisibility({ contentVisibilityAuto: true }),
        saveQuiet: getComputedStyle(save).backgroundColor === 'rgba(0, 0, 0, 0)',
      };
    });
    (stuckTook.reloadGone && stuckTook.saveQuiet ? pass : fail)(
      `${theme}/update stuck: the state took — the reload is gone and nothing on the card leads`
      + (stuckTook.reloadGone && stuckTook.saveQuiet ? ''
        : ` (reload gone: ${stuckTook.reloadGone}, save quiet: ${stuckTook.saveQuiet})`));
    await auditContrast(page, 'update stuck', theme);
    await auditAxe(page, 'update stuck', theme);
    await auditNames(page, 'update stuck', theme);
    await auditSeparationAndTargets(page, 'update stuck', theme);
    await auditFocusRings(page, 'update stuck', theme);
    // Put the strip back so every later state sees what it saw before.
    await page.evaluate(() => {
      document.querySelector('#update-words').textContent = 'A newer version is ready.';
      document.querySelector('#update-reload').hidden = false;
    });

    // State 3: with a card on the surface.
    await page.fill('#capture', 'a held thought');
    await page.click('#capture-form button[type=submit]');

    // State 3-i: the door, measured BEFORE it is pressed — the state a person is
    // in the instant after putting something down (1.39.2).
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).catch(() => {});

    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});

    // THE INVENTORY ARRIVES FOLDED (2.12.0, ADR-0102), and that state is audited
    // before it is opened — `<summary>` is a real control a finger has to reach,
    // and a disclosure nobody measured is how the walkthrough's own buttons came
    // to be breaking mid-word for every release but the first.
    //
    // NON-VACUITY FIRST: everything below is trivially true of a fold that was
    // never closed, and "the list is not on screen" is also what a broken render
    // looks like. So the summary is asserted to be naming groups.
    const folded = await page.evaluate(() => {
      const f = document.querySelector('#held-fold');
      const sum = document.querySelector('#held-fold-summary');
      return {
        closed: Boolean(f) && !f.open,
        words: (sum?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        cardShowing: Boolean(document.querySelector('#cards .card')
          ?.checkVisibility({ contentVisibilityAuto: true })),
      };
    });
    (folded.closed && !folded.cardShowing ? pass : fail)(
      `${theme}/inventory folded: the landing surface arrives without the list on it`);
    (/Not sorted yet|Ready now|Coming up|Later|On the Menu|Done/.test(folded.words) ? pass : fail)(
      `${theme}/inventory folded: and it names what is in there ("${folded.words.slice(0, 58)}")`);
    (!/\d/.test(folded.words) ? pass : fail)(
      `${theme}/inventory folded: and counts nothing — ADR-0032 has no tally, the gauge holds the totals`);

    await auditContrast(page, 'inventory folded', theme);
    await auditAxe(page, 'inventory folded', theme);
    await auditNames(page, 'inventory folded', theme);
    await auditSeparationAndTargets(page, 'inventory folded', theme);
    await auditFocusRings(page, 'inventory folded', theme, ['#held-fold-summary']);
    // HOME (3.0.0, ADR-0108) — the screen every session starts on, audited here
    // because the store now holds work and the hub therefore exists.
    //
    // ITS REGISTRY ENTRY WENT IN WITHOUT THIS AND DID NOTHING. A planted
    // contrast failure on `.hub-count` was caught by axe and NOT by the registry
    // pass, which is how the omission surfaced: a surface can be declared in
    // REGISTRY and never audited, and from every angle except a plant that reads
    // exactly like coverage. The same shape `spine --parity` exists for one
    // level up.
    await leaveStance(page);
    await page.waitForSelector('#hub-doors .hub-go');
    await auditContrast(page, 'the hub', theme);
    await auditAxe(page, 'the hub', theme);
    await auditNames(page, 'the hub', theme);
    await auditSeparationAndTargets(page, 'the hub', theme);
    await auditFocusRings(page, 'the hub', theme, ['#hub-doors .hub-go']);

    // And the row that rides inside every job: the way back, and the way to put
    // a thought down without leaving the job to find the box.
    await enterStance(page, 'held');
    await auditContrast(page, 'inside a job', theme);
    await auditNames(page, 'inside a job', theme);
    await auditSeparationAndTargets(page, 'inside a job', theme);
    await auditFocusRings(page, 'inside a job', theme, ['#stance-back', '#stance-capture']);
    await leaveStance(page);

    // Opened the way a finger opens it, not by setting the attribute — a fold
    // only script can open is not the route anybody takes.
    await page.click('#held-fold-summary');
    await page.waitForSelector('.card');
    await auditContrast(page, 'with cards', theme);
    await auditAxe(page, 'with cards', theme);
    await auditNames(page, 'with cards', theme);
    await auditSeparationAndTargets(page, 'with cards', theme);
    await auditCardContainment(page, 'with cards', theme);
    // Only .card-open exists here: an unrouted capture belongs to triage and is
    // deliberately given no Done control. The tick-off button is audited in the
    // 'next up' state below, once the item has been routed and can be completed.
    await auditFocusRings(page, 'with cards', theme, ['#cards .card-open']);

    // State 3a: search. Type a word; the held card is found. The input is always
    // present (audited in 'empty store'); the results are their own state, and a
    // result is a real button with a focus ring like every other row.
    await fillSearch('held');
    await page.waitForSelector('#search-results .search-open');
    await auditContrast(page, 'search results', theme);
    await auditAxe(page, 'search results', theme);
    await auditNames(page, 'search results', theme);
    await auditSeparationAndTargets(page, 'search results', theme);
    await auditFocusRings(page, 'search results', theme, ['#search-input', '#search-results .search-open']);
    await fillSearch('');          // leave the box as we found it
    await page.waitForSelector('#search-results .search-open', { state: 'detached' });

    // State 3b: the triage surface.
    //
    // A PILE HAS TO BE MADE FOR IT NOW (1.39.3). The hot/cold sweep leads only
    // when there are enough items to be worth sweeping — one capture goes
    // straight to clarify — so this walk captures a handful first, or it would
    // measure the clarify state twice and call one of them the heat pass.
    for (const t of ['sweep one', 'sweep two', 'sweep three']) {
      await page.fill('#capture', t);
      await page.click('#capture-form button[type=submit]');
      await page.waitForTimeout(60);
    }
    // ENTERING THE JOB OPENS IT (3.0.0, ADR-0108), so the old line that also
    // clicked `#triage-open` here fired a SECOND open on a surface already
    // opened — and `refresh('ask')` resets to the first question, so the flow
    // three states later found a place picker that had been thrown away. The
    // hub's door is the only open now.
    await enterStance(page, 'triage');
    await page.waitForSelector('#triage:not([hidden]) .route');
    await auditContrast(page, 'heat pass', theme);
    await auditAxe(page, 'heat pass', theme);
    await auditNames(page, 'heat pass', theme);
    await auditSeparationAndTargets(page, 'heat pass', theme);
    await auditFocusRings(page, 'heat pass', theme, ['#triage-actions .route']);

    // Drain the sweep — every item hot — which is what ends it and hands the
    // surface to clarify. The sweep does not abandon you partway (1.39.3), so
    // this runs until the prompt actually changes rather than a fixed count.
    for (let i = 0; i < 12; i++) {
      const heat = await page.evaluate(() =>
        document.querySelector('#triage-prompt')?.textContent?.startsWith('Hot') === true);
      if (!heat) break;
      await page.click('#triage-actions .route');
      await page.waitForTimeout(60);
    }
    await page.waitForSelector('#triage-actions .route .route-hint');
    // WHEN IT WAS WRITTEN (1.23.0) fills in AFTER the card, from the log, on
    // purpose — so the walk waits for it rather than measuring an element that
    // is correctly still hidden. A registry entry matching nothing visible
    // fails by design, and that failure would be the gate reporting a race
    // rather than a defect (hub LESSONS §61: a check whose steps assume the
    // page holds still).
    await page.waitForSelector('#triage-where:not([hidden])');
    await auditContrast(page, 'clarify', theme);
    await auditAxe(page, 'clarify', theme);
    await auditNames(page, 'clarify', theme);
    await auditSeparationAndTargets(page, 'clarify', theme);
    await auditFocusRings(page, 'clarify', theme, ['#triage-actions .route']);

    // State 3b-ii: WHERE does it go. Reached BY NAME; Back returns, so the walk
    // leaves the surface as it found it.
    //
    // This used to click "the last route in the row", which was true until
    // 1.25.0 put "Not this one" after it — deliberately, since every answer
    // should come before the way out. The walk then passed over the card and
    // waited thirty seconds for a picker it had never opened. Position is not
    // identity: a control's place in a row is a layout decision and will move
    // again.
    await enterStance(page, 'triage');
    await page.locator('#triage-actions .route[data-route="put-under"]').first().click();
    await page.waitForSelector('#triage-place-new');
    await auditContrast(page, 'place picker', theme);
    await auditAxe(page, 'place picker', theme);
    await auditNames(page, 'place picker', theme);
    await auditSeparationAndTargets(page, 'place picker', theme);
    await auditFocusRings(page, 'place picker', theme, ['#triage-actions .route']);

    // State 3b-ii-b: WHERE IT CAN BE DONE (3.13.0). Reached from the card the
    // way a reader reaches it — `data-route`, never the label, because both
    // walks have been timed out by a rename before (LESSONS 180). Back out to
    // the card afterwards so this section leaves the surface as it found it.
    await page.locator('#triage-actions .route.ghost', { hasText: 'Back' }).first().click();
    await page.waitForSelector('#triage-actions .route[data-route="add-context"]');
    await page.locator('#triage-actions .route[data-route="add-context"]').first().click();
    await page.waitForSelector('#triage-context-new');
    await auditContrast(page, 'context picker', theme);
    await auditAxe(page, 'context picker', theme);
    await auditNames(page, 'context picker', theme);
    await auditSeparationAndTargets(page, 'context picker', theme);
    await auditFocusRings(page, 'context picker', theme, ['#triage-actions .route']);
    await page.locator('#triage-actions .route.ghost', { hasText: 'Back' }).first().click();
    await page.waitForSelector('#triage-actions .route[data-route="put-under"]');
    await page.locator('#triage-actions .route[data-route="put-under"]').first().click();
    await page.waitForSelector('#triage-place-new');

    // State 3b-iii: the filed receipt, carrying the question and its answer
    // (V2 stage 3). File into a NEW place — which is the branch that always has
    // no return date — audit the bar, then Undo, which puts the card back and
    // leaves the surface as this section found it.
    await page.fill('#triage-place-new', 'A place for a11y');
    await enterStance(page, 'triage');
    await page.locator('#triage-actions .route', { hasText: 'Make it' }).first().click();
    await page.waitForSelector('.triage-place-when');
    await auditContrast(page, 'filed receipt', theme);
    await auditAxe(page, 'filed receipt', theme);
    await auditNames(page, 'filed receipt', theme);
    await auditSeparationAndTargets(page, 'filed receipt', theme);
    await auditFocusRings(page, 'filed receipt', theme, ['.triage-place-when', '.triage-place-set']);

    // AND THE CARD THAT NOW SAYS WHERE IT WENT, in the job the card lives in.
    // Before the undo below, which takes the filing back.
    await enterStance(page, 'held');
    if (await page.locator('.card-place').count() > 0) {
      await auditContrast(page, 'a card that says where it went', theme);
      await auditFocusRings(page, 'a card that says where it went', theme);
      await auditNames(page, 'a card that says where it went', theme);
    } else {
      fail(`${theme}/a card that says where it went: nothing is filed, so the line that says where cannot be measured`);
    }
    await enterStance(page, 'triage');
    await page.locator('.triage-undo-btn').click();
    await page.waitForSelector('#triage-actions .route .route-hint');

    await enterStance(page, 'triage');
    await page.locator('#triage-actions .route[data-route="put-under"]').first().click();
    await page.waitForSelector('#triage-place-new');
    await page.evaluate(() => document.querySelector('#triage-actions .route')?.click()); // Back
    await page.waitForSelector('#triage-actions .route .route-hint');

    // Back down to ONE card. The sweep above needed a pile, and the assertion
    // below is about the LAST card being routed — so the pile is cleared here,
    // through "Next action" rather than "Do now" so it leaves no timed offer
    // behind to confuse the state that audits one.
    for (let i = 0; i < 12; i++) {
      const left = await page.evaluate(() =>
        Number(document.querySelector('#triage-gauge')?.dataset.waiting ?? 0));
      if (left <= 1) break;
      await enterStance(page, 'triage');
      await page.locator('#triage-actions .route', { hasText: 'Next action' }).first().click();
      await page.waitForTimeout(60);
    }

    // State 3c: route it, which both clears the inbox — so focus must return to
    // capture rather than fall to <body> (A-5/F-05) — and gives Work mode
    // something to offer.
    await page.evaluate(() => document.querySelector('#triage-actions .route')?.focus());
    await page.keyboard.press('Enter');           // "Do now"
    await page.waitForSelector('#triage', { state: 'hidden' });
    const afterRoute = await page.evaluate(() => document.activeElement?.id ?? '');
    (afterRoute === 'capture' ? pass : fail)(
      `${theme}/triage: focus returns to capture after the last card is routed (on ${afterRoute || 'BODY'}, not <body>)`);

    // State 3c-ii: the do-now offer. It outlives the triage surface — that was
    // the defect — so it is audited here, with #triage already hidden.
    await page.waitForSelector('.donow-done');
    await auditContrast(page, 'do now offered', theme);
    await auditAxe(page, 'do now offered', theme);
    await auditNames(page, 'do now offered', theme);
    await auditSeparationAndTargets(page, 'do now offered', theme);
    await auditFocusRings(page, 'do now offered', theme, ['.donow-done']);

    // State 3c-iii: the last-action undo. Routing the card above raised it, and it
    // lives beside the do-now offer, outliving the hidden triage surface for the
    // same reason — the way to take a route back must not vanish with the section.
    await page.waitForSelector('#triage-undo .triage-undo-btn');
    await auditContrast(page, 'route undo', theme);
    await auditAxe(page, 'route undo', theme);
    await auditNames(page, 'route undo', theme);
    await auditSeparationAndTargets(page, 'route undo', theme);
    await auditFocusRings(page, 'route undo', theme, ['.triage-undo-btn']);

    // State 3d: Work mode — Next up, then the coverage list opened.
    await page.waitForSelector('#nextup:not([hidden])');
    // WHAT TODAY COMMITS YOU TO (2.19.1). Asserted before the audits, because a
    // registry entry naming an element that renders empty is a false receipt —
    // the failure `#nextup-left` cost a release for, and the note on this
    // entry's own line is about exactly that.
    const datedLine = await page.evaluate(() => {
      const el = document.querySelector('#nextup-dated');
      return el && !el.hidden ? (el.textContent ?? '').trim() : '';
    });
    (/\bdated today\b/.test(datedLine) ? pass : fail)(
      `${theme}/next up: the day's own commitments are stated ("${datedLine}")`);
    (!/left today|remaining|behind|overdue/i.test(datedLine) ? pass : fail)(
      `${theme}/next up: and it is a count of dates, never a remainder (ADR-0103)`);
    // SAID PLAINLY: this measures the ZERO wording, because the sample dates
    // nothing today. The one-thing and many-things wordings — and that zero
    // carries no digit and no congratulation — are held by test/clock.test.ts,
    // which has covered `datedWords` since the clock module. What was missing
    // was never the words; it was any route to them outside an opt-in clock.
    await auditContrast(page, 'next up', theme);
    await auditAxe(page, 'next up', theme);
    await auditNames(page, 'next up', theme);
    await auditSeparationAndTargets(page, 'next up', theme);
    await auditFocusRings(page, 'next up', theme, ['#nextup-done', '#nextup-skip', '#gauge', '#nextup-title']);

    // State 3c1: SETTLED (1.35.0). Reached the way anybody reaches it — finish
    // the thing being offered — and then left the same way, so every state after
    // this one meets the ordinary offer.
    await page.click('#nextup-enough');
    await page.waitForSelector('#nextup-settled:not([hidden])');
    await auditContrast(page, 'settled', theme);
    await auditAxe(page, 'settled', theme);
    await auditNames(page, 'settled', theme);
    await auditSeparationAndTargets(page, 'settled', theme);
    await auditFocusRings(page, 'settled', theme, ['#nextup-resume']);
    await page.click('#nextup-resume');
    await page.waitForFunction(() =>
      document.querySelector('#nextup-settled')?.hidden === true);

    // State 3c2: JUST ONE THING (1.36.0). The minimum state, driven ON, because
    // the way out only exists then and the type sizes differ from the ordinary
    // offer. Left again straight afterwards so every state below meets the
    // ordinary surface.
    await page.click('#nextup-plain');
    await page.waitForSelector('#nextup-plain-bar:not([hidden])');
    await auditContrast(page, 'one thing', theme);
    await auditAxe(page, 'one thing', theme);
    await auditNames(page, 'one thing', theme);
    await auditSeparationAndTargets(page, 'one thing', theme);
    await auditFocusRings(page, 'one thing', theme, ['#nextup-plain-off']);

    // AND THE STRIP ACTUALLY STRIPS (2.10.0) — every selector it names, gone.
    //
    // Found on a device on a screen showing exactly one task: the SCREEN was too
    // busy to begin in, though the offer on it was a single item. Counted at
    // 390px: turning
    // this mode ON changed nine controls and four lines of chrome into nine
    // controls and four lines of chrome, because the strip only ever reached
    // inside the card — and three lines added to the card in later releases were
    // never added to its list either.
    //
    // SETTLED FIRST, and that is not politeness. `paintWritten` resolves a store
    // lookup and un-hides itself in a LATER TICK than the strip, so it was in
    // the list and on screen at the same time. A check that reads immediately
    // after the click would have agreed with the list rather than with the
    // screen.
    await page.waitForTimeout(700);
    const leaked = await page.evaluate(() => {
      const out = [];
      for (const sel of window.__PLAIN_STRIPPED ?? []) {
        const el = document.querySelector(sel);
        if (el && el.checkVisibility()) {
          out.push(`${sel} "${(el.textContent || '').trim().slice(0, 36)}"`);
        }
      }
      return out;
    });
    // Non-empty first: with no list to walk this reports green about a mode that
    // has stopped stripping anything at all (hub LESSONS 100).
    const stripCount = await page.evaluate(() => (window.__PLAIN_STRIPPED ?? []).length);
    (stripCount >= 15 ? pass : fail)(
      `${theme}/one thing: the strip has a list to walk (${stripCount} selectors)`);
    (leaked.length === 0 ? pass : fail)(
      `${theme}/one thing: nothing it strips is still on screen`
      + `${leaked.length ? ` — ${leaked.slice(0, 6).join('; ')}` : ''}`);

    // AND EVERY REGION OF THE SURFACE HAS ANSWERED (2.14.0).
    //
    // The card has had this since 2.10.0 and has not gone stale since: two lists
    // that must together account for every element of it, checked by
    // `tools/plain.mjs`. The chrome had one list of three selectors and nothing
    // checking it against the surface, so fifteen sections joined the worst
    // day's screen without anybody deciding they should — including the two
    // hardest lines on it, "one date has gone by" and "one thing is with
    // someone else".
    //
    // It is HERE rather than in `tools/plain.mjs` because the question is about
    // the rendered tree and the answer has to be too. Reading nesting out of
    // `public/index.html` with a regex is how a gate ends up agreeing with a
    // file instead of with a screen, which is the failure this whole state
    // exists to catch.
    //
    // WHAT IS IN SCOPE, said out loud so a gap cannot be mistaken for one:
    // the header, `<main>`, and the two loose regions either side of them. The
    // sheets are not — a dialog is not on the work surface, and opening one
    // while the mode is on is a deliberate act, not something the screen did.
    const unaccounted = await page.evaluate(() => {
      const declared = new Set([...(window.__PLAIN_STRIPPED ?? []), ...(window.__PLAIN_SURVIVES ?? [])]
        .filter(s => s.startsWith('#')).map(s => s.slice(1)));
      const out = [];
      const walk = (parent, path) => {
        for (const el of parent.children) {
          if (el.id && declared.has(el.id)) continue;
          // A container whose parts are declared separately — the header's own
          // bar is one — is walked into rather than demanded of.
          if ([...declared].some(id => el.querySelector(`#${CSS.escape(id)}`))) {
            walk(el, `${path} > ${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}`);
            continue;
          }
          out.push(`${path} > <${el.tagName.toLowerCase()}>${el.id ? ` #${el.id}` : ' (no id — give it one)'}`);
        }
      };
      const header = document.querySelector('header.frame');
      const main = document.querySelector('main');
      if (header) walk(header, 'header');
      if (main) walk(main, 'main');
      for (const sel of ['#skip-held', '#foot']) {
        const el = document.querySelector(sel);
        if (!el) out.push(`${sel} is not in the page`);
        else if (!declared.has(sel.slice(1))) out.push(`${sel} is in neither list`);
      }
      return out;
    });
    (unaccounted.length === 0 ? pass : fail)(
      `${theme}/one thing: every region of the work surface says whether it survives`
      + (unaccounted.length
        ? ` — ${unaccounted.slice(0, 8).join('; ')}. Add each to PLAIN_CHROME_HIDDEN or`
          + ' PLAIN_CHROME_KEPT in src/plain.ts, then `node tools/plain.mjs --write`.'
        : ''));

    // AND WHAT IS LEFT ON THE SCREEN, counted (2.14.0). The lists above can be
    // complete and still wrong — a region declared as surviving that should not
    // have been is a decision, and this is the number that makes it one anybody
    // can see. Ceilings, not targets: they exist to make growth deliberate.
    const left = await page.evaluate(() => {
      const off = (el) => !el.closest('#nextup') && !el.closest('dialog') && el.checkVisibility();
      const controls = [...document.querySelectorAll('button, input, select, textarea, summary, a[href]')]
        .filter(el => off(el) && !el.classList.contains('visually-hidden'));
      let words = 0;
      const lines = [];
      for (const el of document.querySelectorAll('p, h1, h2, h3, li')) {
        if (!off(el) || el.closest('button, a, summary, label')) continue;
        if (el.classList.contains('visually-hidden')) continue;
        if (el.querySelector('p, h1, h2, h3, li')) continue;
        // `innerText`, NOT `textContent` (2.29.0). The two counters in this
        // block disagreed about visibility: controls are filtered by
        // `checkVisibility()` one at a time, while the words were read off
        // `textContent`, which includes text inside HIDDEN descendants.
        //
        // So this counted words no reader can see. It surfaced when the footer's
        // manual link was stripped for this mode — the control count correctly
        // fell to ten and the word count stayed at twenty-five, still counting
        // the stripped link's own words. Measuring what is on the screen is the
        // whole point of this ceiling; a number that includes hidden text is
        // measuring the markup instead.
        //
        // The ceiling is unchanged and still calibrated: on this fixture the
        // three other lines are unaffected (a wordmark, a receipt and an update
        // line have no hidden children), so this only removes what was wrongly
        // added.
        const n = ((el.innerText || '').trim().match(/\S+/g) ?? []).length;
        if (n === 0) continue;
        words += n;
        lines.push(`${el.id ? `#${el.id}` : el.tagName.toLowerCase()} (${n}w)`);
      }
      return {
        controls: controls.length, words, lines,
        names: controls.map(el => el.id ? `#${el.id}` : `<${el.tagName.toLowerCase()}>`),
      };
    });
    // Measured at 2.14.0 on this fixture, where a capture has just landed AND a
    // second worker is waiting — so both of the app's two transient lines are on
    // screen at once, which is the honest worst case rather than the tidy one.
    //
    // The ten: the ⓘ, More, the capture field and its button, the proof line,
    // the update strip's two, the way out, and the footer's licence link and
    // version. The twenty-one words: the wordmark (1), the capture receipt (7),
    // the update strip (5) and the footer (8).
    //
    // Before this release, on the same fixture: 20 controls and 65 words.
    //
    // 9 -> 10 WITHIN THIS RELEASE, and the +1 is an ACCOUNTING artefact rather
    // than growth. `#nextup-plain-off` was inside the offer card and therefore
    // not counted here; it moved out because the card hides whenever nothing is
    // asking, which made "mode on, nothing to offer" a screen with no way back.
    // Nothing was added to the screen — one control crossed the boundary this
    // count is drawn around. The same shape as `size-check.mjs`'s 229 -> 230,
    // and worth the same sentence: a budget that reads the wrong way round is
    // still telling the truth about what it measures.
    //
    // NO HEADROOM, deliberately, like `tools/size-check.mjs`'s budgets. A number
    // that can drift by two is a number nobody edits and nobody reads. Raising
    // either of these means writing down what was added and why it earns a place
    // on the day the screen is the problem.
    //
    // WHAT IT COUNTED, on a failure and never on a pass. A ceiling that reports
    // only a number sends the next reader to reproduce the fixture by hand
    // before they can even see what grew.
    const LEFT_CONTROLS = 10;
    const LEFT_WORDS = 21;
    (left.controls <= LEFT_CONTROLS ? pass : fail)(
      `${theme}/one thing: ${left.controls} controls left outside the offer (ceiling ${LEFT_CONTROLS})`
      + (left.controls > LEFT_CONTROLS ? ` — ${left.names.join(', ')}` : ''));
    (left.words <= LEFT_WORDS ? pass : fail)(
      `${theme}/one thing: ${left.words} words of standing text left outside the offer (ceiling ${LEFT_WORDS})`
      + (left.words > LEFT_WORDS ? ` — ${left.lines.join(', ')}` : ''));

    await page.click('#nextup-plain-off');
    await page.waitForFunction(() =>
      document.querySelector('#nextup-plain-bar')?.hidden === true);

    // State 3d0: a first step has been named (1.24.0). Reached the way anybody
    // reaches it, and in 2.10.1 that route changed: the field no longer stands
    // open on the card, because four lines of prose explaining what a first step
    // is were being printed on the thing you are trying to begin. You ask for it
    // now. This walk still said `fill` and timed out — which is the gate working,
    // and worth saying plainly: the walk is the only thing that noticed the route
    // it had been asserting no longer exists.
    //
    // State 3c9 is the asking, and it is a state that did not exist before this
    // release. A form appearing on press is a new surface, and a new surface that
    // does not join this list in the same commit ships unmeasured (hub LESSONS
    // §28) — so it is audited here rather than stepped through.
    await page.click('#nextup-bite-open');
    await page.waitForSelector('#nextup-bite-form:not([hidden])');
    await auditContrast(page, 'first step asked for', theme);
    await auditAxe(page, 'first step asked for', theme);
    await auditNames(page, 'first step asked for', theme);
    await auditSeparationAndTargets(page, 'first step asked for', theme);
    await auditFocusRings(page, 'first step asked for', theme);

    // and then UNDONE, so every state after this one meets the ordinary offer.
    // The card now carries two completion controls, so the §4 name check earns
    // its keep here.
    await page.fill('#nextup-bite-input', 'open the file and write one line');
    await page.click('#nextup-bite-form button[type=submit]');
    await page.waitForSelector('#nextup-bite:not([hidden])');
    await auditContrast(page, 'first step named', theme);
    await auditAxe(page, 'first step named', theme);
    await auditNames(page, 'first step named', theme);
    await auditSeparationAndTargets(page, 'first step named', theme);
    await auditFocusRings(page, 'first step named', theme, ['#nextup-bite-done']);
    await page.click('#nextup-bite-done');
    await page.waitForSelector('#nextup-bite', { state: 'hidden' });

    // State 3d1a: saying what is on you (1.15.0). HERE, immediately after 'next
    // up', because the line beside a narrowed offer renders only when the offer
    // is live — audited at 3d2 it waited forever on a surface that was hidden. Opened, audited, then a real
    // weight is put on so the SECOND state — the list row and the line beside a
    // narrowed offer — has something to render. A boulder, so the threshold is
    // crossed in one go rather than by piling up three.
    await openViaContents(page, 'sheet-load-entry');
    await page.waitForSelector('#pebble-text');
    await auditContrast(page, 'load entry', theme);
    await auditAxe(page, 'load entry', theme);
    await auditNames(page, 'load entry', theme);
    await auditSeparationAndTargets(page, 'load entry', theme);
    await auditFocusRings(page, 'load entry', theme,
      ['#sheet-load-entry-close', '#pebble-text', '#capacity-level', '#pebble-weight']);
    await page.fill('#pebble-text', 'the thing with the roof');
    await page.selectOption('#pebble-weight', 'boulder');
    await page.click('#pebble-form button[type=submit]');
    await page.waitForSelector('#pebble-list li');
    // The door's state line, now that there is something behind the door to
    // report. Asserted as words rather than assumed: a surface that goes silent
    // the moment it is out of sight is the collision this app is a rebuttal to,
    // so the line is audited AND its content is checked below.
    await page.waitForSelector('#sheet-load-entry-count:not([hidden])');
    await auditContrast(page, 'load door state', theme);
    await auditFocusRings(page, 'load door state', theme);
    const doorWords = (await page.textContent('#sheet-load-entry-count')).trim();
    (/\bthing\b/.test(doorWords) ? pass : fail)(
      `${theme}/load door state: the door says what is behind it — "${doorWords}"`);
    (/\d+\s*%|\bof\b\s*\d/.test(doorWords) ? fail : pass)(
      `${theme}/load door state: and says it without a score or a proportion`);
    await page.waitForSelector('#nextup-load:not([hidden])');
    await auditContrast(page, 'load carried', theme);
    await auditAxe(page, 'load carried', theme);
    await auditNames(page, 'load carried', theme);
    await auditSeparationAndTargets(page, 'load carried', theme);
    await auditFocusRings(page, 'load carried', theme, ['#pebble-list li button']);
    // Leave the surface as this section found it: the weight comes off, so the
    // offer is back to its ordinary shape for every state after this one.
    await page.click('#pebble-list li button');
    await page.waitForSelector('#nextup-load', { state: 'hidden' });
    await page.click('#sheet-load-entry-close');
    await page.waitForSelector('#sheet-load-entry', { state: 'hidden' });

    // The claim, opened — ITS OWN SHEET since 2.0.5 (ADR-0088), so this is a
    // dialog state now and is measured as one: the sheet's Close is chrome
    // outside the scrolling body, and both belong to this state rather than to
    // the surface underneath.
    await page.click('#gauge');
    await page.waitForSelector('#sheet-coverage[open]');
    // THE RING A SHEET OPENS WITH (3.20.1). `focusSheetTitle` has always put
    // focus on the title, and the ring that showed was each engine's default —
    // unstyled, unmeasured, and broken on the device. The tab-driven ring audit
    // can never reach a tabindex="-1" heading, so this asserts it directly:
    // focus landed on the title, the app's own ring is drawn (`:focus`, so this
    // engine renders what the device renders), and the whole ring fits inside
    // the sheet rather than being clipped by its edge.
    {
      const ring = await page.evaluate(() => {
        const t = document.querySelector('#sheet-coverage-title');
        const d = document.querySelector('#sheet-coverage');
        if (!t || !d) return null;
        const cs = getComputedStyle(t);
        const room = parseFloat(cs.outlineWidth) + parseFloat(cs.outlineOffset);
        const tr = t.getBoundingClientRect(), dr = d.getBoundingClientRect();
        return {
          focused: document.activeElement === t,
          width: parseFloat(cs.outlineWidth),
          style: cs.outlineStyle,
          headroom: tr.top - dr.top - room,
        };
      });
      (ring && ring.focused ? pass : fail)(`${theme}/coverage open: the sheet hands focus to its title`);
      (ring && ring.style !== 'none' && ring.width >= 2 ? pass : fail)(
        `${theme}/coverage open: the title's ring is the app's own (${ring ? `${ring.style} ${ring.width}px` : 'unmeasured'})`);
      (ring && ring.headroom >= 0 ? pass : fail)(
        `${theme}/coverage open: and the whole ring fits inside the sheet (${ring ? `${Math.round(ring.headroom)}px to spare` : 'unmeasured'})`);
    }
    await auditContrast(page, 'coverage open', theme);
    await auditAxe(page, 'coverage open', theme);
    await auditNames(page, 'coverage open', theme);
    await auditSeparationAndTargets(page, 'coverage open', theme);
    await auditFocusRings(page, 'coverage open', theme, ['.coverage-open', '#sheet-coverage-close']);
    // Left as it was found: everything below this reads the surface underneath,
    // and a modal sheet makes it inert.
    await page.click('#sheet-coverage-close');
    await page.waitForSelector('#sheet-coverage[open]', { state: 'detached' });

    // WHAT IS ON THIS PAGE (2.3.0, ADR-0093), and it is ASSERTED to be a route
    // rather than a list of words. Three claims, in the order they can fail:
    //
    //  1. the rows exist and are named from the page itself — so the assertion
    //     is that a live block's own heading text is present as a row, not that
    //     "some rows rendered";
    //  2. pressing one closes the sheet, moves the page, AND lands focus — a
    //     scroll that leaves focus behind is the defect where the next Tab
    //     throws you back up the page (ADR-0090 was written about exactly that);
    //  3. no row points at a block that is not live, which is the failure mode a
    //     hand-written list of destinations has and this one is built not to.
    await page.click('#contents-open');
    await page.waitForSelector('#sheet-contents[open]');
    await auditContrast(page, 'contents open', theme);
    await auditAxe(page, 'contents open', theme);
    await auditNames(page, 'contents open', theme);
    await auditSeparationAndTargets(page, 'contents open', theme);
    await auditFocusRings(page, 'contents open', theme, ['.contents-go', '#sheet-contents-close']);
    const contents = await page.evaluate(() => ({
      rows: [...document.querySelectorAll('#contents-list .contents-go')]
        .map((b) => ({ go: b.dataset.go, name: b.querySelector('.contents-name')?.textContent?.trim() })),
      live: [...document.querySelectorAll('main > section[id]')]
        // The hub is not a block on the page — it is the page you come up to
        // (3.0.0), and `stops()` skips it for the same reason: a row taking you
        // to where the list already is.
        .filter((s) => !s.hidden && !s.hasAttribute('data-not-a-stop'))
        .map((s) => ({
          id: s.id,
          name: document.getElementById(s.getAttribute('aria-labelledby'))?.textContent?.trim() ?? '',
        }))
        .filter((s) => s.name),
    }));
    for (const block of contents.live) {
      (contents.rows.some((r) => r.go === block.id && r.name === block.name) ? pass : fail)(
        `${theme}/contents open: "${block.name}" (#${block.id}) is live on the page and has a row naming it`);
    }
    const dead = contents.rows.filter((r) => r.go !== 'top' && !contents.live.some((b) => b.id === r.go));
    (dead.length === 0 ? pass : fail)(
      `${theme}/contents open: no row points at a block that is not on the page` +
      `${dead.length ? ` — ${dead.map((r) => `#${r.go}`).join(', ')}` : ''}`);

    // THE DOORS HALF (2.8.1, ADR-0099). Three surfaces came off the runway and
    // this list is now their only route, so the assertion is not "the rows look
    // right" but "every marked door has one, named by the surface itself".
    //
    // Written so it CANNOT go vacuous. The count is asserted non-zero first:
    // strip `data-contents-door` from the markup and the loop below has nothing
    // to iterate, every per-door assertion silently does not run, and the state
    // reports green about a feature that is gone. Hub LESSONS §100 is exactly
    // that shape, found in this file, in an ambient-horizon check that took its
    // "correctly absent" branch through a whole release in both themes.
    const marked = await page.evaluate(() => ({
      doors: [...document.querySelectorAll('dialog[data-contents-door]')].map((d) => ({
        id: d.id,
        name: document.getElementById(d.getAttribute('aria-labelledby'))?.textContent?.trim() ?? '',
      })),
      rows: [...document.querySelectorAll('#contents-doors .contents-go')].map((b) => ({
        open: b.dataset.open,
        name: b.querySelector('.contents-name')?.textContent?.trim() ?? '',
      })),
    }));
    (marked.doors.length >= 3 ? pass : fail)(
      `${theme}/contents open: the page still marks its off-runway surfaces (${marked.doors.length} found, expected at least 3)`);
    for (const door of marked.doors) {
      (marked.rows.some((r) => r.open === door.id && r.name === door.name) ? pass : fail)(
        `${theme}/contents open: "${door.name}" (#${door.id}) is reachable, and its row is named by the surface itself`);
    }
    const orphan = marked.rows.filter((r) => !marked.doors.some((d) => d.id === r.open));
    (orphan.length === 0 ? pass : fail)(
      `${theme}/contents open: no door row points at a surface that is not there` +
      `${orphan.length ? ` — ${orphan.map((r) => `#${r.open}`).join(', ')}` : ''}`);

    // And the route itself, driven. The worry entry, because it is the one that
    // gave up a one-tap door on the runway to be here — if any door has to work,
    // it is this one.
    await page.click('#contents-doors .contents-go[data-open="sheet-bother-entry"]');
    await page.waitForSelector('#sheet-bother-entry[open]');
    (await page.evaluate(() => document.querySelector('#sheet-contents')?.open === false) ? pass : fail)(
      `${theme}/contents open: arriving at a surface puts Contents away (one surface at a time)`);
    await page.click('#sheet-bother-entry-close');
    await page.waitForSelector('#sheet-bother-entry', { state: 'hidden' });
    await page.click('#contents-open');
    await page.waitForSelector('#sheet-contents[open]');
    // The route, driven. `#held` is the block this release gave a name to, and
    // it is the one furthest down the page — so it is the row with the most to
    // prove about arriving.
    await page.click('#contents-list .contents-go[data-go="held"]');
    await page.waitForSelector('#sheet-contents[open]', { state: 'detached' });
    // RELATIVE TO THE SCROLLER, not to the viewport (2.9.0, ADR-0100). "The top
    // of the screen" for anything in the runway is the top of the RUNWAY — the
    // frame above it never moves, so measuring against the viewport now reports
    // the frame's height as error and would fail on a jump that worked
    // perfectly. Corrected rather than loosened: the tolerance is unchanged,
    // it is the origin that was wrong.
    const arrived = await page.evaluate(() => {
      // THE ORIGIN DEPENDS ON WHICH BOX ACTUALLY SCROLLED (2.9.2, ADR-0101).
      // With the frame up, runway content is measured from the runway's top.
      // With the frame stood down there is no inner scroller — the DOCUMENT
      // scrolled — and the runway's own top is now somewhere above the viewport,
      // so subtracting it reports the whole scroll distance as error. It did:
      // 1419px, on a walk where an earlier state had left the frame down.
      // Named rather than tolerated, because a check that cannot say which
      // layout it measured cannot be trusted in either.
      const off = document.documentElement.getAttribute('data-frame') === 'off';
      const runway = document.querySelector('#runway');
      const origin = (!off && runway) ? runway.getBoundingClientRect().top : 0;
      // AND THE CLEARANCE IS READ, NOT ASSUMED. `.runway` sets `scroll-padding-top`
      // so a heading does not land flush against the frame's edge, and
      // `scrollIntoView` honours it — so a jump that worked perfectly landed
      // exactly that far down and the check failed by exactly that much. The
      // tolerance is NOT widened to swallow it; the expected landing point comes
      // from the stylesheet, so changing the clearance moves the check with it
      // and a jump that actually breaks still fails.
      // AND THE CLEARANCE ONLY APPLIES IN THE MODE THAT OWNS IT: `.runway` sets
      // `scroll-padding-top`, and with the frame down the runway is not the
      // scroller, so the document lands the block flush and there is no
      // clearance to allow for. Reported as -8px until this said so.
      const pad = (!off && runway) ? parseFloat(getComputedStyle(runway).scrollPaddingTop) || 0 : 0;
      return {
        focused: document.activeElement?.id ?? null,
        pad: Math.round(pad),
        mode: off ? 'frame down, the document scrolls' : 'frame up, the runway scrolls',
        top: Math.round(document.querySelector('#held').getBoundingClientRect().top - origin - pad),
      };
    });
    (arrived.focused === 'held-heading' ? pass : fail)(
      `${theme}/contents open: pressing a row lands focus on the block (got ${arrived.focused ?? 'nothing'})`);
    (Math.abs(arrived.top) <= 4 ? pass : fail)(
      `${theme}/contents open: pressing a row puts the block at the top, under its ${arrived.pad}px clearance`
      + ` — ${arrived.mode} (${arrived.top}px off)`);
    await page.evaluate(() => { const r = document.querySelector('#runway'); if (r) r.scrollTop = 0; else window.scrollTo({ top: 0, behavior: 'auto' }); });

    // ASK ONCE, BEFORE ANY PLACE EXISTS (2.28.0, entry 23). Driven HERE, ahead of
    // everything below, because this state only exists on a store that has never
    // named a place — and the block underneath is what names the first one. Once
    // it has run, this row is gone for the rest of the walk and a registry entry
    // for it would match nothing, which is the false receipt 2.24.0 cost.
    //
    // Three claims in the order they can fail: the sheet asks rather than
    // showing an empty chooser; naming one through it works and applies it; and
    // the ask is REPLACED by the chooser afterwards rather than both being on
    // screen, which is what the shared slot means.
    await page.waitForSelector('#situation-open:not([hidden])');
    await page.click('#situation-open');
    await page.waitForSelector('#sheet-situation[open]');
    await page.waitForSelector('#where-first-row:not([hidden])');
    const chooserBefore = await page.evaluate(() =>
      document.querySelector('#where-row')?.hidden ?? null);
    (chooserBefore === true ? pass : fail)(
      `${theme}/first place: with none named, the sheet ASKS instead of showing an empty chooser (chooser hidden=${chooserBefore})`);
    const askHint = await page.locator('#where-first-hint').innerText();
    (/Only if it helps/.test(askHint) ? pass : fail)(
      `${theme}/first place: the ask is visibly declinable ("${askHint.slice(0, 48)}")`);
    (!/must|need to|should|required|set this up/i.test(askHint) ? pass : fail)(
      `${theme}/first place: and nothing in it reads as a demand`);
    await auditContrast(page, 'the first place, asked for', theme);
    await auditAxe(page, 'the first place, asked for', theme);
    await auditNames(page, 'the first place, asked for', theme);
    await auditSeparationAndTargets(page, 'the first place, asked for', theme);
    await auditFocusRings(page, 'the first place, asked for', theme, ['#where-first', '#where-first-set']);
    await page.fill('#where-first', 'At my desk');
    await page.click('#where-first-set');
    await page.waitForSelector('#where-row:not([hidden])');
    const askAfter = await page.evaluate(() =>
      document.querySelector('#where-first-row')?.hidden ?? null);
    (askAfter === true ? pass : fail)(
      `${theme}/first place: naming one replaces the ask with the chooser (ask hidden=${askAfter})`);
    const appliedNote = await page.locator('#where-note').innerText();
    // Case-insensitive on purpose: `whereWords` lowercases the first character
    // so "At my desk" reads as "at my desk" mid-sentence, which is correct copy
    // and which this assertion originally called a defect.
    (/at my desk/i.test(appliedNote) ? pass : fail)(
      `${theme}/first place: and it is APPLIED, not merely created ("${appliedNote.slice(0, 44)}")`);
    // Back to everywhere, so nothing below is measured through a filter it did
    // not ask for.
    await page.selectOption('#where', '');
    await page.waitForSelector('#where-note', { state: 'hidden' });
    await page.click('#sheet-situation-close');
    await page.waitForSelector('#sheet-situation', { state: 'hidden' });

    // WHERE YOU ARE (2.2.0, ADR-0092), driven end to end: a place is named on a
    // thing's own sheet, then chosen on the work surface. Driven rather than
    // seeded, because the write path is the thing worth measuring — a context
    // planted straight into the store would prove the chooser renders and
    // nothing about whether it can be made.
    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.fill('#detail-context', 'At home');
    await page.click('#detail-context-set');
    await page.waitForSelector('#detail-context-list li');

    // THE PICKS, AND THE WAY OUT (3.8.0). "At my desk" was named through the
    // first-place row further up this walk and is NOT on this item, so it is
    // offered here as a tap — which is the common case the browser's own popup
    // was serving badly, and the state a reader actually meets.
    await page.waitForSelector('#detail-context-picks button');
    await auditContrast(page, 'detail sheet, the places you have', theme);
    await auditAxe(page, 'detail sheet, the places you have', theme);
    await auditNames(page, 'detail sheet, the places you have', theme);
    await auditSeparationAndTargets(page, 'detail sheet, the places you have', theme);
    await auditFocusRings(page, 'detail sheet, the places you have', theme);

    // Pressed, the same picks say what they now do, which is the whole reason
    // one list can carry both acts without a control ever meaning two things.
    await page.click('#detail-context-fix button');
    await page.waitForSelector('#detail-context-picks button');
    const fixWords = await page.locator('#detail-context-picks button').first().innerText();
    (/not a place/.test(fixWords) ? pass : fail)(
      `${theme}/detail sheet: the picks change their WORDS to say they now remove ("${fixWords}")`);
    await auditContrast(page, 'detail sheet, correcting a place', theme);
    await auditAxe(page, 'detail sheet, correcting a place', theme);
    await auditNames(page, 'detail sheet, correcting a place', theme);
    await auditSeparationAndTargets(page, 'detail sheet, correcting a place', theme);
    await auditFocusRings(page, 'detail sheet, correcting a place', theme);
    // MEASURED, NOT EXERCISED. Nothing is released here: "At my desk" is chosen
    // in `#where` a few lines down, and taking it out to prove the button works
    // would measure one state by breaking another. That the release LANDS is
    // `test/names.test.ts`'s job, where it costs no browser.
    await page.click('#detail-context-fix button');
    await page.waitForSelector('#detail-context-picks button');

    await page.click('#detail-close');
    // THROUGH THE DOOR (2.21.0). Both inputs moved out of the pile and into
    // `#sheet-situation`, so this opens it — and opening it is now part of what
    // the walk proves, rather than the chooser being assumed to be on screen.
    await page.waitForSelector('#situation-open:not([hidden])');
    await page.click('#situation-open');
    await page.waitForSelector('#sheet-situation[open]');
    await page.waitForSelector('#where-row:not([hidden])');
    // BEFORE ANYTHING IS CHOSEN, which is the state somebody meets first and
    // the only one where the line saying the labels can be corrected is up.
    await page.waitForSelector('#where-hint:not([hidden])');
    await auditContrast(page, 'where you are, nothing chosen', theme);
    await auditNames(page, 'where you are, nothing chosen', theme);
    await auditSeparationAndTargets(page, 'where you are, nothing chosen', theme);
    await auditFocusRings(page, 'where you are, nothing chosen', theme);

    await page.selectOption('#where', { label: 'At home' });
    await page.waitForSelector('#where-note:not([hidden])');
    // and it stands down the moment there IS something to say it about, so the
    // reader is never shown the invitation and the button at the same time.
    const hintGone = await page.locator('#where-hint').isVisible();
    (hintGone ? fail : pass)(
      `${theme}/where you are: the invitation gives way to the control it was pointing at`);
    await auditContrast(page, 'where you are', theme);
    await auditAxe(page, 'where you are', theme);
    await auditNames(page, 'where you are', theme);
    await auditSeparationAndTargets(page, 'where you are', theme);
    await auditFocusRings(page, 'where you are', theme, ['#where']);

    // HOW LONG YOU HAVE (2.19.0, the plan's phase 3). The other half of the
    // situation, driven the same way — chosen on the work surface, with the
    // standing line waited for rather than assumed, because that line is the
    // only thing telling a reader that what they are looking at is narrowed.
    await page.selectOption('#how-long', '30');
    await page.waitForSelector('#how-long-note:not([hidden])');
    const howLongNote = await page.locator('#how-long-note').innerText();
    (/never put a time on/.test(howLongNote) ? pass : fail)(
      `${theme}/how long: the line says unestimated things are still shown ("${howLongNote.slice(0, 60)}")`);
    (/\d/.test(howLongNote) && !/hidden|left|remaining/i.test(howLongNote) ? pass : fail)(
      `${theme}/how long: it states the scope and never a count of what is hidden`);
    await auditContrast(page, 'how long you have', theme);
    await auditAxe(page, 'how long you have', theme);
    await auditNames(page, 'how long you have', theme);
    await auditSeparationAndTargets(page, 'how long you have', theme);
    await auditFocusRings(page, 'how long you have', theme, ['#how-long']);
    // Back to no limit, so every state after this sees the whole list — the
    // rule the place chooser already follows two blocks down.
    await page.selectOption('#how-long', '');
    await page.waitForSelector('#how-long-note', { state: 'hidden' });

    // A SITUATION SOMEBODY NAMED (2.21.0). Saved through the app, recalled, and
    // forgotten — the three acts, in the order they can fail.
    await page.selectOption('#how-long', '15');
    await page.waitForSelector('#how-long-note:not([hidden])');
    await page.fill('#situation-name', 'The Tuesday standup');
    await page.click('#situation-save');
    await page.waitForSelector('#situation-list li');
    const savedRow = await page.evaluate(() => {
      const li = document.querySelector('#situation-list li');
      return {
        name: li?.querySelector('.linklike')?.textContent?.trim() ?? '',
        what: li?.querySelector('.roles-held')?.textContent?.trim() ?? '',
      };
    });
    (savedRow.name === 'The Tuesday standup' ? pass : fail)(
      `${theme}/situation: a named situation is listed ("${savedRow.name}")`);
    (/At home/.test(savedRow.what) && /15/.test(savedRow.what) ? pass : fail)(
      `${theme}/situation: and it says what it recalls ("${savedRow.what}")`);
    (!/used|last|times|often|ago/i.test(savedRow.what) ? pass : fail)(
      `${theme}/situation: no record of how often it is used — a shortcut, not a habit log`);
    await auditContrast(page, 'the situation', theme);
    await auditAxe(page, 'the situation', theme);
    await auditNames(page, 'the situation', theme);
    await auditSeparationAndTargets(page, 'the situation', theme);
    await auditFocusRings(page, 'the situation', theme, ['#situation-save']);

    // RECALLED: it sets BOTH inputs, which is the whole point of naming one.
    await page.selectOption('#how-long', '');
    await page.selectOption('#where', '');
    await page.waitForTimeout(200);
    await page.click('#situation-list .linklike');
    await page.waitForTimeout(250);
    const recalled = await page.evaluate(() => ({
      where: document.querySelector('#where')?.value ?? '',
      how: document.querySelector('#how-long')?.value ?? '',
    }));
    (recalled.how === '15' && recalled.where !== '' ? pass : fail)(
      `${theme}/situation: recalling it sets BOTH inputs (where="${recalled.where}", how="${recalled.how}")`);

    // AND THE STANDING LINE IS OUTSIDE THE SHEET. This is what makes moving the
    // controls safe: behind a sheet nobody has open, a filter is invisible, and
    // an invisible filter is an app that looks broken.
    await page.click('#sheet-situation-close');
    await page.waitForSelector('#sheet-situation', { state: 'hidden' });
    const noteVisible = await page.evaluate(() => {
      const n = document.querySelector('#how-long-note');
      return Boolean(n && !n.hidden && (n.textContent ?? '').trim().length > 0);
    });
    (noteVisible ? pass : fail)(
      `${theme}/situation: with the sheet CLOSED, the line still says the list is narrowed`);

    // Forget it, and put both back so every state after this sees everything.
    await page.click('#situation-open');
    await page.waitForSelector('#sheet-situation[open]');
    await page.click('#situation-list .ghost');
    await page.waitForTimeout(250);
    const goneCount = await page.locator('#situation-list li').count();
    (goneCount === 0 ? pass : fail)(
      `${theme}/situation: forgetting one takes it off the list (${goneCount} left)`);
    await page.selectOption('#how-long', '');
    await page.waitForSelector('#how-long-note', { state: 'hidden' });
    // AND CLOSED BEHIND US. A modal dialog makes everything behind it inert,
    // and an inert element is neither hidden nor disabled — so the next block's
    // click does not fail, it TIMES OUT, which reads as a broken control rather
    // than as a sheet left open. This file already carries that lesson about
    // `#build-version`; leaving this one open reproduced it exactly.
    await page.click('#sheet-situation-close');
    await page.waitForSelector('#sheet-situation', { state: 'hidden' });
    // WHO IT IS FOR (2.6.0, ADR-0096), driven the same way and for the same
    // reason: a role planted into the store would prove the readout renders and
    // nothing about whether one can be made. Three claims, in the order they can
    // fail: the write path works; the door appears only once a role EXISTS (it
    // is `hidden` before, so a registry entry naming it would otherwise be a
    // false receipt); and the readout states the unnamed remainder rather than
    // letting the named roles read as the whole store.
    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    const doorBefore = await page.evaluate(() =>
      document.querySelector('#roles-open')?.hidden ?? null);
    (doorBefore === true ? pass : fail)(
      `${theme}/roles: the readout door is absent until a role exists (hidden=${doorBefore})`);
    await page.fill('#detail-role', 'Parent');
    await page.click('#detail-role-set');
    await page.waitForSelector('#detail-role-list li');
    await page.click('#detail-close');
    await page.waitForSelector('#roles-open:not([hidden])');
    await auditContrast(page, 'where the attention is', theme);
    await auditSeparationAndTargets(page, 'where the attention is', theme);
    await auditFocusRings(page, 'where the attention is', theme);
    await page.click('#roles-open');
    await page.waitForSelector('#sheet-roles[open]');
    await auditContrast(page, 'roles open', theme);
    await auditAxe(page, 'roles open', theme);
    await auditNames(page, 'roles open', theme);
    await auditSeparationAndTargets(page, 'roles open', theme);
    await auditFocusRings(page, 'roles open', theme, ['#sheet-roles-close']);
    const readout = await page.evaluate(() => ({
      rows: [...document.querySelectorAll('#roles-list .roles-row')].map(r => ({
        name: r.querySelector('.roles-name')?.textContent?.trim(),
        held: r.querySelector('.roles-held')?.textContent?.trim(),
      })),
      unnamed: document.querySelector('#roles-unnamed')?.textContent?.trim() ?? '',
      words: document.querySelector('#roles-words')?.textContent?.trim() ?? '',
    }));
    (readout.rows.some(r => r.name === 'Parent' && r.held === '1 thing') ? pass : fail)(
      `${theme}/roles open: the role somebody just made is listed, carrying what they attached it to`);
    // WORDS AND NOT A BARE INTEGER — "3" beside a name reads as a score.
    (readout.rows.every(r => /thing|nothing/.test(r.held ?? '')) ? pass : fail)(
      `${theme}/roles open: every count is words, never a bare number`);
    (/no named role/.test(readout.unnamed) ? pass : fail)(
      `${theme}/roles open: the unnamed remainder is STATED — on a real store it is the biggest number`);
    (/not a target/.test(readout.words) ? pass : fail)(
      `${theme}/roles open: it says out loud that it is not a score (law 7 is what makes it legal)`);

    // NO BAR, NO METER, NO PROGRESS ELEMENT anywhere on this surface. A bar is a
    // machine for implying you are behind (law 5), and the check is structural
    // rather than a promise in a comment.
    const bars = await page.evaluate(() =>
      document.querySelectorAll('#sheet-roles progress, #sheet-roles meter, #sheet-roles [role="progressbar"]').length);
    (bars === 0 ? pass : fail)(
      `${theme}/roles open: no bar, meter or progressbar on the readout (${bars} found)`);
    await page.click('#sheet-roles-close');
    await page.waitForSelector('#sheet-roles[open]', { state: 'detached' });

    // WHAT YOU ARE WORKING TOWARD (2.18.0, the plan's phase 2 step 3).
    //
    // BUILT THROUGH THE APP, like the roles readout above and for the same
    // reason: a goal planted into the store proves the list renders and nothing
    // about whether one can be made. Four claims, in the order they can fail —
    // the door is absent until a horizon EXISTS; the container picker makes a
    // goal; the goal is listed with what it is carrying; and **it is still
    // listed once that work is finished**.
    //
    // THAT LAST ONE IS THE ASSERTION THAT MATTERS. Everything else here would
    // render identically if the list quietly dropped horizons with nothing under
    // them — which is exactly what Review does, correctly, and exactly what this
    // surface must not do. A goal whose work is done is the moment it would
    // vanish, and it is the moment somebody most needs to see it.
    const hDoorBefore = await page.evaluate(() =>
      document.querySelector('#horizons-open')?.hidden ?? null);
    (hDoorBefore === true ? pass : fail)(
      `${theme}/horizons: the door is absent until a horizon exists (hidden=${hDoorBefore})`);
    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.fill('#detail-parent-filter', 'A calmer house');
    await page.waitForSelector('#detail-parent-create:not([hidden])');
    await page.selectOption('#detail-parent-kind', 'goal');
    await page.click('#detail-parent-create');
    await page.waitForTimeout(250);
    await page.click('#detail-close');
    await page.waitForSelector('#detail', { state: 'hidden' });
    await page.waitForSelector('#horizons-open:not([hidden])');
    await auditContrast(page, 'what you are working toward', theme);
    await auditSeparationAndTargets(page, 'what you are working toward', theme);
    await auditFocusRings(page, 'what you are working toward', theme);
    await page.click('#horizons-open');
    await page.waitForSelector('#sheet-horizons[open]');
    await auditContrast(page, 'horizons open', theme);
    await auditAxe(page, 'horizons open', theme);
    await auditNames(page, 'horizons open', theme);
    await auditSeparationAndTargets(page, 'horizons open', theme);
    await auditFocusRings(page, 'horizons open', theme, ['#sheet-horizons-close']);
    const horizons = await page.evaluate(() => ({
      rows: [...document.querySelectorAll('#horizons-list .roles-row')].map(r => ({
        name: r.querySelector('.roles-name')?.textContent?.trim(),
        held: r.querySelector('.roles-held')?.textContent?.trim(),
      })),
      words: document.querySelector('#horizons-words')?.textContent?.trim() ?? '',
    }));
    const goalRow = horizons.rows.find(r => /A calmer house/.test(r.name ?? ''));
    (goalRow ? pass : fail)(
      `${theme}/horizons open: the goal somebody just made is listed`);
    (/ — goal/.test(goalRow?.name ?? '') ? pass : fail)(
      `${theme}/horizons open: the row says what KIND it is — a list of bare titles is a list of projects`);
    (/1 thing under it/.test(goalRow?.held ?? '') ? pass : fail)(
      `${theme}/horizons open: carrying the thing it was made around ("${goalRow?.held ?? ''}")`);
    (/no rhythm set/.test(goalRow?.held ?? '') ? pass : fail)(
      `${theme}/horizons open: and the absence of a rhythm is STATED, not left blank`);
    (horizons.rows.every(r => /thing|nothing/.test(r.held ?? '')) ? pass : fail)(
      `${theme}/horizons open: every count is words, never a bare number`);
    (/not a target/.test(horizons.words) ? pass : fail)(
      `${theme}/horizons open: it says out loud that it is not a score (law 7 again)`);
    await page.click('#sheet-horizons-close');
    await page.waitForSelector('#sheet-horizons', { state: 'hidden' });

    // AND NOW FINISH THE WORK UNDER IT. The goal must stay on the list holding
    // nothing — the state Review raises as an exception and caps at three, and
    // the state this surface exists to render as an ordinary fact.
    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.click('#detail-done');
    await page.waitForTimeout(250);
    await page.click('#detail-close');
    await page.waitForSelector('#detail', { state: 'hidden' });
    await page.click('#horizons-open');
    await page.waitForSelector('#sheet-horizons[open]');
    const after = await page.evaluate(() =>
      [...document.querySelectorAll('#horizons-list .roles-row')].map(r => ({
        name: r.querySelector('.roles-name')?.textContent?.trim(),
        held: r.querySelector('.roles-held')?.textContent?.trim(),
      })));
    const emptied = after.find(r => /A calmer house/.test(r.name ?? ''));
    (emptied ? pass : fail)(
      `${theme}/horizons emptied: the goal is STILL LISTED once its work is finished`);
    (/nothing under it yet/.test(emptied?.held ?? '') ? pass : fail)(
      `${theme}/horizons emptied: and it says so plainly ("${emptied?.held ?? ''}")`);
    await auditContrast(page, 'horizons open', theme);
    await auditNames(page, 'horizons open', theme);
    await page.click('#sheet-horizons-close');
    await page.waitForSelector('#sheet-horizons', { state: 'hidden' });

    // Back to everywhere, so every state after this sees the whole list. The
    // chooser lives in `#sheet-situation` since 2.21.0, so this opens it, sets
    // it and closes it again rather than reaching for a control on the shell.
    await page.click('#situation-open');
    await page.waitForSelector('#sheet-situation[open]');
    await page.selectOption('#where', '');
    await page.click('#sheet-situation-close');
    await page.waitForSelector('#sheet-situation', { state: 'hidden' });
    await page.waitForSelector('#where-note', { state: 'hidden' });

    // State 3e: the detail sheet — the surface that makes this a planner.
    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    // Driven with a day PICKED AND NOT KEPT (1.38.2), because that is the only
    // state in which the "not kept yet" line exists to be measured. `.detail-hint`
    // is already in the registry as a class, so the line is covered the moment it
    // is visible — and left hidden it would be a registry entry matching nothing,
    // which is the false receipt `#nextup-left` cost a release for.
    await page.fill('#detail-date', '2027-03-04');
    await auditContrast(page, 'detail sheet', theme);
    await auditAxe(page, 'detail sheet', theme);
    await auditNames(page, 'detail sheet', theme);
    // WHICH KIND OF WANT (2.23.0). The six-value field was dead code in the
    // shipped app: both routes a person uses wrote `read`, so the Menu's
    // six-way grouping rendered one group on every store. Asserted rather than
    // assumed — a picker that renders and is ignored looks identical to one
    // that works.
    const catOptions = await page.locator('#detail-menu-category option').count();
    (catOptions === 6 ? pass : fail)(
      `${theme}/detail sheet: the Menu category offers all six (${catOptions})`);
    ((await page.locator('#detail-menu-category').inputValue()) === 'read' ? pass : fail)(
      `${theme}/detail sheet: and defaults to read, so the common case is one tap`);
    await auditSeparationAndTargets(page, 'detail sheet', theme);
    await auditFocusRings(page, 'detail sheet', theme, ['#detail-date-set', '#detail-close', '#detail-feeds']);
    // Put the field back, so the states after this one meet an ordinary sheet
    // rather than one carrying a half-made decision.
    await page.fill('#detail-date', '');

    // State 3e-a: the arrangement controls. Reached the way a person reaches
    // them — give the thing a rhythm, which makes it an upkeep, and the group
    // that asks whether it runs without you appears.
    await page.fill('#detail-every', '30');
    await page.fill('#detail-slack', '7');
    await page.click('#detail-repeat-set');
    await page.waitForSelector('#detail-arrangement-group:not([hidden])');
    await auditContrast(page, 'arrangement group', theme);
    await auditAxe(page, 'arrangement group', theme);
    await auditNames(page, 'arrangement group', theme);
    await auditSeparationAndTargets(page, 'arrangement group', theme);
    await auditFocusRings(page, 'arrangement group', theme, ['#detail-arrangement-set']);

    // WHERE IT STANDS AND WHAT WOULD CHANGE IT (3.18.0), written the way a
    // person writes them, and then READ BACK — a box that accepts text and
    // stores nothing looks identical to one that works, which is why the
    // assertion is on the value after a reopen rather than on the click.
    await page.click('#detail-arrangement-set');
    await page.waitForTimeout(200);
    await page.fill('#detail-stands', 'Out to advert, closes in a fortnight');
    await page.click('#detail-stands-set');
    await page.waitForTimeout(220);
    await page.fill('#detail-changes', 'The post is released, or the advert closes');
    await page.click('#detail-changes-set');
    await page.waitForTimeout(220);
    const wrote = await page.evaluate(() => ({
      stands: document.querySelector('#detail-stands')?.value ?? '',
      changes: document.querySelector('#detail-changes')?.value ?? '',
      // `#detail-live`, NOT `#status`. The sheet announces into its own live
      // region; `#status` is the capture line and was still holding "Held. It
      // will come back to you." from an entirely different action — a true
      // reading of the wrong element, which is the shape that makes an
      // assertion look broken when the app is right.
      said: document.querySelector('#detail-live')?.textContent ?? '',
    }));
    (/Out to advert/.test(wrote.stands) ? pass : fail)(
      `${theme}/arrangement group: where it stands is kept ("${wrote.stands.slice(0, 40)}")`);
    (/post is released/.test(wrote.changes) ? pass : fail)(
      `${theme}/arrangement group: and so is the condition ("${wrote.changes.slice(0, 40)}")`);
    // THE NEGATIVE ONE IS THE ASSERTION THAT MATTERS. Both boxes render
    // identically whether or not the app has quietly taken on watching for the
    // condition, and it has not — it cannot see the reader's world. The
    // confirmation says so at the moment of writing rather than leaving them to
    // find out by waiting.
    (/will not tell you/.test(wrote.said) ? pass : fail)(
      `${theme}/arrangement group: and it says the app will not watch for it ("${wrote.said.slice(0, 56)}")`);
    await auditContrast(page, 'arrangement group', theme);
    await auditNames(page, 'arrangement group', theme);
    await auditSeparationAndTargets(page, 'arrangement group', theme);
    await page.click('#detail-close');
    await page.waitForSelector('#detail', { state: 'hidden' });

    // AND THE LIST THE PROJECTION FINALLY HAS. The door exists only once an
    // arrangement does, which the step above has just made — so this is reached
    // the way a finger reaches it rather than by naming the sheet.
    await page.waitForSelector('#arrangements-open:not([hidden])');
    await page.click('#arrangements-open');
    await page.waitForSelector('#sheet-arrangements[open]');
    const room = await page.evaluate(() => ({
      rows: document.querySelectorAll('#arrangements-list .roles-name').length,
      said: document.querySelector('#arrangements-words')?.textContent ?? '',
      lines: [...document.querySelectorAll('#arrangements-list .arrangement-said')]
        .map(p => p.textContent ?? '').join(' | '),
    }));
    (room.rows > 0 ? pass : fail)(
      `${theme}/running without you: the list has what was just made (${room.rows})`);
    (/Stands:/.test(room.lines) && /Changes:/.test(room.lines) ? pass : fail)(
      `${theme}/running without you: and carries both written lines ("${room.lines.slice(0, 60)}")`);
    (!/\bdone\b|\btick\b|\bcomplete\b/i.test(room.said + room.lines) ? pass : fail)(
      `${theme}/running without you: nothing on it offers to finish a state of affairs`);
    await auditContrast(page, 'running without you', theme);
    await auditAxe(page, 'running without you', theme);
    await auditNames(page, 'running without you', theme);
    await auditSeparationAndTargets(page, 'running without you', theme);
    await auditFocusRings(page, 'running without you', theme, ['#arrangements-list .roles-name']);
    await page.click('#sheet-arrangements-close');
    await page.waitForSelector('#sheet-arrangements', { state: 'hidden' });
    // Back to the sheet the states after this one expect to be standing on.
    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });

    // 1.4.0: the per-node history, open. The item on this sheet was captured,
    // so its record holds a cure — the quiet indented line is guaranteed
    // present, and the registry's .log-cure selector has something real to
    // measure (a selector matching nothing visible FAILS, by design).
    await page.click('#detail-history summary');
    await page.waitForFunction(() =>
      document.querySelectorAll('#detail-history-lines .log-line').length > 0);
    await auditContrast(page, 'detail sheet, history open', theme);
    await auditAxe(page, 'detail sheet, history open', theme);
    await auditNames(page, 'detail sheet, history open', theme);
    await auditSeparationAndTargets(page, 'detail sheet, history open', theme);
    await auditFocusRings(page, 'detail sheet, history open', theme);
    await page.click('#detail-history summary');

    // B-04's hardest case, for the densest surface in the app.
    // THE FLOOR AT EVERY SIZE THE APP ITSELF OFFERS (2.8.0, ADR-0098).
    //
    // The 44px floor was measured at ONE root size — whatever the runner happened
    // to use — and `--target` was `2.75rem`, so it shrank with the reader. At a
    // root of 87.5%, an ordinary browser setting AND the second option in this
    // release's own size control, 24 visible controls fell below 44px: the whole
    // header, the capture box, the skip link. At 75% they were 33-34px.
    //
    // A ceiling-and-floor check that only runs at 100% is a check that measured
    // the runner rather than the app. This drives the SMALLEST size the control
    // offers, because that is the one that can break the floor.
    for (const root of ['85%', '92.5%']) {
      await page.evaluate((r) => { document.documentElement.style.fontSize = r; }, root);
      await page.waitForTimeout(80);
      const short = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll(
          'button, input, select, textarea, summary, a[href], [role=button], [tabindex]:not([tabindex="-1"])')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.height < 44 || r.width < 24) {
            out.push(`${el.tagName.toLowerCase()}#${el.id || el.className} ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
        }
        return out;
      });
      (short.length === 0 ? pass : fail)(
        `${theme}/root ${root}: a finger's target still clears 44px${short.length ? ` — ${short.slice(0, 6).join(', ')}` : ''}`);
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });

    // AND THE OTHER WAY THE TEXT GETS BIGGER (2.9.1).
    //
    // Everything above moves the ROOT, which is what this app's own size
    // control does. A browser's own text setting does not: it grows the
    // INHERITED text and leaves the root where it was, and so does a
    // minimum-font-size and so does a user stylesheet. Simulated here by
    // growing `body` rather than the root, which is exactly that shape.
    //
    // Reported from a device as "changing the font size does not resize
    // anything but the letters", and it was true: `--target` and every
    // control's padding were `rem`, so at 150% text a button's words went
    // ×1.50 inside a box that went ×1.27 — and `#capture` and the offer's own
    // title, both carrying an explicit `rem` font-size, did not move AT ALL.
    //
    // The assertion is that a control's box tracks ITS OWN text. Not that it is
    // big enough — a box can clear 44px while its words spill past its padding —
    // so this measures growth AND overflow together.
    const beforeGrow = await page.evaluate(() => {
      const pick = ['#capture', '#gauge', '#open-more', '#contents-open'];
      return Object.fromEntries(pick.map(sel => {
        const el = document.querySelector(sel);
        return [sel, el && el.checkVisibility()
          ? { h: el.getBoundingClientRect().height, f: parseFloat(getComputedStyle(el).fontSize) }
          : null];
      }));
    });
    await page.evaluate(() => { document.body.style.fontSize = '150%'; });
    await page.waitForTimeout(120);
    const afterGrow = await page.evaluate(() => {
      const pick = ['#capture', '#gauge', '#open-more', '#contents-open'];
      const boxes = Object.fromEntries(pick.map(sel => {
        const el = document.querySelector(sel);
        return [sel, el && el.checkVisibility()
          ? { h: el.getBoundingClientRect().height, f: parseFloat(getComputedStyle(el).fontSize) }
          : null];
      }));
      const spill = [];
      for (const el of document.querySelectorAll('button, input, a[href], [role=button]')) {
        if (!el.checkVisibility() || el.closest('dialog')) continue;
        if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) {
          spill.push(`${el.tagName.toLowerCase()}#${el.id || el.className}`);
        }
      }
      return { boxes, spill };
    });
    // NON-EMPTY FIRST, so deleting the controls cannot leave this loop with
    // nothing to iterate and a green line about a feature that is gone
    // (hub LESSONS 100).
    const grown = Object.keys(beforeGrow).filter(k => beforeGrow[k] && afterGrow.boxes[k]);
    (grown.length >= 4 ? pass : fail)(
      `${theme}/text grown by the browser: the sample controls are on screen to be measured (${grown.length} of 4)`);
    for (const sel of grown) {
      const a = beforeGrow[sel], b = afterGrow.boxes[sel];
      const textGrew = b.f / a.f;
      const boxGrew = b.h / a.h;
      // The box need not match the text exactly — a wrapping label grows faster
      // — but it must not stand still while the words inside it get bigger.
      (boxGrew >= textGrew - 0.12 ? pass : fail)(
        `${theme}/text grown by the browser: ${sel}'s box follows its own text `
        + `(text ×${textGrew.toFixed(2)}, box ×${boxGrew.toFixed(2)})`);
    }
    (afterGrow.spill.length === 0 ? pass : fail)(
      `${theme}/text grown by the browser: nothing overflows its own control`
      + `${afterGrow.spill.length ? ` — ${afterGrow.spill.slice(0, 6).join(', ')}` : ''}`);
    await page.evaluate(() => { document.body.style.fontSize = ''; });
    await page.waitForTimeout(80);

    // AND THE FRAME NEVER CUTS ITS OWN CONTENT IN HALF (2.9.2, ADR-0101).
    //
    // 2.9.0 capped the frame at half the viewport so it could not crush the
    // runway at large text. `overflow-y: auto` on a capped box means that past
    // the cap it scrolls INSIDE ITSELF — and what a reader saw, reported from a
    // device, was the proof line cut through the middle of its own sentence.
    // Measured at 390px: 474px of content against a 422px cap at 175% browser
    // text, and 468px at the app's own 150%.
    //
    // The frame stands down instead. So the assertion is not "the frame fits" —
    // it is that at EVERY size it either fits or is not a frame, and the proof
    // line is whole either way. Both mechanisms are driven, because they are
    // different code paths through the same threshold.
    const clips = [];
    for (const [how, apply] of [
      ['the browser\'s own text', (v) => { document.body.style.fontSize = v; }],
      ['this app\'s size setting', (v) => { document.documentElement.style.fontSize = v; }],
    ]) {
      for (const size of ['125%', '150%', '175%', '200%']) {
        await page.evaluate(apply, size);
        await page.waitForTimeout(180);
        const m = await page.evaluate(() => {
          const f = document.querySelector('.frame');
          const g = document.querySelector('#gauge');
          if (!f || !g) return null;
          const fr = f.getBoundingClientRect(), gr = g.getBoundingClientRect();
          return {
            off: document.documentElement.getAttribute('data-frame') === 'off',
            scrolls: f.scrollHeight > f.clientHeight + 1,
            cut: gr.bottom > fr.bottom + 1 || gr.top < fr.top - 1,
            share: Math.round((f.scrollHeight / window.innerHeight) * 100),
          };
        });
        if (!m) { clips.push(`${how} ${size}: the frame or the proof line is not there to measure`); continue; }
        if (m.cut) clips.push(`${how} ${size}: the proof line is cut by the frame (${m.share}% of the viewport)`);
        if (m.scrolls) clips.push(`${how} ${size}: the frame scrolls inside itself (${m.share}%)`);
        // The other half: it must not merely avoid clipping by growing for ever.
        if (!m.off && m.share > 55) clips.push(`${how} ${size}: the frame is ${m.share}% of the viewport and still up`);
      }
      await page.evaluate(() => {
        document.body.style.fontSize = '';
        document.documentElement.style.fontSize = '';
      });
      await page.waitForTimeout(180);
    }
    (clips.length === 0 ? pass : fail)(
      `${theme}/frame at every text size: it fits or it stands down, and the proof line is never cut`
      + `${clips.length ? ` — ${clips.slice(0, 6).join('; ')}` : ' (8 sizes across both mechanisms)'}`);
    // AND IT DOES STAND DOWN SOMEWHERE, so the loop above cannot pass by the
    // frame simply never being tested at a size that matters (LESSONS 100).
    await page.evaluate(() => { document.body.style.fontSize = '200%'; });
    await page.waitForTimeout(200);
    ((await page.evaluate(() => document.documentElement.getAttribute('data-frame'))) === 'off' ? pass : fail)(
      `${theme}/frame at every text size: and at 200% it has actually stood down`);
    await page.evaluate(() => { document.body.style.fontSize = ''; });
    await page.waitForTimeout(150);

    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const sheetOverflow = await page.evaluate(() => {
      const d = document.querySelector('#detail');
      return d.scrollWidth - d.clientWidth;
    });
    (sheetOverflow <= 1 ? pass : fail)(
      `${theme}/320px @ 200%: detail sheet horizontal overflow ${sheetOverflow}px (must be ≤1)`);
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.setViewportSize({ width: 390, height: 844 });

    // State 3f: dates that have gone by. Give the open item a date five days
    // behind, which is the only way to reach this surface — and the sheet that
    // is already open is the app's own way of doing it, so this exercises the
    // real path rather than seeding the store from the outside.
    const pastKey = await page.evaluate(() =>
      new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10));
    await page.fill('#detail-date', pastKey);
    await page.click('#detail-date-set');
    await page.waitForTimeout(200);
    await page.click('#detail-close');
    await page.waitForSelector('#replan:not([hidden])');
    await auditContrast(page, 'replan', theme);
    await auditAxe(page, 'replan', theme);
    await auditNames(page, 'replan', theme);
    await auditSeparationAndTargets(page, 'replan', theme);
    await auditFocusRings(page, 'replan', theme, ['.replan-open', '.replan-skip']);

    // ONE DATE OFFERS NO BULK ROUTE, and that is a rule rather than an accident:
    // "settle all 1 of them" beside a single card is a second way to press the
    // same thing, on the surface least able to carry noise.
    const bulkAtOne = await page.locator('#replan-bulk').isVisible();
    (bulkAtOne ? fail : pass)(
      `${theme}/replan: with one date gone by there is no all-at-once route`);

    // State 3f-ii: a SECOND passed date, which is what brings the bulk route up
    // (3.9.0). Set through the app's own sheet like the first one, so this walks
    // the real path rather than seeding the store from outside.
    // TWO THINGS STAND BETWEEN THIS AND A SECOND CARD, and the first run found
    // both by failing rather than by being reasoned about.
    //
    // `#cards` lives inside `#held-fold`, the "Every one of them" disclosure,
    // which is closed by default — so seven cards were in the DOM and none was
    // visible, which reads as "there is no second item" when the truth is that
    // the drawer is shut. And `#held` belongs to a STANCE: if the walk is inside
    // a job, that whole section is off the screen and opening the fold changes
    // nothing.
    //
    // Both are taken the way a finger takes them — leave the job, then press the
    // summary. A fold only script can open is not the route anybody uses, which
    // is the rule the "with cards" state above already follows.
    // AND THE THIRD THING, which the diagnostic below found after two runs of
    // guessing: "Just one thing" was still on. `body[data-plain="1"]` sets
    // `display:none` on `#held`, so seven cards sit in the DOM, none of them
    // visible, and the count says seven. It is a persisted module — an event in
    // the log, not a view flag — so it survives everything the walk does between
    // turning it on and here.
    //
    // Turned off through the app's own control, and SAID, because a walk that
    // silently repairs the state it found is a walk that stops describing the
    // app. If this line ever prints on a run where nothing turned it on, that is
    // a defect and not a tidy-up.
    await page.click('.replan-open');
    await page.waitForSelector('#replan-sheet[open]');
    await auditContrast(page, 'replan sheet', theme);
    await auditAxe(page, 'replan sheet', theme);
    await auditNames(page, 'replan sheet', theme);
    await auditSeparationAndTargets(page, 'replan sheet', theme);
    await auditFocusRings(page, 'replan sheet', theme,
      ['.replan-choice', '#replan-new-date', '.replan-set', '#replan-close']);

    // The REFUSED state: press Set with an empty date box. No walk rendered this
    // before, so the one message a person sees at the moment they are already
    // stuck went unmeasured (audit).
    await page.click('.replan-set');
    await page.waitForSelector('#replan-sheet-error:not([hidden])');
    await auditContrast(page, 'replan sheet, refused', theme);
    await auditAxe(page, 'replan sheet, refused', theme);
    await auditFocusRings(page, 'replan sheet, refused', theme);
    // The wordiest surface in the app: five options, each a label over a hint,
    // one of them carrying a date box. If anything overflows sideways at 320px
    // and 200%, it is this.
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const replanOverflow = await page.evaluate(() => {
      const d = document.querySelector('#replan-sheet');
      return d.scrollWidth - d.clientWidth;
    });
    (replanOverflow <= 1 ? pass : fail)(
      `${theme}/320px @ 200%: replan sheet horizontal overflow ${replanOverflow}px (must be ≤1)`);
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.click('#replan-close');

    // State 3d2: a worry, and the question it is asked first.
    await openViaContents(page, 'sheet-bother-entry');
    await page.waitForSelector('#bother-text');
    await auditContrast(page, 'bother entry', theme);
    await auditNames(page, 'bother entry', theme);
    await auditSeparationAndTargets(page, 'bother entry', theme);
    await auditFocusRings(page, 'bother entry', theme,
      ['#bother-text', '#sheet-bother-entry-close']);
    await page.fill('#bother-text', 'the thing with the roof');
    await page.click('#bother-form button[type=submit]');
    await page.waitForSelector('#bother:not([hidden])');
    await auditContrast(page, 'bother', theme);
    await auditAxe(page, 'bother', theme);
    await auditNames(page, 'bother', theme);
    await auditSeparationAndTargets(page, 'bother', theme);
    await auditFocusRings(page, 'bother', theme, ['.bother-choice']);
    // Three stacked choices, each a label over a hint, at 320px and 200%.
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const botherOver = await page.evaluate(() => {
      const d = document.querySelector('#bother');
      return d.scrollWidth - d.clientWidth;
    });
    (botherOver <= 1 ? pass : fail)(
      `${theme}/320px @ 200%: bother flow horizontal overflow ${botherOver}px (must be ≤1)`);
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.bother-choice', { hasText: 'Not mine to carry' }).first().click();
    await page.waitForTimeout(300);

    // State 3e1: the Menu. Reached by routing something to Someday, which is the
    // only way anything gets there.
    await page.fill('#capture', 'a book to read');
    await page.click('#capture-form button[type=submit]');
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
    await page.waitForSelector('#triage:not([hidden]) .route');
    for (let i = 0; i < 12; i++) {
      // WHICH PASS, asked of the PROMPT (1.25.0). This read "break once a hint
      // appears", because heat cards had none and clarify cards did — until the
      // way past a card arrived carrying one on both passes. The heat card then
      // looked like a clarify card and the walk hunted for a route that is not
      // on it. The prompt names the pass outright.
      const p = await page.locator('#triage-prompt').textContent();
      if (!/hot or cold/i.test(p || '')) break;
      await enterStance(page, 'triage');
      await page.locator('#triage-actions .route', { hasText: 'Hot' }).first().click();
      await page.waitForTimeout(120);
    }
    await enterStance(page, 'triage');
    await page.locator('#triage-actions .route', { hasText: 'Someday' }).first().click();
    await page.waitForTimeout(300);
    // The Menu, open — ITS OWN SHEET since 2.0.7 (ADR-0089), so a dialog state,
    // measured as one. `#menu-open` left this state's focus list with the fold:
    // it is on the surface underneath, which a modal makes inert, so focusing it
    // here would measure a ring nobody can reach from this state. It is still
    // measured where a reader can press it.
    await page.waitForSelector('#menu-open:not([hidden])');
    await page.click('#menu-open');
    await page.waitForSelector('#sheet-menu[open]');
    await auditContrast(page, 'menu open', theme);
    await auditAxe(page, 'menu open', theme);
    await auditNames(page, 'menu open', theme);
    await auditSeparationAndTargets(page, 'menu open', theme);
    await auditFocusRings(page, 'menu open', theme, ['.menu-item', '#sheet-menu-close']);
    await page.click('#sheet-menu-close');    // closed again, so later states are clean
    await page.waitForSelector('#sheet-menu[open]', { state: 'detached' });

    // State 3e2: coming back. Reached by ageing the whole log, which is the only
    // honest way — `lastActivityAt` is a maximum, so one backdated event proves
    // nothing. The snapshot is its own store and has to go with it.
    await page.evaluate(async () => {
      const db = await new Promise((res) => { const r = indexedDB.open('quietkeep'); r.onsuccess = () => res(r.result); });
      const all = await new Promise((res) => {
        const tx = db.transaction('events', 'readonly').objectStore('events').getAll();
        tx.onsuccess = () => res(tx.result);
      });
      const shift = 15 * 86400000;
      const store = db.transaction('events', 'readwrite').objectStore('events');
      for (const e of all) {
        const moved = { ...e, at: new Date(Date.parse(e.at) - shift).toISOString() };
        if (moved.payload && typeof moved.payload === 'object') {
          moved.payload = { ...moved.payload };
          for (const k of ['at', 'since', 'startedAt', 'endedAt', 'returnAt']) {
            if (typeof moved.payload[k] === 'string' && !Number.isNaN(Date.parse(moved.payload[k]))) {
              moved.payload[k] = new Date(Date.parse(moved.payload[k]) - shift).toISOString();
            }
          }
        }
        store.put(moved);
      }
      await new Promise((res) => { store.transaction.oncomplete = res; });
      if (db.objectStoreNames.contains('snapshots')) {
        const snaps = db.transaction('snapshots', 'readwrite').objectStore('snapshots');
        snaps.clear();
        await new Promise((res) => { snaps.transaction.oncomplete = res; });
      }
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('body[data-ready=true]');
    await page.waitForSelector('#reentry:not([hidden])');
    await auditContrast(page, 'reentry', theme);
    await auditAxe(page, 'reentry', theme);
    await auditNames(page, 'reentry', theme);
    await auditSeparationAndTargets(page, 'reentry', theme);
    await auditFocusRings(page, 'reentry', theme, ['#reentry-amnesty-go', '#reentry-dismiss']);
    // B-04's hardest case for the surface someone meets after a fortnight away —
    // the one screen where a horizontal scrollbar would be least forgivable.
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const reOver = await page.evaluate(() => {
      const d = document.querySelector('#reentry');
      return d.scrollWidth - d.clientWidth;
    });
    (reOver <= 1 ? pass : fail)(
      `${theme}/320px @ 200%: re-entry greeting horizontal overflow ${reOver}px (must be ≤1)`);
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.click('#reentry-dismiss');
    await page.waitForTimeout(200);

    // State 3f-: the comms sweep. Turned on through the panel, made due the way
    // the smoke walk does it, then reached the only way it can be reached — by
    // coming out of a focus session.
    await openSurface(page, 'sheet-group-extras');
    await page.waitForSelector('#comms-start:not([hidden])');
    await auditContrast(page, 'comms opt-in', theme);
    await auditNames(page, 'comms opt-in', theme);
    await auditSeparationAndTargets(page, 'comms opt-in', theme);
    await auditFocusRings(page, 'comms opt-in', theme, ['#comms-start']);
    await page.click('#comms-start');
    await page.waitForTimeout(350);
    await openSurface(page, 'about');
    await page.click('#about-close');
    await page.evaluate(async () => {
      const db = await new Promise((res) => { const r = indexedDB.open('quietkeep'); r.onsuccess = () => res(r.result); });
      const all = await new Promise((res) => {
        const tx = db.transaction('events', 'readonly').objectStore('events').getAll();
        tx.onsuccess = () => res(tx.result);
      });
      const created = all.find(e => e.kind === 'node.field.set' && e.payload?.field === 'comms-sweep');
      if (!created) return;
      const older = new Date(Date.now() - 6 * 86400000).toISOString();
      const store = db.transaction('events', 'readwrite').objectStore('events');
      for (const e of all) if (e.kind === 'done.marked' && e.node === created.node) store.delete(e.id);
      store.add({ id: 'a11y-comms', vault: created.vault, at: older, device: 'a11y', seq: 900001,
        kind: 'done.marked', node: created.node, payload: { at: older } });
      await new Promise((res) => { store.transaction.oncomplete = res; });
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForSelector('body[data-ready=true]');
    await enterStance(page, 'held');
    await page.locator('#cards .card-focus').first().click();
    await page.waitForSelector('#focus:not([hidden])');
    await page.click('#focus-stop');
    await page.waitForSelector('#focus-sheet[open]');
    await page.click('#focus-sheet-stop');
    await page.waitForSelector('#comms:not([hidden])');
    await auditContrast(page, 'comms ramp', theme);
    await auditAxe(page, 'comms ramp', theme);
    await auditNames(page, 'comms ramp', theme);
    await auditSeparationAndTargets(page, 'comms ramp', theme);
    await auditFocusRings(page, 'comms ramp', theme, ['#comms-done', '#comms-later']);
    await page.click('#comms-later');
    await page.waitForTimeout(250);

    // State 3f0: carrying. Reached the way a person reaches it — make a container,
    // then say somebody else is doing it.
    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.click('#detail-make-project');
    await page.waitForTimeout(250);
    await page.click('#detail-track');
    await page.waitForTimeout(250);
    const owedBy = await page.evaluate(() =>
      new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
    await page.fill('#detail-suspense', owedBy);
    await page.click('#detail-suspense-set');
    await page.waitForTimeout(250);
    await auditContrast(page, 'detail sheet, carried', theme);
    await auditAxe(page, 'detail sheet, carried', theme);
    await auditNames(page, 'detail sheet, carried', theme);
    await auditSeparationAndTargets(page, 'detail sheet, carried', theme);
    await auditFocusRings(page, 'detail sheet, carried', theme,
      ['#detail-suspense', '#detail-suspense-set']);
    await page.click('#detail-close');
    await page.waitForSelector('#portfolio:not([hidden])');
    await auditContrast(page, 'portfolio', theme);
    await auditAxe(page, 'portfolio', theme);
    await auditNames(page, 'portfolio', theme);
    await auditSeparationAndTargets(page, 'portfolio', theme);
    await auditFocusRings(page, 'portfolio', theme, ['.portfolio-open']);

    // State 3f1: the person lens. Reached the way a person reaches it — route
    // something to "Waiting for", which is the only way to be owed anything.
    await page.fill('#capture', 'the signed form');
    await page.click('#capture-form button[type=submit]');
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
    await page.waitForSelector('#triage:not([hidden]) .route');
    for (let i = 0; i < 12; i++) {
      // WHICH PASS, asked of the PROMPT (1.25.0). This read "break once a hint
      // appears", because heat cards had none and clarify cards did — until the
      // way past a card arrived carrying one on both passes. The heat card then
      // looked like a clarify card and the walk hunted for a route that is not
      // on it. The prompt names the pass outright.
      const p = await page.locator('#triage-prompt').textContent();
      if (!/hot or cold/i.test(p || '')) break;
      await enterStance(page, 'triage');
      await page.locator('#triage-actions .route', { hasText: 'Hot' }).first().click();
      await page.waitForTimeout(120);
    }
    await enterStance(page, 'triage');
    await page.locator('#triage-actions .route', { hasText: 'Waiting for' }).first().click();
    await page.waitForTimeout(300);
    await page.waitForSelector('#people:not([hidden])');
    await auditContrast(page, 'people', theme);
    await auditAxe(page, 'people', theme);
    await auditNames(page, 'people', theme);
    await auditSeparationAndTargets(page, 'people', theme);
    await auditFocusRings(page, 'people', theme, ['.people-open']);

    // AND THE OTHER DIRECTION (2.20.0). Driven through the app rather than
    // seeded: a promise planted into the store proves the list renders and
    // nothing about whether one can be made. Built from a card of its own so a
    // change to the sequence above cannot leave this measuring nothing.
    //
    // THE ASSERTION THAT MATTERS IS THE NEGATIVE ONE. Everything here would
    // render identically if the row carried a duration, and a duration on this
    // side is the ledger `src/requests.ts` says the app exists not to keep. It
    // is checked in the rendered words, not only in the type.
    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.fill('#detail-person', 'Rowan');
    await page.selectOption('#detail-relation', 'promised-to');
    await page.click('#detail-person-set');
    await page.waitForTimeout(250);
    await page.click('#detail-close');
    await page.waitForSelector('#detail', { state: 'hidden' });
    await page.waitForSelector('#people-promised li');
    const promised = await page.evaluate(() => ({
      count: document.querySelector('#people-promised-count')?.textContent?.trim() ?? '',
      rows: [...document.querySelectorAll('#people-promised li')].map(li => ({
        title: li.querySelector('.people-title')?.textContent?.trim() ?? '',
        why: li.querySelector('.people-why')?.textContent?.trim() ?? '',
      })),
    }));
    (promised.rows.some(r => /Rowan/.test(r.why)) ? pass : fail)(
      `${theme}/people other direction: what you said you would do is listed, for whom`);
    (/said you would/.test(promised.count) ? pass : fail)(
      `${theme}/people other direction: and the line says what it is ("${promised.count}")`);
    // WHO IS HERE (2.26.0, entry 24's third axis). Driven HERE and not in the
    // situation block above, because that block runs before anybody has been
    // named and `#with-row` is hidden until somebody has. A registry entry
    // naming a hidden thing is a false receipt, which is what 2.24.0 cost.
    //
    // Three claims in the order they can fail: the chooser appears once a
    // person exists; choosing somebody produces the standing line, which is the
    // only thing telling a reader the offer has been narrowed at all; and
    // clearing it puts everything back, so no state after this is measured
    // through a filter it did not ask for.
    await page.click('#situation-open');
    await page.waitForSelector('#sheet-situation[open]');
    await page.waitForSelector('#with-row:not([hidden])');
    await page.selectOption('#with-who', { label: 'Rowan' });
    await page.waitForSelector('#with-note:not([hidden])');
    const withLine = await page.locator('#with-note').innerText();
    (/Rowan/.test(withLine) ? pass : fail)(
      `${theme}/who is here: the line names who ("${withLine.slice(0, 60)}")`);
    (/nobody named on it/.test(withLine) ? pass : fail)(
      `${theme}/who is here: and says the unattached still show — the default that stops it being a cliff`);
    (!/hidden|\d+ others?\b/i.test(withLine) ? pass : fail)(
      `${theme}/who is here: it states the scope and never a count of what is not shown`);
    await auditContrast(page, 'who is here', theme);
    await auditNames(page, 'who is here', theme);
    await auditSeparationAndTargets(page, 'who is here', theme);
    await auditFocusRings(page, 'who is here', theme, ['#with-who']);
    await page.selectOption('#with-who', '');
    await page.waitForSelector('#with-note', { state: 'hidden' });

    // WHO IS IN IT, AND THE ROOM IT OPENS (3.16.0, ADR-0119).
    //
    // DRIVEN HERE for the same reason the block above is: `#situation-who-row`
    // is hidden until somebody has been named, and `.situation-room` renders
    // only once a saved situation still names a live person. A registry entry
    // for either before that point is a false receipt, which is what 2.24.0
    // cost and what this whole placement rule exists to prevent.
    //
    // The room is opened from the SAVED ROW rather than by calling the sheet
    // directly, because the door existing is half of what is being measured —
    // a surface reachable only by a walk that knows its id is a surface a
    // reader does not have.
    await page.waitForSelector('#situation-who-row:not([hidden])');
    const whoBtn = page.locator('#situation-who .situation-who-one', { hasText: 'Rowan' });
    (await whoBtn.getAttribute('aria-pressed') === 'false' ? pass : fail)(
      `${theme}/who is in it: it starts off, because the filter above was cleared`);
    await whoBtn.click();
    await page.waitForTimeout(150);
    (await whoBtn.getAttribute('aria-pressed') === 'true' ? pass : fail)(
      `${theme}/who is in it: toggling says so in aria-pressed, not only in colour`);
    // SAVED BEFORE THE AUDITS, so the row's `See what is in the room` is on
    // screen for them. It cannot be measured with the room itself: opening the
    // room closes this sheet, so the door is gone by then.
    await page.fill('#situation-name', 'The Rowan catch-up');
    await page.click('#situation-save');
    await page.waitForSelector('#situation-list .situation-room');
    await auditContrast(page, 'who is in it', theme);
    await auditAxe(page, 'who is in it', theme);
    await auditNames(page, 'who is in it', theme);
    await auditSeparationAndTargets(page, 'who is in it', theme);
    await auditFocusRings(page, 'who is in it', theme,
      ['#situation-who .situation-who-one', '#situation-list .situation-room']);

    await page.click('#situation-list .situation-room');
    await page.waitForSelector('#sheet-meeting[open]');
    // AND THE SHEET BEHIND IT IS GONE. `openSheet` calls `closeEverything`
    // because two stacked modals is the overlap ADR-0083 forbids, so the door
    // hands the reader ON rather than piling a surface on a surface — the same
    // thing the roles readout does opening a node. Asserted rather than assumed:
    // the first version of this walk clicked the situation sheet's Close after
    // the room and timed out on a button that was no longer there, which is the
    // behaviour telling the test what it is.
    const behind = await page.evaluate(() =>
      document.querySelector('#sheet-situation')?.hasAttribute('open') ?? null);
    (behind === false ? pass : fail)(
      `${theme}/in the room: the sheet it was opened from is closed, not stacked under it (open=${behind})`);
    const roomWords = await page.locator('#meeting-words').innerText();
    (/in this room/.test(roomWords) ? pass : fail)(
      `${theme}/in the room: it says what is in it ("${roomWords.slice(0, 60)}")`);
    // THE NEGATIVE ONE IS THE ASSERTION THAT MATTERS, exactly as on the promise
    // rows above. Everything here renders identically with a ranking or a
    // duration in it, and a room that graded the people in it would be the
    // ledger `roleLoads` refuses one axis over.
    const roomAll = roomWords + ' ' + await page.locator('#meeting-people').innerText();
    (!/behind|overdue|late|owes|worst|%|\bscore\b/i.test(roomAll) ? pass : fail)(
      `${theme}/in the room: nothing in it grades anybody`);
    (await page.locator('#meeting-people .meeting-thing').count() > 0 ? pass : fail)(
      `${theme}/in the room: what is outstanding is listed, and each of it is a door`);
    await auditContrast(page, 'in the room', theme);
    await auditAxe(page, 'in the room', theme);
    await auditNames(page, 'in the room', theme);
    await auditSeparationAndTargets(page, 'in the room', theme);
    await auditFocusRings(page, 'in the room', theme, ['#meeting-people .meeting-thing']);
    await page.click('#sheet-meeting-close');
    await page.waitForSelector('#sheet-meeting', { state: 'hidden' });
    // No `#sheet-situation-close` here: closing the room lands the reader back
    // on the app, because the sheet it came from was closed on the way in.

    const promisedWordsAll = promised.count + ' ' + promised.rows.map(r => r.why).join(' ');
    (!/\bfor \d|week|day|month|since|ago|yesterday\b/i.test(promisedWordsAll) ? pass : fail)(
      `${theme}/people other direction: NO duration anywhere on it ("${promisedWordsAll.slice(0, 70)}")`);
    await auditContrast(page, 'people, the other direction', theme);
    await auditAxe(page, 'people, the other direction', theme);
    await auditNames(page, 'people, the other direction', theme);
    await auditSeparationAndTargets(page, 'people, the other direction', theme);
    await auditFocusRings(page, 'people, the other direction', theme);

    // And the sheet's write side, with a name actually attached — the state in
    // which the linked-people list renders at all.
    await page.locator('.people-open').first().click();
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.fill('#detail-person', 'Sam');
    await page.click('#detail-person-set');
    await page.waitForTimeout(300);
    await auditContrast(page, 'detail sheet, with someone', theme);
    await auditAxe(page, 'detail sheet, with someone', theme);
    await auditNames(page, 'detail sheet, with someone', theme);
    await auditSeparationAndTargets(page, 'detail sheet, with someone', theme);
    await auditFocusRings(page, 'detail sheet, with someone', theme,
      ['#detail-person', '#detail-relation', '#detail-person-set']);
    await page.click('#detail-close');

    // State 3f2: focus. Reached the way a person reaches it — the control on the
    // row — and audited in all three of its states, including the sheet where
    // the optional five words are asked for.
    await enterStance(page, 'held');
    await page.locator('#cards .card-focus').first().click();
    await page.waitForSelector('#focus:not([hidden])');
    await auditContrast(page, 'focus', theme);
    await auditAxe(page, 'focus', theme);
    await auditNames(page, 'focus', theme);
    await auditSeparationAndTargets(page, 'focus', theme);
    await auditFocusRings(page, 'focus', theme,
      ['#focus-interrupt', '#focus-done', '#focus-stop']);
    // THE AMBIENT HORIZON (2.7.1, collisions entry 7). Its own driven state,
    // because the line renders only when a fixed thing is genuinely ahead today
    // — registering it on plain 'focus' would be a receipt for a line that is
    // usually absent, which is the `#nextup-left` failure this file pays for.
    //
    // ASSERTED AS THE SAME FACT the work surface states, not merely as present.
    // The whole reason it renders here is that the work surface's copy is on a
    // screen the reader has left; two surfaces disagreeing about what is coming
    // would be worse than one of them being silent.
    // DRIVEN INTO EXISTENCE, because the first version of this check was
    // VACUOUS: the walk's store has nothing dated today, so the line was absent,
    // the assertion took its "correctly absent" branch, and the thing the
    // release added was never measured once. That is the false receipt this file
    // already pays for twice — a check that can only pass by the feature being
    // missing is not a check.
    //
    // A due date is stored at the END of the chosen day (`endOfDayKey`), so a
    // date of TODAY is genuinely still ahead while the walk runs, which is what
    // `nextFixedToday` requires. Set through the sheet, on the app's real write
    // path, rather than seeded.
    // EVERY DIALOG CLOSED FIRST. Stopping focus opens `#focus-sheet` to ask for
    // the optional five words, and it intercepts pointer events — the first
    // version of this drive timed out clicking a card underneath it, which is
    // the same modal-in-the-way trap this file's `fillSearch` records.
    await page.evaluate(() => {
      for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
    });
    await page.click('#focus-stop').catch(() => {});
    await page.evaluate(() => {
      for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
    });
    await page.waitForSelector('#focus[hidden]').catch(() => {});
    await enterStance(page, 'held');
    await page.locator('#cards .card-open').first().click();
    await page.waitForSelector('#detail[open]');
    const todayKey = await page.evaluate(() => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    });
    await page.fill('#detail-date', todayKey);
    await page.click('#detail-date-set');
    // THE APP SAYS WHEN THE WRITE HAS LANDED (3.0.2) — ask it rather than
    // guessing 200ms. The guess was right on this machine, in both themes, and
    // wrong on a CI runner in the SECOND one: light passed and dark reported
    // the horizon absent on a byte-identical tree, which is a write that had
    // not finished rather than a line that does not render. The branch below
    // refuses to call that "correctly absent", so it said so — and what it was
    // actually measuring was how busy the runner was.
    //
    // `.catch` and then carry on: if the signal never arrives, the assertion
    // below is what reports it, and swallowing the wait here does not swallow
    // the finding.
    await page.waitForSelector('body[data-settled="true"]', { timeout: 5000 }).catch(() => {});
    await page.click('#detail-close');
    await enterStance(page, 'held');
    await page.locator('#cards .card-focus').first().click();
    await page.waitForSelector('#focus:not([hidden])');
    await page.waitForSelector('#focus-fixed:not([hidden])', { timeout: 5000 }).catch(() => {});
    // AND THE ONE THE BRANCH BELOW ACTUALLY TURNS ON. `#focus-fixed` was waited
    // for and `#nextup-fixed` was sampled, so a horizon that had landed a beat
    // later read as one that never came — the two lines are painted from the
    // same fold and there was no reason to wait for one and not the other.
    await page.waitForSelector('#nextup-fixed:not([hidden])', { timeout: 5000 }).catch(() => {});

    const horizon = await page.evaluate(() => ({
      onFocus: document.querySelector('#focus-fixed')?.hidden === false
        ? document.querySelector('#focus-fixed')?.textContent?.trim() ?? '' : '',
      onWork: document.querySelector('#nextup-fixed')?.hidden === false
        ? document.querySelector('#nextup-fixed')?.textContent?.trim() ?? '' : '',
    }));
    if (horizon.onWork) {
      (horizon.onFocus === horizon.onWork ? pass : fail)(
        `${theme}/focus: the ambient horizon says the same thing here as on the work surface `
        + `("${horizon.onFocus}" vs "${horizon.onWork}")`);
      // A NAME AND NEVER A COUNTDOWN — a countdown is a deadline and adds
      // aversion, which is the entry's own reason for the shape.
      (!/\d+\s*(min|hour|hr|:\d\d)/i.test(horizon.onFocus) ? pass : fail)(
        `${theme}/focus: it names the thing and does not count down to it`);
      await auditContrast(page, 'focus, with a fixed thing ahead', theme);
      await auditFocusRings(page, 'focus, with a fixed thing ahead', theme);
    } else {
      // NOT A PASS. The whole point of driving the date above is that this
      // branch means the drive failed, and reporting that as "correctly absent"
      // is how the check was vacuous in the first place.
      fail(`${theme}/focus: a date was set for today and the ambient horizon still did not render `
        + `— the line the release exists for was not measured`);
    }

    await page.fill('#focus-interrupt', 'the phone rang');
    await page.click('#focus-interrupt-form button[type=submit]');
    await page.waitForSelector('#focus-held:not([hidden])');
    await auditContrast(page, 'focus, interrupted', theme);
    await auditAxe(page, 'focus, interrupted', theme);
    await auditFocusRings(page, 'focus, interrupted', theme);

    await page.click('#focus-stop');
    await page.waitForSelector('#focus-sheet[open]');
    await auditContrast(page, 'focus sheet', theme);
    await auditAxe(page, 'focus sheet', theme);
    await auditNames(page, 'focus sheet', theme);
    await auditSeparationAndTargets(page, 'focus sheet', theme);
    await auditFocusRings(page, 'focus sheet', theme,
      ['#focus-cue', '#focus-sheet-stop', '#focus-sheet-cancel']);
    // B-04's hardest case for a sheet carrying a free-text box.
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const focusSheetOverflow = await page.evaluate(() => {
      const d = document.querySelector('#focus-sheet');
      return d.scrollWidth - d.clientWidth;
    });
    (focusSheetOverflow <= 1 ? pass : fail)(
      `${theme}/320px @ 200%: focus sheet horizontal overflow ${focusSheetOverflow}px (must be ≤1)`);
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.click('#focus-sheet-cancel');
    await page.click('#focus-stop');
    await page.waitForSelector('#focus-sheet[open]');
    await page.click('#focus-sheet-stop');
    await page.waitForTimeout(350);

    // The session close (1.6.0, ADR-0052): stopping raised the strip — the
    // words ARE the surface, so they are measured, then the ramp is lowered
    // so later states see the page as any other act would leave it.
    await page.waitForSelector('#close:not([hidden])');
    await auditContrast(page, 'close strip', theme);
    await auditAxe(page, 'close strip', theme);
    await auditNames(page, 'close strip', theme);
    await auditSeparationAndTargets(page, 'close strip', theme);
    await auditFocusRings(page, 'close strip', theme, ['#close-ok']);
    await page.click('#close-ok');
    await page.waitForSelector('#close', { state: 'hidden' });

    // State 3g: containment and Review (law 4). A container with nothing under
    // it is the app's quietest failure — it reads as an ordinary row everywhere
    // else — so the surface that finally says so must be as calm as the rest of
    // the app. There is no alert colour here to measure, and that absence is the
    // measurement.
    // A SECOND item, because containment needs two things: one to hold, one to
    // be held. The walk had exactly one card, so `.nth(1)` waited thirty seconds
    // for something that was never going to exist.
    await page.fill('#capture', 'a bigger piece of work');
    await page.click('#capture-form button[type=submit]');
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
    await page.waitForSelector('#triage:not([hidden]) .route');
    for (let i = 0; i < 12; i++) {
      // WHICH PASS, asked of the PROMPT (1.25.0). This read "break once a hint
      // appears", because heat cards had none and clarify cards did — until the
      // way past a card arrived carrying one on both passes. The heat card then
      // looked like a clarify card and the walk hunted for a route that is not
      // on it. The prompt names the pass outright.
      const p = await page.locator('#triage-prompt').textContent();
      if (!/hot or cold/i.test(p || '')) break;
      await page.locator('#triage-actions .route', { hasText: 'Hot' }).first().click();       // Hot — advances to clarify
      await page.waitForTimeout(120);
    }
    await enterStance(page, 'triage');
    await page.locator('#triage-actions .route', { hasText: 'Next action' }).first().click();
    await page.waitForTimeout(250);

    await page.click('#cards .card-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.click('#detail-make-project');
    await page.waitForTimeout(250);
    await page.click('#detail-close');
    await page.waitForSelector('#review:not([hidden])');
    await auditContrast(page, 'review', theme);
    await auditAxe(page, 'review', theme);
    await auditNames(page, 'review', theme);
    await auditSeparationAndTargets(page, 'review', theme);
    await auditFocusRings(page, 'review', theme, ['.review-open']);

    // EVERYTHING WORTH A LOOK (3.17.0), and it needs FOUR findings to reach.
    //
    // The total is a door only while there is something behind it — three shown
    // out of three opens a list identical to the one already on screen, so the
    // button is disabled there and this state is unreachable with one finding.
    // Three more cards become containers with nothing under them, the same
    // `stalled` class the first one is: the point is the COUNT passing the cap,
    // not a variety of findings.
    // BACK TO THE HELD STANCE FIRST. Reaching the review state above ends on a
    // closed detail sheet over whatever stance the triage run left, and `#cards`
    // is not on screen there — the first version of this clicked straight into
    // it and spent twelve seconds timing out on an element Playwright could see
    // and could not press.
    await enterStance(page, 'held');
    const spare = await page.locator('#cards .card-open').count();
    (spare >= 3 ? pass : fail)(
      `${theme}/everything worth a look: the store has cards to make containers from (${spare})`);
    // BY INDEX, AND ONLY WHERE THE CONTROL IS ACTUALLY OFFERED. `Make it a
    // project` is not on every card — a thing that is already a container has no
    // need of it, and the first card in the list is the container the state
    // above just made. Taking `.first()` three times therefore reopened it and
    // waited twelve seconds for a button that was correctly absent.
    let made = 0;
    for (let i = 0; i < 12 && made < 3; i++) {
      const cards = await page.locator('#cards .card-open').count();
      if (i >= cards) break;
      await page.locator('#cards .card-open').nth(i).click();
      await page.waitForSelector('#detail[open]');
      await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
      const canMake = await page.locator('#detail-make-project').isVisible().catch(() => false);
      if (canMake) {
        await page.click('#detail-make-project');
        await page.waitForTimeout(220);
        made += 1;
      }
      await page.click('#detail-close');
      await page.waitForSelector('#detail', { state: 'hidden' });
    }
    (made === 3 ? pass : fail)(
      `${theme}/everything worth a look: three more containers were made, so the cap has something behind it (made ${made})`);
    await page.waitForSelector('#review:not([hidden])');
    const capped = await page.evaluate(() => ({
      said: document.querySelector('#review-count')?.textContent ?? '',
      shown: document.querySelectorAll('#review-list .review-open').length,
      door: !(document.querySelector('#review-count')?.disabled ?? true),
    }));
    (capped.shown === 3 ? pass : fail)(
      `${theme}/everything worth a look: the surface still shows three (law 8), got ${capped.shown}`);
    (capped.door ? pass : fail)(
      `${theme}/everything worth a look: and the total became a door once there was more behind it`);
    (/These 3 first/.test(capped.said) ? pass : fail)(
      `${theme}/everything worth a look: which says so out loud ("${capped.said}")`);
    await page.click('#review-count');
    await page.waitForSelector('#sheet-review[open]');
    const whole = await page.evaluate(() => ({
      rows: document.querySelectorAll('#review-all .review-open').length,
      words: document.querySelector('#review-all-words')?.textContent ?? '',
    }));
    // THE ASSERTION THAT MATTERS IS THAT NOTHING IS MISSING FROM IT. The whole
    // point of the door is that a lower-ranked class is later rather than
    // unreachable, and a list that was itself capped would be the same defect
    // one surface further in.
    (whole.rows >= 4 ? pass : fail)(
      `${theme}/everything worth a look: the whole list is not capped (${whole.rows} rows)`);
    (!/first/.test(whole.words) ? pass : fail)(
      `${theme}/everything worth a look: and it does not say "these N first", because these are all of them ("${whole.words}")`);
    await auditContrast(page, 'everything worth a look', theme);
    await auditAxe(page, 'everything worth a look', theme);
    await auditNames(page, 'everything worth a look', theme);
    await auditSeparationAndTargets(page, 'everything worth a look', theme);
    await auditFocusRings(page, 'everything worth a look', theme, ['#review-all .review-open']);
    await page.click('#sheet-review-close');
    await page.waitForSelector('#sheet-review', { state: 'hidden' });

    // And the sheet once something IS inside something — the only state in which
    // `#detail-place` renders at all. Left out, the one line that states a
    // structural fact would go permanently unmeasured, which is exactly the hole
    // an audit found behind `.replan-context`.
    // The SECOND card. The first is the container just made, and a container's
    // own picker excludes itself — so reusing it audited an empty picker and
    // reported the state as unauditable, which is the guard below working.
    await enterStance(page, 'held');
    await page.locator('#cards .card-open').nth(1).click();
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    const canParent = await page.locator('#detail-parent option').count();
    if (canParent > 1) {
      await page.selectOption('#detail-parent', { index: 1 });
      await page.click('#detail-parent-set');
      await page.waitForTimeout(250);
      await page.waitForSelector('#detail-place:not([hidden])');
      await auditContrast(page, 'detail sheet, inside something', theme);
      await auditAxe(page, 'detail sheet, inside something', theme);
      await auditNames(page, 'detail sheet, inside something', theme);
      await auditSeparationAndTargets(page, 'detail sheet, inside something', theme);
      // The place line is a control now (3.6.0), so it owes a ring like every
      // other control. Asserted here rather than assumed from `.linklike`'s
      // declaration: this one sits inside a `<p>` with its own margins, and a
      // ring is clipped by whatever is around it, never by what it is called.
      const placeDoors = await page.locator('.detail-place-open').count();
      (placeDoors === 1 ? pass : fail)(
        `${theme}/detail sheet, inside something: the place line is a control (${placeDoors})`);
      await auditFocusRings(page, 'detail sheet, inside something', theme, ['.detail-place-open']);
    } else {
      fail(`${theme}: nothing could be put under anything — the containment state went unaudited`);
    }

    // The create-in-place offer (1.3.0): typing words that name no existing
    // container reveals the button that makes the project and files this under
    // it. A control someone meets mid-filing is still a control.
    await page.fill('#detail-parent-filter', 'A place that does not exist yet');
    await page.waitForSelector('#detail-parent-create:not([hidden])');
    await auditContrast(page, 'detail sheet, creating a place', theme);
    await auditAxe(page, 'detail sheet, creating a place', theme);
    await auditNames(page, 'detail sheet, creating a place', theme);
    await auditSeparationAndTargets(page, 'detail sheet, creating a place', theme);
    await auditFocusRings(page, 'detail sheet, creating a place', theme, ['#detail-parent-create']);
    await page.fill('#detail-parent-filter', '');

    // The sheet open on a CONTAINER, carrying a cadence (2.17.0). Driven rather
    // than assumed: the three controls in the repeat group say something
    // different here, and 2.16.0 shipped a picker that made goals which the
    // very next control in this same sheet silently converted to upkeeps.
    // Card 0 is the container made by the create-in-place step above.
    await page.click('#detail-close');
    await page.waitForSelector('#detail', { state: 'hidden' });
    await enterStance(page, 'held');
    await page.locator('#cards .card-open').nth(0).click();
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.waitForSelector('#detail-repeat-group:not([hidden])');
    const rWords = await page.locator('#detail-repeat-label').innerText();
    if (!/come back/i.test(rWords)) {
      fail(`${theme}: the sheet on a container still says "${rWords}" — the container wording went unmeasured`);
    }
    await page.fill('#detail-every', '90');
    await page.fill('#detail-slack', '14');
    await page.click('#detail-repeat-set');
    await page.waitForSelector('#detail-repeat-stop:not([hidden])');
    await auditContrast(page, 'detail sheet, a container with a rhythm', theme);
    await auditAxe(page, 'detail sheet, a container with a rhythm', theme);
    await auditNames(page, 'detail sheet, a container with a rhythm', theme);
    await auditSeparationAndTargets(page, 'detail sheet, a container with a rhythm', theme);
    await auditFocusRings(page, 'detail sheet, a container with a rhythm', theme, ['#detail-repeat-stop']);

    // The situation field (1.29.0). Filled first, deliberately: the box is empty
    // in the ordinary case and an empty textarea has colours but no words, so a
    // state audited empty measures a rectangle. What has to be legible is what
    // somebody wrote — which is also the thing the surface exists to show back.
    // The weight, with one chosen — two of its controls only exist then.
    await page.click('#detail-weight-heavy');
    await page.waitForSelector('#detail-weight-clear:not([hidden])');
    await auditContrast(page, 'weight', theme);
    await auditAxe(page, 'weight', theme);
    await auditNames(page, 'weight', theme);
    await auditSeparationAndTargets(page, 'weight', theme);
    await auditFocusRings(page, 'weight', theme, ['#detail-weight-heavy', '#detail-weight-clear']);
    await page.click('#detail-weight-clear');
    await page.waitForFunction(() =>
      document.querySelector('#detail-weight-clear')?.hidden === true);

    await page.fill('#detail-situation', 'after I put the kettle on');
    await auditContrast(page, 'situation field', theme);
    await auditAxe(page, 'situation field', theme);
    await auditNames(page, 'situation field', theme);
    await auditSeparationAndTargets(page, 'situation field', theme);
    await auditFocusRings(page, 'situation field', theme, ['#detail-situation-set']);
    // And the box emptied again, because clearing it is the removal verb and the
    // control has to stay reachable in the state a person removes from.
    await page.fill('#detail-situation', '');

    await auditContrast(page, 'put it down', theme);
    await auditNames(page, 'put it down', theme);
    await auditSeparationAndTargets(page, 'put it down', theme);
    await auditFocusRings(page, 'put it down', theme, ['#detail-release']);
    // And the way back, which only exists once something IS down. Put it down,
    // measure, then pick it straight back up so nothing downstream in the walk
    // inherits an item the reader never chose to stop carrying.
    await page.click('#detail-release');
    await page.waitForSelector('#detail-reclaim:not([hidden])');
    await auditContrast(page, 'picked back up', theme);
    await auditNames(page, 'picked back up', theme);
    await auditSeparationAndTargets(page, 'picked back up', theme);
    await auditFocusRings(page, 'picked back up', theme, ['#detail-reclaim']);
    await page.click('#detail-reclaim');
    await page.waitForFunction(() =>
      document.querySelector('#detail-reclaim')?.hidden === true);
    await page.click('#detail-close');

    // WHAT THIS WAITS FOR (1.30.0), with an anchor actually SET. Two of the
    // group's controls do not exist until there is one, so measuring the group
    // empty would report them as covered without a reader ever having seen them
    // measured.
    //
    // The card is HUNTED rather than assumed. The sheet above happened to be
    // open on a Menu wish, which is demand-free — never finished, so the group
    // is correctly hidden on it — and the first version of this block sat there
    // waiting thirty seconds for a control the app was right not to show. The
    // loop opens cards until it finds one that can actually hold an anchor, and
    // FAILS if none can: a check that quietly passes when it found nothing is
    // not a check.
    const cards = await page.locator('#cards .card-open').count();
    let anchored = false;
    for (let i = 0; i < Math.min(cards, 8) && !anchored; i++) {
      await enterStance(page, 'held');
      await page.locator('#cards .card-open').nth(i).click();
      await page.waitForSelector('#detail[open]');
      await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
      const usable = await page.evaluate(() => {
        const g = document.querySelector('#detail-after-group');
        const opts = document.querySelectorAll('#detail-after option').length;
        return !!g && !g.hidden && opts > 1;
      });
      if (!usable) { await page.click('#detail-close'); continue; }
      await page.selectOption('#detail-after', { index: 1 });
      await page.click('#detail-after-set');
      await page.waitForSelector('#detail-after-now:not([hidden])');
      await auditContrast(page, 'waits for', theme);
      await auditAxe(page, 'waits for', theme);
      await auditNames(page, 'waits for', theme);
      await auditSeparationAndTargets(page, 'waits for', theme);
      await auditFocusRings(page, 'waits for', theme, ['#detail-after-set', '#detail-after-clear']);
      // Put it back, so nothing downstream in the walk inherits an anchor it
      // did not ask for.
      await page.click('#detail-after-clear');
      // `waitForSelector` waits for VISIBLE by default, and a hidden element
      // never becomes visible — waiting on `[hidden]` waits for something that
      // cannot happen. Ask the flag directly.
      await page.waitForFunction(() =>
        document.querySelector('#detail-after-now')?.hidden === true);
      await page.click('#detail-close');
      anchored = true;
    }
    if (!anchored) fail(`${theme}: nothing could be waited for — the anchor state went unaudited`);

    // Sort mode (1.3.0): the picker over a named range, then the conveyor. The
    // container parented above guarantees an "Everything under…" choice exists,
    // so neither state can silently audit an empty surface.
    // Stage a real range first: the store at this point holds containers whose
    // only children are resume cards — which the kind filter rightly excludes —
    // so the picker would honestly offer nothing, and both sort states would
    // wait forever. Capture a sortable item, route it, and FILE it under a
    // container through search + the sheet (deterministic — no guessing which
    // list row is which).
    await page.fill('#capture', 'a sortable thing under something');
    await page.click('#capture-form button[type=submit]');
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
    await page.waitForSelector('#triage:not([hidden]) .route');
    // Drive heat -> clarify -> route with IN-PAGE clicks under a polling wait.
    // Locator clicks lost a race on the 2-core CI runner: every queued commit
    // repaints the action row, the button detached mid-click, and the
    // stability retry loop ran out its 30s (Spine run 161). An in-page click
    // acts on whatever exists at that instant and the poll simply tries again
    // after the next repaint.
    await page.waitForFunction(() => {
      const byText = (t) => [...document.querySelectorAll('#triage-actions .route')]
        .find(b => (b.textContent || '').includes(t));
      const next = byText('Next action');
      if (next) { next.click(); return true; }
      byText('Hot')?.click();
      return false;
    }, null, { timeout: 20000, polling: 300 });
    await page.waitForTimeout(400);
    await fillSearch('sortable thing');
    await page.waitForSelector('#search-results .search-open');
    await page.click('#search-results .search-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.selectOption('#detail-parent', { index: 1 });
    await page.click('#detail-parent-set');
    await page.waitForTimeout(250);
    await page.click('#detail-close');
    await fillSearch('');

    await openViaContents(page, 'sort');
    await page.waitForSelector('.sort-choice');
    await auditContrast(page, 'sort picker', theme);
    await auditAxe(page, 'sort picker', theme);
    await auditNames(page, 'sort picker', theme);
    await auditSeparationAndTargets(page, 'sort picker', theme);
    await auditFocusRings(page, 'sort picker', theme, ['.sort-choice', '#sort-query']);
    await page.locator('.sort-choice').first().click();
    await page.waitForSelector('#sort-card-region:not([hidden])');
    await auditContrast(page, 'sort card', theme);
    await auditAxe(page, 'sort card', theme);
    await auditNames(page, 'sort card', theme);
    await auditSeparationAndTargets(page, 'sort card', theme);
    await auditFocusRings(page, 'sort card', theme, ['#sort-card', '#sort-actions .route']);

    // Wholesale (1.5.0): open the block, audit the verbs, then reveal the
    // destructive confirm the way purge's is revealed — a control that only
    // exists after a click is still a control. In-page clicks throughout, for
    // the same repaint-race reason as triage.
    await page.click('#sort-act-all');
    await page.waitForSelector('#sort-bulk:not([hidden])');
    await page.waitForSelector('#sort-bulk-verbs .route');
    await auditContrast(page, 'sort bulk verbs', theme);
    await auditAxe(page, 'sort bulk verbs', theme);
    await auditNames(page, 'sort bulk verbs', theme);
    await auditSeparationAndTargets(page, 'sort bulk verbs', theme);
    await auditFocusRings(page, 'sort bulk verbs', theme, ['#sort-bulk-verbs .route', '#sort-bulk-export']);
    await page.waitForFunction(() => {
      const b = [...document.querySelectorAll('#sort-bulk-verbs .route')]
        .find(x => (x.textContent || '').includes('Let them go'));
      if (b) { b.click(); return true; }
      return false;
    }, null, { timeout: 10000, polling: 200 });
    await page.waitForSelector('#sort-bulk-confirm:not([hidden])');
    await auditContrast(page, 'sort bulk confirm', theme);
    await auditAxe(page, 'sort bulk confirm', theme);
    await auditNames(page, 'sort bulk confirm', theme);
    await auditSeparationAndTargets(page, 'sort bulk confirm', theme);
    await auditFocusRings(page, 'sort bulk confirm', theme, ['#sort-bulk-word']);
    await page.click('#sort-bulk-cancel');
    await page.waitForSelector('#sort-bulk', { state: 'hidden' });

    // A route removes the control it was on; focus must land somewhere REAL
    // (WCAG 2.4.3) — the entry line mid-range, the back button on completion —
    // never fall to <body>, in the mode built for a thousand consecutive
    // actions (audit). In-page click for the same repaint-race reason as triage.
    await page.waitForFunction(() => {
      const b = [...document.querySelectorAll('#sort-actions .route')]
        .find(x => (x.textContent || '').includes('Next action'));
      if (b) { b.click(); return true; }
      return false;
    }, null, { timeout: 10000, polling: 200 });
    const sortFocusOk = await page.waitForFunction(
      () => ['sort-entry', 'sort-back'].includes(document.activeElement?.id ?? ''),
      null, { timeout: 5000 },
    ).then(() => true).catch(() => false);
    if (!sortFocusOk) {
      const where = await page.evaluate(() =>
        document.activeElement?.id || document.activeElement?.tagName || '(none)');
      fail(`${theme}: after a sort route, focus landed on "${where}" instead of the entry line or back control`);
    }
    await page.click('#sort-close');

    // The tree, open (1.6.0, ADR-0013): the sort staging filed things under a
    // real container, so the rows measured are real ones. On request only, and
    // ITS OWN SHEET since 2.0.5 (ADR-0088) — a dialog state, measured as one.
    // `#tree-open` moved out of this state's focus list with it: the control is
    // on the surface underneath, which a modal makes inert, so focusing it here
    // would measure a ring nobody can reach from this state.
    await page.click('#tree-open');
    await page.waitForSelector('#sheet-tree[open]');
    await page.waitForSelector('.tree-open-row');
    await auditContrast(page, 'tree open', theme);
    await auditAxe(page, 'tree open', theme);
    await auditNames(page, 'tree open', theme);
    await auditSeparationAndTargets(page, 'tree open', theme);
    await auditFocusRings(page, 'tree open', theme, ['.tree-open-row', '#sheet-tree-close']);
    await page.click('#sheet-tree-close');
    await page.waitForSelector('#sheet-tree[open]', { state: 'detached' });

    // The lens (1.7.0, ADR-0054): containers exist by now, so the row is
    // offered. Audited ACTIVE — the law-1 line renders only while a lens is
    // chosen — then reset to everything so later states see the whole list.
    await page.waitForSelector('#lens-row:not([hidden])');
    await page.selectOption('#lens', { index: 1 });
    await page.waitForSelector('#lens-note:not([hidden])');
    await auditContrast(page, 'lens row', theme);
    await auditAxe(page, 'lens row', theme);
    await auditNames(page, 'lens row', theme);
    await auditSeparationAndTargets(page, 'lens row', theme);
    await auditFocusRings(page, 'lens row', theme, ['#lens']);
    await page.selectOption('#lens', { index: 0 });
    await page.waitForSelector('#lens-note', { state: 'hidden' });

    // Composed Today (1.6.0, ADR-0051): audit the opt-in Extra OFF (its resting
    // state), turn it on, choose one staged thing from its sheet, audit the
    // strip, then turn it off again so every later state is unchanged.
    await openSurface(page, 'sheet-group-extras');
    await page.waitForSelector('#today-start:not([hidden])');
    await auditContrast(page, 'today opt-in', theme);
    await auditNames(page, 'today opt-in', theme);
    await auditSeparationAndTargets(page, 'today opt-in', theme);
    await auditFocusRings(page, 'today opt-in', theme, ['#today-start']);
    await page.click('#today-start');
    await page.waitForFunction(() => /^On\./.test(
      document.querySelector('#today-note')?.textContent ?? ''));
    await openSurface(page, 'about');
    await page.click('#about-close');
    await fillSearch('sortable thing');
    await page.waitForSelector('#search-results .search-open');
    await page.click('#search-results .search-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.waitForSelector('#detail-today-add:not([hidden])');
    await page.click('#detail-today-add');
    await page.waitForFunction(() => /Chosen for today/.test(
      document.querySelector('#detail-live')?.textContent ?? ''));
    await page.click('#detail-close');
    await fillSearch('');
    await page.waitForSelector('#composed:not([hidden])');
    await auditContrast(page, 'composed strip', theme);
    await auditAxe(page, 'composed strip', theme);
    await auditNames(page, 'composed strip', theme);
    await auditSeparationAndTargets(page, 'composed strip', theme);
    await auditFocusRings(page, 'composed strip', theme, ['.composed-open']);
    await openSurface(page, 'sheet-group-extras');
    await page.click('#today-stop');
    await page.waitForFunction(() => /^Off\./.test(
      document.querySelector('#today-note')?.textContent ?? ''));
    await openSurface(page, 'about');
    await page.click('#about-close');

    // The header clock (1.22.0): audit the switch, turn it on, close the panel
    // and measure the thing itself — the two are never on screen together. Then
    // switch it off, so every state after this one sees the ordinary header.
    //
    // It goes through the panel rather than being seeded, because the point of
    // the state is the rendered chrome and the only way anybody gets it is this
    // one. A clock nobody can reach is measured but not shipped.
    await openSurface(page, 'sheet-group-extras');
    await page.waitForSelector('#clock-on:not([hidden])');
    await auditContrast(page, 'clock opt-in', theme);
    await auditNames(page, 'clock opt-in', theme);
    await auditSeparationAndTargets(page, 'clock opt-in', theme);
    await auditFocusRings(page, 'clock opt-in', theme, ['#clock-on']);
    // THE WAY IN FROM OUTSIDE (V2 stage 6). Driven with the copy actually
    // pressed, so the note has words in it — a status line measured while empty
    // measures nothing, which is the `situation field` lesson. On Things you can
    // do since 1.40.0: an address you copy is a verb, not a switch.
    await openSurface(page, 'sheet-group-actions');
    await page.click('#capture-endpoint-copy');
    await page.waitForFunction(() =>
      (document.querySelector('#capture-endpoint-note')?.textContent || '').length > 0);
    await auditContrast(page, 'capture address', theme);
    await auditNames(page, 'capture address', theme);
    await auditSeparationAndTargets(page, 'capture address', theme);
    await auditFocusRings(page, 'capture address', theme, ['#capture-endpoint-copy']);

    // WHEN YOUR DAY ENDS (V2 stage 5) — driven with a real choice made, because a
    // control measured in its default state measures the default and not the
    // control. A new surface joins this gate in the SAME commit (LESSONS §28).
    await openSurface(page, 'sheet-group-extras');
    await page.selectOption('#day-boundary', '3');
    await page.click('#day-boundary-set');
    await page.waitForFunction(() =>
      /3am/.test(document.querySelector('#day-boundary-note')?.textContent || ''));
    await auditContrast(page, 'day boundary', theme);
    await auditNames(page, 'day boundary', theme);
    await auditSeparationAndTargets(page, 'day boundary', theme);
    await auditFocusRings(page, 'day boundary', theme, ['#day-boundary-set']);
    // Back to midnight, so nothing after this walks a shifted day.
    await page.selectOption('#day-boundary', '0');
    await page.click('#day-boundary-set');
    await page.waitForFunction(() =>
      /midnight/i.test(document.querySelector('#day-boundary-note')?.textContent || ''));

    await page.click('#clock-on');
    // Waited on the STATE, not on the sentence (hub LESSONS §59). The
    // neighbouring toggles wait for /^On\./ in their own note, which makes a
    // reword of a status line hang a walk for a reason that is not a defect.
    // The pair of buttons swapping IS the thing that happened.
    await page.waitForSelector('#clock-off:not([hidden])');
    await openSurface(page, 'about');
    await page.click('#about-close');
    await page.waitForSelector('#clock:not([hidden])');
    // The words must actually be there before they are measured. An empty
    // paragraph has no client rect, so the registry would report "matches
    // nothing visible" — which is the gate working, and would be a confusing
    // way to find out the paint had not run yet.
    await page.waitForFunction(() =>
      (document.querySelector('#clock-words')?.textContent ?? '').length > 0);
    await auditContrast(page, 'clock on', theme);
    await auditAxe(page, 'clock on', theme);
    await auditNames(page, 'clock on', theme);
    await auditSeparationAndTargets(page, 'clock on', theme);
    await auditFocusRings(page, 'clock on', theme);
    await openSurface(page, 'sheet-group-extras');
    await page.click('#clock-off');
    await page.waitForSelector('#clock-on:not([hidden])');
    await openSurface(page, 'about');
    await page.click('#about-close');
    await page.waitForSelector('#clock', { state: 'hidden' });

    // Stage a trashed thing for the trash view (1.5.0): capture, find it,
    // let it go through its own sheet — the app's real path, no seeding.
    await page.fill('#capture', 'a thing let go');
    await page.click('#capture-form button[type=submit]');
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
    await fillSearch('thing let go');
    await page.waitForSelector('#search-results .search-open');
    await page.click('#search-results .search-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.click('#detail-trash');
    await page.waitForSelector('#detail-untrash:not([hidden])');
    await page.click('#detail-close');
    await fillSearch('');

    // Folding a duplicate (1.7.0, ADR-0053): two captures of the same errand,
    // so the filter isolates the twin and every state below is deterministic.
    // Fold one in, audit the way back, then the survivor's list, then split it
    // back out so later states see the store holding what it held.
    await page.fill('#capture', 'the same errand twice');
    await page.click('#capture-form button[type=submit]');
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
    await page.waitForFunction(() => (document.querySelector('#capture')?.value ?? 'x') === '');
    await page.fill('#capture', 'The same errand TWICE');
    await page.click('#capture-form button[type=submit]');
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
    await page.waitForFunction(() => (document.querySelector('#capture')?.value ?? 'x') === '');
    await fillSearch('same errand');
    await page.waitForSelector('#search-results .search-open');
    await page.locator('#search-results .search-open', { hasText: /the same errand twice/ }).click();
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    // The search box is cleared AFTER the sheet closes, not here — a fill
    // cannot reach an element the modal has made inert.
    await page.fill('#detail-merge-filter', 'same errand');
    await page.waitForFunction(() => document.querySelectorAll('#detail-merge option').length === 2);
    await auditContrast(page, 'detail sheet, folding', theme);
    await auditAxe(page, 'detail sheet, folding', theme);
    await auditNames(page, 'detail sheet, folding', theme);
    await auditSeparationAndTargets(page, 'detail sheet, folding', theme);
    await auditFocusRings(page, 'detail sheet, folding', theme, ['#detail-merge', '#detail-merge-set']);
    await page.selectOption('#detail-merge', { index: 1 });
    await page.click('#detail-merge-set');
    await page.waitForSelector('#detail-unmerge-group:not([hidden])');
    await auditContrast(page, 'detail sheet, folded away', theme);
    await auditAxe(page, 'detail sheet, folded away', theme);
    await auditNames(page, 'detail sheet, folded away', theme);
    await auditSeparationAndTargets(page, 'detail sheet, folded away', theme);
    await auditFocusRings(page, 'detail sheet, folded away', theme, ['#detail-unmerge']);
    await page.click('#detail-close');
    await fillSearch('same errand');
    await page.waitForSelector('#search-results .search-open');
    await page.click('#search-results .search-open');   // the merged one is off search
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.waitForSelector('#detail-merged-group:not([hidden])');
    await auditContrast(page, 'detail sheet, survivor', theme);
    await auditAxe(page, 'detail sheet, survivor', theme);
    await auditNames(page, 'detail sheet, survivor', theme);
    await auditSeparationAndTargets(page, 'detail sheet, survivor', theme);
    await auditFocusRings(page, 'detail sheet, survivor', theme, ['#detail-merged-list button']);
    await page.locator('#detail-merged-list button').first().click();
    await page.waitForSelector('#detail-merged-group[hidden]', { state: 'attached' });
    await page.click('#detail-close');
    await fillSearch('');              // now the modal is gone, the box clears

    // What a meeting needs (1.9.0, ADR-0057). The walk already made a
    // container above; give it somebody who cares and one decision, and
    // audit both groups in the state a person meets them in.
    await enterStance(page, 'held');
    await page.locator('#cards .card-open').first().click();
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    if (await page.locator('#detail-make-project').isVisible()) {
      await page.click('#detail-make-project');
      await page.waitForTimeout(250);
    }
    await page.fill('#detail-person', 'Priya');
    await page.selectOption('#detail-relation', 'stakeholder');
    await page.click('#detail-person-set');
    await page.waitForFunction(() => /Priya/.test(
      document.querySelector('#detail-stakeholder-list')?.textContent ?? ''));
    await auditContrast(page, 'detail sheet, who cares', theme);
    await auditAxe(page, 'detail sheet, who cares', theme);
    await auditNames(page, 'detail sheet, who cares', theme);
    await auditSeparationAndTargets(page, 'detail sheet, who cares', theme);
    await auditFocusRings(page, 'detail sheet, who cares', theme, ['#detail-stakeholder-list button']);
    await page.fill('#detail-decision', 'we ship on the 12th');
    await page.click('#detail-decision-set');
    await page.waitForFunction(() => /we ship on the 12th/.test(
      document.querySelector('#detail-decision-list')?.textContent ?? ''));
    await auditContrast(page, 'detail sheet, decisions', theme);
    await auditAxe(page, 'detail sheet, decisions', theme);
    await auditNames(page, 'detail sheet, decisions', theme);
    await auditSeparationAndTargets(page, 'detail sheet, decisions', theme);
    await auditFocusRings(page, 'detail sheet, decisions', theme, ['#detail-decision', '#detail-decision-set']);

    // WHO HOLDS THE REST (3.20.0, ADR-0122). Link the directory pointer, read
    // the words a reader reads, and take it back — the release is the half
    // nothing else exercises, and a control that only ever renders is a
    // control nobody measured. The negative assertion is the one that matters:
    // the row would render identically with a duration on it, and an age on
    // either holding direction is refused in terms by entry 32.
    await page.fill('#detail-person', 'Marta');
    await page.selectOption('#detail-relation', 'rest-with-them');
    await page.click('#detail-person-set');
    await page.waitForFunction(() => /Marta.*hold the rest of this/.test(
      document.querySelector('#detail-people-list')?.textContent ?? ''));
    const holdingRow = await page.evaluate(() =>
      [...document.querySelectorAll('#detail-people-list li')]
        .map(li => li.textContent ?? '').find(t => /Marta/.test(t)) ?? '');
    (/they hold the rest of this/.test(holdingRow) ? pass : fail)(
      `${theme}/who holds the rest: the pointer says its words ("${holdingRow.trim().slice(0, 60)}")`);
    (!/week|month|since|ago|\bdays?\b/i.test(holdingRow) ? pass : fail)(
      `${theme}/who holds the rest: and no age rides on it`);
    await auditContrast(page, 'detail sheet, who holds the rest', theme);
    await auditAxe(page, 'detail sheet, who holds the rest', theme);
    await auditNames(page, 'detail sheet, who holds the rest', theme);
    await auditSeparationAndTargets(page, 'detail sheet, who holds the rest', theme);
    await auditFocusRings(page, 'detail sheet, who holds the rest', theme, ['#detail-people-list button']);
    await page.locator('#detail-people-list button', { hasText: /No longer holds the rest/ }).first().click();
    await page.waitForFunction(() => !/hold the rest of this/.test(
      document.querySelector('#detail-people-list')?.textContent ?? ''));
    pass(`${theme}/who holds the rest: the pointer can be taken back, and the work stays`);

    // A person's own sheet (1.12.0). Link somebody as owing something, then
    // WALK to them the way a reader does — through the name on the item — and
    // audit the page they land on.
    await page.fill('#detail-person', 'Ada');
    await page.selectOption('#detail-relation', 'waiting-on');
    await page.click('#detail-person-set');
    await page.waitForFunction(() => /Ada/.test(
      document.querySelector('#detail-people-list')?.textContent ?? ''));
    await page.locator('#detail-people-list button', { hasText: /Ada/ }).first().click();
    await page.waitForSelector('#detail-person-group:not([hidden])');
    await auditContrast(page, 'detail sheet, a person', theme);
    await auditAxe(page, 'detail sheet, a person', theme);
    await auditNames(page, 'detail sheet, a person', theme);
    await auditSeparationAndTargets(page, 'detail sheet, a person', theme);
    await auditFocusRings(page, 'detail sheet, a person', theme, ['#detail-person-group button']);
    await page.click('#detail-close');

    // A ROLE'S OWN SHEET (3.12.0). Attach a line to an item, then WALK to it the
    // way a reader does — through the name on the item, which was a remove
    // control until this release and is a door now — and audit where they land.
    // Same method as the person state above: never open the surface directly,
    // because the route is half of what is being measured.
    await fillSearch('same errand');
    await page.waitForSelector('#search-results .search-open');
    await page.locator('#search-results .search-open', { hasText: /the same errand twice/ }).click();
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.fill('#detail-role', 'Manning');
    await page.click('#detail-role-set');
    await page.waitForFunction(() => /Manning/.test(
      document.querySelector('#detail-role-list')?.textContent ?? ''));
    await page.locator('#detail-role-list button.linklike', { hasText: /^Manning$/ }).first().click();
    await page.waitForSelector('#detail-line-group:not([hidden])');
    await auditContrast(page, 'detail sheet, a line', theme);
    await auditAxe(page, 'detail sheet, a line', theme);
    await auditNames(page, 'detail sheet, a line', theme);
    await auditSeparationAndTargets(page, 'detail sheet, a line', theme);
    await auditFocusRings(page, 'detail sheet, a line', theme, ['#detail-line-group button']);
    await page.click('#detail-close');

    // Asking, and declining (1.8.0, ADR-0056): decline a thing through its own
    // sheet, audit the declined state, then the ledger, then the slot flow —
    // the states a person actually meets, in the order they meet them.
    await page.fill('#capture', 'a thing asked of me');
    await page.click('#capture-form button[type=submit]');
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
    await page.waitForFunction(() => (document.querySelector('#capture')?.value ?? 'x') === '');
    await fillSearch('asked of me');
    await page.waitForSelector('#search-results .search-open');
    await page.click('#search-results .search-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    await page.waitForSelector('#detail-decline:not([hidden])');
    await page.click('#detail-decline');
    await page.waitForSelector('#detail-declined:not([hidden])');
    await auditContrast(page, 'detail sheet, declined', theme);
    await auditAxe(page, 'detail sheet, declined', theme);
    await auditNames(page, 'detail sheet, declined', theme);
    await auditSeparationAndTargets(page, 'detail sheet, declined', theme);
    await auditFocusRings(page, 'detail sheet, declined', theme, ['#detail-carry']);
    await page.click('#detail-close');
    await fillSearch('');
    await openSurface(page, 'sheet-group-data');
    // The clearing confirmation is revealed by choosing a mode, so it is opened
    // here: a control that only exists after a click is still a control somebody
    // reads, and leaving it out would exempt the typed-word box — the one
    // surface in the app standing between a person and their history.
    await page.click('#purge-pick-clear');
    await page.waitForSelector('#purge-confirm:not([hidden])');
    // AND IT IS GUARDING SOMETHING, SAID OUT LOUD (2.10.3). The confirmation is
    // withheld entirely over a store with nothing in it now, so this step is
    // silently load-bearing on the walk's sample still being seeded here. If a
    // later edit ever empties the store before this point, the wait above would
    // time out and read as a flake; this says which fact broke instead.
    const guarding = await page.evaluate(() =>
      (document.querySelector('#purge-consequence')?.textContent ?? ''));
    (/\b[1-9]\d* thing/.test(guarding) ? pass : fail)(
      `${theme}/clearing out: the confirmation is guarding something ("${guarding.slice(0, 56)}")`);
    await auditContrast(page, 'clearing out', theme);
    await auditAxe(page, 'clearing out', theme);
    await auditNames(page, 'clearing out', theme);
    await auditSeparationAndTargets(page, 'clearing out', theme);
    // `#purge-go` ships DISABLED until the word is typed, so auditing it as-is
    // would report a defect about a control behaving exactly as designed.
    await page.fill('#purge-word',
      (await page.locator('#purge-word-required').textContent()) ?? '');
    await page.waitForSelector('#purge-go:not([disabled])');
    await auditFocusRings(page, 'clearing out', theme, ['#purge-word', '#purge-go', '#purge-cancel']);
    await page.fill('#purge-word', '');
    await page.click('#purge-cancel');
    await page.click('#notnow-open');
    await page.waitForSelector('#notnow-view:not([hidden])');
    await page.waitForSelector('#notnow-list .trash-row');
    await auditContrast(page, 'ledger open', theme);
    await auditAxe(page, 'ledger open', theme);
    await auditNames(page, 'ledger open', theme);
    await auditSeparationAndTargets(page, 'ledger open', theme);
    // The diagnostic (1.18.0, §7f). Driven, not assumed: the report only
    // exists once somebody asks for it, so a state registered without taking
    // one would match nothing and pass for the wrong reason.
    //
    // `openSurface` rather than a click, because the diagnostic lives on the ⓘ
    // and the ledger above is on Your data — two sheets that are never open
    // together (1.40.0), so this has to close one before the other exists.
    await openSurface(page, 'about');
    await page.click('#diagnostic-show');
    await page.waitForSelector('#diagnostic-text:not([hidden])');
    await page.click('#diagnostic-copy');
    await page.waitForSelector('#diagnostic-note:not([hidden])');
    await auditContrast(page, 'diagnostic taken', theme);
    await auditAxe(page, 'diagnostic taken', theme);
    await auditNames(page, 'diagnostic taken', theme);
    await auditSeparationAndTargets(page, 'diagnostic taken', theme);
    await auditFocusRings(page, 'diagnostic taken', theme, ['#diagnostic-show', '#diagnostic-copy']);

    // THE OTHER DOOR, DRIVEN — because the block above measures the ROOM and
    // says nothing about the ROUTE (2.30.2).
    //
    // Everything above reaches the diagnostic the short way: `openSurface`,
    // then a click straight on `#diagnostic-show`. The version stamp in the
    // footer is the other door §7f asks for, it is the one a finger actually
    // takes, and it is a completely different piece of code — it opens the
    // panel, presses the button for you, waits for an ASYNC build and then
    // scrolls. Every audit on the state passed for releases while that landing
    // put the controls out of reach, because no assertion ever arrived by it.
    //
    // What it lands on is the whole point. `Copy it` and `Save it as a file`
    // are `hidden` until the report exists, so they are REVEALED — into the
    // region above the fold, if the landing scrolls to the report text. A
    // control that appears where nobody can see it is worse than one that is
    // missing: the reader has no reason to suspect anything appeared.
    //
    // MEASURED AGAINST THE SCROLLER, never the viewport — `#about-body` is the
    // box that scrolls, the dialog's title bar above it never moves, and
    // measuring from the viewport would report that bar's height as error on a
    // landing that is perfect. Same correction ADR-0100 made for the runway.
    await page.click('#about-close');
    await page.waitForSelector('#about', { state: 'hidden' });
    await page.click('#build-version');
    await page.waitForSelector('#diagnostic-text:not([hidden])');
    // The landing is scheduled off a MutationObserver, so the report being
    // visible does not mean the scroll has happened yet.
    await page.waitForTimeout(400);
    const door = await page.evaluate(() => {
      const body = document.querySelector('#about-body');
      const origin = body ? body.getBoundingClientRect().top : 0;
      const at = (sel) => {
        const el = document.querySelector(sel);
        if (!el || el.hidden) return null;
        return Math.round(el.getBoundingClientRect().top - origin);
      };
      return {
        focused: document.activeElement?.id ?? null,
        copy: at('#diagnostic-copy'),
        save: at('#diagnostic-save'),
        report: at('#diagnostic-text'),
      };
    });
    for (const [name, top] of [['Copy it', door.copy], ['Save it as a file', door.save]]) {
      (top !== null && top >= -1 ? pass : fail)(
        `${theme}/diagnostic by the version stamp: "${name}" is inside the panel`
        + ` — ${top === null ? 'it is not even shown' : `${top}px from the top of the scroller`}`);
    }
    // And the report is still what the keyboard and a screen reader land on:
    // the scroll moved, the focus did not. Two decisions, and the defect this
    // block exists for was them being treated as one.
    (door.focused === 'diagnostic-text' ? pass : fail)(
      `${theme}/diagnostic by the version stamp: focus is on the report itself`
      + ` (got ${door.focused ?? 'nothing'})`);

    // The journal's three states, walked in the order a person meets them.
    await openSurface(page, 'sheet-group-data');
    await page.click('#journal-open');
    await page.waitForSelector('#journal-view:not([hidden])');
    await auditContrast(page, 'journal, no passphrase', theme);
    await auditAxe(page, 'journal, no passphrase', theme);
    await auditNames(page, 'journal, no passphrase', theme);
    await auditSeparationAndTargets(page, 'journal, no passphrase', theme);
    await auditFocusRings(page, 'journal, no passphrase', theme, ['#journal-new', '#journal-set']);
    await page.fill('#journal-new', 'a passphrase for the audit');
    await page.click('#journal-set');
    await page.waitForSelector('#journal-unlocked:not([hidden])', { timeout: 20000 });
    await page.fill('#journal-text', 'one line, so the list has a row to measure');
    await page.click('#journal-write');
    await page.waitForFunction(() => (document.querySelector('#journal-list')?.children.length ?? 0) > 0,
      null, { timeout: 20000 });
    await auditContrast(page, 'journal, open', theme);
    await auditAxe(page, 'journal, open', theme);
    await auditNames(page, 'journal, open', theme);
    await auditSeparationAndTargets(page, 'journal, open', theme);
    await auditFocusRings(page, 'journal, open', theme, ['#journal-text', '#journal-write']);
    await page.click('#journal-lock');
    await page.waitForSelector('#journal-locked:not([hidden])');
    await auditContrast(page, 'journal, closed', theme);
    await auditAxe(page, 'journal, closed', theme);
    await auditNames(page, 'journal, closed', theme);
    await auditSeparationAndTargets(page, 'journal, closed', theme);
    await auditFocusRings(page, 'journal, closed', theme, ['#journal-pass', '#journal-unlock']);
    await page.click('#journal-open');

    await auditFocusRings(page, 'ledger open', theme, ['#notnow-list .trash-row', '#notnow-open']);
    await page.click('#notnow-open');
    // The slot: set a day, audit the sheet's offer, then clear it so every
    // later state sees the resting default.
    await openSurface(page, 'sheet-group-extras');
    await page.selectOption('#slot-day', 'fri');
    await page.click('#slot-set');
    await page.waitForFunction(() => /^On\./.test(
      document.querySelector('#slot-note')?.textContent ?? ''));
    await openSurface(page, 'about');
    await page.click('#about-close');
    await fillSearch('asked of me');
    await page.waitForSelector('#search-results .search-open');
    await page.click('#search-results .search-open');
    await page.waitForSelector('#detail[open]');
    await page.evaluate(() => { const b = document.querySelector('#detail-more'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
    // The declined thing shows Carry, not the slot button — carry it first so
    // the slot offer renders, which also audits the way back working.
    await page.click('#detail-carry');
    await page.waitForSelector('#detail-slot-park:not([hidden])');
    await auditContrast(page, 'detail sheet, slot offered', theme);
    await auditAxe(page, 'detail sheet, slot offered', theme);
    await auditNames(page, 'detail sheet, slot offered', theme);
    await auditSeparationAndTargets(page, 'detail sheet, slot offered', theme);
    await auditFocusRings(page, 'detail sheet, slot offered', theme, ['#detail-slot-park']);
    await page.click('#detail-close');
    await fillSearch('');
    await openSurface(page, 'sheet-group-extras');
    await page.selectOption('#slot-day', '');
    await page.click('#slot-set');
    await page.waitForFunction(() =>
      (document.querySelector('#slot-note')?.textContent ?? 'x') === '');
    await openSurface(page, 'about');
    await page.click('#about-close');

    // State 4: the surfaces as every RETURN visit sees them — the state real
    // users live in, which the first gate structurally could not audit. Each
    // sheet is re-walked here with a store that has a real history behind it,
    // because half of what these screens show is computed from it: the copy
    // note, the record's day count, the ledger's rows.
    await openSurface(page, 'sheet-group-data');
    await page.waitForSelector('#storage-body dt');
    await page.waitForSelector('#copy-note:not([hidden])');
    await auditContrast(page, 'your data, return visit', theme);
    await auditAxe(page, 'your data, return visit', theme);
    await auditNames(page, 'your data, return visit', theme);
    await auditSeparationAndTargets(page, 'your data, return visit', theme);
    await auditFocusRings(page, 'your data, return visit', theme, ['#export', '#notnow-open']);

    await openSurface(page, 'sheet-group-extras');
    await auditContrast(page, 'settings', theme);
    await auditAxe(page, 'settings', theme);
    await auditNames(page, 'settings', theme);
    await auditSeparationAndTargets(page, 'settings', theme);

    await openSurface(page, 'sheet-group-actions');
    await auditContrast(page, 'things you can do', theme);
    await auditAxe(page, 'things you can do', theme);
    await auditNames(page, 'things you can do', theme);
    await auditSeparationAndTargets(page, 'things you can do', theme);
    await auditFocusRings(page, 'things you can do', theme,
      ['#calendar', '#report-copy', '#sheet-group-actions-close']);

    await openSurface(page, 'about');
    await auditContrast(page, 'dialog, return visit', theme);
    await auditAxe(page, 'dialog, return visit', theme);
    await auditNames(page, 'dialog, return visit', theme);
    await auditSeparationAndTargets(page, 'dialog, return visit', theme);
    await auditFocusRings(page, 'dialog, return visit', theme,
      ['#about-close', '#diagnostic-show']);

    // The record itself, open (1.4.0, ADR-0048). The store holds a real
    // history by this point in the walk, so days, lines, and the total all
    // have something to render. Collapsed again after, so the 320px dialog
    // overflow check below measures the panel as a return visit sees it.
    await openSurface(page, 'sheet-group-data');
    await page.click('#log-open');
    await page.waitForSelector('#log-view:not([hidden])');
    await page.waitForFunction(() =>
      document.querySelectorAll('#log-days .log-line').length > 0);
    await auditContrast(page, 'log view', theme);
    await auditAxe(page, 'log view', theme);
    await auditNames(page, 'log view', theme);
    await auditSeparationAndTargets(page, 'log view', theme);
    await auditFocusRings(page, 'log view', theme, ['#log-open']);
    await page.click('#log-open');
    await page.waitForSelector('#log-view', { state: 'hidden' });

    // Things you let go, open (1.5.0, ADR-0050) — staged just above, so the
    // one-verb row has something real to be. Collapsed after, like the record.
    await page.click('#trash-open');
    await page.waitForSelector('#trash-view:not([hidden])');
    await page.waitForSelector('.trash-row');
    await auditContrast(page, 'trash view', theme);
    await auditAxe(page, 'trash view', theme);
    await auditNames(page, 'trash view', theme);
    await auditSeparationAndTargets(page, 'trash view', theme);
    await auditFocusRings(page, 'trash view', theme, ['.trash-row']);
    await page.click('#trash-open');
    await page.waitForSelector('#trash-view', { state: 'hidden' });

    // Today on paper, on the Settings sheet that carries it.
    await openSurface(page, 'sheet-group-actions');
    await auditContrast(page, 'today on paper', theme);
    await auditNames(page, 'today on paper', theme);
    await auditSeparationAndTargets(page, 'today on paper', theme);
    await auditFocusRings(page, 'today on paper', theme, ['#today-print']);

    // The report controls, on the sheet that is already open.
    await auditContrast(page, 'report controls', theme);
    await auditNames(page, 'report controls', theme);
    await auditSeparationAndTargets(page, 'report controls', theme);
    await auditFocusRings(page, 'report controls', theme,
      ['#report-copy', '#report-markdown', '#report-csv', '#report-print']);

    // The import surface with a file chosen — the state that carries the
    // destructive control. An empty log is a perfectly valid export (a new user
    // who exports immediately has one), so it is the smallest file that reaches
    // this state honestly, without faking the app's own output.
    // Written OUTSIDE the repo. A fixture inside the tree survives a failed run
    // and can be swept into a commit by a wholesale `git add` — which has
    // happened in this repo once already, and is in the hub's LESSONS.
    const validExport = join(tmpdir(), 'quietkeep-a11y-import-fixture.json');
    writeFileSync(validExport, JSON.stringify({
      format: 'planner-log', version: 1, at: new Date().toISOString(),
      scope: 'all', encrypted: false, logJsonl: '', snapshot: null,
    }));
    await openSurface(page, 'sheet-group-data');
    await page.setInputFiles('#import-file', validExport);
    await page.waitForSelector('#import-actions:not([hidden])');
    await auditContrast(page, 'import, file chosen', theme);
    await auditAxe(page, 'import, file chosen', theme);
    await auditNames(page, 'import, file chosen', theme);
    await auditSeparationAndTargets(page, 'import, file chosen', theme);
    await auditFocusRings(page, 'import, file chosen', theme, ['#import-file', '#import-union', '#import-backup', '#import-go']);
    rmSync(validExport, { force: true });

    // AND THE OTHER IMPORT, with a file chosen — the one that reads somebody
    // else's planner. 2.36.0 turned its summary from a paragraph into a list of
    // facts, and a list that only ever renders after a file is chosen is a list
    // nothing measures unless the walk chooses one. Written outside the repo for
    // the same reason as the fixture above.
    //
    // The file is built to reach every fact at once: two places, a flag, an
    // estimate, a note, a rhythm, a finished row and a date seven years gone.
    // A single-fact file would measure the markup and prove nothing about a
    // real export, which is where this surface is actually read.
    const otherExport = join(tmpdir(), 'quietkeep-a11y-other-fixture.taskpaper');
    writeFileSync(otherExport, [
      'Kitchen refit:',
      '\t- Ring the plumber @due(2019-06-11) @flagged @context(Home)',
      '\tThe stopcock is under the stairs',
      '\t- Old thing @done',
      '\t- Weekly check @repeat(1w)',
      '- A loose action @context(Errands) @estimate(20m)',
      '',
    ].join('\n'));
    await page.setInputFiles('#other-file', otherExport);
    await page.waitForSelector('#other-facts:not([hidden]) li');
    await auditContrast(page, 'another planner, file chosen', theme);
    await auditAxe(page, 'another planner, file chosen', theme);
    await auditNames(page, 'another planner, file chosen', theme);
    await auditSeparationAndTargets(page, 'another planner, file chosen', theme);
    await auditFocusRings(page, 'another planner, file chosen', theme, ['#other-file', '#other-go']);
    rmSync(otherExport, { force: true });

    // State 5: B-04's hardest case — 320px at 200% text — WITH a dialog open.
    // A dialog is its own scroll container, so page-level overflow stays 0 while
    // content escapes sideways inside it; both get checked.
    //
    // EVERY surface, not just the ⓘ (1.40.0). This measured `#about` alone back
    // when the ⓘ was the only screen. The four sheets carry the code blocks, the
    // selects and the long words — which is to say they carry everything that
    // actually overflows — so measuring the one screen that no longer holds them
    // is a check that cannot fail for the right reason.
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    for (const id of ['about', 'sheet-group-why', 'sheet-group-help',
      'sheet-group-data', 'sheet-group-extras', 'more',
      // 2.0.5 (ADR-0088): a sheet that overflows sideways at 320px @ 200% is a
      // sheet whose content escapes where the page-level check cannot see it,
      // and the coverage rows carry the longest strings in the app — a title
      // and a return date on one line.
      'sheet-coverage', 'sheet-tree', 'sheet-menu',
      // 2.3.0 (ADR-0093): its rows carry a block's heading and that block's own
      // count sentence on one line, which at 320px @ 200% is the longest thing
      // in the app that is not a title.
      'sheet-contents',
      // 2.6.0 (ADR-0096): a role somebody named can be a long phrase, and it
      // sits on one line with its count.
      'sheet-roles']) {
      await openSurface(page, id);
      const over = await page.evaluate((want) => {
        const d = document.querySelector('#' + want);
        return d.scrollWidth - d.clientWidth;
      }, id);
      (over <= 1 ? pass : fail)(
        `${theme}/320px @ 200%: #${id} horizontal overflow ${over}px (must be ≤1)`);
    }
    await openSurface(page, 'about');
    await auditContrast(page, 'dialog @ 320/200', theme, 'dialog, return visit');
    await auditAxe(page, 'dialog @ 320/200', theme);
    await auditFocusRings(page, 'dialog @ 320/200', theme);
    await page.click('#about-close');

    // NAMES the offender. "42px of overflow" told us the page was broken and
    // nothing about where, so finding it meant writing a throwaway probe by
    // hand — twice. The widest element past the right edge is almost always the
    // cause, and the gate already has the DOM in front of it.
    const over = await page.evaluate(() => {
      const doc = document.scrollingElement;
      const px = doc.scrollWidth - doc.clientWidth;
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.right > doc.clientWidth + 1) {
          out.push(`${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}` +
            `${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : ''}` +
            ` (right ${Math.round(r.right)}px)`);
        }
      }
      return { px, culprits: out.slice(0, 4) };
    });
    (over.px <= 1 ? pass : fail)(
      `${theme}/320px @ 200%: page horizontal overflow ${over.px}px (must be ≤1)` +
      (over.culprits.length ? ` — past the edge: ${over.culprits.join(', ')}` : ''));
    const cap = await page.evaluate(() => {
      const r = document.querySelector('#capture').getBoundingClientRect();
      return { h: Math.round(r.height), w: Math.round(r.width) };
    });
    (cap.h >= 44 && cap.w >= 100 ? pass : fail)(
      `${theme}/320px @ 200%: capture is ${cap.w}x${cap.h} — still a usable target`);
    await auditAxe(page, 'page @ 320/200', theme);

    // UPKEEP READY, and it is LAST on purpose.
    //
    // This section had no REGISTRY entry for its whole life, so its contrast and
    // its accessible names had never been measured in either theme. Not an
    // oversight in the list: an unreachable state. This walk builds its own
    // store by capturing items, and never had an upkeep in it at all, so there
    // was no moment in the run where the section was on screen to be sampled.
    //
    // Two things were tried before this and are worth not repeating. Seeding a
    // ready item straight into IndexedDB does nothing — the app does not re-fold
    // an appended event on reload. Auditing at 'with cards' timed out, because
    // by then the walk's own earlier steps have moved the store on.
    //
    // So it runs at the very END of the theme, on the sample fixture, where
    // there is nothing downstream left to perturb. The viewport is put back
    // first: the step above leaves it at 320px under a 200% zoom, which is a
    // deliberately hostile layout and not the one this section should be
    // measured in.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => document.querySelector('#more')?.showModal());
    await page.waitForSelector('#more[open]');
    await page.click('.more-go[data-go="group-actions"]');
    await page.waitForSelector('#sheet-group-actions[open]');
    await page.click('#sample');
    await page.waitForTimeout(2500);
    await page.evaluate(() => {
      for (const d of document.querySelectorAll('dialog')) if (d.open) d.close();
    });
    await page.waitForSelector('#upkeep:not([hidden])');
    await auditContrast(page, 'upkeep ready', theme);
    await auditAxe(page, 'upkeep ready', theme);
    await auditNames(page, 'upkeep ready', theme);
    await auditSeparationAndTargets(page, 'upkeep ready', theme);
    await auditFocusRings(page, 'upkeep ready', theme);

    // --- THE WIDE ARRANGEMENT (3.2.0, ADR-0109) ------------------------------
    //
    // This whole walk measures ONE viewport, 390x844, plus a 320px/200% stress
    // step. So a second arrangement is unmeasured by construction — contrast,
    // targets, overlap, reflow, none of it — and hub LESSONS 28 is exactly that:
    // a new surface joins the gate in the SAME COMMIT or it ships unchecked.
    //
    // WHAT THIS COVERS AND WHAT IT DOES NOT, said out loud rather than implied.
    // The wide arrangement changes WHERE the boxes are, not what is in them: the
    // same `.stance-on` set, the same tokens, the same elements. So the contrast
    // registry measured above at 390 still answers for the pairs, and this pass
    // measures the things that only a second arrangement can break — whether the
    // hub is really beside the job, whether anything runs past the edge, whether
    // two controls now touch, and what axe makes of the result.
    //
    // ALL OF THEM AT ONCE, DRIVEN LAST ON PURPOSE (3.9.0).
    //
    // It sits here rather than beside the `replan` state it belongs to because
    // reaching it puts a SECOND item under a passed date, and that changes the
    // store every later state reads. Placed inline, it took the item the ambient
    // horizon check picks up and that check went red — a state that perturbs the
    // walk downstream of itself is measuring one surface by breaking another,
    // which is the trade the picks state above refused for the same reason.
    // Nothing runs after this but the wide arrangement, which reads layout.
    // A SECOND PASSED DATE, so the all-at-once route is on screen (3.9.0).
    //
    // Three things stood between this and a second card, and none of them was
    // guessable — the first two runs reported "7 card(s)" and no reason, which
    // is exactly what sent the next attempt guessing. The failure names the
    // hiding ancestor now, and that is what found the real one: `leaveStance`
    // lands on the HUB, and the hub IS the screen —
    // `#runway[data-hub]:not([data-stance])` sets `display:none` on every
    // section, `#held` included. So the cards were in the DOM and none of them
    // was visible.
    //
    // The route is the reader's own: into "Everything you are holding", open the
    // fold, take a card. `#detail` is a modal dialog and works from any job, so
    // the date is set there and the replan section re-entered afterwards.
    //
    // IT TRIES SEVERAL CARDS, because not everything can take a date — a
    // container raises no replan card by law 4, and picking the first row and
    // hoping is how this cost three runs. It stops at the first one that works.
    // DATE UNTIL THE ROUTE IS UP, rather than assuming one date is already
    // there. Placing this last means any earlier passed date has since been
    // RESOLVED by the replan-sheet state, so the count starts at zero and TWO
    // have to be made.
    //
    // THE FOLD IS REOPENED EVERY TIME, and that is the whole of what went wrong
    // for three runs. `enterStance` re-renders the section and the "Every one of
    // them" disclosure closes with it, so the next click went at an element that
    // was in the DOM and not visible — Playwright waited its full twelve seconds,
    // the `.catch` swallowed it, and the loop spun six times in silence
    // reporting "One date has gone by." A swallowed timeout inside a retry loop
    // is an absence that looks exactly like a presence.
    // AND THE REASON FOUR MORE RUNS FOUND ONLY ONE DATE: an unrouted capture is
    // NOT eligible for a replan card. `eligible()` in `src/replan.ts` excludes
    // anything still in triage, along with containers, upkeep and the Menu — so
    // dating card after card off the work surface produced nothing, six times,
    // and the message said "One date has gone by" each time without saying why.
    //
    // So route one first, by NAME rather than by position, and date THAT.
    await enterStance(page, 'triage');
    for (let i = 0; i < 12; i++) {
      const heat = await page.evaluate(() =>
        document.querySelector('#triage-prompt')?.textContent?.startsWith('Hot') === true);
      if (!heat) break;
      await page.click('#triage-actions .route');
      await page.waitForTimeout(60);
    }
    const routed = await page.locator('#triage-actions .route', { hasText: 'Next action' })
      .first().click({ timeout: 4000 }).then(() => true).catch(() => false);
    (routed ? pass : fail)(
      `${theme}/replan: a capture was routed, so there is something a date can lapse on`);
    await page.waitForTimeout(200);

    const openFold = async () => {
      await enterStance(page, 'held');
      if (!(await page.locator('#held-fold[open]').count())) {
        await page.locator('#held-fold-summary').click({ timeout: 4000 }).catch(() => {});
      }
      return page.locator('#held-fold[open]').count();
    };
    let secondDated = false;
    let k = 0;
    for (let i = 0; i < 6 && !secondDated; i += 1) {
      if (!(await openFold())) {
        fail(`${theme}/replan: the "Every one of them" fold would not open, so no second date could be set`);
        break;
      }
      const cards = await page.locator('#cards .card-open').count();
      if (cards <= k) break;
      const beforeCount = await page.locator('.replan-card').count();
      // Bounded, and NOT swallowed into the loop: a click that cannot land is a
      // fact worth printing once rather than twelve seconds spent hiding it.
      const clicked = await page.locator('#cards .card-open').nth(k)
        .click({ timeout: 4000 }).then(() => true).catch(() => false);
      if (!clicked || !(await page.locator('#detail[open]').count())) { k += 1; continue; }
      if (await page.locator('#detail-date').count()) {
        await page.fill('#detail-date', pastKey).catch(() => {});
        await page.click('#detail-date-set').catch(() => {});
        await page.waitForTimeout(250);
      }
      await page.click('#detail-close');
      await page.waitForTimeout(120);
      await enterStance(page, 'replan');
      secondDated = await page.locator('#replan-bulk:not([hidden])').count() > 0;
      // `k` advances only when that card produced NO card: a successful one
      // leaves `#cards`, so the list shifts under the index and staying put is
      // what lands on the next item. A container takes no date (law 4).
      if (!secondDated && await page.locator('.replan-card').count() === beforeCount) k += 1;
    }
    const said = secondDated
      ? (await page.locator('.replan-bulk-go').first().innerText()).replace(/\s+/g, ' ')
      : await page.locator('#replan-count').innerText().catch(() => '(no count)');
    (secondDated ? pass : fail)(
      `${theme}/replan: a second date brings up the all-at-once route ("${said}")`);
    if (secondDated) {
      // The count on the button is the TRUE total, not the three on screen — the
      // cap governs what a surface may show and never what somebody asked for.
      (/\d/.test(said) ? pass : fail)(
        `${theme}/replan: the all-at-once button names how many it will act on ("${said}")`);
      await auditContrast(page, 'replan, all at once', theme);
      await auditAxe(page, 'replan, all at once', theme);
      await auditNames(page, 'replan, all at once', theme);
      await auditSeparationAndTargets(page, 'replan, all at once', theme);
      await auditFocusRings(page, 'replan, all at once', theme);
    }


    // AND THE ARRANGEMENT IS ASSERTED, not assumed. A wide pass that ran against
    // a page still showing one pane would report green about a layout that was
    // not there — an absence identical to a presence (hub LESSONS 104).
    for (const [w, h, zoom, what] of [[1000, 750, 1, 'wide'], [900, 700, 2, 'wide at 200%']]) {
      await page.setViewportSize({ width: w, height: h });
      await page.evaluate((px) => {
        document.documentElement.style.fontSize = px ? `${px}px` : '';
      }, zoom === 1 ? 0 : 16 * zoom);
      await enterStance(page, 'nextup');
      await page.waitForTimeout(400);
      const arrangement = await page.evaluate(() => {
        const hub = document.querySelector('#hub');
        const r = hub?.getBoundingClientRect();
        const stance = document.querySelector('#runway')?.getAttribute('data-stance');
        const job = document.querySelector('main > .stance-on');
        const jr = job?.getBoundingClientRect();
        return {
          stance,
          hubOn: hub?.checkVisibility() === true,
          // BESIDE, not merely both present: two panes stacked is the narrow
          // arrangement with the hiding rule removed, which is a different and
          // worse thing than what this is for.
          beside: !!(r && jr && r.width > 0 && jr.left >= r.right - 1),
          overflow: Math.max(0, Math.ceil(document.documentElement.scrollWidth - window.innerWidth)),
        };
      });
      (arrangement.stance === 'nextup' ? pass : fail)(
        `${theme}/${what}: the walk is standing in a job (stance ${arrangement.stance})`);
      (arrangement.hubOn && arrangement.beside ? pass : fail)(
        `${theme}/${what}: the hub is on screen BESIDE the job, not stacked above it`);
      (arrangement.overflow <= 1 ? pass : fail)(
        `${theme}/${what}: page horizontal overflow ${arrangement.overflow}px (must be ≤1)`);
      await auditSeparationAndTargets(page, what, theme);
      await auditAxe(page, what, theme);
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.setViewportSize({ width: 390, height: 844 });

    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log('');
// --- THE EXTRACTION'S OWN ENDING (3.3.0) -------------------------------------
//
// An extraction is not a gate run and must never be mistaken for one: it walks
// under probe colours, so it proves nothing about the product's own. It writes
// the inventory and stops — NO `.a11y-stamp`, which is the receipt saying this
// markup was measured, and would be a lie written by a run that measured
// sentinels.
if (INVENTORY_MODE) {
  // BOTH DIRECTIONS. A declaration whose selector has since been given a role —
  // or removed — is an exemption outliving the thing it exempts, which is how a
  // list like this rots into a licence.
  for (const [sel, why] of UA_OWNED) {
    if (!uaSeen.has(sel)) {
      inventoryFail(
        `.colour-ua-owned declares "${sel}" (${why}) and nothing rendered a `
        + 'colour the roles do not own for it. Give the declaration up.');
    }
  }
  if (unowned.size) {
    // ALL OF THEM, AT THE BOTTOM, READY TO PASTE. An extraction is eight minutes
    // of browser; one that names one problem per run turns a list of eight into
    // eight runs. This was learned the expensive way twice in one evening —
    // the first two runs of this tool were read through a ten-line tail, so the
    // list looked like four both times and was not.
    console.error(`\n  ${unowned.size} selector(s) render a colour no role owns:\n`);
    for (const [sel, where] of [...unowned].sort()) console.error(`    ${sel}  —  ${where}`);
    console.error('\n  Give each one a role, or declare it in .colour-ua-owned:\n');
    for (const [sel] of [...unowned].sort()) console.error(`${sel} | WHY`);
    console.error('');
  }
  if (failures.length) {
    console.error(`\n${failures.length} problem(s) found while extracting. The inventory was NOT written.`);
    console.error('A colour no role owns cannot be checked by arithmetic, so an');
    console.error('inventory with one missing is worse than none.\n');
    process.exit(1);
  }
  // Sorted, so the file is a reviewable artefact rather than a diff that churns
  // on walk order. A new pair appearing in the UI should read as one added line.
  inventory.sort((a, b) => (a.state + a.sel + a.fg + a.bg).localeCompare(b.state + b.sel + b.fg + b.bg));
  // The UA-owned rows carry no roles by definition, so they must not contribute
  // an empty one to this list — which the first version printed as a trailing
  // comma and would have handed to the arithmetic gate as a role to resolve.
  const roles = [...new Set(inventory.filter((r) => !r.uaOwned).flatMap((r) => [r.fg, r.bg]))].sort();
  // STAMPED WITH THE SAME UI HASH THE ACCESSIBILITY RECEIPT USES.
  //
  // The arithmetic gate checks palettes against THIS structure. If the UI moves
  // and nobody re-extracts, that gate goes on passing palettes against a shape
  // the app no longer has — which is worse than no gate, because it reports
  // green. `palette-gate.mjs` refuses a stale inventory for the same reason
  // `a11y-fresh` refuses a stale receipt.
  const { uiHash } = await import('./a11y-stamp.mjs');
  writeFileSync('docs/colour-inventory.json', `${JSON.stringify({
    note: 'Generated by `npm run a11y -- --inventory`. Structure only: which role '
      + 'pairs the UI renders and what floor each needs. Palette-independent by '
      + 'construction — see ADR-0110. Do not hand-edit.',
    ui: uiHash(),
    states: [...new Set(inventory.map((r) => r.state))].length,
    pairs: inventory.length,
    roles,
    inventory,
  }, null, 2)}\n`);
  console.log(`  ${inventory.length} role pairs across ${[...new Set(inventory.map((r) => r.state))].length} states`);
  console.log(`  roles in use: ${roles.join(', ')}`);
  console.log('  written to docs/colour-inventory.json');
  console.log('\nEvery colour the app renders came from a role. Arithmetic can take it from here.');
  process.exit(0);
}
// AND SAY WHAT IT FOUND WHERE SOMETHING CAN READ IT (3.1.2).
//
// The smoke walk has written `.walk-failures` since 3.0.1 and the Spine's own
// error step prints it, so a red run says what was wrong at the bottom of the
// log. This walk did not, and its failures sit thousands of lines up — so a red
// run here was legible only to somebody who could scroll the whole thing, which
// on an API that hands back a tail means not legible at all.
//
// Paid for immediately: two real failures in this release (the top bar running
// 103px past the right edge at 320px/200%, in both themes) cost a second full
// four-minute walk purely to read them back.
//
// EMPTIED ON A CLEAN RUN, never left stale — a receipt for a failure that has
// been fixed is worse than none, which is the argument `.a11y-stamp` above
// already makes about the other direction.
if (failures.length) writeFileSync('.a11y-failures', `${failures.join('\n')}\n`);
else if (existsSync('.a11y-failures')) writeFileSync('.a11y-failures', '');
if (failures.length) {
  console.error(`${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log('The rendered app passes: both themes, every state, stressed viewport, rings and placeholder measured.');

// AND LEAVE THE RECEIPT (2.23.2). This walk measures things no static read can
// reach — contrast per state, focus rings, target separation, axe, the
// 320px/200% reflow — so a commit that changes the rendered app and has not run
// it is a commit nobody has checked. `tools/hooks/a11y-fresh.sh` refuses that
// commit; this is what tells it the walk was run against THIS markup.
// Only on a clean run: a receipt for a failed walk would be a lie in a file
// nobody reads. See tools/a11y-stamp.mjs and LESSONS 126.
const { writeStamp } = await import('./a11y-stamp.mjs');
writeStamp(UI_AT_START);
console.log('  receipt written to .a11y-stamp — the commit hook reads this.');
