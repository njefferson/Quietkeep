// Phase 3.5: editing an item — dates, repeats, undo.
//
// The load-bearing properties: every edit terminates legally through the REAL
// gate (law 1); a date from a date input means the end of THAT day in the user's
// zone, in every zone including the far-east ones where a naive UTC probe lands
// on the wrong date; and "make it repeat" actually reaches the decay primitive,
// which until now had no path into it at all.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { admit, silentNodes, gateOptionsFor } from '../src/gate.ts';
import { fold, emptyState, type State } from '../src/fold.ts';
import { pressureOf } from '../src/pressure.ts';
import { upkeepChips, nextUpQueue } from '../src/nextup.ts';
import { localDayKey, calendarDaysBetween, atMidnight} from '../src/time.ts';
import {
  endOfDayKey, setDueEvents, clearDueEvents, makeRepeatEvents, stopRepeatEvents,
  undoneEvents, untrashEvents, promoteFromMenuEvents, promoteNodeFromMenuEvents, toMenuEvents,
} from '../src/ui/detail-intents.ts';
import { promotedKind } from '../src/kinds.ts';
import { menuGroups } from '../src/menu.ts';
import type { AppEvent } from '../src/events.ts';
import type { StampContext } from '../src/ui/session.ts';

const TZ = 'America/Denver';                    // never UTC (V-13)
const AT = '2026-07-29T18:00:00.000Z';          // 12:00 on the 29th, Denver

let seq = 0;
const ctx = (zone = TZ): StampContext => ({
  at: AT, device: 'd0', vault: 'personal', zone, day: atMidnight(zone),
  seq: () => seq++, id: () => `d${seq}`,
});

const opts = gateOptionsFor(TZ);
const write = (prior: State, offered: AppEvent[]): State => fold(admit(offered, prior, opts), prior);

/** A real, triaged item — the thing a detail sheet is actually opened on. A raw
 *  unrouted capture is deliberately NOT this: it still belongs to triage, and
 *  Next-up refuses to offer it, which is correct and not what these tests are
 *  about. */
const captured = (id: string, text = 'a thing'): State => {
  let s = write(emptyState(), [{
    id: `c${seq++}`, vault: 'personal', at: AT, device: 'd0', seq: seq++,
    kind: 'capture.recorded', node: id, payload: { text, source: 'quick', sourceTags: [] },
  } as AppEvent]);
  return write(s, [{
    id: `r${seq++}`, vault: 'personal', at: AT, device: 'd0', seq: seq++,
    kind: 'clarify.routed', node: id, payload: { route: 'next-action' },
  } as AppEvent]);
};

// --- dates -----------------------------------------------------------------

test('a date from a date input means the END of that day, in the user’s zone', () => {
  const iso = endOfDayKey('2026-08-13', TZ);
  assert.equal(localDayKey(iso, atMidnight(TZ)), '2026-08-13', 'it is that day where the user is');
  assert.equal(iso, '2026-08-14T05:59:59.000Z', '23:59:59 Denver = 05:59:59Z the next morning');
});

test('the date key resolves correctly in zones a naive UTC probe would get wrong', () => {
  // Kiritimati is UTC+14: noon UTC on the key date is already the NEXT day there,
  // so a probe taken at face value would land a day late. Chatham is +12:45.
  for (const [tz, key] of [
    ['Pacific/Kiritimati', '2026-08-13'],
    ['Pacific/Chatham', '2026-08-13'],
    ['Asia/Kolkata', '2026-08-13'],
    ['America/Denver', '2026-08-13'],
    ['UTC', '2026-08-13'],
    ['Pacific/Midway', '2026-08-13'],          // UTC-11, the other extreme
  ] as [string, string][]) {
    assert.equal(localDayKey(endOfDayKey(key, tz), atMidnight(tz)), key, `${tz} lands on ${key}`);
  }
});

test('setting a date leaves a hard clock and nothing silent, and Next-up ranks it first', () => {
  let s = captured('N');
  s = write(s, setDueEvents(ctx(), 'N', '2026-07-29'));       // today, Denver
  assert.equal(silentNodes(s).length, 0, 'nothing silent');
  const due = s.nodes.get('N')!.clocks.due;
  assert.ok(due, 'a due clock — the immovable kind');
  assert.equal(localDayKey(due!.at, atMidnight(TZ)), '2026-07-29', 'on the day asked for');
  const q = nextUpQueue(s, AT, TZ);
  assert.equal(q[0]!.node.id, 'N');
  assert.equal(q[0]!.reason, 'hard-date', 'a real date outranks everything computed');
});

