// What you are working toward (2.18.0) — the surface that lists the horizons,
// INCLUDING the empty ones. See `src/horizons.ts` for why that last word is the
// whole feature: Review already computes unfed goals and quiet areas and shows
// them capped at three, exceptions-first, which is the right shape for "what
// needs attention" and the wrong one for "what am I working toward".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold } from '../src/fold.ts';
import {
  horizonRows, holdsWords, rhythmWords, horizonEmptyWords, HORIZON_KINDS,
} from '../src/horizons.ts';
import { containerOptionWords } from '../src/tree.ts';
import type { AppEvent } from '../src/events.ts';

let seq = 0;
const AT = '2026-08-22T09:00:00.000Z';
const ev = (kind: string, node: string | null, payload: unknown): AppEvent => ({
  id: `e${seq}`, vault: 'personal', at: AT, device: 'test', seq: seq++, kind, node, payload,
} as AppEvent);

const made = (id: string, nodeKind: string, title: string, parent?: string): AppEvent[] => [
  ev('node.created', id, { nodeKind, title, provenance: { for: 'self' } }),
  ...(parent ? [ev('node.parented', id, { parent })] : []),
];

test('a goal with nothing under it is LISTED — the whole reason this is not Review', () => {
  const s = fold([...made('G', 'goal', 'A calmer house')]);
  const { rows } = horizonRows(s);
  assert.equal(rows.length, 1, 'it is on the list');
  assert.equal(rows[0]!.holds, 0, 'holding nothing, stated as a fact rather than as a fault');
  assert.equal(rows[0]!.everyDays, null, 'and no rhythm');
});

test('what is under a horizon is counted THROUGH the projects between', () => {
  // A goal is normally fed through a project, and a project is a container, not
  // live work. Counting only direct children would report every properly
  // structured goal as empty — `unfedGoals` learned this and so does this.
  const s = fold([
    ...made('G', 'goal', 'A calmer house'),
    ...made('P', 'project', 'Re-do the hallway', 'G'),
    ...made('A', 'action', 'Ring the plasterer', 'P'),
    ...made('B', 'action', 'Choose the paint', 'P'),
  ]);
  const { rows } = horizonRows(s);
  assert.equal(rows[0]!.holds, 2, 'both actions, two levels down');
});

test('finishing the work does not delete the goal from the list', () => {
  // The moment it would vanish, and the moment somebody most needs to see it.
  let s = fold([
    ...made('G', 'goal', 'A calmer house'),
    ...made('A', 'action', 'Ring the plasterer', 'G'),
  ]);
  assert.equal(horizonRows(s).rows[0]!.holds, 1);

  s = fold([ev('done.marked', 'A', { at: AT })], s);
  const { rows } = horizonRows(s);
  assert.equal(rows.length, 1, 'still listed');
  assert.equal(rows[0]!.holds, 0, 'and honest about holding nothing now');
});

test('projects are counted but never listed — this is not the tree', () => {
  // ADR-0013 refuses the full tree as a landing view. An import produced 42
  // projects from one file; a page listing all of those is the tree by another
  // name. They are counted so the empty state can say "you have work, none of
  // it under a horizon" rather than rendering blank and reading as broken.
  const s = fold([
    ...made('P1', 'project', 'One'),
    ...made('P2', 'project', 'Two'),
  ]);
  const { rows, projects } = horizonRows(s);
  assert.equal(rows.length, 0, 'no rows');
  assert.equal(projects, 2, 'but the projects are known');
  assert.match(horizonEmptyWords(projects), /all 2 of your projects/,
    'and the empty state says so, rather than implying an empty store');
  assert.match(horizonEmptyWords(0), /Nothing here yet/);
});

test('the three horizon kinds are listed, highest first, then by title', () => {
  const s = fold([
    ...made('O', 'outcome', 'The hallway is finished'),
    ...made('A2', 'area', 'Zebra'),
    ...made('A1', 'area', 'Aardvark'),
    ...made('G', 'goal', 'A calmer house'),
  ]);
  const kinds = horizonRows(s).rows.map(r => r.node.kind);
  assert.deepEqual(kinds, ['goal', 'area', 'area', 'outcome'], 'altitude order');
  const areas = horizonRows(s).rows.filter(r => r.node.kind === 'area').map(r => r.node.title);
  assert.deepEqual(areas, ['Aardvark', 'Zebra'], 'and stable within a kind, never by how busy it is');
  assert.deepEqual([...HORIZON_KINDS], ['goal', 'area', 'outcome'], 'project is not one of them');
});

