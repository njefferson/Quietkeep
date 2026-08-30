# ADR-0114 · An arrival is a set you can work through, and it has a name

**Status:** Accepted · **Date:** 2026-08-30
**Refines:** [ADR-0044](0044-sort-mode-and-named-ranges.md), which created the
single loose-import range. **Distinct from:** [ADR-0006](0006-backups-and-import.md),
which governs BACKUP restore and does not reach this.

## The gap this closes

Bringing another planner's file in was one undifferentiated event. Two imports a
month apart were the same lump, so a second file diluted the first and neither
could be worked through on its own. The built-in sample set fell in the same
lump, which is the half that becomes somebody else's problem later: loose rows
they cannot tell from their own forgotten work, in a store they are now afraid
to clean.

Reported in those terms — a new file must not dilute what is already there, and
each import wants to be workable as its own set.

**No ADR governed third-party ingestion at all.** ADR-0006 is about backups and
its "import always seeds a fresh store, it never merges" is about restoring a
Quietkeep export; a planner file is additive and always was. ADR-0044 created
`loose-import` but ruled only on admission to the daily surface.

## What was already there, and what it could not answer

`arrived` (2.15.0, narrowed 2.38.0) marks a row that came in **with nothing to
go on**. It is right for what it decides — whether the offer may hand the row
over one at a time — and it cannot answer "which import was this", or even "was
this part of an import": a row that kept a real date and every project in the
same file are `arrived: false`.

So `looseFromImport`, keyed on `arrived`, held **part** of an import and was
named for the whole of one. That is the same defect 2.38.0 found one turn down
from where it looked: a batch named for imports that does not hold the import.

`provenance` on `node.created` cannot help and must not be tried: every writer
hardcodes `{ for: 'self' }`, the sample generator included, and it is never
folded.

## Decision

- **Every node an importer creates carries an `arrival` key**, whatever else is
  true of it — dated rows and projects included.
- **The key is the importing commit's own timestamp.** An import lands in one
  commit, so every event in it already shares an `at`; that string is unique per
  run and is also the date the set is labelled with. Nothing is minted and no id
  is invented.
- **The sort picker offers one door per arrival**, generated per key exactly as
  `under:<container>` and `menu:<category>` already are, so no list here can go
  stale against the store.
- **A set is named by its date and its size, never by a source.** Nothing records
  which planner a file came from — the format is sniffed from the content and the
  filename is never stored — so naming one would be a guess presented as a fact.
  A date is checkable against somebody's own memory of the day they did it.
- **The built-in sample set is an arrival too**, under the fixed key `sample`,
  named rather than dated and offered last. This is a requirement, not a side
  effect: named, it is one set the wholesale verbs can let go of.
- **Additive only.** A log written before this has no `arrival`, folds to `null`,
  and behaves exactly as it did; a snapshot written before it defaults to `null`
  rather than inventing a set somebody's existing rows never arrived with.

## What this does not change

Nothing about the daily surface. ADR-0044's "nothing about an import ever
appears on the daily surface" holds, and so does 2.38.0's split: the clarify
queue still offers arrivals — saying the inbox is clear while a thousand of them
sit there would be the dishonest half of that trade — while the count a reader
sees still counts only what they put down
([ADR-0113](0113-the-pile-is-counted-the-person-is-not.md)).

## What would overturn this

Somebody wanting to work across two arrivals at once, or finding the date
meaningless because they import on a schedule. The remedy would be a name they
type at the door, which was considered and refused for now as a field nobody
asked for; the key would carry it without changing shape.

## Still owed

The landing after an import (2.35.0) names no set. It reloads into the re-entry
surface, which is the right room and does not yet say *these came in together,
here is the way to them*. Recorded so the next session finds it rather than
rediscovers it.
