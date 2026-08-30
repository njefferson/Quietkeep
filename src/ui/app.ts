// Quietkeep — the shell and the Dump surface.
//
// Phase 1 item 8: zero chrome, one line per card, drafts persisted per
// keystroke. Capture comes before anything that displays it, because an app
// that captures and does nothing else is already useful and the reverse is not
// (build-plan §3).
//
// This file reads state and emits intents. It never touches the log — every
// write goes through `session.commit`, which goes through the gate.

import { openSession, captureEvent, type Session } from './session.ts';
import type { AppEvent } from '../events.ts';
import { coverageGauge, heldWork } from '../gate.ts';
import type { NodeState } from '../fold.ts';
import { mountAbout } from './about.ts';
import { mountTour } from './tour.ts';
import { mountUpdatePrompt } from './update.ts';
import { loadBadgePreference, paintBadge } from './badge.ts';
import { CURRENT } from './changelog.ts';
import { mountTriage } from './clarify.ts';
import { openSheet, closeSheet, wireSheetClose, onSheetOpen } from './sheets.ts';
import { paintContents } from './contents.ts';
import { frameShouldStandDown } from '../frame.ts';
import { mountWork } from './work.ts';
import { mountDetail } from './detail.ts';
import { mountSearch } from './search.ts';
import { mountSort } from './sort.ts';
import { mountFocus, type FocusUI } from './focus.ts';
import { mountReentry } from './reentry.ts';
import { mountBother } from './bother.ts';
import { mountLoad, type LoadUI } from './load-ui.ts';
import { mountClock, type ClockUI } from './clock-ui.ts';
import { mountPrint } from './print.ts';
import { mountReplan } from './replan.ts';
import { doneEvents } from './work.ts';
import { contentsWords, heldGroups, heldStatus, liveChildCounts, placeWords } from '../held.ts';
import { servesWords } from '../serves.ts';
import {
  roleNames, roleLoads, allRoles, ROLE_READOUT_WORDS,
  roleAttention, roleAttentionWords, roleAttentionRowWords,
} from '../roles.ts';
import {
  horizonRows, holdsWords, rhythmWords, horizonEmptyWords,
  HORIZON_WORDS, HORIZON_READOUT_WORDS,
} from '../horizons.ts';
import { CONTAINER_KINDS } from '../tree.ts';
import { reviewExceptions, reviewWords } from '../review.ts';
import { composedFor, todayIsOn } from '../composed.ts';
import { LENS_KEY, lensChoices, lensWords, underLensIds } from '../lens.ts';
import { SCALE_KEY, applyScale, getScale, setScale, normaliseScale } from '../scale.ts';
import { THEME_KEY, applyTheme, getTheme, setTheme } from '../theme.ts';
import { PALETTE_KEY, applyPalette, getPalette, setPalette } from '../palette.ts';
import { ARRIVAL_KEY, WHERE_KEY, allContexts, contextNames, fitsHere, offerToCorrectPlaces, placesReaching, whereWords, getWhereNow, setWhereNow } from '../contexts.ts';
import { situationWords } from '../situations.ts';
import { saveSituationEvents, forgetSituationEvents, releaseEvents } from './detail-intents.ts';
import { paintHub, leave, watchJobs, enter as enterStance } from './hub.ts';
import {
  HOW_LONG_KEY, HOW_LONG_CHOICES, fitsWithin, howLongWords, minutesWords,
  isLongStretch, longStretchWords,
  getHowLong, setHowLong,
} from '../duration.ts';
import {
  waitingOnAnyone, withWhom, waitingWords, peopleWords,
  promisedToAnyone, promisedWords, promisedRowWords,
  allPeople, withWords, WITH_KEY, getWithNow, setWithNow,
} from '../people.ts';
import { trackPortfolio, trackWords, portfolioWords } from '../portfolio.ts';
import { menuGroups, menuCount, menuWords, saveForWords, MENU_WORDS } from '../menu.ts';
import { calendarDaysBetween, isValidIso, atMidnight} from '../time.ts';
import { markSyncEdition } from './edition.ts';
import { boundaryOf } from '../day.ts';

const now = () => Date.now();

const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`missing element: ${sel}`);
  return el;
};

/**
 * What you are holding, grouped (src/held.ts). Each item is a row with two real
 * controls: open it, or check it off. The card used to be one big button, which
 * is why it could not gain a second one — a button inside a button is invalid.
 */
/** How many rows one heading renders before it says how many it is holding back.
 *  Generous on purpose: an ordinary planner never meets it, and the number is
 *  stated when it does. */
export const LIST_CAP = 25;

/** Headings the reader has asked to see in full. Outside `render` so the choice
 *  survives the re-render that showing them causes. Cleared on reload, which is
 *  right — a thousand rows is not a state to restore somebody into. */
const revealed = new Set<string>();

/** Set once at boot so "show them" can ask for a fresh pass without `render`
 *  needing to know how the app rerenders. */
let rerenderAll: (() => void) | null = null;

/** The lens root's id, or null for everything (1.7.0, ADR-0054). A DEVICE
 *  VIEW PREFERENCE, cached at module level like the badge's — renders stay
 *  synchronous, the kv write happens on change, and a value that cannot be
 *  read is simply "everything", never a reason to fail to start. */
let lensRoot: string | null = null;

/** WHERE YOU ARE (2.2.0, ADR-0092), or null for everywhere. A device view
 *  preference exactly like the lens root — never an event, because where
 *  somebody is is not a fact about their work and the log has no business
 *  keeping a history of it. */
let whereNow: string | null = null;
let withNow: string | null = null;
/** How long the reader says they have, in minutes, or null for no limit. A
 *  device view preference like `whereNow` — see `HOW_LONG_KEY`. */
let howLongNow: number | null = null;

/**
 * THE WAY PAST THE STACK (2.0.8, ADR-0090) — shown when, and only when, there is
 * genuinely something between the reader and the list.
 *
 * THE LAST WORD, and it has to be. This began inside `render`, which is the
 * FIRST thing `refreshAll` calls: `rerenderLists()` runs, then `work.refresh()`
 * unhides Next up and Upkeep, then triage relabels. So `render` read every other
 * surface's `hidden` one cycle stale and the control never appeared — on a store
 * with 149 cards and eight live sections, which is exactly the case it exists
 * for. Reading another surface's DOM is only safe after that surface has
 * painted, and this is the only place that is true of all of them.
 *
 * NO THRESHOLD, deliberately. "More than N sections above the list" would be a
 * tuned constant pretending to be a rule. The condition is the one the reader
 * experiences: is anything in the way.
 */
/**
 * Put the runway back at the top (2.9.0, ADR-0100).
 *
 * One place, because there were two callers scrolling the WINDOW and a third
 * would have been written the same way. The document stopped scrolling when the
 * frame stopped being inside the scroller, so `window.scrollTo` became a call
 * that resolves and moves nothing — the failure mode with no symptom.
 *
 * Falls back to the window if the element is missing, which is not defensive
 * noise: `tools/` opens this page in states where markup can be absent, and a
 * jump that throws would take the surface down with it.
 */
export function scrollRunwayToTop(): void {
  // BOTH, always (2.9.2). The runway scrolls while the frame is up and the
  // DOCUMENT scrolls when the frame has stood down, and a caller has no business
  // knowing which state the page is in. Each is a no-op in the other mode, so
  // doing both is not belt-and-braces — it is the only version that is correct
  // in both, and the alternative is a way back that silently does nothing at
  // exactly the text size somebody needed it most.
  const runway = document.querySelector<HTMLElement>('#runway');
  if (runway) runway.scrollTop = 0;
  window.scrollTo({ top: 0 });
}

/**
 * Watch whether the frame still fits, and take it down when it does not
 * (2.9.2, ADR-0101).
 *
 * The decision is in `src/frame.ts` and is pure; this is the wiring. The
 * attribute goes on `<html>` rather than on the body because the shell's
 * `overflow: hidden` lives there and `:has()` is not a dependency worth taking
 * for something the layout turns on.
 *
 * Measured on every resize, and resize is what a text-size change produces —
 * the reflow changes the frame's content height, which is the number this reads.
 */
export function watchFrameFit(): void {
  const frame = document.querySelector<HTMLElement>('.frame');
  if (!frame) return;
  const root = document.documentElement;
  let down = false;
  const check = (): void => {
    try {
      const next = frameShouldStandDown(frame.scrollHeight, window.innerHeight, down);
      if (next === down) return;
      down = next;
      if (down) root.setAttribute('data-frame', 'off');
      else root.removeAttribute('data-frame');
    } catch { /* a surface: never take the page down over a layout question */ }
  };
  check();
  try {
    // The frame's own box changes when its content wraps, which is what a text
    // size change does — so observing the frame catches the case a window
    // resize listener alone would miss entirely.
    new ResizeObserver(check).observe(frame);
  } catch { /* no ResizeObserver: the window listener below still catches most */ }
  window.addEventListener('resize', check);
}

function paintJump(): void {
  try {
    const jump = document.querySelector<HTMLButtonElement>('#to-held');
    if (!jump) return;
    // THE JUMPS BELONG TO A SCROLLING PAGE, AND THERE ISN'T ONE (3.0.0,
    // ADR-0108). "Go to what you are holding" and "Back to the top" existed to
    // get past fifteen blocks stacked in one scroller. The hub has a door to the
    // pile and a way back from every job, so these are the same journeys with
    // second names — and a second control answering to one name is what the
    // accessibility walk refuses (§4). They stand down rather than move.
    const hub = document.querySelector<HTMLElement>('#runway')?.hasAttribute('data-hub');
    if (hub) {
      jump.hidden = true;
      const t = document.querySelector<HTMLButtonElement>('#to-top');
      if (t) t.hidden = true;
      return;
    }
    const inTheWay = ['#nextup', '#triage', '#replan', '#portfolio', '#people',
      '#review', '#composed', '#upkeep', '#bother', '#reentry', '#comms', '#close']
      .some(sel => {
        const el = document.querySelector<HTMLElement>(sel);
        return !!el && !el.hidden;
      });
    // Somewhere to arrive at. An empty list is not a destination.
    const hasList = document.querySelectorAll('#cards .card').length > 0;
    const useful = inTheWay && hasList;
    jump.hidden = !useful;
    // The way back rides the same condition: if there was something to skip
    // past on the way down, there is something to climb back over.
    const top = document.querySelector<HTMLButtonElement>('#to-top');
    if (top) top.hidden = !useful;
  } catch {
    // A surface. It must never take the list down with it.
  }
}

/**
 * Whether the inventory arrives open (2.12.0, ADR-0102). A VIEW preference, so
 * it lives in kv beside the lens and the where-now and never in the log — it is
 * a fact about this device, not about your things.
 */
const HELD_OPEN_KEY = 'view.held.open';

/**
 * Open the folded inventory. Every route that lands INSIDE it calls this first.
 *
 * A jump to a closed fold scrolls to a heading, moves focus into something with
 * no visible content, and reports success — which is the false receipt this
 * repo keeps finding in other costumes. `#to-held` and the skip link both point
 * at `#cards`, which is inside.
 */
function openHeld(): void {
  const fold = document.querySelector<HTMLDetailsElement>('#held-fold');
  if (fold && !fold.open) fold.open = true;
}

