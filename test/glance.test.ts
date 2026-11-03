// The weeks ahead (3.27.0, src/glance.ts).
//
// A projection of what the log already holds, laid out in time above the hub's
// doors. These tests are about what it must never draw (anything before today,
// a clock the app wrote, a figure for the pile of things not sorted yet) and
// what it must always say (seven days, the real dates of a stretch, who a thing
// is with). State is built from events through the fold, as
// `test/dated.test.ts` does.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { fold as foldEvents, emptyState, type State } from '../src/fold.ts';
import {
  glanceView, dayMoreWords, spansMoreWords, waitingCountWords, unsortedMoreWords,
  GLANCE_DAYS, GLANCE_WEEK, DAY_CAP, SPAN_CAP, WAIT_CAP, SORT_CAP,
} from '../src/glance.ts';
import { datedDays } from '../src/dated.ts';
import { peopleWords } from '../src/people.ts';
import { PLAIN_CHROME_HIDDEN } from '../src/plain.ts';
import type { AppEvent } from '../src/events.ts';

const DENVER = 'America/Denver';
const NOW = '2026-07-29T18:00:00.000Z';           // 12:00 on the 29th, Denver
const DAY = 86_400_000;
const AT = (days: number): string => new Date(Date.parse(NOW) + days * DAY).toISOString();

