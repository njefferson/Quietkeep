# ADR-0096 · Roles — identities that cross areas, and where the attention is

**Status:** Accepted · **Date:** 2026-08-17 · **Shipped:** 2.6.0 · **Settles:** Q-13 · **Extends:** ADR-0092

## Decision

A **role** is a node kind and a cross-cutting link: `role.created`,
`role.attached`, `role.detached`. It says **who work is for**.

And **Where the attention is** — a readout, behind a control, of how much live
work each named role is carrying.

## Why

NOTES **Q-13**, 2026-08-04, settled the framing: **a role is an IDENTITY, and it
crosses multiple areas.**

That settles the data model on its own. This tree is single-parent, so
a thing that crosses areas **structurally cannot be a container** — it has to be
a cross-cutting link, the shape `node.people` has used since 0.15.0. Q-13 said
exactly that, named the mechanism, and then **deferred the build**:

Building role machinery before a single area or goal existed in any store would
repeat the eleven-empty-nouns mistake, so stage 4's evidence — whether
containers get made at all at two-tap cost — was set as the gate.

**Thirteen days.** The reasoning is not stupid — the eleven-empty-nouns mistake
is real and is recorded in this repo. But the gate it set was *a session's
judgement about whether the owner had made enough projects yet*, and that is not
a session's call to make about somebody else's planner. It is the same close as
Q-10's (hub LESSONS §96) and Q-11's, and it is the third instance in one audit.

### Three axes, and they answer different questions

- The **tree** says where a thing LIVES. One parent, ever.
- A **context** says where it can be DONE (ADR-0092).
- A **role** says who it is FOR.

The last two are one mechanism pointed in two directions, and that is deliberate
rather than lazy: two features with one shape are one thing to learn, and the
fold, the merge disposition, the gate exclusion and the card line all inherit
their behaviour from the contexts that came first.

## Why a role is NOT a filter, and a context is

`contexts.ts` carries `fitsHere` and a device-level *where you are*, because
where you are physically **changes during a day** and narrowing to it is the
whole point.

**An identity does not work that way.** You do not stop being a parent at the
office. A *show me only Parent work* switch would be precisely the partition
NOTES Q-10 argued against — two lists, and then you have to remember to check the
other one, which is the failure this app exists to prevent.

So a role is descriptive on the thing, and its purpose is the readout.

## The readout, and what makes it legal

**Where the attention is** answers the recorded question — **how do you see
whether enough energy is going into each role** — which ADR-0013's consequences
and `docs/horizon-models.md` both name as needing exactly this, and which was
never built.

It is a **plot, never a verdict** (law 7 — the app plots, the human interprets):

- **Sorted by name, never by size.** Ordering somebody's own identities by how
  much each carries is a ranking of their life, and the app does not get to make
  it.
- **No bar, no meter, no proportion, no target, nothing "balanced".** A bar
  implies a whole, a whole implies a target, and *a bar is a machine for implying
  you are behind* (law 5). The a11y walk asserts structurally that no
  `progress`, `meter` or `role="progressbar"` exists on the surface.
- **Counts are words** — *"3 things"*, *"nothing right now"*. A bare integer
  beside a name reads as a score.
- **It says out loud that it is not a target**, because a list of numbers next to
  names is read as a leaderboard by default, and that sentence is the thing that
  makes the readout legal under law 7. The walk asserts the sentence is present.
- **Live work only.** Counting finished things would make it a record of output,
  which law 5 refuses.
- **The unnamed remainder is stated, separately.** On any real store it is the
  biggest number; omitting it would make the named roles look like the whole of
  somebody's life. It is not a row, because it is not an identity and listing it
  beside real ones invites reading it as one.
- **Behind a control, and hidden until a role exists.** A readout that greets you
  every morning is a standing report card, and a control that opens an empty
  surface teaches you the feature is broken.

A thing in two roles counts under **both**. There are no halves: the app has no
idea how the effort split and inventing a division would be arithmetic
pretending to be knowledge.

## Consequences

- The exhaustiveness records did the work. Adding `role` to `NODE_KINDS` failed
  to compile in three places until each was decided in writing: `REPORTABLE`
  (**false** — an identity is not portfolio news, and a status report naming
  somebody's roles at somebody else is a fact about the person), `KIND_WORDS`
  (*Role*), and `MERGE_DISPOSITION` (**union**, like contexts and people).
- **`role` is demand-free** — the gate refuses a clock, and `heldWork` and
  `NOT_ACTIONABLE` exclude it. Offering an identity as the next thing to do with
  a Done button on it is one step worse than offering a place.
- **Search admits it**, on the same grounds a context and a person are admitted:
  it is a thing the reader named, and typing *"parent"* and being told there is
  no such thing would be the app denying a word the reader gave it.
- **The big sample draws its role rolls from a SECOND, INDEPENDENT RNG stream.**
  The first version drew from the shared one, which shifted every subsequent
  draw and silently reshaped a sample dozens of assertions are written
  against — the membership gate immediately reported the set no longer held a
  waiting-for with a passed date. A new label must add a case, never quietly
  delete somebody else's.
- Budgets: words 3300 → 3340, controls 222 → 226, each with its reason at the
  number. The word raise is one field, its hint, and the readout's not-a-score
  sentence — cutting that sentence to fit a budget would cut the safeguard and
  keep the numbers.

## What would overturn it

The readout being read as a scorecard anyway. Every structural precaution is
taken — no bar, no order by size, no target, the disclaimer in the copy — and if
somebody still reads a row of numbers as a judgement on how they are living, the
answer is to remove the counts and keep the names, not to soften the wording.
