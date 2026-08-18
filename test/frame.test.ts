// When the frame stands down (2.9.2, ADR-0101) — the threshold, pinned.
//
// Reported from a device: at a larger text size the proof line is cut through
// the middle of its own sentence. The frame was capped at half the viewport with
// `overflow-y: auto`, so past the cap it scrolled inside itself and clipped.
//
// The decision lives in a pure module for one reason: a threshold with
// hysteresis is easy to get subtly wrong and cheap to pin down, and the wrong
// version does not look wrong — it looks like a page that rebuilds itself while
// you read it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameShouldStandDown, FRAME_MAX_SHARE, FRAME_BACK_SHARE } from '../src/frame.ts';

const VH = 844;

test('a small frame stays up', () => {
  // The measured default at 390x844: 260px of content, 31% of the viewport.
  assert.equal(frameShouldStandDown(260, VH, false), false);
});

test('a frame past half the viewport stands down', () => {
  // The measured failure: 474px of content at 175% browser text.
  assert.equal(frameShouldStandDown(474, VH, false), true);
  // And the app's own 150%, which reproduced the same defect.
  assert.equal(frameShouldStandDown(468, VH, false), true);
});

test('the measured 150% browser case is the last one that still fits', () => {
  // 418px is 49.5% — under the line, and it rendered whole on the probe.
  assert.equal(frameShouldStandDown(418, VH, false), false);
});

test('it comes back only at a LOWER share than it left at', () => {
  const leaves = Math.ceil(VH * FRAME_MAX_SHARE) + 1;
  const down = frameShouldStandDown(leaves, VH, false);
  assert.equal(down, true);
  // Just under the leaving line is NOT enough to bring it back.
  const justUnder = Math.floor(VH * FRAME_MAX_SHARE) - 1;
  assert.equal(frameShouldStandDown(justUnder, VH, true), true,
    'a frame that has stood down stays down until it is comfortably smaller');
  // Under the coming-back line, it returns.
  const wellUnder = Math.floor(VH * FRAME_BACK_SHARE) - 1;
  assert.equal(frameShouldStandDown(wellUnder, VH, true), false);
});

test('the gap between the two thresholds is real, and in the right direction', () => {
  assert.ok(FRAME_BACK_SHARE < FRAME_MAX_SHARE,
    'coming back must be harder than standing down, or it oscillates');
});

test('a height that sits between the thresholds keeps whichever state it is in', () => {
  // THE WHOLE POINT. Without the gap this is the height that flips on every
  // measurement, and what a reader sees is the page rebuilding itself.
  const between = Math.round(VH * (FRAME_MAX_SHARE + FRAME_BACK_SHARE) / 2);
  assert.equal(frameShouldStandDown(between, VH, false), false);
  assert.equal(frameShouldStandDown(between, VH, true), true);
});

test('a page that has not been laid out yet changes nothing', () => {
  // Answering "stand down" against a zero viewport would flash the fallback
  // layout on every load, before anything has been measured at all.
  assert.equal(frameShouldStandDown(0, 0, false), false);
  assert.equal(frameShouldStandDown(500, 0, false), false);
  assert.equal(frameShouldStandDown(0, VH, true), true);
});

test('the same numbers always give the same answer', () => {
  // So a caller may run it on every resize without thinking about it.
  for (const n of [100, 300, 421, 422, 423, 900]) {
    const a = frameShouldStandDown(n, VH, false);
    assert.equal(frameShouldStandDown(n, VH, false), a);
    const b = frameShouldStandDown(n, VH, true);
    assert.equal(frameShouldStandDown(n, VH, true), b);
  }
});

test('a tall viewport keeps the frame up at a height a short one refuses', () => {
  // The threshold is a SHARE, not a pixel count — the same frame is affordable
  // on an iPad and not on a phone, which is the fact it is measuring.
  assert.equal(frameShouldStandDown(474, 844, false), true);
  assert.equal(frameShouldStandDown(474, 1180, false), false);
});
