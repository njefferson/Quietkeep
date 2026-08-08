// JUST ONE THING — the minimum state (V2 stage 4).
//
// ## Fog is a THIRD failure mode, not a worse version of a low day
//
// "Fewer things" and "less thinking" are different transformations, and the app
// only had the first. A low day is answered by reaching for lighter work (see
// `weightOrderFor`); it is answered by nothing at all when the problem is not
// how much there is but how much the SCREEN is asking you to process.
//
// On the day this is for, the offer's own furniture is the load: two items to
// choose between, a reason line, where it sits, what it holds up, what you said
// about doing it, a list of what is behind, a count, a row of chips. Every one
// of those earns its place on an ordinary day and every one of them is a thing
// to read on this one.
//
// It is also the BURNOUT state, and that is the part that decides the design:
// the skill of operating the tool is one of the skills that has gone. So leaving
// it must be one visible tap, and entering it must not require finding a
// settings screen.
//
// ## What it is not
//
// **Never inferred and never prompted.** Nothing detects a foggy day, because
// detecting one means forming an opinion about the person from their logs, and
// there is no instrument here that could. It is invoked, and it stays until it
// is left.
//
// **Not a capacity.** `capacity` is four words about the day and it changes
// WHICH things are offered, never how many (1.34.0). This changes how many, and
// the difference is who decided: capacity is a fact the person states about
// themselves that the app then acts on, and this is the person operating their
// own screen. The app still never shortens the offer on its own.
//
// **Not a reduced app.** Nothing is deleted, nothing goes silent, every
// guarantee holds unchanged. It is a smaller VIEW of the same store, and the
// held list, the search and the ⓘ are all exactly where they were.
//
// PURE, like every projection here.

import type { State } from './fold.ts';

/**
 * The module noun. Rides `module.enabled` / `module.disabled`, which the fold
 * has folded since 1.6.0 — so this costs the closed vocabulary nothing and
 * survives a reload, which matters: a state you have to re-enter every time the
 * app reloads is one more thing to operate on the day you can least afford it.
 *
 * Named for the SCREEN and never for the person. "Fog mode" would be a fact
 * about you; "just one thing" is a fact about what is on the display, and the
 * difference is the whole voice rule.
 */
export const PLAIN_MODULE = 'one-thing';

export const plainIsOn = (state: State): boolean => state.modules.has(PLAIN_MODULE);

/**
 * How many pieces of work the offer may show while it is on.
 *
 * ONE, and it is a constant rather than a computation. The whole point is that
 * choosing is not something being asked of you: two unalike options are a
 * preference on an ordinary day (ADR-0060) and are two things to read on this
 * one.
 */
export const PLAIN_OFFER_CAP = 1;

/**
 * What the offer says while it is on: the thing itself, and nothing about why.
 *
 * Every line this suppresses is true and useful on an ordinary day. The reason,
 * the place, the approach arithmetic, the situation, the first-step prompt, the
 * list of what is behind and the count are all information, and information is
 * the cost being cut. What survives is the title and the two acts.
 */
export const PLAIN_HIDDEN = [
  '#nextup-why', '#nextup-place', '#nextup-approach', '#nextup-situation',
  '#nextup-bite', '#nextup-bite-form', '#nextup-behind', '#nextup-count',
  '#nextup-load', '#upkeep', '#nextup-heavy',
] as const;
