#!/usr/bin/env node
// THE VALUE HALF OF THE ACCESSIBILITY GATE (3.3.0, ADR-0110).
//
// Contrast is a property of a PAIR. Swapping a palette changes token VALUES; it
// never changes which token a selector resolves to, nor the size and weight it
// renders at. So the browser is needed for the structural half only — which
// pairs the UI produces — and that half is identical for every palette.
//
// `tools/a11y.mjs --inventory` extracts the structure once, under a sentinel
// palette that makes the role mapping injective by construction. This reads it
// and does the arithmetic, for every palette, with no browser at all.
//
// WHAT IT COST BEFORE. The walk made 1,660 contrast assertions for TWO palettes
// — about 830 each, four minutes of browser each. A sixth palette would have
// been twenty-four minutes of re-measuring the same structure. The 624 rows in
// the inventory reduce to THIRTEEN distinct (fg, bg, floor) combinations, so a
// palette is thirteen computations. Adding one is free.
//
// WHAT THIS DOES NOT DO, said plainly: it does not know which states exist. If
// the walk never visits a surface, its pairs are not in the inventory and no
// arithmetic here will invent them. This removes repetition, not the need to
// walk the app.

import { readFileSync, existsSync } from 'node:fs';

const INVENTORY = 'docs/colour-inventory.json';
const PALETTES = 'docs/palettes.json';

/* WCAG 2.x, run rather than estimated — the same maths the hub's
 * `palette-check.mjs` uses, because two implementations of one formula is one
 * implementation and one liability. */
const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const x = lum(a); const y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const rgb = (hex) => {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const failures = [];
const fail = (m) => { failures.push(m); console.log(`  FAIL  ${m}`); };
const ok = (m) => console.log(`  ok    ${m}`);

console.log('\nEvery palette, against the pairs the app actually renders\n');

for (const f of [INVENTORY, PALETTES]) {
  if (!existsSync(f)) {
    console.error(`  ${f} is missing. Run \`npm run a11y -- --inventory\` first.`);
    process.exit(1);
  }
}
const inv = JSON.parse(readFileSync(INVENTORY, 'utf8'));
const set = JSON.parse(readFileSync(PALETTES, 'utf8'));

// A STALE INVENTORY IS WORSE THAN NONE, because it reports green. This gate
// checks palettes against a STRUCTURE, so if the UI has moved since the
// structure was extracted, every answer below is about an app that no longer
// exists. Same argument as `.a11y-stamp`, same hash, so the two cannot disagree
// about what "this markup" means.
const { uiHash } = await import('./a11y-stamp.mjs');
const now = uiHash();
if (!inv.ui) {
  console.log('  FAIL  docs/colour-inventory.json carries no UI stamp — re-extract it.\n');
  process.exit(1);
}
if (inv.ui !== now) {
  console.log('  FAIL  the colour inventory was taken from different markup than this.');
  console.log(`        inventory ${inv.ui}`);
  console.log(`        this tree ${now}`);
  console.log('\n  Every answer below would be about an app that no longer exists.');
  console.log('  Re-extract it:  npm run a11y -- --inventory\n');
  process.exit(1);
}

// THE PAIRS, DEDUPED. 624 rows are 13 facts; checking a fact once per palette is
// the whole saving. Every row that produced a pair is remembered so a failure can
// say WHERE it shows, which is what makes it fixable.
const pairs = new Map();
for (const r of inv.inventory) {
  if (r.uaOwned) continue;
  const key = `${r.fg}|${r.bg}|${r.floor}`;
  if (!pairs.has(key)) pairs.set(key, { fg: r.fg, bg: r.bg, floor: r.floor, where: [] });
  const at = pairs.get(key).where;
  if (at.length < 3 && !at.includes(r.state)) at.push(r.state);
}
const used = [...new Set([...pairs.values()].flatMap((p) => [p.fg, p.bg]))].sort();

console.log(`  ${inv.inventory.length} inventory rows across ${inv.states} states`);
console.log(`  ${pairs.size} distinct pairs to check, in ${used.length} roles: ${used.join(', ')}`);
const ua = inv.inventory.filter((r) => r.uaOwned);
if (ua.length) {
  const sels = [...new Set(ua.map((r) => r.sel))];
  console.log(`  ${sels.length} control(s) the browser paints, declared and not palette-able:`);
  console.log(`    ${sels.join(', ')}`);
}
console.log('');

const names = Object.keys(set.palettes);
if (names.length === 0) fail('docs/palettes.json defines no palettes');

for (const id of names) {
  const p = set.palettes[id];
  const roles = p.roles ?? {};
  // A PALETTE MISSING A ROLE IS A HOLE, not a smaller palette. Refused before
  // any arithmetic, because `undefined` would otherwise fail as a bad colour and
  // read as a contrast problem.
  const missing = used.filter((r) => !roles[r]);
  if (missing.length) {
    fail(`${id}: no value for ${missing.join(', ')} — every role the app renders must be given one`);
    continue;
  }
  const bad = used.filter((r) => !rgb(roles[r]));
  if (bad.length) {
    fail(`${id}: ${bad.map((r) => `${r}="${roles[r]}"`).join(', ')} is not a 6-digit hex colour`);
    continue;
  }
  let worst = null;
  let broke = 0;
  for (const pr of pairs.values()) {
    const got = ratio(rgb(roles[pr.fg]), rgb(roles[pr.bg]));
    if (worst === null || got / pr.floor < worst.got / worst.floor) worst = { ...pr, got };
    if (got + 0.005 < pr.floor) {
      broke += 1;
      fail(`${id}: ${pr.fg} on ${pr.bg} is ${got.toFixed(2)}:1, needs ${pr.floor}:1 `
        + `— shows on ${pr.where.join(', ')}`);
    }
  }
  if (broke === 0) {
    ok(`${p.name ?? id}: all ${pairs.size} pairs clear their floor `
      + `(tightest ${worst.fg} on ${worst.bg} at ${worst.got.toFixed(2)}:1 against ${worst.floor}:1)`);
  }
}

console.log('');
if (failures.length) {
  console.log(`${failures.length} problem(s). A palette that fails here cannot ship, and`);
  console.log('nothing had to be rendered to find out.\n');
  process.exit(1);
}
console.log(`${names.length} palette(s) checked against ${pairs.size} pairs, no browser involved.`);
console.log('Adding another is an entry in docs/palettes.json and a block in the stylesheet.\n');
