// A cure inherits the intent of the event it cured — and every cured kind is
// classified, or this fails.
//
// `isAppClock` shipped recognising two of the gate's twenty-eight cured kinds,
// so twenty-six cures were read as somebody asking for something. Nothing made
// that omission visible: each cure was correct in isolation, and the predicate
// looked complete because it had a careful docblock. This file is the thing
// that would have said so.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { fold, isAppClock, noIntentCures } from '../src/fold.ts';
import { admit, gateOptionsFor } from '../src/gate.ts';
import { nextUpQueue } from '../src/nextup.ts';
import type { AppEvent } from '../src/events.ts';

const NOW = '2026-08-10T18:00:00.000Z';
const LATER = '2026-08-20T18:00:00.000Z';
const TZ = 'America/Denver';

let seq = 0;
const ev = (kind: string, node: string, payload: unknown): AppEvent => ({
  id: `e${++seq}`, kind, node, payload, at: NOW, device: 'd', seq, vault: 'main',
} as unknown as AppEvent);

/** Through the REAL gate, one event at a time, exactly as a session commits. */
const through = (...events: AppEvent[]) => {
  let log: AppEvent[] = [];
  for (const e of events) log = [...log, ...admit([e], fold(log), gateOptionsFor(TZ))];
  return fold(log);
};

test('EVERY kind the gate cures is classified — a new cure cannot default to "somebody asked"', () => {
  // Read the gate's own source for the kinds it cures. Deliberately not a
  // hand-kept list: a hand-kept list is exactly what drifted, and a copy of the
  // thing under test cannot notice the thing under test changing.
  const here = dirname(fileURLToPath(import.meta.url));
  const gate = readFileSync(join(here, '..', 'src', 'gate.ts'), 'utf8');
  // The cure switch labels every kind it handles as `case '<kind>':`.
  const cured = [...gate.matchAll(/case '([a-z][a-z.]+)':/g)].map(m => `gate:${m[1]}`);
  assert.ok(cured.length >= 25, `expected the gate to cure many kinds, found ${cured.length}`);

  // Every cured kind must be a DECIDED question: either it carries no intent
  // about when (in the set), or it is a demand (deliberately out of it). What
  // must never happen again is a kind nobody looked at.
  //
  // The set may only contain kinds the gate actually cures — a stale entry is a
  // classification for an event that no longer exists, which reads as coverage
  // and is not.
  for (const source of noIntentCures) {
    assert.ok(cured.includes(source),
      `${source} is classified as no-intent but the gate no longer cures it — stale entry`);
  }

  // And the classification is a real split, not an accident in one direction.
  const demands = cured.filter(s => !noIntentCures.has(s));
  assert.ok(noIntentCures.size >= 10, `too few no-intent cures (${noIntentCures.size}) — has the set been narrowed?`);
  assert.ok(demands.length >= 10, `too few demand cures (${demands.length}) — has "any gate:" crept back?`);
});

test('the two cures whose widening broke the app before are STILL demands', () => {
  // The docblock records what "any gate:" cost: a deliberately promoted Menu
  // item vanished from Next up, and a resume card stopped being offered back
  // after an interruption. Both are cures; both are how a decision takes
  // effect. Pinned by name so the next widening cannot quietly include them.
  assert.equal(isAppClock({ kind: 'review', at: NOW, source: 'gate:menu.item.promoted' } as never), false,
    'promoting off the Menu is a decision taking effect, not housekeeping');
  assert.equal(isAppClock({ kind: 'review', at: NOW, source: 'gate:interrupt.captured' } as never), false,
    'a resume card is the thread you were pulling — it must come back');
  assert.equal(isAppClock({ kind: 'review', at: NOW, source: 'gate:clarify.routed' } as never), false,
    'you routed it; the route is when');
  assert.equal(isAppClock({ kind: 'review', at: NOW, source: 'gate:replan.resolved' } as never), false,
    'you resolved it');
});

test('a clock with no source is somebody’s — the safe default is unchanged', () => {
  assert.equal(isAppClock({ kind: 'review', at: NOW } as never), false);
  assert.equal(isAppClock({ kind: 'review', at: NOW, source: 'user' } as never), false);
  assert.equal(isAppClock(null), false);
  assert.equal(isAppClock(undefined), false);
});

test('clearing the only date does not make the app ask for it anyway', () => {
  // The defect, in the plainest form there is. Folded through the real gate:
  // the cure keeps the node from going silent (law 1), and used to be read as
  // the node asking — so a thing you had just said had no date came back
  // saying "this one is waiting".
  const s = through(
    ev('node.created', 'A', { nodeKind: 'action', title: 'a' }),
    ev('clock.set', 'A', { clockKind: 'review', at: '2026-09-01T12:00:00.000Z', source: 'user' }),
    ev('clock.cleared', 'A', { clockKind: 'review' }),
  );
  assert.equal(s.nodes.get('A')?.clocks.review?.source, 'gate:clock.cleared',
    'precondition: the standing clock really is the clear-cure, not the create-cure');
  assert.deepEqual(nextUpQueue(s, LATER, TZ).map(i => i.node.id), [],
    'it is covered, and it is not asking');
});

test('a child of something you trashed is not offered as though it asked', () => {
  const s = through(
    ev('node.created', 'P', { nodeKind: 'project', title: 'p' }),
    ev('clock.set', 'P', { clockKind: 'review', at: '2026-09-01T12:00:00.000Z', source: 'user' }),
    ev('node.created', 'K', { nodeKind: 'action', title: 'k' }),
    ev('node.parented', 'K', { parent: 'P' }),
    ev('clock.cleared', 'K', { clockKind: 'review' }),
    ev('node.trashed', 'P', {}),
  );
  assert.equal(s.nodes.get('K')?.clocks.review?.source, 'gate:node.trashed',
    'precondition: K is carrying the bystander cure');
  assert.deepEqual(nextUpQueue(s, LATER, TZ).map(i => i.node.id), [],
    'something was done to its parent; it did not ask for anything');
});

test('and the cures that ARE demands still bring their work back', () => {
  // The other direction, which is the one that broke the app last time. If this
  // goes green while the two above also go green, the split is real.
  // THE PATH MATTERS, and the first version of this test got it wrong: it
  // created a node, put it on the Menu and promoted it, which never fires the
  // promote cure at all — the node still carried its creation cure, so it was
  // never newly silent. That test would have gone green under any
  // classification of `gate:menu.item.promoted`, proving nothing.
  //
  // The real shape is an item whose ONLY coverage is the Menu (law 6: the Menu
  // is a surface, so no clock is needed). Promote it and it has neither, so the
  // gate cures it — and THAT cure is the decision taking effect.
  const s = through(
    ev('node.created', 'M', { nodeKind: 'action', title: 'promoted off the Menu' }),
    ev('menu.item.added', 'M', { category: 'read' }),
    ev('clock.cleared', 'M', { clockKind: 'review' }),
    ev('menu.item.promoted', 'M', { toKind: 'action' }),
  );
  assert.equal(s.nodes.get('M')?.clocks.review?.source, 'gate:menu.item.promoted',
    'precondition: the promote really is what cured it');
  assert.deepEqual(nextUpQueue(s, LATER, TZ).map(i => i.node.id), ['M'],
    'promoting it off the Menu is how the decision takes effect — it must be offered');
});
