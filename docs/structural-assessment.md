# Structural assessment — at 3.24.1, 2026-09-14

**The question this answers:** is the app being structured, or is each cold
read being answered with the quickest fix for its problem set. It answers with
census numbers rather than adjectives, then gives an ordered remedy. It is a
working document for the sessions that execute the remedy; when a phase lands,
the release notes carry it and this file gets a one-line status under that
phase, never a rewrite.

**Where the numbers come from.** Five read-only census passes over the source
at `e32cc0c` against the hub at `2eb0724`: every place that derives a date
from `node.clocks`, every reader-facing count with its population, the coverage
precedence chain with its history verified against `git log -p`, every gate
reachable from the tree classified by what it protects, and all 98 cold-read
findings across seven reads classified by root cause. The raw census output is
not in the tree; each claim below names the file and line it was read from.

**Confidence limit, stated first.** The census was verified against source and
history. This reading of it was not adversarially refuted. Check the claim you
are about to act on before acting on it.

## The answer

Both, in different layers.

**Below the projection, the app is structured.** The event spine, the write
gate, the vocabulary and reversibility are one-record designs, and 3.24.1 read
its container choices from `CONTAINER_ORDER` rather than retyping them. Thirty
of the sixty gates test invariants.

**At the projection — where a node becomes a date, a sentence, a count or a
reason — every cold-read fix has been a problem-set fix.** Each landed on the
surface that showed the defect, was correct for that surface, and left the
sibling surfaces re-deriving the same answer their own way. The next read found
the next surface. The recurrence numbers below are the proof, and the cause is
one absence: there is no projection layer. Every surface reads `node.clocks`,
`node.lastDone` and `node.onMenu` directly.

## What is sound

- **Event spine.** Append-only log, state is a fold of the log, the vocabulary
  is the one list, migrations are additive, a snapshot is exported before any
  migration. Nothing stored that is not an event.
- **Write gate.** `admit()` in `src/gate.ts` is one boundary and it refuses a
  silent node. Law 1 has teeth in one place.
- **Intent record.** `isAppClock` plus `NO_INTENT_CURES` in `src/fold.ts` is
  the one place that says whether a person set a clock. The right shape; one
  entry is missing, below.
- **Reversibility.** Every action has an undoing event; no archive state; a
  passed date becomes a replan card rather than a bucket.
- **`CONTAINER_ORDER` as one record**, and 3.24.1 consuming it. That is the
  shape every remedy below reproduces.
- **The gate population.** 30 invariant, 12 compensating, 12 receipt, 6
  hygiene. The majority test laws.

## What is not, with the numbers

### 1. Dates: 32 derivations, 8 rules, 11 disagreements

Thirty-two places read `node.clocks` and answer "when does this come back", or
"is it back", or "what is dated today". They fall into eight incompatible
rules:

- soonest instant over due, start, suspense and review, park and app cures
  excluded (`src/held.ts` `soonestDemand` — the held list, search, sort, the
  empty offer)
- FIRST non-app clock in the fixed order due, review, start, suspense, park — a
  kind precedence, not soonest, park included (`src/ui/work.ts` `rowClock` —
  the coverage sheet)
- due, else review, else start, with no app-clock filter, no park, no suspense
  and no past-date guard (`src/ui/detail.ts`, the state line — a thing's own
  page)
- calendar kinds only, review never counted even when the reader set it
  (`src/clock.ts` `datedTodayCount` and `nextFixedToday`; `src/ics.ts`
  `soonestAt`)
- calendar kinds plus reader-set review, ALL of them rather than one
  (`src/ics.ts` `everyReaderClock` — so The days ahead lists one node twice
  and labels a review row "due")
- due else suspense, by kind (`src/today.ts` printed card, `src/delta.ts`)
- suspense else due, by kind (`src/dependencies.ts` `commitmentAt`)
- park compared as an instant rather than a calendar day (`src/range.ts`
  `parkedAndBack`)

Four functions turn a date into words and disagree at the edges: `held.ts`
`clockDayWords`, the one inside `work.ts`, `dated.ts` `datedDayWords`,
`replan.ts` `contextWords`. One prints a past date for a passed clock; another
prints "ready now" for the same clock.

The seventh cold read's date finding reproduces from source. The review clock
that sorting sets on a next action is a cure by intent but is not on
`NO_INTENT_CURES`, so `isAppClock` calls it the reader's; the held list (rule
one) shows tomorrow while the sheet (rule three) shows the due date. **The
intent record is the one record, it is incomplete, and nothing asserts its
completeness.** That is the structural defect under the surface one.

The fix chain that got here: 3.23.17 (the box reads one clock kind), 3.23.28
(the comparison never taught, eleven releases), 3.23.22 (the view hides
reader-set review), 3.23.27 (`soonestAt` one clock per node), then read 7 (two
surfaces untouched). Six findings, three recurrences, and the open one is the
worst in the record. Every fix taught one reader and left another.

