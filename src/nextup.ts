// Next-up — the surface that makes the app worth opening in the morning
// (build-plan items 18–19).
//
// One thing to do, chosen for you, with a short capped list behind it. The
// ranking is a fixed precedence, not a score to tune:
//
//   1. HARD LANDSCAPE — a real date has arrived. An appointment does not
//      negotiate with a plant that wants watering, so nothing computed is ever
//      allowed to outrank it.
//   2. RESUME CARDS — the thread you were already pulling. Picking up where you
//      were is cheaper than starting something new, and for this audience the
//      cost of a cold start is the whole problem. Phase 4 creates these; ranking
//      and retirement (spent/expired) are handled, but the cue and the pairing
//      are not built yet, so this is not a finished feature — only a place kept
//      honestly.
//   3. PRESSURE — the decay primitive, highest first (ADR-0010).
//
// **"Not this" cycles freely and records nothing.** No event, no penalty, no
// memory. If declining a suggestion wrote anything down, the surface would be
// keeping score, and a person who has to justify skipping something will avoid
// opening the app at all. Cycling is just an index moving.
//
// PURE, and `now` is an argument.

import { isAppClock, situationOf, type NodeState, type State } from './fold.ts';
import { ancestors, CONTAINER_KINDS } from './tree.ts';
import { pressureOf } from './pressure.ts';
import { replanIds } from './replan.ts';
import { NOT_ACTIONABLE } from './kinds.ts';
import { calendarDaysBetween, isValidIso, type DayShape } from './time.ts';
import { boundaryOf } from './day.ts';
import { dependencyView, dependencyWords } from './dependencies.ts';
import { isHeld, isGone } from './fold.ts';

/** Why an item is being offered. Carried so the surface can SAY it — the text
 *  channel of B-01, and the honest answer to "why am I being shown this?". */
export type NextUpReason = 'hard-date' | 'unblocked' | 'resume' | 'pressure' | 'ready' | 'beneath' | 'unsorted';

/**
 * THE CLOSED REASON VOCABULARY (V2 stage 7).
 *
 * Every offer states its warrant in one sentence, and the sentence comes from
 * HERE. Not because the words are precious, but because determinism is the
 * product: an offer with an unaccountable warrant cannot be refused on grounds,
 * and a reader who cannot predict what the app will say cannot tell a change
 * they caused from one they did not. That detectability is the mechanism by
 * which control is learned; a vocabulary that drifts destroys it quietly.
 *
 * TOTAL over `NextUpReason` — the compiler will not let a reason exist without
 * words — and it is the ONE writer, which is the property `place` already has
 * and the reason `place` has never disagreed with itself. Before this, seven
 * push sites each wrote their own literal and two of them had independently
 * written "ready again"; a third could have written "ready, again" and nothing
 * would have noticed.
 *
 * Three of the six take a fact from the item, and that is the point rather than
 * an exception: the shape is fixed forever and the contents change every time.
 * What is closed is the SET of sentences, not the words inside a title
 * somebody wrote.
 */
export const REASON_WORDS: Record<NextUpReason, (of: { antecedent?: string; cue?: string | null; horizon?: string; hot?: boolean }) => string> = {
  'hard-date': () => 'a real date, and it is here',
  // YOUR five words when there are five words. Nothing this app composes beats
  // what you wrote at the moment you put it down.
  resume: of => (of.cue ? `you were about to: ${of.cue}` : 'where you left off'),
  unblocked: of => `${of.antecedent || 'the thing before it'} is done`,
  // Names the horizon that asked, because an offer with no stated warrant is
  // the anxiety this app exists to answer: you cannot check what you are not
  // being shown, so the one thing shown has to say why it is here.
  beneath: of => `${of.horizon || 'something'} came round`,
  pressure: () => 'ready again',
  // "Back with you today" was a falsehood for any clock older than today — and
  // gate cure clocks never move, so that was the NORMAL case rather than an
  // edge one (Doctrine §5: no copy the data does not support).
  // AND WHY THIS ONE OF THEM (2.7.0, ADR-0097). The card has to say the warrant
  // it was actually chosen on, or the interest read is a hidden ranking — which
  // is the thing entry 5 forbids when it says to treat INCUP as vocabulary and
  // never as a rank. It states what the READER said, in their word, and claims
  // nothing about importance.
  ready: of => (of.hot ? 'this one is waiting, and you said it was hot' : 'this one is waiting'),
  // A FACT ABOUT THE WORLD, and the smallest true one there is: you wrote this
  // down and have not said anything else about it. Not "unclassified", not
  // "needs attention", not a count of how many others are like it — the schema
  // word never reaches a surface and the state is not a reproach.
  unsorted: () => 'you put this down',
};

