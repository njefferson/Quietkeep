// Everything since you last looked (3.20.3).
//
// Found by the cold read-back: 3.20.0 and 3.20.1 landed in one promote, and the
// notes' first open showed the small iteration while the capability release sat
// folded behind "earlier releases". The notes surface knows nothing about
// promotes; what it can know is the last version THIS DEVICE showed, and open
// everything newer. First-ever look shows the newest alone — a brand-new
// reader does not need history unrolled; the fold is right there.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RELEASES, releasesSince, newerCount, SINCE_CAP } from '../src/ui/changelog.ts';

test('a first look shows the newest release alone', () => {
  assert.deepEqual(releasesSince(null).map(r => r.triplet), [RELEASES[0]!.triplet]);
  assert.deepEqual(releasesSince(undefined).map(r => r.triplet), [RELEASES[0]!.triplet]);
});

test('a look from the current version shows the newest alone — re-reading is ordinary', () => {
  assert.deepEqual(releasesSince(RELEASES[0]!.triplet).map(r => r.triplet),
    [RELEASES[0]!.triplet]);
});

test('a look from two releases back opens both that landed since', () => {
  const seen = RELEASES[2]!.triplet;
  assert.deepEqual(releasesSince(seen).map(r => r.triplet),
    [RELEASES[0]!.triplet, RELEASES[1]!.triplet]);
});

test('garbage and futures fail safe to the newest alone', () => {
  assert.deepEqual(releasesSince('not-a-version').map(r => r.triplet), [RELEASES[0]!.triplet]);
  assert.deepEqual(releasesSince('99.0.0').map(r => r.triplet), [RELEASES[0]!.triplet]);
});

test('a long absence is capped, never a flood — and the true count stays sayable', () => {
  const seen = RELEASES[SINCE_CAP + 5]!.triplet;
  const out = releasesSince(seen);
  assert.equal(out.length, SINCE_CAP, 'the cap holds');
  assert.equal(out[0]!.triplet, RELEASES[0]!.triplet, 'newest first, like the surface');
  assert.equal(newerCount(seen), SINCE_CAP + 5, 'the sentence can state what the window cannot show');
  assert.equal(newerCount('not-a-version'), 0, 'and a fail-safe window never gets a count');
});
