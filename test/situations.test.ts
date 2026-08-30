// A situation somebody NAMED (2.21.0, the plan's phase 5).
//
// *Where you are* and *how long you have* are two answers to one question, and
// answering it again every Tuesday is the small repeated cost this removes.
// Naming the pair makes a recurring meeting recurring **without the app ever
// mentioning it again**: saving one is a shortcut, never a schedule.
//
// The load-bearing properties: it is a state-level fact rather than a node, so
// law 1 never touches it; it survives a snapshot including one written before
// it existed; and nothing anywhere records how often it is used.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, emptyState, type State } from '../src/fold.ts';
import { admit } from '../src/gate.ts';
import { situationWords, whoWords } from '../src/situations.ts';
import { saveSituationEvents, forgetSituationEvents } from '../src/ui/detail-intents.ts';
import { serialiseState, deserialiseState } from '../src/snapshot.ts';
import type { AppEvent } from '../src/events.ts';
import { atMidnight } from '../src/time.ts';

const TZ = 'America/Denver';
const NOW = '2026-08-22T18:00:00.000Z';
let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at: NOW, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const ctx = {
  id: () => `x${seq++}`, vault: 'personal', at: NOW, device: 'd0',
  seq: () => seq++, zone: TZ, day: atMidnight(TZ),
};
const apply = (s: State, e: AppEvent[]): State => (e.length === 0 ? s : fold(admit(e, s), s));
const withPlace = (): State => fold([
  ev('node.created', 'OFF', { nodeKind: 'context', title: 'The office' }),
]);

test('a named situation holds a place, a length, or both', () => {
  let s = apply(withPlace(), saveSituationEvents(ctx, 'Tuesday standup', 'OFF', 15));
  s = apply(s, saveSituationEvents(ctx, 'Free weekend', null, 120));
  s = apply(s, saveSituationEvents(ctx, 'At the office', 'OFF', null));

  assert.equal(situationWords(s, s.situations.get('Tuesday standup')!), 'The office, 15 minutes');
  assert.equal(situationWords(s, s.situations.get('Free weekend')!), 'anywhere, 2h');
  assert.equal(situationWords(s, s.situations.get('At the office')!), 'The office, however long');
});

test('a blank name is refused, not stored', () => {
  // A situation nobody can pick out of a list is one nobody can forget either,
  // and it would sit there for ever.
  const s = apply(withPlace(), saveSituationEvents(ctx, '   ', 'OFF', 5));
  assert.equal(s.situations.size, 0);
});

test('saving under a name that exists REPLACES it — one name, one situation', () => {
  let s = apply(withPlace(), saveSituationEvents(ctx, 'Tuesday standup', 'OFF', 15));
  s = apply(s, saveSituationEvents(ctx, 'Tuesday standup', null, 30));
  assert.equal(s.situations.size, 1, 'not two rows with one name');
  assert.equal(situationWords(s, s.situations.get('Tuesday standup')!), 'anywhere, 30 minutes');
});

test('forgetting is scoped to one name, never a clear-all', () => {
  let s = apply(withPlace(), saveSituationEvents(ctx, 'Tuesday standup', 'OFF', 15));
  s = apply(s, saveSituationEvents(ctx, 'Free weekend', null, 120));

  s = apply(s, forgetSituationEvents(ctx, 'Tuesday standup'));
  assert.deepEqual([...s.situations.keys()], ['Free weekend']);

  s = apply(s, forgetSituationEvents(ctx, ''));
  assert.equal(s.situations.size, 1, 'forgetting nobody is a no-op, not a wipe');
});

test('a place that has been let go stops being named by the situations pointing at it', () => {
  // The resolution rule `contextsOf`, `withWhom` and `rolesOf` all follow, and
  // the one `portfolio.ts` was found not following. No migration, no stale name.
  let s = apply(withPlace(), saveSituationEvents(ctx, 'Tuesday standup', 'OFF', 15));
  assert.match(situationWords(s, s.situations.get('Tuesday standup')!), /The office/);

  s = apply(s, [ev('node.trashed', 'OFF', {})]);
  assert.equal(situationWords(s, s.situations.get('Tuesday standup')!), 'anywhere, 15 minutes',
    'the place stands down and the time it named still applies');
});

test('a situation naming nothing says so rather than rendering blank', () => {
  const s = apply(emptyState(), saveSituationEvents(ctx, 'Whenever', null, null));
  assert.equal(situationWords(s, s.situations.get('Whenever')!), 'nothing set');
});

