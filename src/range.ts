// Named ranges — the lawful shape of "act on more than you can see" (1.3.0).
//
// Law 8 caps what a surface may SHOW, and the recorded resolution (NOTES.md,
// "Selecting ranges") is the amnesty's: the cap governs display; a range the
// USER NAMED is legitimate to act on. So a range here is three things — a pure
// predicate over state, a sentence in the user's own words, and a live count —
// and never a rendered list. The picker shows sentences and counts; sort mode
// shows one card. That is the whole visibility a backlog gets.
//
// RANGE HYGIENE IS LOAD-BEARING. The clarify queue's own comment records why:
// an over-broad predicate offers routes that hard-fail on demand-free kinds,
// and a route on a Menu item would mint the Menu-plus-clock state no surface
// can render. `sortable` below is the one definition of what a sorting surface
// may hold: runway kinds only — no person, no bother, no container, no
// demand-free kind, nothing on the Menu, nothing finished, nothing trashed or
// merged away. A deliberate-failure test asserts that removing any clause
// lets an illegal kind through.
//
// PURE. `now` and `zone` are arguments, like every projection here.

import { compareOrdering, type NodeState, type State } from './fold.ts';
import { heldNodes } from './gate.ts';
import { isContainer } from './tree.ts';
import { isValidIso } from './time.ts';
import { SAMPLE_ARRIVAL } from './events.ts';
import { normalize, searchHeld } from './search.ts';
import { raisesReplanCard } from './replan.ts';
import { isHeld } from './fold.ts';
import { boundaryOf } from './day.ts';
import type { DayShape } from './time.ts';

/** The kinds a sorting card may legally act on — runway work, nothing else. */
const SORTABLE_KINDS: ReadonlySet<string> = new Set(['action', 'waiting-for', 'upkeep']);

/**
 * May a sorting surface hold this node? One predicate, used by every range,
 * so "what sort mode can reach" has exactly one answer.
 */
export const sortable = (n: NodeState): boolean =>
  isHeld(n)
  && SORTABLE_KINDS.has(n.kind)
  && n.onMenu === null
  && !n.lastDone;

/**
 * Oldest first, so a seven-year residue is met from the far end and the range
 * shrinks visibly where it is deepest.
 *
 * By the GENESIS STAMP — the (at, device, seq) ordering of the event that
 * titled the node — never by raw id. ULIDs sort by time only to the
 * millisecond: a 1,445-row import lands in ONE commit, so its ids share a
 * timestamp and their tail bits are random — id order within the batch is
 * shuffle order, which made "oldest first" a different lie each session
 * (found by the smoke walk routing a card the display never showed).
 */
const oldestFirst = (a: NodeState, b: NodeState): number => {
  const sa = a.stamps['title'], sb = b.stamps['title'];
  if (sa && sb) {
    const c = compareOrdering(sa, sb);
    if (c !== 0) return c;
  }
  return a.id < b.id ? -1 : 1;
};

/**
 * "Loose from the import" — brought in from another planner, never filed,
 * never sorted. `captured` is the discriminator: typed items enter via
 * `capture.recorded` (which latches it), imported ones via `node.created`
 * (which does not). Provenance cannot tell these apart — the importer and the
 * sample set both write `{for:'self'}` — and must not be built on.
 */
/**
 * SELECTED BY HOW IT ARRIVED, not by not-being-a-capture (2.38.0).
 *
 * This read `!n.captured`, written 2026-07-31 when `captured` meant "you typed
 * it", so excluding it did mean "came from somewhere else". 2.15.0 made an
 * import land in the inbox — `arrived: true`, which latches `captured` — and
 * that emptied the batch NAMED for imports. `rangeChoices` pushes it only when
 * non-empty, so it stopped appearing rather than appearing empty: the door was
 * simply gone, and nothing said so.
 *
 * Twenty-two days, found from the device on a 1,171-row import where the only
 * route left was one card at a time. Hub LESSONS 104's shape — an absence
 * identical to a presence — and the tests stayed green because their fixture
 * wrote rows the importer would never produce (LESSONS 138).
 *
 * `arrived` says the thing directly. It is the latch about how the SOURCE
 * reached this app, which is exactly the question this batch asks, rather than a
 * property that happened to correlate with it for three weeks.
 */
/**
 * AND SELECTED BY WHICH ARRIVAL, not by whether the row arrived empty-handed
 * (3.11.0). `arrived` is narrower than this batch needs, and 2.38.0's own fix
 * left half the file behind: the importer sets it ONLY on a row that came in
 * with nothing to go on, so a row that kept a real date and every project in the
 * same file are `arrived: false`. They came in on the same arrival, and somebody
 * working through a planner they brought in wants the planner, not the part of
 * it the importer could not do anything with.
 *
 * The same defect one turn down from where 2.38.0 found it — a batch named for
 * an import that does not hold the import — which is why the fix is the key that
 * says WHICH arrival rather than a third correlated property.
 *
 * With no key, every arrival. With one, that arrival alone.
 */
