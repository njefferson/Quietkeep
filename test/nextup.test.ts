// Phase 3: the decay primitive and Next-up.
//
// The load-bearing properties: pressure is continuous and has no stored
// threshold; the precedence is a fixed order that nothing computed can jump;
// "not this" changes no state at all; and nothing that belongs to another
// surface (the inbox, the Menu, a waiting-for) is ever offered as work.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fold, emptyState, type State, type NodeState } from '../src/fold.ts';
import { atMidnight } from '../src/time.ts';
import { pressureOf, isReadyAgain, pressureWords } from '../src/pressure.ts';
import { nextUp, nextUpQueue, upkeepChips, workSurface, BEHIND_CAP } from '../src/nextup.ts';
import { coverageGauge, heldNodes } from '../src/gate.ts';
import { serialiseState } from '../src/snapshot.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';                     // never UTC (V-13)
const NOW = '2026-07-29T18:00:00.000Z';          // 12:00 on the 29th, Denver

let seq = 0;
const ev = (kind: string, node: string, payload: unknown, at = '2026-07-01T12:00:00.000Z'): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);

/** Build state directly from events — no gate, because these are projections. */
const st = (...events: AppEvent[]): State => fold(events);

const upkeep = (id: string, intervalDays: number, comfortWindowDays: number, lastDone: string | null): AppEvent[] => [
  ev('node.created', id, { nodeKind: 'upkeep', title: id }),
  ev('upkeep.interval.set', id, { intervalDays, comfortWindowDays }),
  ...(lastDone ? [ev('done.marked', id, { at: lastDone })] : []),
];

// --- the decay primitive ---------------------------------------------------

test('pressure is continuous, signed, and unbounded — no stored threshold', () => {
  // interval 7, comfort window 2. Pressure = (elapsed - 7) / 2.
  const at = (lastDone: string): number =>
    pressureOf(st(...upkeep('U', 7, 2, lastDone)).nodes.get('U')!, NOW, atMidnight(TZ))!;
  assert.equal(at('2026-07-27T18:00:00.000Z'), -2.5, 'two days in: comfortably settled');
  assert.equal(at('2026-07-22T18:00:00.000Z'), 0, 'exactly seven days: ready again, pressure 0');
  assert.equal(at('2026-07-20T18:00:00.000Z'), 1, 'one comfort window past ready');
  assert.equal(at('2026-06-20T18:00:00.000Z'), 16, 'and it keeps going — nothing clamps');
});

test('the comfort window is per item — the same lateness is not the same pressure', () => {
  // Both nine days since done; the plant minds, your mother does not.
  const plant = st(...upkeep('plant', 7, 1, '2026-07-20T18:00:00.000Z')).nodes.get('plant')!;
  const call = st(...upkeep('call', 7, 14, '2026-07-20T18:00:00.000Z')).nodes.get('call')!;
  assert.equal(pressureOf(plant, NOW, atMidnight(TZ)), 2, 'a one-day tolerance: two windows past');
  assert.ok(pressureOf(call, NOW, atMidnight(TZ))! < 0.2, 'a fortnight of tolerance: barely anything');
});

test('never done is READY, not infinitely late — no shame surface for a new item', () => {
  const n = st(...upkeep('U', 7, 2, null)).nodes.get('U')!;
  assert.equal(pressureOf(n, NOW, atMidnight(TZ)), 0, 'a brand-new upkeep is simply available');
  assert.equal(isReadyAgain(pressureOf(n, NOW, atMidnight(TZ))), true);
});

test('pressure is null — not zero — for an item with no cadence', () => {
  const n = st(ev('node.created', 'A', { nodeKind: 'action', title: 'a one-off' })).nodes.get('A')!;
  assert.equal(pressureOf(n, NOW, atMidnight(TZ)), null, 'asking for a number would invent one');
  assert.equal(isReadyAgain(null), false, 'and null is never "ready again"');
});

test('the words never accuse, and there is no "overdue" among them', () => {
  const words = [-1, -0.2, 0, 0.5, 2, 10].map(p => pressureWords(p));
  assert.deepEqual(words, ['settled', 'coming round', 'ready again', 'ready again', 'been a while', 'been a good while']);
  for (const w of words) {
    assert.doesNotMatch(w, /overdue|late|missed|behind|fail/i, `"${w}" carries no rebuke`);
  }
});

// --- Next-up ---------------------------------------------------------------

