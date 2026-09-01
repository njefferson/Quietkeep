// The person lens (v1 Must).
//
// The question this exists for is not "how is my work filed". It is "what am I
// waiting on Sam for", asked out loud, in a corridor, with no time to look
// anything up. So the tests are about whether that question gets a complete and
// honest answer — particularly the half that is easiest to get wrong, which is
// the things nobody has put a name to.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fold, type State } from '../src/fold.ts';
import { admit } from '../src/gate.ts';
import {
  people, personView, waitingOnAnyone, withWhom, openDays, waitingWords,
  peopleWords, isOpenWaiting, personName,
  promisedToAnyone, promisedWords, promisedRowWords,
  fitsWith, withWords, allPeople, RELATIONS, peopleForPlace,
} from '../src/people.ts';
import { silentNodes } from '../src/gate.ts';
import {
  linkPersonEvents, closeWaitingEvents, releasePromiseEvents, releaseHoldingEvents,
} from '../src/ui/detail-intents.ts';
import type { AppEvent } from '../src/events.ts';
import { atMidnight } from '../src/time.ts';

const TZ = 'America/Denver';
const NOW = '2026-07-29T18:00:00.000Z';
const AGO = (d: number): string => new Date(Date.parse(NOW) - d * 86_400_000).toISOString();

let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown, at = NOW): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const st = (...e: AppEvent[]): State => fold(e);
const mk = (id: string, kind: string, title = id): AppEvent =>
  ev('node.created', id, { nodeKind: kind, title });
const clocked = (id: string): AppEvent =>
  ev('clock.set', id, { clockKind: 'review', at: NOW, source: 't' });

const ctxAt = (at: string) => ({
  id: () => `x${seq++}`, vault: 'personal', at, device: 'd0', seq: () => seq++, zone: TZ, day: atMidnight(TZ),
});
const ctx = ctxAt(NOW);
const apply = (state: State, events: AppEvent[]): State =>
  events.length === 0 ? state : fold(admit(events, state), state);

// --- naming somebody --------------------------------------------------------

test('saying who a thing is with creates the person and the link in one go', () => {
  const s0 = st(mk('W', 'waiting-for', 'the signed form'), clocked('W'));
  const s1 = apply(s0, linkPersonEvents(ctx, 'W', 'p1', 'waiting-on', {
    createNamed: 'Sam', openWaiting: true, forWhat: 'the signed form',
  }));
  assert.deepEqual(people(s1).map(p => p.title), ['Sam']);
  assert.equal(withWhom(s1, s1.nodes.get('W')!), 'Sam');
});

test('links are additive and idempotent, never last-writer-wins', () => {
  // Two devices each naming a DIFFERENT person on the same node must end with
  // both. LWW on a list would silently drop one device's answer — and the person
  // who owes you a thing is rarely the person who asked for it.
  const s0 = st(mk('N', 'action'), clocked('N'), mk('p1', 'person', 'Sam'), mk('p2', 'person', 'Ada'));
  let s = apply(s0, linkPersonEvents(ctx, 'N', 'p1', 'waiting-on'));
  s = apply(s, linkPersonEvents(ctx, 'N', 'p2', 'requested-by'));
  assert.equal(s.nodes.get('N')!.people.length, 2, 'both survive');

  s = apply(s, linkPersonEvents(ctx, 'N', 'p1', 'waiting-on'));
  assert.equal(s.nodes.get('N')!.people.length, 2, 'and saying it twice adds nothing');
});

test('one human is one node, however it is typed', () => {
  // A duplicate splits what you are owed across two rows for ever, and the
  // surface matches case-insensitively before minting a second node.
  const s0 = st(mk('p1', 'person', 'Sam'));
  const existing = people(s0).find(p => (p.title || '').toLowerCase() === 'sam'.toLowerCase());
  assert.equal(existing?.id, 'p1', 'the sheet finds "sam" and does not mint a second Sam');
});

// --- what you are owed ------------------------------------------------------

