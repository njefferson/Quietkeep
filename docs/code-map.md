# The code, for somebody who has never seen it

125 TypeScript files and roughly 22,000 lines of code under 19,000 lines of
comment. Those comments are worth their length — they are why this codebase
corrects itself — but almost every one of them is an INCIDENT HISTORY addressed
to a reader who is already oriented. This file is the orientation. It is the
only document here whose job is *what the shape is* rather than *what went
wrong*.

Read it before opening a source file. It is deliberately short, and it is
deliberately about STRUCTURE — no incidents, no release numbers, no defects.
Everything below is checkable against the code in one grep.

---

## One sentence

**An event is appended to a log; state is a pure fold of that log; every screen
is a pure projection of that state; nothing writes except through one gate.**

Every other rule in this repository is a consequence of that sentence.

---

## The five layers, in the order data moves

### 1. The vocabulary — `src/events.ts`

The closed list of every event the app can ever write, as TypeScript types. If
a noun is not here it does not exist. `docs/event-vocabulary.md` is the same
list in prose with a silent-risk column, and `npm run events:check` holds the
two identical in both directions.

Nothing in this app stores anything that is not one of these events.

### 2. The fold — `src/fold.ts`

`fold(log) → State`. Pure, total, and the only place a field on a node is ever
assigned. `NodeState` is defined here; so is `isAppClock`, which separates a
clock a PERSON set from a cure the gate wrote — a distinction several surfaces
depend on and none may re-derive.

Last-write-wins per FIELD, not per node, via `stamps` — two devices editing
different fields of one thing both keep their edit.

### 3. The write boundary — `src/gate.ts`

`admit(events, state, opts) → events`. **Nothing reaches the store without
passing through here.** It is where law 1 lives: an event that would leave a
node silent — on no surface, under no clock, not on the Menu, not parented to
something under a clock — is either refused or paired with a CURE that makes it
covered.

Also here: `heldNodes` (not trashed, merged or released), `heldWork` (the
subset that is WORK — the gauge, the todo list and the coverage rows all read
this one definition), and `whyCovered`, which names WHICH clause covers a node.
`whyCovered`'s clause ORDER is the answer, not an implementation detail.

### 4. The projections — the rest of `src/`

Pure functions from `State` to something a screen can render. No I/O, no DOM,
no writes. This is where most of the app's thinking lives:

- `held.ts` — the list, its groups, and `heldStatus`, the words for one row.
- `nextup.ts` / `offer.ts` — what to offer next, in tiers, and why.
- `pressure.ts` — the ONE decay primitive: `(last_done, comfort_window)` to a
  continuous number. `hasCadence` says whether a thing carries it at all.
- `gate.ts`'s `coverageProof` — the app's own evidence that law 1 holds.
- `search.ts`, `dated.ts`, `horizons.ts`, `review.ts`, `focus.ts`, `menu.ts`,
  `people.ts`, `delta.ts`, `diagnostic.ts` — one surface's question each.

**A projection never writes.** If you are in `src/` (not `src/ui/`) and you are
about to construct an event, you are in the wrong file.

### 5. The surfaces — `src/ui/`

Two kinds of file, and the split is strict:

- **`*-intents.ts`** — build events. They take a context and return an
  `AppEvent[]`; they do not touch the DOM and they do not commit. This is where
  a verb like "route this to Next action" turns into the events that mean it.
- **everything else** — render, and attach listeners that call an intent and
  hand the result to `session.commit`, which is what runs the gate.

`app.ts` is the shell: it mounts every surface and owns the device view
preferences (where you are, how long you have, who is with you) which are `kv`
values rather than events, on purpose — a trail of where somebody was is not a
fact about their work.

---

## Where the storage is

`src/dexie-store.ts` — IndexedDB via Dexie. `localStorage` is banned outright
and `npm run storage:check` enforces it. The store holds the LOG; it never
holds folded state, so there is no cache to invalidate and no migration that
can lose a field.

---

## How to answer the four questions you will actually have

**"Where does this screen's text come from?"**
Find the element id in `public/index.html`, grep it in `src/ui/`. The paint is
one assignment; the words are usually from a projection in `src/`, because copy
that a test must assert lives where a test can reach it.

**"What happens when I press this?"**
The listener is in `src/ui/<surface>.ts`, it calls something in
`src/ui/<surface>-intents.ts`, and that returns events. Read the intent — it is
the whole behavior, and it is pure, so a unit test can drive it with no
browser.

**"Why does it come back?"**
Something gave it a clock, or it is on the Menu, or its parent has one.
`whyCovered` in `gate.ts` will tell you which, and that function is what the
coverage sheet prints.

**"Can I add a field?"**
Additively, always. New event kind in `events.ts`, a case in `fold.ts`, and the
vocabulary doc in the same commit. Never change what an old event means — the
log is permanent and old events will be re-folded forever.

---

## The five things that will surprise you

1. **The comments are histories, not descriptions.** A shouted paragraph is
   usually the record of a defect that this code's shape exists to prevent.
   Read the first sentence for what it does; read the rest when you are about
   to change it.
2. **Order matters in `whyCovered` and in `heldStatus`.** They pick which of
   several true things to SAY, so the first matching clause wins and the
   sequence is the design.
3. **A clock is not always a demand.** The gate writes cure clocks; `isAppClock`
   is how every surface tells them from a date a person chose. Forgetting this
   is how a surface comes to claim a thousand things are ready.
4. **`heldNodes` and `heldWork` are different sets** and the difference is
   deliberate — a person, a place, a journal entry and the app's own resume
   bookmark are held but are not work.
5. **The tests drive the real gate.** `test/` builds stores by admitting events
   through `admit`, not by hand-constructing state. A test that assembles a
   `State` literal is testing nothing.

---

## Where the gates are

`tools/` — about thirty of them, run by `.github/workflows/spine.yml` and
locally by `npm run spine`, which reads that workflow so there is no second
list. `npm run spine -- --parity` asserts every npm script is either in a
workflow or declared in `.spine-exempt`.

The three that drive a real browser are `smoke.mjs` (the app walks),
`a11y.mjs` (contrast, axe, targets, focus rings, per state and both themes) and
`update-walk.mjs` (a genuinely second service worker).

---

## What this file is not

Not the product thesis — that is `NOTES.md`. Not the settled decisions — those
are `docs/adr/`. Not the research — `docs/nd-collisions.md`. Not what has
actually been verified — `docs/verifications.md`.

This file has one job: make those four readable by somebody who has not yet
found their way around the source. If it starts collecting incidents, it has
stopped doing that job.
