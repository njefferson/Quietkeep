// Review, done as EXCEPTIONS ONLY (v1 Must: stalled/orphan detection).
//
// The classic weekly review asks you to look at everything. That is precisely
// the thing this audience cannot do, and the reason most review habits die: the
// cost is paid up front, every time, whether or not anything is wrong.
//
// So this surface never shows you your work. It shows you the four things that
// are structurally broken and nothing else — and when nothing is broken it is
// not there at all. An empty review is the normal state and it says so by its
// absence, not by a congratulation (law 5: nothing here is a score).
//
// **Stalled** — something that contains work, with no live piece of work under
// it. A project with no next action is the single most expensive silent failure
// in any planner: it looks fine on every surface, and nothing happens.
//
// **Orphaned** — a node whose parent is gone. The gate refuses to CREATE one
// (law 1), but a parent can be trashed later by a path that cured the children
// differently, and a shard exchange can deliver a child whose parent never
// arrived. So it is detected as well as prevented — the invariant is checked,
// not assumed.
//
// **Quiet area** (`dormant` in ADR-0013's vocabulary, 1.6.0) — an area that
// HOLDS live work where nothing has finished in a month. Distinct from
// stalled: stalled has nothing that could move, a quiet area has plenty and
// none of it is moving. The words are shame-free by design — a dormant
// perennial has not failed (ADR-0020); rest is legitimate, and the question
// is only whether it is rest.
//
// **Unfed goal** (`unsupported goal` in ADR-0013's vocabulary, 1.6.0) — a goal
// with nothing live beneath it feeding it. A goal is a stated direction, and a
// direction nothing serves is a decision waiting: feed it, or let it be a wish
// on the Menu. (Named "unfed" in code and copy — "unsupported" is a banned
// token in the update-copy gate, and one word with two meanings in one
// codebase is a collision waiting.)
//
// **Quiet line** (3.14.0) — a role that has carried work and carries nothing
// live now. THE FIRST EXCEPTION THAT IS NOT ABOUT THE TREE. Every class above
// walks `n.parent`, so "nothing is moving here" has only ever meant *nothing
// beneath it in the tree*, and a line — the cross-cutting thing a role names —
// was visible only to somebody who opened it. ADR-0115 named that gap in its
// own "still unbuilt" section and this closes it: the value of the finding is
// that it should come to you, which is ADR-0038's whole argument for putting
// the clock on the artifact instead of the ritual on the person.
//
// A role that has NEVER carried anything stays out, and that restraint is the
// same one `quietAreas` applies through `idleDays`: staleness needs a before.
// Without it, naming your roles on a fresh store — the one moment somebody is
// most likely to do it — would fill this surface with every role they just
// created, which reads as broken rather than as empty.
//
// PURE. `now` and `zone` are arguments.

import type { NodeState, State } from './fold.ts';
import { heldNodes } from './gate.ts';
import { NOT_ACTIONABLE } from './kinds.ts';
import { calendarDaysBetween, isValidIso } from './time.ts';
import { boundaryOf } from './day.ts';
import { CONTAINER_KINDS } from './tree.ts';
import type { NodeKind } from './events.ts';
import { isHeld, isGone } from './fold.ts';
import { allRoles } from './roles.ts';

/** Kinds that CONTAIN work rather than being work. These are the ones that can
 *  stall, because stalling means "nothing underneath is moving".
 *
 *  Imported, never redeclared: `src/tree.ts` decides what may HOLD something and
 *  this decides what may STALL, and if those two lists ever disagreed the app
 *  would offer a parent it then refused to review. */
const CONTAINERS = CONTAINER_KINDS;

export interface ReviewException {
  node: NodeState;
  /** Why it is here, in words the surface shows. Never a rebuke. */
  words: string;
}

