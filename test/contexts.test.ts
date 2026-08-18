// Contexts (2.2.0, ADR-0092) — the axis the app did not have.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/fold.ts';
import { allContexts, contextsOf, fitsHere, contextNames } from '../src/contexts.ts';
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
