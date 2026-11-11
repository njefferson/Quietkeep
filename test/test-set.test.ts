// The test set (3.28.2, docs/decisions/test-set-2026-11.md).
//
// "Make a set to try things on" is what a reader loads to test the app on. Two
// staged surfaces had no store a reader could load that showed them working: the
// weeks ahead on the first screen, and the roles in the order of their last act.
// The set grew to reach both, and this file holds each state it was grown for.
//
// TWO KINDS OF TEST, and the second is the one that matters. The first folds the
// real set and asks for each state. A state asked for of a set that holds it
// already proves nothing about the growth, so the second kind plants a break: it
// takes the real set, removes or moves exactly the part that makes one state, and
// requires that state, and only a named one, to come back red. A check that stays
// green with the growth taken out is not checking the growth.
//
// Every date here is relative to one fixed NOW, and a second load ten days later
// is held to be the same set shifted by those ten days.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  bigSampleEvents, GROWTH_ROLES, GROWTH_STRETCHES, GROWTH_CROWDED_DAY, GROWTH_CAPTURES,
} from '../src/big-sample.ts';
import { admit, gateOptionsFor } from '../src/gate.ts';
import { fold, compareEvents } from '../src/fold.ts';
import { glanceView } from '../src/glance.ts';
import { calendarEntries } from '../src/ics.ts';
import { dayNamed, dayOffset } from '../src/reading.ts';
import { heldGroups } from '../src/held.ts';
import { waitingOnAnyone } from '../src/people.ts';
import { reviewExceptions, rolesOrder } from '../src/review.ts';
import { atMidnight } from '../src/time.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';
const NOW = '2026-08-03T18:00:00.000Z';
const LATER = '2026-08-13T18:00:00.000Z';
const DAY = 86_400_000;
const HOUR = 3_600_000;

async function load(at: string, prefix: string): Promise<AppEvent[]> {
  let n = 0, s = 0;
  return bigSampleEvents({
    at, device: 'test-set', vault: 'personal', zone: TZ,
    seq: () => s++, id: () => `${prefix}${n++}`,
  }, at);
}

/** Built once: the journal key costs a deliberate fraction of a second. */
let cached: AppEvent[] | null = null;
async function base(): Promise<AppEvent[]> {
  cached ??= await load(NOW, 'ts');
  return cached;
}

const payloadOf = (e: AppEvent): Record<string, unknown> => (e.payload ?? {}) as Record<string, unknown>;

/** The ids of the nodes made with these words, whichever way they were made. */
function idsOf(events: readonly AppEvent[], words: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const e of events) {
    const p = payloadOf(e);
    const said = e.kind === 'node.created' ? p['title'] : e.kind === 'capture.recorded' ? p['text'] : undefined;
    if (typeof said === 'string' && words.includes(said) && e.node) out.add(e.node);
  }
  return out;
}

/**
 * Every state the set was grown for, asked of an event list. Returns the names of
 * the states that do NOT hold, so a good set returns nothing.
 */
