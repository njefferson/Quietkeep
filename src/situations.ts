// A situation somebody NAMED, so it can be recalled (2.21.0, the plan's phase 5).
//
// *Where you are* and *how long you have* are two answers to one question, and
// answering it again every Tuesday morning is the kind of small repeated cost
// this app exists to take off somebody. Naming the pair makes a recurring
// meeting recurring **without the app ever mentioning it again**: saving one is
// a shortcut, never a schedule.
//
// ## What is deliberately absent
//
// No last-used, no count of uses, no ordering by frequency, no "you have not
// used this in a while". Every one of those would turn a shortcut somebody made
// for themselves into a record of their habits, which is exactly what law 7
// keeps this app out of — and the nagging that law 8 makes lapse-tolerant.
//
// ## Who is in the room is the third answer (3.15.0)
//
// *Where you are* and *how long you have* were two answers to one question, and
// a recurring meeting is not fully named by either. **A meeting is a place, a
// length and a set of faces**, and the third was the one that could not be
// stored — which is why entry 24's own SINCE WRITTEN note says a situation
// carrying who is in the room is not yet recallable.
//
// A LIST, and that is why this could not ride on the existing person filter.
// `where.now` and `with.now` are single-valued device preferences: one place,
// one person. A meeting has several people and narrowing a working surface to
// one of them answers a different question. So this stores the set, and what
// reads it is an inspection mode rather than a filter — the rule ADR-0115 and
// `docs/horizon-models.md` §3 already state, and the reason a line is somewhere
// you stand rather than something you narrow to.
//
// PURE, like every projection here.

import type { State } from './fold.ts';
import type { NodeId } from './events.ts';
// RESOLVED THROUGH STATE, never from the stored id: null for a person who is
// missing AND for one who was let go, which is the whole reason this is a
// shared function rather than a lookup written here. `portfolio.ts` reached
// into `state.nodes` directly and went on naming somebody who had been let go.
import { personName } from './people.ts';

export interface Situation {
  /** The place it recalls, or null for anywhere. */
  context: string | null;
  /** The length of time it recalls, or null for however long. */
  minutes: number | null;
  /**
   * Who it recalls, possibly nobody (3.15.0).
   *
   * Empty is the ordinary case and is not an absence to report — most
   * situations are a desk and an hour. A situation saved before this existed
   * folds to an empty list and reads exactly as it did.
   */
  people: NodeId[];
}

/**
 * What one saved situation recalls, in words.
 *
 * **Resolved through state**, so a place that has been let go stops being named
 * by the situations that pointed at it, with no migration — the rule
 * `contextsOf`, `withWhom` and `rolesOf` all already follow, and the one
 * `portfolio.ts` was found not following.
 *
 * Both halves may be absent, and a situation that recalls neither is still
 * legal: somebody may have named it before setting anything. It says so rather
 * than rendering blank, because a row with nothing after it reads as broken.
 */
export function situationWords(state: State, s: Situation): string {
  const place = s.context ? state.nodes.get(s.context) : undefined;
  const live = place && !place.trashed && !place.mergedInto && !place.released;
  const where = live ? (place.title || '(unnamed)') : null;
  const how = s.minutes === null ? null
    : s.minutes < 60 ? `${s.minutes} minutes`
      : s.minutes % 60 === 0 ? `${s.minutes / 60}h` : `${Math.floor(s.minutes / 60)}h ${s.minutes % 60}m`;
  const who = whoWords(state, s.people);
  // ASSEMBLED FROM PARTS, not branched (3.15.0). Two optional halves was four
  // cases written out; three is eight, and the version of this that added the
  // third by hand got two of them wrong before the tests said so.
  //
  // Two shapes survive as special cases and both are about not sounding
  // truncated: a place with no length says "however long" rather than trailing
  // off, and a length with no place says "anywhere" rather than opening on a
  // duration. Neither applies once anybody is named — "the office, with Sam"
  // is a complete sentence and "the office, however long, with Sam" pads it.
  const said = [
    where,
    how ?? (where && !who ? 'however long' : null),
    who,
  ].filter((x): x is string => !!x);
  if (said.length === 0) return 'nothing set';
  if (!where && how) return [`anywhere, ${how}`, who].filter(Boolean).join(', ');
  return said.join(', ');
}

/**
 * Who a situation recalls, in words, or null for nobody (3.15.0).
 *
 * NAMES, up to two, then a count — `stakeholderWords`' cadence, because a row
 * that grows without bound stops being a row. It is not the same function: that
 * one ends "care how it goes", which is a claim about the people; this states
 * only that they are expected to be there.
 *
 * Null when the list is empty AND when every name in it has been let go, which
 * are the same fact to a reader: nobody this situation names is still here.
 */
export function whoWords(state: State, people: readonly NodeId[]): string | null {
  const names = people
    .map(id => personName(state, id))
    .filter((n): n is string => !!n)
    .sort((a, b) => a.localeCompare(b));
  if (names.length === 0) return null;
  if (names.length === 1) return `with ${names[0]}`;
  if (names.length === 2) return `with ${names[0]} and ${names[1]}`;
  const rest = names.length - 2;
  return `with ${names[0]}, ${names[1]} and ${rest} ${rest === 1 ? 'other' : 'others'}`;
}
