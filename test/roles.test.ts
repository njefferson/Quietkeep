// Roles (2.6.0, ADR-0096) — identities that cross areas, as a cross-cutting link.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/fold.ts';
import { heldWork } from '../src/gate.ts';
import {
  allRoles, rolesOf, roleNames, roleLoads,
  roleAttention, roleAttentionWords, roleAttentionRowWords,
  lineView, lineViewWords,
} from '../src/roles.ts';
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


// ——— WHERE THE ATTENTION ACTUALLY WENT (2.24.0, the plan's phase 5 item) ———
//
// Load is what a role is CARRYING; attention is what it was GIVEN. The whole
// reason this is legal under law 5 is that it reads timings and never
// completions, and the whole reason it is USEFUL is that it does not drop the
// work you finished. Both halves are asserted, because either one alone turns
// it back into one of the two functions it is not.

const timed = (node: string, mins: number, n = 1) =>
  Array.from({ length: n }, () => ev('do-now.timed', node, {
    startedAt: '2026-08-17T09:00:00.000Z',
    endedAt: new Date(Date.parse('2026-08-17T09:00:00.000Z') + mins * 60_000).toISOString(),
  }));

test('attention is time given, and it counts the work you FINISHED', () => {
  // The distinction roleLoads cannot make. An hour spent on something you
  // finished is an hour of your attention; dropping it would answer "what is
  // still open", which is the other function in this file.
  const s = fold([
    ...timed('a', 40),
    ev('done.marked', 'a', { at: AT }),
  ], world());
  const by = new Map(roleAttention(s, heldWork).rows.map(r => [r.role.title, r.minutes]));
  assert.equal(by.get('Parent'), 40, 'finished work still counts as attention given');
  // And the load readout must still refuse it, or the two have collapsed.
  const load = new Map(roleLoads(s, heldWork).rows.map(r => [r.role.title, r.held]));
  assert.equal(load.get('Parent'), 1, 'load drops the finished one; only b remains');
});

test('attention is built on timings and NOT on completions', () => {
  // Finish everything and time nothing: a record of output would light up here.
  const s = fold([
    ev('done.marked', 'a', { at: AT }),
    ev('done.marked', 'b', { at: AT }),
  ], world());
  const { rows, totalSessions } = roleAttention(s, heldWork);
  assert.equal(totalSessions, 0, 'ticking things off is not attention');
  assert.ok(rows.every(r => r.minutes === 0 && r.sessions === 0));
});

test('a thing in two roles gives its time to both, and no halves are invented', () => {
  const s = fold(timed('b', 30), world());
  const by = new Map(roleAttention(s, heldWork).rows.map(r => [r.role.title, r.minutes]));
  assert.equal(by.get('Parent'), 30);
  assert.equal(by.get('The photography'), 30);
  // The app has no idea how thirty minutes split between two identities, and
  // 15/15 would be arithmetic pretending to be knowledge.
});

test('runs are carried separately, because they change what the total means', () => {
  const one = fold(timed('a', 90), world());
  const many = fold(timed('a', 10, 9), world());
  const r1 = roleAttention(one, heldWork).rows.find(r => r.role.title === 'Parent')!;
  const r9 = roleAttention(many, heldWork).rows.find(r => r.role.title === 'Parent')!;
  assert.equal(r1.minutes, 90);
  assert.equal(r9.minutes, 90);
  assert.notEqual(r1.sessions, r9.sessions);
  // 90 minutes at once and 90 across nine sittings are different facts about a
  // life, and a surface showing only the total would assert they are the same.
  assert.match(roleAttentionRowWords(r1), /one go/);
  assert.match(roleAttentionRowWords(r9), /9 runs/);
});

test('time on unnamed work is stated, never folded into the named roles', () => {
  const s = fold(timed('c', 25), world());   // c has no role
  const { rows, unnamed } = roleAttention(s, heldWork);
  assert.equal(unnamed, 25);
  assert.ok(rows.every(r => r.minutes === 0), 'it did not leak into an identity');
  assert.match(roleAttentionWords(1, unnamed), /no named role/);
});

test('rows stay in name order, never in order of how much time each got', () => {
  // THE DATA HAS TO MAKE THE TWO ORDERS DIFFERENT, and the first version of
  // this test did not. It gave Parent 95 minutes and The photography 90, so
  // name order and size order were the SAME LIST — a sort by size was planted
  // and the assertion passed. A check whose passing branch does not depend on
  // the thing it is checking measures nothing (hub LESSONS 100).
  //
  // 'Parent' sorts before 'The photography', so the photography must have MORE
  // time for the two orders to disagree. `c` carries no role in `world()`, so
  // it gets one here.
  const s = fold([
    ev('role.attached', 'c', { node: 'c', role: 'PHOTO' }),
    ...timed('c', 120),
    ...timed('a', 5),
  ], world());
  const rows = roleAttention(s, heldWork).rows;
  const by = new Map(rows.map(r => [r.role.title, r.minutes]));
  assert.equal(by.get('Parent'), 5);
  assert.equal(by.get('The photography'), 120, 'the later name has the larger number');
  assert.deepEqual(rows.map(r => r.role.title), ['Parent', 'The photography'],
    'sorted by name — a sort by size would put the photography first');
  // Ordering somebody's own identities by how much each got is a ranking of
  // their life, and the app does not get to make it.
});