function render(session: Session, openDetail?: (n: NodeState) => void, onDone?: (id: string) => void,
                onFocus?: (n: NodeState) => void): void {
  const list = $('#cards');
  const nowIso = new Date(now()).toISOString();
  const st = session.state();
  const groups = heldGroups(st, nowIso, session.zone);
  // Computed ONCE for the whole render, not per card: a card can then say what it
  // is in or what it holds without each one re-scanning every node.
  const childCounts = liveChildCounts(st);

  // WHAT IS IN THERE, WITHOUT COUNTING IT (2.12.0, ADR-0102). The fold's summary
  // names every group that has anything in it, in the order ADR-0032 fixed —
  // and states no number, because ADR-0032 says "groups are headings, not counts
  // of things undone, there is no tally" and ADR-0060 already put the honest
  // totals in the gauge three lines up. A folded list captioned with numbers
  // would be the backlog headline both of them cleared off, rebuilt.
  //
  // Read from `groups` rather than from a written list, so a group that is added
  // or renamed cannot leave this saying something the list does not.
  const foldWhere = document.querySelector<HTMLElement>('#held-fold-where');
  if (foldWhere) foldWhere.textContent = groups.map(g => g.title).join(' · ');

  // The lens (1.7.0, ADR-0054): a filter over the ROWS of this list and
  // nothing else. `groups` itself stays global — the gauge's "ready" number
  // and the icon badge read it below, and lensing those would put two scopes
  // in one sentence. If the chosen root stopped being a live container, the
  // lens quietly stands down rather than filtering by a ghost.
  const lensSel = document.querySelector<HTMLSelectElement>('#lens');
  const lensRowEl = document.querySelector<HTMLElement>('#lens-row');
  const lensNote = document.querySelector<HTMLElement>('#lens-note');
  const lensRoots = lensChoices(st);
  if (lensSel && lensRowEl) {
    lensRowEl.hidden = lensRoots.length === 0 && !lensRoot;
    const keep = lensRoot ?? '';
    lensSel.replaceChildren(...[
      Object.assign(document.createElement('option'), { value: '', textContent: 'everything' }),
      ...lensRoots.map(r => Object.assign(document.createElement('option'), {
        value: r.id, textContent: r.title || '(untitled)',
      })),
    ]);
    if (keep === '' || lensRoots.some(r => r.id === keep)) lensSel.value = keep;
  }
  // WHERE YOU ARE (2.2.0, ADR-0092). Hidden until a place has been named — a
  // chooser with nothing in it teaches you the feature is broken.
  const whereSel = document.querySelector<HTMLSelectElement>('#where');
  const whereRow = document.querySelector<HTMLElement>('#where-row');
  const whereNote = document.querySelector<HTMLElement>('#where-note');
  const places = allContexts(st);
  // ASK ONCE, IN THE FLOW (2.28.0, entry 23). The chooser and the ask are the
  // same slot in two states: with no place named there is nothing to choose
  // between, and hiding the control taught the reader the app could not do this
  // at all. Now the sheet asks for the first one, here, at the moment they came
  // to answer exactly this question.
  const firstRow = document.querySelector<HTMLElement>('#where-first-row');
  const firstHint = document.querySelector<HTMLElement>('#where-first-hint');
  if (firstRow) firstRow.hidden = places.length > 0;
  if (firstHint) firstHint.hidden = places.length > 0;
  if (whereSel && whereRow) {
    whereRow.hidden = places.length === 0;
    const keep = whereNow ?? '';
    whereSel.replaceChildren(...[
      Object.assign(document.createElement('option'), { value: '', textContent: 'anywhere' }),
      ...places.map(c => Object.assign(document.createElement('option'), {
        value: c.id, textContent: c.title || '(unnamed)',
      })),
    ]);
    if (keep === '' || places.some(c => c.id === keep)) whereSel.value = keep;
  }
  // AND THE LINE THAT SAYS SO BEFORE YOU HAVE CHOSEN ANYTHING (2.37.0). The
  // button below is the answer to "how do I edit this list" and it is not on
  // screen until a place is picked, so the question gets asked with nothing in
  // front of it to answer it. `offerToCorrectPlaces` turns this off for good
  // once any label has been put down.
  const whereHint = document.querySelector<HTMLElement>('#where-hint');
  if (whereHint) {
    const news = offerToCorrectPlaces(session.state(), whereNow);
    whereHint.hidden = !news;
    if (news) whereHint.textContent = 'Some of these may not be places. Pick one and you can say so.';
  }
  // The way to say one of them is not a place (2.34.0) — see the note on the
  // markup. Present only while one is chosen: there is nothing to say it about
  // when the answer is "anywhere".
  const notPlaceRow = document.querySelector<HTMLElement>('#where-notplace-row');
  if (notPlaceRow) {
    notPlaceRow.hidden = whereNow === null || !places.some(c => c.id === whereNow);
    // RENDERED, NOT IN THE MARKUP. The shell's word budget counts what is in
    // `index.html` whether it is showing or not, and this line is only ever
    // read by somebody who has already chosen a place. Same trade the places
    // readout makes: the heading earns its place in the shell, the sentence
    // under it does not.
    const notPlaceHint = document.querySelector<HTMLElement>('#where-notplace-hint');
    if (notPlaceHint && !notPlaceRow.hidden) {
      notPlaceHint.textContent = 'It stops being offered here, and stops hiding things that carry it.';
    }
  }
  // If the chosen place was trashed, the filter stands down rather than
  // filtering by a ghost — the lens's rule, and the reason it matters more here
  // is that a ghost context matches nothing, so the surface would go empty.
  const whereLive = whereNow && places.some(c => c.id === whereNow) ? whereNow : null;
  // The OFFER reads the shared copy, so it must be the live one — a ghost
  // context matches nothing, and an offer filtered by a ghost is an empty offer.
  if (getWhereNow() !== whereLive) setWhereNow(whereLive);
  if (whereNote) {
    whereNote.hidden = !whereLive;
    if (whereLive) {
      whereNote.textContent = whereWords(
        places.find(c => c.id === whereLive)?.title || 'here');
    }
  }

  // HOW LONG HAVE YOU GOT (2.19.0). The place chooser's shape exactly, with one
  // deliberate difference: it is never hidden. The place chooser is withheld
  // until a place exists because it would filter by nothing; this one acts on
  // estimates and an UNESTIMATED thing fits every answer, so it is useful from
  // the first day and hiding it would be hiding a control that works.
  const howLongSel = document.querySelector<HTMLSelectElement>('#how-long');
  const howLongNote = document.querySelector<HTMLElement>('#how-long-note');
  if (howLongSel) {
    const keep = howLongNow === null ? '' : String(howLongNow);
    howLongSel.replaceChildren(...[
      Object.assign(document.createElement('option'), { value: '', textContent: 'as long as it takes' }),
      ...HOW_LONG_CHOICES.map(m => Object.assign(document.createElement('option'), {
        value: String(m), textContent: minutesWords(m),
      })),
    ]);
    howLongSel.value = keep;
  }
  if (getHowLong() !== howLongNow) setHowLong(howLongNow);
  if (howLongNote) {
    howLongNote.hidden = howLongNow === null;
    // THE LONG END ROUTES INSTEAD OF NARROWING (2.25.0, entry 24). At four hours
    // `fitsWithin` admits nearly everything, so the ordinary line would claim a
    // filter that is not doing anything. A block of open time is want-limited,
    // not duration-limited, so the words point at the Menu — which is law 6's
    // surface and already built — rather than at a longer list.
    if (howLongNow !== null) {
      howLongNote.textContent = isLongStretch(howLongNow)
        ? longStretchWords(howLongNow, menuCount(st))
        : howLongWords(howLongNow);
    }
  }

  // WHO IS HERE (2.26.0, entry 24's third axis). The place chooser's shape
  // exactly — hidden until somebody has been named, because a chooser with
  // nothing in it teaches you the feature is broken; stands down rather than
  // filtering by a ghost if that person was trashed, because a ghost matches
  // nothing and the surface would go empty.
  const withSel = document.querySelector<HTMLSelectElement>('#with-who');
  const withRow = document.querySelector<HTMLElement>('#with-row');
  const withNote = document.querySelector<HTMLElement>('#with-note');
  const named = allPeople(st);
  if (withSel && withRow) {
    withRow.hidden = named.length === 0;
    const keep = withNow ?? '';
    withSel.replaceChildren(...[
      Object.assign(document.createElement('option'), { value: '', textContent: 'nobody in particular' }),
      ...named.map(p => Object.assign(document.createElement('option'), {
        value: p.id, textContent: p.title || '(unnamed)',
      })),
    ]);
    if (keep === '' || named.some(p => p.id === keep)) withSel.value = keep;
  }
  const withLive = withNow && named.some(p => p.id === withNow) ? withNow : null;
  if (getWithNow() !== withLive) setWithNow(withLive);
  if (withNote) {
    withNote.hidden = !withLive;
    if (withLive) {
      withNote.textContent = withWords(named.find(p => p.id === withLive)?.title || 'them');
    }
  }

  const lensRootNode = lensRoot ? st.nodes.get(lensRoot) : undefined;
  const lensLive = Boolean(lensRootNode && !lensRootNode.trashed && !lensRootNode.mergedInto
    && lensRoots.some(r => r.id === lensRoot));
  const lensIds = lensLive ? underLensIds(st, lensRoot!) : null;
  if (lensNote) {
    lensNote.hidden = !lensLive;
    if (lensLive) lensNote.textContent = lensWords(lensRootNode?.title ?? '');
  }

  // A real heading and a real list per group. The first version made the heading
  // an <li> with role="presentation", which strips the listitem role and leaves a
  // <ul> containing a non-listitem — axe flagged it as a serious `list` violation,
  // and it is one: the grouping would have been invisible to a screen reader.
  const rows: HTMLElement[] = [];
  for (const group of groups) {
    // The lens filters BEFORE the cap slices, or the cap would lie about how
    // many it held back. A group emptied by the lens is simply absent, like
    // any empty group.
    const lensedOnly = lensIds ? group.items.filter(n => lensIds.has(n.id)) : group.items;
    // AND WHERE YOU ARE (2.2.0). Applied with the lens and before the cap, for
    // the same reason: a cap over an unfiltered set would lie about how many it
    // held back. Unlabelled things fit anywhere, so they always survive this.
    // AND HOW LONG YOU HAVE (2.19.0). Beside the place filter, before the cap,
    // for the same reason. Unestimated things fit every answer, so they survive
    // this exactly as unlabelled things survive the one above.
    const lensed = lensedOnly
      .filter(n => fitsHere(st, n, whereLive))
      .filter(n => fitsWithin(n, howLongNow));
    if (lensed.length === 0) continue;

    const head = document.createElement('h3');
    head.className = 'group-head';
    // A heading, not a badge and not a count of things undone (law 5).
    head.textContent = group.title;
    rows.push(head);

    const ul = document.createElement('ul');
    ul.className = 'cards-group';
    ul.setAttribute('aria-label', group.title);
    rows.push(ul);

    // CAPPED, with the true total stated and a way to see the rest.
    //
    // The dedicated replan surface has capped at three since it existed, on the
    // reasoning that "a wall of them is the pile in a new costume". The held list
    // never had a cap at all, which nobody noticed while the fixtures held eight
    // things. a real import of 1,429 and got a scroll of well over a thousand rows
    // under one heading — the pile, in the main list, which is the thing this app
    // exists to prevent.
    //
    // The cap is generous, so an ordinary planner never meets it, and the number
    // held back is stated rather than hidden. `revealed` is per-heading and lives
    // outside this function, so pressing "show the rest" survives the re-render it
    // triggers.
    const shown = revealed.has(group.key) ? lensed : lensed.slice(0, LIST_CAP);
    for (const node of shown) {
      const li = document.createElement('li');
      li.className = 'card';

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'card-open';

      const title = document.createElement('span');
      title.className = 'card-title';
      // textContent, never innerHTML: captured text is stored as text and never
      // interpreted, which is what makes /capture?text= safe from a hostile link
      // (ADR-0008).
      // `|| '(untitled)'` like every other surface — the held list was the one
      // place a blank title rendered as an unlabelled, unidentifiable card.
      title.textContent = node.title || '(untitled)';

      // WHERE IT CAN BE DONE (2.2.0, ADR-0092), on the card. A place line
      // already says where a thing LIVES; this says where it can be DONE, and
      // without it the label is invisible until you open the sheet — which is
      // the "nothing indicates what this is" shape ADR-0091 was reported for.
      // Absent when there is none, because "anywhere" is not news.
      const where = contextNames(st, node);
      if (where.length > 0) {
        const w = document.createElement('span');
        w.className = 'card-place card-where';
        w.textContent = where.join(' · ');
        open.append(w);
      }

      const when = document.createElement('span');
      when.className = 'card-when';
      // Every item states its own status in words — the text channel of B-01, so
      // nothing here depends on seeing a colour. A finished thing says "done"
      // rather than reporting the cure clock it happens to still carry.
      when.textContent = heldStatus(node, nowIso, session.zone, { zone: session.zone, boundary: boundaryOf(session.state()) });

      open.append(title, when);

      // Where it sits, when that is a fact worth stating: "in Boy Scouts", or
      // "7 under it" for a container. This is what tells an already-filed import
      // apart from a loose one — the flat list drew them identically, so a
      // backlog of a thousand could not be processed because nothing said which
      // items already had a home (found on device). A loose action returns null
      // and shows nothing, which is correct: it IS loose.
      const place = placeWords(node, st, childCounts);
      if (place !== null) {
        const where = document.createElement('span');
        where.className = 'card-place';
        where.textContent = place;
        open.append(where);
      }

      // AND WHAT IT IS FOR (2.5.0, ADR-0095) — law 4's downward half, on the
      // surface that had none of it. The line above says where a thing LIVES,
      // and it walks exactly one hop: "in Re-do the hallway". Nothing on this
      // list has ever said what any of it was FOR, at any depth.
      //
      // That is the measured cause of "no feeling of being shown the right
      // things" (Q-11, reported 2026-08-04): every tier of the offer is
      // temporal and the only tie-break inside one is pressure then creation
      // order, so the app has never had any notion of what a thing serves —
      // and could not show the right things by any definition of right that is
      // not "most time-pressured".
      //
      // `.card-place` REUSED rather than a new class. It carries no colour of
      // its own, so the contrast registry's existing row covers this from the
      // first run — which is what `.card-where` and the detail placeholders each
      // cost a release for learning the other way round.
      const serves = servesWords(st, node);
      if (serves !== null) {
        const forWhat = document.createElement('span');
        forWhat.className = 'card-place';
        forWhat.textContent = serves;
        open.append(forWhat);
      }

      // AND WHO IT IS FOR (2.6.0, ADR-0096). A third axis and a third silence
      // broken: the tree says where a thing lives, a context says where it can
      // be done, and a role says whose it is. Absent when there is none, which
      // is the honest majority — an identity is never required and never
      // inferred. `.card-place` again, so no new colour pair enters the gate.
      const whose = roleNames(st, node);
      if (whose.length > 0) {
        const w = document.createElement('span');
        w.className = 'card-place';
        w.textContent = whose.join(' · ');
        open.append(w);
      }

      // WHAT IS IN IT, but only when it has actually come round.
      //
      // The completion of "the place comes back, and its contents come back with
      // it". 1.26.0 made a place able to return; a place that arrives saying
      // only "7 under it" gives a number and sends you looking to find out
      // whether it is the number you cared about. Entry 3 of the collision
      // catalogue is cue-dependent prospective memory — filed means gone, and a
      // count is not a cue, a NAME is.
      //
      // ONLY IN `ready`, and that is the whole restraint. Every container in the
      // list carrying its contents would turn the held list into an org chart —
      // the thing law 4 refuses and the flat-list problem in a new costume. This
      // is a RETURN card: the place asked for you, so it says what it is asking
      // about. Everywhere else it stays a row.
      if (group.key === 'ready' && CONTAINER_KINDS.has(node.kind)) {
        const holding = contentsWords(st, node);
        if (holding !== null) {
          const inside = document.createElement('span');
          inside.className = 'card-place card-contents';
          inside.textContent = holding;
          open.append(inside);
        }
      }

      if (openDetail) open.addEventListener('click', () => openDetail(node));
      li.append(open);

      // The actions live in ONE wrapper, so they wrap as a group. As bare siblings
      // they wrapped independently: on a long title "Done" landed alone on the next
      // line while "Work on this" stayed beside the title. Moving the card's border
      // onto `.card` is what fixes the mis-tap (a stray button used to sit above a
      // DIFFERENT item); grouping is what stops the pair splitting up.
      const actions = document.createElement('div');
      actions.className = 'card-actions';

      // "Work on this" — the way into a focus session, on the row rather than
      // buried in the sheet. Starting work is the commonest thing anyone does
      // here and it should not cost two taps and a dialog.
      //
      // Not offered for what is already done, what triage still owns, or what is
      // on the Menu — the same three exclusions as Done directly below, because
      // the question "should this be offered as work right now" has one answer
      // per item, not one per button.
      if (onFocus && !node.lastDone && !node.onMenu && !(node.captured && node.route === null)) {
        const go = document.createElement('button');
        go.type = 'button';
        go.className = 'card-focus ghost';
        // The label DISAMBIGUATES (§4 — many cards, each with this button, and
        // one name answering for all of them is a coin toss by voice), and it
        // must still CONTAIN the visible words (SC 2.5.3), so it leads with
        // them. It used to read "Work on {title}" against a button showing
        // "Work on this": saying what is written on it matched nothing.
        const words = node.kind === 'resume-card' ? 'Pick it back up' : 'Work on this';
        go.textContent = words;
        go.setAttribute('aria-label', `${words} — ${node.title || '(untitled)'}`);
        go.addEventListener('click', () => onFocus(node));
        actions.append(go);
      }

      // Check it off without opening anything — what makes this a todo list.
      //
      // NOT offered for: what is already done; what triage still owns (offering
      // two ways to dispose of one item in two surfaces is how the two come to
      // disagree); and NOT for anything on the Menu. Law 6 and ADR-0014 govern
      // clocks and demand rather than completability, so a Done button there
      // would be legal — but the Menu is the one surface described as
      // structurally incapable of nagging, and putting a completion control on
      // every row of it makes it look like a list of things owed. Promotion from
      // the Menu is deliberate (detail sheet); finishing something there should
      // be too.
      if (onDone && !node.lastDone && !node.onMenu && !(node.captured && node.route === null)) {
        const done = document.createElement('button');
        done.type = 'button';
        done.className = 'card-done';
        done.textContent = 'Done';
        done.setAttribute('aria-label', `Done: ${node.title || '(untitled)'}`);
        done.addEventListener('click', () => onDone(node.id));
        actions.append(done);
      }
      // Only when it has something in it: an empty div is a gap in a row of cards,
      // and a Menu row legitimately has no actions at all.
      if (actions.childElementCount > 0) li.append(actions);
      ul.append(li);
    }

    const heldBack = lensed.length - shown.length;
    if (heldBack > 0) {
      const li = document.createElement('li');
      li.className = 'card card-more';
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'card-open';
      // The real number, never "many". A cap that will not say what it is hiding
      // is a cap that has decided for you.
      more.textContent = `${heldBack} more under ${group.title.toLowerCase()} — show them`;
      more.addEventListener('click', () => {
        revealed.add(group.key);
        rerenderAll?.();
      });
      li.append(more);
      ul.append(li);
    }
  }

  list.replaceChildren(...rows);
  $('#empty').hidden = groups.length > 0;

  // The way back, on the one screen where somebody is looking for their things
  // and cannot find them (1.14.0, ADR-0062).
  //
  // The condition is the WHOLE STORE, not `groups.length` above. Nothing held is
  // also true of somebody who has completed everything or put it all on the
  // Menu, and offering them a restore would be the app misreading a good day as
  // a disaster. `nodes.size` counts the trashed and the merged too, which is
  // right here: a store that has ever held anything is not a store somebody
  // needs rescuing into.
  const restore = document.querySelector<HTMLElement>('#restore');
  if (restore) restore.hidden = st.nodes.size > 0;

  // The Menu (law 6). BEHIND A CONTROL — a wish list that greets you is a demand
  // list, and the Menu is the one surface in this app structurally incapable of
  // nagging. The button states the count and says plainly that none of it is
  // asking; the list itself only exists once you have opened it.
  try {
    const st = session.state();
    const total = menuCount(st);
    const openBtn = document.querySelector<HTMLButtonElement>('#menu-open');
    const region = document.querySelector<HTMLElement>('#menu');
    if (openBtn && region) {
      openBtn.hidden = total === 0;
      openBtn.textContent = menuWords(total);
      // NOTHING ON IT IS NOT A PLACE (2.0.7). The control goes when the Menu
      // empties, and if that happens while somebody is standing in the sheet —
      // the last item taken off from its own detail — the sheet goes too,
      // rather than leaving them on a screen with nothing on it and no control
      // behind it to explain where it went.
      if (total === 0) closeSheet('sheet-menu');
      // WHERE THE ATTENTION IS (2.6.0, ADR-0096), painted on the same pass. Its
      // door states WHAT IT OPENS and no number: a count on a standing control
      // about somebody's own identities is a score on the landing surface, which
      // is what took the volume count off the gauge in V2 stage 1. It is hidden
      // entirely until a role exists, and closes behind anybody standing in it
      // when the last one goes — the rule directly above, for the same reason.
      {
        const rolesBtn = document.querySelector<HTMLButtonElement>('#roles-open');
        const anyRoles = allRoles(st).length;
        if (rolesBtn) {
          rolesBtn.hidden = anyRoles === 0;
          rolesBtn.textContent = 'Where the attention is';
          if (anyRoles === 0) closeSheet('sheet-roles');
        }
      }
      // WHAT YOU ARE WORKING TOWARD (2.18.0), on the same pass and by the same
      // rules as the door above it: what it OPENS and no number, hidden until a
      // horizon exists, and closed behind anybody standing in it when the last
      // one goes. A count here would be a score on the landing surface, and a
      // count of somebody's goals is the worst kind.
      {
        const horizonsBtn = document.querySelector<HTMLButtonElement>('#horizons-open');
        const anyHorizons = horizonRows(st).rows.length;
        if (horizonsBtn) {
          horizonsBtn.hidden = anyHorizons === 0;
          horizonsBtn.textContent = 'What you\u2019re working toward';
          if (anyHorizons === 0) closeSheet('sheet-horizons');
        }
      }
      const rows: HTMLElement[] = [];
      for (const g of menuGroups(st)) {
        const h = document.createElement('h3');
        h.className = 'menu-cat';
        h.textContent = `${g.title} · ${g.items.length}`;
        rows.push(h);
        const ul = document.createElement('ul');
        ul.className = 'menu-list';
        ul.setAttribute('aria-label', g.title);
        for (const n of g.items) {
          const li = document.createElement('li');
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'menu-item';
          const t = document.createElement('span');
          t.className = 'menu-title';
          t.textContent = n.title || '(untitled)';
          b.append(t);
          // Two numbers and their difference. No bar, no percentage, no
          // projected date — a bar is a machine for implying you are behind.
          const money = saveForWords({ node: n, target: n.saveTarget, saved: n.saveSaved });
          if (money) {
            const m = document.createElement('span');
            m.className = 'menu-money';
            m.textContent = money;
            b.append(m);
          }
          // The inspection surface steps aside, exactly as the tree and the
          // claim do (ADR-0088): a dialog opened over a dialog is the overlap
          // ADR-0083 forbids, and the top one eats the other's taps.
          if (openDetail) b.addEventListener('click', () => {
            closeSheet('sheet-menu');
            openDetail(n);
          });
          li.append(b);
          ul.append(li);
        }
        rows.push(ul);
      }
      region.replaceChildren(...rows);
    }
  } catch {
    // A surface. It must never take the list down with it.
  }

  // The track portfolio. What you carry rather than do — a name, a date you owe
  // an answer, and whether it has moved. No health word anywhere: "at risk" and
  // "slipping" are this app grading someone else's work on evidence it does not
  // have. It states the dates and lets you decide.
  try {
    const nowIso = new Date(now()).toISOString();
    const lines = trackPortfolio(session.state(), nowIso, session.zone);
    const region = document.querySelector<HTMLElement>('#portfolio');
    const count = document.querySelector<HTMLElement>('#portfolio-count');
    const list = document.querySelector<HTMLElement>('#portfolio-list');
    if (region && count && list) {
      region.hidden = lines.length === 0;
      count.textContent = portfolioWords(lines.length);
      list.replaceChildren(...lines.map(l => {
        const li = document.createElement('li');
        li.className = 'portfolio-item';
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'portfolio-open';
        const t = document.createElement('span');
        t.className = 'portfolio-title';
        t.textContent = l.node.title || '(untitled)';
        const w = document.createElement('span');
        w.className = 'portfolio-why';
        w.textContent = trackWords(l);
        b.append(t, w);
        if (openDetail) b.addEventListener('click', () => openDetail(l.node));
        li.append(b);
        return li;
      }));
    }
  } catch {
    // A surface. It must never take the list down with it.
  }

  // The person lens. Everything you are owed, longest first, INCLUDING the ones
  // nobody has put a name to — the route that creates a waiting-for is a single
  // tap that never asks who, so unattributed is the commonest kind, and dropping
  // them would make the one surface that lists what you are owed quietly
  // incomplete.
  try {
    const nowIso = new Date(now()).toISOString();
    const owed = waitingOnAnyone(session.state(), nowIso, session.zone);
    const region = document.querySelector<HTMLElement>('#people');
    const count = document.querySelector<HTMLElement>('#people-count');
    const list = document.querySelector<HTMLElement>('#people-list');
    if (region && count && list) {
      region.hidden = owed.length === 0;
      count.textContent = owed.length === 0 ? '' : peopleWords(owed.length);
      list.replaceChildren(...owed.map(line => {
        const li = document.createElement('li');
        li.className = 'people-item';
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'people-open';
        const t = document.createElement('span');
        t.className = 'people-title';
        t.textContent = line.node.title || '(untitled)';
        const w = document.createElement('span');
        w.className = 'people-why';
        const whom = withWhom(session.state(), line.node);
        const how = waitingWords(line.days);
        // "With Sam for three weeks." — a duration and never a verdict. When
        // nobody was named it says so plainly rather than inventing a name or
        // hiding the row.
        w.textContent = [whom ? `With ${whom}` : 'Nobody named yet', how].filter(Boolean).join(' ') + '.';
        b.append(t, w);
        if (openDetail) b.addEventListener('click', () => openDetail(line.node));
        li.append(b);
        return li;
      }));
    }

    // THE OTHER DIRECTION (2.20.0). Same section, same question, and the
    // section shows if EITHER half has something — so a day where nobody owes
    // you anything and you owe two people still has somewhere to say so.
    //
    // The row is a name and nothing else. The list above it says "for three
    // weeks"; `PromiseLine` has no `days` field to say it with, which is how
    // this rule is kept by the shape rather than by anybody remembering it.
    const promised = promisedToAnyone(session.state());
    const pCount = document.querySelector<HTMLElement>('#people-promised-count');
    const pList = document.querySelector<HTMLElement>('#people-promised');
    if (region && pCount && pList) {
      region.hidden = owed.length === 0 && promised.length === 0;
      pCount.textContent = promisedWords(promised.length);
      pList.replaceChildren(...promised.map(line => {
        const li = document.createElement('li');
        li.className = 'people-item';
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'people-open';
        const t2 = document.createElement('span');
        t2.className = 'people-title';
        t2.textContent = line.node.title || '(untitled)';
        const w2 = document.createElement('span');
        w2.className = 'people-why';
        w2.textContent = promisedRowWords(line.person);
        b.append(t2, w2);
        if (openDetail) b.addEventListener('click', () => openDetail(line.node));
        li.append(b);
        return li;
      }));
    }
  } catch {
    // A surface. It must never take the list down with it.
  }

  // Composed Today (1.6.0, ADR-0051): renders ONLY when the module is on AND
  // something is chosen for the CURRENT day — `composedFor` is the one reader
  // and its answer expires at midnight by construction. Rows are DOORS to the
  // sheet, where the choose/release verbs live; the render pass commits
  // nothing, as ever.
  try {
    const region = document.querySelector<HTMLElement>('#composed');
    const list = document.querySelector<HTMLElement>('#composed-list');
    if (region && list) {
      const chosen = todayIsOn(st) ? composedFor(st, nowIso, session.zone) : [];
      region.hidden = chosen.length === 0;
      list.replaceChildren(...chosen.map(n => {
        const li = document.createElement('li');
        li.className = 'composed-item';
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'composed-open';
        b.textContent = n.title || '(untitled)';
        if (openDetail) b.addEventListener('click', () => {
          const fresh = session.state().nodes.get(n.id);
          if (fresh) openDetail(fresh);
        });
        li.append(b);
        return li;
      }));
    }
  } catch {
    // A surface. It must never take the list down with it.
  }

  // Review — exceptions only. Rendered from the same `render` pass as the list,
  // because it is a fact about the list and nothing else needs to co-ordinate.
  try {
    const rv = reviewExceptions(st, nowIso, session.zone);
    const region = document.querySelector<HTMLElement>('#review');
    const count = document.querySelector<HTMLElement>('#review-count');
    const list = document.querySelector<HTMLElement>('#review-list');
    if (region && count && list) {
      region.hidden = rv.total === 0;
      count.textContent = rv.total === 0 ? '' : reviewWords(rv.total, rv.shown.length);
      list.replaceChildren(...rv.shown.map(x => {
        const li = document.createElement('li');
        li.className = 'review-item';
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'review-open';
        const t = document.createElement('span');
        t.className = 'review-title';
        t.textContent = x.node.title || '(untitled)';
        const w = document.createElement('span');
        w.className = 'review-why';
        w.textContent = x.words;
        b.append(t, w);
        if (openDetail) b.addEventListener('click', () => openDetail(x.node));
        li.append(b);
        return li;
      }));
    }
  } catch {
    // A surface. It must never take the list down with it.
  }

  // The gauge reads as text first and the number is the information (B-02).
  const { silent, total } = coverageGauge(session.state());
  const readyNow = groups.find(g => g.key === 'ready')?.items.length ?? 0;
  // The gauge is a button: its number is a claim, and the claim opens into the
  // itemised list that backs it (build-plan item 21).
  //
  // `ready` is stated here because **the icon badge shows that same number**, and
  // until now no surface in the app said it anywhere. a reader came back to a red 1 on
  // the home screen and could not find a 1 inside — so the badge was an
  // unexplained demand, which is the one thing this app must never be. The group
  // headings deliberately carry no counts (a heading is not a score), so the
  // gauge is the honest place: it is already where numbers live, and it already
  // opens into the list that backs them.
  // THE VOLUME COUNT IS GONE, AND IT WAS THE LOUDEST THING ON THE SCREEN.
  //
  // This read `${total} held · ${readyNow} ready now · ${silent} silent · see
  // each`, leading with a number that only rises. Three separate findings land
  // on that one string: an aggregate is what converts a fact about a thing into
  // a fact about YOU (the guilt/shame distinction — "that date was four days
  // ago" is about a date, "72 dates have gone by" is about a person); a number
  // that never falls is a nag rather than information, which the badge comment
  // eight lines below already says in those words about the icon; and a held set
  // rendered as a countable batch is what makes a good day a clearing spree, so
  // a backlog you cannot count is a backlog you cannot decide to clear.
  //
  // WHAT REPLACES IT IS THE GUARANTEE, WHICH IS THE PRODUCT. The anxiety this
  // app exists to answer is not forgetting — it is that you cannot audit your
  // own coverage from the inside, so you never know what you are NOT thinking
  // of. Only a promise about the CONTAINER answers that, and it has to be
  // checkable cheaply, at any moment. That promise is law 1, enforced at the
  // write boundary, and it was third in a line behind two counts, in a word the
  // app never defined anywhere: "silent" appeared in no user-facing copy at all.
  //
  // `ready now` STAYS, and not for symmetry. It is the number on the app icon,
  // and the badge is unexplained without a surface that says it — a red 1 on a
  // home screen with no 1 to be found inside is the one thing this app must
  // never be. It is also the only count here that moves in both directions.
  //
  // The failure state is loud, because a guarantee with an exception does not
  // degrade gracefully — it collapses. So a non-zero `silent` says so first, in
  // words, and the total is genuinely the information in that one case.
  $('#gauge').textContent =
    total === 0
      ? 'nothing held yet'
      : silent > 0
        ? `${silent} ${silent === 1 ? 'thing has' : 'things have'} gone quiet · what comes back, and when`
        // "0 ready now" IS THE ONLY PART THAT CHANGED (3.9.1). Walked as a
        // reader: eight things put down, and the page answered "nothing here has
        // gone quiet · 0 ready now", which reads as nothing having happened at
        // the exact moment somebody is checking whether the app took their work.
        //
        // The guarantee clause is NOT touched — ADR-0100 calls it the standing
        // proof that nothing was lost, the flowcharts cite it and the smoke walk
        // parses it. What was wrong is a zero standing where a number explains
        // the app icon's badge: with nothing ready there is no badge to explain,
        // so it says so in words, and "yet" is the part a first day needs.
        // AND IT SAYS WHERE IT GOES (3.9.2). The last clause was "see each" —
        // three vague words at the end of a run-on line, on the one control that
        // answers "can I stop holding this myself". Behind it is a sheet titled
        // "What comes back, and when", listing every item and its return date,
        // one tap from the landing surface. Reported as a missing feature: the
        // whole list, so the offer can be trusted. It was never missing. The
        // door did not name its destination, which on this app's own rule — a
        // door says what it holds — makes it a door nobody opens.
        //
        // IT SAYS THE DESTINATION'S OWN WORDS, and that is the whole of the fix.
        // The first draft read "see every one, and when it comes back" — true,
        // and six words describing a heading that already exists. The sheet is
        // titled "What comes back, and when", so the door says that, and what a
        // reader lands on is the sentence they pressed. Same pattern as
        // `#tree-open`, which says "Your projects, areas and goals".
        //
        // BOTH BRANCHES SAY IT. The loud state said "see each" too, and it is
        // the same door to the same sheet — a control whose label changes with
        // the state behind it teaches nobody where it goes.
        : `nothing here has gone quiet · ${readyNow === 0 ? 'nothing ready yet' : `${readyNow} ready now`} · what comes back, and when`;

  // T0's badge (ADR-0007): how many things are actually asking, on the app icon,
  // so a glance at the home screen is informative without opening anything.
  // Counts the READY group ONLY — a badge showing everything you hold is a number
  // that never falls, which is a nag rather than information. It is the SAME
  // variable the gauge states above, so the two cannot disagree. Optional, and the
  // switch lives in `./badge.ts` along with the reason it is a switch.
  paintBadge(readyNow);
}

