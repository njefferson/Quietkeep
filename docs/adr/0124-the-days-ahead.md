# ADR-0124 · The days ahead: the calendar story's live half

**Status:** Accepted · **Date:** 2026-09-01 · **Extends:** ADR-0007
(notification tiers) · **Bound by:** the export-selection rule recorded in
`NOTES.md` (chosen dates only; `review` never).

## The demand

From use, in plain terms: dated work — answer-owed dates above all — must be
visible INSIDE the app, organised by day, current as of now, because those
dates change. Sending a `.ics` out and switching apps to look at it means the
app shows one half of the reader's obligations and a snapshot shows the other.
The export's documented purpose was always narrower than "the calendar story":
ADR-0007 built it *so the OS calendar does the notifying* — T1 is a
notification bridge, and it was the only surface dated work had.

An earlier reply asserted the absence of an in-app dated view was a decision.
No such decision exists anywhere in this repo's record, and this ADR replaces
the invented refusal with a real one of the opposite shape.

## Decision

**One selection, three readers.** `calendarEntries` and `calendarDay`
(`src/ics.ts`) are now the single definition of *what is dated and on which
morning*: the `.ics` file, the ⓘ count, and the new view (`src/dated.ts`) all
read them, and none may re-derive the walk. The 0.9.0 defect — an allowlist
copy drifting and silently dropping every passed hard date from the calendar —
is the class this kills at the root: the screen and the diary cannot disagree,
because there is nothing separate to drift.

**The view is `datedDays`**: every exportable item, grouped under the local day
the diary itself would carry, in the reader's zone at midnight — the diary's
own boundary, deliberately not the app's movable one, because the surface's
promise is "the same mornings as your calendar". A passed clock arrives
clamped to today exactly as its exported event is, wearing the replan
surface's words ("needs a new plan") rather than a second phrasing. No row
restates its day in words — the heading is the one place the day is said, so a
row and its heading cannot contradict (the ADR-0032 class).

**The answer-owed date is named, with whom.** Each row says which clock kind
its day came from, in the date group's own vocabulary — `answer owed`, never
folded into a generic "due" — and carries the waiting-on name where one
exists. When two clocks name one instant the answer-owed date speaks, by the
same tie-goes-to-the-deadline rule `heldStatus` uses; the tie order lives in
the shared picker, and the file is byte-identical whichever kind wins, because
the export writes only the instant.

**The export stays, as what it always was.** Notifications are its job; the
sheet's standing line names *Send to my calendar* and says which half of the
pair each surface is. Nothing about the file's selection, honesty lines, or
snapshot framing changes.

## Refused

A fourth walk of the clocks anywhere in the app. `review` clocks on this
surface, for the export's own recorded reason. Any past day rendered. Any
per-row urgency grading, colour escalation, or count of what went by — the
view says *when*, and the replan surface owns *what now*.

## Held by

`test/dated.test.ts`: identical membership and identical days between view and
file on a mixed store, verified against the file's own UID and DTSTART lines;
zone-resolved grouping; the clamp; the answer-owed naming with whom; the
date-change property; word hygiene. The walk drives the sheet as its own
audited state.
