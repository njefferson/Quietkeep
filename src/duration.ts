// HOW LONG THINGS TAKE — V2 stage 5, and the one number that is allowed.
//
// ## Why a RANGE, and never an average
//
// Task durations are tau-heavy: a long right tail, most attempts near the
// bottom, a few enormous. The mean of that distribution sits in the gap where
// almost nothing actually lands — it is the least representative value
// available, and it is the value every tool reaches for. "Usually 40 minutes"
// is false in both directions at once: it makes the quick ones feel like
// failures and the long ones feel like anomalies.
//
// The honest statement is the two ends: **it has taken between this and this**.
// Both numbers are real; both are things that actually happened. Nothing in
// between is claimed, because nothing in between is known.
//
// ## What it must never become
//
// **Never an average, a rate, a ratio, a trend, or a count of attempts.** Those
// are a window of past events reduced to a number about the PERSON, which is
// the aggregation this product forbids. A range is two events, each stated as
// itself.
//
// **Never compared to what you guessed.** "You said twenty minutes and it took
// ninety" is an indictment dressed as data, and it is the single most obvious
// thing to build here. The estimate and the timings live side by side and the
// app draws no line between them.
//
// **Prospective only.** These numbers exist to be read BEFORE an attempt, while
// they can still inform a decision. The same numbers computed afterwards are a
// verdict on what you just did.
//
// **No bar, no colour, no instruction.** A shape that fills is a fraction of a
// target however it is drawn, and there is no target here.
//
// PURE, like every projection here.

import type { NodeState } from './fold.ts';

export interface DurationRange {
  /** The shortest real attempt, in whole minutes. */
  shortest: number;
  /** The longest real attempt, in whole minutes. */
  longest: number;
}

/**
 * What the person SAID it would take, or null.
 *
 * Their own word, exactly like weight and capacity — never derived, never
 * corrected, never scored against what happened.
 */
export const estimateOf = (n: NodeState): number | null =>
  typeof n.estimateMinutes === 'number' && Number.isFinite(n.estimateMinutes) && n.estimateMinutes > 0
    ? n.estimateMinutes
    : null;

/**
 * The two ends of what has actually happened on this item, or null if it has
 * never been timed.
 *
 * ONE timing gives a range whose ends are equal, and that is correct rather
 * than a degenerate case: "it took twelve minutes" is exactly what is known.
 * There is deliberately no minimum sample size, because a threshold would be
 * the app deciding when your own history counts.
 */
export const timedRange = (n: NodeState): DurationRange | null => {
  const runs = (n.timedMinutes ?? []).filter(m => Number.isFinite(m) && m > 0);
  if (runs.length === 0) return null;
  return { shortest: Math.min(...runs), longest: Math.max(...runs) };
};

/** "20 minutes" / "1h 20m". Plain, and never rounded to something friendlier
 *  than the truth. */
export const minutesWords = (m: number): string => {
  const whole = Math.max(0, Math.round(m));
  if (whole < 60) return `${whole} minute${whole === 1 ? '' : 's'}`;
  const h = Math.floor(whole / 60);
  const rest = whole % 60;
  return rest === 0 ? `${h}h` : `${h}h ${rest}m`;
};

/**
 * What the surface says about how long this has taken, or null.
 *
 * Two ends, or one number when there is one. **No count of attempts** — "three
 * times" is a tally about you, and the range says everything the tally would
 * without saying anything about how often you have been at it.
 */
export const rangeWords = (r: DurationRange | null): string | null => {
  if (!r) return null;
  return r.shortest === r.longest
    ? `Took ${minutesWords(r.shortest)} before.`
    : `Took between ${minutesWords(r.shortest)} and ${minutesWords(r.longest)} before.`;
};

/** What the person said, in words, or null. Stated as theirs, because it is. */
export const estimateWords = (n: NodeState): string | null => {
  const e = estimateOf(n);
  return e === null ? null : `You said about ${minutesWords(e)}.`;
};

/* `timeLeftWords` LIVED HERE AND IS DELETED, NOT ORPHANED (2.12.2, ADR-0103).
 *
 * It rendered "About 2h 30m left today." at `#nextup-left`, and that line has
 * come off the offer card. Deleting the projection rather than leaving it for a
 * future caller is this file's own lesson: ADR-0031 is that a projection nothing
 * renders is the log lying rather than merely silent, and `src/duration.ts` is
 * the file that was written with no reader and is named in smoke.mjs for it.
 * An export kept warm "in case" is the same state with a nicer story.
 *
 * The remainder of the day is still computed and still spoken — by
 * `remainderWords` in `src/clock.ts`, on the opt-in header clock, which is the
 * home entry 9 of `docs/nd-collisions.md` gives it. `minutesWords` below stays;
 * `rangeWords` is its reader. */