export interface ReviewView {
  /** Containers with nothing live underneath them. */
  stalled: ReviewException[];
  /** Nodes whose parent is gone. */
  orphaned: ReviewException[];
  /** Goals with nothing live feeding them (1.6.0). */
  unfed: ReviewException[];
  /** Areas holding live work where nothing has finished in a month (1.6.0). */
  quiet: ReviewException[];
  /** Roles that have carried work and carry nothing live now (3.14.0). The
   *  first class here that is not a fact about the tree. */
  quietLines: ReviewException[];
  /** Everything, capped for the surface — law 8 bounds what re-entry may show. */
  shown: ReviewException[];
  /** How many there are altogether, so the cap is never a lie by omission. */
  total: number;
}

/** Law 8 again. Returning after a fortnight could surface many at once, and a
 *  wall of them is the pile this app exists to stand between you and. */
export const REVIEW_CAP = 3;

/** Is this node a live piece of work — something that could actually move? */
function isLiveWork(n: NodeState): boolean {
  if (isGone(n)) return false;
  if (n.lastDone) return false;
  if (n.onMenu) return false;                 // demand-free by law 6
  // A SPENT resume card is residue, not work. The thread was picked back up or
  // let go; either way nothing is moving because of it.
  //
  // Without this, a project whose only remaining child was a dead card read as
  // healthy — the precise failure this whole surface exists to catch, hidden by
  // the leftovers of a feature. `held.ts` learned the same lesson in 0.14.0 and
  // this file was not told: one concept, two places, one of them checking
  // (audit, 2026-07-29).
  if (n.kind === 'resume-card' && n.resumeSpent) return false;
  if (NOT_ACTIONABLE.has(n.kind as NodeKind)) return false;
  return true;
}

/**
 * Containers with no live work under them.
 *
 * An unrouted capture DOES count as live work here, deliberately: it is in the
 * inbox and triage will get to it, so the container is not stalled — it is
 * waiting on a step the app already has a surface for. Counting it as stalled
 * would send someone to Review for something triage was about to solve.
 */
export function stalled(state: State): ReviewException[] {
  const childrenOf = new Map<string, NodeState[]>();
  for (const n of heldNodes(state)) {
    if (!n.parent) continue;
    if (!childrenOf.has(n.parent)) childrenOf.set(n.parent, []);
    childrenOf.get(n.parent)!.push(n);
  }
  const out: ReviewException[] = [];
  for (const n of heldNodes(state)) {
    if (!CONTAINERS.has(n.kind as NodeKind)) continue;
    // A goal with nothing under it is the UNFED class (1.6.0), with its own
    // words — the classes partition by kind so a node is never listed twice.
    if (n.kind === 'goal') continue;
    if (n.lastDone) continue;                 // a finished outcome is not stalled
    const kids = childrenOf.get(n.id) ?? [];
    if (kids.some(isLiveWork)) continue;
    out.push({
      node: n,
      words: kids.length === 0
        ? 'nothing under it yet'
        : 'nothing under it is moving',
    });
  }
  return out.sort((a, b) => (a.node.id < b.node.id ? -1 : 1));
}

/**
 * Goals with nothing live feeding them (1.6.0 — ADR-0013's "unsupported
 * goal", named UNFED here: "unsupported" is a banned token in the update-copy
 * gate, and one word carrying two meanings in one codebase is a collision).
 * A goal is a stated direction; a direction nothing serves is a decision
 * waiting — feed it, or let it be a wish on the Menu.
 */
export function unfedGoals(state: State): ReviewException[] {
  const childrenOf = new Map<string, NodeState[]>();
  for (const n of heldNodes(state)) {
    if (!n.parent) continue;
    if (!childrenOf.has(n.parent)) childrenOf.set(n.parent, []);
    childrenOf.get(n.parent)!.push(n);
  }
  // TRANSITIVE, unlike stalled's direct check: a goal is normally fed through
  // a project, and a project is a container, not live work — asking only the
  // direct children would call every properly-structured goal unfed. Explicit
  // stack, cycle-guarded, like every walk here.
  const fedBeneath = (id: string): boolean => {
    const stack = [...(childrenOf.get(id) ?? [])];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const c = stack.pop()!;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      if (isLiveWork(c)) return true;
      stack.push(...(childrenOf.get(c.id) ?? []));
    }
    return false;
  };
  const out: ReviewException[] = [];
  for (const n of heldNodes(state)) {
    if (n.kind !== 'goal' || n.lastDone) continue;
    if (fedBeneath(n.id)) continue;
    out.push({ node: n, words: 'nothing is feeding it' });
  }
  return out.sort((a, b) => (a.node.id < b.node.id ? -1 : 1));
}

