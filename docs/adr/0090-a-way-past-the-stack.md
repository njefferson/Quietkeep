# ADR-0090 · A way past the stack, reachable by finger

**Status:** Accepted · **Date:** 2026-08-12 · **Shipped:** 2.0.8 · **Extends:** ADR-0089

## Decision

A visible control — **Go to what you are holding** — sits directly under the
offer and jumps to the held list, taking focus with it. It renders **only** when
at least one section is live above the list and the list has rows.

The document's `.skip` link is unchanged: it stays first in the document as the
bypass-blocks mechanism for keyboard and screen-reader users. This is the same
destination reached by the input method that had no way there.

## Why

**The affordance already existed and served nobody who uses a finger.**
`.skip` has said *"Skip to what you are holding"* since the first release, at
`left: -9999px` until focused. `#capture` carries `autofocus`, so it is not in
the forward tab order either — reaching it takes **three Shift+Tabs backwards**.
On the reference platform, an iPad, by touch, the app's own decision was
unreachable.

**Measured, on a full store (566 things, 523 held):** the held list begins
**2.8 screens down at 820×1180** and **4.5 screens down at 390×844** (first card
at 4.8). A light store of fourteen things still puts it 1.5 and 2.5 screens down.

**What the sections cost is not choice overload.** Entry 16 of the collision
catalogue marks that **Contested** — the classic finding replicates poorly — and
ADR-0060 already established the right variable: *"the distinction is not how
many things are shown — it is whether choosing requires a comparison."* The
sections are unalike by construction, so they are chosen between by preference.
A cap on their number would be the error ADR-0060 avoided once already.

**What they do cost is focality, and it corrects entry 3.** Entry 3 is the
catalogue's best-evidenced entry, cites Einstein & McDaniel, and reads *"visible
is the only kind of remembered."* The same authors' multiprocess framework says
visibility is not sufficiency: a **focal** cue — one overlapping what the reader
is already processing — triggers spontaneous retrieval with no monitoring, while
a **non-focal** cue requires top-down monitoring, and that monitoring produces
measurable costs to the ongoing task. Salience does not substitute for focality.

A section is focal for the reader who arrived asking its question and non-focal
for everyone else. Arriving with one question and passing eight sections that
answer other ones is the cost, and it is a cost the entry as written does not
predict.

## Consequences

- **It is conditional, and that is load-bearing.** On an empty store there is no
  list to send anybody to; on a quiet day nothing is in the way. It never greets
  a newcomer with an escape from a page that has nothing on it.
- **No threshold constant.** "More than N sections above the list" would be a
  tuned number pretending to be a rule. The condition is the one the reader
  experiences: is anything in the way.
- **Focus moves with the scroll.** `#cards` has carried `tabindex="-1"` for
  exactly this. A jump that scrolls without moving focus throws the next Tab
  back up the page.
- **`#menu-open` moved from document position 42 to 43** and the release notes
  declare it by name, first, in place-language (ADR-0076, `controls:check`).
- **The controls budget goes 213 → 214**, and this is the harder argument of the
  two kinds: it adds a control to the work surface rather than a way out of a
  sheet. What buys it is that the capability is not new — only reachable — and
  that the count is the worst case, since the control is conditional.

## What this does not change

- **Nothing is hidden and nothing is reordered.** The sections above the list
  are exactly as they were. This is a way *past* them, not fewer of them.
- **It ranks nothing.** Q-11 — *no feeling of being shown the right things* — is
  open, and NOTES says not to build past it on a guess. A jump to a fixed
  destination the app already chose presumes no answer to it.
- **The work surface is still one scroll.** Nine sections still stack to 2,715px
  above the list on a full store. Whether the everyday surface should be allowed
  to show that much at once is a different decision and it is not made here.

## What would overturn it

- **Evidence that the reader arrives for a SECTION rather than for the list.**
  Then the destination is wrong, and the answer is aiming rather than skipping —
  which runs into Q-11 and needs its answer first.
- **The control being present on ordinary days.** If the condition turns out to
  be true almost always, then it is furniture rather than a relief, and the
  honest response is to ask what the surface is doing rather than to soften it.
