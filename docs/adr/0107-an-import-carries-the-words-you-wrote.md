# ADR-0107 · An import carries the words you wrote

**Status:** Accepted · **Date:** 2026-08-23 · **Extends:** ADR-0092, ADR-0073 · **Cites:** `docs/nd-collisions.md` entries 23, 24

## Decision

The importer creates **contexts** from the tags on an imported line, and records
an **estimate** from `@estimate`. Both were dropped before this, and named in the
summary as things that would not come across.

- Every tag that is not a recognised clock, `@done`, `@flagged` or a repeat rule
  becomes one `context.created`, in the words it was written in, and one
  `context.attached` per item carrying it.
- Names match case-insensitively and are created in the first spelling seen, so
  `@Errands` and `@errands` are one place rather than two entries in a chooser.
- Tags on a **project** are carried too. `placesReaching` already gives
  inheritance, so one tag on a container is worth more than the same tag on each
  of its children — and this is where a container's tags were most valuable and
  most completely lost.
- `@estimate(30m | 1h | 1.5h | 90 | 1h30m)` becomes `estimate.recorded` with
  `basis: 'guess'`. A value in no readable shape is dropped and named; a guessed
  duration is worse than an absent one, which is the rule `estimateOf` already
  enforces by refusing a non-positive value.
- The same carry happens on the CSV door, from the `Tags` / `Context` and
  `Estimated Minutes` / `Duration` columns, because the same person's same
  labels arrive by whichever way they exported.

**`@flagged` stays dropped**, unchanged and for its original reason: a flag is a
priority mark, this app has no priority field on purpose, and recording one as a
fake clock would invent a demand nobody made.

## Why this is not the inference the research refuses

`docs/nd-collisions.md` entry 23 refuses "inferring a context, role or container
from behaviour rather than asking", and grades its own evidence as Community —
"enough to refuse an inference on and never enough to build one".

Nothing here is inferred. A tag is a word the person typed, in the system they
typed it in, about where or how the work gets done — which is what entry 24 says
a context node is: "person-named, demand-free". Reading their own label and
throwing it away is not neutrality; it is a decision to lose data, and it was
being made silently in every import.

## What it cost to leave it

A 1,432-item store imported from OmniFocus arrived carrying **one context**, no
people and no estimates. OmniFocus tags are its context system, so the entire
situational vocabulary somebody had built — places, locations, energy, people —
was discarded at the door with one sentence in the summary.

The consequence was invisible for a different reason: `fitsHere`'s "an
unlabelled thing fits every answer" default is load-bearing precisely so a store
with no labels is never shown an empty screen. It did its job perfectly, on a
store that had labels. Every situational feature looked correct and did nothing.

## What this does NOT do

No setup wizard, no template chooser, no "get organised" flow, no percentage of
how much structure exists, and no guess about what any label means. All four are
refused by name in entry 23. This creates nothing the person did not write.