test('clearing a date cannot lose the item — the gate hands it back today', () => {
  let s = captured('N');
  s = write(s, setDueEvents(ctx(), 'N', '2026-08-20'));
  // Strip the capture's review clock too, so `due` is the ONLY coverage left and
  // clearing it genuinely risks silence.
  const c = ctx();
  s = write(s, [{
    id: c.id(), vault: 'personal', at: AT, device: 'd0', seq: c.seq(),
    kind: 'clock.cleared', node: 'N', payload: { clockKind: 'review' },
  } as AppEvent]);
  const admitted = admit(clearDueEvents(ctx(), 'N'), s, opts);
  s = fold(admitted, s);
  assert.equal(s.nodes.get('N')!.clocks.due, undefined, 'the date is gone');
  assert.equal(silentNodes(s).length, 0, 'but the item is not');
  assert.ok(admitted.some(e => e.id.includes('~cure~')), 'the gate cured it, which is the right answer here');
});

// --- repeats: the path to the decay primitive ------------------------------

test('"make it repeat" reaches the decay primitive, which had no UI path before', () => {
  let s = captured('N', 'water the plant');
  const before = s.nodes.get('N')!;
  assert.equal(pressureOf(before, AT, atMidnight(TZ)), null, 'no cadence yet, so no pressure');

  s = write(s, makeRepeatEvents(ctx(), 'N', before.kind, 7, 2));
  const n = s.nodes.get('N')!;
  assert.equal(n.kind, 'upkeep', 'it is an upkeep now');
  assert.equal(n.intervalDays, 7);
  assert.equal(n.comfortWindowDays, 2);
  assert.equal(silentNodes(s).length, 0, 'and it is covered');
  assert.equal(pressureOf(n, AT, atMidnight(TZ)), 0, 'never done = ready, not late');
});

test('a repeat comes back on ITS interval, not the gate’s same-day default', () => {
  // The gate would cure a bare kind change with a same-day clock, bringing a
  // monthly thing back this evening. The intent sets its own clock instead.
  let s = captured('M', 'monthly filing');
  s = write(s, makeRepeatEvents(ctx(), 'M', s.nodes.get('M')!.kind, 30, 5));
  const review = s.nodes.get('M')!.clocks.review!;
  assert.equal(calendarDaysBetween(AT, review.at, atMidnight(TZ)), 30, 'thirty days out, as asked');
});

test('a repeat appears among the Upkeep chips once it comes round — and not before', () => {
  let s = captured('U', 'water the plant');
  s = write(s, makeRepeatEvents(ctx(), 'U', s.nodes.get('U')!.kind, 7, 2));
  // Done today: settled, so it should be quiet.
  const c = ctx();
  s = write(s, [{
    id: c.id(), vault: 'personal', at: AT, device: 'd0', seq: c.seq(),
    kind: 'done.marked', node: 'U', payload: { at: AT },
  } as AppEvent]);
  assert.equal(upkeepChips(s, AT, TZ).length, 0, 'just done: quiet');
  // Ten days later it is a full comfort window past ready.
  const later = '2026-08-08T18:00:00.000Z';
  const chips = upkeepChips(s, later, TZ);
  assert.deepEqual(chips.map(x => x.node.id), ['U'], 'and it comes back on its own');
  assert.ok(chips[0]!.pressure! > 0);
});

test('"stop repeating" removes the cadence without inventing a new event', () => {
  let s = captured('U');
  s = write(s, makeRepeatEvents(ctx(), 'U', s.nodes.get('U')!.kind, 7, 2));
  s = write(s, stopRepeatEvents(ctx(), 'U'));
  const n = s.nodes.get('U')!;
  assert.equal(n.kind, 'action', 'no longer an upkeep');
  assert.equal(pressureOf(n, AT, atMidnight(TZ)), null, 'and no longer carries a cadence');
  assert.equal(upkeepChips(s, '2026-09-30T18:00:00.000Z', TZ).length, 0, 'never returns as a chip');
  assert.equal(silentNodes(s).length, 0, 'still covered');
});

// --- undo ------------------------------------------------------------------

test('a done can be taken back, and the item is offered again', () => {
  let s = captured('N');
  s = write(s, setDueEvents(ctx(), 'N', '2026-07-29'));
  const c = ctx();
  s = write(s, [{
    id: c.id(), vault: 'personal', at: AT, device: 'd0', seq: c.seq(),
    kind: 'done.marked', node: 'N', payload: { at: AT },
  } as AppEvent]);
  assert.deepEqual(nextUpQueue(s, AT, TZ).map(i => i.node.id), [], 'finished work is not offered');

  s = write(s, undoneEvents(ctx(), 'N'));
  assert.equal(s.nodes.get('N')!.lastDone, null, 'the completion is withdrawn');
  assert.deepEqual(nextUpQueue(s, AT, TZ).map(i => i.node.id), ['N'], 'and it is back');
  assert.equal(silentNodes(s).length, 0);
});

