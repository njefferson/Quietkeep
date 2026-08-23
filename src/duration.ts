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

// ————— HOW LONG HAVE YOU GOT (2.19.0, the plan's phase 3) —————
//
// The second half of the situation. Place shipped in 2.2.0 and answers *what
// can I do here*; this answers *what can I do in twenty minutes*. It rides
// `fitsHere`'s shape exactly — a pure predicate, a device preference that is
// never an event, and a post-filter applied where the place filter already is —
// so `nextup.ts` and every test over the ranking stay untouched. This narrows
// what is OFFERED; it does not re-rank anything.

/** The lengths worth offering, shortest first. Ordinary lengths of time, not a
 *  scale: nobody has 47 minutes and thinks of it that way. */
export const HOW_LONG_CHOICES: readonly number[] = [5, 15, 30, 60, 120, 240];

/**
 * THE LONG END IS A DIFFERENT QUESTION (2.25.0 — entry 24's second candidate).
 *
 * The list stopped at two hours, so a long block of open time had no expression
 * at all. Adding a longer number and leaving it to `fitsWithin` would have been
 * the exact thing that entry refuses: at four hours almost everything fits, so
 * the filter does nothing and the reader gets a longer list, which mistakes the
 * constraint.
 *
 * **A block of open time is rarely duration-limited. It is want-limited.** What
 * is scarce on a free afternoon is not minutes, it is the thing you actually
 * want to do — so the answer is the Menu (law 6) and its heat signal, both of
 * which already exist, and NOT a bigger worklist.
 *
 * So this threshold does not filter anything. `fitsWithin` behaves exactly as
 * it always has; what changes is only what the standing line SAYS, which routes
 * rather than narrows.
 */
export const LONG_STRETCH = 240;

/** Is the answer a block of open time rather than a window to fit something into? */
export const isLongStretch = (minutes: number | null): boolean =>
  minutes !== null && minutes >= LONG_STRETCH;

/**
 * Does this fit in the time you have?
 *
 * `minutes === null` means the filter is off and everything fits.
 *
 * **WHAT THE PERSON SAID, and nothing else.** Not the timed range, which is
 * evidence about what happened rather than a claim about what this is — using
 * it here would be the app answering "you said ten minutes, but it took forty,
 * so no". That is a correction, and this module's own header says the estimate
 * is never derived, never corrected and never scored against what happened.
 * The range is on the card for the reader to weigh; it is not the app's to
 * weigh for them (law 7).
 *
 * **AN UNESTIMATED THING FITS.** The same rule as an unlabelled thing fitting
 * anywhere, and for a stronger reason: most things are never estimated, so
 * hiding them would empty the surface and read as broken the first time
 * somebody tried the feature. The app does not know how long an unestimated
 * thing takes, so it cannot honestly say it does not fit — and the standing
 * line says exactly that rather than letting the reader assume otherwise.
 */
export const fitsWithin = (n: NodeState, minutes: number | null): boolean => {
  if (minutes === null) return true;
  const e = estimateOf(n);
  return e === null || e <= minutes;
};

/**
 * The standing line while the filter is on.
 *
 * States the SCOPE and never a count of what is hidden — `whereWords`' rule,
 * and the reason is the same: an aggregate about work you are deliberately not
 * looking at only ever rises.
 */
export const howLongWords = (minutes: number): string =>
  `Showing what you said would fit in ${minutesWords(minutes)}, and anything you `
  + 'have never put a time on. Everything else is still held and still comes back.';

/**
 * What the long end says instead of what it filtered.
 *
 * It names the Menu and says why, and it states plainly that nothing has been
 * narrowed — because at four hours `fitsWithin` admits nearly everything, and a
 * line claiming a filter is on when it is doing nothing is a lie the reader
 * cannot see through.
 *
 * `menuCount` of zero is its own case: pointing at an empty Menu teaches the
 * reader the feature is broken, which is the failure `serves.ts` records and the
 * roles door already avoids by hiding until a role exists. Here the door cannot
 * be hidden, so the words carry it instead.
 */
export const longStretchWords = (minutes: number, menuCount: number): string => {
  const opening = `${minutesWords(minutes)} is not really a question about what fits. `
    + 'Nothing has been narrowed — everything is still here.';
  return menuCount === 0
    ? `${opening} A stretch like this is usually about what you want rather than what `
      + 'is asking, and the Menu is where that lives when you have put something on it.'
    : `${opening} A stretch like this is usually about what you want rather than what `
      + `is asking — the Menu has ${menuCount === 1 ? 'one thing' : `${menuCount} things`} on it, `
      + 'and none of them are asking.';
};

/** The device's answer to "how long have you got", like `where.now`.
 *
 *  A DEVICE VIEW PREFERENCE and not an event, for the reason `WHERE_KEY`
 *  carries: how much time somebody had on a Tuesday is not a fact about their
 *  work, and a stored trail of it is exactly the material law 7 keeps the app
 *  out of. */
export const HOW_LONG_KEY = 'how.long';

/** The live answer, cached at module level — `whereNow`'s pattern, and needed
 *  for the same reason: the shell narrows the held list and `work.ts` narrows
 *  the OFFER, and `work.ts` cannot import `app.ts` without a cycle. */
let howLongNow: number | null = null;
export const getHowLong = (): number | null => howLongNow;
export const setHowLong = (m: number | null): void => { howLongNow = m; };
