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
import {
  localDayKey, endOfLocalDay, atMidnight, localParts, instantFromWallTime,
} from '../src/time.ts';
import { clockFace } from '../src/clock.ts';
import { replanAll } from '../src/replan.ts';
import type { AppEvent } from '../src/events.ts';

/** The day key exactly as it read before the boundary existed — the calendar day
 *  containing the instant, with no shift. Reimplemented here rather than
 *  imported, so the comparison is against the old BEHAVIOUR and not against the
 *  new code wearing a default. */
const oldLocalDayKey = (iso: string, tz: string): string => {
  const p = localParts(iso, tz);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${String(p.year).padStart(4, '0')}-${pad(p.month)}-${pad(p.day)}`;
};

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

test('at half past midnight with a 3am boundary, it is still last night', () => {
  // THE DEFECT, stated as an assertion. 00:30 local on the 9th, for somebody
  // whose day ends at 3am, is the 8th — the day they are still sitting in.
  // At midnight it is the 9th, which is what the app used to say to everybody.
  const halfPastMidnight = '2026-08-09T06:30:00.000Z'; // 00:30 in Denver (UTC-6)
  assert.equal(localDayKey(halfPastMidnight, { zone: TZ, boundary: 3 }), '2026-08-08');
  assert.equal(localDayKey(halfPastMidnight, atMidnight(TZ)), '2026-08-09');
  // And once the boundary has passed it is unambiguously the new day.
  const fourAm = '2026-08-09T10:00:00.000Z'; // 04:00 in Denver
  assert.equal(localDayKey(fourAm, { zone: TZ, boundary: 3 }), '2026-08-09');
});

test('the day ENDS at the boundary, so a thing dated today is not gone by at 00:01', () => {
  // The other half of the same defect: law 3 turns a passed date into a replan
  // card, so a day that ends at midnight manufactures that pile out of work
  // somebody has not stopped doing.
  const afternoon = '2026-08-08T20:00:00.000Z'; // 14:00 in Denver
  const end = endOfLocalDay(afternoon, { zone: TZ, boundary: 3 });
  // 02:59:59 the following morning, local.
  assert.equal(end, '2026-08-09T08:59:59.000Z');
  const halfPastMidnight = '2026-08-09T06:30:00.000Z';
  assert.equal(Date.parse(halfPastMidnight) < Date.parse(end), true,
    'half past midnight is still INSIDE the day that thing was dated for');
  // At midnight it had already gone by, which is the behaviour being fixed.
  assert.equal(Date.parse(halfPastMidnight) > Date.parse(endOfLocalDay(afternoon, atMidnight(TZ))), true);
});

test('a midnight boundary reproduces the old answer exactly, not merely equivalently', () => {
  // The safety property the whole change rests on, and the only honest way to
  // assert it is against the OLD implementation rather than against a shape I
  // expect the answer to have. My first attempt asserted the result ended
  // ":59:59Z" and failed on Chatham, which is UTC+12:45 — the assertion was
  // wrong, not the code, and a weaker assertion would have hidden that.
  const wasEndOfLocalDay = (iso: string, tz: string, plusDays = 0): string => {
    const p = localParts(iso, tz);
    const shifted = new Date(Date.UTC(p.year, p.month - 1, p.day + plusDays));
    return instantFromWallTime({
      year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate(),
      hour: 23, minute: 59, second: 59,
    }, tz);
  };
  // Zones chosen for their edges: DST in both directions, a zone whose clocks
  // move AT MIDNIGHT (Santiago — the case that broke the first implementation),
  // a half-hour shift, and a 45-minute one.
  for (const [zone, iso] of [
    ['America/Denver', '2026-03-08T18:00:00.000Z'],
    ['America/Denver', '2026-11-01T18:00:00.000Z'],
    ['America/Santiago', '2026-09-05T18:00:00.000Z'],
    ['Australia/Lord_Howe', '2026-10-04T02:00:00.000Z'],
    ['Pacific/Chatham', '2026-04-05T02:00:00.000Z'],
    ['Asia/Kolkata', '2026-08-08T18:00:00.000Z'],
  ] as const) {
    for (const plus of [0, 1, 7, 30]) {
      assert.equal(endOfLocalDay(iso, atMidnight(zone), plus), wasEndOfLocalDay(iso, zone, plus),
        `${zone} +${plus}: a midnight boundary must give the byte-identical old answer`);
    }
    assert.equal(localDayKey(iso, atMidnight(zone)), oldLocalDayKey(iso, zone),
      `${zone}: and the day key is unchanged too`);
  }
});

test('THE HEADER CLOCK: the remainder drains instead of resetting at midnight', () => {
  // The surface where the defect is loudest. What gives a day weight is watching
  // it drain — that is the whole argument for showing a remainder at all
  // (src/clock.ts). Under a midnight boundary the number jumps from twelve
  // minutes to twenty-four hours at the stroke, which is the reverse of the fact
  // it exists to convey, and it does that while somebody is still working.
  const halfPastMidnight = '2026-08-09T06:30:00.000Z'; // 00:30 in Denver

  const midnightDay = clockFace(emptyState(), halfPastMidnight, TZ);
  assert.equal(midnightDay.minutesLeft > 20 * 60, true,
    `at 00:30 a midnight boundary claims most of a day is left (${midnightDay.minutesLeft} min)`);

  const theirs = clockFace(setHour(emptyState(), 3), halfPastMidnight, TZ);
  assert.equal(theirs.minutesLeft, 149, 'two hours twenty-nine, which is what is actually left of that evening');
  assert.equal(theirs.hour, 0, 'and the TIME is untouched — the clock still says what the clock says');
});

test('THE REPLAN PILE: work you have not stopped doing is not "gone by" at 00:01', () => {
  // Law 3 converts a passed date into a replan card, with no archive to hide in.
  // Under a midnight boundary that is a machine for manufacturing a pile out of
  // work in progress: at 00:01 everything dated for the evening you are still
  // sitting in has "gone by", and you are handed a wall of cards asking you to
  // replan things you were in the middle of.
  const halfPastMidnight = '2026-08-09T06:30:00.000Z'; // 00:30 in Denver

  let s = write(emptyState(), [ev('capture.recorded', 'A', { text: 'ring the plumber' })]);
  s = write(s, [ev('clarify.routed', 'A', { route: 'next-action' })]);
  // Dated for the day they are still in — the last instant of it, as every
  // writer in the app builds a date.
  const dated = endOfLocalDay('2026-08-08T20:00:00.000Z', atMidnight(TZ));
  s = write(s, [ev('clock.set', 'A', { clockKind: 'due', at: dated, source: 'detail:due' })]);

  assert.equal(replanAll(s, halfPastMidnight, TZ).length, 1,
    'at midnight the app has already decided that evening is over');

  const theirs = setHour(s, 3);
  assert.equal(replanAll(theirs, halfPastMidnight, TZ).length, 0,
    'with a 3am boundary it is still tonight, and nothing is being asked to be replanned');

  // And once their day HAS ended, it asks — the guarantee is not weakened, only
  // moved to where the person's day actually is.
  const fourAm = '2026-08-09T10:00:00.000Z';
  assert.equal(replanAll(theirs, fourAm, TZ).length, 1,
    'after their boundary it has genuinely gone by, and law 3 still holds');
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