/** How long an area may hold live work with nothing finishing before Review
 *  asks. A month: long enough that rest is plausibly over, short enough that
 *  a season cannot slip by unnoticed. */
export const QUIET_DAYS = 30;

/**
 * Areas holding live work where nothing has finished in a month (1.6.0 —
 * ADR-0013's "dormant"). DISTINCT from stalled: stalled has nothing that
 * could move; a quiet area has plenty, and none of it is moving. Only
 * KNOWABLE rest counts — an area where nothing has ever finished reports
 * null idleDays and stays out, because a number derived from nothing is not
 * a fact (the idleDays rule). The words are shame-free: a dormant perennial
 * has not failed (ADR-0020), and the question is only whether it is rest.
 */
export function quietAreas(state: State, nowIso: string, zone: string): ReviewException[] {
  const childrenOf = new Map<string, NodeState[]>();
  for (const n of heldNodes(state)) {
    if (!n.parent) continue;
    if (!childrenOf.has(n.parent)) childrenOf.set(n.parent, []);
    childrenOf.get(n.parent)!.push(n);
  }
  const out: ReviewException[] = [];
  for (const n of heldNodes(state)) {
    if (n.kind !== 'area' || n.lastDone) continue;
    const kids = childrenOf.get(n.id) ?? [];
    if (!kids.some(isLiveWork)) continue;     // that is stalled's case, not this
    const idle = idleDays(state, n, nowIso, zone);
    if (idle === null || idle < QUIET_DAYS) continue;
    out.push({ node: n, words: 'holding work, and nothing has finished in a month' });
  }
  return out.sort((a, b) => (a.node.id < b.node.id ? -1 : 1));
}

/**
 * Roles carrying nothing live — a line that has gone quiet (3.14.0).
 *
 * **The first exception in this file that is not a fact about the tree.** A role
 * is a cross-cutting tag rather than a parent, so nothing above could see it:
 * `heldNodes` excludes roles by design (`gate.ts` — a role is WHO work is for,
 * not work), which means `stalled`, `orphaned` and `quietAreas` have never had
 * one in hand to examine.
 *
 * TRANSITIVE, for `unfedGoals`'s exact reason and not by imitation. A role is
 * normally carried by a project, and a project is a container rather than live
 * work — so asking only "is anything tagged with this role live" would call
 * every properly-structured line quiet the moment its owner tagged the project
 * instead of each action under it. The walk therefore goes down the tree from
 * every carrier.
 *
 * **A role that has never carried anything is not here.** Staleness needs a
 * before, the same rule `quietAreas` applies by refusing a null `idleDays`
 * rather than treating "nothing has ever finished" as a long time. The moment
 * somebody is most likely to name six roles is on a store with no work in it
 * yet, and a surface that answered that by listing all six would be reporting
 * its own emptiness as six problems.
 *
 * **It does not disagree with the role readout, and the difference is worth
 * stating because the two numbers can look contradictory.** `roleLoads` counts
 * what CARRIES the role — a tagged project counts, done or not moving or not.
 * This asks whether anything under any carrier is moving. That is precisely the
 * distance between `stalled` and a container that still has children, and it is
 * the question somebody is asking when they want to know whether the planning
 * has gone stale rather than what is on the books.
 */