test('it survives a snapshot, including one written before it existed', () => {
  // The three-place rule named in phase 1: clone, deserialise, and the
  // old-snapshot default. The compiler catches two of the three.
  let s = apply(withPlace(), saveSituationEvents(ctx, 'Tuesday standup', 'OFF', 15));
  const round = deserialiseState(JSON.parse(JSON.stringify(serialiseState(s))));
  assert.equal(situationWords(round, round.situations.get('Tuesday standup')!), 'The office, 15 minutes');

  const old = JSON.parse(JSON.stringify(serialiseState(s))) as Record<string, unknown>;
  delete old['situations'];
  assert.equal(deserialiseState(old).situations.size, 0,
    'a cut taken before this existed means none had been named');
});

test('NOTHING records how often a situation is used', () => {
  // A shortcut somebody made for themselves. A count of uses, a last-used or an
  // ordering by frequency would turn it into a record of their habits, which is
  // what law 7 keeps this app out of and what law 8 makes lapse-tolerant.
  const s = apply(withPlace(), saveSituationEvents(ctx, 'Tuesday standup', 'OFF', 15));
  const saved = s.situations.get('Tuesday standup')!;
  // AN EXACT LIST, and it stays exact. It grew by one in 3.15.0 — `people`, who
  // is in the room — and that is a third answer to "what situation is this",
  // beside where and how long. It is not a record of USE: nothing here counts,
  // dates or orders anything, and a `lastUsed` or a `count` added later still
  // fails this line. The value of the assertion is that widening the shape
  // cannot happen quietly, and it did not.
  assert.deepEqual(Object.keys(saved).sort(), ['context', 'minutes', 'people'],
    'the shape has nowhere to keep a usage record');
  assert.doesNotMatch(situationWords(s, saved), /used|last|times|often|ago/i);
});

test('it is a state-level fact and touches no node', () => {
  // Why it is not a kind: a node would drag in law 1, every kind list, and
  // every control that writes a kind — three of the four of which phase 2
  // measured as wrong.
  const before = withPlace();
  const s = apply(before, saveSituationEvents(ctx, 'Tuesday standup', 'OFF', 15));
  assert.equal(s.nodes.size, before.nodes.size, 'no node was created');
  for (const [id, n] of s.nodes) {
    assert.deepEqual(n, before.nodes.get(id), `${id} is untouched`);
  }
});


// --- who is in the room (3.15.0) -------------------------------------------
//
// The third answer beside where and how long, and the one that makes a MEETING
// nameable. A list, because a meeting has several people — which is exactly why
// it could not ride on `with.now`'s single-valued shape.

const withPeople = (): State => fold([
  ev('node.created', 'OFF', { nodeKind: 'context', title: 'The office' }),
  ev('node.created', 'P1', { nodeKind: 'person', title: 'Ada' }),
  ev('node.created', 'P2', { nodeKind: 'person', title: 'Sam' }),
  ev('node.created', 'P3', { nodeKind: 'person', title: 'Ola' }),
]);