function failures(events: readonly AppEvent[], now: string): string[] {
  const admitted = admit([...events].sort(compareEvents), fold([]), gateOptionsFor(TZ));
  const state = fold(admitted);
  const mid = atMidnight(TZ);
  const out: string[] = [];
  const view = glanceView(state, now, TZ);

  // Days in the next seven and days out to thirty that hold something.
  if (view.week.length < 3) out.push('week');
  if (view.month.length < 3) out.push('month');
  const entries = calendarEntries(state, now, TZ, true);
  const offsetOfDue = (title: string): number | null => {
    const e = entries.find(x => x.node.title === title && x.kind === 'due');
    return e ? dayOffset(dayNamed(e.at, now, mid), now, mid) : null;
  };
  const carried = GROWTH_ROLES.map(g => offsetOfDue(g.carrier));
  if (!carried.some(o => o !== null && o < 7)) out.push('days-in-the-week');
  if (carried.filter(o => o !== null && o >= 7 && o < 30).length < 3) out.push('days-out-to-thirty');

  // One day holding more than the three a day shows.
  const perDay = new Map<number, number>();
  for (const t of GROWTH_CROWDED_DAY) {
    const o = offsetOfDue(t);
    if (o !== null) perDay.set(o, (perDay.get(o) ?? 0) + 1);
  }
  if (Math.max(0, ...perDay.values()) <= 3) out.push('crowded-day');

  // A thing drawn as a stretch.
  const spanTitles = view.spans.map(s => s.node.title);
  if (!GROWTH_STRETCHES.every(s => spanTitles.includes(s.title))) out.push('stretch');

  // Somebody waited on, and things still to sort.
  const waited = waitingOnAnyone(state, now, TZ).some(w => w.node.title === 'The reply about the hall booking');
  if (!waited || view.waiting.total < 1) out.push('waiting');
  const unsorted = heldGroups(state, now, TZ).find(g => g.key === 'unsorted')?.items.map(n => n.title) ?? [];
  if (!GROWTH_CAPTURES.every(t => unsorted.includes(t)) || view.unsorted.shown.length < 1) out.push('unsorted');

  // The roles review: an order of at least four roles at different distances.
  const order = rolesOrder(state, admitted, now, TZ);
  const daysByRole = new Map(order.map(o => [o.role.title, o.days]));
  if (!GROWTH_ROLES.every(g => daysByRole.get(g.name) === g.back)) out.push('role-distances');
  if (new Set(order.map(o => o.days)).size < 5) out.push('role-order');
  const days = order.map(o => o.days ?? Number.POSITIVE_INFINITY);
  if (days.some((d, i) => i > 0 && d > days[i - 1]!)) out.push('role-sorted');

  // A role carrying nothing live, beside them.
  if (reviewExceptions(state, now, TZ).quietLines.length < 1) out.push('quiet-role');

  return out;
}

// --- the states, folded from the real set ---------------------------------------

test('test-set: the weeks ahead holds every state it was grown for', async () => {
  assert.deepEqual(failures(await base(), NOW), []);
});

test('test-set: four roles carry live work with last acts 1, 6, 19 and 47 days back', async () => {
  const events = await base();
  const admitted = admit([...events].sort(compareEvents), fold([]), gateOptionsFor(TZ));
  const order = rolesOrder(fold(admitted), admitted, NOW, TZ);
  const byName = new Map(order.map(o => [o.role.title, o.days]));
  assert.deepEqual(GROWTH_ROLES.map(g => byName.get(g.name)), [1, 6, 19, 47]);
  assert.ok(new Set(order.map(o => o.days)).size >= 5, 'the order holds fewer than five distances');
  // Oldest first, and the roles of the older set sit at nought beneath them.
  assert.deepEqual(order.slice(0, 4).map(o => o.days), [47, 19, 6, 1]);
  assert.ok(order.slice(4).every(o => o.days === 0));
});

test('test-set: every offered event is admitted, and the gate adds nothing but review clocks', async () => {
  const events = await base();
  const sorted = [...events].sort(compareEvents);
  assert.deepEqual(events.map(e => e.id), sorted.map(e => e.id), 'the generator returns its own event order');
  const admitted = admit(sorted, fold([]), gateOptionsFor(TZ));
  const have = new Set(admitted.map(e => e.id));
  assert.ok(events.every(e => have.has(e.id)), 'an offered event was refused');
  const offered = new Set(events.map(e => e.id));
  const cures = admitted.filter(e => !offered.has(e.id));
  assert.ok(cures.length > 0 && cures.every(e => e.kind === 'clock.set' && payloadOf(e)['clockKind'] === 'review'),
    'the gate added something other than a review clock');
});

test('test-set: the acts that lie back are the link events a real attach writes, and nothing else', async () => {
  const events = await base();
  const past = events.filter(e => Date.parse(e.at) < Date.parse(NOW));
  assert.ok(past.length >= GROWTH_ROLES.length * 4);
  assert.deepEqual([...new Set(past.map(e => e.kind))].sort(),
    ['clock.set', 'node.created', 'role.attached', 'role.created']);
  assert.equal(past.filter(e => e.kind === 'role.attached').length, GROWTH_ROLES.length);
});

// --- two loads at different instants ----------------------------------------------

