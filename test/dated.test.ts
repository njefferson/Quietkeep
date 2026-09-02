// The days ahead, inside the app (3.22.0, src/dated.ts).
//
// The `.ics` export was built "so the OS calendar does the notifying"
// (ADR-0007) and it is a snapshot by nature. This surface is the other half:
// the same dated days, on a screen that follows the log — because an
// answer-owed date MOVES, and the person who works to those dates was changing
// apps to watch a copy that cannot move.
//
// The load-bearing property, held here in both directions: THE VIEW IS THE
// EXPORT'S SELECTION. Same items, same days. If they can disagree, one of them
// is misreporting the reader's obligations — the 0.9.0 dropped-replan /
// review-export defect class, which is the worst thing this app knows how to do.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fold as foldEvents, type State } from '../src/fold.ts';
import { datedDays, datedDayWords, datedWords, datedKindWords } from '../src/dated.ts';
import { toCalendar, calendarCount } from '../src/ics.ts';
import type { AppEvent } from '../src/events.ts';

const DENVER = 'America/Denver';
const KIRITIMATI = 'Pacific/Kiritimati';          // UTC+14
const NOW = '2026-07-29T18:00:00.000Z';           // 12:00 on the 29th, Denver

let seq = 0;
const ev = (kind: string, node: string, payload: unknown, at = '2026-07-01T12:00:00.000Z'): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const st = (...events: AppEvent[]): State => foldEvents(events);

const clockAt = (id: string, days: number, kind = 'due'): AppEvent =>
  ev('clock.set', id, { clockKind: kind, at: new Date(Date.parse(NOW) + days * 86_400_000).toISOString(), source: 't' });

const item = (id: string, title: string, days = 0, kind = 'due'): AppEvent[] =>
  [ev('node.created', id, { nodeKind: 'action', title }), clockAt(id, days, kind)];

/** Node ids the view shows, flattened. */
const shownIds = (days: ReturnType<typeof datedDays>): string[] =>
  days.flatMap(d => d.items.map(i => i.node.id)).sort();

/** Node ids the FILE holds, read off its UID lines the way a parser would. */
const fileIds = (ics: string): string[] =>
  [...ics.replace(/\r\n[ \t]/g, '').matchAll(/^UID:(.+)@quietkeep$/gm)].map(m => m[1]!).sort();

test('the view IS the export: identical membership on a mixed store', () => {
  const s = st(
    ...item('A', 'renew the pass', 3),
    ...item('B', 'the answer for the review', 5, 'suspense'),
    ...item('W', 'a review-only marker', 4, 'review'),          // app clock — out of both
    ev('node.created', 'U', { nodeKind: 'action', title: 'undated' }),
    ev('clock.set', 'U', { clockKind: 'review', at: new Date(Date.parse(NOW) + 86_400_000).toISOString(), source: 'gate' }),
    ...item('M', 'a want', 2),
    ev('menu.item.added', 'M', { category: 'read' }),           // Menu is demand-free — out of both
    ...item('D', 'already finished', 2),
    ev('done.marked', 'D', { at: NOW }),                        // done — out of both
  );
  const view = datedDays(s, NOW, DENVER);
  assert.deepEqual(shownIds(view), ['A', 'B'], 'exactly the exportable items, nothing else');
  assert.deepEqual(shownIds(view), fileIds(toCalendar(s, NOW, DENVER)),
    'the screen and the file hold the same nodes');
  assert.equal(view.flatMap(d => d.items).length, calendarCount(s, NOW, DENVER),
    'and the ⓘ count is the same number');
  // PLANT: any private re-walk of the clocks here — a fourth definition — lets
  // one surface gain or lose an item without the others noticing, which is how
  // 0.9.0 silently dropped every passed hard date from the calendar.
});

test('the view names the same DAYS the file dates', () => {
  const s = st(...item('A', 'the shared submission', 6, 'suspense'));
  const view = datedDays(s, NOW, DENVER);
  const dtstart = /^DTSTART;VALUE=DATE:(\d{8})$/m.exec(toCalendar(s, NOW, DENVER).replace(/\r\n[ \t]/g, ''));
  assert.ok(dtstart, 'the file dates the event');
  assert.equal(view[0]!.day.replace(/-/g, ''), dtstart![1],
    'same morning on the screen as in the diary');
});

test('days group in the reader’s own zone, not the server’s', () => {
  // 22:00Z on the 30th is still the 30th in UTC and already the 31st at UTC+14.
  const at = '2026-07-30T22:00:00.000Z';
  const s = st(
    ev('node.created', 'A', { nodeKind: 'action', title: 'far east' }),
    ev('clock.set', 'A', { clockKind: 'due', at, source: 't' }),
  );
  assert.equal(datedDays(s, NOW, KIRITIMATI)[0]!.day, '2026-07-31');
  assert.equal(datedDays(s, NOW, DENVER)[0]!.day, '2026-07-30');
});