test('an untrash cannot resurrect something into silence', () => {
  let s = captured('N');
  const c = ctx();
  s = write(s, [{
    id: c.id(), vault: 'personal', at: AT, device: 'd0', seq: c.seq(),
    kind: 'node.trashed', node: 'N', payload: { reason: 'test' },
  } as AppEvent]);
  s = write(s, untrashEvents(ctx(), 'N'));
  assert.equal(s.nodes.get('N')!.trashed, false, 'it is back');
  assert.equal(silentNodes(s).length, 0, 'and it has somewhere to be');
});

// --- the Menu --------------------------------------------------------------

test('the Menu holds things without demanding them, and promotion is deliberate', () => {
  let s = captured('N');
  s = write(s, toMenuEvents(ctx(), 'N', 'read'));
  assert.equal(s.nodes.get('N')!.onMenu, 'read', 'on the Menu');
  assert.deepEqual(nextUpQueue(s, AT, TZ).map(i => i.node.id), [],
    'a Menu item is a surface, not a demand (law 6) — never volunteered as work');

  s = write(s, promoteFromMenuEvents(ctx(), 'N', 'action'));
  const n = s.nodes.get('N')!;
  assert.equal(n.onMenu, null, 'off the Menu');
  assert.equal(n.kind, 'action', 'and real work now');
  assert.equal(silentNodes(s).length, 0, 'the gate gave it somewhere to be');
  assert.deepEqual(nextUpQueue(s, AT, TZ).map(i => i.node.id), ['N'],
    'it becomes a demand only because it was CHOSEN');
});

// --- the whole point -------------------------------------------------------

test('every edit intent leaves nothing silent (law 1, across all of them)', () => {
  const build: [string, (s: State) => AppEvent[]][] = [
    ['setDue', () => setDueEvents(ctx(), 'N', '2026-08-13')],
    ['clearDue', () => clearDueEvents(ctx(), 'N')],
    ['makeRepeat', s => makeRepeatEvents(ctx(), 'N', s.nodes.get('N')!.kind, 14, 3)],
    ['stopRepeat', () => stopRepeatEvents(ctx(), 'N')],
    ['undone', () => undoneEvents(ctx(), 'N')],
    ['toMenu', () => toMenuEvents(ctx(), 'N')],
    ['promote', () => promoteFromMenuEvents(ctx(), 'N', 'action')],
  ];
  for (const [name, make] of build) {
    let s = captured('N');
    s = write(s, make(s));
    assert.equal(silentNodes(s).length, 0, `${name} leaves nothing silent`);
  }
});

// --- a rhythm on a container ------------------------------------------------
//
// The container-kind picker (2.16.0) made goals and areas creatable for the
// first time. These assert that the rest of the sheet does not unmake them.

/** A container of a given kind, made the way the picker makes one. */
const containerOf = (id: string, kind: 'goal' | 'area' | 'project', title: string): State =>
  write(emptyState(), [{
    id: `k${seq++}`, vault: 'personal', at: AT, device: 'd0', seq: seq++,
    kind: 'node.created', node: id,
    payload: { nodeKind: kind, title, provenance: { for: 'self' } },
  } as AppEvent]);

test('a rhythm on a goal leaves it a goal — the picker made one and Repeat unmade it', () => {
  let s = containerOf('G', 'goal', 'Finish the novel');
  assert.equal(s.nodes.get('G')!.kind, 'goal');

  s = write(s, makeRepeatEvents(ctx(), 'G', s.nodes.get('G')!.kind, 90, 14));
  const g = s.nodes.get('G')!;

  // The defect this locks out: `node.kind.changed` from 'goal' to 'upkeep',
  // emitted by the same control whose label read "Make it repeat". A goal was
  // creatable for one release and destroyable by the next tap in the same sheet.
  assert.equal(g.kind, 'goal', 'still a goal');
  assert.equal(g.intervalDays, 90, 'and it carries the cadence');
  assert.equal(g.comfortWindowDays, 14);
  assert.ok(g.clocks.review, 'and a review clock, so law 1 is satisfied without a kind change');
  assert.equal(silentNodes(s).length, 0);
});

