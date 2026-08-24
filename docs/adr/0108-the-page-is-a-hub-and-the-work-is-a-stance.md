# ADR-0108 · The page is a hub, and the work happens in a stance

**Status:** Accepted · **Date:** 2026-08-24 ·
**Reverses:** [0093](0093-a-way-to-each-part-of-the-page.md)'s conclusion that the
answer to *this page needs pages* is navigation to blocks ·
**Supersedes the workspace half of:** [0100](0100-the-frame-stays.md) ·
**Touches:** [0099](0099-the-first-screen.md), [0101](0101-the-frame-stands-down.md),
[0104](0104-the-worst-day-is-the-whole-screen.md) ·
**Cites:** law 4, law 8, `docs/nd-collisions.md` entries 17, 18

## Decision

**The runway stops being the workspace.** The app becomes a **hub** — one surface
you come up to — and a set of **stances**, each a full screen that is only one
job, each with the same way out.

A stance is not a tab. Tabs are peers you switch between and must remember to
check. A hub is a place you leave and return to, and **returning tells you the
whole truth about what is waiting**, so nothing is ever behind a door you forgot.

## What this reverses, and why the old argument does not bind

ADR-0093 opens on the first thing ever asked of this app: that one long page
needs pages or tabs. It refused both, correctly identified that the earlier
answer had misread law 4 — law 4 is about ALTITUDE, not about navigation — and
then built a way to *reach* each block. That was a real improvement and it
answered a different question from the one being asked.

**The refusal rested on one argument: a partition means remembering to check the
other one.** That argument is sound and it is why this record does not propose
tabs. It does not reach a hub. The failure it names is *forgetting a place
exists*; a hub is entered from a surface that lists every place and what is
waiting in it, so the forgetting has nowhere to happen.

**It is also an argument made at a desk.** One long scrolling page with
navigation is a desktop shape: a wide viewport shows several blocks at once, so
position in the document reads as location. These apps are used on a TABLET, BY
TOUCH, where one block fills the screen and position reads as nothing at all.
This repo has been round this exact corner before — hub LESSONS §95, the skip
link that was textbook-conformant and unreachable by finger for 142 releases,
because conformance is defined for input methods in general and this app has one.

## The measurement that says moving blocks cannot fix it

**ADR-0099 and ADR-0100 both measured rearrangement and both returned small
numbers.** 0099 found that reordering moved the offer 42px and that the floor in
a scrolling shell is about 0.36 screens, because header and capture take 236px
before anything else exists. 0100's response was to lift the frame out of the
scroller, which is the best available move inside the page model and which 0101
then had to make stand down at 175% text, because at that size the frame is 474px
against a 422px cap.

That is the shape of a model at its limit: each step is correct, each buys less
than the last, and the thing being optimised is the wrong object. **The runway
today is 15 conditional sections in one scroller, beside 21 dialogs.** No
ordering of 15 blocks produces a sense of place, because a document does not have
places — it has a position, and a position is exactly what a reader loses.

## What the app actually is

Not a list with features around it. A set of **stances** — ways of attending,
each wanting the others off the screen:

- **putting something down** — not a stance but a reflex, and it must work from
  inside every screen;
- **sorting what has been put down**;
- **choosing what to do now**;
- **doing one thing**;
- **reckoning with what has slipped**;
- **tending what recurs** — the operations-and-maintenance half;
- **waiting on someone else to come back with something**;
- **planning**: what is held, what is being aimed at or is owed, and whether the
  two match — which is the only stance with no home in the app today.

`src/kinds.ts` already models every one of these: `area`, `role`, `goal`,
`outcome`, `project`, `upkeep`, `aspiration`, `waiting-for`, `action`, `pebble`.
The vocabulary has been right for months and the surface has been one page.

## Consequences

- **Home is not a shorter runway.** It is a different object: doors that say what
  is behind them in the reader's own terms. It carries no count that reads as
  debt — law 8 binds, and it is the same rule that keeps an import out of the
  gauge (2.38.0).
- **A stance must survive being left.** Coming back puts the same thing in front
  of you, not the top of a re-sorted list. This is the defect being fixed, so it
  is the assertion that has to exist rather than the one that is assumed.
- ***Just one thing* stops being a mode.** ADR-0104 made the worst day the whole
  screen; every stance is now already one thing, so what 0104 asked for becomes
  the ordinary case rather than a state to switch on. That record's reasoning
  survives intact — it was right about the destination and could only get there
  by adding a mode to a page.
- **The frame's stand-down stops being load-bearing.** 0101 exists because a
  frame carrying five things cannot fit at large text. A screen carrying one job
  does not have that problem, and nothing that matters is parked where it
  vanishes at 175%.
- **Two doors to one job collapse.** Sorting is `#triage` on the runway and the
  `sort` sheet behind Contents — the same work, reached two ways, neither of them
  the place you are.

## A stance is a placed region, not a dialog

**Because a single-page wide layout is a roadmap item, not a rejected idea.** One
page is wrong for a phone held in one hand; on a PC or a full-screen tablet it is
a legitimate target, where a wide viewport can show several stances at once and
position on screen genuinely does read as location.

So the mechanism must not foreclose it. `<dialog>` owns the viewport by
definition and can never become one pane of a multi-pane layout, which rules it
out despite `sheets.ts` being the obvious reuse — its full-screen shape is the
part that does not survive.

**A stance is therefore a region the layout places**, and it must never assume
its own size. Narrow shows exactly one and the hub is a place you return to;
wide can show the hub beside one or more stances. Same definitions, one set of
behaviours, two arrangements — not a second implementation, and not a phone app
with a desktop mode bolted on.

The thing that would make this expensive later is building three stances as
dialogs first. It is written down here so that does not happen.

## What does not change

Every product law. The write boundary. The closed vocabulary. Capture staying
frictionless and reachable — which becomes harder in a screen model, not easier,
and is the single most likely thing to be got wrong here. Nothing is partitioned:
the hub shows what is waiting everywhere, and a stance hides nothing that the hub
will not tell you about the moment you come up.

## Cost of leaving it

A store of 1,214 things, held safely, with the reader unable to say where they
were in the app or what they had been doing — the app's own thesis, *out of
sight, never out of mind*, failing on the one thing it created itself.