test('THE HALF EASIEST TO GET WRONG: an unnamed waiting-for still appears', () => {
  // Clarify's route is one tap and never asks who, so unattributed is the
  // COMMONEST kind. Dropping it would make the one surface that lists what you
  // are owed quietly incomplete — which is worse than being wrong, because you
  // would trust it.
  const s = st(mk('W', 'waiting-for', 'the signed form'), clocked('W'));
  const owed = waitingOnAnyone(s, NOW, TZ);
  assert.deepEqual(owed.map(l => l.node.id), ['W']);
  assert.equal(withWhom(s, s.nodes.get('W')!), null, 'and it does not invent a name');
});

test('a waiting-for is found by the kind AND by the relation', () => {
  // Two ways of saying the same thing. An app that read only one would be right
  // half the time.
  const byKind = st(mk('W', 'waiting-for'), clocked('W'),
    ev('waiting.opened', 'W', { person: 'p1', forWhat: 'x', since: AGO(3) }),
    mk('p1', 'person', 'Sam'));
  const byLink = st(mk('W', 'waiting-for'), clocked('W'), mk('p1', 'person', 'Sam'),
    ev('person.linked', 'W', { node: 'W', person: 'p1', relation: 'waiting-on' }));
  for (const [name, s] of [['the opened wait', byKind], ['the bare link', byLink]] as [string, State][]) {
    const v = personView(s, 'p1', NOW, TZ)!;
    assert.deepEqual(v.owes.map(l => l.node.id), ['W'], name);
  }
});

test('longest-waiting leads — that is the one worth mentioning when you see them', () => {
  const s = st(
    mk('p1', 'person', 'Sam'),
    mk('A', 'waiting-for', 'the form'), clocked('A'),
    ev('waiting.opened', 'A', { person: 'p1', forWhat: 'the form', since: AGO(2) }),
    mk('B', 'waiting-for', 'the numbers'), clocked('B'),
    ev('waiting.opened', 'B', { person: 'p1', forWhat: 'the numbers', since: AGO(21) }),
  );
  assert.deepEqual(personView(s, 'p1', NOW, TZ)!.owes.map(l => l.node.id), ['B', 'A']);
  assert.deepEqual(waitingOnAnyone(s, NOW, TZ).map(l => l.node.id), ['B', 'A']);
});

test('the order is total, so a render never reshuffles what it just showed', () => {
  const s = st(
    mk('c', 'waiting-for'), clocked('c'), mk('a', 'waiting-for'), clocked('a'),
    mk('b', 'waiting-for'), clocked('b'),
  );
  assert.deepEqual(waitingOnAnyone(s, NOW, TZ).map(l => l.node.id), ['a', 'b', 'c'],
    'ties fall back to id, not to insertion order');
});

test('what you owe them is kept apart from what they owe you', () => {
  const s = st(
    mk('p1', 'person', 'Sam'),
    mk('W', 'waiting-for', 'the form'), clocked('W'),
    ev('waiting.opened', 'W', { person: 'p1', forWhat: 'the form', since: AGO(3) }),
    mk('R', 'action', 'the thing Sam asked for'), clocked('R'),
    ev('person.linked', 'R', { node: 'R', person: 'p1', relation: 'requested-by' }),
  );
  const v = personView(s, 'p1', NOW, TZ)!;
  assert.deepEqual(v.owes.map(l => l.node.id), ['W'], 'they owe you this');
  assert.deepEqual(v.involves.map(l => l.node.id), ['R'], 'and you owe them that');
  assert.equal(v.total, 2, 'and the count is both, so it is never a lie by omission');
});

// --- ending one -------------------------------------------------------------

test('it arrived — and the work is not thereby finished', () => {
  const s0 = st(mk('W', 'waiting-for', 'the form'), clocked('W'), mk('p1', 'person', 'Sam'),
    ev('waiting.opened', 'W', { person: 'p1', forWhat: 'the form', since: AGO(3) }));
  assert.equal(isOpenWaiting(s0.nodes.get('W')!), true);

  const s1 = apply(s0, closeWaitingEvents(ctx, 'W'));
  assert.equal(isOpenWaiting(s1.nodes.get('W')!), false, 'it is with you now');
  assert.deepEqual(waitingOnAnyone(s1, NOW, TZ), [], 'and off the list of what you are owed');
  const w = s1.nodes.get('W')!;
  assert.equal(w.lastDone, null, 'but it is NOT done — a thing arriving is not a thing finished');
  assert.equal(w.trashed, false);
  assert.equal(Object.keys(w.clocks).length > 0, true,
    'and it still has a clock, because it is still yours (law 1)');
});

