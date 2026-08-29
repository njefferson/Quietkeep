// The offer reads the interest you already gave it (2.7.0, ADR-0097).
//
// `docs/nd-collisions.md` entry 5 routed this and it is the assertion set the
// entry's own binding demands: heat as VOCABULARY, never as a rank. So what is
// pinned here is as much what it must NOT do as what it does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/fold.ts';
import { nextUpQueue } from '../src/nextup.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/New_York';
const NOW = '2026-08-17T15:00:00.000Z';
let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown, at = NOW): AppEvent => ({
  id: `e${seq}`, vault: 'personal', at, device: 'test', seq: seq++, kind, node, payload,
} as AppEvent);

/** A cured, dateless item — the `ready` tier, which is the one with no rhythm
 *  and therefore the one whose tie-break was creation order for ever. */
const ready = (id: string, title: string, heat?: 'hot' | 'cold'): AppEvent[] => {
  const out = [
    ev('node.created', id, { nodeKind: 'action', title }),
    ev('clock.set', id, { clockKind: 'review', at: '2026-08-10T12:00:00.000Z', source: 'gate' }),
  ];
  if (heat) out.push(ev('heat.set', id, { heat }));
  return out;
};

const order = (...events: AppEvent[]): string[] =>
  nextUpQueue(fold(events), NOW, TZ).filter(i => i.reason === 'ready').map(i => i.node.id);

test('within `ready`, what you called hot comes first', () => {
  // Ids are ascending, so creation order alone would give A, B, C. The whole
  // defect is that it always did, for ever.
  const ids = order(...ready('A', 'first'), ...ready('B', 'second', 'hot'), ...ready('C', 'third'));
  assert.equal(ids[0], 'B', 'the one the reader said was hot is offered first');
});

test('cold sorts last and is NEVER excluded — it still comes back', () => {
  const ids = order(...ready('A', 'first', 'cold'), ...ready('B', 'second'));
  assert.deepEqual(ids, ['B', 'A']);
  assert.ok(ids.includes('A'), 'hiding it would be an archive with a friendlier name (law 3)');
});

test('a cold thing is still offered when it is all there is', () => {
  const ids = order(...ready('A', 'only thing', 'cold'));
  assert.deepEqual(ids, ['A']);
});

test('not answering the heat pass is not a penalty, and neither is saying cold', () => {
  // ADR-0029 made the pass optional-first. Unsaid sits BETWEEN hot and cold, so
  // answering can only move a thing in the direction the answer points — it can
  // never punish somebody for skipping the question or for being honest.
  const ids = order(
    ...ready('A', 'unsaid'), ...ready('B', 'hot one', 'hot'), ...ready('C', 'cold one', 'cold'));
  assert.deepEqual(ids, ['B', 'A', 'C']);
});

test('ties inside one heat still fall to creation order — nothing is randomised', () => {
  // Entry 12 refuses manufactured novelty: variety for its own sake rents
  // engagement from the mechanism that ends it. Determinism is also what makes
  // an offer refusable on grounds (V2 stage 7).
  const first = order(...ready('A', 'a', 'hot'), ...ready('B', 'b', 'hot'));
  const again = order(...ready('A', 'a', 'hot'), ...ready('B', 'b', 'hot'));
  assert.deepEqual(first, ['A', 'B']);
  assert.deepEqual(again, first, 'the same store gives the same answer, every time');
});

test('IT DOES NOT CROSS TIERS — a real date still outranks anything hot', () => {
  // Entry 13: the true urgency signal must stay legible, and nothing may
  // fabricate or reorder it. A cold thing with a date here beats a hot thing
  // that is merely waiting.
  const s = fold([
    ...ready('HOT', 'a hot one', 'hot'),
    ev('node.created', 'DATED', { nodeKind: 'action', title: 'a dated one' }),
    ev('heat.set', 'DATED', { heat: 'cold' }),
    ev('clock.set', 'DATED', { clockKind: 'due', at: '2026-08-17T09:00:00.000Z', source: 'user' }),
  ]);
  const q = nextUpQueue(s, NOW, TZ);
  assert.equal(q[0]?.node.id, 'DATED', 'a promise with a date here is still first');
  assert.equal(q[0]?.reason, 'hard-date');
});

test('the card SAYS the warrant it was chosen on', () => {
  // Entry 5's binding: treat INCUP as vocabulary, never as a rank. An interest
  // read that silently reorders the offer without saying so IS a hidden rank.
  const s = fold(ready('A', 'a hot one', 'hot'));
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A');
  assert.match(item!.words, /you said it was hot/);
  // And it claims nothing about importance — it reports what the reader said.
  assert.doesNotMatch(item!.words, /important|priority|matters/i);
});

