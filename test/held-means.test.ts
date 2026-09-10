// What "held" means (1.15.1, ADR-0066).
//
// The gauge says "N held". The list under it itemises that claim. The todo list
// is what you actually work from. Between 1.13.0 and 1.15.1 those were THREE
// different sets, because the exclusions were hand-written inside `heldGroups`
// and the gauge did not have them — so a journal entry, which has no title by
// design, was itemized in the coverage list as "(untitled) — held".
//
// These tests pin the equality, and they pin the thing that must NOT follow
// from it: `silent` still runs over every node, because a proof that skips a
// kind proves nothing.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { admit, coverageGauge, heldNodes, heldWork, silentNodes } from '../src/gate.ts';
import { comingBack, heldGroups, undatedCount } from '../src/held.ts';
import { searchHeld } from '../src/search.ts';
import { fold, emptyState, type State } from '../src/fold.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';
const NOW = '2026-08-02T18:00:00.000Z';

let n = 0;
const ev = (kind: string, node: string | null, payload: unknown, over: Partial<AppEvent> = {}): AppEvent => ({
  id: (over.id as string) ?? `h${n++}`, vault: 'personal',
  at: (over.at as string) ?? '2026-08-02T12:00:00.000Z',
  device: 'd0', seq: (over.seq as number) ?? n, kind, node, payload,
} as AppEvent);
const write = (prior: State, offered: AppEvent[]): State => fold(admit(offered, prior), prior);

/** One of each thing that is held and is not work, beside one thing that is. */
function mixed(): State {
  let s = write(emptyState(), [
    ev('node.created', 'W', { nodeKind: 'action', title: 'ring the plumber' }),
  ]);
  // A journal entry: demand-free, and deliberately titleless (ADR-0061).
  s = write(s, [ev('node.created', 'J', { nodeKind: 'journal', title: '' })]);
  s = write(s, [ev('journal.entry.written', 'J', { v: 1, iv: 'aa', ct: 'Q1lQSEVSVEVYVA' })]);
  // A pebble: weight, with a title, and never a task (ADR-0014/0065).
  s = write(s, [ev('node.created', 'P', { nodeKind: 'pebble', title: 'the thing with the roof' })]);
  s = write(s, [ev('pebble.raised', 'P', { magnitude: 'rock', affects: [] })]);
  return s;
}

test('held-means: the gauge, the list it itemises, and the todo list are ONE set', () => {
  const s = mixed();
  const gauge = coverageGauge(s);
  const itemized = heldWork(s);                                   // the coverage list's rows
  const grouped = heldGroups(s, NOW, TZ).flatMap(g => g.items);   // the todo list's rows

  assert.equal(gauge.total, itemized.length,
    'the number and the list it invites you to open are one claim');
  assert.equal(gauge.total, grouped.length,
    'and the list you work from is the same claim again');
  assert.deepEqual(
    [...grouped.map(x => x.id)].sort(),
    [...itemized.map(x => x.id)].sort(),
    'the same nodes, not merely the same count',
  );
  assert.deepEqual(itemized.map(x => x.id), ['W'], 'and it is the work');
});

test('held-means: a journal entry appears in none of the three', () => {
  const s = mixed();
  assert.ok(!heldWork(s).some(x => x.id === 'J'), 'not itemized by the coverage list');
  assert.ok(!heldGroups(s, NOW, TZ).flatMap(g => g.items).some(x => x.id === 'J'),
    'and not a row in the todo list');
  // The defect this release exists for: it has no title, so it rendered as
  // "(untitled) — held" in the one list the gauge invites you to open.
  assert.equal(s.nodes.get('J')!.title, '', 'it has no title, by design');
});

test('held-means: a pebble is held, is not work, and is not searchable', () => {
  const s = mixed();
  assert.ok(heldNodes(s).some(x => x.id === 'P'), 'still a node you are holding — nothing is hidden');
  assert.ok(!heldWork(s).some(x => x.id === 'P'), 'but not work');
  // Search excludes it for a reason of its own: a result row is a door to a
  // detail sheet built for work, every verb of which the gate must then refuse
  // on a demand-free kind. Offered-then-refused (the 1.9.2 audit's F-B).
  assert.equal(searchHeld(s, 'roof').total, 0, 'and search does not offer a door it cannot open');
  assert.equal(searchHeld(s, 'plumber').total, 1, 'while real work is still findable');
});

