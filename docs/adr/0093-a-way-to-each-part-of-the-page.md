# ADR-0093 · A way to each part of the page, and law 4 does not forbid one

**Status:** Accepted · **Date:** 2026-08-17 · **Shipped:** 2.3.0 · **Answers:** the first question ever asked of this app · **Extends:** ADR-0090, ADR-0091

## Decision

The work surface gets a **contents sheet**: what is on the page right now, in
page order, each block named by its own heading and carrying its own count, each
one a control that takes you there and lands focus.

It has **two doors, both in flow**: one in the header beside *More*, where the
app's navigation already lives, and one at the end of the held list beside *Back
to the top*.

And the held list — the largest block on the surface — becomes a real
`<section>` with a named, focusable heading, which it never was.

**Not tabs, and not pages. And not a floating control** — see below; that was
built, measured, and taken out.

## Why

### The question was asked first and answered wrongly

The first thing ever asked of this app was **pages or tabs**: the runway was one
long page with no way to reach any part of it. It got neither, and the reasoning
given leaned on product law 4 — *"levels push down; the user never climbs — the
runway is the only workspace."*

**That is a misreading, and it is worth naming exactly.** Law 4 is about
**altitude**. Its subject is goals, areas and outcomes, and what it says is that
those are inspection modes rather than places you go to work, so that lineage
and health project *downward* and nobody has to climb a hierarchy to plan their
day. ADR-0013 is the record of it and says the same.

Law 4 has nothing whatever to say about whether the runway's own blocks can be
reached. Reading "the runway is the only workspace" as "the runway is one
undifferentiated scroll" takes an invariant about **hierarchy** and spends it on
**navigation**, which is a different axis entirely — and then cites a product law
as the reason not to fix a defect.

This is the same failure shape as NOTES Q-10 and hub LESSONS §96: a requirement
gets translated into the vocabulary of a mechanism, answered in that vocabulary,
and lost. There the mechanism was *vaults*; here it was *tabs*. Both answers were
correct about the mechanism. Neither was about the need.

### Measured

At 820×1180 on the thirteen-item sample set — the *small* one:

- the page is **3,589px, 3.0 screens**, with 6 live blocks;
- the held list starts **1.7 screens down** and is **1,312px** of the total.

On a real store measured for ADR-0088 and ADR-0090: **8 live blocks**, the held
list beginning **3.0 screens down** at this size and **4.9 screens** on a phone.

To reach block N you travel past blocks 1..N−1. There is no index of what is on
the page, so finding out what is even there requires reading all of it.

### The two jumps were a route between the ends, not a way around

ADR-0090 added *"go to what you are holding"* and ADR-0091 added *"back to the
top"*, and both were right. But they are the two ends of the page, they leave the
twelve blocks between them reachable only by scrolling, and — the part that
matters — **they live on the page**. The way back to the top is at the bottom.
That is exactly the right place for somebody who read to the end and no use at
all to somebody four screens in.

A control for getting around a long page ought not to be somewhere you have to
get to. That argument points at a fixed control, and a fixed control is what was
built first. It was wrong, and the next section is why.

### The biggest thing on the page was not a place

`<h2>What you are holding</h2>` sat loose in the middle of `<main>` — no section
around it, no id, no `tabindex`. Every other block on the surface is a
`<section>` with a labelled focusable heading; the one the reader spends most of
their time in was markup with no region, announced by a screen reader as a
heading belonging to nothing and invisible to any navigation built on the page's
own structure.

That is also why the surface reads, as reported from a device, as *"just one very
very long to-do list"*: nothing named the list, so nothing distinguished it from
the page.

## Why the door is not fixed, which is the part that was got wrong first

The first build put a floating **Contents** button in the bottom-right corner.
It was probed at 820×1180 and 390×844 over the thirteen-item sample, hit-testing
every visible control's own centre at thirteen scroll positions:

- **10 controls overlapped it on the iPad, 3 of them lost their own centre to
  it.** All three were a card's **Done**.
- On the phone, 14 overlapped and 1 lost its centre.

So the failure is not *"it is sometimes in the way"*. It is: **you press Done and
the contents open.** A control that silently performs a different action is worse
than the scrolling it was added to fix, and the app's own doctrine says a route
a finger cannot take is not a route.