let seq = 0;
const ev = (kind: string, node: string, payload: unknown, at = '2026-07-01T12:00:00.000Z'): AppEvent =>
  ({ id: `g${seq}`, vault: 'personal', at, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const st = (...events: AppEvent[]): State => foldEvents(events);

const made = (id: string, title = id, nodeKind = 'action'): AppEvent =>
  ev('node.created', id, { nodeKind, title });
const clock = (id: string, days: number, kind = 'due', source = 't'): AppEvent =>
  ev('clock.set', id, { clockKind: kind, at: AT(days), source });
const item = (id: string, title: string, days: number, kind = 'due'): AppEvent[] =>
  [made(id, title), clock(id, days, kind)];

const titlesOn = (s: State, offset: number): string[] => {
  const v = glanceView(s, NOW, DENVER);
  const day = [...v.week, ...v.month].find(d => d.offset === offset);
  return day ? day.items.map(i => i.node.id) : [];
};

const everyTitle = (s: State): string[] => {
  const v = glanceView(s, NOW, DENVER);
  return [...v.week, ...v.month].flatMap(d => d.items.map(i => i.node.id));
};

test('nothing before today is drawn: only the clock that is ahead appears', () => {
  const s = st(
    ...item('PASTSOFT', 'a start that went by', -1, 'start'),
    ...item('PASTHARD', 'a hard date that went by', -2, 'due'),
    ...item('AHEAD', 'the one ahead', 1),
  );
  assert.deepEqual(everyTitle(s), ['AHEAD'], 'only tomorrow is on any day of the week or the month');
  assert.deepEqual(titlesOn(s, 0), [], 'and today holds none of what went by');
  assert.deepEqual(titlesOn(s, 1), ['AHEAD']);
});

test('a passed hard date is absent from every day while the days-ahead view still carries it', () => {
  const s = st(...item('PASTHARD', 'a hard date that went by', -2, 'due'), ...item('AHEAD', 'ahead', 2));
  assert.equal(everyTitle(s).includes('PASTHARD'), false);
  const carried = datedDays(s, NOW, DENVER).flatMap(d => d.items.map(i => i.node.id));
  assert.ok(carried.includes('PASTHARD'), 'the days-ahead view is unchanged and still holds it');
});

test('a lane spans its two dates', () => {
  const s = st(made('L', 'the long one'), clock('L', 10, 'due'), clock('L', 3, 'start'));
  const v = glanceView(s, NOW, DENVER);
  assert.equal(v.spans.length, 1);
  const span = v.spans[0]!;
  assert.equal(span.startOffset, 3);
  assert.equal(span.dueOffset, 10);
  assert.equal(span.from, 3);
  assert.equal(span.to, 10);
  assert.equal(span.startedAlready, false);
  assert.equal(span.runsPast, false);
  assert.match(span.words, /^Starts in 3 days, due .*8.*\.$/, span.words);
});

test('a lane whose start has passed begins at today', () => {
  const s = st(made('L', 'already under way'), clock('L', 6, 'due'), clock('L', -5, 'start'));
  const span = glanceView(s, NOW, DENVER).spans[0]!;
  assert.equal(span.startOffset, 0);
  assert.equal(span.from, 0);
  assert.equal(span.dueOffset, 6);
  assert.equal(span.startedAlready, true);
  assert.match(span.words, /^Started /);
});

test('a lane ending after the thirty days fills to the last column and states the real day', () => {
  const s = st(made('L', 'a long way out'), clock('L', 60, 'due'), clock('L', 2, 'start'));
  const span = glanceView(s, NOW, DENVER).spans[0]!;
  assert.equal(span.runsPast, true);
  assert.equal(span.to, GLANCE_DAYS - 1);
  assert.equal(span.dueOffset, 60);
  assert.match(span.words, /^Starts in 2 days, due /);
  assert.equal(/\b30\b/.test(span.words), false, 'the words carry the real due day, not the edge of the drawing');
});

test('an app-written review clock places nothing, and the capture is still to sort', () => {
  const s = st(
    ev('capture.recorded', 'CAP', { text: 'just captured', source: 'quick', sourceTags: [] }),
    ev('clock.set', 'CAP', { clockKind: 'review', at: AT(0), source: 'gate:node.created' }),
  );
  const v = glanceView(s, NOW, DENVER);
  assert.deepEqual(everyTitle(s), [], 'it is on no day');
  assert.equal(v.spans.length, 0, 'and in no stretch');
  assert.deepEqual(v.unsorted.shown.map(n => n.id), ['CAP'], 'while it does appear under still to sort');
});

test('a review clock a person set appears on its day', () => {
  const s = st(...item('W', 'a project the reader dated', 4, 'review'));
  assert.deepEqual(titlesOn(s, 4), ['W']);
});

test('the week and the month hold only days with a title; an empty day is not drawn', () => {
  const sparse = glanceView(st(...item('A', 'one thing', 2)), NOW, DENVER);
  assert.deepEqual(sparse.week.map(d => d.offset), [2], 'only the day that carries a title is drawn');
  assert.equal(sparse.week.every(d => d.items.length > 0 && d.offset < GLANCE_WEEK), true);
  assert.deepEqual(sparse.month, [], 'no day beyond the week has a title');
  assert.equal(sparse.anyDated, true);

  const later = glanceView(st(...item('B', 'only a later thing', 12)), NOW, DENVER);
  assert.deepEqual(later.week, [], 'nothing in the week is not drawn as seven empty days');
  assert.equal(later.anyDated, true, 'and the later day still counts as something dated');

  const s = st(...item('A', 'one thing', 2), ...item('B', 'a later thing', 12));
  const v = glanceView(s, NOW, DENVER);
  assert.deepEqual(v.month.map(d => d.offset), [12], 'a run of empty days is not drawn');
  assert.equal(v.words, 'Dated things, day by day, from today.');
});

test('bounds: a day, the stretches, the waiting rows and the unsorted titles are each capped', () => {
  // Six titles on one future day show three and one line.
  const six = st(...['a', 'b', 'c', 'd', 'e', 'f'].flatMap(k => item(`D${k}`, `title ${k}`, 3)));
  const day = glanceView(six, NOW, DENVER).week.find(d => d.offset === 3)!;
  assert.equal(DAY_CAP, 3);
  assert.equal(day.items.length, DAY_CAP);
  assert.equal(day.hidden, 3);
  assert.equal(dayMoreWords(day.hidden), '3 more on this day.');
  assert.equal(dayMoreWords(1), '1 more on this day.');

  // Five lanes show four and a count of one more.
  const lanes = st(...[1, 2, 3, 4, 5].flatMap(i => [
    made(`L${i}`, `stretch ${i}`), clock(`L${i}`, 4 + i, 'due'), clock(`L${i}`, 1, 'start'),
  ]));
  const lv = glanceView(lanes, NOW, DENVER);
  assert.equal(lv.spans.length, SPAN_CAP);
  assert.equal(lv.spansMore, 1);
  assert.equal(spansMoreWords(1), 'One more stretch is not shown.');

  // Four waiting rows show three and carry "These 3 first."
  const wait = st(
    made('p1', 'Sam', 'person'),
    ...[1, 2, 3, 4].flatMap(i => [
      made(`W${i}`, `waiting thing ${i}`, 'waiting-for'),
      clock(`W${i}`, 0, 'review'),
      ev('waiting.opened', `W${i}`, { person: 'p1', forWhat: 'it', since: AT(-3) }),
    ]),
  );
  const wv = glanceView(wait, NOW, DENVER);
  assert.equal(wv.waiting.total, 4);
  assert.equal(wv.waiting.shown.length, WAIT_CAP);
  assert.equal(waitingCountWords(wv.waiting.total, wv.waiting.shown.length),
    `${peopleWords(4)} These 3 first.`);

  // Five unsorted show three and say more are waiting.
  const sorted = st(...[1, 2, 3, 4, 5].map(i =>
    ev('capture.recorded', `U${i}`, { text: `loose thought ${i}`, source: 'quick', sourceTags: [] })));
  const uv = glanceView(sorted, NOW, DENVER);
  assert.equal(uv.unsorted.shown.length, SORT_CAP);
  assert.equal(uv.unsorted.more, true);
  assert.equal(unsortedMoreWords(uv.unsorted.shown.length), 'More are waiting. These 3 first.');
});

test('the waiting block carries the right count: the People door\'s own sentence', () => {
  const build = (n: number): State => st(
    made('p1', 'Sam', 'person'),
    ...Array.from({ length: n }, (_, i) => [
      made(`W${i}`, `waiting thing ${i}`, 'waiting-for'),
      clock(`W${i}`, 0, 'review'),
      ev('waiting.opened', `W${i}`, { person: 'p1', forWhat: 'it', since: AT(-3) }),
    ]).flat(),
  );
  for (const n of [1, 2, 5]) {
    const v = glanceView(build(n), NOW, DENVER);
    assert.equal(v.waiting.total, n);
    assert.equal(waitingCountWords(v.waiting.total, v.waiting.shown.length).startsWith(peopleWords(n)), true);
    assert.equal(v.waiting.shown.every(w => w.whom === 'Sam'), true, 'who it is with is named');
  }
  assert.equal(glanceView(build(0), NOW, DENVER).waiting.total, 0, 'with none, the block is absent');
});

test('the unsorted block carries no total: no figure for the pile, at one, three or forty', () => {
  for (const n of [1, 3, 40]) {
    const s = st(...Array.from({ length: n }, (_, i) =>
      ev('capture.recorded', `U${i}`, { text: `thought ${i}`, source: 'quick', sourceTags: [] })));
    const v = glanceView(s, NOW, DENVER);
    assert.deepEqual(Object.keys(v.unsorted).sort(), ['more', 'shown'], 'the view has no total field');
    const said = v.unsorted.more ? unsortedMoreWords(v.unsorted.shown.length) : '';
    const figures = said.match(/\d+/g) ?? [];
    assert.deepEqual(figures.filter(f => f !== String(SORT_CAP)), [], `no figure for the pile at ${n}`);
  }
});

test('the glance, the days-ahead view and the calendar agree on every day', () => {
  const s = st(
    ...item('A', 'renew the pass', 3),
    ...item('B', 'the answer for the review', 5, 'suspense'),
    ...item('W', 'a dated project', 4, 'review'),
    ...item('M', 'far out', 20),
    made('L', 'a stretch'), clock('L', 9, 'due'), clock('L', 2, 'start'),
  );
  const view = datedDays(s, NOW, DENVER);
  const glance = glanceView(s, NOW, DENVER);
  const drawn = [...glance.week, ...glance.month];
  for (const d of drawn) {
    for (const it of d.items) {
      const there = view.find(v => v.day === d.day);
      assert.ok(there?.items.some(i => i.node.id === it.node.id && i.kind === it.kind),
        `${it.node.id} is on ${d.day} in the days-ahead view too`);
    }
  }
  for (const v of view.filter(x => x.days < GLANCE_DAYS)) {
    for (const it of v.items) {
      const mine = drawn.find(d => d.day === v.day);
      assert.ok(mine?.items.some(i => i.node.id === it.node.id && i.kind === it.kind),
        `${it.node.id} on ${v.day} in the view is on the same day in the glance`);
    }
  }
});

test('the empty store renders: no days at all, nothing else, and no refused word', () => {
  const v = glanceView(emptyState(), NOW, DENVER);
  assert.deepEqual(v.week, []);
  assert.deepEqual(v.month, []);
  assert.equal(v.anyDated, false);
  assert.deepEqual(v.spans, []);
  assert.equal(v.waiting.total, 0);
  assert.deepEqual(v.unsorted.shown, []);
  assert.equal(v.words, 'Nothing you hold carries a date in the next thirty days.');
  const everything = JSON.stringify(v) + [
    dayMoreWords(2), spansMoreWords(3), waitingCountWords(0, 0), unsortedMoreWords(3),
  ].join(' ');
  assert.equal(/overdue|\blate\b|streak|score|rank|percent|%|behind|failed|missed/i.test(everything), false,
    'no word the app refuses, and no sentence that places a failure in the reader');
});

test('no color carries meaning: the glance rules use neither the accent nor the warm token', () => {
  const css = readFileSync(new URL('../public/app.css', import.meta.url), 'utf8');
  const from = css.indexOf('\n.glance {');
  assert.ok(from > 0, 'the glance rules are in the stylesheet');
  const rules = css.slice(from);
  assert.equal(rules.includes('--accent'), false);
  assert.equal(rules.includes('--warm'), false);
});

test('the plain mode hides the glance with the hub, both halves', () => {
  assert.ok((PLAIN_CHROME_HIDDEN as readonly string[]).includes('#glance'));
  assert.ok((PLAIN_CHROME_HIDDEN as readonly string[]).includes('#glance-after'));
});

test('the first screen: who is waited on and what is still to sort stand beneath the doors', () => {
  const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  const glance = html.indexOf('<section id="glance"');
  const hub = html.indexOf('<section id="hub"');
  const after = html.indexOf('<section id="glance-after"');
  assert.ok(glance > 0 && hub > glance && after > hub,
    'the days are above the hub and the second half is below it');
});