/** Plain words, one idea, no idioms (B-09). Never a countdown, never a rebuke.
 *
 *  Counts CALENDAR days in the reader's zone. The first version divided elapsed
 *  milliseconds by 86_400_000, which says "today" at 23:00 about a clock two
 *  hours away — plainly tomorrow — and is an hour out on every DST day (V-13). */
function friendly(iso: string, zone: string): string {
  // A stored date that is not a real instant degrades to plain words rather than
  // throwing. Before the zone-aware path this divided milliseconds and produced
  // the harmless string "Invalid Date"; converting that degradation into a fatal
  // throw was a regression, and it killed capture (audit).
  if (!isValidIso(iso)) return 'held';
  const days = calendarDaysBetween(new Date(now()).toISOString(), iso, atMidnight(zone));
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 7) return `in ${days} days`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: zone });
}

/**
 * What an edition adds. The Sync build passes one of these; the default build
 * passes nothing, and because nothing here imports the sync module, the default
 * bundle does not contain it — which is exactly the build-time exclusion
 * [ADR-0036](../../docs/adr/0036-two-builds.md) asks for, verifiable by reading
 * `public/app.js` rather than by trusting a flag.
 */
export type Edition = (session: Session, repaint: () => void) => void | Promise<void>;

export async function main(edition?: Edition): Promise<void> {
  // Edition truth, before anything renders a word (ADR-0036, amended): the
  // titles say WHICH Quietkeep this is, and every [data-edition] paragraph
  // shows its own build's answer. The markup ships the default's words
  // visible; the sync build flips them here.
  if (edition) {
    markSyncEdition();
    const title = document.querySelector('#about-title');
    if (title?.firstChild) title.firstChild.textContent = 'Quietkeep Sync ';
    const mark = document.querySelector('.wordmark');
    if (mark) mark.textContent = 'Quietkeep Sync';
    document.querySelectorAll<HTMLElement>('[data-edition]').forEach((el) => {
      el.hidden = el.dataset['edition'] !== 'sync';
    });
  }

  const session = await openSession(now);
  const input = $<HTMLInputElement>('#capture');
  const status = $('#status');

  // Kept as its own binding because assigning it to the input DESTROYS the thing
  // the many-line restore below has to read: setting a text input's value strips
  // carriage returns and line feeds (the HTML value-sanitisation rule), so
  // `input.value` can never contain a newline no matter what was stored.
  const savedDraft = await session.draft();
  input.value = savedDraft;

  // Every surface is mounted through a mutable holder that starts as a no-op, so
  // one failing surface cannot take the others — or capture — down with it, and
  // no callback can close over a binding that is not initialised yet.
  //
  // CONTAINMENT IS LOAD-BEARING HERE, not defensive habit. These surfaces read
  // every stored date, and they are built BEFORE the submit listener below is
  // attached. One malformed date used to throw out of this stretch, leaving the
  // form with no handler at all — and a form with no submit handler does a
  // native GET navigation, which clears the input and destroys the typed thought
  // with no error whatsoever, permanently, while the data sits intact and
  // unreachable. Capture is the promise; everything else is a surface.
  let detail: { open(n: NodeState): void } = { open() {} };
  let search: { refresh(): void } = { refresh() {} };
  let sort: { refresh(): void } = { refresh() {} };
  let work: { refresh(): void } = { refresh() {} };
  let triage: import('./clarify.ts').TriageUI = { refresh() {}, relabelTimer() {} };
  let replan: { refresh(): void } = { refresh() {} };
  let focus: FocusUI = { refresh() {}, start() {} };
  let reentry: { refresh(): void } = { refresh() {} };
  let bother: { refresh(): void } = { refresh() {} };
  let load: LoadUI = { refresh() {}, attachTo() {} };
  let clock: ClockUI = { refresh() {} };

  // ONE render closure, used everywhere. Two call sites used to invoke
  // `render(session)` bare — the URL-capture path and its undo — which silently
  // dropped `openDetail`, so after a link capture no card opened its sheet.
  // One write at a time, and focus goes somewhere real afterwards. Both defects
  // were fixed in clarify.ts and work.ts earlier and simply not carried across
  // when this control was added: without the guard a double-tap wrote the same
  // done.marked twice, and because ticking a row off REMOVES it from the group it
  // was in, focus fell to <body> every time (WCAG 2.4.3).
  let doneBusy = false;
  const markDone = (id: string): void => {
    if (doneBusy) return;
    doneBusy = true;
    // Remember where we were, so focus can land on the next thing in the list
    // rather than at the top of the document.
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('#cards .card-done'));
    const at = buttons.findIndex(b => b === document.activeElement);
    const label = session.state().nodes.get(id)?.title || '(untitled)';
    void session.commit(ctx => doneEvents(ctx, id))
      .then(() => {
        // Say it. The other two surfaces announce a completion; this one was
        // silent, so a screen-reader user got no confirmation AND no focus
        // (WCAG 2.4.3 + 4.1.3). #status is a live region and is visible.
        status.textContent = `Done: ${label}.`;
      })
      .catch((err: Error) => { status.textContent = `Couldn’t record that — ${err.message}`; })
      .finally(() => {
        doneBusy = false;
        try { refreshAll(); } catch { /* renders on next load */ }
        const now = Array.from(document.querySelectorAll<HTMLElement>('#cards .card-done'));
        // The next row's control, or the one that took its place; the capture
        // line when nothing is left to tick off.
        const next = at >= 0 ? (now[at] ?? now[now.length - 1]) : now[0];
        (next ?? document.querySelector<HTMLElement>('#capture'))?.focus();
      });
  };
  // STARTING A FOCUS SESSION GOES INTO THE JOB (3.0.0, ADR-0108). Pressing "Work
  // on this" is choosing to do one thing; leaving the reader on the pile they
  // just chose from is the old page's shape. `#focus` is not live until the
  // session has started, which is what `pending` in hub.ts is for.
  const rerender = (): void => render(session, n => detail.open(n), markDone,
    (n) => { focus.start(n); enterStance('focus'); });
  // The held list AND the replan surface. `workSurface` excludes every id with a
  // live card, so these two must never be refreshed apart from one another: if
  // only one re-rendered, resolving a card would return the item to Next-up
  // while its row was still on screen — one item, two questions, which is
  // exactly what the exclusion exists to prevent. This is what work.ts is handed
  // as its onChange, since work refreshes itself afterwards.
  const rerenderLists = (): void => { rerender(); replan.refresh(); focus.refresh(); reentry.refresh(); bother.refresh(); load.refresh(); search.refresh(); sort.refresh(); clock.refresh(); };
  rerenderAll = rerenderLists;
  // `relabelTimer`, not `refresh` (1.10.0): the do-now offer names the timer
  // length it will start, and that length is set in the (i) panel, which can be
  // open while an offer is on screen. A full triage refresh here would rebuild
  // the clarify card on every commit anywhere in the app and change which card
  // is showing mid-interaction — the smoke walk caught exactly that. One
  // button's words is all this needs.
  const refreshAll = (): void => {
    rerenderLists(); work.refresh(); triage.relabelTimer();
    // After everything that owns a section has painted — see paintJump.
    paintJump();
    // LAST, and it must be last (3.0.0). The hub's doors are the LIVE sections,
    // so it reads a page every other painter has finished with. Painting it
    // earlier would build doors to blocks that are about to be hidden, and hide
    // the one section somebody is standing in.
    paintHub(heldWork(session.state()).length > 0);
  };

  try { rerender(); } catch { /* the shell still works; cards appear on next load */ }

  // The detail sheet: tap anything you hold to give it a date, make it repeat,
  // or take back a completion (Phase 3.5).
  try { detail = mountDetail(session, now, refreshAll); } catch { /* a surface */ }

  // Search: find anything you are holding and open it. Read-only and mounted
  // after detail, because a result opens the detail sheet. Contained like every
  // other surface — a broken search must never cost capture.
  try { search = mountSearch(session, now, n => detail.open(n)); } catch { /* a surface */ }

  // Sort mode: the one-card conveyor over a named range (1.3.0). Mounted after
  // detail for the same reason search is — "Open it" hands the card to the
  // sheet. Contained: a broken sorter must never cost capture.
  try { sort = mountSort(session, now, refreshAll, n => detail.open(n)); } catch { /* a surface */ }

  // Dates that have gone by (law 3). Mounted BEFORE work, because work's queue
  // is defined by what replan is not already asking about.
  try { replan = mountReplan(session, now, refreshAll); } catch { /* a surface */ }

  // Work mode: Next up, Upkeep chips, the coverage list behind the gauge, and
  // (1.6.0) the tree behind its control — its rows and the behind-list's are
  // doors to the sheet now, so it takes openDetail like clarify does.
  // `load` is read at CALL time, not captured now: the load surface mounts
  // below this one, and binding it eagerly would hand work.ts the no-op stub.
  try { work = mountWork(session, now, rerenderLists, n => detail.open(n),
    (id, title) => load.attachTo(id, title)); } catch { /* a surface */ }

  // Focus: one thing, and a way to be interrupted without losing it. Mounted
  // after work so its own refresh can run inside `rerenderLists` — an interrupt
  // adds an inbox item, which changes triage, the list and the gauge.
  try { focus = mountFocus(session, now, refreshAll, n => detail.open(n)); } catch { /* a surface */ }

  // Naming a worry (v1.5). Mounted before re-entry, which must be last.
  try { bother = mountBother(session, refreshAll); } catch { /* a surface */ }

  // Saying what is on you (1.15.0, ADR-0065). Contained like every other
  // surface: a failure here costs the load entry and nothing else, and capture
  // is untouched by it.
  try { load = mountLoad(session, refreshAll); } catch { /* a surface */ }

  // Today, on paper. No state of its own — it builds a card at the moment of
  // printing and empties the area afterwards.
  try { mountPrint(session, now); } catch { /* a surface */ }

  // The header clock (1.22.0), off unless it has been switched on in Extras.
  // Contained like everything else: chrome that fails must not cost capture,
  // and this one is drawn above the capture box.
  try { clock = mountClock(session, now); } catch { /* a surface */ }

  // Coming back after being away (law 8). Mounted LAST, because it measures the
  // absence from the state as loaded and must do so before any other surface has
  // had a chance to commit anything — a cure clock written by another mount
  // would be activity, and the greeting would report an absence of zero to
  // somebody who has been gone a fortnight.
  // AN IMPORT IS AN ARRIVAL (2.35.0). The importer writes this and reloads, so
  // this read is the first thing that happens afterwards. Cleared in the same
  // breath: a flag that survived would greet somebody with their own arrival
  // every time they opened the app.
  let justArrived = false;
  try {
    justArrived = (await session.store.getKv<string>(ARRIVAL_KEY)) === '1';
    if (justArrived) await session.store.setKv(ARRIVAL_KEY, '');
  } catch { /* no kv, no arrival card, and the app still starts */ }
  try { reentry = mountReentry(session, now, refreshAll, justArrived); } catch { /* a surface */ }

  // ARRIVE, and take focus with you (2.0.8, ADR-0090). `#cards` carries
  // tabindex="-1" precisely so a jump can land on it — the same target the
  // document's `.skip` link has always pointed at, now reachable by a finger.
  //
  // Focus moves as well as the scroll, so a keyboard or screen-reader user
  // carries on FROM the list rather than from wherever they pressed. A scroll
  // that leaves focus behind is the defect where the next Tab throws you back
  // up the page.
  //
  // No smooth behaviour: this is a jump, and an animated one both costs time
  // and moves a lot of the screen at once for a reader who may be here because
  // there is already too much moving.
  //
  // AND A JUMP INTO A FOLDED BLOCK OPENS IT (2.12.0, ADR-0102). The list is a
  // disclosure now, closed on arrival. A route that scrolls to a closed fold
  // lands on a heading, moves focus into something with no visible content, and
  // reports success — the false-receipt shape this repo keeps finding. Every
  // route to the list goes through `openHeld` for that reason.
  document.querySelector<HTMLButtonElement>('#to-held')?.addEventListener('click', () => {
    openHeld();
    const cards = document.querySelector<HTMLElement>('#cards');
    if (!cards) return;
    cards.scrollIntoView({ block: 'start' });
    cards.focus();
  });

  // AND THE WAY BACK (2.1.0, ADR-0091). Focus goes to the capture line, which
  // is both the top of the page and the thing most likely to be wanted there —
  // the same destination the app already picks after an action empties a card.
  document.querySelector<HTMLButtonElement>('#to-top')?.addEventListener('click', () => {
    // THE RUNWAY, NOT THE WINDOW (2.9.0, ADR-0100). The document does not scroll
    // any more — `.runway` does — and `window.scrollTo` on a document that
    // cannot scroll is a call that succeeds and moves nothing. That is the worst
    // shape a regression can take here: no error, no exception, a control that
    // simply stops working, on the way BACK from the bottom of a long list.
    scrollRunwayToTop();
    document.querySelector<HTMLElement>('#capture')?.focus();
  });

  // AND A WAY TO ANYWHERE, not just to the two ends (2.3.0, ADR-0093). The two
  // jumps above are a route between the top of the page and the list at the
  // bottom of it, which leaves the twelve blocks in between reachable only by
  // scrolling past the ones before them. This is the answer to the first thing
  // ever asked of the app.
  //
  // `onSheetOpen` rather than a paint at mount: the page's live blocks change
  // every refresh, and a contents list built once would offer routes to blocks
  // that have since gone and hide ones that have arrived — a stale list is
  // worse than none, because it reads as an answer.
  // WHERE THE ATTENTION IS (2.6.0, ADR-0096). A plot, never a verdict — see the
  // note on the markup. Painted on open like every other sheet, because a
  // readout built once would report the store as it was when the app started.
  const paintRoles = (): void => {
    const st = session.state();
    const { rows, unnamed } = roleLoads(st, heldWork);
    const words = document.querySelector<HTMLElement>('#roles-words');
    if (words) words.textContent = ROLE_READOUT_WORDS;
    const list = document.querySelector<HTMLUListElement>('#roles-list');
    if (list) {
      list.replaceChildren(...rows.map(r => {
        const li = document.createElement('li');
        li.className = 'roles-row';
        // A DOOR SINCE 3.12.0 (ADR-0115). This was a `<span>`, and that was the
        // whole defect: the readout could say attention went to an identity and
        // there was no way to see WHAT was there — the reverse walk had no code
        // path anywhere in the app. A role is an ordinary node, so its own sheet
        // holds the answer, exactly as a person's does.
        // `detail.open` is the same route the tree rows, the coverage list and
        // search all take — one way into a node's sheet, so a role opens the way
        // everything else does.
        const name = document.createElement('button');
        name.type = 'button';
        name.className = 'roles-name linklike';
        name.addEventListener('click', () => {
          const fresh = session.state().nodes.get(r.role.id);
          if (fresh) detail.open(fresh);
        });
        name.textContent = r.role.title || '(unnamed)';
        const held = document.createElement('span');
        held.className = 'roles-held';
        // WORDS, not a bare integer. "3" beside a name reads as a score; "3
        // things" reads as a count of work, which is what it is.
        held.textContent = r.held === 0
          ? 'nothing right now'
          : r.held === 1 ? '1 thing' : `${r.held} things`;
        li.append(name, held);
        return li;
      }));
    }
    const rest = document.querySelector<HTMLElement>('#roles-unnamed');
    if (rest) {
      // STATED, never hidden. On any real store this is the biggest number, and
      // leaving it out would make the named roles look like the whole of
      // somebody's life. It is deliberately not a row: it is not an identity,
      // and listing it beside real ones invites reading it as one.
      rest.textContent = unnamed === 0
        ? 'Everything you are holding belongs to one of these.'
        : `${unnamed === 1 ? '1 other thing' : `${unnamed} other things`} `
          + 'you are holding belong to no named role. That is ordinary — most things do not.';
      rest.hidden = false;
    }

    // THE PLACES YOU HAVE (2.33.0) — see the note on the markup for why this
    // lives on this sheet and why it is a readout. Reached-count, not
    // attached-count: `placesReaching` walks ancestors, so a place on a project
    // reports the work it actually covers.
    const placesList = document.querySelector<HTMLUListElement>('#places-list');
    const placesWords = document.querySelector<HTMLElement>('#places-words');
    if (placesList && placesWords) {
      const places = allContexts(st);
      const work = heldWork(st);
      if (places.length === 0) {
        // IN WORDS RATHER THAN BLANK, the rule `serves.ts` already follows: a
        // surface that renders nothing teaches the reader the feature is broken.
        placesWords.textContent = 'You have not named anywhere yet. Nothing needs one —'
          + ' anything without a place turns up wherever you are.';
        placesList.replaceChildren();
      } else {
        placesWords.textContent = 'Where work can be done, and how much each one reaches.'
          + ' A place on a project reaches everything inside it.';
        placesList.replaceChildren(...places.map(c => {
          const reached = work.filter(n => placesReaching(st, n).some(p => p.id === c.id)).length;
          const li = document.createElement('li');
          li.className = 'roles-row';
          const name = document.createElement('span');
          name.className = 'roles-name';
          name.textContent = c.title || '(unnamed)';
          const held = document.createElement('span');
          held.className = 'roles-held';
          held.textContent = reached === 0
            ? 'nothing right now'
            : reached === 1 ? '1 thing' : `${reached} things`;
          li.append(name, held);
          return li;
        }));
      }
    }

    // WHERE THE TIME ACTUALLY WENT (2.24.0). The other half of this sheet's own
    // title. `roleLoads` above answers what each role is CARRYING; this answers
    // what each was GIVEN, from `do-now.timed` and never from completions.
    //
    // Painted whether or not there is anything to show. A readout that hides
    // until it has data is a readout nobody discovers, and the empty words say
    // what would fill it — the `serves.ts` failure, answered the way 2.19.0
    // answered the same sparsity.
    const att = roleAttention(st, heldWork);
    const attWords = document.querySelector<HTMLElement>('#roles-attention-words');
    if (attWords) attWords.textContent = roleAttentionWords(att.totalSessions, att.unnamed);
    const attList = document.querySelector<HTMLUListElement>('#roles-attention-list');
    if (attList) {
      attList.replaceChildren(...att.rows.map(r => {
        const li = document.createElement('li');
        li.className = 'roles-row';
        const name = document.createElement('span');
        name.className = 'roles-name';
        name.textContent = r.role.title || '(unnamed)';
        const given = document.createElement('span');
        given.className = 'roles-held';
        given.textContent = roleAttentionRowWords(r);
        li.append(name, given);
        return li;
      }));
    }
  };
  onSheetOpen('sheet-roles', paintRoles);
  wireSheetClose('sheet-roles');
  document.querySelector<HTMLButtonElement>('#roles-open')
    ?.addEventListener('click', () => { openSheet('sheet-roles'); });

  // WHAT YOU ARE WORKING TOWARD (2.18.0, the plan's phase 2 step 3). Painted on
  // open like every other sheet, because a list built once reports the store as
  // it was when the app started.
  //
  // THE EMPTY ONES ARE THE POINT. Review already computes unfed goals and quiet
  // areas and shows them capped at three, exceptions-first — the right shape for
  // "what needs attention" and the wrong one for "what am I working toward".
  // Somebody deciding what to put under a goal has to be able to see the goal.
  const paintHorizons = (): void => {
    const st = session.state();
    const { rows, projects } = horizonRows(st);
    const words = document.querySelector<HTMLElement>('#horizons-words');
    if (words) words.textContent = HORIZON_READOUT_WORDS;
    const list = document.querySelector<HTMLUListElement>('#horizons-list');
    if (list) {
      list.replaceChildren(...rows.map(r => {
        const li = document.createElement('li');
        li.className = 'roles-row';
        const name = document.createElement('span');
        name.className = 'roles-name';
        // The KIND is said out loud beside the name. Without it a list of bare
        // titles cannot be told from a list of projects, and the whole reason
        // this surface exists is that those are different altitudes.
        name.textContent = `${r.node.title || '(untitled)'} — ${HORIZON_WORDS[r.node.kind] ?? r.node.kind}`;
        const held = document.createElement('span');
        held.className = 'roles-held';
        // WORDS, never a bare integer, and the rhythm stated even when absent.
        // "no rhythm set" is a fact somebody can act on; a blank is a question.
        held.textContent = `${holdsWords(r.holds)} · ${rhythmWords(r.everyDays)}`;
        li.append(name, held);
        return li;
      }));
    }
    const empty = document.querySelector<HTMLElement>('#horizons-empty');
    if (empty) {
      // Shown only when the list is empty of ROWS. The door is hidden in that
      // case, so this is reachable in one way: the last horizon went while
      // somebody was standing here.
      empty.textContent = horizonEmptyWords(projects);
      empty.hidden = rows.length > 0;
    }
  };
  // WHAT'S THE SITUATION (2.21.0, the plan's phase 5). The two inputs moved
  // here out of the pile — the machinery was finished and the route was wrong:
  // somebody answering "what is my situation" does not look inside the list of
  // everything they are holding.
  //
  // The inputs themselves are painted with the shell, because they narrow the
  // shell. What paints on OPEN is the saved list, for the reason every sheet
  // here paints on open: a list built once reports the store as it was when the
  // app started.
  //
  // No count of uses, no last-used, no ordering by how often. A situation is a
  // shortcut somebody made for themselves, and any of those would turn it into
  // a record of their habits — which is what law 7 keeps this app out of, and
  // the nagging law 8 makes lapse-tolerant.
  const paintSituations = (): void => {
    const st = session.state();
    const list = document.querySelector<HTMLUListElement>('#situation-list');
    if (!list) return;
    const names = [...st.situations.keys()].sort((a, b) => a.localeCompare(b));
    list.replaceChildren(...names.map(nm => {
      const saved = st.situations.get(nm)!;
      const li = document.createElement('li');
      li.className = 'roles-row';
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'linklike';
      go.textContent = nm;
      go.addEventListener('click', () => {
        // A GHOST PLACE MATCHES NOTHING. Recalling a situation whose context has
        // been let go would empty every surface with nothing on screen saying
        // why — the rule the shell already applies to `whereLive`. The place
        // stands down; the time it named still applies.
        const fresh = session.state();
        const stillThere = saved.context && allContexts(fresh).some(c => c.id === saved.context);
        setSituation(stillThere ? saved.context : null, saved.minutes);
      });
      const what = document.createElement('span');
      what.className = 'roles-held';
      what.textContent = situationWords(st, saved);
      const off = document.createElement('button');
      off.type = 'button';
      off.className = 'ghost';
      off.textContent = 'Forget it';
      off.addEventListener('click', () => {
        void session.commit(ctx => forgetSituationEvents(ctx, nm))
          .then(() => { refreshAll(); paintSituations(); })
          .catch(() => { /* the list simply does not change */ });
      });
      li.append(go, what, off);
      return li;
    }));
  };
  onSheetOpen('sheet-situation', paintSituations);
  wireSheetClose('sheet-situation');
  document.querySelector<HTMLButtonElement>('#situation-open')
    ?.addEventListener('click', () => { openSheet('sheet-situation'); });

  document.querySelector<HTMLButtonElement>('#situation-save')?.addEventListener('click', () => {
    const input = document.querySelector<HTMLInputElement>('#situation-name');
    if (!input) return;
    const name = input.value.trim();
    if (!name) return;
    input.value = '';
    void session.commit(ctx => saveSituationEvents(ctx, name, whereNow, howLongNow))
      .then(() => paintSituations())
      .catch(() => { /* nothing saved, and the inputs are untouched */ });
  });

  onSheetOpen('sheet-horizons', paintHorizons);
  wireSheetClose('sheet-horizons');
  document.querySelector<HTMLButtonElement>('#horizons-open')
    ?.addEventListener('click', () => { openSheet('sheet-horizons'); });

  onSheetOpen('sheet-contents', () => paintContents());
  wireSheetClose('sheet-contents');
  // TWO DOORS, both in flow. The header's, beside More, where the app's other
  // navigation is; and one at the end of the held list, beside Back to the top,
  // where somebody who has read to the bottom actually is. Neither is fixed —
  // a floating control was measured taking the centre of three Done buttons,
  // and `app.css` carries the numbers and the reason the scroll-container fix
  // was not taken.
  for (const sel of ['#contents-open', '#contents-open-end']) {
    document.querySelector<HTMLButtonElement>(sel)
      ?.addEventListener('click', () => { openSheet('sheet-contents'); });
  }

  // The two entries that came off the runway in 2.8.1 (ADR-0099). Their doors
  // are rows in Contents, built by `paintContents` from `data-contents-door` —
  // nothing here opens them, and that is the point: a hand-wired opener per
  // surface is the list this app keeps learning not to write. Only the way OUT
  // is wired, by the same convention every other sheet uses.
  wireSheetClose('sheet-bother-entry');
  wireSheetClose('sheet-load-entry');

  // The frame is a luxury that only pays when it is small (2.9.2, ADR-0101).
  watchFrameFit();

  // The Menu is a PLACE (2.0.7, ADR-0089), and closed on arrival every time —
  // it is demand-free, and a surface that remembers it was open is a surface
  // that greets you. A dialog cannot remember, which makes law 6 structural
  // here rather than something this handler has to keep being careful about.
  //
  // It unfolded above the held list until now: 2,597px of wish list inserted
  // between the reader and their work. Smaller than the claim's 26,031px or the
  // tree's 17,246px, which is exactly why it outlived both.
  const menuBtn = document.querySelector<HTMLButtonElement>('#menu-open');
  wireSheetClose('sheet-menu');
  menuBtn?.addEventListener('click', () => { openSheet('sheet-menu'); });

  // The triage surface (heat pass + clarify). It re-renders the held list when
  // it moves an item, and capture refreshes it (a new item joins the inbox).
  try { triage = mountTriage(session, refreshAll, n => detail.open(n)); } catch { /* a surface */ }

  // --- room for many lines (1.38.0) ------------------------------------------
  //
  // The same Dump, the same draft, the same commit path — many lines instead of
  // one. NOT a second surface: ADR-0026 already calls this screen Dump and
  // ADR-0015 already calls a batch a "Dump session", so a second thing called
  // Dump would contradict both records.
  //
  // The DRAFT decides the mode, which is why there is no second storage key and
  // no mode flag to keep in step with anything. A draft containing a newline can
  // only have come from the many-line field, so an interrupted dump comes back
  // in the shape it was left — after a reload, and after three weeks.
  const many = $<HTMLTextAreaElement>('#capture-many');
  const room = $<HTMLButtonElement>('#capture-room');
  const offer = $('#capture-offer');

  /** The live field, whichever is showing. One reader, so nothing can disagree. */
  const draftText = () => (many.hidden ? input.value : many.value);
  const lineCount = (s: string) => s.split('\n').filter((l) => l.trim() !== '').length;

  const showRoom = (on: boolean, focus = true) => {
    many.hidden = !on;
    input.hidden = on;
    room.textContent = on ? 'One line' : 'More room';
    // Collapsing would have to join the lines, and joining is exactly the defect
    // that makes pasting a document into a single-line box useless. So the way
    // back is not offered while there is more than one line to lose — an absent
    // control rather than a refusal to explain.
    room.hidden = on && lineCount(many.value) > 1;
    if (focus) (on ? many : input).focus();
  };

  const persist = () => { void session.setDraft(draftText()); };

  // Per keystroke. An interruption mid-capture is the EXPECTED case for this
  // audience, not the edge case (ADR-0008).
  input.addEventListener('input', () => { persist(); offer.hidden = true; });
  many.addEventListener('input', () => {
    persist();
    offer.hidden = true;
    // Re-evaluate the way back on every keystroke: deleting down to one line
    // makes collapsing lossless again, and it should come back when it is.
    room.hidden = lineCount(many.value) > 1;
  });

  room.addEventListener('click', () => {
    if (many.hidden) { many.value = input.value; showRoom(true); }
    else { input.value = many.value.trim(); showRoom(false); }
    persist();
  });

  // A draft with a newline in it can only have come from the many-line field, so
  // an interrupted dump comes back in the shape it was left — after a reload,
  // and after three weeks. Read from `savedDraft`, never from `input.value`,
  // which cannot hold a newline (see where it is loaded).
  if (savedDraft.includes('\n')) { many.value = savedDraft; input.value = ''; showRoom(true, false); }

  // Three URL entrances, all landing in the same capture (ADR-0008):
  //  - ?capture=1     the manifest shortcut — just focus the empty line
  //  - ?text=         the documented public endpoint (a hostile link can reach it)
  //  - share target   ?title=&text=&url= from the OS share sheet (Chromium)
  // Each is a public surface, so each does the ONE thing it may — create a single
  // unclarified item — with a visible confirm and undo; none can set a clock,
  // route, complete, or delete. Text is stored as text and shown with textContent.
  // The VISIBLE field, not `input`. A pending many-line draft hides `#capture`,
  // and the shortcut's whole job is to land focused and ready to type — focusing
  // a hidden element lands you on nothing, with no keyboard on a tablet. Found
  // by the smoke walk going red intermittently on the shortcut check (1.38.1);
  // the ordering above is the fix, this is the half that makes it complete.
  await handleUrlEntrances(session, status, many.hidden ? input : many, rerender);
  triage.refresh();


  // A multi-line paste into the ONE-LINE field.
  //
  // `<input type="text">` strips carriage returns and line feeds from anything
  // set as its value — that is the HTML value-sanitisation rule, and it is why
  // pasting a written list here does not make many items and does not even make
  // one readable line: every join runs together. But the newlines are not gone,
  // they are only gone FROM THE ELEMENT. The clipboard still holds them, so this
  // reads the clipboard rather than the box.
  //
  // NOTHING IS WRITTEN EITHER WAY, and both readings stay available. A pasted
  // address, a recipe or a quote genuinely IS one thing, so "many" cannot be
  // assumed — but neither can "one", which is what the box does today by
  // accident, badly, by running the lines together. So it lands in the
  // many-line field where the structure is visible and intact, and says plainly
  // what pressing the button will do, with the other reading one press away.
  /**
   * TAKE TEXT INTO THE CAPTURE SURFACE, without writing anything.
   *
   * One function, two doors: a paste into the field, and "Hold what I copied"
   * below it. They must behave identically — the same reading of one line
   * versus many, the same offer, the same draft — and the only way to be sure
   * of that is for there to be one of them.
   */
  const takeText = (text: string) => {
    if (lineCount(text) < 2) {
      input.value = text.trim();
      many.value = '';
      showRoom(false);
      persist();
      offer.hidden = true;
      return;
    }
    many.value = text;
    input.value = '';
    showRoom(true);
    persist();

    offer.textContent = '';
    const said = document.createElement('span');
    // No count. A number here is the countable batch the gauge deliberately
    // stopped showing (V2 stage 1) — the thing that turns a good day's dump into
    // a visible backlog — and this is the surface most able to bring it back.
    said.textContent = 'That will be held as one thing per line.';
    const asOne = document.createElement('button');
    asOne.type = 'button';
    asOne.className = 'linklike';
    asOne.textContent = 'Hold it as one thing';
    asOne.addEventListener('click', () => {
      // Joining is what the element would have done silently. Done here it is
      // visible, asked for, and the text is on screen to check afterwards.
      input.value = many.value.split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
      many.value = '';
      showRoom(false);
      persist();
      offer.hidden = true;
    });
    offer.append(said, asOne);
    offer.hidden = false;
  };

  input.addEventListener('paste', (e) => {
    const text = (e as ClipboardEvent).clipboardData?.getData('text/plain') ?? '';
    if (lineCount(text) < 2) return;
    e.preventDefault();                     // else the element eats the newlines
    takeText(text);
  });

  // HOLD WHAT I COPIED (1.41.0).
  //
  // V-21 closed the other way in: on this platform a link cannot open the
  // installed app, so anything copied elsewhere arrives only if the person opens
  // Quietkeep themselves and puts it in. Retyping what is already on the
  // clipboard is the friction that decides whether a thought is kept at all, and
  // it is the friction this removes.
  //
  // NOTHING IS WRITTEN. The text lands in the field, visible, and the ordinary
  // button commits it — the same two taps the capture criteria already assert,
  // with no typing. A silent clipboard write would be a capture nobody asked
  // for, and the clipboard is exactly the place a password or somebody else's
  // message is most likely to be sitting.
  //
  // Hidden unless the browser has the API, because a control that cannot do its
  // one job is worse than an absent one. iOS asks the reader to confirm the
  // paste, which is the gesture the platform requires and is also the right
  // shape: the app never reads the clipboard without being told to, twice.
  // HOLD WHAT I COPIED WAS REMOVED IN 2.12.1, and what it did is worth recording
  // so nobody rebuilds it. It read the clipboard and called `takeText` — the
  // SAME function an ordinary paste into the field already calls, a few lines
  // above. Multi-line splitting, the "one thing per line" offer and the "Hold it
  // as one thing" escape all came with paste and none of them came with the
  // button. It bought exactly one thing: on a tablet it saved
  // tap-field, long-press, Paste down to one tap.
  //
  // That is not nothing on the capture path, which is the one thing that must
  // never break. It is also a permanent control on the surface this app most
  // wants quiet, duplicating a gesture every reader already owns, for a flow
  // that is not the common one — capture is usually a thought being typed, not
  // something being pasted. 2.10.0 counted thirty-one things asked before
  // anything could happen; this was one of them.

  $<HTMLFormElement>('#capture-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomOpen = !many.hidden;
    const raw = roomOpen ? many.value : input.value;
    // One item per non-blank line, each trimmed. No parsing, no structure
    // detection, no routing on the way in: deciding while dumping stops the
    // dumping (docs/planning-for-humans.md).
    const lines = roomOpen ? dumpLines(raw) : [raw.trim()].filter(Boolean);
    if (lines.length === 0) return;

    // Clear SYNCHRONOUSLY, never disable. Disabling blurred the field for the
    // whole commit window — dropping keystrokes and, on iPadOS, dismissing the
    // keyboard with no guaranteed return — and the un-cleared text made a
    // double-tap capture the same thought twice (audit). With the field empty,
    // a second submit in the window reads '' and no-ops.
    if (roomOpen) many.value = ''; else input.value = '';
    offer.hidden = true;

    let landed = false;
    try {
      // Commit BEFORE the UI confirms (ADR-0008). ONE transaction for the whole
      // batch: each line is an ordinary `capture.recorded` and the gate gives
      // each its own same-day cure in the same transaction, so a batch of forty
      // is forty ordinary captures rather than one compound thing — and there is
      // no window in which any of them is silent.
      await session.commit(ctx => lines.flatMap(
        (line) => captureEvent(ctx, line, roomOpen ? 'dump' : 'quick')));
      landed = true;
    } catch (err) {
      // The write failed: give the thought back, and say so. All of it — a
      // partial restore here would lose the lines it did not name, which is the
      // one failure this app exists to prevent.
      if (roomOpen) { many.value = raw; } else { input.value = raw; }
      status.textContent = `Not saved — ${(err as Error).message}`;
      (roomOpen ? many : input).focus();
      return;
    }

    // From here the write IS in the log. Nothing below may un-say that: the
    // audit showed a post-commit throw landing in a shared catch and telling
    // the user "Not saved" about a thought that was saved — who then retypes
    // it and gets a duplicate. Confirmation first, housekeeping after, each
    // failure contained.
    // The SAME sentence for one line and for forty, and no number in it.
    //
    // A count is the countable batch V2 stage 1 deleted from the gauge: it is
    // what turns a good day's dump into a visible backlog, and this is the
    // surface most able to reintroduce it. Nor is it sold as relief — NOTES.md
    // already refuses "capture quiets the mind" and the study behind it, so
    // nothing here says a weight has moved. It says what is true: they are held,
    // and they will come back.
    status.textContent = 'Held. It will come back to you.';
    // Back to one line, ready for the next thought. The room is a thing you ask
    // for, never a mode you get left in.
    if (roomOpen) showRoom(false, false);
    void session.setDraft('').catch(() => { /* stale draft self-heals on next keystroke */ });
    try {
      refreshAll();
      // 'capture' — refresh the contents, but do not let the inbox put itself in
      // front of somebody who is still putting things down (1.39.2).
      triage.refresh('capture');
    } catch {
      // A render bug must not contradict a landed write; the card appears on
      // next load. landed stays the truth.
    }
    if (landed) input.focus();
  });

  // The build, painted BEFORE the panel and OUTSIDE its try/catch.
  //
  // It used to exist only in the (i) panel's title, which meant a screenshot of
  // the app could not say which build it was — and the panel is wrapped below
  // precisely because it is allowed to fail. A version stamp is a diagnostic, and
  // a diagnostic that disappears when something breaks is the wrong way round: it
  // is needed most in exactly the state that would have removed it.
  //
  // The accessible name is set HERE, with the text, and CONTAINS it — WCAG SC
  // 2.5.3, label in name. Since 1.18.0 this stamp is also the diagnostic's
  // door, and the first version carried a static `aria-label="Build — open the
  // diagnostic report"` while the visible text said "1.18.0". Somebody driving
  // this app by voice reads the button and says "1.18.0"; nothing would have
  // matched. Hub LESSONS §29 names that class — a control whose visible text
  // and spoken name have nothing in common — and **this repo's a11y gate has
  // no label-in-name check at all**, so nothing here would have caught it.
  // Setting both in one place is what stops them drifting again.
  const build = document.querySelector<HTMLElement>('#build-version');
  if (build) {
    build.textContent = CURRENT.triplet;
    build.setAttribute('aria-label', `Build ${CURRENT.triplet} — open the diagnostic report`);
  }

  // Read BEFORE the first render that paints the icon, so a device with the badge
  // switched off never flashes a number on the way to obeying the preference.
  await loadBadgePreference(session.store);

  // The lens preference (1.7.0) — read once at boot, the badge's pattern. A
  // preference that cannot be read means "everything", which is the safe view.
  try {
    // HOW BIG THIS APP IS (2.8.0, ADR-0098), applied before anything paints so
    // the reader never sees the app flash at one size and settle at another.
    // Contained like every device preference: a store that cannot be read costs
    // the chosen size, never the app.
    try {
      const stored = await session.store.getKv<number>(SCALE_KEY);
      if (stored != null) { setScale(normaliseScale(stored)); applyScale(getScale()); }
      // AND WHICH THEME (3.1.0). Beside the size and for the same reason: a
      // device preference, read once at boot. Absent means follow the device,
      // which is what the stylesheet already does on its own — so a store that
      // cannot be read costs nothing here.
      const storedTheme = await session.store.getKv<string>(THEME_KEY);
      if (storedTheme != null) { setTheme(storedTheme); applyTheme(getTheme()); }
      // AND WHICH PALETTE (3.4.0). The last of three read here, and the one that
      // cannot be answered any earlier: `localStorage` is banned outright, this
      // store is IndexedDB and therefore async, and the CSP forbids the inline
      // one-liner PALETTES.md assumes — so a reader who chose a non-default
      // family sees one beat of the default before this line runs. In the RIGHT
      // MODE, because `prefers-color-scheme` is answerable before paint even
      // when the palette is not, so what changes is hue rather than day to night.
      const storedPalette = await session.store.getKv<string>(PALETTE_KEY);
      if (storedPalette != null) { setPalette(storedPalette); applyPalette(getPalette()); }
    } catch { /* the usual size, and the app still starts */ }
    lensRoot = (await session.store.getKv<string>(LENS_KEY)) || null;
  } catch {
    lensRoot = null;
  }
  try {
    whereNow = (await session.store.getKv<string>(WHERE_KEY)) || null;
  } catch {
    whereNow = null;
  }
  try {
    // WHO IS HERE (2.26.0). A device view preference like the two above, and
    // more pointedly than either: a stored trail of who somebody was with, and
    // when, is the most sensitive thing this app could accidentally keep. It is
    // a kv value and there is no event for it.
    withNow = (await session.store.getKv<string>(WITH_KEY)) || null;
  } catch {
    withNow = null;
  }
  try {
    // Stored as a string like every other view preference. A stored value that
    // is not one of the offered lengths is dropped rather than honoured: it
    // would filter by a number no control can show or clear, which is a state
    // somebody could be stuck in with nothing on screen explaining why.
    const raw = Number(await session.store.getKv<string>(HOW_LONG_KEY));
    howLongNow = HOW_LONG_CHOICES.includes(raw) ? raw : null;
  } catch {
    howLongNow = null;
  }

  // THE INVENTORY'S FOLD, REMEMBERED (2.12.0, ADR-0102). Somebody who wants the
  // list open should not have to say so on every load: a preference re-asked
  // every visit is the app arguing with an answer it already has. Contained the
  // way every device preference here is — a store that cannot be read costs the
  // remembered state, never the app, and the default is closed.
  const heldFold = document.querySelector<HTMLDetailsElement>('#held-fold');
  if (heldFold) {
    try {
      if ((await session.store.getKv<boolean>(HELD_OPEN_KEY)) === true) heldFold.open = true;
    } catch { /* folded, and the app still starts */ }
    heldFold.addEventListener('toggle', () => {
      void session.store.setKv(HELD_OPEN_KEY, heldFold.open).catch(() => { /* view pref only */ });
    });
  }

  // AND THE SKIP LINK LANDS SOMEWHERE VISIBLE. It points at `#cards`, which is
  // inside the fold. Chromium expands a `<details>` for a fragment navigation;
  // that is not something to rely on across browsers, and the whole point of
  // this route is that it works for somebody who cannot see where they landed.
  document.querySelector<HTMLAnchorElement>('a.skip')?.addEventListener('click', () => { openHeld(); });
  setWhereNow(whereNow);
  setHowLong(howLongNow);
  setWithNow(withNow);

  /** ONE WRITER for the situation (2.21.0). Three routes set these two values —
   *  each chooser, and recalling a saved situation — and before this each did
   *  its own module cache, its own repaint and its own kv write. Three copies of
   *  one act is how one of them comes to persist what it did not apply, which is
   *  the shape `containerOptionWords` and `personName` are both the record of.
   *
   *  Persisted behind the repaint, the badge's rule: act now, store after. */
  const setSituation = (place: string | null, minutes: number | null,
                        person: string | null = withNow): void => {
    whereNow = place;
    howLongNow = minutes;
    // THIRD AXIS, SAME WRITER (2.26.0). It defaults to what is already set so
    // every existing caller keeps its meaning — recalling a saved situation
    // restores a place and a length and says nothing about who is with you,
    // because a saved situation has no person in it. Adding one would widen
    // `situation.saved`'s payload, which is a schema change this release does
    // not need and is recorded in the plan instead of smuggled in here.
    withNow = person;
    setWhereNow(whereNow);
    setHowLong(howLongNow);
    setWithNow(withNow);
    refreshAll();
    void session.store.setKv(WHERE_KEY, whereNow ?? '').catch(() => { /* view pref only */ });
    void session.store.setKv(WITH_KEY, withNow ?? '').catch(() => { /* view pref only */ });
    void session.store.setKv(HOW_LONG_KEY, howLongNow === null ? '' : String(howLongNow))
      .catch(() => { /* view pref only */ });
  };

  // NOT A PLACE (2.34.0). `node.released` and never `node.trashed`: putting a
  // label down is not the same as saying it was a mistake to have, and release
  // is the app's own reversible exit — the log reads "put down", and reclaiming
  // it is one event the other way if it turns out to have been a place after all.
  //
  // The filter stands down in the same breath. `allContexts` drops a released
  // node, so anything reached only by this one becomes unlabelled again and
  // goes back to fitting every answer — which is the whole point: a mis-typed
  // label was HIDING those things.
  // THE WAY BACK AND THE WAY TO PUT SOMETHING DOWN (3.0.0, ADR-0108).
  document.querySelector<HTMLButtonElement>('#stance-back')?.addEventListener('click', () => {
    leave();
  });
  // Capture from inside a job. The box is in the frame and the frame stands
  // down at 175% text, so this leaves the stance, puts focus in the field, and
  // the thought is recorded where it always was — no second capture path to
  // drift from the first.
  //
  // `leave()` IS THE FIRST THING IT DOES, and until 3.9.2 the button's name did
  // not say so: it said "Put something down", which is the capture field's own
  // label, so it read as a second box rather than as the way out with a plus on
  // it. The wiring is right — one draft, one commit, one Dump — and the label
  // was the thing lying. See the note on `#stance-capture` in `index.html`.
  document.querySelector<HTMLButtonElement>('#stance-capture')?.addEventListener('click', () => {
    leave();
    document.querySelector<HTMLInputElement>('#capture')?.focus();
  });

  document.querySelector<HTMLButtonElement>('#where-notplace')?.addEventListener('click', () => {
    const id = whereNow;
    if (id === null) return;
    void session.commit(ctx => releaseEvents(ctx, id))
      .then(() => { setSituation(null, howLongNow); })
      .catch(() => { /* the readout repaints from state either way */ });
  });

  document.querySelector<HTMLSelectElement>('#where')?.addEventListener('change', (e) => {
    setSituation((e.target as HTMLSelectElement).value || null, howLongNow);
  });
  document.querySelector<HTMLSelectElement>('#how-long')?.addEventListener('change', (e) => {
    const v = (e.target as HTMLSelectElement).value;
    setSituation(whereNow, v ? Number(v) : null);
  });

  // THE FIRST PLACE, NAMED AND APPLIED IN ONE GESTURE (2.28.0). Creating it is
  // not enough on its own — a place nothing carries filters nothing — so this
  // also SETS it as where you are, which is what the reader was here to do. The
  // work of attaching it to anything is theirs and is cheap now that a place on
  // a container reaches what is under it (2.27.0).
  const nameFirstPlace = (): void => {
    const input = document.querySelector<HTMLInputElement>('#where-first');
    const name = input?.value.trim();
    if (!name) return;
    void session.commit(ctx => [{
      id: ctx.id(), vault: ctx.vault, at: ctx.at, device: ctx.device, seq: ctx.seq(),
      kind: 'context.created', node: ctx.id(), payload: { name },
    } as unknown as AppEvent]).then(() => {
      if (input) input.value = '';
      const made = allContexts(session.state()).find(c => c.title === name);
      if (made) setSituation(made.id, howLongNow);
      else refreshAll();
    }).catch(() => { /* the sheet stays as it was */ });
  };
  document.querySelector<HTMLButtonElement>('#where-first-set')
    ?.addEventListener('click', nameFirstPlace);
  document.querySelector<HTMLInputElement>('#where-first')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); nameFirstPlace(); }
  });

  document.querySelector<HTMLSelectElement>('#with-who')?.addEventListener('change', (e) => {
    setSituation(whereNow, howLongNow, (e.target as HTMLSelectElement).value || null);
  });

  document.querySelector<HTMLSelectElement>('#lens')?.addEventListener('change', (e) => {
    const v = (e.target as HTMLSelectElement).value;
    lensRoot = v || null;
    // Act now, persist behind — the badge's rule.
    refreshAll();
    void session.store.setKv(LENS_KEY, lensRoot ?? '').catch(() => { /* view pref only */ });
  });

  // Opens itself on a first run — a new user has no way to know that storage
  // needs asking for — and never uninvited after that. Contained: a failure
  // here must not take capture down with it, or block readiness.
  try {
    // The trash view's rows open the detail sheet — the same door every other
    // list uses — and module toggles repaint the landing view (1.6.0).
    await mountAbout(session, n => detail.open(n), refreshAll);
  } catch {
    // The (i) failing is a lost nicety; capture still works.
  }

  // The walkthrough — first run only, and contained for the same reason: a new
  // person seeing nothing is better than a broken boot. It runs AFTER mountAbout
  // so the panel's own first-run auto-open is already gated behind `tour.seen`
  // and the two cannot stack.
  try {
    await mountTour(session);
  } catch {
    // A missing walkthrough costs an introduction, never capture.
  }

  // Every surface has now mounted and painted once, so the question "is anything
  // in the way" can finally be asked (2.0.8). `refreshAll` answers it on every
  // change after this; the FIRST paint has no change to ride on, and a control
  // that only appeared after you did something would be missing on exactly the
  // screen you arrive at.
  paintJump();
  // AND THE HUB, for exactly the reason written above it (3.0.0). The first
  // paint has no change to ride on, and the hub is the screen somebody ARRIVES
  // at — a landing view that only appeared after you did something would be
  // missing on the one screen it exists for. Rendering it showed an empty hub
  // and leftover runway furniture, which is what an unpainted landing view
  // looks like.
  paintHub(heldWork(session.state()).length > 0);
  watchJobs();

  // The store is open, state is folded, and the surface reflects it. Marked on
  // the document so the headless walk waits for the app rather than for `load`,
  // which fires while this function is still awaiting IndexedDB.
  document.body.dataset.ready = 'true';
  // AND QUIET UNTIL SOMETHING WRITES (3.1.0). `session.ts` flips this to
  // 'false' the moment a commit is in flight and back when the log goes quiet.
  // Stated at boot rather than left absent, because an absent attribute and a
  // false one read the same to anybody waiting on it — which is the exact
  // confusion the signal exists to end.
  if (!document.body.dataset.settled) document.body.dataset.settled = 'true';

  // Cut a snapshot if the next cold start would otherwise replay too much
  // (1.14.1, ADR-0063). AFTER `ready`, deliberately: this is housekeeping for
  // the NEXT launch and must never be on the path to this one's first capture.
  //
  // Not awaited, and contained like everything else here — a store that refuses
  // to hold a photograph costs a slower start next time, never a capture now.
  // The flag is for the headless walk, which cannot otherwise tell "no snapshot
  // was due" from "the write never ran".
  void session.maintain()
    .then((covered) => {
      document.body.dataset.maintained = covered === null ? 'not-due' : String(covered);
    })
    .catch(() => { document.body.dataset.maintained = 'failed'; });

  // Registration now lives with the update prompt, because the two are one
  // question: the registration is how a newer version is noticed, and noticing it
  // without offering the copy was the reported gap. Contained there, for
  // the same reason it was contained here — offline support is an enhancement and
  // must never cost capture.
  mountUpdatePrompt(session);

  // The edition's own surface, LAST and contained. Sync is an addition to a
  // planner that has to work without it, so a failure in it costs sync and
  // nothing else — the same containment the (i) panel and the service worker get.
  if (edition) {
    try {
      // `refreshAll` is handed in so an exchange that lands events can repaint
      // every surface — not just re-fold state. Without it a sync onto a fresh
      // device wrote the events to the store and left the screen blank until a
      // force-quit, which is indistinguishable from sync being broken.
      await edition(session, refreshAll);
    } catch {
      // Reported by the surface itself where it can be; never fatal here.
    }
  }
}

