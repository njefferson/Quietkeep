# The situated app — the plan v1 was always meant to reach

**This file is the plan and the resume point.** The previous V2 plan lived in a
session file and only its shipped parts ever reached this repo (`NOTES.md`,
under the 2026-08-04 approval entry). That session is gone and the plan with it.
This one lives here, and the state block at the bottom is updated in the same
commit as the work it describes, so a session that stops mid-phase leaves
something the next one can read instead of reconstruct.

## Why

Fourteen situations were put to the app on 2026-08-21, from opening it to use it
and stopping at the door:

- what can I do where I am right now
- what do I need in front of me during a recurring meeting
- what is between me and this person who just walked in
- what could I do with a free weekend
- what is on my plate, enough to decide whether to finish early
- is there anything to follow up with anyone about
- is anyone waiting on something from me
- have I moved toward a long-running goal lately
- what needs planning rather than doing — *get oil change* is not an action
- what did I miss while I was away, and how do I get current
- which lines of work have projects under them, and which have none
- what can I do in a spare twenty minutes with no preparation
- what matters to me and to the people who matter to me, person by person
- what could I do that would actually help, rather than what I owe

**Thirteen of the fourteen are queries against a situation, and the app has one
answer: one thing, chosen for you.** That is not fourteen missing features. It
is one missing concept, met fourteen times.

It is not a contradiction of the thesis. Entry 3 — a thing that leaves the
visual field leaves existence — requires that work come back on its own, and a
view does not stop that. What happened is that *browsing* was correctly named as
the enemy and then every way of seeing got treated as browsing. Browsing is
aimless. A situated view has a question attached, and the question is
answerable: where am I, how long have I got, who is here, what is left today.

## The finding that reorders everything

**No session of real use has ever gone past a fresh import or a handful of
sample items.** Every release has been verified against gates and not once
against use. The single time this repo held real data it was a diagnostic taken
from an imported store, not from a day's work.

The reason was already in the codebase. **On a fresh import there are on the
order of a thousand actions and zero contexts, zero roles, zero areas, zero
goals, zero people.** An unlabelled node fits everywhere, and that default is
load-bearing and correct (`src/contexts.ts:15-25`) — so with no contexts
defined, `fitsHere` admits everything and the place filter does nothing. The
horizon layer has nothing in it. The person lens has nobody. The offer is drawn
from a wall of undifferentiated actions, which is exactly the condition entry 1
describes: a long list raises the activation threshold.

**The machinery is built and has nothing to work with**, and the gap between
those two has never been crossed because crossing it is precisely the work the
app refuses to demand up front — correctly, since a setup wizard is a demand
(entry 8) and an afternoon of labelling is planning-as-procrastination (entry
18). The consequence has been an app that cannot be entered.

## What is already built and not wired up

Measured, not assumed. Each claim carries its source.

- `outcome`, `area`, `goal` and `aspiration` are in `NODE_KINDS`
  (`src/events.ts:24-43`), `CONTAINER_KINDS` (`src/tree.ts:26`) and `ALTITUDE`
  (`src/serves.ts:61`), and have **no creation route at all**.
  `docs/horizon-models.md:44` records that `outcome` holds zero nodes.
- The decay primitive is **already kind-agnostic**: `pressureOf`
  (`src/pressure.ts:50-82`) never reads `n.kind`. It is confined to `upkeep`
  only because `upkeep.interval.set` is the sole writer of the two fields it
  needs.
- `src/review.ts` **already computes** stalled, orphaned, unfed-goal and
  quiet-area readings, exceptions-first and capped at three.
  `docs/horizon-models.md:206` names the unbuilt half exactly: feeding these
  into surfacing.
- `personView` (`src/people.ts:65-93`) already separates what a person owes from
  what they are jointly in. It has no screen.
- *Where you are* is **finished and persisted** — a pure predicate (`fitsHere`,
  `src/contexts.ts:61-66`), a device kv preference read at boot
  (`src/ui/app.ts:1423`) and written at `:1453`, narrowing both the held list
  (`app.ts:306`) and the ranked offer (`work.ts:553-564`).
- The delta report (ADR-0041) cut at demand-free anchors (ADR-0068) already
  answers *what moved under this since*.

## The constraint that shapes the horizon work

`docs/horizon-models.md:214-221` **already refuses** the obvious implementation
by name — promote-buttons for empty altitude nouns, the full tree as a landing
view, alignment theatre — and calls the empty nouns the bill for the last time
it was ignored. ADR-0013 settles the alternative: **the clock goes on the
artifact instead of the ritual on the person.** A horizon node carries a review
clock on the one decay primitive and comes down when it is ready.

**No promote button. No climb-to screen. No altitude workspace.** The mountain
comes down.

## Non-negotiables

- **Nothing personal about the owner lands in this repo**, including the
  third-person half that carries no name. Neither existing gate can see that
  half — one anchors on the name, the other on a set-apart blockquote.
- **The research decides.** `docs/nd-collisions.md` is the foundation. Anything
  with no entry gets an entry with an evidence grade before it is built.
