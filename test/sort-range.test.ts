// Sort mode's foundations (1.3.0): named ranges, range hygiene, route parity,
// the defer verb's cure, and the inbox boundary.
//
// The four load-bearing claims, each with teeth:
//  - HYGIENE: no person, bother, container, demand-free kind, Menu item, or
//    finished thing can enter a sort range — an over-broad predicate offers
//    routes the gate must then refuse, the recorded anti-pattern.
//  - PARITY: routing an ARRIVED item writes the same facts the daily triage
//    writes for a captured one — sort mode is the same conveyor, not a second
//    dialect.
//  - THE INBOX BOUNDARY: the gauge stays captures-only, or law 8 acquires a
//    permanent 1,222 headline by omission. Since 2.15.0 an arrival latches
//    `captured` too, so the boundary is drawn on `arrived` rather than on
//    absence from the queue (2.38.0) — an arrival is sortable work, and it is
//    never a headline and never swept for heat.
//  - THE CURE: clearing the only clock (a start) through the gate re-covers
//    the node in the same transaction.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atMidnight } from '../src/time.ts';

import { fold, emptyState, type State } from '../src/fold.ts';
import { admit, silentNodes, gateOptionsFor, heldNodes } from '../src/gate.ts';
import {
  sortable, looseFromImport, underContainer, parkedAndBack, matchingQuery, rangeChoices,
  datesGoneBy,
} from '../src/range.ts';
import { raisesReplanCard } from '../src/replan.ts';
import { unclarified, needsHeat, inboxGauge } from '../src/triage.ts';
import { demandClocksOf, routeEvents, undoRouteEvents } from '../src/ui/triage-intents.ts';
import { setStartEvents, clearStartEvents, setDueEvents } from '../src/ui/detail-intents.ts';
import { heldStatus } from '../src/held.ts';
import { parseAnyExport, taskPaperEvents, type ImportContext } from '../src/taskpaper.ts';
import type { AppEvent, ClarifyRoute } from '../src/events.ts';
import type { StampContext } from '../src/ui/session.ts';

const TZ = 'America/Denver';                     // never UTC (V-13)
const NOW = '2026-07-29T18:00:00.000Z';
const OPTS = gateOptionsFor(TZ);

let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown, at = NOW): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const ctx = (): StampContext => ({
  at: NOW, device: 'd0', vault: 'personal', zone: TZ, day: atMidnight(TZ),
  seq: () => seq++, id: () => `i${seq}`,
});
const write = (prior: State, offered: AppEvent[]): State =>
  fold(admit(offered, prior, OPTS), prior);

/** A row shaped LIKE an import — `node.created`, cured by the gate.
 *
 *  NOT WHAT THE IMPORTER WRITES, and the comment here used to claim it was:
 *  "never captured", which was true when this was written and stopped being true
 *  in 2.15.0, when an import started landing in the inbox with `arrived: true`.
 *  Every range test below kept passing on rows the importer would never produce.
 *  `throughTheImporter` at the foot of this file is the fixture that can fail. */
/** An arrival, written the way the importer writes one.
 *
 *  `arrival` AS WELL AS `arrived`, since 3.11.0, and the two say different
 *  things: `arrived` is "came in with nothing to go on" and decides whether the
 *  offer may hand the row over; `arrival` is WHICH import, and is on every node
 *  the importer makes including the dated rows and the projects that `arrived`
 *  skips. A fixture writing only the first is a fixture writing rows the
 *  importer no longer produces, which is how this file's range tests stayed
 *  green through the defect 2.38.0 found (LESSONS 138). */
const IMPORTED_AT = '2026-08-01T09:00:00.000Z';
const imported = (
  prior: State, id: string, title: string, parent?: string, arrival = IMPORTED_AT,
): State =>
  write(prior, [ev('node.created', id, {
    nodeKind: 'action', title, provenance: { for: 'self' }, arrived: true, arrival,
    ...(parent ? { parent } : {}),
  })]);

