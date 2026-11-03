// One reading of when a thing comes back (3.27.0, step 9 of the glance plan).
//
// Three surfaces lay dates out for the reader: the days-ahead view, the calendar
// file and the glance above the hub's doors. Before this file each of the first
// two carried its own copy of the rule for which clock of a node names a day, and
// release 3.26.1 recorded two screens naming different dates for one thing. This
// is the one place that rule is stated, and the three read it.
// (docs/decisions/glance-2026-11.md, section 3.)
//
// PURE. `now` and the day's shape are arguments, like every other projection
// here. It imports only the fold and the time module, so it sits below
// `src/ics.ts`, `src/held.ts` and `src/dated.ts` and cannot form a cycle.
//
// THE RULE, stated once.
//
// R1. A clock names a day for its node when its kind is due, start, suspense or
//     park, or when its kind is review and a person set it. A review clock the
//     app wrote names nothing; `isAppClock` answers which those are and nothing
//     else does, so a capture, which the gate gives a review clock, names no day.
// R2. The day a clock names is the local day of its instant in the shape given,
//     never earlier than today. The three callers pass midnight, because the
//     calendar file and the diary both break the day there.
// R3. The view lists a node once for each clock that names a day, soonest first,
//     ties in the order suspense, due, start, park, review. The file lists a
//     node once, on its soonest clock among the kinds that may carry an alarm.
// R4. A lane is a node with a start clock and a due clock, both naming a day,
//     where the start's instant is not after the due's.
//
// It does not reclassify any clock the intent record holds, and it leaves the
// other readers of clocks where they are.

import { isAppClock, type NodeState } from './fold.ts';
import { localDayKey, isValidIso, type DayShape } from './time.ts';

/** One clock that names a day: its instant and which kind is speaking. */
export type PlacingClock = { at: string; kind: string };

/**
 * Clock kinds a CALENDAR may carry, and the axis is did the reader choose this
 * day, not is it a hard deadline.
 *
 * In: due, start, suspense, and park (a return date the held list already shows
 * as "parked until", so leaving it out made the app contradict something plainly
 * on screen).
 *
 * Out: review, and that exclusion is the whole point of this constant. A review
 * clock is the app's own resurfacing marker, and it is what routing, repeats,
 * bother handling, the comms sweep, replan and every gate cure set by default.
 * Exporting one turned "show me this again tomorrow" into "this is due
 * tomorrow", with a morning alarm, once per item. A planner that misreports your
 * obligations to a calendar you trust is worse than one with no calendar export.
 *
 * Moved here from `src/ics.ts`, which re-exports it unchanged.
 */
export const CALENDAR_KINDS: ReadonlySet<string> = new Set(['due', 'start', 'suspense', 'park']);

/** Tie order when two clocks name one instant. The deadline outranks the door
 *  opening, and the answer-owed date outranks plain due because it is the one a
 *  reader most needs to see named. Only the view reads the kind: the file writes
 *  the instant alone, so this choice cannot alter a byte of the export. */
const KIND_PRIORITY: readonly string[] = ['suspense', 'due', 'start', 'park', 'review'];

const rank = (k: string): number => {
  const i = KIND_PRIORITY.indexOf(k);
  return i === -1 ? KIND_PRIORITY.length : i;
};

/** R1 for one clock: may it name a day for the reader. */
const readerSet = (kind: string, c: { source?: string | null } | null | undefined): boolean =>
  CALENDAR_KINDS.has(kind) || (kind === 'review' && !isAppClock(c as never));

/**
 * Every clock R1 admits on one node, soonest first, ties by the tie order.
 * A clock with an invalid timestamp is skipped and never thrown on, so one
 * malformed stored date cannot take a surface down.
 */
export function placingClocks(n: NodeState): PlacingClock[] {
  return Object.values(n.clocks)
    .filter((c): c is NonNullable<typeof c> =>
      Boolean(c) && isValidIso(c!.at) && readerSet(c!.kind, c))
    .map(c => ({ at: c.at, kind: c.kind }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || rank(a.kind) - rank(b.kind));
}

/**
 * The soonest clock whose kind may carry an alarm, ties by the tie order, or
 * null. This is what the calendar file reads: a diary carrying two events for
 * one thing is noise, and an alarm on a soft clock is the nag this app refuses.
 */
export function alarmClock(n: NodeState): PlacingClock | null {
  let best: { at: string; kind: string; ms: number } | null = null;
  for (const c of Object.values(n.clocks)) {
    if (!c || !isValidIso(c.at)) continue;
    if (!CALENDAR_KINDS.has(c.kind)) continue;
    const ms = Date.parse(c.at);
    if (best === null || ms < best.ms || (ms === best.ms && rank(c.kind) < rank(best.kind))) {
      best = { at: c.at, kind: c.kind, ms };
    }
  }
  return best ? { at: best.at, kind: best.kind } : null;
}

/** R4. The start and the due of a lane, or null when the node is not one. */
export function laneOf(n: NodeState): { start: PlacingClock; due: PlacingClock } | null {
  const all = placingClocks(n);
  const starts = all.filter(c => c.kind === 'start');
  const dues = all.filter(c => c.kind === 'due');
  if (starts.length === 0 || dues.length === 0) return null;
  const start = starts[0]!;
  const due = dues[0]!;
  if (Date.parse(start.at) > Date.parse(due.at)) return null;
  return { start, due };
}

/**
 * R2. The local day a clock's instant names, as a `YYYY-MM-DD` key, never
 * earlier than today. Passed clocks genuinely reach the selection, and dating
 * one yesterday would remind nobody about precisely the work that needs it.
 */
export function dayNamed(at: string, nowIso: string, day: DayShape): string {
  const named = localDayKey(at, day);
  const today = localDayKey(nowIso, day);
  return named < today ? today : named;
}

/**
 * Whole calendar days from today to a day key, never negative. Both keys are
 * date-only and parse as UTC midnights, so the difference is an exact whole
 * number of days with no zone left to get wrong.
 */
export function dayOffset(dayKey: string, nowIso: string, day: DayShape): number {
  const today = localDayKey(nowIso, day);
  return Math.max(0, Math.round((Date.parse(dayKey) - Date.parse(today)) / 86_400_000));
}
