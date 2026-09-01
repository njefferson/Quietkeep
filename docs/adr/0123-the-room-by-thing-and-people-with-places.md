# ADR-0123 · The room by thing, people with places, and the hub's own situation door

**Status:** Accepted · **Date:** 2026-09-01 · **Extends:** ADR-0119 (the room),
ADR-0092 (places), ADR-0118 (who is in it) · **Built on:**
[`docs/nd-collisions.md`](../nd-collisions.md) entries 23 and 24.

## The questions, from one device pass

Three asks in the reporter's own words. With one task every person shares, the
room "looks repetitive. Can it allow sort by person, or by task where it would
collapse to one instance that several people owe, potentially grouped as
appropriate **without creating a manufactured label of any set of people**."
Second: "a way to group or select people as affiliated with contexts, so my
wife isn't an option for staff call." Third: the situation "mentally seems like
a setup step before going deeper, not a filter applied later in a smaller
window."

## Decisions

**The room gains a second lens and keeps its first.** ADR-0119's by-person
duplication stands untouched — a node naming two attendees is genuinely two
conversations, and that stays the default every open returns to.
`meetingByThing` (`src/meeting.ts`) is the other lens over the *identical*
membership: each thing once, wearing the names of the attendees on it, sorted
by title. **The names are the grouping and the whole of the label** — no set of
people is ever christened, which is the reporter's own constraint and law 7's.
The tests hold the two lenses to the same room: rows-by-thing equals the other
lens's `total`, so they can never disagree about what the meeting is about.
The toggle is two `aria-pressed` buttons on the sheet, sitting-memory only.

**People carry places, and the choosers respect them — stated facts only.**
The places group has always rendered on a person's sheet; nothing ever read it.
Now it speaks person words there ("Their places" / offered-when-you-are-there),
and `peopleForPlace` (`src/people.ts`) shelves every people-chooser three ways
when a place is chosen: stated **here** first; the **unplaced** always offered
— `fitsHere`'s own load-bearing default restated, because on a store where
almost nobody carries a place an empty chooser teaches that the feature is
broken; and stated-only-**elsewhere** behind one press ("Everyone (N more)"),
never removed, never hidden for good. Entry 23's refusal holds absolutely:
nothing is inferred from who was around when — the only input is a place the
reader put on the person's own sheet, which is entry 24's shape. A trashed
place neither holds nor exiles anybody (`contextsOf` resolves live — the
`personName` rule on one more axis). The single-valued *Who is here* select
cannot shelve, so it says the same thing as ordering.

**The situation gets a second door, on the hub — not a move.** The original
door stays on the stances beside `whereWords`/`howLongWords`, because a
filter's consequence must stand with what it narrows (the reasoning that placed
it, kept verbatim). The hub door is the same question asked where the day
starts, in the gauge idiom, carrying the same `data-narrows` declaration.

## Refused

A merged room row under an invented set name, in any form. Any inference of
affiliation from co-occurrence, selection history, or anything but the stated
place. Hiding anyone from a chooser with no way back. Moving the stance door.

## Held by

`test/meeting-view.test.ts` (the two lenses agree; names are the label; the
let-go neither group nor label), `test/people.test.ts` (the three shelves; the
no-place default; the dead-place fallback), and the walk: the lens flip says so
in `aria-pressed` and a by-thing row wears its names; with nobody placed,
nobody is shelved away; a person's sheet speaks person words; the hub door
opens the sheet and hands the hub back.
