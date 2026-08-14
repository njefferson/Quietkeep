# ADR-0091 · A control looks like a control, and a route has a return leg

**Status:** Accepted · **Date:** 2026-08-12 · **Shipped:** 2.1.0 · **Extends:** ADR-0090

## Decision

Every control on the work surface carries a border or a fill. And the jump added
in 2.0.8 gains its return leg: **Back to the top**, at the end of the held list.

## Why

Two questions, asked from a device, about the same defect: *how am I supposed to
know that is a button*, and *how do I get back*.

**Measured on the work surface at 390px: 50 controls, 45 with a border or a
fill, and 7 with no border, no fill and no underline.** Five of those seven were
every route off the page — the coverage claim, the tree, the Menu, sort mode,
and the jump to the list. The other two were card titles, which sit inside a
card that draws the box (ADR-0032's containment rule, working correctly).

So the app had **two visual languages**, and put every way of getting somewhere
in the one that reads as a paragraph of soft grey prose. There is one honest
answer to how you were supposed to know: you could not.

**The jump made it worse rather than better.** `.jump` was built on `.gauge`'s
shape deliberately, with a comment saying that shape "is already the idiom for a
line on this surface that takes you somewhere". That is true and it was the
wrong thing to preserve: the idiom was the defect, and consistency with it
propagated the defect to the one control added to fix reachability.

**And there was no way back — anywhere.** A search of the whole app returned
nothing: no back-to-top, no return. The jump sends a reader up to 4.9 screens
down at 390px and left them there. A one-way route is not a route.

## Consequences

- `.gauge` and `.jump` take `button.ghost`'s border and accent. Contrast went
  **up** as a side effect — 6.48:1 to 8.92:1 in light, 9.13:1 to 9.45:1 in dark.
- **A sixth was found by the check rather than by the eye:** `.behind-open`, the
  second thing the offer shows, had `border: 0` and a transparent fill, so it
  read as a caption under the first. That is the point of asking the document
  which controls render as prose instead of listing the ones you remember.
- The way back rides the same condition as the jump: if something was in the way
  going down, it is in the way coming back.
- Controls budget 214 → 215. A budget that refuses the return leg of a route it
  already permitted is being read as a score.

## What this does not change

- **Nothing moved.** No control changed position, so no MOVE line is owed
  (ADR-0076). They changed appearance, in the direction of the appearance every
  other control already had.
- **Still owed, and named as owed:** a way to reach each SECTION rather than
  only the list, and the kind of a thing on its card — a project renders exactly
  like a task today because `node.kind` is never put on a card.

## What would overturn it

- **A bordered control reading as a demand.** These are routes, not asks, and
  the border is the only claim being made. If a box on a row turns out to read
  as pressure, the answer is a different non-prose signal, never a return to
  prose.