test('a completed or let-go waiting-for is not something you are still owed', () => {
  for (const [kind, payload] of [['done.marked', { at: NOW }], ['node.trashed', {}]] as const) {
    const s = st(mk('W', 'waiting-for'), clocked('W'), ev(kind, 'W', payload));
    assert.deepEqual(waitingOnAnyone(s, NOW, TZ), [], kind);
  }
});

test('reopening clears how the last one ended', () => {
  const s0 = st(mk('W', 'waiting-for'), clocked('W'),
    ev('waiting.opened', 'W', { person: 'p1', forWhat: 'x', since: AGO(9) }),
    ev('waiting.closed', 'W', { outcome: 'arrived' }));
  assert.equal(isOpenWaiting(s0.nodes.get('W')!), false);
  const s1 = apply(s0, [ev('waiting.opened', 'W', { person: 'p1', forWhat: 'x again', since: NOW })]);
  assert.equal(isOpenWaiting(s1.nodes.get('W')!), true, 'asking again is a new wait, not the old one');
  assert.equal(s1.nodes.get('W')!.waitingOutcome, null);
});

// --- words ------------------------------------------------------------------

test('how long is a duration, never a verdict', () => {
  assert.equal(waitingWords(null), null, 'nobody said when, so nothing is said');
  assert.equal(waitingWords(0), null, '"for 0 days" is a number pretending to be information');
  assert.equal(waitingWords(1), 'since yesterday');
  assert.equal(waitingWords(5), 'for 5 days');
  assert.equal(waitingWords(14), 'for a fortnight');
  assert.equal(waitingWords(30), 'for 4 weeks');
  for (const d of [1, 5, 14, 30, 400]) {
    const w = waitingWords(d)!;
    // The temptation here is enormous and it is refused: this app keeps score on
    // nobody's behalf, least of all on someone else's.
    for (const verdict of ['overdue', 'late', 'chased', 'ignored', 'still', 'no reply', 'nagg']) {
      assert.doesNotMatch(w, new RegExp(verdict, 'i'), `"${w}" passes no judgement on anyone`);
    }
  }
});

test('the count is a number of open threads, not a scorecard', () => {
  assert.equal(peopleWords(0), 'Nothing is with anyone right now.');
  assert.equal(peopleWords(1), 'One thing is with someone else.');
  assert.equal(peopleWords(6), '6 things are with other people.');
});

test('open days is reported only where it is knowable', () => {
  const none = st(mk('W', 'waiting-for'), clocked('W'));
  assert.equal(openDays(none.nodes.get('W')!, NOW, atMidnight(TZ)), null, 'nobody said when it started');
  const some = st(mk('W', 'waiting-for'), clocked('W'),
    ev('waiting.opened', 'W', { person: 'p1', forWhat: 'x', since: AGO(10) }));
  assert.equal(openDays(some.nodes.get('W')!, NOW, atMidnight(TZ)), 10);
  const bad = st(mk('W', 'waiting-for'), clocked('W'),
    ev('waiting.opened', 'W', { person: 'p1', forWhat: 'x', since: 'not a date' }));
  assert.equal(openDays(bad.nodes.get('W')!, NOW, atMidnight(TZ)), null,
    'a stored date that will not parse is silence, not a crash');
});

test('a person who was let go takes their lens with them, not your work', () => {
  const s0 = st(mk('p1', 'person', 'Sam'), mk('W', 'waiting-for'), clocked('W'),
    ev('waiting.opened', 'W', { person: 'p1', forWhat: 'x', since: AGO(3) }));
  const s1 = apply(s0, [ev('node.trashed', 'p1', {})]);
  assert.equal(personView(s1, 'p1', NOW, TZ), null, 'there is no lens for them any more');
  assert.deepEqual(waitingOnAnyone(s1, NOW, TZ).map(l => l.node.id), ['W'],
    'but you are still owed the thing — losing the name does not lose the work');
  assert.equal(withWhom(s1, s1.nodes.get('W')!), null, 'it simply stops claiming who');
});

