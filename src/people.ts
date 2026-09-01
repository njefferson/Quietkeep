// The person lens (v1 Must).
//
// `person.created`, `person.linked`, `waiting.opened` and `waiting.closed` have
// been in the vocabulary from the start. Only `person.created` was ever folded,
// and nothing could emit even that — so clarify's "Waiting for" route changed a
// node's kind to say *someone else owes you this* and never asked who.
//
// That is the gap this closes, and the reason it matters is not filing. It is
// that "what am I waiting on Sam for" is a question you get asked out loud, in a
// corridor, with no time to look anything up. Work sorted by project cannot
// answer it. This is the same set of nodes, sliced the way the question arrives.
//
// PURE. `now` and `zone` are arguments.

import type { NodeState, State } from './fold.ts';
import type { NodeId } from './events.ts';
import { heldNodes } from './gate.ts';
import { calendarDaysBetween, isValidIso, type DayShape } from './time.ts';
import { boundaryOf } from './day.ts';
import { contextsOf } from './contexts.ts';
import { isHeld } from './fold.ts';

/** The vocabulary's closed relation set. */
// `promised-to` (2.20.0) is the OTHER DIRECTION, and it is a relation rather
// than a kind on purpose: a promise is your own work with a person attached, so
// it stays an ordinary node and is kept by doing it. A kind would have to join
// `NOT_ACTIONABLE`, `DEMAND_FREE_KINDS`, `CONTAINER_KINDS`, `CALENDAR_KINDS`,
// the plain lists and the altitude order — and phase 2 measured three of the
// four sites that write a node's kind as wrong.
//
// It is NOT `requested-by` with better words. That one records who ASKED, which
// is where a thing came from; this one records that you UNDERTOOK it, which is
// a thing somebody is now expecting. The first is provenance and the second is
// a standing claim about you, which is why only the second can be released.
//
// `rest-with-them` and `rest-with-me` (3.20.0, ADR-0122) are the DIRECTORY —
// Q-15's answer, and the only shape entry 32's evidence lets survive: a pointer
// saying a named person holds the rest of something, carrying no text, no
// version, and nothing to compare. It is a PAIR because a noun that only ever
// said *they hold more of this than you* would encode a deficit into the
// vocabulary inside an attribution environment that is already asymmetric —
// law 7 satisfied by the shape, not by the copy. Neither direction ever ages:
// `involves` hard-codes `days: null`, there is no aggregate for these anywhere,
// and what was actually agreed goes where it always goes — "What was decided",
// unattributed — because a second account of someone else's version is the one
// thing entry 32 refuses permanently.
export const RELATIONS = [
  'opr', 'stakeholder', 'waiting-on', 'requested-by', 'mentioned', 'promised-to',
  'rest-with-them', 'rest-with-me',
] as const;
export type Relation = typeof RELATIONS[number];

export interface PersonLine {
  node: NodeState;
  relation: Relation | string;
  /** For a waiting-for: how long it has been open, in calendar days. Null when
   *  nobody recorded a start, which is ordinary. */
  days: number | null;
}

/**
 * One thing YOU said you would do for somebody.
 *
 * **IT CARRIES NO `days` FIELD, AND THAT IS THE DESIGN.** `PersonLine` above has
 * one because ageing what somebody else owes you is a fact about a date:
 * *"With Sam for three weeks"* describes their debt, and the app is entitled to
 * describe it.
 *
 * Pointed the other way the same words become *"you have owed Sam this for three
 * weeks"* — which is the ledger `src/requests.ts` says in terms this app exists
 * NOT to keep (ADR-0042, restated in ADR-0056): a record of the times you did
 * not do your own work. A promise carries no shame, no ageing score and no
 * count of how long anybody has been waiting on you.
 *
 * Enforced by the SHAPE rather than by this paragraph. There is no field to
 * render, so no surface can render one, and the omission is checkable by
 * reading four lines instead of by remembering a rule.
 */
