// A meeting is somewhere you can stand (3.16.0, ADR-0119).
//
// `lineView` made a ROLE somewhere you could stand: open it and see the work
// carrying that identity, and the parts of the tree that work sits under. This
// is the same move on the other axis. A situation can name who is in the room
// (3.15.0, ADR-0118); pointing that at the person links makes a named meeting
// into a view of everything the meeting is about.
//
// ## It is an INSPECTION MODE, and that is not a detail
//
// The obvious build is a filter: narrow the working surfaces to these people
// for the length of the meeting. The app refuses that, and has refused it in
// the same words twice — `docs/horizon-models.md` §3 and ADR-0115. A filter
// over a working surface leaves you with two lists and something to remember,
// and the thing it hides still has its clock and still comes back, so the
// hiding buys nothing and costs a thing you have to undo.
//
// The person filter that DOES exist (`fitsWith`, `with.now`) is single-valued
// and stays that way. It answers "who is in front of me right now"; this
// answers "what is this meeting about", and they are different questions with
// different right answers. Nothing here writes `with.now` and nothing here
// narrows anything.
//
// ## Grouped by person, and a thing can appear twice
//
// A merged list would lose what a meeting is for. Somebody walks in wanting to
// know what is outstanding WITH SAM, not what is outstanding across five
// people — and a node naming two attendees is genuinely two conversations.
// `promisedToAnyone` settled this exact case: a thing promised to two people
// appears once per person, because each of them is expecting it and an app that
// mentioned only the first would be right half the time, which is worse than
// wrong because you would trust it.
//
// ## An attendee with nothing is kept, and that is the useful row
//
// The same reasoning `lineView` gives for an empty line and `personView` gives
// for a person with nothing: a group that vanishes leaves the question looking
// unanswerable. "Nothing is outstanding with Ada" is an answer somebody walks
// into a meeting glad to have.
//
// PURE. Every projection here takes what it needs and reads nothing else.

import type { NodeState, State } from './fold.ts';
import type { NodeId } from './events.ts';
import { namedOn, allPeople } from './people.ts';
import { servesNode } from './serves.ts';
import { allRoles } from './roles.ts';

/** One attendee and what is outstanding with them. */
export interface MeetingPerson {
  readonly person: NodeState;
  /** Live work naming them, by title. Empty is a real and useful answer. */
  readonly work: NodeState[];
}

export interface MeetingView {
  /** The attendees still here, by name. Somebody let go is simply not one. */
  readonly people: MeetingPerson[];
  /** The distinct horizons the meeting's work sits under. */
  readonly crosses: NodeState[];
  /** The distinct lines that work carries — the roles it is for. */
  readonly lines: NodeState[];
  /** How many distinct things are in the meeting, counting a thing once even
   *  when it names two attendees. The per-person rows deliberately double-count
   *  and a total that also did would overstate the room. */
  readonly total: number;
}

/**
 * What a meeting is about.
 *
 * `heldOf` is passed rather than imported for the reason `lineView` takes it:
 * the caller decides what counts as held, and a projection that reached for the
 * gate directly would be a second answer to that question.
 *
 * EVERY RELATION counts. `namedOn` returns them all — waiting-on, promised-to,
 * requested-by, stakeholder, opr, mentioned — and narrowing to one would answer
 * a different question, which is the note `fitsWith` already carries about
 * itself. In a meeting all six are things you would raise.
 *
 * LIVE WORK ONLY, exactly as `lineView` and `roleLoads` count it. A finished
 * thing is not outstanding with anybody, and listing it would make this a
 * record of output — the shape law 5 refuses. What was DONE since last time is
 * a different question and `delta.ts` already answers it.
 */
