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
// **Not a reduced app.** Nothing is deleted, nothing goes silent, no guarantee
// changes, and every route is one tap from here — the ⓘ and `More` are where
// they always were, and one visible control brings the whole surface back.
//
// This paragraph used to end "and the held list, the search and the ⓘ are all
// exactly where they were", which stopped being true in 2.10.0 when `Contents`
// was stripped, and is not true of the list or the search now either. It is
// rewritten rather than deleted because the sentence was doing real work: the
// mode must not be a smaller app, and the way that promise is kept is that
// nothing is DESTROYED and nothing is more than a tap away — never that every
// surface stays rendered on the day the rendering is the problem.
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
  '#nextup-load', '#nextup-heavy', '#nextup-bite-open',
  // `#upkeep` WAS HERE AND IS NOT A CARD ELEMENT (2.14.0). It is a section of
  // the work surface, and it sat in this list from the day the mode was built —
  // where `tools/plain.mjs`'s both-directions check could not see it, because
  // that check only validates ids beginning `nextup-`. So the one runway section
  // the mode did strip was the one nothing was checking. It is in
  // `PLAIN_CHROME_HIDDEN` now, with the rest of the surface.
  // THREE THAT THIS LIST MISSED FOR THREE RELEASES (2.10.0). Each was added to
  // the offer card AFTER this list was written, and nobody came back to it — so
  // the mode built for the worst day left them standing. Measured on the
  // thirteen-item sample: eight things survived the strip and three of them
  // were these.
  //
  // `#nextup-fixed` — the next unmoveable thing, by name. Correct on an ordinary
  //                   day and one more thing to hold on this one.
  // `#nextup-written` — when it was captured. Context, which is information,
  //                   which is the cost being cut.
  //
  // THE THIRD WAS `#nextup-left` AND IT IS NOW GONE FROM THE CARD (2.12.2,
  // ADR-0103). Stripping it here was right and stopped one surface short: the
  // reason given was that on the worst day every hour costs most, and no
  // paragraph ever said why the number was affordable on an ordinary one. The
  // remainder lives on the opt-in header clock, which `PLAIN_CHROME_HIDDEN`
  // below still strips — so the mode's answer to this fact is unchanged.
  // `#nextup-dated` — how many things carry today's date (2.19.1). It answers
  //                   "can I finish early", which is a question about the WHOLE
  //                   day — and this mode has already answered it by existing.
  //                   Somebody who has reduced the day to one thing is not
  //                   weighing the plate; they are getting through the next
  //                   fifteen minutes. A count of commitments there is a second
  //                   thing to hold, which is the cost being cut.
  '#nextup-fixed', '#nextup-written', '#nextup-dated',
  // `#nextup-also` — what else the returning place holds. It survives NOTHING,
  // and the reasoning is the entry's own: the contents are named so a place
  // coming round does not bring back one thing and leave the rest filed. On the
  // worst day the reader is being given ONE thing, and three more names beside
  // it is the pile arriving in miniature — which is what this mode exists to
  // stop. Recognition is worth a line on an ordinary day and is a cost on this
  // one.
  '#nextup-also',
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
  // THE WAY OUT MOVED OFF THE CARD IN 2.14.0 and is declared in
  // `PLAIN_CHROME_KEPT` now. It was here, inside a card that hides whenever
  // nothing is asking, which made *mode on, nothing to offer* a screen with no
  // way back. A control that undoes a state cannot live inside anything that
  // state can hide.
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
 * The app's own chrome, while the mode is on (2.10.0, and the whole surface in
 * 2.14.0).
 *
 * Found on a device, on a screen showing exactly one task: the SCREEN was too
 * busy to begin in, even though the offer on it was a single item. Counted at
 * 390px: nine controls and four lines of standing text before the offer's title,
 * and turning this mode on changed NONE of them — it only ever reached inside
 * the card.
 *
 * A mode for the day when operating the tool is itself hard, that leaves the
 * tool's own furniture untouched, answers the smaller half of the problem.
 *
 * ## AND THE FIX STOPPED AT THE OFFER (2.14.0)
 *
 * That sentence was written about the chrome ABOVE the card, three lines were
 * added to this list, and nobody looked below. Rendered and counted at 390×844
 * on the thirteen-item sample, with the mode ON: the card went from nine
 * controls to five and from 44 words to 2 — and BELOW it stood fourteen
 * controls and 65 words of standing text, which is exactly what stood there
 * with the mode off. Not one of them moved.
 *
 * Two of those lines are the reason this matters more than a count. "Needs a new
 * plan — one date has gone by" and "one thing is with someone else" are true,
 * are correct on an ordinary day, and are the two hardest sentences on the
 * surface to meet on this one. The mode was hiding a reason line on the card
 * while printing those underneath it.
 *
 * The reasoning is `#nextup-also`'s, at full size: three names beside the offer
 * were judged to be the pile arriving in miniature, so the held list, the sort
 * queue and the replan queue beneath it are the pile arriving whole.
 *
 * WHAT DOES NOT GO, and the list is short on purpose: capture and its receipt,
 * because capture relief is unconditional and is the one thing this app promises
 * from every state; the proof line, because it is what makes everything being
 * out of sight safe; `More` and the ⓘ, because a screen with no way to anywhere
 * is a trap; the update strip, because a reader on a stale build has to be able
 * to learn it (Doctrine §7h); and the session you are already inside, because
 * that is the one thing, not the pile.
 */
