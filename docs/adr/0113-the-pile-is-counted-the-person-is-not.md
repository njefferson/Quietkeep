# ADR-0113 · The pile is counted; the person is not

**Status:** Accepted · **Date:** 2026-08-29
**Amends:** [ADR-0044](0044-sort-mode-and-named-ranges.md), which forbade every
number while sorting. **Extends:** [ADR-0085](0085-sorting-is-not-the-corridor.md),
which took the total off the arrival screen and stands unchanged.

## What was asked for, and why the existing answer failed

Reported from use: inside the sorting surface there is no way to tell whether
this is the second card of thirty or the last one. A count was wanted — worded
as *how many there are for somebody who wants to work through them*, rather than
a list of unprocessed things somebody feels compelled to resolve.

The obvious answer was already in the repo. `src/ui/sort.ts` states a range's
true total **once, at entry** — "240 things, oldest first" — and ADR-0044 calls
that the purge precedent. Proposing the same for the daily surface was refused,
in one sentence that is better than the reasoning it overturned:

**how would I know how many are left after getting distracted and looking back
at the screen.**

A number stated once serves a reader who does not look away. That is not the
reader this product is for. Losing the thread mid-pile and returning to the
screen is the ordinary case here, not the exception, and it is the moment the
answer is most wanted — so the answer has to still be on the screen. An entry
statement is a design for somebody else's attention.

## The distinction the record had never drawn

ADR-0044 forbids "no tally, no remaining count, no percentage, no bar", and calls
a per-sitting counter "a score with a different name (law 5)". That is right
about every instrument it lists and it never separated two different things.

**Progress arithmetic measures the person.** "19 of 240", "3/240", "5 left",
"3 to go", a percentage, a filled bar — each says how far through somebody is.
Each invites a verdict, and each turns a pile into a course with an end you are
behind on. That is the snowball this product exists to refuse: the reason a
missed day must not become a new list to sort.

**A count of what is present measures the pile.** *Twenty here to work through*
says nothing about what was done. It has no denominator, so it cannot be a
fraction of anything. It falls because the shelf empties, not because anybody is
being scored — and it reads the way a shelf reads.

The instrument that was banned and the instrument that was wanted are not the
same instrument. Everything ADR-0044 lists stays banned.

## Decision

- **The sorting room states how many are in the pile, standing, painted on every
  repaint** so it is current whenever somebody looks back at it.
- **It appears only once there is a card in front of you.** It is `hidden` in the
  door state — the arrival screen — on the same condition as `#triage-card`, one
  line apart in `src/ui/clarify.ts`. ADR-0085 removed a total *standing on the
  screen you arrive at*; that surface is untouched, and this is why.
- **It is a bare inventory and never a fraction.** No "of", no "left", no "to
  go", no percentage, no bar. The smoke walk holds it to the same regex that
  guards sort mode's interior.
- **It is its own element**, not the gauge. `#triage-gauge` keeps ADR-0085's
  sentence, its exact-string assertion and its no-digit prohibition, all
  unchanged.
- The two boundary landmarks (3.9.3) stay on the gauge. They answer *have I seen
  this one before*; this answers *how much is here*.

## What this does not license

Nothing on the arrival screen, ever. Nothing on a door. No count of what was
sorted, this sitting or any other. No count on the offer card
([ADR-0103](0103-the-card-states-no-moving-number.md)), and no count of what was
passed over — `passed` stays in memory and unwritten, because a durable record of
what somebody could not face is the wall rebuilt one layer down.

## What would overturn this

Evidence that a standing count of the pile is read as a debt rather than as
material — that somebody returning to it feels behind rather than oriented. The
remedy would be to change what the number counts, not to take the answer away
again: an inventory that reads as a verdict is the wrong inventory, and going
back to silence would restore the defect this closes.

## Sort mode is now inconsistent, deliberately unreconciled

`src/ui/sort.ts` still states its total once at entry, and the argument above
applies there too — a reader who loses the thread in a 240-row range has the same
problem and no answer. That is a separate change to a separate surface and it is
not made here. Recorded so it is a decision rather than an oversight.
