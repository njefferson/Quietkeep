# ADR-0084 · The guarantee is the product, and it has to be openable

**Status:** Accepted · **Date:** 2026-08-10

## The gap this closes

`NOTES.md` states the thesis and the app does not implement it.

*"Out of sight, out of mind"* has been read here as **nothing is in mind**. That
is wrong. You are always thinking of something — the failure is that **you cannot
trust it is the right something, because you do not know what you are not
thinking of.** The anxiety is not forgetting. It is that your coverage is
unverifiable from the inside.

Capture cannot fix that: it relieves *this* item. A list cannot fix it: it shows
what is *in* it, never what is missing. **Only a guarantee about the container
helps, and it must be checkable cheaply, at any moment.**

What got built instead was a filing cabinet with a badge on it. The badge reads
*"nothing here has gone quiet"*. It is true, it is computed honestly, and **it
cannot be opened.** You cannot ask it how it knows. A claim you cannot
interrogate is exactly the thing this audience cannot rest on — the whole
condition being addressed is *not being able to trust an assurance from the
inside*, and the app answers it with an assurance from the inside.

Everything shipped in 1.39 and 1.40 made the filing cabinet easier to walk
around. None of it touched this.

## Decision

**The guarantee is a surface you can open, and it names its own exceptions.**

Three properties, and all three are required or it is a badge again:

1. **It states the promise in one sentence** — everything you have given it will
   come back to you.
2. **It shows HOW it knows**, as the small closed set of reasons a thing is
   covered, each with a count. Not a list of items: a list of *reasons*. The
   reader is checking the container, not reading the contents.
3. **It can say NO.** Anything the app cannot guarantee is named, with what is
   wrong and one way to fix it. **A guarantee with no failure mode is not
   checkable**, and an app that can only ever say "fine" is asking for exactly
   the faith the reader does not have.

The machinery already exists — `silentNodes` and `isSilent` in `gate.ts` compute
this per node and have since law 1 was given teeth. What has never existed is a
way for a person to *see* it.

## What follows from it, and is not built here

Recorded so the next session does not treat this ADR as finished:

- **Capture covers; sorting is optional and never the corridor.** The gate
  already cures a capture in the same transaction, so an item is safe the instant
  it is written. The UI still drives from capture into an eight-way decision,
  which is the thing `docs/planning-for-humans.md` says stops the dumping. The
  clarify surface should be somewhere you go, not somewhere you are sent.
- **The main screen answers one question and shows one proof.** What now, and am
  I covered. Not an inbox.

## Why not just keep the number

Because a count is the wrong shape. `0 silent` is unfalsifiable to a reader: it
looks identical whether the app is watching everything or watching nothing, and
the failure mode this repo already found — *a clock nobody reads is silence with
paperwork* — produced a green gauge for weeks. A reason, with a count under it,
is checkable: a reader who has forty things and sees them accounted for under
four reasons can tell whether the reasons cover what they actually put in.

## What would overturn it

- **If opening it is never done.** The proof exists to be checkable at any
  moment; if the honest report is that nobody opens it, then the guarantee is not
  what makes the app trustworthy and this is the wrong spine.
- **If the reason vocabulary grows past what fits in one look.** Four or five
  reasons is a proof; twelve is another list, and the answer would be fewer
  reasons rather than a longer surface.
