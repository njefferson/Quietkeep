# ADR-0119 · A meeting is somewhere you can stand

**Status:** Accepted · **Date:** 2026-08-30 · **Extends:**
[ADR-0115](0115-a-line-is-somewhere-you-can-stand.md) on the other axis, and
consumes [ADR-0118](0118-a-situation-can-name-who-is-in-the-room.md).

## The question

ADR-0115 made a **role** somewhere you could stand: open it and see the work
carrying that identity, and the parts of the tree that work sits under. A
meeting is the same shape keyed on people instead of an identity — and until
3.15.0 there was nothing to key it on, because a situation could not name who
was in the room.

The thing a meeting actually needs is not a to-do list. It is: what is
outstanding with each person who will be there, in either direction, and what
that work belongs to — so the question "what do I need to raise with Sam" is
answered before the conversation rather than remembered during it.

## Decision

**`meetingView(state, attendees, heldOf)`**, grouped by person, with the
distinct horizons and lines that work sits under, and a total that counts
things rather than rows.

**An inspection mode, not a filter, and that is the load-bearing choice.** The
obvious build narrows the working surfaces to these people for the length of the
meeting. This app has refused that twice in the same words — `horizon-models.md`
§3 and ADR-0115 — and the reasoning holds here: a filter leaves you with two
lists and something to remember, and what it hides still has its clock and still
comes back, so the hiding buys nothing and costs a thing you have to undo. The
single-valued person filter (`fitsWith`, `with.now`) stays exactly as it is and
answers a different question: who is in front of me now, rather than what is
this meeting about. Nothing in this record writes `with.now` or narrows anything.

**Every relation counts.** `namedOn` returns all six — waiting-on, promised-to,
requested-by, stakeholder, opr, mentioned — and in a meeting every one of them
is something you would raise. Narrowing to one would answer a different
question, which is the note `fitsWith` already carries about itself.

**Grouped by person, and a thing naming two attendees appears under both.**
Each of them is expecting it, and `promisedToAnyone` settled this exact case:
mentioning only the first would be right half the time, which is worse than
wrong because you would trust it. The **total** is over the distinct things, so
a joint item is one thing in the room and not two — the per-person rows
deliberately double-count and a total that also did would overstate the room.

**An attendee with nothing outstanding is kept and says so.** The reasoning
`lineView` gives for an empty line and `personView` gives for a person with
nothing: a group that vanishes leaves the question looking unanswerable, and
walking in knowing nothing is outstanding with somebody is worth as much as
walking in with a list.

**Live work only**, as `lineView` and `roleLoads` count it. What was finished
since last time is a different question and `delta.ts` answers it; listing it
here would make this a record of output, which law 5 refuses.

## The picker, and why it arrives now

3.15.0 stored `people` as a list and wrote at most one, because a multi-select
whose only consumer is a one-person filter is a control that does nothing —
ADR-0116's emergence rule. Something reads several now, so the picker exists.

It is a row of toggles rather than a `<select multiple>`: that control on a
tablet is a scrolling box with a modifier key nobody has. State is carried in
`aria-pressed` and in a background, never in weight alone.

It is **seeded** from whoever the single-valued filter already holds, and stops
being seeded the moment the reader touches it — otherwise turning the last
person off would put them straight back.

Its door is a **second line** in the saved row, not a fourth control beside the
name, the words and *Forget it*. That row is already three across at the 44px
floor, and a fourth is the wrap that put two boxes on top of each other with no
gap in the flowcharts footer, which the walk refused as a mis-tap.

## What is measured, and what is not

The walk drives the picker and the room end to end, in both themes, and opens
the room **from the saved row** rather than by naming the sheet — a surface
reachable only by a walk that knows its id is a surface a reader does not have.

**`#meeting-crosses-label` and `#meeting-lines-label` are deliberately not in the
registry, and therefore not measured.** Both render only when the room's work
sits under a horizon or carries a role, and the thing driven into the walk's
room is a plain action with neither. Registering them would be a receipt for
something not on screen — the false receipt 2.24.0 cost a release for. What
that leaves unmeasured is the two labels' contrast and names, not the lists
themselves: the rows inside them are `.roles-name.linklike`, already measured
across four other surfaces. Stated here rather than left to be found.

## What this does not do

No count beside anybody's name in a roster, no ordering of the people by how
much is on them — that is `roleLoads`' own refusal, and ranking the people in a
room by how much you owe each of them is a worse version of the same judgement.
No readiness, no "you are behind on three", no colour, no export of the room to
anybody in it. Entry 19's refusal of networked or simulated accountability
stands: this is memory support, never a channel.

## What would overturn this, and the larger question above it

A room that composes only the reader's own relationships to work will show a
to-do list re-sorted by who is present, because that is all the app's nouns can
express. Everything Quietkeep holds describes **the reader's relationship to
work** — what I hold, what I owe, who I am waiting on, where I can do it, who it
is for. There is no noun for *a thing in the world with a state of its own and
rules about when it may change*: a post that is filled or vacant, a vacancy that
cannot be advertised yet, a temporary promotion that expires whether or not
anybody acts. A search of `src/` for establishment, vacancy, incumbent or
headcount returns nothing, and the one place the word *capacity* appears it
means the reader's own energy.

That gap is not a defect in this record — the room is right either way, and it
is the prerequisite for marking anything in it. It is named here because it is
the reason a room can feel like a dashboard, and because the answer is a new
noun rather than a better view.