test('a hard date that has arrived outranks any amount of pressure', () => {
  const s = st(
    ...upkeep('U', 7, 1, '2026-06-01T18:00:00.000Z'),                       // enormous pressure
    ev('node.created', 'D', { nodeKind: 'action', title: 'the appointment' }),
    ev('clock.set', 'D', { clockKind: 'due', at: NOW, source: 'test' }),
  );
  const up = nextUp(s, NOW, TZ);
  assert.equal(up.head!.node.id, 'D', 'the appointment leads');
  assert.equal(up.head!.reason, 'hard-date');
  assert.ok(pressureOf(s.nodes.get('U')!, NOW, atMidnight(TZ))! > 50, 'even against a very insistent upkeep');
});

test('a resume card outranks pressure but not a hard date', () => {
  // These fixtures carry `forNode` and a real target. They did NOT before, and
  // the card was still ranked first — a way back into nothing at all, led the
  // list. `resume.card.created` folded only the KIND, so the card knew it was a
  // card and could name nothing, and no test noticed because none of them asked
  // what it pointed at.
  const s = st(
    ...upkeep('U', 7, 1, '2026-06-01T18:00:00.000Z'),
    ev('node.created', 'W', { nodeKind: 'action', title: 'the chapter' }),
    ev('resume.card.created', 'R', { forNode: 'W', cue: 'the paragraph about ferries' }),
    ev('clock.set', 'R', { clockKind: 'review', at: NOW, source: 'test' }),
  );
  assert.equal(nextUp(s, NOW, TZ).head!.node.id, 'R', 'pick up the thread first');
  assert.equal(nextUp(s, NOW, TZ).head!.words, 'you were about to: the paragraph about ferries',
    'and it says it in the words you wrote, not in the app\u2019s');

  const withDate = st(
    ev('node.created', 'W', { nodeKind: 'action', title: 'the chapter' }),
    ev('resume.card.created', 'R', { forNode: 'W', cue: 'x' }),
    ev('clock.set', 'R', { clockKind: 'review', at: NOW, source: 'test' }),
    ev('node.created', 'D', { nodeKind: 'action', title: 'appointment' }),
    ev('clock.set', 'D', { clockKind: 'due', at: NOW, source: 'test' }),
  );
  assert.equal(nextUp(withDate, NOW, TZ).head!.node.id, 'D', 'but a real date still wins');
});

test('within pressure, the most insistent leads', () => {
  const s = st(
    ...upkeep('mild', 7, 10, '2026-07-20T18:00:00.000Z'),
    ...upkeep('loud', 7, 1, '2026-07-10T18:00:00.000Z'),
  );
  const q = nextUpQueue(s, NOW, TZ);
  assert.equal(q[0]!.node.id, 'loud');
  assert.ok(q[0]!.pressure! > q[1]!.pressure!);
});

test('nothing belonging to another surface is ever offered as work', () => {
  const s = st(
    ev('capture.recorded', 'INBOX', { text: 'unrouted', source: 'quick', sourceTags: [] }),
    ev('node.created', 'W', { nodeKind: 'waiting-for', title: 'they owe me' }),
    ev('clock.set', 'W', { clockKind: 'review', at: NOW, source: 'test' }),
    ev('node.created', 'M', { nodeKind: 'action', title: 'someday thing' }),
    ev('menu.item.added', 'M', { category: 'read' }),
    ev('node.created', 'P', { nodeKind: 'pebble', title: 'a pebble' }),
    ev('node.created', 'T', { nodeKind: 'action', title: 'trashed' }),
    ev('clock.set', 'T', { clockKind: 'due', at: NOW, source: 'test' }),
    ev('node.trashed', 'T', {}),
  );
  // SPLIT IN 2.0.0, and the split is the point. This was one assertion covering
  // five unrelated exclusions, so it went green while any subset of them worked
  // and could not say which one had moved. Four of them still hold exactly as
  // they did; the fifth is the thing 2.0.0 changes on purpose.
  assert.deepEqual(nextUpQueue(s, NOW, TZ).map(i => i.node.id).filter(id => id !== 'INBOX'), [],
    'waiting-for, Menu, pebble and trashed are all still somebody else’s business');

  // AND THE INBOX IS NOT. A thing is a task the moment it exists: an unrouted
  // capture is offered as work, with a reason that states the only fact there
  // is about it. Sorting refines the offer; it has never been what creates one.
  const offered = nextUpQueue(s, NOW, TZ);
  assert.deepEqual(offered.map(i => i.node.id), ['INBOX'],
    'a captured thing nobody has sorted is offered as work');
  assert.equal(offered[0]?.reason, 'unsorted');
  assert.equal(offered[0]?.words, 'you put this down',
    'and says why, as a fact about the world rather than about the person');
});