export function meetingView(
  state: State, attendees: readonly NodeId[], heldOf: (s: State) => Iterable<NodeState>,
): MeetingView {
  const live = new Map(allPeople(state).map(p => [p.id, p]));
  const here = [...new Set(attendees)]
    .map(id => live.get(id))
    .filter((p): p is NodeState => !!p)
    .sort((a, b) => (a.title || '').localeCompare(b.title || '') || (a.id < b.id ? -1 : 1));
  if (here.length === 0) return { people: [], crosses: [], lines: [], total: 0 };

  const wanted = new Set(here.map(p => p.id));
  const byPerson = new Map<NodeId, NodeState[]>(here.map(p => [p.id, []]));
  const distinct = new Map<NodeId, NodeState>();
  for (const n of heldOf(state)) {
    if (n.lastDone) continue;
    // A node naming one attendee twice — as OPR and as stakeholder, say — is
    // one thing in the room, not two. The set is over PEOPLE, not over links.
    const mine = new Set(namedOn(state, n).map(l => l.person).filter(id => wanted.has(id)));
    if (mine.size === 0) continue;
    for (const id of mine) byPerson.get(id)!.push(n);
    distinct.set(n.id, n);
  }
  const byTitle = (a: NodeState, b: NodeState): number =>
    (a.title || '').localeCompare(b.title || '') || (a.id < b.id ? -1 : 1);
  for (const list of byPerson.values()) list.sort(byTitle);

  // The horizons and the lines are read off the DISTINCT set, not off the
  // per-person rows: a thing naming three attendees would otherwise weight its
  // own horizon three times, and these are lists of what is there rather than
  // counts of how often.
  const crossSeen = new Map<NodeId, NodeState>();
  const lineSeen = new Map<NodeId, NodeState>();
  const roles = new Map(allRoles(state).map(r => [r.id, r]));
  for (const n of distinct.values()) {
    const h = servesNode(state, n);
    if (h && !crossSeen.has(h.id)) crossSeen.set(h.id, h);
    for (const rid of n.roles) {
      const r = roles.get(rid);
      if (r && !lineSeen.has(r.id)) lineSeen.set(r.id, r);
    }
  }
  return {
    people: here.map(p => ({ person: p, work: byPerson.get(p.id)! })),
    crosses: [...crossSeen.values()].sort(byTitle),
    lines: [...lineSeen.values()].sort(byTitle),
    total: distinct.size,
  };
}

/**
 * What the meeting view says above its lists.
 *
 * A COUNT OF THINGS AND NOTHING ELSE. No readiness, no "you are behind on
 * three", no ordering of the people by how much is on them — that last is
 * `roleLoads`' own rule, and ranking the people in a room by how much you owe
 * each of them is a worse version of the same judgement the app does not make.
 *
 * The empty case is stated rather than hidden, for the reason `lineViewWords`
 * gives: walking in knowing nothing is outstanding is worth as much as walking
 * in with a list.
 */
export const meetingViewWords = (v: MeetingView): string => {
  if (v.people.length === 0) {
    return 'Nobody this names is still here, so there is nothing to show.';
  }
  if (v.total === 0) {
    return 'Nothing is outstanding with anybody here — which is worth knowing on '
      + 'the way in.';
  }
  const n = v.total === 1 ? 'One thing is' : `${v.total} things are`;
  const parts: string[] = [];
  if (v.crosses.length > 0) {
    parts.push(v.crosses.length === 1
      ? 'one part of your tree' : `${v.crosses.length} parts of your tree`);
  }
  if (v.lines.length > 0) {
    parts.push(v.lines.length === 1 ? 'one of your lines' : `${v.lines.length} of your lines`);
  }
  if (parts.length === 0) return `${n} in this room.`;
  return `${n} in this room, across ${parts.join(' and ')}.`;
};

/** One person's row, in words. A count, never a verdict about them or you. */
export const meetingPersonWords = (p: MeetingPerson): string => {
  if (p.work.length === 0) return 'Nothing outstanding.';
  return p.work.length === 1 ? 'One thing.' : `${p.work.length} things.`;
};
