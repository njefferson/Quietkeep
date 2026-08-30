# ADR-0102 · The inventory arrives folded, and the landing surface stops being a list

**Status:** Accepted · **Date:** 2026-08-19 · **Extends:** ADR-0032, ADR-0099 · **Narrows:** ADR-0083, ADR-0088

## Decision

**What you are holding** keeps everything it has and stops standing open. Its
body is a disclosure, closed on arrival, whose summary names every group that
has anything in it — in the order ADR-0032 fixed — and carries **no counts**.
Opening it is one press, in place, and the choice is remembered per device in
the kv store beside the lens and the where-now, never in the log.

Nothing is removed, nothing moves, no group is dropped, and no route changes.
Totality is untouched: every held node is still in exactly one group, and the
groups still sum to `heldNodes(state).length`.

## The measurement

At 390px on the thirteen-item sample, with the whole page rendered rather than
the first screen:

- The runway is **4,247px** — a little over five screens.
- `#held` is **2,387px of it. Fifty-six per cent of the landing surface is one
  list.**
- **Seven items appear on it twice or three times.** The offer card's head, its
  two also-available rows, the replan card and the with-someone card are all
  also rows in the inventory below.
- Two of those repeats carry **different acts on the same thing**: *Put the
  recycling out for collection* offers **Not this one** in *Needs a new plan*
  and **Work on this · Done** in the inventory, two screens apart.

## Why

**The research says it, and has since it was written.** Collisions entry 1, on
task initiation: *"A long list raises the activation threshold of every item on
it."* The app's stated answer to that entry is the single computed Next-up card
— and the list it exists to stand between somebody and their work is directly
beneath it, holding the same things again. The card was doing its job on top of
the pile rather than instead of it.

**This is not the fold ADR-0083 and ADR-0088 refused, and the difference is
load-bearing.** Their finding was general and correct: *"the fold changes how
much stands in front of you and not how far you have to travel, and travel is
what was expensive."* It was derived from SIBLING folds in the middle of a
surface — open group A and groups B through Z are pushed out of reach, so the
travel is unchanged and merely rearranged.

`#held` is the LAST block on the runway; nothing follows it but the footer. For
a trailing block, *how much stands in front of you* and *how far you have to
travel* are *the same quantity*. Closing it does not rearrange 2,387px, it
removes them. Opening it restores exactly today's page, with nothing displaced,
because there is nothing after it to displace.

**And a fold is not a switch.** Collisions entry 6 — monotropism, and inertia at
both ends of a task — says a forced transition can cost the day's capacity, and
ADR-0099 left *scroll versus switch* as the open question that cannot be settled
from a chair. That question is not asked here: a disclosure opens in place, on
the same surface, with focus where it was and no modal. This is why the
inventory does not become a sheet, which is what ADR-0088's own precedent would
otherwise suggest — a sheet would take the trade ADR-0099 said nobody may take
from a chair.

**The reassurance already lives above, on purpose.** The proof line — *nothing
here has gone quiet* — came to the top of the page in 2.8.1 (ADR-0099) precisely
because the one sentence answering *is it all still there* had been readable
only by somebody who had already scrolled to the list it was reassuring them
about. That sentence still stands under capture. The inventory below is the
EVIDENCE for it, and evidence has to be complete when you reach it, not
permanently unrolled in front of you.

**No counts on the summary, and that is a rule rather than a nicety.** ADR-0032:
*"Groups are headings, not counts of things undone. There is no tally."*
ADR-0060 retired *"8 things are asking"* and stated where the honest totals
belong: *"The honest totals already have a home three lines up the same page —
the coverage gauge states what is held, what is ready now, and that nothing is
silent. Saying it twice, the second time as a demand, buys nothing, and the
second time is the one that reads as a backlog."* A folded list captioned with
numbers would be that backlog headline, rebuilt, on the surface both ADRs
cleared it off.

So the summary names the groups that have something in them and says nothing
about how many. The names are the promise: *Not sorted yet, Needs a new plan,
Ready now, Coming up, Later, On the Menu, Done* is a complete account of where
everything is, and where a thing IS is the fact this surface exists to state.

**Remembered, because asking twice is a demand.** Somebody who wants the list
open should not have to say so on every load; a preference re-asked every visit
is the app arguing with an answer it already has. It is a view preference and it
lives where the lens and the where-now live — the kv store, never the log
(ADR-0026's line between what is a fact about your things and what is a fact
about this device).

## Consequences

- The landing surface, on the same sample, is expected to fall from 4,247px to
  roughly 1,900px — under two and a half screens. The number is asserted after
  the change rather than predicted here.
- The visible repetition goes with it. The specialised views — the offer, the
  replan card, the with-someone card — stay exactly where they are, and the
  inventory that repeats them is folded until asked for. Opening it shows them
  again, which is correct: that is the complete list, and you asked.
- `#to-held` and the gauge's last clause — *see each* when this was written,
  *what comes back, and when* since 3.9.2 — still land on the same section. A jump
  to a folded block must OPEN it, or the route lands on a heading and reports
  success — the same false receipt shape this repo keeps finding.
- The a11y walk gains the folded state as its own audited state, in the same
  commit, or it ships unmeasured (hub LESSONS §28).

## What would overturn this

- **Evidence from use that the fold costs more than the length did** — that
  opening it every visit is worse than scrolling past it was. The answer would
  be defaulting it open with the preference kept, not deleting the fold.
- **Any sign that folded reads as gone.** The promise is law 1's, and if a
  folded inventory makes somebody doubt the app is still holding things, the
  fold loses regardless of what it saves. The proof line and the gauge are the
  guard, and they are above it.
- **Not by "the list is useful."** It is, and it is one press away, complete,
  with every group named on the way in.
