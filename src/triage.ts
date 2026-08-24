// Triage projections (Phase 2). Pure functions of state + the rules for what
// still needs a human's two taps. Computed, never stored (build-plan §2).
//
// "Unclarified" is the whole inbox premise: a captured item sits under an
// aggressive same-day clock (the gate's cure) so it is never silent, but it has
// not yet been ROUTED. Clarify turns it into an action/waiting-for/Menu item/
// trash. Heat is an even lighter first pass — hot or cold — that can run before
// clarify to make clarify faster.

import type { State, NodeState } from './fold.ts';
import type { Heat } from './events.ts';
import { isHeld } from './fold.ts';

/** Capture order is the only order the inbox claims, and ULIDs sort by time. */
const byCaptureOrder = (a: NodeState, b: NodeState): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** A live CAPTURED item that has not been routed yet. Trashed and merged nodes
 *  are gone; a routed node has left the inbox by definition. The `captured`
 *  latch is load-bearing: without it the predicate would count ANY unrouted live
 *  node — a person, an anchor, a bother, a promoted Menu item — as "unclarified",
 *  offering it clarify routes that would then hard-fail on a demand-free node
 *  (audit). The inbox is captures-not-yet-routed, nothing else. */
const isInboxItem = (n: NodeState): boolean =>
  n.captured && isHeld(n) && n.route === null;

/**
 * The clarify queue: captured-not-yet-routed, boss-tagged first, then oldest
 * first within each tier. A thing the boss asked for that is sitting unclarified
 * is the most expensive kind to lose (build-plan item 16), so it jumps the queue.
 * This is a two-tier priority — all boss items ahead of all non-boss items — not
 * a within-age nudge; the tests lock that behaviour.
 */
export function unclarified(state: State): NodeState[] {
  const items = [...state.nodes.values()].filter(isInboxItem);
  // Defensive `?? []`: the snapshot path backfills sourceTags, but a projection
  // must not throw on a malformed node even so.
  const boss = (n: NodeState): number => ((n.sourceTags ?? []).includes('boss') ? 0 : 1);
  return items.sort((a, b) => boss(a) - boss(b) || byCaptureOrder(a, b));
}

/**
 * The heat-pass queue: unrouted CAPTURES with no heat yet.
 *
 * **AN ARRIVAL IS NOT SWEPT (2.38.0), and this is the toll somebody paid.**
 * Reported from the device: clicking Cold on every task, taking forever, and
 * nothing being removed by it. The sweep leads whenever four or more things
 * want it (`SWEEP_WORTH_IT` in `ui/clarify.ts`), so a 1,171-row import put
 * "Hot or cold?" in front of the six routes 1,171 times — and heat removes
 * nothing, it only orders Next up.
 *
 * ADR-0029 calls the sweep "an optional, lighter-weight first pass" whose value
 * is that a cheap run across A HANDFUL is easier than a run of six-route
 * decisions. A planner someone else wrote is not a handful you just put down,
 * and nobody has a feel for the heat of a thousand rows they have not read yet.
 *
 * 2.15.0 needed `captured` so the offer's unsorted tier could reach imported
 * work, which was right and is untouched. The sweep and the gauge came along
 * with it as side effects nobody chose. `arrived` is what tells them apart.
 */
export function needsHeat(state: State): NodeState[] {
  return [...state.nodes.values()]
    .filter(n => isInboxItem(n) && !n.arrived && n.heat === null)
    .sort(byCaptureOrder);
}

/** The head of the clarify queue, or null when the inbox is clear. The clarify
 *  surface shows exactly one card, so this is what it shows. */
export const nextToClarify = (state: State): NodeState | null => unclarified(state)[0] ?? null;

/** The head of the heat queue, or null. */
export const nextToHeat = (state: State): NodeState | null => needsHeat(state)[0] ?? null;

export interface InboxGauge { unclarified: number; unheated: number }

/** For a surface header: how much triage is waiting. Zero unclarified is the
 *  inbox-clear state. */
/**
 * THE HEADLINE COUNTS WHAT YOU PUT DOWN, NOT WHAT YOU BROUGHT IN (2.38.0).
 *
 * `test/sort-range.test.ts` has said so since the range work — *"the gauge
 * counts captures only — a 1,222-row import must never become a daily headline
 * (law 8)"* — and it stopped being true in 2.15.0, when an import began
 * latching `captured`. The test stayed green for twenty-two days because its
 * fixture wrote rows the importer no longer produces (hub LESSONS 138).
 *
 * Law 8 is that rest is legitimate. A number in the app's chrome saying you are
 * 1,171 behind, because you once brought a file in, is the opposite of that —
 * and it is not even true: an arrival is not something you owe today.
 *
 * `unclarified` still holds them, deliberately. The clarify surface is where you
 * GO to sort, and telling somebody the inbox is clear while a thousand things
 * sit unsorted would be the dishonest half of this trade.
 */
export const inboxGauge = (state: State): InboxGauge => ({
  unclarified: unclarified(state).filter(n => !n.arrived).length,
  unheated: needsHeat(state).length,
});

export type { Heat };
