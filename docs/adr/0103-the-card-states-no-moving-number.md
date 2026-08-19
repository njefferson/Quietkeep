# ADR-0103 · The offer card states no number that moves on its own

**Status:** Accepted · **Date:** 2026-08-19 · **Narrows:** ADR-0059, ADR-0010 · **Settles:** the open question recorded in NOTES.md after 2.10.2

## Decision

**`#nextup-left` comes off the offer card.** It said *"About 2h 30m left today."*
on every ordinary offer, computed from the clock and the person's own day
boundary, and it has been there since V2 stage 5 under the name **the one
permitted number**.

The fact is not removed from the app. **The remainder of the day lives on the
header clock**, where it already lived, spoken by `remainderWords` — and the
header clock is **opt-in**.

`timeLeftWords` is deleted from `src/duration.ts` rather than left exported for
a future caller. `remainderWords` in `src/clock.ts` is untouched.

**The rule this establishes, in one line: nothing on the offer card states a
number that changes without anybody doing anything.** Pressure, decay and
approach are still spoken — in words, as facts about the work.

## Why

### The card already forbade this, for the line directly beneath it

`nextFixedWords` names the next unmoveable thing today and is **forbidden by
test from carrying any number at all**. Its own reasoning, in `src/clock.ts`:

> A countdown is a deadline rendered continuously, and a shrinking number
> against an aversive thing adds aversion at the moment of approach.

`#nextup-left` sat three lines above it, carrying a number that shrinks every
minute. Two lines on one card, one rule, applied to one of them.

### The clock is opt-in on exactly this reasoning, and the card was not

The header clock is off until asked for. The reason is in `src/ui/about.ts`,
written when it was built:

> Chrome that arrives switched on has made a decision about somebody's screen
> that it was not asked to make — and a clock is the most charged piece of
> chrome there is, because half the point of this app is that a day is not a
> countdown.

The same arithmetic was on the offer card **for everybody, with no way to
decline it**, and no paragraph anywhere said why it was affordable there. The
two surfaces were not weighed against each other; the card line was simply
never brought to the argument the clock lost.

### With the clock on, the app said it twice

There is no coordination between the two. Switch the clock on and the same
remainder renders in the header *and* on the card, in two different phrasings —
"5 hours 20 minutes left" and "About 5h 20m left today." That is the defect
ADR-0102 was written about, at line granularity instead of block granularity.

### The line's own defence needed a second half that never shipped

The defence in the source was that the number is **prospective** — a fit
judgement made before an attempt, where it can still change what somebody picks
up. That is a real and good argument, and it requires knowing how long the
offered thing takes.

**The card does not say how long anything takes.** `rangeWords` — the two ends
of the person's own history, never an average — renders in the **detail sheet**
and nowhere else. V2 stage 5 shipped a pair that never met: *how long things
take* behind a door, *how much of today is left* on the card.

A remainder with nothing to measure against is not a fit judgement. It is a
countdown.

### The research puts this fact on the clock, by name

`docs/nd-collisions.md` entry 9 (waiting mode) names the mechanism and the
surface in the same sentence:

> The honest half, and it ships: **the header clock** states how much of the
> local day is left and how many open things are dated today — a count, never a
> list.

The app's own plain-language inventory agrees: `src/plain.ts` describes `#clock`
as *"a clock face, the time, and how much of today is left"*.

### "Just one thing" had already decided this, and stopped one surface short

The mode that strips the card for the worst day **already stripped this line**,
with the reasoning that on that day every hour costs most. Nothing in the repo
ever argued the other half — why the number is affordable on an ordinary day.
There is no property distinguishing the two surfaces: if the reason to strip it
is that a shrinking day is pressure, that is not a fact about capacity.

### And the card is the answer to a long list

Collisions entry 1: *a long list raises the activation threshold of every item
on it.* The offer card is this app's answer to that entry. Every line on it that
is not helping somebody start is a list item wearing a card's clothes.

## What this does not do

- **It does not remove the fact.** Somebody who wants a running remainder
  switches the clock on and has one, in the place designed for it.
- **It does not touch pressure, decay or approach.** Those are spoken in words
  as facts about the work (`approachOf`, `pressureWords`), they do not shrink on
  a timer, and ADR-0010's gradient is unaffected.
- **It does not make the card's remaining lines exempt.** `#nextup-count` states
  how many things are behind the offer; that number changes when somebody
  changes something, which is the distinction this record draws.
- **It does not add duration to the card.** Pairing the remainder with
  `rangeWords` would answer the fit argument and would make the card longer,
  which entry 1 forbids. The detail sheet is where a decision about one specific
  thing is made, and the range is already there.

## How it is held

- **`test/duration.test.ts`** asserts `src/duration.ts` exports no day-remainder
  projection, and that `remainderWords` still exists — so the fact cannot be
  deleted by the same edit that removes the line. Watched red on a plant that
  restored the export, green after.
- **`tools/plain.mjs`** already requires every element of the card to declare
  whether it survives *Just one thing*, in both directions: a rule naming an
  element that is not there is a failure, so the declaration could not be left
  behind.
- **`tools/smoke.mjs`** asserts on the built app that nothing on the card says
  how much of today is left, and then switches the clock on and reads the
  remainder there.