test('a person who was let go is not named anywhere', () => {
  // FOUND BY AUDIT, 2026-07-29. `withWhom` checked liveness; `portfolio.ts`
  // reached into state.nodes directly and did not, so a tracked project went on
  // announcing "Ada is running it" about somebody already let go. One concept,
  // two places, one of them checking — now one function.
  const s = st(
    mk('p1', 'person', 'Ada'),
    mk('W', 'waiting-for'), clocked('W'),
    ev('waiting.opened', 'W', { person: 'p1', forWhat: 'x', since: AGO(3) }),
    ev('node.trashed', 'p1', {}),
  );
  assert.equal(personName(s, 'p1'), null, 'let go');
  assert.equal(personName(s, 'GHOST'), null, 'never existed');
  assert.equal(personName(s, null), null, 'nobody named');
  assert.equal(withWhom(s, s.nodes.get('W')!), null, 'and the waiting-for stops claiming who');
});

// --- the other direction (2.20.0) -------------------------------------------
//
// "Is anyone waiting on something from me." The mirror of the questions above,
// and deliberately NOT their twin: `src/requests.ts` rules that a record of the
// times you did not do your own work is the ledger this app exists not to keep,
// so everything here that could age a promise is absent by construction.

test('saying you promised something puts it on the list, for that person', () => {
  const s0 = st(mk('A', 'action', 'Send Sam the photos'), clocked('A'));
  const s = apply(s0, linkPersonEvents(ctx, 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));

  const lines = promisedToAnyone(s);
  assert.equal(lines.length, 1);
  assert.equal(lines[0]!.node.id, 'A');
  assert.equal(lines[0]!.person, 'Sam');
  assert.equal(promisedRowWords(lines[0]!.person), 'For Sam.');
});

test('a promise carries NO duration — not in the words, not in the shape', () => {
  // The constraint the whole feature is built under. "With Sam for three weeks"
  // is a fact about somebody else's debt to you; the same words pointed here
  // would be a record of how long you have been failing.
  const s0 = st(mk('A', 'action', 'Send Sam the photos'), clocked('A'));
  const s = apply(s0, linkPersonEvents(ctxAt(AGO(40)), 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));

  const line = promisedToAnyone(s)[0]!;
  // Enforced by the SHAPE: there is no field to render, so no surface can.
  assert.equal('days' in line, false, 'PromiseLine has no days field');
  const words = promisedRowWords(line.person) + ' ' + promisedWords(1);
  assert.doesNotMatch(words, /\d/, `"${words}" has a number in it`);
  assert.doesNotMatch(words, /week|day|month|since|ago|still|yet/i, `"${words}" ages the promise`);
});

test('doing the work keeps the promise — there is no separate closing', () => {
  // Why this is a relation on an ordinary node rather than a kind of its own.
  const s0 = st(mk('A', 'action', 'Send Sam the photos'), clocked('A'));
  let s = apply(s0, linkPersonEvents(ctx, 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));
  assert.equal(promisedToAnyone(s).length, 1);

  s = apply(s, [ev('done.marked', 'A', { at: NOW })]);
  assert.equal(promisedToAnyone(s).length, 0, 'kept by being done');
});

test('a promise can be taken back WITHOUT taking the work back', () => {
  // A promise nobody can release is a permanent claim that you owe somebody
  // something. Releasing it must not decide that you no longer intend the work.
  const s0 = st(mk('A', 'action', 'Send Sam the photos'), clocked('A'));
  let s = apply(s0, linkPersonEvents(ctx, 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));

  s = apply(s, releasePromiseEvents(ctx, 'A', 'p1'));
  const n = s.nodes.get('A')!;
  assert.equal(promisedToAnyone(s).length, 0, 'off the list');
  assert.equal(n.trashed, false, 'the work is still here');
  assert.ok(n.clocks.review, 'and still covered — the release took no clock away');
  assert.equal(silentNodes(s).length, 0);
});