/** A row MADE IN THIS APP — no capture, no arrival. What the clock tests below
 *  always meant by `imported()`, back when the two were indistinguishable. They
 *  are not: an arrival is an inbox item, so `heldStatus` says "not sorted yet"
 *  about it whatever clock it carries, and a test about the start clock's
 *  WORDING has to hold the inbox out of the way to say anything. */
const built = (prior: State, id: string, title: string, parent?: string): State =>
  write(prior, [ev('node.created', id, {
    nodeKind: 'action', title, provenance: { for: 'self' }, ...(parent ? { parent } : {}),
  })]);

const captured = (prior: State, id: string, text: string): State =>
  write(prior, [ev('capture.recorded', id, { text, source: 'quick', sourceTags: [] })]);

/** A state holding one of everything a range must and must not reach. */
function menagerie(): State {
  let s = emptyState();
  s = write(s, [ev('node.created', 'PROJ', { nodeKind: 'project', title: 'Boy Scouts' })]);
  s = imported(s, 'LOOSE1', 'loose imported one');
  s = imported(s, 'LOOSE2', 'loose imported two');
  s = imported(s, 'FILED', 'filed imported', 'PROJ');
  s = captured(s, 'CAP', 'a typed capture');
  s = write(s, [ev('person.created', 'PER', { name: 'Ada' })]);
  s = write(s, [ev('bother.received', 'BOTH', { text: 'the thing with the roof' })]);
  s = write(s, [ev('node.created', 'ASP', { nodeKind: 'aspiration', title: 'a wish' }),
    ev('menu.item.added', 'ASP', { category: 'try' })]);
  s = write(s, [ev('node.created', 'ONMENU', { nodeKind: 'action', title: 'somedayed' }),
    ev('menu.item.added', 'ONMENU', { category: 'read' })]);
  s = write(s, [ev('node.created', 'DONE', { nodeKind: 'action', title: 'finished' }),
    ev('done.marked', 'DONE', { at: NOW })]);
  s = write(s, [ev('node.created', 'GONE', { nodeKind: 'action', title: 'let go' }),
    ev('node.trashed', 'GONE', { reason: 't' })]);
  return s;
}

// --- hygiene -----------------------------------------------------------------

test('HYGIENE: no RUNWAY range can hold a person, bother, container, Menu item, or finished thing', () => {
  const s = menagerie();
  const runway = [
    ...looseFromImport(s),
    ...underContainer(s, 'PROJ'),
    ...parkedAndBack(s, NOW),
    ...matchingQuery(s, 'a'),           // matches almost every title above
    ...rangeChoices(() => s, () => NOW)
      .filter(c => c.family === 'runway').flatMap(c => c.items()),
  ];
  for (const n of runway) {
    assert.ok(sortable(n), `${n.id} entered a range without being sortable`);
    assert.ok(!['person', 'bother', 'project', 'aspiration', 'pebble'].includes(n.kind),
      `${n.id} (${n.kind}) must never see a route button`);
    assert.equal(n.onMenu, null, `${n.id} is on the Menu — a route would mint Menu-plus-clock`);
    assert.equal(n.lastDone, null, `${n.id} is finished — sorting it re-opens a record`);
    assert.ok(!n.trashed && !n.mergedInto, `${n.id} is gone and must stay gone`);
  }
  // The proof has teeth only if the menagerie actually contains the dangers:
  assert.ok(s.nodes.get('PER') && s.nodes.get('BOTH') && s.nodes.get('ASP')?.onMenu
    && s.nodes.get('ONMENU')?.onMenu && s.nodes.get('DONE')?.lastDone, 'fixture intact');
});

