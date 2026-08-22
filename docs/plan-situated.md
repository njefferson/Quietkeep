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

- **Phase 0 — the ground.** DONE.
- **Phase 1 — the app can be entered.** The core defect is FIXED in 2.15.0. An
  import now lands in the inbox and the offer hands it over one at a time,
  saying *this came in with your import*. Verified by `npm run import:look`: the
  same 840-item fixture that produced "nothing is asking today" now produces a
  named thing with a warrant, a triage door, 25 controls, 1.7 screens.
  Not done in this phase: asking for a situational fact in the flow. That was
  the original design and it is downstream of this — it can wait for a real
  on-device pass rather than being guessed at.
- **Phase 2 — the horizon comes down.** Step 1 DONE in 2.16.0: a container's
  kind is chosen when it is made. The detail sheet's "make a parent" control now
  offers project / outcome / area / goal, project still the default, and the
  card afterwards reads *in ⟨that goal⟩*. Everything downstream of it was
  already built and had never had data to run on — `servesNode`, the
  *serves ⟨title⟩* line shipped in 2.5.0, `unfedGoals` and `quietAreas`.
  Step 5 DONE in the same release: `docs/horizon-models.md` proposed a role
  carrying its own review clock in two places, which the write boundary refuses
  (a role is demand-free — law 6, ADR-0014); both now say the clock rides the
  container the role labels.
  Step 2 DONE in 2.17.0: a container carries a review clock without being
  converted to `upkeep`. It was not a missing route — the route was there and
  destroyed the thing it acted on. `makeRepeatEvents` emitted
  `node.kind.changed` to `upkeep` for every kind, so the picker shipped in
  2.16.0 made goals that the next control in the same sheet unmade, under a
  label reading "Make it repeat" throughout. `stopRepeatEvents` had the mirror
  defect, writing `from: 'upkeep', to: 'action'` about a node that was never an
  upkeep. Both now take the node's own kind. Proved by difference rather than
  by reading: the same tree offered at the same moment, 0 items without the
  rhythm and 1 with it — work filed under a goal is silent under law 1 clause
  (d) until the goal's clock fetches it.
  Step 3 DONE in 2.18.0: *What you're working toward*, a sheet listing every
  goal, area and outcome with what it is carrying and how often it comes back —
  **the empty ones included**, which is the whole difference between it and
  Review. Review computes `unfedGoals` and `quietAreas` correctly and shows
  them capped at three, exceptions-first; that is the right shape for "what
  needs attention" and the wrong one for "what am I working toward". Behind a
  door, hidden until a horizon exists, never a landing view (ADR-0013).
  Projects are counted but never listed: 42 of them came out of one import, and
  a page with all of those on it is the tree by another name — but a version
  that said nothing about them would render blank on a real store and read as
  broken, which is the cost `serves.ts` already records.
  The assertion that matters, driven in both themes: a goal is **still listed
  once the work under it is finished**. That is the moment it would vanish and
  the moment somebody most needs to see it.
  Step 4 DONE in 2.18.1, and it was mostly already built — the THIRD step in
  this phase that turned out to exist. `#sort-bulk-parent` filters on
  `isContainer`, which has covered all four kinds since the tree was written,
  and a bulk put-under lands on a goal end to end (measured, not read). What
  was actually missing: the option text never said which KIND a place was, which
  cost nothing while every place in the list was a project and costs the most
  when somebody is filing forty things at once. `containerOptionWords` in
  `tree.ts` now writes those words once for all three pickers — there were
  three identical copies, two of them in the same file, agreeing by coincidence
  rather than by construction.

  **Phase 2 is complete.**

  The pattern this phase kept producing, five times over: **the plan named
  things missing that were built, and named one thing built that was destroying
  what it touched.** Steps 1, 3 and 4 all found working machinery; step 2 found
  a route that existed and unmade the node it acted on. Reading the code first
  changed the work every time, and reading it was never the expensive part.
