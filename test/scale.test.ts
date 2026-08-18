// The app's own text size (2.8.0, ADR-0098).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCALE_CHOICES, SCALE_MIN, SCALE_MAX, normaliseScale, scaleWords, scaleNote,
  getScale, setScale, applyScale,
} from '../src/scale.ts';

test('nonsense from the store reads as the usual size, never as a broken app', () => {
  // A device preference that cannot be trusted must not be able to stop the app
  // starting, and must not be able to render it unreadable.
  for (const bad of [null, undefined, 'big', NaN, Infinity, 0, -2, {}]) {
    assert.equal(normaliseScale(bad), 1, `${String(bad)} should read as 1`);
  }
});

test('a value from a future version with a wider band is CLAMPED, not obeyed', () => {
  // The same additive-migration instinct the snapshot defaults follow: an older
  // build meeting a newer value must degrade to something usable.
  assert.equal(normaliseScale(4), SCALE_MAX);
  assert.equal(normaliseScale(0.1), SCALE_MIN);
});

test('every offered choice is inside the band it is clamped to', () => {
  for (const c of SCALE_CHOICES) {
    assert.equal(normaliseScale(c.value), c.value, `${c.words} survives its own clamp`);
    assert.ok(c.value >= SCALE_MIN && c.value <= SCALE_MAX);
  }
});

test('the choices are words, and "the usual" is exactly 1', () => {
  // A percentage invites getting it "right", and there is no right answer to how
  // big text should be for somebody else.
  for (const c of SCALE_CHOICES) assert.match(c.words, /[a-z]/);
  assert.ok(SCALE_CHOICES.some(c => c.value === 1 && c.words === 'the usual'));
  assert.deepEqual([...SCALE_CHOICES].map(c => c.value).sort((a, b) => a - b),
    SCALE_CHOICES.map(c => c.value), 'offered smallest first');
});

test('the note states the SCOPE, because scope was the whole request', () => {
  const n = scaleNote(1.3);
  assert.match(n, /this app/i);
  assert.match(n, /this device/i);
  // And it says the data is untouched — a control that changes how everything
  // looks is exactly when somebody wonders whether it changed anything else.
  assert.match(n, /nothing you have written down/i);
});

test('it never says a number at the reader', () => {
  for (const c of SCALE_CHOICES) {
    assert.doesNotMatch(scaleNote(c.value), /\d/, `"${c.words}" states no figure`);
  }
});

test('scaleWords falls back sensibly for a clamped or unlisted value', () => {
  assert.equal(scaleWords(1), 'the usual');
  assert.equal(scaleWords(1.4), 'bigger');
  assert.equal(scaleWords(0.9), 'smaller');
});

test('the live value is cached and normalised on the way in', () => {
  setScale(9);
  assert.equal(getScale(), SCALE_MAX, 'a wild value is clamped, not stored raw');
  setScale(1);
  assert.equal(getScale(), 1);
});

test('applying MULTIPLIES the reader’s own base rather than overriding it', () => {
  // Somebody with large system text who picks "a little smaller" should get
  // their large text, a little smaller — not be thrown back to 16px. A percentage
  // on the root is relative to whatever their browser is already doing;
  // an absolute px value would be this app overruling their device setting,
  // which is the opposite of what was asked for.
  const style: Record<string, string> = {};
  const doc = { documentElement: { style } } as unknown as Document;
  applyScale(1.3, doc);
  assert.match(style.fontSize!, /%$/, 'relative, never absolute');
  assert.doesNotMatch(style.fontSize!, /px/);
});

test('the usual size clears the override entirely', () => {
  // Not "100%" — nothing at all, so a reader back at the default is in exactly
  // the state they would be in had they never touched the control.
  const style: Record<string, string> = { fontSize: '130.00%' };
  const doc = { documentElement: { style } } as unknown as Document;
  applyScale(1, doc);
  assert.equal(style.fontSize, '');
});
