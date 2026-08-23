# Plan — what the research routes next

Written 2026-08-23, after `docs/plan-situated.md` completed its eight phases and
production moved from 2.14.1 to 2.24.1.

**Every item below is traceable to a numbered entry in
[`docs/nd-collisions.md`](nd-collisions.md) and carries that entry's own evidence
grade.** Where something is derived rather than routed, it says so in its own
words and is ranked last. That ordering is the point: the catalogue is the
authority, and an inference from the code is not the same object as a graded
finding, however sensible it looks.

## Why there is a second plan

`plan-situated.md` answered fourteen situations by building the machinery to
answer them. Entry 23 is the evidence gate that plan named itself blocked on,
and it says the machinery is not the missing piece:

> the app they have just opened knows how to do several things for them — show
> only what fits where they are, say how a role is carrying, name what a stray
> action is quietly serving — and none of it can do anything yet, because every
> one of those depends on a word that only exists once somebody has said it.

Measured, not projected: a real 1,173-item import left **eleven of fourteen node
kinds at zero**, with every situational feature the catalogue routes toward
switched off at once, on the day it mattered most that they were on. The stress
fixture in this repo reproduces it — 840 actions, 42 projects, 518 passed dates,
and zero contexts, roles, areas, goals or people.

The two jaws, and both are in the catalogue:

- **Entry 23** — the industry treats a taxonomy as a prerequisite rather than an
  outcome, so the tool front-loads the heaviest cognitive work it will ever ask
  for at the moment there is least investment in paying it.
- **Entry 3** (graded **Strong**, and the thesis of this app) — cue-dependent
  prospective memory failure. Filed means gone. Filing is not merely expensive;
  it removes the cue that was doing the remembering.

So the work is not "make filing easier". It is to make the app useful at a
taxonomy of nearly zero, and to let structure accrue as a by-product of use.

## What is already built, checked against the code rather than remembered

Five of nine steps of the previous plan named things as missing that were
already built (hub LESSONS 120). Each line here was verified in this session.

- **The place axis** — `fitsHere` (`src/contexts.ts:61`), a device kv preference,
  a post-filter in `src/ui/work.ts:610`. An unlabelled node fits every answer.
- **The duration axis** — entry 24's first V2-candidate, in full: `fitsWithin`
  (`src/duration.ts:149`), `HOW_LONG_KEY` beside `where.now`, composed with
  `fitsHere` in the same post-filter. No estimate fits any window.
- **The situation as one door** — `#situation-open`, and named situations
  (`situation.saved`) recalling a place-and-duration pair in one tap.
- **`personView`** — surfaced on the detail sheet (`src/ui/detail.ts:683`).
  Entry 24 recorded it as having no surface; it has one now.
- **The import's date amnesty** — `src/taskpaper.ts` drops passed dates rather
  than converting them into fresh demands, and the reader is told the count and
  the reason before pressing anything.
- **What is on my plate** — entry 24's cheapest candidate, answered by the dated
  line and the coverage gauge rather than by new machinery.

## The phases

### Phase 1 — ask once, in the flow

**Entry 23's routing proposal, verbatim in shape.** V2-candidate, evidence
**Community**, with Strong pieces underneath that the entry warns should not
lend the combination more weight than they individually earn.

Build one mechanism, not a first-run special case: the first time an offer, a
filter or a ranking would differ depending on an unanswered situational fact,
ask it once, at that moment, worded as declinable as *Not this* already is, and
never ask again about anything already answered.

- **Place first**, since it is already wired.
- **The trigger is the hard part and the entry does not specify it.** The
  written condition — the first time an offer would differ by place — cannot
  fire on a store with no places, because `fitsHere` returns true for everything
  unlabelled, so the offer never differs. The trigger must therefore be
  something else, and choosing it is this phase's real design work rather than
  its implementation.
- **The comparison this rests on has not been tested, for this population or
  any other.** The entry says so in its own evidence section. So: ship it small,
  ship it reversible, and watch whether a declinable one-tap question becomes,
  for somebody who cannot start, one more door. Entry 24 names that same
  watch-and-remove discipline for its own open question.

### Phase 2 — the same mechanism for role and for filing a container

