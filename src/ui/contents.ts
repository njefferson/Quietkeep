/**
 * WHAT IS ON THIS PAGE, AND A WAY TO EACH OF IT (2.3.0, ADR-0093).
 *
 * The first thing ever asked of this app was PAGES OR TABS — the runway was one
 * long page and there was no way to reach any part of it. It got neither. The answer given at the time leaned on
 * product law 4 — *"the runway is the only workspace"* — and that is a
 * misreading of the law: law 4 is about ALTITUDE. It says a goal or an area is
 * an inspection mode rather than a place you go to work, so that levels push
 * down and the user never climbs. It says nothing at all about whether the
 * runway's own fourteen blocks can be reached, and reading it as *no
 * navigation* turned an invariant about hierarchy into a reason not to build a
 * way around the page.
 *
 * NOT TABS, and the old answer was right about that half. Tabs partition, and a
 * partition means remembering to check the other one — the exact failure this
 * app exists to prevent, and the same argument NOTES Q-10 made against splitting
 * the store into vaults. This is one page, in one order, with nothing hidden. It
 * only says what is on the page and takes you there.
 *
 * ## Every row is derived, and that is the whole reliability of it
 *
 * The name of a block is read from the element its own `aria-labelledby` points
 * at. So a contents row and the heading on screen and the string a screen reader
 * announces are the SAME STRING, by construction — they cannot drift, because
 * there is only one of them. Nothing here is a list of blocks to keep up to
 * date, and a block added to the runway shows up the day it is added.
 *
 * That is not a preference. A hand-written list of surfaces went stale in this
 * repo inside a day (the a11y walk's list of doors, 2.0.7), and the whole reason
 * `sheets.ts` closes every dialog rather than a known set is that the surface
 * most likely to be missing from a list is the one added last.
 *
 * A row exists only while its block is live: a contents entry for something that
 * is not on the page is a route to nowhere, and this audience should never be
 * handed a control that does not go where it says.
 */

import { closeSheet, openSheet } from './sheets.ts';
import { enter as enterStance } from './hub.ts';

/** A surface reached from here and from nowhere else.
 *
 *  2.8.1 (ADR-0099). This sheet answered "what is on this page" and the page it
 *  answered for was getting shorter — the worry entry, the load entry and sort's
 *  door came off the runway, and a control that has no door left is a feature
 *  that has been deleted for everybody who cannot find it.
 *
 *  DERIVED EXACTLY LIKE A STOP, for exactly the same reason: `data-contents-door`
 *  on the dialog, and the name read from whatever its own `aria-labelledby`
 *  points at. So the row, the sheet's heading, and the string a screen reader
 *  announces on arrival are ONE string. A door added later shows up the day it
 *  is marked, and a door whose title is rewritten cannot leave a stale row
 *  behind, because there is no second copy to go stale. */
export interface Door {
  /** The dialog's element id — `sheet-load-entry`, `sort`. */
  readonly id: string;
  /** Its title, read from its own `aria-labelledby`. */
  readonly name: string;
  /** What the surface publishes about its own state, or null. */
  readonly count: string | null;
}

/** Where the reader can be sent, in the order the page puts them. */
export interface Stop {
  /** The block's element id — `#nextup`, `#held`. */
  readonly id: string;
  /** Its accessible name, read from whatever labels it. */
  readonly name: string;
  /** What the block already publishes about its own size, or null. */
  readonly count: string | null;
  /** Where focus lands: the labelling element, which carries `tabindex="-1"`. */
  readonly focus: string;
}

/** The first row, always, and it is not a section: it is where capture is.
 *
 *  Somebody four screens into a list who wants to write something down has the
 *  same problem as somebody who wants to reach a block, and it would be strange
 *  to answer one and not the other. */
const TOP: Stop = { id: 'top', name: 'The top of the page', count: null, focus: '#capture' };

/**
 * Read the page. Live blocks only, in document order, named by their own labels.
 *
 * `main > section` and not `section`: the sheets are dialogs full of sections
 * too (the Menu is one), and a contents list that offered to jump you to a block
 * inside a closed dialog would be offering a route that does not exist.
 */
export function stops(doc: Document = document): Stop[] {
  const out: Stop[] = [TOP];
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('main > section[id]'))) {
    if (el.hidden) continue;
    // The hub is not a block on the page, it is the page you come up to
    // (3.0.0). Listing it would offer a route to where the list already is.
    if (el.getAttribute('data-not-a-stop') !== null) continue;
    const labelledBy = el.getAttribute('aria-labelledby');
    if (!labelledBy) continue;
    const label = doc.getElementById(labelledBy);
    // A heading whose text the app fills in at runtime is empty until it does.
    // Skipping it is right: a nameless row is a button that says nothing, which
    // is the wordless-button defect the held list already cost a release for.
    const name = (label?.textContent ?? '').trim();
    if (!name) continue;
    const countEl = doc.getElementById(`${el.id}-count`);
    const count = (countEl?.textContent ?? '').trim() || null;
    out.push({ id: el.id, name, count, focus: `#${labelledBy}` });
  }
  return out;
}

