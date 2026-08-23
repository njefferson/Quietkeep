// Contexts (2.2.0, ADR-0092) — the axis the app did not have.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/fold.ts';
import { allContexts, contextsOf, fitsHere, contextNames, placesReaching } from '../src/contexts.ts';
import type { AppEvent } from '../src/events.ts';

const AT = '2026-08-17T09:00:00.000Z';
let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent => ({
  id: `e${seq}`, vault: 'personal', at: AT, device: 'test', seq: seq++, kind, node, payload,
} as AppEvent);

const world = () => fold([
  ev('context.created', 'home', { name: 'At home' }),
  ev('context.created', 'work', { name: 'At work' }),
  ev('node.created', 'a', { kind: 'action', title: 'Hang the curtains' }),
  ev('node.created', 'b', { kind: 'action', title: 'Ring the supplier' }),
  ev('node.created', 'c', { kind: 'action', title: 'Anything, anywhere' }),
  ev('context.attached', 'a', { node: 'a', context: 'home' }),
  ev('context.attached', 'b', { node: 'b', context: 'work' }),
  ev('context.attached', 'b', { node: 'b', context: 'home' }),
]);

test('a thing can be doable in more than one place — it is a link, not a parent', () => {
  const s = world();
  assert.deepEqual(contextNames(s, s.nodes.get('b')!).sort(), ['At home', 'At work']);
  // and its parent is untouched by any of it
  assert.equal(s.nodes.get('b')!.parent, null);
});

test('attaching the same context twice does not duplicate it', () => {
  const s = fold([
    ev('context.created', 'home', { name: 'At home' }),
    ev('node.created', 'a', { kind: 'action', title: 'x' }),
    ev('context.attached', 'a', { node: 'a', context: 'home' }),
    ev('context.attached', 'a', { node: 'a', context: 'home' }),
  ]);
  assert.equal(s.nodes.get('a')!.contexts.length, 1);
});

test('detaching is scoped — taking one place off leaves the others', () => {
  const s = fold([
    ev('context.created', 'home', { name: 'At home' }),
    ev('context.created', 'work', { name: 'At work' }),
    ev('node.created', 'b', { kind: 'action', title: 'x' }),
    ev('context.attached', 'b', { node: 'b', context: 'home' }),
    ev('context.attached', 'b', { node: 'b', context: 'work' }),
    ev('context.detached', 'b', { node: 'b', context: 'work' }),
  ]);
  assert.deepEqual(contextNames(s, s.nodes.get('b')!), ['At home']);
});

test('UNLABELLED FITS ANYWHERE — the filter is never a cliff', () => {
  const s = world();
  const c = s.nodes.get('c')!;
  assert.equal(fitsHere(s, c, 'home'), true);
  assert.equal(fitsHere(s, c, 'work'), true);
  assert.equal(fitsHere(s, c, null), true);
});

test('a labelled thing fits its own places and not the others', () => {
  const s = world();
  assert.equal(fitsHere(s, s.nodes.get('a')!, 'home'), true);
  assert.equal(fitsHere(s, s.nodes.get('a')!, 'work'), false);
  assert.equal(fitsHere(s, s.nodes.get('b')!, 'work'), true);
});

test('the filter off shows everything', () => {
  const s = world();
  for (const id of ['a', 'b', 'c']) {
    assert.equal(fitsHere(s, s.nodes.get(id)!, null), true);
  }
});

test('a trashed context stops appearing without any migration', () => {
  const s = fold([
    ev('context.created', 'home', { name: 'At home' }),
    ev('node.created', 'a', { kind: 'action', title: 'x' }),
    ev('context.attached', 'a', { node: 'a', context: 'home' }),
    ev('node.trashed', 'home', {}),
  ]);
  assert.deepEqual(contextNames(s, s.nodes.get('a')!), []);
  assert.equal(allContexts(s).length, 0);
  // and the thing is now unlabelled, so it fits anywhere rather than vanishing
  assert.equal(fitsHere(s, s.nodes.get('a')!, 'anything'), true);
});

test('contexts are listed in a stable order, by name', () => {
  const s = fold([
    ev('context.created', 'z', { name: 'Out and about' }),
    ev('context.created', 'a', { name: 'At home' }),
    ev('context.created', 'm', { name: 'On the phone' }),
  ]);
  assert.deepEqual(allContexts(s).map(c => c.title), ['At home', 'On the phone', 'Out and about']);
});