/**
 * Hot, then unsaid, then cold — and unsaid sits in the MIDDLE deliberately.
 *
 * Putting "not said" last would make skipping the heat pass a penalty, and the
 * pass is optional by ADR-0029 ("optional-first", which took until 1.31.0 to
 * actually be true). Putting it first would make saying "cold" a penalty
 * instead. In the middle, answering the question can only move a thing away
 * from where not answering leaves it, in the direction the answer points.
 *
 * `cold` sorts last and is never excluded. A cold thing still comes back, still
 * counts in the gauge, and still fills the offer when it is all there is —
 * hiding it would be an archive with a friendlier name (law 3).
 */
const HEAT_ORDER: Record<'hot' | 'cold' | 'none', number> =
  { hot: 0, none: 1, cold: 2 };

export interface NextUpItem {
  node: NodeState;
  reason: NextUpReason;
  /** Decay pressure where the item carries the primitive; null otherwise. */
  pressure: number | null;
  /** Plain words for the reason, already resolved against the reader's zone. */
  words: string;
  /** WHERE it sits, in words — "in Errands · under Home" — or null for a loose
   *  item, which stays silent rather than announcing its loneliness. V2 stage 1
   *  ("It says where"): the offer had answered *why now* since item 18 and had
   *  never once answered *where from*, which is half of what ends a working
   *  day: a thing leaves, there is no telling where or whether it went, and no
   *  feeling of being shown the right things. Computed, never stored. */
  place: string | null;
  /** WHAT ELSE THE HOST HOLDS, for a `beneath` offer only — see `alsoHere`.
   *  Empty for every other reason, because entry 3's proposal is about the
   *  moment a place comes round and not about every card. */
  alsoHere?: string[];
  /** WHICH place those contents are in, so the line can name it. Found by
   *  looking at the rendered card: with a place line reading "in Kitchen ·
   *  under Home" directly above, an unnamed "also in there" leaves the reader
   *  to guess which of the two containers is meant. */
  alsoIn?: string;
  /**
   * WHAT IT HOLDS UP, and what that implies about when it must start — "it
   * feeds 'Roster' — start it within 3 days" — or null, which is the ordinary
   * case and stays silent. 1.23.0.
   *
   * The offer has answered *why now* since item 18 and *where from* since V2
   * stage 1. Neither answers the one a person with temporal myopia cannot work
   * out on demand: what happens downstream if this does not get done.
   * `docs/nd-collisions.md` entry 4 — the future carries no weight until it is
   * now, so a commitment three weeks out is weightless until it is an
   * emergency, with nothing in between. This is the gradient the decay
   * primitive gives everything else, applied to the thing a date is FOR.
   *
   * The words come from `dependencyWords`, which the detail sheet and the
   * replan card have used since item 27. ONE writer of this sentence, so three
   * surfaces cannot describe the same arithmetic three ways — and it returns
   * null whenever a term is missing rather than deriving a number from a guess
   * (ADR-0010). Computed, never stored.
   */
  approach: string | null;
  /**
   * THE SITUATION, VERBATIM — what the person said about when or where they
   * meant to do this, carried so the offer can show it back.
   *
   * This is the whole point of the field. An implementation intention works by
   * the cue being present at the moment of performance; a plan stored and never
   * shown again is a noun in a database. So it rides with the item to every
   * surface that offers it, in the words it was written in — never summarised,
   * never rephrased, never checked.
   */
  situation: string | null;
}

/**
 * "in Errands · under Home" — the item's parent, and the first live CONTAINER
 * above that parent, and nothing further. Two hops is a location; the full
 * ancestry is an org chart, and an org chart on a card built for one glance is
 * how the card stops being glanceable (law 8's bounded-surface instinct,
 * applied to a sentence).
 *
 * Walks `ancestors`, which is cycle-guarded and skips nothing on its own — the
 * dead-parent case (trashed/merged) is handled here because a location under a
 * place that was let go is not a location anyone can visit.
 */
export function lineageOf(state: State, n: NodeState): string | null {
  const parts: string[] = [];
  for (const a of ancestors(state, n.id)) {
    if (isGone(a)) break;
    if (parts.length === 0) {
      parts.push(`in ${a.title || '(untitled)'}`);
    } else if (CONTAINER_KINDS.has(a.kind)) {
      parts.push(`under ${a.title || '(untitled)'}`);
      break;
    }
    if (parts.length === 2) break;
  }
  return parts.length ? parts.join(' · ') : null;
}

/**
 * The approach sentence for one item, or null (1.23.0).
 *
 * A thin sibling of `lineageOf`: every projection that builds a `NextUpItem`
 * calls it once, so no push site can quietly ship an item whose approach was
 * computed a different way — the defect `place` avoided by having exactly one
 * writer.
 *
 * CHEAP WHEN THERE IS NOTHING TO SAY, which is the normal case: `dependencyView`
 * walks `n.feeds`, and that array is empty on every node until somebody declares
 * a dependency on the detail sheet. So the ordinary store pays one empty loop
 * per candidate, next to the ancestor walk `lineageOf` already does.
 */
