// A few things you could pick up (1.11.0, ADR-0060) — the menu shape.
//
// ## Why a small SET, when the whole surface exists because of choice overload
//
// Next up has always offered exactly one thing, and the reason is recorded:
// choice overload, thesis §4. That finding is real and it stays. But read the
// thesis's own wording, which is careful for a reason:
//
//   "The effect is context-dependent and its size has been contested — but the
//    DIRECTION holds where options are SIMILAR and stakes are AMBIGUOUS."
//
// So the finding does not condemn a small set of options that are *deliberately
// unalike*. It condemns twenty rows of comparable pending work. The difference
// is not how many things are shown; it is whether choosing requires a
// comparison. Two things that differ in kind — "this has a real date today" and
// "this has been quiet for a month" — are picked between by preference, not by
// weighing. Twenty next-actions are picked between by weighing, which is the
// thing nobody stuck at activation can do.
//
// And law 8 pushes the same way: the bounded surface is "never the backlog".
// A headline counting what is asking is the closest this app comes to one.
//
// ## How the set is made unalike, by construction rather than by taste
//
// `NextUpReason` already partitions the queue by WHY something is being
// offered — a real date, a thread you were pulling, a rhythm come round, a
// thing simply waiting. Those are four genuinely different sentences. So the
// rule is: **at most one offer per reason.** Nothing is scored, nothing is
// balanced; the classes do the work.
//
// The precedence itself is untouched. `work[0]` is still the head of
// `nextUpQueue`, so a real date arriving today still leads, and the app still
// answers "if you only do one thing" the way it always has.
//
// ## The wish, and the line it must not cross
//
// One Menu item rides along, and this is the part that could go wrong. The
// Menu is demand-free BY LAW (law 6): "acting on one is a deliberate
// promotion, never an obligation that accrued." Offering a wish beside work
// must not quietly make it work.
//
// It does not, and the guard is structural rather than a matter of copy: a
// wish is returned as a bare node with no reason, no pressure and no clock —
// there is nothing here for a surface to render as a demand, and it carries no
// `Done`, because the way to act on a wish is to promote it first. It is
// offered as *something you wanted*, which is exactly the home §9 says the
// Menu exists to give interest.
//
// PURE, and `now` is an argument.

import { weightOf, type NodeState, type State } from './fold.ts';
import { heldNodes } from './gate.ts';
import { nextUpQueue, upkeepChips, type NextUpItem } from './nextup.ts';
import { replanIds } from './replan.ts';
import { loadNow, offerCapFor, weightOrderFor, type Load } from './load.ts';
import { plainIsOn, PLAIN_OFFER_CAP } from './plain.ts';

/**
 * How many pieces of WORK may be offered at once.
 *
 * Two, not five. The set exists so choosing is a preference rather than a
 * comparison, and a preference survives two options in a way it does not
 * survive five. Its own cap with its own justification, per the caps
 * convention.
 */
export const OFFER_CAP = 2;

export interface Offer {
  /** Up to `OFFER_CAP` items, each for a DIFFERENT reason. Best first. */
  work: NextUpItem[];
  /**
   * One thing you said you wanted, or null when the Menu is empty. A bare
   * node: no reason, no pressure, nothing a surface could read as a demand.
   */
  wish: NodeState | null;
  /**
   * What is on you right now (1.15.0, ADR-0065). Returned rather than left for
   * the surface to recompute, so the offer and the sentence beside it can never
   * disagree about whether this is a heavy stretch — the render-contradicts-
   * record shape ADR-0057 was written to kill.
   */
  load: Load;
}

/** Wishes, in a total order so the same state always offers the same one. */
const wishes = (state: State): NodeState[] =>
  heldNodes(state)
    .filter(n => n.onMenu !== null && !n.lastDone)
    .sort((a, b) => (a.id < b.id ? -1 : 1));

/**
 * What is on offer right now.
 *
 * `cycle` rotates BOTH halves — it is the existing "Not this" index, which
 * records nothing and never will. Cycling past a thing is not a decision about
 * it, so there is nothing to write down (thesis §9).
 */
