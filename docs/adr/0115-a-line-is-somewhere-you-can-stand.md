# ADR-0115 · A line is somewhere you can stand

**Status:** Accepted · **Date:** 2026-08-30
**Refines:** [ADR-0096](0096-roles.md), which made a role a
cross-cutting link and left it descriptive. **Follows:**
[ADR-0095](0095-what-a-thing-is-for.md), the downward projection.

## The gap this closes

Every link this app has is traversed **forward only**, from a task outward:
`rolesOf` says which identities a thing carries, `servesNode` which horizon it
serves, `dependencyView` what it feeds. Not one of them answers the other
direction. A repo-wide search for `roles.includes` returned exactly one hit, and
it is the fold's own dedupe.

So the attention readout — a sheet titled *Where the attention is* since 2.6.0 —
could say that attention went to an identity, and there was **no code path
anywhere** to show what was there. Its rows were `span` + `span`. On an item, a
role's name was a *remove* control: from a thing, the only thing you could do
with the line it was on was take it off.

Reported as the thing every planner fails at: *say I am at work, or in this
meeting, or on this line of effort, and show me what is on it.*
`docs/horizon-models.md` §1 explains why no planner does — task lists are trees,
alignment links are graphs, and a single-parent tree structurally cannot hold the
cross-cutting line. **Quietkeep already built the link-kinds.** What it never
built was the second direction.

## This is not the filter `roles.ts` refuses, and that refusal stands

`src/roles.ts` rules out a "show me only Parent work" switch, on the grounds that
narrowing the working surfaces to an identity is the partition Q-10 argued
against — two lists, and you have to remember the other one. **That is still
right and is untouched.**

A view you OPEN and READ is a different act. `docs/horizon-models.md` §3 draws
exactly this line: altitude views are **inspection modes, never workspaces**. You
come to see the shape of a line and you leave. Nothing about the surfaces you
work from changes because you looked.

## Decision

- **A role's own sheet holds the line.** A role is an ordinary node, so this
  costs no new surface — the same reasoning that put the person lens on a
  person's sheet in 1.12.0, and the same shape one axis over.
- **`lineView` returns the live work carrying the identity, and the distinct
  horizons that work sits under.** The second is the line crossing the tree,
  computed from `servesNode` rather than declared, so "which horizon" keeps one
  definition in this app.
- **Sorted by name, never by size or pressure.** The rule `roleLoads` and
  `roleAttention` already follow, for a stronger reason here: ranking the work on
  somebody's own identity would make this the worklist it must not become.
- **Finished work is not on the line**, exactly as `roleLoads` counts. Listing it
  would make this a record of output, which is the shape law 5 refuses.
- **An empty line says so.** It is the most useful answer this view gives —
  nothing is moving there — and a group that vanishes leaves the question looking
  unanswerable.
- **The readout rows become doors, and so does a role's name on an item**, which
  gains its own *Take it off* beside it rather than being one.

## What this does not do

No filter, no narrowing of any working surface, no count of horizons beside the
count of work, no ranking, no grade. `docs/horizon-models.md` §3 refuses RAG and
roll-ups by name and none of that arrives here.

## Still unbuilt, and named so it is not rediscovered

`src/review.ts` computes its exceptions by walking the **tree** — `unfedGoals`
walks `n.parent`, so "unfed" means no live work *beneath it in the tree*. It
knows nothing about lines. **A line with nothing moving on it is therefore
visible only to somebody who opens it**, and the value of that finding is that it
should come to you: ADR-0013 puts the clock on the artifact instead of the ritual
on the person. Extending the exceptions to the cross-cutting links is the next
piece, and it is what turns a weekly review into a continuous assessment.

## What would overturn this

A real store where opening a line answers nothing because almost nothing carries
one. The remedy would be making a line cheap to attach at the moment work is
sorted, not removing the view.