test('an unsorted capture is offered LAST, behind everything with a real warrant', () => {
  // The restraint that makes the above safe. A dump must never outrank a date,
  // and arrival order must be the tiebreak — deterministic, no inference.
  const s = st(
    ev('capture.recorded', 'C1', { text: 'first down', source: 'quick', sourceTags: [] }),
    ev('capture.recorded', 'C2', { text: 'second down', source: 'quick', sourceTags: [] }),
    ev('node.created', 'D', { nodeKind: 'action', title: 'a real date' }),
    ev('clock.set', 'D', { clockKind: 'due', at: NOW, source: 'test' }),
  );
  assert.deepEqual(nextUpQueue(s, NOW, TZ).map(i => i.node.id), ['D', 'C1', 'C2'],
    'the dated thing leads; the captures follow in the order they arrived');
});

test('a completed one-off stops being offered; a completed upkeep comes back on its own schedule', () => {
  // The gate re-clocks done.marked to keep the node non-silent, so "has a clock
  // that has arrived" is NOT enough to stop offering it. Found by the smoke walk.
  const oneOff = st(
    ev('node.created', 'A', { nodeKind: 'action', title: 'a one-off' }),
    ev('clock.set', 'A', { clockKind: 'review', at: NOW, source: 'test' }),
    ev('done.marked', 'A', { at: NOW }),
    ev('clock.set', 'A', { clockKind: 'review', at: NOW, source: 'gate:done.marked' }),
  );
  assert.deepEqual(nextUpQueue(oneOff, NOW, TZ).map(i => i.node.id), [],
    'finished work is finished, even though the gate kept it clocked');

  // An upkeep done today is settled; the same upkeep done long ago is asking.
  const fresh = st(...upkeep('U', 7, 2, '2026-07-29T12:00:00.000Z'));
  assert.deepEqual(nextUpQueue(fresh, NOW, TZ).map(i => i.node.id), [], 'just done: quiet');
  const stale = st(...upkeep('U', 7, 2, '2026-07-01T12:00:00.000Z'));
  assert.deepEqual(nextUpQueue(stale, NOW, TZ).map(i => i.node.id), ['U'],
    'a recurring thing returns — that is what recurring means');
});

test('"not this" cycles freely and changes NO state', () => {
  const s = st(
    ...upkeep('a', 7, 1, '2026-07-10T18:00:00.000Z'),
    ...upkeep('b', 7, 2, '2026-07-12T18:00:00.000Z'),
    ...upkeep('c', 7, 3, '2026-07-14T18:00:00.000Z'),
  );
  // A deep snapshot of the whole state, so a mutation anywhere is caught — not
  // just a change in the set of node ids.
  const before = JSON.stringify(serialiseState(s));
  const countBefore = s.eventCount;
  const seen = [0, 1, 2, 3].map(c => nextUp(s, NOW, TZ, c).head!.node.id);
  assert.equal(seen[3], seen[0], 'it wraps around rather than running out');
  assert.equal(new Set(seen).size, 3, 'and cycles through every candidate');
  assert.equal(JSON.stringify(serialiseState(s)), before, 'state is byte-identical — nothing recorded');
  assert.equal(s.eventCount, countBefore, 'and no event was appended by cycling');
});

test('the list behind the head is capped at five', () => {
  const events: AppEvent[] = [];
  for (let i = 0; i < 12; i++) events.push(...upkeep(`u${i}`, 7, 1, '2026-07-10T18:00:00.000Z'));
  const up = nextUp(st(...events), NOW, TZ);
  assert.equal(up.behind.length, BEHIND_CAP, 'five behind, not twelve');
  assert.equal(up.total, 12, 'but the count tells the truth about how many are asking');
  assert.ok(!up.behind.some(i => i.node.id === up.head!.node.id), 'the head is not repeated behind itself');
});

test('an empty morning says so, rather than inventing work', () => {
  const up = nextUp(st(...upkeep('U', 7, 2, '2026-07-29T12:00:00.000Z')), NOW, TZ);
  assert.equal(up.head, null, 'nothing is asking');
  assert.equal(up.total, 0);
});

test('the queue order is total — the same state always produces the same list', () => {
  const events: AppEvent[] = [];
  for (let i = 0; i < 6; i++) events.push(...upkeep(`u${i}`, 7, 2, '2026-07-15T18:00:00.000Z'));
  const s = st(...events);
  const once = nextUpQueue(s, NOW, TZ).map(i => i.node.id);
  const twice = nextUpQueue(s, NOW, TZ).map(i => i.node.id);
  assert.deepEqual(once, twice, 'identical pressures do not reshuffle between renders');
});

test('upkeep chips surface only what has come round, most insistent first', () => {
  const s = st(
    ...upkeep('ready', 7, 2, '2026-07-20T18:00:00.000Z'),
    ...upkeep('loud', 7, 1, '2026-07-05T18:00:00.000Z'),
    ...upkeep('settled', 30, 5, '2026-07-28T18:00:00.000Z'),
  );
  const chips = upkeepChips(s, NOW, TZ);
  assert.deepEqual(chips.map(c => c.node.id), ['loud', 'ready'], 'settled stays quiet');
  assert.ok(chips.every(c => c.pressure! >= 0));
});

