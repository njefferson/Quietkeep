// A meeting is somewhere you can stand (3.16.0, ADR-0119).
//
// The load-bearing properties: it is an INSPECTION MODE and narrows nothing;
// every relation counts, because in a meeting all six are things you would
// raise; a thing naming two attendees is two conversations and appears under
// both; an attendee with nothing is kept, because that is a useful row; and the
// total counts things rather than rows, so a thing in the room twice is one
// thing.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fold, type State } from '../src/fold.ts';
import { heldNodes } from '../src/gate.ts';
import { meetingView, meetingViewWords, meetingPersonWords, meetingByThing } from '../src/meeting.ts';
import type { AppEvent } from '../src/events.ts';

let seq = 0;
const NOW = '2026-08-30T18:00:00.000Z';
const ev = (kind: string, node: string | null, payload: unknown): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at: NOW, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const st = (...e: AppEvent[]): State => fold(e);
const mk = (id: string, kind: string, title = id, parent?: string): AppEvent =>
  ev('node.created', id, { nodeKind: kind, title, ...(parent ? { parent } : {}) });
const link = (n: string, p: string, relation: string): AppEvent =>
  ev('person.linked', n, { node: n, person: p, relation });
const view = (s: State, who: string[]) => meetingView(s, who, heldNodes);

const room = (): AppEvent[] => [
  mk('PA', 'person', 'Ada'), mk('PS', 'person', 'Sam'), mk('PO', 'person', 'Ola'),
];

test('a meeting shows what is outstanding with each person in it', () => {
  const s = st(...room(),
    mk('A', 'action', 'draft the brief'), link('A', 'PA', 'waiting-on'),
    mk('B', 'action', 'send the figures'), link('B', 'PS', 'promised-to'),
  );
  const v = view(s, ['PA', 'PS']);
  assert.deepEqual(v.people.map(p => p.person.title), ['Ada', 'Sam'], 'by name, never by how much');
  assert.deepEqual(v.people[0]!.work.map(n => n.id), ['A']);
  assert.deepEqual(v.people[1]!.work.map(n => n.id), ['B']);
  assert.equal(v.total, 2);
});

test('EVERY RELATION counts — in a meeting all six are things you would raise', () => {
  const rels = ['opr', 'stakeholder', 'waiting-on', 'requested-by', 'mentioned', 'promised-to'];
  for (const r of rels) {
    const s = st(...room(), mk('A', 'action', 'the thing'), link('A', 'PA', r));
    assert.equal(view(s, ['PA']).total, 1, `${r} reaches the room`);
  }
  // PLANT: narrowing `namedOn` to one relation goes red on five of the six.
});

test('a thing naming two attendees is two conversations, and one thing', () => {
  const s = st(...room(),
    mk('A', 'action', 'the joint paper'),
    link('A', 'PA', 'promised-to'), link('A', 'PS', 'stakeholder'),
  );
  const v = view(s, ['PA', 'PS']);
  assert.deepEqual(v.people[0]!.work.map(n => n.id), ['A'], 'Ada is expecting it');
  assert.deepEqual(v.people[1]!.work.map(n => n.id), ['A'], 'and so is Sam');
  assert.equal(v.total, 1, 'but there is one thing in the room, not two');
  // PLANT: counting the per-person rows instead of the distinct set makes the
  // total 2 and overstates the room on every store with a joint item in it.
});

test('one attendee named twice on one thing is one thing, not two', () => {
  const s = st(...room(),
    mk('A', 'action', 'the review'),
    link('A', 'PA', 'opr'), link('A', 'PA', 'stakeholder'),
  );
  const v = view(s, ['PA']);
  assert.deepEqual(v.people[0]!.work.map(n => n.id), ['A']);
  assert.equal(v.total, 1);
  // PLANT: collecting links rather than people puts it on the row twice.
});

test('an attendee with nothing outstanding is kept, and says so', () => {
  const s = st(...room(), mk('A', 'action', 'the brief'), link('A', 'PA', 'waiting-on'));
  const v = view(s, ['PA', 'PO']);
  assert.deepEqual(v.people.map(p => p.person.title), ['Ada', 'Ola']);
  assert.deepEqual(v.people[1]!.work, [], 'a group that vanishes leaves the question unanswerable');
  assert.equal(meetingPersonWords(v.people[1]!), 'Nothing outstanding.');
});

test('finished work is not outstanding with anybody', () => {
  const s = st(...room(),
    mk('A', 'action', 'the brief'), link('A', 'PA', 'promised-to'),
    ev('done.marked', 'A', { at: NOW }),
  );
  const v = view(s, ['PA']);
  assert.equal(v.total, 0, 'what was done since last time is delta.ts, not this');
  assert.match(meetingViewWords(v), /Nothing is outstanding with anybody here/);
});

test('somebody let go is simply not in the room, with no migration', () => {
  const base = [...room(), mk('A', 'action', 'the brief'), link('A', 'PA', 'waiting-on')];
  assert.equal(view(st(...base), ['PA', 'PS']).people.length, 2);
  const gone = st(...base, ev('node.released', 'PS', { at: NOW }));
  assert.deepEqual(view(gone, ['PA', 'PS']).people.map(p => p.person.title), ['Ada']);
});

