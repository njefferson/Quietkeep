// THE SAMPLE HAS TO BE DATA SOMEBODY COULD ACTUALLY HAVE.
//
// It is the instrument the app is tested with, so a defect in it is a defect in
// every judgement made using it — and it is also the first thing a new reader
// sees. It was built from flat lists paired at random: fourteen project names,
// twenty action fragments, and ten areas, combined by index and by chance. That
// produced cards like "Photograph the meter" under "Plan the trip north", and
// place lines reading "in Get the bike serviced · under Reading".
//
// Every action title in it is a FRAGMENT, because that is how people write. A
// fragment is legible exactly when the thing above it supplies the missing
// noun — so a wrong parent is worse than no parent, since the app is then
// confidently showing a context that is not true.
//
// These hold the two rules that fix it: a fragment always has a parent that
// makes sense of it, and anything loose carries its own subject.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { bigSampleEvents } from '../src/big-sample.ts';
import { fold, type State } from '../src/fold.ts';
import { admit, gateOptionsFor } from '../src/gate.ts';
import { atMidnight } from '../src/time.ts';

const NOW = '2026-08-10T18:00:00.000Z';
const TZ = 'America/Denver';

/** Built once — deterministic, so one build is every build. Through the REAL
 *  gate, exactly as importing the sample does. */
let cached: State | null = null;
async function sample(): Promise<State> {
  if (cached) return cached;
  let n = 0, s = 0;
  const events = await bigSampleEvents({
    at: NOW, device: 'big-sample', vault: 'personal', zone: TZ, day: atMidnight(TZ),
    seq: () => s++, id: () => `g${n++}`,
  } as never, NOW);
  cached = fold(admit(events, fold([]), gateOptionsFor(TZ)));
  return cached;
}

test('every action sits under a project whose own steps include it', async () => {
  // The load-bearing one. A step belongs to exactly one project by
  // construction, so "is this step listed by its parent" is decidable without
  // any judgement about whether the words go together.
  const { PROJECTS, MOVE_STEPS, AWKWARD_TITLES } = await import('../src/big-sample.ts');
  const stepsOf = new Map(PROJECTS.map(p => [p.title, new Set(p.steps)]));
  const state = await sample();

  const wrong: string[] = [];
  for (const n of state.nodes.values()) {
    if (n.kind !== 'action' || !n.parent) continue;
    const parent = state.nodes.get(n.parent);
    if (!parent || parent.kind !== 'project') continue;
    const title = n.title ?? '';
    if (MOVE_STEPS.includes(title)) continue;           // the over-cap container
    if (title.endsWith(' — decided against')) continue; // released, not a step
    // The awkward titles are RENDERING probes — a title at the 200-character
    // cap, one with diacritics and CJK, one starting with `=` that a
    // spreadsheet would execute. They exist to stress how a card draws, not to
    // read as somebody's work, so they are exempt BY NAME rather than by a
    // pattern that would quietly swallow real content too.
    if (AWKWARD_TITLES.includes(title)) continue;
    const own = stepsOf.get(parent.title ?? '');
    if (!own || !own.has(title)) wrong.push(`"${title}" under "${parent.title}"`);
  }
  assert.deepEqual(wrong, [],
    'these are steps filed under a project they have nothing to do with');
});

test('every project sits under the area it declares', async () => {
  const { PROJECTS } = await import('../src/big-sample.ts');
  const areaOf = new Map(PROJECTS.map(p => [p.title, p.area]));
  const state = await sample();

  const wrong: string[] = [];
  for (const n of state.nodes.values()) {
    if (n.kind !== 'project' || !n.parent) continue;
    const want = areaOf.get(n.title ?? '');
    if (!want) continue;                                 // the move container
    const area = state.nodes.get(n.parent);
    if (area?.title !== want) wrong.push(`"${n.title}" under "${area?.title}" (should be "${want}")`);
  }
  assert.deepEqual(wrong, [],
    'the place line would read as nonsense for these — "in X · under <unrelated>"');
});

test('nothing loose is a fragment — a card with no place must carry its own subject', async () => {
  const { PROJECTS } = await import('../src/big-sample.ts');
  const fragments = new Set(PROJECTS.flatMap(p => p.steps));
  const state = await sample();

  const bare = [...state.nodes.values()]
    .filter(n => n.kind === 'action' && !n.parent && fragments.has(n.title ?? ''))
    .map(n => n.title ?? '');
  assert.deepEqual(bare, [],
    'with no parent there is no place line, so a fragment here names nothing at all');
});

test('and the sample still HAS loose items — the fix is the words, not forcing a parent', async () => {
  // A real store is full of them, and since 2.0.0 an unsorted capture is offered
  // as work. Parenting everything would make the sample easier and less honest,
  // and would stop exercising the path the offer surface meets most.
  const state = await sample();
  const loose = [...state.nodes.values()].filter(n => n.kind === 'action' && !n.parent);
  assert.ok(loose.length > 0, 'the sample must still exercise items with no parent');
});
