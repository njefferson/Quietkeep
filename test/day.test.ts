// The day the person is actually in — V2 stage 5, the boundary.
//
// Every clock in this app ends the day at 23:59:59, so at 00:30 it has already
// rolled over: work nobody has stopped doing becomes a pile of dates that have
// gone by, and the header clock's remainder jumps from "0h 12m left" to "23h 59m
// left" — the reverse of the fact it exists to convey. Delayed circadian phase
// being the norm in this population means midnight is not a neutral default; it
// is somebody else's default, imposed.
//
// The guarantee these assert is the one that makes the change safe to make at
// all: **an unset boundary reads as midnight, so nothing moves for anybody who
// has not asked.**

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, emptyState, type State } from '../src/fold.ts';
import { admit, gateOptionsFor } from '../src/gate.ts';
import { serialiseState, deserialiseState } from '../src/snapshot.ts';
import {
  boundaryOf, boundaryWords, isBoundaryHour, MIDNIGHT, LATEST_BOUNDARY_HOUR,
} from '../src/day.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';
const AT = '2026-08-08T15:00:00.000Z';

let seq = 21000;
const ev = (kind: string, node: string | null, payload: unknown, at = AT): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const write = (prior: State, offered: AppEvent[]): State =>
  fold(admit(offered, prior, gateOptionsFor(TZ)), prior);

const setHour = (s: State, hour: number, at = AT): State =>
  write(s, [ev('day.boundary.set', null, { hour }, at)]);

test('nobody has said, so it is midnight — and midnight is what every clock already did', () => {
  // The whole safety of this change. A person who never opens the control gets
  // the exact behaviour they had before it existed, so shipping it cannot move
  // a single answer for them.
  const s = emptyState();
  assert.equal(s.dayBoundaryHour, null);
  assert.equal(boundaryOf(s), MIDNIGHT);
  assert.equal(MIDNIGHT, 0);
});

test('an hour outside the range is REFUSED, never clamped into it', () => {
  // The timer-length precedent. Clamping 14 to 11 would have the app invent a
  // boundary and then run every "today" in the product off it — a number nobody
  // chose, driving the most load-bearing arithmetic here.
  for (const bad of [-1, 12, 23, 24, 2.5, NaN, Infinity]) {
    const s = setHour(emptyState(), bad as number);
    assert.equal(s.dayBoundaryHour, null, `${bad} must not become a boundary`);
    assert.equal(boundaryOf(s), MIDNIGHT, `${bad} falls back to midnight, not to itself`);
  }
});

test('every hour that can honestly be called "still last night" is accepted', () => {
  for (let h = 0; h <= LATEST_BOUNDARY_HOUR; h++) {
    assert.equal(isBoundaryHour(h), true, `${h} is a plausible boundary`);
    assert.equal(boundaryOf(setHour(emptyState(), h)), h);
  }
  assert.equal(isBoundaryHour(LATEST_BOUNDARY_HOUR + 1), false,
    'a bound has to fall somewhere, and noon is not a day boundary');
});

test('it folds last-writer-wins, so two devices converge on the later word', () => {
  let s = setHour(emptyState(), 3, '2026-08-08T10:00:00.000Z');
  assert.equal(boundaryOf(s), 3);
  // An EARLIER event arriving later must not win — a shard delivering old
  // history cannot move somebody's day back.
  s = write(s, [ev('day.boundary.set', null, { hour: 1 }, '2026-08-08T09:00:00.000Z')]);
  assert.equal(boundaryOf(s), 3, 'the older statement loses, whatever order it folded in');
  s = setHour(s, 4, '2026-08-08T11:00:00.000Z');
  assert.equal(boundaryOf(s), 4, 'and the newer one wins');
});

test('it survives a snapshot round trip — the typechecker found this, not review', () => {
  // `snapshot.ts` rebuilds State field by field, so a new field that is not
  // carried is silently dropped on restore. That is a law 9 violation ("data is
  // never lost to updates") in the plainest form: the person sets their day
  // boundary, the app snapshots, and their day quietly goes back to midnight.
  const s = setHour(emptyState(), 3);
  const back = deserialiseState(JSON.parse(JSON.stringify(serialiseState(s))));
  assert.equal(boundaryOf(back), 3, 'the boundary is still theirs after a round trip');
});

test('a snapshot written before this existed restores to midnight, which is the day it was written under', () => {
  const raw = JSON.parse(JSON.stringify(serialiseState(emptyState()))) as Record<string, unknown>;
  delete raw['dayBoundaryHour'];
  delete raw['dayBoundaryStamp'];
  const back = deserialiseState(raw);
  assert.equal(back.dayBoundaryHour, null);
  assert.equal(boundaryOf(back), MIDNIGHT,
    'restoring an old snapshot cannot move somebody to a day boundary they never set');
});

test('it survives a reload — a preference you must restate is not a preference', () => {
  const s = setHour(emptyState(), 2);
  assert.equal(boundaryOf(fold([], s)), 2);
});

test('what it says is about the DAY, never about the person', () => {
  // No "you stay up late", no "your day is long", nothing about them at all. It
  // states where the edge is and stops. The same voice rule that made the
  // minimum state "just one thing" rather than "fog mode".
  const words = [boundaryWords(MIDNIGHT), boundaryWords(3), boundaryWords(11)];
  for (const w of words) {
    assert.doesNotMatch(w, /you (stay|are|tend|usually|often)|night owl|late|sleep|bed|tired|should/i,
      `"${w}" must not describe the reader or tell them anything about themselves`);
  }
  assert.match(boundaryWords(MIDNIGHT), /midnight/i,
    'midnight gets the word, not "0" — the number is the implementation and the word is the fact');
  assert.match(boundaryWords(3), /3am/);
});

test('nothing observes it — there is no function here that reads a log and proposes an hour', () => {
  // The rule that governs weight and capacity governs this. Detecting somebody's
  // day boundary from when they last wrote something is forming an opinion about
  // them from their logs, and the app has no instrument that could.
  //
  // Asserted structurally: the module's whole surface is a constant, two
  // predicates, a reader and a sentence. Anything that INFERRED an hour would
  // have to take a State and return a number that is not what was stored, and
  // `boundaryOf` is the only State-taking export there is.
  const s = emptyState();
  const busy = write(write(s, [ev('capture.recorded', 'A', { text: 'a thing' })]),
    [ev('clarify.routed', 'A', { route: 'next-action' })]);
  assert.equal(boundaryOf(busy), MIDNIGHT,
    'a log full of late-night activity proposes nothing and changes nothing');
});
