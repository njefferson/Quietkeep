# ADR-0095 · What a thing is for — law 4's downward half

**Status:** Accepted · **Date:** 2026-08-17 · **Shipped:** 2.5.0 · **Answers:** Q-11 (reported 2026-08-04) · **Extends:** ADR-0013

## Decision

A held card and the offered card say **what a thing serves** — the
highest-altitude live horizon above it — as one descriptive line: *"serves A
calmer house"*.

`src/serves.ts` is the one definition. It is never a control, never a
destination, and carries no count, proportion or colour.

## Why

### Law 4 was half-built for its whole life

Law 4 is two clauses:

> *"Levels push down; the user never climbs. Higher horizons project lineage and
> health downward."*

The first has been true since ADR-0013 — altitude views are inspection modes and
nothing makes anybody walk a hierarchy to plan a day. **The second was never
built.** A card knew what it was *inside* (`placeWords` → *"in Errands"*) and
nothing anywhere said what it was *for*.

`docs/horizon-models.md` names the design in terms, and NOTES Q-14 calls it
*"what is genuinely unbuilt … and it is the thing worth building"*.

### Q-11, and why it did not need a guess

Reported 2026-08-04: **no feeling of being shown the right things.** It sat for
thirteen days, held to have two readings needing opposite work — *the ranking is
wrong* or *the ranking is right and nothing gives grounds to believe it* — with a
status of *"asked, not answered. Do not build past this on a guess."*

Not building on a guess was right. Not going and looking was not. Measured in
`nextup.ts`:

- **Every tier is temporal**: `hard-date`, `unblocked`, `resume`, `pressure`,
  `ready`, `unsorted`, `beneath`.
- **The only tie-break inside a tier is pressure, then creation order** — which
  is why forty rhythm-less items give the same card today and in a year.

So the app has never had **any** notion of what a thing is for. It cannot show
the right things under any definition of *right* that is not *most
time-pressured*. That is the ranking reading, established by reading the code
rather than by asking.

**And one build serves both readings.** The trust reading asks for grounds to
believe an offer, the way the coverage gauge is grounds to believe law 1. When
the card says *"serves A calmer house"*, the reasoning is on screen and can be
disagreed with — and a judgement you can check is the only kind anybody comes to
trust.

## How it decides

**Highest ALTITUDE, not the top of the chain.** `goal` › `area` › `outcome` ›
`project`. Those differ: an action under a project under a goal filed inside an
area for tidiness serves the *goal*, and a walk that took the root would answer
the area. Ties break toward the **nearer** ancestor — two goals in one chain is
legal and unusual, and the closer one is what the reader was thinking about.

**`project` counts as a horizon.** Most real trees are one deep for a long time,
and a version that only spoke about goals and areas would render nothing for
almost everybody, which reads as broken rather than as empty.

**A let-go horizon is no horizon.** It falls through to the next live one rather
than naming something that was thrown away, and says nothing when none remains.

## What it will not do

- **Never a destination** (law 4, ADR-0013). It names the horizon; it is not a
  door and does not offer to take you there.
- **Scores nothing** (law 5, law 7). No count of what a goal holds, no
  proportion, no *"3 of 8"*, no colour.
- **Infers nothing about the reader** (law 7). The horizon is a container the
  reader made and a parent the reader set. That rule is why this is not a
  "what matters to you" score derived from logs — the same rule that killed
  `pressureBands`.
- **Says nothing when there is nothing to say.** A loose capture is the ordinary
  case in a real store; announcing *"serves nothing"* would make the flat
  majority of a list read as incomplete.
- **A horizon does not describe itself.** A goal saying what it serves is the app
  talking to itself; where a container *lives* is `placeWords`' job.

## Consequences

- **On the offer it appears only when it adds something.** `lineageOf` walks two
  hops and the second is the first live container above the parent, so on a
  two-deep tree the horizon is *already* named as *"under A calmer house"* —
  appending *"serves A calmer house"* would be one fact said twice in two
  vocabularies. Suppressed by checking the rendered string, because the string is
  what the reader is comparing it against. It earns its place on a deeper tree,
  where the two-hop walk stops below the horizon.
- **On the held card it is new at any depth.** That list walked exactly one hop
  and never said altitude at all.
- **No new class, no new colour pair.** It reuses `.card-place`, which carries no
  colour of its own and is already in the contrast registry — covered from the
  first run, which is what `.card-where` and the detail placeholders each cost a
  release for learning the other way round.
- **No new control**, so the controls budget is untouched.

## What this deliberately does NOT do

**It does not change the ranking.** The offer is still ordered on time alone.
Making *serves a horizon* outrank *serves nothing* would be this file deciding
that filing something under a goal means it matters more, which is a policy about
the reader that no measurement here supports — a loose capture is very often the
most important thing in the store. That decision is the owner's and it is now the
open half of Q-11, stated with the numbers rather than as two abstract readings.

## What would overturn it

A reader reporting that the line is noise on a real store — the flat majority
being loose means most rows show nothing, and if the ones that do show something
read as clutter rather than as grounds, the answer is fewer places to say it, not
a shorter phrase.
