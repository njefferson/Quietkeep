# ADR-0127 · The weeks ahead: what is dated, laid out in time above the doors, from one reading of when a thing comes back

**Status:** Accepted · **Date:** 2026-11-03 · **Builds on:** ADR-0108, ADR-0124

## Decision

**The first screen shows what is dated, a day at a time, above the hub's doors,
and every surface that lays dates out reads one rule for which day a thing
comes back.**

- One section, `#glance`, titled *The weeks ahead*, directly above `#hub`. It is
  part of the hub and is not a door, not a stance and not a stop in the Contents
  list. It is hidden inside every job, with no hub (an empty store), and in the
  plain mode.
- Seven days from today, always listed, each heading its dated titles or the
  words *Nothing dated.* Then only the days that hold something, out to thirty
  days from today. A thing with both a start and a due date is a stretch: its
  two dates are written in words and a bar draws its length along the thirty
  days. At most five titles on a day, four stretches, three things waited on,
  three things not sorted yet, each with one line and one press to the whole.
- One function, `src/reading.ts`, says which clock of a node names a day:
  due, start, suspense and park always, a review clock only when a person set it,
  never one the app wrote, so a capture names no day. The days-ahead view, the
  calendar file and the weeks ahead all read it. The file still takes one clock
  for each thing and the views take every clock, as before.
- A projection. No event, noun, kind or relation is added, and nothing is stored.

## Why

### The first screen could not say what the days hold

The landing was a list of doors. Anything dated was one door and one press away
from being seen, and a plan of the week lived on paper beside the app. Naming
the days ahead on the screen a session starts on is the one thing the doors
could not say, and it asks nothing of the reader.

### Three surfaces were about to read dates three ways

Release 3.26.1 recorded two screens naming different dates for one thing. A
surface that sets dates side by side shows every such disagreement at once, so
the reading came first: the rule that was written out twice, in the calendar
selection and in the view, is stated once and the third reader joins it. Only
those three places are on it; the rest of the app still works dates out in its
own ways, and moving them is the structural assessment's own later step.

## What it refuses

- **Anything before today.** A date gone by has its own surface and is not drawn
  here, so a thousand imported dates gone by do not become a thousand titles on
  today (law 3).
- **A figure for the pile.** ADR-0085 and ADR-0113 keep a count of the things
  not sorted yet off the screen a person arrives at, and this is that screen. The
  block shows three titles, says that more are waiting, and presses through to
  the group; the only number in it is how many titles are drawn. The count of
  things with other people is stated, because the People door already states it.
- **Color for pressure.** Order and words carry every fact; the block uses the
  ink tokens only, and a bar is never the only channel because the words beside
  it say the same.
- **A second selection or a second clock walk.** The rows come from
  `calendarEntries` and the days from `src/reading.ts`.
- **A live region.** The block repaints with every render and announces nothing.
- **A door of its own.** A door is a choice, and the point is that nothing here
  asks for one.

## Still not settled

Whether this is enough to put the paper beside the app away has not been tested.
The first screen is longer, so the doors sit further down, most of all on a
phone.
