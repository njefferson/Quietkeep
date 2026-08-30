# ADR-0120 · The total is the way to the rest

**Status:** Accepted · **Date:** 2026-08-30 · **Extends:**
[ADR-0117](0117-staleness-comes-to-you-or-it-is-not-a-finding.md), which named
this cost and did not pay it.

## The question

Review shows at most three findings and states the total — *"15 things need a
look. These 3 first."* The cap is law 8: a wall of exceptions is the pile this
app exists to stand between you and.

But the three are taken off the top of a **ranked** list of five classes, and
nothing anywhere in the app reached the rest. The total was a `<p>`. So the
lowest-ranked class was not *later*, it was **unreachable** — and 3.14.0's quiet
lines is fourth of five, so on any store carrying three structural breaks the
class added to make staleness come to you never arrived at all.

Hub LESSONS 187, written the same week from another app, names the shape: a cap
applied after a merge, where the row a feature exists to produce is the one the
cap is guaranteed to drop. Its fix is explicitly *not* a bigger cap.

## Decision

**`#review-count` is a button, and it opens the whole list.** The cap stays at
three and the surface is unchanged: three findings greet you, in rank order, as
before. What changes is that the sentence saying there are more is the way to
them.

This is not a bigger cap. The trickle law 8 protects is about what a reader
meets without asking, and that is untouched. What is removed is a property
nobody chose: that a class could be permanently invisible on a store that had
enough of everything above it.

**A door only while there is something behind it.** When the three shown are all
of them, the number is still stated but the control is disabled and unstyled —
opening a list identical to the one on screen is a door onto the room you are
standing in, and inert chrome the rest of the time is what ADR-0116's emergence
rule refuses.

**One row builder, two lists**, and one projection painting both. A second
builder is how the surface and the sheet would come to disagree about what a
finding looks like; a second `reviewExceptions` call is how they would disagree
across a midnight boundary, since `quietAreas` reads the clock. `today.ts`
already states this rule about what matters today.

## What this does not do

No grouping by class in the whole list — the ranking already orders it, and a
heading per class turns five findings into a taxonomy of five kinds. No count
per class, for the reason `roleLoads` gives one axis over: a number beside a
category name is read as a score. No change to `REVIEW_CAP`, no re-ranking, and
no filter.

## What was considered and refused

**Raising the cap.** The lesson this record answers says in as many words that
the fix is not a bigger cap, and law 8 is the reason it exists.

**Re-ranking quiet lines above stalled containers.** A container with no next
action is the most expensive silent failure a planner has — it looks fine on
every surface and nothing happens. It outranks a stale line on merit, and moving
it to make a newer feature visible would be ranking by recency of authorship.

**One row per class before any class gets a second.** With five classes and a
cap of three this reaches the fourth class only by raising the cap to five,
which is the refused option wearing a different name.

## What would overturn this

A reader who opens the whole list once and never again, while the three on the
surface keep answering. That would say the cap was right and the unreachability
never mattered — and the remedy would be removing the door, not the cap.