test('a passed hard date arrives under today, wearing the held list’s own words', () => {
  const s = st(...item('L', 'the lapsed one', -4), ...item('A', 'an ordinary one', 2));
  const view = datedDays(s, NOW, DENVER);
  assert.ok(view.every(d => d.days >= 0), 'no past day is ever rendered — the diary has none either');
  const today = view[0]!;
  assert.equal(today.days, 0, 'the lapsed item is clamped to today, exactly as its exported event is');
  assert.equal(today.items[0]!.node.id, 'L');
  assert.equal(today.items[0]!.note, 'needs a new plan',
    'the replan surface’s words, verbatim — never a second phrasing of one state');
  assert.equal(view[1]!.items[0]!.note, null, 'an ordinary dated thing carries no note');
});

test('an answer-owed date is named as one, with whom', () => {
  const s = st(
    ev('node.created', 'P', { nodeKind: 'person', title: 'Sam' }),
    ...item('A', 'the figures for the review', 5, 'suspense'),
    ev('person.linked', 'A', { node: 'A', person: 'P', relation: 'waiting-on' }),
  );
  const it = datedDays(s, NOW, DENVER)[0]!.items[0]!;
  assert.equal(it.kind, 'suspense', 'the view says WHICH date is talking');
  assert.equal(datedKindWords(it.kind), 'answer owed', 'in the date group’s own vocabulary');
  assert.equal(it.whom, 'Sam', 'the name that turns a date into an opening sentence');
  // PLANT: folding suspense into a generic "due" chip goes red here, and it is
  // the collapse the whole surface was demanded to undo.
});

test('when due and answer-owed name one instant, the answer-owed date speaks', () => {
  const s = st(...item('A', 'both at once', 5, 'due'), clockAt('A', 5, 'suspense'));
  assert.equal(datedDays(s, NOW, DENVER)[0]!.items[0]!.kind, 'suspense');
});

test('the view follows a date change — that is its whole reason', () => {
  const base = [...item('A', 'the moving answer', 3, 'suspense')];
  const before = datedDays(st(...base), NOW, DENVER);
  assert.equal(before[0]!.days, 3);
  const after = datedDays(st(...base, clockAt('A', 7, 'suspense')), NOW, DENVER);
  assert.equal(after[0]!.days, 7, 'the item moved to its new day');
  assert.equal(after.flatMap(d => d.items).length, 1, 'and exists exactly once');
});

test('days come in order, each day exactly once, items in a stable order', () => {
  const s = st(
    ...item('C', 'third', 9), ...item('A', 'also first', 2),
    ...item('B', 'first', 2), ...item('D', 'second', 5),
  );
  const view = datedDays(s, NOW, DENVER);
  assert.deepEqual(view.map(d => d.days), [2, 5, 9]);
  assert.deepEqual(view[0]!.items.map(i => i.node.title), ['also first', 'first'],
    'within a day, by title — a total order, so two renders cannot disagree');
});

test('the headings say the day once, honestly', () => {
  const s = st(...item('A', 'now', 0), ...item('B', 'next', 1), ...item('C', 'later', 6));
  const view = datedDays(s, NOW, DENVER);
  assert.match(datedDayWords(view[0]!, NOW, DENVER), /^Today — .*July 29/,
    '"Today" keeps its date beside it — the sheet can outlive midnight');
  assert.match(datedDayWords(view[1]!, NOW, DENVER), /^Tomorrow — /);
  assert.doesNotMatch(datedDayWords(view[2]!, NOW, DENVER), /Today|Tomorrow|2026',/,
    'an ordinary day is just its date, this year unstated');
  const far = st(...item('F', 'far out', 400));
  assert.match(datedDayWords(datedDays(far, NOW, DENVER)[0]!, NOW, DENVER), /2027/,
    'another year says which year — held’s own rule');
});

test('the words grade nobody and tie the two halves together', () => {
  assert.match(datedWords(0), /own sheet/, 'an empty list says where a date comes from');
  assert.match(datedWords(3), /^3 dated things are ahead\./);
  assert.match(datedWords(3), /Send to my calendar/, 'the export named by its exact label');
  const s = st(...item('L', 'lapsed', -3, 'suspense'), ...item('A', 'fine', 4));
  const view = datedDays(s, NOW, DENVER);
  const everything = [
    datedWords(9), datedWords(1), datedWords(0),
    ...view.map(d => datedDayWords(d, NOW, DENVER)),
    ...view.flatMap(d => d.items.map(i => `${datedKindWords(i.kind)} ${i.note ?? ''}`)),
  ].join(' ');
  assert.doesNotMatch(everything, /overdue|late|behind|missed|should|slipped|score|%/i);
});

test('it narrows nothing — the projection is pure', () => {
  const s = st(...item('A', 'the brief', 3, 'suspense'));
  const before = JSON.stringify([...s.nodes.values()].map(n => [n.id, n.clocks]));
  datedDays(s, NOW, DENVER);
  assert.equal(JSON.stringify([...s.nodes.values()].map(n => [n.id, n.clocks])), before);
});
