// The roles, by when something was last done under them — the surface
// (3.28.0, docs/decisions/roles-review-2026-11.md, ADR-0128).
//
// Draws `rolesOrder` (src/review.ts, which reads src/attended.ts) into a section
// inside the Review door and into the sheet behind it. It holds no state beyond a
// cache of the last order it computed, and it writes no event: it is a projection.
//
// WHY IT READS THE LOG. The fold keeps no time per node for most acts, so the
// last act under a role can only be read from events. The Review render is
// synchronous and runs on every commit, so this module decides from STATE ALONE
// whether the section exists (`rolesLive`), and reads `session.store.all()` once
// per change to paint the order. The read is keyed by the event count and the
// reader's day and is cached; a newer render beats an older read that resolves
// late, by a sequence number.
//
// NO LIVE REGION, no color, no count of the person. The order of the lines is the
// whole readout, and opening a role to read it is not an act, which the sentence
// under the heading says in its own words.

import type { Session } from './session.ts';
import type { NodeState } from '../fold.ts';
import { rolesOrder, rolesLive, REVIEW_CAP } from '../review.ts';
import { attendedWords, type Attended } from '../attended.ts';
import { calendarDaysBetween } from '../time.ts';
import { boundaryOf } from '../day.ts';

export interface ReviewRolesDeps {
  /** The detail sheet's own opener: a role's sheet shows its line view. */
  openNode(node: NodeState): void;
  /** Open the sheet the Review door already has. */
  openAll(): void;
}

export interface ReviewRolesUI {
  refresh(): void;
  /** How many roles carry live work right now, from state alone. The caller
   *  keeps the Review door shown while this is above zero. */
  carrying(): number;
}

export function mountReviewRoles(
  session: Session, now: () => number, deps: ReviewRolesDeps,
): ReviewRolesUI {
  const section = document.querySelector<HTMLElement>('#review-roles');
  const list = document.querySelector<HTMLUListElement>('#review-roles-list');
  const more = document.querySelector<HTMLButtonElement>('#review-roles-more');
  const allHeading = document.querySelector<HTMLElement>('#review-all-roles-heading');
  const allList = document.querySelector<HTMLUListElement>('#review-all-roles');
  if (!section || !list || !more) {
    return { refresh() {}, carrying: () => 0 };
  }
  const SECTION = section, LIST = list, MORE = more;

  more.addEventListener('click', () => deps.openAll());

  const row = (a: Attended): HTMLLIElement => {
    const li = document.createElement('li');
    li.className = 'review-item';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'review-open';
    const t = document.createElement('span');
    t.className = 'review-title';
    t.textContent = a.role.title || '(untitled)';
    const w = document.createElement('span');
    w.className = 'review-why';
    w.textContent = attendedWords(a);
    b.append(t, w);
    b.addEventListener('click', () => {
      const fresh = session.state().nodes.get(a.role.id) ?? a.role;
      deps.openNode(fresh);
    });
    li.append(b);
    return li;
  };

  const paint = (order: readonly Attended[]): void => {
    const any = order.length > 0;
    SECTION.hidden = !any;
    LIST.replaceChildren(...order.slice(0, REVIEW_CAP).map(row));
    MORE.hidden = order.length <= REVIEW_CAP;
    if (allHeading) allHeading.hidden = !any;
    if (allList) {
      allList.hidden = !any;
      allList.replaceChildren(...order.map(row));
    }
  };

  let cache: { key: string; order: Attended[] } | null = null;
  let seq = 0;

  const refresh = (): void => {
    const state = session.state();
    // From state alone and synchronous: does an order exist at all?
    if (rolesLive(state).length === 0) {
      seq++;
      cache = null;
      paint([]);
      return;
    }
    const nowIso = new Date(now()).toISOString();
    // The reader's day index, so a change of day or of the day boundary repaints.
    const dayKey = calendarDaysBetween('2000-01-01T00:00:00.000Z', nowIso,
      { zone: session.zone, boundary: boundaryOf(state) });
    const key = `${state.eventCount}:${dayKey}`;
    if (cache && cache.key === key) { paint(cache.order); return; }
    // Paint the last order meanwhile, if there is one, so a commit does not blink.
    if (cache) paint(cache.order); else paint([]);
    const mine = ++seq;
    void session.store.all().then(log => {
      if (mine !== seq) return;                     // a newer render won
      const order = rolesOrder(session.state(), log, nowIso, session.zone);
      cache = { key, order };
      paint(order);
    }).catch(() => { /* a surface: it must never take the list down */ });
  };

  return { refresh, carrying: () => rolesLive(session.state()).length };
}
