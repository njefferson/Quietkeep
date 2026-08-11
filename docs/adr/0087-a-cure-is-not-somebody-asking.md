# ADR-0087 · A cure is not somebody asking, and every cured kind is classified

**Status:** Accepted · **Date:** 2026-08-10 · **Shipped:** 2.0.1

## Decision

**`isAppClock` classifies every kind the gate cures, by hand, with a reason each
— and a test holds the classification total.**

The rule it applies was already written in the codebase and is unchanged: **a
cure inherits the intent of the event it cured.** What changed is that the rule
is now applied to all twenty-eight cured kinds instead of two.

Fourteen carry no intent about *when* and are therefore not demands: a node
existing, a worry arriving, a date the reader cleared, work they finished, a
bystander cured because its parent was trashed, structural moves (parenting,
merging, kind and role changes), something released or declined, and an item
anchored to another.

Fourteen are decisions taking effect and stay demands: a capture, an interrupt's
resume card, a promotion off the Menu, a clarify route or reopen, a resolved
replan, a released dependency, a closed wait, a cleared anchor, an owned or
routed worry, an untrash, a reclaim.

## The defect, measured rather than argued

`isAppClock` recognised `gate:node.created` and `gate:bother.received`. The other
twenty-six cures were read as somebody asking for something. Folded through the
real gate:

- Clear the only date on something, and days later it is offered as *"this one is
  waiting"*. The reader had just said there was no date.
- Trash a project, and its child — cured as a **bystander** so it would not go
  silent ([ADR-0011](0011-no-silent-nodes-gate.md)) — is offered as *"this one is
  waiting"*. Nobody asked for it.

Both sentences are claims about the reader's intent, and both are false. Same
class as the audit's 1,012-of-1,429 "ready": arithmetically correct, meaningless.

## Why a named set and not "any `gate:` source"

Because that is the tempting reading and the predicate's own docblock already
recorded what it cost: a deliberately promoted Menu item **vanished** from Next
up, and a resume card **stopped coming back** after an interruption. Both are
cures, and both are how a decision takes effect.

So the question is not *did the gate write it* but *did the event it cured express
an intent about when*. That cannot be computed from the source string; it is a
judgement about each kind, made once and written down.

## Why the totality test is the load-bearing part

The omission survived because nothing made it visible. Each cure was correct in
isolation; the predicate looked finished; and its docblock called `node.created`
*"the only cure with no intent behind it"* — which reads as a finding and was an
omission. That line is corrected.

`test/cure-intent.test.ts` reads **the gate's own source** for the kinds it cures,
rather than a hand-kept list — a copy of the thing under test cannot notice the
thing under test changing. Adding a cure without deciding which side it falls on
is now a build failure.

## Consequences

- Two other consumers read this predicate and both get *more* correct, since both
  want the reader's clocks rather than the gate's: `held.ts`'s clock display, and
  `placeReturnDays`, whose docblock already said "by the reader's own clocks,
  never the gate's".
- **Coverage does not depend on it.** `isSilent` and `whyCovered` ask whether a
  node has a clock at all, not whether the clock is a demand — so law 1 and
  1.42.0's proof are untouched. Checked, not assumed.
- **No existing test failed when the predicate changed.** Under the rule this
  repo took from it, that is the finding rather than the reassurance: the change
  was not inert, so nothing had been holding the behaviour — which is exactly why
  twenty-six kinds sat misclassified long enough to reach production.

## What would overturn it

- **If a kind is classified wrongly in the quiet direction**, something a person
  asked for stops coming back — the worst failure this app has. That is why the
  two historically-broken cases are pinned by name in the test, and why the
  default for an unrecognised source is still *somebody's*, which errs towards
  showing work rather than quieting it.