export interface PromiseLine {
  node: NodeState;
  /** Their name, or null when the person node has been let go. */
  person: string | null;
}

export interface PersonView {
  person: NodeState;
  /** What they owe you. */
  owes: PersonLine[];
  /** What you owe them, or where they are otherwise attached. */
  involves: PersonLine[];
  /** Everything, for a count that is never a lie by omission. */
  total: number;
}

const alive = (n: NodeState): boolean => isHeld(n);

/** Every person node in the vault, by name. */
export function people(state: State): NodeState[] {
  return [...state.nodes.values()]
    .filter(n => n.kind === 'person' && alive(n))
    .sort((a, b) => (a.title || '').localeCompare(b.title || '') || (a.id < b.id ? -1 : 1));
}

/** Is this a waiting-for that is still open? A closed one is history: it
 *  happened, the log says so, and it is not something you are still owed. */
export const isOpenWaiting = (n: NodeState): boolean =>
  n.kind === 'waiting-for' && alive(n) && !n.lastDone && !n.waitingOutcome;

/**
 * Everything attached to one person.
 *
 * `owes` is the half people actually come here for. It is built from the
 * waiting-for kind AND the `waiting-on` relation, because those are two ways of
 * saying the same thing and an app that showed only one of them would be right
 * half the time — which is worse than being wrong, because you would trust it.
 */
export function personView(state: State, personId: string, nowIso: string, zone: string): PersonView | null {
  const person = state.nodes.get(personId);
  if (!person || !alive(person)) return null;

  const owes: PersonLine[] = [];
  const involves: PersonLine[] = [];
  const day: DayShape = { zone, boundary: boundaryOf(state) };

  for (const n of heldNodes(state)) {
    if (n.id === personId) continue;
    const links = n.people.filter(l => l.person === personId);
    const owed = isOpenWaiting(n) && (n.waitingOn === personId || links.some(l => l.relation === 'waiting-on'));
    if (owed) {
      owes.push({ node: n, relation: 'waiting-on', days: openDays(n, nowIso, day) });
      continue;
    }
    for (const l of links) {
      involves.push({ node: n, relation: l.relation, days: null });
    }
  }

  const byId = (a: PersonLine, b: PersonLine): number => (a.node.id < b.node.id ? -1 : 1);
  // Longest-waiting first: the thing you have been owed for three weeks is the
  // thing worth mentioning when you next see them. Ties fall back to id, so the
  // order is TOTAL and two renders of one state never disagree.
  owes.sort((a, b) => (b.days ?? -1) - (a.days ?? -1) || byId(a, b));
  involves.sort(byId);
  return { person, owes, involves, total: owes.length + involves.length };
}

/** How long a waiting-for has been open. Null when nobody said when it started —
 *  silence beats a number derived from nothing. */
export function openDays(n: NodeState, nowIso: string, day: DayShape): number | null {
  const since = n.waitingSince;
  if (!since || !isValidIso(since)) return null;
  // The reader's day, not the calendar's (V2 stage 5, threaded 1.38.1).
  return calendarDaysBetween(since, nowIso, day);
}

/**
 * Everything you are owed, by anybody — including the ones nobody has put a name
 * to. Those are NOT hidden: an unattributed waiting-for is the commonest kind,
 * because the route that creates one is a single tap, and dropping it from the
 * one surface that lists what you are owed would make that surface quietly
 * incomplete.
 */
export function waitingOnAnyone(state: State, nowIso: string, zone: string): PersonLine[] {
  const out: PersonLine[] = [];
  const day: DayShape = { zone, boundary: boundaryOf(state) };
  for (const n of heldNodes(state)) {
    if (!isOpenWaiting(n)) continue;
    out.push({ node: n, relation: 'waiting-on', days: openDays(n, nowIso, day) });
  }
  return out.sort((a, b) => (b.days ?? -1) - (a.days ?? -1) || (a.node.id < b.node.id ? -1 : 1));
}

