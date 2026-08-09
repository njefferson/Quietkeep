// The way in, from outside the app — V2 stage 6.
//
// On the reference platform there is no share target and no manifest shortcut:
// both are Chromium-only. `?text=` is the ONLY entrance from outside, which
// makes it the most load-bearing surface in the app for anybody on an iPad, and
// the one with the least around it.
//
// The failure these exist for: **the query is scrubbed before the commit**, so
// the address bar stops holding the text a moment before anything else starts
// to. If the write then fails, the only copy of a thought somebody shared into
// the app is gone — and they never typed it here, so there is nowhere for them
// to look for it. Sharing something in and watching it vanish is the precise
// failure this app exists to prevent.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleUrlEntrances } from '../src/ui/app.ts';
import { emptyState, type State } from '../src/fold.ts';
import type { Session } from '../src/ui/session.ts';

/** The smallest DOM these two need: a value, a focus flag, and text content. */
const fakeInput = (): HTMLInputElement & { focused: boolean } => {
  const el = { value: '', focused: false, focus() { el.focused = true; } };
  return el as unknown as HTMLInputElement & { focused: boolean };
};
const fakeStatus = (): HTMLElement => {
  const el = {
    textContent: '',
    replaceChildren() { /* the confirm path only */ },
    append() { /* the confirm path only */ },
  };
  return el as unknown as HTMLElement;
};

interface Harness {
  session: Session;
  drafts: string[];
  commits: number;
}

/** A session whose commit either lands or refuses, and which records drafts. */
function harness(commit: 'lands' | 'refuses'): Harness {
  const h: Harness = { session: null as unknown as Session, drafts: [], commits: 0 };
  const state: State = emptyState();
  h.session = {
    device: 'd0', vault: 'personal', zone: 'America/Denver',
    state: () => state,
    async commit() {
      h.commits++;
      if (commit === 'refuses') throw new Error('the store is unreachable');
      return state;
    },
    async refresh() { return state; },
    async maintain() { return null; },
    async draft() { return h.drafts.at(-1) ?? ''; },
    async setDraft(text: string) { h.drafts.push(text); },
    store: null as never,
  } as unknown as Session;
  return h;
}

/**
 * Stand in for the browser's location, history and document for one run.
 *
 * `document` is here because the SUCCESS path builds an undo button — a
 * drive-by capture is never silent and never permanent — so a harness that only
 * covered the failure path could not have asserted the success one, and the
 * success assertion is what catches a careless fix.
 */
function withQuery(search: string, fn: () => Promise<void>, pathname = '/'): Promise<void> {
  const g = globalThis as unknown as {
    location?: unknown; history?: unknown; document?: unknown;
  };
  const prior = { location: g.location, history: g.history, document: g.document };
  g.location = { search, pathname, hash: '' };
  g.history = { replaceState() { /* the scrub */ } };
  g.document = {
    createElement: () => ({
      type: '', className: '', textContent: '', disabled: false,
      addEventListener() { /* the undo, never pressed here */ },
    }),
    createTextNode: (t: string) => ({ textContent: t }),
  };
  return fn().finally(() => {
    g.location = prior.location; g.history = prior.history; g.document = prior.document;
  });
}

test('A FAILED URL CAPTURE HANDS THE TEXT BACK — it does not evaporate', async () => {
  // The defect. The scrub happens first (rightly, so a refresh cannot fire the
  // capture twice), which means this catch is the only thing holding the text.
  const h = harness('refuses');
  const input = fakeInput();
  const status = fakeStatus();

  await withQuery('?text=ring%20the%20plumber%20about%20the%20leak', async () => {
    await handleUrlEntrances(h.session, status, input, () => { /* no surface */ });
  });

  assert.equal(h.commits, 1, 'it did try to write');
  assert.equal(input.value, 'ring the plumber about the leak',
    'and the thought is in the capture line, where a person can see it');
  assert.equal(h.drafts.at(-1), 'ring the plumber about the leak',
    'and in the persisted draft, so it survives a reload as well as this failure');
  assert.equal(input.focused, true, 'with the cursor in it — one tap from being kept');
  assert.match(String(status.textContent), /Couldn’t hold that/,
    'and the failure is stated rather than swallowed');
  assert.match(String(status.textContent), /in the box/,
    'and it says WHERE the text went, because "it failed" without that is the same as losing it');
});

