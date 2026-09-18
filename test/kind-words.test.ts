// What a thing is, in words a reader has (2.4.0, ADR-0094).
//
// Exhaustiveness is held by the TYPE — `Record<NodeKind, string | null>` will
// not compile if a kind is added without an entry, which fails at the moment the
// kind is added rather than at the moment somebody runs this file. What is
// tested here is what a type cannot say: that the words are the app's own, that
// they are distinct, and that `action` stays unmarked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARRIVED_WORD, KIND_WORDS, kindWords, nodeWords } from '../src/kind-words.ts';
import { NODE_KINDS } from '../src/events.ts';
import { fold } from '../src/fold.ts';
import { placeWords } from '../src/held.ts';
import type { AppEvent } from '../src/events.ts';

test('every kind the app can write has an entry — none is silently missing', () => {
  for (const k of NODE_KINDS) {
    assert.ok(k in KIND_WORDS, `${k} has no reader-facing words`);
  }
  assert.equal(Object.keys(KIND_WORDS).length, NODE_KINDS.length,
    'KIND_WORDS carries an entry the app can never write');
});

test('action is the unmarked case, and it is the ONLY one', () => {
  assert.equal(kindWords('action'), null);
  const wordless = NODE_KINDS.filter(k => KIND_WORDS[k] === null);
  assert.deepEqual(wordless, ['action'],
    'a kind with no words is indistinguishable from an action on a row — that is the defect');
});

test('no two kinds answer to the same words', () => {
  const said = Object.values(KIND_WORDS).filter((w): w is string => w !== null);
  assert.equal(new Set(said).size, said.length,
    'two kinds sharing a word means a row cannot be read back to a kind');
});

test('the words are the app’s own, quoted rather than invented', () => {
  // Each of these is a string that already existed somewhere a reader could see
  // it. Pinning them here is what stops a later edit drifting into a second
  // vocabulary for something the app already names.
  assert.equal(kindWords('waiting-for'), 'Waiting for');   // clarify.ts route label
  assert.equal(kindWords('upkeep'), 'Upkeep');             // its section heading
  assert.equal(kindWords('pebble'), 'Something on you');   // the pebble form's label
  assert.equal(kindWords('resume-card'), 'Where you left off'); // focus-intents' title
});

test('a wish is not "on the Menu" — being on the Menu is a different fact', () => {
  // An aspiration can be taken off the Menu and is still an aspiration, so
  // naming the kind after the place it usually sits would be wrong exactly where
  // the difference matters. The sheet states Menu membership separately.
  assert.equal(kindWords('aspiration'), 'A wish');
});

test('"pebble" names the WEIGHT in this app, so it cannot also name the kind', () => {
  // The pebble form offers "a pebble / a rock / a boulder" as how heavy a thing
  // is. One word meaning two things on one screen is the defect ADR-0089
  // records for the word "Menu".
  assert.notEqual(kindWords('pebble'), 'Pebble');
});

// --- and what a card actually says -----------------------------------------

let seq = 0;
const AT = '2026-08-17T09:00:00.000Z';
const ev = (kind: string, node: string | null, payload: unknown): AppEvent => ({
  id: `e${seq}`, vault: 'personal', at: AT, device: 'test', seq: seq++, kind, node, payload,
} as AppEvent);

test('a container now says what it is, with or without anything under it', () => {
  const s = fold([
    ev('node.created', 'p', { nodeKind: 'project', title: 'Re-do the hallway' }),
    ev('node.created', 'g', { nodeKind: 'goal', title: 'A calmer house' }),
    ev('node.created', 'a', { nodeKind: 'action', title: 'Ring the plasterer' }),
    ev('node.parented', 'a', { node: 'a', parent: 'p' }),
  ]);
  const counts = new Map([['p', 1]]);
  // The report's exact case: a project used to say "1 under it" and a goal with
  // nothing under it said NOTHING AT ALL.
  assert.equal(placeWords(s.nodes.get('p')!, s, counts), 'Project · 1 under it');
  assert.equal(placeWords(s.nodes.get('g')!, s, counts), 'Goal');
  // And the unmarked case is genuinely unchanged: an action in a project reads
  // as it always did, with no word added to several hundred rows.
  assert.equal(placeWords(s.nodes.get('a')!, s, counts), 'in Re-do the hallway');
});

test('a loose action still says nothing — it IS loose, and that is the reading', () => {
  const s = fold([ev('node.created', 'x', { nodeKind: 'action', title: 'Post the form' })]);
  assert.equal(placeWords(s.nodes.get('x')!, s, new Map()), null);
});

// AN ANSWERED WAITING-FOR STOPS SAYING SOMEBODY ELSE HAS IT (Phase 0, read 7).
// The row, the tree and the sheet all read `Waiting for` after you had told the
// app the answer came back. ADR-0040 is right that the kind must not change —
// arriving is not finishing — so the WORD is what moves.
test('a waiting-for reads Arrived once its answer has come back', () => {
  const s = fold([
    ev('node.created', 'w', { nodeKind: 'waiting-for', title: 'The signed lease' }),
    ev('waiting.opened', 'w', { forWhat: 'the countersigned copy' }),
  ]);
  const open = s.nodes.get('w')!;
  assert.equal(nodeWords(open), 'Waiting for');
  assert.equal(placeWords(open, s, new Map()), 'Waiting for');

  const after = fold([
    ev('node.created', 'w', { nodeKind: 'waiting-for', title: 'The signed lease' }),
    ev('waiting.opened', 'w', { forWhat: 'the countersigned copy' }),
    ev('waiting.closed', 'w', { outcome: 'arrived' }),
  ]);
  const done = after.nodes.get('w')!;
  assert.equal(nodeWords(done), ARRIVED_WORD);
  assert.equal(ARRIVED_WORD, 'Arrived');
  assert.equal(placeWords(done, after, new Map()), 'Arrived');

  // THE KIND IS UNTOUCHED, which is the half ADR-0040 settles: it is not marked
  // done, it keeps its clock, and it is still a waiting-for in the schema.
  assert.equal(done.kind, 'waiting-for');
  assert.equal(done.lastDone, null);
  // And `kindWords` itself is unchanged — the kind's word is still the kind's
  // word, so nothing that asks about a KIND rather than a node moves.
  assert.equal(kindWords('waiting-for'), 'Waiting for');
});

test('reopening a waiting-for puts the word back, with no second rule', () => {
  const s = fold([
    ev('node.created', 'w', { nodeKind: 'waiting-for', title: 'The quote' }),
    ev('waiting.opened', 'w', { forWhat: 'a number' }),
    ev('waiting.closed', 'w', { outcome: 'arrived' }),
    ev('waiting.opened', 'w', { forWhat: 'the revised number' }),
  ]);
  assert.equal(nodeWords(s.nodes.get('w')!), 'Waiting for');
});

// The importer's latch is a DIFFERENT fact, and branching on it here would have
// named every imported row arrived.
test('a thing that came in with an import is not an arrival', () => {
  const s = fold([
    ev('node.created', 'i', { nodeKind: 'waiting-for', title: 'Chase the deposit', arrived: true }),
  ]);
  const n = s.nodes.get('i')!;
  assert.equal(n.arrived, true);
  assert.equal(n.waitingOutcome, null);
  assert.equal(nodeWords(n), 'Waiting for');
});
