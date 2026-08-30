// Review as EXCEPTIONS ONLY (v1 Must: stalled/orphan detection).
//
// The load-bearing property is what this surface does NOT show. A review that
// lists your work is the thing this audience cannot do; one that lists only what
// is structurally broken is a review someone might actually run. When nothing is
// broken it is not there at all.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fold, type State } from '../src/fold.ts';
import { stalled, orphaned, reviewExceptions, reviewWords, idleDays, REVIEW_CAP, unfedGoals, quietAreas, quietLines, QUIET_DAYS } from '../src/review.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';
const NOW = '2026-07-29T18:00:00.000Z';

let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at: NOW, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const st = (...e: AppEvent[]): State => fold(e);
const mk = (id: string, kind: string, title = id, parent?: string): AppEvent =>
  ev('node.created', id, { nodeKind: kind, title, ...(parent ? { parent } : {}) });

// --- the empty case, which is the normal one -------------------------------

test('nothing broken means nothing to show — not a congratulation', () => {
  const s = st(mk('P', 'project'), mk('A', 'action', 'a real next step', 'P'));
  const v = reviewExceptions(s, NOW, TZ);
  assert.equal(v.total, 0);
  assert.deepEqual(v.shown, [], 'the surface has nothing to render, so it renders nothing');
  // And no copy exists for a clean review, because there is no clean-review
  // state to congratulate anyone about (law 5: nothing here is a score).
});

// --- stalled ---------------------------------------------------------------

test('a project with no next action is the failure that looks fine everywhere else', () => {
  const s = st(mk('P', 'project', 'the quarterly report'));
  const out = stalled(s);
  assert.equal(out.length, 1);
  assert.equal(out[0]!.node.id, 'P');
  assert.equal(out[0]!.words, 'nothing under it yet');
});

test('a project whose only action is finished has stalled', () => {
  // The subtle one. It has a child, the child is done, and every other surface
  // in the app is perfectly happy about it.
  const s = st(
    mk('P', 'project'), mk('A', 'action', 'the only step', 'P'),
    ev('done.marked', 'A', { at: NOW }),
  );
  const out = stalled(s);
  assert.deepEqual(out.map(x => x.node.id), ['P']);
  assert.equal(out[0]!.words, 'nothing under it is moving');
});

test('what does NOT count as live work under a container', () => {
  // FACTORIES, not pre-built events. Built eagerly, the extra event took a
  // LOWER seq than the `node.created` events below it, so the fold applied it
  // first and `node.created` then reset the kind — the fixture testing the
  // opposite of what it claimed. Ordering is the whole engine; a test that
  // builds events out of order is testing a different history.
  const cases: [string, () => AppEvent[]][] = [
    ['trashed', () => [ev('node.trashed', 'A', {})]],
    ['on the Menu', () => [ev('menu.item.added', 'A', { category: 'read' })]],
    ['a waiting-for', () => [ev('node.kind.changed', 'A', { from: 'action', to: 'waiting-for' })]],
  ];
  for (const [name, extra] of cases) {
    const s = st(mk('P', 'project'), mk('A', 'action', 'x', 'P'), ...extra());
    assert.deepEqual(stalled(s).map(x => x.node.id), ['P'],
      `${name} does not keep a project moving`);
  }
});

test('an unrouted capture DOES keep it moving — triage already owns that', () => {
  // Sending someone to Review for something the inbox was about to solve is
  // exactly the noise this surface exists to avoid.
  const s = st(
    mk('P', 'project'),
    ev('capture.recorded', 'C', { text: 'a step', source: 'quick', sourceTags: [] }),
    ev('node.parented', 'C', { parent: 'P' }),
  );
  assert.deepEqual(stalled(s), [], 'the inbox is a live surface, not a stall');
});

test('only containers can stall — an action is not a container', () => {
  for (const kind of ['action', 'upkeep', 'waiting-for', 'person', 'anchor']) {
    const s = st(mk('N', kind));
    assert.deepEqual(stalled(s), [], `a bare ${kind} is not stalled, it is just itself`);
  }
  for (const kind of ['project', 'outcome', 'area']) {
    const s = st(mk('N', kind));
    assert.equal(stalled(s).length, 1, `an empty ${kind} has stalled`);
  }
  // A goal partitioned OUT of stalled at 1.6.0: an empty goal is the UNFED
  // class with its own words, and the classes partition by kind so a node is
  // never listed twice.
  const g = st(mk('N', 'goal'));
  assert.deepEqual(stalled(g), [], 'an empty goal is not stalled — it is unfed');
  assert.equal(unfedGoals(g).length, 1, 'and the unfed class holds it');
  assert.equal(unfedGoals(g)[0]!.words, 'nothing is feeding it');
});