test('the display threshold is a presentation choice, not storage (ADR-0010)', () => {
  const s = st(...upkeep('mild', 7, 4, '2026-07-21T18:00:00.000Z'));   // pressure 0.25
  assert.equal(upkeepChips(s, NOW, TZ, 0).length, 1, 'shown at threshold 0');
  assert.equal(upkeepChips(s, NOW, TZ, 1).length, 0, 'hidden at threshold 1 — same stored data');
  const n: NodeState = s.nodes.get('mild')!;
  assert.equal(Object.hasOwn(n, 'pressure'), false, 'and pressure is nowhere on the node');
});

// --- audit fixes (Phase 3 adversarial pass) ---------------------------------

test('a malformed date cannot throw out of a projection and kill the app (audit, severe)', () => {
  // One bad `at` in the log used to throw RangeError out of the work surface —
  // which is built before capture's handlers are registered — and took the whole
  // app down with the data intact and unreachable.
  const s = st(
    ev('node.created', 'BAD', { nodeKind: 'action', title: 'corrupt' }),
    ev('clock.set', 'BAD', { clockKind: 'due', at: '2026-08-32T00:00:00.000Z', source: 'import' }),
    ev('node.created', 'OK', { nodeKind: 'action', title: 'fine' }),
    ev('clock.set', 'OK', { clockKind: 'due', at: NOW, source: 'test' }),
  );
  assert.doesNotThrow(() => nextUpQueue(s, NOW, TZ), 'the queue survives bad data');
  assert.doesNotThrow(() => upkeepChips(s, NOW, TZ), 'so do the chips');
  assert.deepEqual(nextUpQueue(s, NOW, TZ).map(i => i.node.id), ['OK'],
    'the good item is still offered; the bad one is simply not asking');
});

test('a NaN or infinite cadence yields no pressure and no words — never the loudest phrase', () => {
  for (const bad of [{ intervalDays: NaN, comfortWindowDays: 2 },
    { intervalDays: 7, comfortWindowDays: NaN },
    { intervalDays: 7, comfortWindowDays: Infinity },
    { intervalDays: Infinity, comfortWindowDays: 2 }]) {
    const s = st(
      ev('node.created', 'U', { nodeKind: 'upkeep', title: 'u' }),
      ev('upkeep.interval.set', 'U', bad),
      ev('done.marked', 'U', { at: '2026-01-01T12:00:00.000Z' }),
    );
    const p = pressureOf(s.nodes.get('U')!, NOW, atMidnight(TZ));
    assert.equal(p, null, `${JSON.stringify(bad)} has no pressure`);
    assert.equal(pressureWords(p), '', 'and says nothing, rather than "been a good while"');
  }
  assert.equal(pressureWords(NaN), '', 'a NaN never falls through to the loudest phrase');
});

test('an item cannot become un-completable and un-dismissable (audit, severe)', () => {
  // intervalDays 0 counted as "recurring" for the finished-check but produced
  // null pressure, so the item rode a stale cure clock for ever and Done did
  // nothing. The two guards now ask the same question.
  const s = st(
    ev('node.created', 'Z', { nodeKind: 'upkeep', title: 'zombie' }),
    ev('upkeep.interval.set', 'Z', { intervalDays: 0, comfortWindowDays: 0 }),
    ev('clock.set', 'Z', { clockKind: 'review', at: '2026-06-01T12:00:00.000Z', source: 'gate' }),
    ev('done.marked', 'Z', { at: NOW }),
  );
  assert.deepEqual(nextUpQueue(s, NOW, TZ).map(i => i.node.id), [],
    'marking it done actually finishes it');
});

test('work never vanishes because one clock kind hid another (audit, severe)', () => {
  // review today + due next month: the kind-precedence lookup showed only `due`,
  // read it as "not arrived", and dropped the item off the surface entirely.
  const s = st(
    ev('node.created', 'A', { nodeKind: 'action', title: 'gate-clocked today' }),
    ev('clock.set', 'A', { clockKind: 'review', at: NOW, source: 'gate:capture' }),
    ev('clock.set', 'A', { clockKind: 'due', at: '2026-08-30T00:00:00.000Z', source: 'detail' }),
    ev('node.created', 'B', { nodeKind: 'action', title: 'start passed, due later' }),
    ev('clock.set', 'B', { clockKind: 'start', at: '2026-07-01T12:00:00.000Z', source: 'test' }),
    ev('clock.set', 'B', { clockKind: 'due', at: '2026-09-30T00:00:00.000Z', source: 'test' }),
  );
  assert.deepEqual(nextUpQueue(s, NOW, TZ).map(i => i.node.id).sort(), ['A', 'B'],
    'both are asking, and neither disappeared');
});

