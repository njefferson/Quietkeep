// The days ahead, inside the app — the live half of the calendar story (3.22.0).
//
// The `.ics` export exists "so the OS calendar does the notifying"
// ([ADR-0007](../docs/adr/0007-notification-tiers.md)): the OS calendar has
// notification permission and runs when this app does not. What it can never be
// is CURRENT — the file is a snapshot and says so on every event. So the reader
// who works to answer-owed dates was left changing apps to see half of their own
// obligations, and watching dates move — the thing an answer-owed date does —
// only in a copy that does not move. That is this surface's whole reason: the
// SAME days, on a screen that follows the log.
//
// THE VIEW IS THE EXPORT'S SELECTION. Every row here comes from
// `calendarEntries` and every day from `calendarDay` (`src/ics.ts`), the one
// definition the file and the ⓘ count already read. If this view walked the
// clocks itself it would eventually disagree with the diary, and a planner that
// tells you one set of days on screen and sends another to the calendar you
// trust is lying to you in whichever one you happen to read. The tests hold the
// two to identical membership and identical days.
//
// PURE. `now` and `zone` are arguments, like every other projection here.

import type { NodeState, State } from './fold.ts';
import { calendarEntries, calendarDay } from './ics.ts';
import { withWhom } from './people.ts';
import { atMidnight, localDayKey } from './time.ts';

export interface DatedItem {
  node: NodeState;
  /** Which clock kind the day came from — `suspense` is the one this view
   *  exists to show, and it is never folded into a generic "due". */
  kind: string;
  /** Who the thing is with, when it is waiting on somebody — the name that
   *  turns "answer owed Thursday" into a sentence you can open a call with. */
  whom: string | null;
  /** The held list's own words when the date already went by and the item is
   *  asking for a decision — never a second phrasing of one state. */
  note: string | null;
}

export interface DatedDay {
  /** The local day key (`YYYY-MM-DD`) the diary itself would carry. */
  day: string;
  /** Calendar days from today. 0 is today; never negative, because a passed
   *  clock arrives clamped to today exactly as the exported event does. */
  days: number;
  items: DatedItem[];
}

/** The words a row wears for WHICH date is talking. `suspense` uses the date
 *  group's own vocabulary ("Answer owed by"), lowercased for a row. */
export function datedKindWords(kind: string): string {
  switch (kind) {
    case 'suspense': return 'answer owed';
    case 'start': return 'starts';
    case 'park': return 'comes back';
    default: return 'due';
  }
}

/**
 * Every dated day ahead, in order, each carrying its items.
 *
 * Grouping resolves in the reader's own zone at MIDNIGHT — `calendarDay`'s
 * boundary, which is the diary's boundary — not the app's movable day boundary,
 * because the promise of this surface is "the same mornings as your calendar",
 * and two boundaries would let the two halves name different days for one node.
 * For the same reason no row restates when it comes back in its own words: the
 * heading is the one place the day is said, so a row and its heading cannot
 * disagree (the ADR-0032 class).
 */
export function datedDays(state: State, nowIso: string, zone: string): DatedDay[] {
  const byDay = new Map<string, DatedItem[]>();
  for (const e of calendarEntries(state, nowIso, zone)) {
    const day = calendarDay(e.at, nowIso, zone);
    const items = byDay.get(day) ?? [];
    if (items.length === 0) byDay.set(day, items);
    items.push({
      node: e.node,
      kind: e.kind,
      whom: withWhom(state, e.node),
      // The replan group's own row status, verbatim — a passed hard date is a
      // decision, and this view must not re-offer it as ordinary dated work.
      note: e.group === 'replan' ? 'needs a new plan' : null,
    });
  }
  const today = localDayKey(nowIso, atMidnight(zone));
  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, items]) => ({
      day,
      // Both keys are date-only and parse as UTC midnights, so the difference
      // is an exact whole number of days with no zone left to get wrong.
      days: Math.max(0, Math.round((Date.parse(day) - Date.parse(today)) / 86_400_000)),
      items: items.sort((a, b) =>
        (a.node.title || '').localeCompare(b.node.title || '') || (a.node.id < b.node.id ? -1 : 1)),
    }));
}

/** The heading for one day. "Today" and "Tomorrow" keep their date beside
 *  them, because "Today" alone stops being true at midnight and a reader can
 *  leave the sheet open. A day in another year says which year — "Sep 1" for
 *  2036 is indistinguishable from this September (held's own rule). */
export function datedDayWords(d: DatedDay, nowIso: string, zone: string): string {
  const sameYear = d.day.slice(0, 4) === localDayKey(nowIso, atMidnight(zone)).slice(0, 4);
  // Noon UTC rendered as UTC prints the key's own calendar date verbatim, in
  // every zone the host could be set to.
  const date = new Date(`${d.day}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  });
  if (d.days === 0) return `Today — ${date}`;
  if (d.days === 1) return `Tomorrow — ${date}`;
  return date;
}

/**
 * The standing line over the list. It names the export by its exact label and
 * says which half of the pair each of them is: this list follows every date
 * change; the file is how the days reach a calendar that can notify. An empty
 * list says where a date comes from, because an empty surface with no sentence
 * reads as a broken one.
 */
export function datedWords(total: number): string {
  if (total === 0) {
    return 'Nothing you hold carries a date yet. '
      + 'A date goes on from a thing’s own sheet, and it shows here the moment it is set.';
  }
  const head = total === 1 ? 'One dated thing is ahead.' : `${total} dated things are ahead.`;
  return `${head} This list is live — when a date changes, it moves here. `
    + 'Send to my calendar carries the same list out, so your own calendar can remind you.';
}
