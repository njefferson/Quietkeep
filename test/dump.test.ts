// Room for many lines (1.38.0) — the capture form with a page instead of a line.
//
// The thing under test is small on purpose. What makes this feature safe is not
// clever splitting, it is that NOTHING HAPPENS until the button is pressed and
// that each line becomes an ordinary capture the gate cures like any other. So
// what is asserted here is the rule for turning text into items, and the fact
// that a batch is indistinguishable from N separate captures once it has landed.
//
// The parts that only exist in a browser — the paste reading the clipboard past
// a single-line box that would strip its newlines, the draft coming back with
// its shape after a reload — are walked in `tools/smoke.mjs`, because asserting
// them here would only prove a fake behaves like a fake.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { dumpLines } from '../src/ui/app.ts';
import { captureEvent, openSession, type StampContext } from '../src/ui/session.ts';
import { MemoryLogStore } from '../src/log-store.ts';
import { atMidnight } from '../src/time.ts';
import type { AppEvent } from '../src/events.ts';

const TZ = 'America/Denver';
const NOW = '2026-08-09T15:00:00.000Z';

let n = 0;
const ctx = (): StampContext => {
  let s = 0;
  return {
    at: NOW, device: 'd0', vault: 'personal', zone: TZ,
    day: atMidnight(TZ),
    seq: () => s++, id: () => `c${n++}`,
  };
};

// --- what becomes an item ---------------------------------------------------

test('one item per line, each trimmed', () => {
  assert.deepEqual(
    dumpLines('  ring the school \n bins out\nbook the car in  '),
    ['ring the school', 'bins out', 'book the car in'],
  );
});

test('blank lines are dropped, including whitespace-only ones', () => {
  // Somebody writing a list under headings leaves gaps. A gap is not a thing to
  // do, and an empty item would be a node with no text that still has to be
  // triaged — the app manufacturing work out of formatting.
  assert.deepEqual(dumpLines('one\n\n  \t \ntwo\n\n'), ['one', 'two']);
});

test('a single line is still one item, so the same path serves both', () => {
  assert.deepEqual(dumpLines('just the one'), ['just the one']);
});

test('nothing but whitespace is nothing at all', () => {
  assert.deepEqual(dumpLines('   \n\n \t\n'), []);
  assert.deepEqual(dumpLines(''), []);
});

test('interior punctuation and blank-looking characters are NOT parsed', () => {
  // No bullet stripping, no numbering, no dates lifted out. Deciding while
  // dumping stops the dumping — and every one of those is the app forming an
  // opinion about text somebody has not finished writing.
  assert.deepEqual(
    dumpLines('- milk\n2. call dad back\n* the thing with the roof'),
    ['- milk', '2. call dad back', '* the thing with the roof'],
  );
});

test('a line is kept whole however long it is', () => {
  const long = 'a'.repeat(4000);
  assert.deepEqual(dumpLines(long), [long]);
});

// --- what lands -------------------------------------------------------------

/** What the form proposes: one transaction, one capture event per line. */
const propose = (raw: string, source: 'dump' | 'quick' = 'dump'): AppEvent[] => {
  const c = ctx();
  return dumpLines(raw).flatMap((line) => captureEvent(c, line, source));
};

test('every node in a batch is distinct, so nothing overwrites anything', () => {
  // The ULIDs are minted inside ONE transaction, at ONE timestamp — every one of
  // them encodes the same millisecond. Without the random half, two hundred
  // lines would collapse onto one node and a dump would land as a single item.
  const proposed = propose(Array.from({ length: 200 }, (_, i) => `x${i}`).join('\n'));
  assert.equal(proposed.length, 200, 'one capture event per line');
  assert.equal(new Set(proposed.map((e) => e.node)).size, 200);
});

test('the log says a batch arrived as a batch, not as keystrokes', () => {
  for (const e of propose('one\ntwo')) {
    assert.equal((e.payload as { source: string }).source, 'dump',
      'a capture that says it came from a keystroke when it came from a pasted ' +
      'document is a small lie in the one place this app keeps its history');
  }
});

test('the single-line path is unchanged and still says `quick`', () => {
  const proposed = propose('just the one', 'quick');
  assert.equal(proposed.length, 1);
  assert.equal((proposed[0]!.payload as { source: string }).source, 'quick');
});

test('text is stored exactly as written, with no escaping applied on the way in', () => {
  // Same rule the URL endpoint follows: store text as text, render with
  // textContent. Escaping at the boundary would put &amp; in somebody's note.
  const proposed = propose('a & b <img src=x>\nplain');
  assert.equal((proposed[0]!.payload as { text: string }).text, 'a & b <img src=x>');
});

// --- through the real gate --------------------------------------------------

test('a batch of forty lands as forty covered items, in one commit', async () => {
  // The whole batch through the real session and the real write gate. Law 1's
  // teeth live in that gate: an unclarified capture must get its same-day cure
  // IN THE SAME TRANSACTION, so there is no window in which any of the forty is
  // silent. A batch that cured only the first line would report as covered while
  // thirty-nine sat unreachable — the "clock nobody reads" defect, in bulk.
  const store = new MemoryLogStore();
  const tick = (() => { let t = Date.parse(NOW); return () => t += 7; })();
  const session = await openSession(tick, 'personal', 'test', store);

  const raw = Array.from({ length: 40 }, (_, i) => `thing ${i}`).join('\n');
  const lines = dumpLines(raw);
  await session.commit((c) => lines.flatMap((line) => captureEvent(c, line, 'dump')));

  const all = await store.all();
  const captures = all.filter((e) => e.kind === 'capture.recorded');
  const cures = all.filter((e) => e.kind === 'clock.set');

  assert.equal(captures.length, 40);
  assert.equal(cures.length, 40, 'every line got its own cure, in the same transaction');
  assert.deepEqual(
    new Set(cures.map((e) => e.node)),
    new Set(captures.map((e) => e.node)),
    'each cure points at its own line, not all at the first',
  );

  // And the state agrees: forty nodes, none of them silent.
  const state = session.state();
  assert.equal(state.nodes.size, 40);
});
