# ADR-0125 · The proof of judgement — law 4's analogue of the coverage gauge

**Status:** Accepted · **Date:** 2026-09-03 · **Extends:** ADR-0011 (the
no-silent-nodes gate), ADR-0013 (levels push down), ADR-0099 (the proof where
somebody can read it) · **Closes the standing half of:** Q-11 in
[`NOTES.md`](../../NOTES.md).

## The asymmetry

Law 1 has a visible proof. The gauge stands on the landing surface, says
nothing has gone quiet, and opens the list of every held thing and the date it
comes back. `coverageProof` states why it is shaped that way rather than as a
reassuring number: a reason is checkable, and *the condition being addressed is
precisely not being able to trust an assurance from the inside*.

**Law 4 had none.** Nothing said that what is being SHOWN is right, so the only
way to check the offer was to read the whole store — which is the reviewing
this app exists to remove, not something it should require. `NOTES.md` names
the asymmetry in terms: the app can demonstrate its integrity and cannot
demonstrate its judgement, and the law-4 analogue of the coverage gauge is the
single highest-value thing to build. It was gated on Q-11 — *no feeling of
being shown the right things* — saying whether the cause was ranking or trust.
Q-11 closed on the **ranking** half on 2026-08-17 (ADR-0097, and ADR-0095's
measurement before it). The **trust** half stood, and its gate had discharged.

## Decision

**A second proof beside the first, in the same idiom and to the same standard.**
`judgementProof` (`src/assurance.ts`) states where everything is: a fact line
under the gauge — *everything accounted for · N in front of you* — and a door
onto the thing it claims, so the claim can be checked and disagreed with.

**The places ARE `heldGroups`' groups, in its words and its order.** Not a
second vocabulary and not a second computation — the rule `whyCovered` already
follows about `isSilent`'s clauses, applied one law over. The proof and the
held list cannot describe one item differently because there is only one
definition of where a thing is.

**It is total, and `holds` can be false.** The counts sum to `heldWork`, which
is the gate's own set. `heldGroups` is total over that set by construction, so
the sum can only fail on the day the construction fails — which is exactly when
somebody needs telling rather than reassuring. The words for that case say the
fault is the app's.

**It names what it cannot account for.** The review exceptions — a goal with
nothing feeding it, a node whose parent is gone, a quiet area, a line that has
gone still — are computed in `review.ts` and reach no other surfacing layer,
which `NOTES.md` records. They are listed at the foot, each a door onto the
thing itself. A claim with no failure mode is asking for the faith the reader
does not have.

## Refused

Any rank, score, grade, badge, colour escalation, or ordering by importance,
stakes or return — `docs/nd-collisions.md` entry 5 refuses an importance rank
in terms, and Q-11 carries the argument that a loose capture is very often the
most important thing in the store. Any inference about what matters to the
reader (law 7). Any claim that the state is *good*; the proof states where
things are and the reader decides. Any second ordering of the places — the
order is the held list's, which is a reading order and not a ranking.

## What would overturn it

Evidence that a standing claim about coverage is itself read as a demand, or
that the sheet becomes a surface people tend rather than consult — the
system-tending failure `docs/nd-collisions.md` records. Either would mean the
instrument had become the work.

## Held by

`test/assurance.test.ts` — totality against `heldWork`; the places identical to
`heldGroups` in key, order, words and count; the work-surface subset; the named
gap and its silence when empty; word hygiene; purity. And the walk, which
presses the landing line, reads the claim, sums the counts on the sheet and
refuses a ranking word in either theme.