// ——— A PLACE REACHES WHAT IS UNDER IT (2.27.0) ———
//
// ADR-0013 is the argument: higher levels project lineage and health DOWNWARD
// into the runway, and every higher-level node must have a downward projection
// defined. Place is the one property that never had one — `gate.ts` already
// treats "parented to something under a clock" as satisfying law 1, so a parent
// conferred return on its children and nothing else.

test('a place on a project reaches the work inside it', () => {
  const s = fold([
    ev('context.created', 'WORK', { name: 'At work' }),
    ev('node.created', 'proj', { nodeKind: 'project', title: 'The migration' }),
    ev('node.created', 'task', { nodeKind: 'action', title: 'ring the vendor' }),
    ev('node.parented', 'task', { node: 'task', parent: 'proj' }),
    ev('context.attached', 'proj', { node: 'proj', context: 'WORK' }),
  ]);
  const task = s.nodes.get('task')!;
  assert.equal(fitsHere(s, task, 'WORK'), true, 'one statement on the project reaches the action');
  // And the item itself still says only what it was told, so the sheet never
  // displays a place nobody set on it.
  assert.deepEqual(contextsOf(s, task).map(c => c.title), []);
  assert.deepEqual(placesReaching(s, task).map(c => c.title), ['At work']);
});

test('it reaches through more than one level', () => {
  const s = fold([
    ev('context.created', 'WORK', { name: 'At work' }),
    ev('node.created', 'goal', { nodeKind: 'goal', title: 'the job' }),
    ev('node.created', 'proj', { nodeKind: 'project', title: 'the migration' }),
    ev('node.created', 'task', { nodeKind: 'action', title: 'ring the vendor' }),
    ev('node.parented', 'proj', { node: 'proj', parent: 'goal' }),
    ev('node.parented', 'task', { node: 'task', parent: 'proj' }),
    ev('context.attached', 'goal', { node: 'goal', context: 'WORK' }),
  ]);
  assert.equal(fitsHere(s, s.nodes.get('task')!, 'WORK'), true);
});

test('a thing keeps its own places as well as the ones it inherits', () => {
  // Additive, never overriding. An override rule would mean a place set on an
  // item silently cancelled the one it inherits, which is a rule nobody can see
  // working.
  const s = fold([
    ev('context.created', 'WORK', { name: 'At work' }),
    ev('context.created', 'HOME', { name: 'At home' }),
    ev('node.created', 'proj', { nodeKind: 'project', title: 'p' }),
    ev('node.created', 'task', { nodeKind: 'action', title: 't' }),
    ev('node.parented', 'task', { node: 'task', parent: 'proj' }),
    ev('context.attached', 'proj', { node: 'proj', context: 'WORK' }),
    ev('context.attached', 'task', { node: 'task', context: 'HOME' }),
  ]);
  const t = s.nodes.get('task')!;
  assert.equal(fitsHere(s, t, 'WORK'), true, 'inherited');
  assert.equal(fitsHere(s, t, 'HOME'), true, 'and its own');
});

test('inheritance narrows NOTHING on a store with no places', () => {
  // The load-bearing default survives the change: a thing reached by no place at
  // all, its own or its ancestors', still fits every answer. If this ever fails,
  // the cold-start store has been given a cliff.
  const s = fold([
    ev('context.created', 'WORK', { name: 'At work' }),
    ev('node.created', 'proj', { nodeKind: 'project', title: 'p' }),
    ev('node.created', 'task', { nodeKind: 'action', title: 't' }),
    ev('node.parented', 'task', { node: 'task', parent: 'proj' }),
  ]);
  assert.equal(fitsHere(s, s.nodes.get('task')!, 'WORK'), true);
  assert.deepEqual(placesReaching(s, s.nodes.get('task')!), []);
});

test('a place trashed on an ancestor stops reaching, without a migration', () => {
  const base = fold([
    ev('context.created', 'WORK', { name: 'At work' }),
    ev('context.created', 'HOME', { name: 'At home' }),
    ev('node.created', 'proj', { nodeKind: 'project', title: 'p' }),
    ev('node.created', 'task', { nodeKind: 'action', title: 't' }),
    ev('node.parented', 'task', { node: 'task', parent: 'proj' }),
    ev('context.attached', 'proj', { node: 'proj', context: 'WORK' }),
  ]);
  assert.equal(fitsHere(base, base.nodes.get('task')!, 'HOME'), false);
  const gone = fold([ev('node.trashed', 'WORK', { at: AT })], base);
  // With its only reaching place dead the thing reverts to fitting everything,
  // rather than to fitting nothing — `contextsOf`'s rule, one level up.
  assert.equal(fitsHere(gone, gone.nodes.get('task')!, 'HOME'), true);
});
