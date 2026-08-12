# ADR-0089 · The Menu is a place, and law 6 becomes structural

**Status:** Accepted · **Date:** 2026-08-12 · **Shipped:** 2.0.7 · **Extends:** ADR-0088

## Decision

The Menu stops unfolding into the workspace and becomes a **sheet**, opened from
the control that has always stated it. It is the third and last of the inline
expanders on the work surface.

- **The control keeps its words** — the count, and the sentence saying nothing
  on it is asking — from `menuWords`, which stays their one source. They are not
  repeated inside the sheet.
- **It is not a disclosure any more**, so it drops `aria-expanded` and
  `aria-controls`, like the two before it.
- **Walking through an item closes it**, as the tree and the claim do: a dialog
  over a dialog is the overlap ADR-0083 forbids.
- **An empty Menu closes the sheet.** The control disappears when the last item
  leaves, and a reader standing inside would otherwise be on a screen with
  nothing on it and no control behind it to explain where it went.

## Why

It measured **2,597px** on a full store, unfolding directly above the held list.
That is small beside the claim's 26,031px and the tree's 17,246px — which is
precisely why it outlived both, and why it was the entire 2,609px still standing
between the opened workspace and the untouched one after ADR-0088.

**Law 6 gets teeth from this.** The law says the Menu is demand-free by
construction, and the markup comment has always said *"a wish list that greets
you is a demand list"*. A fold satisfies that by being closed on arrival, which
is a property the code has to keep choosing — the old handler carried a comment
explaining that it deliberately never remembered its open state. A dialog
**cannot** remember. The law stops being maintained and starts being structural.

**And a place is the honest shape for it.** Everything else on the work surface
is asking something, however gently. The Menu is the one surface in the app that
structurally cannot. Somewhere you go, deliberately, and leave — rather than
something that expands over the work you were looking at — is what that
difference looks like.

## Consequences

- **`data-door` moves onto the sheets.** The walks need to know how a reader
  reaches a surface, and were carrying a hand-written map of two — which went
  stale within a day of being written and named two real surfaces transparent
  for the wrong reason, having measured dialogs it had failed to open. A third
  sheet would have made that three. Each sheet now declares its own way in, and
  both walks read it off the element (hub LESSONS §22, §28).
- **The way-out check discovers its surfaces too**, and splits into halves: the
  structural question (is the Close outside the scroller) holds without opening
  anything, and the scrolled question needs the surface open. A surface the pass
  cannot reach — the Menu's door is hidden on an empty store — is **named**
  rather than skipped, because a count reads as coverage either way.

## What this does not change

- **The workspace is still one scroll**, and this does not pretend otherwise. On
  a full store nine sections stack to 2,715px above the held list; each is
  conditional and individually justified and nothing bounds their sum. All three
  reader-opened expanders are off the surface now, which is the end of what
  ADR-0088's approach can reach. The remainder is a different decision about
  what the everyday surface is allowed to show at once, and it is not made.
- **Nothing about what the Menu holds, or how it is grouped, or the absence of
  bars and percentages.** Law 5 and law 6 read exactly as before.

## What would overturn it

- **Evidence that arriving costs more than unfolding did**, for this surface
  specifically — the same falsifier ADR-0083 and ADR-0088 offer, and still a
  claim rather than a measurement.
- **A fourth and fifth sheet opened from the workspace.** Three is the set that
  existed; more than that is a navigation model nobody designed, and the answer
  then is to design one rather than to keep adding doors.