test('releasing is SCOPED — one person, one relation, never a strip-all', () => {
  // ADR-0057's rule for the only other subtraction in the vocabulary. Sam can
  // be promised one thing and be running another, and neither may take the
  // other off.
  const s0 = st(mk('A', 'action', 'Send Sam the photos'), clocked('A'));
  let s = apply(s0, linkPersonEvents(ctx, 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));
  s = apply(s, linkPersonEvents(ctx, 'A', 'p1', 'opr'));
  s = apply(s, linkPersonEvents(ctx, 'A', 'p2', 'promised-to', { createNamed: 'Ada' }));

  s = apply(s, releasePromiseEvents(ctx, 'A', 'p1'));
  const rels = s.nodes.get('A')!.people;
  assert.ok(rels.some(l => l.person === 'p1' && l.relation === 'opr'),
    'Sam is still running it');
  assert.ok(rels.some(l => l.person === 'p2' && l.relation === 'promised-to'),
    'and Ada is still promised it');
  assert.equal(promisedToAnyone(s).length, 1);
});

test('a thing promised to two people is owed to both', () => {
  // Two people are each expecting it, and an app that named only the first
  // would be right half the time — which is worse than wrong.
  const s0 = st(mk('A', 'action', 'Send the photos'), clocked('A'));
  let s = apply(s0, linkPersonEvents(ctx, 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));
  s = apply(s, linkPersonEvents(ctx, 'A', 'p2', 'promised-to', { createNamed: 'Ada' }));

  const names = promisedToAnyone(s).map(l => l.person).sort();
  assert.deepEqual(names, ['Ada', 'Sam']);
});

test('the list is ordered by title, never by age', () => {
  // Sorting by age would rank your own lapses, and would do it silently —
  // an ordering states nothing out loud.
  const s0 = st(mk('A', 'action', 'Zebra'), clocked('A'), mk('B', 'action', 'Aardvark'), clocked('B'));
  let s = apply(s0, linkPersonEvents(ctxAt(AGO(90)), 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));
  s = apply(s, linkPersonEvents(ctx, 'B', 'p1', 'promised-to'));

  assert.deepEqual(promisedToAnyone(s).map(l => l.node.title), ['Aardvark', 'Zebra'],
    'the oldest promise is not put first');
});

test('a promise shows on the person’s own sheet, with nothing changed to do it', () => {
  // `personView.involves` takes any relation, so the screen built in 1.12.0
  // answers "what is between me and this person" in both directions the moment
  // the relation exists.
  const s0 = st(mk('A', 'action', 'Send Sam the photos'), clocked('A'));
  const s = apply(s0, linkPersonEvents(ctx, 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));

  const view = personView(s, 'p1', NOW, TZ)!;
  assert.equal(view.owes.length, 0, 'they owe you nothing');
  assert.equal(view.involves.length, 1);
  assert.equal(view.involves[0]!.relation, 'promised-to');
  assert.equal(view.involves[0]!.days, null, 'and no duration reaches the sheet either');
});

test('the count line says what it is and never how long it has been so', () => {
  assert.equal(promisedWords(0), '', 'silence when there is nothing');
  assert.match(promisedWords(1), /One thing you said you would do/);
  assert.match(promisedWords(4), /^4 things/);
  for (const n of [0, 1, 4, 17]) {
    assert.doesNotMatch(promisedWords(n), /week|day|month|late|still|owe/i);
  }
});

test('nobody named is said plainly, never invented and never hidden', () => {
  assert.equal(promisedRowWords(null), 'Nobody named yet.');
});

// ——— WHO IS HERE, the third filter axis (2.26.0, entry 24) ———
//
// The catalogue grades this the best-evidenced of the three axes: a specific
// person in front of somebody is the most distinctive focal event-based cue.
// These hold it to `fitsHere`'s shape, including the part that looks like a
// weakness and is load-bearing.

test('somebody named on a thing brings it through, and everyone else drops out', () => {
  const s = fold([
    ev('person.created', 'ALEX', { name: 'Alex' }),
    ev('person.created', 'SAM', { name: 'Sam' }),
    ev('node.created', 'a', { nodeKind: 'action', title: 'the guttering quote' }),
    ev('node.created', 'b', { nodeKind: 'action', title: 'the other thing' }),
    ev('stakeholder.added', 'a', { node: 'a', person: 'ALEX', relation: 'waiting-on' }),
    ev('stakeholder.added', 'b', { node: 'b', person: 'SAM', relation: 'waiting-on' }),
  ]);
  assert.equal(fitsWith(s, s.nodes.get('a')!, 'ALEX'), true);
  assert.equal(fitsWith(s, s.nodes.get('b')!, 'ALEX'), false);
});

