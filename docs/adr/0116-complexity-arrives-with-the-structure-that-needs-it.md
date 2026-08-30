# ADR-0116 · Complexity arrives with the structure that needs it

**Status:** Accepted · **Date:** 2026-08-30
**Names a rule the app already followed** without stating it, and refuses the
alternative that keeps getting proposed.

## The question

This app is built for a range that runs from somebody who wants a box to put
things in and one thing to do, up to somebody running lines of effort, staffing
constraints and standing meetings across an organisation. Both are the audience.

Two failures sit either side of that range. Build for the first and the second
finds the tool has been dumbed down and the thing they need is missing. Build for
the second and the first opens an instrument panel and concludes they are not
clever enough for it.

## Decision

**A surface exists when it holds something.** Disclosure is by emergence, never
by grade.

This is already the house rule and it is applied consistently: the place chooser
is hidden until a place has been named, because a chooser with nothing in it
teaches the reader the feature is broken; the roles readout has nothing to say
until an identity exists; `serves.ts` prints nothing above work that sits under
no horizon; a hub door exists only while something is behind it.

The consequence is the point. Somebody who captures things and does them sees a
box, one thing, and a way to sort. Somebody who has named lines, horizons, people
and meetings sees those, because they made them. **Nobody is told which of the
two they are**, and nothing is withheld from anybody — a surface that has not
appeared is one whose subject does not exist yet.

It also inverts the usual arrangement. In a product with an advanced mode, the
person who needs more has to go and find a switch. Here their own structure
summons the surfaces.

## What is refused, and why the obvious answer is worse

**An expert mode, an advanced toggle, or any setting that gates capability.**

- It is a setting somebody maintains, can set wrong, and must remember — the
  standing second artefact this product refuses everywhere else.
- It creates two apps to keep consistent, and the simpler one rots first.
- **It grades people.** The moment a control is labelled *advanced*, everybody
  who has not turned it on knows what that makes them. The failure it is meant to
  prevent is the failure it causes.

`Just one thing` is not a counter-example. It reduces what is on screen for a
hard day, it is turned on and off by the reader and never for them, and it gates
no capability.

## The known failure mode, named so it is designed against

Emergence has one characteristic defect: **if a surface only appears once the
structure exists, nothing announces that the structure is possible.** A
capability that is present and unannounced reads as absent, and the fix is
almost always a route rather than a build (hub LESSONS 182).

That defect accounts for seven findings in one week — the full held list behind a
door that said *see each*, the imported-set batch, kind conversion, the situation
filter, saving a situation, filing into a container, and the reverse walk along a
line. All built, none announced.

**So the rule has a second half.** Choose deliberately between:

- **Quiet** — a control with nothing to control is furniture and stays away. The
  reader is not stumbling past it, so it costs them nothing.
- **Explaining** — a destination somebody deliberately opened says what it is for
  and how it fills, rather than rendering blank. The attention readout does this:
  with no timed work it explains what fills it instead of hiding.

The gap between those two is where every one of the seven lived: neither hidden
nor explained, merely unannounced. **A surface is one or the other on purpose,
and a new one declares which.**

## What would overturn this

Evidence that somebody arriving with a real store finds the app bare because
their structure lives in their head rather than in it. The remedy would be making
structure cheaper to express at the moment work is handled, never a mode switch.