export const looseFromImport = (state: State, arrival?: string): NodeState[] =>
  heldNodes(state)
    .filter(sortable)
    .filter(n => n.arrival !== null && n.route === null && n.parent === null)
    .filter(n => arrival === undefined || n.arrival === arrival)
    .sort(oldestFirst);

/**
 * The arrivals that still have something loose in them, newest first.
 *
 * Keyed on the importing commit's timestamp, so ordering the keys orders the
 * arrivals — except the sample set, which carries a fixed key and sorts last
 * because it is the one nobody chose to bring in.
 */
export const arrivalsWaiting = (state: State): string[] => {
  const keys = new Set<string>();
  for (const n of looseFromImport(state)) if (n.arrival) keys.add(n.arrival);
  return [...keys].sort((a, b) => {
    if (a === SAMPLE_ARRIVAL) return 1;
    if (b === SAMPLE_ARRIVAL) return -1;
    return a < b ? 1 : -1;
  });
};

/**
 * What one arrival is called, in the picker.
 *
 * A DATE AND A SIZE, never a source name: nothing records which planner a file
 * came from — the format is sniffed from the CONTENT and the filename is never
 * stored — so naming one would be a guess presented as a fact. The date is
 * checkable against somebody's own memory of the day they did it, which is the
 * same standard `copyDayWords` is held to.
 */
export const arrivalWords = (arrival: string, tz: string): string => {
  if (arrival === SAMPLE_ARRIVAL) return 'The example set this app came with';
  const day = new Date(arrival).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', timeZone: tz,
  });
  return `Brought in on ${day}`;
};

/** "Everything under [container]" — live sortable descendants, transitively.
 *  Cycle-guarded like every tree walk here: a shard can deliver half a loop. */
export function underContainer(state: State, rootId: string): NodeState[] {
  const out: NodeState[] = [];
  const seen = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const n of state.nodes.values()) {
      if (n.parent !== cur || seen.has(n.id)) continue;
      seen.add(n.id);
      queue.push(n.id);
      if (sortable(n)) out.push(n);
    }
  }
  return out.sort(oldestFirst);
}

/**
 * "Parked and now back" — the park clock has passed. A park never demands
 * (deliberately — held away on purpose), and a passed one raises no replan
 * card, so WITHOUT this range a returned park is a status word in "Later" and
 * nothing more. This range is what makes parking honest rather than an
 * archive with a return date.
 */
export const parkedAndBack = (state: State, nowIso: string): NodeState[] =>
  heldNodes(state)
    .filter(sortable)
    .filter(n => {
      const p = n.clocks.park;
      return !!p && isValidIso(p.at) && Date.parse(p.at) <= Date.parse(nowIso);
    })
    .sort(oldestFirst);

/**
 * "Dates that have gone by" (V2 stage 3) — the standing range.
 *
 * The replan surface shows at most `REPLAN_CAP` cards, because a wall of them
 * is the pile in a new costume. That cap is right for the surface and it left a
 * hole: with 69 passed dates, three at a time and one decision each is not a way
 * through, and the only bulk path was the AMNESTY — which is lapse-gated, so it
 * is offered only after a fortnight away. Somebody who never lapsed had no way
 * to deal with a backlog of dates at all.
 *
 * This is the same predicate the replan surface uses (`raisesReplanCard`, the
 * one definition), narrowed by `sortable` so every verb the range family offers
 * is legal on every item — a range that offers a verb the gate then refuses is
 * the amnesty's own defect one layer up.
 *
 * `sortable` is belt-and-braces, and saying so is the point. Today the two
 * predicates agree on every kind — `NO_REPLAN_CARD` already excludes every
 * container and every demand-free kind, so nothing unsortable raises a card in
 * the first place. The filter is here so that if `raisesReplanCard` ever widens,
 * this range cannot start offering a bulk verb the gate must then refuse, which
 * is the amnesty's own defect one layer up. It is a guard against a future
 * change, not a filter doing visible work now.
 *
 * The lapse-gated amnesty stays exactly as it is, for genuine returns.
 */
export const datesGoneBy = (state: State, nowIso: string, zone: string): NodeState[] => {
  const day: DayShape = { zone, boundary: boundaryOf(state) };
  return heldNodes(state)
    .filter(sortable)
    .filter(n => raisesReplanCard(n, nowIso, day))
    .sort(oldestFirst);
};

/** "Matching [the user's own words]" — the search predicate, narrowed to what
 *  a sorting card may hold. */
export const matchingQuery = (state: State, query: string): NodeState[] =>
  searchHeld(state, query, Number.MAX_SAFE_INTEGER).items
    .filter(sortable)
    .sort(oldestFirst);

/**
 * "On the Menu — [category]" (1.5.0). A SECOND predicate family, deliberately
 * not `sortable`: a Menu item is a wish, the six routes are illegal on it
 * (Menu-plus-clock is the state the gate's belt refuses), so these ranges
 * carry BULK verbs only — bring back as real work, let go — and never the
 * per-card conveyor. ADR-0044's amendment records the family split.
 */
