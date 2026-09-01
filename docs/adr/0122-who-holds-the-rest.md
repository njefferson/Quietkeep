# ADR-0122 · Who holds the rest

**Status:** Accepted · **Date:** 2026-09-01 · **Answers:** Q-15 · **Built on:**
[`docs/nd-collisions.md`](../nd-collisions.md) entry 32, entry 25's shipped
standard (ADR-0057's scoped-subtraction rule via `promise.released`), Q-13's
cross-cutting-link precedent.

## The question

Two people leave the same conversation holding different amounts of it. One
holds the whole of what was settled; the other holds the fragment that was
salient to them, and was assigned work whose full picture lives in the first
person's head. Nothing was forgotten and nothing went silent — the divergence
happened at encoding, no clock could ever fire on it, and weeks later one of
them refers to what was agreed and the other has no access to what is being
referred to. Entry 32 grades the failure Strong, grades every content-carrying
remedy as forbidden, and leaves exactly one shape standing. Q-15 asked whether
that shape earns its place; the owner answered on 2026-09-01 by directing the
build, which discharged the first of the entry's two preconditions. This record
is the build.

## Decision

**A pair of relations, a scoped subtraction, and the import carrying all three
person directions. Nothing else — no new kind, no new surface, no new
projection.**

- **`rest-with-them`** — *they hold the rest of this* — and **`rest-with-me`**
  — *I hold the rest of this* — join `RELATIONS`. A PAIR, not a seventh entry
  alone, because Q-15's own bullet rules the one-way noun out: a relation that
  could only say *they hold more of this than you* encodes a deficit into the
  vocabulary inside an attribution environment entry 32's evidence says is
  already asymmetric. Wegner's directory records who holds what, in either
  direction; so does this. Law 7 satisfied by the shape, not by the copy.
- **The pointer carries nothing.** No text, no version, no age, no meeting, no
  account of what the other person believes. Memory conformity needs content to
  conform to, and a pointer has none — that is the entire structural argument
  for why this survives entry 32 and every content-carrying alternative does
  not. What was actually agreed goes where it always goes: *What was decided*,
  append-only, unattributed.
- **`holding.released` `{person, relation}`** — the third subtraction, scoped
  one person AND one relation like `stakeholder.removed` and
  `promise.released`. The relation rides in the payload, a deliberate departure
  from "named in the noun": the holding axis has two directions and one act of
  release, and two nouns would be two spellings of one act. The payload may
  name only the pair; the fold treats anything else as a no-op, never a
  remove-all. This closes Q-15's release-path sub-question YES, for
  `promise.released`'s reason pointed outward — a directory that cannot be
  corrected goes on asserting who holds the rest of a thing after it has
  stopped being true, and a directory that cannot be corrected is worse than no
  directory. The sheet's take-back control extends to the pair; the release
  takes the pointer, never the work.
- **The import carries people, one direction per tag** (`src/taskpaper.ts`):
  `@owes(Name)` → `waiting-on` plus the same waiting window the sheet opens
  (who, for what, since the import moment — never a guessed past);
  `@promised(Name)` → `promised-to`; `@holds(Name)` → `rest-with-them`.
  Consumed before the place logic, or `@owes(Sam)` mints a place called "owes"
  — the `PLACE_IS_THE_VALUE` trap with a person in it. Names are deduped
  case-insensitively against the file AND the store (the sheet's own rule,
  threaded as an explicit argument so the mapper stays pure), created in the
  words first written, and counted in the door summary in each direction with
  no duration anywhere. There is no `rest-with-me` tag: the vocabulary must be
  two-directional and the bridge need not be — a hand-typed pair of
  near-identical tags is a footgun, and the motivating import case is
  one-sided.
- **No new render site.** The pair reaches the item's sheet through
  `RELATION_WORDS`, the person's own page through `personView.involves` (which
  hard-codes `days: null` — no surface CAN age it), the person filter and the
  meeting room through `namedOn`/`fitsWith`, which count every relation. That
  is the whole surface story, and it is deliberate: entry 32 refuses any list
  of things not yet reconciled, and a dedicated holds-list would be that queue
  wearing this record's name.

## Refused, restated from entry 32 so this record carries its own fence

Any second account — attributed transcript, party field on `decision.logged`,
any surface showing two versions of anything. Any reconciliation queue. Any
ageing, pressure, colour, or ordering by duration on a holding pointer, in
either direction. Any per-person tally, ever. Any in-app message, share, or
notification to the other person — this is memory support, never a channel.

## The watch, which is the reversibility standard doing its work

Nobody has studied a private directory of who-holds-what as a repair in any
population, and the one directly relevant empirical result is a caution:
imposing a memory structure on a transactive system that already worked made it
worse than strangers (Wegner, Erber & Raymond, 1991). Whether that transfers to
a reader recording their own observation is exactly what Q-15 asked and exactly
what nobody has measured — so this ships as entry 25's kind of bet: one
relation pair, one subtraction noun, no surface, removable whole if the pointer
turns out to be the imposition rather than the repair. The on-device pass is
where that gets seen.
