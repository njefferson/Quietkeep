// The last act under a role (3.28.0, docs/decisions/roles-review-2026-11.md).
//
// A role is demand-free, so it can carry no clock and no window (law 6, ADR-0014).
// What the Review door can still say about one, without a threshold and without a
// late state, is an ORDER: the roles carrying live work, from the one longest
// since anything was done under it. This module is that one reading, stated once.
//
// The rule. The last act under a role is the newest `at` among the counted events
// that concern any node in the role's set. The set is every held node that carries
// the role and every descendant of one, by the tree as it stands now. The counted
// kinds are a closed list (`ATTENDED_KINDS`); a kind that arrives later is not an
// act until the list is amended. Opening a sheet is not an act, because the
// vocabulary has no event for a view and ADR-0054 and ADR-0092 refuse to record
// where somebody looked.
//
// The fold keeps no time per node for most acts, so this reads the LOG, passed in
// as an argument. PURE: `now`, `zone` and liveness are arguments, nothing is
// stored, nothing is written, and no event is added.
//
// Imports nothing from `review.ts` or any surface, so `review.ts` may import it.
// Liveness is the caller's (`isLive`), so one definition of live work stays in one
// place.

import type { NodeState, State } from './fold.ts';
import type { AppEvent } from './events.ts';
import { heldNodes } from './gate.ts';
import { allRoles } from './roles.ts';
import { boundaryOf } from './day.ts';
import { calendarDaysBetween, daysWords, isValidIso } from './time.ts';

/** The kinds that count as somebody having done something. Closed on purpose. */
export const ATTENDED_KINDS: readonly string[] = [
  'done.marked', 'done.unmarked',
  'do-now.timed',
  'focus.started',
  'capture.recorded',
  'node.created',
  'node.field.set', 'node.renamed',
  'node.parented',
  'clarify.routed',
  'role.attached',
];

const COUNTED = new Set<string>(ATTENDED_KINDS);

export interface Attended {
  readonly role: NodeState;
  /** The newest counted act under the role, or null when none is on record. */
  readonly lastActAt: string | null;
  /** Whole days in the reader's day since that act, never below zero; null with no act. */
  readonly days: number | null;
}

/** The node an event is an act on, or null when it is not an act. */
function actTarget(e: AppEvent): string | null {
  if (!COUNTED.has(e.kind)) return null;
  if (!isValidIso(e.at)) return null;
  const p = e.payload as Record<string, unknown> | null | undefined;
  if (e.kind === 'node.created') {
    // An import lands in one commit with one `at`; counting it would make every
    // role look worked on the day somebody brought a planner in.
    if (p && (p['arrival'] !== undefined || p['arrived'])) return null;
  }
  if (e.kind === 'capture.recorded' && p && p['source'] === 'sample') return null;
  if (e.kind === 'role.attached' || e.kind === 'focus.started') {
    const named = p ? p['node'] : undefined;
    return typeof named === 'string' ? named : e.node;
  }
  return e.node;
}

/** The roles carrying live work, in name order, without the log. Exactly the set
 *  `attendedOrder` returns. A role with no carrier is in neither this nor the
 *  quiet lines (staleness needs a before). */
export function rolesCarryingLive(state: State, isLive: (n: NodeState) => boolean): NodeState[] {
  const held = heldNodes(state);
  const childrenOf = new Map<string, NodeState[]>();
  for (const n of held) {
    if (!n.parent) continue;
    if (!childrenOf.has(n.parent)) childrenOf.set(n.parent, []);
    childrenOf.get(n.parent)!.push(n);
  }
  // Explicit, cycle-guarded stack: a log from another device can hold half a loop.
  const liveBeneath = (id: string): boolean => {
    const stack = [...(childrenOf.get(id) ?? [])];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const c = stack.pop()!;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      if (isLive(c)) return true;
      stack.push(...(childrenOf.get(c.id) ?? []));
    }
    return false;
  };
  const out: NodeState[] = [];
  for (const role of allRoles(state)) {
    const carriers = held.filter(n => n.roles.includes(role.id));
    if (carriers.length === 0) continue;
    if (carriers.some(n => isLive(n) || liveBeneath(n.id))) out.push(role);
  }
  return out;
}

/** Every carrier of a role and every descendant of one, finished and trashed
 *  descendants included, by the tree as it stands. */
function setOf(state: State, role: NodeState, childrenAll: Map<string, string[]>): Set<string> {
  const members = new Set<string>();
  const stack: string[] = [];
  for (const n of heldNodes(state)) if (n.roles.includes(role.id)) stack.push(n.id);
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (members.has(id)) continue;
    members.add(id);
    for (const c of childrenAll.get(id) ?? []) stack.push(c);
  }
  members.delete(role.id);
  return members;
}

/**
 * The roles carrying live work, from the one longest since an act under it.
 * Ordered by whole days in the reader's day, the largest first; a role with no
 * act on record is first; a tie falls to the title, then the id. There is no cut
 * anywhere in the order. One pass over the log, then one over the roles.
 */
export function attendedOrder(
  state: State,
  log: readonly AppEvent[],
  nowIso: string,
  zone: string,
  isLive: (n: NodeState) => boolean,
): Attended[] {
  const roles = rolesCarryingLive(state, isLive);
  if (roles.length === 0) return [];

  const newestOf = new Map<string, { ms: number; at: string }>();
  for (const e of log) {
    const target = actTarget(e);
    if (target === null) continue;
    const ms = Date.parse(e.at);
    if (!Number.isFinite(ms)) continue;
    const had = newestOf.get(target);
    if (!had || ms > had.ms) newestOf.set(target, { ms, at: e.at });
  }

  const childrenAll = new Map<string, string[]>();
  for (const n of state.nodes.values()) {
    if (!n.parent) continue;
    if (!childrenAll.has(n.parent)) childrenAll.set(n.parent, []);
    childrenAll.get(n.parent)!.push(n.id);
  }

  const day = { zone, boundary: boundaryOf(state) };
  const rows: Attended[] = roles.map(role => {
    let best: { ms: number; at: string } | null = null;
    for (const id of setOf(state, role, childrenAll)) {
      const got = newestOf.get(id);
      if (got && (!best || got.ms > best.ms)) best = got;
    }
    if (!best || !isValidIso(nowIso)) return { role, lastActAt: best ? best.at : null, days: null };
    return {
      role,
      lastActAt: best.at,
      // Clock skew from another device can put an act in the future; read as zero.
      days: Math.max(0, calendarDaysBetween(best.at, nowIso, day)),
    };
  });

  return rows.sort((a, b) => {
    const da = a.days === null ? Number.POSITIVE_INFINITY : a.days;
    const db = b.days === null ? Number.POSITIVE_INFINITY : b.days;
    if (da !== db) return da > db ? -1 : 1;
    return (a.role.title || '').localeCompare(b.role.title || '')
      || (a.role.id < b.role.id ? -1 : a.role.id > b.role.id ? 1 : 0);
  });
}

/** The line's words: what was done under the role and when, as a fact. */
export function attendedWords(a: Attended): string {
  if (a.days === null) return 'nothing is on record under it';
  if (a.days === 0) return 'something was done under it today';
  if (a.days === 1) return 'something was done under it yesterday';
  return `something was done under it ${daysWords(a.days)} ago`;
}