- **The ten product laws are invariants.** No overdue, no streaks, no archive,
  no scores, no inference about a person from their logs.
- **Every chunk lands green and lands committed.**
- **The holistic pass is continuous, not terminal** — every phase ends with the
  app rendered and looked at, on an imported store as well as the sample.

## Phases

### Phase 0 — the ground

No app change and no version bump.

- A third-person gate in the hub, canonical, taking `--repo` like its siblings.
- The historical backlog cleared. This does not hold the critical path: once the
  gate exists no new debt can land, so the backlog is cleared in the gaps rather
  than in front of the work that is blocking use.
- `tools/a11y.mjs`'s REGISTRY made self-deriving, the way `tools/plain.mjs`
  already is. Ninety-seven hand-written entries that nothing checks against the
  DOM, needing two edits per surface. A live gap is already in it: `#upkeep` and
  `#upkeep-chips` have no entry, so they have been shipping unmeasured for
  contrast and accessible names. Highest leverage item here, because every later
  phase adds surfaces to this list.
- This file, in the repo.
- The `### Open` heading in `NOTES.md` holds three questions that are each
  Status: Closed. The heading and its contents must agree, and
  `tools/questions.mjs` must fail when they do not.
- Research entries for what has none: the reward-led menu, and the situated view
  itself.
- The status page at `public/plan.html`.
- **Decision 6 closed on the evidence.** It proposed restyling the dogfood gate
  as the full-product gate, reconciling one entry saying the counter had always
  been running with another saying no stability test was yet possible. The
  finding above settles it: use has never gone past an import, so the counter
  has never had anything to count. Every recorded reset was the app being
  unenterable, not a stability failure — a test that never started rather than
  one that failed. The gate becomes runnable when phase 1 lands, which is the
  condition decision 6 was proposing to wait for.

### Phase 1 — the app can be entered

The deliverable: a store arrived at by import, or by capturing one task, is a
store the rest of this plan can act on — with no wizard and no afternoon of
labelling.

- **Situation is asked for at the moment it would change the answer, never up
  front.** The first time the offer would differ by place, the app asks where
  you are and offers to remember it: one question, in the flow, declinable,
  never asked twice about something already answered. Same shape for a role or a
  container. This is the opposite of a setup screen, and it is the only form
  entries 8 and 18 permit.
- **An import is an arrival, not a day's work.** Nothing imported may read as a
  demand made today. `src/taskpaper.ts:328` already holds the precedent for
  dates — a thousand-odd past due dates deliberately not converted into a
  thousand fresh obligations — and the same judgement extends to the offer.
- **Find out what actually stops entry before building.** Drive a real import
  through the app, render it, and walk the fourteen situations against that
  store rather than against the sample. A rendering-and-reading job, not a gate.
- **Everything after this is verified against an imported store**, not only the
  sample.

### Phase 2 — the horizon comes down

Answers: *have I moved toward a goal lately*, and *which lines have nothing
under them*.

- A writer for `intervalDays` and `comfortWindowDays` on container kinds, so
  `pressureOf` returns non-null for a goal or an area. No new primitive, no new
  vocabulary, no new tier — `pressure` already ranks at 3.
- `src/review.ts`'s existing unfed-goal, quiet-area and orphan readings
  surfaced. This is the azimuth check's named unbuilt half.
- A container is created where work already is, never by promotion.

### Phase 3 — the situation

Answers: *what can I do here*, *what can I do in twenty minutes*, *what is on my
plate*.

- **The missing input is time, not place.** Place is done. Add how long is
  available; estimates already exist (`estimate.recorded`).
- Rides the established pattern exactly: **do not touch `nextup.ts`.** A pure
  predicate beside `fitsHere`, a device kv preference beside `where.now`, and a
  post-filter in `work.ts` beside the existing one. The ranking and every test
  over it stay untouched.
- *What is due today* rather than *what exists* — the same gap the diagnostic
  report was found unable to answer.

### Phase 4 — the other direction

Answers: *is anyone waiting on me*, *what is between me and this person*.

- **The promise** — what someone is waiting on from you — is genuinely absent.
  `requested-by` is provenance only and there is no symmetric counterpart to
  `waiting-for`.
- **Hard constraint**: `src/requests.ts:9-12` rules that a record of the times
  you did not do your own work is the ledger this app exists not to keep. A
  promise carries no shame, no ageing score and no count. It rides the decay
  primitive like everything else.
- The person screen, on `personView`, which already computes both directions.

### Phase 5 — the situated view proper

Answers: *the recurring meeting*, *the free weekend*, *person by person*.

- One surface with inputs, **arrived at by answering the situation and never
  picked from a list of named screens**. Fourteen named screens is a menu of
  fourteen, and entry 16 is that twenty options produce zero actions.
- A situation can be named and recalled, which makes it recurring without
  becoming a ritual the app nags about.
- The attention readout per role, which `docs/horizon-models.md:208` calls the
  direct structural answer to whether enough is going into each. Plotted, never
  scored.