export const approachOf = (state: State, n: NodeState, nowIso: string, zone: string): string | null =>
  dependencyWords(dependencyView(state, n, nowIso, zone));

// NOT_ACTIONABLE comes from `kinds.ts` — its one declared home, whose header
// says "One neutral home, imported by both" and whose docblock names THIS file
// as the consumer. For a year this file kept a byte-identical private copy and
// imported nothing from it (the seam audit's finding 14), which meant the first
// kind added there — `bother`, in the same release — would have changed replan
// and review while Next up silently kept offering it: the refused-on-one-
// surface, offered-on-another class kinds.ts was created to prevent.

/** Live and actionable. **A thing is a task the moment it exists** (2.0.0).
 *
 *  This used to end "...and not still sitting in the inbox", excluding any
 *  capture that had not been routed, on the ground that offering one here would
 *  be *asking the same question twice, in a surface whose whole promise is that
 *  it has already decided for you*.
 *
 *  That reason was written down, which makes it worth answering rather than
 *  deleting. It holds only if offering an unrouted item means asking the ROUTING
 *  question about it. It does not. Offering it means handing back the words
 *  somebody typed, with Done and Not this — the routing question is not asked at
 *  all. And this surface's promise is that it decided WHAT TO SHOW YOU, not that
 *  every item has been classified. Handing back "buy milk" in the order it
 *  arrived is this surface deciding.
 *
 *  What the exclusion actually did was make sorting the price of an item ever
 *  being offered. The guarantee the code enforced was *everything carries a
 *  clock*; the guarantee a reader reads is *it will come back to me as something
 *  I can act on*. For a capture those came apart: clocked in the same
 *  transaction, counted as covered by the proof, and never once offered as work
 *  — it came back only as more sorting. That is this repo's own "a clock nobody
 *  reads is silence with paperwork", one level up.
 *
 *  So: capture makes a task. Refinement — a date, an anchor, a parent, a route —
 *  makes the offer smarter, and never decides whether there is one. Skipping it
 *  costs precision, not existence. Without details this is a task list; with
 *  them it is the same list, better ordered. `docs/what-it-should-be.md`. */
function isCandidate(n: NodeState, nowIso: string, day: DayShape): boolean {
  if (isGone(n)) return false;
  if (NOT_ACTIONABLE.has(n.kind)) return false;
  // On the Menu is a surface, not a demand (law 1 clause c). Never volunteered.
  if (n.onMenu) return false;
  // (The exclusion of captured-but-unrouted items stood here. See the docblock.)
  // A spent or expired resume card is a thread already picked up, or one that
  // went cold. Either way it is not still waiting for you.
  if (n.resumeSpent) return false;
  // DONE AND NOT RECURRING = finished. The gate re-clocks a `done.marked` to
  // keep the node non-silent (law 1 does not exempt completed work), so without
  // this a finished one-off keeps its clock and is offered again for ever.
  //
  // "Recurring" is asked of the SAME predicate that computes pressure. Two
  // different guards (`!= null` here, `<= 0` there) disagreed about an interval
  // of 0: it counted as recurring, so the finished-check let it through, but its
  // pressure was null, so it rode a stale cure clock in the `ready` tier for
  // ever and marking it done did nothing. An item that can be neither completed
  // nor dismissed is the exact failure this app exists to prevent.
  const recurring = pressureOf(n, nowIso, day) !== null;
  if (n.lastDone != null && !recurring) return false;
  return true;
}

/**
 * Has ANY demanding clock come round? `park` is deliberately excluded: a parked
 * thing is being held away from you on purpose.
 *
 * This asks about every clock, not a favourite one. The first version read
 * `due ?? start ?? suspense ?? review` — a precedence by KIND, not by time —
 * while claiming to be "the soonest clock". So an item created today (gate-
 * clocked for review today) that was then given a due date next month showed
 * only its `due`, read as "not arrived", and **vanished from the work surface
 * entirely** while the coverage gauge still read 0 silent. Work disappearing is
 * the worst thing this app can do, so the question is now asked of all of them.
 */
/** Held away on purpose, with the day not yet here. A park is the one clock that
 *  means "do not show me this yet", so it is the one clock that can outvote a
 *  cue (1.30.0). */
const parkedAway = (n: NodeState, nowIso: string, day: DayShape): boolean => {
  const park = n.clocks.park;
  return !!park && isValidIso(park.at) && calendarDaysBetween(nowIso, park.at, day) > 0;
};

const arrivedClock = (n: NodeState, nowIso: string, day: DayShape): boolean =>
  Object.values(n.clocks).some(c =>
    c != null && c.kind !== 'park' && isValidIso(c.at) &&
    // A GATE CURE IS NOT A DEMAND. The comment two tiers below already knew cure
    // clocks "never move"; what it did not say is that treating one as arrived
    // means every dateless thing reads as waiting for you today. A real import
    // of 1,429 items had this surface reporting 1,012 ready — a number that was
    // arithmetically correct and meant nothing. A cure exists so a node is not
    // silent; the reader never asked for anything by today.
    !isAppClock(c) &&
    calendarDaysBetween(nowIso, c.at, day) <= 0);