test('HYGIENE: a MENU range holds only live Menu items of its own category — and only menu ranges hold them (1.5.0)', () => {
  const s = menagerie();
  const choices = rangeChoices(() => s, () => NOW);
  const menu = choices.filter(c => c.family === 'menu');
  assert.ok(menu.length >= 2, 'the menagerie holds two categories (read, try)');
  for (const c of menu) {
    const cat = c.key.replace(/^menu:/, '');
    for (const n of c.items()) {
      assert.equal(n.onMenu, cat, `${n.id} is not on the Menu as ${cat}`);
      assert.ok(!n.trashed && !n.mergedInto && !n.lastDone,
        `${n.id} is gone or finished and must not be offered`);
    }
  }
  // The family split is total: every choice declares one, and no runway
  // choice leaks a Menu item (the belt above already proves the converse).
  for (const c of choices) assert.ok(c.family === 'runway' || c.family === 'menu');
});

test('an arrival range holds exactly the unfiled, unrouted rows of that arrival', () => {
  const s = menagerie();
  assert.deepEqual(looseFromImport(s).map(n => n.id).sort(), ['LOOSE1', 'LOOSE2'],
    'not the filed one, not the capture, not the menagerie');
});

test('under-a-container is transitive and survives a cycle in bad data', () => {
  let s = menagerie();
  s = write(s, [ev('node.created', 'SUB', { nodeKind: 'project', title: 'a sub-project', parent: 'PROJ' })]);
  s = built(s, 'DEEP', 'deep child', 'SUB');
  assert.deepEqual(underContainer(s, 'PROJ').map(n => n.id).sort(), ['DEEP', 'FILED'],
    'the grandchild is found; the sub-container itself is not offered for routing');
  // A cycle folded from a hostile shard must not hang the walk. Raw fold, not
  // the gate — the gate refuses cycles, which is exactly why the walk must
  // still survive data that arrived around it.
  const cyclic = fold([
    ev('node.parented', 'PROJ', { parent: 'SUB' }),
  ], s);
  assert.ok(Array.isArray(underContainer(cyclic, 'PROJ')), 'bounded, no hang');
});

test('parked-and-back holds only a PASSED park', () => {
  let s = menagerie();
  s = write(s, [ev('park.set', 'LOOSE1', { returnAt: '2026-07-28T12:00:00.000Z' })]);   // passed
  s = write(s, [ev('park.set', 'LOOSE2', { returnAt: '2026-08-09T12:00:00.000Z' })]);   // future
  assert.deepEqual(parkedAndBack(s, NOW).map(n => n.id), ['LOOSE1'],
    'the future park stays held away — that is what a park is');
});

// --- parity ------------------------------------------------------------------

const ROUTES: ClarifyRoute[] = ['do-now', 'next-action', 'waiting-for', 'someday', 'reference', 'trash'];

for (const route of ROUTES) {
  test(`PARITY: routing an imported item via "${route}" writes the same facts as a captured one`, () => {
    let s = emptyState();
    s = imported(s, 'IMP', 'imported row');
    s = captured(s, 'CAPT', 'typed row');
    const impKind = s.nodes.get('IMP')!.kind;
    const capKind = s.nodes.get('CAPT')!.kind;
    s = write(s, routeEvents(ctx(), 'IMP', route, impKind));
    s = write(s, routeEvents(ctx(), 'CAPT', route, capKind));
    const a = s.nodes.get('IMP')!, b = s.nodes.get('CAPT')!;
    assert.equal(a.route, b.route, 'same recorded route');
    assert.equal(a.kind, b.kind, 'same resulting kind');
    assert.equal(a.onMenu, b.onMenu, 'same Menu placement');
    assert.equal(a.trashed, b.trashed, 'same trash outcome');
    if (route === 'do-now' || route === 'next-action' || route === 'waiting-for') {
      // These routes WRITE a clock, and it must be the same clock from either
      // door — the conveyor is the same conveyor.
      assert.equal(a.clocks.review?.source, b.clocks.review?.source,
        `same route clock source (got ${a.clocks.review?.source} vs ${b.clocks.review?.source})`);
      assert.match(a.clocks.review?.source ?? '', /^clarify:/, 'and it is the route speaking, not a cure');
    } else {
      // someday/reference/trash write no clock; what remains is each item's
      // GENESIS cure, and those honestly differ by origin — an import was
      // cured at node.created, a capture at capture.recorded. Same route
      // facts, truthful provenance: asserted so the difference stays a
      // decision rather than drifting into an accident.
      assert.equal(a.clocks.review?.source, 'gate:node.created');
      assert.equal(b.clocks.review?.source, 'gate:capture.recorded');
    }
    assert.equal(silentNodes(s).length, 0, 'and nothing is silent either way');
  });
}

