# ADR-0097 · The offer reads the interest you already gave it

**Status:** Accepted · **Date:** 2026-08-17 · **Shipped:** 2.7.0 · **Closes:** Q-11 · **Routed by:** `docs/nd-collisions.md` entry 5 · **Extends:** ADR-0029, ADR-0030

## Decision

Inside the `ready` tier — and **only** there — the offer's tie-break becomes the
heat the reader already set: **hot, then unsaid, then cold**, then creation order
as before. The card states the warrant: *"this one is waiting, and you said it
was hot."*

Nothing else about the ranking changes.

## Why, and who decided it

**The research decided it. Not the owner, and not a session's taste.**

`docs/nd-collisions.md` **entry 5 — interest-based motivation** already routed
this, and had done for weeks:

> *"The heat pass is a two-tap interest read (`heat.set`, ADR-0029) … But the
> azimuth check found that nothing about interest reaches `nextUp` — everything
> ranks on when."*
>
> *"**ROUTING PROPOSAL** — later, explicitly gated on Q-11 and Q-12. The natural
> mechanism — heat informing which candidate fills the offer's `ready` slot — is
> a ranking change, and NOTES.md's own rule stands: do not build past Q-11 on a
> guess."*

The gate was Q-11, and Q-11's ranking reading is now **established by
measurement** (ADR-0095): every tier of `nextup.ts` is temporal, and the only
tie-break inside a tier is pressure and then creation order. That is what a
guess was needed for, and it is no longer a guess. The gate is discharged.

Verified in the code before building: `heat` is written by the heat pass, folded,
and carried through snapshots — and read by **nothing except the flow that
collects it**. `nextup.ts` contained no reference to it. The reader answers *hot
or cold* on every item they triage, and the surface that decides what to hand
them next had never once looked.

That is this repo's own recorded sin — a field collected and discarded, the same
shape as `menu.item.added`'s category, `save-for.updated`, the whole re-entry
vocabulary, and `project.role.set`, each of which sat unread until somebody
noticed.

## What the research REFUSES, which is the more important half

The obvious alternative was to rank on *importance* — to make **serves a
horizon** outrank **serves nothing**, using the lineage ADR-0095 had just built.
That was drafted, and it was going to be put to the owner as a policy question.

**Entry 5 forbids it outright:**

> *"Activation follows Interest, Novelty, Challenge, Urgency, and Passion, not
> importance or consequence. A task can be acknowledged as critical and still
> produce nothing … The Eisenhower quadrant assumes importance activates — its
> entire top row is a dead letter for this nervous system."*

An importance rank is precisely the Eisenhower top row. Building it would have
been the app asserting that a thing filed under a goal is more startable than a
loose note, which is the mismatch this product exists to stop moralising about.
**The question did not need the owner's ruling. It needed the catalogue read.**

Three more refusals bind this release, each with its evidence grade:

- **Entry 12 (novelty decay, *moderate*)** — *refuse manufactured novelty*. So
  the frozen offer is **not** fixed by rotating or randomising. A test pins that
  the same store gives the same answer every time; determinism is also what makes
  an offer refusable on grounds.
- **Entry 13 (urgency addiction, *community*)** — never fabricate urgency, keep
  the true signal legible. So this **cannot cross tiers**: a real date still
  outranks everything, and a test pins that a cold thing with a date beats a hot
  thing that is merely waiting.
- **Entry 16 (choice overload, *contested*)** — the cap of two stands on the
  activation cost of comparison. So the offer is **not** widened.

## Vocabulary, never a rank

Entry 5's own binding, because INCUP is **community-grade** evidence:

> *"Treat it as vocabulary, never as a rank."*

Three things honour it:

- **It is a two-state fact the reader stated**, not a computed score. Nothing
  accumulates, nothing is tallied, nothing decays.
- **It breaks a tie inside one tier.** It does not reorder tiers, weight
  anything, or combine with pressure.
- **The card says it.** An interest read that silently reorders the offer without
  saying so *is* a hidden rank. The words report what the reader said and claim
  nothing about importance — asserted by a test that the copy contains no
  "important", "priority" or "matters".

## Why unsaid sits in the middle

Hot, then **unsaid**, then cold.

Putting unsaid last would make skipping the heat pass a penalty, and ADR-0029
declares the pass optional-first — a claim that took until 1.31.0 to actually
become true. Putting unsaid first would make answering *cold* a penalty instead,
which teaches people to lie to their own planner.

In the middle, answering can only move a thing away from where not answering
leaves it, in the direction the answer points. Neither answering nor declining to
costs anything.

## Consequences

- **`cold` is never excluded.** A cold thing still comes back, still counts in
  the gauge, and still fills the offer when it is all there is. Hiding it would be
  an archive with a friendlier name, which law 3 forbids.
- **Q-12 is untouched.** *"Not this"* still records nothing. This reads a signal
  the reader gave deliberately, in a flow that asks; it does not learn from
  declines, which is the trade Q-12 is about and which stays open.
- **No new event, no new field, no new control, no new surface.** It reads
  `heat.set`, which has been in the vocabulary since Phase 2.
- Law 5 and law 7 hold: nothing is scored, nothing is inferred about the reader,
  and the app states what they told it rather than an opinion it formed.

## What would overturn it

The heat pass being answered so rarely that the tie-break is inert in practice —
in which case the finding is about the pass, not about the ranking, and the work
moves to entry 1's territory rather than here.

Or a reader reporting that hot work crowding the front of `ready` makes the tier
feel like a to-do list of enthusiasms while ordinary obligations sink. The
remedy would be to alternate rather than to sort, and it would need its own
record.
