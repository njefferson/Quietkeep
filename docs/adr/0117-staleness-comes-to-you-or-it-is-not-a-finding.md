# ADR-0117 · Staleness comes to you, or it is not a finding

**Status:** Accepted · **Date:** 2026-08-30
**Extends** [ADR-0115](0115-a-line-is-somewhere-you-can-stand.md), which named
this gap in its own *Still unbuilt* section and now points here.

## The question

Review has computed exceptions since v1 and every class it has ever had is a
fact about the **tree**. `stalled`, `orphaned`, `unfedGoals` and `quietAreas`
all walk `n.parent`, so "nothing is moving here" has only ever meant *nothing
beneath it in the tree*.

A line is not in the tree. A role is a cross-cutting tag, and `heldNodes`
excludes roles outright — a role is who work is for, not work
([ADR-0096](0096-roles.md)) — so no exception class has ever
had one in hand to examine.

The consequence is that a line with nothing running on it was visible only to
somebody who opened it. That is the ritual on the person, and
[ADR-0038](0038-containment-and-exceptions-review.md) exists to put the clock on the
artifact instead. A finding somebody has to go looking for is a finding they
make on the day they were already going to look, which is the day they least
need it.

## Decision

**Review gains a fifth class, `quietLines`: a role that has carried work and
carries nothing live now.** It is the first exception in the file that is not a
fact about the tree.

Three properties carry the design, and each is a refusal of a simpler version
that would have been wrong.

**A role that has never carried anything is not here.** Staleness needs a
before. Without this, naming your roles on a fresh store — the one moment
somebody is most likely to do it — fills the surface with every role they just
created, which reads as broken rather than as empty. It is the same restraint
`quietAreas` already applies by refusing a null `idleDays` instead of treating
"nothing has ever finished" as a long time.

**The walk is transitive.** A role is normally carried by a project, and a
project is a container rather than live work, so asking only "is anything tagged
with this role live" would call every properly-structured line quiet the moment
its owner tagged the project instead of each action beneath it. `unfedGoals`
records having made exactly that mistake once; this does not repeat it.

**It ranks below unfed goals and above quiet areas.** A goal nothing feeds and a
line nothing runs on are the same shape of finding — a stated direction with no
work behind it — so they share a band. The goal goes first because it is the
reader's own stated end and the role is the hat worn to serve it. Both outrank
rhythm, because a quiet area still has work in it and these two do not.

## What this does not do

No count beside a role's name anywhere, no duration, no "how long since", no
ordering by staleness, no grade, no colour. The words are `everything on it is
finished` or `nothing on it is moving` and they stop there — `stalled`'s two
branches exactly, and `waitingWords`' register.

It does not disagree with the role readout, and the difference is worth stating
because the two numbers can look contradictory: `roleLoads` counts what CARRIES
the role, so a tagged project counts whether or not anything under it moves.
This asks whether anything under any carrier is moving. That is the same
distance as between `stalled` and a container that still has children.

`REVIEW_CAP` is unchanged at three. A lower-ranked class waiting its turn is
law 8 working, and the total states everything.

## What it costs, honestly

On the demonstration store this class computes one finding and the cap keeps it
off the screen — fifteen exceptions, three shown, and structural breaks outrank
a stale line every time. So **no browser walk renders this class**, and the
assertion that it exists is a unit test rather than a photograph. The row markup
it would use is the shared `.review-open` / `.review-title` / `.review-why`
already measured on the review surface in both themes, so what is unmeasured is
the class reaching the list, not how it looks when it does. That is stated in
`test/big-sample.test.ts` at the assertion itself, so a later reader looking for
it in a walk finds the reason rather than concluding it never shipped.

## What would overturn this

A real store where most roles report quiet because work is tagged at the action
level and roles are attached to containers that were never filled. The remedy
would be attaching a role at the moment work is sorted — the same answer
ADR-0115 gives for its own overturning condition, and the same finding
`nd-collisions` entry 27 supplies: the cost of recording an axis decides whether
there is anything to compute over.
