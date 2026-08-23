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
import { situationWords } from '../src/situations.ts';
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
  assert.deepEqual(Object.keys(saved).sort(), ['context', 'minutes'],
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
