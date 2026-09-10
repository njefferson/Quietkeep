// The proof must not be able to disagree with the gate that enforces law 1.
//
// `coverageProof` exists so a reader can check the container from the OUTSIDE
// (ADR-0084). That is only worth anything if it reports the same coverage the
// write boundary actually enforces — a proof that says "covered" about something
// the gate would call silent is worse than no proof, because it is exactly the
// reassurance-from-the-inside this app exists to replace.
//
// So the load-bearing assertion is not "the counts look right". It is that
// `whyCovered(n) === null` if and only if `isSilent(n)`, over a store built
// through the REAL write gate. Add a clause to one and not the other and this
// goes red.
//
// THE FIRST VERSION OF THIS FILE PASSED AND PROVED NOTHING. It hand-wrote events
// in a shape the fold does not accept, so the store held zero nodes and every
// loop ran over an empty set. Planting a deliberately broken clause did not fail
// it, which is the only reason that was discovered — a plant that passes means
// the plant never reached the code, and it is the third time that shape appeared
// in one day. Every store below now asserts it is non-empty before asserting
// anything about it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, emptyState, type State } from '../src/fold.ts';
import { admit, gateOptionsFor, isSilent, whyCovered, coverageProof, heldWork } from '../src/gate.ts';
import type { AppEvent } from '../src/events.ts';
import { atMidnight } from '../src/time.ts';

const TZ = 'America/Denver';
const AT = '2026-08-07T15:00:00.000Z';

let seq = 9000;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at: AT, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const write = (prior: State, offered: AppEvent[]): State =>
  fold(admit(offered, prior, gateOptionsFor(TZ)), prior);

/** A store exercising more than one coverage clause, built through the gate. */
function store(): State {
  let s = write(emptyState(), [ev('capture.recorded', 'A', { text: 'strip the old sealant' })]);
  s = write(s, [ev('capture.recorded', 'B', { text: 'ring the school' })]);
  // ROUTED AND ON THE MENU, which is what the real path does: `clarify.routed`
  // alone does not add the Menu row (its own branch there is unreachable
  // defense-in-depth, and says so), so a store built without this one exercises
  // the menu clause not at all.
  s = write(s, [ev('clarify.routed', 'B', { to: 'someday' })]);
  s = write(s, [ev('menu.item.added', 'B', { category: 'try' })]);
  s = write(s, [ev('capture.recorded', 'C', { text: 'book the car in' })]);
  s = write(s, [ev('clarify.routed', 'C', { to: 'next-action' })]);
  return s;
}

test('the store is not empty — an empty store passes every assertion below', () => {
  assert.ok(heldWork(store()).length >= 3, 'the fixture folded to nothing, so nothing here measures anything');
});

test('the proof and the gate cannot disagree about any node', () => {
  const s = store();
  for (const n of heldWork(s)) {
    assert.equal(
      whyCovered(n, s) === null, isSilent(n, s),
      `${n.title}: proof says ${whyCovered(n, s) ?? 'nothing covers it'}, gate says silent=${isSilent(n, s)}`,
    );
  }
});

test('every held thing is accounted for exactly once', () => {
  const s = store();
  const proof = coverageProof(s);
  const counted = proof.reasons.reduce((n, r) => n + r.count, 0);
  assert.equal(counted + proof.exceptions.length, heldWork(s).length,
    'the proof is dropping items, which is the failure it exists to make impossible');
  assert.equal(proof.holds, proof.exceptions.length === 0);
});

test('no reason is listed with a count of zero — a proof is not a glossary', () => {
  const proof = coverageProof(store());
  assert.ok(proof.reasons.length > 0, 'no reasons at all means the proof saw nothing');
  for (const r of proof.reasons) assert.ok(r.count > 0, `${r.reason} listed with no items`);
});

test('a thing on the Menu is covered BY the Menu, not by the cure it still carries', () => {
  // THE PRECEDENCE, ASSERTED (3.23.8). B is routed to someday, so it is on the
  // Menu — and it still carries the gate's own `review` cure, because
  // `demandClocksOf` deliberately never clears that one. Asking `node.clocks`
  // first named the cure as the reason, so the coverage line read "6 with a day
  // they come back to you" over rows that said *on the Menu*, which is the same
  // defect 3.23.6 fixed in `heldStatus` and in `detail.ts`.
  //
  // The clock is asserted PRESENT rather than assumed absent: if the cure ever
  // stops being left in place, this test stops measuring anything and says so
  // here rather than passing quietly.
  const s = store();
  const b = s.nodes.get('B')!;
  assert.ok(b.onMenu !== null, 'B is not on the Menu, so this proves nothing');
  assert.ok(Object.keys(b.clocks).length > 0,
    'B carries no clock, so the precedence this test exists for is untested');
  assert.equal(whyCovered(b, s), 'menu',
    'the reason printed is the reason a reader would give, and they would not say a date');
});

test('a finished thing is covered BY being finished, not by the day it still carries', () => {
  // THE FOURTH ROUND OF ONE MISTAKE (3.23.16), and the first one a test asks
  // about. The log is append-only, so `done.marked` does not erase the clock the
  // thing was carrying — and asking `node.clocks` before `lastDone` therefore
  // named that clock as the reason. The coverage list, whose whole job is to be
  // checkable from outside, counted finished work under "with a day they come
  // back to you" and printed a row reading "returns today" about it. A cold read
  // found two, and confirmed they survive a reload.
  //
  // 1,545 tests did not catch it. The Menu round above is asserted here and this
  // was not, because each was written as a fact about one state rather than as
  // the rule the function is trying to state.
  const base = store();
  const s = write(base, [ev('done.marked', 'A', { at: AT })]);
  const a = s.nodes.get('A')!;
  assert.ok(a.lastDone, 'A is not finished, so this proves nothing');
  assert.ok(Object.keys(a.clocks).length > 0,
    'A carries no clock, so the precedence this test exists for is untested');
  assert.equal(whyCovered(a, s), 'done',
    'a reader who just marked it done would not say it is waiting to come back');
});

test('an upkeep between rounds IS still coming back, and keeps its clock as the reason', () => {
  // THE OTHER HALF, and the reason the rule is not simply `lastDone` wins. A
  // thing with a cadence is finished AND returning — that is what a cadence
  // means — so `clock` is the true answer for it and must survive the fix above.
  // Without this, the fix would quietly tell somebody the bins are finished.
  const base = store();
  const s = write(base, [
    ev('upkeep.interval.set', 'A', { intervalDays: 7, comfortWindowDays: 2 }),
    ev('done.marked', 'A', { at: AT }),
  ]);
  const a = s.nodes.get('A')!;
  assert.ok(a.lastDone, 'A is not finished, so this proves nothing');
  assert.ok((a.intervalDays ?? 0) > 0 && (a.comfortWindowDays ?? 0) > 0,
    'A carries no cadence, so this is the same case as the test above and not the other half');
  assert.equal(whyCovered(a, s), 'clock',
    'an upkeep between rounds comes back on its own, and the clock is why');
});

test('the promise HOLDS on a store the gate accepted — it refuses silence at the boundary', () => {
  assert.equal(coverageProof(store()).holds, true);
});
