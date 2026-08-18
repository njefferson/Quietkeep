// WHAT A THING IS FOR (2.5.0, ADR-0095) — law 4's other half.
//
// Law 4 is two clauses and only one of them was built. *"The user never
// climbs"* has been true since ADR-0013: altitude views are inspection modes,
// and nothing makes anybody walk a hierarchy to plan a day. *"Higher horizons
// project lineage and health DOWNWARD"* was never built at all. A card knew what
// it was inside — `placeWords` says "in Errands" — and nothing anywhere said
// what it was **for**.
//
// `docs/horizon-models.md` names this in terms: *"Downward lineage projection.
// Law 4. Rides the `lineageOf` walk that 1.20.0 put into production for the
// place line — 'in Errands · under Home' extends naturally to 'serves ⟨goal⟩'
// on the runway card, descriptive, never a destination."* NOTES Q-14 calls it
// *"what is genuinely unbuilt ... and it is the thing worth building"*.
//
// ## Why this is the answer to "no feeling of being shown the right things"
//
// Reported 2026-08-04 (Q-11) and open for thirteen days because the two possible
// readings were held to need opposite work. They do not. Measured in
// `nextup.ts`: **every tier of the offer is temporal** — hard date, chain,
// resume card, pressure, ready, unsorted — and the only tie-break inside a tier
// is pressure and then creation order. The app has never had any notion of what
// a thing is *for*, so it cannot show you the right things by any definition of
// right that is not "the most time-pressured".
//
// That is the ranking reading. The trust reading asks for grounds to believe an
// offer, the way the coverage gauge is grounds to believe law 1. **One build
// serves both**: when the offer says *"serves A calmer house"*, the reasoning is
// on screen and can be disagreed with. A judgement you can check is the only
// kind you can come to trust.
//
// ## What it will not do
//
// **It is descriptive and never a destination** (law 4, ADR-0013). The line
// names the horizon; it is not a door, does not offer to take you there, and
// nothing about it is a control.
//
// **It scores nothing** (law 5, law 7). There is no count of what a goal holds,
// no proportion, no "3 of 8 done", no colour. It is one fact: this is what you
// filed this under, several levels up.
//
// **It infers nothing about the reader** (law 7). The horizon is a container the
// reader made and a parent the reader set. Nothing here derives an opinion from
// anybody's logs — which is the rule that killed `pressureBands`, and the reason
// a "what matters to you" score is not what this builds.

import type { NodeState, State } from './fold.ts';
import type { NodeKind } from './events.ts';
import { ancestors } from './tree.ts';

/**
 * Altitude, highest first. A goal outranks an area outranks an outcome outranks
 * a project — so a thing filed four deep names the furthest thing it serves
 * rather than the nearest box it sits in, which `placeWords` already says.
 *
 * `project` is INCLUDED but ranks last, and that matters on a real store: most
 * people's trees are one project deep for a long time, and a version of this
 * that only spoke about goals and areas would render nothing for almost
 * everybody and read as broken rather than as empty.
 */
const ALTITUDE: readonly NodeKind[] = ['goal', 'area', 'outcome', 'project'];

const rankOf = (k: NodeKind): number => {
  const i = ALTITUDE.indexOf(k);
  return i === -1 ? Number.POSITIVE_INFINITY : i;
};

/**
 * The highest horizon above a node, or null when it sits under none.
 *
 * NOT the top of the chain — the HIGHEST-ALTITUDE ancestor. Those differ, and
 * the difference is the whole point: an action under "Ring the plasterer" under
 * "Re-do the hallway" (project) under "A calmer house" (goal) serves the goal,
 * and a walk that simply took the root would give the right answer here and the
 * wrong one the moment somebody files a goal under an area for tidiness.
 *
 * Ties break toward the NEARER ancestor. Two goals in one chain is unusual and
 * legal, and the closer one is the one the reader was thinking about when they
 * filed it.
 *
 * `ancestors` is cycle-bounded by construction, so this terminates on a log that
 * arrived from another device carrying half a loop neither device ever wrote.
 */
export function servesNode(state: State, n: NodeState): NodeState | null {
  let best: NodeState | null = null;
  let bestRank = Number.POSITIVE_INFINITY;
  for (const a of ancestors(state, n.id)) {
    // A let-go or folded-away horizon is no horizon. Saying a thing serves
    // something the reader threw away is worse than saying nothing.
    if (a.trashed || a.mergedInto) continue;
    const r = rankOf(a.kind as NodeKind);
    if (r < bestRank) { best = a; bestRank = r; }
  }
  return best;
}

/**
 * The line, in words, or null.
 *
 * Null when the node sits under no horizon, and that is the ordinary case for a
 * loose capture. Announcing "serves nothing" would make the flat majority of a
 * real store read as incomplete — the same restraint `tree.ts:placeWords`
 * already applies to having no parent.
 *
 * Null too when the node IS the horizon. A goal that said "serves A calmer
 * house" about itself would be an app talking to itself, and a container that
 * happens to sit under a bigger one is answered by `placeWords`, which says
 * where it lives.
 */
export function servesWords(state: State, n: NodeState): string | null {
  if (rankOf(n.kind as NodeKind) !== Number.POSITIVE_INFINITY) return null;
  const h = servesNode(state, n);
  if (!h) return null;
  return `serves ${h.title || '(untitled)'}`;
}
