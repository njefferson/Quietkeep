// THE SEAMS — a thing driven all the way through, and moved between places.
//
// Every other test in this repo pins one line. That catches the defect it was
// written for and nothing either side of it, and the defects that actually
// reached a real device this week were all at JOINS: an item covered by the
// gate but never offered by the work surface; a cure written by one file and
// read as a demand by another; a fix applied to the triage card and not to the
// offer card. Each component was correct. The seam was not.
//
// So this drives whole journeys through the REAL gate — create, move, re-home,
// change what it is, put it down, take it back up, finish it — and after EVERY
// SINGLE STEP asserts the two things that must never stop being true:
//
//   1. LAW 1 — nothing is silent. The write boundary's own invariant.
//   2. **Nothing is stranded.** A live, actionable node must be reachable on a
//      surface that can move it forward: the offer, an upkeep chip, the inbox,
//      or a replan card. Being merely *present in the store* is not reachable —
//      that is the exact shape of the 2.0.0 defect, where a captured thing was
//      clocked, counted as covered, and never once offered as work.
//
// (2) is the one worth having. Law 1 was already gated and stayed green through
// that entire defect, because "carries a clock" and "will be shown to you" are
// different claims and only the first was enforced.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { admit, gateOptionsFor, silentNodes } from '../src/gate.ts';
import { fold, isHeld, isGone, isAppClock, type NodeState, type State } from '../src/fold.ts';
import { nextUpQueue, upkeepChips } from '../src/nextup.ts';
import { unclarified } from '../src/triage.ts';
import { replanIds } from '../src/replan.ts';
import { NOT_ACTIONABLE } from '../src/kinds.ts';
import { NODE_KINDS } from '../src/events.ts';
import type { AppEvent, NodeKind } from '../src/events.ts';

const NOW = '2026-08-10T18:00:00.000Z';
const TZ = 'America/Denver';

/** Days from NOW, as an ISO instant. */
const day = (n: number): string =>
  new Date(Date.parse(NOW) + n * 86_400_000).toISOString();

/** A journey: a named sequence of steps, each a label and the events it writes. */
interface Step { label: string; events: (ctx: Ctx) => AppEvent[] }
interface Ctx { ev: (kind: string, node: string | null, payload: unknown) => AppEvent }

/**
 * Reachable on a surface that can MOVE IT FORWARD.
 *
 * Deliberately not "appears anywhere in the store". The held list contains
 * everything live by construction, so counting it would make this assertion
 * trivially true — and trivially true is exactly what law 1 was during the
 * defect this exists to catch.
 */
const reachable = (state: State, id: string): boolean => {
  if (nextUpQueue(state, NOW, TZ).some(i => i.node.id === id)) return true;
  if (upkeepChips(state, NOW, TZ).some(i => i.node.id === id)) return true;
  if (unclarified(state).some(n => n.id === id)) return true;
  if (replanIds(state, NOW, TZ).has(id)) return true;
  return false;
};

/**
 * Is this node one the app OWES an offer to?
 *
 * The exemptions are the ones the product states, not a list tuned until the
 * test passed: a demand-free kind is not work (law 6); the Menu is a surface and
 * never a demand (law 1 clause c); a waiting-for is somebody else's move; a
 * released thing was deliberately let go; a park is "not yet, on purpose"; and
 * finished work is finished.
 */