test('altitude nodes are never offered as the next thing to do (law 4)', () => {
  const s = st(
    ...['goal', 'area', 'outcome', 'project'].flatMap((kind, i) => [
      ev('node.created', `N${i}`, { nodeKind: kind, title: kind }),
      ev('clock.set', `N${i}`, { clockKind: 'review', at: NOW, source: 'test' }),
    ]),
  );
  assert.deepEqual(nextUpQueue(s, NOW, TZ).map(i => i.node.id), [],
    'the runway is the only workspace — an area is not a thing you "do"');
});

test('a resume card must be due, and retires when spent or expired', () => {
  const parked = st(
    ev('resume.card.created', 'R', { forNode: 'X', cue: 'ferries' }),
    ev('clock.set', 'R', { clockKind: 'park', at: '2026-12-25T00:00:00.000Z', source: 'test' }),
  );
  assert.deepEqual(nextUpQueue(parked, NOW, TZ).map(i => i.node.id), [],
    'a card parked until Christmas does not lead the list in July');

  const noClock = st(ev('resume.card.created', 'R', { forNode: 'X', cue: null }));
  assert.deepEqual(nextUpQueue(noClock, NOW, TZ).map(i => i.node.id), [],
    'and one with no clock is not offered for ever');

  const spent = st(
    ev('resume.card.created', 'R', { forNode: 'X', cue: 'c' }),
    ev('clock.set', 'R', { clockKind: 'review', at: NOW, source: 'test' }),
    ev('resume.card.spent', 'R', {}),
  );
  assert.deepEqual(nextUpQueue(spent, NOW, TZ).map(i => i.node.id), [],
    'a thread already picked up is not still waiting');
});

test('a hard date outranks a resume card, whatever order the branches run in', () => {
  const s = st(
    ev('resume.card.created', 'AAA', { forNode: 'X', cue: 'c' }),
    ev('clock.set', 'AAA', { clockKind: 'due', at: NOW, source: 'test' }),
    ev('node.created', 'ZZZ', { nodeKind: 'action', title: 'appointment' }),
    ev('clock.set', 'ZZZ', { clockKind: 'due', at: NOW, source: 'test' }),
  );
  assert.deepEqual(nextUpQueue(s, NOW, TZ).map(i => i.reason), ['hard-date', 'hard-date'],
    'a resume card carrying a real date is tier 1, not tier 2');
});

test('the chips obey the same exclusions as Next-up (law 1 clause c)', () => {
  const onMenu = st(
    ev('node.created', 'M', { nodeKind: 'upkeep', title: 'menu upkeep' }),
    ev('upkeep.interval.set', 'M', { intervalDays: 1, comfortWindowDays: 1 }),
    ev('menu.item.added', 'M', { category: 'try' }),
  );
  assert.deepEqual(upkeepChips(onMenu, NOW, TZ).map(c => c.node.id), [],
    'the Menu is a surface, not a demand — chips may not volunteer it either');

  const inbox = st(
    ev('capture.recorded', 'C', { text: 'unrouted', source: 'quick', sourceTags: [] }),
    ev('node.kind.changed', 'C', { from: 'action', to: 'upkeep' }),
    ev('upkeep.interval.set', 'C', { intervalDays: 1, comfortWindowDays: 1 }),
  );
  // CHANGED IN 2.0.0, consistently with Next-up rather than as an exception.
  // Chips share `isCandidate`, so "a thing is a task the moment it exists"
  // reaches here too — and it should: this node is a recurring thing whose time
  // has come, and not having been routed says nothing about whether it is due.
  //
  // The set stays small by construction. A chip requires an upkeep interval,
  // which nothing sets by accident, so an ordinary capture is not a chip — only
  // one somebody deliberately made recurring.
  assert.deepEqual(upkeepChips(inbox, NOW, TZ).map(c => c.node.id), ['C'],
    'a recurring thing is due whether or not anybody has sorted it');

  // The Menu exclusion above is untouched, and that separation is the point:
  // law 1 clause c is about a SURFACE that is not a demand, which is a different
  // claim from "it has not been sorted yet".
  const plain = st(
    ev('capture.recorded', 'P', { text: 'just a thought', source: 'quick', sourceTags: [] }),
  );
  assert.deepEqual(upkeepChips(plain, NOW, TZ).map(c => c.node.id), [],
    'an ordinary capture is not a chip — a chip is for something recurring');
});