test('undo works identically on an imported item: back to the range, not the inbox', () => {
  let s = emptyState();
  s = imported(s, 'IMP', 'imported row');
  const kind = s.nodes.get('IMP')!.kind;
  s = write(s, routeEvents(ctx(), 'IMP', 'next-action', kind));
  assert.equal(looseFromImport(s).length, 0, 'routed away, the range shrank');
  s = write(s, undoRouteEvents(ctx(), 'IMP', 'next-action', kind));
  assert.deepEqual(looseFromImport(s).map(n => n.id), ['IMP'],
    'undo returns it to the named range it came from');
  // AND IT IS IN THE INBOX TOO, which reverses what this asserted before
  // 2.38.0. The old line read "NOT to the daily inbox — it was never captured",
  // which was the world before 2.15.0 made an import land there on purpose. An
  // arrival is inbox work now; the batch and the inbox are two routes to the
  // same thing rather than two populations, and undo forges neither.
  assert.deepEqual(unclarified(s).map(n => n.id), ['IMP'],
    'undo returns it to both routes, because since 2.15.0 an arrival is inbox work');
});

// --- the inbox boundary ------------------------------------------------------

test('THE BOUNDARY: an arrival is sortable work, but never a headline and never swept', () => {
  // REWRITTEN IN 2.38.0, and the rewrite is the point rather than an
  // accommodation. This used to assert that imported rows appear in no part of
  // daily triage at all. 2.15.0 made an import latch `captured` so the offer's
  // unsorted tier could reach it — right, and untouched here — and that quietly
  // put a whole planner into the gauge and the heat sweep as well. The test kept
  // passing for twenty-two days because its fixture wrote rows the importer no
  // longer produces.
  //
  // The line that survives intact is the one with the law on it: the gauge
  // counts what you put down. What changed is that "not in triage at all" is no
  // longer the way to get there, because it costs the offer everything.
  const s = menagerie();

  // In the queue, because the clarify surface is where you GO to sort, and
  // saying "inbox clear" over a thousand unsorted things would be a lie.
  assert.deepEqual(unclarified(s).map(n => n.id).sort(), ['CAP', 'FILED', 'LOOSE1', 'LOOSE2']);

  // NOT in the sweep. Heat is a feel about a handful you just put down; nobody
  // has one about a thousand rows they have not read.
  assert.deepEqual(needsHeat(s).map(n => n.id), ['CAP']);

  // NOT the headline — law 8, rest is legitimate. A 1,222-row import must never
  // become a standing number saying how far behind you are.
  assert.equal(inboxGauge(s).unclarified, 1, 'the gauge counts captures only');
  assert.equal(inboxGauge(s).unheated, 1);
});

// --- the defer verb ----------------------------------------------------------

test('the start clock: set groups it "not before", clearing it is CURED in the same transaction', () => {
  let s = emptyState();
  s = built(s, 'D', 'deferred thing');
  s = write(s, setStartEvents(ctx(), 'D', '2026-08-04'));
  const n = s.nodes.get('D')!;
  assert.ok(n.clocks.start, 'the start clock landed');
  assert.match(heldStatus(n, NOW, TZ, atMidnight(TZ)), /^not before /, 'the status names the kind of date it is');

  // Clear it. clock.cleared is silent-risk; if the start was all that covered
  // it beyond the import cure, the gate must re-cover it in the same commit.
  s = write(s, clearStartEvents(ctx(), 'D'));
  const after = s.nodes.get('D')!;
  assert.equal(after.clocks.start, undefined, 'cleared');
  assert.equal(silentNodes(s).length, 0, 'and nothing went silent — the cure fired');
});

// --- a Menu landing sheds every demand clock (1.3.1) -------------------------