/** Compose one capture from whatever a share sheet handed over. Title, text and
 *  URL can each be present or absent; the result is the parts that exist, joined,
 *  trimmed — never the literal string "undefined" and never a blank line. */
function composeShared(title: string, text: string, url: string): string {
  return [title, text, url].map(s => s.trim()).filter(Boolean).join('\n').trim();
}

/**
 * What a many-line capture becomes: one item per non-blank line, each trimmed.
 *
 * EXPORTED for its test, like `handleUrlEntrances` below — this is the whole
 * rule for how a pasted document turns into items, and a rule that only exists
 * inside an event handler cannot be held to anything.
 *
 * There is deliberately NO parsing here. No structure detection, no bullet
 * stripping, no date lifting, no routing. Deciding while dumping stops the
 * dumping (`docs/planning-for-humans.md`), and every one of those would be the
 * app forming an opinion about text somebody has not finished writing.
 */
export const dumpLines = (raw: string): string[] =>
  raw.split('\n').map((l) => l.trim()).filter(Boolean);

/**
 * The three URL entrances. Captures at most once, offers an undo, and scrubs
 * the query from the address bar so a refresh cannot re-fire it.
 *
 * EXPORTED for the test that holds the failure path honest. It takes its
 * session, status line and input as arguments rather than reaching for them, so
 * the whole thing runs against fakes.
 */