test('held-means: `silent` is NOT narrowed — the proof runs over every node', () => {
  const s = mixed();
  // Both kinds are demand-free, so they satisfy law 1 without a clock. The
  // point is that they were CHECKED, not that they were skipped: excluding a
  // kind from a proof is how law 1 gets defined away (the 1.3.1 merged-node
  // finding), and it is why `silentNodes` reads `state.nodes` directly.
  assert.equal(coverageGauge(s).silent, 0, 'nothing is silent');
  assert.equal(silentNodes(s).length, 0);
  assert.equal(heldNodes(s).length, 3, 'and all three are still held');
  assert.equal(coverageGauge(s).total, 1, 'while one of them is work');
});

test('held-means: "you have not decided about these yet" counts only work', () => {
  // A pebble has no date BY CONSTRUCTION — the gate refuses a clock on a
  // demand-free kind — so counting one here would say "undecided" about the one
  // kind in the app there is nothing to decide about.
  const s = mixed();
  assert.equal(undatedCount(s, NOW, TZ), 1, 'the plumber, and nothing else');
});

test('held-means: no resume card is work, spent or not', () => {
  // The spent half moved out of `heldGroups` in 1.15.1. The other half landed in
  // 3.23.16, came back in 3.23.21 and is out again in 3.23.24 — and the churn is
  // the point of this comment, because the argument was never about the gauge.
  //
  // The gauge counts WORK. The app wrote this node, so counting it among the
  // reader's things is the same category error as a person, a place or a role.
  // What held it here for eight releases is that removing the row removed the
  // only "Pick it back up" in the app. 3.23.24 put that act on the WORK's own
  // row instead — `resumeCardFor` picks the label, `resumeEvents` runs and
  // spends the card — so the count can now say the true thing.
  let s = write(emptyState(), [ev('node.created', 'R', { nodeKind: 'resume-card', title: 'where you left off' })]);
  assert.equal(coverageGauge(s).total, 0, 'the app\u2019s own bookmark is not something you are holding');
  s = write(s, [ev('resume.card.spent', 'R', {})]);
  assert.equal(coverageGauge(s).total, 0, 'a spent one is residue, as it always was');
  assert.equal(heldGroups(s, NOW, TZ).flatMap(g => g.items).length, 0, 'and the two agree');
});


test('sorting things for tomorrow leaves the offer something true to say about them', () => {
  // THE FIFTH COLD READ'S WALL, reproduced. Seven things sorted as *Next action*
  // — which takes tomorrow's clock BY DESIGN, so a triage run does not become a
  // work session — and the offer said "Nothing is asking today" over a sentence
  // that counted only the UNDATED things. The seven were covered, were returning,
  // and were named nowhere. That is entry 3 of `docs/nd-collisions.md`, the
  // best-evidenced entry in the catalog and this product's thesis, committed by
  // the app: a surface that goes quiet about what it is holding.
  //
  // THE REMEDY IS THE SENTENCE, NOT THE CLOCK, and this test is where that is
  // pinned. The reader ALSO expected the seven to be offered today; that is an
  // expectation and not a finding, and the research supports saying what is
  // coming rather than moving when it comes. So the clock is asserted still to be
  // tomorrow, immediately below — if a later session decides to make next actions
  // same-day, this test should fail and be argued with, not quietly satisfied.
  let s = write(emptyState(), [ev('node.created', 'A', { nodeKind: 'action', title: 'ring the plumber' })]);
  s = write(s, [ev('clock.set', 'A', {
    clockKind: 'review',
    at: '2026-08-04T05:59:59.000Z',            // end of TOMORROW, Denver (NOW is noon on the 2nd there)
    source: 'clarify:next-action',
  })]);

  const back = comingBack(s, NOW, TZ);
  assert.ok(back, 'something dated for tomorrow is something coming back');
  assert.equal(back!.count, 1, 'and it is counted');
  assert.equal(back!.words, 'tomorrow', 'in the app\'s own word for that day');

  // The clock stands. Sorting is not doing.
  assert.equal(undatedCount(s, NOW, TZ), 0, 'it is not undated — it has a date, and the date is tomorrow');

  // AND NOTHING TO SAY WHEN THERE IS NOTHING, so the sentence cannot appear over
  // an empty store and read as a promise about work that does not exist.
  assert.equal(comingBack(emptyState(), NOW, TZ), null, 'an empty store has nothing coming back');
});
