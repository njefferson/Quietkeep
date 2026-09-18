# ADR-0126 · A confirmation does not live inside anything the act it confirms can remove

**Status:** Accepted · **Date:** 2026-09-16 · **Consequence of:** ADR-0105

## Decision

**One sentence goes to exactly one live region, and it must be one the act does
not remove.**

- The act leaves its surface standing → the surface's own region carries it,
  alone.
- The act removes its surface → `#status` carries it, alone, through
  `sayLasting` in `src/ui/announce.ts`.

**A surface never writes both.** `tools/announce-check.mjs` asserts it
statically: a file that writes text and addresses a live region may not name
`#status`. The population is derived from those two properties rather than
listed, so a surface built next week is held the day it is written.

This is **ADR-0105's rule with *sentence* in place of *control***. That record
established that a control which undoes a state must not be a descendant of
anything that state can hide, and had `tools/plain.mjs` assert the containment
rather than trusting anybody to maintain it. The same shape had never been
stated for the things a surface *says*.

## Why

### Two surfaces wrote a confirmation and took its home away in the same turn

Resolving every passed date empties the replan section and hides it. Taking the
re-entry amnesty dismisses the greeting. Both wrote *"All N dates settled…"* and
*"Moved to the Menu…"* into their own `role="status"` region and then removed
that region within the same turn, so a sighted reader watched the surface vanish
with no explanation — and a screen reader may announce nothing at all, because a
live region hidden immediately after a write may never be read out.

The accessibility walk found the first one as *"#replan-live matches nothing
visible"* in both themes and could not drive the second at all: the re-entry
sentence is readable only on the FAILURE path, and a browser cannot make
IndexedDB refuse a commit.

### The obvious fix was already in the tree, and it bought a second defect

`replan.ts` had the diagnosis in a comment before any of this was written:

> Resolving the LAST card hides the whole section, and a live region inside a
> hidden element announces nothing — so on the one occasion most worth
> confirming, the confirmation would have been silent.

Its answer was to write both regions. `#status` is `role="status"
aria-live="polite"` as well, so a screen reader heard the same sentence twice.
Seven sites did this — five in `work.ts`, two in `replan.ts` — and each looked
correct in the file it lived in.

### And the reasoning behind the second write had already expired

`work.ts`'s helper justified its second write plainly: *"#nextup-live is
visually-hidden, so a sighted user tapped Done, saw nothing change, and had no
way to learn the write failed."* True when written, and the fix for F-08.
**3.24.5 made six of those regions visible** and left the helper's parameter
standing with its premise gone, so five failures were announced twice to buy a
visibility that already existed.

That is the shape this record exists to stop: not a wrong decision, but a right
one whose grounds moved, in a place nothing was watching.

## Why `#status`

It is the one region no act on any surface removes, and three independent
records already treat it that way.

- It sits beside the capture box, and every handler whose section disappears
  sends focus to `#capture` explicitly (WCAG 2.4.3) — so the sentence is where
  attention is going anyway.
- `src/plain.ts` keeps it in `PLAIN_CHROME_KEPT` even on the stripped surface,
  described there as *"the live region that says the write landed"*.
- `app.ts` already announces a card's completion there for exactly this reason,
  recorded at the time: the other two surfaces announced a completion and this
  one was silent, so a screen-reader user got no confirmation and no focus.

**It holds its last sentence for the sitting, and that is the point rather than
a flaw.** The stylesheet reserves the line so nothing jumps when it fills. A
consequence worth knowing, already recorded in `tools/a11y.mjs`: a walk must
never assert `#status` is empty or freshly written, because it may still hold a
true sentence from an earlier act.

## What this does not settle

- **Whether the sentence ARRIVES.** Both gates that touch this say so in their
  own headers: a region can be visible, written and hidden in one turn, and that
  is a fact about the act rather than about the file. `live-check` holds
  visibility, this holds singularity, and the walk's registry measures a
  sentence where it appears. None of the three can watch a turn.
- **The surfaces with no sentence at all.** `bother.ts` gives three outcomes
  that nothing else on screen distinguishes; `focus.ts` never received the error
  fix its siblings got. Both now route through the announcer, and their missing
  sentences are their own work.
- **Whether `#status` should say who is speaking.** Several surfaces can write
  it, and a reader arriving at the line after a surface has gone has only the
  words to tell them which act it describes. No instance of that has been
  measured; it is named here so it is not rediscovered as new.
