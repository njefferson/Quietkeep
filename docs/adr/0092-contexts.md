# ADR-0092 · Contexts — where a thing can be DONE, which is not where it lives

**Status:** Accepted · **Date:** 2026-08-17 · **Shipped:** 2.2.0 · **Answers:** Q-10 (asked 2026-07-29) · **Settles part of:** Q-13's shape

## Decision

A **context** is a demand-free node — at home, at work, out, on the phone — and
`context.attached` links a thing to as many as fit. **Where you are** is a device
view preference that narrows the offer and the held list to what fits.

## Why

The tree gives a thing exactly one parent: where it **lives**. Nothing said where
it can be **done**. Those are different axes, and the app only had the first — so
every list was every list, and "show me what I can do at home" had no answer.

**This was asked for on 2026-07-29, in the repo's first week, and the record says
so.** NOTES.md **Q-10**: *"whether a second vault is for home tasks, and whether
the app already separates work tasks some other way."* The session that answered
it diagnosed the design correctly and wrote it down:

The shape wanted was a **lens** — a filter you switch on and off over one list —
and not a partition. The binding constraint it recorded: law 1 does not bend for
it, so a thing filtered out of view still has its clock and still comes back.

That is this record's decision and this record's central rule, written nineteen
days earlier. **It was then closed** — correctly, as a decision not to build
vaults — and the thing actually wanted was parked: *"a Home/Work lens is a
candidate for v1.5"*, with containment offered in the meantime.

**The question was answered about the MECHANISM that was guessed at rather than
the NEED that was described.** "Should the vault scope projections?" got a
thorough, correct answer. **Keeping home out of the work list** did not get
built, and the record then read as settled because a numbered question had a
Status line on it.

**And the first draft of this ADR repeated the failure.** It said contexts
appeared nowhere in the record. That was written after searching for `context`,
`@home` and `@work` — the vocabulary of the FEATURE — while Q-10 is written in
the vocabulary of the QUESTION: vault, lens, home, work. The search that misses
a requirement is the same search that lost it the first time. (Hub LESSONS §96.)

`taskpaper.ts` remains the only place the word "context" appears in the source,
and it is a line that **drops contexts on import and names the drop** — so the
concept was met a second time, by a different session, and filed as an import
edge case.

**The shape was already settled and pointed elsewhere.** Q-13 established that
anything crossing containers cannot BE a container — this tree is single-parent —
so it must be a cross-cutting link, and named that shape. It discussed it only
as a *roles* question and deferred it. `node.people` is that machinery, shipping
since 0.15.0. A context is the same thing with a different relation.

## The rules that keep the laws intact

- **A filter over what you are LOOKING at, never a partition of what is held.**
  ADR-0054's binding on the lens, and it binds identically here: a thing filtered
  out still has its clock, still counts in the claim, and still comes back.
  Anything else is an archive with a friendlier name, which law 3 forbids.
- **Unlabelled fits everywhere, and that is load-bearing.** Most of what anybody
  writes down is not tied to a room. It is also what stops the filter being a
  cliff: choosing a place on a store where nothing is labelled hides nothing, so
  the feature cannot make the app look empty on the day it is first tried. The
  opposite rule would punish you for not having filed everything, which is the
  shape this app exists to avoid.
- **Law 1 does not read it.** Attaching a context can never make a silent node
  non-silent; the write gate is unchanged.
- **A context can never be work.** It is in `DEMAND_FREE_KINDS` (the gate refuses
  a clock on it) and in `NOT_ACTIONABLE` (it can never be offered). Excluded from
  `heldWork`, so it is not in the todo list or the claim — caught by the
  membership table the moment the kind existed, not by eye.
- **Where you are is NOT an event.** A device preference like the lens root. The
  log has no business holding a history of where somebody was all week — law 7
  keeps this app out of inference, and that trail is exactly the material it
  stays out of.

## Consequences

- The offer is filtered after `workSurface`, so the ranking and every test over
  it are untouched — ADR-0060's move. `NextUp` is head + behind + total, so the
  filter rebuilds all three: if the head does not fit, the first thing behind
  that does becomes the head, and the total counts what fits.
- **The offered card's title became a button** in the same release. It was a
  `<p>`: the one item the app actively hands you was the only thing on the screen
  that could not be opened, so changing it meant navigating away to find it
  again. `#nextup-done`, `#nextup-skip` and `#menu-open` shifted position and the
  release notes declare it by name (ADR-0076).
- **Two defects the gates caught rather than the eye:** a button with no words
  has no accessible name, so the title hides when the offer is empty; and the
  detail sheet's placeholders measured 4.08:1 against a 4.5:1 floor, because
  nothing had ever named the pseudo-element in the registry. Fixed for every
  input on the sheet, not only the one that was measured.

## What would overturn it

- **Evidence that one axis is enough** — that things get labelled once and never
  used, or that the filter is set and never changed. Then the honest answer is
  to remove it rather than to add a second way to reach it.
- **A context turning out to want a clock.** It cannot have one by construction,
  and if "at the office on Tuesday" is the real need then that is a different
  noun and a different record, not a loosening of this one.