/** Is this a promise still standing? Live work, not done, with somebody's name
 *  on it. There is no separate open/closed state to fold: **doing the work IS
 *  keeping the promise**, which is the whole reason this is a relation on an
 *  ordinary node rather than a kind of its own. */
export const isOpenPromise = (n: NodeState): boolean =>
  alive(n) && !n.lastDone && n.people.some(l => l.relation === 'promised-to');

/**
 * Everything you said you would do, for anybody — the mirror of
 * `waitingOnAnyone`, and deliberately not its twin.
 *
 * **ORDERED BY TITLE, never by age.** That one sorts longest-waiting first,
 * because the thing you have been owed for three weeks is the thing worth
 * mentioning when you next see them. Sorting these by age would rank your own
 * lapses, which is the same forbidden ledger the missing `days` field is about —
 * and it would do it silently, since an ordering states nothing out loud.
 *
 * A node promised to two people appears once per person, because two people are
 * each expecting it and an app that mentioned only the first would be right half
 * the time — which is worse than wrong, because you would trust it. That is
 * `personView`'s own reasoning about the two ways of saying *waiting-on*.
 */
export function promisedToAnyone(state: State): PromiseLine[] {
  const out: PromiseLine[] = [];
  for (const n of heldNodes(state)) {
    if (!isOpenPromise(n)) continue;
    for (const l of n.people) {
      if (l.relation !== 'promised-to') continue;
      out.push({ node: n, person: personName(state, l.person) });
    }
  }
  return out.sort((a, b) =>
    (a.node.title || '').localeCompare(b.node.title || '')
    || (a.person ?? '').localeCompare(b.person ?? '')
    || (a.node.id < b.node.id ? -1 : 1));
}

/**
 * The count line, mirroring `peopleWords` and ageing nothing.
 *
 * Says WHAT IT IS and never how long it has been so. "You said you would" is a
 * statement about an undertaking; every word that could attach a duration or a
 * lapse to it is deliberately absent.
 */
export function promisedWords(total: number): string {
  if (total === 0) return '';
  if (total === 1) return 'One thing you said you would do.';
  return `${total} things you said you would do.`;
}

/**
 * One row, in words: the name and nothing else.
 *
 * The waiting row beside it reads *"With Sam for three weeks."* — a name and a
 * duration. This one is a name, full stop, and the difference between the two
 * lines is the whole constraint this feature is built under.
 */
export function promisedRowWords(person: string | null): string {
  return person ? `For ${person}.` : 'Nobody named yet.';
}

/**
 * The name of a person node, or null.
 *
 * Null for missing AND for let-go, and that second half is the whole reason this
 * is a shared function. `withWhom` checked it; `portfolio.ts` reached into
 * `state.nodes` directly and did not, so a tracked project went on announcing
 * "Ada is running it" about somebody who had been let go. One concept, two
 * places, one of them checking (audit, 2026-07-29) — the same shape as the
 * spent-card bug found in `review.ts` in the same pass.
 */
export function personName(state: State, id: string | null): string | null {
  if (!id) return null;
  const p = state.nodes.get(id);
  return p && alive(p) ? (p.title || '(unnamed)') : null;
}

/**
 * WHO IS HERE — the third filter axis (2.26.0, entry 24's third candidate).
 *
 * The catalogue grades this the **best evidenced of the three**: a specific
 * person standing in front of somebody is the most distinctive, focal
 * event-based cue of the three, closer to Einstein & McDaniel's strongest case
 * than a generic room ever is.
 *
 * ## The same pattern, deliberately, and not a better one
 *
 * `fitsHere`'s shape exactly, including the part that looks like a weakness:
 * **a thing with nobody attached fits every answer.** That is the load-bearing
 * default the place axis already carries — without it, saying who is here on a
 * store where almost nothing names a person empties the screen, and entry 23 is
 * the account of why an app that goes empty on the first day is the app somebody
 * stops trusting. The cost is noise; the alternative cost is a filter nobody
 * can rely on, which is worse and harder to notice.
 *
 * Resolved through state rather than trusting the stored ids, so a person who
 * was trashed stops filtering without a migration — `contextsOf`'s rule, and
 * `personName` already resolves the same way one node at a time.
 *
 * EVERY RELATION COUNTS, not just `waiting-on`. What is between two people is
 * not only what one of them is owed: a thing they asked for, a thing promised to
 * them, and a thing merely involving them are all things worth having in hand
 * when they are standing there. Narrowing this to one relation would answer a
 * different question, and the surface that answers THAT question — the person
 * lens on the detail sheet — is already built and stays where it is.
 */