test('an ordinary ready item says what it always said', () => {
  const s = fold(ready('A', 'a plain one'));
  const item = nextUpQueue(s, NOW, TZ).find(i => i.node.id === 'A');
  assert.equal(item!.words, 'this one is waiting');
});

// --- WIDENED TO EVERY TIER (3.8.1) -----------------------------------------
//
// The defect: heat was consulted inside `ready` only. A capture that had been
// heated but not yet sorted sits in `unsorted`, where nothing read it — so on a
// store of 33 captures with 33 heat answers and 10 of them routed, twenty-three
// of those answers moved nothing. Asking a question, recording the answer and
// then not using it is worse than not asking.

/** An unrouted capture — the `unsorted` tier, which is where an answer given
 *  during the heat pass actually lands before anybody sorts anything. */
const capture = (id: string, text: string, heat?: 'hot' | 'cold'): AppEvent[] => {
  const out = [ev('capture.recorded', id, { text, source: 'quick', sourceTags: [] })];
  if (heat) out.push(ev('heat.set', id, { heat }));
  return out;
};

const unsortedOrder = (...events: AppEvent[]): string[] =>
  nextUpQueue(fold(events), NOW, TZ).filter(i => i.reason === 'unsorted').map(i => i.node.id);

test('within `unsorted`, what you called hot comes first', () => {
  // Ids ascend, so arrival order alone would give A, B, C — which is exactly
  // what it did give, for every capture anybody heated before sorting it.
  const ids = unsortedOrder(
    ...capture('A', 'first'), ...capture('B', 'second', 'hot'), ...capture('C', 'third'));
  assert.equal(ids[0], 'B', 'the answer given at the heat pass is read where it was given');
});

test('and unsaid still sits between hot and cold there, exactly as in `ready`', () => {
  const ids = unsortedOrder(
    ...capture('A', 'unsaid'), ...capture('B', 'hot one', 'hot'), ...capture('C', 'cold one', 'cold'));
  assert.deepEqual(ids, ['B', 'A', 'C']);
});

test('a cold capture is still offered, and still comes back', () => {
  const ids = unsortedOrder(...capture('A', 'the only thing', 'cold'));
  assert.deepEqual(ids, ['A'], 'hiding it would be an archive with a friendlier name (law 3)');
});

test('STILL DOES NOT CROSS TIERS — a routed, ready item outranks a hot capture', () => {
  // The widening breaks a tie INSIDE each tier and moves no tier. `unsorted`
  // sits behind every real warrant, and a hot answer does not buy a way past
  // that — which is the same restraint the hard-date assertion above pins.
  const q = nextUpQueue(fold([...ready('R', 'routed and waiting'), ...capture('H', 'hot capture', 'hot')]), NOW, TZ);
  assert.equal(q[0]?.node.id, 'R');
  assert.equal(q[0]?.reason, 'ready');
});

test('inside `pressure`, pressure still sorts first and heat only breaks an exact tie', () => {
  // The tier is named for the thing it sorts by. Heat outranking pressure there
  // would make the tier stop meaning what it says, so it runs underneath.
  const upkeep = (id: string, lastDone: string, heat?: 'hot' | 'cold'): AppEvent[] => {
    const out = [
      ev('node.created', id, { nodeKind: 'upkeep', title: id }),
      ev('upkeep.interval.set', id, { intervalDays: 7, comfortWindowDays: 2 }),
      ev('done.marked', id, { at: lastDone }),
    ];
    if (heat) out.push(ev('heat.set', id, { heat }));
    return out;
  };
  // A is further past its window than B, and B is the one called hot.
  const q = nextUpQueue(fold([
    ...upkeep('A', '2026-07-01T12:00:00.000Z'),
    ...upkeep('B', '2026-08-01T12:00:00.000Z', 'hot'),
  ]), NOW, TZ).filter(i => i.reason === 'pressure');
  assert.deepEqual(q.map(i => i.node.id), ['A', 'B'],
    'the more insistent one is still first — heat did not jump it');
  // And with the pressure equal, heat is what separates them. No `if` around
  // either of these: an assertion inside a guard that does not hold asserts
  // nothing, and the first draft of this test had exactly that — two guards
  // over an empty queue, both green, measuring nothing.
  const tied = nextUpQueue(fold([
    ...upkeep('A', '2026-07-01T12:00:00.000Z'),
    ...upkeep('B', '2026-07-01T12:00:00.000Z', 'hot'),
  ]), NOW, TZ).filter(i => i.reason === 'pressure');
  assert.deepEqual(tied.map(i => i.node.id), ['B', 'A'],
    'equal pressure, and the answer you gave breaks the tie');
});
