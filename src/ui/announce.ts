// ONE SENTENCE, ONE LIVE REGION, AND IT MUST OUTLIVE THE ACT (ADR-0126).
//
// ## What went wrong
//
// Five surfaces write a confirmation into their own `role="status"` region.
// On some acts that region is still there afterwards and on some it is not —
// resolving the last passed date empties the replan section, taking the amnesty
// dismisses the re-entry greeting, marking a card done removes the card. When
// the act removes the region, the sentence is written and hidden inside one
// turn: a sighted reader watches the surface vanish with no explanation, and a
// screen reader may never announce a region hidden immediately after a write.
//
// `replan.ts` already had the diagnosis in a comment — "resolving the LAST card
// hides the whole section, and a live region inside a hidden element announces
// nothing, so on the one occasion most worth confirming the confirmation would
// have been silent" — and answered it by writing BOTH regions. That fixed the
// arrival and bought a second defect: `#status` is `role="status" aria-live`
// too, so a screen reader heard the same sentence twice. Seven sites did that.
//
// ## The rule
//
//   The act leaves its surface standing  ->  the surface's own region, alone.
//   The act removes its surface          ->  `#status`, alone, through here.
//
// `#status` is the place because it OUTLIVES every act on every surface: it
// sits beside the capture box (`public/index.html:199`), it already carries the
// capture confirmation, `src/plain.ts` keeps it even on the stripped surface —
// "the live region that says the write landed" — and it is where focus is sent
// when a section disappears, which every one of those handlers does explicitly.
//
// ## Why this is a module with one export
//
// The double-announce happened because five files each reached for `#status`
// themselves, so nothing could see that a sentence had two homes. One function
// is the single decision point, and `tools/announce-check.mjs` holds the
// invariant that makes it true: **nothing in `src/` names `#status` except this
// file.** A surface keeps writing its own region directly, as it always has —
// what it may no longer do is also write the lasting one.
//
// It does NOT clear anything. `#status` holds its last sentence for the sitting
// on purpose (`public/app.css` reserves the line so nothing jumps), which is
// what makes it readable after the surface has gone — and is also why a walk
// must never assert it is empty, a trap recorded in `tools/a11y.mjs`.

/** The one live region that no act on any surface removes. */
const lasting = (doc: Document): HTMLElement | null =>
  doc.querySelector<HTMLElement>('#status');

/**
 * Say it somewhere that is still there afterwards.
 *
 * For a confirmation whose own surface the act removes — the last replan card,
 * the amnesty, a card marked done. The caller must NOT also write its own live
 * region: two `aria-live` regions holding one sentence is one sentence said
 * twice, which is the defect this function's own existence is the fix for.
 *
 * Silent when the element is absent rather than throwing: a missing status line
 * is a shell defect the a11y walk and `live-check` both catch, and a render
 * that dies in a `.then()` would contradict a write that landed.
 */
export function sayLasting(msg: string, doc: Document = document): void {
  const el = lasting(doc);
  if (el) el.textContent = msg;
}
