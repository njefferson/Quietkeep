# ADR-0083 · Four destinations, not four folds — the app gets navigation

**Status:** Accepted · **Date:** 2026-08-10 · **Supersedes:** ADR-0055

## Decision

Help, Settings, Your data and How it works stop being folding groups inside the
ⓘ and become **their own screens**, reached from a **More** control in the app's
own header. The ⓘ keeps only what the app IS: the intro, what changed, the
diagnostic, the way to the calendar, the licence.

- **More** lists the destinations and nothing else. It is a list of places, so
  it is short enough to read in one look.

  **SEVEN since 3.5.1**, when colour left Settings and became its own door. The
  count in this line has now been four, six and seven; what is load-bearing is
  the sentence above it, not the number.

  **"AND NEVER SCROLLS" USED TO BE HERE AND IT WAS NOT TRUE.** Measured on the
  release that added the seventh, and measured again with the seventh removed so
  the blame lands where it belongs:

  - 390x844 at 100% — six doors: 406px in a 406px box. Seven: 466 in 466.
    Neither scrolls, and both fit exactly, because the dialog sizes to its
    content until it cannot.
  - 390x844 at 200% — six doors ALREADY scrolled: 1,070px of list in a 381px
    box. Seven makes it 1,186. At 320px and 200% it is 1,358 against 1,522.

  So the claim had been false at the text sizes the people this app is for are
  most likely to use, for as long as there have been six, and nothing had looked.
  It is not a defect in the list: a list of places is a reasonable thing to
  scroll, the way out sits outside the scrolling body (§4), and every door clears
  its target size. It was a defect in this record, which stated an absolute
  nobody had measured. The honest version is: it does not scroll at 100%, and it
  does at 200%.
- **One surface at a time.** Opening a destination closes whatever was open.
  Two open dialogs overlap and the top one eats the other's taps, and "somewhere
  to go" means arriving at *one* place.
- Every sheet carries its own title and its own **Close**, outside the scrolling
  body, so the way out never scrolls away (§4).
- The ⓘ stays reachable exactly where it was. Its position and label are a
  compatibility surface (ADR-0076) and neither moved.

## Why

ADR-0055 chose folds over a settings surface and named the condition that would
overturn it: *"If the panel keeps growing past what four groups can hold, this
decision is the one to revisit."* It grew past it.

What a fold actually costs, measured rather than argued:

- **Opening a group scrolls the others out of reach.** Four groups in one
  scroller is one screen wearing four names — the fold changes how much stands
  in front of you and not how far you have to travel, and travel is what was
  expensive. Reaching Settings meant: open the ⓘ, scroll past what the app is,
  find the third caret, open it, scroll again.
- **The panel had no top to arrive at.** Every group opened wherever the reader
  already was, so the same control was at a different height every time. A
  destination opens at its own first line, every time.
- **A fold is a promise that the thing is nearby, and it was not.** The panel
  ran to thousands of pixels folded; that is a reference, and a reference is
  read by somebody with one question, not from the top.
- **The gate could not see three quarters of it.** The a11y walk audited the
  four groups as one dialog state, which measured whatever the first open group
  showed and reported the rest as covered. Four screens are four states, and
  1.40.0 walks each — the same commit, per the surface rule.

ADR-0055's objection — *"a second surface is a second place for things to be,
and 'where did that control go' is exactly the question this audience should
never be handed"* — is answered by More rather than dismissed. There is one door
and it is always in the same place; behind it is a list that names every
destination in the reader's own words. The alternative on offer was not "no
second place", it was "the second place exists and is called *scroll further*".

## What this does not change

- **The one-panel promise is not broken, it is relocated.** Everything is still
  reachable from the app's own chrome without leaving it, in one tap more than
  before for the ⓘ's contents and one tap *fewer* for everything else.
- **No URL routing, no history entries, no back-button semantics.** These are
  modal sheets, as every other surface in this app is. A destination that could
  be arrived at cold, by link, would be a different decision with different
  costs, and nothing here needs it.
- **Nothing is remembered about which sheet was open.** ADR-0055 stored the
  open-group set per device; there is nothing to store now, and that kv key is
  left unread rather than migrated — an unread key is data nobody loses.

## What would overturn it

- **Six destinations becoming twelve.** More is worth having because it fits in
  one look. A More that scrolls is the panel again, and the answer then is
  fewer things, not a second More.
- **Evidence that the extra tap costs more than the scroll did.** The claim here
  is that travel dominates tap count for this audience, and it is a claim: if
  the ⓘ's own contents turn out to be what people reach for most, the split is
  drawn in the wrong place and should be redrawn, not undone.
