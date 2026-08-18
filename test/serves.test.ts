// What a thing is for (2.5.0, ADR-0095) — law 4's downward half.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/fold.ts';
import { servesNode, servesWords } from '../src/serves.ts';
import type { AppEvent } from '../src/events.ts';

let seq = 0;
const AT = '2026-08-17T09:00:00.000Z';
const ev = (kind: string, node: string | null, payload: unknown): AppEvent => ({
  id: `e${seq}`, vault: 'personal', at: AT, device: 'test', seq: seq++, kind, node, payload,
} as AppEvent);

const make = (id: string, kind: string, title: string, parent?: string): AppEvent[] => {
  const out = [ev('node.created', id, { nodeKind: kind, title })];
  if (parent) out.push(ev('node.parented', id, { node: id, parent }));
  return out;
};

/** goal › project › action, plus a loose action and a bare project. */
const world = () => fold([
  ...make('GOAL', 'goal', 'A calmer house'),
  ...make('PROJ', 'project', 'Re-do the hallway', 'GOAL'),
  ...make('STEP', 'action', 'Ring the plasterer', 'PROJ'),
  ...make('LOOSE', 'action', 'Post the form'),
  ...make('BARE', 'project', 'Sort the shed'),
  ...make('INBARE', 'action', 'Buy shelf brackets', 'BARE'),
]);

test('a step names the furthest thing it serves, not the box it sits in', () => {
  const s = world();
  // `placeWords` already says "in Re-do the hallway". This is the other axis.
  assert.equal(servesWords(s, s.nodes.get('STEP')!), 'serves A calmer house');
  assert.equal(servesNode(s, s.nodes.get('STEP')!)?.id, 'GOAL');
});

test('altitude decides, not distance from the root', () => {
  // A goal filed under an area for tidiness. Taking "the top of the chain" would
  // answer the area; the reader's horizon is still the goal above the work.
  const s = fold([
    ...make('AREA', 'area', 'Home'),
    ...make('GOAL', 'goal', 'A calmer house', 'AREA'),
    ...make('PROJ', 'project', 'Re-do the hallway', 'GOAL'),
    ...make('STEP', 'action', 'Ring the plasterer', 'PROJ'),
  ]);
  // AREA is the root, GOAL is higher altitude — goal wins.
  assert.equal(servesWords(s, s.nodes.get('STEP')!), 'serves A calmer house');
});

test('a project is a horizon too — most real trees are one deep for a long time', () => {
  const s = world();
  // Without `project` in the altitude list this renders nothing for almost
  // everybody, which reads as broken rather than as empty.
  assert.equal(servesWords(s, s.nodes.get('INBARE')!), 'serves Sort the shed');
});

test('a loose thing says nothing — that is the ordinary case, not an omission', () => {
  const s = world();
  assert.equal(servesWords(s, s.nodes.get('LOOSE')!), null);
});

test('a horizon does not tell you what it serves — that is the app talking to itself', () => {
  const s = world();
  assert.equal(servesWords(s, s.nodes.get('GOAL')!), null);
  // A project under a goal is a horizon too: `placeWords` says where it lives.
  assert.equal(servesWords(s, s.nodes.get('PROJ')!), null);
});

test('a horizon that was let go is no horizon', () => {
  const s = fold([
    ...make('GOAL', 'goal', 'A calmer house'),
    ...make('PROJ', 'project', 'Re-do the hallway', 'GOAL'),
    ...make('STEP', 'action', 'Ring the plasterer', 'PROJ'),
    ev('node.trashed', 'GOAL', { reason: 'test' }),
  ]);
  // It falls back to the next horizon up the chain rather than naming a thing
  // that was thrown away, or going silent when a real one remains.
  assert.equal(servesWords(s, s.nodes.get('STEP')!), 'serves Re-do the hallway');
});

test('nothing left above it at all, and it says nothing rather than guessing', () => {
  const s = fold([
    ...make('GOAL', 'goal', 'A calmer house'),
    ...make('STEP', 'action', 'Ring the plasterer', 'GOAL'),
    ev('node.trashed', 'GOAL', { reason: 'test' }),
  ]);
  assert.equal(servesWords(s, s.nodes.get('STEP')!), null);
});

test('an untitled horizon still renders, and never as an empty phrase', () => {
  const s = fold([
    ...make('G', 'goal', ''),
    ...make('A', 'action', 'something', 'G'),
  ]);
  assert.equal(servesWords(s, s.nodes.get('A')!), 'serves (untitled)');
});

test('a cycle arriving from another device terminates rather than hanging', () => {
  // `ancestors` is bounded by construction; this is the assertion that the
  // property is relied on here. A shard exchange can deliver two halves of a
  // loop that neither device ever wrote whole.
  const s = fold([
    ...make('A', 'project', 'A'),
    ...make('B', 'project', 'B'),
    ev('node.parented', 'A', { node: 'A', parent: 'B' }),
    ev('node.parented', 'B', { node: 'B', parent: 'A' }),
    ...make('X', 'action', 'work', 'A'),
  ]);
  const out = servesWords(s, s.nodes.get('X')!);
  assert.ok(out === null || out.startsWith('serves '), 'it returned rather than hanging');
});