test('every container kind survives its own rhythm, not only goal', () => {
  for (const kind of ['goal', 'area', 'project'] as const) {
    let s = containerOf('C', kind, 'a place work lives in');
    s = write(s, makeRepeatEvents(ctx(), 'C', kind, 30, 7));
    assert.equal(s.nodes.get('C')!.kind, kind, `${kind} survives`);
  }
});

test('an ordinary item still becomes an upkeep — the fix narrowed nothing else', () => {
  let s = captured('N', 'water the plant');
  s = write(s, makeRepeatEvents(ctx(), 'N', s.nodes.get('N')!.kind, 7, 2));
  assert.equal(s.nodes.get('N')!.kind, 'upkeep', 'unchanged for the case the control was built for');
});

test('stopping a goal’s rhythm leaves it a goal, not an action', () => {
  let s = containerOf('G', 'goal', 'Finish the novel');
  s = write(s, makeRepeatEvents(ctx(), 'G', s.nodes.get('G')!.kind, 90, 14));
  s = write(s, stopRepeatEvents(ctx(), 'G', 'action', s.nodes.get('G')!.kind));

  // Without the current kind, `stopRepeatEvents` writes `from: 'upkeep', to:
  // 'action'` about a node that was never an upkeep — a false claim in an
  // append-only log, and a goal silently demoted to a task.
  const g = s.nodes.get('G')!;
  assert.equal(g.kind, 'goal', 'still a goal');
  assert.equal(g.intervalDays, 0, 'and the cadence is off');
  assert.equal(pressureOf(g, AT, atMidnight(TZ)), null, 'no cadence, so no pressure');
});

test('an upkeep still returns to an action when its repeat stops', () => {
  let s = captured('U', 'water the plant');
  s = write(s, makeRepeatEvents(ctx(), 'U', s.nodes.get('U')!.kind, 7, 2));
  s = write(s, stopRepeatEvents(ctx(), 'U', 'action', s.nodes.get('U')!.kind));
  assert.equal(s.nodes.get('U')!.kind, 'action', 'unchanged for the case it was built for');
});

test('a goal’s rhythm is what brings the work under it back', () => {
  // The claim the whole phase rests on, tested by difference rather than by
  // reading: the same tree, offered at the same moment, with and without the
  // rhythm. Nothing else about the action changes.
  const build = (withRhythm: boolean): State => {
    let s = containerOf('G', 'goal', 'Finish the novel');
    const c = ctx();
    s = write(s, [{
      id: c.id(), vault: 'personal', at: AT, device: 'd0', seq: c.seq(),
      kind: 'node.created', node: 'A',
      payload: { nodeKind: 'action', title: 'Write the market scene', provenance: { for: 'self' } },
    } as AppEvent, {
      id: c.id(), vault: 'personal', at: AT, device: 'd0', seq: c.seq(),
      kind: 'node.parented', node: 'A', payload: { parent: 'G' },
    } as AppEvent]);
    return withRhythm ? write(s, makeRepeatEvents(ctx(), 'G', 'goal', 90, 14)) : s;
  };
  const LATER = '2026-11-29T18:00:00.000Z';   // the 90 days have passed
  const offered = (s: State): number => nextUpQueue(s, LATER, TZ).length;

  assert.equal(offered(build(false)), 0, 'filed under a goal with no rhythm: silent, which is law 1 clause (d)');
  assert.equal(offered(build(true)), 1, 'and the rhythm is what fetches it — the mountain comes down');
});

// --- coming back off the Menu ----------------------------------------------
//
// Promotion turns a WISH into work. Until 2.18.2 it rewrote the kind of
// whatever it touched, because `toKind` defaulted to 'action' and both callers
// took the default.

test('a goal rested on the Menu comes back a goal', () => {
  let s = containerOf('G', 'goal', 'A calmer house');
  s = write(s, toMenuEvents(ctx(), 'G'));
  assert.equal(s.nodes.get('G')!.kind, 'goal', 'the Menu itself never touched the kind');

  s = write(s, promoteNodeFromMenuEvents(ctx(), s.nodes.get('G')!));
  assert.equal(s.nodes.get('G')!.kind, 'goal', 'and neither does coming back');
  assert.equal(s.nodes.get('G')!.onMenu, null, 'but it is off the Menu');
});