for (const route of ['someday', 'reference'] as ClarifyRoute[]) {
  test(`"${route}" on a dated item sheds its demand clocks in the same batch`, () => {
    // The audit's most severe finding: a due-dated item routed to Someday kept
    // its date invisibly forever — the Menu group wins every surface, no
    // replan card raises, the sheet hides temporal controls. A wish carries no
    // demands; the route clears what the node carries, visibly, in the log.
    let s = emptyState();
    s = built(s, 'DATED', 'a due-dated thing');
    s = write(s, setDueEvents(ctx(), 'DATED', '2026-08-09'));
    s = built(s, 'PARKED', 'a parked thing');
    s = write(s, [ev('park.set', 'PARKED', { returnAt: '2026-08-09T12:00:00.000Z' })]);
    for (const id of ['DATED', 'PARKED'] as const) {
      const n = s.nodes.get(id)!;
      s = write(s, routeEvents(ctx(), id, route, n.kind, demandClocksOf(n)));
      const after = s.nodes.get(id)!;
      assert.ok(after.onMenu, `${id} landed on the Menu`);
      for (const k of ['due', 'start', 'suspense', 'park'] as const) {
        assert.equal(after.clocks[k], undefined, `${id} still carries a ${k} clock`);
      }
    }
    assert.equal(silentNodes(s).length, 0, 'covered by the Menu, silent nowhere');
  });
}

test('demandClocksOf names exactly what the node carries — never an unconditional clear', () => {
  let s = emptyState();
  s = built(s, 'D', 'dated');
  s = write(s, setStartEvents(ctx(), 'D', '2026-08-04'));
  assert.deepEqual(demandClocksOf(s.nodes.get('D')), ['start'],
    'the start it carries, not the due it does not — the log must not claim changes that did not happen');
  assert.deepEqual(demandClocksOf(undefined), [], 'a missing node carries nothing');
});

// --- the wording when both kinds of date share a day (1.3.1) -----------------

test('a due date at the same instant as the start keeps the DEADLINE wording', () => {
  // "Not before" describes a door opening; with a due date on the same day the
  // louder fact is the obligation, and describing it as pure deferral is a
  // claim the data does not support (audit).
  let s = emptyState();
  s = built(s, 'B', 'both dates, one day');
  s = write(s, setStartEvents(ctx(), 'B', '2026-08-04'));
  s = write(s, setDueEvents(ctx(), 'B', '2026-08-04'));
  const words = heldStatus(s.nodes.get('B')!, NOW, TZ, atMidnight(TZ));
  assert.ok(!/^not before /.test(words), `an obligation must not read as a door opening (got "${words}")`);
  assert.match(words, /^in \d+ days$/, 'the generic demand words, naming the due clock');
});

test('a PASSED start raises no replan card and reads ready', () => {
  let s = emptyState();
  s = built(s, 'D', 'deferred thing');
  s = write(s, setStartEvents(ctx(), 'D', '2026-07-25'));   // four days behind NOW
  const n = s.nodes.get('D')!;
  const words = heldStatus(n, NOW, TZ, atMidnight(TZ));
  assert.equal(words, 'ready now', `a passed start OPENS the thing (got "${words}")`);
});

