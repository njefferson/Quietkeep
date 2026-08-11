# ADR-0086 · A thing is a task the moment it exists

**Status:** Accepted · **Date:** 2026-08-10 · **Shipped:** 2.0.0
**Refines:** [ADR-0030](0030-work-mode.md), whose recorded reason is answered
below. **Follows:** [ADR-0084](0084-the-guarantee-is-the-product.md),
[ADR-0085](0085-sorting-is-not-the-corridor.md), and
[`docs/what-it-should-be.md`](../what-it-should-be.md), which is the design this
implements and was written from the requirement with the source closed.

## Decision

**Anything captured is offered as work immediately, in the words it was written
in. Refinement changes when and where it comes back; it never decides whether.**

Concretely, in `src/nextup.ts`:

- `isCandidate` no longer excludes `captured && route === null`.
- A seventh reason joins the closed vocabulary: `unsorted`, whose words are
  *"you put this down"* — a fact about the world, never about the person, and
  never a count.
- Its tier is tested before `ready` so the LABEL is right, and it ranks **fifth**
  so the ORDER is right: behind a hard date, an unblocked antecedent, a resume
  card, pressure, and an arrived clock. Within the tier, arrival order.

## The reason this reverses, stated fairly

ADR-0030 recorded the exclusion with a reason, and it deserves answering rather
than deleting:

> **Nothing that belongs to another surface is offered as work.** An unrouted
> capture belongs to triage — offering it here asks the same question twice in a
> surface whose promise is that it has already decided.

That holds only if offering an unrouted item means **asking the routing question
about it**. It does not. Offering it means handing back the words somebody typed,
with *Done* and *Not this*; the routing question is not asked at all. And this
surface's promise is that it decided **what to show you**, not that every item
has been classified — handing back *buy milk* in arrival order is the surface
deciding.

The premise smuggled in was that an unclassified item can only be *presented as a
classification decision*. That is inherited from what planners look like, and it
was examined and passed through rather than missed — which is worse than an
oversight, because the record then reads as evidence the question was settled.

## Why it mattered enough to reverse

The guarantee the code enforced was *every node carries a clock*. The guarantee a
reader reads is *it will come back to me as something I can act on*. Those agree
everywhere except on the app's widest path in.

A capture was clocked in the same transaction by `cureFor`, so it satisfied law 1,
appeared as covered in 1.42.0's proof, and was **excluded from the offer surface**.
It came back only as more sorting. For the reader that is the promise failing,
silently, with a green badge over it — the same defect this repo already named as
*a clock nobody reads is silence with paperwork*, one level up: **a covered item
nobody will ever be offered is coverage with paperwork.**

It also made "sorting is optional" false in practice. Skipping it did not cost
precision; it cost the item ever being offered at all.

## What had to change with it, and what did not

- **Removing the exclusion alone does nothing**, which is worth recording because
  it would have shipped as a no-op. An unrouted capture's only clock is the
  gate's same-day cure; `arrivedClock` refuses to read a cure as a demand; and it
  has no pressure because it has never been done. So it fell past every tier and
  out of the bottom of the loop — covered, counted, still never offered. **The
  exclusion was load-bearing twice**, and the second half needed its own tier.
- **The queue cap is what makes this safe.** The offer is one thing at a time and
  the list caps at five (ADR-0030), and unsorted items rank behind everything
  with a real warrant — so forty captured lines cost a few *Not this*, never a
  wall. That was the objection to offering them at all.
- **`unsorted` is decided by STATE, not by clock source.** Testing `captured &&
  route === null` rather than inferring it from the cure keeps this tier
  independent of how `isAppClock` classifies things (classified in
  [ADR-0087](0087-a-cure-is-not-somebody-asking.md), 2.0.1) instead of hostage to it.
- **Nothing about sorting was removed.** Same six routes, same optional hot/cold
  sweep, same inbox. It stopped being the price of an item existing.

## Consequences

- The inbox, the forced-choice card, the hot/cold pass and the arrival corridor
  are all downstream of the gate that just went. Each now has to justify itself
  on its own terms; 2.0.2 moved the offer above the sorting door as the first
  instalment of that.
- `test/nextup.test.ts` holds it, and one existing test was **split** rather than
  edited: it had bundled five unrelated exclusions into a single assertion, so it
  would go green while any subset held and could never say which had moved. Four
  still hold; the fifth is this decision.
- The smoke walk proves it end to end in its own context and store: capture one
  thing, never sort it, and it is offered as work with the right words, still
  unsorted, with no forced choice raised, and doable without a route.

## What would overturn it

- **If the offer becomes noise in a real store.** The cap and the ranking are the
  defence; if a large unsorted backlog still drowns the surface for somebody
  using it daily, the answer is a better rank within the tier — never a return to
  gating existence on classification.
- **If "you put this down" reads as a reproach** to anybody. It is meant as the
  smallest true fact there is. If it lands as *and you never dealt with it*, the
  words change; the decision does not.
