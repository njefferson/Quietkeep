# ADR-0012 · A passed clock becomes a live replan card, never an archive row

**Status:** Accepted · **Date:** 2026-07-27

## Decision

**There is no past bucket.** No "missed", no "overdue list", no archive of things
that slipped.

A passed date **auto-converts to a present replan card** with its context already
assembled: what it fed, the suspense, days left, and options —
**compress / escalate / renegotiate**. Resolving it is a decision, and the
decision is recorded.

## Why

A list of things you failed to do is a shame surface, and this audience has
usually got one already. Worse, it is *useless*: by the time an item is on it,
the question "should I still do this, and by when?" has become urgent, and a
bucket answers neither half.

The replan card answers both, and it does it at the only moment the user is
actually thinking about the item. Assembling the context — *what it fed*, *what
the suspense is*, *how many days are left* — is the expensive part, and it is
exactly the part someone with temporal myopia cannot reconstruct on demand.
Handing them a bare row labelled "3 days late" asks them to do the impossible
part themselves.

The three options are deliberately **all forward-facing**. There is no "mark as
missed", because that is filing, not deciding, and filing is what produces the
bucket this ADR forbids.

## Consequences

- A replan is not a stored state that must be swept — it is a **computed
  consequence** of a clock and a current time, so it cannot be missed and cannot
  go stale.
  > **Refined by [ADR-0034](0034-replan-cards-are-computed.md).** This bullet
  > originally opened "the fold generates `replan.raised` when a clock passes",
  > which contradicts the rest of its own sentence: `fold` is pure and has no
  > clock, so it cannot notice that a date passed, and giving it one would make
  > the same log fold to different states at different moments — stale by
  > definition. The computed reading is the one that holds; nothing emits
  > `replan.raised`. ADR-0034 also records which clocks raise a card at all.
- `replan.resolved` is gated by [ADR-0011](0011-no-silent-nodes-gate.md): the
  chosen option must itself set a clock or land the item on the Menu. There is
  no resolution that produces silence.
- **Dropping to the Menu is a legitimate, unremarkable resolution.** "I am not
  doing this now" needs a home that is not a failure state — that is what the
  Menu is for (law 6). It must be as easy to reach as the other two, and worded
  with no more friction.
- Replan cards must be **capped on the surface**. Returning after two weeks away
  could raise many at once, and law 8 bounds what re-entry may show — at most
  three triage items. The rest wait; they are not lost, and the gauge proves it.
- `node.trashed` remains available and is a *different* thing: an explicit
  decision that something is not a thing. That is a decision, not a lapse.
- **A sixth resolution, `undate`, and a bulk gesture, added 2026-08-28 (3.9.0).**
  The five options all asked for a fresh decision about the WORK — make it
  smaller, hand it over, renegotiate it, name a new day, or put it down — and
  none of them said the honest thing about a day that got away from somebody,
  which is that the commitment is unchanged and only the date is wrong. So the
  way out of a passed date was either to schedule it again, which is what had
  just failed, or the Menu, where it makes no demand and does not come back on
  its own. `undate` retires every passed clock and sets a `review` for today: the
  item returns to the ordinary run of things, ranked like anything else, with no
  date to meet. The Menu stays last by position and equal in weight.
- **And the bulk gesture is no longer gated behind a lapse.** The amnesty
  (ADR-0043) resolved every passed date in one act and required seven days away
  to reach. What it removes is not work, it is *the block of decisions standing
  between somebody and any work at all* — and that block forms after one missed
  day in the same shape, only smaller. It is offered wherever the cards are,
  whenever more than one date has gone by, leading with `undate`; the amnesty
  keeps `to-menu`, which is the right answer after a fortnight and too strong
  after a day. Both remain available in both places, and the per-card options are
  untouched beside them — a bulk route that replaced them would be the
  choice-removing shape reactance research says produces the resistance this
  whole surface exists to avoid.

## What would overturn it

Nothing. This is product law 3.
