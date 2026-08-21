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
import { existsSync, writeFileSync, rmSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

/** ONE SURFACE AT A TIME (1.40.0) — see the note in tools/smoke.mjs. */
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
if (!existsSync(join(ROOT, 'public', 'app.js'))) {
  console.error('public/app.js is missing — run `npm run build` first.');
  process.exit(1);
}

const launchOpts = { args: ['--no-sandbox'] };
const SANDBOX_CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
if (existsSync(SANDBOX_CHROMIUM)) launchOpts.executablePath = SANDBOX_CHROMIUM;

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
const fail = (m) => { failures.push(m); console.error(`  FAIL  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);

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
  'walkthrough': ['#tour-progress', '#tour-heading', '.tour-p', '#tour-skip', '#tour-next'],
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
    'button.info', '.section', '.gauge', '.empty', '.foot', '.foot a', '.build',
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
    '#detail-arrangement-set', '#detail-arrangement-stop', '#detail-arrangement-depends'],
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
  'detail sheet, creating a place': ['#detail-parent-filter', '#detail-parent-create'],
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
  'the door onto the inbox': ['#triage-open'],
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
    '.triage-undo-btn',
    // `.card-place` had never been measured anywhere — the line that says "in
    // Errands · under Home", and from 1.27.0 also what a returned place is
    // holding, which reuses the same class and so the same pair. It is
    // registered HERE because this is the state that reliably has one: the
    // filing just happened, so the item's card now says where it went. In the
    // ordinary card state nothing is filed and the entry would correctly match
    // nothing visible.
    '.card-place'],
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
  'next up': ['#nextup-heading', '.nextup-title', '.nextup-why', '#nextup-written', '.nextup-count',
    '#nextup-done', '#nextup-skip', '#gauge', '.card-done', '#tree-open', '#to-held', '#to-top',
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
  'where you are': ['#where', '#where-note', '.card-where'],
  // WHO IT IS FOR (2.6.0, ADR-0096). Its own driven state for the reason 'where
  // you are' has one: the door and the readout render only once a role exists,
  // so registering them on a state whose store has none would be three false
  // receipts — the failure `#nextup-left` already cost a release for.
  'where the attention is': ['#roles-open'],
  'roles open': ['#sheet-roles-title', '#sheet-roles-close', '#roles-words',
    '.roles-name', '.roles-held', '#roles-unnamed'],
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
  'tree open': ['#sheet-tree-title', '#sheet-tree-close', '.tree-open-row', '.tree-title'],
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
  // A person's own sheet (1.12.0): what is with them. The relation and the
  // duration are the quietest text, and both are FACTS — never a grade.
  // Scoped to the GROUP, not to one of its two lists: what someone owes you
  // and where else they come up render through identical bindings, and which
  // list is populated depends on the kind of thing they are linked to. A
  // registry entry that only matches one of them is a gate that passes or
  // fails on fixture shape rather than on contrast.
  'detail sheet, a person': ['#detail-person-count',
    '#detail-person-group .detail-feed', '#detail-person-group button', '.detail-when'],
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
  'detail sheet, inside something': ['#detail-place', '#detail-title', '.detail-label',
    '#detail-parent', '#detail-parent-set', '#detail-close'],
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
  'report controls': ['#report-copy', '#report-markdown', '#report-csv', '#report-print',
    '.about-p', '.about-section'],
  // The person lens. How long something has been with someone is the
  // lowest-contrast text here and it is load-bearing — it is the fact you use to
  // decide whether to mention it. Same ink tokens as everything else: there is
  // no colour that means "they have had this a while", and there will not be.
  'people': ['#people-heading', '.people-count', '.people-open',
    '.people-title', '.people-why'],
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

async function auditContrast(page, stateName, theme, registryKey = stateName) {
  const rows = await page.evaluate(sampler, REGISTRY[registryKey]);
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
async function auditFocusRings(page, stateName, theme, selectors) {
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
      return {
        match,
        visible: cs.outlineStyle,
        width: parseFloat(cs.outlineWidth),
        colour: parseC(cs.outlineColor),
        bg: bgOf(el.parentElement ?? el),
        focusVisible: el.matches(':focus-visible'),
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
    // Step to the end. The last step's "Get started" hands off to the (i) panel
    // for the storage step, which is exactly what State 1 audits.
    // Driven to the END rather than clicked a fixed number of times. Four clicks
    // silently meant "there are four steps", so adding two real ones timed the
    // whole gate out instead of auditing a longer walkthrough. A step count is
    // content; "Get started" is the guarantee.
    for (let guard = 0; guard < 20; guard++) {
      const label = (await page.locator('#tour-next').textContent())?.trim();
      await page.click('#tour-next');
      if (label === 'Get started') break;
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
    await openSurface(page, 'about');
    await page.waitForFunction(
      () => document.querySelector('#about-intro')?.checkVisibility() === true,
      null, { timeout: 5000 },
    ).catch(() => { /* the audits below say what happened */ });
    await auditContrast(page, 'first-run dialog', theme);
    await auditAxe(page, 'first-run dialog', theme);
    await auditNames(page, 'first-run dialog', theme);
    await auditSeparationAndTargets(page, 'first-run dialog', theme);
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
    await auditContrast(page, 'the door onto the inbox', theme);
    await auditAxe(page, 'the door onto the inbox', theme);
    await auditNames(page, 'the door onto the inbox', theme);
    await auditSeparationAndTargets(page, 'the door onto the inbox', theme);
    await auditFocusRings(page, 'the door onto the inbox', theme, ['#triage-open']);

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
    await page.waitForSelector('#triage-open:not([hidden])', { timeout: 4000 }).then(() => page.click('#triage-open')).catch(() => {});
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
    await page.locator('#triage-actions .route', { hasText: 'Put it somewhere' }).first().click();
    await page.waitForSelector('#triage-place-new');
    await auditContrast(page, 'place picker', theme);
    await auditAxe(page, 'place picker', theme);
    await auditNames(page, 'place picker', theme);
    await auditSeparationAndTargets(page, 'place picker', theme);
    await auditFocusRings(page, 'place picker', theme, ['#triage-actions .route']);

    // State 3b-iii: the filed receipt, carrying the question and its answer
    // (V2 stage 3). File into a NEW place — which is the branch that always has
    // no return date — audit the bar, then Undo, which puts the card back and
    // leaves the surface as this section found it.
    await page.fill('#triage-place-new', 'A place for a11y');
    await page.locator('#triage-actions .route', { hasText: 'Make it' }).first().click();
    await page.waitForSelector('.triage-place-when');
    await auditContrast(page, 'filed receipt', theme);
    await auditAxe(page, 'filed receipt', theme);
    await auditNames(page, 'filed receipt', theme);
    await auditSeparationAndTargets(page, 'filed receipt', theme);
    await auditFocusRings(page, 'filed receipt', theme, ['.triage-place-when', '.triage-place-set']);
    await page.locator('.triage-undo-btn').click();
    await page.waitForSelector('#triage-actions .route .route-hint');

    await page.locator('#triage-actions .route', { hasText: 'Put it somewhere' }).first().click();
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
    await auditContrast(page, 'next up', theme);
    await auditAxe(page, 'next up', theme);
    await auditNames(page, 'next up', theme);
    await auditSeparationAndTargets(page, 'next up', theme);
    await auditFocusRings(page, 'next up', theme, ['#nextup-done', '#nextup-skip', '#gauge', '#cards .card-done', '#to-held', '#to-top', '#nextup-title']);

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
        const n = ((el.textContent || '').trim().match(/\S+/g) ?? []).length;
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
        .filter((s) => !s.hidden)
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
    await page.click('#detail-close');
    await page.waitForSelector('#where-row:not([hidden])');
    await page.selectOption('#where', { label: 'At home' });
    await page.waitForSelector('#where-note:not([hidden])');
    await auditContrast(page, 'where you are', theme);
    await auditAxe(page, 'where you are', theme);
    await auditNames(page, 'where you are', theme);
    await auditSeparationAndTargets(page, 'where you are', theme);
    await auditFocusRings(page, 'where you are', theme, ['#where']);
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

    // Back to everywhere, so every state after this sees the whole list.
    await page.selectOption('#where', '');
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
      await page.locator('#triage-actions .route', { hasText: 'Hot' }).first().click();
      await page.waitForTimeout(120);
    }
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
      await page.locator('#triage-actions .route', { hasText: 'Hot' }).first().click();
      await page.waitForTimeout(120);
    }
    await page.locator('#triage-actions .route', { hasText: 'Waiting for' }).first().click();
    await page.waitForTimeout(300);
    await page.waitForSelector('#people:not([hidden])');
    await auditContrast(page, 'people', theme);
    await auditAxe(page, 'people', theme);
    await auditNames(page, 'people', theme);
    await auditSeparationAndTargets(page, 'people', theme);
    await auditFocusRings(page, 'people', theme, ['.people-open']);

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
    await page.locator('#cards .card-open').first().click();
    await page.waitForSelector('#detail[open]');
    const todayKey = await page.evaluate(() => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    });
    await page.fill('#detail-date', todayKey);
    await page.click('#detail-date-set');
    await page.waitForTimeout(200);
    await page.click('#detail-close');
    await page.locator('#cards .card-focus').first().click();
    await page.waitForSelector('#focus:not([hidden])');
    await page.waitForSelector('#focus-fixed:not([hidden])', { timeout: 5000 }).catch(() => {});

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

    // And the sheet once something IS inside something — the only state in which
    // `#detail-place` renders at all. Left out, the one line that states a
    // structural fact would go permanently unmeasured, which is exactly the hole
    // an audit found behind `.replan-context`.
    // The SECOND card. The first is the container just made, and a container's
    // own picker excludes itself — so reusing it audited an empty picker and
    // reported the state as unauditable, which is the guard below working.
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

    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log('');
if (failures.length) {
  console.error(`${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log('The rendered app passes: both themes, every state, stressed viewport, rings and placeholder measured.');