test('the standing "dates that have gone by" range is the replan predicate, narrowed', () => {
  // ONE definition of "a date went by" — `raisesReplanCard`, which the replan
  // surface itself uses. A second predicate here would be two answers to one
  // question, and that is precisely the amnesty's own defect one layer up: a
  // bulk path asking something different from the single-item path it batches.
  let s = write(emptyState(), [
    ev('node.created', 'PAST', { nodeKind: 'action', title: 'renew the insurance' }),
    ev('node.created', 'AHEAD', { nodeKind: 'action', title: 'ring the plumber' }),
    ev('node.created', 'PROJ', { nodeKind: 'project', title: 'the roof job' }),
  ]);
  s = write(s, [ev('clock.set', 'PAST', { clockKind: 'due', at: '2026-07-01T12:00:00.000Z', source: 't' })]);
  s = write(s, [ev('clock.set', 'AHEAD', { clockKind: 'due', at: '2026-09-01T12:00:00.000Z', source: 't' })]);
  s = write(s, [ev('clock.set', 'PROJ', { clockKind: 'due', at: '2026-07-01T12:00:00.000Z', source: 't' })]);

  const ids = datesGoneBy(s, NOW, TZ).map(n => n.id);
  assert.deepEqual(ids, ['PAST'], 'only the one whose date actually went by');

  // A CONTAINER with a passed date is out of BOTH, and the two agree because
  // `NO_REPLAN_CARD` already excludes every container — law 4 says you never
  // climb, so a project never becomes a card and never becomes a bulk row.
  //
  // Pinned as AGREEMENT rather than as a difference. `sortable` in the range is
  // belt-and-braces: it does no visible work today, and it is there so that if
  // the replan predicate ever widens, this range cannot start offering a bulk
  // verb the gate must then refuse. If these two ever disagree, one of them
  // changed and somebody has to decide which.
  assert.equal(raisesReplanCard(s.nodes.get('PROJ')!, NOW, atMidnight(TZ)), false,
    'a container raises no replan card — you never climb');
  assert.equal(ids.includes('PROJ'), false, 'and it is not in the bulk range either');
});

test('the dates range is offered first, and only when it holds something', () => {
  // A door to nowhere is noise, and a person opening the picker with a backlog
  // of dates should not have to read past four other doors to reach the one
  // already asking.
  const clean = write(emptyState(), [
    ev('node.created', 'X', { nodeKind: 'action', title: 'nothing is late' }),
  ]);
  assert.equal(rangeChoices(() => clean, () => NOW, TZ).some(c => c.key === 'dates-gone-by'), false,
    'nothing has gone by, so the range is not offered at all');

  const s = write(clean, [ev('clock.set', 'X', { clockKind: 'due', at: '2026-07-01T12:00:00.000Z', source: 't' })]);
  const choices = rangeChoices(() => s, () => NOW, TZ);
  assert.equal(choices[0]?.key, 'dates-gone-by', 'and when it holds something it leads');
  assert.equal(choices[0]?.count, 1);
  assert.equal(choices[0]?.family, 'runway',
    'runway, so every verb it offers is legal on every item in it');
});


// --- THE BATCH BUILT FOR AN IMPORT, DRIVEN BY THE REAL IMPORTER ---------------
//
// Reported from the device: a 1,171-row import, and the only way through it was
// one card at a time. `looseFromImport` returned 0 on that store, so the batch
// named "Loose things brought in from another planner" never appeared at all —
// `rangeChoices` pushes it only when non-empty, so a broken predicate does not
// show as an empty batch. The door simply is not there.
//
// It selected on `!n.captured`, written 2026-07-31 when `captured` meant "you
// typed it". 2.15.0 made an import land in the inbox, setting `captured` on
// every arriving row, and emptied the batch named for imports. Twenty-two days.
//
// EVERY TEST ABOVE STAYED GREEN, and the reason is the fixture rather than the
// assertions: `imported()` writes a bare `node.created`, so its rows are not
// `captured` and the old predicate finds them. Hub LESSONS 138 — a check whose
// fixture cannot express its failure has not run. So this drives the REAL
// importer, which is the only fixture here that can go red.

const importCtx = (): ImportContext => {
  let n = 0;
  return { at: NOW, device: 'imp', vault: 'personal', zone: TZ, seq: () => n, id: () => `imp${n++}` };
};

/** A file, through the chain the app runs when somebody picks one. */
const throughTheImporter = (text: string): State =>
  write(emptyState(), taskPaperEvents(importCtx(), parseAnyExport(text).lines));

