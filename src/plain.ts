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
  // THREE THAT THIS LIST MISSED FOR THREE RELEASES (2.10.0). Each was added to
  // the offer card AFTER this list was written, and nobody came back to it — so
  // the mode built for the worst day left them standing. Measured on the
  // thirteen-item sample: eight things survived the strip and three of them
  // were these.
  //
  // `#nextup-left`  — "About 22h 16m left today." Its own markup comment calls
  //                   it "the one permitted number" and warns that a countdown
  //                   to zero is "pressure where it costs most". On the day this
  //                   mode exists for, every hour of it costs most.
  // `#nextup-fixed` — the next unmoveable thing, by name. Correct on an ordinary
  //                   day and one more thing to hold on this one.
  // `#nextup-written` — when it was captured. Context, which is information,
  //                   which is the cost being cut.
  '#nextup-left', '#nextup-fixed', '#nextup-written',
] as const;

/**
 * AND WHAT SURVIVES, said out loud (2.10.0).
 *
 * The list above went stale silently three times, which is the defect this repo
 * has paid for with `data-door`, with element types in the target audit, and
 * with the a11y walk's list of surfaces. The pattern is always the same: a
 * hand-written list of things, and nothing checking it against the set it is
 * supposed to cover.
 *
 * So the two lists together must account for EVERY element of the offer card,
 * and `tools/plain.mjs` fails on anything in neither. Adding a line to the card
 * now forces the question "does this survive the worst day" at the moment the
 * line is written, rather than three releases later when somebody counts.
 *
 * Each of these earns its place by being an ACT or the thing being offered —
 * never by being information.
 */
export const PLAIN_KEPT = [
  '#nextup-heading',      // the surface has to say what it is
  '#nextup-title',        // the one thing. This is the whole point.
  '#nextup-done',         // the act
  '#nextup-skip',         // the way past, which records nothing
  '#nextup-enough',       // the symmetric exit — declining must end the session as completely as finishing
  '#nextup-plain',        // the way IN, hidden by its own rule while the mode is on
  '#nextup-plain-bar',    // the standing "everything is still here"
  '#nextup-plain-off',    // the way OUT, and it must be one visible tap
  '#nextup-live',         // the screen-reader announcement; visually hidden already
  '#nextup-settled',      // the after-state, which is not the offer
  '#nextup-settled-what',
  '#nextup-settled-quiet',
  '#nextup-resume',
  // The bite's own controls live inside `#nextup-bite-form`, which IS hidden —
  // they are listed so the gate can account for them rather than because they
  // survive on their own.
  '#nextup-bite-input', '#nextup-bite-done', '#nextup-bite-hint',
] as const;

/**
 * The app's own chrome, while the mode is on (2.10.0).
 *
 * Reported from a device, on a screen showing exactly one task: *"terrifyingly
 * busy, and I don't even want to begin in this."* Counted at 390px: nine
 * controls and four lines of standing text before the offer's title, and turning
 * this mode on changed NONE of them — it only ever reached inside the card.
 *
 * A mode for the day when operating the tool is itself hard, that leaves the
 * tool's own furniture untouched, answers the smaller half of the problem.
 *
 * WHAT DOES NOT GO, and the list is short on purpose: capture, because capture
 * relief is unconditional and is the one thing this app promises from every
 * state; the proof line, because it is what makes everything being out of sight
 * safe; and `More`, because a screen with no way to anywhere is a trap.
 */
export const PLAIN_CHROME_HIDDEN = [
  '#capture-room',    // a capture accessory, and directly in the path to the offer
  '#capture-paste',   // the same
  '#contents-open',   // navigation. On this day you are not navigating.
  '#clock',           // a clock face, the time, and how much of today is left
] as const;
