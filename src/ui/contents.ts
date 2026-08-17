/**
 * WHAT IS ON THIS PAGE, AND A WAY TO EACH OF IT (2.3.0, ADR-0093).
 *
 * The first thing ever asked of this app was *"it is one long page, it needs
 * pages or tabs"*. It got neither. The answer given at the time leaned on
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

import { closeSheet } from './sheets.ts';

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
    doc.defaultView?.scrollTo({ top: 0, behavior: 'auto' });
  } else {
    doc.getElementById(stop.id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  // Focus after the scroll, and `preventScroll` with it: the browser's own
  // scroll-into-view on focus would centre the heading and undo the `start`
  // alignment, putting the block's first line above the fold on a short screen.
  focus?.focus({ preventScroll: true });
}

/** Build the rows. Called on every open, because the page changes underneath. */
export function paintContents(doc: Document = document): void {
  const list = doc.querySelector<HTMLUListElement>('#contents-list');
  if (!list) return;
  list.replaceChildren();
  for (const stop of stops(doc)) {
    const li = doc.createElement('li');
    li.className = 'contents-row';

    const go = doc.createElement('button');
    go.type = 'button';
    go.className = 'contents-go';
    go.dataset.go = stop.id;

    const name = doc.createElement('span');
    name.className = 'contents-name';
    name.textContent = stop.name;
    go.append(name);

    // The block's own words about its size, not a number this file invents.
    // Several blocks publish a sentence rather than a count ("3 waiting on
    // somebody"), and repeating it here is what makes the list answer "is it
    // worth going" as well as "how do I get there".
    if (stop.count) {
      const count = doc.createElement('span');
      count.className = 'contents-count';
      count.textContent = stop.count;
      go.append(count);
    }

    go.addEventListener('click', () => goTo(stop, doc));
    li.append(go);
    list.append(li);
  }
}
