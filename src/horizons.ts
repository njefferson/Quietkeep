// WHAT YOU ARE WORKING TOWARD — the surface that lists the horizons, including
// the empty ones ([ADR-0013](../docs/adr/0013-law-4-horizons.md); the plan's
// phase 2 step 3).
//
// ## Why the empty ones are the point
//
// `review.ts` already computes `unfedGoals` and `quietAreas`, and Review shows
// them capped at three, exceptions-first. That is the right shape for "what
// needs attention" and the wrong one for "what am I working toward" — an
// exception list answers a question nobody asked until something is wrong, and
// caps at three besides. **A goal with nothing under it is not only an
// exception. It is a goal**, and somebody deciding what to put under it has to
// be able to see it first.
//
// ## Why this is not a tree view
//
// ADR-0013 refuses the full tree as a landing view, and this is not one: it is
// reachable, never a destination, and it lists ALTITUDE's three upper kinds
// rather than every container. Projects are excluded as ROWS on purpose — an
// import produced 42 of them from one file, and a page listing all of those is
// the tree by another name.
//
// But `serves.ts` records the cost of excluding projects entirely: most trees
// are one project deep for a long time, so a version speaking only of goals and
// areas renders nothing for almost everybody and **reads as broken rather than
// as empty**. The answer here is not to add project rows; it is that the empty
// state COUNTS the projects and says so, which is the difference between "you
// have nothing" and "you have work, and none of it is under a horizon yet".
//
// ## What is deliberately not here
//
// No score, no percentage, no progress bar, no count that could be read as one
// (law 5, law 7). The count of live work under a horizon is stated in words for
// the same reason the roles readout states its loads in words: an integer
// beside a name is read as a grade, and this surface has no opinion about
// whether three is better than one.

import type { NodeState, State } from './fold.ts';
import { heldNodes } from './gate.ts';
import { NOT_ACTIONABLE } from './kinds.ts';
import { isGone } from './fold.ts';
import type { NodeKind } from './events.ts';

/** The kinds this surface lists, highest first — ALTITUDE minus `project`.
 *  Kept as its own list rather than imported from `serves.ts`: that one exists
 *  to RANK an ancestor chain and legitimately includes `project`, and sharing
 *  it would make "what ranks" and "what is listed" impossible to change apart.
 */
export const HORIZON_KINDS: readonly NodeKind[] = ['goal', 'area', 'outcome'];

/** The word for each kind, as it appears on the row. */
export const HORIZON_WORDS: Readonly<Record<string, string>> = {
  goal: 'goal',
  area: 'area',
  outcome: 'outcome',
};

export interface HorizonRow {
  node: NodeState;
  /** Live work beneath it, transitively. 0 is a real and expected answer. */
  holds: number;
  /** Its cadence in days, or null when nobody has set one. */
  everyDays: number | null;
}

export interface HorizonView {
  rows: HorizonRow[];
  /** Projects in the store. Not rows — see the header. */
  projects: number;
}

/** Live work, by the same definition Review uses. Duplicated deliberately: that
 *  one is module-private, and exporting it to share it would make a change
 *  there silently change what this page says. Both cite the same rule. */
function isLiveWork(n: NodeState): boolean {
  if (isGone(n)) return false;
  if (n.lastDone) return false;
  if (n.onMenu) return false;                 // demand-free by law 6
  if (n.kind === 'resume-card' && n.resumeSpent) return false;
  if (NOT_ACTIONABLE.has(n.kind as NodeKind)) return false;
  return true;
}

/**
 * Every horizon, with what it is carrying — **the empty ones included**.
 *
 * Ordered by altitude and then by title, so the list is stable across paints
 * and does not reshuffle under somebody reading it. Never by how much is under
 * them: that would be a ranking, and a ranking of somebody's goals by how busy
 * they are is a verdict (law 7).
 */
export function horizonRows(state: State): HorizonView {
  const childrenOf = new Map<string, NodeState[]>();
  let projects = 0;
  const held = [...heldNodes(state)];
  for (const n of held) {
    if (n.kind === 'project' && !isGone(n)) projects += 1;
    if (!n.parent) continue;
    if (!childrenOf.has(n.parent)) childrenOf.set(n.parent, []);
    childrenOf.get(n.parent)!.push(n);
  }

  // TRANSITIVE and cycle-guarded, the same walk `unfedGoals` uses and for the
  // same reason: a goal is normally fed through a project, so counting only
  // direct children would report every properly-structured goal as empty.
  const liveBeneath = (id: string): number => {
    const stack = [...(childrenOf.get(id) ?? [])];
    const seen = new Set<string>();
    let n = 0;
    while (stack.length > 0) {
      const c = stack.pop()!;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      if (isLiveWork(c)) n += 1;
      stack.push(...(childrenOf.get(c.id) ?? []));
    }
    return n;
  };

  const rank = (k: NodeKind): number => {
    const i = HORIZON_KINDS.indexOf(k);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };

  const rows = held
    .filter(n => !isGone(n) && HORIZON_KINDS.includes(n.kind as NodeKind))
    .map(n => ({
      node: n,
      holds: liveBeneath(n.id),
      everyDays: (n.intervalDays ?? 0) > 0 ? n.intervalDays : null,
    }))
    .sort((a, b) => rank(a.node.kind as NodeKind) - rank(b.node.kind as NodeKind)
      || (a.node.title || '').localeCompare(b.node.title || ''));

  return { rows, projects };
}

/** What one row is holding, in words. Never a bare integer — see the header. */
export const holdsWords = (holds: number): string =>
  holds === 0 ? 'nothing under it yet'
    : holds === 1 ? '1 thing under it'
      : `${holds} things under it`;

/** Its rhythm, in words, or the absence of one stated rather than left blank. */
export const rhythmWords = (everyDays: number | null): string =>
  everyDays === null ? 'no rhythm set'
    : everyDays === 1 ? 'comes back every day'
      : `comes back every ${everyDays} days`;

/** The line above the list, saying what this is and what it is not. It has to
 *  say "not a score" out loud for the same reason the roles readout does: a
 *  list of names with counts beside them is read as a leaderboard by default. */
export const HORIZON_READOUT_WORDS =
  'What you are working toward, and what each one is carrying right now. '
  + 'A description, not a target — nothing here is being graded, and an empty '
  + 'one is not a failure.';

/** The empty state. Counts the projects rather than saying nothing, so a store
 *  full of work does not render a blank page and read as broken. */
export function horizonEmptyWords(projects: number): string {
  if (projects === 0) {
    return 'Nothing here yet. When something you are doing is in service of '
      + 'something larger, you can say so when you file it — choose goal, area '
      + 'or outcome instead of project.';
  }
  return `Nothing here yet, and ${projects === 1 ? 'the 1 project you have is' : `all ${projects} of your projects are`} `
    + 'standing on their own. That is a perfectly ordinary way to work. If any '
    + 'of them is in service of something larger, you can say so when you file it.';
}