test('the work surface never shows the same thing twice', () => {
  const s = st(...upkeep('bins', 7, 1, '2026-07-01T12:00:00.000Z'));
  const { up, chips } = workSurface(s, NOW, TZ);
  const chipIds = new Set(chips.map(c => c.node.id));
  assert.deepEqual(chips.map(c => c.node.id), ['bins'], 'it is a ready upkeep, so it is a chip');
  assert.equal(up.head, null, 'and therefore NOT also the Next-up head');
  for (const i of [up.head, ...up.behind].filter(Boolean)) {
    assert.equal(chipIds.has((i as { node: { id: string } }).node.id), false, 'no overlap anywhere');
  }
});

test('the gauge counts exactly what the coverage list itemises (audit)', () => {
  const s = st(
    ev('node.created', 'A', { nodeKind: 'action', title: 'a' }),
    ev('clock.set', 'A', { clockKind: 'review', at: NOW, source: 't' }),
    ev('node.created', 'B', { nodeKind: 'action', title: 'b' }),
    ev('clock.set', 'B', { clockKind: 'review', at: NOW, source: 't' }),
    ev('node.created', 'T', { nodeKind: 'action', title: 'trashed' }),
    ev('node.trashed', 'T', {}),
  );
  assert.equal(coverageGauge(s).total, heldNodes(s).length,
    'the number and the list are one definition — a claim you open must check out');
  assert.equal(coverageGauge(s).total, 2, 'and a trashed node is not "held"');
});

// --- WHERE it sits (V2 stage 1, "It says where") -----------------------------
//
// Reported: a thing would leave the surface with no way to tell where or
// whether it went, and no feeling of being shown the right things. The offer
// answered *why now*
// from its first release and never once *where from*. `lineageOf` is that
// answer, and `place` rides on every NextUpItem.

