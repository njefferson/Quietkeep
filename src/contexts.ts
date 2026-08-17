// WHERE YOU ARE, AND WHAT FITS IT (2.2.0, ADR-0092).
//
// The tree gives a thing exactly one parent — where it LIVES. This is the other
// axis: where it can be DONE. They are genuinely different questions, and the
// app only had the first, so "show me the things I can do at home" had no
// answer and every list was every list.
//
// ## The rule that keeps law 1 intact
//
// **A filter over what you are LOOKING at, never a partition of what is held.**
// That is ADR-0054's rule for the lens and it binds here identically: a thing
// filtered out still has its clock, still counts in the gauge, still comes back.
// Anything else is an archive with a friendlier name, which law 3 forbids.
//
// ## Unlabelled means anywhere, and that is load-bearing
//
// A thing with no context fits every context. It is the honest default — most
// of what anybody writes down is not tied to a place — and it is what stops the
// filter from being a cliff: switching to "At home" on a store where nothing is
// labelled hides nothing at all, so the feature cannot make the app look empty
// and broken on the day somebody first tries it.
//
// The opposite rule — unlabelled means nowhere — would be a system that
// punishes you for not having filed everything, which is the shape this app
// exists to avoid.

import type { NodeState, State } from './fold.ts';
import type { NodeId } from './events.ts';

/** Every context the reader has named, by id, in a stable order.
 *
 *  Sorted by TITLE rather than by id: this is a set somebody reads and picks
 *  from, and a list that reshuffles is one you have to re-read every time — the
 *  same reason the Menu sorts totally (menu.ts). */
export function allContexts(state: State): NodeState[] {
  return [...state.nodes.values()]
    .filter(n => n.kind === 'context' && !n.trashed && !n.mergedInto && !n.released)
    .sort((a, b) => (a.title || '').localeCompare(b.title || '') || (a.id < b.id ? -1 : 1));
}

/** The contexts attached to one thing, as live nodes.
 *
 *  Resolved through state rather than trusting the stored ids, so a context
 *  that was trashed stops appearing on the things that pointed at it without
 *  any migration — the same way `withWhom` resolves a person. */
export function contextsOf(state: State, n: NodeState): NodeState[] {
  const live = new Map(allContexts(state).map(c => [c.id, c]));
  return n.contexts.map(id => live.get(id)).filter((c): c is NodeState => !!c);
}

/** Their names, for a card. */
export const contextNames = (state: State, n: NodeState): string[] =>
  contextsOf(state, n).map(c => c.title || '(unnamed)');

/**
 * Does this thing fit where you are?
 *
 * `where === null` means "everywhere" — the filter is off and everything fits.
 * An unlabelled thing fits any answer, per the note at the top.
 */
export function fitsHere(state: State, n: NodeState, where: NodeId | null): boolean {
  if (where === null) return true;
  const live = contextsOf(state, n);
  if (live.length === 0) return true;
  return live.some(c => c.id === where);
}

/**
 * What the filter is doing, in words, for the standing line that says it is on.
 *
 * States the SCOPE and never a count of what is hidden. "14 hidden" would be an
 * aggregate about work you are deliberately not looking at, which is the number
 * V2 stage 1 took off the gauge for being a nag that only ever rises.
 */
export function whereWords(name: string): string {
  return `Showing what you can do ${lowerFirst(name)}, and anything that fits anywhere. `
    + 'Everything else is still held and still comes back.';
}

/** "At home" reads as "at home" mid-sentence. Only the first character, so a
 *  context somebody named "IKEA" keeps its capitals. */
function lowerFirst(s: string): string {
  return s.length > 1 && s[1] === s[1]?.toLowerCase()
    ? s.charAt(0).toLowerCase() + s.slice(1)
    : s;
}

/** The device's answer to "where are you", like the lens's root (ADR-0054).
 *
 *  A DEVICE VIEW PREFERENCE and not an event. Where you are is not a fact about
 *  your work and the log has no business holding a history of it — law 7 keeps
 *  the app out of inference, and a stored trail of where somebody was all week
 *  is exactly the material it stays out of. */
export const WHERE_KEY = 'where.now';

/** The live answer, cached at module level — the badge's and the lens root's
 *  pattern, so every render stays synchronous and a kv read never sits on the
 *  path to a paint.
 *
 *  It lives HERE rather than in `app.ts` because two modules need it: the shell
 *  narrows the held list, and `work.ts` narrows the OFFER. The offer is the half
 *  that answers the question this feature exists for — "show me what I can do at
 *  home" is useless if the one thing the app hands you is a job for the office —
 *  and app.ts cannot pass it down without work.ts importing app.ts, which is the
 *  cycle. One owner, two readers. */
let whereNow: NodeId | null = null;
export const getWhereNow = (): NodeId | null => whereNow;
export const setWhereNow = (id: NodeId | null): void => { whereNow = id; };