test('an upkeep comes back an upkeep, still carrying its rhythm honestly', () => {
  // The worst of the three: it came back an `action` with intervalDays still 7,
  // so it kept arriving on a rhythm while calling itself a task — and nothing
  // in the app said either half of that.
  let s = captured('U', 'water the plant');
  s = write(s, makeRepeatEvents(ctx(), 'U', s.nodes.get('U')!.kind, 7, 2));
  s = write(s, toMenuEvents(ctx(), 'U'));
  s = write(s, promoteNodeFromMenuEvents(ctx(), s.nodes.get('U')!));
  const n = s.nodes.get('U')!;
  assert.equal(n.kind, 'upkeep', 'still an upkeep');
  assert.equal(n.intervalDays, 7, 'and the rhythm it carries matches what it says it is');
});

test('a wish still becomes real work — the case the control was built for', () => {
  let s = write(emptyState(), [{
    id: `w${seq++}`, vault: 'personal', at: AT, device: 'd0', seq: seq++,
    kind: 'node.created', node: 'W',
    payload: { nodeKind: 'aspiration', title: 'Learn to sail', provenance: { for: 'self' } },
  } as AppEvent]);
  s = write(s, toMenuEvents(ctx(), 'W'));
  s = write(s, promoteNodeFromMenuEvents(ctx(), s.nodes.get('W')!));
  assert.equal(s.nodes.get('W')!.kind, 'action', 'a demand-free kind genuinely does change');
  assert.equal(silentNodes(s).length, 0, 'and the gate covered it on the way');
});

test('promotedKind changes only the demand-free kinds', () => {
  for (const k of ['aspiration', 'pebble', 'person', 'journal', 'anchor', 'context', 'role'] as const) {
    assert.equal(promotedKind(k), 'action', `${k} becomes work`);
  }
  for (const k of ['goal', 'area', 'outcome', 'project', 'upkeep', 'action', 'waiting-for'] as const) {
    assert.equal(promotedKind(k), k, `${k} keeps what it was`);
  }
});

// --- which kind of want (2.23.0) --------------------------------------------
//
// `docs/nd-collisions.md` entry 26 REFUSES the packaged reward-menu practice
// outright and permits exactly one narrow thing: the category chosen at write
// time instead of silently defaulting. It calls the current state a verified
// defect — a six-value field that is dead code in the shipped app.

test('the Menu category defaults to read, so the common case costs nothing', () => {
  let s = captured('N', 'that novel everyone mentions');
  s = write(s, toMenuEvents(ctx(), 'N'));
  assert.equal(s.nodes.get('N')!.onMenu, 'read');
});

test('and any of the six can be chosen instead', () => {
  for (const c of ['read', 'try', 'go', 'make', 'research', 'save-for'] as const) {
    let s = captured('N', 'a want');
    s = write(s, toMenuEvents(ctx(), 'N', c));
    assert.equal(s.nodes.get('N')!.onMenu, c, `${c} lands`);
  }
});

test('a category chosen wrongly is corrected in place, with no way out and back', () => {
  // `menu.item.added` is last-write-wins on the `menu` stamp, so re-emitting it
  // IS the correction. Without that the only route would be to bring the thing
  // off the Menu and put it on again — two events to fix one word, and a state
  // you enter and cannot leave (LESSONS 113).
  let s = captured('N', 'that novel everyone mentions');
  s = write(s, toMenuEvents(ctx(), 'N'));
  const nodesBefore = s.nodes.size;

  s = write(s, toMenuEvents(ctx(), 'N', 'research'));
  assert.equal(s.nodes.get('N')!.onMenu, 'research');
  assert.equal(s.nodes.size, nodesBefore, 'nothing was duplicated to do it');
  assert.equal(silentNodes(s).length, 0);
});

test('the Menu groups by category, so more than one is more than one group', () => {
  // The defect this closes, stated as the surface saw it: with every route
  // writing `read`, a six-way grouping rendered one group on every store.
  let s = captured('A', 'that novel');
  s = write(s, [{
    id: `m${seq++}`, vault: 'personal', at: AT, device: 'd0', seq: seq++,
    kind: 'capture.recorded', node: 'B', payload: { text: 'the pottery place', source: 'quick', sourceTags: [] },
  } as AppEvent]);
  s = write(s, [{
    id: `r${seq++}`, vault: 'personal', at: AT, device: 'd0', seq: seq++,
    kind: 'clarify.routed', node: 'B', payload: { route: 'next-action' },
  } as AppEvent]);
  s = write(s, toMenuEvents(ctx(), 'A', 'read'));
  s = write(s, toMenuEvents(ctx(), 'B', 'go'));

  const groups = menuGroups(s);
  assert.equal(groups.length, 2, 'two categories, two groups');
  assert.deepEqual(groups.map(g => g.items.length), [1, 1]);
});