test('a rhythm is reported, and its absence is STATED rather than left blank', () => {
  let s = fold([...made('G', 'goal', 'A calmer house')]);
  assert.equal(rhythmWords(horizonRows(s).rows[0]!.everyDays), 'no rhythm set');

  s = fold([ev('upkeep.interval.set', 'G', { intervalDays: 90, comfortWindowDays: 14 })], s);
  const r = horizonRows(s).rows[0]!;
  assert.equal(r.everyDays, 90, 'and the goal is still a goal carrying it');
  assert.equal(r.node.kind, 'goal');
  assert.equal(rhythmWords(90), 'comes back every 90 days');
  assert.equal(rhythmWords(1), 'comes back every day');
});

test('every count is words — a bare integer beside a name is read as a score', () => {
  // Law 5 and law 7. The roles readout reached the same conclusion for the same
  // reason, and this surface is more exposed to it: these are somebody's goals.
  assert.equal(holdsWords(0), 'nothing under it yet');
  assert.equal(holdsWords(1), '1 thing under it');
  assert.equal(holdsWords(4), '4 things under it');
  for (const n of [0, 1, 2, 17]) assert.match(holdsWords(n), /thing|nothing/);
});

test('a trashed horizon is not listed, and neither is its work counted', () => {
  let s = fold([
    ...made('G', 'goal', 'A calmer house'),
    ...made('A', 'action', 'Ring the plasterer', 'G'),
    ...made('G2', 'goal', 'Learn to sail'),
  ]);
  assert.equal(horizonRows(s).rows.length, 2);

  s = fold([ev('node.trashed', 'G2', {})], s);
  const { rows } = horizonRows(s);
  assert.equal(rows.length, 1, 'the let-go goal is gone from the list');
  assert.equal(rows[0]!.node.title, 'A calmer house');
});

// --- the place pickers ------------------------------------------------------
//
// Phase 2 step 4 said `#sort-bulk-parent` "needs to accept a container of any
// kind, not only a project". Measured before building: it already did —
// `isContainer` has covered all four kinds since the tree was written, and a
// bulk put-under lands on a goal end to end. The third time this plan named
// something missing that was already there.
//
// What WAS missing is what these lock in: the option text never said which kind
// a place was. That cost nothing while every place in the list was a project.

test('the place pickers say what KIND each place is', () => {
  const s = fold([
    ...made('G', 'goal', 'A calmer house'),
    ...made('P', 'project', 'Re-do the hallway', 'G'),
    ...made('A', 'action', 'Ring the plasterer', 'P'),
  ]);
  assert.equal(containerOptionWords(s, s.nodes.get('G')!), 'A calmer house — goal');
  assert.equal(containerOptionWords(s, s.nodes.get('P')!),
    'Re-do the hallway — project, in A calmer house');
});

test('a non-container keeps its plain words — the kind is only said when it is a place', () => {
  // The merge picker shares this writer and lists anything foldable, so an
  // action must not acquire " — action" on its way through.
  const s = fold([
    ...made('P', 'project', 'Re-do the hallway'),
    ...made('A', 'action', 'Ring the plasterer', 'P'),
  ]);
  assert.equal(containerOptionWords(s, s.nodes.get('A')!),
    'Ring the plasterer — in Re-do the hallway');
});

test('a place under a let-go parent does not claim to be in it', () => {
  let s = fold([
    ...made('G', 'goal', 'A calmer house'),
    ...made('P', 'project', 'Re-do the hallway', 'G'),
  ]);
  assert.match(containerOptionWords(s, s.nodes.get('P')!), /in A calmer house/);
  s = fold([ev('node.trashed', 'G', {})], s);
  assert.equal(containerOptionWords(s, s.nodes.get('P')!), 'Re-do the hallway — project');
});
