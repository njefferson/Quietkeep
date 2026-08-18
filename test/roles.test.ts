// Roles (2.6.0, ADR-0096) — identities that cross areas, as a cross-cutting link.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/fold.ts';
import { heldWork } from '../src/gate.ts';
import { allRoles, rolesOf, roleNames, roleLoads } from '../src/roles.ts';
import type { AppEvent } from '../src/events.ts';

let seq = 0;
const AT = '2026-08-17T09:00:00.000Z';
const ev = (kind: string, node: string | null, payload: unknown): AppEvent => ({
  id: `e${seq}`, vault: 'personal', at: AT, device: 'test', seq: seq++, kind, node, payload,
} as AppEvent);

const world = () => fold([
  ev('role.created', 'PARENT', { name: 'Parent' }),
  ev('role.created', 'PHOTO', { name: 'The photography' }),
  ev('node.created', 'a', { nodeKind: 'action', title: 'Book the school thing' }),
  ev('node.created', 'b', { nodeKind: 'action', title: 'Send the prints to be framed' }),
  ev('node.created', 'c', { nodeKind: 'action', title: 'Renew the insurance' }),
  ev('role.attached', 'a', { node: 'a', role: 'PARENT' }),
  ev('role.attached', 'b', { node: 'b', role: 'PHOTO' }),
  ev('role.attached', 'b', { node: 'b', role: 'PARENT' }),
]);

test('one piece of work can belong to more than one identity — a link, not a parent', () => {
  const s = world();
  assert.deepEqual(roleNames(s, s.nodes.get('b')!).sort(), ['Parent', 'The photography']);
  // And the tree is untouched by any of it. That is the whole reason this is a
  // link: an area holds work, and a role runs THROUGH areas (Q-13).
  assert.equal(s.nodes.get('b')!.parent, null);
});

test('attaching the same role twice does not duplicate it', () => {
  const s = fold([
    ev('role.created', 'R', { name: 'Parent' }),
    ev('node.created', 'a', { nodeKind: 'action', title: 'x' }),
    ev('role.attached', 'a', { node: 'a', role: 'R' }),
    ev('role.attached', 'a', { node: 'a', role: 'R' }),
  ]);
  assert.deepEqual(s.nodes.get('a')!.roles, ['R']);
});

test('detaching is scoped — taking one role off leaves the other alone', () => {
  const s = world();
  const s2 = fold([ev('role.detached', 'b', { node: 'b', role: 'PHOTO' })], world());
  assert.deepEqual(roleNames(s2, s2.nodes.get('b')!), ['Parent']);
  assert.equal(s.nodes.get('a')!.roles.length, 1, 'the other node is untouched');
});

test('a role that was let go stops appearing, with no migration', () => {
  const s = fold([ev('node.trashed', 'PARENT', { reason: 'test' })], world());
  assert.deepEqual(roleNames(s, s.nodes.get('b')!), ['The photography']);
  assert.deepEqual(allRoles(s).map(r => r.title), ['The photography']);
  // The id is still on the node — nothing rewrites history — and the projection
  // is what refuses to resolve it.
  assert.ok(s.nodes.get('b')!.roles.includes('PARENT'));
});

test('a role is never work — it cannot be offered and cannot be ticked off', () => {
  const s = world();
  const ids = [...heldWork(s)].map(n => n.id);
  assert.ok(!ids.includes('PARENT'), 'an identity is not in the todo list');
  assert.ok(!ids.includes('PHOTO'));
});

test('roles are listed by name, never by how much they carry', () => {
  const s = world();
  // Sorting by size would rank somebody's own identities against each other.
  assert.deepEqual(allRoles(s).map(r => r.title), ['Parent', 'The photography']);
});

test('the readout counts live work, and a thing in two roles counts under both', () => {
  const s = world();
  const { rows, unnamed } = roleLoads(s, heldWork);
  const by = new Map(rows.map(r => [r.role.title, r.held]));
  assert.equal(by.get('Parent'), 2, 'a and b');
  assert.equal(by.get('The photography'), 1, 'b');
  // No halves. The app has no idea how the effort split and will not invent it.
  assert.equal(unnamed, 1, 'the loose one is counted, and separately');
});

test('the unnamed remainder is separate — it is not an identity', () => {
  const s = world();
  const { rows, unnamed } = roleLoads(s, heldWork);
  assert.ok(!rows.some(r => r.role.title === ''), 'no blank row stands in for it');
  assert.equal(unnamed, 1);
  // It matters because on a real store it is the biggest number, and burying it
  // would make the named roles look like the whole of somebody's life.
});

test('a finished thing is not live work, so the readout does not count it', () => {
  const s = fold([ev('done.marked', 'a', { at: AT })], world());
  const by = new Map(roleLoads(s, heldWork).rows.map(r => [r.role.title, r.held]));
  // Counting finished things would make this a record of output, which is the
  // shape law 5 refuses.
  assert.equal(by.get('Parent'), 1, 'only b remains');
});

test('a role with nothing on it still gets a row, reading zero', () => {
  const s = fold([ev('role.created', 'EMPTY', { name: 'Volunteering' })], world());
  const by = new Map(roleLoads(s, heldWork).rows.map(r => [r.role.title, r.held]));
  // Absent would read as "you have no such role"; zero is the true answer and is
  // often the one worth seeing.
  assert.equal(by.get('Volunteering'), 0);
});

test('rolesOf resolves through state, so it never returns a ghost', () => {
  const s = fold([ev('node.trashed', 'PHOTO', { reason: 'test' })], world());
  assert.deepEqual(rolesOf(s, s.nodes.get('b')!).map(r => r.id), ['PARENT']);
});