### Phase 6 — coming back

Answers: *what did I miss*.

- The delta report cut at an anchor. The machinery exists (ADR-0041, ADR-0068);
  the surface does not.
- Entry 11 — one missed day reads as ruin — governs the tone. A week away must
  not produce a wall.

### Phase 7 — the menu and the unformed

Answers: *what needs planning*, *what would actually help*.

- **Needs shaping**, distinct from *needs a new plan*: an oil change is not
  stale, it is unformed. `src/ui/clarify.ts` is the nearest machinery.
- **The reward-led menu**, only after its research entry exists. The Menu is
  already structurally this; the open question is whether what reaches it was
  chosen for reward or for obligation.

### Phase 8 — the whole thing, looked at

Every surface rendered at phone and tablet width, counted and read, on an
imported store, and walked against all fourteen situations end to end.

## Execution discipline

Grounded in the measured cost profile.

- **Per commit, cheap only**: `typecheck`, `test:only`, and the static gates
  touched by that chunk. Around thirty of the Spine's steps are static and run
  in seconds each.
- **Per phase, the full Spine.** Seven of its steps need a browser behind one
  chromium install measured between 24s and 4m45s, and **none of the browser
  gates accept a filter** — `a11y`, `smoke`, `size:check`, `touch:check` and
  `update:walk` are all-or-nothing. Running them per commit spends the owner's
  credit on work that runs on push anyway.
- **Batch commits touching the five tour-watched files** — `public/index.html`,
  `public/app.css`, `src/ui/work.ts`, `src/ui/clarify.ts`, `src/ui/about.ts`.
  Each costs about a minute of browser to re-render ten walkthrough pictures.
- **`npm run look` at each phase boundary.** Every defect that reached the
  device across seven releases was visible in a picture and in none of the
  numbers.
- **A release moves three things in one commit** — the `RELEASES` entry in
  `src/ui/changelog.ts`, the `CACHE` constant in `public/sw.js`, and a
  regenerated `CHANGELOG.md`. No script does this, and `release:check` fails
  afterwards if the shipped surface moved without them.

## The verification gap this plan closes

Every gate in this repo has only ever met the thirteen-item sample store. That
is how an app that cannot be entered from an import stayed green on roughly
forty gates for months. From phase 1 on, the browser walks and `npm run look`
run against an imported store as well as the sample, and the fourteen
situations are the acceptance test — walked end to end, not asserted.

## Resume state

**Read this block first.** It is updated in the same commit as the work.

- **Phase 0 — the ground.** Nearly done. Landed: the third-person gate; this
  file; the status page; this repo's entire third-person backlog (gate reports
  zero); 2.14.2; the voice gate and ADR-0106; the four research entries (23-26);
  the trademark ban given teeth in the `vocabulary` gate; `tools/surfaces.mjs`
  and the `#upkeep` surface it found unmeasured; 2.14.3.
  Outstanding: the `### Open` heading in `NOTES.md`, which still holds three
  questions that are each Status: Closed, and the `questions.mjs` rule that
  should refuse that; decision 6 closed on the evidence.
- **The hub's backlog is NOT done** — around 146 sites remain in its
  `LESSONS.md`. That file alone; everything else in the hub is clear.
- Phase 1 through 8: not started.
- **Last full Spine seen green:** `2ff380d` on `staging`; `74dca96` on `main`
  carrying 2.14.1 to production.
- **Waiting on the owner:** the on-device pass, whenever convenient. Nothing is
  blocked on it.

### What a fresh session should know about this run

**Compare every clone against its remote before writing.** The container rewound
one clone's `.git` twice while leaving the other current, and it also rolled the
scratchpad back, destroying four research documents that existed nowhere else.
**Agent output lands in the repo in the same turn it is produced** — `/tmp` is
not durable here, which is the same lesson as the V2 plan living in a session
file, one layer out.

**Renaming the speaker does not fix an attribution.** Swapping a pronoun for the
role noun leaves the quotation standing. Three times, both repos, caught by
`privacy-check.mjs` every time and by reading none.

**A plant that does not fire has tested nothing.** Twice in one day: a plant
landed inside an HTML comment that merely *mentions* `<main>` in backticks, and
a gate's own first draft counted a shared utility class as coverage so all
seventeen surfaces looked measured. Both gates were right and both tests were
empty. Plant, then check the plant fired.

**One marker, two meanings, is a trap.** `privacy-gate:patterns-begin` means
"this file mirrors the hub's disclosure patterns" to `privacy-mirror-check.mjs`
and "skip this region" to `third-person-check.mjs`. Using it for the second
turned the first red. Exemptions go in `.third-person-allow`.

**`#upkeep` was unmeasured because it was unreachable, not because a list was
short.** The a11y walk builds its own store by capturing items and never had an
upkeep in it; the sample's one upkeep was comfortable by design. Seeding
IndexedDB directly does NOT work — the app does not re-fold an appended event on
reload. The fix was a second, ready fixture item plus an audit at the very end of
each theme, where nothing downstream can be perturbed.