test('a situation can name who is in the room', () => {
  const s = apply(withPeople(), saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P2', 'P1']));
  const saved = s.situations.get('Weekly sync')!;
  assert.deepEqual(saved.people, ['P1', 'P2'], 'stored deduped and in a stable order');
  assert.equal(situationWords(s, saved), 'The office, 1h, with Ada and Sam');
});

test('the same three people in a different order are the same situation', () => {
  const a = apply(withPeople(), saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P3', 'P1', 'P2']));
  const b = apply(withPeople(), saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P2', 'P3', 'P1', 'P2']));
  assert.deepEqual(a.situations.get('Weekly sync')!.people, b.situations.get('Weekly sync')!.people,
    'order and repeats are not information about a situation');
});

test('THE FOLD NORMALISES A LIST IT DID NOT WRITE — an event from another device', () => {
  // The version of this above goes through `saveSituationEvents`, which sorts
  // before it writes — so it passed with the fold's own sort deleted, and
  // asserted nothing about the fold at all. The fold's normalisation exists for
  // a log that arrived from somewhere else, and that is the only way to reach
  // it: a raw event, unsorted, with a repeat and a non-string in the list.
  const s = apply(withPeople(), [ev('situation.saved', null, {
    name: 'Weekly sync', context: 'OFF', minutes: 60,
    people: ['P3', 'P1', 'P2', 'P1', 7, '', null],
  })]);
  assert.deepEqual(s.situations.get('Weekly sync')!.people, ['P1', 'P2', 'P3'],
    'deduped, sorted, and nothing that is not an id');
  // PLANT: deleting the fold's `.sort()` goes red here. Without it two devices
  // that named one meeting hold two different situations, and every comparison
  // of a situation to itself compares the order somebody happened to click in.
  // PLANT: dropping the string filter goes red here too — a bad id resolves to
  // nobody on every read, which looks exactly like a person who was let go.
});

test('saving over a name replaces the people WHOLE, so somebody can be taken out', () => {
  let s = apply(withPeople(), saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P1', 'P2', 'P3']));
  s = apply(s, saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P1', 'P2']));
  assert.deepEqual(s.situations.get('Weekly sync')!.people, ['P1', 'P2'],
    'a save that merged the old set with the new would make removal impossible');
});

test('a person who was let go stops being named, with no migration', () => {
  let s = apply(withPeople(), saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P1', 'P2']));
  assert.equal(situationWords(s, s.situations.get('Weekly sync')!), 'The office, 1h, with Ada and Sam');
  s = apply(s, [ev('node.released', 'P1', { at: NOW })]);
  assert.equal(situationWords(s, s.situations.get('Weekly sync')!), 'The office, 1h, with Sam',
    '`personName` resolves through state, which is why this is not a lookup written here');
  // PLANT: reading `state.nodes.get(id).title` directly instead of through
  // `personName` goes red here — the exact defect portfolio.ts carried, where a
  // tracked project went on naming somebody who had been let go.
});

test('a situation naming only people is legal and says so', () => {
  const s = apply(withPeople(), saveSituationEvents(ctx, 'Standup', null, null, ['P2']));
  assert.equal(situationWords(s, s.situations.get('Standup')!), 'with Sam',
    'no "however long" padding — "with Sam" is already a complete sentence');
});

test('a situation with a place and people does not pad with "however long"', () => {
  const s = apply(withPeople(), saveSituationEvents(ctx, 'Corridor', 'OFF', null, ['P2']));
  assert.equal(situationWords(s, s.situations.get('Corridor')!), 'The office, with Sam');
  // PLANT: making `however long` unconditional on a missing length goes red
  // here and nowhere else. The two special cases exist so a half-set situation
  // does not read as truncated, and neither applies once anybody is named.
});

test('a length and people with no place still opens on the place', () => {
  const s = apply(withPeople(), saveSituationEvents(ctx, 'Call', null, 30, ['P2']));
  assert.equal(situationWords(s, s.situations.get('Call')!), 'anywhere, 30 minutes, with Sam');
});

test('names, then a count — a row that grows without bound stops being a row', () => {
  const s = withPeople();
  assert.equal(whoWords(s, []), null, 'nobody is not an absence to report');
  assert.equal(whoWords(s, ['P1']), 'with Ada');
  assert.equal(whoWords(s, ['P1', 'P2']), 'with Ada and Sam');
  assert.equal(whoWords(s, ['P1', 'P2', 'P3']), 'with Ada, Ola and 1 other');
  // It is NOT `stakeholderWords`, which ends "care how it goes" — a claim about
  // the people. This says only that they are expected to be there.
  assert.doesNotMatch(whoWords(s, ['P1', 'P2'])!, /care|owe|waiting|should/i);
});

test('a list of people who have all been let go reads as nobody, not as broken', () => {
  let s = apply(withPeople(), saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P1', 'P2']));
  s = apply(s, [ev('node.released', 'P1', { at: NOW }), ev('node.released', 'P2', { at: NOW })]);
  assert.equal(situationWords(s, s.situations.get('Weekly sync')!), 'The office, 1h',
    'the same fact to a reader: nobody this situation names is still here');
});

test('people survive a snapshot, and a cut taken before they existed reads empty', () => {
  const s = apply(withPeople(), saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P1', 'P2']));
  const back = deserialiseState(JSON.parse(JSON.stringify(serialiseState(s))));
  assert.deepEqual(back.situations.get('Weekly sync')!.people, ['P1', 'P2']);

  const old = JSON.parse(JSON.stringify(serialiseState(s))) as Record<string, unknown>;
  for (const row of old['situations'] as Record<string, unknown>[]) delete row['people'];
  assert.deepEqual(deserialiseState(old).situations.get('Weekly sync')!.people, [],
    'additive-only: a cut from before this reads as nobody named, never as undefined');
});

test('the serialised record does not alias the folded state', () => {
  const s = apply(withPeople(), saveSituationEvents(ctx, 'Weekly sync', 'OFF', 60, ['P1', 'P2']));
  const rec = serialiseState(s);
  const row = (rec as unknown as { situations: { name: string; people: string[] }[] })
    .situations.find(x => x.name === 'Weekly sync')!;
  row.people.push('P3');
  assert.deepEqual(s.situations.get('Weekly sync')!.people, ['P1', 'P2'],
    'a write through the snapshot must not reach the state it was taken from');
});