test('a thing with nobody on it fits every answer — the load-bearing default', () => {
  // `fitsHere`'s rule, deliberately copied. Without it, saying who is here on a
  // store where almost nothing names a person empties the screen, and entry 23
  // is the account of why an app that goes empty on the first day is the one
  // somebody stops trusting. The cost is noise; the alternative is a filter
  // nobody can rely on, which is worse and harder to notice.
  const s = fold([
    ev('person.created', 'ALEX', { name: 'Alex' }),
    ev('node.created', 'loose', { nodeKind: 'action', title: 'nobody is on this' }),
  ]);
  assert.equal(fitsWith(s, s.nodes.get('loose')!, 'ALEX'), true);
  assert.equal(fitsWith(s, s.nodes.get('loose')!, null), true, 'and no answer filters nothing');
});

test('every relation counts, not only waiting-on', () => {
  // What is between two people is not only what one of them is owed. A thing
  // promised to them and a thing merely involving them are both worth having in
  // hand when they are standing there.
  const s = fold([
    ev('person.created', 'ALEX', { name: 'Alex' }),
    ev('node.created', 'p', { nodeKind: 'action', title: 'the framed prints' }),
    ev('stakeholder.added', 'p', { node: 'p', person: 'ALEX', relation: 'promised-to' }),
  ]);
  assert.equal(fitsWith(s, s.nodes.get('p')!, 'ALEX'), true);
});

test('a trashed person stops filtering, without a migration', () => {
  const base = fold([
    ev('person.created', 'ALEX', { name: 'Alex' }),
    ev('node.created', 'a', { nodeKind: 'action', title: 'x' }),
    ev('stakeholder.added', 'a', { node: 'a', person: 'ALEX', relation: 'waiting-on' }),
  ]);
  assert.equal(fitsWith(base, base.nodes.get('a')!, 'ALEX'), true);
  const gone = fold([ev('node.trashed', 'ALEX', { at: NOW })], base);
  // With the only named person gone the link is dead, so the thing reverts to
  // fitting everything rather than to fitting nothing — `contextsOf`'s rule.
  assert.equal(fitsWith(gone, gone.nodes.get('a')!, 'ALEX'), true);
});

test('the standing line states the scope and never a count of what is hidden', () => {
  const w = withWords('Alex');
  assert.match(w, /Alex/);
  assert.match(w, /anything with nobody named on it/, 'the default is said out loud');
  assert.match(w, /still held and still comes back/);
  assert.ok(!/\d+ hidden|\d+ others|hiding/.test(w),
    'an aggregate about work you are deliberately not looking at only ever rises');
});

// --- who holds the rest (Q-15 / ADR-0122) -----------------------------------
//
// The directory relation, in both directions, because a noun that only ever
// says "they have more of this than you" would encode a deficit into the
// vocabulary (Q-15's own bullet). A pointer carries no text, no version and no
// age — there is nothing to compare, which is the whole reason it survives
// entry 32's prohibitions.

test('the vocabulary holds both directions of holding', () => {
  assert.ok(RELATIONS.includes('rest-with-them' as (typeof RELATIONS)[number]));
  assert.ok(RELATIONS.includes('rest-with-me' as (typeof RELATIONS)[number]));
});

test('a holding pointer never ages, in either direction', () => {
  const s0 = st(mk('A', 'action', 'the venue contract'), clocked('A'),
    mk('B', 'action', 'the seating list'), clocked('B'));
  const s = apply(s0, [
    ...linkPersonEvents(ctxAt(AGO(40)), 'A', 'p1', 'rest-with-them', { createNamed: 'Sam' }),
    ...linkPersonEvents(ctxAt(AGO(40)), 'B', 'p1', 'rest-with-me'),
  ]);
  const view = personView(s, 'p1', NOW, TZ)!;
  assert.equal(view.involves.length, 2, 'both directions are on their page');
  for (const line of view.involves) {
    assert.equal(line.days, null, 'forty days on, there is still no number');
  }
});

