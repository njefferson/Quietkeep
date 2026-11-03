// The weeks ahead, above the hub's doors (3.27.0, ADR-0127).
//
// A projection and nothing else. It stores nothing, writes no event and owns no
// selection of its own: the rows come from `calendarEntries` (the one selection
// the calendar file and the days-ahead view already share) and every day from
// `src/reading.ts` (the one reading of which clock names which day). If this
// file walked the clocks itself it would eventually name a different morning
// than the diary, which is the class `src/ics.ts` and `src/reading.ts` exist to
// refuse.
//
// WHAT IT SHOWS, from today and never before it (law 3). Seven days, then the
// rest of thirty days where something is dated; the stretches between two dates
// of one thing (a lane, drawn as length); who a thing is waited on from; and
// what is still to sort.
//
// WHAT IT DOES NOT SHOW. A date that has gone by is not drawn: it has its own
// surface (the replan card) and painting a thousand imported dates gone by onto
// today would turn a fact about a date into a fact about the reader. And the
// pile of things not sorted yet is given NO figure, because ADR-0085 and
// ADR-0113 keep a count of it off the screen a person arrives at; the view has
// no field that could carry one.
//
// PURE. `now` and `zone` are arguments, like every other projection here.
// (docs/decisions/glance-2026-11.md, sections 4 and 5.)

import type { NodeState, State } from './fold.ts';
import { calendarEntries } from './ics.ts';
import { heldGroups, clockDayWords } from './held.ts';
import { waitingOnAnyone, withWhom, peopleWords } from './people.ts';
import { dayNamed, dayOffset, laneOf } from './reading.ts';
import { atMidnight, localDayKey } from './time.ts';
import type { DatedItem } from './dated.ts';

/** How far ahead the glance reaches, in calendar days from today. */
export const GLANCE_DAYS = 30;
/** The days always drawn, one list item each. */
export const GLANCE_WEEK = 7;
/** Titles shown on one day before one line says how many more. */
export const DAY_CAP = 5;
/** Stretches shown before one line says how many more. */
export const SPAN_CAP = 4;
/** Things waited on shown before the count sentence says "these first". */
export const WAIT_CAP = 3;
/** Things not sorted yet shown before one line says more are waiting. */
export const SORT_CAP = 3;

export interface GlanceDay {
  /** The local day key, `YYYY-MM-DD`. */
  day: string;
  /** Calendar days from today. 0 is today. */
  offset: number;
  /** At most `DAY_CAP` items, in the days-ahead view's own order. */
  items: DatedItem[];
  /** How many more items the day holds than are shown. */
  hidden: number;
}

export interface GlanceSpan {
  node: NodeState;
  /** First column of the track, 0 to 29. A start already passed is 0. */
  from: number;
  /** Last column of the track, 0 to 29. A due day past the thirty is 29. */
  to: number;
  /** The real offsets, before they are fitted to the thirty columns. */
  startOffset: number;
  dueOffset: number;
  /** The due day lies beyond the thirty days. */
  runsPast: boolean;
  /** The start day is before today. */
  startedAlready: boolean;
  /** The lane read in words: both dates, in the app's own day words. */
  words: string;
}

export interface GlanceWait {
  node: NodeState;
  /** Who it is with, or null when nobody is named yet. */
  whom: string | null;
}

export interface GlanceView {
  /** The one sentence under the heading. */
  words: string;
  /** Always `GLANCE_WEEK` days, in date order. */
  week: GlanceDay[];
  /** Days eight to thirty that carry a title; a run of empty days is absent. */
  month: GlanceDay[];
  spans: GlanceSpan[];
  /** Stretches that exist beyond the `SPAN_CAP` shown. */
  spansMore: number;
  /** `total` is the count of things with other people, a fact the hub's People
   *  door already states; `shown` is at most `WAIT_CAP`. */
  waiting: { total: number; shown: GlanceWait[] };
  /** Titles not yet sorted. NO TOTAL: the pile has no number on this screen. */
  unsorted: { shown: NodeState[]; more: boolean };
  /** Something is dated in the thirty days. */
  anyDated: boolean;
}

const EMPTY_WORDS = 'Nothing you hold carries a date in the next thirty days.';
const DATED_WORDS = 'Dated things, day by day, from today.';

/** The days-ahead view's order within one day: title, then id. */
const byTitleThenId = (a: DatedItem, b: DatedItem): number =>
  (a.node.title || '').localeCompare(b.node.title || '') || (a.node.id < b.node.id ? -1 : 1);