export function fitsWith(state: State, n: NodeState, person: NodeId | null): boolean {
  if (person === null) return true;
  const live = namedOn(state, n);
  if (live.length === 0) return true;
  return live.some(l => l.person === person);
}

/**
 * The people actually named on a thing, trashed ones dropped.
 *
 * Extracted from `fitsWith` rather than copied beside it, so the diagnostic's
 * census counts the very links the filter branches on. EVERY RELATION, for the
 * reason `fitsWith` gives above — narrowing to one would answer a different
 * question and the two would disagree about the same store.
 */
export function namedOn(
  state: State, n: NodeState,
): ReadonlyArray<{ person: NodeId; relation: string }> {
  return n.people.filter(l => {
    const p = state.nodes.get(l.person);
    return p ? alive(p) : false;
  });
}

/** Everyone the reader has named, for the chooser. Hidden until one exists —
 *  a chooser with nothing in it teaches you the feature is broken. */
export function allPeople(state: State): NodeState[] {
  return [...state.nodes.values()]
    .filter(n => n.kind === 'person' && alive(n))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
}

/**
 * The standing line while the person filter is on.
 *
 * `whereWords`' register and `whereWords`' refusal: it states the SCOPE and
 * never a count of what is hidden, because an aggregate about work somebody is
 * deliberately not looking at only ever rises.
 */
export const withWords = (name: string): string =>
  `Showing what involves ${name}, and anything with nobody named on it. `
  + 'Everything else is still held and still comes back.';

/** The device's answer to "who is here", like `where.now` and `how.long`.
 *
 *  A DEVICE VIEW PREFERENCE and never an event, for the reason both of those
 *  carry and more sharply: a stored trail of who somebody was with, and when,
 *  is the single most sensitive thing this app could accidentally keep. There
 *  is no event for it and there must never be one. */
export const WITH_KEY = 'with.now';

let withNow: NodeId | null = null;
export const getWithNow = (): NodeId | null => withNow;
export const setWithNow = (id: NodeId | null): void => { withNow = id; };

/** The name to show for whoever a waiting-for is with. */
export function withWhom(state: State, n: NodeState): string | null {
  return personName(state, n.waitingOn ?? n.people.find(l => l.relation === 'waiting-on')?.person ?? null);
}

/**
 * How long, in words.
 *
 * A DURATION and never a verdict. "Three weeks" is a fact about a date; "chased
 * three times", or any of the words ADR-0010 bans, would be this app keeping
 * score on someone else's behalf, and it does not keep score on anybody's.
 *
 * (This comment used to make the point by QUOTING one of those words, and the
 * banned-vocabulary gate rejected it — correctly. NOTES.md already records the
 * same trap from Phase 3: the comment gets reworded, never the gate widened.)
 */
export function waitingWords(days: number | null): string | null {
  if (days === null || days < 1) return null;
  if (days === 1) return 'since yesterday';
  if (days < 14) return `for ${days} days`;
  const weeks = Math.floor(days / 7);
  return weeks === 2 ? 'for a fortnight' : `for ${weeks} weeks`;
}

/** The count line for the lens. A number of open threads, never a scorecard. */
export function peopleWords(total: number): string {
  if (total === 0) return 'Nothing is with anyone right now.';
  if (total === 1) return 'One thing is with someone else.';
  return `${total} things are with other people.`;
}

