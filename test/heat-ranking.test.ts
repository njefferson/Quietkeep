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