const owedAnOffer = (n: NodeState, state: State): boolean => {
  if (!isHeld(n) || isGone(n)) return false;
  if (NOT_ACTIONABLE.has(n.kind)) return false;
  if (n.kind === 'waiting-for' || n.kind === 'resume-card') return false;
  if (n.onMenu) return false;
  if (n.released) return false;
  if (n.lastDone) return false;
  if (n.captured && n.route === null) return true;      // the inbox counts

  // SOMETHING SOMEBODY DID, not merely something that exists.
  //
  // The first version of this returned true for any live actionable node, so a
  // bare `node.created` with no clock and no parent counted as stranded. That
  // read as a real finding — no UI path mints one, but an import or a sync
  // shard can — and acting on it was a REGRESSION: widening the offer to cover
  // every undated node turned twelve existing tests red, and their names are
  // the argument. "An empty morning says so, rather than inventing work."
  // "THE ONE FROM 1,429 ROWS: an undated thing is not 'ready now'." And 2.0.1's
  // own: "clearing the only date does not make the app ask for it anyway."
  //
  // The app's position is deliberate and correct: a thing nobody has dated and
  // nobody captured is QUIET. It is covered, it is in the held list, and the
  // reader meets it when they open what they are holding. Quiet is a legitimate
  // state — the alternative is an app that invents work, which is the one thing
  // an empty morning must not do.
  //
  // So this invariant is about things somebody DID something to: wrote down,
  // gave a date, unblocked. Not about everything that exists. That still catches
  // the 2.0.0 defect — a capture IS an act, and is claimed above — without
  // demanding the app manufacture demands it has no warrant for.
  const park = n.clocks.park;
  if (park && Date.parse(park.at) > Date.parse(NOW)) return false;
  // SCHEDULED IS NOT STRANDED — but only on a date a PERSON set.
  //
  // This is the whole distinction, and getting it wrong in the loose direction
  // is what let the 2.0.0 defect hide: "it carries a clock" was the weak claim,
  // true of every captured thing and satisfied by a cure the gate wrote so the
  // node would not be silent. A cure is housekeeping and nobody asked for
  // anything by that date (ADR-0087), so a node whose only future clock is a
  // cure is NOT scheduled — it is stranded, and this must say so.
  const personClocks = Object.values(n.clocks).filter(c =>
    c != null && c.kind !== 'park' && !isAppClock(c));
  // Nobody has dated it and nobody captured it: quiet, by design. See above.
  if (personClocks.length === 0) return false;
  const scheduled = personClocks.some(c => Date.parse(c!.at) > Date.parse(NOW));
  if (scheduled) return false;
  // Something waiting on an antecedent that is not finished is not stranded —
  // it is waiting, which the app says out loud when the antecedent lands.
  if (n.after) {
    const a = state.nodes.get(n.after);
    if (a && !a.lastDone) return false;
  }
  return true;
};

/** Drive a journey, checking both invariants after EVERY step. */
function walk(name: string, steps: Step[]): void {
  let seq = 0;
  const ev = (kind: string, node: string | null, payload: unknown): AppEvent => ({
    id: `e${++seq}`, kind, node, payload, at: NOW, device: 'j', seq, vault: 'main',
  } as unknown as AppEvent);

  let log: AppEvent[] = [];
  for (const step of steps) {
    const before = fold(log);
    let admitted: AppEvent[];
    try {
      admitted = admit(step.events({ ev }), before, gateOptionsFor(TZ));
    } catch (err) {
      assert.fail(`${name} — the gate REFUSED "${step.label}": ${(err as Error).message}`);
    }
    log = [...log, ...admitted];
    const state = fold(log);

    // 1. Law 1, after every step rather than only at the end. A journey that
    //    passes through a silent state and out the other side has still shown
    //    somebody an app with something missing from it.
    assert.deepEqual(silentNodes(state).map(n => n.title), [],
      `${name} — after "${step.label}", these went silent`);

    // 2. Nothing stranded.
    const stranded = [...state.nodes.values()]
      .filter(n => owedAnOffer(n, state) && !reachable(state, n.id))
      .map(n => `${n.kind} "${n.title}"`);
    assert.deepEqual(stranded, [],
      `${name} — after "${step.label}", these are live and actionable and on NO surface `
      + 'that can move them forward. Covered is not the same as reachable.');
  }
}

// ---------------------------------------------------------------------------

test('a captured thing goes all the way through, and is reachable at every step', () => {
  walk('capture → sort → do', [
    { label: 'captured', events: ({ ev }) => [
      ev('capture.recorded', 'C', { text: 'ring the plumber back', source: 'quick', sourceTags: [] })] },
    { label: 'marked hot', events: ({ ev }) => [ev('heat.set', 'C', { heat: 'hot' })] },
    { label: 'routed to next action', events: ({ ev }) => [
      ev('clarify.routed', 'C', { route: 'next-action' }),
      ev('clock.set', 'C', { clockKind: 'review', at: day(1), source: 'clarify' })] },
    { label: 'given a real date', events: ({ ev }) => [
      ev('clock.set', 'C', { clockKind: 'due', at: day(2), source: 'user' })] },
    { label: 'done', events: ({ ev }) => [ev('done.marked', 'C', { at: NOW })] },
  ]);
});