export async function handleUrlEntrances(session: Session, status: HTMLElement, input: HTMLInputElement | HTMLTextAreaElement, rerender: () => void): Promise<void> {
  const params = new URLSearchParams(location.search);
  const clean = location.pathname + location.hash;

  // The manifest shortcut, and `/capture` with nothing after it: no capture,
  // just land ready to type.
  //
  // `/capture` is the endpoint three ADRs have named since Phase 0, and until
  // now nothing served it — the app answered `/?text=` only, so anybody
  // following the record built a Shortcut around a path that 404'd. It is
  // rewritten to the shell by `public/_redirects`; landing on it bare should do
  // what its name says rather than nothing.
  const bareCapture = /\/capture\/?$/.test(location.pathname) && !params.has('text');
  if (params.get('capture') === '1' || bareCapture) {
    history.replaceState(null, '', clean);
    input.focus();
    return;
  }

  const title = params.get('title') ?? '';
  const url = params.get('url') ?? '';
  const rawText = params.get('text') ?? '';
  const shared = Boolean(title || url);            // share sheet sends these; the bare endpoint does not
  const text = shared ? composeShared(title, rawText, url) : rawText.trim();
  if (!text) return;

  // Scrub first, so a failure or a refresh cannot fire it twice.
  history.replaceState(null, '', clean);

  const source = shared ? 'share-target' : 'url-endpoint';
  let capturedNode: string | null = null;
  try {
    await session.commit(ctx => {
      const events = captureEvent(ctx, text, source);
      capturedNode = events[0]!.node;
      return events;
    });
  } catch (err) {
    // THE TEXT MUST NOT DIE HERE, and it did.
    //
    // The query was scrubbed a moment ago so a refresh cannot fire this twice —
    // which is right, and it means the address bar no longer holds the only
    // copy. This catch was therefore the one thing standing between somebody's
    // shared thought and nothing at all, and all it did was print a message.
    // Sharing something into this app and watching it vanish is the precise
    // failure the app exists to prevent.
    //
    // The manual capture path has always done this correctly — "the write
    // failed: give the thought back, and say so" — and this path is the one
    // where giving it back matters MORE, because the person never typed it here
    // and has nowhere else to look for it.
    input.value = text;
    // And into the persisted draft, so it survives a reload as well as this
    // failure. `setDraft` is what every keystroke in the capture line does.
    try { await session.setDraft(text); } catch { /* the field still holds it */ }
    input.focus();
    status.textContent = `Couldn’t hold that — ${(err as Error).message}. It is in the box.`;
    return;
  }

  rerender();

  // Visible confirm with an undo — a drive-by capture is never silent and never
  // permanent. Undo trashes the one node this created and nothing else.
  status.replaceChildren();
  status.append(document.createTextNode('Held from a link. '));
  const undo = document.createElement('button');
  undo.type = 'button';
  undo.className = 'linklike';
  undo.textContent = 'Undo';
  undo.addEventListener('click', async () => {
    undo.disabled = true;
    try {
      await session.commit(ctx => [{
        id: ctx.id(), vault: ctx.vault, at: ctx.at, device: ctx.device, seq: ctx.seq(),
        kind: 'node.trashed', node: capturedNode,
        payload: { reason: 'undo url-capture' },
      } as AppEvent]);
      rerender();
      status.textContent = 'Undone.';
    } catch (err) {
      status.textContent = `Couldn’t undo — ${(err as Error).message}`;
    }
  });
  status.append(undo);
}

/** Start, and say so in the surface if it cannot. Called by the edition entry
 *  points (`entry.ts`, `entry-sync.ts`) rather than on import, so that importing
 *  this module — which the Sync entry does — never races the edition's own
 *  registration. */
export function start(edition?: Edition): void {
  void main(edition).catch((err: unknown) => {
    const status = document.querySelector('#status');
    if (status) status.textContent = `Quietkeep could not start — ${(err as Error).message}`;
  });
}
