// The weeks ahead — the surface (3.27.0, ADR-0127).
//
// Draws `glanceView` (src/glance.ts) into two sections the shell carries: the
// days and the stretches above the hub's doors, and who is waited on and what
// is still to sort beneath them. It holds no state of its own and writes no event: every
// repaint is a fresh read of the log, replacing the section's children whole.
//
// NO LIVE REGION. The block repaints with every render, and a standing
// projection that spoke on every repaint would be the noise the live-region
// gate exists to refuse. It announces nothing; it is read where it stands.
//
// Everything the reader sees is set with textContent. Every title is a real
// button at full target size. The only drawn thing is the track under a
// stretch, and it is hidden from assistive technology because the words beside
// it say the same fact.

import type { Session } from './session.ts';
import type { NodeState } from '../fold.ts';
import type { DetailOpen } from './detail.ts';
import { glanceView, dayMoreWords, spansMoreWords, waitingCountWords, unsortedMoreWords,
  type GlanceDay } from '../glance.ts';
import { datedDayWords, datedKindWords, type DatedDay } from '../dated.ts';

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

export interface GlanceDeps {
  /** The detail sheet's own opener. The options are passed through, because a
   *  lambda that drops its second argument is how a reveal once shipped doing
   *  nothing. */
  openNode(node: NodeState, opts?: DetailOpen): void;
  /** Come into the People job. */
  goPeople(): void;
  /** Come into the complete list at its Not sorted yet group. */
  goUnsorted(): void;
  /** Open the days-ahead sheet, which holds everything. */
  openDays(): void;
}

export interface GlanceUI { refresh(): void }