/**
 * The nearest ancestor whose own demanding clock has come round, or null.
 *
 * Cycle-guarded like every ancestor walk here — the gate keeps the parent graph
 * acyclic and a shard can still deliver two halves of a loop neither device
 * wrote whole (ADR-0035/0038).
 *
 * NEAREST, not any: a leaf under a project under an area names the thing that
 * actually asked for it. `arrivedClock` is reused rather than reimplemented, so
 * a gate cure still cannot make a horizon "arrive" and `park` is still excluded.
 */
/**
 * WHAT ELSE IS IN THERE — the thesis's open half, and the last one it had.
 *
 * `docs/nd-collisions.md` entry 3 is this app's thesis and the best-evidenced
 * entry in the catalogue: cue-dependent prospective memory failure. A thing that
 * leaves the visual field leaves existence; **visible is the only kind of
 * remembered; filed means gone.** Its routing proposal has read *V2-candidate,
 * and it is already named as owed* since it was written: when a place's review
 * comes round, its return card carries a bounded view of contents.
 *
 * The push-down half was built and stops one step short. When a horizon comes
 * round, the `beneath` tier offers ONE actionable thing from inside it and names
 * the host — so the reader learns that something is in Kitchen and never learns
 * what else is. For this entry that is the failure exactly: the place returned,
 * and its contents stayed filed.
 *
 * A COUNT IS NOT CONTENTS. `placeWords` already says "7 under it", and that is
 * the sentence entry 3 is about — it reports that seven things exist without
 * making one of them visible. Naming three of them is the whole difference.
 *
 * BOUNDED THREE WAYS, because the `beneath` tier's own restraint is that an area
 * with two hundred descendants must not put two hundred things on screen — that
 * is the pile arriving on a schedule, which is what law 8 exists to prevent.
 *   - The output is capped (`ALSO_HERE_CAP`), matching `REVIEW_CAP`'s precedent
 *     of exceptions capped at three.
 *   - The WALK is capped too, not just the output: it stops as soon as it has
 *     enough. A cap that trims a list after building it still walks the pile.
 *   - Names only. No dates, no acts, no reasons — this is recognition, not work.
 *     Law 6's demand-free reading and law 8's: a thing shown so it is not
 *     forgotten must not thereby become something asking.
 *
 * Breadth-first, so the place's own immediate contents come before anything
 * nested deeper — those are what "what is in here" means to a reader.
 *
 * PURE, like everything here, and stable: creation order is the app's default
 * tie-break everywhere else, and a list that reshuffles between renders is a
 * different list each time you look at it.
 */
export const ALSO_HERE_CAP = 3;

function alsoHere(state: State, host: NodeState, offered: NodeState, cap: number): string[] {
  // NOT THE ONES THE CARD ALREADY NAMES. The place line above reads "in Kitchen
  // · under Home", so listing Kitchen as what else is in there is the card
  // saying one fact twice in two vocabularies — the defect the `serves` line
  // beside it already guards against. The offered thing's ancestors are exactly
  // the ones the place line walked, so they are skipped along with the offered
  // thing itself.
  const named = new Set<string>([offered.id]);
  for (const a of ancestors(state, offered.id)) named.add(a.id);
  const kids = new Map<string, NodeState[]>();
  for (const n of state.nodes.values()) {
    if (!n.parent || !isHeld(n)) continue;
    if (!kids.has(n.parent)) kids.set(n.parent, []);
    kids.get(n.parent)!.push(n);
  }
  const out: string[] = [];
  const seen = new Set<string>([host.id]);
  let layer = [host];
  while (layer.length > 0 && out.length < cap) {
    const next: NodeState[] = [];
    for (const parent of layer) {
      for (const child of kids.get(parent.id) ?? []) {
        if (seen.has(child.id)) continue;
        seen.add(child.id);
        next.push(child);
        if (named.has(child.id)) continue;
        out.push(child.title.trim() || '(untitled)');
        if (out.length >= cap) return out;
      }
    }
    layer = next;
  }
  return out;
}

function arrivedAncestor(
  state: State, n: NodeState, nowIso: string, day: DayShape,
): NodeState | null {
  const seen = new Set<string>([n.id]);
  let cur = n.parent ? state.nodes.get(n.parent) : undefined;
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    if (isHeld(cur) && arrivedClock(cur, nowIso, day)) return cur;
    cur = cur.parent ? state.nodes.get(cur.parent) : undefined;
  }
  return null;
}

