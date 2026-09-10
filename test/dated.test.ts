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

test('the view is the export PLUS the soft dates the reader set — and nothing else', () => {
  // THIS ASSERTED IDENTICAL MEMBERSHIP UNTIL 3.23.21, and the widening is the
  // point rather than a relaxation, so the difference is pinned exactly.
  //
  // `CALENDAR_KINDS` was one predicate answering two questions — did a person
  // set this, and may it carry an alarm. The second keeps the FILE narrow and
  // must: an alarm on a soft clock is the nag ADR-0056 and entry 15 refuse. The
  // first governs what the app shows somebody about their own dates, and a
  // `review` clock is what gets written when they press *Next action*, answer
  // *when should this come back*, or type a date on a project. Three deliberate
  // acts, invisible to the one surface that answers "what is coming".
  //
  // The old fixture's own comment was wrong about why W was excluded: it said
  // "app clock" while giving it `source: 't'`, which is not a cure at all. It
  // was out purely on kind. A real cure is used below so the exclusion that
  // MUST hold is actually exercised.
  const s = st(
    ...item('A', 'renew the pass', 3),
    ...item('B', 'the answer for the review', 5, 'suspense'),
    ...item('W', 'a project the reader dated', 4, 'review'),    // reader-set soft — view only
    ev('node.created', 'U', { nodeKind: 'action', title: 'undated' }),
    ev('clock.set', 'U', {
      clockKind: 'review',
      at: new Date(Date.parse(NOW) + 86_400_000).toISOString(),
      source: 'gate:node.created',                              // the gate's cure — out of both
    }),
    ...item('M', 'a want', 2),
    ev('menu.item.added', 'M', { category: 'read' }),           // Menu is demand-free — out of both
    ...item('D', 'already finished', 2),
    ev('done.marked', 'D', { at: NOW }),                        // done — out of both
  );
  const view = datedDays(s, NOW, DENVER);
  const file = fileIds(toCalendar(s, NOW, DENVER));

  assert.deepEqual(file, ['A', 'B'], 'the file holds only what a calendar can sensibly alarm on');
  assert.deepEqual(shownIds(view), ['A', 'B', 'W'],
    'the view holds those and the date the reader set on a project');

  // A SUPERSET, stated as one: everything in the file is on the screen, and the
  // difference is exactly the reader-set soft clocks. Neither half alone would
  // catch the view quietly losing a hard date.
  assert.ok(file.every(id => shownIds(view).includes(id)),
    'nothing the file carries is missing from the screen');
  assert.deepEqual(shownIds(view).filter(id => !file.includes(id)), ['W'],
    'and the only difference is the soft date somebody set by hand');

  // THE CURE IS IN NEITHER, which is what keeps the widening from filling the
  // view with dates nobody chose — every node carries one from birth.
  assert.equal(shownIds(view).includes('U'), false,
    'the gate\'s own cure is not a date the reader set');

  // The ⓘ count still counts the FILE, because that is what it is a count of.
  assert.equal(file.length, calendarCount(s, NOW, DENVER),
    'and the count beside the export is the export\'s');
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

test('a date the reader typed shows on ITS day, not only the soonest clock', () => {
  // THE SIXTH COLD READ, second half of its worst finding. Five dates were
  // set through a picker and one surface reported "1 thing has a date you
  // set" — and a thing dated five weeks out was filed under TODAY.
  //
  // THE CAUSE. `soonestAt` returns ONE clock per node, which is right for the
  // FILE: a diary carrying two events for one thing is noise, and that
  // narrowness is ADR-0056 and entry 15. A node sorted today carries a review
  // clock for today, so the soonest is always the review — and the due date
  // the reader typed appeared on NO SURFACE. `ics.ts`'s own header had
  // already written the rule it was breaking: a date they set that appears on
  // no surface is a date they go on carrying, entry 28's 50% condition.
  //
  // BOTH ROWS ARE TRUE AND BOTH BELONG. It really does come back today,
  // because it was sorted today; it really is due in September. The defect
  // was never that today was wrong — it was that September was missing.
  const s = st(
    ev('node.created', 'T', { nodeKind: 'action', title: 'winter tires' }),
    clockAt('T', 0, 'review'),      // sorted today — this is the soonest
    clockAt('T', 35, 'due'),        // and the date the reader typed
  );
  const days = datedDays(s, NOW, DENVER);
  const on = (d: number): string[] => {
    const at = new Date(Date.parse(NOW) + d * 86_400_000).toISOString().slice(0, 10);
    return (days.find(x => x.day === at)?.items ?? []).map(i => i.kind);
  };
  assert.deepEqual(on(35), ['due'],
    'the date typed on the sheet is on its own day, which it was not before');
  assert.deepEqual(on(0), ['review'],
    'and it still says it comes back today, because it does');
});

test('the exported FILE still carries one event per thing', () => {
  // The other half, and the reason the view's widening is behind the same
  // flag rather than done everywhere: a calendar with two alarms for one item
  // is the nag entry 15 refuses.
  const s = st(
    ev('node.created', 'T', { nodeKind: 'action', title: 'winter tires' }),
    clockAt('T', 0, 'review'),
    clockAt('T', 35, 'due'),
  );
  const ics = toCalendar(s, NOW, DENVER);
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 1,
    'one thing, one event — the view got wider and the file did not');
});
