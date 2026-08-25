# ADR-0109 · The wide arrangement: the hub beside the job

**Status:** Accepted · **Date:** 2026-08-25 ·
**Executes:** [0108](0108-the-page-is-a-hub-and-the-work-is-a-stance.md)'s second
arrangement, which that record specified and deliberately did not foreclose ·
**Touches:** [0100](0100-the-frame-stays.md), [0101](0101-the-frame-stands-down.md) ·
**Cites:** law 8, hub LESSONS 28, hub LESSONS 104

## Decision

Above **900px** the job view shows **the hub beside the job**. Below it, nothing
changes: exactly one stance, and the hub is a place you return to.

This is not a new decision. ADR-0108 made it and built for it:

> A stance is therefore a region the layout places, and it must never assume its
> own size. Narrow shows exactly one and the hub is a place you return to; wide
> can show the hub beside one or more stances. Same definitions, one set of
> behaviours, two arrangements — not a second implementation, and not a phone app
> with a desktop mode bolted on.

That is why stances are `main > section[data-stance-name]` toggled by a class
rather than dialogs — the same record says building them as dialogs first is
"the thing that would make this expensive later". It did not happen, so this
record is mostly arithmetic.

## What was measured, because 900 is not a round number somebody liked

`body` caps at 46rem, so **every viewport from 768px upward rendered
identically**: 132px of nothing each side on a tablet in landscape, 272px at
1280px. The hub asks for **276px** at its natural width.

280 for the hub, 24 between, and a floor of 560 for the job is 864; the page's
own padding is 16 each side. **896.** Hence 900.

The cap above the breakpoint is 65rem — 280 + 24 + 736 — so the job keeps the
comfortable measure it already has rather than being squeezed to make room for
the hub.

**PX in the media query, never rem.** Inside a media query `rem` resolves against
the initial root font size and never the zoomed one, so a rem threshold silently
fails at exactly the text size it was written for. `public/app.css` has paid for
that once already, at `.about-bar`, and the app's own text-size control makes it
live rather than theoretical.

## A pinned sidebar, not a grid

The first version made `<main>` a two-column grid and placed every non-hub child
in column two. It worked, and a picture showed in one glance that it looked
wrong: grid **rows** couple the columns, so row one was as tall as the hub and
the first thing in the job column sat at the top of it with about 230px of
nothing underneath.

The hub is one tall box beside a **flow** of many things, which is not a grid of
rows. So `<main>` keeps the ordinary block flow it has at every width — the job's
internal layout is therefore identical narrow and wide, and there is no second
layout for a job to be laid out by — and the hub is taken out of that flow and
pinned at the left, with the flow inset to clear it.

## What does not change

The model. `paintHub` resolves the same one stance and sets the same
`.stance-on`; `jobsOf` still answers what belongs to a job, in one place, read by
the app and both walks. **Nothing in `src/` changed for this.** If it had, the
arrangement would have been being built in the wrong layer.

**The way back stays.** *Everywhere else* is no longer the only route out when
the hub is on screen beside the job — but a control that disappears because the
layout changed is a control somebody has to relearn, and four releases of this
app's recent history are about ways out that were not where they were expected.
It stays, at every width.

## One stance, not several

ADR-0108 allows "one or more". This is one. Two panes is the whole idea proved
and the whole idea measured; several is a later record, and it is written here so
its absence reads as a decision rather than an oversight.

## How it is held

The walks measure **one viewport, 390x844**, plus a 320px/200% stress step. A
second arrangement is therefore unmeasured by construction, which is hub LESSONS
28 exactly — a new surface joins the gate in the same commit or it ships
unchecked.

So `tools/a11y.mjs` gains a wide pass, in both themes, at 1000x750 and at 900px
under 200% text: overlap, target size, axe, horizontal overflow, and **the
arrangement itself** — that the hub is on screen and genuinely BESIDE the job
rather than stacked above it, because a wide pass run against a page still
showing one pane would report green about a layout that was not there.

Contrast is not re-measured there and that is deliberate rather than forgotten:
the arrangement changes where the boxes are, not the tokens or the elements in
them, so the registry measured at 390 answers for the pairs.

`size-check` is not given a wide budget, also deliberately: its scroll budgets
are measured at 390px, where prose reflows tallest, and a wider viewport can only
make those numbers smaller. 390 stays the binding case.

## Cost of leaving it

The tablet this app is used on shows a phone layout with a third of the screen
empty, and has since the shell was built.