test('moving a thing between places never strands it — the seam, driven both ways', () => {
  walk('re-home', [
    { label: 'two projects and a step', events: ({ ev }) => [
      ev('node.created', 'P1', { nodeKind: 'project', title: 'Fix the fence panel' }),
      ev('clock.set', 'P1', { clockKind: 'review', at: day(3), source: 'user' }),
      ev('node.created', 'P2', { nodeKind: 'project', title: 'Rebuild the compost bin' }),
      ev('clock.set', 'P2', { clockKind: 'review', at: day(4), source: 'user' }),
      ev('node.created', 'A', { nodeKind: 'action', title: 'Order the timber' }),
      ev('clock.set', 'A', { clockKind: 'due', at: day(1), source: 'user' })] },
    { label: 'filed under the first', events: ({ ev }) => [ev('node.parented', 'A', { parent: 'P1' })] },
    { label: 'moved to the second', events: ({ ev }) => [
      ev('node.parented', 'A', { parent: 'P2', priorParent: 'P1' })] },
    { label: 'pulled out to stand alone', events: ({ ev }) => [
      ev('node.unparented', 'A', { priorParent: 'P2' })] },
    // The bystander case: the parent leaves the world and the child must not
    // leave with it. ADR-0011, and the cure that fires here is the one 2.0.1
    // reclassified.
    { label: 'filed again, then the parent is trashed', events: ({ ev }) => [
      ev('node.parented', 'A', { parent: 'P2' })] },
    { label: 'parent trashed under it', events: ({ ev }) => [ev('node.trashed', 'P2', {})] },
    { label: 'parent brought back', events: ({ ev }) => [ev('node.untrashed', 'P2', {})] },
  ]);
});

test('the Menu is a surface and coming off it is a decision — both directions', () => {
  walk('menu', [
    { label: 'created', events: ({ ev }) => [
      ev('node.created', 'M', { nodeKind: 'action', title: 'Read the big atlas properly' }),
      ev('clock.set', 'M', { clockKind: 'review', at: day(1), source: 'user' })] },
    { label: 'put on the Menu', events: ({ ev }) => [
      ev('menu.item.added', 'M', { category: 'read' }),
      ev('clock.cleared', 'M', { clockKind: 'review' })] },
    { label: 'promoted off it into real work', events: ({ ev }) => [
      ev('menu.item.promoted', 'M', { toKind: 'action' })] },
    { label: 'done', events: ({ ev }) => [ev('done.marked', 'M', { at: NOW })] },
  ]);
});

test('an exit that is neither done nor deleted, and the way back', () => {
  walk('release', [
    { label: 'created', events: ({ ev }) => [
      ev('node.created', 'R', { nodeKind: 'action', title: 'Repaint the hallway' }),
      ev('clock.set', 'R', { clockKind: 'review', at: day(1), source: 'user' })] },
    { label: 'let go', events: ({ ev }) => [ev('node.released', 'R', { at: NOW })] },
    { label: 'taken back up', events: ({ ev }) => [ev('node.reclaimed', 'R', {})] },
    { label: 'trashed', events: ({ ev }) => [ev('node.trashed', 'R', {})] },
    { label: 'untrashed', events: ({ ev }) => [ev('node.untrashed', 'R', {})] },
  ]);
});

test('two things folded together, and split back out', () => {
  walk('merge', [
    { label: 'two near-duplicates', events: ({ ev }) => [
      ev('node.created', 'D1', { nodeKind: 'action', title: 'Ring the surveyor back' }),
      ev('clock.set', 'D1', { clockKind: 'due', at: day(1), source: 'user' }),
      ev('node.created', 'D2', { nodeKind: 'action', title: 'Call the surveyor' }),
      ev('clock.set', 'D2', { clockKind: 'due', at: day(1), source: 'user' })] },
    { label: 'folded together', events: ({ ev }) => [ev('node.merged', 'D2', { into: 'D1' })] },
    { label: 'split back out', events: ({ ev }) => [ev('node.unmerged', 'D2', {})] },
  ]);
});

test('a chain: the thing after something else becomes possible when it lands', () => {
  walk('anchor', [
    { label: 'two steps, one after the other', events: ({ ev }) => [
      ev('node.created', 'X', { nodeKind: 'action', title: 'Get the measurements signed off' }),
      ev('clock.set', 'X', { clockKind: 'due', at: day(1), source: 'user' }),
      ev('node.created', 'Y', { nodeKind: 'action', title: 'Order the glass' }),
      ev('clock.set', 'Y', { clockKind: 'due', at: day(9), source: 'user' })] },
    { label: 'the second waits on the first', events: ({ ev }) => [ev('after.set', 'Y', { after: 'X' })] },
    { label: 'the first is done', events: ({ ev }) => [ev('done.marked', 'X', { at: NOW })] },
    { label: 'the anchor is cleared', events: ({ ev }) => [ev('after.cleared', 'Y', {})] },
  ]);
});

