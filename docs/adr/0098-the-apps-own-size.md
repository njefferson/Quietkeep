# ADR-0098 · The app's own size, and a floor that means it

**Status:** Accepted · **Date:** 2026-08-17 · **Shipped:** 2.8.0 · **Extends:** ADR-0059's B-06 (docs/adr/0059-presence-not-progress.md)

## Decision

A **size control in Settings** — smaller through biggest — scaling this app's
type on this device, as a multiple of whatever the reader's browser or OS is
already doing.

And the thing that had to be true first: **`--target` becomes
`max(2.75rem, 44px)`**. The touch floor grows with the reader's text and can
never go under 44 physical pixels.

## Why the floor came first

Asked for from a device: a way to scale this app **independently of the phone's
own setting**. That is not browser zoom — somebody may want their messages large
and their planner dense, or the reverse, and until now the only lever moved
everything at once.

Building it naively would have broken the app. `--target` was `2.75rem`, with the
note *"44px at the default root size, but expressed in rem so it grows with the
reader's text setting rather than staying put (B-06)"*. **The growing half is
right and is kept.** The shrinking half was never considered, and the two are not
symmetric: bigger text means bigger targets, which is fine; **smaller text does
not mean smaller fingers.**

Measured at 390px, before anything was built:

- root **87.5%** — an ordinary browser setting, and the second option this
  release's own control offers: **24 visible controls below 44px**, including
  every control in the header, the capture box and the skip link.
- root **75%**: those same controls at **33–34px**.

So the app conformed at one root size and silently stopped conforming at
another — hub LESSONS §95's shape, one level down: measured under the conditions
the gate happened to use.

## And the gate could not have caught it

`auditTargets` iterated `'button, input, a, [role=button]'`. A hand-written list
of element **types**, which is the same defect as a hand-written list of
surfaces — a lesson this file has already paid for twice with `data-door` and
with the see-through sweep.

It omitted `select`, `textarea` and `summary`, all of which this app uses as real
controls. Widening it to every interactive element found **four controls under
the floor at the DEFAULT size**, shipped and green for a long time:

- `#capacity-level` and `#pebble-weight` — the two `<select>`s in the load entry,
  **19px**. The control somebody reaches for on a heavy morning, at under half
  the floor.
- `#detail-situation` — the `<textarea>` somebody types their own words into,
  **36px**.
- `#load-summary` — the `<summary>` that is the door on the collapsed entries,
  with no floor at all, falling to **20px** at a reduced root.

**Fixed by RULE, not by id.** `select`, `textarea` and `summary` each get
`min-height: var(--target)`. Every select that had a floor before got it
individually — `#detail-lead`, `#detail-parent`, `.lens-row select` — which is
exactly why the two nobody noticed had none. A rule means the next one added is
covered by construction.

`summary` also needs `display: block` (as flex) for the floor to bind, since a
`list-item` box sizes to its marker in some engines — so the marker is restored
by hand, because a door that stops looking like a door is ADR-0091's defect.

## How the control behaves

- **It MULTIPLIES rather than overrides.** A percentage on the root, relative to
  whatever the reader's device is already doing. Somebody with large system text
  who picks *a little smaller* gets their large text a little smaller; they are
  not thrown back to 16px. Overriding would be this app deciding it knows better
  than their device setting, which is the opposite of the request.
- **A device preference, never an event.** How big somebody wants their type is
  not a fact about their work and the log has no business holding a history of
  it — the rule the lens root and where-you-are already follow.
- **Words, not percentages.** A figure invites getting it "right", and there is
  no right answer to how big text should be for somebody else. The note says no
  number at all, asserted by a test and by the walk.
- **It previews on change and persists on Set**, so the reader sees the size
  while choosing rather than having to commit to find out. Changing your mind and
  closing the panel leaves nothing behind.
- **The note states the SCOPE** — this app, this device, nothing you have written
  down — because scope was the entire request, and a control that changes how
  everything looks is exactly when somebody wonders what else it changed.
- **Bounded 0.85–1.5.** Below 0.85 the floor starts doing all the work and every
  control becomes the same height as its own text; above 1.5 the browser's own
  zoom serves better, because it scales layout too.

## Consequences

- The a11y walk asserts the floor **at 85% and 92.5%**, the sizes the control
  itself offers. A floor measured only at 100% measured the runner, not the app.
- It drives the control end to end: choosing shows the size immediately, the
  root value is relative and never `px`, the note states the scope and no figure,
  and **every target still clears 44px at the chosen size** — the assertion the
  whole release turns on.
- Budgets: words 3340 → 3390, controls 226 → 228, each with its reason at the
  number. The scope sentences are the feature, so cutting them to fit a word
  budget would answer a different question.

## What would overturn it

A reader finding the smallest size unreadable in practice, in which case the band
narrows from the bottom. Or `max()` proving unreliable on the reference iPad — in
which case the floor moves to a plain `44px` and loses its ability to grow, which
is the lesser of the two losses.