export const PLAIN_CHROME_HIDDEN = [
  // Above the offer.
  // THE HUB (3.0.0, ADR-0108) — a list of places to go, which is the one thing
  // this mode is a rebuttal to. Somebody who has reduced the day to one thing is
  // not choosing where to be; being asked is the load being cut.
  '#hub',
  // AND THE ROW INSIDE A JOB, for the same reason. The way back and the (+) are
  // navigation and an accessory, and the mode's own exit (`#nextup-plain-off`)
  // is what leaves — a second and third control here is exactly the count this
  // mode holds to ten.
  '#stance-bar',
  '#capture-room',    // a capture accessory, and directly in the path to the offer
  '#contents-open',   // navigation. On this day you are not navigating.
  '#clock',           // a clock face, the time, and how much of today is left
  '#skip-held',       // a route whose destination is stripped below. A bypass link
                      // to a hidden section is a broken link, and this one has a
                      // history of being reachable by nobody (hub LESSONS §95).
  '#bother',          // the worry flow. One at a time, and still a queue of asks.
  '#reentry',         // "Welcome back", how long you were away, and an amnesty
                      // offer with two buttons — a greeting nobody arrived for.
                      // It is not dismissed by being hidden; it is waiting when
                      // the surface comes back.
  // Below the offer, all of which stood untouched until 2.14.0.
  '#to-held',         // a jump. Navigation, by the same rule as Contents.
  '#triage',          // "Sort what you have put down", a gauge line, and a card
                      // with verbs on it. Deciding is the thing this mode is
                      // built to stop asking for.
  '#triage-donow', '#triage-undo',   // triage's own attachments, and it is gone
  '#replan',          // "Needs a new plan. One date has gone by."
  '#comms', '#close', // the focus-exit ramp: two more asks and an after-word
  '#portfolio',       // "Carrying" — a count and a list
  '#people',          // "One thing is with someone else."
  '#review',          // exceptions. True, and not today's problem.
  '#composed',        // "Chosen for today" — chosen on a different day, by
                      // somebody with more to spend than this reader has now.
  '#upkeep',          // the small repeating things that have come round
  '#menu-open',       // the Menu is demand-free and is still a door to a list
  '#roles-open',      // the same, sliced by role
  '#horizons-open',   // and the same, sliced by what it is in service of. A day
                      // that has been reduced to one thing is not a day for
                      // looking at what you are working toward — that is the
                      // altitude this mode exists to get somebody out of.
  '#arrangements-open', // WHAT RUNS WITHOUT YOU (3.18.0), and it is the clearest
                      // of the four. A list of things you are trusting to
                      // continue is a list of things that are, by definition,
                      // not asking anything of you today. On the worst day it is
                      // an invitation to go and worry about whether they are
                      // still true, which is precisely the checking this feature
                      // exists to take off somebody.
  '#assurance',       // THE PROOF OF JUDGEMENT (3.23.0). `#gauge` above is KEPT
                      // and this is not, and the difference is the whole reason
                      // the two are separate controls: the gauge's claim is that
                      // nothing has gone QUIET, which carries no demand at all,
                      // and this one's fact line names HOW MANY THINGS ARE IN
                      // FRONT OF YOU. On the day the screen has been reduced to
                      // one thing, a number counting the rest is the pile
                      // arriving in miniature — `#nextup-dated`'s recorded
                      // reasoning exactly, and this mode has already answered
                      // the question by existing. The sheet stays one tap away.
  '#dated-open',      // THE DAYS AHEAD (3.22.0). A survey of every dated day is
                      // exactly the altitude Just-one-thing exists to come down
                      // from — #horizons-open's reasoning, on the time axis. The
                      // one date that matters on this day is on the card itself.
  '#search',          // a route, and the only one to search — which is the cost
                      // this entry is, stated rather than discovered: on this day
                      // "where did I put it" is answered by leaving the mode.
  // THE SITUATION, ALL THREE PIECES (2.23.2). They were inside `#held` until
  // 2.23.1 and this list covered them by covering it; moving them above the
  // offer made each its own region of the work surface, and the gate that
  // exists for exactly that said so on the first run.
  //
  // The answer is not bookkeeping. **A filter is the opposite of what this mode
  // is for.** Narrowing a list is an act of choosing between things, and the
  // worst day is the day that act is unavailable — which is why the mode hands
  // over ONE thing and takes the choosing away. A control asking *where are
  // you, how long have you got* is two questions to answer before anything can
  // begin, on the day nobody can answer them.
  '#foot-manual',     // the manual link, and the separator with it (2.29.0). The
                      // footer itself is KEPT below because the accessibility
                      // statement is an obligation; a reference is not, and on
                      // this day it is one more thing.
  '#situation-open',  // the door. Two questions, on the day questions are the cost.
  '#where-note',      // and its consequence: the list is narrowed by place.
  '#how-long-note',   // and by time. Both say what the pile is doing, and this
                      // mode has already stopped showing the pile.
  '#with-note',       // and by who is with you (2.26.0). Caught by the STATIC
                      // half of this gate, which exists because the same class
                      // of miss reached CI in 2.23.1 — three regions moved out
                      // of a container that had covered them and nothing before
                      // the walk noticed. The answer is unchanged and it is not
                      // bookkeeping: narrowing is choosing between things, and
                      // the worst day is the day that act is unavailable.
  '#held',            // the complete list of everything you are holding, with the
                      // tree, the lens, the fold, Contents and Back to the top
                      // inside it. This is the pile. The gauge above still says
                      // nothing has gone quiet, and one tap brings it all back.
] as const;

