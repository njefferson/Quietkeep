// Just one thing — the minimum state.
//
// Fog is a THIRD failure mode, not a worse version of a low day. "Fewer things"
// and "less thinking" are different transformations and the app only had the
// first: a low day is answered by reaching for lighter work, and that answers
// nothing when the problem is not how much there is but how much the screen is
// asking you to process.
//
// It is also the burnout state, where the skill of operating the tool is one of
// the skills that has gone — which is why the way out is asserted here as
// carefully as the way in.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, emptyState, type State } from '../src/fold.ts';
import { admit, gateOptionsFor } from '../src/gate.ts';
import { plainIsOn, PLAIN_MODULE, PLAIN_OFFER_CAP, PLAIN_HIDDEN } from '../src/plain.ts';
import { offerNow, OFFER_CAP } from '../src/offer.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';
const AGO = '2026-07-01T15:00:00.000Z';
const NOW = '2026-08-07T15:00:00.000Z';

let seq = 15000;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at: AGO, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const write = (prior: State, offered: AppEvent[]): State =>
  fold(admit(offered, prior, gateOptionsFor(TZ)), prior);

/**
 * Work that produces a FULL offer, which means items that are unalike.
 *
 * The offer is at most one per reason (ADR-0060) — that is the whole mechanism
 * by which choosing is a preference rather than a comparison. Three items all
 * asking for the same reason therefore produce ONE offer, and a fixture built
 * that way cannot tell a reduced offer from an ordinary one. The first version
 * of this file did exactly that and failed on its own fixture line.
 */
function withWork(): State {
  let s = emptyState();
  for (const [id, t] of [['A', 'ring the plumber'], ['B', 'post the form'],
    ['C', 'find the receipt']] as const) {
    s = write(s, [ev('capture.recorded', id, { text: t })]);
    s = write(s, [ev('clarify.routed', id, { route: 'next-action' })]);
  }
  // A real date that has arrived TODAY — a different reason, so the offer can
  // hold two. Not yesterday: a passed date raises a replan card and is then
  // deliberately withheld from the offer (one item is never asked two different
  // questions), so the first version of this fixture produced one offer while
  // claiming to produce two.
  s = write(s, [ev('clock.set', 'A', { clockKind: 'due', at: '2026-08-07T12:00:00.000Z', source: 'detail:due' })]);
  return s;
}

const on = (s: State): State => write(s, [ev('module.enabled', null, { module: PLAIN_MODULE })]);
const off = (s: State): State => write(s, [ev('module.disabled', null, { module: PLAIN_MODULE })]);

test('it is off until somebody turns it on, and nothing turns it on for them', () => {
  // Never inferred and never prompted. Detecting a foggy day means forming an
  // opinion about the person from their logs, and there is no instrument here
  // that could.
  const s = withWork();
  assert.equal(plainIsOn(s), false);
  // Nothing in an ordinary day's worth of activity switches it on.
  let busy = s;
  busy = write(busy, [ev('capacity.declared', null, { level: 'low' })]);
  busy = write(busy, [ev('done.marked', 'A', { at: AGO })]);
  busy = write(busy, [ev('clarify.reopened', 'B', { from: 'next-action' })]);
  assert.equal(plainIsOn(busy), false,
    'a low day, a completion and a reopen are not evidence of anything, and none of them may flip it');
});

test('one thing, and it is the SAME first thing', () => {
  const s = withWork();
  const ordinary = offerNow(s, NOW, TZ, 0);
  const plain = offerNow(on(s), NOW, TZ, 0);
  assert.equal(ordinary.work.length, OFFER_CAP, 'fixture: two on an ordinary day');
  assert.equal(plain.work.length >= 1, true);
  // The head does not change. This state removes what is around the offer; it
  // does not reach into the ranking and choose differently, which would make it
  // a second opinion about what you should do.
  assert.equal(plain.work[0]?.node.id, ordinary.work[0]?.node.id,
    'the thing offered is the one that was already leading');
});

test('the cap is a constant, not a computation', () => {
  assert.equal(PLAIN_OFFER_CAP, 1,
    'choosing is not something being asked of you here — two unalike options are a '
    + 'preference on an ordinary day and two things to read on this one');
});

test('it survives a reload, because re-entering it is the last thing to ask of somebody', () => {
  // A state you must re-enter every time the app reloads is one more thing to
  // operate on the day you can least afford it. It rides `module.enabled`, which
  // the fold has folded since 1.6.0.
  const s = on(withWork());
  assert.equal(plainIsOn(s), true);
  const reloaded = fold([], s);
  assert.equal(plainIsOn(reloaded), true, 'still on after a fresh fold of the same log');
});

test('leaving it is one act, and it leaves nothing behind', () => {
  let s = on(withWork());
  s = off(s);
  assert.equal(plainIsOn(s), false);
  assert.equal(offerNow(s, NOW, TZ, 0).work.length, OFFER_CAP,
    'the full offer is back, exactly as it was');
});

test('NOTHING IS HIDDEN FROM THE STORE — it is a smaller view, not a smaller app', () => {
  // The guarantee that must not bend. Nothing goes silent, nothing leaves the
  // held list, and every item is still there behind the one being shown.
  const s = on(withWork());
  const plain = offerNow(s, NOW, TZ, 0);
  assert.equal(plain.work.length, 1);
  // Cycling still reaches the others: they were never removed from the queue.
  const ids = new Set([0, 1, 2].map(c => offerNow(s, NOW, TZ, c).work[0]?.node.id));
  assert.equal(ids.size >= 2, true,
    `more than one item is still reachable by cycling (${[...ids].join(', ')})`);
});

test('what it suppresses is named in one list, and every entry is a real element', () => {
  // The list is the specification. Each of these is true and useful on an
  // ordinary day — the reason, the place, the arithmetic, the situation, the
  // first-step prompt, the behind-list, the counts, the chips — and information
  // is the cost this state exists to cut.
  assert.ok(PLAIN_HIDDEN.length >= 8, 'it is a real reduction, not a token one');
  for (const sel of PLAIN_HIDDEN) {
    assert.match(sel, /^#[a-z-]+$/, `${sel} is an id selector the surface can actually find`);
  }
  // The TITLE and the acts are not in it: what survives is the thing itself and
  // the two things you can do about it.
  for (const kept of ['#nextup-title', '#nextup-done', '#nextup-skip']) {
    assert.equal((PLAIN_HIDDEN as readonly string[]).includes(kept), false,
      `${kept} must survive — a state with nothing to act on is not a smaller view, it is a dead end`);
  }
});

test('the noun is about the SCREEN, never about the person', () => {
  // "Fog mode" would be a fact about you. This app does not have opinions about
  // people, including sympathetic ones.
  assert.equal(PLAIN_MODULE, 'one-thing');
  assert.doesNotMatch(PLAIN_MODULE, /fog|tired|low|bad|foggy|brain|crash|burn/i,
    'the stored noun names what is displayed, not a state of the reader');
});
