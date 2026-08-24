// WHERE YOU ARE, as one answer (3.0.0, ADR-0108).
//
// The runway was 15 conditional sections in one scroller and reading it was
// reading an article: you had a position, never a place, and losing the position
// lost the thought. Reported from the device across several days, and the app's
// own thesis failing on the one thing the app created itself.
//
// A STANCE IS ONE SECTION, SHOWN ALONE. Not a dialog — ADR-0108 says a stance is
// a region the layout places, because a single-page wide layout is a roadmap
// item and a dialog owns the viewport by definition. The sections already ARE
// placed regions; what was missing was the rule that one of them is the screen.
//
// PURE, and it takes the live section ids rather than reading the DOM, so the
// refusal below can be asserted without a browser.

/** No stance: the hub, which is the surface you come up to. */
export const HUB = null;

/**
 * Which stance is actually showing, given what was asked for and what is live.
 *
 * **A stance whose section is not live resolves to the hub**, and that is the
 * whole reason this is a function rather than a stored string. The runway's
 * sections appear and disappear with the store — `#replan` exists only while a
 * date has gone by — so a remembered stance is a claim about a screen that may
 * not exist any more. Sending somebody to a blank one, or to a section hidden
 * behind `hidden`, is the "route to nowhere" `contents.ts` already refuses to
 * offer, arrived at from the other direction.
 *
 * Returning the hub rather than throwing is deliberate: the hub is always
 * correct, always populated, and is where somebody who has lost their place
 * wants to be anyway.
 */
export function stanceNow(asked: string | null, liveIds: readonly string[]): string | null {
  if (asked === null) return HUB;
  return liveIds.includes(asked) ? asked : HUB;
}

/** Is this section the one on screen? Used by the render to decide what to hide. */
export const showsSection = (stance: string | null, id: string): boolean =>
  stance === null ? false : stance === id;

/**
 * The hub is not a stance and must never appear as a door to itself.
 *
 * Its own id, kept here rather than in the markup's head, because two places
 * naming the same string is how a rename leaves one of them behind — the same
 * argument `contents.ts` makes for deriving every row from a live label.
 */
export const HUB_SECTION = 'hub';
