// Quietkeep — the default edition. THE bundle entry point.
//
// Three lines, and the reason it exists is the third one's absence: nothing here
// imports the sync module, so the default `public/app.js` cannot contain it. That
// is [ADR-0036](../../docs/adr/0036-two-builds.md)'s first guarantee, and it is a
// property of the artefact rather than a promise about a flag — `tools/editions.mjs`
// reads the built file and checks it.
//
// The second guarantee is `connect-src 'self'` in `public/_headers`: even a bad
// merge that pulled sync in here could not reach a relay, because the browser
// would refuse. Two independent halves, both gated.

import { start } from './app.ts';

start();

// WHAT "JUST ONE THING" STRIPS, published for the walk (2.10.0).
//
// The gate has to check the SCREEN against the lists rather than the lists
// against themselves, and hard-coding them in `tools/a11y.mjs` would be a fourth
// copy of exactly the list that went stale three times. One source, read at
// runtime.
import { PLAIN_HIDDEN, PLAIN_KEPT, PLAIN_CHROME_HIDDEN, PLAIN_CHROME_KEPT } from '../plain.ts';
(globalThis as unknown as {
  __PLAIN_STRIPPED?: readonly string[];
  __PLAIN_SURVIVES?: readonly string[];
}).__PLAIN_STRIPPED = [...PLAIN_HIDDEN, ...PLAIN_CHROME_HIDDEN];
// AND THE OTHER HALF (2.14.0). `tools/plain.mjs` walks the rendered header,
// `<main>` and the footer and fails on a region in neither list, so it needs
// both — and for the same reason as above, read from the one source rather than
// copied into the gate.
(globalThis as unknown as { __PLAIN_SURVIVES?: readonly string[] }).__PLAIN_SURVIVES =
  [...PLAIN_KEPT, ...PLAIN_CHROME_KEPT];