/**
 * Read the doors. Marked dialogs, in document order, named by their own titles.
 *
 * A door with no name is skipped, like a stop with no name: a row that says
 * nothing is a button that says nothing, and this app has already paid a release
 * for one of those.
 */
export function doors(doc: Document = document): Door[] {
  const out: Door[] = [];
  for (const el of Array.from(doc.querySelectorAll<HTMLDialogElement>('dialog[data-contents-door]'))) {
    const labelledBy = el.getAttribute('aria-labelledby');
    if (!labelledBy) continue;
    const name = (doc.getElementById(labelledBy)?.textContent ?? '').trim();
    if (!name) continue;
    // The surface's own words about its state, by the same convention a block
    // uses. This is what keeps a door from going silent: out of sight is the
    // collision the whole app is a rebuttal to, so a surface that holds
    // something says so on the row that reaches it.
    const count = (doc.getElementById(`${el.id}-count`)?.textContent ?? '').trim() || null;
    out.push({ id: el.id, name, count });
  }
  return out;
}

/**
 * Go somewhere.
 *
 * The sheet closes FIRST. A modal dialog makes the page behind it inert, so
 * scrolling underneath one moves nothing a reader can see, and landing focus on
 * an inert element does not land it at all.
 *
 * NO SMOOTH SCROLL, for the reason `#to-held` states: this is a jump, and an
 * animated one both costs time and moves the page under somebody who has
 * already looked away. `reduced motion` is the app's floor, not its exception.
 */
export function goTo(stop: Stop, doc: Document = document): void {
  closeSheet('sheet-contents');
  const focus = doc.querySelector<HTMLElement>(stop.focus);
  if (stop.id === 'top') {
    // The runway, not the window (2.9.0, ADR-0100). The document no longer
    // scrolls, so scrolling it is a call that moves nothing — and this row's
    // whole job is to get somebody back to the capture box.
    const runway = doc.querySelector<HTMLElement>('#runway');
    if (runway) runway.scrollTop = 0;
    else doc.defaultView?.scrollTo({ top: 0, behavior: 'auto' });
  } else {
    // INTO THE JOB (3.0.0, ADR-0108). A block is on screen only while it is the
    // stance, so scrolling to one that is not would move nothing and land focus
    // on an invisible heading — a row that goes nowhere, which is the one thing
    // this sheet has always refused to offer. Entering is what a row means now.
    enterStance(stop.id, doc);
    doc.getElementById(stop.id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  // Focus after the scroll, and `preventScroll` with it: the browser's own
  // scroll-into-view on focus would centre the heading and undo the `start`
  // alignment, putting the block's first line above the fold on a short screen.
  focus?.focus({ preventScroll: true });
}

/** One row, built the same way whichever list it lands in. */
function row(doc: Document, name: string, count: string | null, onGo: () => void): HTMLLIElement {
  const li = doc.createElement('li');
  li.className = 'contents-row';

  const go = doc.createElement('button');
  go.type = 'button';
  go.className = 'contents-go';

  const label = doc.createElement('span');
  label.className = 'contents-name';
  label.textContent = name;
  go.append(label);

  // The block's own words about its size, not a number this file invents.
  // Several blocks publish a sentence rather than a count ("3 waiting on
  // somebody"), and repeating it here is what makes the list answer "is it
  // worth going" as well as "how do I get there".
  if (count) {
    const c = doc.createElement('span');
    c.className = 'contents-count';
    c.textContent = count;
    go.append(c);
  }

  go.addEventListener('click', onGo);
  li.append(go);
  return li;
}

/** Build the rows. Called on every open, because the page changes underneath. */
export function paintContents(doc: Document = document): void {
  const doorList = doc.querySelector<HTMLUListElement>('#contents-doors');
  if (doorList) {
    doorList.replaceChildren(...doors(doc).map((door) => {
      const li = row(doc, door.name, door.count, () => openSheet(door.id));
      li.querySelector<HTMLButtonElement>('.contents-go')?.setAttribute('data-open', door.id);
      return li;
    }));
  }

  const list = doc.querySelector<HTMLUListElement>('#contents-list');
  if (!list) return;
  list.replaceChildren(...stops(doc).map((stop) => {
    const li = row(doc, stop.name, stop.count, () => goTo(stop, doc));
    li.querySelector<HTMLButtonElement>('.contents-go')?.setAttribute('data-go', stop.id);
    return li;
  }));
}
