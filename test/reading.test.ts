// The one reading of when a thing comes back (3.27.0, src/reading.ts).
//
// Three surfaces lay dates out: the days-ahead view, the calendar file and the
// glance. They read one rule, stated in `src/reading.ts` and in
// docs/decisions/glance-2026-11.md section 3. These tests pin that rule from
// events through the fold, the way `test/dated.test.ts` does, and the existing
// tests of the view and the file pass beside them without an edit.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fold as foldEvents, type State, type NodeState } from '../src/fold.ts';
import {
  placingClocks, alarmClock, laneOf, dayNamed, dayOffset, CALENDAR_KINDS,
} from '../src/reading.ts';
import { CALENDAR_KINDS as FROM_ICS, calendarDay, toCalendar } from '../src/ics.ts';
import { datedDays } from '../src/dated.ts';
import { atMidnight } from '../src/time.ts';
import type { AppEvent } from '../src/events.ts';

const DENVER = 'America/Denver';
const NOW = '2026-07-29T18:00:00.000Z';           // 12:00 on the 29th, Denver
const DAY = 86_400_000;

let seq = 0;
const ev = (kind: string, node: string, payload: unknown, at = '2026-07-01T12:00:00.000Z'): AppEvent =>
  ({ id: `r${seq}`, vault: 'personal', at, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const st = (...events: AppEvent[]): State => foldEvents(events);

const made = (id: string, title = id): AppEvent =>
  ev('node.created', id, { nodeKind: 'action', title });

const clock = (id: string, days: number, kind: string, source = 't'): AppEvent =>
  ev('clock.set', id, {
    clockKind: kind, at: new Date(Date.parse(NOW) + days * DAY).toISOString(), source,
  });

const nodeOf = (s: State, id: string): NodeState => {
  const n = s.nodes.get(id);
  assert.ok(n, `node ${id} exists`);
  return n!;
};

test('a node with only a due clock names that day', () => {
  const n = nodeOf(st(made('A'), clock('A', 3, 'due')), 'A');
  const got = placingClocks(n);
  assert.equal(got.length, 1);
  assert.equal(got[0]!.kind, 'due');
  assert.equal(dayNamed(got[0]!.at, NOW, atMidnight(DENVER)), '2026-08-01');
  assert.equal(laneOf(n), null);
});

test('a node with only a start clock names that day', () => {
  const n = nodeOf(st(made('A'), clock('A', 2, 'start')), 'A');
  const got = placingClocks(n);
  assert.deepEqual(got.map(c => c.kind), ['start']);
  assert.equal(dayNamed(got[0]!.at, NOW, atMidnight(DENVER)), '2026-07-31');
  assert.equal(laneOf(n), null, 'a start alone is not a lane');
});

test('a node with both is a lane, and both clocks place, start then due', () => {
  const n = nodeOf(st(made('A'), clock('A', 10, 'due'), clock('A', 3, 'start')), 'A');
  assert.deepEqual(placingClocks(n).map(c => c.kind), ['start', 'due']);
  const lane = laneOf(n);
  assert.ok(lane);
  assert.equal(lane!.start.kind, 'start');
  assert.equal(lane!.due.kind, 'due');
  assert.ok(Date.parse(lane!.start.at) <= Date.parse(lane!.due.at));
});

test('a start after its due is no lane and both clocks still place', () => {
  const n = nodeOf(st(made('A'), clock('A', 3, 'due'), clock('A', 10, 'start')), 'A');
  assert.equal(laneOf(n), null);
  assert.deepEqual(placingClocks(n).map(c => c.kind), ['due', 'start']);
});

test('a suspense clock places, and wins a tie against a due clock at one instant', () => {
  const n = nodeOf(st(made('A'), clock('A', 4, 'due'), clock('A', 4, 'suspense')), 'A');
  assert.deepEqual(placingClocks(n).map(c => c.kind), ['suspense', 'due']);
  assert.equal(alarmClock(n)!.kind, 'suspense');
});

test('an app-written review clock alone places nothing, and the alarm is null', () => {
  const n = nodeOf(st(made('A'), clock('A', 1, 'review', 'gate:node.created')), 'A');
  assert.deepEqual(placingClocks(n), []);
  assert.equal(alarmClock(n), null);
});

test('a review clock a person set places in the view and is absent from the alarm', () => {
  const n = nodeOf(st(made('A'), clock('A', 5, 'review', 't')), 'A');
  assert.deepEqual(placingClocks(n).map(c => c.kind), ['review']);
  assert.equal(alarmClock(n), null, 'a soft clock never carries an alarm');
});

test('a park clock places and is eligible for the alarm', () => {
  const n = nodeOf(st(made('A'), clock('A', 6, 'park')), 'A');
  assert.deepEqual(placingClocks(n).map(c => c.kind), ['park']);
  assert.equal(alarmClock(n)!.kind, 'park');
});

test('a node with no clock places nothing', () => {
  const n = nodeOf(st(made('A')), 'A');
  assert.deepEqual(placingClocks(n), []);
  assert.equal(alarmClock(n), null);
  assert.equal(laneOf(n), null);
});

test('a clock with an invalid timestamp is skipped and the others stand', () => {
  const n = nodeOf(st(made('A'), clock('A', 3, 'due')), 'A');
  const broken: NodeState = {
    ...n,
    clocks: {
      ...n.clocks,
      start: { kind: 'start', at: 'not a date', setBy: 'x' } as never,
    },
  };
  assert.deepEqual(placingClocks(broken).map(c => c.kind), ['due']);
  assert.equal(alarmClock(broken)!.kind, 'due');
});

test('a passed clock names today, never an earlier day', () => {
  const n = nodeOf(st(made('A'), clock('A', -3, 'due')), 'A');
  const at = placingClocks(n)[0]!.at;
  assert.equal(dayNamed(at, NOW, atMidnight(DENVER)), '2026-07-29');
  assert.equal(calendarDay(at, NOW, DENVER), '2026-07-29', 'the file clamps the same way');
  assert.equal(dayOffset(dayNamed(at, NOW, atMidnight(DENVER)), NOW, atMidnight(DENVER)), 0);
});

test('the offset is whole days from today and never negative', () => {
  const mid = atMidnight(DENVER);
  assert.equal(dayOffset('2026-07-29', NOW, mid), 0);
  assert.equal(dayOffset('2026-07-30', NOW, mid), 1);
  assert.equal(dayOffset('2026-08-28', NOW, mid), 30);
  assert.equal(dayOffset('2026-07-01', NOW, mid), 0);
});

test('a boundary of 3 moves the day at 03:00, and midnight does not', () => {
  // 02:30 and 03:30 Denver on the 29th, a day with no clamp in the way.
  const early = '2026-07-29T08:30:00.000Z';
  const later = '2026-07-29T09:30:00.000Z';
  const longBefore = '2026-07-27T18:00:00.000Z';
  const three = { zone: DENVER, boundary: 3 };
  assert.equal(dayNamed(early, longBefore, three), '2026-07-28');
  assert.equal(dayNamed(later, longBefore, three), '2026-07-29');
  assert.equal(dayNamed(early, longBefore, atMidnight(DENVER)), '2026-07-29');
  assert.equal(dayNamed(later, longBefore, atMidnight(DENVER)), '2026-07-29');
});

test('the file and the view name the same morning for every node the file carries', () => {
  const s = st(
    made('A'), clock('A', 3, 'due'),
    made('B'), clock('B', 5, 'suspense'), clock('B', 9, 'due'),
    made('C'), clock('C', 2, 'start'), clock('C', 8, 'due'),
    made('P'), clock('P', 6, 'park'),
    made('S'), clock('S', 4, 'review', 't'),                  // soft: view only
    made('G'), clock('G', 1, 'review', 'gate:node.created'),  // the gate's own: neither
    made('X'), clock('X', -2, 'due'),                         // passed: clamps to today
  );
  const file = toCalendar(s, NOW, DENVER).replace(/\r\n[ \t]/g, '');
  const rows = [...file.matchAll(/UID:(.+)@quietkeep\r\nDTSTAMP:[^\r]*\r\nDTSTART;VALUE=DATE:(\d{8})/g)]
    .map(m => ({ id: m[1]!, day: `${m[2]!.slice(0, 4)}-${m[2]!.slice(4, 6)}-${m[2]!.slice(6, 8)}` }));
  assert.deepEqual(rows.map(r => r.id).sort(), ['A', 'B', 'C', 'P', 'X']);

  const view = datedDays(s, NOW, DENVER);
  for (const r of rows) {
    const alarm = alarmClock(nodeOf(s, r.id))!;
    assert.equal(r.day, dayNamed(alarm.at, NOW, atMidnight(DENVER)),
      `${r.id}: the file's day is the reading's day`);
    const onThatDay = view.find(d => d.day === r.day);
    assert.ok(onThatDay?.items.some(i => i.node.id === r.id),
      `${r.id}: the view carries it on the file's day`);
  }
  // The view places a node once for each clock the reading admits.
  const viewCount = (id: string): number =>
    view.flatMap(d => d.items).filter(i => i.node.id === id).length;
  for (const id of ['A', 'B', 'C', 'P', 'S', 'X']) {
    assert.equal(viewCount(id), placingClocks(nodeOf(s, id)).length, `${id}: once for each clock`);
  }
  assert.equal(viewCount('G'), 0, 'the gate\'s own review clock is on no day');
});

test('the calendar kinds are one set, whichever module is asked', () => {
  assert.equal(FROM_ICS, CALENDAR_KINDS);
  assert.deepEqual([...CALENDAR_KINDS].sort(), ['due', 'park', 'start', 'suspense']);
});
