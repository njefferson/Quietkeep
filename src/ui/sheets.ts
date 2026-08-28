/**
 * ONE SURFACE AT A TIME — the discipline, in one place (ADR-0083, ADR-0088).
 *
 * ADR-0083 gave the app destinations and stated the rule that makes them work:
 * opening one closes whatever was open, because two open dialogs overlap and the
 * top one eats the other's taps. That rule lived inside `about.ts`, reachable
 * only by the navigation block that happened to be written beside it — so the
 * second surface that needed it (the coverage claim, ADR-0088) could not have
 * obeyed it without either importing half of `about.ts` or copying the rule.
 *
 * A copied rule is not the same rule. It is here so that a sheet added anywhere
 * in the app gets the discipline by construction rather than by remembering.
 *
 * `closeEverything` closes EVERY open dialog rather than a list of known ids.
 * A list is a thing to keep up to date, and the surface most likely to be
 * missing from it is the one added last — which is the one most likely to be
 * left open underneath.
 */

/** Repaints registered per sheet id, run at the moment that sheet opens.
 *
 *  A sheet that reads from the log must repaint on open or it shows the state
 *  the app was in when it started. That defect has been found and fixed three
 *  times in this repo — the calendar count, the anchor list, and every sheet
 *  ADR-0083 split out of the panel — so the hook is part of opening rather than
 *  something each caller remembers to do afterwards. */
const repaints = new Map<string, () => void>();

/** Register what a sheet repaints when it opens. Called once, at mount. */
export function onSheetOpen(id: string, paint: () => void): void {
  repaints.set(id, paint);
}

/** Close every open dialog. Exported because two callers need the close half
 *  without the open half: the walk, and anything that dismisses a surface
 *  without arriving anywhere. */
export function closeEverything(except?: string): void {
  for (const d of Array.from(document.querySelectorAll<HTMLDialogElement>('dialog'))) {
    if (d.open && d.id !== except) d.close();
  }
}

/**
 * Arrive at one place. Returns false if there is no such sheet, so a caller can
 * fall through to something else — which is what More does for the ⓘ.
 *
 * The repaint runs AFTER `showModal`, not before: a painter that measures
 * anything measures a laid-out element, and `hidden` until the same frame is
 * the shape that made the first version of the stuck-update strip unmeasurable.
 */
/**
 * PUT THE FOCUS SOMEWHERE THE APP CHOSE, not wherever the engine lands (3.8.2).
 *
 * A `<dialog>` with no `autofocus`, no `tabindex="-1"` target and no `.focus()`
 * after `showModal()` leaves the choice to the browser — and the two engines
 * choose differently. Chromium makes a scrolling region focusable in its own
 * right, so it lands on the sheet body at the top and everything looks correct.
 * WebKit does not: it takes the first tabbable element instead, and focusing
 * something inside a scroller scrolls that scroller to it. **So a long sheet can
 * open partway down, past the thing it exists to say.**
 *
 * This app is read on an iPad, and every walk in this repo drives Chromium —
 * which is the one engine where the defect cannot appear. Nothing here was
 * broken in anything that was ever measured. (Hub LESSONS 175.)
 *
 * THE TARGET IS THE ELEMENT THE DIALOG IS ALREADY NAMED BY. Every sheet carries
 * `aria-labelledby`, so there is no list to keep — the same reason `data-door`
 * is on the sheet and the page population is read from the app's own links. A
 * heading is also the right destination on its own terms: it is the house rule
 * for a navigated view, and `tour.ts`, `replan.ts` and `focus.ts` have all
 * focused theirs for releases. These two surfaces were the ones that never did.
 *
 * `tabIndex = -1` is set here rather than in the markup so a sheet cannot be
 * added without it — a target that has to be remembered in a second file is the
 * hand-written mirror this repo keeps finding stale.
 */
export function focusSheetTitle(sheet: HTMLDialogElement): void {
  const id = sheet.getAttribute('aria-labelledby');
  const title = id ? sheet.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
  if (!title) return;
  title.tabIndex = -1;
  title.focus();
}

export function openSheet(id: string): boolean {
  const sheet = document.querySelector<HTMLDialogElement>(`#${id}`);
  if (!sheet) return false;
  closeEverything(id);
  if (!sheet.open) sheet.showModal();
  focusSheetTitle(sheet);
  // A painter that throws must not leave the reader on a surface that never
  // opened — the sheet is already up, and an empty one is recoverable by
  // closing it. Contained like every other surface in this app.
  try { repaints.get(id)?.(); } catch { /* the next open repaints it */ }
  return true;
}

/** Put one sheet away, by name.
 *
 *  Used where an inspection surface hands the reader on to a working one: the
 *  tree and the coverage claim close as you walk through a row, because two
 *  stacked modals is the overlap ADR-0083 forbids.
 *
 *  Deliberately NOT `closeEverything` at the destination's end. The detail sheet
 *  is also how the sort conveyor shows you a card, and sort is a surface you
 *  come back to — closing it there ends the sitting. The surface that has
 *  nothing to come back to is the one that closes itself. */
export function closeSheet(id: string): void {
  document.querySelector<HTMLDialogElement>(`#${id}`)?.close();
}

/** Is this sheet the surface being looked at right now?
 *
 *  Live repaints ask this: rows are rebuilt only for a reader who is actually on
 *  the surface, because at 1,429 held things rebuilding them unseen is ~4,300
 *  DOM elements thrown away per repaint (measured). It replaced `!el.hidden`,
 *  which asked the same question of a fold. */
export function sheetOpen(id: string): boolean {
  return Boolean(document.querySelector<HTMLDialogElement>(`#${id}`)?.open);
}

/**
 * Wire a sheet's own Close, and its backdrop-less escape.
 *
 * Every sheet carries its own Close OUTSIDE the scrolling body (ADR-0083 §4),
 * so the way out never scrolls away. This binds it by convention — `#<id>-close`
 * — which is what the five sheets ADR-0083 created already used.
 */
export function wireSheetClose(id: string): void {
  document.querySelector<HTMLButtonElement>(`#${id}-close`)
    ?.addEventListener('click', () => document.querySelector<HTMLDialogElement>(`#${id}`)?.close());
}