test('a finished container is not stalled', () => {
  const s = st(mk('P', 'outcome'), ev('done.marked', 'P', { at: NOW }));
  assert.deepEqual(stalled(s), [], 'it is done, not stuck');
});

// --- orphaned --------------------------------------------------------------

test('a node whose parent was let go is found, not assumed impossible', () => {
  // The gate refuses to CREATE one. It can still arrive: a parent trashed by a
  // path that cured the children differently, or a shard delivering a child
  // whose parent never came (ADR-0035). An invariant nobody checks is a belief.
  const s = st(mk('P', 'project'), mk('A', 'action', 'stranded', 'P'), ev('node.trashed', 'P', {}));
  const out = orphaned(s);
  assert.deepEqual(out.map(x => x.node.id), ['A']);
  assert.equal(out[0]!.words, 'what it belonged to was let go');
});

test('a node whose parent never arrived is found too', () => {
  const s = st(mk('A', 'action', 'from another device', 'NEVER-CAME'));
  const out = orphaned(s);
  assert.deepEqual(out.map(x => x.node.id), ['A']);
  assert.equal(out[0]!.words, 'what it belonged to is not here');
});

test('a node with no parent at all is not an orphan', () => {
  const s = st(mk('A', 'action'));
  assert.deepEqual(orphaned(s), [], 'having no parent and losing one are different things');
});

// --- the surface -----------------------------------------------------------

test('orphans lead — a broken structure outranks a decision waiting', () => {
  const s = st(
    mk('P', 'project'),                                  // stalled
    mk('Q', 'project'), mk('A', 'action', 'x', 'Q'), ev('node.trashed', 'Q', {}),  // orphan
  );
  const v = reviewExceptions(s, NOW, TZ);
  assert.equal(v.shown[0]!.node.id, 'A', 'the orphan is first');
  assert.equal(v.total, 2);
});

test('capped, and honest about the cap', () => {
  const events: AppEvent[] = [];
  for (let i = 0; i < 7; i++) events.push(mk(`p${i}`, 'project'));
  const v = reviewExceptions(st(...events), NOW, TZ);
  // A LITERAL 3. Asserting against the constant the code uses is self-referential
  // — the same theatre an audit found in the replan cap.
  assert.equal(v.shown.length, 3, 'at most three');
  assert.equal(REVIEW_CAP, 3, 'and the constant is that number');
  assert.equal(v.total, 7, 'and it says how many there really are');
});

test('the words are a count, never a score', () => {
  assert.equal(reviewWords(1, 1), 'One thing needs a look.');
  assert.equal(reviewWords(3, 3), '3 things need a look.');
  assert.equal(reviewWords(7, 3), '7 things need a look. These 3 first.');
  for (const [t, sh] of [[1, 1], [2, 2], [7, 3], [40, 3]] as [number, number][]) {
    const w = reviewWords(t, sh);
    for (const shame of ['late', 'overdue', 'missed', 'fail', 'behind', 'neglect']) {
      assert.doesNotMatch(w, new RegExp(shame, 'i'), `"${w}" carries no rebuke`);
    }
  }
});

test('idle days is reported only where it is knowable', () => {
  const never = st(mk('P', 'project'), mk('A', 'action', 'x', 'P'));
  assert.equal(idleDays(never, never.nodes.get('P')!, NOW, TZ), null,
    'nothing has ever been finished under it, so there is no number to give');

  const s = st(
    mk('P', 'project'), mk('A', 'action', 'x', 'P'),
    ev('done.marked', 'A', { at: '2026-07-19T18:00:00.000Z' }),
  );
  assert.equal(idleDays(s, s.nodes.get('P')!, NOW, TZ), 10);
});

test('the order is total, so a render never reshuffles what it just showed', () => {
  const events: AppEvent[] = [];
  for (let i = 5; i >= 0; i--) events.push(mk(`p${i}`, 'project'));
  const ids = () => reviewExceptions(st(...events), NOW, TZ).shown.map(x => x.node.id);
  assert.deepEqual(ids(), ['p0', 'p1', 'p2'], 'by id, regardless of insertion order');
});

