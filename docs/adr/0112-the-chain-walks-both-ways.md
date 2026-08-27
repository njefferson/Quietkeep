# ADR-0112 — The chain walks both ways

**Status:** accepted (3.6.0, 2026-08-27)
**Supersedes nothing. Amends nothing. It fills a hole.**

## The report

Something was made into a container by filing a task under it. Then there was
no way to see the container. Reported from a device in those terms.

That reading was accurate, and the accuracy is the point — it was not a
discoverability complaint about a route that existed. There was no route.

## What was actually there

The detail sheet states where a node sits. `placeWords` in `tree.ts` returns
one of four sentences, and the useful one is *"Part of ⟨title⟩."* — the parent,
by name, one hop up. It was painted into `<p id="detail-place">` with
`textContent`.

Meanwhile the same sheet lists what is *under* the node, and every one of those
rows is a `<button>` that re-renders the sheet on the child. That door has been
there since 1.6.0.

So the sheet travelled downward and did not travel upward, and the line that
named the destination was prose. The app named a place and offered no way to
reach it — which is the same defect as 3.5.2's Close, where a control was
present, correctly sized and correctly placed, and connected to nothing. Here
it was not even a control.

## Why law 4 does not forbid the fix

This is the objection worth answering in writing, because it is the one that
would close the defect without fixing it.

Product law 4 is *"levels push down; the user never climbs."* Read quickly, a
button that goes up the tree is a climb.

Read correctly, it is not. NOTES records the law's own amendment: **its subject
is ALTITUDE**, and it "has been misread as being about navigation." Its promise
is that nobody has to walk a hierarchy to plan a day — the runway decides, and
the runway is still the only workspace. It says nothing about whether a fact
the app has just stated on screen can be reached from where it is stated. The
amendment exists because the law was cited once before to refuse a route, on a
page measured at three screens with six live blocks, and that citation was
wrong in exactly this way.

`serves.ts` is the case that genuinely is descriptive: the *"serves ⟨goal⟩"*
line names a horizon several levels up, and it is deliberately not a door. That
restraint is about ALTITUDE — the goal is not somewhere you go to work. The
place line is one hop to the thing that literally contains this item, and it is
the answer to "where did the thing I just made go".

## Decision

**The place line is a door when there is somewhere to go.**

- One hop, on the same mechanism the child rows use: re-render the sheet on the
  parent. No new surface, no new dialog, no new prose.
- **A control only in the live-parent case.** `placeWords`' three other
  readings — loose, parent not here, parent let go — stay prose. A control that
  opens nothing is this same defect wearing the other face.
- `placeWords` stays pure and keeps returning the sentence. The decision about
  whether there is a door is made where the DOM is, from the parent node, not
  by parsing the sentence.

**And the tree says what each row is.** `KIND_WORDS` already existed and is
exhaustive by type. Three of the four surfaces that list containers already
used it — the held card, the detail sheet, and both pickers via
`containerOptionWords`. The tree, whose entire job is showing containers, drew
every row as a bare indented title.

That mattered more than it sounds, because of where the vocabulary comes from.
The app says **Project** at the moment somebody makes one (`CONTAINER_ORDER`)
and again at the moment they file something under one
(`containerOptionWords`). Then the one surface that lists them never said it
again. Somebody using the word `project` to ask where their projects are is
using the word the app taught them.

## What this is not

**It is not a Projects surface.** `horizons.ts` refuses project rows and its
reasoning holds and is quoted here so it does not have to be re-derived: *"an
import produced 42 of them from one file, and a page listing all of those is
the tree by another name."* The tree already lists them, indented, with
contents, capped per branch with the true total. Building a second one under a
different name would be the tree twice.

**It is not a rename.** *"How it hangs together"* is still the label on the
control, and it is named after the shape rather than the thing. Whether that
changes is a taste decision and it is the owner's, not this ADR's. What changed
is that the rows inside it now say what they are, so the surface answers the
question once you are in it.

## Consequences

- `tools/smoke.mjs` asserts the control exists, that pressing it ARRIVES at the
  parent, and that the child is a door back down from there. Three assertions,
  because "the control is there" is the assertion that was already true of
  3.5.2's broken Close.
- The press is guarded so a missing door fails those three without aborting the
  walk. Planted, the unguarded form timed out on the click and took every later
  section with it — one failure reported where there were three, and the rest
  of the walk never ran.
- `tools/a11y.mjs` registers `.detail-place-open` **separately from**
  `#detail-place`. The paragraph carries `--ink-soft` and the button carries
  `--accent`; a registry naming only the paragraph measures a colour that is no
  longer on screen and calls it green.
- The state that renders it — `'detail sheet, inside something'` — now also
  runs the focus-ring pass, and already carried a `fail()` for the case where
  nothing could be parented, so it cannot pass vacuously.
- `.tree-kind` is `--ink-soft` on `--surface`, a pair the inventory already
  carries. A word, not a colour.