export const menuItems = (state: State, category: string): NodeState[] =>
  heldNodes(state)
    .filter(n => n.onMenu === category && !n.lastDone)
    .sort(oldestFirst);

/**
 * "Sharing a name with something else" (1.7.0, ADR-0053) — the twins range.
 * EXACT normalized-title equality, deliberately: fuzzy matching would put
 * things in front of a person that merely rhyme, and a false "this is the
 * same" costs more than a missed one. Seven years of inbox plus fresh
 * captures of the same worries is the recorded trigger; the conveyor shows
 * them side by side and the sheet's fold verb does the rest.
 */
export function sharingAName(state: State): NodeState[] {
  const groups = new Map<string, NodeState[]>();
  for (const n of heldNodes(state).filter(sortable)) {
    const key = normalize(n.title || '');
    if (!key) continue;
    let arr = groups.get(key);
    if (!arr) groups.set(key, arr = []);
    arr.push(n);
  }
  const out: NodeState[] = [];
  for (const arr of groups.values()) if (arr.length > 1) out.push(...arr);
  return out.sort(oldestFirst);
}

/** One choice in the picker: a sentence, a count, and the items behind them.
 *  The picker renders the first two and NEVER the third (law 8). */
export interface RangeChoice {
  key: string;
  words: string;
  count: number;
  items: () => NodeState[];
  /** Which verbs may face these items: `runway` ranges take the six routes and
   *  the runway bulk verbs; `menu` ranges take promote semantics only. */
  family: 'runway' | 'menu';
}

/**
 * What the picker offers, computed fresh: the fixed ranges that currently hold
 * anything, plus one entry per container with sortable descendants. Empty
 * ranges are not offered — a door to nowhere is noise.
 *
 * GETTERS, not values (audit, CRITICAL). The first version closed each
 * choice's `items` over the state object passed in — a frozen snapshot,
 * because `session.commit` replaces the state object on every write. The
 * conveyor kept offering items live state had disqualified: the detail sheet
 * is reachable mid-sort, so the very card on screen could be completed or
 * sent to the Menu and then still routed. Every `items()` call now re-reads.
 */
export function rangeChoices(
  getState: () => State, nowIso: () => string, zone = 'UTC',
): RangeChoice[] {
  const state = getState();
  const out: RangeChoice[] = [];
  // FIRST. Everything else in this picker is a way of finding work; this is the
  // one that is already asking, and a person opening the picker with a backlog
  // of dates should not have to read past four other doors to reach it.
  const gone = datesGoneBy(state, nowIso(), zone);
  if (gone.length > 0) {
    out.push({
      key: 'dates-gone-by',
      words: 'Dates that have gone by',
      count: gone.length,
      items: () => datesGoneBy(getState(), nowIso(), zone),
      family: 'runway',
    });
  }
  // ONE DOOR PER ARRIVAL (3.11.0), where there used to be one door for all of
  // them together.
  //
  // Two imports a month apart were one undifferentiated lump, and so was the
  // example set the app ships with — which is the half that turns into somebody
  // else's problem later: loose rows they cannot tell from their own forgotten
  // work, in a store they are now afraid to clean. Each arrival is its own set
  // now, named, and reachable by the wholesale verbs that already exist.
  //
  // Generated per key, exactly as `under:` and `menu:` below already are, so
  // nothing here is a list that can go stale against what is in the store.
  for (const arrival of arrivalsWaiting(state)) {
    const set = looseFromImport(state, arrival);
    if (set.length === 0) continue;
    out.push({
      key: `arrival:${arrival}`,
      words: arrivalWords(arrival, zone),
      count: set.length,
      items: () => looseFromImport(getState(), arrival),
      family: 'runway',
    });
  }
  const back = parkedAndBack(state, nowIso());
  if (back.length > 0) {
    out.push({
      key: 'parked-back',
      words: 'Parked, and now back',
      count: back.length,
      items: () => parkedAndBack(getState(), nowIso()),
      family: 'runway',
    });
  }
  const twins = sharingAName(state);
  if (twins.length > 0) {
    out.push({
      key: 'twins',
      words: 'Sharing a name with something else',
      count: twins.length,
      items: () => sharingAName(getState()),
      family: 'runway',
    });
  }
  for (const c of heldNodes(state).filter(isContainer)
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''))) {
    const under = underContainer(state, c.id);
    if (under.length === 0) continue;
    out.push({
      key: `under:${c.id}`,
      words: `Everything under ${c.title || '(untitled)'}`,
      count: under.length,
      items: () => underContainer(getState(), c.id),
      family: 'runway',
    });
  }
  // Menu ranges last: wishes after work, one per category that holds anything.
  const cats = new Map<string, number>();
  for (const n of heldNodes(state)) {
    if (n.onMenu && !n.lastDone) cats.set(n.onMenu, (cats.get(n.onMenu) ?? 0) + 1);
  }
  for (const [cat, count] of [...cats.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    out.push({
      key: `menu:${cat}`,
      words: `On the Menu — ${cat}`,
      count,
      items: () => menuItems(getState(), cat),
      family: 'menu',
    });
  }
  return out;
}
