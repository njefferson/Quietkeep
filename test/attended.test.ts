// The last act under a role, and the order it gives (3.28.0, src/attended.ts).
//
// The rule is stated once in docs/decisions/roles-review-2026-11.md section 4.
// These tests pin it from events through the fold, the way `test/reading.test.ts`
// does. The test's own liveness is simple: a node is live when it has no
// `lastDone`. Every date is written relative to one fixed `NOW`.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fold as foldEvents, type State } from '../src/fold.ts';
import {
  attendedOrder, rolesCarryingLive, attendedWords, ATTENDED_KINDS, type Attended,
} from '../src/attended.ts';
import { EVENT_KINDS, type AppEvent } from '../src/events.ts';

const NOW = '2026-11-03T12:00:00.000Z';
const ZONE = 'UTC';
const DAY = 86_400_000;
const ago = (days: number, hour = 12): string => {
  const base = new Date(Date.parse(NOW) - days * DAY);
  base.setUTCHours(hour, 0, 0, 0);
  return base.toISOString();
};

let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown, at: string): AppEvent =>
  ({ id: `a${seq}`, vault: 'personal', at, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);

const live = (n: { lastDone?: unknown }): boolean => !n.lastDone;

const role = (id: string, title: string, at = ago(60)): AppEvent => ev('role.created', id, { name: title }, at);
const made = (id: string, at = ago(50), parent?: string, kind = 'action'): AppEvent =>
  ev('node.created', id, { nodeKind: kind, title: id, ...(parent ? { parent } : {}) }, at);
const attach = (nodeId: string, roleId: string, at: string): AppEvent =>
  ev('role.attached', nodeId, { node: nodeId, role: roleId }, at);
const done = (id: string, at: string): AppEvent => ev('done.marked', id, { at }, at);
const field = (id: string, at: string): AppEvent => ev('node.field.set', id, { field: 'notes', value: 'x' }, at);

const order = (events: AppEvent[]): Attended[] => {
  const state: State = foldEvents(events);
  return attendedOrder(state, events, NOW, ZONE, live);
};
const titles = (rows: Attended[]): string[] => rows.map(r => r.role.title);

test('a role with one act under a thing that carries it is dated by that act', () => {
  const rows = order([role('R', 'Parent'), made('A'), attach('A', 'R', ago(20)), field('A', ago(4))]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.lastActAt, ago(4));
  assert.equal(rows[0]!.days, 4);
});

test('a done mark on a child of a tagged project dates the role', () => {
  const rows = order([
    role('R', 'Home'), made('P', ago(50), undefined, 'project'), attach('P', 'R', ago(40)),
    made('C', ago(45), 'P'), made('D', ago(45), 'P'), done('C', ago(6)),
  ]);
  assert.equal(rows.length, 1, 'the project has a live child, so the role is carrying live work');
  assert.equal(rows[0]!.days, 6);
});

test('two roles are ordered by their last act, the older first', () => {
  const rows = order([
    role('R1', 'Recent'), role('R2', 'Stale'),
    made('A'), made('B'),
    attach('A', 'R1', ago(30)), attach('B', 'R2', ago(30)),
    field('A', ago(1)), field('B', ago(9)),
  ]);
  assert.deepEqual(titles(rows), ['Stale', 'Recent']);
  assert.deepEqual(rows.map(r => r.days), [9, 1]);
});

test('the writing of the link is itself an act', () => {
  const rows = order([role('R', 'Fresh'), made('A', ago(50)), attach('A', 'R', ago(0))]);
  assert.equal(rows[0]!.days, 0);
  assert.equal(attendedWords(rows[0]!), 'something was done under it today');
});

test('a role carrying nothing live is left out of the order', () => {
  const events = [role('R', 'Spent'), made('A'), attach('A', 'R', ago(20)), done('A', ago(3))];
  assert.deepEqual(order(events), []);
  assert.deepEqual(rolesCarryingLive(foldEvents(events), live), []);
});

test('a role with no carrier is left out', () => {
  assert.deepEqual(order([role('R', 'Unused'), made('A')]), []);
});

test('the newest of several acts wins, across a done mark, a timed doing and a field change', () => {
  const rows = order([
    role('R', 'Mixed'), made('P', ago(50), undefined, 'project'), attach('P', 'R', ago(40)),
    made('C', ago(45), 'P'), made('D', ago(45), 'P'),
    done('C', ago(12)),
    ev('do-now.timed', 'D', { startedAt: ago(7, 9), endedAt: ago(7, 10) }, ago(7, 10)),
    field('P', ago(10)),
  ]);
  assert.equal(rows[0]!.lastActAt, ago(7, 10));
  assert.equal(rows[0]!.days, 7);
});

test('a timed doing is dated by the event, never by when it ended', () => {
  const rows = order([
    role('R', 'Timed'), made('A'), attach('A', 'R', ago(30)),
    ev('do-now.timed', 'A', { startedAt: ago(5, 9), endedAt: ago(0, 9) }, ago(5, 10)),
  ]);
  assert.equal(rows[0]!.days, 5);
});

test('a tie on whole days breaks by name, then by id', () => {
  const tied = order([
    role('R1', 'Beta'), role('R2', 'Alpha'), made('A'), made('B'),
    attach('A', 'R1', ago(5, 8)), attach('B', 'R2', ago(5, 20)),
  ]);
  assert.deepEqual(titles(tied), ['Alpha', 'Beta'], 'different hours of one day tie and fall to name');
  const same = order([
    role('R9', 'Same'), role('R3', 'Same'), made('A'), made('B'),
    attach('A', 'R9', ago(5)), attach('B', 'R3', ago(5)),
  ]);
  assert.deepEqual(same.map(r => r.role.id), ['R3', 'R9']);
});

test('the day is the reader\'s day: an act at two with a boundary at three is the day before', () => {
  const act = '2026-11-02T02:00:00.000Z';
  const base = [role('R', 'Night'), made('A'), attach('A', 'R', '2026-10-01T12:00:00.000Z'), field('A', act)];
  assert.equal(order(base)[0]!.days, 1, 'with midnight the act is on the 2nd, one day back');
  const withBoundary = [...base, ev('day.boundary.set', null, { hour: 3 }, '2026-10-02T12:00:00.000Z')];
  assert.equal(order(withBoundary)[0]!.days, 2, 'with a boundary at three it belongs to the 1st');
});

test('a thing carrying two roles counts for both', () => {
  const rows = order([
    role('R1', 'One'), role('R2', 'Two'), made('A'),
    attach('A', 'R1', ago(20)), attach('A', 'R2', ago(20)), field('A', ago(3)),
  ]);
  assert.deepEqual(rows.map(r => r.days), [3, 3]);
  assert.deepEqual(titles(rows), ['One', 'Two']);
});

test('a finished descendant\'s earlier act still counts, and its trashing does not', () => {
  const rows = order([
    role('R', 'Kept'), made('P', ago(50), undefined, 'project'), attach('P', 'R', ago(40)),
    made('C', ago(45), 'P'), made('D', ago(45), 'P'),
    done('C', ago(8)),
    ev('node.trashed', 'C', {}, ago(0)),
  ]);
  assert.equal(rows[0]!.days, 8);
});

test('events that are not acts leave the last act where it was', () => {
  const rows = order([
    role('R', 'Quiet'), made('A'), attach('A', 'R', ago(15)),
    ev('clock.set', 'A', { clockKind: 'due', at: ago(-5), source: 'gate:node.created' }, ago(0)),
    ev('heat.set', 'A', { heat: 'warm' }, ago(0)),
    ev('replan.resolved', 'A', { choice: 'compress' }, ago(0)),
  ]);
  assert.equal(rows[0]!.days, 15);
});

test('an import-stamped creation and a sample capture are not acts', () => {
  const rows = order([
    role('R', 'Imported'), made('P', ago(50), undefined, 'project'), attach('P', 'R', ago(20)),
    ev('node.created', 'I', { nodeKind: 'action', title: 'I', parent: 'P', arrival: 'import-batch' }, ago(0)),
    ev('capture.recorded', 'S', { text: 'S', source: 'sample' }, ago(0)),
    ev('node.parented', 'S', { parent: 'P' }, ago(20)),
  ]);
  assert.equal(rows[0]!.days, 20);
});

test('an event with an invalid time is skipped, never the newest or the oldest', () => {
  const rows = order([
    role('R', 'Broken'), made('A'), attach('A', 'R', ago(12)),
    ev('node.field.set', 'A', { field: 'notes', value: 'x' }, 'not a date'),
  ]);
  assert.equal(rows[0]!.days, 12);
});

test('an act on the role node itself does not date it', () => {
  const rows = order([
    role('R', 'Named'), made('A'), attach('A', 'R', ago(14)),
    ev('node.renamed', 'R', { title: 'Renamed' }, ago(0)),
  ]);
  assert.equal(rows[0]!.days, 14);
});

test('a future time reads as zero days', () => {
  const rows = order([role('R', 'Skewed'), made('A'), attach('A', 'R', ago(20)), field('A', ago(-3))]);
  assert.equal(rows[0]!.days, 0);
});

test('a role with live work and no usable act is first, with no span', () => {
  const rows = order([
    role('R1', 'Dated'), role('R2', 'Blank'), made('A'), made('B', 'not a date'),
    attach('A', 'R1', ago(30)), attach('B', 'R2', 'not a date'),
  ]);
  assert.equal(rows[0]!.role.title, 'Blank');
  assert.equal(rows[0]!.days, null);
  assert.equal(rows[0]!.lastActAt, null);
  assert.equal(attendedWords(rows[0]!), 'nothing is on record under it');
});

test('the empty store gives no rows and no error', () => {
  assert.deepEqual(order([]), []);
});

test('one role carrying live work is returned by both readers, the same one', () => {
  const events = [role('R', 'Only'), made('A'), attach('A', 'R', ago(2))];
  const state = foldEvents(events);
  const withLog = attendedOrder(state, events, NOW, ZONE, live);
  const without = rolesCarryingLive(state, live);
  assert.equal(withLog.length, 1);
  assert.deepEqual(without.map(r => r.id), withLog.map(r => r.role.id));
});

test('the counted kinds are exactly the record\'s list, and each is a real event kind', () => {
  assert.deepEqual([...ATTENDED_KINDS].sort(), [
    'capture.recorded', 'clarify.routed', 'do-now.timed', 'done.marked', 'done.unmarked',
    'focus.started', 'node.created', 'node.field.set', 'node.parented', 'node.renamed',
    'role.attached',
  ]);
  const known = new Set<string>(EVENT_KINDS);
  for (const k of ATTENDED_KINDS) assert.ok(known.has(k), `${k} is in the event vocabulary`);
});

test('the words are facts, say 1 day never 1 days, and carry no refused word', () => {
  const row = (days: number | null): Attended =>
    ({ role: { title: 'R', id: 'R' } as never, lastActAt: null, days });
  assert.equal(attendedWords(row(0)), 'something was done under it today');
  assert.equal(attendedWords(row(1)), 'something was done under it yesterday');
  assert.equal(attendedWords(row(2)), 'something was done under it 2 days ago');
  assert.equal(attendedWords(row(40)), 'something was done under it 40 days ago');
  assert.equal(attendedWords(row(null)), 'nothing is on record under it');
  const refused = ['late', 'overdue', 'missed', 'fail', 'behind', 'neglect', 'ignored', 'forgotten',
    'streak', 'score', 'rank', 'percent'];
  for (const d of [0, 1, 2, 9, 40, null]) {
    const w = attendedWords(row(d));
    assert.doesNotMatch(w, /\b1 days\b/);
    for (const word of refused) assert.doesNotMatch(w, new RegExp(word, 'i'), `"${w}" avoids ${word}`);
  }
});
