# ADR-0085 · Capture covers. Sorting is a door, never the corridor.

**Status:** Accepted · **Date:** 2026-08-10
**Follows:** [ADR-0084](0084-the-guarantee-is-the-product.md), which named this and
did not build it. **Refines:** [ADR-0029](0029-triage-model.md).

## The gap this closes

ADR-0084 made the guarantee openable. It also recorded, so the next session would
not treat the ADR as finished, that the app still drove people from capture into
an eight-way decision — the thing `docs/planning-for-humans.md` says stops the
dumping. This is that piece.

The corridor was real and it was structural, not a matter of tone:

- `#triage` is markup order 218 in `public/index.html`. `#nextup` is 384. On
  arrival with anything unsorted, the forced choice rendered **above** the answer
  to *what now*.
- `mountTriage` initialised its own `suppressed` flag to `false`, so the first
  `refresh()` on load revealed the surface and put a card in front of you.
- The gauge read `12 to clarify · 5 not yet hot/cold`.

So the app's answer to arriving was a decision, a queue, and a number that had
gone up since last time.

## What was already right, and why it made the rest worse

1.39.2 had already stopped a **capture** from turning the surface on: ten
captures in a row used to mean ten interruptions on the one path that must stay
frictionless. 1.39.3 had already stopped the heat pass leading when there was no
pile to sweep, on the ground that an optional step you decline on every item is
a toll with a bypass.

Both fixes were correct and both were about the same defect. Neither touched
arrival, which is the modal session: median 30-day retention in this category is
3.3–3.9%, so the typical open is a re-entry after weeks — and re-entry after weeks
is precisely when the inbox is fullest and the decision is most expensive.

## The claim the old behaviour rested on, and why it is false

The reveal was defended in a comment: a fresh arrival is a fresh decision, so
coming back should always show you what waited. That reasoning assumes the reveal
is **protecting the items**.

It is not, and the gate says so. `cureFor` in `src/gate.ts` gives every
`capture.recorded` a same-day `review` clock **in the same transaction as the
capture**. There is no window in which an unsorted capture is silent. It carries
a clock, `whyCovered` returns `clock` for it, and 1.42.0's proof counts it under
*on a clock* along with everything else. `src/nextup.ts` separately declines to
offer it, so it cannot flood the surface it is not on.

An unsorted capture is therefore **already covered**. Nothing about showing it to
you on arrival makes it safer. What the reveal actually did was charge a decision
for opening the app.

## Decision

**Sorting is somewhere you go. It is never somewhere you are sent.**

- **`suppressed` starts `true`.** The clarify surface never reveals itself. Not on
  arrival, not on reload, not on a capture. It is reached through `#triage-open`
  and only through it.
- **The door is on screen the whole time anything is waiting.** Nothing is
  stranded by not being shown. Reachable, never in front — those are different
  properties and only the second was ever the problem.
- **The gauge stops counting at the reader.** It says what is true of the items
  instead: *These are held either way. Sorting decides where they come back, not
  whether.* When there is nothing: *Nothing here is waiting to be sorted.*
- **The count survives as `data-waiting` on the gauge**, for the walks that need
  to watch a queue drain. A test hook is not a reader surface. It is a data
  attribute rather than a visually-hidden element **on purpose**: a hidden count
  is still a count to a screen-reader user, and they are owed the same freedom
  from the tally as anybody else.

## Why the count had to go with the corridor

They are one defect. Removing the forced choice while leaving `12 to clarify` on
the arrival screen would replace *being made to decide* with *being shown how far
behind you are*, which is the same message with the work deferred.

The repo had already reached this conclusion twice and stopped short of this
surface. V2 stage 1 deleted `N held` from the coverage gauge because a countable
batch is what turns a good day's dump into a visible backlog. The capture
confirmation refuses a count for the same reason, in the same words, and so does
the dump commit. This was the last place still keeping score, and it was the one
place a person sees without asking.

A count is also the wrong instrument here for the reason 0084 already gave about
`0 silent`: it is unfalsifiable to a reader. Twelve tells you nothing about
whether the twelve are covered, which is the only question being asked.

## What this does NOT do

- **The six routes are unchanged**, and so is the heat sweep's threshold. Nothing
  is removed from sorting; it stops being the price of entry.
- **It does not move any markup.** `#triage` stays where it is. With the surface
  behind its door, arrival renders a one-line door and then the offer, which gets
  the ordering ADR-0084 asked for without a declared move of a control's
  position — that is a breaking change under V2 stage 7 and would need its own
  release and its own note.
- **It does not touch re-entry.** The return-after-an-absence surface is a
  different thing and legitimately shows itself.

## What would overturn it

- **If the inbox stops being visited at all.** The door being ignored forever is
  the honest failure mode of this decision, and it is a real risk: the corridor
  did get things sorted. The answer would be to make the door say more about what
  is behind it — never to reinstate the reveal, because a person who does not
  want to sort is not helped by being unable to avoid it.
- **If a count turns out to be what somebody wants**, it belongs behind the door
  or in the proof, where it is asked for. Not on arrival.