### 2. Coverage precedence: one function, six rounds of the same mistake

`whyCovered` in `src/gate.ts` runs decided, merged, menu, done without a
cadence, then any clock split into cure or clock by `isAppClock`, demand-free,
parent walk, after, null. Its docblock counts five ordering rounds. History
shows six: 3.23.3 (done before clock in `detail.ts`, uncounted), 3.23.6 (menu
before clock in `detail.ts` and `work.ts` — the docblock and
`test/coverage-proof.test.ts` attribute this to `heldStatus`, which that commit
did not touch), 3.23.8, 3.23.16, 3.23.29, and the origin in 1.42.0, which
copied `isSilent`'s clock-first order from a function where order is harmless
because it is a disjunction.

**Three restatements of the chain are live and disagree today.** `heldGroups`
and `heldStatus` in `src/held.ts` put done before menu; `whyCovered` puts menu
before done. Untested. Fix shapes across the six rounds: reorder twice, insert
a branch three times, add a reason twice. The only fix that removed a
restatement rather than patching one was 3.23.16, which made `work.ts` call
`whyCovered` instead of restating it. Totality is tested only trivially and
order is not tested across restatements.

Across the cold reads: six findings, four of them recurrences of a shipped fix,
all one function's one mistake. Read 7's "It arrived" leaving the row stamped
is the same shape on a different state. The purest recurrence in the record.

### 3. Counts: two populations, one sheet

`heldNodes` (`src/gate.ts`; not trashed, merged or released) and `heldWork`
(`heldNodes` minus person, pebble, journal, anchor, context, role, resume
card). One ⓘ sheet prints both and they differ by exactly the seven excluded
kinds: the seventh read's 14 versus 15. "N dated things are ahead" counts
(node, clock) pairs, because `calendarEntries` with `includeSoft` emits one
entry per reader-set clock and `app.ts` sums the rows: 9 over 7 items. Three
incompatible definitions of "under" across the ready card, the horizons and the
sort picker. Re-entry and purge count arrived imports that the sorting screen
excludes. One count-versus-act gap: "This clears N things" states `heldNodes`
while `clearEvents` in `src/purge.ts` also trashes merged-away and released
nodes.

Across the cold reads: thirteen findings, seven recurrences, five open. The
largest recurring class by volume. The root is the app's own records being
counted among the reader's things, and the fix landing on the word or on one
surface. 3.23.6 changed "held" to "here" and the number did not change.

### 4. Reachability: a gate that passes where the defect cannot occur

A live region shipped visually hidden three times: `#detail-live` (read 3),
`#triage-live` (found while fixing, 3.23.11), `#nextup-live` carrying 3.23.28's
fix (class `visually-hidden` in `public/index.html`). Read 7's "Not this
produces no visible change" is that. The a11y walk measures states where the
sentence is spoken and never asks whether it is seen.

### 5. Gates: twelve exist to hold two hand copies together

The twelve compensating gates name eight duplications, each with a one-record
retirement:

- the hub pin in both `.doctrine-sync` and `spine.yml` — read the pin
- the release triplet in `changelog.ts`, `CHANGELOG.md` and the `sw.js` cache
  name — generate two of the three
- app labels retyped into four help surfaces — have `paths.mjs`, `manual.mjs`
  and `tour.ts` import `kind-words.ts`, `tree.ts` and the route table
- `a11y.mjs`'s hand REGISTRY versus the page's sections and dialogs — derive
  the audit set from the rendered page
- `EVENT_KINDS` in `events.ts` versus the vocabulary's §3 list — put
  descriptions and the silent flag in the record and generate §3
- two `REASON_WORDS` records (`nextup.ts`, `work.ts`) — one
  `src/reason-words.ts`, totality returns to `tsc` (hub LESSONS §274)
- `src/plain.ts`'s keep/strip list versus the card's ids — a `data-plain`
  attribute and generated CSS
- `docs/adr/README.md` versus the ADR files — generate the index

Two cannot fully retire and say so: `manual-coverage` (prose) and
`privacy-mirror-check` (the offline copy is forced; it can become a generated
file with a receipt). `branch-state` is the purely gratuitous one: `NOTES.md`
hand-types two versions git already answers.

Two side findings. `tools/hooks/tour-fresh.sh` is on disk and declared
nowhere, so it runs nowhere. `zizmor` does not run for this repo: the hub
workflow defaults it off and `spine.yml` does not enable it.

### 6. The shipped page is 59 percent commentary

`public/index.html`: 243 comments, 136,568 of 231,411 characters. Nearly all
of it is incident history addressed to somebody already oriented, which is the
reason `code-map.md` had to be written. Every reader downloads it on every
install.

## The remedy, in order

Each phase is a staged release or a run of them. Every product change waits
for the on-device pass and an explicit promote (Doctrine §7). Push before
anything long. Mechanical phases go to a cheaper model in a subagent.