/**
 * AND WHAT SURVIVES THE WORST DAY, out loud, for the same reason `PLAIN_KEPT`
 * exists (2.14.0).
 *
 * `PLAIN_HIDDEN` and `PLAIN_KEPT` together account for every element of the
 * offer card, and `tools/plain.mjs` fails on anything in neither — which is why
 * the card has not gone stale since. The chrome had no such pair: one
 * hand-written list of three selectors, checked only for whether the elements
 * still existed. So a section added to the work surface joined the worst day's
 * screen silently, and fifteen of them had.
 *
 * With both lists the gate walks the rendered header, `<main>` and the footer
 * and fails on any region in neither — so a new surface answers "does this
 * survive the worst day" in the commit that creates it, rather than four
 * releases later when somebody counts.
 */
export const PLAIN_CHROME_KEPT = [
  '#wordmark',        // one word, and the surface has to say what it is. It had
                      // no id until the accounting asked it this question.
  '#open-about',      // the ⓘ. Doctrine §7e, and a route out.
  '#open-more',       // a screen with no way to anywhere is a trap
  '#capture-form',    // capture relief is unconditional. It is never stripped.
  '#capture-offer',   // and its receipt — what happened to the thing you just
                      // put down is the answer to an act the reader just took
  '#status',          // the live region that says the write landed
  '#gauge',           // THE PROOF LINE. What makes everything being out of
                      // sight safe, and the reason stripping the list is not
                      // the same as hiding it.
  '#update',          // "a new version is waiting" (Doctrine §7h). Rare, and a
                      // reader stuck on a stale build has to be able to find out.
  '#nextup',          // the offer. The whole point.
  '#nextup-plain-bar', // the way OUT, and it must be one visible tap. Outside the
                      // offer since 2.14.0 — the card hides when nothing is
                      // asking, and the exit went with it.
  '#nextup-plain-off',
  '#focus',           // the session you are already inside: one thing, its acts,
                      // and a capture line that does not make you stop to use it.
  '#foot',            // the licence and the accessibility statement. Static, at
                      // the very bottom, and an obligation rather than furniture.
] as const;
