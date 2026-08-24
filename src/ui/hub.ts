// HOME, and the way into one job (3.0.0, ADR-0108).
//
// The landing view was 15 conditional sections in one scroller. This renders a
// list of doors instead, and shows exactly one section when you go through one.
//
// EVERY DOOR IS DERIVED from a marker on the section it opens — see
// `stanceDoors` below for what the first version got wrong and how rendering it
// showed that in one look. No second list of surfaces: one went stale in this
// repo inside a day, and a door naming a block that is no longer there is a
// route to nowhere.

import { stanceNow } from '../stance.ts';
import { jobsOf } from '../reach.ts';

/**
 * A STANCE IS DECLARED, on the section, with the name of the PLACE.
 *
 * The first version of this derived every `main > section` through `stops()`,
 * which is right for a Contents list and wrong here, and rendering it showed
 * why in one look: it offered *More room*, *Go to what you are holding ↓* and
 * *2 things, whenever you want them. Nothing here is asking.* Not every section
 * is a job — some are furniture — and a heading is a sentence about STATE while
 * a door needs the name of a place.
 *
 * So the name rides on the section, like `data-contents-door` rides on a dialog:
 * one marker, on the thing it describes, and a section that stops being a job
 * loses its door the day the attribute goes. There is still no second list.
 */
interface StanceDoor { readonly id: string; readonly name: string; readonly count: string | null }

function stanceDoors(doc: Document): StanceDoor[] {
  const out: StanceDoor[] = [];
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('main > section[data-stance-name]'))) {
    if (el.hidden) continue;                 // a job with nothing in it is not a door
    const name = (el.getAttribute('data-stance-name') ?? '').trim();
    if (!name) continue;
    // WHAT IS BEHIND IT, in the surface's own words — the same `<id>-count`
    // convention a Contents row already reads, so a block that publishes its
    // state says so here without being asked twice.
    const count = (doc.getElementById(`${el.id}-count`)?.textContent ?? '').trim() || null;
    out.push({ id: el.id, name, count });
  }
  return out;
}

/** Where you are. Not an event: where somebody is standing in the app is not a
 *  fact about their work, and the log has no business holding a trail of it —
 *  the argument `WHERE_KEY` already makes in `src/contexts.ts`. */
let asked: string | null = null;
/** A job asked for while its section was not yet live. One paint, then gone. */
let pending: string | null = null;

export const currentStance = (): string | null => asked;

/** The jobs that are live right now. */
const liveIds = (doc: Document): string[] => stanceDoors(doc).map(d => d.id);

/**
 * Paint the hub and the stance together, because they are one decision.
 *
 * Called on every render: the sections come and go with the store, so a stance
 * that was live a moment ago may not be, and `stanceNow` answers with the hub
 * rather than a blank screen.
 */
export function paintHub(hasWork: boolean, doc: Document = document): void {
  lastHasWork = hasWork;
  const runway = doc.querySelector<HTMLElement>('#runway');
  const list = doc.querySelector<HTMLUListElement>('#hub-doors');
  const bar = doc.querySelector<HTMLElement>('#stance-bar');
  if (!runway || !list || !bar) return;

  const live = liveIds(doc);

  // A JOB ASKED FOR BEFORE IT EXISTS, honoured ONCE (3.0.0). Pressing "Work on
  // this" starts a focus session, and `#focus` only becomes live once it has
  // started — so an `enter('focus')` at the moment of pressing resolves to the
  // hub and is thrown away. `pending` survives exactly one paint's worth of that
  // gap and is then cleared, so a section reappearing later can never yank
  // somebody into a job they asked for minutes ago and left.
  if (pending !== null && live.includes(pending)) { asked = pending; pending = null; }

  const now = stanceNow(asked, live);
  // Resolved, not remembered: if the section has gone, so has the stance, and
  // the next render must not keep trying to reach it.
  asked = now;

  // WHAT BELONGS TO THE JOB, which is not only its section.
  //
  // `<main>` carries about fifteen pieces of furniture BETWEEN the sections, and
  // several belong to a job rather than to the page: `#triage-undo` is the undo
  // bar for sorting and sits outside `#triage` entirely. Hiding everything but
  // the active section took it with them — file something into a place and the
  // way to undo it was gone. Found by the accessibility walk, and it would have
  // been found on the device the first time somebody filed by mistake.
  //
  // DECLARED, and mostly already declared: `data-narrows` has said for releases
  // which surface an element belongs to, so the situation controls and the lens
  // row need nothing new. `data-stance-part` covers the few that narrow nothing
  // and simply belong — a job's own undo bar, its do-now slot, the held fold.
  // ONE ANSWER TO "WHAT BELONGS TO THIS JOB", shared with `src/reach.ts`
  // (3.0.0). This rule used to be written here and again in the browser walks,
  // and the two disagreed fourteen times in one afternoon — every disagreement
  // silent, because a walk that declines to navigate looks exactly like a walk
  // that had no need to. The rule now has one home and both callers read it.
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('#runway main > *'))) {
    el.classList.toggle('stance-on', now !== null && jobsOf(el).includes(now));
  }
  // THE HUB ONLY EXISTS ONCE THERE IS WORK TO CHOOSE BETWEEN.
  //
  // Not "are any sections live": `#search` and `#held` are always live, so an
  // EMPTY store showed a hub offering *Find something* and *Everything you are
  // holding* — two doors onto nothing — while hiding the newcomer's route to
  // restoring from a copy behind them. The accessibility walk found it by being
  // unable to reach `#restore-go` at all.
  //
  // The store's own answer, passed in, because this module reads the DOM and the
  // DOM cannot tell an empty list from a list nobody has painted yet.
  const anyJobs = hasWork && live.length > 0;
  if (anyJobs) runway.setAttribute('data-hub', '');
  else runway.removeAttribute('data-hub');

  if (now === null) runway.removeAttribute('data-stance');
  else runway.setAttribute('data-stance', now);
  bar.hidden = now === null;

  if (now !== null) return;                    // the doors are only read on the hub

  list.replaceChildren(...stanceDoors(doc)
    .map((s) => {
      const li = doc.createElement('li');
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'hub-go';
      // A STABLE HOOK FOR THE WALKS. They must reach a job the way a finger
      // does — through its door — or they measure a state no person can arrive
      // at, which is this repo's oldest defect (see `tools/look.mjs`'s header).
      // Selecting by position would break the moment a door appears or goes.
      b.dataset.stanceId = s.id;
      const name = doc.createElement('span');
      name.className = 'hub-name';
      name.textContent = s.name;
      b.append(name);
      // WHAT IS BEHIND THE DOOR, in the surface's own words. A door that says
      // nothing about what it holds is the out-of-sight collision this whole app
      // is a rebuttal to. It is never a bare number standing alone — the count
      // element publishes a sentence, and law 8 forbids a figure that reads as
      // how far behind you are.
      if (s.count) {
        const c = doc.createElement('span');
        c.className = 'hub-count';
        c.textContent = s.count;
        b.append(c);
      }
      b.addEventListener('click', () => { enter(s.id, doc); });
      li.append(b);
      return li;
    }));
}

