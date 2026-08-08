// THE DAY THE PERSON IS ACTUALLY IN — V2 stage 5.
//
// ## The defect
//
// Every clock in this app is day-granular and every writer builds it with
// `endOfLocalDay`, which means 23:59:59. So "today" ends at midnight, and at
// 00:30 the app has already rolled over: everything that was dated today became
// a date that has GONE BY half an hour ago, while the person is still sitting in
// the same evening, still working.
//
// That is not a cosmetic wrongness. Law 3 says a passed date auto-converts to a
// replan card, so the app manufactures a pile of replan cards *out of work
// somebody has not stopped doing yet*, at the exact hour it can least be
// afforded. And the header clock's remainder — the gradient this whole app
// leans on — jumps from "0h 12m left" to "23h 59m left" at the stroke, which is
// the opposite of the fact it exists to convey.
//
// **Delayed circadian phase is the norm rather than the exception in this
// population**, so a boundary at midnight is wrong for a large share of the
// people the app is for, every single night. Midnight is not a neutral default;
// it is somebody else's default, imposed.
//
// ## What this is
//
// One number: the hour at which today becomes tomorrow, in the person's own
// local time. Nought is midnight and is exactly today's behaviour, so the
// default costs nothing and changes nothing. Three means the day ends at 3am,
// so 00:30 and 02:00 are still *last night* — which is what they are.
//
// **It is stated, never observed.** Nothing watches when the last event of a
// day was written and proposes a boundary from it: that is an inference about a
// person from their logs, and this app does not have opinions about people. The
// same rule that governs weight, capacity and the minimum state governs this.
//
// ## What it is not
//
// **Not a time of day on clocks.** Clocks stay day-granular (ADR-0010). This
// moves where the day's edge falls; it does not add an hour to anything, and
// there is still no time input anywhere in the app.
//
// **Not a schedule, a bedtime, or a target.** Nothing compares the hour to
// anything, nothing says it is late, and no surface counts the times a day ran
// past it. It is a boundary for arithmetic and it means nothing else.
//
// PURE, like every projection here.

import type { State } from './fold.ts';

/**
 * Midnight — the boundary the app behaved as though everybody had.
 *
 * This is the value every reader falls back to, and it makes the whole feature
 * a no-op until somebody sets one. That matters more than it sounds: it means
 * this change cannot alter a single existing answer for a person who has not
 * asked for it, which is the only honest way to move something as load-bearing
 * as what "today" means.
 */
export const MIDNIGHT = 0;

/**
 * How late the boundary may be set. 11am is not a plausible day boundary and a
 * bound has to fall somewhere; 0–11 covers every hour that can honestly be
 * called "still last night" and refuses the ones that cannot.
 *
 * A value outside it is REFUSED at the fold rather than clamped, on the rule
 * this repo already applies to capacity and timer length: a number nobody chose
 * is worse than no number at all, and silently clamping 14 to 11 would have the
 * app inventing a boundary and then acting on it.
 */
export const LATEST_BOUNDARY_HOUR = 11;

export const isBoundaryHour = (h: unknown): h is number =>
  typeof h === 'number' && Number.isInteger(h) && h >= 0 && h <= LATEST_BOUNDARY_HOUR;

/** The person's boundary, or midnight if they have never set one. */
export const boundaryOf = (state: State): number =>
  isBoundaryHour(state.dayBoundaryHour) ? state.dayBoundaryHour : MIDNIGHT;

/**
 * What the surface says about the boundary, in the person's terms.
 *
 * No "you stay up late", no "your day is long", nothing about them at all — it
 * states where the edge is and stops. Midnight gets its own sentence rather
 * than "0:00", because the number is the implementation and the word is the
 * fact.
 */
export const boundaryWords = (hour: number): string =>
  hour === MIDNIGHT
    ? 'Today ends at midnight.'
    : `Today ends at ${hour}am. Until then it is still the same day.`;
