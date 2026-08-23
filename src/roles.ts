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
// The one place minutes become words. Never re-implemented here: "1h 20m" has
// to read identically wherever it appears, and two formatters drift.
import { minutesWords } from './duration.ts';

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
/**
 * WHERE THE ATTENTION ACTUALLY WENT — the phase 5 item this file's own header
 * promised and `roleLoads` could not answer (2.24.0).
 *
 * The sheet has been titled *Where the attention is* since 2.6.0 and has shown
 * a COUNT OF LIVE WORK, which is a different question. Load is what a role is
 * carrying; attention is what it was given. A role can be carrying nine things
 * and have had none of your time this month, and that gap is the whole reason
 * somebody opens this.
 *
 * ## The conflict this settles, so it is not rediscovered
 *
 * This file's header promised the readout and `roleLoads` four hundred words
 * later refuses to count finished work, because "counting it would turn this
 * into a record of output, which is the shape law 5 refuses". Both are right.
 * The distinction neither made:
 *
 *   **A record of output counts what you FINISHED. Attention is what you GAVE
 *   TIME TO, finished or not.**
 *
 * So this DELIBERATELY DOES NOT SKIP `lastDone`, where `roleLoads` must. An hour
 * spent on something you finished is an hour of your attention; dropping it
 * would make the readout answer "what is still open", which is the other
 * function. Built on `do-now.timed` — real elapsed time a timer measured — and
 * NOT on completions, which is what keeps it out of law 5's way.
 *
 * ## What it refuses, structurally
 *
 * No proportion, no share of a whole, no bar, no target, no "balanced", and
 * **sorted by name, never by size** — the rule `roleLoads` already follows,
 * because ordering somebody's own identities by how much each got is a ranking
 * of their life and the app does not get to make it.
 *
 * `sessions` is carried because it changes what the minutes MEAN: 90 minutes in
 * one sitting and 90 minutes across nine are not the same fact about a life, and
 * a surface showing only the total would be asserting they are.
 *
 * Minutes ARE summed here, and that is not a contradiction of `fold.ts`'s
 * refusal to sum. That refusal is about ESTIMATING — the mean of a tau-heavy
 * distribution sits in the gap where almost nothing lands, so a future duration
 * must never be guessed from past runs. This sums time that was actually spent.
 * A record of what happened is not a prediction, and no estimate is derived
 * from this anywhere.
 */
export interface RoleAttention {
  readonly role: NodeState;
  /** Total minutes a timer actually measured against this role's work. */
  readonly minutes: number;
  /** How many separate runs those minutes came from. */
  readonly sessions: number;
}

export function roleAttention(state: State, heldOf: (s: State) => Iterable<NodeState>): {
  rows: RoleAttention[];
  unnamed: number;
  /** Runs recorded across every node, named or not. Zero means the timer has
   *  never been used, which is a different thing from "no attention". */
  totalSessions: number;
} {
  const mins = new Map<NodeId, number>();
  const runs = new Map<NodeId, number>();
  let unnamed = 0;
  let totalSessions = 0;
  const named = new Set(allRoles(state).map(r => r.id));
  for (const n of heldOf(state)) {
    // NOT `if (n.lastDone) continue` — see above. That line belongs in
    // `roleLoads` and would make this answer the wrong question.
    const timed = (n.timedMinutes ?? []).filter(m => Number.isFinite(m) && m > 0);
    if (timed.length === 0) continue;
    const total = timed.reduce((a, b) => a + b, 0);
    totalSessions += timed.length;
    const mine = n.roles.filter(id => named.has(id));
    if (mine.length === 0) { unnamed += total; continue; }
    // Counted under BOTH identities, like `roleLoads`. The app has no idea how
    // an hour split between two of somebody's roles, and inventing halves would
    // be arithmetic pretending to be knowledge.
    for (const id of mine) {
      mins.set(id, (mins.get(id) ?? 0) + total);
      runs.set(id, (runs.get(id) ?? 0) + timed.length);
    }
  }
  return {
    rows: allRoles(state).map(role => ({
      role,
      minutes: mins.get(role.id) ?? 0,
      sessions: runs.get(role.id) ?? 0,
    })),
    unnamed,
    totalSessions,
  };
}

/**
 * What the attention rows say, or why there are none.
 *
 * THE SPARSITY IS THE HARD PART, and it is why this was not built for three
 * releases. It reads from `do-now.timed`, so on any store that has never used
 * the timer every row is zero — which is `serves.ts`'s failure with a different
 * noun: a surface that renders empty teaches the reader the feature is broken.
 * 2.19.0 answered the same shape by SAYING WHAT THE THING IS MADE OF, and this
 * does the same rather than hiding until it has data.
 */
export const roleAttentionWords = (totalSessions: number, unnamedMinutes = 0): string => {
  if (totalSessions === 0) {
    return 'Nothing here yet. This fills in from the timer — whenever you run one on '
      + 'something, the time counts toward whichever of these it belongs to. It is '
      + 'not filled in from what you finish, so nothing is missing because you '
      + 'have not been ticking things off.';
  }
  // THE REMAINDER IS IN THIS SENTENCE AND NOT ITS OWN (2.24.0). It was a
  // separate `<p>`, hidden when no timer had run — and a conditional element in
  // the a11y registry is a receipt for something the walk cannot see. The gate
  // said so on the first run: "matches nothing visible". The load readout above
  // can keep its own remainder line because that one always renders; this one
  // could not, so it stopped being a separate thing rather than being excused.
  const rest = unnamedMinutes === 0
    ? ' Every timed run belongs to one of these.'
    : ` ${minutesWords(unnamedMinutes)} of it belongs to no named role, which is `
      + 'ordinary — most things do not have one.';
  return 'Time a timer actually measured, whether or not the thing got finished. '
    + 'Only timed work is here, so this is a sample of your attention and not '
    + 'the whole of it — and it is a description, not a target.' + rest;
};

/** One role's line. Words, never a bare number: "40" beside a name is a score. */
export const roleAttentionRowWords = (r: RoleAttention): string => {
  if (r.sessions === 0) return 'no timed work';
  const t = minutesWords(r.minutes);
  // The count of runs is carried because it changes what the total MEANS —
  // 90 minutes at once and 90 across nine sittings are different facts.
  return r.sessions === 1 ? `${t}, in one go` : `${t}, across ${r.sessions} runs`;
};

// The opening sentence was "What each of these is carrying right now", which is
// what the heading above it now says (2.24.0). Rendered and looked at, that read
// as the same sentence twice — the heading only exists because this sheet holds
// two readouts and they must be told apart, and once it exists this line's job
// is the part a heading cannot do: saying what the numbers are NOT.
export const ROLE_READOUT_WORDS =
  'A description, not a target — nothing here is meant to be even, and nothing '
  + 'is keeping score.';
