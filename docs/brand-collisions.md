# What a simple flat mark already means

A checklist for anyone attempting Quietkeep's icon. **Go down it deliberately.**
Every entry below was found the hard way, and most were found by the owner
*after* a session had rendered the candidate at six sizes and looked at it
carefully. Looking is necessary and it is not sufficient — the eye that drew a
shape is the worst one for asking what else it is.

ADR-0025 states the rule this list serves: *a mark has to be checked against the
audience's own vocabulary, not only against other logos.* Collision checks that
ask "does this resemble another brand" miss all of these.

## The research says the current mark depicts the failure mode

**This is the finding that matters most, and it outranks the cell reading.**

`docs/nd-collisions.md` entry 3 is the app's thesis and **the best-evidenced
entry in the catalogue** — cue-dependent prospective memory failure, Einstein &
McDaniel, decades of experimental work:

> *a thing that leaves the visual field leaves existence … visible is the only
> kind of remembered. Filed means gone.*

The entry names filing and archiving as the *virtues of conventional systems*
that make the collision worse — "inbox zero is literally the instruction to put
everything where it can no longer cue you".

**The mark is a warm form shut inside a dark box.** That is a picture of
something put away where it can no longer cue you. The icon has been
illustrating the exact failure the app exists to prevent, on the app's own front
door, for its entire life.

So the brief for any replacement is not *held safely* — vessels, cradles, boxes
and stacks are all the wrong family. It is **stays in view**, or **comes back
into view**.

## The colour error that forced the enclosure

`--warm` has two values: `#7A4E00` in light mode, `#F5C978` in dark. Measured
against the icon's paper field `#F4F1E9`:

- `#F5C978` — **1.38:1**. Three times under the 4.5:1 the hub's PALETTES.md
  holds every accent to, because *"accents are text"*.
- `#7A4E00` — **6.38:1**. Clears it.

**The icon uses the dark-mode warm on a light-mode ground.** That colour cannot
describe a shape on paper, so the mark needs a dark field behind it to survive —
and the dark field is the enclosure. The cell is a symptom of a token error, not
a design decision, and every open composition attempted against the old value
was doomed before it was drawn.

## The current mark also fails this list

**A warm arched form inside a dark rounded square reads as a prison cell.**
Reported 2026-08-19. ADR-0025 had already rejected an earlier candidate whose
silhouette — round top, straight sides, flat base — read as a *headstone*,
calling it "the worst reading available for an app whose promise is that nothing
you put in is lost". The fix made the outer form a rounded square and kept the
arch "only in the warm opening" — **so the disqualifying silhouette was never
removed, only relocated inward**, and then wrapped on four sides.

For an app whose users are people who feel trapped by what they are carrying, a
cell is the same category of failure as the spiral, and it is refused for the
same reason.

## The list

- Warm form inside a dark frame on all sides — prison cell, doorway
- Arch with a round top, straight sides and a flat base — headstone
- Two or three tapering soft mounds, stacked — the poop emoji
- Three flat stones stacked, symmetric — spa, wellness, balance
- Circle sitting above a curve — a smiling face
- Small accent shape on the corner of a dark square — notification badge, which
  means "you have unread things" and is the backlog headline this app refuses
- Two vertical rounded bars side by side — pause
- Horizontal bar with a marker on it — progress bar or slider, and a bar is a
  machine for implying you are behind
- Landform with a form above it — sunrise, landscape
- Form breaking a flat top edge, centred — briefcase or bag handle
- Form breaking a flat edge, off to one side — folder tab
- Ring with a diagonal stroke off the lower right — magnifying glass, search
- Any closing curve or coil — @ sign, loading spinner, and it spirals
- Circle with a wedge removed — pie chart, Pac-Man
- Mass with a round socket, plus a matching blob — jigsaw piece and its tab
- Rounded square with a smaller one offset behind — copy, duplicate, stack of cards
- Chevron or a form leaning right — play
- Droplet — water, ink, blood
- Crescent open upward — bowl, cup, or a smile
- Crescent open downward — umbrella, hill
- Capsule with an offset dot inside — the iOS toggle switch, on/off
- A form with smaller forms trailing off it — loading dots, "typing…", a comet
- Static composition intended to show motion — reads as neither; arrival and
  return do not survive being still, and adding an arrow makes it a refresh icon

## What this list is telling you

**Two or three soft blobs in two colours is a saturated space.** Nearly every
arrangement is already a well-known glyph, and the well-known glyph wins — a
reader is not looking for your metaphor, they are recognising a shape in a grid
of forty icons at 48px.

Directions tried and exhausted: enclosure, stacking, cradles, horizons, cuts and
notches, letterforms, arrival, presence and return — **seven rounds, in three
palettes, every one of them collided with something on this list.** Two of the
collisions were caught by the owner after a session had rendered the candidate
at six sizes and studied it. The next attempt should
either generate a much wider field and filter it hard against this list before
anyone falls in love with a candidate, or go to somebody who does this for a
living. **What must not happen is another round of drawing three shapes and
asking whether they look nice.**

## Constraints any candidate must still meet

- Three flat colours, no gradient, no shadow, no transparency (ADR-0025)
- Legible and unmistakable at 48px and 32px
- Artwork inside the centre 80% circle, for maskable and circular crops
- The navy must carry the silhouette. Amber on the paper field is 1.38:1 and
  cannot be relied on to describe a shape; amber on navy is 6.48:1. The mark
  should survive with the amber removed — if it collapses, the amber was doing
  work it cannot do.