/**
 * Who cares how a piece of work goes (1.9.0, ADR-0057).
 *
 * `people[]` is the ONE home for these links, so this reads what the sheet
 * has been writing since 0.15.0 — nothing to heal, nothing to re-enter, and
 * no second array to fall out of step with the sheet's own list. Let-go
 * people are dropped, which is `personName`'s recorded lesson applied here
 * rather than re-derived: one concept, one place that checks.
 *
 * Sorted by name then id, so the order is TOTAL and two renders of one
 * state can never disagree.
 */
export function stakeholdersOf(state: State, n: NodeState): NodeState[] {
  const out: NodeState[] = [];
  const seen = new Set<string>();
  for (const l of n.people) {
    if (l.relation !== 'stakeholder' || seen.has(l.person)) continue;
    const p = state.nodes.get(l.person);
    if (!p || !alive(p)) continue;
    seen.add(l.person);
    out.push(p);
  }
  return out.sort((a, b) =>
    (a.title || '').localeCompare(b.title || '') || (a.id < b.id ? -1 : 1));
}

/**
 * The portfolio's clause for them: NAMES, never a bare number.
 *
 * The overflow count is the caps convention — a true count of what is not
 * shown, the same grammar as "N decisions — the 5 most recent are shown".
 * It never grades the work and no adjective enters the string, because a
 * number of people attached to a project must not read as its importance.
 */
export function stakeholderWords(names: readonly string[]): string | null {
  if (names.length === 0) return null;
  if (names.length === 1) return `${names[0]} cares how it goes`;
  if (names.length === 2) return `${names[0]} and ${names[1]} care how it goes`;
  const rest = names.length - 2;
  return `${names[0]}, ${names[1]} and ${rest} ${rest === 1 ? 'other' : 'others'} care how it goes`;
}


/** The three shelves of a place-aware people chooser (3.21.0). */
export interface PeopleByPlace {
  /** Stated at this place, on their own sheet. */
  here: NodeState[];
  /** No stated places at all — offered everywhere, `fitsHere`'s own default. */
  anywhere: NodeState[];
  /** Stated only at other places — one press away, never gone. */
  elsewhere: NodeState[];
}

/**
 * People, sorted by the place you are standing in (3.21.0, ADR-0123).
 *
 * The device pass, in its own words: "a way to group or select people as
 * affiliated with contexts, so my wife isn't an option for staff call."
 * STATED FACTS ONLY: a person carries places the reader put on that person's
 * own sheet — entry 24's shape — and nothing is ever inferred from who was
 * around when (entry 23's refusal, the with-trail this app must never keep).
 *
 * The load-bearing default is `fitsHere`'s, restated for people: someone with
 * NO stated places fits every answer and is always offered, because on a store
 * where almost nobody carries a place, an empty chooser is the app teaching
 * that the feature is broken. Someone stated only elsewhere moves behind one
 * press — never removed, never hidden for good — so the chooser narrows
 * without the roster ever lying about who exists.
 *
 * A trashed place neither holds nor exiles anybody: affiliation resolves
 * through `contextsOf`, which drops dead places, so a person whose only stated
 * place was let go is simply unplaced again — no migration, `personName`'s
 * resolve-through-state rule on one more axis.
 */
export function peopleForPlace(state: State, place: NodeId | null): PeopleByPlace {
  const everyone = allPeople(state);
  const placeLive = place !== null
    && [...state.nodes.values()].some(c => c.id === place && c.kind === 'context' && alive(c));
  if (!placeLive) return { here: [], anywhere: everyone, elsewhere: [] };
  const here: NodeState[] = [];
  const anywhere: NodeState[] = [];
  const elsewhere: NodeState[] = [];
  for (const p of everyone) {
    const places = contextsOf(state, p);
    if (places.length === 0) anywhere.push(p);
    else if (places.some(c => c.id === place)) here.push(p);
    else elsewhere.push(p);
  }
  return { here, anywhere, elsewhere };
}