export function offerNow(state: State, nowIso: string, zone: string, cycle = 0): Offer {
  // The same exclusions the single-card surface has always applied: an upkeep
  // chip has its own place, and anything replanning is being asked a different
  // question already.
  const replanning = replanIds(state, nowIso, zone);
  const chipIds = new Set(upkeepChips(state, nowIso, zone).map(c => c.node.id));
  const queue = nextUpQueue(state, nowIso, zone)
    .filter(i => !chipIds.has(i.node.id) && !replanning.has(i.node.id));

  // ADR-0014's consequence, finally consumed: unresolved weight "depresses
  // capacity … the mechanism by which it shows up in what the app asks of you".
  // The offer is exactly that surface, so the cap bends here and nowhere else —
  // never the gauge, never the held list, never Composed Today, and never below
  // one (src/load.ts).
  const load = loadNow(state);
  // JUST ONE THING (1.36.0), decided HERE rather than in the surface. The first
  // version capped it in `work.ts`, which left the projection and the screen
  // disagreeing about how many things were being offered — and every other
  // reader of `offerNow` still seeing two. The offer's shape is this function's
  // answer to give.
  //
  // NOT the same rule as `offerCapFor`, and the difference is who decided.
  // Capacity is a fact somebody states about their day, and the app must never
  // shorten the offer because of it (1.34.0). This is the person operating their
  // own screen and asking for one thing.
  const cap = plainIsOn(state) ? PLAIN_OFFER_CAP : offerCapFor(load, OFFER_CAP);

  // WHICH, NOT HOW MANY (1.34.0). Capacity consults the person's own weight
  // declaration to decide which of several equally-eligible things is put in
  // front of you — never how many arrive.
  //
  // ORDERED BEFORE THE ROTATION, not after. Sorting the ROTATED list was the
  // first version and it silently broke "Not this": the sort put the lightest
  // thing first whatever the cycle index was, so cycling could never reach the
  // heavy one and an item became unreachable rather than merely later. Weight
  // decides the order; the cycle walks that order.
  //
  // A STABLE sort within each weight, so it can only break ties the existing
  // precedence left open — a real date that has arrived still leads on a low
  // day, because a promise to somebody else is not the app's to quietly
  // withhold. Nothing is filtered out at any point.
  const order = weightOrderFor(load);
  const rank = (i: NextUpItem): number => {
    const w = weightOf(i.node) ?? 'ordinary';
    const at = order.indexOf(w);
    return at < 0 ? order.indexOf('ordinary') : at;
  };
  const weighted = queue
    .map((item, i) => ({ item, i }))
    .sort((a, b) => rank(a.item) - rank(b.item) || a.i - b.i)
    .map(x => x.item);

  const work: NextUpItem[] = [];
  if (weighted.length > 0) {
    const start = ((cycle % weighted.length) + weighted.length) % weighted.length;
    const rotated = [...weighted.slice(start), ...weighted.slice(0, start)];
    const taken = new Set<string>();
    for (const item of rotated) {
      if (work.length >= cap) break;
      // ONE PER REASON. This is the whole mechanism: the set cannot become two
      // near-identical next-actions, because the second would share a class
      // with the first and be skipped.
      if (taken.has(item.reason)) continue;
      taken.add(item.reason);
      work.push(item);
    }
  }

  const all = wishes(state);
  const wish = all.length === 0
    ? null
    : all[((cycle % all.length) + all.length) % all.length] ?? null;

  return { work, wish, load };
}

/**
 * The offer's own line. **No number, ever.**
 *
 * "8 things are asking" is a count of pending work on the landing surface,
 * which is the nearest thing this app has to a backlog headline — the one
 * shape law 8 names outright. The honest total already has a home: the
 * coverage gauge states what is held, what is ready and that nothing is
 * silent, a few lines up the same page. Saying it twice, once as a demand,
 * buys nothing.
 *
 * IT TAKES THE ROWS IT INTRODUCES, NOT THE OFFER (3.9.1). This read
 * `offer.work.length` while the list under it was rendered from
 * `workSurface`'s `up.behind` — two different computations of "what is on
 * this card", agreeing by luck. They stopped agreeing in the ordinary case:
 * one piece of work and one wish gave "A few things you could pick up" over a
 * list of ONE, and a single piece of work with nothing behind it gave
 * "Something you could pick up" over a list of NONE. A sentence that
 * introduces a list has to be counted from that list.
 *
 * AND IT ENDS IN NOTHING. The colon belongs to the CARD, where the line leads
 * into rows, and is added there in CSS. This element's text is also read by
 * the hub as the door's summary, where nothing follows it — 3.8.0 put the
 * colon in the string and the hub door has read "Something you could pick up:"
 * ever since, a colon introducing nothing. Punctuation belongs to the use, not
 * to the fact.
 */
export function offerWords(shown: number, anyWork: boolean): string {
  if (shown === 0) return '';
  if (!anyWork) return 'Nothing is asking. Something you wanted';
  // "One more" was the first singular and `test/offer.test.ts` refused it: the
  // line may carry no word that implies a pile, and `more` is on that list. It
  // is a fair refusal — "one more" counts down towards an end, and there is no
  // end here.
  return shown === 1 ? 'Something else you could pick up' : 'A few things you could pick up';
}
