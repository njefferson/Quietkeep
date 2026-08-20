# ADR-0104 · "Just one thing" is a fact about the screen, not about the card

**Status:** Accepted · **Date:** 2026-08-20 · **Extends:** ADR-0090 (the way past
the stack) · **Continues:** the 2.10.0 chrome strip, which stopped at the offer

## Decision

**While *Just one thing* is on, the work surface below the offer is not
displayed.** The sort queue, the replan queue, the person lens, the carrying
list, the review exceptions, the chosen-for-today list, the upkeep chips, the
Menu, the roles door, the search box and the held list all go, along with the
jump to the list and the bypass link that points at it. The worry flow and the
welcome-back greeting go with them, above the offer.

**Five things survive, and the list is short on purpose.** Capture and its
receipt, because capture relief is unconditional. The proof line, because it is
what makes everything being out of sight safe. `More` and the ⓘ, because a screen
with no way to anywhere is a trap. The update strip, because a reader stuck on a
stale build has to be able to learn it (Doctrine §7h). The focus session, when
one is running, because that is the one thing rather than the pile. The wordmark
and the footer stay: a surface has to say what it is, and the licence and the
accessibility statement are an obligation.

**The mechanism is a stylesheet rule generated from `PLAIN_CHROME_HIDDEN`**, not
a loop setting `hidden`. `node tools/plain.mjs --write` writes the block into
`public/app.css` and the gate fails on drift.

## Why

### The mode was answering the smaller half of its own problem

The state exists for the day when operating the tool is itself one of the skills
that has gone. 2.10.0 found it on a device — a screen showing exactly one task
that was still too busy to begin in — and extended the strip from the card to the
chrome above it.

Rendered and counted at 390×844 on the thirteen-item sample, with the mode ON,
before this release: the card carried five controls and two words, and **below it
stood fourteen controls and 65 words of standing text** — which is precisely what
stood there with the mode off. Not one of them moved. The whole runway measured
2.18 screens.

### Two of those lines are the hardest sentences on the surface

*Needs a new plan — one date has gone by.* *One thing is with someone else.*
Both are true, both are correct on an ordinary day, and both were being printed
underneath a card that had just had its reason line removed for being one thing
too many to read.

### The reasoning already existed, at one third the scale

2.13.0 named what else a returning place holds, capped at three, and *Just one
thing* strips that line — because three names beside the offer are the pile
arriving in miniature, which is what this mode exists to stop.

The held list, the sort queue and the replan queue beneath it are the pile
arriving whole. There is no property that makes three names too many and a
complete inventory acceptable.

### Collisions entry 1 is the whole argument

A long list raises the activation threshold of every item on it. The offer card
is this app's answer to that entry, and the answer was being given on top of the
list it was answering.

## What this does not do

- **It does not delete anything, and no guarantee changes.** The store is
  untouched, every card is still built and held, and one visible control brings
  the surface back. `tools/smoke.mjs` asserts both halves of that.
- **It does not make the mode automatic.** Nothing detects a foggy day. It is
  invoked and it stays until it is left (ADR unchanged since 1.36.0).
- **It does not take capture away.** Capture relief is unconditional from every
  state, and `tools/plain.mjs` fails if capture, the proof line or `More` ever
  appears in the stripped list.
- **It does not claim the surfaces are reachable while it is on.** Search is the
  clearest cost and is stated rather than discovered: on this day *where did I
  put it* is answered by leaving the mode. That is a real loss and it is the
  trade being made.

## How it is held

- **`tools/plain.mjs`** requires every region of the rendered work surface to be
  declared in `PLAIN_CHROME_HIDDEN` or `PLAIN_CHROME_KEPT`, and holds the
  generated block in `public/app.css` identical to the list. The card has had
  this pair since 2.10.0 and has not gone stale since; the chrome had one list of
  three selectors and nothing checking it against the surface, which is how
  fifteen sections joined the worst day's screen without anybody deciding they
  should.
- **`tools/a11y.mjs`** walks the rendered header, `<main>` and the footer with
  the mode on and fails on a region in neither list — the accounting is done
  against the DOM, because reading nesting out of the markup with a regex is how
  a gate ends up agreeing with a file instead of with a screen. It found the
  wordmark undeclared on its first run.
- **The same walk counts what is left**: controls and words of standing text
  outside the offer, with ceilings and no headroom. Nine and twenty-one, on a
  fixture where a capture has just landed and a second worker is waiting. Before
  this release, on the same fixture: twenty and sixty-five.
- **`tools/smoke.mjs`** asserts on the built app that the surface below the offer
  is off the screen, that capture, the proof line and `More` are not, and that
  leaving the mode brings all of it back.

## The mechanism, and why it is not a loop

The first version set `hidden` on each element at the top of `work.ts`'s refresh,
which is where the three-selector list had always been handled. That works only
for chrome nothing repaints. Every section in the new list has an owner:
`replan`, `focus`, `reentry`, `bother`, `search` and `sort` paint in
`rerenderLists()`; `paintJump` paints the jump deliberately after `work.refresh()`
because it has to read what everything else did; `triage.refresh()` is called
from two places outside the refresh chain entirely.

There is no last word to hold. Any ordering that works is one call site away from
silently not working, and the failure is invisible because the source still says
the surface is stripped.

The second version generated a `<style>` element from the list at mount, so there
could be exactly one copy of the selectors. **The app's CSP is `style-src 'self'`
and refused it** — correctly — and the mode went on stripping nothing while the
console said so. A measurement caught that; reading the source would not have,
because the source was right.

So the block in `app.css` is a generated artefact of the list, the same as
CHANGELOG.md and the pre-commit hook are artefacts of their sources. A second
copy held by a gate is not the same object as a second copy nobody checks.
