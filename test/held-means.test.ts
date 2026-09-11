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

import { admit, coverageGauge, coverageProof, heldNodes, heldWork, silentNodes, whyCovered } from '../src/gate.ts';
import { comingBack, furtherOut, heldGroups, undatedCount } from '../src/held.ts';
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

test('held-means: the empty offer accounts for every dated thing, not just the near ones', () => {
  // THE SIXTH COLD READ'S THIRD UNTRUE STATEMENT, reproduced as arithmetic.
  //
  // *See what is next* said "9 things come back to you … 10 things are here
  // without a date" while *What comes back, and when* said "12 with a day", and
  // three dated projects appeared in NEITHER of the first screen's two numbers.
  // The reader cannot reconcile two screens that disagree about the size of
  // their own store, and the one they are more likely to trust is the one that
  // is wrong.
  //
  // The cause is a bucket, not a count. `comingBack` reads the `soon` group,
  // which is `1 <= days <= SOON_DAYS` by construction — so anything dated
  // further out than a week is named by neither sentence: it is not undated and
  // it is not coming back soon. `ready` and `replan` fall through the same gap
  // whenever the offer is empty for another reason.
  let s = write(emptyState(), [ev('node.created', 'U1', { nodeKind: 'action', title: 'one nobody dated' })]);
  s = write(s, [ev('node.created', 'S1', { nodeKind: 'action', title: 'one for Thursday' })]);
  s = write(s, [ev('clock.set', 'S1', {
    clockKind: 'review', at: '2026-08-05T18:00:00.000Z', source: 'test',   // 3 days out
  })]);
  for (const id of ['L1', 'L2', 'L3']) {
    s = write(s, [ev('node.created', id, { nodeKind: 'project', title: `${id} — dated, and months away` })]);
    s = write(s, [ev('clock.set', id, {
      clockKind: 'review', at: '2026-09-30T18:00:00.000Z', source: 'test',  // 59 days out
    })]);
  }

  assert.equal(coverageGauge(s).total, 5, 'five things are held');
  assert.equal(undatedCount(s, NOW, TZ), 1, 'one of them carries no date');
  const back = comingBack(s, NOW, TZ);
  assert.equal(back?.count, 1, 'one of them comes back inside the week');

  // THE PROPERTY. Every held thing is named by one of the sentences the empty
  // offer can say, or the screen is silent about something it is holding —
  // which is entry 3 of `docs/nd-collisions.md` committed by the app.
  const far = furtherOut(s, NOW, TZ);
  assert.equal(far?.count, 3, 'and three carry a day further out than the week');
  assert.equal(far?.words, 'Sep 30', 'named by the nearest of them, as a date and not a countdown');

  // THE PROPERTY. Every held thing is named by one of the sentences the empty
  // offer can say, or the screen is silent about something it is holding — which
  // is entry 3 of `docs/nd-collisions.md` committed by the app.
  //
  // `ready` and `replan` are excluded from the sum ON PURPOSE and each has a
  // surface of its own: a passed hard date raises a replan card directly above
  // this, and a `ready` item the offer is not making is behind something, which
  // the Behind list names. They are asserted empty here so this stays a
  // statement about a store where the offer is genuinely empty for the reason
  // the three sentences are about.
  const groups = new Map(heldGroups(s, NOW, TZ).map(g => [g.key, g.items.length]));
  assert.equal(groups.get('ready') ?? 0, 0, 'nothing has arrived');
  assert.equal(groups.get('replan') ?? 0, 0, 'and no date has gone by');
  const standing = heldGroups(s, NOW, TZ)
    .filter(g => g.key !== 'done' && g.key !== 'menu' && g.key !== 'unsorted')
    .flatMap(g => g.items).length;
  assert.equal(undatedCount(s, NOW, TZ) + (back?.count ?? 0) + (far?.count ?? 0), standing,
    'the three numbers on the empty offer sum to everything it is standing over');
});

test('held-means: the app\u2019s own marker is not a day the reader set', () => {
  // THE OTHER HALF OF THE SAME FINDING, and the plainest contradiction in the app.
  //
  // The gate cures EVERY undated node with a `review` clock so that nothing can
  // go silent (law 1). `whyCovered` asked whether any clock existed at all, so a
  // node nobody had dated came back `clock` — and the coverage sheet's count says
  // "with a day they come back to you" about that reason. Measured on a store of
  // one such action: *See what is next* said "One thing is here without a date"
  // and *What comes back, and when* said "1 with a day they come back to you",
  // about that same node, at the same moment. The sheet's ROW said "returns
  // today" too, and the row sorted to the FRONT of a list ordered by when things
  // come back.
  //
  // This is the FIFTH round of `whyCovered`'s one mistake — Menu before clock
  // twice, then Done before clock — and its docblock now carries all of them.
  // `cure` rather than `null`: the cure is real and the thing does come back, so
  // filing it under the exceptions would deny a promise the app keeps. What was
  // wrong was the words.
  const s = write(emptyState(), [ev('node.created', 'C', { nodeKind: 'action', title: 'nobody dated this' })]);
  const node = s.nodes.get('C')!;
  assert.ok(Object.values(node.clocks).length > 0, 'the gate cured it, as law 1 requires');
  assert.equal(whyCovered(node, s), 'cure', 'covered, and not by a day anybody set');
  assert.equal(undatedCount(s, NOW, TZ), 1, 'which is the same thing the offer says about it');
  assert.deepEqual(coverageProof(s).reasons, [{ reason: 'cure', count: 1 }],
    'so the proof gives the reason a reader could check from outside');
  assert.equal(coverageProof(s).holds, true, 'and it is still covered \u2014 the cure is not a failure');

  // A DATE SOMEBODY SET STILL READS AS ONE. The fix must not swallow the real case.
  let dated = write(emptyState(), [ev('node.created', 'D', { nodeKind: 'action', title: 'ring the plumber' })]);
  dated = write(dated, [ev('clock.set', 'D', {
    clockKind: 'due', at: '2026-08-05T18:00:00.000Z', source: 'test',
  })]);
  assert.equal(whyCovered(dated.nodes.get('D')!, dated), 'clock', 'a due date is a day you set');
});