/**
 * Is any ancestor a project someone else is executing?
 *
 * Bounded by a seen set, like every other ancestor walk in this codebase: the
 * gate keeps the parent graph acyclic, and a shard can still deliver two halves
 * of a loop neither device wrote whole (ADR-0035/0038).
 */
function underTrackedProject(state: State, n: NodeState): boolean {
  const seen = new Set<string>([n.id]);
  let cur = n.parent;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const p = state.nodes.get(cur);
    if (!isHeld(p)) return false;
    if (p.role === 'track') return true;
    cur = p.parent;
  }
  return false;
}

/** A hard date is `due` or `suspense` — the immovable kinds. A `review` clock is
 *  the app's own "bring this back", which is soft by construction. */
const hasHardDate = (n: NodeState): boolean => Boolean(n.clocks.due ?? n.clocks.suspense);

/**
 * Everything that could legitimately be offered right now, best first.
 *
 * Sorted by the precedence above, then within a tier by how long it has been
 * asking — and finally by id, so the order is TOTAL and the same state always
 * produces the same list. A surface that reshuffles between renders is a surface
 * that cannot be trusted to have chosen.
 */
export function nextUpQueue(state: State, nowIso: string, zone: string): NextUpItem[] {
  // Whose day decides what has ARRIVED — the same question the replan surface
  // asks, and the work surface must not answer it differently.
  const day: DayShape = { zone, boundary: boundaryOf(state) };
  const items: NextUpItem[] = [];

  for (const n of state.nodes.values()) {
    if (!isCandidate(n, nowIso, day)) continue;
    // Work under a TRACKED project is not yours to do. The vocabulary has said
    // so since the first draft — "a `track` project emits no next actions, only
    // Waiting-Fors and Upkeep check-ins" — and nothing enforced it, because
    // nothing folded the role. Offering a next action on something you are only
    // carrying is the app telling you to do somebody else's job, which is the
    // fastest way to stop trusting a surface whose whole promise is that it has
    // already decided.
    //
    // A waiting-for and an upkeep still come through: chasing IS the work when
    // you are the one carrying it.
    if (n.kind !== 'waiting-for' && n.kind !== 'upkeep' && underTrackedProject(state, n)) continue;

    const p = pressureOf(n, nowIso, day);
    const arrived = arrivedClock(n, nowIso, day);

    // A hard date outranks everything, INCLUDING a resume card — the tier test
    // comes first for every kind. A resume card carrying an arrived due date was
    // previously misfiled as tier 2 purely because its branch ran first.
    if (arrived && hasHardDate(n)) {
      items.push({ node: n, reason: 'hard-date', pressure: p, words: REASON_WORDS['hard-date']({}), place: lineageOf(state, n), approach: approachOf(state, n, nowIso, zone), situation: situationOf(n) });
      continue;
    }
    // THE THING YOU JUST MADE POSSIBLE (1.30.0). An item anchored to another
    // item's completion, whose antecedent is now finished.
    //
    // It is tested BEFORE the arrival branches on purpose. The gate cured this
    // node with a same-day clock the moment its antecedent was completed, so it
    // would otherwise arrive here as an ordinary `ready` — indistinguishable
    // from four hundred other cured items and sorted by creation order, which is
    // the back of the list. The one moment the chain is cheap would be spent.
    //
    // It says the ANTECEDENT'S NAME rather than "you can start this now",
    // because the person is being handed the next step of something they were
    // just doing and the useful fact is which thing this follows.
    //
    // A FUTURE PARK STILL WINS. "Not until the 12th" is a decision the person
    // made about this very item, and an antecedent finishing early does not
    // overturn it — pulling a parked thing forward is the app not believing you,
    // which is the same rule the returned-park tier follows.
    if (n.after && !parkedAway(n, nowIso, day)) {
      const a = state.nodes.get(n.after);
      if (a && a.lastDone && isHeld(a)) {
        items.push({
          node: n, reason: 'unblocked', pressure: p,
          words: REASON_WORDS.unblocked({ antecedent: a.title }),
          place: lineageOf(state, n),
          approach: approachOf(state, n, nowIso, zone),
          situation: situationOf(n),
        });
        continue;
      }
    }
    if (n.kind === 'resume-card') {
      // A resume card still has to be DUE. Without this a card parked until
      // Christmas led the list in July, above everything — and one with no clock
      // at all was offered for ever. `demandClock`'s own comment said a parked
      // thing is held away from you on purpose; the resume branch used to skip
      // that check entirely.
      //
      // And it must point at something. A card is written the instant an
      // interruption is recorded, so the session that made it may STILL BE
      // RUNNING — that thread is not lost yet, and offering it back while you
      // are sitting in it is the app interrupting you about being interrupted.
      // A card whose target is gone is dropped for the same reason: a way back
      // into work you have already let go is not a way back.
      if (!arrived) continue;
      if (!n.resumeFor || n.resumeFor === state.focus?.node) continue;
      const target = state.nodes.get(n.resumeFor);
      if (!isHeld(target) || target.lastDone) continue;
      items.push({
        node: n, reason: 'resume', pressure: p,
        words: REASON_WORDS.resume({ cue: n.resumeCue }),
        place: lineageOf(state, n),
        approach: approachOf(state, n, nowIso, zone),
        situation: situationOf(n),
      });
      continue;
    }
    if (p !== null && p >= 0) {
      items.push({ node: n, reason: 'pressure', pressure: p, words: REASON_WORDS.pressure({}), place: lineageOf(state, n), approach: approachOf(state, n, nowIso, zone), situation: situationOf(n) });
      continue;
    }
    // A THING YOU PUT DOWN AND HAVE NOT TOUCHED SINCE (2.0.0).
    //
    // ABOVE the `ready` branch on purpose, and the smoke walk is what proved it
    // has to be. Placed below, an unrouted capture never reached this tier at
    // all: it came out as `ready`, saying "this one is waiting". That is because
    // its gate cure clock is read as an ARRIVED DEMAND — `arrivedClock` excludes
    // app clocks, and `gate:capture.recorded` is deliberately NOT one: writing
    // something down is somebody doing something, so the cure inherits that
    // intent (2.0.1 classified all twenty-eight cured kinds; this one stayed a
    // demand on purpose). Testing the STATE — captured, unrouted — rather than
    // inferring it from the clock is what keeps this tier independent of that
    // classification instead of hostage to it.
    //
    // The label was the visible half; the ranking was the half that mattered. As
    // `ready` these sort level with genuinely clocked work rather than behind
    // it, so a day's captures would displace things somebody had actually asked
    // for. Testing the state directly instead of inferring it from a clock makes
    // this independent of that gap rather than hostage to it.
    //
    // Removing the inbox exclusion in `isCandidate` is still not enough on its
    // own — with no clock at all a capture has no pressure and never arrives, so
    // it would fall past every tier and out of the bottom of this loop, covered
    // and counted and never offered. The exclusion was load-bearing twice.
    //
    // LAST AMONG THE ORDINARY TIERS. Anything with a real warrant — a date, an
    // unblocked antecedent, a thread to resume, rising pressure — is offered
    // first, and those branches all run above this one. Within the tier it is
    // arrival order: deterministic, no inference, one sentence to explain.
    //
    // A DUMP CANNOT FLOOD THIS. The queue caps at five (ADR-0030), real demands
    // outrank these, and the offer is one thing at a time — so forty captured
    // lines cost at most a few "Not this", never a wall. That was the objection
    // to offering them at all, and the cap is what answers it.
    if (n.captured && n.route === null) {
      items.push({
        node: n, reason: 'unsorted', pressure: p, words: REASON_WORDS.unsorted({}),
        place: lineageOf(state, n), approach: approachOf(state, n, nowIso, zone),
        situation: situationOf(n),
      });
      continue;
    }
    if (arrived) {
      // "Back with you today" was a falsehood for any clock older than today —
      // and gate cure clocks never move, so that was the NORMAL case, not an
      // edge one (Doctrine §5: no copy the data does not support).
      items.push({ node: n, reason: 'ready', pressure: p, words: REASON_WORDS.ready({ hot: n.heat === 'hot' }), place: lineageOf(state, n), approach: approachOf(state, n, nowIso, zone), situation: situationOf(n) });
      continue;
    }
    // A THING YOU PUT DOWN AND HAVE NOT TOUCHED SINCE (2.0.0).
    //
    // Removing the inbox exclusion above is NOT enough on its own, and checking
    // that before writing this saved shipping a change that did nothing: an
    // unrouted capture's only clock is the gate's same-day cure, `arrivedClock`
    // deliberately refuses to read a cure as a demand (a cure exists so a node
    // is not silent; the reader never asked for anything by today), and it has
    // no pressure because it has never been done. So it would fall straight
    // past every tier above and out of the bottom of this loop — covered,
    // counted, and still never offered. The exclusion was load-bearing twice.
    //
    // LAST AMONG THE ORDINARY TIERS, and that is the whole restraint. Anything
    // with a real warrant — a date, an unblocked antecedent, a thread to resume,
    // rising pressure, an arrived clock — is offered first. These sort behind
    // all of it, in the order they arrived, which is deterministic, needs no
    // inference, and is explainable in one sentence.
    //
    // A DUMP CANNOT FLOOD THIS. The queue caps at five (ADR-0030), real demands
    // outrank these, and the offer is one thing at a time — so forty captured
    // lines cost at most a few "Not this", never a wall. That was the objection
    // to offering them at all, and the cap is what answers it.
    // Not yet asking for anything. Correct outcome: it stays quiet.
  }

  // A HORIZON THAT HAS COME ROUND PUSHES DOWN — law 4's other half.
  //
  // Product law 4 is "levels push down; the user never climbs — the runway is
  // the only workspace", and half of it was built: an area or a goal is in
  // NOT_ACTIONABLE, so it is never offered and never carries a Done button.
  // The push-down half was not. Verified by running the fold: an area whose
  // review has passed, holding a project, holding an action, produces the area
  // in the held list's "Ready now" saying "Holding Kitchen", the action in
  // "Later" reading "held" — and this queue EMPTY. The app answered "what now"
  // with silence while its own list said something was ready.
  //
  // The item is not silent — its ancestor really does surface and really does
  // name what it holds — so this is not law 1 failing. It is a return that
  // stops one level short of anything a person can act on.
  //
  // BOUNDED BY BEING A FALLBACK, and that is the whole of the restraint. An
  // area with two hundred descendants coming round must not put two hundred
  // things in this queue; that is the pile, arriving on a schedule, which is
  // what law 8 exists to prevent. So this tier is computed ONLY when nothing
  // else is asking — the honest reading of an empty offer beside a ready
  // horizon. When anything else is asking, the horizon waits its turn.
  if (items.length === 0) {
    for (const n of state.nodes.values()) {
      if (!isCandidate(n, nowIso, day)) continue;
      if (n.kind !== 'waiting-for' && n.kind !== 'upkeep' && underTrackedProject(state, n)) continue;
      const host = arrivedAncestor(state, n, nowIso, day);
      if (!host) continue;
      items.push({
        node: n, reason: 'beneath', pressure: pressureOf(n, nowIso, day),
        words: REASON_WORDS.beneath({ horizon: host.title }),
        place: lineageOf(state, n),
        alsoHere: alsoHere(state, host, n, ALSO_HERE_CAP),
        alsoIn: host.title.trim() || '(untitled)',
        approach: approachOf(state, n, nowIso, zone),
        situation: situationOf(n),
      });
    }
  }

  // `unblocked` sits second, above `resume`, and the placement is the argument
  // rather than a preference. Within a routine, completing each step IS the cue
  // for the next; the person has just finished the antecedent and is standing in
  // front of the very next thing, which is the cheapest moment this app will
  // ever get. A real date that is HERE still outranks it — that is a promise to
  // somebody, and the chain will still be there in an hour.
  // `unsorted` sits behind every real warrant and ahead of `beneath` only
  // because `beneath` is a fallback computed when nothing else asked at all.
  const RANK: Record<NextUpReason, number> =
    { 'hard-date': 0, unblocked: 1, resume: 2, pressure: 3, ready: 4, unsorted: 5, beneath: 6 };
  return items.sort((a, b) => {
    const r = RANK[a.reason] - RANK[b.reason];
    if (r !== 0) return r;
    // Within pressure, the most insistent first; elsewhere, oldest first by id.
    if (a.reason === 'pressure' && b.reason === 'pressure') {
      const d = (b.pressure ?? 0) - (a.pressure ?? 0);
      if (d !== 0) return d;
    }
    // WITHIN `ready`, THE INTEREST YOU ALREADY GAVE IT (2.7.0, ADR-0097).
    //
    // `ready` is the tier with no rising pressure and nothing choosing between
    // its members, so its tie-break was creation order — for ever. Forty
    // rhythm-less items therefore gave the same card today, in a month and in a
    // year, which is the frozen offer NOTES Q-11 was reported about.
    //
    // THE RESEARCH PICKED THIS MECHANISM, not a preference and not a guess.
    // `docs/nd-collisions.md` entry 5 (interest-based motivation): activation
    // follows interest, novelty, challenge, urgency and passion rather than
    // importance — so an importance rank is the wrong instrument, and the entry
    // says in terms that the heat pass is already a two-tap interest read while
    // "nothing about interest reaches `nextUp` — everything ranks on when". Its
    // own routing proposal is this: heat informing which candidate fills the
    // `ready` slot. It was gated on Q-11, and Q-11's ranking reading is now
    // established by measurement rather than by asking.
    //
    // VOCABULARY, NEVER A RANK — the entry's own binding, because INCUP is
    // community-grade evidence. So this is a two-state fact the reader stated,
    // used to break a tie inside one tier, and the card SAYS it. It is not a
    // score, nothing accumulates, and `heat.set` was already in the log being
    // read by nothing but the flow that collects it.
    //
    // CONFINED TO `ready`, and the confinement is the point. A real date still
    // outranks everything (entry 13 — the true urgency signal must stay
    // legible), a chain still comes second, and pressure still sorts by
    // pressure. Nothing here reorders a tier or fabricates a reason.
    if (a.reason === 'ready' && b.reason === 'ready') {
      const h = HEAT_ORDER[a.node.heat ?? 'none'] - HEAT_ORDER[b.node.heat ?? 'none'];
      if (h !== 0) return h;
    }
    return a.node.id < b.node.id ? -1 : a.node.id > b.node.id ? 1 : 0;
  });
}

