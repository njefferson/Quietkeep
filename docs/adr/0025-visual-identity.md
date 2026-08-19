# ADR-0025 · The mark is drawn as SVG; the social background is generated

**Status:** Accepted, and **the mark it chose is now known to fail its own rule** ·
**Date:** 2026-07-28 · **Finding added:** 2026-08-19

> **The drawn mark reads as a prison cell.** A warm arched form inside a dark
> rounded square, on four sides. Reported from use.
>
> This record already rejected a candidate whose silhouette — round top,
> straight sides, flat base — read as a **headstone**, and called that "the worst
> reading available for an app whose promise is that nothing you put in is lost".
> The fix below made the outer form a rounded square and kept the arch "only in
> the warm opening". **So the disqualifying silhouette was never removed; it was
> moved inward and then enclosed.** For an app whose users are people who feel
> trapped by what they are carrying, a cell fails for the same reason the spiral
> does.
>
> **And there is an argument that it is worse than a cell — an inference, not a
> measurement.** `docs/nd-collisions.md` entry 3 — the thesis, and the
> best-evidenced entry in the catalogue — is that *a thing that leaves the visual
> field leaves existence; visible is the only kind of remembered; filed means
> gone*. Read against that, a warm form shut inside a dark box is a picture of
> something put away where it can no longer cue you. Against the reading: the
> intent was a *lit opening*, and light coming out of a shelter is not a lid going
> on. **Both readings are available, which is itself the problem with the mark.**
> Either way a replacement is briefed on *stays in view*, not on *held safely* —
> which retires vessels, cradles, boxes and stacks as a family.
>
> **The enclosure is ENTAILED BY THE COLOUR, and there is no bug under it.**
> `--warm` is `#7A4E00` in light mode and `#F5C978` in dark. On the icon's paper
> field `#F4F1E9` those measure 6.38:1 and 1.38:1, so `#F5C978` cannot describe a
> shape on paper and any mark carrying it must supply a dark ground — which is the
> box. That constraint is real, and it is why every open composition attempted in
> that amber failed on contrast before it was judged on taste.
>
> **This paragraph previously said the icon was using the dark-mode value on a
> light ground — "a colour error" — and that was FALSE.** Measured on the rendered
> artwork: 82% of the amber's border is the navy `#33425F` and the remaining 18%
> are antialiasing blends between the two; **it touches the paper field nowhere**,
> and sits on navy at 6.48:1. The mark is internally correct. The earlier figure
> that suggested otherwise came from a probe counting blend pixels as *not navy* —
> a tolerance artefact read as a finding, and committed to this record on the day
> it was hunting exactly that kind of defect. **There is no token to fix**, so a
> replacement that must not enclose has to change the COLOUR, not the geometry.
>
> A replacement is OPEN, not decided. Six directions have been tried and every
> one collided with a well-known glyph — see
> [`docs/brand-collisions.md`](../brand-collisions.md), which is the checklist to
> work from and is the durable part of that attempt. The reasoning in this record
> about geometry versus illustration, about three flat colours, and about
> measuring rather than eyeballing all still stands and binds any replacement.

## Decision

Quietkeep's identity is **a warm opening within a sheltering form** — a doorway in a wall,
lit from inside.

- **The icon is [`public/brand/icon.svg`](../../public/brand/icon.svg)**, hand-drawn
  geometry, three flat colours, no gradient, no shadow, no transparency. Every PNG the app
  ships is rendered from it by [`tools/brand.mjs`](../../tools/brand.mjs).
- **The social-preview background is a generated image**, composited with the wordmark and
  tagline set as **real text**, never generated glyphs.
- **The palette is recorded in [`ACCESSIBILITY.md`](../../ACCESSIBILITY.md) B-10** with its
  measured ratios, and `tools/brand.mjs` is the gate that keeps them true.

## Why

**Icons are geometry; backgrounds are illustration.** That line is where generation earns
its keep and where it does not. A background wants atmosphere, depth, and imperfection — a
model is very good at those. An icon wants exact contrast, exact proportion, and legibility
at 48px, and none of those can be asked for; they can only be measured after the fact and
re-rolled. Drawing the mark makes the small-size question answerable instead of a lottery,
and SVG is text, so the identity is diffable and reviewable like everything else here.

**Three generated icon candidates were rejected, and their failures are the useful part:**

