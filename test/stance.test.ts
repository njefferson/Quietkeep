// A stance is one section shown alone (3.0.0, ADR-0108).
//
// The claim with teeth: a stance whose section is not live resolves to the hub.
// The runway's sections come and go with the store — `#replan` exists only while
// a date has gone by — so a remembered stance is a claim about a screen that may
// have stopped existing. Sending somebody to a blank screen is worse than the
// scrolling page this replaces, because at least the page had something on it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stanceNow, showsSection, HUB, HUB_SECTION } from '../src/stance.ts';

const LIVE = ['held', 'nextup', 'triage'];

test('THE ONE THAT MATTERS: a stance whose section has gone resolves to the hub', () => {
  // Yesterday there was a date gone by and you were in `#replan`. Today there is
  // not, so the section is not on the page at all.
  assert.equal(stanceNow('replan', LIVE), HUB);
});

test('a live stance is the stance', () => {
  assert.equal(stanceNow('held', LIVE), 'held');
});

test('no stance is the hub, which is the answer and not an error', () => {
  assert.equal(stanceNow(null, LIVE), HUB);
  assert.equal(HUB, null, 'the hub is the absence of a stance, not a stance called "hub"');
});

test('an empty page is still the hub rather than a crash', () => {
  assert.equal(stanceNow('held', []), HUB);
});

test('the hub never appears as a door to itself', () => {
  // If it did, the surface you come up to would list a way to come up to it.
  assert.equal(stanceNow(HUB_SECTION, [HUB_SECTION, ...LIVE]), HUB_SECTION,
    'it resolves like any other id — the exclusion is the door list\'s job');
  assert.equal(HUB_SECTION, 'hub');
});

test('showsSection hides everything while the hub is up', () => {
  // The hub is not "every section at once" — that is the runway this replaces.
  for (const id of LIVE) assert.equal(showsSection(HUB, id), false);
});

test('and shows exactly one otherwise', () => {
  const shown = LIVE.filter(id => showsSection('nextup', id));
  assert.deepEqual(shown, ['nextup'], 'one job on screen, which is the whole point');
});