test('an offered item says where it sits — parent, then the first container above', () => {
  const s = st(
    ev('node.created', 'HOME', { nodeKind: 'area', title: 'Home' }),
    ev('node.created', 'ERR', { nodeKind: 'project', title: 'Errands', parent: 'HOME' }),
    ev('node.created', 'A', { nodeKind: 'action', title: 'buy stamps', parent: 'ERR' }),
    ev('clock.set', 'A', { clockKind: 'due', at: NOW, source: 'test' }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A');
  assert.ok(item, 'the item is offered');
  assert.equal(item!.place, 'in Errands · under Home');
});

test('a loose item stays SILENT about place — bareness is not announced', () => {
  const s = st(
    ev('node.created', 'A', { nodeKind: 'action', title: 'loose' }),
    ev('clock.set', 'A', { clockKind: 'due', at: NOW, source: 'test' }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A');
  assert.equal(item!.place, null, 'no parent, no place line — never "in nothing"');
});

test('a place that was let go is not a location — lineage stops honestly', () => {
  const s = st(
    ev('node.created', 'P', { nodeKind: 'project', title: 'Old' }),
    ev('node.created', 'A', { nodeKind: 'action', title: 'x', parent: 'P' }),
    ev('clock.set', 'A', { clockKind: 'due', at: NOW, source: 'test' }),
    ev('node.trashed', 'P', { reason: 'test' }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A');
  assert.equal(item!.place, null, 'a trashed parent confers no location');
});

test('upkeep chips carry place too — the sink says it belongs to Home', () => {
  const s = st(
    ev('node.created', 'HOME', { nodeKind: 'area', title: 'Home' }),
    ...upkeep('U', 7, 2, '2026-07-01T18:00:00.000Z'),
    ev('node.parented', 'U', { parent: 'HOME' }),
  );
  const chip = upkeepChips(s, NOW, TZ).find(c => c.node.id === 'U');
  assert.ok(chip, 'the upkeep is a chip');
  assert.equal(chip!.place, 'in Home');
});

// --- what it holds up (1.23.0) ------------------------------------------------
//
// The offer answers why now and where from. This is the third question, and the
// one nobody can work out on demand: what breaks downstream if this does not get
// done, and when it therefore has to start.
//
// The words themselves belong to `dependencyWords` and are tested in
// test/dependencies.test.ts. What is asserted here is the WIRING and the
// SILENCE — that the sentence reaches every projection that builds an item, and
// that a missing term produces nothing rather than a number.

test('the approach line reaches the offer when both terms are declared', () => {
  const s = st(
    ev('node.created', 'ROSTER', { nodeKind: 'action', title: 'Roster' }),
    // Ten days out, so the arithmetic has room to be visibly wrong if it breaks.
    ev('clock.set', 'ROSTER', { clockKind: 'suspense', at: '2026-08-08T18:00:00.000Z', source: 'test' }),
    ev('node.created', 'A', { nodeKind: 'action', title: 'draft it' }),
    ev('clock.set', 'A', { clockKind: 'due', at: NOW, source: 'test' }),
    ev('dependency.declared', 'A', { feeds: 'ROSTER', leadEstimateDays: 3 }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A');
  assert.ok(item, 'the item is offered');
  // THE RULE, NOT THE SENTENCE (hub LESSONS 59): it names what is fed and gives
  // a start window in days. Pinning the exact phrasing would go red on a reword
  // that was never wrong, and stay green on a number computed from nothing.
  assert.ok(item!.approach, 'it says what it holds up');
  assert.match(item!.approach!, /Roster/, 'it names the thing downstream');
  assert.match(item!.approach!, /\b7\b/, '10 days out less a 3-day lead is a 7-day window');
});

test('a missing term is SILENCE, never a number derived from a guess', () => {
  // No lead estimate. The commitment is real and the app still does not know how
  // long the work takes — inventing that is the one thing ADR-0010 refuses, and
  // saying nothing about timing is the honest answer.
  const noLead = st(
    ev('node.created', 'ROSTER', { nodeKind: 'action', title: 'Roster' }),
    ev('clock.set', 'ROSTER', { clockKind: 'suspense', at: '2026-08-08T18:00:00.000Z', source: 'test' }),
    ev('node.created', 'A', { nodeKind: 'action', title: 'draft it' }),
    ev('clock.set', 'A', { clockKind: 'due', at: NOW, source: 'test' }),
    ev('dependency.declared', 'A', { feeds: 'ROSTER', leadEstimateDays: 0 }),
  );
  const a = nextUpQueue(noLead, NOW, TZ).find(i => i.node.id === 'A')!;
  assert.doesNotMatch(a.approach ?? '', /start it within/, 'no lead, no start window');

  // No downstream at all — the ordinary case for almost everything in a store.
  const bare = st(
    ev('node.created', 'B', { nodeKind: 'action', title: 'just a thing' }),
    ev('clock.set', 'B', { clockKind: 'due', at: NOW, source: 'test' }),
  );
  const b = nextUpQueue(bare, NOW, TZ).find(i => i.node.id === 'B')!;
  assert.equal(b.approach, null, 'nothing declared, nothing said');
});

test('a commitment already met stops constraining — the line goes quiet', () => {
  // The downstream thing is done. A commitment you are no longer under cannot
  // set a start date, and leaving it in would manufacture urgency out of
  // finished work.
  const s = st(
    ev('node.created', 'ROSTER', { nodeKind: 'action', title: 'Roster' }),
    ev('clock.set', 'ROSTER', { clockKind: 'suspense', at: '2026-08-08T18:00:00.000Z', source: 'test' }),
    ev('node.created', 'A', { nodeKind: 'action', title: 'draft it' }),
    ev('clock.set', 'A', { clockKind: 'due', at: NOW, source: 'test' }),
    ev('dependency.declared', 'A', { feeds: 'ROSTER', leadEstimateDays: 3 }),
    ev('done.marked', 'ROSTER', { at: NOW }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A')!;
  assert.equal(item.approach, null);
});

test('upkeep chips carry the approach too — one writer, every projection', () => {
  // The defect this guards: five push sites, and one of them quietly not asking.
  const s = st(
    ev('node.created', 'ROSTER', { nodeKind: 'action', title: 'Roster' }),
    ev('clock.set', 'ROSTER', { clockKind: 'suspense', at: '2026-08-08T18:00:00.000Z', source: 'test' }),
    ...upkeep('U', 7, 2, '2026-07-01T18:00:00.000Z'),
    ev('dependency.declared', 'U', { feeds: 'ROSTER', leadEstimateDays: 3 }),
  );
  const chip = upkeepChips(s, NOW, TZ).find(c => c.node.id === 'U');
  assert.ok(chip, 'the upkeep is a chip');
  assert.match(chip!.approach ?? '', /Roster/);
});

test('the approach never reaches for the vocabulary this app refuses', () => {
  // A date that does not fit is the case most likely to grow a scolding word.
  const s = st(
    ev('node.created', 'ROSTER', { nodeKind: 'action', title: 'Roster' }),
    ev('clock.set', 'ROSTER', { clockKind: 'suspense', at: '2026-07-30T18:00:00.000Z', source: 'test' }),
    ev('node.created', 'A', { nodeKind: 'action', title: 'draft it' }),
    ev('clock.set', 'A', { clockKind: 'due', at: NOW, source: 'test' }),
    ev('dependency.declared', 'A', { feeds: 'ROSTER', leadEstimateDays: 10 }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A')!;
  assert.ok(item.approach, 'the dates do not fit, and that is information');
  for (const bad of ['overdue', 'late', 'behind', 'failed', 'should have', 'urgent', 'must']) {
    assert.doesNotMatch(item.approach!, new RegExp(`\\b${bad}\\b`, 'i'), `it says "${bad}"`);
  }
});

// ——— A DAY'S OWN CAPTURES COME BEFORE A FILE'S (2.26.0, entry 23) ———
//
// The routing proposal: extend the taskpaper precedent from clocks to ranking,
// so an import's sheer size does not out-rank an ordinary day's captures for no
// better reason than volume. The tier already sorts last and the queue caps at
// five; neither touches the order INSIDE the tier, which was node id — minted
// in arrival order, hundreds at a time by an import.

test('a thing written today is offered before a file full of imported ones', () => {
  const evs: AppEvent[] = [];
  // An import mints its ids first, exactly as a real one does.
  for (let i = 0; i < 12; i++) {
    evs.push(ev('node.created', `i${i}`, { nodeKind: 'action', title: `imported ${i}`, arrived: true }));
  }
  evs.push(ev('capture.recorded', 'mine', { text: 'the thing I wrote this morning' }));
  const q = nextUpQueue(fold(evs), NOW, TZ).filter(i => i.reason === 'unsorted');
  assert.ok(q.length > 0, 'the tier is populated, or this test is about nothing');
  assert.equal(q[0]!.node.id, 'mine',
    'the day’s own capture leads; before this it sat behind all twelve, permanently');
});

test('among imported things, and among the day’s own, arrival order still holds', () => {
  // The change is a single two-state tie-break, not a re-ranking. Everything
  // else about the order is untouched, and this is the half most likely to be
  // broken by extending it later.
  const evs: AppEvent[] = [
    ev('node.created', 'i1', { nodeKind: 'action', title: 'imported one', arrived: true }),
    ev('node.created', 'i2', { nodeKind: 'action', title: 'imported two', arrived: true }),
    ev('capture.recorded', 'm1', { text: 'mine one' }),
    ev('capture.recorded', 'm2', { text: 'mine two' }),
  ];
  const ids = nextUpQueue(fold(evs), NOW, TZ).filter(i => i.reason === 'unsorted').map(i => i.node.id);
  assert.deepEqual(ids, ['m1', 'm2', 'i1', 'i2'],
    'own captures in arrival order, then imported ones in arrival order');
});

test('an imported thing is still offered — this demotes, it never excludes', () => {
  // Entry 3 is the thesis and it binds here: a thing that leaves the visual
  // field leaves existence. Sorting imported items behind is legitimate;
  // dropping them out of the queue would be an archive with a friendlier name.
  const evs = [ev('node.created', 'only', { nodeKind: 'action', title: 'imported and alone', arrived: true })];
  const q = nextUpQueue(fold(evs), NOW, TZ).filter(i => i.reason === 'unsorted');
  assert.equal(q.length, 1, 'with nothing else to sort behind, it is still offered');
  assert.match(q[0]!.words, /came in with your import/, 'and the card says what it is');
});

// --- "you said today" (3.9.1) ----------------------------------------------
//
// Found by walking the app as a reader. `Do now` writes a review clock for the
// end of today, which lands the item in the `ready` tier — whose words are
// "this one is waiting". So the screen answered somebody who had just said
// TODAY with WAITING, on the very next thing they looked at.

test('a thing you sent to Do now says you said today, not that it is waiting', () => {
  const s = st(
    ev('node.created', 'A', { nodeKind: 'action', title: 'renew the truck registration' }),
    ev('clarify.routed', 'A', { route: 'do-now' }),
    ev('clock.set', 'A', { clockKind: 'review', at: NOW, source: 'clarify:do-now' }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A');
  assert.equal(item?.reason, 'ready', 'it is still the ready tier — only the words changed');
  assert.match(item!.words, /you said this one was for today/);
  assert.doesNotMatch(item!.words, /waiting/, 'and it does not also call it waiting');
});

test('and it stops saying today once the day has gone', () => {
  // The clock does not move. Without the day check the card would go on
  // claiming a day that passed a week ago, which is the class of falsehood
  // "back with you today" was removed for.
  const old = new Date(Date.parse(NOW) - 6 * 86400000).toISOString();
  const s = st(
    ev('node.created', 'A', { nodeKind: 'action', title: 'renew the truck registration' }),
    ev('clarify.routed', 'A', { route: 'do-now' }),
    ev('clock.set', 'A', { clockKind: 'review', at: old, source: 'clarify:do-now' }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A');
  assert.match(item!.words, /waiting/, 'a week later it is genuinely waiting, and says so');
  assert.doesNotMatch(item!.words, /today/);
});

test('an ordinary ready item is untouched by any of it', () => {
  const s = st(
    ev('node.created', 'B', { nodeKind: 'action', title: 'book the dentist' }),
    ev('clock.set', 'B', { clockKind: 'review', at: NOW, source: 'clarify:next-action' }),
  );
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'B');
  assert.equal(item?.words, 'this one is waiting');
});
