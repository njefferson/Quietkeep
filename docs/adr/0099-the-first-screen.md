# ADR-0099 · The first screen, and what a rearrangement can and cannot buy

**Status:** Accepted · **Date:** 2026-08-18 · **Shipped:** 2.8.1 ·
**Extends:** [0093](0093-a-way-to-each-part-of-the-page.md) ·
**Touches:** [0065](0065-load-not-work.md), [0088](0088-the-claim-and-the-tree.md)

## Decision

Three doors leave the runway and become rows in **Contents**: the worry entry,
the load entry, and sort's picker. The **coverage gauge moves to the top of the
page**, directly under capture, where it can be read before the list it is
reassuring somebody about.

And the mechanism that makes it safe to do: Contents grows a **doors** half,
derived from `dialog[data-contents-door]` exactly as its stops are derived from
`main > section[id]` — named by the surface's own `aria-labelledby`, carrying the
surface's own `#<id>-count` line.

## Why this, and why now

This is the smallest testable piece of a larger question about the landing view,
taken on purpose instead of the rebuild it belongs to. The page had been measured
and the measurement is the reason:

At 390×844 with thirteen sample things, **Next up — the app's whole thesis, one
thing chosen for you — began 0.48 screens down**, behind two shut doors and a
status line. On an empty store, before the app had a single thing to offer,
**fourteen controls stood on the first screen**. The reader's own list began 2.73
screens down.

None of that was carelessness. Every block above the fold arrived on a good
argument and was right on its own. What was missing is the thing `size-check.mjs`
was built to supply for prose and never supplied for LAYOUT: **nothing measured
the sum.** A page assembled in the order it was built records the history of the
work; a page designed whole records the priorities of the reader.

## What it measured

Same probe, same viewport, before and after, on an empty store and on the
thirteen-item sample.

- Controls on the first screen, empty store: **14 → 13**
- Controls on the first screen, sample: **15 → 14**
- **Next up: 0.48 → 0.43 screens**
- The held list: 2.73 → 2.57 screens
- Whole page, sample: 5.91 → 5.66 screens
- Whole page, empty: 1.53 → 1.29 screens

**The two entries freed about 110px and the proof line put 68px back**, so Next
up rose by 42px of an 844px screen. That is the finding, and it is a small one on
purpose: it is what the step was for.

## And the number it puts a floor under

The header is 140px and capture is 96px before anything else exists. With a proof
line above the offer, **the best Next up can do in this shell is about 0.36
screens** — and it is at 0.43. So roughly two thirds of the reachable gain is
taken, and the remaining third is the whole prize left in rearrangement.

**The design that puts the offer at the top is therefore not reachable by moving
blocks.** It needs capture to become fixed chrome rather than the first block of
a scroll, which is a change to the shell and not to the page. That is a real
result about the rebuild, obtained for the cost of a reversible afternoon, and it
is the answer this release was run to get.

## What it trades, stated plainly

**Naming a worry goes from one tap to two.** The catalogue's best-evidenced entry
is activation cost at the point of performance, and this adds some to an act with
very little tolerance for it. Against that: every visible ask is an ask (entry 8),
and what those two shut doors were pushing below the fold was the one thing the
app exists to hand you. The trade is real in both directions and this record does
not pretend otherwise.

The mitigation is not argument, it is mechanism, and there are two:

- **The proof line came up with them.** A reduction is frightening with no
  standing claim that nothing was lost and unremarkable with one. Moving the
  gauge is not decoration around the removal; it is the half that makes the
  removal legitimate, which is why it is in the same release.
- **The load door reports its own state** — your own word back to you and how
  many weights are on you — so a surface that went behind a door did not go
  silent. *Out of sight* is the collision this entire app is a rebuttal to, and a
  door that says nothing about what is behind it commits it.

It says **nothing at all** when there is nothing to report. A standing "0 things
on you" is a reminder that you have not filled something in, and this entry has
been defended against exactly that since it was built.

## Derived, like everything else that has gone stale here

`data-contents-door` and nothing more. The row's name is read from the dialog's
own title element, so the row, the heading on screen, and the string a screen
reader announces on arrival are **one string** — they cannot drift, because there
is only one of them.

This is the third time this file has been written. A hand-written list of doors
went stale in a day (2.0.7); a hand-written list of element types hid four
undersized controls for months (2.8.0); the stops half of this very sheet exists
in derived form for the same reason. A door added later appears the day it is
marked.

## And the walks take the reader's route

Both walks could open these dialogs with one line of `showModal()`, and every
audit would pass while proving nothing whatever about whether anybody can reach
them. Hub LESSONS §95 is a skip link this app shipped for 142 releases — correct
in every particular, reachable by nobody, green throughout.

So `openViaContents` presses Contents, finds the row, presses it. It was planted
by stripping `data-contents-door` from the markup: the walk fails, and it **names
the missing marker** rather than reporting a click that timed out, because a gate
that fails without naming its cause sends somebody to read the wrong file.

The `contents open` state asserts the door count is non-zero **before** iterating
the doors — without that line, deleting the feature leaves nothing to iterate and
the state reports green about something that is gone. That is hub LESSONS §100,
found in this same walk, and it is now written into the check that would have
repeated it.

## Consequences

- `data-door` may name more than one tap, separated by `|`. A one-tap door is
  still a single selector. The separator is not a space, which is the descendant
  combinator and would make the chain one valid selector matching nothing.
- The load entry fires `close`, not `toggle`. The listener that clears a pending
  attachment moved with it — left unchanged it would have gone quiet, and the
  first symptom would have been somebody's weight filed against last week's task.
- Sort's open-time reset moved out of its button's click handler and into
  `onSheetOpen`, so it runs on every open by whatever route.
- Controls budget 228 → 229. The +1 is an accounting artefact: the page shed
  three doors a finger can press, but two of them were `<summary>` elements and
  the counting regex does not read those. **The regex is the defect**, it is the
  same one 2.8.0 found in the target audit, and it is deliberately not widened
  here — repricing every historical figure during a layout change would leave
  neither the count nor the layout readable against what came before.

## What would overturn it

Somebody reaching for the worry box, not finding it, and the thought going
unwritten. That is the failure this trades against and it outweighs every pixel
in this record — the entries come back to the runway and the finding stands
anyway, since what the release was run to learn is already learnt.

Or the opposite, which would be the stronger result: the first screen reading as
calmer in use than the 42px suggests, in which case the number was measuring the
wrong thing and the shell change is worth starting.
