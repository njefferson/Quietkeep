// THE PROOF OF JUDGEMENT — law 4's analogue of the coverage gauge (3.23.0).
//
// `coverageProof` (`src/gate.ts`) answers law 1: nothing is LOST, here are the
// named reasons, and here is what the app cannot guarantee. Its docblock says
// why that shape and not a reassuring number — *a container guarantee verified
// from the outside, which is the only kind that helps: the condition being
// addressed is precisely not being able to trust an assurance from the inside.*
//
// Nothing said the same thing about law 4. The app could demonstrate its
// INTEGRITY and could not demonstrate its JUDGEMENT, so the only way to check
// whether the right thing was in front of you was to read the whole store —
// and re-reading a store to feel safe is the behaviour this app exists to
// remove, not one it should require. `NOTES.md` names that asymmetry and calls
// this the highest-value thing to build; it was gated on Q-11 saying whether
// the problem was ranking or trust, and Q-11 closed on the ranking half on
// 2026-08-17 (ADR-0097) with the trust half left standing.
//
// WHAT IT IS NOT, and the refusals are the design. It never ranks, scores or
// grades, and it never says which thing matters most: `docs/nd-collisions.md`
// entry 5 refuses an importance rank in terms, and Q-11 carries the argument —
// a loose capture is very often the most important thing in the store. This
// makes no claim about the reader's things. It makes a claim about the APP's
// own reasoning, which is a different object and a checkable one.
//
// THE PLACES ARE `heldGroups`' OWN GROUPS, in its words and its order — the
// same rule `whyCovered` follows about `isSilent`'s clauses. A second
// vocabulary here would be a second thing to learn and a second thing to drift;
// deriving from the list means the proof and the list cannot describe one item
// differently, which is the ADR-0032 property one level up.
//
// PURE. `now` and `zone` are arguments, like every other projection here.

import type { NodeState, State } from './fold.ts';
import { heldWork } from './gate.ts';
import { heldGroups, type HeldGroupKey } from './held.ts';
import { reviewExceptions, type ReviewException } from './review.ts';

export interface JudgementPlace {
  key: HeldGroupKey;
  /** The held list's own words, never a second phrasing. */
  title: string;
  count: number;
}

export interface JudgementProof {
  /** True when every held thing sits in exactly one named place. The one thing
   *  a reader is actually asking, and — like `coverageProof.holds` — it must be
   *  able to be false, or it is not a proof. */
  holds: boolean;
  /** Everything held, from the gate's own set. */
  total: number;
  /** Where each of them is, biggest-first order left to `heldGroups`. */
  places: JudgementPlace[];
  /** What the work surface is drawing from right now — ready, and the passed
   *  dates that raise a card. The subset the claim is ABOUT: it says the rest
   *  is somewhere named, not that the rest is hidden. */
  onWorkSurface: number;
  /** WHAT THE APP CANNOT ACCOUNT FOR, named. The review exceptions are computed
   *  in `review.ts` and reach no surfacing layer, which `NOTES.md` records; a
   *  proof that can only say "fine" is asking for the exact faith the reader
   *  does not have. Capped by `review.ts`'s own law-8 bound. */
  neverSurfaced: ReviewException[];
  neverSurfacedTotal: number;
}

export function judgementProof(state: State, nowIso: string, zone: string): JudgementProof {
  const groups = heldGroups(state, nowIso, zone);
  const places: JudgementPlace[] = groups.map(g => ({
    key: g.key, title: g.title, count: g.items.length,
  }));
  const total = heldWork(state).length;
  const summed = places.reduce((n, p) => n + p.count, 0);
  const countOf = (key: HeldGroupKey): number =>
    places.find(p => p.key === key)?.count ?? 0;
  const rv = reviewExceptions(state, nowIso, zone);
  return {
    // The SUM, not a spot check. `heldGroups` is total over `heldWork` by
    // construction, so this can only be false if that stops being true — which
    // is exactly the day somebody needs to be told rather than reassured.
    holds: summed === total,
    total,
    places,
    onWorkSurface: countOf('ready') + countOf('replan'),
    neverSurfaced: rv.shown,
    neverSurfacedTotal: rv.total,
  };
}

/** The one line that ends the scan. It states the claim and its size, and it
 *  never says anything is fine — the reader decides that. */
export function assuranceWords(p: JudgementProof): string {
  if (p.total === 0) {
    return 'Nothing here yet. When you put something down, this says where it went.';
  }
  if (!p.holds) {
    // A number that does not add up is a defect in the app, and saying so
    // plainly is the whole reason `holds` can be false.
    return 'Some of what you hold is not accounted for below. That is this app’s '
      + 'fault rather than yours, and the report under the ⓘ will say so.';
  }
  const things = p.total === 1 ? '1 thing' : `${p.total} things`;
  const now = p.onWorkSurface === 0
    ? 'Nothing is asking right now'
    : p.onWorkSurface === 1 ? '1 of them is in front of you' : `${p.onWorkSurface} of them are in front of you`;
  return `${things} held, every one accounted for. ${now}, and the rest are where this says they are.`;
}

/**
 * The button's own line, in `#gauge`'s register exactly — lowercase, a middot
 * between two facts, short enough to read without stopping. The long form
 * belongs inside the sheet, where there is room for a sentence; a standing
 * control that needs two lines of prose is a control nobody glances at, which
 * is the failure this whole surface exists to fix.
 */
export function assuranceFact(p: JudgementProof): string {
  if (!p.holds) return 'some of this is not accounted for';
  const now = p.onWorkSurface === 0
    ? 'nothing asking now'
    : `${p.onWorkSurface} in front of you`;
  return `everything accounted for \u00b7 ${now}`;
}

/** One place, in the held list's words with its count beside it.
 *
 *  NOT `placeWords` — `held.ts` already exports that for a card's own line
 *  (what it is, what it sits in, what it holds). Two live exports of one name
 *  in one import list is a collision the compiler catches and a reader does
 *  not, so the narrower thing takes the longer name. */
export function placeCountWords(place: JudgementPlace): string {
  return `${place.title} — ${place.count === 1 ? '1 thing' : `${place.count} things`}`;
}

/** The gap, or silence. Never "0 exceptions" — a number pretending to be
 *  information, which every capped surface here already refuses. */
export function gapWords(n: number): string | null {
  if (n <= 0) return null;
  return n === 1
    ? '1 thing worth a look that no surface offers on its own.'
    : `${n} things worth a look that no surface offers on its own.`;
}

/** The nodes behind the gap, for the surface that opens it. */
export const gapNodes = (p: JudgementProof): NodeState[] => p.neverSurfaced.map(e => e.node);