export function quietLines(state: State): ReviewException[] {
  const childrenOf = new Map<string, NodeState[]>();
  for (const n of heldNodes(state)) {
    if (!n.parent) continue;
    if (!childrenOf.has(n.parent)) childrenOf.set(n.parent, []);
    childrenOf.get(n.parent)!.push(n);
  }
  // Same explicit, cycle-guarded stack as `unfedGoals`. A log that arrived from
  // another device can carry half a loop neither device ever wrote.
  const liveBeneath = (id: string): boolean => {
    const stack = [...(childrenOf.get(id) ?? [])];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const c = stack.pop()!;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      if (isLiveWork(c)) return true;
      stack.push(...(childrenOf.get(c.id) ?? []));
    }
    return false;
  };
  const out: ReviewException[] = [];
  for (const role of allRoles(state)) {
    const carriers = [...heldNodes(state)].filter(n => n.roles.includes(role.id));
    if (carriers.length === 0) continue;       // never used is not gone stale
    if (carriers.some(n => isLiveWork(n) || liveBeneath(n.id))) continue;
    out.push({
      node: role,
      words: carriers.every(n => n.lastDone)
        ? 'everything on it is finished'
        : 'nothing on it is moving',
    });
  }
  return out.sort((a, b) => (a.node.id < b.node.id ? -1 : 1));
}

/**
 * Nodes whose parent is gone.
 *
 * The gate refuses to create one, so finding any is a real signal rather than
 * routine — which is exactly why it is checked. An invariant nobody verifies is
 * a belief.
 */
export function orphaned(state: State): ReviewException[] {
  const out: ReviewException[] = [];
  for (const n of heldNodes(state)) {
    if (!n.parent) continue;
    const parent = state.nodes.get(n.parent);
    if (parent && isHeld(parent)) continue;
    out.push({
      node: n,
      words: parent ? 'what it belonged to was let go' : 'what it belonged to is not here',
    });
  }
  return out.sort((a, b) => (a.node.id < b.node.id ? -1 : 1));
}

/**
 * The whole surface — the five exceptions, ranked: structural breaks first
 * (orphans), then decisions waiting (stalled, unfed goals, quiet lines), then
 * rhythm (quiet areas). REVIEW_CAP is unchanged; a lower-ranked class waiting
 * its turn is law 8 working, and the total states everything.
 *
 * **Quiet lines rank below unfed goals and above quiet areas (3.14.0)**, and
 * the placement is the argument. A goal nothing feeds and a line nothing is
 * running on are the same shape of finding — a stated direction with no work
 * behind it — so they belong in the same band; the goal goes first because it
 * is the reader's own stated end and the role is the hat they wear to serve it.
 * Both sit above rhythm, because a quiet area still has work in it and these
 * two do not.
 */
export function reviewExceptions(state: State, nowIso: string, zone: string): ReviewView {
  const orph = orphaned(state);
  const stall = stalled(state);
  const unfed = unfedGoals(state);
  const lines = quietLines(state);
  const quiet = quietAreas(state, nowIso, zone);
  const all = [...orph, ...stall, ...unfed, ...lines, ...quiet];
  return {
    stalled: stall, orphaned: orph, unfed, quietLines: lines, quiet,
    shown: all.slice(0, REVIEW_CAP), total: all.length,
  };
}

/** How many there are, in words. A number, never a score — it counts things
 *  that need a decision, not things anyone failed to do. */
export function reviewWords(total: number, shown: number): string {
  if (total === 1) return 'One thing needs a look.';
  if (total <= shown) return `${total} things need a look.`;
  return `${total} things need a look. These ${shown} first.`;
}

/** How long since a container last had anything happen under it. Reported only
 *  where it is knowable — silence beats a number derived from nothing. */
export function idleDays(state: State, n: NodeState, nowIso: string, zone: string): number | null {
  let newest: string | null = null;
  for (const child of heldNodes(state)) {
    if (child.parent !== n.id) continue;
    const at = child.lastDone;
    if (at && isValidIso(at) && (!newest || at > newest)) newest = at;
  }
  return newest
  //
  // The reader's day, not the calendar's (V2 stage 5, threaded 1.38.1). The
  // boundary is read from the store here rather than taken as an argument,
  // which is the convention the other entry points already use — a caller that
  // has the state cannot pass a boundary that disagrees with it.
    ? calendarDaysBetween(newest, nowIso, { zone, boundary: boundaryOf(state) })
    : null;
}