### Phase 0 — the six dead ends from read 7 that do not wait on architecture

One fix, one test planted red, one release note each. Nothing here touches the
projection.

- The undeletable item created by a multi-line paste (the wall).
- The dead `#nextup-title` button.
- The interruption route with no way back.
- "It arrived" leaving the row stamped Waiting for.
- The Someday default reading "Read".
- Hot and cold not revisable.

Cost: one or two releases, three walks each. Cheap, and these are what a
reader hits today.

### Phase 1 — one reading per node

Create `src/reading.ts` and record it in an ADR. One function,
`readNode(node, ctx)`, returns one record: the clock it comes back on (kind,
instant, whether a person set it), the coverage reason (from `whyCovered`, the
same chain, never a copy), whether it is dated today, and the words for the
date. Every surface consumes the record.

Steps, each its own commit:

- **Complete the intent record first.** Every event that writes a clock names
  its intent; a record keyed on intent says app or reader; `tsc` refuses a
  missing key. The sorting-screen review clock is the entry that is missing.
  Test: the seventh read's scenario as a unit test (review tomorrow from
  sorting, due in two months) with both surfaces expected to say the same
  thing.
- **Characterize before changing.** A fixture corpus built from the eleven
  disagreements and the six precedence incidents, and a test that records what
  each of the thirty-two derivations returns today. A ledger, not yet red or
  green.
- **Decide the rule once, in the ADR.** Recommendation: rule one, soonest
  reader-set clock with park and cures excluded, then the soonest cure if there
  is no reader clock, and never a passed clock rendered as future. It is what
  the held list already shows and what the cold reads read first. Each of the
  eleven disagreements becomes a test case with the rule's answer.
- **Replace the thirty-two sites one at a time.** Each commit deletes one
  derivation, points its characterization expectation at the rule, and runs a
  walk only if the rendered output changed. The four date-to-words functions
  collapse into the one in the record.
- **The structural gate.** A test that fails on any read of `.clocks` in
  `src/` outside `reading.ts`, `gate.ts` and `fold.ts`. An invariant, not a
  compensating gate: it asserts the layer exists rather than holding copies
  together. Plant it red by adding one read to `detail.ts`.

### Phase 2 — one precedence chain

Export the chain as one ordered array from `gate.ts`. `heldGroups`,
`heldStatus` and the detail sheet's state line derive from `whyCovered`'s
reason; delete their restatements. Test over a generated corpus of every flag
combination (decided, merged, menu, done, cadence, each clock kind as app and
as reader, parent, after): every node gets a reason, the reason is the first
true clause in the array, and each group is the group of its reason. Plant red
by swapping two entries. Correct the docblock to six rounds and the
misattribution to `heldStatus`.

### Phase 3 — one population per count

A `population(kind)` function in `gate.ts` and a stated unit for every
reader-facing count. Recommendation: the ⓘ sheet prints one number,
`heldWork`, with the clear-out line saying what else goes; "N dated things
ahead" counts nodes; the three "under" definitions become one. Test: every
count string's number is produced by a population function, and the census's
confirmed pairs become the cases. Close the purge count-versus-act gap in the
same phase.

### Phase 4 — the reachability gate asks whether it is seen

Each live region carrying a reader-facing sentence is either visible or paired
with a visible sentence, asserted per state in `tools/a11y.mjs`. Plant red on
`#nextup-live` as it ships today.

### Phase 5 — retire the eight duplications

One per commit, in the order listed above; delete the gate only after the
second copy is gone. Delete `tools/hooks/tour-fresh.sh`. Enable `zizmor` in
`spine.yml`. Mechanical.

### Phase 6 — halve the shipped page

Strip comments from `public/index.html` in the deploy step and verify with
`deployed:check` by content. Stop adding incident prose to the page; incidents
go under `docs/` keyed by surface, never into `code-map.md`, which stays
shape-only by its own rule. Mechanical.

## Then

An eighth cold read against production, two agents, expecting zero findings in
the classes coverage-precedence, date-derivation and count-population. That is
the measurement of whether the structure held. If any of those three classes
returns, the layer is incomplete, not the surface.

## Do not

- Re-run the census. Each claim above names its source; re-derive one claim,
  not the census.
- Start Phase 1 as a rewrite of all thirty-two sites at once. One per commit,
  each pushed before the next walk.
- Let a phase end at a seam without saying so in the first line.

## Decisions that are the owner's

1. The date rule. Recommendation: rule one (soonest reader-set clock, park and
   cures excluded), because it is what the held list already shows. The
   alternative is rule three (the hard date first), which is what the sheet
   shows today.
2. The ⓘ sheet's count. Recommendation: one number, `heldWork`, with the
   clear-out line naming what else goes. The alternative is both numbers, each
   labeled with its population.
3. Phase order. Recommendation: Phase 0 first, because it is cheap and is what
   a reader hits today. The alternative is Phase 1 first.
