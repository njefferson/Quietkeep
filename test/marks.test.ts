// The one inline-markup parser, held to BOTH of its callers' contracts.
//
// It replaced a splitter that lived inside about.ts and served patch notes
// alone. The walkthrough needed the same thing with a different marker, so this
// covers both shapes: a shared helper only ever exercised by one caller is
// shared in name only.
//
// Pure on purpose. The part that can be wrong is where a span opens and closes
// and what happens to a marker with no partner — none of which needs a DOM, and
// a DOM here would have meant a new dependency to make a test convenient.
import test from 'node:test';
import assert from 'node:assert/strict';
import { segments } from '../src/ui/marks.ts';

/** Compact shape for reading a failure: `Not this` is marked, plain text is not. */
const shape = (text: string, marker: string): string =>
  segments(text, marker).map(s => (s.marked ? `[${s.text}]` : s.text)).join('');

test('a control name is marked, and the sentence round it is not', () => {
  assert.equal(shape('*Not this* moves past it.', '*'), '[Not this] moves past it.');
});

test('a note lead is marked — the shape the patch notes already had', () => {
  assert.equal(
    shape('**The offer says when you wrote it.** A lot of what people write', '**'),
    '[The offer says when you wrote it.] A lot of what people write',
  );
});

test('several marked spans in one line', () => {
  assert.equal(shape('Press *Hold it*, then *Not this*.', '*'), 'Press [Hold it], then [Not this].');
});

// THE GUARD THAT MATTERS, and it is the one that has already failed on a device:
// an earlier splitter printed the asterisks on the panel. An unpaired marker is
// text, and must not swallow the rest of the line.
test('an unpaired marker is text, and nothing after it is marked', () => {
  assert.equal(shape('5 * 3 is fifteen', '*'), '5 * 3 is fifteen');
  assert.equal(shape('an **unclosed lead', '**'), 'an **unclosed lead');
  assert.deepEqual(segments('5 * 3', '*'), [{ text: '5 * 3', marked: false }]);
});

test('no marker at all is left exactly alone', () => {
  assert.deepEqual(segments('Nothing to mark here.', '*'),
    [{ text: 'Nothing to mark here.', marked: false }]);
});

test('an empty run emits no segment, so nothing renders an empty element', () => {
  assert.deepEqual(segments('**', '*'), []);
  assert.equal(segments('a **b** c', '**').every(s => s.text !== ''), true);
});

// The two markers are used by different callers on different strings and are
// NOT designed to nest. Asserted so the ceiling is a decision on the record
// rather than something a future caller discovers.
test('the two marks do not nest, and the parser says so plainly', () => {
  assert.equal(shape('**a *b* c**', '**'), '[a *b* c]');
});

// Every walkthrough string is parsed here, so a typo in the copy — one asterisk
// where two were meant — fails the suite rather than printing an asterisk to
// somebody on their first run.
test('every marked name in the walkthrough copy closes', async () => {
  const src = await import('node:fs').then(fs =>
    fs.readFileSync(new URL('../src/ui/tour.ts', import.meta.url), 'utf8'));
  const lines = [...src.matchAll(/^\s+'((?:[^'\\]|\\.)*)',?$/gm)].map(m => m[1]!);
  const withMarks = lines.filter(l => l.includes('*'));
  assert.ok(withMarks.length >= 4, `expected the walkthrough to name controls, found ${withMarks.length}`);
  for (const line of withMarks) {
    assert.equal(line.split('*').length % 2, 1, `unpaired marker in walkthrough copy: ${line.slice(0, 60)}`);
    assert.ok(segments(line, '*').some(s => s.marked), `marker present but nothing marked: ${line.slice(0, 60)}`);
  }
});
