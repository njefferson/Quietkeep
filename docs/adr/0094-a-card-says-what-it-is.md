# ADR-0094 · A card says what it is

**Status:** Accepted · **Date:** 2026-08-17 · **Shipped:** 2.4.0 · **Answers:** the second half of the same device report as ADR-0093

## Decision

Every node kind gets **one reader-facing word**, defined once in
`src/kind-words.ts`, and it is stated first on a card's own line and first on the
detail sheet's state line.

`action` deliberately gets **no** word. It is the unmarked case.

## Why

Reported from a device, looking at the work surface:

> *"Nothing indicates that some of these are projects or goals or anything other
> than todos."*

That was exactly right, and it was true everywhere. The app has **fourteen node
kinds and had not one reader-facing word for any of them.** `kind` was a
discriminator the code branched on — `NOT_ACTIONABLE`, `DEMAND_FREE_KINDS`,
`CONTAINER_KINDS` — and it reached a reader nowhere at all. Searched before
building: no `KIND_WORDS`, no per-kind label, nothing in the picker, nothing in
the tree, nothing on a card.

What a row could actually say about itself was `placeWords`: *"in Boy Scouts"*
and/or *"7 under it"*. So:

- a **project with children** said `7 under it` — a number, not a name;
- a **project with none**, a **goal**, an **area** and an **outcome** said
  **nothing at all**;
- a loose action said nothing either.

Which means a goal and a loose to-do drew **identically**, and the whole surface
read as one long to-do list because that is precisely what it looked like. The
sheet was no better: its state line said *let go*, *on the Menu*, *done*,
*repeats every 3 days*, *comes back Thursday* — everything true about a thing
except **what it is**, which is the fact that decides how to read all the rest.

## Where the words come from

Each is the app's **own existing copy**, quoted rather than invented, wherever it
already had some:

- *Waiting for* — `clarify.ts`'s route label, to the letter
- *Upkeep* — its own section heading
- *Something on you* — the pebble form's label
- *Where you left off* — the title `focus-intents.ts` writes onto a resume card
- *A worry* — `bother.ts`'s own first line
- *A named period* — anchors are made under *Since when*, and each names a period
- *Project* / *Area* / *Goal* / *Outcome* — already the words the patch notes and
  the picker use in prose
- *A place* — a context is where work can be done (ADR-0092)

Inventing a second vocabulary for something the app already names is the app
disagreeing with itself, which is the defect ADR-0089 records for the word
*Menu*.

Two of these are decisions rather than transcriptions, and both are pinned by a
test:

- **`aspiration` is *A wish*, not *On the Menu*.** Being on the Menu is a
  separate fact the sheet already states, and an aspiration can be taken off the
  Menu and still be an aspiration — so naming the kind after the place it usually
  sits would be wrong in exactly the case where the difference matters.
- **`pebble` is *Something on you*, not *Pebble*.** In this app "pebble" already
  names the **weight** of one of these — *a pebble / a rock / a boulder* — and one
  word meaning two things on one screen is the same defect again.

## Why `action` gets no word

It is the unmarked case, and marking it would cost more than it buys. A to-do
row already reads as a thing to do; stamping *Action* on several hundred of them
adds a word per row and distinguishes nothing. This is also an app whose size
gate exists because nobody was counting how much there is to read.

The kinds worth naming are the ones a reader cannot tell from an action by
looking, which is every other kind — and `action` is asserted to be the **only**
wordless one, so a kind added without words fails the test rather than silently
joining the unmarked case.

## Consequences

- `Record<NodeKind, string | null>` will not compile if a kind is added without
  words. That is the same shape `MENU_WORDS` uses for Menu categories, and it is
  stronger than a test: it fails where the kind is added, not where the suite is
  run.
- `placeWords` changes shape for containers: `2 under it` becomes
  `Project · 2 under it`. `test/held.test.ts` was updated to assert the new
  string rather than being loosened.
- **No new control, no new class, no new colour pair.** The words ride in
  `.card-place` and `.detail-state`, both of which the contrast gate already
  measures — so this is covered from the first run rather than needing a registry
  entry, which is how `.card-where` and the detail placeholders each cost a
  release.
- Nothing changes for the overwhelming majority of rows, because most of them are
  actions and actions stay unmarked.

## What this does not do

It does not put the kind on the **tree** rows or on **search results**, both of
which have their own line and could carry it. Held cards and the detail sheet are
what the report was about; widening it is a separate change and should be made
when somebody is looking at those surfaces rather than bundled in here.

It does not make kind **changeable** from a card. *This is bigger than one step*
already converts an action into a project, and that remains the only kind change
the app offers.
