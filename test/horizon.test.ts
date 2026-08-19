// The next fixed thing today, by name — collisions 7 and 9.
//
// Hyperfocus is the gift that eats the day: what an absorbed person can use is
// not an alarm, because the OS calendar already holds that, but a line they can
// catch peripherally naming the one thing today that is not moveable. Waiting
// mode is the other half — a 3pm appointment consumes the whole day, because the
// hours before it stop being usable time and become a countdown.
//
// Both are answered by NAMING the thing rather than counting down to it, and
// these assert the not-counting-down as hard as the naming.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, emptyState, type State } from '../src/fold.ts';
import { admit, gateOptionsFor } from '../src/gate.ts';
import { nextFixedToday, nextFixedWords } from '../src/clock.ts';
import { atMidnight, endOfLocalDay } from '../src/time.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';
const NOW = '2026-08-09T18:00:00.000Z';           // 12:00 on the 9th, local
const DAY = atMidnight(TZ);

let seq = 41000;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at: NOW, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const write = (prior: State, offered: AppEvent[]): State =>
  fold(admit(offered, prior, gateOptionsFor(TZ)), prior);

/** A routed action carrying a real due date at `at`. */
function dated(s: State, id: string, title: string, at: string): State {
  let out = write(s, [ev('capture.recorded', id, { text: title })]);
  out = write(out, [ev('clarify.routed', id, { route: 'next-action' })]);
  return write(out, [ev('clock.set', id, { clockKind: 'due', at, source: 'detail:due' })]);
}

test('it names the thing, and the name is the whole of it', () => {
  const s = dated(emptyState(), 'A', 'the dentist', endOfLocalDay(NOW, DAY, 0));
  const next = nextFixedToday(s, NOW, DAY);
  assert.equal(next?.title, 'the dentist');
  assert.equal(nextFixedWords(next), 'Fixed today: the dentist.');
});

test('NO COUNTDOWN — not a remaining time, not an hour, not a number at all', () => {
  // A countdown is a deadline rendered continuously, and a shrinking number
  // against an aversive thing adds aversion at the moment of approach. Clocks
  // here are day-granular too, so an hour would be fabricated (ADR-0010).
  const s = dated(emptyState(), 'A', 'the dentist', endOfLocalDay(NOW, DAY, 0));
  const words = nextFixedWords(nextFixedToday(s, NOW, DAY))!;
  assert.doesNotMatch(words, /\d/, 'no number of any kind reaches the surface');
  assert.doesNotMatch(words, /\b(in|left|until|remaining|minutes|hours|at)\b/i,
    'and no shape that reads as a countdown');
});

test('nothing fixed today says NOTHING, rather than saying the day is empty', () => {
  const s = dated(emptyState(), 'A', 'the dentist', endOfLocalDay(NOW, DAY, 3));
  assert.equal(nextFixedToday(s, NOW, DAY), null, 'a thing three days out is not today');
  assert.equal(nextFixedWords(null), null, 'and a surface with nothing to say says nothing');
});

test('it is the SOONEST still ahead, and never one that has gone', () => {
  // Naming a thing whose instant has passed would tell somebody absorbed in
  // their work that they have already missed something — the one sentence this
  // surface must never produce.
  let s = dated(emptyState(), 'PAST', 'the school run', '2026-08-09T14:00:00.000Z');
  s = dated(s, 'SOON', 'the dentist', '2026-08-09T21:00:00.000Z');
  s = dated(s, 'LATER', 'the staff call', '2026-08-09T23:00:00.000Z');
  const next = nextFixedToday(s, NOW, DAY);
  assert.equal(next?.title, 'the dentist', 'the soonest one still ahead');
});

test('a CURE clock is not a fixed thing — nobody promised anybody anything', () => {
  // Routing an item cures it with a clock so it cannot go silent. Treating that
  // as an appointment would fill this line with every dateless thing in the
  // store, which is the defect that once had a real import reporting a thousand
  // items as ready today.
  let s = write(emptyState(), [ev('capture.recorded', 'C', { text: 'ring the plumber' })]);
  s = write(s, [ev('clarify.routed', 'C', { route: 'next-action' })]);
  assert.equal(nextFixedToday(s, NOW, DAY), null,
    'a gate cure is coverage, not a commitment to somebody else');
});

test('a finished thing is not ahead of you', () => {
  let s = dated(emptyState(), 'A', 'the dentist', '2026-08-09T21:00:00.000Z');
  s = write(s, [ev('done.marked', 'A', { at: NOW })]);
  assert.equal(nextFixedToday(s, NOW, DAY), null);
});

test('a title of only spaces produces no line, rather than an empty claim', () => {
  const s = dated(emptyState(), 'A', '   ', '2026-08-09T21:00:00.000Z');
  assert.equal(nextFixedWords(nextFixedToday(s, NOW, DAY)), null,
    '"Fixed today: ." is worse than silence');
});

// --- and never about the thing in front of you (2.10.2) ---------------------
//
// A real date today is the first reason `nextUp` ranks on, so the next fixed
// thing today and the thing being OFFERED are the same item by construction
// rather than by chance. The offer card rendered both: the title as its head,
// and "Fixed today: <the same title>." three lines under it.
//
// The identity is what these assert on, not the words. The projection now
// returns the node's `id` precisely so the surface can ask "is this the thing
// they are already looking at" without comparing titles — two items called
// "Ring the plumber back" is not a hypothetical in a planner.
//
// BOTH DIRECTIONS, because a check that only proves the line CAN be suppressed
// is satisfied by a line that never renders at all (hub LESSONS §100).

test('it returns the id, so a surface can tell it names what is already on screen', () => {
  const s = dated(emptyState(), 'A', 'the dentist', endOfLocalDay(NOW, DAY, 0));
  const next = nextFixedToday(s, NOW, DAY);
  assert.equal(next?.id, 'A', 'the identity, not just the words');
  assert.equal(next?.title, 'the dentist', 'and the words are unchanged');
});

test('the same item as the head is recognisable as such — by id, not by title', () => {
  // Two things sharing a title, one of them dated today. Title comparison
  // cannot tell these apart; the id can, which is the whole reason it is there.
  let s = dated(emptyState(), 'A', 'Ring the plumber back', endOfLocalDay(NOW, DAY, 0));
  s = write(s, [ev('capture.recorded', 'B', { text: 'Ring the plumber back' })]);
  s = write(s, [ev('clarify.routed', 'B', { route: 'next-action' })]);

  const next = nextFixedToday(s, NOW, DAY)!;
  assert.equal(next.id, 'A', 'the dated one is the fixed thing');
  assert.notEqual(next.id, 'B',
    'and the undated namesake is NOT it, which a title comparison would have got wrong');
});

test('a DIFFERENT thing being fixed today still has its line — the horizon is the point', () => {
  // The suppression must not be reachable by deleting the feature. Here the
  // head somebody would be offered and the fixed thing are different items, so
  // the line carries what it exists to carry.
  let s = dated(emptyState(), 'A', 'the dentist', endOfLocalDay(NOW, DAY, 0));
  s = write(s, [ev('capture.recorded', 'B', { text: 'sort the recycling' })]);
  s = write(s, [ev('clarify.routed', 'B', { route: 'next-action' })]);

  const next = nextFixedToday(s, NOW, DAY)!;
  assert.equal(next.id, 'A');
  assert.notEqual(next.id, 'B',
    'a head that is not the fixed thing leaves the line saying something new');
  assert.equal(nextFixedWords(next), 'Fixed today: the dentist.',
    'and it still says it — suppression is about identity, never about the words');
});