test('a holding can be taken back, exactly as scoped', () => {
  // `promise.released`'s discipline: one person, one relation. Sam can hold the
  // rest of a thing AND care how it goes, and taking the pointer off must not
  // strip the other — nor touch the same pointer on any other node.
  const s0 = st(mk('A', 'action', 'x'), clocked('A'), mk('B', 'action', 'y'), clocked('B'));
  const s1 = apply(s0, [
    ...linkPersonEvents(ctx, 'A', 'p1', 'rest-with-them', { createNamed: 'Sam' }),
    ...linkPersonEvents(ctx, 'A', 'p1', 'stakeholder'),
    ...linkPersonEvents(ctx, 'B', 'p1', 'rest-with-them'),
  ]);
  const s2 = apply(s1, releaseHoldingEvents(ctx, 'A', 'p1', 'rest-with-them'));
  const a = s2.nodes.get('A')!;
  assert.equal(a.people.some(l => l.relation === 'rest-with-them'), false, 'the pointer is off');
  assert.ok(a.people.some(l => l.person === 'p1' && l.relation === 'stakeholder'),
    'the same person\'s other link survives');
  assert.ok(s2.nodes.get('B')!.people.some(l => l.relation === 'rest-with-them'),
    'and the pointer on the other node survives');
});

test('a release naming a relation outside the pair is a no-op, never a remove-all', () => {
  const s0 = st(mk('A', 'action', 'x'), clocked('A'));
  const s1 = apply(s0, linkPersonEvents(ctx, 'A', 'p1', 'promised-to', { createNamed: 'Sam' }));
  const s2 = fold([ev('holding.released', 'A', { person: 'p1', relation: 'promised-to' })], s1);
  assert.ok(s2.nodes.get('A')!.people.some(l => l.relation === 'promised-to'),
    'a promise comes off through its own noun, not through this one');
});

// --- people, by the place you are in (3.21.0) -------------------------------
//
// The device pass: "I would like a way to group or select people as affiliated
// with contexts, so my wife isn't an option for staff call." Stated facts only
// — a place put on the person's own sheet — never inference (entry 23's
// refusal), and the load-bearing default is `fitsHere`'s own: a person with no
// stated places fits every answer and is always offered. Everyone else stays
// one press away; nothing is hidden for good.

test('a place sorts the people choosers: stated-here, unplaced, elsewhere', () => {
  const s0 = st(
    ev('person.created', 'PW', { name: 'Wren' }),
    ev('person.created', 'PC', { name: 'Cole' }),
    ev('person.created', 'PU', { name: 'Uma' }),
    ev('context.created', 'CW', { name: 'At work' }),
    ev('context.created', 'CH', { name: 'At home' }),
    ev('context.attached', 'PC', { node: 'PC', context: 'CW' }),
    ev('context.attached', 'PW', { node: 'PW', context: 'CH' }),
  );
  const g = peopleForPlace(s0, 'CW');
  assert.deepEqual(g.here.map(p => p.title), ['Cole'], 'stated at this place');
  assert.deepEqual(g.anywhere.map(p => p.title), ['Uma'], 'no stated places — offered everywhere');
  assert.deepEqual(g.elsewhere.map(p => p.title), ['Wren'], 'stated only elsewhere — one press away, never gone');
});

test('no place chosen: everyone is simply offered', () => {
  const s0 = st(
    ev('person.created', 'PB', { name: 'Bea' }),
    ev('person.created', 'PA', { name: 'Ash' }),
  );
  const g = peopleForPlace(s0, null);
  assert.deepEqual(g.here, []);
  assert.deepEqual(g.anywhere.map(p => p.title), ['Ash', 'Bea']);
  assert.deepEqual(g.elsewhere, []);
});

test('a trashed place stops sorting anybody, without a migration', () => {
  const s0 = st(
    ev('person.created', 'PC', { name: 'Cole' }),
    ev('context.created', 'CW', { name: 'At work' }),
    ev('context.attached', 'PC', { node: 'PC', context: 'CW' }),
    ev('node.trashed', 'CW', { at: NOW }),
  );
  const g = peopleForPlace(s0, 'CW');
  assert.deepEqual(g.anywhere.map(p => p.title), ['Cole'],
    'a dead place neither holds people nor exiles them — contextsOf resolves live');
});