test('a share-sheet capture that fails hands back the composed text, not one part of it', async () => {
  // The share target sends title, text and url separately and they are joined
  // into one capture. The recovery has to give back the thing that would have
  // been kept, not whichever fragment happened to be handiest.
  const h = harness('refuses');
  const input = fakeInput();

  await withQuery('?title=Leaking%20tap&text=under%20the%20sink&url=https%3A%2F%2Fexample.com%2Ffix', async () => {
    await handleUrlEntrances(h.session, fakeStatus(), input, () => { /* no surface */ });
  });

  assert.equal(input.value, 'Leaking tap\nunder the sink\nhttps://example.com/fix');
  assert.equal(h.drafts.at(-1), input.value, 'the draft holds the same thing the box does');
});

test('a successful capture leaves the box EMPTY — the recovery is not a leftover', async () => {
  // The other half, and the one a careless fix breaks: putting the text in the
  // box unconditionally would leave a captured thought sitting in the capture
  // line, where the obvious next act is to submit it and hold it twice.
  const h = harness('lands');
  const input = fakeInput();

  await withQuery('?text=post%20the%20form', async () => {
    await handleUrlEntrances(h.session, fakeStatus(), input, () => { /* no surface */ });
  });

  assert.equal(h.commits, 1);
  assert.equal(input.value, '', 'nothing is left in the box to capture a second time');
  assert.deepEqual(h.drafts, [], 'and no draft was written on the way');
});

test('an empty ?text= writes nothing at all', async () => {
  const h = harness('lands');
  await withQuery('?text=%20%20%20', async () => {
    await handleUrlEntrances(h.session, fakeStatus(), fakeInput(), () => { /* no surface */ });
  });
  assert.equal(h.commits, 0, 'whitespace is not a thought');
});

test('/capture with nothing after it lands you ready to type — the path three ADRs named', async () => {
  // `/capture?text=` has been THE documented public endpoint since Phase 0
  // (ADR-0008, ADR-0028) and nothing ever served that path: the app answered
  // `/?text=` only. A documented entrance that 404s is worse than an
  // undocumented one, because somebody following the record builds a Shortcut
  // around it and finds out later.
  const h = harness('lands');
  const input = fakeInput();
  await withQuery('', async () => {
    await handleUrlEntrances(h.session, fakeStatus(), input, () => { /* no surface */ });
  }, '/capture');
  assert.equal(h.commits, 0, 'a bare entrance captures nothing — there is nothing to capture');
  assert.equal(input.focused, true, 'it does what its name says rather than nothing');
});

test('/capture?text= captures, exactly as the root endpoint does', async () => {
  const h = harness('lands');
  await withQuery('?text=ring%20the%20plumber', async () => {
    await handleUrlEntrances(h.session, fakeStatus(), fakeInput(), () => { /* no surface */ });
  }, '/capture');
  assert.equal(h.commits, 1, 'the path is a name for the same entrance, not a second one');
});

test('the manifest shortcut captures NOTHING — it only lands you ready to type', async () => {
  const h = harness('lands');
  const input = fakeInput();
  await withQuery('?capture=1', async () => {
    await handleUrlEntrances(h.session, fakeStatus(), input, () => { /* no surface */ });
  });
  assert.equal(h.commits, 0, 'a shortcut that captured something you had not written would be inventing one');
  assert.equal(input.focused, true, 'it puts the cursor where the next thing goes');
});