export function glanceView(state: State, nowIso: string, zone: string): GlanceView {
  const mid = atMidnight(zone);
  const today = localDayKey(nowIso, mid);

  // ONE SELECTION, every clock the reader set (the view's side of the file).
  const entries = calendarEntries(state, nowIso, zone, true);

  // --- the days ------------------------------------------------------------
  const byDay = new Map<string, DatedItem[]>();
  for (const e of entries) {
    // NOTHING BEFORE TODAY IS DRAWN. A clock whose own local day has passed is
    // clamped to today by the one reading so that the file and the view still
    // carry it; the glance does not paint it, because the passed date has its
    // own surface and a passed date is not a thing the days ahead hold.
    if (localDayKey(e.at, mid) < today) continue;
    if (e.group === 'replan') continue;
    const day = dayNamed(e.at, nowIso, mid);
    const offset = dayOffset(day, nowIso, mid);
    if (offset >= GLANCE_DAYS) continue;
    const list = byDay.get(day) ?? [];
    if (list.length === 0) byDay.set(day, list);
    list.push({ node: e.node, kind: e.kind, whom: withWhom(state, e.node), note: null });
  }

  const dayOf = (offset: number): GlanceDay => {
    const key = dayKeyAt(today, offset);
    const all = (byDay.get(key) ?? []).slice().sort(byTitleThenId);
    return {
      day: key,
      offset,
      items: all.slice(0, DAY_CAP),
      hidden: Math.max(0, all.length - DAY_CAP),
    };
  };

  const week: GlanceDay[] = [];
  for (let i = 0; i < GLANCE_WEEK; i++) week.push(dayOf(i));
  const month: GlanceDay[] = [];
  for (let i = GLANCE_WEEK; i < GLANCE_DAYS; i++) {
    const d = dayOf(i);
    if (d.items.length > 0) month.push(d);
  }
  const anyDated = week.some(d => d.items.length > 0) || month.length > 0;

  // --- the stretches -------------------------------------------------------
  // One shape of one node: a start clock and a due clock, both naming a day.
  const seen = new Set<string>();
  const lanes: GlanceSpan[] = [];
  for (const e of entries) {
    if (seen.has(e.node.id)) continue;
    seen.add(e.node.id);
    const lane = laneOf(e.node);
    if (!lane) continue;
    // A stretch whose due day has gone by is a passed date, and is not drawn.
    if (localDayKey(lane.due.at, mid) < today) continue;
    const startOffset = dayOffset(dayNamed(lane.start.at, nowIso, mid), nowIso, mid);
    const dueOffset = dayOffset(dayNamed(lane.due.at, nowIso, mid), nowIso, mid);
    // It begins beyond the thirty days: nothing of it falls in them.
    if (startOffset > GLANCE_DAYS - 1) continue;
    const startedAlready = localDayKey(lane.start.at, mid) < today;
    const from = startOffset;
    const to = Math.min(dueOffset, GLANCE_DAYS - 1);
    const startWords = clockDayWords(lane.start.at, nowIso, zone, mid);
    const dueWords = clockDayWords(lane.due.at, nowIso, zone, mid);
    lanes.push({
      node: e.node,
      from,
      to,
      startOffset,
      dueOffset,
      runsPast: dueOffset > GLANCE_DAYS - 1,
      startedAlready,
      words: `${startedAlready ? 'Started' : 'Starts'} ${startWords}, due ${dueWords}.`,
    });
  }
  lanes.sort((a, b) => a.dueOffset - b.dueOffset
    || (a.node.title || '').localeCompare(b.node.title || '')
    || (a.node.id < b.node.id ? -1 : 1));

  // --- who is waited on ----------------------------------------------------
  const waits = waitingOnAnyone(state, nowIso, zone);
  const waiting = {
    total: waits.length,
    shown: waits.slice(0, WAIT_CAP).map(w => ({ node: w.node, whom: withWhom(state, w.node) })),
  };

  // --- what is still to sort ----------------------------------------------
  const unsortedItems = heldGroups(state, nowIso, zone).find(g => g.key === 'unsorted')?.items ?? [];
  const unsorted = {
    shown: unsortedItems.slice(0, SORT_CAP),
    more: unsortedItems.length > SORT_CAP,
  };

  return {
    words: anyDated ? DATED_WORDS : EMPTY_WORDS,
    week,
    month,
    spans: lanes.slice(0, SPAN_CAP),
    spansMore: Math.max(0, lanes.length - SPAN_CAP),
    waiting,
    unsorted,
    anyDated,
  };
}

/** The key `offset` calendar days after a date-only key. Both are date-only and
 *  parse as UTC midnights, so no zone is left to get wrong. */
function dayKeyAt(todayKey: string, offset: number): string {
  return new Date(Date.parse(todayKey) + offset * 86_400_000).toISOString().slice(0, 10);
}

/** The sentence under the stretches when more exist than are shown. */
export function spansMoreWords(more: number): string {
  return more === 1 ? 'One more stretch is not shown.' : `${more} more stretches are not shown.`;
}

/** The line under a day that holds more than it shows. A fact about the day. */
export function dayMoreWords(hidden: number): string {
  return `${hidden} more on this day.`;
}

/** The line under the waiting rows: the People door's own sentence, and which
 *  rows these are when more exist than are shown. */
export function waitingCountWords(total: number, shown: number): string {
  const base = peopleWords(total);
  return total > shown ? `${base} These ${shown} first.` : base;
}

/** The line under the not-sorted-yet titles. No figure for the pile: the only
 *  number in it is how many titles are drawn above it. */
export function unsortedMoreWords(shown: number): string {
  return `More are waiting. These ${shown} first.`;
}
