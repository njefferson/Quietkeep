# ADR-0121 · An arrangement can say where it stands

**Status:** Accepted · **Date:** 2026-08-31 · **Extends:** ADR-0074
(arrangements) · **Built on:** [`docs/nd-collisions.md`](../nd-collisions.md)
entries 30 and 31.

## The question

A whole class of what somebody carries at work is not a task and never becomes
one, and it is not an arrangement in the binary sense either. A post that cannot
be advertised until it is released. A promotion filled temporarily, expiring on
a date. A position out to advert now. A departure whose replacement cannot be
sought yet, with work redirected in the meantime.

None of these is *done*. Each has a **state** the app cannot know, and a
**condition** that will change it without anybody acting.

The app had the right noun already and it was one field short. `arrangement`
names *the thing that is supposed to run without you*, whose failure mode is
silence, held by asking *when did I last confirm this is still happening?* But
it is **binary** — still running, or worth confirming — which is the whole
answer for a standing order and none of it for any of the above.

## Decision

**Two fields on the shape that exists, not a kind that does not.**
`STANDS_FIELD` and `CHANGES_FIELD`, both riding `node.field.set`, which the
closed vocabulary already has — so `docs/event-vocabulary.md` does not open.
ADR-0042's reasoning applies unchanged: an arrangement decays, completes,
renders as a card and can be turned off, and every projection already handles
all four.

**The second field is the one that earns the feature.** Prospective memory
reaches an intention two ways: a distinctive cue arrives and brings it with it,
at little ongoing cost; or you MONITOR — hold a readiness to notice, and keep
checking, while doing something else. A change in the world has no cue to walk
past, so only the second route exists. Monitoring is *"attentionally demanding
and therefore induces a cost to the ongoing task"* and is rationed by context
(entry 30, read from the primary; graded Strong for the cost, Contested for its
decomposition, since that paper's own second experiment found little support for
the two-process split). **A condition that could change on any day supplies no
context to ration by**, so it is paid continuously or dropped. Writing it down
offloads the *watching*, which is a larger saving than offloading a task.

**Free text, never an enumeration.** The app cannot know the reader's
organisation and law 7 keeps it out of adjudicating one. Cleaned by `cleanNote`
and not a cleaner of its own — ADR-0047's rule that two cleaners is how one file
comes to import differently from how it types.

**A date that changes it is a clock.** The expiring temporary promotion needs no
third field and no new machinery.

**Clearing is a write.** An empty string, exactly as unmarking writes `false`
rather than trashing the node: `node.field.set` is the only field event there
is, and taking a thing back is a decision the log should keep. The readers treat
an empty or non-string value as nothing, so the row leaves every surface without
the record leaving the log.

## And the projection finally has a surface

`arrangementCards` has existed, been exported and been unit-tested since
arrangements landed, **with no caller anywhere in the app**. A complete
projection with nowhere to render is hub LESSONS 182's shape exactly: a feature
that cannot be found reads as missing. Arrangements were reachable only by
opening each item that carried one — the identical defect the two releases
before this were spent fixing.

*Running without you* is that list. Its door exists only once an arrangement
does (ADR-0116). It shows **every** arrangement including the healthy ones,
which the projection's own header already argues for: a surface that only ever
shows problems is a red wall by omission, and a list of what you are trusting to
run without you is worthless if it hides everything currently fine.

## What this refuses

Carried from entry 30's routing proposal, and each is load-bearing:

- **No state list or lifecycle the app defines** — that is the app modelling
  somebody's organisation.
- **No progress reading across states** — a bar over words somebody typed is
  arithmetic pretending to be knowledge.
- **No inference that a condition has been met.** The app never watches the
  world and must never imply it has. The confirmation shown on writing says so
  in as many words, because a reader who has just written a condition down is
  entitled to wonder, and finding out by waiting is the expensive way.
- **No prompt to update a state on a schedule** — that rebuilds the recurring
  task this replaces, wrong on every occurrence but the one that mattered.
- **No Done on the list.** A state of affairs is not work, and offering one as
  the next thing to do is the category error already refused for a person, a
  place and a role. Confirming stays on the item's own sheet, where the question
  is asked.

## What would overturn this

A reader who writes *where it stands* and never *what would change it*. That
would say the state is what they wanted and the condition was the theory — and
the remedy would be dropping the second box rather than explaining it harder.

Entry 31 is worth holding beside this one. Forgetting accounts for under a tenth
of things that do not happen; reprioritisation is the largest single reason and
is adaptive. These fields are not a memory aid so much as the thing that lets a
reconsideration be **informed**: work hung off a state should be reconsidered
when the state changes, and without a stated state there is nothing for it to
hang off, so it persists by default.