test('test-set: loaded ten days apart it is the same set shifted by ten days', async () => {
  const a = await base();
  const b = await load(LATER, 'tb');
  assert.equal(a.length, b.length);
  const shifted = (x: string, y: string): boolean => Math.abs(Date.parse(y) - Date.parse(x) - 10 * DAY) <= HOUR;
  for (let i = 0; i < a.length; i++) {
    const ea = a[i]!, eb = b[i]!;
    assert.equal(ea.kind, eb.kind, `event ${i} changed kind`);
    assert.ok(shifted(ea.at, eb.at), `event ${i} (${ea.kind}) is not shifted by the ten days`);
    const pa = payloadOf(ea)['at'], pb = payloadOf(eb)['at'];
    if (typeof pa === 'string' && typeof pb === 'string' && ea.kind === 'clock.set') {
      assert.ok(shifted(pa, pb), `the date on clock event ${i} is not shifted by the ten days`);
    }
  }
  // And read at its own moment, each holds every state.
  assert.deepEqual(failures(b, LATER), []);
});

// --- planted breaks: each state red when the part that makes it is taken out ------

const without = (events: readonly AppEvent[], drop: (e: AppEvent) => boolean): AppEvent[] =>
  events.filter(e => !drop(e));

test('test-set: PLANTED, two of the five things on the crowded day removed, the crowded day goes red', async () => {
  const events = await base();
  const ids = idsOf(events, GROWTH_CROWDED_DAY.slice(0, 2));
  assert.equal(ids.size, 2);
  const got = failures(without(events, e => !!e.node && ids.has(e.node)), NOW);
  assert.ok(got.includes('crowded-day'), `still green: ${got.join(',')}`);
});

test('test-set: PLANTED, the start dates taken off the stretches, the stretch goes red', async () => {
  const events = await base();
  const ids = idsOf(events, GROWTH_STRETCHES.map(s => s.title));
  assert.equal(ids.size, GROWTH_STRETCHES.length);
  const got = failures(without(events, e =>
    e.kind === 'clock.set' && !!e.node && ids.has(e.node) && payloadOf(e)['clockKind'] === 'start'), NOW);
  assert.ok(got.includes('stretch'), `still green: ${got.join(',')}`);
});

test('test-set: PLANTED, the person waited on taken out, the waiting goes red', async () => {
  const events = await base();
  const ids = idsOf(events, ['The reply about the hall booking']);
  assert.equal(ids.size, 1);
  const got = failures(without(events, e => !!e.node && ids.has(e.node)), NOW);
  assert.ok(got.includes('waiting'), `still green: ${got.join(',')}`);
});

test('test-set: PLANTED, the added captures taken out, the unsorted goes red', async () => {
  const events = await base();
  const ids = idsOf(events, GROWTH_CAPTURES);
  assert.equal(ids.size, GROWTH_CAPTURES.length);
  const got = failures(without(events, e => !!e.node && ids.has(e.node)), NOW);
  assert.ok(got.includes('unsorted'), `still green: ${got.join(',')}`);
});

test('test-set: PLANTED, every act brought to the moment of loading, the distances go red', async () => {
  const events = await base();
  const carriers = idsOf(events, GROWTH_ROLES.map(g => g.carrier));
  assert.equal(carriers.size, GROWTH_ROLES.length);
  const moved = events.map(e =>
    e.kind === 'role.attached' && carriers.has(String(payloadOf(e)['node'])) ? { ...e, at: NOW } : e);
  const got = failures(moved, NOW);
  assert.ok(got.includes('role-distances'), `still green: ${got.join(',')}`);
  assert.ok(got.includes('role-order'), `still green: ${got.join(',')}`);
});

test('test-set: PLANTED, the due dates taken off the four carriers, the days go red', async () => {
  const events = await base();
  const carriers = idsOf(events, GROWTH_ROLES.map(g => g.carrier));
  const got = failures(without(events, e =>
    e.kind === 'clock.set' && !!e.node && carriers.has(e.node) && payloadOf(e)['clockKind'] === 'due'), NOW);
  assert.ok(got.includes('days-out-to-thirty'), `still green: ${got.join(',')}`);
  assert.ok(got.includes('days-in-the-week'), `still green: ${got.join(',')}`);
});

test('test-set: PLANTED, the finished mark taken off the quiet role\'s only thing, the quiet role goes red', async () => {
  const events = await base();
  const ids = idsOf(events, ['Order the seed potatoes']);
  assert.equal(ids.size, 1);
  const got = failures(without(events, e => e.kind === 'done.marked' && !!e.node && ids.has(e.node)), NOW);
  assert.ok(got.includes('quiet-role'), `still green: ${got.join(',')}`);
});
