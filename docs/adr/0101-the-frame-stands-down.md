# ADR-0101 · The frame stands down rather than cutting its own content in half

**Status:** Accepted · **Date:** 2026-08-18 · **Shipped:** 2.9.2 ·
**Amends:** [0100](0100-the-frame-stays.md)

## Decision

When the frame's content would take more than **half the viewport**, it stops
being a frame. The shell reverts to ordinary page content and the document
scrolls, exactly as it did before 2.9.0. It comes back only below **42%**, so a
height sitting near the line cannot flip on every measurement.

## Why

ADR-0100 capped the frame at `50dvh` so it could never crush the runway at large
text, and gave it `overflow-y: auto` so it would scroll rather than overflow.
That was the right instinct and the wrong remedy, and its own consequences
section said what it expected to happen — *"at the extreme the proof line is one
small scroll away rather than gone."*

What actually happened, reported from a device at a larger text size, is that the
proof line was **cut through the middle of its own sentence**. Reproduced at
390px:

- **175% browser text** — 474px of frame content against a 422px cap
- **200% browser text** — 530px against the same cap
- **this app's own 150%** — 468px against the same cap

In each the gauge is clipped. A box cut in half is this app implying something
has been lost, which is the one thing it may not do — it is the same objection
that retired the folds in ADR-0083 and the reason the coverage claim exists at
all. "One small scroll away" was a guess about how a capped scroller would read,
and the guess was wrong in a way only a device could show.

## The shape of the fix

**The frame is a luxury that only pays when it is small.** Below the threshold it
is worth a fifth of the screen. Above it, the honest thing is not to shrink it,
not to clip it, and not to let it eat the runway — it is to stop having one. The
fallback is not a new layout that needs proving: it is the layout that shipped
for months before 2.9.0.

This is the same move as `#capture-paste` shipping hidden where the browser
cannot read a clipboard, and as the floating Contents button being removed rather
than tuned. A feature that cannot do its job is not offered.

## Hysteresis, and why it is not a detail

Standing down changes the layout, the layout changes the frame's natural height,
and a height near a single threshold would flip on every measurement — what the
reader sees is the page rebuilding itself while they read. Two thresholds, and
the gap between them is the fix. It has its own test, because the wrong version
does not look wrong in code.

The decision lives in `src/frame.ts` with no DOM in it, for the same reason.

## Where it actually lands

Measured on the thirteen-item sample, at real sizes:

- phone 390×844 — 34%, frame up
- phone with the address bar, 390×664 — 43%, frame up
- iPad 820×1180 — 18%, frame up
- 320×568 — 59%, **stood down**

So no reader on a real device loses the frame at ordinary text. It goes at very
small viewports and at large text, which are exactly the cases it was costing
too much in.

## Consequences

- `scrollRunwayToTop` scrolls **both** the runway and the window. Which one is
  the scroller depends on a mode the caller has no business knowing, and each is
  a no-op in the other — the alternative is a way back that silently does
  nothing at exactly the text size somebody needed it most.
- **Two gate assertions were measuring in a mode they could not name.** The
  contents jump reported 1,419px of error at a small viewport, because it took
  the runway's top as its origin while the document was the thing that had
  scrolled; and it then reported −8px, because it allowed for a
  `scroll-padding-top` that only exists on the runway. Both now read the mode
  first and say which one they measured in. A check that cannot say which layout
  it measured cannot be trusted in either.
- The a11y walk drives **eight sizes across both mechanisms** — the browser's own
  text and the app's own setting — and asserts at each that the frame fits or has
  stood down and the proof line is whole. It also asserts that at 200% it has
  *actually* stood down, so the loop cannot pass by never reaching a size that
  matters.

## What would overturn it

The threshold proving wrong in use — a frame that stands down while it was still
worth having, or one that hangs on past being useful. Both are one number, and
the number is in one file with its own tests.
