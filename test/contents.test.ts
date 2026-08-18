// What is on this page (2.3.0, ADR-0093) — the reading half, pinned.
//
// `stops()` reads the page rather than a list, so what is worth testing is the
// READING RULES: which blocks become rows, what names them, and what is skipped.
// The route itself — that pressing a row closes the sheet, moves the page and
// lands focus — is asserted in `tools/a11y.mjs` against a real browser, which is
// the only place that claim can honestly be made.
//
// The document here is a stub implementing exactly the two methods `stops` uses.
// This repo has no DOM in its unit tests and adding one for a projection this
// small would be a dependency to keep rather than a check to trust.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stops } from '../src/ui/contents.ts';

interface Block {
  readonly id: string;
  readonly label: string;
  readonly name: string;
  readonly hidden?: boolean;
  readonly count?: string;
  /** Not a direct child of <main> — a section inside a dialog, say. */
  readonly nested?: boolean;
  /** No aria-labelledby at all. */
  readonly unlabelled?: boolean;
}

/** The two methods `stops` calls, over a described page. */
const pageOf = (blocks: readonly Block[]): Document => {
  const byId = new Map<string, { textContent: string }>();
  for (const b of blocks) {
    byId.set(b.label, { textContent: b.name });
    if (b.count !== undefined) byId.set(`${b.id}-count`, { textContent: b.count });
  }
  return {
    querySelectorAll: (sel: string) => {
      assert.equal(sel, 'main > section[id]', 'stops must ask only for the runway’s own blocks');
      return blocks.filter(b => !b.nested).map(b => ({
        id: b.id,
        hidden: b.hidden === true,
        getAttribute: (a: string) => (a === 'aria-labelledby' && !b.unlabelled ? b.label : null),
      }));
    },
    getElementById: (id: string) => byId.get(id) ?? null,
  } as unknown as Document;
};

const named = (doc: Document) => stops(doc).map(s => s.name);

test('the top of the page is always the first row, and it is not a block', () => {
  const s = stops(pageOf([]));
  assert.deepEqual(s.map(x => x.id), ['top']);
  assert.equal(s[0]!.focus, '#capture');
});

test('a row is named by whatever labels the block — never by a list kept here', () => {
  const doc = pageOf([
    { id: 'nextup', label: 'nextup-heading', name: 'Next up' },
    { id: 'replan', label: 'replan-heading', name: 'Needs a new plan' },
  ]);
  assert.deepEqual(named(doc), ['The top of the page', 'Next up', 'Needs a new plan']);
  // Focus goes to the labelling element, which is the one carrying tabindex=-1.
  assert.equal(stops(doc)[1]!.focus, '#nextup-heading');
});

test('page order is kept — the contents and the page read the same way down', () => {
  const doc = pageOf([
    { id: 'reentry', label: 'reentry-heading', name: 'Welcome back' },
    { id: 'nextup', label: 'nextup-heading', name: 'Next up' },
    { id: 'held', label: 'held-heading', name: 'What you are holding' },
  ]);
  assert.deepEqual(named(doc),
    ['The top of the page', 'Welcome back', 'Next up', 'What you are holding']);
});

test('a hidden block gets no row — a route to nowhere is worse than no route', () => {
  const doc = pageOf([
    { id: 'nextup', label: 'nextup-heading', name: 'Next up' },
    { id: 'focus', label: 'focus-heading', name: 'Working on', hidden: true },
    { id: 'held', label: 'held-heading', name: 'What you are holding' },
  ]);
  assert.deepEqual(named(doc), ['The top of the page', 'Next up', 'What you are holding']);
});

test('a heading the app has not filled in yet is skipped, not rendered wordless', () => {
  // `#bother` and `#triage` ship with empty <h2>s and get their text at runtime.
  // A row for one before it has any would be a button with no accessible name —
  // the axe critical the held list already cost a release for.
  const doc = pageOf([
    { id: 'triage', label: 'triage-prompt', name: '   ' },
    { id: 'nextup', label: 'nextup-heading', name: 'Next up' },
  ]);
  assert.deepEqual(named(doc), ['The top of the page', 'Next up']);
});

test('a block with nothing labelling it is skipped rather than guessed at', () => {
  const doc = pageOf([
    { id: 'mystery', label: 'x', name: 'Whatever', unlabelled: true },
    { id: 'nextup', label: 'nextup-heading', name: 'Next up' },
  ]);
  assert.deepEqual(named(doc), ['The top of the page', 'Next up']);
});

test('the count is the block’s own words, and absent when it publishes none', () => {
  const doc = pageOf([
    { id: 'replan', label: 'replan-heading', name: 'Needs a new plan', count: '3 dates have gone by' },
    { id: 'focus', label: 'focus-heading', name: 'Working on' },
    { id: 'people', label: 'people-heading', name: 'With other people', count: '   ' },
  ]);
  const s = stops(doc);
  assert.equal(s[1]!.count, '3 dates have gone by');
  assert.equal(s[2]!.count, null);
  // Whitespace is not a count. A row saying nothing in a space where a number
  // goes reads as a number that failed to load.
  assert.equal(s[3]!.count, null);
});

test('sections inside sheets are never offered — that route does not exist', () => {
  // The Menu is a <section> too, and it lives inside a closed dialog.
  const doc = pageOf([
    { id: 'nextup', label: 'nextup-heading', name: 'Next up' },
    { id: 'menu', label: 'sheet-menu-title', name: 'The Menu', nested: true },
  ]);
  assert.deepEqual(named(doc), ['The top of the page', 'Next up']);
});
