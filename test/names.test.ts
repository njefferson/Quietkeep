// ONE TYPED ENTRY, SEVERAL LABELS (3.8.0) — see `src/names.ts`.
//
// The bug this is the fix for: the place field's placeholder has read
// `at home, out, on the phone` since 2.2.0, and the app took that whole string
// as ONE label. A real store carried a place named after the app's own example,
// offered in every list, with the way to take it out in a different room.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitNames, andWords } from '../src/names.ts';
import { fold } from '../src/fold.ts';
import { allContexts, contextsOf } from '../src/contexts.ts';
import type { AppEvent } from '../src/events.ts';

test('a comma list is several labels, in the order they were typed', () => {
  assert.deepEqual(splitNames('home, office, text'), ['home', 'office', 'text']);
});

test('one name is still one name, and the spaces around it go', () => {
  assert.deepEqual(splitNames('  at home  '), ['at home']);
});

test('a name may contain spaces — only commas split', () => {
  assert.deepEqual(splitNames('on the phone, at my desk'), ['on the phone', 'at my desk']);
});

test('empty pieces are dropped, so a trailing or doubled comma is harmless', () => {
  assert.deepEqual(splitNames('home,,office,'), ['home', 'office']);
  assert.deepEqual(splitNames(''), []);
  assert.deepEqual(splitNames('   '), []);
  assert.deepEqual(splitNames(',,,'), []);
});

test('the same name twice in one entry is ONE label, whatever the capitals', () => {
  // The rule the single-name match already used against the store. Without it
  // the split would mint two nodes with one name inside a single keystroke —
  // creating exactly the mess that match exists to prevent.
  assert.deepEqual(splitNames('Home, home, HOME'), ['Home']);
});

test('what lands is said back as a list, not as a count', () => {
  assert.equal(andWords([]), '');
  assert.equal(andWords(['at home']), 'at home');
  assert.equal(andWords(['at home', 'out']), 'at home and out');
  assert.equal(andWords(['at home', 'out', 'on the phone']), 'at home, out and on the phone');
});

// --- and the other half: a label typed wrong can be taken back out ----------

const AT = '2026-08-28T09:00:00.000Z';
let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent => ({
  id: `e${seq}`, vault: 'personal', at: AT, device: 'test', seq: seq++, kind, node, payload,
} as AppEvent);

test('saying a place is not a place takes it out of the picks AND off what carries it', () => {
  // `node.released` is what the situation sheet has used since 2.34.0. 3.8.0
  // put the same act on the detail sheet, where the mistake is made, because
  // the only route to it was choosing that label as where you are — two rooms
  // from the field that types it.
  const before = fold([
    ev('context.created', 'bad', { name: 'home, office, text' }),
    ev('context.created', 'home', { name: 'At home' }),
    ev('node.created', 'a', { kind: 'action', title: 'Hang the curtains' }),
    ev('context.attached', 'a', { node: 'a', context: 'bad' }),
    ev('context.attached', 'a', { node: 'a', context: 'home' }),
  ]);
  assert.equal(allContexts(before).length, 2);
  assert.equal(contextsOf(before, before.nodes.get('a')!).length, 2);

  const after = fold([
    ev('context.created', 'bad', { name: 'home, office, text' }),
    ev('context.created', 'home', { name: 'At home' }),
    ev('node.created', 'a', { kind: 'action', title: 'Hang the curtains' }),
    ev('context.attached', 'a', { node: 'a', context: 'bad' }),
    ev('context.attached', 'a', { node: 'a', context: 'home' }),
    ev('node.released', 'bad', {}),
  ]);
  assert.deepEqual(allContexts(after).map(c => c.title), ['At home']);
  // `contextsOf` resolves through live state rather than trusting the stored
  // ids, so nothing needed migrating and the thing carrying it is clean.
  assert.deepEqual(contextsOf(after, after.nodes.get('a')!).map(c => c.title), ['At home']);
  // NOT trashed and NOT deleted — the log still says it was there, which is
  // what append-only means. It has stopped being offered, and that is all.
  assert.equal(after.nodes.get('bad')!.trashed, false);
});
