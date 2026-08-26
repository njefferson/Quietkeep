// A PICTURE OF EACH SET OF COLOURS, SO THEY CAN BE COMPARED SIDE BY SIDE.
//
// The picker named five families and said what each was for, which satisfies
// Doctrine §4 — the name is the control and colour is never the sole carrier of
// meaning — and still leaves you choosing a look you cannot see. Naming a thing
// and showing it are not alternatives.
//
// WHY A PICTURE AND NOT LIVE CSS. A tile painted with real custom properties
// renders a FOREIGN palette inside the current one, and that breaks the
// assumption the whole colour gate rests on: exactly one palette is active, so
// every computed colour maps to one role (ADR-0110). It also creates a boundary
// pair per pairing of families per mode — fifty of them — none of which the
// thirteen-pair inventory knows about. A PNG has no custom properties and no
// roles. It is opaque. The only question it raises is whether you can see where
// the tile ends, and a border in the host's own `--line` answers that, which is
// already one of the thirteen.
//
// It is a PREVIEW, not a gate. `palette:check` already proves every family
// clears the floors in both modes, by arithmetic, in a quarter of a second. A
// photograph of colours that are already proven does not need proving again,
// and the tiles live inside the settings sheet the accessibility walk already
// visits, so there is no new surface either.
//
// DAY BESIDE NIGHT, THE SAME VIEW TWICE. Each family has a light and a dark, and
// showing ten tiles is a wall — so one tile carries both.
//
// It was a diagonal cut first, over ONE copy of the sample, and that is the
// version that looks clever and compares nothing: the heading landed in day, the
// button landed in night, and no element ever appeared in both. You could see
// two colours; you could not see the same thing twice. Split down the middle
// with a full copy each side, every element has a left and a right — the button
// is in both, the card is in both — which is what makes it a comparison rather
// than a swatch.
//
// THE FIXTURE IS BUILT HERE, NOT SHIPPED. Nothing new goes in `public/`: the
// sample markup is set on the page directly, and the role values come out of
// `docs/palettes.json` — the same file `palettes:check` holds the stylesheet to,
// so the picture and the app cannot disagree about what a family is. Driving the
// real app instead would have tied these pictures to markup that moves for
// unrelated reasons.
//
// The generated CSS is `:root`-scoped (`:root[data-palette=x][data-theme=dark]`),
// which is why the fixture cannot simply link it: two themes cannot both be the
// root of one document. Inline variables on two boxes can.

import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'docs/palettes.json');
const OUT = join(ROOT, 'public/palette-shots');
const MANIFEST = join(OUT, 'manifest.json');

const KNOWN = new Set(['--check', '--if-stale']);
const unknown = process.argv.slice(2).filter((a) => a.startsWith('--') && !KNOWN.has(a));
if (unknown.length) {
  console.error(`unknown option(s): ${unknown.join(', ')}`);
  console.error(`known: ${[...KNOWN].join(', ')}`);
  process.exit(2);
}
const CHECK = process.argv.includes('--check');
const IF_STALE = process.argv.includes('--if-stale');

const set = JSON.parse(readFileSync(SRC, 'utf8'));
const families = Object.entries(set.families ?? {});

// WHAT MAKES THESE STALE. The colours themselves, and the sample they are shown
// on. Not the app: these pictures are of a fixture, so an unrelated change to
// index.html must NOT demand a re-render — which is the whole reason the
// fixture exists rather than driving the real screen.
const SAMPLE_VERSION = '4';
const stampOf = () => createHash('sha256')
  .update(readFileSync(SRC))
  .update(SAMPLE_VERSION)
  .update(families.map(([k]) => k).join(','))
  .digest('hex').slice(0, 16);

const recorded = () => {
  try { return JSON.parse(readFileSync(MANIFEST, 'utf8')).stamp ?? null; } catch { return null; }
};

if (CHECK) {
  const have = recorded();
  const want = stampOf();
  if (have !== want) {
    console.error('\n  FAIL  public/palette-shots is not a picture of the colours in docs/palettes.json.');
    console.error(`        recorded ${have ?? '(none)'} · this tree ${want}`);
    console.error('        Run:  npm run palette:shots -- --if-stale\n');
    process.exit(1);
  }
  const files = existsSync(OUT) ? readdirSync(OUT).filter((f) => f.endsWith('.png')) : [];
  const missing = families.map(([k]) => `${k}.png`).filter((f) => !files.includes(f));
  if (missing.length) {
    console.error(`\n  FAIL  no picture for: ${missing.join(', ')}\n`);
    process.exit(1);
  }
  console.log(`\n  ok    ${files.length} palette pictures, current with docs/palettes.json\n`);
  process.exit(0);
}

