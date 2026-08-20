# ADR-0105 · A control that undoes a state does not live inside anything that state can hide

**Status:** Accepted · **Date:** 2026-08-20 · **Consequence of:** ADR-0104

## Decision

**`#nextup-plain-bar`, which carries the only control that turns *Just one thing*
off, moves out of the offer card** and sits below it as its own region of the
work surface. It is declared in `PLAIN_CHROME_KEPT`, not `PLAIN_KEPT`.

**The general rule this establishes: a control that undoes a state must not be a
descendant of anything that state can hide.** `tools/plain.mjs` asserts the
containment statically — `#nextup-plain-off` is not inside `<section id="nextup">`
— rather than asserting anybody's intention to keep it out.

## Why

### The offer card is hidden whenever nothing is asking, and the exit was in it

That is correct behaviour and long-standing: an empty morning says so rather than
showing an empty card. The mode is a module and **survives a reload by design**,
because a state you must re-enter every time the app reloads is one more thing to
operate on the day you can least afford it.

Put those two together and the state *mode on, nothing to offer* is reachable by
turning the mode on and then finishing or deferring the last thing. Rendered:
the screen carries capture, the proof line, `More`, the ⓘ and the footer, **and
no control anywhere that turns the mode off.**

### The defect predates ADR-0104 and its cost does not

Before the strip reached past the card, the same state left the reader stuck in a
mode with the whole work surface still under it — a mode with nothing left to
strip, and a usable app. After it, the same state is a blank screen.

**Nothing about the exit's markup changed in that release.** A release note about
what changed cannot see this, and no gate that reads a diff can either: the line
that became dangerous was not touched. It was found by rendering the state the
release had just made dangerous and looking at what was on it.

### The comment above it already said this

The element carried, directly above it, the sentence that entering the mode is a
choice, being unable to leave it would be a trap, and the reader who most needs
this state is least able to go looking for the exit. That was written when the
element was created and it was inside the container that hides.

**A comment stating a containment rule, written inside the container it forbids,
is the failure mode this repo keeps paying for.** The rule is asserted now.

## What this does not do

- **It does not change how the mode is entered.** Entering must not require
  finding a settings screen, and the way in is still on the offer card, where the
  reader already is.
- **It does not add a control.** The count of things on the worst day's screen is
  unchanged; one control crossed the boundary the a11y ceiling is drawn around,
  which is why that ceiling went 9 → 10 in the same release with no growth.
- **It does not rename the element.** The id keeps its `nextup-` prefix: it is
  still the offer mode's bar, and renaming would touch the stylesheet, three
  gates and the edition build for no fact.

## What would overturn it

A second, independent way to leave the mode that is visible from every state the
mode can produce — a control in the header, or in `More`. Then the bar's position
would be a layout question again rather than a containment one. Nothing proposes
that today, and adding a settings-screen route would contradict the mode's own
rule that leaving it must be one visible tap.