test('a recurring thing comes back; a one-off does not', () => {
  walk('upkeep', [
    { label: 'an upkeep with a cadence', events: ({ ev }) => [
      ev('node.created', 'U', { nodeKind: 'upkeep', title: 'Put the bins out' }),
      ev('upkeep.interval.set', 'U', { intervalDays: 7, comfortWindowDays: 2 })] },
    { label: 'done long ago, so it is asking again', events: ({ ev }) => [
      ev('done.marked', 'U', { at: day(-30) })] },
    { label: 'done today', events: ({ ev }) => [ev('done.marked', 'U', { at: NOW })] },
  ]);
});

test('every kind the app has can be created and reach an end without stranding', () => {
  // COVERAGE OVER THE WHOLE VOCABULARY, read from NODE_KINDS rather than a list
  // written here — a kind added to the app without a journey is then a failure
  // rather than a silence.
  const needsCadence = new Set<NodeKind>(['upkeep']);
  const cannotBeCreatedDirectly = new Set<NodeKind>(['resume-card', 'journal', 'person', 'anchor']);

  for (const kind of NODE_KINDS) {
    if (cannotBeCreatedDirectly.has(kind)) continue;
    walk(`kind:${kind}`, [
      { label: `a ${kind} exists`, events: ({ ev }) => [
        ev('node.created', 'K', { nodeKind: kind, title: `a ${kind}` }),
        ...(needsCadence.has(kind)
          ? [ev('upkeep.interval.set', 'K', { intervalDays: 7, comfortWindowDays: 2 })]
          : [])] },
      { label: 'trashed', events: ({ ev }) => [ev('node.trashed', 'K', {})] },
    ]);
  }
});

test('done, then "Back on the list" — and the date you set survives it', () => {
  // `#detail-undone` is one of the controls no walk operated. Un-completing is
  // where getting it wrong loses state: the gate re-clocks a `done.marked` so
  // finished work is not silent, and that cure writes a REVIEW clock — the same
  // kind somebody may already have set by hand. If it overwrote theirs, the
  // date would be gone and undoing would not bring it back, which "data is
  // never lost" forbids.
  walk('done and undone', [
    { label: 'a step with a real date', events: ({ ev }) => [
      ev('node.created', 'A', { nodeKind: 'action', title: 'Order the timber' }),
      ev('clock.set', 'A', { clockKind: 'due', at: NOW, source: 'user' })] },
    { label: 'done', events: ({ ev }) => [ev('done.marked', 'A', { at: NOW })] },
    { label: 'back on the list', events: ({ ev }) => [ev('done.unmarked', 'A', {})] },
  ]);

  // And the specific claim the button makes, checked rather than implied.
  let seq = 0;
  const ev = (kind: string, node: string, payload: unknown): AppEvent => ({
    id: `u${++seq}`, kind, node, payload, at: NOW, device: 'u', seq, vault: 'main',
  } as unknown as AppEvent);
  const SOON = '2026-08-25T18:00:00.000Z';
  let log: AppEvent[] = [];
  const push = (...es: AppEvent[]) => {
    for (const e of es) log = [...log, ...admit([e], fold(log), gateOptionsFor(TZ))];
  };
  push(ev('node.created', 'B', { nodeKind: 'action', title: 'Chase the delivery' }),
       ev('clock.set', 'B', { clockKind: 'review', at: SOON, source: 'user' }));
  push(ev('done.marked', 'B', { at: NOW }));
  push(ev('done.unmarked', 'B', {}));
  const b = fold(log).nodes.get('B')!;
  assert.equal(b.lastDone, null, 'undoing a completion really un-completes it');
  assert.equal(b.clocks.review?.at, SOON,
    'the date YOU set is still there — the completion cure did not overwrite it');
  assert.equal(b.clocks.review?.source, 'user',
    'and it is still yours, not the gate\'s');

  // The one with an arrived date is offered again, which is what the button says.
  const back = nextUpQueue(fold(log), NOW, TZ);
  assert.equal(back.some(i => i.node.id === 'B'), false,
    'this one is dated for the 25th, so it is scheduled rather than offered today');
});