if (IF_STALE && recorded() === stampOf()) {
  console.log('palette pictures are current — nothing to render.');
  process.exit(0);
}

/** The sample. Deliberately small and deliberately the app's own shapes: a
 *  heading, a line of prose, a card with a quiet second line, and a filled
 *  button. Enough to see how a family treats text, a raised surface, a muted
 *  tone and the one colour that carries emphasis. */
const sample = (roles) => {
  const v = Object.entries(roles).map(([k, val]) => `--${k}:${val}`).join(';');
  return `<div class="half" style="${v}">
    <div class="pane">
      <p class="h">What do you want to put down?</p>
      <div class="card">
        <p class="t">Ring the dentist</p>
        <p class="s">put down on Tuesday</p>
      </div>
      <div class="card">
        <p class="t">Ask about the roof</p>
        <p class="s">no date yet</p>
      </div>
      <p class="warm">4 things are waiting on somebody</p>
      <div class="row">
        <span class="btn">Hold it</span>
        <span class="ghost">Not this</span>
      </div>
    </div>
  </div>`;
};

// ENOUGH OF THE APP TO SEE A DIFFERENCE BY.
//
// The first sample was a heading, one card and one button, and it could not
// have told two close palettes apart — most of its area was page background and
// it used four of the seven roles. Two families that differ mainly in the
// treatment of a raised surface, or in the colour of something you can press,
// would have looked identical in it whether or not they were.
//
// This one puts every role on screen with enough area to read: two cards for
// `surface` and `line`, a filled button and a ghost one for `accent` in both of
// its uses, a warm note for `warm`, and quiet second lines for `ink-soft`. It is
// still a sample rather than a screenshot of the app — a real screen would tie
// these pictures to markup that moves for unrelated reasons — but it is now a
// sample that can be wrong about a palette rather than silent.
const W = 420, H = 200;
const page$ = (f) => `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body { display: flex;
    font: 11px/1.4 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  /* HALF EACH, AND A HARD EDGE BETWEEN THEM. No fade and no diagonal: the two
     sides are the same view, and anything blended across the seam would be a
     third colour belonging to neither. */
  .half { flex: 1 1 50%; min-width: 0; background: var(--bg); color: var(--ink); }
  .pane { padding: 10px 11px; display: flex; flex-direction: column; gap: 7px; }
  .h { font-weight: 600; font-size: 11px; }
  .card { background: var(--surface); border: 1px solid var(--line);
    border-radius: 6px; padding: 6px 8px; }
  .t { font-weight: 500; }
  .s { color: var(--ink-soft); font-size: 10px; margin-top: 1px; }
  .warm { color: var(--warm); font-size: 10px; }
  .row { display: flex; gap: 6px; align-items: center; }
  .btn { background: var(--accent); color: var(--bg);
    border-radius: 6px; padding: 5px 11px; font-weight: 600; }
  .ghost { color: var(--accent); border: 1px solid var(--line);
    border-radius: 6px; padding: 4px 10px; font-weight: 500; }
</style></head><body>${sample(f.light)}${sample(f.dark)}</body></html>`;

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) rmSync(join(OUT, f));

const launchOpts = { args: ['--no-sandbox'] };
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
if (existsSync(CH)) launchOpts.executablePath = CH;

// NO SERVER, AND THAT IS THE FIX RATHER THAN A SIMPLIFICATION. The first
// version served `public/` and navigated there before calling `setContent`,
// which inherits the ORIGIN — and this app ships a strict CSP, so its
// `style-src` threw away the fixture's entire `<style>` block. The pictures
// came out as unstyled serif text on white, in every family, identically. The
// a11y walk sets `bypassCSP` for the same reason; here there is nothing from
// that origin worth having, so the page stays about:blank and the CSP is
// never in the room.
const browser = await chromium.launch(launchOpts);
let total = 0;
try {
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  for (const [key, f] of families) {
    await page.setContent(page$(f), { waitUntil: 'load' });
    const shot = await page.screenshot({ type: 'png' });
    writeFileSync(join(OUT, `${key}.png`), shot);
    total += shot.length;
    console.log(`  ${f.name ?? key} ${(shot.length / 1024).toFixed(1)}KB`);
  }
} finally {
  await browser.close();
}

writeFileSync(MANIFEST, `${JSON.stringify({ stamp: stampOf(), count: families.length }, null, 2)}\n`);
console.log(`\n  ${(total / 1024).toFixed(0)}KB across ${families.length} pictures`);
console.log('  manifest written — `npm run palette:shots -- --check` holds them to docs/palettes.json');
