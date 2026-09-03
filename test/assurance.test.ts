// THE PROOF OF JUDGEMENT — law 4's analogue of the coverage gauge (3.23.0).
//
// `coverageProof` answers law 1: nothing is LOST, and here are the named
// reasons, checkable from outside. Nothing answered law 4 — that what is being
// SHOWN is right — so the app could demonstrate its integrity and not its
// judgement, and the only way to check the offer was to read the whole store.
// `NOTES.md` names that asymmetry and calls this the highest-value thing to
// build; Q-11 gated it on ranking-versus-trust and closed on 2026-08-17.
//
// The load-bearing properties, and every one of them is a way the claim could
// be false:
//
//   - It is TOTAL. Every held thing sits in exactly one named place, and the
//     places sum to the total. A proof with a gap is a summary.
//   - The places ARE `heldGroups`' own groups, in its own words — the same rule
//     `whyCovered` follows about `isSilent`'s clauses, so the proof and the list
//     cannot disagree about one item.
//   - It names what it CANNOT account for: the review exceptions, computed in
//     `review.ts` and never reaching the surfacing layer.
//   - It grades nothing and ranks nothing (entry 5, laws 5 and 7).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fold, type State } from '../src/fold.ts';
import { heldWork } from '../src/gate.ts';
import { heldGroups } from '../src/held.ts';
import { judgementProof, assuranceWords, assuranceFact, placeCountWords, gapWords } from '../src/assurance.ts';
import type { AppEvent } from '../src/events.ts';

const DENVER = 'America/Denver';
const NOW = '2026-09-03T18:00:00.000Z';

let seq = 0;
const ev = (kind: string, node: string | null, payload: unknown): AppEvent =>
  ({ id: `e${seq}`, vault: 'personal', at: NOW, device: 'd0', seq: seq++, kind, node, payload } as AppEvent);
const st = (...e: AppEvent[]): State => fold(e);
const mk = (id: string, kind: string, title = id, parent?: string): AppEvent =>
  ev('node.created', id, { nodeKind: kind, title, ...(parent ? { parent } : {}) });
const clockAt = (id: string, days: number, kind = 'due'): AppEvent =>
  ev('clock.set', id, { clockKind: kind, at: new Date(Date.parse(NOW) + days * 86_400_000).toISOString(), source: 't' });

/** A store with something in most of the held list's groups. */
const mixed = (): AppEvent[] => [
  mk('A', 'action', 'ready today'), clockAt('A', 0),
  mk('B', 'action', 'coming up'), clockAt('B', 3),
  mk('C', 'action', 'later'), clockAt('C', 90),
  mk('L', 'action', 'a date that went by'), clockAt('L', -5),
  mk('M', 'action', 'a want'), ev('menu.item.added', 'M', { category: 'read' }),
  mk('D', 'action', 'finished'), clockAt('D', 1), ev('done.marked', 'D', { at: NOW }),
];

test('it is TOTAL — every held thing sits in exactly one named place', () => {
  const s = st(...mixed());
  const p = judgementProof(s, NOW, DENVER);
  const summed = p.places.reduce((n, x) => n + x.count, 0);
  assert.equal(summed, p.total, 'the places account for everything held');
  assert.equal(p.total, heldWork(s).length, 'and the total is the gate’s own set');
  assert.equal(p.holds, true);
  // PLANT: dropping any group from the partition makes `holds` false rather
  // than making the surface quietly under-report, which is the whole point.
});

test('the places ARE the held list’s groups, in its own words', () => {
  const s = st(...mixed());
  const p = judgementProof(s, NOW, DENVER);
  const groups = heldGroups(s, NOW, DENVER);
  assert.deepEqual(p.places.map(x => x.key), groups.map(g => g.key),
    'same groups, same order — one definition, so they cannot disagree');
  assert.deepEqual(p.places.map(x => x.title), groups.map(g => g.title),
    'and the same words: a second vocabulary is a second thing to learn');
  for (const g of groups) {
    assert.equal(p.places.find(x => x.key === g.key)?.count, g.items.length);
  }
});

test('it says what is in front of you NOW, and that is ready and replan', () => {
  const s = st(...mixed());
  const p = judgementProof(s, NOW, DENVER);
  const groups = heldGroups(s, NOW, DENVER);
  const ready = groups.find(g => g.key === 'ready')?.items.length ?? 0;
  const replan = groups.find(g => g.key === 'replan')?.items.length ?? 0;
  assert.equal(p.onWorkSurface, ready + replan, 'the two groups the work surface draws');
  assert.ok(p.onWorkSurface > 0 && p.onWorkSurface < p.total,
    'and it is a real subset — the claim is about the rest being accounted for');
});

test('it NAMES what it cannot account for — the exceptions that never surface', () => {
  // A goal with nothing feeding it is a review exception, computed in
  // `review.ts` and never reaching a surface. That is the honest gap.
  const s = st(mk('G', 'goal', 'a calmer service'), clockAt('G', 30));
  const p = judgementProof(s, NOW, DENVER);
  assert.ok(p.neverSurfaced.length > 0, 'the gap is reported rather than papered over');
  assert.match(gapWords(p.neverSurfaced.length) ?? '', /worth a look/i);
  assert.equal(gapWords(0), null, 'and nothing is said when there is no gap');
  // PLANT: a proof that can only say "fine" is asking for the exact faith the
  // reader does not have — `coverageProof`'s own reasoning, one law over.
});

test('the words end the scan without grading anybody', () => {
  const s = st(...mixed());
  const p = judgementProof(s, NOW, DENVER);
  const said = [assuranceWords(p), ...p.places.map(x => placeCountWords(x)), gapWords(p.neverSurfaced.length) ?? '']
    .join(' ');
  assert.match(assuranceWords(p), /accounted for/i, 'it states the claim plainly');
  // WORD BOUNDARIES, and the first version did not have them: `late` matched
  // *Later*, which is the held list's own group name and entirely innocent. A
  // gate that fires on honest prose is worse than a miss — it trains somebody
  // to change good copy, which is `pages-a11y`'s recorded lesson one file over.
  assert.doesNotMatch(said, /\boverdue\b|\bbehind\b|\blate\b|\bshould\b|\bworst\b|\bscore\b|%|priorit|important|urgent/i,
    'no rank, no grade, no importance — entry 5 and laws 5 and 7');
});

test('an empty store makes no claim about nothing', () => {
  const p = judgementProof(st(), NOW, DENVER);
  assert.equal(p.total, 0);
  assert.equal(p.places.length, 0);
  assert.match(assuranceWords(p), /nothing here yet/i);
});

test('it narrows nothing — the projection is pure', () => {
  const s = st(...mixed());
  const before = JSON.stringify([...s.nodes.keys()].sort());
  judgementProof(s, NOW, DENVER);
  assert.equal(JSON.stringify([...s.nodes.keys()].sort()), before);
});

test('the button says it in the gauge’s own register, short', () => {
  const s = st(...mixed());
  const fact = assuranceFact(judgementProof(s, NOW, DENVER));
  assert.match(fact, /^everything accounted for · \d+ in front of you$/,
    'lowercase, one middot, two facts — `#gauge`’s line, not a second style');
  assert.ok(fact.length < 60, `short enough to glance at (${fact.length})`);
});
