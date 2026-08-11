# ADR-0088 · The claim and the tree are places, not folds

**Status:** Accepted · **Date:** 2026-08-11 · **Extends:** ADR-0083 · **Amends:** ADR-0013, ADR-0084

## Decision

The two controls above the held list — the coverage gauge and **How it hangs
together** — stop unfolding their contents into the workspace and become
**sheets**, opened from exactly the controls that always stated them.

- **Neither is in More.** ADR-0083 named "six destinations becoming twelve" as
  the thing that would overturn it, and these are not destinations to browse to:
  each is the contents of a claim made in a specific place on the workspace.
  The control stays where it was, the words it carries are unchanged, and what
  changed is where its contents land.
- **Neither control is a disclosure any more**, so neither carries
  `aria-expanded` or `aria-controls`. A button that opens a dialog is not an
  expander, and one that says it is tells assistive technology something untrue.
- **One surface at a time**, and it now binds the whole app: `src/ui/sheets.ts`
  owns `openSheet` / `closeEverything` / `sheetOpen`, and the detail sheet closes
  whatever it was opened from. Walking from a tree row into a thing's own sheet
  puts the tree away rather than stacking two modals.

## Why

The measurement, at 820×1180 on the store the app generates to try things on
(566 things, 523 held):

- The whole surface ran to **17,777px — 15.1 screens**, before either control
  was touched.
- Opening the claim added **26,031px**; opening the tree added **17,246px**.
  Together, with the Menu, the surface reached **63,906px — 54.2 screens.**
- Both unfolded **above the held list**, so opening either pushed the list the
  reader was already looking at down by twenty-two screens.

**ADR-0083 already decided this, one surface over.** It retired the (i) panel's
folding groups and stated the cost in general terms: *"Opening a group scrolls
the others out of reach… the fold changes how much stands in front of you and
not how far you have to travel, and travel is what was expensive."* Every word
applies here, against numbers larger than the panel's ever were. The argument
was accepted on 2026-08-10 and the two biggest folds in the app were not looked
at, because they were on a different screen.

**The tree's own ADR had already said it.** ADR-0013 called it *"never the
landing view; an inspection mode, not a workspace"*, and the comment saying so
sat directly above markup that unfolded it into the workspace for thirty-four
releases. A sentence in an ADR is not a mechanism.

**The claim is the one thing that must be cheap to check.** ADR-0084 put the
proof before the inventory because the question is about the container. A proof
that costs twenty-two screens of scroll to leave is a proof read once.

## What this does not change

- **Not a tab bar, and not a second workspace.** Law 4 — *the runway is the only
  workspace; altitude views are inspection modes, not places to work* — is the
  reason. Both of these are inspection modes and they now look like it. Nothing
  was split off the runway, and the held list did not move.
- **No URL routing, no history entries, no back-button semantics**, exactly as
  ADR-0083 has it. These are modal sheets like every other surface here.
- **The rows still build only on open**, for the reason `buildCoverage` gives:
  at 1,429 held things, rebuilding them unseen is ~4,300 DOM elements thrown
  away per repaint. The live repaint asks `sheetOpen(id)` where it used to ask
  `!el.hidden` — the same question about the same reader.
- **Nothing is remembered about which sheet was open**, per ADR-0083.

## What this costs

- **The place in the tree is lost when you walk through a row.** Two stacked
  modals is the overlap ADR-0083 forbids, and the top one eats the other's taps.
  The tree rebuilds from state on open, so returning is one press and never a
  stale view — but it is a real loss and it is the trade this makes.

## What it does not fix, and should not be read as fixing

**The workspace is still one scroll, and the sections above the held list still
stack.** On a full store nine of them render at once and total 2,715px before
the list begins. Each is conditional and individually justified; nothing bounds
their sum. Law 8 bounds the re-entry greeting explicitly — *Next-up + ≤3 triage
+ gauge + amnesty offer, never the backlog* — and that bound governs the
re-entry path only, not the everyday surface.

That is a separate decision, it is not made here, and this release must not be
described as having made it.

## What would overturn it

- **Evidence that arriving is worse than unfolding for these two specifically.**
  ADR-0083 offered the same test for itself and it is still the honest one:
  the claim is that travel dominates tap count for this audience.
- **A third and fourth control growing the same way.** Two sheets opened from
  the workspace is a pattern; five is a navigation model nobody designed, and
  the answer then is to design one rather than to keep adding doors.
