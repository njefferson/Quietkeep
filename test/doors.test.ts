// The doors half of Contents (2.8.1, ADR-0099) — the reading rules, pinned.
//
// `doors()` is the twin of `stops()` and exists for the same reason: three
// surfaces came off the runway, and a surface with no door is a feature that has
// been deleted for everybody who cannot find it. So the rows are DERIVED from
// the markup — `data-contents-door` on the dialog, named by whatever its own
// `aria-labelledby` points at — and what is worth testing here is exactly that:
// which dialogs become rows, what names them, and what is skipped.
//
// The opening itself — that pressing a row shows the dialog and puts Contents
// away — is asserted in `tools/a11y.mjs` against a real browser, which is the
// only place that claim can honestly be made.
//
// Stub document, like `contents.test.ts` and for the same reason: this repo has
// no DOM in its unit tests, and adding one for a projection this small would be
// a dependency to keep rather than a check to trust.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doors } from '../src/ui/contents.ts';
import { loadDoorWords } from '../src/ui/load-ui.ts';

interface Surface {
  readonly id: string;
  readonly label: string;
  readonly name: string;
  /** What the surface publishes about its own state. */
  readonly count?: string;
  /** No aria-labelledby at all. */
  readonly unlabelled?: boolean;
}

/** The two methods `doors` calls, over a described set of surfaces. */
const pageOf = (surfaces: readonly Surface[]): Document => {
  const byId = new Map<string, { textContent: string }>();
  for (const s of surfaces) {
    byId.set(s.label, { textContent: s.name });
    if (s.count !== undefined) byId.set(`${s.id}-count`, { textContent: s.count });
  }
  return {
    querySelectorAll: (sel: string) => {
      assert.equal(sel, 'dialog[data-contents-door]',
        'doors must ask only for the surfaces that have marked themselves');
      return surfaces.map(s => ({
        id: s.id,
        getAttribute: (a: string) => (a === 'aria-labelledby' && !s.unlabelled ? s.label : null),
      }));
    },
    getElementById: (id: string) => byId.get(id) ?? null,
  } as unknown as Document;
};

test('a door is named by the surface itself — never by a list kept here', () => {
  const d = doors(pageOf([
    { id: 'sheet-load-entry', label: 'sheet-load-entry-title', name: 'How you are, and anything weighing on you' },
    { id: 'sort', label: 'sort-title', name: 'Sort things out' },
  ]));
  assert.deepEqual(d.map(x => x.name),
    ['How you are, and anything weighing on you', 'Sort things out']);
  assert.deepEqual(d.map(x => x.id), ['sheet-load-entry', 'sort']);
});

test('nothing is a door until it says so — an unmarked dialog has no row', () => {
  // The stub only ever returns what the selector matched, which is the point:
  // the selector IS the opt-in, so a sheet reached from somewhere else does not
  // acquire a second way in by existing.
  assert.deepEqual(doors(pageOf([])), []);
});

test('a door with nothing labelling it is skipped, not rendered nameless', () => {
  const d = doors(pageOf([
    { id: 'sheet-load-entry', label: 'x', name: 'How you are', unlabelled: true },
    { id: 'sort', label: 'sort-title', name: 'Sort things out' },
  ]));
  assert.deepEqual(d.map(x => x.id), ['sort']);
});

test('a door whose label element is empty is skipped too', () => {
  // A heading the app fills in at runtime is empty until it does. A row for it
  // would be a button that says nothing, which this app has paid a release for.
  const d = doors(pageOf([{ id: 'sheet-x', label: 'sheet-x-title', name: '   ' }]));
  assert.deepEqual(d, []);
});

test('a door carries what its surface publishes about itself, or null', () => {
  const d = doors(pageOf([
    { id: 'sheet-load-entry', label: 'sheet-load-entry-title', name: 'How you are', count: 'a low stretch · 2 things on you' },
    { id: 'sort', label: 'sort-title', name: 'Sort things out' },
  ]));
  assert.equal(d[0]!.count, 'a low stretch · 2 things on you');
  assert.equal(d[1]!.count, null);
});

test('an empty state line is null rather than an empty row', () => {
  const d = doors(pageOf([
    { id: 'sheet-load-entry', label: 'sheet-load-entry-title', name: 'How you are', count: '   ' },
  ]));
  assert.equal(d[0]!.count, null);
});

// --- what the load door actually says ---------------------------------------
//
// The words are the mitigation, not decoration: out of sight is the collision
// this whole app is a rebuttal to, so a surface that holds something has to say
// so from behind its own door.

test('a door with nothing behind it says nothing at all', () => {
  // NOT "0 things on you". A standing zero is a reminder that you have not
  // filled something in, and this entry has been defended against exactly that
  // since it was built.
  assert.equal(loadDoorWords(null, 0), '');
});

test('what you said comes back in your own word', () => {
  assert.equal(loadDoorWords('low', 0), 'a low stretch');
  assert.equal(loadDoorWords('unsure', 0), 'not sure');
});

test('weights are counted in things, and one is singular', () => {
  assert.equal(loadDoorWords(null, 1), '1 thing on you');
  assert.equal(loadDoorWords(null, 3), '3 things on you');
});

test('both facts join with the separator the rest of the app uses', () => {
  assert.equal(loadDoorWords('steady', 2), 'steady · 2 things on you');
});

test('the door never scores, never totals against a target, and never judges', () => {
  for (const cap of [null, 'low', 'steady', 'sharp', 'unsure'] as const) {
    for (const n of [0, 1, 2, 9]) {
      const words = loadDoorWords(cap, n);
      assert.equal(/%|\bof\b\s*\d|\bout of\b/.test(words), false,
        `no proportion in "${words}"`);
      assert.equal(/overdue|behind|too much|should|failing|streak/i.test(words), false,
        `no judgement in "${words}"`);
    }
  }
});