test('a spent resume card does not keep a container looking alive', () => {
  // FOUND BY AUDIT, 2026-07-29, in shipped 0.13.0–0.17.0 code.
  //
  // A project whose only remaining child was a dead resume card read as
  // perfectly healthy — which is the exact failure this surface exists to
  // catch, hidden by the leftovers of a different feature. `held.ts` learned
  // that a spent card is not work in 0.14.0; this file was not told.
  const s = st(
    mk('P', 'project', 'the report'),
    mk('C', 'action', 'a card', 'P'),
    ev('resume.card.created', 'C', { forNode: 'P', cue: null }),
    ev('resume.card.spent', 'C', {}),
  );
  assert.deepEqual(stalled(s).map(x => x.node.id), ['P'],
    'residue is not motion');

  // And a LIVE card still counts — it is a thread genuinely waiting for you.
  const live = st(
    mk('Q', 'project'),
    mk('D', 'action', 'a card', 'Q'),
    ev('resume.card.created', 'D', { forNode: 'Q', cue: null }),
  );
  assert.deepEqual(stalled(live), [], 'a way back into it is something happening');
});

// --- the two 1.6.0 classes: quiet areas and unfed goals ----------------------

test('1.6.0: a quiet area holds live work with nothing finished in a month', () => {
  const OLD = '2026-06-10T12:00:00.000Z';                 // 49 days before NOW
  const s = st(
    mk('A', 'area'),
    mk('W', 'action', 'live work', 'A'),
    mk('D', 'action', 'done long ago', 'A'),
    ev('done.marked', 'D', { at: OLD }),
  );
  const out = quietAreas(s, NOW, TZ);
  assert.deepEqual(out.map(x => x.node.id), ['A']);
  assert.equal(out[0]!.words, 'holding work, and nothing has finished in a month');
  assert.ok(QUIET_DAYS === 30, 'a month, stated');
});

test('1.6.0: a recently-moving area is not quiet, and unknowable rest does not count', () => {
  const RECENT = '2026-07-25T12:00:00.000Z';              // 4 days before NOW
  const moving = st(
    mk('A', 'area'), mk('W', 'action', 'w', 'A'), mk('D', 'action', 'd', 'A'),
    ev('done.marked', 'D', { at: RECENT }),
  );
  assert.deepEqual(quietAreas(moving, NOW, TZ), [], 'something finished this week');
  // Nothing has EVER finished: idleDays is null, and a number derived from
  // nothing is not a fact — the area stays out rather than reading as quiet
  // the day it is made.
  const fresh = st(mk('A', 'area'), mk('W', 'action', 'w', 'A'));
  assert.deepEqual(quietAreas(fresh, NOW, TZ), [], 'never-finished is unknowable, not quiet');
});

test('1.6.0: an empty area is stalled, never quiet — the classes are disjoint', () => {
  const s = st(mk('A', 'area'));
  assert.equal(stalled(s).length, 1);
  assert.deepEqual(quietAreas(s, NOW, TZ), [], 'no live work is stalled’s case');
});

test('1.6.0: a fed goal is neither unfed nor stalled', () => {
  const s = st(mk('G', 'goal'), mk('P', 'project', 'feeds it', 'G'), mk('W', 'action', 'w', 'P'));
  assert.deepEqual(unfedGoals(s), []);
  assert.deepEqual(stalled(s).map(x => x.node.id), [], 'the project under it has live work');
});

test('1.6.0: PARTITION — across all four classes, no node is listed twice', () => {
  const OLD = '2026-06-10T12:00:00.000Z';
  const s = st(
    mk('G', 'goal'),                                       // unfed
    mk('P', 'project'),                                    // stalled
    mk('A', 'area'), mk('W', 'action', 'w', 'A'),
    mk('D', 'action', 'd', 'A'), ev('done.marked', 'D', { at: OLD }),  // quiet
    mk('PARENT', 'project'), mk('C', 'action', 'c', 'PARENT'),
    ev('node.trashed', 'PARENT', {}),                      // C orphaned
  );
  const v = reviewExceptions(s, NOW, TZ);
  const ids = [...v.orphaned, ...v.stalled, ...v.unfed, ...v.quiet].map(x => x.node.id);
  assert.equal(new Set(ids).size, ids.length, `a node appears once (${ids.join(', ')})`);
  assert.ok(v.total >= 4, 'all four classes fired');
  // The ranking: structural breaks, then decisions waiting, then rhythm.
  assert.equal(v.shown[0]!.node.id, 'C', 'the orphan leads');
  assert.equal(v.shown.length, REVIEW_CAP, 'law 8 holds whatever the classes add');
});


// --- quiet lines (3.14.0) --------------------------------------------------
//
// The first exception class that is not a fact about the tree. Every assertion
// below was planted; the plants that carry weight are named on the ones they
// belong to.

const role = (id: string, name: string): AppEvent => ev('role.created', id, { name });
const wears = (n: string, r: string): AppEvent => ev('role.attached', n, { node: n, role: r });

test('a role that has never carried anything is not stale — it is new', () => {
  const s = st(role('R', 'The photography'));
  assert.deepEqual(quietLines(s), [],
    'naming six roles on a fresh store must not report six problems');
  // PLANT: dropping the `carriers.length === 0` guard turns this red, which is
  // the plant that matters — it is the failure mode that would make somebody
  // stop opening the surface on their first day.
});