**Reserving space does not fix it.** `padding-bottom` on `main` was tried next
and only clears the **end** of the document — mid-scroll, content passes under a
fixed element, because that is what fixed means. Re-probed: still one stolen
Done at each size. There is no CSS that makes a fixed overlay stop overlapping.

**The correct fix is a real scroll container** — `main` with its own
`overflow-y`, the bar as a flex sibling outside it. That is the shape `#about`
already uses here, and its comment records that it is the version which held on
the reference iPad when `position: sticky` did not. **It is deliberately not
taken.** Moving the whole app off document scrolling changes behaviour on iPadOS
Safari that cannot be verified from a build machine, and shipping an unverifiable
layout change to the one device this app is actually used on is precisely the
mistake ADR-0091 exists because of.

So both doors are in flow, and the cost is stated plainly rather than hidden:
**from the middle of the page you still reach for one of the two ends.** Whether
that is enough is a question for an on-device pass, not for this file.

## Why not tabs

The old answer was right about this half and should be kept.

Tabs **partition**, and a partition means remembering to check the other one —
which is precisely the capacity this app exists to compensate for. It is the same
argument NOTES Q-10 made against splitting the store into home and work vaults,
and the same binding ADR-0054 put on the lens and ADR-0092 put on contexts: a
filter may change what you are looking at and may never change what the app is
holding.

The contents sheet keeps one page, in one order, with nothing hidden. It says
what is on the page and takes you there. Everything remains where it was for
anyone who would rather scroll.

## How it is built, and why that shape

**Every row is derived from the page.** A block's name is read from the element
its own `aria-labelledby` points at — so the contents row, the heading on screen
and the string a screen reader announces are the *same string*, and cannot drift,
because there is only one of them. The count is `#<id>-count` where the block
already publishes one, in the block's own words.

**There is no list of blocks anywhere in this feature.** That is deliberate and
it is the same lesson this repo has now learned three times: `sheets.ts` closes
every open dialog rather than a known set because the surface most likely to be
missing from a list is the one added last; the a11y walk's hand-written list of
doors went stale inside a day of being written and was replaced by reading
`data-door` off the sheet. A block added to the runway appears in the contents
the day it is added, with nothing to remember.

**A row exists only while its block is live.** A contents entry pointing at a
hidden block is a route to nowhere, and this audience should never be handed a
control that does not go where it says.

## Consequences

- `#upkeep-heading` gains `tabindex="-1"`. It was the one section heading without
  it, so it was the one block a jump could scroll to and not land in.
- The controls budget goes **219 → 222**, for the two doors and the sheet's
  Close. The rows are not counted against it: there is one per live block, each
  replaces travelling past that block, and none exists when its block does not.
- The two doors carry **different names** — *Contents* in the header, *What's on
  this page* at the end of the list, which is also the sheet's own title. Doctrine
  §4 forbids two controls on one surface answering to the same name, and the gate
  enforces it.
- The a11y walk asserts the route rather than the rendering: that every live
  block has a row naming it, that no row points at a block which is not on the
  page, and that pressing a row closes the sheet, puts the block at the top of
  the screen and **lands focus on it**. A scroll that leaves focus behind is the
  defect ADR-0090 was written about.
- `test/contents.test.ts` pins the reading rules — page order, hidden blocks,
  headings the app has not filled in yet, blocks with no label, whitespace
  counts, and sections that live inside sheets.

## What this does not do

It does not make the Menu, the tree or the coverage claim reachable from
anywhere — those are doors to sheets that sit at fixed points on the page, and
they are inside the held block, so the contents row for it lands on all three.
Whether the app needs a second navigation surface for its sheets is a question
for `#more`, which ADR-0083 already caps at six destinations; two overlapping
navigation surfaces would be worse than one.

It does not address the other half of the defect found on the device: **the app
never says which kind a thing is.** A project, a goal, an area and an ordinary
next action are indistinguishable on every surface that lists them — the node
kinds had no reader-facing vocabulary anywhere in the app, so a list of five
things read as five todos. **That was a separate defect and
[ADR-0094](0094-a-card-says-what-it-is.md) answered it in 2.4.0**
(`src/kind-words.ts`). This paragraph said *"is owed"* until 2026-08-19, while
0094's own header said it answered exactly this — one defect, two records, two
answers.
