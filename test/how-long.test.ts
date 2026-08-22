// How long you have (2.19.0, the plan's phase 3) — the second half of the
// situation. Place answers "what can I do here"; this answers "what can I do in
// twenty minutes".
//
// The load-bearing properties: it narrows what is SHOWN and never what is held
// (law 1); it reads the person's own estimate and never corrects it with what
// actually happened (law 7); and an unestimated thing FITS, because the app does
// not know how long it takes and cannot honestly say otherwise.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/fold.ts';
import {
  fitsWithin, howLongWords, estimateOf, HOW_LONG_CHOICES, HOW_LONG_KEY,
  getHowLong, setHowLong, timedRange,
} from '../src/duration.ts';
import type { AppEvent } from '../src/events.ts';

let seq = 0;
const AT = '2026-08-22T09:00:00.000Z';
const ev = (kind: string, node: string | null, payload: unknown): AppEvent => ({
  id: `e${seq}`, vault: 'personal', at: AT, device: 'test', seq: seq++, kind, node, payload,
} as AppEvent);

const thing = (id: string, title: string, minutes?: number): AppEvent[] => [
  ev('node.created', id, { nodeKind: 'action', title, provenance: { for: 'self' } }),
  ...(minutes === undefined ? []
    : [ev('estimate.recorded', id, { durationMinutes: minutes, basis: 'guess' })]),
];

test('the filter off means everything fits', () => {
  const s = fold([...thing('A', 'a long job', 180)]);
  assert.equal(fitsWithin(s.nodes.get('A')!, null), true);
});

test('what the person said is what it is measured against', () => {
  const s = fold([
    ...thing('S', 'a short thing', 10),
    ...thing('L', 'a long thing', 90),
  ]);
  assert.equal(fitsWithin(s.nodes.get('S')!, 30), true, 'ten fits in thirty');
  assert.equal(fitsWithin(s.nodes.get('L')!, 30), false, 'ninety does not');
  assert.equal(fitsWithin(s.nodes.get('L')!, 90), true, 'exactly the time you have still fits');
});

test('an UNESTIMATED thing fits every answer', () => {
  // The rule that keeps the feature usable. Most things are never estimated, so
  // hiding them would empty the surface and read as broken the first time
  // anybody tried it — and the app genuinely does not know how long they take.
  const s = fold([...thing('U', 'never timed')]);
  assert.equal(estimateOf(s.nodes.get('U')!), null);
  for (const m of HOW_LONG_CHOICES) {
    assert.equal(fitsWithin(s.nodes.get('U')!, m), true, `fits in ${m} minutes`);
  }
});

test('a timing NEVER overrides what the person said', () => {
  // Law 7, and this module's own rule: the estimate is never derived, never
  // corrected, never scored against what happened. Somebody who said ten
  // minutes and took forty still gets it offered when they have fifteen — the
  // range is on the card for them to weigh, and it is not the app's to weigh.
  let s = fold([...thing('T', 'optimistic', 10)]);
  s = fold([ev('do-now.timed', 'T', {
    startedAt: '2026-08-22T09:00:00.000Z', endedAt: '2026-08-22T09:40:00.000Z',
  })], s);
  const n = s.nodes.get('T')!;
  // The timing really landed — without this the rest of the test passes over a
  // node nothing happened to, which is a vacuous plant rather than a check.
  assert.deepEqual(timedRange(n), { shortest: 40, longest: 40 }, 'forty minutes is on record');
  assert.equal(estimateOf(n), 10, 'their word stands');
  assert.equal(fitsWithin(n, 15), true, 'and the filter uses their word');
});

test('the standing line states the scope and never a count of what is hidden', () => {
  // `whereWords`' rule. An aggregate about work you are deliberately not
  // looking at only ever rises, which is what took the volume count off the
  // gauge in V2 stage 1.
  const w = howLongWords(30);
  assert.match(w, /30 minutes/, 'says what the limit is');
  assert.match(w, /never put a time on/, 'and that unestimated things are still shown');
  assert.match(w, /still held and still comes back/, 'law 1, said out loud');
  assert.doesNotMatch(w, /\bhidden\b|\bleft\b|\bremaining\b/i, 'no count of what is not shown');
});

test('it is a device preference, never an event', () => {
  // How much time somebody had on a Tuesday is not a fact about their work, and
  // a stored trail of it is what law 7 keeps the app out of.
  assert.equal(HOW_LONG_KEY, 'how.long');
  setHowLong(30);
  assert.equal(getHowLong(), 30);
  setHowLong(null);
  assert.equal(getHowLong(), null, 'and it clears');
});

test('a zero or negative estimate is no estimate — it fits', () => {
  // `estimateOf` already refuses those; this pins that the filter agrees rather
  // than treating 0 as "fits in nothing" and hiding it from every answer.
  let s = fold([...thing('Z', 'zeroed', 30)]);
  s = fold([ev('estimate.recorded', 'Z', { durationMinutes: 0, basis: 'guess' })], s);
  assert.equal(estimateOf(s.nodes.get('Z')!), null);
  assert.equal(fitsWithin(s.nodes.get('Z')!, 5), true);
});
