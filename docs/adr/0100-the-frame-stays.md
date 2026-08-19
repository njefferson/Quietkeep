# ADR-0100 · The frame stays, and the mechanism was chosen by the record

**Status:** Accepted · **Date:** 2026-08-18 · **Shipped:** 2.9.0 ·
**Follows:** [0099](0099-the-first-screen.md) ·
**Touches:** [0083](0083-four-destinations.md), [0090](0090-a-way-past-the-stack.md), [0093](0093-a-way-to-each-part-of-the-page.md)

## Decision

The page is a **flex column of viewport height with exactly one scrolling
child**. Above it, and outside the scroller, is the **frame**: identity, the
three destinations, the capture box, what the app just did with what you typed,
and the proof that nothing has gone quiet.

`<main>` and the footer ride inside `.runway`, which is the only thing that
moves.

## Why now, and why this and not something else

ADR-0099 measured the previous step and returned a number rather than an
opinion: rearranging blocks moved the offer 42px, and **the floor in a
scrolling shell is about 0.36 screens** because the header and capture take
236px before anything else exists. Its own conclusion named this release —
*putting the one thing at the top cannot be done by moving blocks; it needs
capture to become fixed chrome rather than the first block of a scroll.*

**The mechanism was not a choice between three options. Two were already ruled
out by measurements this repo had paid for, and I went and read them.**

- **`position: fixed`** was built once, as a floating Contents button, and
  probed at two screen sizes across thirteen scroll positions: **it overlapped
  ten controls and took the centre of three, every one a card's Done.** Padding
  at the document's end does not help, because mid-scroll content passes under
  a fixed element by definition.
- **`position: sticky`** was the (i) panel's way out, and it **did not hold on
  the reference iPad — the bar scrolled away with the content, found twice, on
  device.** `app.css` records the response as removing the dependency rather
  than debugging it.

What replaced sticky there is what this uses here. `#about` became a flex
column whose bar is a sibling of the scroller rather than a child of it, and
every sheet has had that shape since 1.40.0. Its comment states the whole
argument in one sentence: it **"needs no support from any engine and cannot
regress."**

So this release is not a new layout idea. It is the app's own proven pattern,
carried one level up to the page — which is hub LESSONS 93 exactly: an argument
accepted for one surface does not travel to the others by itself, and somebody
has to carry it.

## What it measured

At 390×844 and 820×1180, empty store and the thirteen-item sample.

- **`#nextup` begins 0.08 screens into the runway** on a phone and 0.05 on the
  iPad. It was 0.43 screens down the page.
- **The frame costs 201px empty and 225px seeded on a phone** — 23.8% and 26.7%
  — and 201px (17.0%) on the iPad. At the top of the page that is a gain: the
  same chrome took 304px before. Deep in a list it is a loss, because that
  chrome used to be gone entirely. Both halves are in the reader's notes.
- **Unreachable controls: zero**, at both sizes, both stores. Every control was
  asked whether a scroll position exists that brings its whole box into view.
  That is the test the floating button failed, asked again of its replacement.
- **The document's scroll area beyond its own box: 0px.** Not incidental — a
  document that can scroll rubber-bands on iOS and collapses the URL bar under
  a frame that is not supposed to move.

## Three defects the measurements found, that reading would not have

**The frame collapsed from 165px to 39px the moment there was data.** It was
`flex: 0 1 auto`, which reads as harmless. A flex line distributes negative free
space in proportion to each item's **basis**, and the runway's basis was `auto`
— the height of the whole list, 4,501px. So the frame took its 3.5% share of a
3,800px overflow. **The empty store measured a perfect 165px beside it.** The fix
is `flex: 0 0 auto` on the frame and `flex: 1 1 0` on the runway, and the shape
worth remembering is a layout that is correct until there is data in it, on the
store every walk starts from.

**The document reported itself scrollable while the body was exactly right.**
Every `.visually-hidden` label in this app is `position: absolute`, and an
absolutely-positioned element with no positioned ancestor is laid out against
the initial containing block — so each one deep in the list extended the
document's scroll area to 2,032px against a body of 844px. `.runway` is
`position: relative` now. Nothing looked wrong; the page simply reported a fact
that the entire frame depends on being false.

**`axe` failed all 33 states at once** on "All page content should be contained
by landmarks", naming the capture box's own label. Lifting capture out of
`<main>` had left it in a bare wrapper belonging to no landmark, so a
screen-reader user navigating by landmark would pass straight over the box this
app exists to offer. The frame is a `<header>` — the banner — and the row of
identity and destinations inside it is now an ordinary `<div>`.

## What had to give, and what did not

**One row, on a phone.** The bar measured 412px of row against 358px of column,
so `Contents` wrapped and the header was 132px. A smaller gap and a 1.125rem
wordmark bring it to 354px and one row. `flex-wrap` **stays** — at 320px or at
200% text it must still wrap rather than overflow.

**The frame may never take more than half the screen.** Without a cap there is a
hard accessibility failure hiding here: at 200% text every row wraps, the frame
grows, and because it does not shrink it grows by taking the runway's space —
far enough and there is no content area at all. That is WCAG 1.4.4 and 1.4.10
failing at exactly the settings the people this app is for are most likely to
use. `max-height: 50dvh` with its own scroll; capture is first in the frame and
therefore the last thing to go.

**Two controls left the frame.** *More room* and *Hold what I copied* were its
second row and measured 52px of permanent chrome for two controls used at the
start of a sitting. They sit at the top of the runway now. The cost is real and
is stated in the notes: from three screens down, *More room* needs a trip back.

**The update strip moved below capture.** Its own comment says it must not stand
between somebody and their capture box — and in a frame, a block above capture
pushes capture down every time it appears, in the one layout where the reader
cannot scroll past it.

## Three gates were measuring the wrong origin, and one would have gone vacuous

The jump assertions read `window.scrollY`, which is now permanently 0. One of
them asserts that pressing the way back **returns you to the top** by testing
`y === 0` — a permanent zero satisfies that for ever. It would have gone green
while measuring nothing, on the release that broke it: hub LESSONS 100's shape
arriving through a layout change rather than through a conditional.

Two more read `getBoundingClientRect().top` against the viewport, which now
counts the frame's whole height as error. Both were **corrected at the origin
rather than loosened at the tolerance** — and the contents jump's expected
landing point is read from `scroll-padding-top` in the stylesheet, so changing
the clearance moves the check with it and a jump that actually breaks still
fails.

## What cannot be verified from here

**In a browser tab this costs more than the frame.** A document that scrolls its
own content lets iOS collapse the URL bar and hands back roughly 60px; a page
whose document does not scroll never triggers that. Installed to the home screen
there is no URL bar and the cost is zero — which is how this app asks to be used
(Doctrine §7e) and is now one more reason it does. Recorded as **V-24**.

The pattern itself is not a guess: it is what every sheet in this app has done
on the reference device since 1.40.0. What is new is applying it to the document
rather than to a dialog.

## What would overturn it

The frame reading as more in the way than it is worth — a quarter of a phone
screen is a lot to give up permanently, and no measurement here can answer
whether it feels like shelter or like a wall. The runway becomes the document
again and every number above stays true.

Or the URL-bar cost proving to dominate in browser use, in which case the frame
belongs to the installed app and the browser gets the old shell.