**Entry 23, same proposal.** Extend the identical mechanism rather than writing
a second one, riding the rule the `filed` route already settled (ADR-0073): a
container gets made where work already is, never by promotion, never as a
precondition.

### Phase 3 — the arrival is a fact, not a debt

**Entry 23, same proposal.** One line at import, modelled on the amnesty's own
words (ADR-0043): how many things arrived, and that nothing is filed yet because
filing was never asked for.

Half of this exists — the import states its counts and explains the dropped
dates. The missing half is the sentence about filing, and it is the half that
does the work: without it, a large unfiled store reads as a debt the reader has
already failed to pay.

The fresh-start effect (Dai, Milkman & Riis, 2014 — close to **Strong** on its
own terms, general population) is the entry's cited support for treating an
arrival as a landmark rather than a backlog.

### Phase 4 — an import's size must not out-rank an ordinary day

**Entry 23, same proposal.** Extend the `taskpaper.ts` precedent from clocks to
ranking, so an import's sheer volume does not out-rank an ordinary day's
captures for no better reason than there being more of it. `src/nextup.ts` has
no import-awareness today.

### Phase 5 — a long answer routes to the Menu, not to a longer list

**Entry 24, V2-candidate.** At the long end of the duration control, a longer
duration-sorted worklist mistakes the constraint: a block of open time is rarely
duration-limited, it is want-limited. Route a long answer toward the Menu
(law 6) and its heat signal, which are already built.

`HOW_LONG_CHOICES` stops at 120 minutes, so the long end has no expression at
all today. Adding a longer option without this routing would build the exact
thing the entry refuses.

### Phase 6 — presence as a third filter axis

**Entry 24, V2-candidate, and the best-evidenced of its three axes** — a
specific person present is the most distinctive focal event-based cue of the
three, closer to Einstein & McDaniel's strongest case than a generic room.

Extend the shipped pattern to `personView` for presence: a predicate beside
`fitsHere` and `fitsWithin`, composed in the same post-filter, `nextUpQueue`
untouched. The data half exists; the filter does not.

**The guardrail every one of these depends on:** each axis stays a filter over
the one offer, composed together, never a set of destinations to choose among.
Building any axis as its own screen is the same mistake regardless of which axis
it is.

### Phase 7 — derived, not routed: a place should reach what is under it

**This is not in any routing proposal.** It is an inference from an asymmetry in
this repo's own write gate, and it is ranked last for that reason.

`src/gate.ts:78` makes *parented to something under a clock* one of the five
ways a node satisfies law 1. A parent already confers return on its children. It
does not confer place: `contextsOf` reads a node's own contexts and never walks
up, so a place on a project reaches none of the work inside it.

On the stress fixture that asymmetry is the difference between 42 statements and
840. It is consistent with entry 23's aim — taxonomy as an outcome rather than a
prerequisite — and it is not caught by any of that entry's refusals, because the
person still states the place explicitly; nothing is inferred from behaviour.

But it is a structural change to what the tree means, and ADR-0013 has a
position on the tree that has to be read before this is designed rather than
after. It is last because it is derived, and it should not be built ahead of the
six routed phases on the strength of being obviously useful.

## Refusals — carried forward so they are not re-litigated

From entry 23's proposal, by name:

- Any setup wizard, template chooser, or first-run organising flow. This is
  entry 8's and entry 18's refusal restated at the door.
- Any completion meter or percentage for how much structure exists. A
  percentage is a bar, and the role readout already refused a bar.
- **Inferring a context, role or container from behaviour rather than asking.**
  The entry's grade is explicit that this evidence is enough to refuse an
  inference and never enough to build one.

From entry 24's proposal, by name:

- Any inference or auto-tagging from the free-text `situation` field into
  structured contexts or into ranking.
- Any gap-fitting against clock time. The schema has no time of day anywhere.
- Any hard cutoff treating an estimate as fact for exclusion. The
  planning-fallacy evidence argues for a soft sort or a label, never a filter
  that makes a mis-estimated item vanish from a window it was going to overrun.
- A menu of named situational screens, one per axis.
- A bespoke meeting mode. The recurring-meeting question waits on the person
  axis and is not separately specified.

