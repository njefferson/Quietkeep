# ADR-0106 · The app has no pronoun for anybody, and that is why there is nothing to configure

**Status:** Accepted · **Date:** 2026-08-21

## Decision

**The reader is *you*. Another person is their *name*. Where neither works, the
answer is *they*.**

No pronoun preference is collected for the reader, and no pronoun field is
collected for the people a reader records. `tools/voice-pronouns.mjs` asserts
both halves against every shipped string: no gendered third-person pronoun
anywhere a reader can see, and the app's own voice addressing the reader as
*you* rather than as *the user*.

## Why

### The question was whether to build a setting, and the measurement answered it

Asked out of a concern that reaches past neurodivergence and accessibility to
marginalised readers generally: should the app let a reader set how it addresses
them? A setting is the obvious answer, and it is the wrong one here — not on
principle, but because of what the app turned out already to be.

Measured on 2026-08-21, before answering:

- **Zero gendered third-person pronouns in any shipped string.** Not one, across
  7,213 string literals in 114 source files and the visible text of both pages.
- **The reader is addressed in the second person throughout.** There is no
  pronoun for the reader to get wrong, because the app never reaches for one.
- **A recorded person is rendered by name.** `peopleWords` (`src/people.ts`)
  takes a *count*, not a person. There is no code path in the app that can
  generate a pronoun for anybody, so there is no defect to configure away.

### Not collecting the datum is stronger than collecting it correctly

A setting for the READER has nothing to set: second person needs no pronoun.

A pronoun FIELD for recorded people is a different proposition, and it is the one
that can cause the harm it is meant to prevent. It is a fact about a third party
who is not present, that the reader must maintain, that is silently wrong the
moment it is stale or was guessed from a name, and that the app has no use for
today. A field that is wrong is worse than a field that does not exist, because
software repeats a wrong field confidently and forever.

This is the same posture the app takes everywhere else — no accounts, no
telemetry, no server-side user data, no inference about a person from their logs
(law 7). The reason is identical each time: **the safest handling of a sensitive
datum is not to hold it.**

### *They* is the escape hatch and it costs nothing

If a surface later genuinely needs the third person for a recorded person —
something the app does not do today — *they* is correct, is never wrong about
anybody, needs no field, and requires nothing of the reader. That is the
answer, and it is written here so that a later surface reaches for it instead of
reaching for a form field.

### The property already held, and nothing asserted it

This is the shape that has cost this repo most. `data-door` went stale in a day.
The target audit's list of element types hid four undersized controls for months.
The a11y walk's list of surfaces went stale silently. Two days before this
record, a public repository turned out to carry 787 references to a real person
that every existing gate reported clean.

Each was a property everybody assumed and nothing checked, and each stayed true
right up to the commit where it quietly stopped being true. A gate written while
the tree is already clean costs one file and holds the promise permanently; the
same gate written after a pronoun ships costs a release and an apology.

## Consequences

- `tools/voice-pronouns.mjs` runs in the Spine and on `npm run check`. Both rules
  were watched going red on a planted violation and green with it removed, per
  the standing rule that a gate nobody has seen fail is a hypothesis.
- **The exemption, stated rather than hidden:** rule 2 does not apply to
  `public/why.html`. That page is a design essay *about* the product, addressed
  to somebody deciding whether to trust it, and "the user" there names the
  population an argument is about. That is a different act from the product
  speaking to the person holding it. **Rule 1 has no exemption anywhere** — a
  gendered pronoun in the essay would be as wrong as one on the offer card.
- **This decision is revisitable and the trigger is named:** if a surface is
  built that must refer to a recorded person in the third person, and *they*
  proves genuinely insufficient for it, that is the moment to reconsider — not
  before, and not because a form field would be easy to add.