- **Phase 3 — the situation.** HALF DONE in 2.19.0: *how long you have*. A
  pure predicate (`fitsWithin`), a device preference beside `where.now`
  (`how.long`), and a post-filter in `work.ts` beside the existing one —
  `nextup.ts` and every test over the ranking untouched, exactly as the plan
  specified. Two rules carry the weight: it reads the person's own estimate and
  never the timed range (using what happened would be the app correcting them,
  which `duration.ts`'s own header forbids), and **an unestimated thing FITS**,
  because most things never get an estimate and hiding them would empty the
  surface and read as broken.
  The wiring is asserted in the browser, not only in units: the same tree with
  a ninety-minute job and an untimed one, narrowed to thirty and cleared again.
  Seen RED on a planted no-op `fitsWithin`, so the assertion can fail.
  Second half DONE in 2.19.1: *what is due today* rather than *what exists*.
  **And it was the fourth time in this plan that the answer already existed.**
  `datedTodayCount` and `datedWords` have been in `clock.ts` since the clock
  module, and rendered ONLY inside it — an opt-in ticking face, off by default,
  with the fact third in a run-on sentence after the time and the remainder.
  Live code with no route to it, exactly like `unfedGoals` in phase 2.
  The count now renders on the work surface independently of that module. The
  REMAINDER does not: "2h 30m left today" is what ADR-0103 took off this card
  and it stays off. Hidden when settled — settling IS finishing early, so the
  question has already been answered by the act — and stripped in *Just one
  thing*, where weighing the whole plate is the cost being cut.

  **Phase 3 is complete.**
- **Phase 4 — the other direction.** DONE in 2.20.0. Checked against the code
  first: **the person screen was already built** — `#detail-person-group` has
  rendered `personView`'s both directions since 1.12.0 — which is the FIFTH
  already-built step in this plan. The promise itself really was absent;
  `requested-by` records who asked, which is provenance, not an undertaking.
  Built as a RELATION (`promised-to`) and never a kind: a promise is your own
  work with a person attached, so it stays an ordinary node, is kept by doing
  it, and `personView.involves` picked it up with no change at all. A kind
  would have had to join every kind list, and phase 2 measured three of the four
  sites that write a node's kind as wrong.
  **The asymmetry is the whole design.** `PersonLine` carries `days` because
  ageing somebody else's debt to you is a fact about a date; `PromiseLine`
  carries none, because the same words pointed at yourself are the ledger
  `src/requests.ts` says this app exists not to keep. Enforced by the SHAPE —
  there is no field to render — and asserted in the rendered words by both walks.
  `promise.released` is a second subtraction in a vocabulary ADR-0057 says has
  one. Deliberate: `stakeholder.removed{relation:'promised-to'}` would write a
  false sentence into an append-only log. It is load-bearing rather than tidy —
  a promise nobody can take back is a permanent claim that you owe somebody
  something. It releases the undertaking and leaves the work, which is the
  assertion the smoke walk was seen RED on.
- **Phase 5 — the situated view proper.** TWO OF THREE DONE in 2.21.0.
  *Where you are* and *how long you have* were finished machinery on the wrong
  route — two `<select>`s inside `<section id="held">`, which is the last place
  somebody answering *what is my situation* would look. They MOVED into
  `#sheet-situation` behind one door, and **the standing lines stayed outside
  it**: `whereWords` and `howLongWords` are the only things telling a reader
  the list is narrowed, and behind a sheet nobody has open a filter is
  invisible. The walk asserts the line is still visible with the sheet closed.
  Naming a situation is genuinely new — `situation.saved` and
  `situation.forgotten`, folding to `State.situations`, a state-level map like
  `modules` rather than a node. An EVENT and not a device preference, unlike
  the two inputs it recalls: where you are is not a fact about your work, but a
  situation you recognise about how you work is nearer a context or a role and
  should survive a device. Three routes now set the pair and `setSituation` is
  the one writer.
  **Nothing records how often a situation is used** — no count, no last-used, no
  ordering by frequency — and the shape has nowhere to keep one, which is how
  that is enforced rather than remembered.
  Still owed: the attention readout per role.

  **The conflict phase 5 walks into, settled here so it is not rediscovered.**
  `src/roles.ts`'s header promises the readout — *where attention actually
  went, per role* — and `roleLoads` four hundred words later refuses to count
  finished work because *"counting it would turn this into a record of output,
  which is the shape law 5 refuses"*. Both are right, and the distinction the
  plan never made is: **a record of output counts what you FINISHED; attention
  is what you GAVE TIME TO, finished or not.** `do-now.timed` records exactly
  that, with the chosen length deliberately absent so a shortfall cannot be
  reconstructed by subtraction. So the readout is buildable on timings and is
  NOT buildable on completions.
  It is not built yet for a different reason: **it would render empty on any
  store that has not used the do-now timer**, which is every store this app has
  been measured on — the `serves.ts` failure with a different noun. When it is
  built it needs the line saying what it is made of, the way 2.19.0 handled the
  same sparsity.
- **Phase 6 — coming back.** DONE in 2.22.0, and the phase's own premise was
  wrong in a way worth keeping. It said *the delta report cut at an anchor —
  the machinery exists, the surface does not.* **The surface existed**: the ⓘ
  panel has the anchor picker and four export routes, all measured. That is the
  seventh already-built thing this plan has named as missing.
  **And the delta is the wrong instrument for the question anyway.** It is
  computed from the LOG, and being away writes no events — you were not there to
  write any. On a store one person keeps on one device, "what changed while I
  was gone" over the log is empty by construction. What you actually miss is
  which things came round, which is clocks against time, and `#reentry` already
  says that: how long you were away, how many things to sort, how many dates
  went by, and the amnesty. Bounded BY SHAPE and deliberately never a list.
  **What was genuinely missing is a way to READ it.** Every route was an
  export, and exporting records `status.report.exported`, which moves the
  per-device mark — so reading the report spent the period you read it for, and
  a second look was empty with nothing on screen saying why. *Show me* renders
  the same cut and the same text and **writes nothing**. The smoke walk proves
  the contrast directly: look twice and it is identical; export twice and the
  second is empty.
  The empty case says so and says why, rather than rendering a heading with no
  rows — the `serves.ts` failure 2.18.0's empty state already answers.
- **Phase 7 — the menu and the unformed.** DONE in 2.23.0, and BOTH bullets
  turned out to be machinery with one route into it. Eighth and ninth.
  **The reward-led menu: the research decided it, and it mostly said no.**
  `docs/nd-collisions.md` entry 26 exists and grades the packaged practice
  Community-at-best — it refuses any named feature, any use-tracking, any
  "you haven't looked at your menu" prompt, any earned or contingent framing,
  anything algorithmic. What it permits is one narrow thing and calls it a
  VERIFIED DEFECT: the category chosen at write time rather than silently
  defaulting. Measured — `MenuCategory` has six values, the two routes a person
  actually uses (`triage-intents.ts:45` and the sheet's button) both wrote
  `read`, and `menuGroups` groups by category, so a six-way grouping rendered
  ONE GROUP on every store. A two-tap picker, `read` still the default,
  ADR-0029's shape. Correctable in place, because `menu.item.added` is LWW on
  the `menu` stamp — otherwise a wrong category would be a state you enter and
  cannot leave (LESSONS 113).
  **Needs shaping: the ACT was built and had one door.** `biteEvents`
  (1.24.0) makes an ordinary action under the unformed thing — no new kind, no
  new noun — and its only caller was the offer card. So you could shape the ONE
  thing the app happened to hand you, and a thing you knew was unformed had no
  route unless it came round. The same intent now has a second door on the
  detail sheet.
  **What is NOT built, deliberately: a LIST of unformed things.** A backlog of
  your own vagueness is the shape law 5 and entry 26 both refuse, and the offer
  card plus the sheet cover the act at the two moments it is wanted.
- **Phase 8 — the whole thing, looked at.** DONE in 2.23.1. Rendered at 390 and
  at 768, on the sample store and on the import fixture, and READ rather than
  counted. **768 had never been rendered once**, in an app whose reference
  platform is a tablet.
  **Looking found a defect twenty-five static gates and eight browser walks had
  passed for two releases.** `#situation-open` — the door to where you are and
  how long you have, both inputs to the offer — rendered 2129px below that offer
  on a phone (3.84 screens) and 1983px below it on an iPad, inside
  `<section id="held">`, the section it narrows. So did the two lines that say
  the list has been narrowed. 2.21.0 moved the two choosers OUT of the pile and
  put their door back into it, because that is where the choosers had been.
  Fixed in 2.23.1: all three now stand 64px above the offer at both widths, at a
  measured cost of 56px of shut door. `tools/narrows-check.mjs` is the
  assertion, seen red on three plants including the real defect reproduced.
  **Two defects in existing gates fell out of it.** `controls.mjs` read comments
  as markup, so a `<section>` quoted in prose pushed a landmark that never
  popped; and its manifest tracked five controls, none of them the one whose
  placement was the defect. Both fixed in the same release.
  **What the import fixture says, in its own numbers.** 840 actions under 42
  projects, 518 dates already passed, and zero contexts, roles, areas, goals or
  people. The app is enterable — 1.8 screens, 26 controls, one thing offered
  with an honest reason, no repeats across ten rounds — and *Needs a new plan*,
  *With other people*, *Worth a look* and the Menu all render EMPTY, because an
  import carries none of what fills them. That is the plan's own opening finding,
  measured on the real file rather than argued from the documents.

  **The fourteen situations, walked. Eleven answered, three partly.**
  - *What can I do where I am right now* — the situation door, now above the
    offer. Answered.
  - *What do I need in front of me during a recurring meeting* — a named
    situation recalls the pair. Answered.
  - *What is between me and this person who just walked in* — the person lens
    and both directions of *With other people*. Answered.
  - *What could I do with a free weekend* — **PARTLY.** `HOW_LONG_CHOICES` stops
    at 120 minutes, so having a lot of time has no positive expression; the only
    way to say it is *as long as it takes*, which is the default and therefore
    says nothing. Not fixed — adding a choice is a product decision, not a
    defect to patch under a looking phase.
  - *What is on my plate, enough to decide whether to finish early* — the dated
    line and the proof line. Answered.
  - *Is there anything to follow up with anyone about* — the waiting-on half.
    Answered.
  - *Is anyone waiting on something from me* — the promised-to half, deliberately
    without a duration. Answered.
  - *Have I moved toward a long-running goal lately* — the horizons surface, and
    *nothing is feeding it* when nothing has. Answered.
  - *What needs planning rather than doing* — naming a first step, on the offer
    card and on any thing's own panel. Answered.
  - *What did I miss while I was away* — re-entry. Answered.
  - *Which lines of work have projects under them, and which have none* — the
    horizons surface says which are empty. Answered.
  - *What can I do in a spare twenty minutes with no preparation* — **PARTLY.**
    The twenty minutes is answered by the duration chooser; *with no preparation*
    is not a question the app can be asked. The nearest thing is *ready now* on
    the proof line, which means a clock has arrived, not that a thing is
    startable.
  - *What matters to me and to the people who matter to me* — roles and people.
    Answered.
  - *What could I do that would actually help, rather than what I owe* — the
    demand-free kinds and the line saying nothing there is asking. Answered.

  **Found by looking and NOT fixed, deliberately.** At 768 every card spans the
  full width — there is no maximum measure on the reading column. On this
  fixture no line actually runs long enough to hurt, so it is a hazard rather
  than a defect, and it has never been measured at 1180 (iPad landscape), which
  is the width most likely to expose it.
- **Last full Spine seen green:** `4dfcbf2` on `staging` (2.23.0), every step
  and the deploy, read from the run rather than from the push output.
  **2.23.1 (`516ff99`) went RED on the a11y walk** — the three moved regions
  were undeclared in `PLAIN_CHROME_HIDDEN`, so *Just one thing* rendered a
  filter. 2.23.2 is the fix; the a11y walk was then run LOCALLY on that markup
  and read green, both themes, zero failures. The head is `825aa12` and its
  Spine is the one to read — the runs on `1627350` and `fe60e5f` were CANCELLED
  by the pushes that followed them, which is not the same as failed and was
  first reported here as if it were.
  The lesson is 126 in the hub: `plain:check` checked the offer card both ways
  and the chrome only one way, and the missing direction ran in a browser.
  **A session cannot read the deployed site** — the network policy answers 403
  to CONNECT for `*.pages.dev`. That is V-15, already verified and closed: the
  device's own §7f diagnostic is what reads production, and a Deploy run's green
  Cloudflare step is the weaker evidence a session can offer.
- **Waiting on the owner:** the on-device pass. Production is 2.14.1 and
  `staging` carries sixteen releases past it — 2.14.2, 2.14.3, 2.15.0, 2.16.0,
  2.17.0, 2.18.0, 2.18.1, 2.18.2, 2.19.0, 2.19.1, 2.20.0, 2.21.0, 2.22.0,
  2.23.0, 2.23.1 and 2.23.2. Nothing in the plan is blocked on it.

  **These two lines went stale for five releases while the phase notes above
  them were kept current**, which is the one-file-two-answers shape the hub's
  own index has a paragraph about. They are the lines a fresh session reads
  FIRST, so they are the worst two in the file to let drift. Update them in the
  same commit as the work, like everything else in this block.

### What the import work established, and what it cost to get right

**Two diagnoses were wrong before the right one.** First: "the offer is empty."
Second, from source: "all 882 rows sit on one end-of-day timer and arrive
together." Both were plausible and both were wrong. The log holds **42**
clock.set events, one per project; the 840 actions are covered by law 1 clause
(d) and never got clocks. And the next morning is IDENTICAL — the pile does not
arrive at once, it does not arrive at all.

**The real defect:** `captured` is the latch that makes something an inbox item,
and only a capture ever set it. An import reached no tier of the offer at all.

**Two tests caught what reading did not.** Marking every imported row took rows
with genuine FUTURE dates off the calendar — an unsorted inbox item is not a
dated commitment, and only dateless rows belong in the inbox. And the
three-place rule (clone, deserialise, old-snapshot default) named the field I
had handled in one place of three.

### Standing hazards for a fresh session

**Compare every clone against its remote before writing.** The container rewound
a clone FOUR times in one session, and once rewound the scratchpad too,
destroying four research documents. **Agent output lands in the repo in the same
turn it is produced.** A subagent can also be rigorous, verify twice, and still
report a false finding because its filesystem moved under it — one did, claiming
a catalogue entry did not exist.

**Renaming the speaker does not fix an attribution.** Swapping a pronoun for the
role noun leaves the quotation standing. Three times, caught by gate every time.

**A plant that does not fire has tested nothing.** Twice: one landed inside an
HTML comment that merely mentions `<main>` in backticks; a gate's first draft
counted a shared utility class as coverage. Plant, then check the plant fired.

**One marker, two meanings, is a trap** — and **naming it in prose is a second
trap, which this paragraph fell into.** The `patterns-begin` / `patterns-end`
pair (prefixed `privacy-gate:`) means "this file mirrors the hub's patterns" to
one gate and "skip this region" to another. Writing the opening marker whole, as
this paragraph did, OPENED a region that never closed: the fourteen lines after
it were invisible to the privacy gate, silently, under a green run. The gates'
own sources dodge it by building the marker with `+`, which prose cannot do, so
prose writes the two halves apart. An unclosed region is now a FAILURE in both
gates rather than a skip to end-of-file. Exemptions go in `.third-person-allow`.

**A green gate over prose is worth re-checking once, because this plan is mostly
prose.** The third-person gate reported both repos clean while twelve real
references stood in three files, one of them `NOTES.md`. It skipped any line
over 300 characters — a guard for minified bundles — and markdown here is
written one paragraph per line, so 632 tracked lines cleared that threshold as
ordinary prose and the rule never ran on them. Fixed in the hub on 2026-08-22:
the test is an unbroken 80-character run, which is the hazard it was actually
written for. Hub LESSONS 114. The general form, and the reason it belongs here:
**a skip condition specified by a proxy for its hazard acquires whatever else
shares the proxy**, and this plan's own output is the thing that shares it.

**A browser walk here can measure the PREVIOUS app and pass.** `public/app.js`
is generated by esbuild and gitignored, and every walk — a11y, smoke, look,
tour-shots, import-look, touch — checked only that it EXISTED. Run any of them
after editing `src/` and before `npm run build` and it serves the last build,
reports green, and the session believes it tested what it just wrote. CI builds
first, so the Spine was never wrong; local runs were, and local runs are what
this plan uses to decide a push is safe. `tools/bundle-fresh.mjs` now refuses
to walk a bundle older than the newest file under `src/`. **It was found by an
assertion that happened to read a string this session had just changed** — the
walk said the sheet "still says Make it repeat" — and nothing structural would
have caught it, because a new audit added to a stale bundle measures the old
markup and passes. Same shape as the length cap above: the check that exists,
runs, and is narrower than the thing it is trusted for.

**A control that quietly changes what a thing IS will not announce itself, and
this phase found three.** `makeRepeatEvents` converted every kind to
`upkeep`; `stopRepeatEvents` claimed a transition from a kind the node never
had; `menu.item.promoted` rewrote the kind of everything it touched because
`toKind` defaulted to `'action'` and both callers took the default. None of
them was reachable by reading a diff: each is one parameter or one condition,
sitting in a function whose name describes a different act entirely.

**What surfaced all three was the same move** — creating a node of a kind that
had never existed in this app before, then using the ordinary controls on it.
Nothing else would have. The kinds were in the schema for the life of the
project and no route made one, so every control that mishandled a goal had been
mishandling nothing at all.

**The check worth repeating whenever a new kind becomes creatable:** list every
control that writes `node.kind.changed` or carries a `toKind`, and ask what
each does to the new kind. There were four such sites; three were wrong.