test('the fixture is the check: a real import arrives CAPTURED, which is what broke this', () => {
  // Asserted first and on its own, because every failure below is downstream of
  // it and a reader needs to see the premise rather than infer it.
  const s = throughTheImporter('- A loose action\n');
  const n = heldNodes(s).find(x => x.title === 'A loose action');
  assert.ok(n, 'it arrived');
  assert.equal(n.captured, true, 'an import lands in the inbox (2.15.0)');
  assert.equal(n.arrived, true, 'and says how it got here');
});

test('THE ONE FROM THE DEVICE: a real import lands IN the batch built for it', () => {
  const s = throughTheImporter([
    'Kitchen refit:',
    '\t- Ring the plumber',
    '- A loose action',
    '- Another loose one',
    '',
  ].join('\n'));
  assert.deepEqual(looseFromImport(s).map(n => n.title).sort(),
    ['A loose action', 'Another loose one'],
    'the unfiled arrivals — it returned 0 for twenty-two days');
});

test('and the batch is OFFERED, because an empty one is never shown at all', () => {
  const s = throughTheImporter('- A loose action\n- Another loose one\n');
  const batch = rangeChoices(() => s, () => NOW, TZ).find(c => c.key.startsWith('arrival:'));
  assert.ok(batch, 'the batch appears in the picker');
  assert.equal(batch.count, 2);
  assert.equal(batch.family, 'runway', 'so it faces the runway verbs, Let go among them');
  assert.match(batch.words, /^Brought in on /,
    'and it says WHEN it came in, because nothing records WHAT it came from');
});

test('two imports are two doors, and each holds only its own', () => {
  // THE POINT OF THE ARRIVAL KEY. Before it, every import in the store was one
  // undifferentiated lump, so bringing a second file in diluted the first and
  // there was no way to work through either as a set.
  let s = imported(emptyState(), 'A1', 'from the first file', undefined, '2026-08-01T09:00:00.000Z');
  s = imported(s, 'A2', 'also from the first file', undefined, '2026-08-01T09:00:00.000Z');
  s = imported(s, 'B1', 'from the second file', undefined, '2026-08-20T14:00:00.000Z');

  const doors = rangeChoices(() => s, () => NOW, TZ).filter(c => c.key.startsWith('arrival:'));
  assert.equal(doors.length, 2, 'two arrivals, two doors');
  assert.deepEqual(doors.map(d => d.count), [1, 2], 'newest arrival first, and each counts its own');
  const [newest, older] = doors;
  assert.ok(newest && older);
  assert.deepEqual(newest.items().map(n => n.id), ['B1'], 'and holds only its own');
  assert.deepEqual(older.items().map(n => n.id).sort(), ['A1', 'A2']);
});

test('the example set is its own named arrival, so it can be told apart and let go', () => {
  // An unnamed sample leaves loose rows in a store that read as somebody's own
  // forgotten work months later, with no way to tell them from it. Named, it is
  // one set the wholesale verbs can reach.
  let s = imported(emptyState(), 'S1', 'a demo row', undefined, 'sample');
  s = imported(s, 'M1', 'mine, brought in', undefined, '2026-08-20T14:00:00.000Z');

  const doors = rangeChoices(() => s, () => NOW, TZ).filter(c => c.key.startsWith('arrival:'));
  assert.equal(doors.length, 2);
  const last = doors[doors.length - 1];
  assert.ok(last);
  assert.equal(last.words, 'The example set this app came with',
    'named rather than dated, and last — nobody chose to bring it in');
  assert.deepEqual(last.items().map(n => n.id), ['S1']);
});

test('a thing you typed yourself is not in it, which is what the batch NAME promises', () => {
  // The property the old predicate was reaching for, asserted directly rather
  // than as a side effect of how capture happened to be flagged at the time.
  let s = throughTheImporter('- A loose action\n');
  s = captured(s, 'MINE', 'something I typed just now');
  assert.deepEqual(looseFromImport(s).map(n => n.title), ['A loose action']);
});

test('and something filed under a project is not loose, whatever it arrived as', () => {
  const s = throughTheImporter('Kitchen refit:\n\t- Ring the plumber\n');
  assert.deepEqual(looseFromImport(s), [],
    'it has a home already — the per-project batches reach it');
});
