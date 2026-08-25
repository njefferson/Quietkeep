# ADR-0110 · Colour is checked by arithmetic, once per palette, not by rendering

**Status:** Accepted · **Date:** 2026-08-25 ·
**Changes what the accessibility gate MEANS for colour** ·
**Touches:** [0025](0025-visual-identity.md), [0098](0098-the-apps-own-size.md) ·
**Cites:** hub `PALETTES.md`, hub `palette-check.mjs`, hub LESSONS 28, 104

## Decision

The colour half of the accessibility gate splits in two.

**Structure**, measured in a browser, once per release: which (foreground role,
background role, floor) pairs the UI actually renders. `npm run colour:inventory`
walks every state under a **sentinel palette** — each of the seven colour roles
painted a unique probe value — so every computed colour maps to exactly one role
**by construction** rather than by luck. It writes `docs/colour-inventory.json`.

**Values**, arithmetic, per palette, no browser: `npm run palette:check` reads the
inventory and `docs/palettes.json` and checks every pair in every palette.

Adding a palette is an entry in `docs/palettes.json` and a block in the
stylesheet. **It needs no accessibility run.**

## Why, in numbers

The walk made **1,660 contrast assertions** in its last run — for two palettes.
About 830 each, roughly four minutes of browser each. A sixth palette would have
been twenty-four minutes, and every one of those runs re-measures the same thing.

It does not have to. Contrast is a property of a **pair**. Swapping a palette
changes token VALUES; it never changes which token a selector resolves to, nor
the size and weight it renders at — and size and weight are what decide whether a
pair needs 4.5:1 or 3:1. So the browser is needed for the structural half only,
and that half is identical for every palette.

**624 inventory rows reduce to THIRTEEN distinct pairs.** A palette is thirteen
computations.

## What the sentinel palette bought that nothing else could

A colour hard-coded in the stylesheet is contrast-checked like any other today,
so it passes — and then survives every palette swap unchanged, looking like the
product in one palette and like nothing in all the others. Under a sentinel
palette it is simply a colour that is not a sentinel, and that is a hard failure.

Extracting the first inventory found **thirteen form controls** — every
`<select>`, `<textarea>` and `<input type=date>` in the app — whose colours the
USER AGENT paints from `color-scheme`, not the palette. They are declared in
`.colour-ua-owned` with a reason each, held in **both directions**: an undeclared
one fails the extraction, and a declaration whose selector no longer renders a UA
colour fails it too, so an exemption cannot outlive the thing it exempts.

**And it found a shipped bug.** `applyTheme` set `data-theme` and never
`color-scheme`, so choosing *light* on a device set to dark turned the app cream
and left every form control white-on-grey — a hole in the page, on exactly the
setting the control exists to provide. Measured: `--bg` became `#F4F1E9` while the
select still rendered `rgb(255,255,255)` on `rgb(107,107,107)`.

**The old gate could not have found it.** It renders each theme under a device
set to match, so the one case that matters — a choice DISAGREEING with the device
— is the one case it never renders.

## What this does NOT do

It does not know which states exist. If the walk never visits a surface, its
pairs are not in the inventory and no arithmetic invents them. **This removes
repetition, not the need to walk the app.**

It covers text pairs. `--line` is a control boundary, a graphical object under
WCAG 1.4.11 at 3:1, and the sampler reads `color` and `background` only — the
rail floor is the hub's `palette-check.mjs`'s job, which is the instrument that
takes palettes in roles precisely so every app in the family can share it.

## How a stale inventory is prevented

`docs/colour-inventory.json` carries the same UI hash `.a11y-stamp` uses, and
`palette:check` refuses to answer if it does not match the tree. A gate checking
palettes against a structure the app no longer has is worse than no gate, because
it reports green. Same argument as the accessibility receipt, same hash, so the
two cannot disagree about what "this markup" means.

`colour:inventory` is declared in `.spine-exempt`: it WRITES a tracked file, and
CI regenerating the artefact a gate checks is how drift gets repaired instead of
reported — the argument `branch-guard` already makes about `--install`.

## Cost of leaving it

Every palette costs four minutes of browser forever, so the app has two.
