// WHO WORK IS FOR (2.6.0, ADR-0096) — the other cross-cutting axis.
//
// Recorded in NOTES Q-13 as the owner's own framing: **roles are identities that
// cross multiple areas.** That single sentence settles the data model, because
// this tree is single-parent — so a thing that crosses areas structurally CANNOT
// be a container, and a role is a cross-cutting LINK. Q-13 said exactly that on
// 2026-08-04, named the shape, and then deferred building it behind a judgement
// about whether enough containers existed in the store yet. Thirteen days.
//
// ## Three axes now, and they answer different questions
//
// - The **tree** says where a thing LIVES. One parent, ever.
// - A **context** says where it can be DONE (ADR-0092).
// - A **role** says who it is FOR.
//
// The last two are the same machinery pointed in different directions, and that
// is deliberate rather than lazy: two features with one shape are one thing to
// learn, and the fold, the merge disposition, the gate exclusion and the card
// line all took their behaviour from the contexts that came first.
//
// ## Why this is NOT a filter, and contexts are
//
// `contexts.ts` carries `fitsHere` and a device-level "where you are", because
// where you are physically CHANGES during a day and narrowing to it is the whole
// point. **An identity does not work that way.** You do not stop being a parent
// at the office, and a "show me only Parent work" switch would be exactly the
// partition NOTES Q-10 argued against — two lists, and then you have to remember
// to check the other one.
//
// So a role is DESCRIPTIVE here: it says who a thing is for, on the thing. What
// it is FOR is the readout that comes next — where attention actually went,
// per role, which is the direct structural answer to the recorded question: HOW DO
// YOU SEE whether enough energy is going into each role. That is a plot the
// human reads (law 7), never a score and never a target (law 5).
//
// ## Nothing here is required, and nothing is inferred
//
// The honest majority of what anybody writes down belongs to no named identity,
// and a thing with no role says nothing rather than looking incomplete. The app
// never guesses a role from a title, a parent or a history — law 7, and the same
// rule that killed `pressureBands`.

import type { NodeState, State } from './fold.ts';
import type { NodeId } from './events.ts';

/** Every role the reader has named, by id, in a stable order.
 *
 *  Sorted by TITLE, like contexts and the Menu: this is a set somebody reads and
 *  picks from, and a list that reshuffles is one you have to re-read. */
export function allRoles(state: State): NodeState[] {
  return [...state.nodes.values()]
    .filter(n => n.kind === 'role' && !n.trashed && !n.mergedInto && !n.released)
    .sort((a, b) => (a.title || '').localeCompare(b.title || '') || (a.id < b.id ? -1 : 1));
}

/** The roles on one thing, as live nodes.
 *
 *  Resolved through state rather than trusting the stored ids, so a role that
 *  was let go stops appearing on the things that pointed at it with no migration
 *  — the same resolution `contextsOf` and `withWhom` use. */
export function rolesOf(state: State, n: NodeState): NodeState[] {
  const live = new Map(allRoles(state).map(r => [r.id, r]));
  return n.roles.map(id => live.get(id)).filter((r): r is NodeState => !!r);
}

/** Their names, for a card. */
export const roleNames = (state: State, n: NodeState): string[] =>
  rolesOf(state, n).map(r => r.title || '(unnamed)');

/**
 * How much live work each named role is carrying.
 *
 * THE PLOT, NOT THE VERDICT (law 7). It returns counts and says nothing about
 * whether any of them is right — no target, no proportion of a whole, no
 * "balanced", no colour, and deliberately no ordering by size. Sorted by name,
 * like everything else somebody reads and picks from, because sorting by count
 * would rank the reader's own identities against each other and that is a
 * judgement the app does not get to make.
 *
 * `held` counts things that are still being carried. A finished thing is not
 * live work and counting it would turn this into a record of output, which is
 * the shape law 5 refuses.
 *
 * The unnamed remainder is returned separately rather than as a row, because it
 * is not an identity and listing it beside real ones would invite reading it as
 * one — and it matters: on any real store it is the biggest number, and hiding
 * that would make the named roles look like the whole of somebody's life.
 */
export interface RoleLoad {
  readonly role: NodeState;
  readonly held: number;
}

export function roleLoads(state: State, heldOf: (s: State) => Iterable<NodeState>): {
  rows: RoleLoad[];
  unnamed: number;
} {
  const counts = new Map<NodeId, number>();
  let unnamed = 0;
  const named = new Set(allRoles(state).map(r => r.id));
  for (const n of heldOf(state)) {
    if (n.lastDone) continue;
    const mine = n.roles.filter(id => named.has(id));
    if (mine.length === 0) { unnamed += 1; continue; }
    // A thing belonging to two identities counts under BOTH. It is not a
    // division of effort — the app has no idea how the effort split, and
    // inventing halves would be arithmetic pretending to be knowledge.
    for (const id of mine) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return {
    rows: allRoles(state).map(role => ({ role, held: counts.get(role.id) ?? 0 })),
    unnamed,
  };
}

/**
 * The one line above the readout, stating what it is and what it is not.
 *
 * It has to say "not a score" out loud, because a list of numbers next to names
 * is read as a leaderboard by default — and the whole reason this is legal under
 * law 7 is that the human does the interpreting.
 */
export const ROLE_READOUT_WORDS =
  'What each of these is carrying right now. It is a description, not a target — '
  + 'nothing here is meant to be even, and nothing is keeping score.';
