// EVERY CLOCK THE APP WRITES SAYS WHO CHOSE THE MOMENT — or this fails.
//
// `test/cure-intent.test.ts` holds the GATE's side total against the cure switch
// it comes from. That test has existed since 2.0.1 and it is good, and it can
// only ever see sources beginning `gate:`.
//
// **The app writes twenty-one clock sources of its own and nothing held those.**
// `isAppClock` recognized none of them, so every one was read as the reader
// naming a date — including three where the reader pressed a ROUTE and the code
// picked a number of days. That is the seventh cold read's date finding, and it
// reproduces from source rather than from a store.
//
// This is the other half: `CLOCK_INTENT` is exhaustive by TYPE over
// `ClockSource`, so a new writer is a compile error until it is classified, and
// the two assertions below make sure the union itself cannot drift from the
// literals the app actually writes. Both directions, because a union entry for
// a source nobody writes any more reads as coverage and is not.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { CLOCK_INTENT, isAppClock, noIntentCures } from '../src/fold.ts';
import type { ClockSource } from '../src/events.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Every tracked `.ts` under `src/`, read rather than listed. */
const sources = (): string[] => {
  const out: string[] = [];
  const walk = (rel: string): void => {
    for (const e of readdirSync(join(ROOT, rel), { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(rel, e.name));
      else if (e.name.endsWith('.ts')) out.push(join(rel, e.name));
    }
  };
  walk('src');
  return out;
};

/**
 * The literals the app passes as a clock source, by the two shapes it uses: a
 * `source:` key in a payload, and the positional argument to `clockInDays`.
 *
 * DERIVED, not listed. A list of sources typed into the test that guards the
 * list of sources is the second copy this repo keeps paying to delete — the
 * same reasoning `cure-intent.test.ts` gives for reading `gate.ts` itself.
 */
const written = (): Set<string> => {
  const found = new Set<string>();
  for (const rel of sources()) {
    const text = readFileSync(join(ROOT, rel), 'utf8');
    for (const m of text.matchAll(/source:\s*'([^']+)'/g)) found.add(m[1]!);
    for (const m of text.matchAll(/clockInDays\([^)]*'([^']+)'\s*\)/g)) found.add(m[1]!);
  }
  return found;
};

test('every clock source the app writes is classified', () => {
  const lits = [...written()].filter(s => !s.startsWith('gate:'));
  // NON-EMPTY FIRST. A pattern that stops matching would leave this iterating
  // nothing and reporting green over the whole question (hub LESSONS 100).
  assert.ok(lits.length >= 15,
    `only ${lits.length} app-written clock source(s) found — the patterns here have `
    + 'gone stale and this test is measuring nothing. Fix them in this commit.');

  for (const s of lits) {
    assert.ok(s in CLOCK_INTENT,
      `\`${s}\` is written as a clock source in src/ and CLOCK_INTENT does not `
      + 'classify it. Decide whether the READER named that moment or the app did; '
      + 'there is no third answer and no default.');
  }
});

test('and every classification is for a source that still exists', () => {
  const lits = written();
  for (const key of Object.keys(CLOCK_INTENT)) {
    assert.ok(lits.has(key),
      `CLOCK_INTENT classifies \`${key}\` and nothing in src/ writes it any more `
      + '— a classification for a source that does not exist reads as coverage '
      + 'and is not.');
  }
});

// ── The five that are candidates to move, pinned where they stand ───────────
//
// Phase 1.1 changed no behavior on purpose: characterize before changing. Each
// of these is a case where the reader chose a ROUTE or an OPTION and the code
// chose the day, so each is a candidate for `app` — and moving one is not a
// local edit. `undatedCount` in `held.ts` asks whether `soonestDemand` returned
// null, so a clock that stops counting as the reader's moves a thing out of
// "comes back tomorrow" and into "here without a date", which is a count a
// reader reads. The ledger measures that and an ADR settles it.
//
// Pinned so the move is deliberate and arrives with its ADR, rather than
// arriving as a one-word edit nobody measured.
test('the five candidates are still the reader’s, so moving one is a decision', () => {
  for (const s of ['clarify:next-action', 'clarify:waiting-for',
    'replan:escalate', 'replan:renegotiate', 'replan:undate'] as ClockSource[]) {
    assert.equal(CLOCK_INTENT[s], 'reader',
      `\`${s}\` has been reclassified. That is a real change to what the held `
      + 'list and the coverage sheet show — land it with the ADR and the '
      + 'characterization entries, and update this pin in the same commit.');
  }
});

// ── And the two that must NOT move, whatever they look like ──────────────────
test('the app’s own bookmark and the sweep stay demands', () => {
  // `focus:resume` looks more like an app clock than anything else here: the
  // reader was interrupted and named no moment. But `cure-intent.test.ts` pins
  // the interrupt cure as a demand in terms — "a resume card is the thread you
  // were pulling — it must come back" — and an app clock here would stop it
  // being offered. That is the "any gate:" mistake one source over, and the
  // release it cost is why that test exists.
  assert.equal(CLOCK_INTENT['focus:resume'], 'reader',
    'the resume card must come back — see test/cure-intent.test.ts');
  // Opting into the sweep is opting to be brought back.
  assert.equal(CLOCK_INTENT['comms:start'], 'reader',
    'an app clock here is a sweep that never surfaces');
});

test('no behavior changed: every app-written source still reads as the reader’s', () => {
  // The falsifiable form of this commit's claim. Phase 1.1 makes the
  // classification EXPLICIT and TYPED; it moves nothing. When the ADR moves
  // one, this test is where the move becomes visible.
  const NOW = '2026-08-10T18:00:00.000Z';
  for (const s of Object.keys(CLOCK_INTENT) as ClockSource[]) {
    assert.equal(isAppClock({ kind: 'review', at: NOW, source: s } as never), false,
      `\`${s}\` now reads as an app clock. If that is intended it is a behavior `
      + 'change and owes a measurement, not a green suite.');
  }
});

test('the gate’s side is untouched, and an unknown source is still somebody’s', () => {
  // The two halves are separate structures for two domains with different
  // totality mechanisms, and this is the assertion that they stay joined at
  // the predicate rather than drifting apart.
  assert.ok(noIntentCures.size >= 10, 'the gate side has been narrowed');
  for (const s of noIntentCures) {
    assert.equal(isAppClock({ kind: 'review', at: '2026-08-10T18:00:00.000Z', source: s } as never), true,
      `${s} is a no-intent cure and isAppClock no longer says so`);
  }
  // The default every old log and every arbitrary test source relies on.
  assert.equal(isAppClock({ kind: 'review', at: '2026-08-10T18:00:00.000Z', source: 'user' } as never), false);
  assert.equal(isAppClock({ kind: 'review', at: '2026-08-10T18:00:00.000Z', source: 'a-source-from-2025' } as never), false);
});

// ── The ledger's first two entries: what the two surfaces say TODAY ─────────
//
// The seventh cold read's date finding, characterized rather than argued. These
// assertions pin CURRENT behavior, including the part of it that is wrong. Their
// job is to go red when Phase 1.4 moves both surfaces onto one derivation, at
// which point they become the statement of what the rule decided.
//
// MEASURED, AND THE CENSUS UNDERSTATES IT. `structural-assessment.md` says the
// held list shows "tomorrow" while the sheet shows the due date. The held list
// actually says **today**: the sorting route's clock lands on the last instant
// of a local calendar day, so a clock written today reads as today in the
// reader's zone, not tomorrow. The gap is a thing said to be here now against a
// thing said to be two months away.
//
// AND THE SECOND ENTRY IS WHY THE CLASSIFICATION CANNOT MOVE ON ITS OWN. A bare
// next action — the route's clock and nothing else — AGREES on both surfaces
// today. Classifying `clarify:next-action` as the app's would drop it out of
// `soonestDemand`, so the held list would call it undated while the sheet went
// on saying it comes back today. That is not a fix; it is the same defect moved
// to a case that currently works. One derivation is the fix, and the
// classification moves with it.
test('read 7, characterized: one node, two surfaces, two different answers', async () => {
  const { fold } = await import('../src/fold.ts');
  const { admit, gateOptionsFor } = await import('../src/gate.ts');
  const { heldGroups, heldStatus } = await import('../src/held.ts');

  const NOW = '2026-09-17T18:00:00.000Z';
  const TZ = 'America/Denver';
  let seq = 0;
  const ev = (kind: string, node: string, payload: unknown) => ({
    id: `e${++seq}`, kind, node, payload, at: NOW, device: 'd', seq, vault: 'main',
  } as never);
  const through = (...events: never[]) => {
    let log: never[] = [];
    for (const e of events) log = [...log, ...admit([e], fold(log), gateOptionsFor(TZ))] as never[];
    return fold(log);
  };

  const s = through(
    ev('node.created', 'A', { nodeKind: 'action', title: 'a thing' }),
    ev('clock.set', 'A', { clockKind: 'due', at: '2026-11-17T06:59:59.999Z', source: 'detail:due' }),
    ev('clock.set', 'A', { clockKind: 'review', at: '2026-09-18T05:59:59.999Z', source: 'clarify:next-action' }),
  );
  const n = s.nodes.get('A')!;

  // Precondition: the route's clock really is standing and really is unclassified
  // as the app's, which is what puts it in front of the due date.
  assert.equal(n.clocks.review?.source, 'clarify:next-action');
  assert.equal(isAppClock(n.clocks.review), false);

  // Rule one, the held list: the soonest clock it counts as a demand.
  assert.equal(heldStatus(n, NOW, TZ, { zone: TZ, boundary: 0 }), 'today',
    'the held card says the thing is here NOW');
  assert.equal(heldGroups(s, NOW, TZ).find(g => g.items.some(i => i.id === 'A'))?.key, 'ready');

  // Rule three, the sheet's state line, `src/ui/detail.ts:785` — `due ?? review
  // ?? start`, no app-clock filter, no park, no suspense, no past guard.
  //
  // COPIED HERE ON PURPOSE, and it is the one place a copy is the right thing:
  // that expression lives inside a DOM render and cannot be called from a test,
  // and a ledger's job is to record what the old site did so the new one can be
  // held against it. It is not a sanctioned second implementation — Phase 1.4
  // deletes the original and this line goes with it.
  const sheetSays = (n.clocks.due ?? n.clocks.review ?? n.clocks.start)?.at;
  assert.equal(sheetSays, '2026-11-17T06:59:59.999Z',
    'the thing’s own page says two months away, about the same node');
});

test('and the bare route AGREES today — which is what moving the source alone would break', async () => {
  const { fold } = await import('../src/fold.ts');
  const { admit, gateOptionsFor } = await import('../src/gate.ts');
  const { heldStatus } = await import('../src/held.ts');

  const NOW = '2026-09-17T18:00:00.000Z';
  const TZ = 'America/Denver';
  let seq = 0;
  const ev = (kind: string, node: string, payload: unknown) => ({
    id: `b${++seq}`, kind, node, payload, at: NOW, device: 'd', seq, vault: 'main',
  } as never);
  let log: never[] = [];
  for (const e of [
    ev('node.created', 'A', { nodeKind: 'action', title: 'a thing' }),
    ev('clock.set', 'A', { clockKind: 'review', at: '2026-09-18T05:59:59.999Z', source: 'clarify:next-action' }),
  ]) log = [...log, ...admit([e], fold(log), gateOptionsFor(TZ))] as never[];
  const s = fold(log);
  const n = s.nodes.get('A')!;

  assert.equal(heldStatus(n, NOW, TZ, { zone: TZ, boundary: 0 }), 'today');
  assert.equal((n.clocks.due ?? n.clocks.review ?? n.clocks.start)?.at, '2026-09-18T05:59:59.999Z',
    'the sheet reaches the same clock, so this case is consistent as it stands');
});
