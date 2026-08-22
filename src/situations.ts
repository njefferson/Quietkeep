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
// PURE, like every projection here.

import type { State } from './fold.ts';

export interface Situation {
  /** The place it recalls, or null for anywhere. */
  context: string | null;
  /** The length of time it recalls, or null for however long. */
  minutes: number | null;
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
  if (where && how) return `${where}, ${how}`;
  if (where) return `${where}, however long`;
  if (how) return `anywhere, ${how}`;
  return 'nothing set';
}
