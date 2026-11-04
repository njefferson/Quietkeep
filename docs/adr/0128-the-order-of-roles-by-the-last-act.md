# ADR-0128 · The roles carrying live work, in an order from the one longest since something was done under it

**Status:** Accepted · **Date:** 2026-11-03 · **Builds on:** ADR-0014, ADR-0054, ADR-0092, ADR-0096, ADR-0115, ADR-0117, ADR-0120

## Decision

**The Review door lists the roles that carry live work from the one longest
since anything was done under it, in words, with one press from each line to
that role's own sheet. It is an order and nothing else.**

This record sits beside ADR-0117 and does not overrule it. ADR-0117 refuses, for
the quiet-line class, any *how long since* and any ordering by staleness. That is
a statement about a finding: a quiet line is an exception, it is ranked and
capped, and it says something is wrong. The order here has no cut, no place among
the exceptions and nothing in it is a finding. The two lists partition the roles
that have ever carried work. A role carrying nothing live is a quiet line, with
words unchanged. A role carrying something live is in the order. A role is never
in both, and a test holds that. ADR-0117 gains a pointer to this record and no
other change.

- One reading, `src/attended.ts`, states the last act under a role: the newest
  time among a closed list of events that concern a thing carrying the role or
  anything beneath it. Opening a sheet is not an act, because the vocabulary has
  no event for a view and ADR-0054 and ADR-0092 refuse to record where somebody
  looked. The decided consequence runs toward calling a role quiet that was only
  read, which costs a glance, and the section says so in its own sentence.
- The section is inside the Review region, after its list, and exists whenever
  one or more roles carry live work. Three lines show, in the order, with
  *Every role, in order* opening the sheet the door already has when there are
  more. With no role carrying live work it is absent. The Review door therefore
  shows for a reader who has roles carrying live work and no exception, once.
- Each line is the role's name and one sentence: something was done under it
  today, yesterday, or some days ago, or nothing is on record under it. The only
  digit is the count of days. No color, no bar, no count of roles.
- A projection. No event, noun, kind or relation is added, and nothing is stored.

## Why

### A role with live work and no act for weeks was invisible

The Review door computes what a reader would not find by looking. A role is
demand-free (law 6, ADR-0014), so no clock can ride it and the exceptions could
only say a role had gone quiet once nothing live was left under it. The case in
between, a role carrying many live things with attention elsewhere for weeks,
appeared on no surface. An order needs no threshold, so there is no state in
which a role can be late.

### The log has to be read

The fold keeps no time per node for most acts: a timed doing folds to minutes
with no time, a focus survives only as the current one, the role link folds to
ids with no order. So the reading takes the log. The Review render is
synchronous, so `src/ui/review-roles.ts` decides from state alone whether the
section exists and reads the log once per change, keyed by the event count and
the reader's day and cached, with a sequence number so a slow read cannot paint
over a newer state. The first paint of a session waits on one read, the same
cost the log viewer and the purge count already pay. Over a sample of twelve
thousand events and forty roles the reading took under a hundred milliseconds in
the container, which is a measurement of something else and not the device's.

## What it refuses

- **A threshold, a window or a late state.** A role is demand-free; a window on an
  identity would be a late state under another name.
- **A record that a role was opened.** Counting a look would log attention in a
  private app.
- **A sixth exception class.** The review direction looks across roles; a ranked
  exception has a cut and an order has none.
- **Words that say a role was neglected,** and any sentence that locates a failure
  in the reader.
- **A door of its own.** The Review door is where the app already looks across.

## Still not settled

A role that is only ever read, and never acted under, can sit near the top. The
section says so and offers no remedy. Whether the order is read as a way into a
role or as a verdict on a life is not known; if it is the second, the remedy is
removing the section and not adding a cue. The log is read once per change, which
on a very large store may add a moment before the section appears.