test('with no timer ever run, it says what would fill it rather than going blank', () => {
  const s = world();
  const { totalSessions, rows } = roleAttention(s, heldWork);
  assert.equal(totalSessions, 0);
  const w = roleAttentionWords(totalSessions);
  assert.match(w, /timer/, 'it names the thing that fills it');
  assert.match(w, /not filled in from what you finish/, 'and rules out the wrong guess');
  // A surface that renders empty teaches the reader the feature is broken —
  // the `serves.ts` failure with a different noun.
  assert.ok(rows.length > 0, 'the roles are still listed, with nothing claimed about them');
  // AND NO SENTENCE ABOUT NOTHING. With no runs at all, "every timed run
  // belongs to one of these" would be a claim about an empty set. It used to be
  // a separate paragraph that hid itself, which made it a registry entry the
  // a11y walk could not see — the gate said "matches nothing visible" on the
  // first run. It is one always-rendered sentence now.
  assert.ok(!/Every timed run|no named role/.test(w),
    'the remainder clause is absent when there is nothing to attribute');
  // Matched on the CLAUSE, not on "belongs to" — the empty words legitimately
  // say "whichever of these it belongs to", and the first version of this
  // assertion caught that and called it a defect.
});

test('the words never claim to be the whole of somebody attention', () => {
  const w = roleAttentionWords(3, 0);
  assert.match(w, /sample/, 'only timed work is in it, and it says so');
  assert.match(w, /not a target/, 'law 7 — the app plots, the human interprets');
  assert.ok(!/balanced|should|behind|too much|not enough/i.test(w),
    'no verdict, no target, nothing implying a right answer');
});

test('no row is a bare number — a figure beside a name reads as a score', () => {
  const s = fold(timed('a', 45), world());
  for (const r of roleAttention(s, heldWork).rows) {
    const words = roleAttentionRowWords(r);
    assert.ok(!/^\d+$/.test(words.trim()), `"${words}" is a bare figure`);
  }
});


// ── Standing on the line (3.12.0, ADR-0115) ─────────────────────────────────
//
// Every link this app has was traversed forward only, from a task outward. A
// repo-wide search for `roles.includes` returned one hit — the fold's own
// dedupe — so nothing could answer "what is on this line".

const crossing = () => fold([
  ev('role.created', 'MANNING', { name: 'Manning' }),
  ev('role.created', 'EMPTY', { name: 'Nothing doing' }),
  // Two horizons, so the line demonstrably crosses the tree rather than
  // sitting under one branch of it.
  ev('node.created', 'G', { nodeKind: 'goal', title: 'A steady shop' }),
  ev('node.created', 'A', { nodeKind: 'area', title: 'The print room' }),
  ev('node.created', 'w1', { nodeKind: 'action', title: 'Advertise the post', parent: 'G' }),
  ev('node.created', 'w2', { nodeKind: 'action', title: 'Brief the national provider', parent: 'A' }),
  ev('node.created', 'w3', { nodeKind: 'action', title: 'Nothing to do with manning' }),
  ev('role.attached', 'w1', { node: 'w1', role: 'MANNING' }),
  ev('role.attached', 'w2', { node: 'w2', role: 'MANNING' }),
]);

test('standing on a line shows the work on it, and nothing that is not', () => {
  const v = lineView(crossing(), 'MANNING', heldWork);
  assert.ok(v);
  assert.deepEqual(v.work.map(n => n.title),
    ['Advertise the post', 'Brief the national provider'],
    'by title, never by size or pressure — this is a view you read, not a worklist');
});

test('and it names the parts of the tree the line runs through', () => {
  const v = lineView(crossing(), 'MANNING', heldWork);
  assert.ok(v);
  assert.deepEqual(v.crosses.map(n => n.title).sort(), ['A steady shop', 'The print room'],
    'the line crosses the tree — which is the whole reason it cannot be a container');
});

test('an empty line says so, because that is the answer somebody came for', () => {
  const v = lineView(crossing(), 'EMPTY', heldWork);
  assert.ok(v);
  assert.deepEqual(v.work, []);
  assert.match(lineViewWords(v), /Nothing is on this line/,
    'nothing is moving there, and a view that hid would leave the question unanswerable');
});

test('finished work is not on the line — this is not a record of output', () => {
  let s = crossing();
  s = fold([ev('done.marked', 'w1', { at: AT })], s);
  const v = lineView(s, 'MANNING', heldWork);
  assert.ok(v);
  assert.deepEqual(v.work.map(n => n.title), ['Brief the national provider'],
    'the same rule roleLoads follows — counting what was finished is the shape law 5 refuses');
});

test('a line nobody named does not exist, and asking for one is null rather than empty', () => {
  assert.equal(lineView(crossing(), 'NO-SUCH-ROLE', heldWork), null);
});