test('the four other verbs no walk operated', () => {
  // `detail-date-clear`, `detail-unparent`, `detail-promote`, `detail-repeat-stop`
  // — each named by neither walk. Payloads taken from detail-intents.ts rather
  // than invented, so this drives what the buttons actually write.
  walk('taking a date off', [
    { label: 'a dated step', events: ({ ev }) => [
      ev('node.created', 'D', { nodeKind: 'action', title: 'Post the form' }),
      ev('clock.set', 'D', { clockKind: 'due', at: NOW, source: 'user' })] },
    { label: 'date cleared', events: ({ ev }) => [ev('clock.cleared', 'D', { clockKind: 'due' })] },
  ]);

  walk('pulling something out of a project', [
    { label: 'a step inside a project', events: ({ ev }) => [
      ev('node.created', 'P', { nodeKind: 'project', title: 'Clear the guttering' }),
      ev('clock.set', 'P', { clockKind: 'review', at: day(2), source: 'user' }),
      ev('node.created', 'S', { nodeKind: 'action', title: 'Borrow the long ladder' }),
      ev('node.parented', 'S', { parent: 'P' }),
      ev('clock.set', 'S', { clockKind: 'due', at: NOW, source: 'user' })] },
    { label: 'pulled out', events: ({ ev }) => [ev('node.unparented', 'S', { priorParent: 'P' })] },
  ]);

  walk('a repeat, stopped', [
    { label: 'something that repeats', events: ({ ev }) => [
      ev('node.created', 'U', { nodeKind: 'upkeep', title: 'Descale the kettle' }),
      ev('upkeep.interval.set', 'U', { intervalDays: 7, comfortWindowDays: 2 }),
      ev('done.marked', 'U', { at: day(-30) })] },
    // Exactly what `stopRepeatEvents` writes, in its order.
    { label: 'stop repeating', events: ({ ev }) => [
      ev('upkeep.interval.set', 'U', { intervalDays: 0, comfortWindowDays: 0 }),
      ev('node.kind.changed', 'U', { from: 'upkeep', to: 'action' }),
      ev('done.unmarked', 'U', {})] },
  ]);
});

test('focus: started, interrupted, and ended — the resume card comes back', () => {
  // focus.started / focus.ended / resume.card.* are all named in no test. The
  // resume card is the app's answer to being pulled away mid-thing, so a
  // journey through it is the one that matters.
  walk('focus', [
    { label: 'a thing to sit down with', events: ({ ev }) => [
      ev('node.created', 'F', { nodeKind: 'action', title: 'Read the terms properly' }),
      ev('clock.set', 'F', { clockKind: 'due', at: NOW, source: 'user' })] },
    { label: 'focus started', events: ({ ev }) => [ev('focus.started', 'F', { at: NOW })] },
    { label: 'interrupted — something else arrives', events: ({ ev }) => [
      ev('interrupt.captured', 'I', { text: 'the roof people rang', source: 'focus', sourceTags: [] })] },
    { label: 'focus ended', events: ({ ev }) => [ev('focus.ended', 'F', { at: NOW })] },
    // A resume card written by an interruption, then let go rather than picked
    // up — `dropResumeEvents`. The last of the folded kinds no test drove.
    { label: 'a resume card, let go', events: ({ ev }) => [
      ev('node.created', 'RC', { nodeKind: 'resume-card', title: 'where you left off' }),
      ev('clock.set', 'RC', { clockKind: 'review', at: NOW, source: 'focus' }),
      ev('resume.card.expired', 'RC', { toReviewQuestion: false })] },
  ]);
});

test('the two events the app really writes that nothing folds', () => {
  // The paths audit found 21 event kinds named in no test. Measuring properly
  // showed most of that number was not a gap: FIFTEEN are reserved nouns —
  // declared in the vocabulary, read only by `log-words.ts` so a log line can be
  // put into words, and emitted by nothing at all. Reserving a noun additively
  // is law 9 and deliberate, so there is nothing there to test; testing them
  // would be testing a type declaration.
  //
  // Two are real: the app writes them on paths a person can take, and no test
  // had ever put them through the write boundary. Neither is folded, so the risk
  // is not what they change — it is that the gate REFUSES one, or the fold
  // throws on it, at the moment somebody presses the button.
  walk('an anchor that came round', [
    { label: 'an anchor exists', events: ({ ev }) => [
      ev('node.created', 'AN', { nodeKind: 'anchor', title: 'the Monday meeting' })] },
    // `fireAnchorEvents` — firing is always an act; nothing fires on a schedule.
    { label: 'it fired', events: ({ ev }) => [
      ev('anchor.fired', 'AN', { at: NOW, reportedBefore: { d: 1 } })] },
  ]);

  walk('the lapse ritual ran', [
    { label: 'something to come back to', events: ({ ev }) => [
      ev('node.created', 'L', { nodeKind: 'action', title: 'Chase the delivery' }),
      ev('clock.set', 'L', { clockKind: 'due', at: day(-9), source: 'user' })] },
    // Node-less, like every ritual record: it describes the session, not a thing.
    { label: 'the ritual is recorded', events: ({ ev }) => [
      ev('lapse.migration.ran', null, { absenceDays: 30, itemsTriaged: 12 })] },
  ]);
});
