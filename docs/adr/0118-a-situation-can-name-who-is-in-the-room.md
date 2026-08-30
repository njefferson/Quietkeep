# ADR-0118 · A situation can name who is in the room

**Status:** Accepted · **Date:** 2026-08-30 · **Extends:** ADR-0092 (contexts),
and the situation shortcut shipped in 2.21.0.

## The question

*Where you are* and *how long you have* are two answers to one question, and a
situation somebody names has been able to hold both since 2.21.0. A recurring
meeting is the case that shortcut exists for — and it was the case it could not
express, because **a meeting is a place, a length and a set of faces** and only
two of the three could be stored.

`nd-collisions.md` entry 24 already records this in its own *since written*
line: the saved-situation shortcut shipped storing `{ context, minutes }` and no
person, so a situation carrying who is in the room is not recallable. The seam
was left deliberately — `setSituation` gained a `person` parameter in 2.26.0
with a comment saying a saved situation has no person in it, and that adding one
would widen `situation.saved`'s payload, which that release did not need.

## Decision

**`situation.saved` carries `people`, a list.** The fold normalises it — deduped,
sorted, non-strings dropped — and `Situation` gains `people: NodeId[]`.

**A LIST, not a person, and that is the whole reason this needed a schema
change rather than reusing what was there.** `where.now` and `with.now` are
single-valued device preferences: one place, one person. A meeting has several,
and narrowing a working surface to one of them answers a different question. So
the stored shape is the set, and what will eventually read the whole set is an
inspection mode rather than a filter — the rule ADR-0115 and
`docs/horizon-models.md` §3 already state, and the reason a line is somewhere you
stand rather than something you narrow to.

**Saving under an existing name replaces the people WHOLE.** One name, one
situation, which is what a name is for; a save that merged the old attendees
with the new would make removing somebody impossible.

**A person who was let go stops being named, with no migration.** Resolved
through `personName`, which returns null for missing AND for released — the rule
`contextsOf`, `withWhom` and `rolesOf` all follow, and the one `portfolio.ts` was
found not following while it went on naming somebody who had been let go. A
situation whose named people have all gone reads as nobody rather than as broken,
which is the same fact to a reader.

## What ships in this release, and what does not

The sheet writes at most one person — whoever the existing single-valued filter
holds — and recall puts them back. **The picker for several arrives with the
surface that reads several**, not before it: a multi-select whose only consumer
is a one-person filter would be a control that does nothing, which is the
emergence rule ADR-0116 states.

The stored shape is nevertheless the list, because that is the correct model and
because widening a scalar to a list later is a migration while filling a list is
not. Additive-only either way (law 9): a situation saved before this folds to an
empty list and behaves exactly as it did, and a snapshot cut before this reads
the same.

## What this does not do

No count of uses, no last-used, no ordering by frequency, no "you have not used
this in a while" — 2.21.0's refusals stand unchanged and the closed-shape test
that enforces them still asserts an exact key list, which is how this widening
was caught rather than made quietly. Nothing detects who you are with, nothing
reads a calendar, and naming a situation remains a shortcut and never a schedule.

`whoWords` is not `stakeholderWords`. That one ends "care how it goes", which is
a claim about the people; this says only that they are expected to be there.

## What would overturn this

Somebody naming a meeting and finding the one person the filter holds is the
wrong one of five. That is not a defect in the shape — it is the missing half,
and it is what the meeting surface is for.