- **Thin spiral** — The stroke and its gap both vanish at 48px. Reads as an **@ sign**, and is one frame from a loading spinner. **And it spirals** — see below, which is the disqualifying reason.
- **Bold loop** — The best *idea* of the three — something leaves and returns, which is the product. Same **@ / spinner** collision, a drop shadow that muddies at small sizes and breaks on light surfaces, and **the same spiral problem**.
- **Lit opening** — The right idea and the right bones. But the outer form was **slate on navy**, a luminance step small enough that at 48px the form disappears and only the amber survives; and its silhouette — rounded top, straight sides, flat base — **reads as a headstone**. For an app whose entire promise is that nothing you put in is lost, a grave marker is the worst reading available.

The drawn mark keeps the third one's idea and fixes both faults: the wall is a **rounded
square** — a wall, not a marker — and the arch now appears only in the warm opening.

**No spiral, and that rule outranks every legibility argument above.** Settled on
what the shape MEANS rather than on how it looks — the objection was never that
the curve was ugly.

That is the whole reason, and it is not a matter of taste. **A spiral is loss of control.**
It is the shape of a thing tightening inward with no way out, and the word carries anxiety
with it wherever this app's users hear it. Quietkeep exists precisely because control has
been lost — that is the condition it meets people in — so putting the loss on the front
door tells them the app is the feeling rather than the answer to it. However elegant the
geometry, that is a voice failure, and the voice rules do not bend for a nice shape. The
same rule that killed *wince* kills this.

This generalises, and it is why the check order gains a step. **A mark has to be checked
against the audience's own vocabulary, not only against other logos.** Every check run on
those two candidates was a *collision* check — does this look like another brand, another
icon, a spinner. None asked what the shape *means to the people who will use it*. That is
the visual equivalent of never saying the name aloud.

**The two background candidates split on something that had nothing to do with quality.**
The rejected one — scattered dots on curving arcs — is arguably the cleaner image, and it
reads as an **orbital diagram**. That is *clear-horizons*' visual language, the astro app in
the same family and on the same hub. Two of these apps must not look like one of them.

The chosen one is objects set down on quiet ledges with one small warm light: the epigraph
as a picture. *It holds the rest, so you can rest.*

## Consequences

- **The renderer is a gate, not a script.** `tools/brand.mjs` runs in CI and exits non-zero
  on any failure. It was **made to fail once before being trusted** (Doctrine §6): dropping
  the shelter toward the field colour produced `1.41:1` and exit 1.
- **It measures the plate, not the glyphs.** The first version of the text-contrast check
  sampled the finished image and reported `1.00:1` — it was reading the type against itself.
  It now renders the composite with the text hidden and measures against that. An instrument
  that measures itself is not measuring anything.
- **`playwright-core` is pinned to 1.56.0** against chromium revision 1194 — a matched pair,
  recorded with its reason in `package.json`. See the hub's LESSONS §8.
- **iOS gets an opaque icon**, because iOS composites transparency onto black.
- **The maskable icon's safe zone is asserted**, not assumed: the artwork's furthest painted
  point is ~199.8 from centre, inside the 204.8 radius Android crops to.
- **No red, no amber in the identity.** `--light` is the one warm colour and it means *lit*,
  never *late*. B-01's no-red-walls rule is a palette rule too — a colour that means
  "attention" in the brand will eventually mean "you failed" in the UI.
- **The field is light and the wall is dark, and that inversion was forced by arithmetic.**
  A requirement: something less dark. Paling the whole mark is impossible: the three-step
  ladder needs ~9:1 of range, so a light field leaves nowhere for the light to go — every
  lift-everything variant failed at 2.0–2.4:1. Inverting the wall keeps the opening reading
  as *lit*, and it measured **better**: 8.92:1 / 6.48:1 against the old 3.34:1 / 3.45:1.
  Recorded in `ACCESSIBILITY.md` B-10 with the rejected variants.
- **No spiral, ever**, per the rule above. It belongs with *no red walls* and *no streaks*
  as a thing the identity structurally cannot say.
- The app shell does not exist yet, so nothing consumes these icons. They are ready for the
  manifest the day Phase 1 lands.

## What would overturn it

The mark failing on a real device at real size — an iPad Home Screen is the reference, and
nobody has seen it there yet. Nothing about the SVG-not-generated decision, which is about
which tool suits which job.
