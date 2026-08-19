// WHEN THE FRAME STANDS DOWN (2.9.2).
//
// 2.9.0 took capture, the proof line and the destinations out of the scroller so
// they cannot scroll away, and capped the frame at half the viewport so it could
// never crush the runway at large text. The cap was the right instinct and the
// wrong remedy: `overflow-y: auto` on the frame means that once its content
// exceeds the cap it SCROLLS INSIDE ITSELF, and what a reader sees is the proof
// line cut through the middle of its own sentence.
//
// Reported from a device at a larger text size, and reproduced at 390px: at 175%
// browser text the frame's content is 474px against a 422px cap; at the app's own
// 150% it is 468px. In both the gauge is clipped.
//
// A box cut in half is this app implying something has been lost, which is the
// one thing it may not do — it is the same objection as a fold that hides the end
// of a list, and it is why the coverage claim exists at all.
//
// So the frame is a LUXURY THAT ONLY PAYS WHEN IT IS SMALL. When it will not fit
// in its share, it stops being a frame and becomes ordinary page content again,
// and the whole document scrolls exactly as it did before 2.9.0 — a layout that
// shipped for months and is known good. Nothing is clipped, nothing is hidden,
// and the reader loses a convenience rather than a sentence.
//
// This file is the decision alone, with no DOM in it, because a threshold with
// hysteresis is exactly the kind of thing that is easy to get subtly wrong and
// cheap to pin down.

/** The frame may take up to this share of the viewport before it stands down. */
export const FRAME_MAX_SHARE = 0.5;

/**
 * And it comes BACK only at a lower share than it left at.
 *
 * Without the gap this oscillates: standing down changes the layout, the layout
 * changes the frame's natural height, and a height that lands near the threshold
 * flips on every measurement. The reader sees the page rebuild itself. A single
 * threshold is the bug; the gap is the fix.
 */
export const FRAME_BACK_SHARE = 0.42;

/**
 * Should the frame stand down?
 *
 * `natural` is the frame's content height — `scrollHeight`, not the box, because
 * once it is capped the box stops answering the question being asked.
 *
 * Returns the NEW state, given the current one. Called with the same numbers it
 * returns the same answer, so a caller may run it on every resize without
 * thinking about it.
 */
export function frameShouldStandDown(
  natural: number, viewport: number, currentlyDown: boolean,
): boolean {
  // A viewport of zero is a page that has not been laid out yet. Answering
  // "stand down" there would flash the fallback layout on every load.
  if (!(viewport > 0) || !(natural > 0)) return currentlyDown;
  const share = natural / viewport;
  return currentlyDown ? share > FRAME_BACK_SHARE : share > FRAME_MAX_SHARE;
}
