// How long things take — V2 stage 5. The "one number that is allowed" is gone.
//
// Task durations are tau-heavy: a long right tail, most attempts near the
// bottom, a few enormous. The mean of that sits in the gap where almost nothing
// actually lands — it is the least representative value available, and it is
// the one every tool reaches for. These assert the two ends instead, and assert
// that no average, rate, ratio, trend or tally can appear anywhere near them.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, emptyState, type State } from '../src/fold.ts';
import { admit, gateOptionsFor } from '../src/gate.ts';
import { serialiseState, deserialiseState } from '../src/snapshot.ts';
import {
  estimateOf, timedRange, rangeWords, estimateWords, minutesWords,
} from '../src/duration.ts';
import * as duration from '../src/duration.ts';
import { remainderWords } from '../src/clock.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';
const AT = '2026-08-08T15:00:00.000Z';

let seq = 31000;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at: AT, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const write = (prior: State, offered: AppEvent[]): State =>
  fold(admit(offered, prior, gateOptionsFor(TZ)), prior);

/** An item with somewhere to live, so the write gate admits the events. */
function withItem(): State {
  let s = write(emptyState(), [ev('capture.recorded', 'A', { text: 'strip the old sealant' })]);
  return write(s, [ev('clarify.routed', 'A', { route: 'next-action' })]);
}

/** A timed run of `mins` minutes on node A. */
const ran = (mins: number, day = 8): AppEvent =>
  ev('do-now.timed', 'A', {
    startedAt: `2026-08-0${day}T10:00:00.000Z`,
    endedAt: new Date(Date.parse(`2026-08-0${day}T10:00:00.000Z`) + mins * 60_000).toISOString(),
  });

test('it is the TWO ENDS, and there is no average anywhere in it', () => {
  // The whole point. 5, 12 and 240 minutes have a mean of 85-and-a-bit, a
  // number that describes none of the three attempts and would be presented as
  // though it described all of them.
  let s = withItem();
  s = write(s, [ran(5), ran(12), ran(240)]);
  const r = timedRange(s.nodes.get('A')!)!;
  assert.deepEqual(r, { shortest: 5, longest: 240 });
  const words = rangeWords(r)!;
  assert.match(words, /5 minutes/);
  assert.match(words, /4h/);
  // 85 is the mean and 12 is the median. Neither may appear.
  assert.doesNotMatch(words, /85|1h 25|12 minutes/,
    'no average and no middle value — nothing between the ends is known');
  assert.doesNotMatch(words, /average|usually|typically|on average|mean/i);
});

test('and NO COUNT of attempts, because a tally is a fact about you', () => {
  let s = withItem();
  s = write(s, [ran(20), ran(25), ran(30), ran(35), ran(40)]);
  const words = rangeWords(timedRange(s.nodes.get('A')!))!;
  assert.doesNotMatch(words, /\b(5|five)\b/, 'five attempts, and the number five appears nowhere');
  assert.doesNotMatch(words, /times|attempts|tries|sessions|so far|again/i,
    'the range says everything a tally would, without saying how often you have been at it');
});

test('one timing is a range whose ends are equal, and that is the honest answer', () => {
  // No minimum sample size, deliberately: a threshold would be the app deciding
  // when your own history starts counting.
  let s = withItem();
  s = write(s, [ran(12)]);
  assert.deepEqual(timedRange(s.nodes.get('A')!), { shortest: 12, longest: 12 });
  assert.equal(rangeWords(timedRange(s.nodes.get('A')!)), 'Took 12 minutes before.');
});

test('never timed is null, and null says nothing rather than saying zero', () => {
  const s = withItem();
  assert.equal(timedRange(s.nodes.get('A')!), null);
  assert.equal(rangeWords(null), null, 'a surface with nothing to say says nothing');
});

test('the estimate is the person\'s own word, and is never scored against what happened', () => {
  let s = withItem();
  s = write(s, [ev('estimate.recorded', 'A', { durationMinutes: 20, basis: 'guess' })]);
  s = write(s, [ran(240)]);
  const n = s.nodes.get('A')!;
  assert.equal(estimateOf(n), 20);
  const said = estimateWords(n)!;
  assert.match(said, /You said about 20 minutes/);
  // The comparison is the obvious thing to build and it is an indictment
  // dressed as data. Nothing in this module produces one.
  assert.doesNotMatch(said, /but|actually|really|took|over|under|instead/i,
    'the estimate and the timings sit side by side and the app draws no line between them');
  assert.doesNotMatch(rangeWords(timedRange(n))!, /said|estimate|guess|20 minutes/,
    'and the range does not mention the guess either');
});