/** Go into one job. */
export function enter(id: string, doc: Document = document): void {
  asked = id;
  pending = id;
  paintHub(lastHasWork, doc);
  const runway = doc.querySelector<HTMLElement>('#runway');
  if (runway) runway.scrollTop = 0;
  // Focus the heading, not the first control: arriving with focus on a button
  // means the first thing a screen reader says is a control rather than where
  // you have arrived, and `contents.ts` settled this the same way.
  const el = doc.getElementById(id);

  // TWO DOORS TO ONE JOB COLLAPSE (ADR-0108).
  //
  // A job may hold its own opener — `#triage-open`, "Sort what you have put
  // down" — which existed because the runway had no way in and capture must not
  // drag you into deciding (1.39.2). The hub door IS that way in now, so
  // arriving at the job and then being shown a button asking whether you want
  // the job is the old shape surviving inside the new one. Rendering it showed
  // exactly that: the Sort stance opened onto a section with no card in it.
  //
  // Declared on the control rather than named here, so a job that grows an
  // opener gets this without anybody editing this file — and the button still
  // works on a store with no hub, where it is the only way in.
  // ONLY WHEN THE JOB IS NOT ALREADY OPEN. The opener resets the surface to its
  // first question, so pressing it on a job already in progress throws away
  // whatever was half-answered — a place picker mid-flow, in the case that found
  // this. Arriving somewhere should never undo what is already there.
  const opener = el?.querySelector<HTMLButtonElement>('[data-stance-opener]');
  const alreadyOpen = !!el?.querySelector('.route');
  if (opener && !opener.hidden && !alreadyOpen) opener.click();

  const labelledBy = el?.getAttribute('aria-labelledby');
  if (labelledBy) doc.getElementById(labelledBy)?.focus({ preventScroll: true });
}

/**
 * REPAINT WHEN A JOB APPEARS OR GOES, rather than hoping to be called last.
 *
 * The door list is a function of which sections are showing, and the sections
 * reveal themselves from their own modules — `#triage` un-hides itself after a
 * capture, from a path that runs after `refreshAll` has finished. So the hub
 * painted one beat stale and a thought captured on the hub produced no door to
 * sort it: the section was live, visible, and had no way in.
 *
 * Ordering `paintHub` after one more painter would have fixed that one case and
 * left the next module to find the same edge. Watching the attribute is the
 * version that cannot drift, because a section added later is watched the day it
 * is added and nobody has to remember this file exists.
 *
 * Cheap: one observer, `hidden` only, and `paintHub` is idempotent — it writes
 * the same DOM for the same state, so a redundant call costs a comparison.
 */
let lastHasWork = false;
export function watchJobs(doc: Document = document): void {
  const main = doc.querySelector('#runway main');
  if (!main || typeof MutationObserver === 'undefined') return;
  new MutationObserver(() => { paintHub(lastHasWork, doc); })
    .observe(main, { attributes: true, attributeFilter: ['hidden'], subtree: true });
}

/** Come back up. The hub is always correct and always populated, which is why
 *  it is where somebody who has lost their place is put. */
export function leave(doc: Document = document): void {
  asked = null;
  pending = null;
  paintHub(lastHasWork, doc);
  const runway = doc.querySelector<HTMLElement>('#runway');
  if (runway) runway.scrollTop = 0;
  doc.getElementById('hub-heading')?.focus({ preventScroll: true });
}