And one refusal this plan adds, from what the code shows rather than from an
entry: **exclusive places.** Making a place hide everything not labelled with it
reconstructs the failure entry 23 describes — a filter that cannot be trusted
because an unfiled thing has disappeared from it. The unlabelled-fits-everywhere
default is what makes the filter safe on a store with almost no structure, and
it is load-bearing rather than incidental.

## The order, and why it is not 1 to 7

The phases are numbered by where they come from, not by when to build them.
Built in order of provenance, the design-blocked work would be done first and
with the least information.

1. **Phase 3** — the arrival sentence. One line and its test, no new machinery.
2. **Phase 5** — the long answer routes to the Menu. Small, and both ends of it
   already exist.
3. **Phase 6** — presence as a third axis. This mirrors `fitsHere` and
   `fitsWithin` almost line for line: a predicate, a device kv, one more clause
   in a post-filter that already composes two. The most patterned work here.
4. **Phase 4** — an import's volume must not out-rank a day. Touches ranking,
   so it wants care rather than pattern-following.
5. **Phase 7** — a place reaching what is under it. Structural, and ADR-0013's
   position on the tree has to be read first.
6. **Phase 1** — ask once, in the flow. LAST on purpose. Its trigger is
   undesigned, the entry does not specify one, and the condition as written
   cannot fire. Choosing it well depends on how much of the situated surface
   exists to trigger against, so this is the phase that most benefits from
   being decided late.
7. **Phase 2** — the same mechanism for role and container. Depends on phase 1.

## Effort, and what it is allowed to cost

The compute here is not free and the expensive part is not the thinking — it is
the browser. The a11y walk, the smoke walk, `look`, `tour:shots` and the update
walk each drive a real Chromium, and a full Spine is minutes.

**Group the phases into three releases, not seven.** Seven releases is seven
Spine runs and seven walks; the grouping below is roughly half the browser time
for the same work.

- **Release A** — phases 3 and 5. Both are small, neither touches the other's
  code, and neither changes a rendered surface enough to need its own walk.
- **Release B** — phases 6 and 4. The axis and the ranking, which is where the
  offer changes; one walk covers both.
- **Release C** — phases 7, 1 and 2. The structural change and the mechanism
  that rides on it.

**What goes to a cheaper model, in a subagent** (Doctrine §11b): running a gate
suite and reporting exit codes; find-and-replace across a known set of files;
classifying a list against a stated rule; reading a CI log for the failing step;
checking a claim against a file. All of it mechanical, all of it verifiable by
its output rather than by trusting the worker.

**What does not**: the trigger decision in phase 1; whether phase 7 is
compatible with ADR-0013; every line of reader-facing copy; and judging a
render, which is the step that caught three defects this run that no number
caught.

**And per commit, the narrowest thing that answers the question.** One grep, one
`sed -n` range, `--only=` where a walk supports it. Re-render only what changed.
The full Spine once per release, read from the run.

## Execution discipline

Unchanged from `plan-situated.md`, plus what this run cost:

- **Per commit, cheap only** — typecheck, tests, and the static gates that
  chunk touches.
- **The a11y walk before any commit that changes the rendered app.** The commit
  hook now enforces it (`tools/hooks/a11y-fresh.sh`); 2.23.1 is what it cost to
  find out.
- **Render it and open the picture.** Three defects this run were invisible to
  every number and obvious in a screenshot.
- **Plant every new assertion red before trusting it**, including the test data
  — one test this run passed against the defect it was written to catch, because
  its fixture made the right and wrong answers identical.
- **Per phase, the full Spine, read from the run.** A push is not a release, and
  a cancelled run is not a failed one.

## Verification

Each phase carries its own gate, and no phase is done until its gate has been
seen red on a deliberate defect. Beyond that, the whole plan is verified the way
the last one was and the way entry 23 says it must be: against the import
fixture, not the sample — 840 actions, 42 projects, zero of everything
situational — because that is the store every one of these phases exists for.

The question none of this can settle from a chair, in entry 24's own words: it
is not decidable whether asking costs less than scanning. Ship small, reversible,
and watch.

## Resume state

- Phases 1 through 7: not started.
- **Production:** 2.24.1 (`0bb59a7`), Spine and Deploy both success, read from
  the runs. Production itself is unread and cannot be read from a session; the
  device's own diagnostic is the route (V-15).
- **Staging:** 2.24.1 (`5d22c99`), 49 steps, 49 success.