/** Build-plan item 19: a capped list behind the one suggestion. Five, because a
 *  longer list is the pile the app exists to stand between you and. */
export const BEHIND_CAP = 5;

export interface NextUp {
  /** The one thing offered, or null when nothing is asking. */
  head: NextUpItem | null;
  /** Up to five more, so choosing is possible without facing everything. */
  behind: NextUpItem[];
  /** How many are asking in total — stated plainly, never as a badge. */
  total: number;
}

/**
 * The surface's view. `cycle` is how many times "not this" has been tapped; it
 * rotates the head through the queue and is held in memory only — no event, no
 * persistence, nothing to come back and reproach anyone with.
 */
export function nextUp(state: State, nowIso: string, zone: string, cycle = 0): NextUp {
  const queue = nextUpQueue(state, nowIso, zone);
  if (queue.length === 0) return { head: null, behind: [], total: 0 };
  const start = ((cycle % queue.length) + queue.length) % queue.length;
  const rotated = [...queue.slice(start), ...queue.slice(0, start)];
  return {
    head: rotated[0] ?? null,
    behind: rotated.slice(1, 1 + BEHIND_CAP),
    total: queue.length,
  };
}

/**
 * Build-plan item 20: Upkeep chips — the recurring things that have come round,
 * most insistent first. Separate from Next-up because an Upkeep is a different
 * promise: small, repeating, and never a failure to have not done yet.
 *
 * Separate PROJECTION, but the same eligibility. The first version filtered only
 * on kind and trashed, so it volunteered an upkeep sitting on the Menu — which
 * Next-up correctly refuses, because the Menu is a surface and not a demand
 * (law 1 clause c) — and an unclarified inbox upkeep that still belonged to
 * triage. A surface that is exempt from the exclusions is not a second view of
 * the data; it is a hole in them.
 */