export function mountGlance(session: Session, now: () => number, deps: GlanceDeps): GlanceUI {
  const words = document.querySelector<HTMLElement>('#glance-words');
  const body = document.querySelector<HTMLElement>('#glance-body');
  const afterSection = document.querySelector<HTMLElement>('#glance-after');
  const afterBody = document.querySelector<HTMLElement>('#glance-after-body');
  if (!words || !body || !afterBody) return { refresh() {} };
  const WORDS = words, BODY = body, AFTER_BODY = afterBody, AFTER = afterSection;

  /** A title is a door onto the thing's own sheet. */
  const titleButton = (node: NodeState, opts?: DetailOpen): HTMLButtonElement => {
    const b = el('button', 'glance-title', node.title || '(untitled)');
    b.type = 'button';
    b.addEventListener('click', () => {
      const fresh = session.state().nodes.get(node.id) ?? node;
      deps.openNode(fresh, opts);
    });
    return b;
  };

  const openButton = (text: string, cls: string, onPress: () => void): HTMLButtonElement => {
    const b = el('button', cls, text);
    b.type = 'button';
    b.addEventListener('click', onPress);
    return b;
  };

  const dayItem = (d: GlanceDay, nowIso: string): HTMLLIElement => {
    const li = el('li', 'glance-day');
    // The heading is the one place the day is said, in the days-ahead view's own
    // words, so a row and its heading cannot disagree. Only a day that carries a
    // title is drawn, so there is no empty-day branch.
    const asDay: DatedDay = { day: d.day, days: d.offset, items: d.items };
    li.append(el('h3', 'glance-day-name', datedDayWords(asDay, nowIso, session.zone)));
    const ul = el('ul', 'glance-rows');
    for (const it of d.items) {
      const row = el('li', 'glance-row');
      row.append(titleButton(it.node));
      row.append(el('span', 'glance-kind', datedKindWords(it.kind)));
      if (it.whom) row.append(el('span', 'glance-held', `with ${it.whom}`));
      ul.append(row);
    }
    li.append(ul);
    if (d.hidden > 0) {
      li.append(openButton(dayMoreWords(d.hidden), 'glance-open', deps.openDays));
    }
    return li;
  };

  const refresh = (): void => {
    const nowIso = new Date(now()).toISOString();
    const v = glanceView(session.state(), nowIso, session.zone);
    WORDS.textContent = v.words;

    const parts: HTMLElement[] = [];

    // The week: only the days that carry a title, in date order. When none does
    // but a later day does, one line says so; when nothing at all is dated the
    // sentence under the heading already says it, and nothing repeats it.
    if (v.week.length > 0) {
      const week = el('ol', 'glance-days');
      week.id = 'glance-week';
      week.setAttribute('aria-label', 'The next seven days');
      week.append(...v.week.map(d => dayItem(d, nowIso)));
      parts.push(week);
    } else if (v.anyDated) {
      parts.push(el('p', 'glance-none', 'Nothing dated in the next seven days.'));
    }

    // The rest of the thirty days: only days that carry a title.
    if (v.month.length > 0) {
      const month = el('ol', 'glance-days');
      month.id = 'glance-month';
      month.setAttribute('aria-label', 'The rest of the thirty days');
      month.append(...v.month.map(d => dayItem(d, nowIso)));
      parts.push(month);
    }

    // Longer stretches: present only when a thing has a start and a due date
    // that fall in the thirty days.
    if (v.spans.length > 0) {
      const h = el('h3', 'glance-sub', 'Longer stretches');
      h.id = 'glance-spans-heading';
      const spans = el('ol', 'glance-spans');
      spans.id = 'glance-spans';
      spans.setAttribute('aria-labelledby', 'glance-spans-heading');
      for (const s of v.spans) {
        const li = el('li', 'glance-span');
        li.append(titleButton(s.node));
        li.append(el('p', 'glance-span-words', s.words));
        const track = el('div', 'glance-track');
        track.setAttribute('aria-hidden', 'true');
        const fill = el('span', 'glance-fill');
        // Through the CSSOM and never through markup: the site's policy is
        // `style-src 'self'`, which allows this and refuses an inline attribute.
        fill.style.gridColumn = `${s.from + 1} / ${s.to + 2}`;
        track.append(fill);
        li.append(track);
        spans.append(li);
      }
      parts.push(h, spans);
      if (v.spansMore > 0) {
        const p = el('p', 'glance-held', spansMoreWords(v.spansMore));
        parts.push(p, openButton('Open the days ahead', 'glance-open', deps.openDays));
      }
    }

    // BENEATH THE DOORS from here on. Who a thing is with and what is still to
    // sort are the two blocks that grew with the store, and above the doors they
    // pushed the way into sorting off a phone's first screen (1489px of 844).
    const after: HTMLElement[] = [];

    // Who a thing is with.
    if (v.waiting.total > 0) {
      const h = el('h3', 'glance-sub', 'Waiting on others');
      h.id = 'glance-waiting-heading';
      const ul = el('ul', 'glance-rows glance-block');
      ul.setAttribute('aria-labelledby', 'glance-waiting-heading');
      for (const w of v.waiting.shown) {
        const row = el('li', 'glance-row');
        // OPENED ON THE NAMING CONTROL, as the people surface opens it: a row
        // that can say Nobody named yet has to land where the name goes.
        row.append(titleButton(w.node, { reveal: 'person' }));
        row.append(el('span', 'glance-held', w.whom ? `With ${w.whom}.` : 'Nobody named yet.'));
        ul.append(row);
      }
      after.push(h, ul,
        openButton(waitingCountWords(v.waiting.total, v.waiting.shown.length), 'glance-count', deps.goPeople));
    }

    // What is still to sort: titles and one press to the group. No figure for
    // the pile is written anywhere in this block.
    if (v.unsorted.shown.length > 0) {
      const h = el('h3', 'glance-sub', 'Still to sort');
      h.id = 'glance-unsorted-heading';
      const ul = el('ul', 'glance-rows glance-block');
      ul.setAttribute('aria-labelledby', 'glance-unsorted-heading');
      for (const n of v.unsorted.shown) {
        const row = el('li', 'glance-row');
        row.append(titleButton(n));
        ul.append(row);
      }
      after.push(h, ul);
      if (v.unsorted.more) {
        after.push(el('p', 'glance-held', unsortedMoreWords(v.unsorted.shown.length)));
      }
      after.push(openButton('Open Not sorted yet', 'glance-open', deps.goUnsorted));
    }

    BODY.replaceChildren(...parts);
    AFTER_BODY.replaceChildren(...after);
    // An empty card is a box with nothing in it; it is not drawn.
    if (AFTER) AFTER.hidden = after.length === 0;
  };

  refresh();
  return { refresh };
}
