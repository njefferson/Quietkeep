# Structural assessment — at 3.24.1, 2026-09-14

**The question this answers:** is the app being structured, or is each cold
read being answered with the quickest fix for its problem set. It answers with
census numbers rather than adjectives, then gives an ordered remedy. It is a
working document for the sessions that execute the remedy; when a phase lands,
the release notes carry it and its line in the STATUS section below is brought
current, never a rewrite. **The status is in one place, not under each phase** —
this document's own subject is what it costs to keep two copies of one fact.

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

**Plan of record.** One of the two documents that decide what gets built here —
[`NOTES.md`](../NOTES.md) names both — and held by
[`tools/roadmaps.mjs`](../tools/roadmaps.mjs): every item in the STATUS section
names its state, a state saying done, refused or moot names the release or the
record that makes it so, and this file cites the other plan because they
conflict.

## STATUS — measured 2026-09-16, at 3.26.0

**Nothing held this file when it was written, and it carried no status line
under any phase for two days.** Its own rule below said each phase would get
one when it landed; three of Phase 0's six items had landed by then and the
file said nothing. **Phase 0 is finished as of 3.26.0** — the other three went
in the release that brought this line current, which is the rule working rather
than a coincidence. The status lives here, at the head, in one place — a second
copy under each phase is the duplication this document spends six pages
counting.

Phase 0's six dead ends first, one line each, then the six phases.

- **The undeletable item made by a multi-line paste — DONE, 3.24.3.** The sheet
  title scrolls instead of growing past the screen (`public/app.css:2119`),
  whose comment carries the repro. A smaller residual is named in that release:
  at 320px and 200% text one button still sits about twelve pixels below the
  sheet edge.
- **The dead `#nextup-title` button — DONE, 3.24.6.** It is plain text on the
  empty branch now (`src/ui/work.ts:1005`) rather than an underlined,
  button-height control that did nothing when pressed.
- **The interruption route with no way back — DONE, 3.24.6.** `leftFrom`,
  `paintReturn`, `leaveToCapture` and `returnToStance` in `src/ui/hub.ts`, with
  3.24.7 stripping the offer on the worst day, where the place it points at is
  itself put away.
- **"It arrived" leaves the row stamped Waiting for — DONE, 3.26.0.**
  `nodeWords` in `src/kind-words.ts` is `kindWords` plus the one fact that
  supersedes a kind: a `waiting-for` carrying a `waitingOutcome` reads
  **Arrived**, in `log-words.ts`'s own word for the act. The row, the tree and
  the sheet share the one function, so they cannot drift into three
  vocabularies, and `waiting.opened` clearing the outcome puts the word back
  with no second rule. What it was: `kindWords` applied
  `'waiting-for': 'Waiting for'` unconditionally and its four consumers — `src/held.ts:537`, `src/ui/detail.ts:692` and `:735`,
  `src/ui/work.ts:1361` — none branch on the arrival. [ADR-0040](adr/0040-the-person-lens.md)'s *Arriving is not
  finishing* says an arrival takes the thing off what you are owed, keeps its
  clock and does not mark it done — the right call, and it never reaches the
  word printed on the row. 3.23.30 closed a different half of it: an arrived thing lingering under
  *With other people*.
- **The Someday default reads "Read" — DONE, 3.26.0.** The card asks once, with
  the six answers rendered from `MENU_CATEGORIES` and `MENU_WORDS` rather than a
  fourth hand copy, and a way past that names where the thing goes if you take
  it. The shape is the one `docs/nd-collisions.md` entry 26 names in terms — a
  two-tap choice at the moment the heat pass already asks one, not a new
  surface, not a rank, not a requirement — and entry 27 is why the way past
  exists at all. `reference` still writes `read` deliberately: reference
  material genuinely is for reading, so the defect was only ever the Someday
  default. **The return to altitude found one tension and it is recorded in
  entry 26 rather than smoothed over:** that route used to be one tap and is now
  two, since the way past is itself a tap, where the detail sheet's 2.23.0
  reading of the same entry kept the common case at one.
- **Hot and cold not revisable — DONE, 3.26.0.** Hot and Cold are on every
  thing's own page, writing the same `heatEvents` the pass writes and carrying
  the same two hints, and the sheet says which answer was given in the phrase
  the offer card already used. The two release notes below are true as of that
  release. What it was: `heatEvents` has exactly one call site in the app
  (`src/ui/clarify.ts:743`), inside the pass that `needsHeat` gates on
  `n.heat === null` (`src/triage.ts:62`), so the question is asked once and never
  re-offered; `clarify.reopened` resets the route and not the heat
  (`src/fold.ts:1600`). `src/ui/detail.ts` and `src/ui/detail-intents.ts`
  contain **zero** references to heat. Meanwhile 1.39.3 told the reader
  *anything can still be marked hot or cold from its own sheet* and 2.38.0 said
  it again — a control the sheet has never carried, promised twice in patch
  notes the app renders. Building the control was the remedy rather than an edit to the
  record, because the record described the right app.
- **Phase 1, one reading per node — OPEN.** `src/reading.ts` does not exist and
  the thirty-two derivations stand.
- **Phase 2, one precedence chain — OPEN.** `whyCovered` is still a function
  (`src/gate.ts:316`) rather than an exported ordered array, so the restatements
  have nothing to derive from.
- **Phase 3, one population per count — OPEN**, and read
  [ADR-0113](adr/0113-the-pile-is-counted-the-person-is-not.md) before starting
  it: no `population()` exists yet, and that record settles what a count may
  measure, which is the point this document and the design roadmap disagree on.
- **Phase 4, the reachability gate asks whether it is seen — DONE, 3.24.8.**
  Asserted by `tools/live-check.mjs` and `tools/announce-check.mjs` under
  [ADR-0126](adr/0126-one-sentence-one-region.md), and where the phase specified
  a per-state assertion inside `tools/a11y.mjs`, what landed reads the markup
  statically instead — wider in population, thirty-six live elements rather than
  the ten a state list reaches, and narrower in that it reads the document and
  not the rendered screen. Its residue is a different class and is recorded in
  3.24.8: two screens say nothing at all where a sentence is owed, which no
  visibility rule can find.
- **Phase 5, retire the eight duplications — OPEN**, two parts landed and
  neither finished. `tour-fresh` was unwired from `.branch-guard` on 2026-08-27
  and `tools/hooks/tour-fresh.sh` is still in the tree. `zizmor` stays off by
  the hub's call, not this repo's, which `spine.yml:70` records.
- **Phase 6, halve the shipped page — OPEN** and untouched.

**And read [`what-it-should-be.md`](what-it-should-be.md) beside this, because
the two disagree.** Phase 3 above standardizes the reader-facing count that
document's third item proposes deleting — an item ADR-0113 refuses, so this one
is the live reading. Phases 1 and 2 consolidate the coverage invariant its
second item proposes replacing, which makes that restatement cheaper afterwards.
Neither document named the other until 2026-09-16.

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