export function upkeepChips(state: State, nowIso: string, zone: string, minPressure = 0): NextUpItem[] {
  const day: DayShape = { zone, boundary: boundaryOf(state) };
  return [...state.nodes.values()]
    .filter(n => n.kind === 'upkeep' && isCandidate(n, nowIso, day))
    .map(n => ({ node: n, pressure: pressureOf(n, nowIso, day) }))
    .filter((x): x is { node: NodeState; pressure: number } =>
      x.pressure !== null && Number.isFinite(x.pressure) && x.pressure >= minPressure)
    .sort((a, b) => b.pressure - a.pressure || (a.node.id < b.node.id ? -1 : 1))
    .map(x => ({ node: x.node, reason: 'pressure' as const, pressure: x.pressure, words: REASON_WORDS.pressure({}), place: lineageOf(state, x.node), approach: approachOf(state, x.node, nowIso, zone), situation: situationOf(x.node) }));
}

/**
 * What the work surface should actually render: Next-up with the chip items and
 * the replan items REMOVED from it.
 *
 * A ready upkeep qualifies for both projections, and the first version rendered
 * both sections from the same state with no dedup — so the same title appeared
 * twice on one screen, with the same words and two separate Done buttons writing
 * to the same node. For a COGA-informed surface whose entire promise is "one
 * thing", showing the one thing twice is a defect, not a redundancy.
 *
 * REPLAN ITEMS ARE REMOVED FOR A DIFFERENT REASON, and it is the sharper one.
 * An item whose hard date went by qualifies here as `hard-date` — "a real date,
 * and it is here" — while the replan surface above is asking "should this still
 * happen, and by when?". Those are not two views of one item; they are two
 * different questions, and answering the easy one ("do it now") is exactly the
 * move that produced the passed date. Law 3 says the passed date becomes a
 * decision, so the decision is the only thing offered.
 *
 * The exclusion is UNCAPPED while the replan surface shows at most three. The
 * remainder are not lost: `heldGroups` is the complete inventory and still
 * carries them, and the replan surface states the true total, so the cap is
 * bounded re-entry (law 8) rather than a hiding place.
 */
export function workSurface(state: State, nowIso: string, zone: string, cycle = 0): {
  up: NextUp; chips: NextUpItem[];
} {
  const replanning = replanIds(state, nowIso, zone);
  const chips = upkeepChips(state, nowIso, zone).filter(c => !replanning.has(c.node.id));
  const chipIds = new Set(chips.map(c => c.node.id));
  const queue = nextUpQueue(state, nowIso, zone)
    .filter(i => !chipIds.has(i.node.id) && !replanning.has(i.node.id));
  if (queue.length === 0) return { up: { head: null, behind: [], total: 0 }, chips };
  const start = ((cycle % queue.length) + queue.length) % queue.length;
  const rotated = [...queue.slice(start), ...queue.slice(0, start)];
  return {
    up: { head: rotated[0] ?? null, behind: rotated.slice(1, 1 + BEHIND_CAP), total: queue.length },
    chips,
  };
}