test('a room of nobody says so rather than rendering an empty screen', () => {
  const s = st(...room());
  const v = view(s, ['NOPE']);
  assert.deepEqual(v.people, []);
  assert.equal(meetingViewWords(v), 'Nobody this names is still here, so there is nothing to show.');
});

test('the horizons and lines are read off the things, not off the rows', () => {
  const s = st(...room(),
    mk('G', 'goal', 'a calmer service'),
    mk('P', 'project', 'the migration', 'G'),
    mk('R', 'role', 'The service'),
    mk('A', 'action', 'the joint paper', 'P'),
    ev('role.attached', 'A', { node: 'A', role: 'R' }),
    link('A', 'PA', 'promised-to'), link('A', 'PS', 'stakeholder'), link('A', 'PO', 'mentioned'),
  );
  const v = view(s, ['PA', 'PS', 'PO']);
  assert.deepEqual(v.crosses.map(n => n.id), ['G'], 'one horizon, named once, not three times');
  assert.deepEqual(v.lines.map(n => n.id), ['R'], 'and one line');
  assert.equal(v.total, 1);
  assert.equal(meetingViewWords(v),
    'One thing is in this room, across one part of your tree and one of your lines.');
});

test('the words count things and grade nobody', () => {
  const s = st(...room(),
    mk('A', 'action', 'a'), link('A', 'PA', 'waiting-on'),
    mk('B', 'action', 'b'), link('B', 'PS', 'promised-to'),
    mk('C', 'action', 'c'), link('C', 'PS', 'requested-by'),
  );
  const v = view(s, ['PA', 'PS']);
  assert.equal(meetingViewWords(v), '3 things are in this room.');
  const said = [meetingViewWords(v), ...v.people.map(meetingPersonWords)].join(' ');
  assert.doesNotMatch(said, /behind|overdue|late|should|owe|worst|most|least|score|%/i);
  // And the people are in name order even though Sam carries more.
  assert.deepEqual(v.people.map(p => p.person.title), ['Ada', 'Sam']);
  // PLANT: sorting the people by `work.length` goes red here, and it is the
  // ranking `roleLoads` refuses for the same reason one level over.
});

test('it narrows nothing — the projection is pure and touches no preference', () => {
  const s = st(...room(), mk('A', 'action', 'the brief'), link('A', 'PA', 'waiting-on'));
  const before = JSON.stringify([...s.nodes.keys()].sort());
  view(s, ['PA']);
  assert.equal(JSON.stringify([...s.nodes.keys()].sort()), before, 'nothing was written');
});

// --- the room, by thing (3.21.0) --------------------------------------------
//
// The device pass, with one task every person shares: "it looks repetitive.
// Can it allow sort by person, or by task where it would collapse to one
// instance that several people owe, potentially grouped as appropriate without
// creating a manufactured label of any set of people." ADR-0119's per-person
// duplication stands — two attendees ARE two conversations — and this is the
// OTHER lens over the same room: each thing once, the attendees on it named.
// The names are the only grouping label there is.

test('by thing: each thing once, wearing the names that share it', () => {
  const s = st(...room(),
    mk('A', 'action', 'the shared submission'),
    link('A', 'PA', 'waiting-on'), link('A', 'PS', 'promised-to'), link('A', 'PO', 'stakeholder'),
    mk('B', 'action', 'a thing only Sam has'), link('B', 'PS', 'waiting-on'),
  );
  const rows = meetingByThing(s, ['PA', 'PS', 'PO'], heldNodes);
  assert.equal(rows.length, 2, 'two things, not four rows');
  assert.deepEqual(rows.map(r => r.node.title), ['a thing only Sam has', 'the shared submission']);
  assert.deepEqual(rows[1]!.people.map(p => p.title), ['Ada', 'Ola', 'Sam'],
    'the names on the row are the grouping, and the whole grouping');
  assert.deepEqual(rows[0]!.people.map(p => p.title), ['Sam']);
});

test('by thing and by person agree about what is in the room', () => {
  const s = st(...room(),
    mk('A', 'action', 'one'), link('A', 'PA', 'waiting-on'), link('A', 'PS', 'waiting-on'),
    mk('B', 'action', 'two'), link('B', 'PA', 'mentioned'),
    mk('C', 'action', 'not in the room'), 
  );
  const who = ['PA', 'PS'];
  const v = view(s, who);
  const rows = meetingByThing(s, who, heldNodes);
  assert.equal(rows.length, v.total, 'one lens cannot claim a different room than the other');
  assert.ok(!rows.some(r => r.node.id === 'C'));
});

test('by thing names only the attendees, and only the living', () => {
  const s = st(...room(),
    mk('A', 'action', 'x'),
    link('A', 'PA', 'waiting-on'), link('A', 'PO', 'stakeholder'),
    ev('node.trashed', 'PO', { at: NOW }),
  );
  const rows = meetingByThing(s, ['PA', 'PS', 'PO'], heldNodes);
  assert.deepEqual(rows[0]!.people.map(p => p.title), ['Ada'],
    'a let-go person neither groups nor labels');
});