test('a non-positive or nonsense estimate is REFUSED, not stored', () => {
  for (const bad of [0, -30, NaN, Infinity]) {
    let s = withItem();
    s = write(s, [ev('estimate.recorded', 'A', { durationMinutes: bad, basis: 'guess' })]);
    assert.equal(estimateOf(s.nodes.get('A')!), null, `${bad} is not a duration`);
  }
});

test('a run that rounds to zero is dropped — zero is not a duration', () => {
  // A range reading "between 0 minutes and 4h" says nothing true about either
  // end, and a stray tap should not be able to create one.
  let s = withItem();
  s = write(s, [ev('do-now.timed', 'A', {
    startedAt: '2026-08-08T10:00:00.000Z', endedAt: '2026-08-08T10:00:20.000Z',
  })]);
  assert.equal(timedRange(s.nodes.get('A')!), null);
  // A BACKWARDS span writes nothing rather than a negative.
  s = write(s, [ev('do-now.timed', 'A', {
    startedAt: '2026-08-08T11:00:00.000Z', endedAt: '2026-08-08T10:00:00.000Z',
  })]);
  assert.equal(timedRange(s.nodes.get('A')!), null);

  // An UNPARSEABLE one never reaches the fold at all — the write gate refuses
  // it, which is better than the fold quietly skipping it. Asserted here rather
  // than assumed: the fold's own guard is a belt for data that arrived by some
  // other road (an imported log, a shard from another device).
  assert.throws(
    () => write(s, [ev('do-now.timed', 'A', { startedAt: 'not-a-date', endedAt: 'nor-this' })]),
    /not a real instant/,
    'the boundary refuses it before anything has to cope with it');
});

test('both survive a snapshot round trip, and an old snapshot restores to nothing known', () => {
  // The law 9 trap the typechecker caught for the day boundary, and the same
  // one applies here: `snapshot.ts` rebuilds every node field by field.
  let s = withItem();
  s = write(s, [ev('estimate.recorded', 'A', { durationMinutes: 20, basis: 'guess' })]);
  s = write(s, [ran(5), ran(240)]);
  const back = deserialiseState(JSON.parse(JSON.stringify(serialiseState(s))));
  assert.equal(estimateOf(back.nodes.get('A')!), 20);
  assert.deepEqual(timedRange(back.nodes.get('A')!), { shortest: 5, longest: 240 });

  // A snapshot written before these were folded has neither — the events were
  // in the log all along and nothing read them, so this is exactly true.
  const raw = JSON.parse(JSON.stringify(serialiseState(s))) as { nodes: Record<string, unknown>[] };
  for (const n of raw.nodes) { delete n['estimateMinutes']; delete n['timedMinutes']; }
  const old = deserialiseState(raw);
  assert.equal(estimateOf(old.nodes.get('A')!), null);
  assert.equal(timedRange(old.nodes.get('A')!), null);
});

test('the runs are COPIED, not aliased — the three-place rule, a fifth time', () => {
  let s = withItem();
  s = write(s, [ran(5)]);
  const before = [...s.nodes.get('A')!.timedMinutes];
  const later = write(s, [ran(240)]);
  assert.deepEqual(s.nodes.get('A')!.timedMinutes, before,
    'a later fold must not rewrite the earlier state in place');
  assert.equal(later.nodes.get('A')!.timedMinutes.length, 2);
});

test('the offer card states no number that moves on its own (2.12.2, ADR-0103)', () => {
  // `timeLeftWords` was "the one permitted number" and it is DELETED with the
  // line it fed. Asserted from this side rather than left to the walk: the walk
  // checks a screen, and this checks that the projection cannot come back by
  // import, because a surface can only render what a module exports.
  //
  // The fact is not gone from the app. `remainderWords` in `src/clock.ts`
  // speaks it on the opt-in header clock — the home entry 9 of
  // docs/nd-collisions.md gives it, and opt-in precisely because a running
  // remainder is a countdown.
  assert.equal(Object.hasOwn(duration, 'timeLeftWords'), false,
    'duration.ts must not export a day-remainder projection — nothing renders one');
  assert.equal(typeof remainderWords(150), 'string',
    'and the fact still has its home on the clock');
});

test('the words never round to something friendlier than the truth', () => {
  assert.equal(minutesWords(1), '1 minute');
  assert.equal(minutesWords(59), '59 minutes');
  assert.equal(minutesWords(60), '1h');
  assert.equal(minutesWords(90), '1h 30m');
  assert.equal(minutesWords(245), '4h 5m');
});