test('a role carrying live work is not quiet', () => {
  const s = st(role('R', 'The photography'), mk('A', 'action', 'develop the roll'), wears('A', 'R'));
  assert.deepEqual(quietLines(s), []);
});

test('a role whose work is all finished says so, and says nothing else', () => {
  const s = st(
    role('R', 'The photography'),
    mk('A', 'action', 'develop the roll'), wears('A', 'R'),
    ev('done.marked', 'A', { at: NOW }),
  );
  const out = quietLines(s);
  assert.equal(out.length, 1);
  assert.equal(out[0]!.node.id, 'R');
  assert.equal(out[0]!.words, 'everything on it is finished');
  // Not "you have done nothing since", not a duration, not a count. The words
  // state what is true and stop, exactly as `stalled`'s two branches do.
  assert.ok(!/\b(day|week|month|since|ago|behind|should)\b/i.test(out[0]!.words),
    'no clock and no rebuke reaches this line');
});

test('a role carried only by a container with nothing moving under it is quiet', () => {
  const s = st(
    role('R', 'The photography'),
    mk('P', 'project', 'the darkroom'), wears('P', 'R'),
  );
  const out = quietLines(s);
  assert.equal(out.length, 1);
  assert.equal(out[0]!.words, 'nothing on it is moving');
});

test('a role tagged on the project, with a live action directly beneath, is NOT quiet', () => {
  const s = st(
    role('R', 'The photography'),
    mk('P', 'project', 'the darkroom'), wears('P', 'R'),
    mk('A', 'action', 'order fixer', 'P'),
  );
  assert.deepEqual(quietLines(s), [],
    'tagging the project instead of every action under it is the ordinary way to use a role');
});

test('THE TRANSITIVE CASE — the live work is TWO levels below the tagged container', () => {
  const s = st(
    role('R', 'The photography'),
    mk('G', 'goal', 'a body of work'), wears('G', 'R'),
    mk('P', 'project', 'the darkroom', 'G'),
    mk('A', 'action', 'order fixer', 'P'),
  );
  assert.deepEqual(quietLines(s), [],
    'a role on a goal, fed through a project — the shape `unfedGoals` exists to get right');
  // PLANT, and the first version of this test did NOT carry it: written one
  // level deep, a direct-children check passed it, so it asserted nothing the
  // shallow version would have failed. Two levels is what makes replacing
  // `liveBeneath(n.id)` with `(childrenOf.get(n.id) ?? []).some(isLiveWork)` go
  // red — measured, not assumed. The one-level case above stays, because it is
  // the ordinary shape and a walk that broke on it would be worse.
});

test('a role whose only work sits on the Menu is quiet — the Menu is demand-free', () => {
  const s = st(
    role('R', 'The photography'),
    mk('A', 'action', 'reprint the portfolio'), wears('A', 'R'),
    ev('menu.item.added', 'A', { category: 'make' }),
  );
  const out = quietLines(s);
  assert.equal(out.length, 1, 'law 6 says a Menu item makes no demand, so nothing is running on it');
  assert.equal(out[0]!.words, 'nothing on it is moving');
});

test('a quiet line joins the surface, ranked below unfed goals and above quiet areas', () => {
  const s = st(
    mk('G', 'goal', 'a calmer house'),
    role('R', 'The photography'),
    mk('A', 'action', 'develop the roll'), wears('A', 'R'),
    ev('done.marked', 'A', { at: NOW }),
  );
  const v = reviewExceptions(s, NOW, TZ);
  assert.equal(v.quietLines.length, 1);
  assert.equal(v.unfed.length, 1);
  assert.ok(v.total >= 2);
  const ids = v.shown.map(x => x.node.id);
  assert.ok(ids.indexOf('G') < ids.indexOf('R'), 'the stated end outranks the hat worn to serve it');
});

test('a let-go role leaves the surface with no migration', () => {
  const s = st(
    role('R', 'The photography'),
    mk('A', 'action', 'develop the roll'), wears('A', 'R'),
    ev('done.marked', 'A', { at: NOW }),
  );
  assert.equal(quietLines(s).length, 1);
  const gone = st(...[
    role('R', 'The photography'),
    mk('A', 'action', 'develop the roll'), wears('A', 'R'),
    ev('done.marked', 'A', { at: NOW }),
    ev('node.released', 'R', { at: NOW }),
  ]);
  assert.deepEqual(quietLines(gone), [],
    '`allRoles` resolves through state, so letting a role go removes it everywhere at once');
});
