# NOTES.md — Quietkeep

> **The app is Quietkeep.** *"Out of sight. Never out of mind."* /
> *"It holds the rest, so you can rest."* — chosen 2026-07-28,
> [ADR-0024](docs/adr/0024-name-quietkeep.md). Q-02 is closed.
>
> `Horizons` is now the **repo slug only**, until the GitHub rename. It also survives
> permanently as *domain* vocabulary — *higher horizons* (law 4) and the
> *horizon-integrity engine* keep the word, and `changelog:check` asserts they were not lost to a
> rename.
>
> **The check order that produced it**, kept because it transfers — cheapest and
> most-likely-to-kill first:
> **1. say it aloud** · 2. grep this repo's spec · 3. unscoped name+software search ·
> 4. npm and GitHub · 5. App Store / USPTO on a real device.
> Steps 1 and 2 are free and instant, and were being run last or not at all. The full
> record of what was tried is the [graveyard](docs/adr/0020-name-perennial.md) — a trail of
> where the search went, not a proof that nothing else was left.

The repo source of truth. **Read this first, every session** (Doctrine §12).
Thesis, invariants, frozen scope, open questions, Project facts. Settled
decisions live here in summary and in [`docs/adr/`](docs/adr/) in full.

---

## Thesis

Most planners are built for someone whose problem is *organising* what they
already remember. This one is built for someone whose problem is that a thing
leaves their head and does not come back — where the relief of writing it down is
real and immediate, and the returning is the part that never happens.

So the return is not a feature. It is the structural property the whole schema
exists to guarantee. Capture relief is unconditional for this audience, which
means resurfacing must be *structural, not habitual* — the app cannot depend on
the user remembering to review, because that is the exact capacity it is
compensating for.

Everything else follows from that.

---

## The ten product laws (invariants)

Violating one of these is a **defect**, not a trade-off. If a requested change
requires breaking one, that is a Doctrine §1 moment: flag it, don't slip it in.

1. **Return engine.** Every node is (a) on a surface now, (b) under a clock,
   (c) on the Menu, or (d) parented to something under a clock. The write
   boundary refuses anything else. *No silent nodes.*
2. **Coverage gauge.** A one-line surface element proving law 1
   ("everything returns · 0 silent"), tappable to show each item's return date.
   The invariant is not just held, it is *shown*.
3. **No past bucket.** A passed date is never an archive item. It auto-converts
   to a present replan card with context assembled: what it fed, the suspense,
   days left, and options — compress / escalate / renegotiate.
4. **Levels push down; the user never climbs.** The runway is the only
   workspace. Higher horizons project lineage and health downward. Altitude
   views are inspection modes, not places to work.
   **This law is about ALTITUDE and it has been misread as being about
   navigation.** Its subject is goals, areas and outcomes: you never have to
   climb a hierarchy to plan your day. It says nothing whatever about whether
   the runway's own blocks can be reached, and "the runway is the only
   workspace" is not "the runway is one undifferentiated scroll". Read the
   second way, it was cited as the reason not to build a way around a page
   measured at 3.0 screens with six live blocks on the *small* sample — which
   is an invariant about hierarchy being spent on a different axis, and a
   product law being used to close a defect. Built as the contents sheet in
   2.3.0 ([ADR-0093](docs/adr/0093-a-way-to-each-part-of-the-page.md)), nineteen
   days after it was first asked for. Same shape as Q-10 and hub LESSONS §96.
5. **One decay primitive runs everything temporal:**
   `(last_done, comfort_window, rising pressure)`. **No "overdue" state exists
   anywhere** — not in the schema, not in a variable name, not in copy. Language
   is "ready again" and pressure gradients. No red walls. No streaks.
6. **Demand-free types exist.** Menu items and pebbles cannot carry clocks.
   Acting on one is a deliberate promotion, never an obligation that accrued.
7. **The app plots; the human interprets.** No sentiment scoring, no cause
   attribution, no diagnosis-flavoured copy. Journal analytics render
   co-occurrence only.
8. **Rest is legitimate.** Re-entry after absence is the *primary designed
   path*. The greeting after a lapse is bounded — Next-up + ≤3 triage + gauge +
   amnesty offer — never the backlog.
9. **Data is never lost to updates.** Append-only event log; state = fold(log);
   migrations additive-only; auto-export a snapshot before any migration; import
   always seeds a fresh store, never merges.
10. **AI never blocks.** Every assisted flow has a working offline rung. Cloud
    rungs require explicit consent naming what leaves the device.

---

## What VERSION 1 means — settled 2026-07-29

**The rule for the first slot, settled 2026-07-29.** Version 1 is reached when
every initial capability is in place — all of the specified behaviour, not a
subset that feels close. Until then this is not a planner app, and the number is
not claimed. Naming it is the owner's act and happens only once it is ready.

**Binding, and it settles the first slot.** The VERSION slot is not reached by a
big release, a large diff, or a session's judgement that things feel complete. It
is reached when **every item in the v1 Must list below exists** — and the owner says so.

Two consequences a session must not get wrong:

1. **Do not propose 1.0.0.** Not as a suggestion, not as "this looks like it has
   reached that level". The owner has ruled on the criterion; the only thing left
   is whether the list is done, which is a fact about the list.
2. **Until then it is not a planner**, and no copy anywhere may
   describe it as a finished one. The app says what it does, not what it will do.

Progress toward it is therefore measured against the Must list and nothing else.

---

## Scope — frozen 2026-07-27

MoSCoW run over the design brief's standing tier proposal. **v1 is frozen.**
Moving an item into v1 now is a scope change and needs the owner's word.

### Must — v1

- ~~**The spine.** Append-only log, fold engine, vaults, export/import,
  snapshot-before-migrate.~~ **Done, Phase 0.** Nothing else can be trusted until
  this is.
- ~~**Work mode, complete.**~~ **Done, 0.17.0 (the chip was the last piece).** Single computed Next-up card (hard landscape >
  resume cards > pressure rank; "not this" cycles freely with no penalty),
  capped list of 5 behind it, Upkeep chips above threshold, coverage gauge,
  ~~comms-sweep chip~~ **(done, 0.17.0 — build-plan item 22, deferred out of Phase 3
  because it needed focus ramps; those shipped in 0.14.0)**.
- ~~**Dump + clarify + heat pass.**~~ **Done, 0.4.0.** Zero-chrome capture; one
  card at a time with forced-choice routing; two-tap hot/cold.
- ~~**Interrupt/pin + focus anchor**, with auto-paired resume cards.~~ **Done, 0.14.0** — `focus.started`/`focus.ended`/`interrupt.captured`/`resume.card.*` had been in the vocabulary since the first draft, `nextup` ranked resume cards SECOND, and nothing could create one: an entire ranking tier ordering an empty set. The card is written **at the interruption**, not at `focus.ended` ([ADR-0039](docs/adr/0039-focus-and-the-way-back.md)).
- ~~**Dependency dates + replan.**~~ **Done, 0.12.0.** `feeds →` (project, suspense) + lead estimate,
  computed latest-start, buffer burn, auto-replan on miss (law 3).
- ~~**Track portfolio + delta report.** The work half: OPR, suspenses, status
  output to clipboard/Markdown/print/CSV.~~ **Done, 0.16.0** — `project.role.set`
  was in the vocabulary saying *"a track project emits no next actions"* and
  nothing folded it, so Next up would hand you somebody else's job. The report is
  `fold(log up to then)` vs `fold(log)`, so there is no second source of truth to
  drift ([ADR-0041](docs/adr/0041-carrying-and-the-report.md)).
- ~~**Person lens.**~~ **Done, 0.15.0** — `person.linked`, `waiting.opened` and `waiting.closed` were in the vocabulary and unfolded, so the "Waiting for" route said *someone else owes you this* and never asked who. Unattributed waiting-fors are shown, not hidden: the route is one tap, so unattributed is the commonest kind ([ADR-0040](docs/adr/0040-the-person-lens.md)).
- ~~**Stalled/orphan detection** (the exceptions-first Review surface).~~ **Done, 0.13.0** — and it needed *containment* built first: the parent field had existed since the first fold with no control able to set one, so nothing in the app could stall. [ADR-0038](docs/adr/0038-containment-and-exceptions-review.md).
- ~~**T0 + T1 notifications.**~~ **Done, 0.8.0** (badge 0.11.0). Permission +
  badge + glance surfaces; `.ics` export with `RRULE`/`VALARM` so the OS calendar
  does the notifying. **[V-14](docs/verifications.md) is CLOSED — answered YES on
  device, 2026-08-09.** An exported `.ics` really is picked up by the OS: iOS
  rendered it on the intended day, all-day, with the alert resolved to **09:00
  local** and named in words. Nothing in CI could ever have proved that, which is
  why it stayed open for eleven days and not because anybody forgot.

> **Every item on this list is now built, as of 0.17.0 on `staging`.**
>
> That is a statement about the list, and it is deliberately not a statement
> about a version. **The owner alone decides what is a VERSION**, and v1 will not
> be named until it has been used and is agreed to do all the things
> specified — the owner's ruling is recorded below under *What VERSION 1 means*. Sessions
> do not propose `1.0.0`, and this line is not a proposal.
>
> What is left before that judgement is the owner's to make, not code: the on-device pass
> (Doctrine §7). **V-14 is no longer among them — it was answered YES on device
> on 2026-08-09** and is closed.

> **CI caught what I did not, 2026-07-29.** Spine runs 67 and 68 (0.15.0, 0.16.0)
> went **red on the banned-vocabulary gate** after I reported all nine gates green
> locally. Both reports were wrong in the same way and for the same reason: the
> gate lived only in `spine.yml`, so "running it locally" meant me re-typing an
> approximation of it at the terminal, and my version did not reproduce the
> filter. The offending line was a comment in `src/people.ts` explaining the
> prohibition by quoting one of the banned words — **exactly the trap already
> recorded in this file from Phase 3**, hit again because nothing stopped it.
>
> Fixed twice over: the comment was reworded (never the gate widened, per
> ADR-0010), and the gate now lives in `package.json` as `npm run vocabulary`
> with `spine.yml` calling it. There is one definition; local and CI run the same
> bytes. Proven to bite before being trusted (§6) — a probe line reds it.
>
> The lesson is not "be more careful". It is **V-10 again**: a gate I have not
> actually run is a gate I have not run, and "green locally" means nothing unless
> the local thing and the CI thing are the same thing.

### Trying it out, and starting over — settled 2026-07-29

**Three capabilities asked for together, settled 2026-07-29:** importable test
data to try the app on, a way to purge the whole set of tasks, and a way to
select ranges rather than acting on everything or one thing.

~~Roadmapped, not built.~~ **ALL THREE ARE BUILT** — sample data (*Add some sample
work*, *Make a set to try things on*), purging (*Clear what I'm holding*, with the
copy-first step), and named ranges (sort mode, the standing "dates that have gone
by" range, bulk acts through the real gate). **This line said "not built" until
2026-08-17**, which is the same stale-prose defect this file records three times
elsewhere. The shape written below is what they were built to, and it is kept
because the reasoning still binds anything added to them. What follows is the shape it should take, written now
while the reasoning is fresh, because most of these have a way of going wrong that
is not obvious when you come to build them.

**Sample data you can import.**
- It must be **generated by a script in the repo**, never hand-written. A
  hand-written fixture drifts from the vocabulary the first time a noun changes,
  and then the thing you use to see the app is lying about the app.
- **Every date must be relative to the moment of import**, not baked in. A fixture
  with fixed dates is a fortnight lapsed the day after it is made — you would open
  it and meet the re-entry greeting and a pile of replan cards, which is not what
  "here is what the app looks like" should show anybody.
- It should **populate every surface at once**: a stalled project, something with
  someone else, a passed date, a tracked project you are carrying, a worry mid-flow,
  a save-for with numbers, something on the Menu, a resume card. The point is to
  see the whole app, and a fixture that only fills the list teaches you the app is
  a list.
- It **imports through the existing path** and therefore seeds a fresh store and
  never merges (law 9). It is not a special case and must not become one.
- It must be **obviously not yours**. Placeholder names, nothing that could be
  mistaken for a real commitment, and a line on the surface saying what it is.

**Purging.**
- **Auto-export first, always.** Doctrine already requires a snapshot before any
  migration; "start again" is the same act with a friendlier name and the same
  consequence if it goes wrong. The export happens before anything is cleared, is
  handed to the user, and only then is anything touched.
- It must be **one atomic operation** — clear and re-seed in a single transaction.
  This exact class already destroyed a store once in this project (0.10.0→0.10.1,
  in the hub's LESSONS): validation passed, `reset()` ran, `append()` failed, the
  data was gone.
- The confirmation must **state the number of things it is about to remove**, from
  the actual store, not a generic warning. "This removes 47 things" is a fact you
  can check; "are you sure?" is a noise you learn to click through.
- **It is not undoable and must say so.**

**Selecting ranges.**
- This is the one with a real tension in it. Law 8 caps what a surface may SHOW,
  and bulk selection is a way of acting on more than you are looking at.
- The resolution is the one the **amnesty** already uses (ADR-0043): the cap
  governs display; an explicit request from the user is not the app deciding to
  show you everything. So a range act is legitimate **when the user named the
  range** — "everything on the Menu", "everything I let go before June" — and
  illegitimate as a select-all over a surface that is capped for a reason.
- Every bulk act must be a **real, gated batch of the same events a single act
  would write**, exactly as the amnesty is. Never a shortcut that bypasses the
  gate, or the invariants stop holding in precisely the case where the most is at
  stake.
- **A preview before it runs, stating the count.** And for anything destructive,
  the same auto-export rule as purging.

**What else makes sense, and is not on the owner's list:**
- **Export a range**, not just everything — the export is currently all-or-nothing,
  and "send me last quarter" is a real request the status report half-answers.
- **A dry run for import.** The surface already says what a file holds before you
  commit; the same honesty for a bulk act is cheap and the analogy is exact.
- **A way to see the log itself.** Every fact in this app folds from it, and there
  is no way to look. That is the sharpest debugging tool available and it costs
  almost nothing to render.

### Should — v1.5

~~Menu with save-for gauges~~ **(done, 0.19.0 — the category on
`menu.item.added` had been collected and discarded since the first draft, and
`save-for.updated` was never folded)** · ~~Rest mode + auto re-entry (7-day default)~~
**(done, 0.18.0 — [ADR-0043](docs/adr/0043-re-entry-is-the-primary-path.md); the
re-entry vocabulary had been complete and unreachable since the first draft)** ·
~~bother
flow~~ **(done, 1.5.0/1.8.0 — the flow terminates in clock-guaranteed routes,
and 1.8.0 made "not mine to carry" keep its decision in the Not Now ledger
instead of trashing it)** · staff-call lens **(the per-person half shipped
1.12.0; the DELTA half is what "staff-call" actually means and it waits on
anchors — see build-plan 33/34. An earlier session of mine recorded this item
as shipped outright, which was wrong. **The delta half shipped 1.17.0** —
ADR-0068: anchors are demand-free named periods and the cut runs on the same
per-device watermark the export mark uses)** · ~~pebbles~~ **(done, 1.15.0 —
ADR-0065; this line said otherwise until 1.17.0, the same drift 1.9.1 corrected
elsewhere)** · ~~journal~~ **(done, 1.13.0 — ADR-0061: a
NodeKind with an encrypted payload rather than a vault, on the owner's decision.
ADR-0005's encryption-ships-together binding honoured — PBKDF2-SHA-256 at
600,000 rounds, and the fold never touches ciphertext)** · ~~printable today-card~~ **(done, 0.21.0 — and it fixed the print path shipped in 0.16.0, which had no stylesheet behind it at all)** · ~~request slots
+ Not Now ledger~~ **(done, 1.8.0 — ADR-0056)**.

> **Binding condition:** journal **encryption ships in the same commit as the
> journal**, including its exports. It is never retrofitted. If encryption isn't
> ready, the journal isn't ready.

### Could — v2

WAR ingestion (deterministic format-template parser first, AI fallback second,
every update confirmed and provenance-tagged) · Workers-AI rungs · T2 push ·
duration learning · community template loading.

### Won't — named, so they cannot drift back in

These are refusals, not backlog. Each one is a law above, made concrete:

- Sentiment scoring, mood inference, cause attribution (law 7)
- Streaks, chains, completion percentages as motivation (law 5)
- An archive or "missed" bucket of any kind (law 3)
- Telemetry, analytics, crash reporting — anything automatic leaving the device
  (Doctrine §1, §9)
- Any cloud feature without a working offline rung (law 10)
- Gamification, points, mascots, childlike voice
- Social features, sharing-by-default, accounts

**And these, because the evidence went the other way** (V2 stage 7). Each was
either proposed for this app or is standard advice in the surrounding
literature; each is refused on what was actually found rather than on taste, so
that a later session meeting the idea again finds the reason and not just a no.

- **RSD as a distinct entity to design around.** It has no separate diagnostic
  standing and no measure of its own; what is real is emotional dysregulation,
  which the product already answers structurally — no rebuke, no red walls, no
  score. Building a named feature for it would mean the app forming an opinion
  about why somebody feels what they feel, which law 7 forbids outright.
- **"Capture quiets the mind", and the Zeigarnik story it rests on.** The
  original effect is weak and has replicated poorly; the specific claim that
  writing a thing down releases it is not supported. Capture earns its place
  here for a different and defensible reason — the container's guarantee — and
  the app must not promise relief it cannot produce. A promise that does not
  land teaches the reader the app lies about its own effects.
- **Dyslexia fonts.** Controlled comparisons do not find them better than
  ordinary sans-serif faces at the same size and spacing; what helps is size,
  spacing and line length, which are free and already the house style. Shipping
  one would trade a real gain for a signal.
- **"Vary your alarm sounds so they keep working."** Habituation to a cue is
  not what fails here — delay-execute is — and rotating sounds makes the system
  less predictable, which costs the anticipability the whole product rests on.
- **Graded escalation** — nudges that get louder when ignored. Withdrawn from
  clinical guidance for the analogous case (NICE NG206 dropped fixed
  incremental escalation), and it is coercion by another name: the app may
  never raise its own ceiling, and only a person may raise theirs.
- **Mood check-ins of any form.** An introspective question is a demand at the
  moment somebody has least to spend, its answer is the low-validity instrument
  (Toplak/West/Stanovich: 24% of 286 correlations significant, median r = .19),
  and storing it invites exactly the inference law 7 forbids. Capacity is
  DECLARED in four words when the person chooses to, and never asked for.

### Carried forward across tiers

**Duration estimates are logged from v1**, even though duration *learning* is
v2. The feature is late; the data must not be. Logging an estimate costs one
field now and is impossible to backfill later.

### v1 definition of done — the dogfood gate

Not a checklist of features. Thirty **consecutive working days** in which:

- every staff call and walk-in runs from the app's views,
- every suspense lives in the app, and
- the desk paper holds nothing the app doesn't.

Under thirty days, the gate resets. This is the only thing that decides v1 is
finished.

**THE GATE HAS BEEN RUNNING SINCE 0.17.0. IT RESETS CONSTANTLY, AND THAT IS THE
MEASUREMENT.** Corrected 2026-08-03: the dogfood gate has always been running —
the resets are the measurement, and the app not yet carrying a whole day is
what the gate is reporting.

Read that as the instrument reporting, because that is what it is. The gate is
not waiting to be switched on and never was — it has been running every working
day, and **the app has failed it every working day.** The counter sits near zero
not because nobody is counting but because the app cannot survive a day of the
work it was built for.

**A session recorded this backwards for weeks**, and the error is worth keeping:
it read "nothing in the repo counts a day" and concluded *the gate has never
started*, when the true reading was *the gate runs daily and the app keeps
losing*. That is hub LESSONS §23 — "the source gave me null" is not the same
fact as "this is unknowable" — applied to a process instead of to data, and the
checklist item for it (`null-is-not-unknowable`) was already written and already
being ignored. **An absent record of success is not an absent attempt.**

What follows from the correction, and it changes the ordering of everything:

- **There is no "get the gate started" work. There never was.** The work is
  finding out what ends a day, on the day it ends.
- **The failures are the dataset and this repo has none of them.** Every day
  that reset is a defect report nobody wrote down. Sessions have been asking the owner
  for a *promote* and an *on-device pass* — the wrong two questions. The one that
  matters is what stopped the day.
- **This is what the 1.18.0 diagnostic is actually for.** Not tidiness, and not
  §7f compliance: it is the instrument for capturing a bad day while it is
  happening, in text, rather than requiring an essay written in the moment,
  when patience is already gone.

---

## Known and not yet fixed

Defects that have been SEEN and MEASURED, and deliberately left for a later
release. Not questions — nothing here is waiting on a decision, and nothing here
is a thing a session may quietly drop.

**This section exists because there was nowhere else for one to live.** A defect
noticed mid-release was recorded in that release's *what is still not right*,
which is the right place for it and rotates out of view the moment the next
release is cut. *Open questions* is for owner input and `tools/questions.mjs`
refuses anything that is not a question. So a known defect that was not being
fixed today had exactly two homes, one temporary and one wrong.

**It is not gated, and that is worth knowing.** Every ungated list in this repo
has eventually rotted — an entry fixed and never struck out reads as an
outstanding defect forever, which is the same false receipt the Status lines and
the both-directions checks were added to stop. If this grows past a couple of
entries it should get the same treatment: an assertion that each one still
reproduces.

**Nothing outstanding right now** — and the line is here rather than an empty
gap, because a section that has been emptied and a section nobody has written in
look identical.

Struck 2026-08-25, in 3.4.1: *the focus ring on the capture box is clipped, on
every side, by 5px*. It was not only that box. Three scrolling containers cut
every ring that reached their edge — the frame, the runway and every sheet's
body — and the fix is the same 6px in each. The gate that could not see it can
now: `auditFocusRings` builds the ring's own rect and checks it against every
clipping ancestor, and it found ten more the report never mentioned.

## Open questions

Owner input needed. Recorded rather than guessed. **Nothing below has been
decided by a session.**

### Open

**Nothing is open.** All fourteen questions below are closed, and this heading
says so rather than leaving it to be inferred from an empty list — a heading
reading *Open* over three closed questions is the same false receipt the
Status lines were added to fix, one level up. `tools/questions.mjs` refuses a
closed question filed under this heading now, so the two cannot drift again.

### Closed

- **Q-13 · Roles are IDENTITIES that cross multiple areas — how are they
  modelled?** Settled 2026-08-04, answering the roles-vs-areas question
  directly: **a role is an identity, and it crosses multiple areas.** That settles
  V2 decision 9 in the direction the vocabulary genuinely grows — **and rules
  out the cheap answer**: this data model's tree is single-parent, so a thing
  that crosses areas structurally CANNOT be a container. A role is a
  cross-cutting LINK (the shape the feeds relation already has), which means
  role support is a vocabulary addition (a `role` kind plus a link event),
  not a fourth door on stage 4's chooser.
  - **BUILT 2026-08-17 as 2.6.0 (ADR-0096), thirteen days later, and the
    deferral is the lesson rather than the build.** This entry got the model
    exactly right — a role crosses areas, this tree is single-parent, therefore a
    cross-cutting link and never a container — and ADR-0096 is that paragraph
    implemented. **The gate it set was a session's judgement about whether the
    owner had made enough containers yet to justify it, which is not a session's
    call to make about somebody else's planner.** Third instance in one audit,
    after Q-10 and Q-11 (hub LESSONS §96, §97).
  - **Deliberately deferred, with the shape named.** Building role machinery
    now, before a single area or goal exists in the store, repeats the
    eleven-empty-nouns mistake the azimuth check just caught. Stage 4's
    evidence (are containers made at all at two-tap cost?) gates this.
  - **What is NOT deferred:** the mechanism roles will ride is already
    settled — a role node carries its own review clock like any horizon, and
    "when do I review my roles?" is answered by the same
    mountain-comes-to-you return as everything else. When roles land, they
    inherit that for free.
  - Status: **Closed.** BUILT 2026-08-17 as 2.6.0 ([ADR-0096](docs/adr/0096-roles.md)). The model was right thirteen days before it was built, which is the lesson recorded above.
- **Q-11 · No feeling of being shown the right things.** Reported 2026-08-04.
  **THIS ENTRY HAD NO HEADING UNTIL 2026-08-17 and that is most of why it sat.**
  Its text was run on to the end of Q-13's last bullet, so it was not a numbered
  question in the list, did not appear in a scan of the open questions, and could
  be read past by anybody reading Q-13. Thirteen days.
  The two readings need opposite work and the wrong guess wastes a
  release — which is exactly what happened when an earlier session inferred
  "volume" and built `pressureBands` on it.
  - **If ranking:** the wrong items are surfacing, and the fix is in what
    `nextUp` considers (see the azimuth finding below — everything it ranks on
    is temporal).
  - **If trust:** the right items are surfacing and nothing makes that visible.
    The fix is a law-4 analogue of the coverage gauge: a visible
    proof of judgement, the way the gauge is a visible proof of integrity.
  - **CLOSED 2026-08-17 (2.7.0, ADR-0097) — by research, not by asking the owner.**
    The remaining half was a ranking decision, and `docs/nd-collisions.md` entry
    5 had already routed it and gated the routing on this very question. With
    the ranking reading established by measurement, the gate discharged and the
    mechanism was already named: heat breaking the tie inside `ready`. The
    entry also REFUSES the alternative — an importance rank — in terms, which is
    the half that was about to be handed to the owner as a policy question. **A
    question a session cannot answer from taste is not automatically the
    owner's; check whether the research already answered it.**
  - **HALF-ANSWERED 2026-08-17 by measurement rather than by asking (2.5.0,
    ADR-0095), and SUPERSEDED by the close above two hours later.** Kept for the
    measurement, which stands: every tier of `nextup` is temporal and the only
    tie-break inside a tier is pressure then creation order, so the app had no
    notion of what anything is for. Law 4's downward half is now built and both
    readings are served by it. **Its closing claim did not stand** — that what
    remained was a policy decision and the owner's, on whether serving a horizon
    should outrank serving nothing. That is precisely the importance rank entry 5
    refuses in terms, and the refusal was already written when this was typed.
  - Status: **CLOSED 2026-08-17, and this line said otherwise until 2026-08-19.**
    The close is the second bullet above; this line kept saying *asked, not
    answered — and NOBODY PUT THE QUESTION TO THE OWNER* for two days after the
    question stopped being open. **Three files already carried the answer** —
    `docs/nd-collisions.md` entry 5 refuses an importance rank in terms,
    [ADR-0097](docs/adr/0097-the-offer-reads-interest.md) records the refusal as
    the half about to be handed over as a policy question, and `src/nextup.ts`
    says in a comment that *an importance rank is the wrong instrument* and that
    Q-11's ranking reading is established by measurement rather than by asking.
    Q-11 also contains its own argument against the alternative: a loose capture
    is very often the most important thing in the store.
  - **AND THE ORIGINAL STATUS LINE WAS RIGHT ABOUT THE WRONG THING.** It said the
    defect was that nobody put the question to the owner, citing hub LESSONS §96 and
    §97 — a question parked pending information nobody went to get. The
    information was never outside the repo. **A question can be abandoned in the
    other direction too: answered everywhere except in the file that tracks it**,
    where the one line a person scans still says it is waiting on somebody. Four
    places, three saying closed and the loudest saying open.
- **Q-12 · `Not this` records nothing, deliberately. Is that trade still right?**
  Declining a suggestion writes no event, so the app can never keep score — which
  is correct for this audience and is why the rule exists. It also means the app
  can never learn what matters, which is one of the two candidate causes
  of Q-11. The shame-avoidance this protects is a standing design commitment of
  this app (see [`docs/nd-collisions.md`](docs/nd-collisions.md)), not a
  theoretical one; the question is whether "records nothing" is the only way to
  get it.
  - **ANSWERED 2026-08-17 from the research, and the answer is YES — the trade
    stands, and it is now doubly right.** Two independent reasons, neither of
    them taste:
  - **The research forbids the alternative outright.** Learning from declines is
    avoidance data by construction — a decline is the record of a thing not done.
    `nd-collisions.md` entry 2's refusal is *"any avoidance detection — an
    inferred wall is the ledger this app exists to not keep"*, and entry 8
    (demand avoidance) calls this the best-defended collision in the app and
    routes **refuse further building**. An app that learned from what you turned
    down would be keeping exactly the ledger both entries forbid, whether or not
    it ever showed you the tally.
  - **And the thing it was wanted FOR has been supplied by a deliberate signal.**
    Q-12's stated motivation was that the app "can never learn what matters" —
    one of Q-11's two candidate causes. Q-11's ranking cause was then found by
    measurement (ADR-0095): every tier was temporal, and the app had no
    non-temporal signal at all. It has one now — the heat pass, given
    deliberately in a flow that ASKS, read since 2.7.0 (ADR-0097). **A signal
    somebody chose to give is not the same object as a signal inferred from what
    they avoided**, and only the first is compatible with laws 5 and 7. So the
    app can be interest-aware without ever learning from a decline, which is the
    thing this question was actually worried about.
  - **What stays open, and it is narrow:** nothing here says the heat pass is
    answered often enough to be useful in practice. That is a question about use,
    not about design, and it belongs to the on-device pass rather than to a
    session or to the literature. It is also the falsifier ADR-0097 names.
  - Status: **Closed.** The trade is right. `Not this` and `Not now` record
    nothing, forever.


- **Q-14**
  - Question, asked 2026-08-09: is there worth in distinguishing raw input from formed tasks, with a runway for execution, a projects level, an areas / goals / roles / lines-of-effort level, and a stratosphere for amorphous ideas that either get pulled down to where they can drive action or are allowed to disappear?
  - **Answer: every one of those already exists, and the record already argues against adding more.** This was a question about a thing that is built, so the useful part of the answer is where each piece is.
  - **The altitudes are `src/events.ts`'s node kinds.** `action`, `outcome`, `project`, `area`, `goal` — runway through thirty thousand feet. Raw input is already distinguished from formed work by the `unclarified` inbox state rather than by a kind, which is the better place for it: it is a state a thing leaves, not a floor it lives on.
  - **The stratosphere is `aspiration`.** It sits on the Menu and **cannot carry a clock** (law 6) — which is exactly "amorphous, not driving action, not nagging you". Pulling one down to where it can drive action is ordinary parenting; there is no separate promotion machinery and there should not be.
  - **"Allowed to disappear" shipped in 1.32.0** as `node.released` / `node.reclaimed` — an exit that is neither done nor deleted, reversible, leaving no browsable pile and no count. That was built precisely because law 1 otherwise guarantees perpetual return, and the only reset people actually reach for is deleting the app.
  - **Roles and lines-of-effort have a settled SHAPE and are deliberately deferred** — see Q-13. A role crosses areas, and this tree is single-parent, so it is a cross-cutting link and never a container. The deferral is the same one, on the same grounds.
  - **What is genuinely unbuilt is the projection, not the levels.** `docs/horizon-models.md` says so: the review exceptions (stalled, orphan, quiet area, unfed goal) are computed in `src/review.ts` and **do not reach the surfacing layer**, and a runway card does not print what it serves even though 1.20.0's place line already walks lineage on a different edge. That is law 4's other half — higher horizons project *downward* — and it is the thing worth building.
  - **And it is deferred on purpose.** It renders nothing until a real store contains a goal or an area. `docs/horizon-models.md` already names "promote-buttons for empty altitude nouns" as alignment theatre and refuses it; building the projection now would be the eleven-empty-nouns mistake for a third time. **The gate on it is evidence, not appetite:** whether containers get made at all once making one costs two taps.

  - Status: **Closed.** Answered 2026-08-09 — every altitude asked about already existed. What is genuinely unbuilt is the projection, deferred on purpose until a real store holds a goal or an area.
- **Q-10**
  - Question: Nothing in this app scopes a projection by vault. Should it?
  - Asked 2026-07-29: whether a second vault is for home tasks, and whether the app already separates work tasks some other way.
  - Answer, in two parts. **First, the fact:** no. The vault is hard-coded to `personal` in `session.ts`, there is **no control anywhere to create or switch one** (zero references in `index.html`), and no projection filters by it. Every event carries the field and nothing has ever read it. There is no work/home separation in this app by that mechanism or any other name for it.
  - **What does separate things, as of this morning:** containment (0.13.0). A "Work" project or area and a "Home" one, with things put under them. That is real, it is shipped, and the owner can use it today.
  - **Recommendation, and it is against building the vault:** what is described wants a **lens** — a filter you switch on and off over one list — and not a partition. A hard vault split forces Next up to pick a side, and *"one thing, chosen for you"* across the whole of someone's life is the app's central promise. Two vaults are two apps, and then you have to remember to check both, which is exactly the failure this app exists to prevent. A lens keeps one queue underneath and one coverage gauge that still reads zero.
  - **Binding constraint if a lens is built:** law 1 does not bend for it. A thing filtered out of view still has its clock and still comes back — a filter may change what you are looking at and may never change what the app is holding. Anything else is an archive with a friendlier name (law 3).
  - Status: **Closed as a decision not to build vaults.** The `vault` field stays in the log (it costs nothing, it is already in every event, and removing it would be a destructive schema change for no gain). A Home/Work lens is a candidate for v1.5 whenever the requirement arrives; containment covers the case in the meantime.
  - **BUILT 2026-08-17, nineteen days later, as contexts (2.2.0, ADR-0092) — and the delay is the lesson, not the build.** This entry got the design right and wrote it down: a filter over one list rather than a partition, with law 1 unbent. ADR-0092's decision and its central rule are that paragraph, restated by a session that did not know this entry existed.
  - **What went wrong is the SHAPE of the close.** The question was answered about the MECHANISM that had been guessed at — vaults — and the thing actually needed was parked as "a candidate for v1.5". A numbered question with a Status line reads as settled, so nineteen days of sessions read this, saw "Closed", and moved on. The answer was correct and the requirement was still lost.
  - **It was nearly lost a third time.** ADR-0092's first draft stated that contexts appeared nowhere in the record. That came from searching for `context`, `@home` and `@work` — the vocabulary of the feature — while this entry is written in the vocabulary of the question: vault, lens, home, work. **The search that missed it is the same translation that lost it.** Corrected on being asked directly whether home vs work had ever been raised. (Hub LESSONS §96.)
- **Q-06**
  - Question: The astro app's naming was inconsistent — repo and URL said `clear-horizons`, the hub displayed **"Astro Planner"**, and the name The choice was appeared nowhere a visitor saw.
  - Answer: **The astro app is named Clear Horizons**, settled 2026-07-29. The app itself already used the name throughout (title, og tags, manifest); only the hub's two entries were stale, and both are fixed (`noahjefferson` @ `004fddd`). Nothing in the `clear-horizons` repo needed changing.
  - Status: **Closed.** The astro app is Clear Horizons, settled 2026-07-29.
- **Q-07**
  - Question: The hub undersold the astro app — the tile read *"Clear-sky & Seestar target windows"* and never mentioned recording your horizon, which the owner says is the thing no other astro app does.
  - Answer: **Closed with Q-06.** The tile now reads *"Plan your night against your real treeline, not a flat 0°"*, taken from the app's own README rather than invented.
  - Status: **Closed.** Closed with Q-06 — the hub tile now states what the app is for.
- **Q-01**
  - Question: Licence — brief said AGPL, Doctrine §8 says PolyForm Noncommercial
  - Answer: **PolyForm NC 1.0.0.** Confirmed 2026-07-27 as doctrinally correct. [ADR-0017](docs/adr/0017-licensing.md) is Accepted.
  - Status: **Closed.** PolyForm Noncommercial 1.0.0, [ADR-0017](docs/adr/0017-licensing.md).
- **Q-03**
  - Question: Work-vault policy line, given the GFE context
  - Answer: **No GFE context — the app is not for it.** The vault split is a convenience for separating content; what goes in it is the user's judgement, as with any personal app. The owner 2026-07-27.
  - Status: **Closed.** There is no GFE context and the app is not for it, so the question did not apply.
- **Q-05**
  - Question: Terminology skin default for the work vault
  - Answer: **Neutral vocabulary, skin opt-in.** The owner 2026-07-27. Matches what shipped.
  - Status: **Closed.** Neutral vocabulary, skin opt-in, and that is what shipped.
- **Q-08**
  - Question: How "Wynts" is pronounced
  - Answer: **Moot** — the name is withdrawn. The question was the right one; nobody answered it in time to catch that both readings were bad.
  - Status: **Closed.** Moot: the name was withdrawn, so the pronunciation stopped mattering. The question was the right one and nobody answered it in time to catch that both readings were bad.
- **Q-02**
  - Question: The app's name
  - Answer: **Quietkeep.** Chosen 2026-07-28, with nothing near it visible on the App Store. Cleared through all five checks — [ADR-0024](docs/adr/0024-name-quietkeep.md), [V-04](docs/verifications.md).
  - Status: **Closed.** The name is Quietkeep, [ADR-0024](docs/adr/0024-name-quietkeep.md).
- **Q-09**
  - Question: The four §10 repo-metadata values
  - Answer: **All four set, 2026-07-28.** Description, website, topics (`indexeddb` corrected during the pass), and the **social preview uploaded**. Per §10 the repo is now *set up* — and the confirmation **is** the verification: a session cannot read this repo's live metadata at all ([V-11](docs/verifications.md)).
  - Status: **Closed.** All four metadata values set 2026-07-28, per Doctrine §10.
- **Q-04**
  - Question: Pages subdomain string
  - Answer: **`quietkeep.pages.dev`** — Confirmed clean on-device, 2026-07-28. Production comes off `main`; `staging` gets `staging.quietkeep.pages.dev`, which turns the Doctrine §7 gate into a URL that opens on the iPad. The metadata half of this question is now **Q-09**, because it is a different kind of answer and was hiding behind the subdomain.

  - Status: **Closed.** `quietkeep.pages.dev`, confirmed on the device 2026-07-28.
---

## Project facts

- **Reference platform: a personal iPad**, installed to the Home Screen from Safari
  (2026-07-27). Every budget is measured there and every surface is designed for
  it first. Desktop is secondary.
- **This is a personal app and is not for government-furnished equipment.** Not
  designed for it, not tested on it, not a control for restricted information. Stated
  plainly in [`docs/data-constitution.md`](docs/data-constitution.md).
- **The folder mirror does not exist on the reference platform** — Safari has no disk
  picker. Export/import via Files carries the whole sync and durability story
  ([ADR-0004](docs/adr/0004-ios-path.md)), which is why it is built in Phase 0.
- **The app is Quietkeep** ([ADR-0024](docs/adr/0024-name-quietkeep.md)), and the repo is
  `njefferson/Quietkeep` as of 2026-07-28. The licence's Required Notice URL moved with the
  slug in the same commit, which is the condition [ADR-0017](docs/adr/0017-licensing.md)
  set. `Horizons` survives only as *domain* vocabulary — *higher horizons* (law 4) and the
  *horizon-integrity engine* — and `changelog:check` asserts it was not lost to a rename.
- **Phase 0 (the spine) is built** — log, fold, write gate, snapshot, export/import, 14
  tests, all four exit criteria met.
- **Where `main` is NOW lives in the Log below** — the newest promote entry is
  the live fact. The entries that follow here are the early promote history,
  kept as written. (Corrected 1.17.4: the first of them still read as the
  present tense — "`main` is at 0.11.0" — fourteen promotes later.)
- **Previously `main` was at `0.11.0` (`af2e415`), promoted 2026-07-29** — the owner's word to promote,
  onto watched-green **spine run 57** (all 13 steps read individually) with
  **deploy run 54** watched to success. Carries **0.10.0** (bringing a copy
  back), **0.10.1** (the do-now flow, the panel's close and calendar
  confirmation, and the CRITICAL import fix) and **0.11.0** (two devices).
  · Same limit as every promote here: production itself was not read. See
  [V-15](docs/verifications.md) — `quietkeep.pages.dev` is denied by this
  environment's network policy, so the evidence is the deploy run's own green
  Cloudflare step and not the apex URL serving the file.
- **Previously `main` was at `0.9.0` (`6252d26`), promoted 2026-07-29** — the owner's word to promote and
  continue", onto watched-green **spine run 51** (all 13 steps opened and read, not
  inferred), then **deploy run 48** watched to success, its Cloudflare Pages step
  green. This promote carries three releases at once: **0.8.0** (the calendar file —
  the app can reach you when it is closed), **0.8.1**, and **0.9.0** (a passed date
  becomes a decision).
  · **What was NOT verified, and could not be from here:** the live site itself.
  `quietkeep.pages.dev` is denied by this environment's network policy (the proxy
  answers 403 to CONNECT), so the fetch that would have read the deployed `sw.js`
  cache triplet was not possible. The evidence for this promote is the deploy run's
  own green Cloudflare step, which is weaker than a fetch and is recorded as such.
  Earlier promotes in this repo were confirmed the same way; none has been confirmed
  by reading production from a session.
- **Previously `main` was at `0.7.2` (`0bc4040`), promoted 2026-07-29** — the owner's word to promote and
  continue", onto watched-green spine run 45. Production serves the grouped todo list,
  inline tick-off, rename, and the second skeptic's fixes.
- **Previously `main` was at `0.7.1` (`fae1b7a`)** — the owner's word to promote and
  continue", onto watched-green spine run 42. Production now serves the grouped todo
  list, inline tick-off, rename, and the Phase 3.5 audit fixes.
  · **A file was committed that should not have been.** `git add -A` in the 0.7.1 commit
  swept up `tools/.pz.mjs`, a probe script an auditing subagent had written into the repo
  while the audit ran. It is in `main`'s **history** (`fafa0ff`), removed from the tree
  before the promote, and was never in `public/`, so it was never served. No gate caught
  it, because no gate asks "is every tracked file supposed to be here". Recorded in the
  hub's LESSONS: a working tree with concurrent writers is not safe to stage wholesale.
- **Previously `main` was at `0.6.0` (`392372f`), promoted 2026-07-29** — the owner's word to promote and keep
  going, onto watched-green spine run 38; deploy run 35 confirmed production serves it.
  This promote carried **0.5.1**, which fixed a fault that was live in production: one
  malformed date threw out of the render path before capture's submit handler was
  attached, so the form fell back to a native GET navigation and destroyed typed text
  silently. Earlier real §7 passes: `87dbeb9` (0.4.0, run 31), `d4b40f7` (0.3.0, run 28),
  `265c9f0` (0.2.4, run 25).
  Every one of those was verified by fetch and by opening the run, never inferred (V-10).
- **Repo:** `njefferson/Quietkeep` (renamed 2026-07-28). Branches `staging` and `main` only; ignore any
  harness `claude/*` branch (Doctrine §11).
- **Deploy:** Cloudflare Pages, project `quietkeep`, live. The credential is stored as
  **`CLOUDFLARE_API_KEY`** (the workflow accepts either that or `CLOUDFLARE_API_TOKEN` and
  logs which name it found). `main` → `quietkeep.pages.dev`, `staging` →
  `staging.quietkeep.pages.dev`. Both have deployed successfully from CI.
  The versions on each are stated once, under **Staged and waiting on the owner**
  below — not here as well.
- **PRODUCTION HAS BEEN READ — [V-15](docs/verifications.md) is CLOSED,
  2026-08-04.** The owner's §7f diagnostic, taken on the instance installed on the
  home screen and confirmed to be the plain production sync host, reported
  `Service worker cache: quietkeep-sync-1.18.0` — read from live Cache Storage,
  per-origin, created by the `sw.js` the browser fetched, whose name is derived
  from the release triplet by `tools/editions.mjs:132`. The deployed `sw.js` on
  production carries the released triplet. **The caveat attached to all six
  promotes in this repo is retired**, and every promote after this is confirmed
  by one paste rather than by a green deploy step.
- **SUPERSEDED 2026-08-27: a session CAN read the deployed hosts, when the
  session has been given `*.pages.dev`.** The entry below was accurate for the
  container it was written in and is not a standing fact. With the host on the
  session's egress allowlist, all three answer 200 and were read directly:
  staging 3.7.0, production 3.6.1, the sync edition 3.6.1. **Try it — it costs
  one request.** The old "do not re-test" instruction is withdrawn; it outlived
  the condition it described, which is the failure mode this file exists to catch.
  **REACHABILITY IS SESSION CONFIGURATION, NOT A PROPERTY OF THIS TREE**, so
  `tools/deployed-check.mjs` treats an unreachable host as a SKIP with the reason
  printed. A gate that goes red because of how a container was configured teaches
  people to ignore red.
  **TWO TRAPS, both of which bit before the tool worked.** Node's built-in
  `fetch` does not read `HTTPS_PROXY` unless `NODE_USE_ENV_PROXY=1` is set
  BEFORE startup — setting it in-process is too late — and without it every
  request returns 403 with an allowlist message in the body, which reads exactly
  like the host being blocked rather than the client not asking properly. `curl`
  was answering 200 for the same URL at the same moment. The tool re-execs itself
  rather than depend on how it was invoked.
  **AND A 200 PROVES NOTHING.** Cloudflare Pages serves the root document for any
  unknown path, so a page that does not exist answers 200 with the whole app
  inside it — production returns 200 for `/paths`, which it does not have. Every
  assertion reads CONTENT. The first version identified the shell by a typed
  `<title>Quietkeep</title>`, which is the default edition's title and not the
  sync edition's, and so reported a 185KB page the sync host does not have. It
  asks the host for its own root document now and compares against that.
- **The 2026-08-03 finding, kept because it was true then:** every `pages.dev`
  host was refused 403 at CONNECT in a fresh container after an earlier grant,
  including `noahjefferson.pages.dev`, while GitHub and the package registries
  answered normally. The grant was not reaching sessions; the "policy binds at
  container start" theory was falsified by a container thirty-nine seconds old.
  It stopped blocking anything because the app carries the instrument (§7f) — and
  the route it recommended, putting the check where the device runs it, is still
  the one that works with no session configuration at all.
- **`main` was promoted to troubleshoot, and it worked** (promoted on the owner's word). Nothing would load on the iPad at the time, so the §7 pass could
  not happen first. The promote gave the Pages project its **first production deployment**,
  the apex URL came up, and the pass then happened on the real device — captured,
  force-quit, reopened, data intact. `main` reached a fair state in the wrong order, which
  is recorded rather than tidied away, but the promote was the right call and it was the owner's.
- **Normal flow resumes:** `staging` branches off `main` for future development, promoted
  on the owner's word (Doctrine §7). `main` is the baseline.
- **Hub wiring: DONE.** The hub links Quietkeep — verified against
  `noahjefferson/public/index.html` (the apps list and the icon grid both
  carry `quietkeep.pages.dev`), and the app's ⓘ panel links back to the shared
  `/accessibility` statement. (Corrected 1.17.4: this fact still said "not
  yet linked... held until there is a deployed page to visit" long after both
  halves had landed — the seam audit's record-drift pass caught it.)
- **Repo metadata: all four §10 values are set** — description, website, topics, social
  preview (2026-07-28). **Quietkeep's repo is "set up"**, and this is the first time
  that can be said without a caveat. The owner's confirmation is the verification and there is no
  other: a session cannot read this repo's live metadata — the search API serves a stale
  cached index and the direct API 403s through the proxy ([V-11](docs/verifications.md)).
- **Brand:** the mark is `public/brand/icon.svg` — drawn, not generated, because an icon is
  geometry and 48px legibility has to be measured rather than hoped for
  ([ADR-0025](docs/adr/0025-visual-identity.md)). All PNG sizes render from it via
  `tools/brand.mjs`, which is a CI gate and was made to fail once before being trusted. The
  palette and its measured ratios are `ACCESSIBILITY.md` B-10.
- **Code:** Phase 0 spine, Phase 1 (shell, Dump surface, ⓘ panel, export, public capture
  surfaces + CSP), Phase 2 (triage), Phase 3 (work mode), Phase 3.5 (detail sheet, the
  grouped todo list, rename) — and everything the Log records since.
  `staging` → `staging.quietkeep.pages.dev`, `main` → `quietkeep.pages.dev`, both live.
  (Corrected 1.17.4: this fact still pinned "`main` is at 0.6.0; `staging`
  carries 0.7.0" — the Log below is the live record of where the branches are.)
- **UI is the platform, no framework**, and there is exactly one build step — esbuild,
  stripping types and bundling `src/ui` to `public/app.js`, which is generated and not
  committed ([ADR-0026](docs/adr/0026-ui-and-build.md)).
- **`npm run smoke`** is a gate: a headless walk of the *built* app that captures a
  thought, reloads the whole page, and asserts it came back. It was made to fail once
  before being trusted.

### Arriving with a dump is a MAIN ENTRANCE, not a migration

Stated as a design fact on 2026-08-24, because everything about the import path
had been built as though it were a one-time migration from somewhere else.

**It is the ordinary way this app gets used.** Somebody focuses elsewhere for a
stretch, comes back not knowing where they are, and arrives holding a text file.
That is not a first-run event that happens once and is over; it is the same
shape as re-entry (ADR-0043) with a file attached, and it will recur.

What follows from it, and none of it is gated on any one person's use:

- **The import summary is a first-run screen**, read at the moment somebody has
  the least patience and the least idea what they are looking at. Every rule
  about first-run copy applies to it.
- **Everything the app does for re-entry belongs there too.** *Welcome back*
  exists for the person who has been away; the importer serves the same person
  on the same day, and the two currently know nothing about each other.
- **Loss at the door is the expensive kind.** A label discarded on import is
  discovered weeks later, if ever — which is exactly how tags, estimates and
  flags each came to be dropped with a sentence nobody could act on.

**Measured on a real export, 2026-08-24**, which is what turned this from an
impression into a fact: 1,445 rows, 45 projects, 21 distinct tags applied to 93
rows — 6.4% — of which 8 were places and 13 were people, topics, a waiting state
and a priority. 216 rows already finished. 1,173 dates already gone by. No
durations at all. A store that is 88% flat is not a badly-kept store; it is what
a real one looks like, and the fixture was three-quarters filed until 2.32.0.

### Staged and waiting on the owner
- **Superseded, and kept for the record: 3.5.1.** Promoted 2026-08-26 at
  `ac0d40e`, Deploy and Spine both green on that exact SHA — the Deploy only
  after a fresh dispatch, because the push-triggered run failed at startup and
  re-running it reproduced that.
- **https://staging.quietkeep.pages.dev** — the candidate, **3.8.0**. The
  browser's own suggestion popup is off all three of the detail sheet's naming
  fields, what you already have is a row of taps, commas make separate labels,
  and a label typed wrong comes out where it was typed.
  **THE POPUP TOOK THE CARET OUT OF THE FIELD MID-WORD, REPEATEDLY**, on the
  device this app is used on, which ended a labelling session rather than
  slowing one down. It was a native `<datalist>` on three fields, and it was the
  only control on any surface in this app that `tools/a11y.mjs` structurally
  could not measure — the browser draws it, over the keyboard, and nothing here
  can read its colours, its targets or its ring. What replaced it is a row of
  `.linklike` buttons that reuse a measured colour pair and joined the gate in
  the same commit, as two driven states rather than one, because the same
  buttons wear different WORDS in the two modes and words are what SC 2.5.3
  reads.
  **THE FIELD HAD INSTRUCTED THE MISTAKE IT THEN COULD NOT UNDO.** The
  placeholder has read `at home, out, on the phone` since 2.2.0 and the whole
  string went in as ONE label — so following the app's own example produced a
  place named after the example. Removing it worked and lived in the situation
  sheet, behind choosing that label as where you are: two rooms from the field
  that makes the mistake. Both halves fixed — `src/names.ts` splits on commas,
  and *Something here is not a place* sits under the row.
  **WHAT IS NAMED AS STILL BROKEN, in the notes rather than left quiet:** heat
  only breaks a tie inside the `ready` tier (`src/nextup.ts:672`). A capture
  that is heated but not routed sits in `unsorted`, where heat is never
  consulted — so on a store of 33 captures with 33 heat answers and 10 routed,
  23 of those answers moved nothing. And *cold is never hidden* is true in the
  code and stated nowhere a reader can see it.
  **FOUND WHILE HERE AND DELIBERATELY NOT FIXED IN THIS RELEASE — hub LESSONS
  175 binds on this repo.** `openSheet` in `src/ui/sheets.ts` and `showNode` in
  `src/ui/detail.ts` call `showModal()` and set no focus target, so which element
  the dialog opens on is the engine's choice. Chromium makes a scrolling region
  focusable in its own right and lands on the body at scroll zero; WebKit does
  not, and takes the first tabbable element instead — which scrolls the sheet to
  wherever that element happens to be. This app is read on an iPad, and every
  walk here drives Chromium, which is the one engine where the defect cannot
  appear. `tour.ts`, `replan.ts` and `focus.ts` already focus their heading, so
  the pattern exists in this repo and two surfaces are missing it. The assertion
  to add is about what the code DECIDED — `activeElement` by name — because the
  symptom assertion is exactly the one that cannot fail in Chromium.
- **Superseded, and kept for the record: 3.7.1.** The capture
  box is the first thing on the screen, and the ring check works out for itself
  what to look at.
  **THE BOX YOU PUT THINGS IN WAS THIRD.** *Everything else* and *On this page*
  sat above it — two ways of leaving, before the thing the app is for. Reported
  from a device in those words, and the code already agreed: the comment beside
  the capture form reads *"Capture first, and it is the thing that has focus on
  arrival."* It had the focus. It was third. The screen is what a reader gets.
  **THE FIRST PLACEMENT WAS REFUSED BY THE APP'S OWN WALK** — the moved pair
  butted against the coverage control at 0px, measured rather than eyeballed,
  which is the "no two controls touch" rule and a mis-tap on a finger.
  **AND `controls.mjs` REFUSED THE COMMIT UNTIL THE MOVE WAS NAMED** in the
  release notes, in place-language, carrying the control's own name. It was right
  to: updating the manifest alone is bookkeeping, and the person whose hands have
  to relearn the screen is the one owed the sentence.
  **EIGHTEEN OF 112 AUDITED STATES HAD NO FOCUS-RING PASS.** Not a judgement that
  their rings did not matter — `auditFocusRings` took a hand-written selector
  list, so a state was covered only if somebody wrote one, and nobody had decided
  anything. The list WAS the gap, and the release notes had described it as "the
  screens the automated walk visits", which reads as a limit of the walk and was
  really a limit of who had got round to it. It derives its own controls now: id
  where there is one, else the element's own class, because a class matching
  several instances still measures the one CSS rule that draws the ring. 786 ring
  assertions with ids only, **836** with both. `surfaces.mjs` holds the audited
  set equal to the ringed set, planted by deleting one pass and caught by name.
  **THE WIDER COVERAGE FOUND A REAL DEFECT.** `.sheet-body` carries
  `tabindex="0"` so a sheet with nothing focusable inside can still be scrolled
  from a keyboard — which makes the box a tab stop with a ring of its own, and it
  was clipped 4px horizontally by the dialog in both themes, because its margin
  deliberately runs 20px past the panel's padding so the scrollbar sits at the
  edge. Drawn inside the container now: a full-width scroller has nowhere outside
  to put a ring.
- **Superseded, and kept for the record: 3.7.0.** The
  flowcharts ship as a page, linked from Help, and are measured when they change.
  **SHIPPING IT WAS NOT A FILE COPY.** The site's CSP is `style-src 'self';
  font-src 'self'`, so the self-contained source — inline `<style>`, two Google
  faces — would have rendered as unstyled markup in whatever font the browser
  chose. `thesis.mjs` records that exact failure from 1.7.2. So `tools/paths.mjs`
  splits the source into `public/paths.html` + `public/paths.css`, gated by
  `paths:check`, and the source dropped its webfonts entirely rather than run two
  typographic realities. The page now makes no network request at all.
  **MEASURED WHEN IT CHANGES, NOT ON EVERY RUN**, which is the shape asked for. A
  static document shares no code with the app and cannot regress from an app
  change. `tools/paths-a11y.mjs` stamps on its own content: unchanged it exits in
  0.3s and says so; changed it walks both themes at 390px and 320px/200%. Proven
  both ways before landing.
  **IT SERVES THE PAGE UNDER THE REAL HEADERS**, which took two attempts: both
  forms of Playwright's script injection are inline and `script-src 'self'`
  refuses them, `path` included. Axe is served as a same-origin file instead. The
  alternative — relaxing the CSP for the walk — measures a page that does not
  ship.
  **ITS FIRST RUN FOUND THE PAGE'S OWN LINKS AT 16–21px** against the 24px floor
  (WCAG 2.5.8). Fixed with `inline-flex` and a min-height, not block padding, so
  they still wrap as a list of words.
  **AND THE APP'S OWN WALK REFUSED THE FIRST PLACEMENT.** Linked from the footer,
  three links in that line wrapped at phone width into two 44px boxes stacked
  with zero gap — a mis-tap. The footer's own comment already recorded it sitting
  one over its ceiling. Moved to Help, where somebody looks for this anyway; a
  reference page is not chrome. The Help copy then blew two size budgets and was
  cut rather than accommodated, landing at **3699 words against a 3700 budget** —
  one word of headroom, which is worth knowing before adding a sentence anywhere.
  **AND THEN THE OLDER PAGES WERE MEASURED TOO**, the same day. The
  walk generalised from one page to every hosted page the app LINKS to, derived
  from `index.html` rather than listed, each stamped on its own content so
  changing one walks one. `manual.html` and `why.html` had shipped since 2.29.0
  unmeasured; both pass. `plan.html` is excluded BY THE RULE rather than by an
  exception — it is `noindex`, linked from nowhere, and its own header says it
  joins the moment it gains a route from the app.
  **ITS FIRST RUN OVER THE OLD PAGES FLAGGED FOUR LINKS, AND THE CHECK WAS
  WRONG.** All four were citations inside sentences — *"…rather than by a sweep
  (ADR-0011)."* — and WCAG 2.5.8 states an *Inline* exception for exactly that.
  Padding a word mid-paragraph to satisfy a rule that does not apply would have
  damaged two pages to please a gate. The exception is honoured structurally now:
  `display: inline` plus a parent holding text that is not the link. **A gate
  that fires on honest writing is worse than a miss**, because it also trains
  somebody to change good pages — and the same run proved it is not vacuous: a
  planted 14px standalone link was caught, while the other two pages correctly
  printed as unchanged and were not walked at all.
  **AND NOTHING ASSERTED THE WORKER CACHES THEM.** `help-check` now derives the
  list from the app's own links: a linked page missing from `SHELL` does not just
  miss offline, it falls back to the app shell and lands the reader elsewhere
  (the 1.7.2 defect). `plan.html` passes by being `noindex` and linked nowhere.
- **Superseded, and kept for the record: 3.6.2.** The words the help quotes are
  held to the words the app says.
  **THREE HELP SURFACES NAMED A BUTTON THAT DID NOT EXIST, AND EVERY GATE WAS
  GREEN.** 3.6.1 renamed one control. `manual.mjs --check` proved the manual page
  matched its source; `manual-coverage.mjs` proved every surface was named. Both
  passed, because neither reads the words ON a control, and neither has ever
  looked at the walkthrough or the flowcharts at all. The flowcharts page had
  been rebuilt and republished the same day and still said the old name.
  **`tools/help-check.mjs` reads each set from the source that DEFINES it** —
  routes from `clarify.ts`, container words from `tree.ts`, kind words from
  `kind-words.ts`, destinations and the tree label from `index.html` — and never
  restates one, because a list typed into a checker is the second copy the
  checker exists to prevent.
  **ITS FIRST RUN FOUND FOUR THINGS AND TWO OF THEM WERE THE GATE'S OWN
  DECLARATIONS.** Real: the flowcharts named three of the four container kinds
  (no *Outcome*), and the manual listed a sorting choice as *do it now* for a
  button marked **Do now**. Not real: a coverage row claiming the flowcharts
  enumerate all seven destinations, which they do not and never claimed to. A row
  in that table is an assertion about a file, not a wish for one.
  **PLANTED THREE WAYS**: a route renamed in the app (caught in all three help
  surfaces by name), the tree label renamed (caught in two), and a retired name
  crept back into help unmarked (caught in both directions at once).
  **A HELP PAGE MAY STILL SAY WHAT A THING USED TO BE CALLED**, inside
  `<span data-was>`. Per-mention and visible in the markup — a whole-file
  exemption is where the privacy gate's material collected, and green there meant
  *not looked at*.
  **`docs/paths.html` IS IN THE REPO NOW.** The flowcharts were living in a
  scratchpad that was cleared three times in one session; in the repo they are
  version controlled and gateable. Deliberately NOT in `public/`: shipping it
  would make it a surface owing the a11y walk, and that is a product decision
  nobody has made.
- **Superseded, and kept for the record: 3.6.1.** The tree is called
  *Your projects, areas and goals*.
  **THE LABEL WAS THE HALF 3.6.0 DID NOT FIX, AND IT IS THE HALF THAT DECIDES.**
  3.6.0 made every row in the tree say its kind and left the button reading *How
  it hangs together*, on the reasoning that the surface now answered the question
  once you were inside it. You have to already be inside to read a row. The
  report that started this came from somebody standing ON the surface that holds
  that button, asking where their project was — they did not press it, because
  the label does not answer that question. A label decides whether a screen is
  opened at all, which is the one thing the rows inside it cannot do.
  **NOT *PROJECTS*.** The surface holds goals and areas too, so that name is
  untrue about two of the three, and a label reading like a place to work invites
  exactly the climb law 4 refuses. *Your projects, areas and goals* carries the
  word somebody would look for, stays true, and matches the *Your data* form the
  app already uses for a destination behind a button.
  **NOTHING WAS OVERTURNED.** No ADR ever named that label — checked before
  changing it. It was never a decision, only a phrase that stayed for 140
  releases.
  **THE 3.6.0 NOTES WERE LEFT EXACTLY AS THEY WERE**, including the line saying
  there is no screen called Projects and that whether the name changes is a
  decision. That was true of 3.6.0, and the record says what was true when it was
  written; the next release answering it is how a changelog is supposed to read.
  Rewriting a shipped release's notes to match a later decision is the
  falsification this repo refuses everywhere else.
  **AND THE UNCOMMITTED FIRST ATTEMPT AT THIS RELEASE WAS DESTROYED BY A
  MISDIRECTED RESET.** A `cd` into the hub in one shell call did not persist into
  the next, so `git reset --hard origin/main` — written for the hub — ran here
  and discarded every uncommitted file of it. Nothing committed was at risk and
  the work was reproduced from the same sources. The rule it cost: **a destructive
  git command names its repo by absolute path or `-C`, never by an assumed working
  directory.**
- **Superseded, and kept for the record: 3.6.0.** The line that says where a
  thing sits became a door, and the tree started saying what each row is.
  **THERE WAS NO ROUTE UPWARD AT ALL.** Reported from a device: something was
  made into a container by filing a task under it, and then there was no way to
  see the container. Accurate as stated. The sheet lists what is UNDER a node and
  every one of those rows has been a door since 1.6.0; the line naming the parent
  was `textContent` on a `<p>`. So the app named a place and offered no way to
  reach it — 3.5.2's Close defect one degree further along, where the control was
  not merely wired to nothing but was never a control.
  **LAW 4 IS THE OBJECTION AND IT DOES NOT HOLD.** "The user never climbs" is
  about ALTITUDE — nobody walks a hierarchy to plan a day, and the runway is
  still the only workspace. The law's own amendment in this file records it being
  misread as a rule about navigation and then cited to refuse a route on a page
  measured at three screens. `serves.ts` is the case that genuinely is
  descriptive; a parent one hop up is not that. ADR-0112.
  **AND THE APP TAUGHT THAT WORD.** `CONTAINER_ORDER` says *Project — work with
  steps* when somebody makes one, and `containerOptionWords` says *project* again
  when they file something under one. Then the tree — the one surface whose whole
  job is listing containers — drew every row as a bare indented title. So the
  vocabulary a reader asks in is the vocabulary the app issued and then dropped. Three of
  the four container-listing surfaces already used `KIND_WORDS`; the fourth now
  does. No new surface: `horizons.ts` refuses project rows on reasoning that
  holds, and a page listing 43 of them is the tree by another name.
  **THE PLANT.** The place line was reverted to prose, rebuilt, and the smoke
  walk run: three assertions red, and the walk continued past them. The first
  form of the gate did NOT continue — the unguarded click timed out and took
  every later section down with it, reporting one failure where there were three.
  A gate that hides the other gates when it fires is LESSONS 139 with the sign
  flipped, so the press is guarded.
  **AND THE COLOUR THE GATE MEASURED WAS NOT THE COLOUR ON SCREEN.** The
  paragraph carries `--ink-soft`; the button inside it carries `--accent`. The
  a11y registry named only `#detail-place`, so it would have measured a token no
  longer rendered there and reported green — hub LESSONS 142's shape. Registered
  separately, measured at 10.07:1 light and 8.21:1 dark, with the ring pass added
  to a state that had contrast, axe, names and targets and no rings.
- **Superseded, and kept for the record: 3.5.2.** Promoted 2026-08-27 at
  `04562b5`, Deploy success on that exact SHA with both editions published — the
  Cloudflare step ran 5s and the Sync step 6s, read from the job's steps rather
  than from the run's conclusion, because a guard's skip branch also concludes
  success. The way out of the Colours sheet was wired to nothing, and tapping a
  colour is now the whole decision.
  **THE CLOSE BUTTON DID NOTHING AT ALL.** Reported from a device as the window
  not closing, and that is exactly what it was: `about.ts` drove `wireSheetClose`
  from a HAND-TYPED LIST OF FIVE SHEET IDS, and 3.5.1 added a sixth destination
  without typing it in. Present, correctly sized, correctly placed, connected to
  nothing. Derived from the doors now — `.more-go[data-go]` — so a destination
  cannot arrive without its way out. Hub LESSONS 141 is the same shape, and it
  was written in this repo before this happened.
  **EVERY GATE STAYED GREEN THROUGH IT**, which is the more useful half. The
  way-out gate asserts each dialog DECLARES a way out and that the way out sits
  outside the box that scrolls — both true here. The a11y walk measured that
  button's contrast, its target size and its focus ring. Nothing anywhere pressed
  it. The smoke walk presses every way out now and asserts the surface actually
  leaves; planted by restoring the hand-typed list, and it named the exact
  surface and the exact button.
  **Tapping a set of colours is the whole decision now.** The *Set the colours*
  button is gone. It was indefensible once the pictures arrived: tapping already
  repainted the app, so the confirm changed nothing visible, and a confirm with
  no visible effect reads as a control that does not work. The alternative —
  stop previewing until the press — would have thrown away the reason the tiles
  exist. Controls budget went DOWN, 259 to 258.
  **And leaving a mode or text size without pressing Set puts them back.** All
  three view preferences shared one shape: preview on change, persist on the
  press, so leaving without confirming kept the preview on screen while the store
  remembered something else. Only the colour one was reported because only the
  colour one is impossible to miss. Registered on the native `close` event, so
  Escape and the backdrop revert the same as the button.
  **Still not right, and it is the guards rather than the app:** `tour-fresh`
  hashes five whole files, so a change to a sheet no photograph shows demanded a
  re-render of all ten pictures. More to the point, the `also=` checks have NO
  escape — `.branch-guard`'s `escape=` covers the branch rule only — so there is
  no way to say "I know, proceed" even when certain. A guard with no override is
  a wall, and walls get disabled wholesale.
- **Superseded, and kept for the record: 3.5.1.** Colour is
  its own door rather than a block inside Settings, and the pictures are full
  width because of it.
  **The move is what buys the pictures their size.** Two-up inside Settings, each
  HALF of each tile rendered about 75px on a phone — you could see that one side
  was light and the other dark and not much else, which is a picture failing at
  the one thing a picture is for. One column here: a half is 155px. Settings fell
  from 3,299px to 2,656, about a fifth, having been the longest thing behind that
  button.
  **The per-surface budget went BACK DOWN, 3,400 to 3,000**, which is the half of
  a ratchet that never happens on its own. That raise was bought by the tiles
  crowding Settings; the tiles left, so the headroom goes with them. The TOTAL
  went up, 12,050 to 12,600, because splitting a destination adds a title and a
  way out even as it shortens every surface — the two numbers price different
  things and they moved in opposite directions, which is the trade being made
  honestly rather than hidden in one figure. Controls +2, which is what a door
  costs: the button that opens it and the way back out.
  **Light or dark stayed in Settings.** Mode and palette are independent axes
  (PALETTES.md §6); moving both would have made this door mean "anything to do
  with how it looks", which is what Settings already means.
  **Two things were caught by something refusing to run, and both are worth
  keeping.** The `data-door` was copied from a sheet that is NOT in More — the
  two-tap form with a `|` — and `openSurface` hands the door straight to
  `querySelector`, where that is not a valid selector. None of the six siblings
  has a door attribute at all; they are reached by the `more-go` fallback.
  And the colours audit was placed beside its sibling in the panel, which shut
  Settings under the states still driving it: `openSurface` closes every dialog
  first (ADR-0083, one surface at a time), and everything between the settings
  audit and the ⓘ is a CONTINUATION that never reopens the sheet. Three registry
  entries reported "matches nothing visible" about controls that were simply on a
  screen no longer open. The audit sits after that run now, with the dependency
  written down where the next person will hit it.
  **ADR-0083 said More "lists six destinations and never scrolls", and the second
  half was not true.** Measured on this release and measured AGAIN with the
  seventh door removed, so the blame lands where it belongs: at 390x844 and 200%
  text, SIX doors already scrolled — 1,070px of list in a 381px box. Seven makes
  it 1,186. At 100% neither scrolls. So the claim had been false at the text
  sizes the people this app is for are most likely to use, for as long as there
  have been six, and nothing had looked. Not a defect in the list — a list of
  places is a reasonable thing to scroll, the way out is outside the scrolling
  body, every door clears its target — a defect in the RECORD, which stated an
  absolute nobody had measured. The ADR carries both numbers now.
  **Still not right:** the splash an installed app shows before it opens still
  uses the original colours whichever set is chosen. It comes from the manifest
  captured when the shortcut is saved and nothing the app does later can change
  it.
- **Superseded, and kept for the record: 3.5.0.** You can see
  the colour sets instead of reading their names, and four of the five have been
  redrawn because they were the same set four times. ADR-0111 for the mechanism.
  **The preview is a picture, not live CSS**, and that is what makes it cheap. A
  tile painted with real custom properties renders a FOREIGN palette inside the
  current one, which breaks the assumption the colour gate rests on — exactly one
  palette active, every computed colour mapping to one role — and creates a
  boundary pair per pairing of families per mode, fifty of them, none of which the
  thirteen-pair inventory knows about. A PNG has none of that. It is opaque.
  **Each tile is the same view twice, day left and night right.** A diagonal cut
  over ONE copy was tried first and it compares nothing: the heading landed in
  day, the button in night, and no element ever appeared in both. Split down the
  middle with a full copy each side, the button is in both and the card is in
  both, which is the difference between a comparison and a swatch.
  **AND THE PREVIEW'S FIRST JOB WAS TO SHOW THAT FOUR FAMILIES WERE ONE.** In
  dark, four of the five sat within twelve RGB points of each other and *paper*
  and *soft* differed by TWO and ONE — `#141519` against `#15161a` — while their
  descriptions claimed *exact-neutral*, *cool night, warm paper day* and *lowest
  glare*. They came from the hub council verified as LEGIBLE and nothing had ever
  checked them against each other for being DISTINCT. Rewritten along axes that
  do not overlap: cool and crisp, warm kraft with a deep teal, no hue at all, and
  dimmed with a night that is grey rather than black. Quietkeep untouched. Three
  border ratios failed the first attempt and were fixed before anything else.
  **The sample was thin too, and that was a separate defect.** A heading, one card
  and one button used four of seven roles and was mostly page background. It is
  now two cards, a filled button and a ghost one, a warm note and quiet second
  lines — every role with enough area to read. Rendering the ORIGINAL palettes
  with the RICHER sample was the honest test of whether the redraw was warranted:
  instrument and soft were still the same palette in it. A better picture cannot
  reveal a difference of one RGB point.
  **The words lived in two files and only one moved.** `docs/palettes.json` and
  `src/palette.ts` each carry a name and a sentence per family, so three families
  spent an hour describing colours that no longer existed. `palettes:check` holds
  them together in both directions now, planted with that exact drift. A family
  that paints one thing and describes another is worse than one with no
  description, because the words are what §4 leans on when it refuses colour as
  the sole carrier of meaning.
  **The tile is the control, and the target gate is why.** Five native radios are
  13x13 and the gate measures the INPUT's box — correctly, because that is what a
  finger lands on; wrapping a 13px control in a big label only changes what a
  mouse forgives. Scaling the native radio to 44px was tried and looked it: five
  thumbnail-sized circles in the browser's own accent, shouting over the pictures
  they were labelling. The input covers the tile instead, and the mark is drawn —
  an empty ring that fills, with the name going bold beside it, so nothing says
  "this is the one you have" in hue alone on the one screen that is entirely hue.
  **Three budgets moved and each raise says what bought it:** +4 controls (the
  same decision wearing a different control), Settings 3,000 to 3,400, and the
  standing-prose total 11,660 to 12,050. Smaller tiles were tried first and 80px
  wide shows a light half and a dark half and nothing else.
  **Still not right:** the tiles are two-up, so each half renders about 75px on a
  phone, which is small for differences this fine. Colour is going to its own
  door rather than growing Settings again — that is the next piece of work, and
  it is the answer this file predicted when the budget was raised.
- **Superseded, and kept for the record: 3.4.3.** The buttons
  say what is behind them, and the colour picker has a heading.
  **`More` named a quantity where it needed to name a destination.** More of
  what? The only way to find out was to press it. All six things behind it are
  the APP rather than your work, so it is `Everything else` — not this page, and
  all of it. `Contents` is `On this page`: those two are exactly complementary
  and should sound like the pair they are. That forced the third, because the way
  out of a job said `Everywhere else`, which is one letter from `Everything else`
  to the ear while meaning your other work rather than the app. It is
  `Choose where to be`, which takes the verb-first shape of the doors it lands
  among and names its destination.
  **The colour picker had no heading at all**, in a panel where every other block
  has one, and told the reader its five sets were "held to the same contrast
  floors" — a phrase for whoever built it. The control said *Its colours are*,
  with no antecedent for *its*.
  **The size gate caught the replacement copy being longer than what it
  replaced**, over three budgets at once, including a repetition of *only this
  app, and only on this device* introduced two lines under the block that already
  says it. Cut back past the original rather than accommodated: Settings ended at
  2,995 of 3,000, having been 3,091. The four pixels that remained are the
  heading, and that raise is recorded beside the number.
- **Superseded, and kept for the record: 3.4.2**, verified at
  `4279fcb`: Deploy success AND Spine success read from the runs for that exact
  SHA. The shell arrives wearing the reader's choice, and the branch-state gate
  fetches the ref it reads. ADR-0111.
  **The cold-start flash is gone, and it was two flashes rather than one.** A
  palette lives in IndexedDB, which is asynchronous, so the app painted its
  default and corrected itself a beat later. Measuring it found the MODE doing
  the same: on a device set to dark with `light` chosen, `data-theme` was absent
  when `<html>` was parsed — day-to-night, which is the larger event of the two.
  Both come from one read and both are fixed by it.
  **The claim that this was unfixable was the actual defect.** It was written in
  a shipped release note and here: not fixable "without storing the choice
  somewhere this app deliberately does not store things". True of `localStorage`
  (banned outright, ADR-0002) and false in general. **A service worker can read
  IndexedDB**, and this app already had one serving the shell on every launch,
  so it hands back HTML that already carries the choice. The reasoning had
  stopped at the first candidate and the conclusion was recorded as settled.
  **What the mechanism refuses to do.** It never CREATES the store — opening a
  database that does not exist makes an empty one, and Dexie opening afterwards
  at v2 would run only the v2 upgrade, leaving a first-ever visitor without
  `events` or `snapshots`. Every failure path resolves to "no choice", which is
  what a first visit legitimately is. The cached shell stays undressed, so a
  change of mind is not served out of a cache nobody invalidated.
  **The database was named `planner` in the first version, and the app calls it
  `quietkeep`** — `DexieLogStore`'s own default, copied without checking. Nothing
  throws when that is wrong: every path resolves to "no choice" and the feature
  does nothing at all on every launch while looking perfectly healthy. Caught by
  reading `src/ui/session.ts`, and now held by a check over all four constants
  the worker copies out of `src/`, planted with that exact mistake.
  **The gate's timing is the whole gate.** Reading the attribute after boot
  proves nothing — the app sets it itself, so that assertion passes whether or
  not the worker exists. An init script runs BEFORE the document, so
  `document.documentElement` is null there; the first version of this recorded
  an exception and would have called a working fix broken. A `MutationObserver`
  on `document` fires as `<html>` is appended, which is the earliest observable
  point there is.
  **And the branch-state gate fetches now.** It read `origin/main` from the local
  ref, printed "as last fetched", and on failure advised the reader to fetch
  first because a stale ref compares against yesterday — naming the hazard in its
  own error text and leaving the remedy to whoever was reading. It fetches the
  one ref before reading it, and when the network is not there it SAYS the answer
  is from the last fetch rather than printing it as current. Both branches
  planted. Hub LESSONS 143.
  **Still not right, and named rather than closed:** the splash an installed app
  shows before it opens still uses the original colours. That is decided from the
  manifest captured when the shortcut is saved, and nothing the app does later
  can change it — it needs a per-palette manifest chosen before installing, and
  rests on iOS behaviour that must be measured on a device rather than assumed.
- **Superseded, and kept for the record: 3.4.1.** Promoted 2026-08-26 at
  `355e4c1`, Deploy and Spine both green on that exact SHA.
- **https://staging.quietkeep.pages.dev** — the candidate, **3.4.1**, verified at
  `beedbdb`: Deploy success AND Spine success read from the runs for that exact
  SHA. The focus ring reaches the screen now, and the gate can see whether it
  does.
  **Reported from a device as the outline being cut off on the left of the box
  you type in.** It was cut on all four sides, by 5px, and it was not that box:
  `#capture` carries `outline: 3px solid` at `outline-offset: 2px`, so the ring
  wants to sit 5px outside the element, and every scrolling container in this app
  cut whatever reached its edge. Three of them. `header.frame` clips sideways as
  a SIDE EFFECT — `overflow-y: auto` forces the used value of `overflow-x` from
  `visible` to `auto`, because the two axes cannot disagree about whether there
  is a clip box. `.runway` clips sideways on purpose, and it is full width, so
  seven of the landing view's controls lost their ring at both ends. Every
  sheet's `.sheet-body` cut the BOTTOM off ten more, because Tabbing to a control
  below the fold aligns it flush with the scrollport and the ring is outside it.
  **`overflow-x: clip` with an `overflow-clip-margin` is the rule that reads like
  the fix and is not** — measured, not assumed: beside `overflow-y: auto` it
  computes to `hidden`, and `overflow-clip-margin` applies only to `clip`. What
  works is 6px of padding with 6px of negative margin: the clip box moves out,
  the content stays exactly where it was. The frame's bottom rule became a
  background rather than a border in the same change, because a border follows
  the border box and would have overhung the column by that 6px at each end.
  `scroll-padding` covers the scrolled positions and a little content padding
  covers scroll position zero, where there is nothing above to inset into.
  **The gate could not see this class of defect at all**, which is the more
  useful half. `auditFocusRings` read computed style, where `outline-width` is
  3px whether or not one of those pixels is painted — so it passed this on every
  control, in both themes, for 142 releases. It builds the ring's rect now and
  checks it against every clipping ancestor, at no extra browser cost, and its
  first run found ten sheet controls nobody had reported.
  **Two things it got wrong before it was right, both worth keeping.** It
  reported 62px, 88px and 179px alongside the real 5px findings, in the same
  words: a control that does not FIT in its scroller has part of itself outside
  by arithmetic, which is not a ring cut — so the three outcomes per axis are
  told apart now and only one of them fails. And it walked past an OPEN DIALOG,
  which renders in the top layer where nothing outside it clips it however the
  DOM is nested; every dialog here sits inside the runway, whose box is smaller
  and elsewhere. Three controls were being measured against a box that was not
  cutting them.
- **Superseded, and kept for the record: 3.4.0.** Promoted 2026-08-25 at
  `e16b2e8`, Deploy and Spine both green on that exact SHA.
- **https://staging.quietkeep.pages.dev** — the candidate, **3.4.0**. Five palette
  families, both modes each, and the picker to choose one. ADR-0110.
  **The payoff, measured:** all ten palettes clear all thirteen pairs in **0.25
  seconds**. Under the old arrangement that would have been about forty minutes
  of browser. It is the whole argument for 3.3.0, demonstrated rather than
  claimed.
  **Where they come from.** Four were derived by the hub's 2026-07-30 palette
  council — four independent proposals, adversarial verification, three judging
  lenses — and have been sitting in `noahjefferson/palettes/families.json`
  unused. They are stated in the hub's role vocabulary (`page`, `surfaces[]`,
  `rail`, `text[]`, `accents`), so they are mapped onto Quietkeep's seven, with
  `rail` composited to a flat hex. **`warm` is the one Quietkeep has and the hub
  families do not**, so it is derived per family by searching a warm hue for the
  lightness that clears 4.5:1 against both `bg` and `surface` — and then held to
  the same gate as everything else, which is the whole of the criteria.
  **Consolidated FIRST, because PALETTES.md §6 says to and says why:** "if a
  palette is currently declared in N places, adding F families makes it N x F x 2
  blocks that must never drift". This file held four such places. `docs/
  palettes.json` is now the one source and `tools/palettes.mjs` generates
  `public/palettes.css`; `palettes:check` fails on drift and is what CI runs.
  **Palette and mode stay independent axes** — `data-palette` beside
  `data-theme`, two decisions rather than ten.
  **Named, never a swatch.** A coloured square alone asks the reader to tell
  colours apart in order to work a colour control, which Doctrine §4 forbids.
  **The flash is real and cannot be fixed here.** PALETTES.md assumes an inline
  one-liner reads the palette before first paint. This app cannot: `localStorage`
  is banned outright, kv is IndexedDB and async, and the CSP forbids inline
  script. So a reader on a non-default family sees one beat of the default — in
  the RIGHT MODE, since `prefers-color-scheme` is answerable before paint, so
  what settles is hue rather than day into night. Recorded rather than papered
  over, and it is a cross-app assumption that did not survive contact with this
  app's own rules.
  **`palettes.css` is precached.** A separate stylesheet is a separate thing for
  the service worker to hold, and an offline-first app that cached its rules and
  not its colours would come back with none.
  **CI found the consolidation's last consumer.** `brand.mjs` parsed the seven
  roles out of `public/app.css` and went red with twenty "token not found" —
  skipping the build and BOTH walks behind it. A THIRD place was reading the
  values; finding it is what one source is FOR. It reads `docs/palettes.json`
  now and covers all ten palettes rather than two. Its hand-written pair list
  stays on purpose: `line` is a border, a graphical object at 3:1, and the
  inventory reads `color` and `background` only — so that list carries the one
  floor arithmetic cannot see, and the division of labour is in ADR-0110. All ten
  clear it, tightest 4.58:1.
  **And it went red because a hand-picked subset of gates was run instead of the
  Spine** — the exact thing `npm run spine` exists to prevent. Brand assets was
  not on the list because there was no reason to think colour tokens moving would
  touch it, which is precisely why it needed running.
  **Verified green on `35937cb`** — full Spine and Deploy, that exact SHA, and
  all 39 Spine steps green locally before the push.
- **Superseded, and kept for the record: 3.3.0.** Colour is
  checked by arithmetic now, and a palette costs nothing to add. ADR-0110.
  **The measurement that started it.** The a11y walk made **1,660 contrast
  assertions** in its last run — for TWO palettes, about 830 each, roughly four
  minutes of browser each. A sixth palette would have been twenty-four minutes of
  re-measuring the same thing. It does not have to be: contrast is a property of a
  PAIR, and a palette swap changes token VALUES — never which token a selector
  resolves to, nor the size and weight that decide whether it needs 4.5:1 or 3:1.
  **Structure once, values per palette.** `npm run colour:inventory` walks every
  state under a SENTINEL palette — each of the seven roles painted a unique probe
  value, so every computed colour maps to exactly one role BY CONSTRUCTION rather
  than by luck — and writes `docs/colour-inventory.json`. `npm run palette:check`
  reads it and does the arithmetic, no browser.
  **624 rows reduce to THIRTEEN distinct pairs.** A palette is thirteen
  computations. Both current palettes clear every one; the tightest is `warm` on
  `bg` at 6.38:1 in light and `ink-soft` on `surface` at 7.93:1 in dark.
  **It found a shipped bug.** `applyTheme` set `data-theme` and never
  `color-scheme`, so choosing *light* on a device set to dark turned the app cream
  and left every dropdown, date box and textarea white-on-grey. Measured through
  the reader's own route: `--bg` became `#F4F1E9` while the select still rendered
  `rgb(255,255,255)` on `rgb(107,107,107)`. **The old gate could not have found
  it** — it renders each theme under a device set to match, so a choice
  DISAGREEING with the device is the one case it never renders.
  **And thirteen controls the palette cannot reach**, every `<select>`,
  `<textarea>` and `<input type=date>` in the app, painted by the user agent.
  True before and invisible, because they were measured like any other colour and
  passed. Declared in `.colour-ua-owned` with a reason each, held BOTH ways.
  **Planted, both halves.** A palette with grey ink was caught on all thirteen
  pairs with the states each shows on; a palette missing three roles was refused
  before any arithmetic. The extraction's own detector caught its first installer
  too — the sentinel lost to `:root:not([data-theme="light"])` on specificity and
  reported all 5,267 real colours as unowned.
  **Freshness:** the inventory carries the same UI hash `.a11y-stamp` uses and
  `palette:check` refuses to answer if it does not match the tree — a gate
  checking palettes against a structure the app no longer has is worse than none,
  because it reports green. `colour:inventory` is `.spine-exempt`: it writes a
  tracked file, and CI regenerating what a gate checks repairs the drift instead
  of reporting it.
  **Still not right:** this removes repetition, not the need to walk the app. A
  state the walk never visits has its colours unchecked, exactly as before.
  **And the picker is still the old one.** This release makes a palette free to
  VERIFY; it does not yet make one selectable. The control offers device / light
  / dark, not a list read from `docs/palettes.json`. `data-theme` becoming
  `data-palette`, a stylesheet block per palette and a picker that lists whatever
  the file holds is the next slice, and it is cheap now precisely because the
  verification stopped being the expensive part.
  **Verified green on `045ee6c`** — full Spine and Deploy, that exact SHA.
- **Superseded, and kept for the record: 3.2.0.** The wide
  arrangement: above 900px the job view shows the hub BESIDE the job.
  **Not a new decision.** ADR-0108 specified this second arrangement and built
  for it — that is why stances are `main > section[data-stance-name]` toggled by
  a class rather than dialogs, and that record says in as many words that
  building them as dialogs first is what would make this expensive. It did not
  happen, so **nothing in `src/` changed for this**. `paintHub` resolves the same
  one stance and sets the same `.stance-on`; the layout places it. ADR-0109.
  **900 is measured.** `body` caps at 46rem, so every viewport from 768px up
  rendered identically — 132px of nothing each side on a tablet in landscape,
  272px at 1280. The hub asks for 276px at its natural width; 280 + 24 between +
  a 560 floor for the job + 16 padding each side is 896.
  **A pinned sidebar, not a grid, and a picture is what settled it.** The first
  version made `<main>` a two-column grid. Grid ROWS couple the columns, so row
  one was as tall as the hub and the job column opened with about 230px of
  nothing — visible at a glance in a render, invisible in every number. `<main>`
  keeps its ordinary block flow at every width now, so a job's internal layout is
  identical narrow and wide, and the hub is pinned out of that flow.
  **PX in the media query, never rem** — inside a query `rem` resolves against
  the initial root size, not the zoomed one, and this file has paid for that once
  at `.about-bar`.
  **The walks measured one viewport, so the arrangement would have shipped
  unchecked** (hub LESSONS 28). `tools/a11y.mjs` gains a wide pass in both
  themes, at 1000x750 and at 900px under 200% text: overlap, targets, axe,
  horizontal overflow, and the arrangement ITSELF — that the hub is genuinely
  beside the job rather than stacked above it, because a wide pass run against a
  page still showing one pane would report green about a layout that is not there
  (LESSONS 104). The `beside` predicate was checked against both widths before it
  was trusted: true at 1000px, false at 768px.
  Contrast is not re-measured wide, and `size-check` gets no wide budget. Both
  are decisions with reasons written at the code rather than omissions.
  **Verified green on `7f65d49`** — full Spine and Deploy, that exact SHA.
- **Superseded, and kept for the record: 3.1.3.** Two of the
  three unmeasured surfaces now have a door the walk can drive, so the way-out
  check measures **20 on screen** rather than 18.
  `#focus-sheet` declares `data-door="#cards .card-focus | #focus-stop"` — the
  route a reader takes. `#tour` needed one more idea: its replay control lives
  INSIDE a sheet, so `data-door-via="sheet-group-actions"` names the room and
  `data-door="#tour-replay"` names the control. A second attribute rather than a
  first tap in the chain, because More is opened programmatically in this walk on
  purpose — `click('#open-more')` was observed resolving without the dialog
  opening, and a door that flakes reads as a surface that is broken.
  **`#replan-sheet` stays structural, and this is the reason rather than an
  omission.** Its door needs an item whose date has passed. Manufacturing that
  inside the way-out block couples it to the shared inbox the blocks above it
  consume — which is exactly the coupling that cost four CI rounds on
  `clarifyCard` in 3.1.0. It is printed by name in the check's own output.
  **Verified green on `581727e`** — full Spine and Deploy, that exact SHA. 3.1.2
  before it was green on `d93ec34`, all forty-nine steps.
- **Superseded, and kept for the record: 3.1.2.** The row cost
  a row, and it did not have to.
  3.1.1 pinned the way back inside a job by making `#stance-bar` the frame's own
  last ROW, which was right and cost sixty pixels of fixed height — so the frame
  stood down one text step earlier than before. `.bar` was already
  `flex-wrap: wrap`, so the two controls moved into it instead, after the ⓘ and
  before *More*. **Measured at four sizes across all three versions**, not
  reasoned about:
  1000x750 at 100% — frame 209px before 3.1.1, 270px in 3.1.1, **215px now**, and
  the way back pinned at every scroll position rather than leaving at `-97`.
  1000x750 at 150% — the frame stood down in 3.1.1 and **does not now**, at 318px
  against 309px before any of this.
  390x844 at 125% — **still stands down**, and this is the part that is not
  recovered: a narrow bar wraps, so the group costs a line either way. The
  headroom there was seven pixels before 3.1.1 (415px against a 422px threshold),
  so that size was going to fold on any addition at all.
  **A real fault, caught by the a11y walk before it left the machine:** a nested
  flex row inside `.bar` is one flex item and does not shrink below its content
  width without `min-width: 0`, so the pair ran **103px past the right edge** at
  320px/200% in BOTH themes — sideways scroll, which is the one thing the shell
  asserts never happens.
  **And the walk could not write down what it found.** The smoke walk has left
  `.walk-failures` since 3.0.1 and the Spine prints it; this one did not, so
  reading two failures cost a second four-minute run. It leaves `.a11y-failures`
  now, the Spine's error step prints it beside the other, and the mechanism was
  PLANTED — the wrap fix was removed, the walk went red, and the receipt carried
  both lines verbatim before it was put back.
- **Superseded, and kept for the record: 3.1.1.** Promoted 2026-08-25 at
  `0f70d96`, Deploy and Spine both green on that exact SHA.
- **https://staging.quietkeep.pages.dev** — the candidate, **3.1.1**. The way
  back out of a job was in the box that scrolls.
  `#stance-bar` — *Everywhere else* and the **+** — sat inside `#runway` and the
  markup said why: *"inside the runway so it scrolls with the job rather than
  eating fixed height, which is what ADR-0101 had to stand the frame down for."*
  That reasoning is about the frame's budget and it traded away the thing the row
  is for. Measured at 1000x750 with ONE card in the job: the way out at `-36`
  after an ordinary scroll and `-97` at the end of the runway. Reported from a
  device as the app looking broken, which is what controls sliding under fixed
  chrome and back out again look like.
  **It is 3.1.0's own subject on the main screen.** The fix is the same shape:
  the thing you leave by is not inside the box that moves. `#stance-bar` is the
  last row of `.frame` now. NOT `position: sticky` — ruled out on the reference
  device, where it was found scrolling away twice (see the note at `.about-bar`).
  Inside `.frame` rather than a new fixed sibling so `watchFrameFit` counts it
  without being told; a sibling would have left ADR-0101 measuring a frame
  smaller than the fixed region actually is.
  **Measured before and after, at three sizes.** Frame up, 1000x750: was 224 at
  the top and `-97` at the end, is 214 at both. Frame stood down, 320x568 at 200%
  and 390x844 at 175%: unchanged within 17px, because in that mode there is no
  fixed chrome at all and the document scrolls — ADR-0101 working, not a
  regression, and it was measured rather than assumed.
  **What it costs:** inside a job the frame is one row taller, so it stands down
  one text step earlier — 150% rather than 200% at 1000x750, 125% rather than
  150% at 390x844. On the hub the row is `hidden` and nothing moved. If that step
  matters on the device, the alternative is the way back joining the top row
  beside *More* and *Contents*, which costs no height on a wide screen and wraps
  on a narrow one.
  **Verified green on `8bd368c`** — the full Spine on the runner, Deploy
  succeeded for that SHA. Four red rounds came first and none was the app; all
  four were `clarifyCard`, the shared triage precondition added a release
  earlier. In order: it tapped `.first()` through the heat pass rather than Hot,
  so a share of the pile was answered Cold and a different item led the clarify
  queue; it read the surface immediately after acting on it, and a surface
  mid-render is indistinguishable from an empty one; and the filing block passed
  no `capture`, so the helper had nothing to put down again and one empty inbox
  was fatal where three attempts were not. The report is what made each of them
  readable rather than guessed — it carries the stance, the prompt, the card, the
  gauge line and the triage section's own text now, because `routes: 0` alone
  cannot tell an empty inbox from a surface not showing what the inbox holds.
- **Superseded, and kept for the record: 3.1.0.** Three
  reported defects and one long-missing choice.
  **The way out of a long screen.** `#sort` is an eighty-three-line dialog whose
  Close was the last thing in a box that scrolled as a whole, so leaving a batch
  meant travelling past all of it. `#about` had the identical defect twice on a
  device and every sheet once, and the fix — a flex column whose body is the only
  thing that moves — had never travelled to any dialog that was neither. Six
  surfaces carried it untouched, `#detail` among them at 587 lines of markup, the
  longest in the app. **The check written to prevent exactly this could not see
  any of them**: it discovered its subjects by looking for `.sheet-body`, which
  IS the fix, so a surface that had never been fixed was not a failing row, it
  was not a row. Hub LESSONS 141. It now qualifies on every dialog, a way out is
  declared with `data-way-out` rather than inferred from an id ending in
  `-close` — two screens leave by *Skip* and by *Keep going* and had never been
  measured at all — and the invariant is asserted without opening anything, so a
  new dialog is red on the day it exists.
  **The record.** *Read the record* rendered fifty at a time, chronological
  within a day, with no control for either. On a store whose events are mostly
  one day old that reading is oldest-first, so the thing that had just happened
  sat at the bottom and every visit began by pressing *Show more*. Newest first
  is the default now, oldest first is still offered, the page is 50 / 250 / 1,000
  / everything, and both choices are remembered in kv on this device.
  **Sync.** Pairing, erasing, pairing again and syncing left the exchange
  refusing most of what arrived and halting halfway. Overlapping chunks offered
  the same event twice in one delivery; the store correctly refused the repeat
  and the batch counted it as a failure. Deduped within the batch as well as
  against the store, in `sync.ts` and `portability.ts`, with two tests.
  **Light or dark.** Both themes have shipped since the beginning and are
  measured in both by the a11y walk; there was never a way to choose. Three
  answers, device being one and still the default, in kv and never an event.
  **Found on the way and fixed:** the opaque-way-out rule was widened to `>
  button` and painted `--surface` under the primary buttons sharing those rows —
  1.13:1 in light and 1.15:1 in dark, caught by the contrast gate before it left
  the machine. And `size-check` measured the rotating patch notes against the
  ⓘ's per-surface ceiling as well as giving them their own, so 1,744px of
  standing prose plus the 1,400px the notes are allowed exceeded the 3,000px the
  ⓘ is allowed — a release spending its full notes allowance failed by
  construction, and the only edit that brought it down was deleting patch notes.
  **Not measured on screen:** the walkthrough, the replan card and the
  stopping-for-now note have the right shape but no door the walk can drive, so
  they are checked structurally and NAMED in the check's own output.
  **Verified green on `ead9518`** — the full Spine on the runner, Deploy
  succeeded for that same SHA. Two red rounds came first and neither was the
  app: the a11y walk slept a guessed 200ms between setting a date and reading
  whether the horizon line rendered, which was right here in both themes and
  wrong on a runner in the second one; and the smoke walk's inbox precondition
  failed with `routes: 0, prompt: ""`, a report that says the surface is empty
  and nothing about why. Both are fixed at the assumption rather than at the
  site — the a11y walk asks `data-settled`, and four blocks now share
  `clarifyCard`, which names the stance, the prompt and the filters an earlier
  block may have left standing.
- **Superseded, and kept for the record: 3.0.1.** The app has
  places. The landing view was fifteen conditional sections in one scroller and
  reading it was reading an article — a position rather than somewhere to be, and
  losing the position lost the thought. It is a hub of doors now, each opening one
  job that is the whole screen, with one way back and a **+** for capture inside
  every job. ADR-0108 has the decision and why the tabs refusal does not reach it.
  **Six product defects were found by rendering and by the walk, not by
  reasoning**: capture partly hidden behind a job; an empty store hiding a
  newcomer's route to restoring from a copy; the hub painting a beat stale so a
  captured thought had no door to sort it; Sort carrying two doors; the undo bar
  and the do-now offer vanishing at the moment they were needed, both of which
  outlive their job by design; and five sections left with no door at all, which
  deleted them for everybody.
- **Superseded, and kept for the record: 2.38.0.** Reported
  from the device: clicking Cold on every task was taking forever and nothing
  was being removed by it. Three faults, one root. `looseFromImport` selected
  on `!n.captured`, written when `captured` meant "you typed it"; 2.15.0 made an
  import latch it, so the batch NAMED for imports held zero and `rangeChoices`
  never offered it — the one-tap route through an import simply was not there
  for twenty-two days. The same latch put a whole planner into the heat sweep,
  which leads at four items, and into the daily gauge, which law 8 says must
  never carry an import. Now: the batch selects on `arrived`, and the sweep and
  the gauge exclude arrivals. Measured on a 1,200-row import — gauge 1160 → 0,
  sweep 1160 → 0, batch 0 → 1000, and the clarify queue keeps all of it.
  **The tests stayed green because their fixture wrote rows the importer no
  longer produces**, which is hub LESSONS 138 exactly; `imported()` now stamps
  what the importer stamps, and a second fixture drives the real parser.
- **Superseded, and kept for the record: 2.37.0.** Reported
  from the device, straight after an import: the chooser held nineteen labels
  and there was no way to tell, from looking at it, that any of them could be
  corrected. The answer already existed — *Not a place*, since 2.34.0 — and
  renders only after a label is picked, so the question got asked with nothing
  on screen able to answer it. A line under the chooser says it before the
  choice, and stops for good once any label has been put down.
- **Superseded, and kept for the record: 2.36.1.** What a
  file will do to your work is a list of facts now rather than one block of a
  hundred and twenty words — three groups, one fact per line, each loss said
  once. The screen had never been rendered by anything, so the accessibility
  walk chooses a file of its own and reads what comes back. 2.36.1 then made
  the last remaining unexplained loss explain itself: "15 lines could not be
  read" is "15 lines had no name on them", which is the one reason either
  parser ever refuses a line.
- **Superseded, and kept for the record: 2.35.0.** The
  invented set was three-quarters filed where a real store is seven-eighths
  not, so every narrowing feature was judged against data that flattered it;
  it is about fifteen hundred things now, mostly unsorted. The manual gained
  the *Things you can do* section it never had, and the fold. 2.35.0 itself is
  the arrival screen — an import used to reload into a plain work surface with
  no account of where any of it came from.
- **Superseded, and kept for the record: 2.31.2.** The
  walkthrough was written for somebody who already knew the app: it invited the
  storage ask before saying to install, set control names in italics on the one
  screen where a reader cannot tell a name from emphasis, and referred to the i
  button twice before introducing it. Rewritten as a welcome. 2.30.2, the
  version stamp's landing, is in here too.
- **CONFIRMED BY BYTES FROM THE DEVICE, 2026-08-23.** A §7f diagnostic on the
  installed instance reports `Build: 2.29.0` and `Service worker cache:
  quietkeep-sync-2.29.0`, a worker serving the page and no newer version
  waiting. The deployed worker carries the released triplet. **The host actually
  read is `quietkeep-sync.pages.dev`**, so this is direct evidence for the Sync
  edition and strong evidence for `quietkeep.pages.dev`, which deploys from the
  same push — recorded that way rather than as a reading of a host nobody read.
  V-15's route: a session still cannot fetch any `pages.dev` host from here, the
  proxy answers 403 at CONNECT.
- **https://quietkeep.pages.dev** — production, **3.7.1** — promoted at
  `d638c51` on 2026-08-28. Both hosts read directly afterwards and both serve
  3.7.1, which is now the ordinary way a promote is confirmed here rather than
  the new thing it was one release ago.
- **Superseded, and kept for the record: 3.7.0** — promoted at
  `c275280` on 2026-08-27, carrying 3.7.0 and three gates that did not exist that
  morning. Deploy success on that exact SHA, and the merged tree asserted
  byte-identical to `07b54ea`, the staging head that was walked.
  **THE FIRST PROMOTE IN THIS REPO VERIFIED BY READING THE HOST.** Every earlier
  one rested on a green deploy step plus a paste from the device.
  `tools/deployed-check.mjs` read both editions directly: production serves
  3.7.0, the sync edition serves 3.7.0, and both serve the new flowcharts page as
  itself at 33KB rather than the root document. That last clause is the one that
  matters — before the promote the same check correctly reported the page absent
  on both, while the host answered 200 for it.
- **Superseded, and kept for the record: 3.6.1** — promoted at
  `0d5dd21` on 2026-08-27, carrying 3.6.0, the commit-guard change and 3.6.1.
  Deploy success on that exact SHA, read at the STEP level: *Deploy to Cloudflare
  Pages* 8s and *Deploy Quietkeep Sync* 6s, both real work rather than the
  guard's skip branch, which also concludes success. The merged tree was asserted
  byte-identical to `52fdf53`, the staging head that was walked.
  **THE MERGE LANDED ON THE WRONG BRANCH LABEL FIRST.** `git checkout main`
  aborted on a dirty working tree and the reset and merge that followed both ran
  on `staging`, producing a correct promote commit — right parents, right tree —
  sitting on the wrong branch. Nothing was pushed. Recovered by moving `main` to
  it and restoring `staging` to `origin/staging`. **A compound `checkout && …`
  that assumes the checkout succeeded is the same defect as LESSONS 170 with a
  different verb: the second command runs wherever the first one left you.**
- **Superseded, and kept for the record: 3.5.2** — promoted at
  `04562b5` on 2026-08-27, Deploy success on that exact SHA, read at the STEP
  level: *Deploy to Cloudflare Pages* 5s and *Deploy Quietkeep Sync* 6s, both
  real work rather than the guard's skip branch, which also concludes success.
  The staging head it carries, `a98de4c`, had Deploy green and Spine green — the
  Spine only on attempt 2, attempt 1 having timed out waiting for `.card`, a
  flake in a section untouched by that release and passing locally on the same
  tree.
- **Superseded, and kept for the record: 3.5.1** — promoted at
  `ac0d40e`, Deploy success AND Spine success read from the runs for that exact
  SHA. The merged tree was asserted byte-identical to `63731c2`, the staging head
  that was walked; asserted to descend from `355e4c1`, the real production; and
  asserted to carry `63731c2` itself. Four releases in one promote.
  **THE PUSH LANDED AND THE DEPLOY DID NOT, WHICH IS THE FAILURE THIS BLOCK
  EXISTS TO CATCH.** The push-triggered Deploy sat queued sixteen minutes, never
  got a runner — zero billable time, zero jobs — and ended `startup_failure`.
  Reported as pushed-and-verified it would have read as shipped while production
  served 3.4.1 (LESSONS 53). Two workflows, Spine and Push-on-main, were never
  CREATED for the SHA at all.
  **The first diagnosis was wrong and is worth keeping.** It looked like an
  Actions backlog: three workflows failing at once, nothing running in the whole
  account. Then a `workflow_dispatch` of the Spine on the same SHA ran a full
  green job, which killed that theory — Actions was fine.
  **RE-RUNNING A `startup_failure` RUN REPRODUCES IT.** `rerun_workflow_run`
  re-uses the same run object and its broken config snapshot, so it failed again
  the same way. A FRESH `workflow_dispatch` on the identical ref succeeded in
  forty seconds. `deploy.yml` was diffed between `main` and `staging` first and
  is byte-identical, so the file was never the cause.
  **And the green was checked for being a real deploy**, not the guard's skip
  branch: the Cloudflare Pages step ran for seven seconds, and the Sync edition
  deployed after it.
  **What this carries.** The shell arrives wearing the reader's palette and mode
  on the first painted pixel; the chrome names destinations instead of
  quantities; the colour sets are pictures, with four of five redrawn because
  they were the same set four times; and colour has its own door, which is what
  buys the pictures a size you can read.
  **Still not right, and named rather than closed:** the splash an installed app
  shows before it opens still uses the original colours whichever set is chosen —
  it comes from the manifest captured when the shortcut is saved, and nothing the
  app does later can change it.
- **Superseded, and kept for the record: 3.4.1** — promoted at
  `355e4c1`, Deploy success AND Spine success read from the runs for that exact
  SHA. The merged tree was asserted byte-identical to `a8cdf54`, the staging head
  that was walked; the merge asserted to descend from `e16b2e8`, the real
  production; and asserted to carry `beedbdb`, the SHA whose own Deploy and Spine
  were read green before the promote.
  **The clone this was promoted from was 146 commits STALE, and the local
  remote-tracking refs were stale with it** — the container had been recycled and
  both repos re-cloned at pinned older revisions. `git log origin/main` answered
  about a different day; `git ls-remote`, which reads the remote rather than the
  local ref, is what caught it. A promote from that tree would have pushed months
  of undoing onto production and every gate would have passed, because the tree
  was internally consistent. Both clones were reset and the commit hook
  reinstalled before anything else happened (hub LESSONS 135).
  **What this carries.** The focus ring reaches the screen. It was cut on all
  four sides by 5px, on nearly every control in the app, and it was not the one
  control it was reported on: three containers scroll here and each cut whatever
  reached its edge. The gate that passed it for 142 releases now measures whether
  the pixels arrive rather than whether the property is set.
  **Still not right, and named rather than closed:** inside a job the frame folds
  one text step earlier than before 3.1.1 on a phone at 125%; the replan card is
  checked structurally rather than measured on screen, as are three surfaces the
  walk has no door to; and a reader on a non-default palette sees one beat of the
  default on a cold start, in the right mode.
  **And one correction to what that last item has been saying — now BUILT, in
  3.4.2 on staging.** Both 3.4.0's notes and this block called the cold-start
  beat unfixable "without storing the choice somewhere this app deliberately does
  not store things". True of `localStorage` and false in general: a service
  worker can read IndexedDB, so the worker already serving the cached shell hands
  back HTML with the choice on it. Measuring it found the MODE flashing the same
  way, which nothing had recorded. ADR-0111.
- **Superseded, and kept for the record: 3.4.0** — promoted at
  `e16b2e8`, Deploy success AND Spine success read from the runs for that exact
  SHA. The merged tree was asserted byte-identical to `60523f3`, the staging head
  that was walked, and the merge asserted to descend from `0f70d96` before it was
  pushed. Three releases in one promote, and the last two are one idea.
  **What this carries.** Above 900px the job view shows the hub BESIDE the job
  instead of stacked above it, which is ADR-0108's second arrangement finally
  built and needed nothing in `src/` to change. Colour is checked by ARITHMETIC
  rather than by rendering: structure measured once under a sentinel palette,
  values computed per palette, 624 rows reduced to thirteen distinct pairs — and
  it found a shipped fault on the way, `applyTheme` setting `data-theme` and
  never `color-scheme`, so a light choice on a dark device left every dropdown
  and date box white-on-grey. Then five palette families with a picker, all ten
  clearing all thirteen pairs in a quarter of a second.
  **Still not right, and named rather than closed:** inside a job the frame folds
  one text step earlier than before 3.1.1 on a phone at 125%; the replan card is
  checked structurally rather than measured on screen; and a reader on a
  non-default palette sees one beat of the default on a cold start, in the right
  mode, because this app cannot read the choice before paint.
- **Superseded, and kept for the record: 3.1.1** — promoted at
  `0f70d96`, Deploy success AND Spine success read from the runs for that exact
  SHA. The merged tree was asserted byte-identical to `4236c88`, the staging head
  that was walked, and the merge asserted to descend from `1d2109a` before it was
  pushed — both checked rather than inferred from a clean merge, because a merge
  that did not descend from the real production has been produced here once.
  **The Spine on `main` is green for the first time in three promotes.** The two
  before it went red on the browser walks and shipped anyway, correctly — the app
  was sound and the harness was not. What was wrong: a walk that slept a guessed
  200ms between a write and the read depending on it, and a shared triage
  precondition that could report an empty surface without reporting why.
  What this carries: the way out of every dialog moved outside the box that
  scrolls, including the two longest surfaces in the app and, in 3.1.1, the way
  back out of a job on the main screen; the record's two readings; sync no longer
  halting when a device is re-paired; and a light-or-dark chooser.
  **Still not right, and named rather than closed:** inside a job the frame folds
  one text step earlier than before, and once folded the way back scrolls again;
  and three surfaces are checked structurally because the walk has no door it can
  drive to them.
- **Superseded, and kept for the record: 3.0.2** — promoted at `1d2109a`.
  Nothing on screen changed. `src/ui/session.ts` publishes `data-settled` from
  the commit queue, so the walks can ask whether a write has landed instead of
  sleeping a guessed interval; 134 of 144 waits were converted, and the ten left
  are waiting on real time.
  **This line was missing until 2026-08-25.** The production line above it read
  3.0.1 for a full release, through a promote that did not update it — the same
  stale-record defect this block exists to prevent, in the block itself.
- **Superseded, and kept for the record: 3.0.1** — promoted at
  `ff7ea5c`. Nothing on screen changed: an ITERATION, cut because a shipped file
  was edited. One answer to "how do you reach this control" now lives in
  `src/reach.ts` and is read by the app and both browser walks instead of three
  copies that drifted; the accessibility receipt guards the promote rather than
  every checkpoint.
- **Superseded, and kept for the record: 3.0.0** — promoted at `b7bfc83`. The app has places: the landing
  view is a hub of doors rather than fifteen conditional sections in one
  scroller, going through a door shows that job and nothing else, capture is a
  (+) reachable from everywhere, and coming back up is one control in the same
  place from every job (ADR-0108).
- **Superseded, and kept for the record: 2.38.0** — promoted at `ceb990e`. The
  way through an import: the batch of 1,012 with *Let go*, the heat sweep no
  longer asking Hot-or-cold about a whole planner, and the gauge no longer
  carrying an import as a headline.
- **Earlier, and kept for the record: 2.37.0** — 2.36.0 through
  2.37.0 promoted at `a4ea629`. The import summary as a lead and a list of
  facts rather than a hundred and twenty words in one block; a refused line
  saying it had no name on it rather than only that it was refused; and the
  chooser saying, before you pick anything, that a label can be told it is not
  a place. Verified before the merge by the full Spine locally on the staging
  head — 37 of 37 — plus the five hub gates, and CI green on `2613d24` and
  `d54caab`.
- **Earlier, and kept for the record: 2.35.0** — 2.33.2 through
  2.35.0 promoted at `235302a`, Deploy success read from the run. The picker's
  frame, a flag arriving as heat, the count of what is finished, and the
  arrival screen. **THE SPINE WAS RED FOR THREE OF THEM AND NOBODY READ IT**:
  `size:check` failed on 2.34.0 over one control and stayed failing through
  2.34.1 and 2.35.0, while the log's last twenty lines were green and
  `deploy.yml` — which runs on push and never consults the Spine — shipped all
  three. The budget is raised deliberately in 2.36.0 with the reason written
  where the other raises are, and the Spine now ends a failed run by saying so
  at the bottom, where somebody actually looks.
- **Earlier, and kept for the record: 2.33.1** (2.30.2 through
  2.31.2 promoted at `cd2a5a8`, Spine, Deploy and the push check all success,
  read from the runs. Five releases, every one of them from a device report:
  the version stamp's landing, the rewritten walkthrough, install-before-ask,
  the control-name outlines, and the fold's chrome; then 2.32.0 at `c4ee2b5`, the invented set and the manual; then 2.33.0 at `e2f3da7`, the labels an import carries, confirmed by cache triplet from the device as `quietkeep-sync-2.33.0`. 2.30.1 was the last reading
  confirmed by cache triplet from the device — `quietkeep-sync-2.30.1`, worker
  serving, nothing newer waiting — and this one is evidenced by the runs.)
- **An earlier reading the same day said only "2.29.0", with no cache name, and
  was recorded as the weaker kind.** It has been superseded rather than kept:
  the cache triplet answers the question the bare version cannot, which is
  whether the WORKER moved or only the page. Asking for the diagnostic is the
  route; a version alone leaves a stale worker looking identical to a fresh one.
- **This block said 2.12.2 and 2.11.0 until 2026-08-20**, through two promotes,
  and `handoff-check.mjs` is what noticed — because it asks whether the version
  beside the URL is the CURRENT one, which is a question no reader of this file
  thinks to ask about a line that looks maintained. The paragraph nine screens
  down was current the whole time. One file, two answers, again.
- **AND IT SAID 2.14.1 AND 2.13.0 UNTIL 2026-08-22, through eleven releases and
  one promote** — the same defect, in the same block, four days after the
  paragraph above it was written about the same defect. What found it was hub
  LESSONS 122 landing from another session while this one was working, not the
  gate; `handoff-check.mjs` names it correctly and **is not in this repo's
  Spine**, because the version check it carries is bundled with an
  acknowledgement checklist no CI run can answer. So the one gate that catches
  this is a gate somebody has to remember to run, which is the state the
  third-person and no-grid rules were in until 2.18.2 wired them.
  **A note recording a defect is not a fix for it.**
- **AND IT SAID 2.24.0 AND 2.24.1 UNTIL 2026-08-23, through five releases and
  two promotes** — the third time, in the same block, on the same day the second
  paragraph above was written. Nothing found it: it was corrected only because a
  production version arrived from the device and this block had to be opened to
  record it. Two notes and no gate is what that produces.
  **The fix was not a fourth note.** `tools/branch-state-check.mjs` reads the
  triplet out of `public/sw.js` in the tree and at `origin/main` and refuses a
  commit whose two URL bullets above name anything else — the shape
  `changelog.mjs --check` already uses to hold one triplet to three files. It is
  declared with `also=` in `.branch-guard`, so it runs on every commit including
  a promote, and it is milliseconds rather than the minutes its two neighbours
  would cost, so it does the work instead of refusing and naming a command.
  **The SHAs beside each version are NOT gated**, deliberately: a commit cannot
  name its own hash, and gating production's would leave this block unfixable
  for a window after every promote. All three failures above were version
  failures. **Nor is it a Spine step** — it reads `origin/main` as of the
  commit, and on a runner at the promote `origin/main` is already the merge, so
  it would be red by construction every time. That is the same reasoning the hub
  gives for keeping `doctrine-sync.mjs` out of CI.

**AND SPINE HAS NEVER ONCE BEEN GREEN ON STAGING SINCE THE STEP WAS ADDED,
WHICH NOBODY NOTICED.** Counted from the run list rather than estimated: **ten
runs — seven concluded FAILURE, three were cancelled by a superseding push, none
succeeded.** Every one of those pushes was verified against the remote —
correctly — and reported as landed.

The step ran `branch-guard.mjs --repo .` and failed every time on the same line:
`.git/hooks/pre-commit is MISSING`. That tool asserts four things. Two are about
the REPO — the tracked `.githooks/pre-commit` exists, and matches what
`.branch-guard` declares. Two are about ONE CLONE — `.git/hooks/pre-commit`
exists, and matches the tracked copy. **`actions/checkout` leaves `.git/hooks`
empty by definition**, so the second pair can never hold in CI.

**It failed from the commit that added it** (`20e6146`), and it was watched
passing LOCALLY, where the hook is installed — which is the one place it proves
nothing about CI. That is hub LESSONS 53 a second time in a different mechanism:
a session that adds a hard gate to a pipeline has just built a new way for its
own work to silently not arrive, and is at its least likely to look because it
just watched the tool succeed.

Fixed with `--artefact` in the hub (`0208a03`), which runs the two repo checks
and PRINTS the two it skipped rather than dropping them. **Not `--install`
first** — that WRITES the tracked file, so a drifted artefact would be repaired
on the spot and the check would pass over the one defect it exists to find.
Verified by reproducing the CI condition locally: with `.git/hooks/pre-commit`
removed the plain command exits 1 and `--artefact` exits 0, and with drift
planted in the tracked hook `--artefact` exits 1.

**VERIFIED GREEN — run 32297197356 on `fa19442`, step 9, conclusion `success`,
at 20:12:27, thirteen seconds into the run.** Read from the run, not from the
push.

**And the step was moved to position 9 from position 30.** It needs nothing but
the two checkouts, and it had been sitting behind the chromium install and every
browser walk. On the last healthy full run (32261983527) the guard's answer
arrived at 14:12:51, **six minutes and fifty-four seconds** after the job
started; from position 9 it arrives in seven to thirteen seconds. Cheap checks
that depend on nothing belong where a failure is answered in seconds.

**A FAILURE THERE ALSO SUPPRESSED SEVEN GATES, WHICH IS THE REAL COST.** A
failed step stops the ones after it, so on every red run steps 31 to 37 were
`skipped`: `controls:check`, `collisions:check`, `adr:check`, `touch:check`,
`notify:check`, `sample:check` and `storage:check`. **Seven gates were not
running in CI at all for those runs**, and the run page said `skipped` rather
than anything alarming.

**The reason it went unseen: a push was verified and a RUN was not.** The push
output has never once known whether CI passed.

**SPINE IS GREEN — run 32298044605 on `aa028a3`, conclusion `success`, all 37
steps, 9m37s.** The first fully green Spine on staging since the guard step was
added, on the tree carrying 2.12.2. **Every one of the seven suppressed gates ran
and passed**, along with the smoke walk (3m02s), the update walk, the rendered
a11y audit (2m58s) and the reading budget.

**THE `Install chromium` STEP WAS NOT STALLING, AND THIS SECTION SAID TWICE THAT
IT WAS.** Completed observations, off the timestamps: **24s, 1m57s, 4m45s — all
successful.** It varies, and that is all the evidence supports. The one long
reading, 10m35s on run 32296164308, ended because that run was **cancelled by a
subsequent push** and not because the step gave up. Three pushes inside ten
minutes cancelled three runs in a row; the truncated observations were then read
as evidence of stalling, when they are evidence of cancelling. **The pushes were
mine.** `timeout-minutes` stays as headroom over the slowest completed run — a
gate that never answers is worse than one that fails — but it is a net, not a
fence around a known fault.

**THREE claims in this section were wrong before they were right, all three
stated from impression rather than read off the source.** "Eight consecutive
pushes" for what the run list says is ten runs and seven failures. "25+ minutes"
for what the timestamps say is 10m35s. And a *hang* for a step that has been
observed completing three times. Recorded rather than quietly fixed, because the
second happened after the lesson about the first was written and the third after
the lesson about the second. The pattern is one thing: **a conclusion drawn from
an observation that was never allowed to finish**, then written in the voice of a
measurement.

**2.12.2 IS IN PRODUCTION.** Promoted 2026-08-19, `864c30e`. The promoted tree
was asserted byte-identical to the verified staging tree (`7e4e11b…`) rather than
inferred from a clean merge. Deploy run 32305299449 success with every step run
and the log reading *Deployed to PRODUCTION*; Push-on-main success; Spine on
`3cf6f9f` — the tree that was promoted — success, all 37 steps.

**AND SIX QUOTATIONS OF THE OWNER'S OWN SPEECH WERE FOUND IN THIS REPO, ALL
GREEN ON EVERY GATE.** Found while checking `main` out to promote. The privacy
rule has two clauses — never by name, never in what words — and
`privacy-check.mjs` anchors every pattern on the NAME, so a verbatim quoted
sentence is invisible to it.

- `ADR-0025` after *"Settled:"*, and `ADR-0093` after *"what was reported from
  the device"*, which is the *who reported it* pattern the rule names in terms.
- `ADR-0073`, `ADR-0094` and `ADR-0096` as blockquotes under an explicit
  attribution line, plus two first-person paragraphs in this file — one carrying
  a typo, which is what raw message text looks like.

All six now state what was wrong and what it measured. **`quote-check.mjs` is the
gate** (hub `4f2f362`, wired into the Spine beside the privacy gate and as
`npm run quotes:check`): every set-apart quotation is declared in `.quote-allow`
as *document*, *product-copy* or *analysis*. It is a LIST because three pattern
rules were measured against the real violations and flagged 39, 138 and 227 files
of honest prose — the shape of ordinary speech and the shape of the product's voice
are the same shape. Hub LESSONS §108.

**2.14.1 — AND THE WAY OUT WAS INSIDE THE THING IT UNDOES.** Found by rendering
the state the release had just made dangerous: **mode ON, nothing asking.** The
offer card is hidden whenever nothing is being asked, and
`#nextup-plain-off` lived inside it — so the screen was capture, the proof line,
`More`, the ⓘ, the footer, and **no control anywhere that turns the mode off**.
The mode survives a reload by design, so turning it on and then finishing or
deferring the last thing is the whole route in.

**It was survivable until 2.14.0 and not after.** With the work surface still
standing underneath, the reader was stuck in a mode that had nothing left to
strip; with the surface cleared, the same state is a blank screen. **The release
did not create the defect. It changed what the defect costs**, which is the
thing a release note about "what changed" cannot see, because nothing about that
line changed.

**The card's own comment said the exit must always be visible** — *"being unable
to leave it would be a trap, and the reader who most needs this state is least
able to go looking for the exit"* — written directly above the element, inside
the container that hides. `tools/plain.mjs` asserts the CONTAINMENT now:
`#nextup-plain-off` is not a descendant of `#nextup`, statically. A comment
saying the exit must stay outside the card is what the card's comment already
said.

**A control that undoes a state must not live inside anything that state can
hide.** That is the general form, and it is worth carrying to the siblings.

**The a11y ceiling went 9 → 10 in the same release and the +1 is an ACCOUNTING
artefact**: the exit was inside the card and therefore not counted outside it.
Nothing was added to the screen; one control crossed the boundary the count is
drawn around. Same shape as `size-check.mjs`'s 229 → 230.

**2.14.0 — "JUST ONE THING" IS A FACT ABOUT THE SCREEN, NOT ABOUT THE CARD
([ADR-0104](docs/adr/0104-the-worst-day-is-the-whole-screen.md)).** The mode for
the day when operating the tool is itself hard stripped the offer card and left
the app standing underneath it, for four releases, unmeasured.

**RENDERED AND COUNTED AT 390×844 ON THE THIRTEEN-ITEM SAMPLE, WITH IT ON.** The
card: five controls, two words. **Below the card: fourteen controls and 65 words
of standing text — the same fourteen and the same 65 as with the mode off.** Not
one of them moved. The runway ran to 2.18 screens.

**The two hardest lines on the surface were among them.** *Needs a new plan — one
date has gone by* and *one thing is with someone else*, printed underneath a card
that had just had its reason line removed for being one thing too many to read.

**The reasoning was already written, at one third the scale.** 2.13.0's own strip
rule refuses `#nextup-also` because three names beside the offer are the pile
arriving in miniature. The held list, the sort queue and the replan queue beneath
it are the pile arriving whole, and no property makes three too many and a
complete inventory acceptable.

**After: five controls above, five on the card, two below — the footer's licence
link and the version. 0.72 screens, entire.**

**WHAT SURVIVES IS FIVE THINGS AND THE LIST IS SHORT ON PURPOSE.** Capture and
its receipt (unconditional, from every state); the proof line (it is what makes
everything being out of sight safe); `More` and the ⓘ (a screen with no way to
anywhere is a trap); the update strip (Doctrine §7h); and a running focus
session, which is the one thing rather than the pile.

**THE COST, STATED RATHER THAN DISCOVERED: search is not on this screen**, and
the work surface is its only route. On this day *where did I put it* is answered
by leaving the mode. That is a real loss and it is the trade.

**THE MECHANISM TOOK THREE GOES AND ONLY THE MEASUREMENT CAUGHT EITHER MISS.**
A loop setting `hidden` at the top of `work.ts`'s refresh works for chrome
nothing repaints and for nothing else — `paintJump` runs deliberately AFTER
`work.refresh()`, and `triage.refresh()` is called from two places outside the
refresh chain. Then a `<style>` element generated from the list at mount, which
**the app's CSP refused** (`style-src 'self'`) while the console said so and the
mode went on stripping nothing. The source read correctly through both. The rule
lives in `public/app.css` now as a generated artefact of `PLAIN_CHROME_HIDDEN`,
written by `node tools/plain.mjs --write` and held to the list by the gate.

**AND THE LIST THAT WENT STALE IS NOW ACCOUNTABLE BOTH WAYS.** The card has had
that pair since 2.10.0 and has not drifted since; the chrome had one list of
three selectors and nothing checking it against the surface, which is how fifteen
sections joined the worst day's screen without anybody deciding they should.
`tools/a11y.mjs` walks the rendered header, `<main>` and the footer with the mode
on and fails on any region declared in neither — **against the DOM, because
reading nesting out of the markup with a regex is how a gate ends up agreeing
with a file instead of a screen.** It found the wordmark undeclared on its first
run. The same walk counts what is left outside the offer, with no headroom: nine
controls and twenty-one words, against twenty and sixty-five before.

**One thing `#upkeep` proves on its own:** it sat in the CARD's strip list from
the day the mode was built, where the both-directions check could not see it
because that check only validates ids beginning `nextup-`. The one runway section
the mode did strip was the one nothing was checking.

**2.13.0 — WHEN A PLACE COMES ROUND, YOU CAN SEE WHAT ELSE IS IN IT.** The
thesis's open half, and the last routing proposal in `docs/nd-collisions.md`
still reading *V2-candidate*. Entry 3 is the best-evidenced entry in the
catalogue — cue-dependent prospective memory failure — and its claim is that a
thing which leaves the visual field leaves existence. **Filed means gone.**

Law 4's push-down was built and stopped one step short: when a horizon came
round, the `beneath` tier offered ONE actionable thing from inside it and named
the host, so the reader learned that something was in The flat and never learned
what else was. **The place returned and its contents stayed filed** — the failure
happening inside the fix for it.

**A COUNT IS NOT CONTENTS.** `placeWords` already said "7 under it", which
reports that seven things exist without making one of them visible. Naming three
is the whole difference.

**Bounded three ways**, because the tier's own restraint is that an area with two
hundred descendants must not put two hundred things on screen: the output is
capped at three, **the WALK is capped too** rather than trimming after building,
and it is names only — no dates, no acts, nothing asking.

**And it does not repeat the card.** The offered thing's own ancestors are
already on the place line, so listing them would be one fact in two
vocabularies — the defect the `serves` line beside it already guards against.

**TWO THINGS WERE FOUND BY RENDERING IT, NEITHER BY THE TESTS.**

- **The first render showed the project the card already names.** The ancestor
  exclusion was written and the bundle was not rebuilt, so the picture was of the
  previous build. `size:check`'s own comment warns about exactly this and it
  still happened.
- **"Also in there" was ambiguous.** With "in Get the kitchen tap fixed · under
  The flat" directly above it, *there* could be either container. It names the
  place now: **"Also in The flat: …"**.

**`npm run look` renders it**, as a fifth picture, and prints the line it found
or says the state did not arise. No walk could reach it: `beneath` is computed
only when nothing else is asking, every walk fixture is a populated store, and
the state needs a review clock ALREADY PAST on a container, which no date control
in the app can set. It is seeded straight into the store for that reason, and the
comment says so.

**Staging is 2.14.1 and it is waiting on your on-device pass.** Production is
2.13.0, promoted on 2026-08-20 and read off the runs rather than the push output:
`e3494c4` concluded success on Deploy, on Push-on-main and on the Spine.

**2.13.0 was waiting on that pass when this said so, and the paragraph below is
what it said at the time.** The docs-and-tooling work before it changed no shipped byte — measured, not assumed:
`git diff --name-only 6cbb5ab HEAD -- public/ src/` is empty, so the deployed
artefact is byte-identical and there is no release to number. (This paragraph
said *2.12.3* before that was checked, which is the fourth time in this session a
claim was written before it was read off something. It was caught here rather
than after it shipped, which is the only difference.)

Three
releases are stacked there now — 2.12.0, 2.12.1 and 2.12.2 — and they are one
subject: the landing surface saying less.

**2.12.2 — THE OFFER CARD STATES NO NUMBER THAT MOVES ON ITS OWN
([ADR-0103](docs/adr/0103-the-card-states-no-moving-number.md)).** `#nextup-left`
— *"About 2h 30m left today."*, called **the one permitted number** since V2
stage 5 — is off the card. This settles the question 2.12.0's notes left open,
and it was settled from material already in the repo rather than by taste.

**Four things said it, and none of them had been put beside the others:**

- **The card forbids exactly this three lines lower.** `nextFixedWords` names
  the next unmoveable thing and is held by test to no number at all, on the
  reasoning in `src/clock.ts` that a shrinking number against an aversive thing
  adds aversion at the moment of approach. The remainder shrank every minute.
- **The header clock is opt-in on that same reasoning** — *"a clock is the most
  charged piece of chrome there is, because half the point of this app is that a
  day is not a countdown"* (`src/ui/about.ts`, written when it was built). The
  card said the same arithmetic to everybody, undeclinable, and nothing anywhere
  argued why it was affordable there.
- **With the clock on, the app said it twice at once** — header and card, two
  phrasings, no coordination between them. That is ADR-0102's defect at line
  granularity instead of block.
- **Its own defence needed a second half that never shipped.** The line was
  prospective — a fit judgement before an attempt — and a fit judgement needs
  how long the thing takes. `rangeWords` renders in the detail sheet and nowhere
  else. V2 stage 5 shipped a pair that never met.

**And "Just one thing" had already decided it, one surface short.** The mode
stripped this line with the reasoning that on the worst day every hour costs
most. No paragraph ever argued the ordinary day. There is no property that
distinguishes the two surfaces.

**`timeLeftWords` is DELETED, not left exported.** ADR-0031: a projection nothing
renders is the log lying rather than merely silent — and `src/duration.ts` is the
file that was written with no reader and is named in `smoke.mjs` for it. An
export kept warm "in case" is that state with a nicer story. `remainderWords` in
`src/clock.ts` is untouched; the fact keeps the home entry 9 of
`docs/nd-collisions.md` gives it.

**Two gate repairs came out of the same work, and neither was the subject:**

- **`adr:check` read one link per row and nothing else.** The `extends`/`narrows`
  links under each row and every cross-reference inside a record were unchecked,
  and **five were broken** — naming a plausible slug the file has never had, like
  `0083-the-panel-stops-folding.md` for `0083-four-destinations.md`, which is
  what that record is about rather than what it is called. Fixed, and the check
  added; watched red on a plant that only the new check can see, four `ok` beside
  one `FAIL`.
- **`gates:audit` left its plant in the tree when it was killed.** `finally`
  covers a throw and does not cover a signal, and a full audit is many minutes of
  synchronous child processes. Observed: a run interrupted during the a11y plant
  left `public/app.css` carrying `--line: #F3F0E8` — a near-invisible control
  boundary in the deployed stylesheet, planted by the tool whose job is proving
  defects get caught, and invisible to every gate that does not measure contrast.
  The restore is now registered process-wide as well.

**2.12.1 — "HOLD WHAT I COPIED" IS GONE, BECAUSE PASTE ALREADY DID ALL OF IT.**
Reported as redundant, and checking settled it: `src/ui/app.ts` has a `paste`
listener on the capture field that calls the SAME `takeText` the button called.
Multi-line splitting, the *one thing per line* line and the *Hold it as one
thing* escape all belong to paste; none of them belonged to the button. It read
the clipboard for you and nothing else.

**What it did buy was two taps on a tablet** — press it rather than tap the box,
long-press, choose Paste. A real saving on the capture path, which is the one
thing that must never break. Against that: a permanent control on the surface
this app most wants quiet, duplicating a gesture every reader owns, for the less
common way of putting something down. 2.10.0 counted thirty-one things asked
before anything could happen and this was one of them.

**The smoke block was repointed rather than deleted**, and that is the part
worth copying. Every behaviour it asserted still exists via paste, so the block
now drives a real paste and proves nothing was lost — plus one new assertion
that the button is gone. **It also needed a REAL keyboard paste**: the handler
returns early for a single line and lets the browser do the insertion, which a
synthesised `ClipboardEvent` does not perform, so the first version left the
field empty and timed out. The driver's limit, not the app's — the same
instrument-cannot-reach-this-state shape found three times today.

**EVERY GATE HAS NOW BEEN WATCHED FAILING** (`npm run gates:audit`). Twenty-one
gate scripts; for each one, plant the defect it exists to catch, run the exact
command CI runs, require a non-zero exit, restore, and require green again — a
"gate" that fails on everything is equally useless and would sail through the
first half of that.

**All twenty-one are red on their plant and green again after.** That is the
first time any of them has been held to the standard this repo already wrote
down for the privacy gate: *wired means the exact CI command was seen red on a
LOCAL plant.*

**It found no broken gate. It found seven broken PLANTS, and that distinction is
the whole value of the tool.** The first run blamed seven gates; every one was
doing its job and being aimed at with the wrong lever:

- `brand:check` measures declared colour PAIRS, not the wordmark and not the
  icon file — rendering the assets is `npm run brand`, not `:check`.
- `sample:check` builds its store from `src/big-sample.ts`, not `src/sample.ts`.
  Two plants edited a file it never reads and it kept correctly reporting
  16 node kinds of 16.
- `emitters:check` tracks only nouns that exist in the CODE, so an invented
  vocabulary entry is none of its business; the defect is a real kind losing
  its entry.
- `notify:check` inspects only files that actually call a notification API.
  Nothing does yet, so it reports itself **armed and dormant** — banned copy in
  an unrelated const is correctly ignored. It goes red the moment a real
  emitter carries it.
- `size:check` measures the BUILT app. A plant in `src/` without a rebuild never
  reaches it, which is the gate being right about what a person actually reads.
- `writegate:check` and `editions:check` were both aimed at the wrong artefact.

**And the harness had the defect it was built to hunt, within the hour.**
`String.replace` returns the original string when its pattern is not found —
silently — so a plant written against a reworded line mutates nothing, the gate
correctly stays green, and the audit reports the gate as broken. It now refuses
a plant that changed no bytes. **That is the second instrument today to carry
the fault it was made to find** (`tools/look.mjs` rendered a focus state no
person can reach), which is worth saying plainly rather than quietly fixing.

**2.12.0 — THE FRONT PAGE STOPPED BEING A LIST** ([ADR-0102](docs/adr/0102-the-inventory-is-folded.md)).
Measured at 390px on the thirteen-item sample, whole page rendered: the runway
was **4,247px** and `#held` was **2,387px of it — 56% of the landing surface was
one list.** It is **2,228px** now.

**Seven items were on that surface twice or three times** — the offer's head,
its two also-available rows, the replan card and the with-someone card were all
also rows in the inventory below. Two carried **different acts in the two
places**: *Put the recycling out for collection* offered **Not this one** in
*Needs a new plan* and **Work on this · Done** two screens down.

**Collisions entry 1 has said this since it was written:** *"a long list raises
the activation threshold of every item on it"*, and the single Next-up card is
this app's stated answer to that entry. It was sitting on top of the pile rather
than instead of it.

**Why a fold and not a sheet, and why this is not the fold ADR-0083/0088
refused.** Their finding was right and general — *"a fold changes how much stands
in front of you and not how far you have to travel, and travel is what was
expensive"* — and it was derived from SIBLING folds mid-surface, where opening
one pushes the rest out of reach. `#held` is the LAST block; nothing follows but
the footer, so the two quantities are the same one and closing it removes the
travel rather than rearranging it. And a fold is **not a switch**: entry 6 says a
forced transition can cost the day and ADR-0099 left scroll-versus-switch as the
question nobody may settle from a chair. A sheet would have taken that trade.

**No counts, and that is a rule.** ADR-0032: *"groups are headings, not counts of
things undone. There is no tally."* ADR-0060 retired *"8 things are asking"* and
put the honest totals in the gauge. A folded list captioned with numbers is that
backlog headline rebuilt. The summary names the groups and states no number, read
from `heldGroups` so a renamed group cannot leave it lying.

**Every route into it opens it.** `#to-held` and the skip link both target
`#cards`, which is inside — a jump to a closed fold lands on a heading, moves
focus into something with no visible content, and reports success.

**The separation gate caught a defect I introduced, first time it has stopped one
arriving.** `#restore-go` and the new summary were **0.0px apart on every state**
— the exact shape 2.9.3 was written for.

**And the folded state is audited as its own state**, non-vacuity first: it is
asserted closed AND asserted to be naming groups, because every other assertion
is trivially true of a fold that was never closed.

**Staging and production were level at 2.11.0.** Promoted 2026-08-19, `10d329f`,
with the promoted tree asserted byte-identical to the verified staging tree —
`e38fe6e` on both — rather than inferred from a clean merge. Four releases went
in it: 2.10.1, 2.10.2, 2.10.3 and 2.11.0.

**AND THE PICTURES CANNOT GO STALE WITHOUT SOMETHING REFUSING.** The gate that
shipped with 2.11.0 only *detected* drift and asked a human to remember. Three
layers now, and only the middle one is new work:

**At the moment of the change** — `.branch-guard` gained `also=` in the hub, so
the generated pre-commit hook runs repo-local checks before its branch rule, on
every commit including a promote. Quietkeep declares
`also=tools/hooks/tour-fresh.sh`, which refuses a commit whose staged diff
changes what the pictures are OF while `public/tour/manifest.json` is unchanged.
**Watched go red on a planted CSS edit, then green after the command it names.**
It also refuses a manifest that is merely STAGED but records the old UI, which is
what a reflexive `git add public/tour` produces if the regeneration failed.

**One idempotent fix** — `npm run tour:shots -- --if-stale` compares the recorded
hash first and does nothing when nothing moved, so the hook is never telling
somebody to spend a minute they do not need.

**In CI** — `tour:check` as the backstop, plus `branch-guard --repo .`, because
`--no-verify` walks straight past any hook and a guard that is only local is on
until the first time somebody is in a hurry.

**OVER-FIRING IS THE SAFE DIRECTION HERE, and that is a real exception to this
repo's own rule.** A gate that cries wolf normally gets satisfied by reflex — and
that is dangerous because the reflex is to SUPPRESS. Here the reflex is to
regenerate, which is the outcome wanted. A coarse hash firing on an edit that
could not have changed a pixel costs a minute and leaves the tree correct; a
missed change ships a lie.

**What was deliberately NOT built: a CI job that re-renders and byte-compares.**
It would have been the obvious design. Two of these pictures show things that
legitimately differ run to run — whichever sample item is next in the queue, and
the browser's real free-space figures — so regenerating with nothing changed
still rewrites four of the ten files. That gate would be permanently red, and a
gate that is always red is one everybody learns to ignore.

**2.11.0 — THE WALKTHROUGH SHOWS YOU THE THING IT IS TALKING ABOUT.** Six steps
described an app the reader was looking at and could not see yet — *"the box at
the top"*, *"it offers you a small number of things"* — with no picture of any
of it. Five of the six carry one now, generated from the running app in both
themes by `tools/tour-shots.mjs`, precached so a first run offline is whole.
**277KB across ten files at 1x.**

**Crops, not screens, and the weight is the lesser reason.** A full screen at 2x
is ~64KB and ten of them is three quarters of a megabyte in a shell that must
precache; but a picture of the whole screen does not point at anything. The step
about the capture box shows the capture box.

**Generated, never drawn, and gated on drift.** `tour:check` compares a recorded
hash of the files that decide what is IN the pictures and fails once any moves —
the same one-source-plus-a-gate shape that fixed the changelog, the doors list
and the strip list. **A help screen illustrated with a UI that no longer exists
is worse than one with no pictures**: stale prose reads as stale, a screenshot
reads as proof. Wired into the Spine.

**The drift list was wrong once, in the safe direction, and was narrowed.** It
began with `src/ui/tour.ts` — the walkthrough's own words — which cannot change
what the app LOOKS like, so the gate went red the moment the alt text was written
and demanded a regeneration that could not have altered a pixel. **A gate that
cries wolf gets satisfied by reflex.** It watches markup, stylesheet, and the
three renderers whose output is actually pictured.

**Alt text is written by hand and cannot be generated.** It says what a picture
MEANS to somebody who cannot see it, which is not a list of what is in the
rectangle — and this is the screen where a reader knows least about the app.

**AND THE WALKTHROUGH'S OWN BUTTONS HAD BEEN BREAKING IN HALF.** From step 2
onward the row is *Skip*, dots, *Back*, *Next*, and flex items shrink below their
content width by default, so on a 390px phone the labels wrapped INSIDE the word:
**"Ski / p", "Bac / k", "Nex / t"** — on the first screen anybody ever sees, on
every step but the first. They were 44px targets, contrast-passing and uniquely
named throughout, and **axe has no opinion about a word broken in half**. Found
by looking at a picture of step 2, in the release that exists to add pictures.

**Four framing defects the generator shipped before it stopped shipping them**,
each of which wrote a plausible-looking file: an element taller than the window
came out cut with dead space under it; a frame aimed at a `<dl>` filled at
runtime produced a strip of whitespace; the sorting card was framed to a section
whose own box ends above its final row; and the guard written to catch a cut
frame had been edited into the other branch of the function and never ran. The
tool refuses all four now, by height rather than by file size — the first guard
compared bytes and rejected the capture box at 5.5KB, which is small because it
is a tight crop and is exactly the picture wanted.

**2.10.3 — EVERY ROUTE IN, THROUGH AND OUT, PHOTOGRAPHED.** The audit of that
name was done by reading code and running gates. The app was never rendered
along those routes and looked at. The a11y walk already DRIVES all of them —
93 audited states across both themes, proven traversal — and had never produced
a single picture, so `LOOK=1 npm run a11y` now writes every state it reaches to
disk. 188 files. The traversal was never the missing part.

**Three defects in the first pass through them, all invisible to every gate:**

**The clearing-out panel invented a chore over an empty planner.** With nothing
in the store it said *"This clears 0 things — everything you are keeping here,
people, weights and private entries included"*, warned no copy had been saved,
made **Save a copy first** the loudest control, and demanded the word `clear` be
typed out to authorise doing nothing. `purgeSummary` one line above had always
said *"There is nothing here to clear."* — the confirmation under it had simply
never been told. **The same defect as 2.9.4**, on the other surface nobody had
looked at. `start-again` is deliberately NOT folded in: it erases the log, so a
store holding nothing may still have a history worth a copy.

**"Not kept yet — press Set." rendered below the entire note field**, four
controls from the button it names, under a section whose only button says *Keep
the note*. `#detail-date-group` was never closed before `#detail-note-group`
opened inside it. **Every gate passed**, because `aria-describedby` points at the
right element wherever that element sits — the announcement was always correct
and only the eye could see it was in the wrong place.

**The stuck-update card made a backup its loudest act.** Hiding *Install it now*
(pressing it again cannot help) left **Save a copy** first, which is where the
filled style lands — directly under a sentence saying nothing you have written
is affected. Loud by REMOVAL, not by decision. The state is one token now and
CSS owns its appearance.

**AND THE WALK WAS RE-ENACTING THAT STATE BY HAND.** Its comment claimed it drove
the stuck strip *"exactly as mountUpdatePrompt drives it"*; it was a copy of two
DOM mutations, so the moment the real code grew a third the claim was false and
the walk photographed a state no reader gets — with every assertion under it
green, because all of them were true of the half-driven state. Both sides set the
same `data-state` now, and the walk asserts the state took.

**Two vacuity traps found and closed while fixing the above.** The typed-word
confirmation — the one surface standing between somebody and their history — is
now asserted to be guarding something, because it is withheld entirely over an
empty store and the wait for it would otherwise read as a flake. And the empty
store gained four assertions of its own, non-vacuity first: the store really is
empty, no ceremony is staged, it says so plainly, and no backup chore leads.

**Two things checked and found NOT to be defects, before changing anything.**
The welcome heading's box is a focus ring — `border: none`, `outline: 2px`,
`:focus-visible` true on first load with no prior interaction — which is correct
and must stay. And the offer heading's ring in an earlier picture came from a
synthetic click in the probe, not from the app. **A tool that renders a state no
person can reach is the same defect as a gate that measures the wrong thing**,
and it twice nearly bought a fix to behaviour that was already right.

**2.10.2 — THE CARD STOPPED TELLING YOU ABOUT THE THING IN FRONT OF YOU.**
Found by rotating the offer six times and reading what the card actually said,
which is the same method as 2.10.1 and the reason that release exists.

**`Fixed today: <the head>` was on the card on every one of six rotations, and
named the head itself on two of them.** A real date today is the first reason
`nextUp` ranks on, so the next unmoveable thing today and the thing being
offered are the same item **by construction rather than by chance** — the
line's value is that it names something you are NOT looking at (collisions 7
and 9, the afternoon being eaten by a 3pm appointment), and against the head it
has no value left, only length. Card 761px → 728px on that offer. It still
renders, unchanged, when it names a different item; the focus surface is
untouched, because nothing there shows a head.

**By identity, not by title.** `nextFixedToday` now returns the node's `id`. A
title comparison would have done at the one call site and would have been a
quiet bug the day two things are both called *Ring the plumber back*, which in
a planner is not a hypothetical. Three tests, both directions — the suppression
must not be satisfiable by a line that never renders (hub LESSONS §100).

**A CLAIM IN 2.10.1's NOTES WAS WRONG AND IS CORRECTED HERE.** It said the
also-available list was "still wrong", on the strength of `BEHIND_CAP = 5`
meaning a card headed *one thing* could list six. **`BEHIND_CAP` is in
`nextup.ts` and never reaches the card.** `offerNow` applies `OFFER_CAP = 2`
(ADR-0060), and the measurement says so: two also-available rows on every one
of six rotations, never more. The card is the head, one more piece of work of a
different kind, and the wish — which is exactly what ADR-0060 decided, with its
reasoning about comparison versus preference intact.

**That claim was inherited and repeated without being checked, in the release
whose entire subject is not checking.** It reached a shipped patch note. The
lesson is not "look at the screen" — 2.10.1 already learned that — it is that a
number read out of one file does not tell you what a surface renders, and the
only thing that does is the surface.

**What that leaves genuinely open on the card:** the line saying how much of
today is left. It carries a shrinking number on the same card as a line
(`nextFixedWords`) that is forbidden by test from carrying any number at all.
It is already stripped in *Just one thing*. Whether it belongs on the ordinary
card is a real question and it is not settled.

**SETTLED IN 2.12.2 — the line is gone
([ADR-0103](docs/adr/0103-the-card-states-no-moving-number.md)).** It was
settleable the whole time from material already written down: the rule the card
applies to the line beneath it, the reasoning that made the header clock opt-in,
the duplicate that appears the moment the clock is on, and the fit judgement the
card never had the other half of. **Nothing new had to be learned and nobody had
to be asked** — the four facts had simply never been put beside each other.

**AND THE LANDING PAGE IS 5.4 SCREENS, SHOWING EVERY ITEM TWICE.** Measured at
390px on the thirteen-item sample, with the whole page finally rendered:
**4,584px tall.** `#held` — the full inventory — is **2,387px of the 4,070px
runway, 58% of it**, and it repeats every item already shown in the offer card,
in *Needs a new plan* and in *With other people*. Seven items appear two or
three times on one surface.

**The research says this plainly and has since it was written.** Collisions
entry 1: *"A long list raises the activation threshold of every item on it."*
The app's answer to that entry is the single computed Next-up card — and the
list it exists to replace sits directly beneath it, twice over.

**It is not obvious what to do and that is the honest state.** Entry 6 says a
switch is expensive and ADR-0099 already named scroll-versus-switch as the open
question that cannot be settled from a chair, so moving the inventory behind a
door is not automatically right. Nor can the inventory silently omit what is
shown above it — *"what you are holding"* that is not everything you are
holding breaks the promise law 1 exists for. **What is not a trade-off is the
repetition itself**, and no entry defends it. This is the next release and it
wants an ADR, not a patch.

**2.10.1 — THE SCREEN WAS NEVER LOOKED AT.** Asked whether the UI arrived at by
iteration was the UI a version designed whole would have, the answer given was
pixel offsets and control counts. **The app was never rendered and looked at.**
Twenty tools in this repo measure it and, until this release, none showed it.

**What one picture had that no number did.** Eleven outlined rounded rectangles
of identical weight, so nothing led. The task itself — the one thing this app
exists to hand somebody — drawn as a bordered box identical to the capture field
above it and the smaller-step field below it: **the item was rendered as a form
to fill in.** Six verbs as six full-width boxes stacking one per line. Three
dark-filled buttons of equal loudness on one screen. Four lines of prose
explaining what a first physical action is, printed on the thing you are trying
to begin. Every one of these is visible at a glance and every gate was green,
correctly — they measured what they measured.

**Now:** the title is large plain underlined type, `Done` is the single loud act,
`Not this` its quiet pair, and *Start smaller*, *This one is heavy*, *That is
enough for now* and *Just one thing* are underlined words rather than boxes.
Nothing was hidden and nothing moved. The smaller-step field stands open only
when asked for, and the four lines went with it. The proof line and the ways
elsewhere are a hairline instead of a heavy border.

**`tools/look.mjs` ships with it (`npm run look`).** It asserts nothing — no
counts, no budget, no exit code to satisfy. It renders the app at 390×844 and
writes four pictures: first run, with things in it, the whole page including
what is below the fold, and "Just one thing".

**And it had the same defect it was built to catch, within an hour.** The first
version drove the app with `element.click()` inside `page.evaluate` — a synthetic
click, which Chromium does not count as a user interaction, so the focus modality
stays wherever it was. Its picture of "Just one thing" showed a 3px focus ring
painted around the heading, the loudest box on a screen whose whole purpose is
that nothing is loud. **That ring is not in the app.** Tapping the same control
with a real touch event gives `:focus-visible: false` and `outline: 0px`;
reaching it by keyboard gives the 3px ring, which is exactly right. A tool built
to show the truth about a screen was rendering a state no person can reach, and
it very nearly bought a "fix" to correct behaviour. Real input events only, and
the reason is written in its header.

**Three checks were asserting a route that no longer exists**, and all three
failed on the next run rather than passing quietly, which is the design working:
the a11y and smoke walks both typed into a field that is now behind a door, and
smoke asserted that finishing a first step leaves the field standing open — the
exact thing this release removed. Its intent survives (naming one first step is
not a one-shot) so it now asks for the quiet word instead. Asking for the field
is a state that did not exist before, so it joined the contrast registry in the
same commit (hub LESSONS §28) and is measured in both themes; the four entries
that had been registered against `next up` moved with it.

**What this release left on the card** is recorded accurately under 2.10.2
above — the also-available list is ADR-0060 working as decided, and the
`BEHIND_CAP` claim that appeared here was wrong.

**2.10.0 — JUST ONE THING MEANS THE WHOLE SCREEN.** Found on a device, on a
screen showing exactly one task: **the screen was too busy to begin in, even
though the offer on it was a single item.** The honest response was a count, not
an argument.

**Counted at 390px on the thirteen-item sample: 31 things asked before anything
can happen.** Nine controls, four lines of standing text, and **eighteen things
on the card that is meant to be one thing** — including three other tasks
(`BEHIND_CAP` is 5), seven verbs and seven lines of prose.

**And the mode built for exactly this day changed none of the chrome.** "Just one
thing" only ever reached inside the card. Same nine controls, same four lines; it
took 31 to 21.

**Three lines had been slipping through it for three releases.** `#nextup-left`
(how much of today is left — its own markup comment warns a countdown is
"pressure where it costs most"), `#nextup-fixed` (the next unmoveable thing) and
`#nextup-written` (when it was captured) were each added to the card AFTER
`PLAIN_HIDDEN` was written, and none was added to it. The oldest defect in this
repo wearing a new hat: a hand-written list with nothing checking it against the
set it covers.

**Now: 31 → 15.** The card is the thing, Done, Not this, That is enough for now,
the way back, and the standing "everything is still here". The strip reaches
`#capture-room`, `#capture-paste`, `#contents-open` and the clock. Capture, the
proof line and `More` never go — a screen with no way to anywhere is a trap.

**Two gates, because the list is what failed.** `tools/plain.mjs` requires every
element of the card to be in `PLAIN_HIDDEN` or `PLAIN_KEPT` — a new line fails
the build until it says which. And the a11y walk checks the SCREEN against the
lists rather than the lists against themselves, because one of the three was in
the list and visible at the same time: `paintWritten` resolves a store lookup and
un-hid itself a tick AFTER the strip, which the strip's own comment ("has to be
the last word") is true of a pass and not of a promise. Planted: it names
`#nextup-written "Written this evening"`.

**Still open, and the honest next question:** the DEFAULT card is still 18
things, and `BEHIND_CAP = 5` means the card headed "one thing, chosen for you"
lists up to six. That is a design decision with ADR-0060 behind it, and it wants
its own release rather than being folded into this one.

**Five went in the previous promote — 2.9.0 through 2.9.4 — on the owner's word rather than
after a device sitting.** Four of the five exist BECAUSE of a device report, and
the chain is worth reading as one thing: 2.9.0's frame was built on ADR-0099's
measurement, and then the device found what the measurement could not. 2.9.1
(boxes anchored to the page's text rather than their own), 2.9.2 (the frame
clipping the proof line at large text) and 2.9.3 (controls 0.0px apart) were all
reported from the device inside a day, and 2.9.4 came from reading a diagnostic
rather than from anything the owner said was wrong.

**Still open and named as such: V-24.** A page whose document does not scroll
never lets iOS collapse the URL bar, so browser use pays roughly 60px on top of
the frame; installed to the Home Screen it is zero. One look in Safari settles
it, and ADR-0100 says what happens if it dominates — the frame belongs to the
installed app and the browser gets the old shell.

**2.9.4 — THE REPORT SAYS ONLY WHAT IS TRUE.** Found by reading a diagnostic
sent from a device — a store with **0 events, 0 held, every count zero** — and
noticing two things in it that do not hold up.

**It told an empty store to back itself up.** The first line under WHAT IS WRONG
was *"No copy has ever left this device. Everything here exists in one place, and
clearing website data would take it."* There is no everything and nothing to
take. `findings()` raised it on `!lastCopy(log)` with no check that there was
anything to copy — a chore invented out of an empty store, on the one surface
whose whole job is to say only what is true, and law 6 forbids exactly that.
Guarded on the LOG rather than on what is held: a store whose every item has been
let go still has a history worth a copy.

**And "Used by Quietkeep: 1.3 MB" beside a log of 0 events.** Neither a lie nor a
bug: `navigator.storage.estimate()` is per-ORIGIN and counts the app's own
downloaded code alongside anything the reader put in, and the browser does not
separate them. The LABEL was claiming a precision the number does not have. It
reads *Used at this address* now, and says what is in it. Fixed in both places
that state it — the report and the (i) panel's storage block.

**Kept deliberately:** the not-persisted finding still fires on an empty store.
That one is the thing to sort out BEFORE relying on the app rather than after.

Both pinned, and the guard planted: reverting `!copy && log.length > 0` to
`!copy` fails *"an empty log raises no missing-copy finding"*.

**2.9.3 — NO TWO CONTROLS TOUCH.** Reported from a device: *Bring a copy back*
and *What's on this page* overlap. Measured: **0.0px apart at every viewport and
every text size, and always.** `.about-actions` carries a top margin and no
bottom one, `#cards` is empty on a fresh store so margins collapse straight
through it, and `.contents-open.jump-shaped` had no top margin either.

**Four more of the same shape came out of looking:** the two `.nextup-actions`
rows, `.replan-card`'s door and its skip, `.comms-actions` stacked on the closing
surface, and the bars inside `#triage-undo`. Every one a pair of full-size
targets with 0.0px between them.

**Nothing was checking it, which is why a person found it.** Every check in
`a11y.mjs` asked whether a control was big enough; none asked whether it was
SEPARATE. `auditSeparation` runs at every state the target audit already covers —
one call site, so there is no second list of states to keep in step.

**The check was wrong twice before it was right, and both are recorded in it:**

- v1 asked whether boxes INTERSECTED and reported "none" on the very defect it
  was written for, because they abutted rather than overlapped.
- v2 clipped each box to what was visible, which killed a false positive (it had
  claimed the capture box overlapped a people row by 237px — a control scrolled
  out of the runway still reporting where its box would be) and introduced a
  worse one: **planted with the reported defect it went GREEN**, because those
  two buttons are below the fold in every state the walk drives.
- v3 groups controls by their nearest scrolling ancestor and compares in that
  scroller's CONTENT coordinates. Nothing is skipped for being scrolled away, and
  two things in different scrollers are never compared because they cannot share
  pixels however either is scrolled. Planted: it names `restore-go /
  contents-open-end are 0.0px apart, inside held`.

Inline controls are exempt from the TOUCH half only — an Undo inside running
prose is separated by line-height, which is a typographic fact and not a layout
one. They stay in the overlap half.

**2.9.2 — THE FRAME STANDS DOWN RATHER THAN CUTTING ITSELF IN HALF** (ADR-0101).
Reported from a device at a larger text size: the proof line was sliced through
the middle of its own sentence.

**ADR-0100's cap was the right instinct and the wrong remedy.** `max-height: 50dvh`
with `overflow-y: auto` means that past the cap the frame scrolls INSIDE ITSELF.
Its own consequences section predicted *"the proof line is one small scroll away
rather than gone"* — a guess about how a capped scroller would read, and wrong in
a way only a device could show. Reproduced at 390px: 474px of content against a
422px cap at 175% browser text, 530px at 200%, 468px at the app's own 150%.

Past half the viewport there is now no frame: everything returns to ordinary page
content and the document scrolls, exactly as before 2.9.0 — a layout that shipped
for months. **Two thresholds** (down past 50%, back below 42%) so a height near
the line cannot flip on every measurement and rebuild the page under the reader.

Measured on the sample: phone 390x844 **34%, up**; phone with the address bar
390x664 **43%, up**; iPad **18%, up**; 320x568 **59%, stood down**. No reader on
a real device loses it at ordinary text.

**And two gate assertions were measuring in a mode they could not name.** The
contents jump reported 1,419px of error because it took the runway's top as its
origin while the DOCUMENT was what had scrolled, then −8px because it allowed for
a `scroll-padding-top` that only exists on the runway. Both read the mode first
now and say which one they measured in.

**2.9.1 — A CONTROL'S BOX IS MEASURED IN ITS OWN TEXT.** Reported from a device:
*changing the font size does not resize anything but the letters.* Reproduced and
measured at 390px by growing the text WITHOUT growing the root — which is what a
browser's own text setting does, and a minimum font size, and a user stylesheet:

- every button's words went **×1.50 while its box went ×1.27**, because
  `--target` and every control's padding were `rem` and the root had not moved
- **`#capture` and `#nextup-title` did not move at all** — both carried an
  explicit `rem` font-size, so the app's most important control and the title of
  the thing it is handing you were the two that stood completely still

`--target` is `max(2.75em, 44px)` now and control padding is `em`. A custom
property carrying `em` resolves against the element that USES it, so one line
re-anchors every `min-height: var(--target)` in the file. The floor still holds
for small print: 13px text gives 36px and `max()` returns 44. After: capture
×1.50, buttons ×1.50, nothing overflowing.

**A latent bug found on the way:** the capture box's `1.0625rem` dropped below
16px at the app's own *smaller* setting — and 16px is the size under which iOS
zooms the whole page when an input takes focus. It is `max(1.0625em, 16px)`.

**Gated, and planted.** The a11y walk grows `body` rather than the root and
asserts each control's box follows its own text. Reverted to `rem` it reports
`#capture` box ×1.11 and the header controls ×1.27 against text ×1.50.

**And the diagnostic now names the mechanism** (§7f): the text size, the root it
is measured against, the box it sits in, and which of the three moved it. That
question could not be answered from a screenshot and cost a round trip.

**2.9.0 — THE FRAME STAYS** (ADR-0100). The page is a flex column of viewport
height with exactly one scrolling child. Capture, the proof line and the three
destinations sit outside the scroller and never move; `<main>` and the footer
ride inside `.runway`.

**The mechanism was chosen by the record, not by preference.** ADR-0099's
measurement said the offer could not reach the top by moving blocks — it needed
capture out of the scroll. Two ways to do that were already ruled out by
measurements in this repo: `position: fixed` was the floating Contents button
that overlapped ten controls and took the centre of three, and `position: sticky`
was the (i) panel's way out that **did not hold on the reference iPad, found
twice, on device**. What replaced sticky there is what this uses — a flex column
whose bar is a sibling of the scroller — and every sheet has shipped that shape
on the reference device since 1.40.0. Carried one level up, which is hub LESSONS 93.

**Measured**, at 390x844 and 820x1180, empty store and the thirteen-item sample:

- `#nextup` begins **0.08 screens into the runway** on a phone (0.05 on the
  iPad). It was 0.43 screens down the page.
- The frame costs **201px empty, 225px seeded** on a phone (23.8% / 26.7%) and
  201px on the iPad (17.0%). A gain at the top — the same chrome took 304px —
  and a loss deep in a list, where it used to be gone.
- **Unreachable controls: zero**, both sizes, both stores. That is the test the
  floating button failed, asked again of its replacement.
- Document scroll area beyond its own box: **0px**.

**Three defects the measurements found that reading would not have.** The frame
collapsed 165px to 39px the moment there was data (`flex: 0 1 auto` distributes
shrink by basis, and the runway's basis was the whole list) — with the empty
store measuring a perfect 165px beside it. The document reported itself
scrollable because every `.visually-hidden` label is absolutely positioned and
escaped to the initial containing block. And `axe` failed all 33 states at once
on landmarks, because lifting capture out of `<main>` left it in a bare wrapper.

**And three gates were measuring the wrong origin**, one of which would have gone
vacuous: the way-back assertion tests `scrollY === 0`, and `scrollY` is now
permanently 0. Corrected at the origin rather than loosened at the tolerance.

**The open cost is V-24**: a document that does not scroll never lets iOS
collapse the URL bar, so browser use pays ~60px on top of the frame. Installed to
the Home Screen it is zero. One look on the device settles it.

**What to look at:** put something down from three screens into your list. Then
decide whether a quarter of the screen is worth it — ADR-0100 says what happens
if it is not, and the numbers stay true either way.

**Promoted on the owner's word rather than after a device pass**, which is the owner's call to
make and was made explicitly. Both 2.8.0 and 2.8.1 went in the same promote,
neither having had a separate on-device sitting. What that means for the next
session: the two things most worth hearing about from the device are the SIZE
control's smallest setting (2.8.0 — whether *smaller* is actually readable in
practice, which is the stated overturn condition for ADR-0098's lower bound) and
whether **naming a worry at two taps** is one tap too far (2.8.1 — the stated
overturn condition for ADR-0099, and the entries go back to the runway if it is).

**A CI record correction that should not be repeated as green:** `92504fc`
(2.8.0 on staging) had Deploy success, but its **Spine run was CANCELLED** by
the push of `8971f50` a few hours later. Nothing shipped unverified — `8971f50`'s
Spine covers the same tree plus 2.8.1, and `928c53a`'s covers it again on main —
but 92504fc itself must not be cited as "Deploy and Spine green". Concurrency
cancellation makes a run's absence look like a run's success in any listing that
reads only the newest conclusion per workflow.

**2.8.1 — THE FIRST SCREEN, AND WHAT A REARRANGEMENT CAN AND CANNOT BUY**
(ADR-0099). Three doors leave the runway and become rows in **Contents** — the
worry entry, the load entry, and *Sort things out*. The coverage gauge moves to
the top of the page, under capture, where it can be read before the list it is
reassuring somebody about.

**This is a measurement, taken on purpose instead of the rebuild it belongs to.**
The design read published on 2026-08-17 named it as the smallest honest first
step and said it would test that document's thesis before anything was committed
to it. It did.

**What it bought**, at 390x844, empty store and the thirteen-item sample:

- Next up — the app's whole thesis — **0.48 → 0.43 screens**
- controls on the first screen: **15 → 14** with the sample, **14 → 13** empty
- the held list: **2.73 → 2.57 screens**; the whole page **5.91 → 5.66**

Forty-two pixels of an 844px screen. The two entries freed about 110px and the
proof line put 68px back.

**What it did not buy is the more useful half.** The header is 140px and capture
96px before anything else exists, so with a proof line above the offer **the
floor in this shell is about 0.36 screens** — and it is at 0.43. About two thirds
of the reachable gain is taken and the rest is all that rearrangement has left.
**Putting the one thing at the top of the screen cannot be done by moving
blocks**; it needs capture to become fixed chrome rather than the first block of
a scroll. That is a shell change, it is not in this release, and there is now a
number to decide it with rather than an argument.

**What it costs:** naming a worry is one tap further than it was. Activation cost
at the point of performance is the best-evidenced entry in the catalogue and this
adds some; *out of sight* is answered by the proof line moving up and by the load
door reporting its own state on the row that reaches it. Both halves are recorded
in `docs/nd-collisions.md` — entry 3 gains the proof-line move, entry 6 gains the
open question this release raises and cannot settle: whether a switch is cheaper
than the scroll it replaced, in use, over days.

**Reversible on purpose.** If the worry box turns out to be one tap too far, the
entries come back to the runway and the finding stands anyway.

**What to look at:** the first screen on the phone, and **Contents** in the top
bar — the three rows under *Things you can open*.



**2.8.0 — THE APP'S OWN SIZE, AND A FLOOR THAT MEANS IT** (ADR-0098). A size
control in Settings scaling this app's type on this device, as a MULTIPLE of
whatever the reader's browser or OS is already doing.

**The floor had to be fixed first, and that is the release.** `--target` was
`2.75rem` — 44px at the default root, in rem so it would GROW with the reader's
text. The growing half is right. The shrinking half was never considered and is
not symmetric: bigger text means bigger targets; **smaller text does not mean
smaller fingers.** Measured at 390px before anything was built, at a root of
87.5% — an ordinary browser setting and the second option this control offers —
**24 visible controls fell below 44px**, including the whole header, the capture
box and the skip link. At 75% they were 33–34px. It is now
`max(2.75rem, 44px)`.

**And the gate could not have caught it.** `auditTargets` iterated
`'button, input, a, [role=button]'` — a hand-written list of element TYPES, the
same defect as a hand-written list of surfaces. Widening it found **four
controls under the floor at the DEFAULT size**, long shipped and green: the two
`<select>`s in the load entry at **19px**, `#detail-situation` (a `<textarea>`
somebody types into) at **36px**, and `#load-summary` with no floor at all.
Fixed by RULE — `select`, `textarea`, `summary` — because every select that had
a floor got it individually, which is exactly why the missed ones had none.

**What to look at:** Settings → *How big this app is*.



**2.7.2 — THE DOOR NAMES BOTH ACTS** (collisions entry 10). The collapsed line
under capture read *"Something weighing on you?"* — which names raising a pebble
— while the CAPACITY declaration lived behind it unannounced. It now reads *"How
you are, and anything weighing on you"*.

**Entry 10's premise was wrong and the check is what found it.** The entry framed
its open question as placement — *"whether the declare verb sits where a heavy
morning actually happens (the work surface) rather than down a sheet"*. Measured:
`#capacity-level` is on the work surface, above every section, directly under
capture. It was never down a sheet. **The reach defect was the LABEL**, which is
smaller and more specific than the entry claimed, and it is the same class as
every other reach defect this month: the thing exists, in the right place, and
nothing says it is there.

**Still a collapsed door.** An app that asks every morning how you are is a
demand, and entry 8 calls this the best-defended collision in the product.
Four words became eight; the word budget had room.

**THE CATALOGUE'S ROUTED BACKLOG IS NOW EXHAUSTED.** Twenty-two entries: every
one is SHIPPED or REFUSED except entry 3's contents-on-return card, which waits
on real filing use and is therefore the owner's to answer by using it, not a
session's to guess. Six marks were corrected today for claiming more or less than
the code (entries 1, 4, 13, 15, 17, 18), two were reversed to refusals on their
own evidence (entries 2, 20), and one had its premise disproved (entry 10).

**2.7.1 — THE AMBIENT HORIZON, ON THE SURFACE IT WAS ASKED FOR** (collisions
entry 7). The next fixed thing today, by name, on the **focus** surface. A name
and never a countdown — a countdown is a deadline and adds aversion (ADR-0059's
reasoning); the OS alarm stays the guarantee (T1).

**The line and its projection already existed and were on the WRONG SCREEN.**
`nextFixedToday`/`nextFixedWords` shipped in V2 stage 5 and rendered on the work
surface only — the one an absorbed person has already left. Entry 7's routing
proposal says *"one fact line on the focus surface"* and read as an outstanding
candidate the whole time its mechanism sat finished elsewhere. Hub LESSONS §95's
shape: a feature that exists where the reader is not. It now renders from the
SAME projection rather than a copy, and the walk asserts the two surfaces say the
same thing.

**AND THE FIRST VERSION OF THAT ASSERTION WAS VACUOUS.** It read *if the line is
there, check it; else pass, "correctly absent"* — and both themes took the else
branch, because the walk's store has nothing dated today. The thing the release
added was never measured. Fixed by DRIVING a date of today through the sheet (a
due clock is stored at the END of the day, so today is still ahead) and making
the else branch FAIL. Hub LESSONS §100.

**CATALOGUE RECONCILED in the same commit**, because four entries were claiming
more or less than the code:

- **Entry 15** — the voice gate over notification copy: **shipped**
  (`tools/notify-voice.mjs`), still marked V2-candidate.
- **Entry 18** — its constraint on the law-4 projection: **honoured** by 2.5.0,
  which arrives as computed signal and explicitly never as a destination.
- **Entry 2** — routing mark **reversed to refuse**. The proposal was a pebble
  whose `affects` names an item, with the app plotting the co-occurrence. That
  plot IS the wall rendered, and the entry's own refusal is *"any avoidance
  detection — an inferred wall is the ledger this app exists to not keep"*. The
  entry was arguing with itself: its SINCE WRITTEN already recorded the pebble
  route as not taken while its mark still said candidate. `affects` stays in the
  vocabulary and stays unwritten, deliberately now rather than merely in fact.
- **Entry 10** — **premise was wrong.** *"Down a sheet"* was never true:
  `#capacity-level` is on the work surface, above every section, under capture.
  The reach defect is the LABEL — the disclosure says *"Something weighing on
  you?"*, which names raising a pebble, and the capacity declaration lives behind
  it unannounced. Re-aimed and kept at *later*: the app is at its word budget and
  the honest fix is a rewording somebody should meet in use first.

**2.7.0 — THE OFFER READS THE INTEREST YOU ALREADY GAVE IT** (ADR-0097). Closes
Q-11. Inside the `ready` tier and only there, the tie-break becomes the heat the
reader set: hot, then unsaid, then cold, then creation order as before. The card
says the warrant.

**THE RESEARCH DECIDED THIS, not the owner and not a session's taste.**
`docs/nd-collisions.md` entry 5 had routed it for weeks — *"heat informing which
candidate fills the offer's `ready` slot"* — gated on Q-11, whose ranking reading
is now established by measurement (ADR-0095) rather than by asking. Verified in
code first: `heat.set` is written, folded and snapshotted, and read by **nothing
except the flow that collects it**. `nextup.ts` contained no reference to it.

**What the research REFUSED matters more.** The alternative was ranking on
IMPORTANCE — making *serves a horizon* outrank *serves nothing*, using the
lineage 2.5.0 had just built. It was drafted, and it was going to be put to the
owner as a policy question. Entry 5 forbids it in terms: activation follows
interest, novelty, challenge, urgency and passion, **not importance**, and the
Eisenhower top row is *"a dead letter for this nervous system"*. It did not need
the owner's ruling. It needed the catalogue read.

Three more refusals bind it, each with its evidence grade: entry 12 (moderate) —
no manufactured novelty, so the frozen offer is not fixed by randomising, and a
test pins determinism; entry 13 (community) — never fabricate urgency, so this
cannot cross tiers and a test pins that a dated cold thing beats a hot waiting
one; entry 16 (contested) — the cap of two stands, so the offer is not widened.

**Vocabulary, never a rank** — entry 5's own binding, because INCUP is
community-grade. Honoured three ways: a two-state fact the reader stated, a
tie-break inside one tier, and the card says it out loud, because an interest
read that silently reorders the offer IS a hidden rank.

**Unsaid sits in the MIDDLE.** Last would make skipping the optional heat pass a
penalty; first would make saying *cold* one. In the middle, answering can only
move a thing in the direction the answer points.

**Q-12 is untouched** — *Not this* still records nothing. This reads a signal
given deliberately in a flow that asks; it learns nothing from declines.

**What to look at:** sort a few things, call one hot, and see what the app offers
when nothing is dated.

**2.6.0 — ROLES, AND WHERE THE ATTENTION IS** (ADR-0096). Q-13 settled on
2026-08-04 and deferred for thirteen days. Roles are identities that cross
multiple areas — that framing settles the model on its own, because this tree is
single-parent, so a thing crossing areas structurally cannot be a container and
has to be a cross-cutting link.

**Three axes now:** the tree says where a thing LIVES, a context says where it
can be DONE, a role says who it is FOR. The last two are one mechanism pointed in
two directions.

**A role is NOT a filter, and a context is.** Where you are physically changes
during a day; an identity does not — you do not stop being a parent at the
office. A "show me only Parent work" switch is the partition Q-10 argued against.

**Where the attention is** — the readout, behind a control, hidden until a role
exists. It answers the recorded question *"when do I visit whether I'm putting
enough energy into each?"*, named in ADR-0013's consequences and in
`docs/horizon-models.md` and never built. Sorted BY NAME and never by size,
because ordering somebody's identities by how much each carries is a ranking of
their life. No bar, no meter, no proportion, no target — asserted structurally by
the walk. Counts are words. It says out loud that it is not a target, and the
walk asserts that sentence is present. The unnamed remainder is stated
separately, because on any real store it is the biggest number.

**The deferral is the lesson.** The gate Q-13 set was a session's judgement about
whether the owner had made enough projects yet to justify it. That is not a
session's call. Third instance in one audit, after Q-10 and Q-11.

**What to look at:** open a thing, **Who is this for?**, add a role. The door
appears above your list once one exists.

**2.5.0 — WHAT A THING IS FOR** (ADR-0095). Law 4's downward half, built for the
first time. *"Levels push down; the user never climbs"* is two clauses: the
never-climbing one has been true since ADR-0013, and *"higher horizons project
lineage and health downward"* did not exist. A card knew what it was INSIDE and
nothing anywhere said what it was FOR.

**This answers Q-11, and it did not need the question answering.** Reported
2026-08-04, sat thirteen days on *"asked, not answered. Do not build past this on
a guess."* Not guessing was right; not going and looking was not. Measured in
`nextup.ts`: **every tier is temporal** — hard-date, unblocked, resume, pressure,
ready, unsorted, beneath — and **the only tie-break inside a tier is pressure and
then creation order**, which is why forty rhythm-less items give the same card
today and in a year. The app has never had any notion of what a thing is for, so
it could not show the right things under any definition of *right* that is not
*most time-pressured*. That is the ranking reading, established by reading the
code. And the trust reading is served by the same build: when the card says
*"serves A calmer house"*, the reasoning is on screen and can be disagreed with.

**Highest ALTITUDE, not the top of the chain** — goal › area › outcome › project,
ties to the nearer ancestor. `project` counts, because most real trees are one
deep for a long time and a version that only spoke about goals would render
nothing for almost everybody. A let-go horizon falls through to the next live one.

**On the offer only when it adds something:** `lineageOf` already walks two hops,
so a two-deep tree already says *"under A calmer house"* and appending *serves*
would be one fact twice in two vocabularies. On the held card it is new at any
depth — that list walked one hop and never said altitude at all.

**No new control, no new class, no new colour pair** — it reuses `.card-place`,
already in the contrast registry.

**What to look at:** file something under a project under a goal, then read its
row and the card at the top.

**STILL OPEN, and it is yours rather than a build:** the ordering has NOT
changed — it is still time alone. Making *serves a horizon* outrank *serves
nothing* would be a session deciding that filing something under a goal means it
matters more, and a loose capture is very often the most important thing in the
store. That is the open half of Q-11, now stated with the numbers instead of as
two abstract readings.

**2.4.0 — A CARD SAYS WHAT IT IS** (ADR-0094). The second half of the same
device report as 2.3.0: **nothing on a card said which KIND of thing it was**, so
a project, a goal, an area and an ordinary next action all read as todos. It was
true everywhere. **Fourteen node
kinds and not one reader-facing word for any of them** — `kind` was a
discriminator the code branched on and reached a reader nowhere at all.

What a row could say about itself was `placeWords`: *"in Boy Scouts"* and/or
*"7 under it"*. So a project holding things gave a NUMBER and no name, and a
project holding nothing, a goal, an area and an outcome said nothing whatever —
a goal and a stray to-do drew identically. The detail sheet's state line was the
same: *let go*, *on the Menu*, *done*, *comes back Thursday*, and never what the
thing IS.

**The words are the app's own, quoted rather than invented.** *Waiting for* is
`clarify.ts`'s route label; *Upkeep* its section heading; *Something on you* the
pebble form's label; *Where you left off* the title `focus-intents.ts` writes.
Two are decisions and both are pinned by a test: an aspiration is *A wish* and
not *On the Menu* (it can be taken off the Menu and still be one), and a pebble
is *Something on you* and not *Pebble* (that word already names the WEIGHT).

**`action` gets no word, on purpose.** It is the unmarked case; stamping
"Action" on several hundred rows adds a word per line and distinguishes nothing.
It is asserted to be the ONLY wordless kind, so a kind added without words fails
rather than silently joining it.

**No new control, no new class, no new colour pair.** The words ride in
`.card-place` and `.detail-state`, both already in the contrast registry — so
this is measured from the first run rather than needing an entry, which is how
`.card-where` and the detail placeholders each cost a release.

**What to look at:** your list, for the rows that are not plain to-dos, and the
line under a title on any sheet.

**Still owed:** the tree and search results have room for it and do not carry it
yet. Checklists and templates remain the absent building block.

**2.3.0 — A WAY TO EACH PART OF THE PAGE** (ADR-0093). A **Contents** door in
the header beside More, and a second at the end of the held list, opening a
sheet that lists every block currently on the page — in page order, each named
by its own heading and carrying its own count — and takes you to it. The held
list becomes a real `<section>` with a focusable heading; it was a loose `<h2>`
in the middle of `<main>`, so the biggest thing on the screen was nowhere the
app could send you and nothing a screen reader could treat as a region.

**This was the first thing ever asked of the app** — *"it is one long page, it
needs pages or tabs, no?"* — and it was declined on product law 4. Law 4 is
about ALTITUDE. Reading "the runway is the only workspace" as a statement about
page layout spends an invariant about hierarchy on a different axis (see law 4
above, and hub LESSONS §97). Not tabs, though: tabs partition, and a partition
means remembering to check the other pile, which is the same argument Q-10 made
against vaults.

**Measured:** 3,589px / 3.0 screens with 6 live blocks on the *thirteen-item*
sample; 8 blocks with the list starting 3.0 screens down at 820x1180 and 4.9 on
a phone with a real store.

**A floating door was built first and taken out.** Probed at 820x1180 and
390x844 across 13 scroll positions: it overlapped 10 controls and took the
CENTRE of 3, every one a card's **Done**. Reserving space with padding clears
only the end of the document — mid-scroll, content passes under a fixed element
by definition. The correct fix is a real scroll container, and it is deliberately
not taken: that cannot be verified on the device this app is used on.

**What to look at:** press **Contents** in the top bar. Every block showing on
the page should be listed, in the order they appear, with its own count; pressing
one should land you at the top of that block. Then check the two ends still work
— *Go to what you are holding* and *Back to the top* have not moved.

**Still owed, and stated in the notes rather than hidden:** from the MIDDLE of
the page you still reach for one of the two ends. Checklists and templates remain
the other absent building block, and node kinds still have no reader-facing
words anywhere — nothing on a card says "project" or "goal".

**2.2.0 — CONTEXTS** (ADR-0092). The axis this app did not have. The tree gives
a thing one parent — where it LIVES. Nothing said where it can be DONE, so every
list was every list and "show me what I can do at home" had no answer.

**This was asked for on 2026-07-29, in the repo's first week — see Q-10 above.**
That entry got the design right in writing: *"a lens — a filter you switch on
and off over one list — and not a partition"*, with law 1 unbent. ADR-0092's
decision and central rule are that paragraph, restated nineteen days later by a
session that did not know it existed. It was closed correctly about VAULTS and
the need behind it was parked as a v1.5 candidate.

This block said the opposite for a day — *"nothing had ever decided against
them"* — written after searching for `context`, `@home` and `@work`, the words
of the feature, while Q-10 is written in the words of the question: vault, lens,
home, work. Corrected on being asked directly whether home versus work had ever
come up. (Hub LESSONS §96.) `taskpaper.ts` remains the only place the word
appears in the source, in a line that drops contexts on import and names the
drop — so the concept was met a second time, by a different session, and filed
as an import edge case.

Q-13 had already settled the shape — anything crossing containers must be a
cross-cutting link, not a container — and discussed it only as a *roles*
question, then deferred it. `node.people` is that machinery, shipping since
0.15.0. A context is the same thing with a different relation.

**What to look at:** open a thing, set **Where can this be done?**, then use
**Where you are** at the bottom of the main screen. The offer and the list should
narrow. Anything with no place at all should stay visible everywhere.

**Also: the offered card opens now.** It was a `<p>` — the one item the app
actively hands you was the only thing on screen you could not tap to change.

**Two defects the gates caught, not the eye:** a button with no words has no
accessible name, so the title hides when the offer is empty; and the detail
sheet's placeholders measured 4.08:1 against a 4.5:1 floor, unmeasured until now
because no registry entry had ever named the pseudo-element.

**Still owed at the time; the section half is built in 2.3.0 above.** Checklists
and templates remain the absent building block, and node kinds still have no
reader-facing words — nothing on a card says what it is.

**2.1.0 — a control looks like a control, and the route has a return leg**
(ADR-0091). Two questions from a device about one defect: how do you know that
is a button, and how do you get back.

Measured on the work surface at 390px: 50 controls, 45 carrying a border or a
fill, 7 with none. **Five of those seven were every route off the page** — the
claim, the tree, the Menu, sort mode, and the jump. The app had two visual
languages and put all its navigation in the one that reads as prose. A sixth,
`.behind-open`, was found by the check rather than by eye. Contrast went up as a
side effect: 6.48:1 to 8.92:1 light, 9.13:1 to 9.45:1 dark.

There was no way back anywhere in the app. There is now.

**STILL OWED, and this release does not touch either:**

- **A way to reach each SECTION**, not just the list. Asked for in the first
  message of that thread as "pages or tabs", refused on law 4, and the refusal
  was wrong: law 4 forbids a second WORKSPACE, not a way to reach a section.
  ADR-0090's own falsifier named this and it has now been met.
- **The KIND on the card.** `node.kind` holds `project`, `area`, `goal`,
  `outcome` and is rendered nowhere on a card, so a project reads exactly like a
  task. Verified in `src/ui/app.ts`: a card renders title, status, place and
  contents, and never the kind.

**Nothing was waiting on 2026-08-12** — and the present tense this said it in
was stale within a week, which is hub LESSONS 122 exactly: a status sentence in
a dated entry goes on reading as a status. Twelve releases are staged now; the
live answer is the *Staged and waiting* block above, and this line is history.
2.0.7, 2.0.8 and 2.0.9 were promoted together on the owner's
word, 2026-08-12, as `65e8d19`. The production deploy was verified on that exact
sha — Deploy and Spine green, the deploy steps run rather than skipped, and the
log's own words: `Deployed to PRODUCTION: https://quietkeep.pages.dev`. The
merge tree was byte-identical to `bc43b73`, the staging sha already walked
green, and the tests and gates were re-run against the merged tree regardless.

**2.0.9 — one invisible attribute, and it needed a release of its own.** The
touch gate reads `data-touch-partner` off the markup, so declaring it changed a
shipped file. `release-check.mjs` went red in CI on exactly that: the service
worker caches by triplet, so a shipped file that changes without the triplet
moving never reaches a device that already has the app. The change would have
been published and unable to arrive — the fauxplane shape, caught by a gate this
time instead of by somebody noticing a missing feature four releases later.

**The miss was mine and it is worth recording:** the gates were run, then a
shipped file was edited, then it was committed. Running the suite before the
last edit is the same as not running it.

**2.0.8 — the way past the stack, reachable by finger** (ADR-0090). `.skip` has
said "Skip to what you are holding" since the first release, at `left:-9999px`
until focused — and `#capture` carries `autofocus`, so it is not in the forward
tab order either: reaching it takes three Shift+Tabs BACKWARDS. It has served a
keyboard and a screen reader and nobody else. On an iPad, by finger, the app's
own decision did not exist.

Measured on a full store: the held list begins 3.0 screens down at 820×1180 and
4.9 at 390×844. One tap now lands on it with focus. The control itself sits 0.86
screens down on an iPad — on the first screen — and 1.57 on a phone, because the
offer is 980px tall there. That second number is stated in the release notes
rather than rounded away: it is a way past four more screens, not past all of
them.

**What the research found, and one correction to the catalogue.** The cost of
the section stack is not choice overload — entry 16 marks that Contested, and
ADR-0060 already established the right variable ("not how many things are shown
— whether choosing requires a comparison"). It is FOCALITY. Entry 3 rates itself
Strong on Einstein & McDaniel and reads "visible is the only kind of
remembered"; the same authors' multiprocess framework says visibility is not
sufficiency — a focal cue fires spontaneously, a non-focal one needs monitoring,
and monitoring costs the task in hand. A section is focal for whoever came for
it and non-focal for everyone else. `docs/nd-collisions.md` entry 3 should carry
that correction the way entry 16 already carries its own.

**What to look at:** with a busy store, the line under Next up. It should not be
there on a quiet day or an empty one.

**Still not fixed:** the work surface is one scroll and nothing was hidden or
reordered. This is a way past the sections, not fewer of them. Whether the
everyday surface should show that much at once is still undecided, and Q-11
gates the version of it that involves ranking.

**These two lines said candidate 2.0.6 / production 2.0.5 while 2.0.6 was
already live**, on both branches, from the promote until now. Verified before
correcting rather than assumed: `6795ead`, Deploy green on main, the deploy step
run rather than skipped. The promote moved the code and left the record behind —
which is the failure the paragraph further down this block already describes
happening at 1.40.3, one release later and in the same file. **A promote is not
finished when the deploy is green; it is finished when this block says what the
deploy did.**

**2.0.7 — the Menu opens as its own screen** (ADR-0089), the third and last of
the inline expanders on the work surface. Measured at 820×1180 on the invented
life: with the Menu open the page was 20,374px and is 17,777px. Its 2,649px of
list scrolls inside the sheet with the Close pinned.

**All three, together, are now structurally impossible** — one surface at a
time. The case that measured 63,906px (54.2 screens) before 2.0.5 and 20,386px
after it is 17,777px, and never more than one of the three can be open at once.
Driven and asserted, including against a programmatic click on a control a modal
had made inert.

**What to look at on the device:** press the line that says how many things are
on the Menu. It should arrive at its own screen with a Close that stays put, and
walking through an item should close it behind you rather than stack. Taking the
last thing off the Menu from inside should put you back on the work surface
rather than leaving you on an empty screen.

**Still not fixed, and this does not pretend otherwise:** the work surface is
one scroll, nine sections stacking to 2,715px above the held list on a full
store. Every reader-opened expander is off it now, which is the end of what this
approach reaches. The rest is a different decision and it is not made.

**2.0.6 — two things reported from a device, and one of them nothing here could
have caught.** The Close button was showing the panel's own text through itself:
the scrolling body's painted box reached about five pixels past where the layout
put it, and `button.ghost` has no fill, so a sliver of whatever you had scrolled
to read straight through the way out. Measured at two viewport sizes before
anything was touched — 4px on the ⓘ, 6px on the sheets, identical at 390px and
834px, which is what margin arithmetic looks like and what a rendering quirk does
not.

**The walk already tested the way out and could not see this.** It scrolls each
sheet to the end and asks whether the Close is on screen and whether anything is
on top of it — a hit test. A transparent button IS the topmost thing at its own
centre, so `elementFromPoint` returns it and the check passes. *Something is over
it* and *you can see through it* are different questions and only the first was
ever asked. It measures rectangles now, on all six surfaces, and asserts the
button is not transparent even though the overlap is gone.

**And the walkthrough named controls in the same plain text as everything else.**
"Not this moves past it", "Just one thing strips it back" — sentences about two
buttons with nothing marking which words were the buttons. The ⓘ panel has
always set a control's name in `<em>` in its own markup; the walkthrough was the
one surface not following the app's own convention, on the screen where a reader
knows least. The splitter that did it for patch notes now lives in `marks.ts` and
serves both, parse split from render so the part that can be wrong is pure and
tested in Node.

**Both carry the same build, and the promote that made them equal changed nothing
a reader can see.** What went to `main` on 11 August was tests, a research
correction, two gates and a permission rule — not one byte under `src/` or
`public/`. A promote is allowed to change nothing on screen; what it must never
do is leave this block saying otherwise.

**Nothing is waiting.** Both carry the same build. 2.0.5 was promoted on the owner's
word, 2026-08-12, and this is the first entry in this block written after the
production deploy was read rather than before it.

**2.0.5 — the claim and the tree stopped unfolding into the workspace**
(ADR-0088). Both controls are where they were and say what they said; their
contents open as sheets instead of pushing the held list down. Measured at
820×1180 on the invented life (566 things, 523 held): with the claim open the
page was 43,808px and is 17,777px; with the tree open it was 35,023px and is
17,777px; the claim-plus-tree-plus-Menu case went from 63,906px to 20,386px.
The workspace with nothing opened is unchanged at 17,777px, which is the point
— that surface was not the target and was not touched.

**Promoted as `d40a37c`, and the production deploy was verified on that exact
sha** — Deploy and Spine green, the deploy STEPS run rather than skipped, and
the log's own words: `Deployed to PRODUCTION: https://quietkeep.pages.dev`.
The merge tree was byte-identical to `fe93d98`, the staging sha already walked
green, and every gate was re-run against the merged tree regardless.

**What it does not fix, and must not be read as fixing:** the workspace is still
one scroll. On a full store nine sections stack to 2,715px above the held list.
Each is conditional and individually justified; nothing bounds their sum. Law 8
bounds the re-entry greeting and governs that path only, not the everyday
surface. That is a separate decision and it is not made.

**Also still a fold: the Menu**, at 2,597px — the whole of the 2,609px that
separates the post-change claim-plus-tree-plus-Menu figure from the untouched
workspace. Two of the three inline expanders moved; this is the third, and it
was left because the change the owner asked for named two.

**Everything through 2.0.4 was promoted 2026-08-11**, on the owner's word. What went to
`main` that day was tests, a research correction, two gates and a permission
rule — not one byte under `src/` or `public/`. A promote is allowed to change
nothing on screen; what it must never do is leave this block saying otherwise.

**These two lines said 1.40.3 and 1.39.3 while the app was on 2.0.4** — nine
releases and the largest change the app has had, all after the last time anybody
edited them. The handoff gate has read this block since it was written and says,
in its own words, that a candidate note which does not name the build cannot be
acted on; it went red on exactly that, and the first fix was to add the version
somewhere ELSE in the file, which would have left two answers here and made the
stale one harder to find rather than easier. One place states it. This one.

**1.40.3 — the handoff arrived before the thing it hands you to.** The
walkthrough's last step opens the ⓘ to put the storage question in front of
somebody, and whether that block showed depended on a question the app only
asked when the panel opened. First open, no answer yet, block a beat late — on
the one screen it exists for.

**1.40.1 addressed the wrong half of this and the notes read as though it were
closed.** It stopped `show()` re-hiding the block on every open, which is real,
and left the first open untouched. The answer is now learned at BOOT — only
`navigator.storage.persisted()`, not the full paint, which does a whole-log read
that startup may not afford — so `show()` decides synchronously.

**Found by CI red against local green, two releases running.** That is the
pattern worth naming: a check that passes locally and fails on a loaded runner is
reporting a race, and both times the race was in the app, not in the walk.

**And one correction about the instrument.** The Spine job for 1.40.2 was
reported by the GitHub API as `in_progress` for thirty minutes after it had
already failed. It was read as a hang and watched as one. The status field is not
evidence; the log is. Cancelling the run is what made the log readable and the
failure visible.

**1.40.2 — the capture link could not open, and it opens the wrong app.** Two
findings on the same path, both from the iPad, and the second is the one that
matters.

The first: `Response served by service worker has redirections`. The 1.37.0 query
strip built a fresh request, and a fresh request defaults to `redirect: "follow"`
where a navigation carries `redirect: "manual"` — so the worker chased a 3xx and
answered a navigation with a redirected response, which every engine refuses.
Only on navigations carrying a query, which is the capture entrance and nothing
else. Fixed by rebuilding the response without the flag, which also unblocked a
silent second failure: `cache.put` refuses a redirected response, so the shell had
stopped being freshened on that path too.

**Why no gate caught it: the local server could not redirect.** It answered every
path 200 or 404, so the one edge behaviour that triggers this was the one
behaviour no walk ever had. Not an engine difference — a hole in the rig.
`serve.mjs` redirects now and the §7h walk drives one, planted red first.

The second is **V-21, answered, and the answer is the bad one.** A Shortcut's
*Open URL* opened **Safari**, not the installed app, and the capture succeeded
there — into a store the installed app never shows. The row predicted exactly
this: *a capture that lands in the wrong context succeeds, dressed as a
confirmation.* The ⓘ now states what was observed, names what to look at, and
promises no remedy that has not been seen to work. The fragment entrance does not
rescue it — `#text=` keeps content off the wire, which is a different property
from landing in the right app — so the private entrance stays unbuilt, and
whether ANY Shortcut action can reach the installed app is an open question.

**1.40.1 — the ⓘ stops growing a paragraph after you have started reading it.**

Found by CI going red on a commit that was green locally, and it is a product
defect rather than an instrument one. `show()` re-hid `#about-intro` on every
open and `paintStorage` put it back a tick later — so while the browser has not
agreed to keep the store, which is the exact state that block explains, the panel
opened *without* it and grew it a moment on. Invisible on a fast machine, which
is why eighteen releases carried it.

`show()` no longer fights the painter: a first run shows the block at once,
every later open leaves it as the last paint left it. The walk also waits for
the paint rather than racing it — not a weakened check, because if the block
genuinely never shows the wait times out and the same three entries fail.

**1.40.0 — six destinations, and each one is its own screen.** ADR-0083, which
supersedes ADR-0055 on the condition ADR-0055 named itself. Help, Settings, Your
data, Things you can do and How it works stop being folds inside the ⓘ. Settings
was 3,914px at phone width — four screens to scroll through to reach one switch —
and it is 1,809px now, because the verbs went to their own destination and the two
acts that touch stored data went to Your data.

Two things came out of building it that are worth more than the feature:

- **The a11y gate had been auditing four screens as one state**, so three of them
  were not measured at all. `.about-sub` and `.anchor-label` had been in the
  panel's registry list for releases while living in what is now Settings; they
  matched something, so nothing complained. Split by surface, nine entries went
  red on the first run.
- **Scroll distance had never been budgeted per screen.** `size-check.mjs`
  measured `#about-body` alone, which the split would have satisfied by moving
  the reading somewhere the gate could not see. It now measures every
  destination, and their sum — 10,425px, which the split did not reduce by a
  pixel and which is recorded as too high rather than as a target met.

**1.36.1 — the ⓘ panel explains the half of the app it had gone quiet about.**

Found by REVIEWING the finished thing rather than by reading the plan back. The
panel had 28 sections and none of them covered weight, capacity, the situation
line, the settle, or duration ranges; "Just one thing" got two passing mentions.
Those are the newest and most distinctive behaviours in the app, and they are
the ones a newcomer is most likely to read as a fault.

**The settle is the one that mattered.** You finish something and nothing
arrives. That is deliberate, and the screen says so at the time — but there was
nowhere to go and check afterwards. A person who wonders *why did it do that*
and finds no answer files it as broken, or stops trusting the rest.

Seven sections, each with the "what it is not" caveat the house style uses:
the offer and why each thing states its warrant, finishing and stopping, weight,
capacity, the minimum state, the situation line, and duration as two ends rather
than an average. Nothing about the app changed; what changed is that it can be
looked up.

**A correction to the review that produced this.** It also claimed the
walkthrough could not be replayed. It can: `mountTour` wires `#tour-replay`
BEFORE the seen-check, so the button in "How to use it" works and always has.
What is true is narrower — the walkthrough is four steps that teach an older,
smaller app, and never teaches the daily loop.

**Stage 6 is in flight on `staging`, unreleased — the way in from outside.**

**A FAILED URL CAPTURE DESTROYED THE TEXT.** `handleUrlEntrances` scrubs the
query before committing, which is right — it is what stops a refresh firing the
same capture twice — and it means the address bar stops holding the text a
moment before anything else starts to. The catch then printed a message and
returned. So a shared thought that failed to write was gone, and the person
never typed it here, so there was nowhere for them to look for it. The manual
capture path has always done this correctly ("the write failed: give the thought
back, and say so"); this path is the one where giving it back matters MORE.

It now hands the text to the capture line AND to the persisted draft, so it
survives a reload as well as the failure, focuses the field, and says where the
text went — "it failed" without that is the same as losing it.

**THE ONLY ENTRANCE FROM OUTSIDE WAS DOCUMENTED NOWHERE.** `share_target` and
manifest shortcuts are Chromium-only, so on the reference platform `?text=` is
the whole of it, and an entrance nobody can find is an entrance that does not
exist. The ⓘ panel now states plainly that Safari has no share-sheet entrance
and that this is a browser limit rather than a decision here, gives the address
built from the CURRENT origin (a panel handing somebody the wrong host would be
worse than silence, because it would look right), and names the Shortcuts steps.

`handleUrlEntrances` is EXPORTED for the test that holds the failure path
honest — it takes its session, status line and input as arguments rather than
reaching for them, so the whole thing runs against fakes. Five tests, and the
one that catches a careless fix is the SUCCESS case: putting the text in the box
unconditionally would leave a captured thought sitting in the capture line,
where the obvious next act is to hold it twice.

**Stage 5 shipped on `staging`, unreleased — the day the person is in.**

Every clock here is day-granular and every writer builds it with
`endOfLocalDay`, which means 23:59:59. So "today" ended at midnight for
everybody, and at 00:30 the app had already rolled over: work nobody had
stopped doing became a date that had gone by, law 3 turned each one into a
replan card, and the header clock's remainder — the gradient this whole app
leans on — jumped from "0h 12m left" to "23h 59m left" at the stroke.
**Delayed circadian phase is the norm rather than the exception in this
population**, so midnight is not a neutral default; it is somebody else's,
imposed, and it fired nightly.

`day.boundary.set{hour}`, 0–11, folding to `State.dayBoundaryHour` under
state-level LWW. **Refused, never clamped**: an hour outside the range folds to
null rather than to the nearest legal value, because clamping 14 to 11 would
have the app invent a boundary and then run every "today" in the product off
it. **Null reads as midnight**, so an unset boundary cannot change one existing
answer — the only honest way to move something this load-bearing.

**`DayShape { zone, boundary }`, and it is REQUIRED.** `zone` alone answers what
wall time it is; it does not answer which day you are in. A bare `tz: string`
let ~85 call sites take the first fact and silently assume the second. Making
the pair required means the COMPILER enumerates the sites — 123 of them — rather
than a list somebody writes and forgets, which is the same lesson three separate
defects taught this run. Done in two passes: one mechanical and
behaviour-preserving, with the whole suite passing untouched as the proof it
hides nothing, then one deliberate. `atMidnight(` at a call site is a visible
"not yet threaded" marker that grep can count; 52 remain and the number only
falls.

Threaded so far: the header clock, the replan surface and everything that asks
what has gone by (held list, dates-gone-by range, re-entry count, bulk verbs),
and **the whole write path** — `StampContext` carries `day`, so every intent
that builds a date gets it from the stamp rather than re-reading state, on the
same rule as `at`: one commit is one moment.

**Three defects on the way.** A DST one caught by an EXISTING test: computing
the day's end as "the boundary, less one second" asks for 00:00, and in Santiago
the clocks go forward at midnight, so that lands in the gap an hour off. It now
names the last whole second directly, which at midnight is character for
character the request this function always made. One of mine in a test — the
byte-identical check asserted the result ended `:59:59Z` and failed on Chatham,
which is UTC+12:45; the assertion was wrong, not the code, and a weaker one
would have hidden the DST bug rather than surfacing it. It now compares against
a reimplemented old `endOfLocalDay` across six zones. And a smoke block that
reloaded the page mid-way through the Do-now flow, wiping the offer a later line
waited on — the walk TIMED OUT rather than failing an assertion, which is the
worse failure because it reports nothing about what broke.

**1.36.0 is stage 4's last item: fog is a THIRD failure mode.**

*Fewer things* and *less thinking* are different transformations and the app had
only the first. A low day is answered by reaching for lighter work (1.34.0); that
answers nothing when the problem is not how much there is but how much the SCREEN
is asking somebody to process. Two items to choose between, a reason line, where
it sits, what it holds up, what was said about doing it, a list of what is
behind, a count, a row of chips — every one earns its place on an ordinary day
and every one is a thing to read on this one.

**"Just one thing"** shows one piece of work, larger type, no motion, and drops
the eleven selectors named in `PLAIN_HIDDEN`. The cap lives in the PROJECTION
(`offer.ts`), not in the UI, so it is one number in one place rather than a rule
the surface has to remember.

**The head does not change.** It removes what is AROUND the offer; it does not
reach into the ranking and choose differently, which would make it a second
opinion about what somebody should do.

**Never inferred and never prompted.** Detecting a foggy day means forming an
opinion about a person from their logs, and there is no instrument here that
could — the same rule that governs weight and capacity. It is invoked and it
stays until it is left.

**It is also the burnout state, and that decides the design**: the skill of
operating the tool is one of the skills that has gone. So leaving it is ONE
visible tap that is always on screen, and entering it needs no settings screen.

**Not a capacity, and not a reduced app.** Capacity changes WHICH and never HOW
MANY (1.34.0); this changes how many, and the difference is who decided — the app
still never shortens the offer on its own. Nothing is deleted, nothing goes
silent, every guarantee holds: it is a smaller VIEW of the same store, asserted
by cycling to items that are still reachable behind the one being shown.

**It rides `module.enabled`**, folded since 1.6.0, so it survives a reload at no
cost to the closed vocabulary. A state you must re-enter on every reload is one
more thing to operate on the day you can least afford it.

**Named for the SCREEN, never for the person.** "Fog mode" would be a fact about
you; "just one thing" is a fact about what is on the display. Asserted as a regex
over the stored noun.

**Two defects on the way, both mine, both found by the walk.** The strip ran
BEFORE the things it hides were painted — `#upkeep` is re-shown by its own code
later in `refresh` — and turning it off never restored anything, so `#nextup-why`
(which has no other owner of its `hidden` flag) stayed hidden for ever. Now split
into two halves at opposite ends of `refresh`: an unconditional restore first, so
each element's own rule gets the last word on an ordinary pass, and the strip
last, after everything that owns one of these has painted.

**1.35.0 is stage 4's second item: the moment after, and the symmetric exit.**

`markDone` committed and immediately repainted, so the most pressured remaining
item slid into the space just vacated. Whatever occupies the second after
completing is what gets attached to completing — and what occupied it was the
next demand, arriving with no gap.

**The surface now SETTLES.** It names what was finished, says nothing else is
being asked, and waits. The next offer arrives on `#nextup-resume` and not
before, because a surface that fills its own silence has decided the moment
belongs to it.

**Withheld, not greyed.** The title, reason, place, situation, first-step line
and every acting control go while settled; `current` is cleared with them so a
stray keypress cannot act on an item nobody can see. A demand that is present but
disabled is still a demand on the screen.

**Not timed.** A pause that expires is the app deciding when somebody has had
enough of a rest. Asserted by waiting and re-checking.

**No praise and no number.** Asserted as a regex over the settled words: an
approving opinion is still an opinion about the person, and a count here would
attach a tally to finishing.

**The rest of the surface is untouched** — gauge, upkeep chips, held list. None
of it was asking anything, and hiding it would make "nothing is being asked" read
as "nothing is here".

**"That is enough for now"** reaches the same settled state having finished
nothing. Declining had to end the session as completely as finishing does, or
escape strictly dominates and the interface has chosen for you: "Not this" only
ever swapped one demand for another. It records NOTHING, asserted as a log-count
delta.

**Three things wrong on the way, two of them mine.**

The settle first landed in `markBiteDone` rather than `markDone` — a `.replace`
that matched the first identical block. Wrong on its own terms as well as by
accident: a first step is the way INTO the thing in front of you, and settling
there takes the item away at the moment somebody had finally started.

`loadWords` still said **"Fewer things, while…"**. That stopped being true in
1.34.0, when capacity changed from shortening the offer to reordering it — copy
outliving the behaviour it described, which is the plainest kind of lie a surface
can tell. It now says "Easier things first… Just as many." The co-occurrence
form is unchanged and is why "while" survives.

And the WALK inherited the settle: one Done early on left the surface settled for
every block after it, and eight later blocks failed against correct behaviour.
The walk now asks for the next thing the way a person does, and asserts the
settle happened rather than working around it.

**A fourth defect, found by the a11y gate and unrelated to any of it.**
`paintContext` cleared the triage card's "Written this afternoon" line on EVERY
render and refilled it from an async read of the log. `refresh` runs after every
commit, so any repaint blanked a correct line and left it blank until that read
returned — a line that vanishes and comes back, and a registry entry matching
nothing visible.

It reproduced exactly on a second run, in the dark walk only, which is what made
it worth chasing rather than dismissing as a flake. The walk's own comment had
anticipated this race two releases earlier without anyone confirming it was real.
The clearing was right about the danger and wrong about the frequency: it is now
keyed on the node, so a different card still clears first and a repaint of the
same card leaves it alone.

**1.34.0 is stage 4's first item: capacity changes WHICH, never HOW MANY.**

`offerCapFor` read `load.heavy ? cap - 1 : cap` — a low day got a shorter list.
Wrong on two counts, and the second is the serious one. Length is not what
capacity should change; and **narrowing on a low day is a PACING mechanism**,
correct for post-exertional conditions and iatrogenic for depression, where
behavioural activation says offer anyway. The same declaration, two correct and
opposite responses — the sharpest conflict in the synthesis.

**Changing WHICH dissolves it.** The same number of offers arrive and the
lighter ones are chosen: nothing is withdrawn, so activation is served; nothing
demanding is put in front of you, so pacing is served. No standing preference is
needed and no question has to be asked, which is better on its own terms — the
app that does not ask cannot ask wrong.

**It needed a per-item weight and there was none.** "This one is heavy" raises a
PEBBLE, which is a weight about the person, and its `affects` list is
deliberately inert (ADR-0014, law 7). Every other candidate was inference from
the reader's own logs — dwell time, skip counts, subtree size — which is exactly
the measure Toplak/West/Stanovich says does not track what matters. So
`weightOf` reads a DECLARATION: light, ordinary, heavy, on `node.field.set`, the
`note` and `situation` precedent. Three words and no number, as capacity has
four and no number.

**Absent is not an extreme.** Null reads as `ordinary`. Reading it as light would
hide real work on a low day; reading it as heavy would bury it on a good one.

**Ordered BEFORE the rotation, not after.** The first version sorted the rotated
list, which silently broke "Not this": the lightest thing led whatever the cycle
index was, so a heavy item became UNREACHABLE rather than merely later. Weight
decides the order; the cycle walks it. Caught by the reorder-not-withhold test.

**A test too weak to catch its own plant.** "Nothing nobody weighed is treated as
either extreme" compared the unweighed item only against `heavy`, so a plant
reading it as `light` passed. It now asserts the full order in both directions,
with the unweighed item captured first so a tie would expose it.

**Four existing tests re-aimed, not deleted** (hub LESSON 66). Each states what
it used to assert and why that was the defect rather than a different choice.

**1.33.0 is stage 3's last item: put a whole place down in one act.**

A `put-down` bulk verb on the runway family. ADR-0082 says putting a place down
does NOT sweep its contents, and this completes that rather than contradicting
it: the app must never decide what you have stopped caring about, and a person
may decide it once, out loud, about a range they named. That is the amnesty's own
recorded resolution — the cap governs what a surface may SHOW, and a named range
is legitimate to act on.

**The container is not eligible**, because `sortable` excludes containers. That
exclusion was untested until a plant stayed green over it; the assertion is now
explicit, so "everything under the loft" can never quietly take the loft too.

**Not offered on the Menu family, and the omission is an argument.** A wish
already makes no demand and already does not come back, so putting one down would
change nothing a reader could notice — and a control that appears to act and does
not is the shape this app spends most of its care avoiding. `let-go` is the verb
for a wish you no longer want, and it is there.

**The undo restores everything it took**, unlike `to-menu`, which sheds demand
clocks on the way and says so in its own receipt.

**A SHIPPED DEFECT, found by the walk pressing the button.** `undoBulk` decides
per item whether the act is still reversible, and that check was a hand-written
disjunction of four verbs — so any verb added later fell through to `false` and
EVERY item was skipped. `new-date` went out in 1.31.0 in that state: the Undo
button worked, reported "0 things restored", and put nothing back, leaving every
retired date retired.

The unit tests did not see it because they exercised `undoItemEvents`, which is
the half that was correct. It is now a `Record<BulkVerb, …>`, so a new verb
cannot compile until its reversal condition is written down, and two tests run
the real `runBulk` → `undoBulk` pair asserting `skipped === 0`.

**Third time this session a hand-written list has cost something**: held-ness at
forty-odd sites, the amnesty's defaulted arguments, and this. The pattern is the
same each time and so is the fix — make it total, and let the type system ask the
question.

**1.32.0 closes stage 3's structural gap: the exit that is neither done nor
deleted.** ADR-0082.

**Law 1's guarantee had an unpriced cost.** Nothing goes quiet, so everything held
comes back for ever until it is finished or binned. For work that mattered once
and no longer does, every exit was wrong: Done is a lie in an append-only log,
Let it go reads as destroying something you cared about (and lands in a list you
can go and visit), To the Menu is a different and often false claim, and Park is
a promise to come back. So it gets carried — and the reset people actually reach
for is deleting the app, which defeats every other guarantee at once.

**`node.released` / `node.reclaimed`, one field, exempt from law 1** exactly as a
trashed node is, and for the same stated reason: law 1 promises nothing goes
quiet BY ACCIDENT.

**`heldNodes` excluding it is the whole mechanism** — every surface, range,
gauge, list and offer reads through that one predicate.

**No collection, no count, no reason.** The payload carries `at` and nothing
else, and a test pins that. `releasedNodes` exists so the complement is visible
in code and so search can reach one; **no surface renders it whole and none may.**

**Reachable by name, and only by name.** `searchReleased` answers a query you
typed about a thing you remembered and never volunteers. That reversibility is
the mechanism rather than a courtesy: an exit people are afraid to use is not an
exit.

**One predicate, not a diff.** Held-ness was hand-written at forty-odd sites as
`!n.trashed && !n.mergedInto`. `isHeld`/`isGone` now live in `fold.ts` and every
site that means "still in your hands" calls one. The three that deliberately do
not are named in the docblock. This repo's own record says why: `heldGroups`
drifted from the gauge twice and the merge carry lost `feeds` entirely, both
because a hand-written list was not revisited.

**A plant that stayed green found a real gap.** Removing the `released` exemption
from `isSilent` did not fail the suite, because the fixture's put-down node still
had a due date and clause (b) covered it. The exemption is now asserted directly
on a constructed state with nothing else on it.

**1.31.0 is the rest of stage 3's paths-back work.**

**A standing "dates that have gone by" range.** `REPLAN_CAP` is 3 and that is
right for the replan surface — a wall of cards is the pile in a new costume —
but it left a hole: with 69 passed dates, three at a time and one decision each
is not a way through, and the only bulk path was the lapse-gated amnesty.
Somebody who never lapsed had no route at all. The range uses `raisesReplanCard`,
the replan surface's own predicate, so the two cannot disagree about what is
asking. Its `sortable` filter is belt-and-braces and says so in the comment:
`NO_REPLAN_CARD` already excludes every container, so the filter does no visible
work today and exists so a future widening of the replan predicate cannot make
this range offer a verb the gate must refuse.

**`new-date` as a bulk verb**, through `replanEvents` and never a bare
`clock.set` — 1.30.1 is the record of what a reimplemented bulk path costs.
Eligible only where a date HAS gone by: setting one on a date still ahead is an
edit, not a resolution, and doing it to a whole range would overwrite decisions
nobody asked the app to touch. Its undo restores every retired clock through its
own noun, carrying the original source.

**A record-nothing "Not this one" on the replan card** (ADR-0079's rule, applied
to the surface that lacked it). In memory only. **Passing over DEMOTES rather
than hides** — the first version hid, and the walk caught what that cost: with
two dates and one passed over, the surface dropped to one card and the count line
read "These 1 first.", which is a visible record of what had just been avoided.

**Corrected before it shipped.** A comment here claimed a container with a passed
date raises a replan card and is filtered out by `sortable`. It does not.

**1.30.3 is the third and fourth items of stage 3.**

**Undo did not restore what a route shed.** The Menu is demand-free by law 6, so
routing to someday/reference genuinely has to drop every demand clock — that half
is not negotiable. What was not acceptable is that the control offering to take
it back handed the item over without its dates. `undoRouteEvents` now takes a
snapshot captured BEFORE the route committed and restores each clock through its
OWN noun — `suspense.set` for a suspense, `park.set` for a park — because
writing all three through `clock.set` would fold correctly and lie in the log
about which act happened. The route also SAYS what is coming off, rather than
doing it quietly.

**The place-return question was destroyed by the next card.** Filing into a new
place offers "when should this come back to you?" on the receipt, and that is the
only path in the app to a place's return clock. It lived in the undo bar and was
cleared with it, so triaging one more card wiped it and the receipt said "no
return date yet" for ever with nothing left to press. The undo goes stale one
card later; an unanswered question about a place does not, and `clearUndo` now
keeps a pending one.

**Verified — NOT a defect, so the count stops drifting.** The triage undo is
already persistent and never timed: `clearUndo` is called by the next triage
action and by nothing else, and there is no toast timer anywhere in the UI. The
`setTimeout` in `clarify.ts` is the do-now timer, which is a tool a person
started. The V2 plan's "undo is persistent, never timed" item was already true;
only its second half — the place control the next action destroyed — was real.

**1.30.2 is the second item of stage 3: filing destroyed dates.**

Reproduced against the real gate before anything was changed. Filing "renew the
insurance" under a place emitted `clock.cleared` for `review`, `due` AND
`suspense` — the callers pass `clocksOf`, which is every clock, and the intent
cleared all of them. A `suspense` is a promise to another person; filing does not
cancel it, and nothing recorded that it had gone.

The old comment had the right worry and the wrong scope. What must not survive
filing is the CAPTURE CURE — the same-day `review` the gate mints so a node
cannot be silent — because the place's clock covers it now and keeping both is
filed-and-still-pestering-you-tomorrow. `SHED_ON_FILE` is a set of exactly that
one kind, written as a shed-list rather than a keep-list on purpose: a new clock
kind is far likelier to be a date somebody set than a second piece of app
bookkeeping, so anything unlisted SURVIVES.

Both filing paths carry it. `fileUnderNewEvents` does not call
`fileUnderEvents`, so a filter in one of them would have meant the same act
having two answers, decided by whether the folder happened to exist yet.

**~~Still owed in stage 3:~~ NOTHING — all seven closed, checked one at a time
against the code on 2026-08-11 rather than read off this list.**

- *someday/reference shedding a date must be SAID, not done silently* — said.
  `clarify.ts` counts what a route will shed and states it before it commits.
- *undo does not restore what a route cleared* — it does now.
  `undoRouteEvents` takes what the route shed, captured before it committed, and
  puts each one back — Menu-removal first, because the law-6 belt refuses a clock
  on something still on the Menu. An undo that returns less than it took is not
  an undo, and on an append-only log there was no other way back.
- *the standing passed-dates range* — built, and no longer gated on an absence:
  sixty-nine of them three at a time was not a way through.
- *the record-nothing "Not this one" on the replan card* — `replan-skip`.
- *persistent, never-timed undo* — no timer anywhere near it. A five-second
  toast is a time limit and the interrupted reader is exactly who misses it.
- *a release verb that is neither done nor deleted* — 1.32.0, `node.released`.
- *putting a whole place down at once* — one act, thirty things.

**This paragraph said all seven were owed until the day somebody checked.** Six
of them had shipped and been written up in the patch notes the app itself shows
you. A "still owed" line is the easiest kind of prose to leave behind, because
nothing fails when it goes stale and it keeps reading like diligence.

**1.30.1 is the first item of stage 3: the amnesty moved zero of four.**

Every item went through `replanEvents` with its arguments DEFAULTED —
`passedKinds` fell back to `['due']` and `demandClocks` to `[]`. An item raised
by a passed `suspense` kept that clock live and came straight back; an item
carrying any other demand clock reached the Menu still owing an answer, which
the Menu belt refuses. **The amnesty is one batch, so that refusal took every
clean item with it.** Three good and one awkward moved none of the four, on the
one surface whose entire purpose is removing twenty decisions at once.

It now builds from `replanAll` — the same projection the replan surface reads —
rather than from a second walk over held nodes asking a different question. The
two agreed only by coincidence, and the coincidence broke on the arguments.

**One thing deliberately NOT tested.** `fromKind` is read only by the `hand-off`
branch, and the amnesty always resolves `to-menu`, so passing the node's real
kind is inert today. It is passed anyway so the call stays correct if the
amnesty ever resolves some other way, and the fact is written down here instead
of asserted — a test over an argument nothing reads passes whatever the code
does, and one of those is worse than none.

**1.30.0 completes stage 2 of the V2 plan: event anchors.** ADR-0081.

**An item may wait for another item to be FINISHED.** Two events, `after.set`
and `after.cleared`, one field, and **law 1's fifth clause**: every node is on a
surface, under a clock, on the Menu, parented to something under a clock, or
waiting for something that will itself be shown to you. Until now every anchor in
the app was a date, which is the least retrievable anchor there is; within a
routine, completing each step IS the cue for the next, and an order of doing
things had nowhere to live but three invented dates or somebody's head.

**Each condition on clause (e) is a way its promise could be false**, which is
why they are all enforced: the antecedent must exist, be alive, be unfinished,
and **not itself be silent** — a chain is only as good as its first link, and
without that last condition a chain hanging off a silent node would report as
covered while nothing would ever surface any of it.

**Letting go of the antecedent brings the whole tail back**, transitively, in the
same transaction. Trashing the first step of a three-step routine cures every
step, not just the one pointing at it.

**A merge carries the anchor both ways** — the survivor takes the source's
antecedent into a silence, and everything waiting on the source is re-pointed at
the survivor. Without the reverse carry, folding one step would make every later
step silent and cure it into a dateless card.

**The gate and its independent reference implementation are compared on this**:
both new kinds are generated by the equivalence property, so every refusal and
every cure is checked against a second reading of the rules across the full seed
set.

**1.29.0 is the first half of stage 2 of the V2 plan: the situation field.**

**You can say when or where you mean to do a thing, and it comes back with it.**
One optional line, in the person's own words, on every item — and it is shown
above that item on the offer, verbatim. It is the implementation-intention "if",
and the app had nowhere to put one: a task stored as a noun is only the "then",
and the cue is the active ingredient. It is also the cheapest event-based
retrieval anchor available, against a datetime, which is the least retrievable
anchor there is and was the only one this app offered.

**What it deliberately is not.** Never required, never generated, never checked
for shape, never counted, and never asked whether it worked — the evidence rests
on plans the person wrote themselves, so whatever they write is the plan. Writing
one mints no clock and changes no rank, which is asserted rather than intended,
and is why it is safe to write one onto the thing being offered right now.

**One field, four jobs**, which is why it is a string and not a structure: the
"if"; an event-based retrieval cue; where a routine's chaining lives; and
somewhere to put an alternate for when the plan breaks, since the deficit at that
moment is generating options rather than choosing between them.

**~~Still owed in stage 2:~~ NOTHING — closed 2026-08-11.** The one item was an
item anchored to another item's completion rather than to a clock, needing a
fifth coverage clause in the write gate. It **shipped in 1.30.0**: `after.set` is
in the gate, `unblocked` is a reason the offer states, and the walk drives it.
The line stayed as though owed for eleven releases after the thing was built.

**1.28.0 is stage 1 of the V2 plan: making "nothing has gone quiet" mean
"and you will be shown it".**

**Law 4 pushes down now.** An area whose review had come round appeared in the
list holding a project holding an action — and Next up was EMPTY. The app
answered "what now" with silence while its own list said something was ready.
It now offers the work beneath the horizon and names which horizon asked. Bounded
by being a fallback: it fires only when nothing else is asking, so a container
with two hundred descendants can never become the pile.

**A park that has come round stops being held away.** A declined request reached
its return date and went on sitting in *Later* reading "back now" — the group for
things with nothing asking. It moves into what is back, and deliberately not into
the offer: putting a thing you declined at the top of the work surface is the app
not believing you.

**The gauge stopped leading with a number that only rises.** It said "N held"
first; it now says *nothing here has gone quiet*, which is the guarantee and the
only thing that answers the actual anxiety. The total moved into the list the
gauge opens, where it answers a question you just asked. A non-zero silent count
still says so first, and loudly.

**What was NOT changed, and why it is worth recording.** The audit said this
stage should widen `isAppClock` to every `gate:` source. Verified against the
fold instead: that was tried once before and broke Menu promotion and resume
cards, and widening it would have made hundreds of real items silent in practice
— the exact defect this stage removes. The offer-never-changes symptom is real
and reproducible, but its cause is the `ready` tier's tie-break, and for a static
store that is determinism working. The part you actually feel is Q-12, and it is
yours.

**1.27.1 is the first stage of the V2 plan, and none of it is a new capability
— it is things the app was doing wrongly.**

**Asking the browser to keep your writing had become unreachable.** Skipping the
welcome, or pressing Escape, marked the storage question answered without ever
showing it; the panel's own offer was gated on exactly the state that had just
been made impossible, and the only remaining control sat inside a group that
ships collapsed. One skip and the app ran evictable for the life of the install,
silently. The explanation and its button now appear at the top of the ⓘ panel
whenever the browser has not agreed to keep the store, and go for good once it
has.

**"Why it works this way" was unreadable on the public site.** Every wrapped
point was broken in half with its second half stranded below as a paragraph —
35 of them — and formatting marks printed as text. Its gate could not see it,
because it only compared the generated page against itself.

**A private worry could be handed to somebody else.** A worry raised inside a
reporting period was itemised by name, verbatim, in the status report. The kind
list it should have been on was an enumeration of four nouns found by an earlier
audit; it is now a total record over the vocabulary, so a new kind cannot compile
until somebody decides whether it may leave the device.

**Five by-name attributions were live on production** in `public/app.css`, a
file neither privacy gate read — and widening the file filter alone found
nothing, because every attribution pattern required a quote mark and none of the
five had one.

**What to try:** open ⓘ. If this browser has not been asked to keep your
writing, the explanation and the button are at the top rather than folded away.
Then *Send to my calendar* — the confirmation no longer promises a reminder
nobody has watched arrive.

**~~Still owed by hand, and it now outranks the rest: V-14.~~ CLOSED — answered
YES on device, 2026-08-09.** The exported alarm was seen: the intended day,
all-day, alert resolved to 09:00 local. The reason it mattered stands and is
worth keeping — the research sweep found that during an avoidance episode the
calendar export is the only part of the app still running, so it carries the
whole promise at the moment nothing else does. It is now a promise that has been
watched working rather than asserted.

**1.27.0 finishes the sentence 1.19.0 started.** A place that comes round now
says what it is holding — the first few by name, then how many more. "7 under
it" was a number, and a number is not a reminder of what you put there.

**1.26.0 closes the hollow return — the oldest open defect in the repo.** A
place you file into can be given a return date, from the receipt that has been
telling you it had none since 1.20.0. Pick a day and the place comes back on it,
carrying what you put in it. Until now it never came back at all: everything
filed was safe and invisible, which is the exact problem filing was built to
solve.

**What to try:** file something with *Put it somewhere*, make a new place, and
the receipt now offers **"Bring it back on…"**. Then look at *What you are
holding* — the place should have moved out of "Later".

**Two of 1.24.1's fixes were never seen on a device before promotion** — the
date field's height and the version stamp opening the report. Both were derived
from the source and proved by planting the defect, which is a real standard and
is not the same as looking. Production is where they are first seen, and that
was the deliberate trade: the leaked source comment was live on every screen
and got worse every day it stayed.

**1.25.0 answers "paths in without a path out."** Sorting things out now has a
**Not this one** on both passes. It moves on and records nothing — not what was
passed over, not how many times, not for how long. It is remembered only until
the app closes, and the count still says what is in the inbox rather than what
was skipped. When everything has been passed once it comes back round to the
top: passed over, never put away.

**1.24.1 is a fix release, from four screenshots off a real phone.** The one
that matters: **a paragraph of this repo's own source commentary had been
painting at the bottom of every screen, on production**, under the accessibility
link. A comment was split in two and its middle was left as markup. Every gate
was green the whole time, because none of them had any opinion about text nobody
meant to publish. The walk checks for it now.

Also: the date field was rendering about an inch and a half tall on a phone;
tapping the version number opened this panel instead of the report it is named
for; the panel gave no sign it scrolls; and the diagnostic contradicted itself
about clocks.

**What to look at in 1.24.0 — the two things you can do when you cannot start.**
Under Next up there is now a line asking for a smaller first bit. Type a first
physical action into it — "open the file and write one line" — and the card
holds it, with its own Done. Finishing it brings the invitation back for the
next bit. **That step never takes a date of its own**: it rides along with the
thing it belongs to, so naming a smaller start does not hand you one more thing
that is now late.

Beside it, **"This one is heavy"** opens the weights box with that item already
attached, so what you write down says what it is about. The app asks less of you
while you are carrying it, exactly as it has since 1.15.0 — the only new part is
that the weight can finally name the work.

**Nothing here is inferred.** No count of how long you have held something, no
count of how often you skipped it. "Not this" still records nothing and always
will. A thing is heavy because you said so.

**What to look at in 1.23.0 — the cards say what you cannot reconstruct.** Two
lines, from the two collisions the research asks about twice. Sorting things out
now says when each item was written — *"Written yesterday evening"*, *"Written
on 14 Jul"* — because what a note meant fades in hours and by triage it reads
like somebody else wrote it. And Next up says what a thing holds up: *"it feeds
'Roster' — start it within 4 days"*.

**The second one is conditional, and that is the honest caveat.** It needs an
item to have both a declared downstream and a rough duration, which are two
controls on the detail sheet (*What does this hold up?* and *takes N days*). If
those have never been used it stays silent — correctly, since a start date
derived from a missing term is invented. So it may be invisible on your store
until you link something.

**What to look at in 1.21.0 — arrangements.** Open anything that repeats, give
it a rhythm, and a new group asks whether it is *supposed to run without you*. A
delivery that reorders itself, a service on a schedule, a renewal. Marked that
way, it stops asking whether you did it and starts asking when you last
confirmed it is still arranged — and where it depends on somebody else, the
words change again, because "check this" is no use when checking means asking
someone. It never invents a rhythm for something that has none.

**What to look at in 1.22.0 — the clock.** (i) → Extras → *Show me the clock*.
A dial at the top of every screen, and beside it how much of today is left and
how many things carry today's date.

**The question in 1.22.0, and it is the one worth your words:** the remainder is
the whole bet. A clock face alone says what time it is, which was never the
problem. "5h 12m left today" is meant to give the day a weight it otherwise only
gets at the moment it runs out. Does it, or is it one more thing on the screen?

**What it deliberately will not do, so it does not read as a bug.** It cannot
count down to an appointment. Quietkeep records DAYS, not times of day — there
is no time-of-day input anywhere in it — so it does not know that anything
happens at nine o'clock, and a countdown would be a number made up. Whether the
app should learn times of day at all is a real decision and it is yours; it
would touch every date control, the calendar export and the replan path. For
something that rings while the app is shut, the calendar hand-off in the (i)
panel writes a real alarm today.

**Tapping the clock does nothing, on purpose.** The ask was that it opens the
device's alarm page; no browser can reach that screen. The near substitute —
handing today to the calendar — is one tap away in the (i) panel, and it is not
on the clock itself because a control whose visible name changes every thirty
seconds cannot be operated by voice (ADR-0075).

**Not verified by this session, and it is the same one as last time:** nobody
has opened the deployed site. This environment cannot reach pages.dev — tested
this session rather than assumed: both hosts return `CONNECT tunnel failed,
response 403` at the proxy. Workflow-green is not the site serving it (LESSONS
§53). Your device is the check.

*Everything below this line describes earlier candidates (1.20.0 and 1.18.4) and
is kept because it is still what to look at on device.*

**Not verified by this session, and it is the one that matters:** nobody has
opened the deployed site. The Deploy workflow concluded success for the exact
promoted SHA, its steps RAN rather than skipped, and its log printed
`Deployed to PRODUCTION: https://quietkeep.pages.dev` — but this environment
cannot reach pages.dev (tested this session, not assumed: the proxy returns
403, V-15 still holds). Workflow-green is not the site serving it (LESSONS
§53). The device is the check.

**What to look at:** everything offered now carries a place line — "in Errands
· under Home" — on the suggestion, the rows behind it, and the upkeep chips.
And filing hands you a receipt: "Filed under Errands — it comes round
Thursday", or, honestly, "no return date yet". That second sentence is the
hollow-return finding surfaced to the one person who can fix it — the control
to date a place is stage 3.

**The stage-1 question (V2 plan):** does grounds-on-the-card move the "right
things" feeling, and does "it left and I don't know where" end at file time?
Your words after a few days — plus Block-register entries — gate stage 2.

**What to try, and it is the thing you said was missing.** On any triage card
there is now **Put it somewhere**. It offers every place you have, and a field to
NAME ONE THAT DOES NOT EXIST — typing a name makes the place and files the item
in it, without leaving triage. What you file stops asking on its own: the place
carries the clock and brings its contents back with it. *Undo* takes it back out
of the place, not just off the list.

**Also in this candidate (1.18.4):** several controls would not answer to the
words written on them if you drive the app by voice. The ⓘ button announced a
sentence while showing a single letter, *Work on this* answered only to the
item's title, and the two ways out of the ⓘ panel were both called *Close* — as
were three `Set` buttons, two `Link`, two `Done` and two `Copy it`. All found by
a new gate on its first run; hub LESSONS §29 had been prose in this repo.

The Sync edition deploys alongside it at **https://quietkeep-sync.pages.dev**
(staging: **https://staging.quietkeep-sync.pages.dev**).

**The one thing that will look wrong and is not.** Coming FROM 1.18.0, this one
update still lands without asking, because 1.18.0's code is what does the landing
and could not be patched from here. From this build onward the asking is real.
It is in the patch notes too, so a reader is not left to work it out.

**That paste has been made and [V-15](docs/verifications.md) is CLOSED.** The owner's
diagnostic from the production sync host read `quietkeep-sync-1.18.0`, which is
the first time production has ever been read in this project. Nothing is
outstanding on the release itself.

**Nothing is outstanding.** The app's own "WHAT IS WRONG" section tells
its reader what needs attention, on screen, in plain words — a session
repeating those lines back adds nothing and is not a repo to-do. See
hub LESSONS §36.

This block exists because `handoff-check.mjs` failed the repo for not having
one, and it was right: `NOTES.md` had mentioned the hostname in prose for weeks
but never as a URL a person can tap. A staged candidate nobody can reach is not
handed over (Doctrine §7).

### The Block register

*(Opened 2026-08-04 with the V2 plan. Stated then: no stability test is
possible until the full product exists, because what is still being found is a
mix of hard blocks and things to adjust. This register is that split, made a
record.)*

**REDEFINED 2026-08-05, before it ever held an entry, because as written it was
a trap.** The original definition asked for "one line per ended day: the date,
what ended it" — which invites somebody's actual day into a public file. It was
about to receive one: a morning's worth of medication, a medical device,
appointments, a workplace matter and a family's weekend, offered to shape the
product and very nearly written down here as evidence. The owner stopped it. The
instrument was correct about needing evidence and wrong about what evidence is.

**What an entry records, and it is never an instance.** The SHAPE of what
blocked a day, the CLASS it belongs to, whether it was a hard block or an
adjustment, and the release that answers it. *"A standing arrangement whose
failure mode is silence has no noun — hard block — answered in 1.21.0."* That
line is worth more than the thirty days ADR-0019 talks about, and it contains
nothing about anybody.

**Where the instance lives: outside the repo, not here.** A session may READ what is
described and design from its shape. It may not write the particulars down —
not in this register, not in an ADR, not in a commit message, not as a test
fixture, and not as an "illustrative example", which is the form it would creep
back in as. Enforced by the HIS_LIFE class in GATE hub:privacy-check.mjs.

- *(no entries yet)*

**CLOSED 2026-08-21 by evidence, not by asking (decision 6 of the V2 plan).**
The proposal was to keep the dogfood gate's definition and its counter untouched
and RESTYLE it as the *full-product gate* — not runnable until the full product
is declared to exist, with this register as the primary instrument until then.
It sat proposed for seventeen days.

It is closed on a fact that arrived on 2026-08-21 and settles it without an
opinion being needed. **No session of real use has ever gone past a fresh import
or a handful of sample items.** So the counter has never had anything to count:
every recorded reset was the app being unenterable at the door, not a stability
failure under use. That is a test which never started rather than a test which
failed, and it reconciles the two entries the proposal was written to reconcile —
the 2026-08-03 correction (the gate has always been running) and the 2026-08-04
statement (no stability test is possible yet). Both were true of different
things.

**The restyle is adopted as proposed**, because the evidence says exactly what
the proposal guessed: the gate becomes runnable when the app becomes enterable,
which is phase 1 of `docs/plan-situated.md`. The definition and the counter are
untouched. Until then the Block register is the instrument, and the resets it
holds are measurements of the door, not of the product.

Closed the same route Q-11 took — by research rather than by putting a question
to the owner that the record could already answer.

### Log

- **2026-08-06 — 1.27.0 (CAPABILITY): a returning place says what it is
  holding.** The other half of "the place comes back, and its contents come back
  with it" — 1.26.0 made a place able to return, and it arrived saying "7 under
  it". The collision catalogue's top-ranked proposal (entry 3) is that filed
  means gone because a filed thing has no cue; a count is not a cue and a name
  is.

  Bounded per law 8: three by name, then how many more. **Only in `ready`**,
  which is the whole restraint — every container naming its contents would turn
  the held list into the org chart law 4 refuses. Completed things are left out;
  naming what you already did would be a receipt for work.

  **`.card-place` had never been measured by the a11y gate** — the line that
  says "in Errands · under Home", on every filed card since 1.20.0. Registered
  now, in the state that reliably has one, at 7.31:1 light and 7.93:1 dark.

  Two plants seen red: the cap removed (the pile, arriving on a schedule) and
  completed work counted as still inside. And the smoke assertion was wrong
  about the WALK rather than the app — it hard-coded the title of the item it
  had captured, but the heat taps advance the heat queue, so the clarify card
  that lands is the head of the clarify queue. It reads the card it is actually
  filing now.

- **2026-08-06 — 1.26.0 (CAPABILITY): V2 stage 3, and the hollow return is
  closed** ([ADR-0080](docs/adr/0080-dating-a-place.md)). A place minted at file
  time carried only a `gate:node.created` cure, which `isAppClock` excludes from
  `soonestDemand` and `arrivedClock` — so it sat in "Later" for ever holding
  everything filed into it.

  **Two facts the record did not have, both found by probing the fold rather
  than re-reading the notes.** The return machinery was ALREADY complete: give a
  place a human review clock and `heldGroups` moves it Later → Coming up →
  Ready now, verified before a line was written. And a date control already
  existed on a place — containers are not demand-free, so they pass the detail
  sheet's own `temporal` test, and tree rows have opened the sheet since 1.6.0.

  So the defect was never "there is no control". It was **the path and the
  noun**: you had to know the place existed, open the tree, find it, open its
  sheet, and set a date that would have been a `due`. A place is not something
  you finish. The write is a `review` clock, offered on the receipt that had
  been stating the problem with nothing to press.

  **Two defects of my own, both caught by gates rather than by review.** The
  first version rebuilt the receipt bar on success and took the Undo button with
  it — so answering "when does this come back" silently removed the way to take
  the filing back, on the surface whose whole job is that you can. And the
  button announced "Set when ⟨place⟩ comes back to you" while reading "Bring it
  back on…", an SC 2.5.3 failure the a11y gate caught on its first run.

  **The smoke block moved three times before it stopped littering** — it ate a
  card its neighbours routed by name, then perturbed the six-routes accounting,
  then assumed an empty inbox that only exists near the start of the walk. It
  sits last now, brings its own item, and cleans up with the app's own Undo.

- **2026-08-06 — 1.24.0, 1.24.1 and 1.25.0 PROMOTED together.** A clean
  fast-forward: `main` was an ancestor of `staging` with nothing on the other
  side, checked with `merge-base --is-ancestor` rather than assumed. CI was
  already green for the exact SHA before the promotion — Spine's 26 steps and
  Deploy's 18, all confirmed RAN, including step 7, the Doctrine §9b privacy
  gate — and Deploy on `main` was then read separately for its own
  `Deployed to PRODUCTION` line, which the workflow's branch conditional only
  prints there.

  What went out: the smaller-bite line and "This one is heavy" on the offer
  card; five defects found in the on-device pass, including the source comment
  that had been painting under the accessibility link on every screen; and a way
  past a card in triage.

- **2026-08-06 — 1.25.0 (CAPABILITY): a way past a card**
  ([ADR-0079](docs/adr/0079-a-way-past-a-card.md)). Reported in four words:
  paths in without a path out. The heat pass offered Hot and Cold, clarify
  offered seven routes, and neither had a skip — while Next up has had one since
  ADR-0030, recording nothing, precisely because "a person who has to justify
  skipping something will avoid opening the app at all".

  The same reasoning applied harder here and had never been applied.
  `unclarified` is oldest-first and stable, so a card somebody could not decide
  about was the SAME card at the top of the surface every time the app opened.
  The surface whose job is to drain the inbox had a head that could not be got
  past, in an app for people whose defining difficulty is starting.

  **It records nothing, and that is the whole decision.** An in-memory set,
  `work.ts`'s rule exactly. A skip that survived a reload would be a durable
  list of what somebody could not face, kept by the app on their behalf — worse
  than a score, because it would be a score about avoidance specifically. A
  passed card goes to the back, never away: when all of them have been passed
  the queue starts again from the top, because an inbox that emptied itself
  through skipping would be the app hiding work.

  **Two walks broke on this commit, in the same shape.** Smoke detected a heat
  card as "the one with no hints" and the new control carries a hint on both
  passes. The a11y walk opened the place picker by clicking "the last route in
  the row" and the way out now sits after it. Both inferences — identity from
  the absence of a thing, identity from position — held for a year and broke on
  the first release that added one control to that surface. Both ask by name now.

- **2026-08-05 — 1.24.1 (ITERATION): five things found on a real phone, and the
  two gates that had no opinion about any of them**
  ([ADR-0078](docs/adr/0078-what-the-gates-did-not-look-at.md)).

  **A comment rendered as text on every screen, on production.** Five lines of
  engineering prose about SC 2.5.3, plus a bare closing arrow, under the
  accessibility link in the footer. One comment split in two with its middle
  left outside both halves. It survived releases because the footer is below the
  fold on a phone — which is also where it did the most damage.

  **The gate lesson is the release.** The a11y pass measures contrast, names and
  target size; the smoke walk drives behaviour; `docs-check` reads markdown.
  Every one of them measures a PROPERTY of the output, and none of them looks at
  whether the page says something nobody wrote on purpose. `npm run smoke` now
  reads `innerText` on the landing surface, in the (i) panel and in the footer.

  **And a floor with no ceiling is half a measurement.** `flex: 1 1 10rem` on a
  date input is a minimum WIDTH while the row is a row; below 26rem the row
  becomes a column and flex-basis sizes the main axis, so it became a minimum
  HEIGHT. A 160px empty box under "Give it a date", on every phone, passing a
  44px-floor target check with no upper bound.

  **The ceiling took three attempts and only planting found that.** A quarter of
  the viewport did NOT catch it — 160px against a 211px quarter-screen — so the
  gate would have shipped looking like protection. Three times the 44px floor
  caught it and also failed a place-picker route button legitimately 143px tall
  from its wrapped label, which is the one thing a gate here may never do.
  Fields only, never buttons: an input is a single line by construction, a
  button is content-sized.

  **The tab budget moved 60 → 90, for the third time.** 1.24.0's three new
  controls on the work surface pushed `#tree-open` past it, and the walk called
  a perfectly focusable button unfocusable. Light failed and dark passed in the
  same run — one tab order, two verdicts, which is a budget at its edge and
  never a broken control. The message names the budget now.

  Also fixed: the version stamp presses the diagnostic it is named for and waits
  for it (building it is async, so a synchronous check would have silently
  restored the old behaviour); the (i) panel shows that it scrolls; and the
  diagnostic stopped saying hundreds of things had no clock four lines after
  counting their clocks.

- **2026-08-05 — 1.21.0, 1.22.0 and 1.23.0 PROMOTED together.** A clean
  fast-forward: `main` was an ancestor of `staging` with nothing on the other
  side, so nothing was merged or resolved. Deploy on `main` ran all eighteen
  steps and printed `Deployed to PRODUCTION`, and Spine was green for the same
  SHA with the Doctrine §9b privacy step confirmed RAN rather than skipped.

- **2026-08-05 — 1.24.0 (CAPABILITY): the two things you can do when you cannot
  start.** The catalogue's first two entries, shipped together because they are
  one moment from two directions — the thing is too big, or it is too heavy.
  Both acts sit on the offer, because the moment they help is the moment leaving
  the surface to do them is more than anybody can spend
  ([ADR-0077](docs/adr/0077-when-you-cannot-start.md)).

  **The bite is ONE event, and that is the whole design.** `node.created` takes
  a parent, so it is born already under the offered item. Split into a create
  and a parenting, the gate evaluates the gap between them — where the node is
  on no surface, under no clock and under no parent — and cures it with a
  same-day review clock. A first step that quietly acquired a date is a demand
  somebody made of themselves while trying to get unstuck, and law 3 would bring
  it back as a replan card whether or not it was ever the right step. The test
  proves it from the other side: a bare create in the same state comes back
  carrying a clock.

  **`affects` had been complete and unreachable for eight releases.** The field
  has been in `pebble.raised` since 1.15.0, `raisePebbleEvents` has accepted it
  since the day it was written, `pebbleWords` already reads names out of it —
  and no surface had ever set one. No test covered the emitter at all. "This one
  is heavy" is its first writer.

  **Two things the gates caught that review had not.** The new input shipped
  straight into the UA placeholder grey — 4.08:1 light, 3.78:1 dark — which is
  the third time this app has hit that exact trap, and `app.css` now says so on
  the line that fixes it. And the smoke block left the load entry open, which
  the later load section then closed on itself by clicking the summary to open
  it; its failure read as a broken load surface and was really this block's
  litter. Leave the surface as you found it.

- **2026-08-05 — 1.23.0 (CAPABILITY): assembled context reaches the two cards
  where the decision is made.** ADR-0012 named the idea and delivered half of
  it. The collision catalogue asks for the other half twice — entry 17, because
  the meaning of a captured fragment drops within hours and arrives at triage as
  a stranger's note; entry 4, because the future carries no weight until it is
  now. The same move answers both: state the fact nobody can reconstruct, on the
  card where they are deciding.
  ([ADR-0076](docs/adr/0076-assembled-context-on-the-cards.md).)

  **The approach half was already written.** `dependencyWords` has produced *"it
  feeds 'Roster' — start it within 4 days"* since build-plan item 27, in the
  right voice, and reached the detail sheet and the replan card — you had to
  already suspect something to go and look at it, which is the opposite of what
  temporal myopia needs. Wiring it to the offer is one helper beside
  `lineageOf`, so all five push sites ask the same question of the same
  function.

  **A design that inspection killed before it was written.** The capture time
  wanted to be a `capturedAt` field on the node. `snapshot.ts` serialises nodes
  whole and the fold never revisits a node's genesis event, so every item
  already inside a snapshot would restore without the field and never regain one
  — and those are exactly the old items this exists to describe. A field that
  works only for things captured after the upgrade is worse than none, because
  it looks like it works. It reads the log through the `node` index instead: one
  indexed lookup, no schema change, and genesis means the earliest event in
  `compareEvents` order rather than the first row stored, because a shard from
  another device delivers older events later.

  **It never blocks.** The card renders from state as it always has; the line
  fills in after, or not at all, and a lookup resolving after the card has moved
  on is discarded. Nothing on the path to a first capture waits on a store read.

  Four plants seen RED and green after: a default lead estimate inventing a
  start date, the words stating an age, genesis read by insertion order, and the
  offer's projection carrying the sentence while the surface never showed it.
  The a11y walk waits for the async line rather than measuring an element that
  is correctly still hidden (hub LESSONS §61).

- **2026-08-05 — 1.22.0 (CAPABILITY): the header clock, and a budget that was
  eating the patch notes.** An analog clock in the chrome of every screen, opt-in
  under Extras, carrying three derived facts: the time on a real dial, how much
  of the local day is left, and how many held things are dated today. The
  remainder is the whole bet — a dial alone answers a question nobody was
  stuck on ([ADR-0075](docs/adr/0075-the-header-clock.md)).

  **The plan for it was wrong and the correction is the record.** It promised
  "your 0900 is in 1h 40m". Every clock in this app is day-granular —
  `clock.set` takes a datetime and every writer builds it with `endOfLocalDay`,
  and there is no time-of-day input anywhere in the markup — so the app does not
  know that anything happens at nine o'clock. That number would have been
  invented, which is the one thing ADR-0010 exists to refuse. A capability was
  designed before the data model it needed was checked.

  **The dial is not a control**, though the request was that tapping it opens
  the device's alarm page. No browser can reach that screen. The near
  substitute — handing today to the calendar, which writes a real `VALARM` —
  stays on the (i) panel, because a control whose accessible name is its visible
  words cannot be operated by voice when those words change every thirty
  seconds. Planted: `SC 2.5.3` red in both themes on exactly that shape.

  **What cost the most time was not the feature.** The panel's expanded-height
  gate stood at 9,000px and the panel measured 8,907 at 1.21.0 — ninety-three
  pixels of headroom for every future release. This release met it and the
  reflex was to start deleting patch notes: five bullets to three, then shorter
  bullets, then the panel's own prose twice, arriving three pixels short with
  the content visibly worse. Forty lines below the assertion sat a comment
  saying this had already happened twice and pointing at
  [ADR-0072](docs/adr/0072-an-update-waits-for-the-reader.md). The bound moved to
  12,000 and was planted at 52,707 (every release rendered inline — the original
  defect) to prove it still bites. The budget a reader is actually held to, the
  folded phone panel at 3,600, measured 2,321 throughout and is untouched.
  Written up as hub LESSONS §62.

  Both readers in `src/clock.ts` are TOTAL: `endOfLocalDay` throws a `RangeError`
  on an unparseable instant and the clock repaints inside the chain that
  repaints every other surface, so an escape would have cost somebody their card
  list. The remainder is the ZONE's day — the 23- and 25-hour days are asserted,
  because `now + 86_400_000` passes every other day of the year.

  Hub drift adopted through §62; LESSONS §59 applied on the way past — this
  release's assertions hold rules rather than sentences (a finished day states
  no digit; the remainder decomposes to h/m), and its a11y walk waits on the
  toggle's state rather than on the wording of a status line.

- **2026-08-05 — 1.20.2 (ITERATION) cut and PROMOTED: the Install control was
  dead on device.** Reported on an iPad: the Install control was pressed
  ten times with no visible effect, and the update landed only after a force
  close and reopen. An installed app on
  iPadOS will not reliably let a waiting worker take over while the app is
  open; the message went, the worker did not step aside, and the code's answer
  was to RELOAD after three seconds — re-entering the same build and re-showing
  the same offer. A control that visibly does nothing, ten times over, with no
  hint that closing the app is the thing that works. The timeout now says what
  is true and hides the control, since pressing it again cannot help. The happy
  path is untouched and `update:walk` still passes end to end.
  · **Why the gate did not catch it, which outlives the bug.** `update:walk`
  drives a real second worker, a real press, and asserts the swap completed —
  and it passes, in headless Chromium, where this cannot happen. The check was
  measuring a machine the defect does not exist on (hub LESSONS §54, extended
  with this). The platform is out of reach here, so the new assertion targets
  the FAILURE path instead: the source must carry no timed blind reload and
  must use the stuck message. Seen red by restoring the old
  `setTimeout(reloadOnce, 3000)` and green after.
  · **Said in the release note, not just here:** a fix to the update mechanism
  can only arrive through the update mechanism it fixes, so this one still
  needs the app closed fully once more on those devices.

- **2026-08-05 — 1.20.1 (ITERATION) cut and PROMOTED to `main` on the owner's word.**
  Doctrine §7d.1 landed in the hub — release notes drift into development diary,
  and a rule at the top of a file is read once. Two of this app's shipped notes
  had done it: one told the reader what the OWNER had said about the app feeling
  unfinished, one apologised to whoever reported a fault twice. Neither says what
  a reader can now see or do. Rewritten from `src/ui/changelog.ts`, the single
  source the (i) panel renders from. Seven other first/second-person matches were
  checked and deliberately kept — UI control names like "Clear what I am holding",
  and the reader's own voice in "what am I waiting on Sam for". The rule is about
  whose story the note tells, not about banning a pronoun.
  **Cut as a release rather than pushed quietly** because the service-worker
  cache name carries the triplet: without `quietkeep-1.20.0` → `quietkeep-1.20.1`
  every reader holding a cached shell keeps the old notes and never learns
  otherwise. The release also names what is still missing, per §7d — a place made
  on the spot still has no return date, and the control to set it from the
  receipt still does not exist, promised in 1.20.0 and not yet delivered.
  Promote was a merge of `staging` into `main` with the resulting tree asserted
  IDENTICAL to the verified staging tree, not inferred from a clean merge.
  974 tests, typecheck, changelog/triplet, privacy, mirror and no-grid gates all
  green; Spine and Deploy green on `704249b` for both branches.

- **2026-08-04 — HISTORY REWRITTEN on the owner's word. Every SHA before `7407c0b`
  is gone; an older clone will not fast-forward.** The personal material was
  never only in the tree: it was in `NOTES.md` across four commits, in
  `test/privacy.test.ts` across ten (as fixtures), and in one commit MESSAGE,
  which no later commit can clean. Scrubbed by PATTERN rather than by quoting
  the sentences, so nothing sensitive was typed into a script, a file, or a
  log; matching lines became a redaction marker and every other byte of every
  other file is unchanged. The check that matters: the working tree at the new
  head is IDENTICAL to the pre-rewrite tree (`git diff --quiet`), 974 tests
  pass, and a FRESH CLONE pulled back from GitHub scans clean across all 235
  commits and 1659 blobs. Spine and Deploy green on `main` and `staging`.
  **The hub was NOT rewritten and did not need to be** — its apparent hits
  were the gate's own documentation matching its own pattern, meta-prose about
  the rule rather than a personal disclosure. That was reported as exposure twice
  before anyone read what had matched.
  **Still open:** a force-push does not delete the old commits
  from GitHub — they stay reachable by full SHA until GitHub collects them, so
  making the repo private, or asking GitHub Support to purge, is the only
  thing that closes that. Also left deliberately: a sustainability remark,
  removed from the tree at the old `ce6448f` but still in history. It is a
  design statement, no pattern catches it, and widening scope was not the owner's
  instruction.

- **2026-08-04 — 1.20.0 PROMOTED to `main` on the owner's word.** `main` had carried
  a revert of the 1.20.0 code since `c6e7182`, because it had reached `main`
  once without the owner's word; `staging` reapplied it at `002e195`. The promote is a
  merge of `staging` `d6e36be` into `main`, and the check that matters is that
  `main`'s tree came out IDENTICAL to the staging tree that was verified —
  asserted with `git diff --quiet`, not assumed from a clean merge. 974 tests,
  typecheck, privacy and no-grid gates green locally before the push; Spine
  green on the pushed head. Cache name still carries `quietkeep-1.20.0`.

- **2026-08-04 — The privacy gate was not reading the two files that held the
  material.** `privacy-check.mjs` and `test/privacy.test.ts` exempted
  themselves from their own scan, on the reasoning that a pattern is not a
  disclosure. True of the patterns, false of every other line: their header
  prose went unscanned, and this repo's test fixtures were the sentences the
  gate exists to exclude, reproduced verbatim in a PUBLIC repo and labelled as
  authentic. The gate had been reporting green over them for a day — green
  meant NOT LOOKED AT, and a session reported that green to the owner as
  verification. What changed: no file is exempt; only a sentinel-marked region
  of pattern source is skipped; that region is itself held to a second rule
  (no proper name, no date) with its own test, so the one place the patterns
  do not read cannot hold a sentence about a person; regex literals inside the
  region are set aside before that guard runs. Fixtures are now SYNTHETIC —
  bare pronouns and bracketed placeholders — and a new test requires every
  pattern to be exercised by at least one probe. Seen red on three local
  plants, each discarded uncommitted. Landed on `staging`, `main` and the hub.
  **Still outstanding and the owner's call: the same sentences remain in git
  HISTORY on both repos, in several commits and two commit messages.** A
  pattern-based rewrite is written and unrun; it force-pushes `main` and
  `staging`, so it waits for the owner's explicit word. Force-pushing does not purge
  GitHub's copies — old commits stay reachable by SHA until GitHub collects
  them, which is why making the repos private is the only step that closes it
  immediately.

- **2026-08-04 — The privacy FAIL state is doctrine now, and a HARD CI gate.**
  Restated hours after the rule was first set for this repo: personal or
  embarrassing information in a repo is a HARD gate for ALL apps. Said twice in one
  day, so the session that heard the repeat wrote it into the doctrine —
  §9b, in the hub. What changed mechanically: the hub's own CI now runs
  `privacy-check.mjs` on every push, and this repo's Spine checks the hub out
  fresh and runs the CANONICAL copy — so a pattern widened in the hub binds
  here on the next push, with `test/privacy.test.ts` still failing plain
  `npm test` offline. Both commands were seen red on a locally planted
  violation before being trusted, and the plant was discarded uncommitted — a
  pushed plant would BE the violation, since git history is out of the gate's
  reach. The gate's first hub run also failed on its own documentation
  (LESSONS §52's meta-prose read like a disclosure to the pattern); the
  convention that resolves it — name the term first, the person second — is
  now in §9b. Every other sibling owes the same CI step; doctrine-sync
  routes the debt.

- **2026-08-04 — docs/horizon-models.md: what exists for working at different
  horizons, surveyed against the laws.** The question: **what models exist for
  working at different horizons.** Lines of effort were named as a known example,
  with the observation that **those kinds of view are never offered in planning
  software**, and that the horizons get discussed without leading to action.
  Eighteen models surveyed — military doctrine, strategy deployment, OKRs,
  PARA and ND-community practice among them — each with its origin, its
  mechanism, why it does or does not lead to action, why planning software
  never offers it, and what survives the ten laws.
  · **The central finding: a line of effort and a Q-13 role are the same
  shape** — a named purpose-line cutting across the areas of a single-parent
  tree. The model the owner named first is the strongest external corroboration
  Q-13 has: roles ride a cross-cutting link (the feeds relation's shape),
  never a container.
  · **The owner's critique of the six-horizons model is structurally correct**, not a
  matter of emphasis: no artifact in that model links a goal to a next
  action — no link record, no computed health, no cadence that survives the
  reviewer's own executive function, which is the capacity this app's thesis
  says cannot be relied on. Law 4 is that model's deliberate inversion: the
  horizons come down; the user never climbs.
  · **Backward planning is already shipped** (feeds → latest-start → replan
  card, 0.12.0) — the one surveyed model found already mostly inside the laws.
  · Refused, by name: cascaded targets, RAG status, scoring, mandatory
  cadences, and every word of military vocabulary (voice rule — the shapes
  may ship; the words may not).

- **2026-08-04 — The privacy FAIL state: named by the owner, found already
  breached, gated. And a §7 breach committed during the repair, reverted.**
  **The standing rule: nothing personal or embarrassing about the owner is ever
  recorded in a repo, and doing it is a FAIL state** — not a preference, not a
  trade-off, and not something a session weighs against anything else.
  · **It had already happened.** In recording design conversation faithfully,
  a session had written sentences into this public file that attached
  personal facts to the owner rather than to the product or its users. They
  were removed the hour the rule was stated (ce6448f), and a grey-zone quote
  was rephrased to keep its design content without its personal frame. What
  the removal cannot reach — git history is append-only — was put to the
  owner directly with the available options; that decision is the owner's, not a session's.
  · **The rule now has teeth in three places.** `test/privacy.test.ts` runs
  in this repo's CI: patterns deliberately narrow — the person, linked by a
  verb, to the term — so the product's own public framing never trips them,
  with a built-in plant proving every pattern bites. The hub's
  `privacy-check.mjs` carries the same patterns for every sibling repo. And
  this repo's CLAUDE.md now opens its app-specific rules with the rule
  itself. Hub LESSONS §52 records the class: design statements the owner
  makes are recordable; who the owner is, is not.
  · **The scrub push broke §7.** Urgency is no excuse and it was the cause:
  the scrub went out as `git push origin staging:main`, which carried the
  UNPASSED 1.20.0 code (1a531dc) to production alongside the docs fix.
  Repair, in order: 1a531dc reverted on `main` (c6e7182 — production runs
  1.19.0 again, the docs kept truthful), `staging` restored by
  revert-of-revert (002e195 — 1.20.0 intact, 973 tests green), both verified
  by reading the remote. The rule that was already written and still missed
  under urgency: docs bound for `main` travel as a docs-only commit,
  cherry-picked — never as a branch push that happens to contain code.

- **2026-08-04 — the two open design questions from the V2 planning session
  were answered.** Both settled in one pass: **a role is an identity and it
  crosses multiple areas**, and **the design follows the principles of ND-first
  planning**.
  · **Roles → Q-13** (above): identities crossing areas cannot be containers
  in a single-parent tree; they are a cross-cutting link, a real vocabulary
  addition, deferred behind stage-4 evidence with the shape named so it is
  not re-derived. Stage 4's chooser stays three doors (project / area / goal).
  · **Cadences → settled as offered-not-asked.** The owner's #2 endorses the ND-first
  reading of the horizon-cadence question: return dates are OFFERED defaults —
  one-tap, adjustable, silently skippable, "not yet" writes nothing — never a
  per-horizon interrogation at creation time. This is the PDA-aware fork
  chosen deliberately (demand avoidance includes self-imposed demands; a
  question you must answer to proceed is a demand in costume — see
  docs/nd-collisions.md entry 8). Stage 3's dating control is confirmed as
  designed: this week / next week / not yet.

- **2026-08-04 — 1.20.0 (CAPABILITY) staged: V2 stage 1, "It says where."**
  · **The offer answers *where from* for the first time.** `NextUpItem` gains
  computed `place` — `lineageOf` walks `ancestors` (its first production
  consumer) two hops: the parent, then the first live CONTAINER above it.
  "in Errands · under Home". A loose item stays silent — bareness is not
  announced — and a trashed parent confers no location. Rendered on the head
  card (`#nextup-place`), the behind rows, and the upkeep chips.
  · **Filing hands over a receipt, both branches honest.** "Filed under
  Errands — it comes round in 4 days." when the place carries a HUMAN clock;
  "Filed under Errands — no return date yet." when it does not — which, per
  the hollow-return finding, is every place minted at file time until stage 3
  ships the dating control. `placeReturnDays` reads only human clocks: the
  gate's cure is pinned by test as NOT a return date, so the receipt can never
  promise a return no surface will deliver.
  · **No new colour pair ships** — every new span reuses a registered text
  class; modifier classes are layout-only (B-40). No new events, no fold
  fields, no vocabulary change; `events:check`/`emitters:check` unchanged.
  · **Proved by planting:** letting a trashed parent confer a location, and
  letting the gate cure count as a return date, each turn exactly one test
  red. 971 tests pass.
  · **The stage-1 question is in the staged block above**; the owner's report gates
  stage 2 (the judgement line and grounds panel).

- **2026-08-04 — THE V2 PLAN IS APPROVED, and the deep pass that produced it
  found a defect in 1.19.0 that outranks everything else in it.**
  · **The hollow return, verified by hand and by three agents independently.**
  A place minted at file time is cured with `source: 'gate:node.created'`
  (`src/gate.ts:636-639`), which `isAppClock` (`src/fold.ts:59-69`) excludes
  from `soonestDemand` (`src/held.ts:93`) and from `arrivedClock`
  (`src/nextup.ts:101`) — so **a place made by filing never comes round on any
  surface**. And `fileUnderEvents` clears EVERY clock on the filed item, so a
  filed item can never satisfy `arrived` — **invisible to every `nextUp`
  tier**. 1.19.0's own docblock — "the place comes back, and its contents come
  back with it" — is true at the coverage layer (law 1 holds; nothing is
  silent) and **false at the return layer**. Nothing is lost; nothing returns.
  The filed backlog is safe and invisible, which is the exact complaint the
  feature was built to end, one layer down. Stages 1–3 of the V2 plan make the
  shipped promise true.
  · **The paradigm, one breath:** what you declared governs what returns —
  every filed thing names where it went and when it comes back, the place
  comes back carrying it, and everything shown says why it is here, under a
  rule short enough to read. Never a score, never a grade, never a memory of
  a skip.
  · **Mechanics:** zero new event kinds, zero new fold fields, zero
  migrations. The one new write is a human-sourced `clock.set { review }` on
  a container — legal, gated and folded TODAY; verified that it flows into
  held's soon/ready with no code change, raises no replan card
  (`NO_REPLAN_CARD`), and cannot enter `nextUp` (`NOT_ACTIONABLE`). The whole
  return mechanism already exists; nothing writes the clock yet.
  · **Staged 0–7, each gated on the owner's on-device pass and an explicit
  say-so**, with
  nine decision points that are the owner's alone — including Q-11 asked WITH evidence
  after stages 1–3 rather than answered by guess, Q-12 untouched by default,
  the noun cull, and where a `'place'` offer reason would sit if it ever
  graduates (only if Q-11 says *ranking*). Full plan in the session plan file;
  durable parts land in this repo as the stages ship. Rotation-by-arithmetic
  was designed, adversarially killed (a second temporal primitive — law 5),
  and is recorded as rejected rather than resurfacing next quarter.
  · **The collision catalogue is committed** —
  [`docs/nd-collisions.md`](docs/nd-collisions.md), 23 entries, each with the
  named research, what conventional systems do wrong, what this app already
  does (cited to its own ADRs), and a build/later/refuse routing. It was asked
  for it by name. Its refusals are as load-bearing as its builds.
  · **Two design statements recorded this session, because sessions keep paying
  for not writing them down.** On the offer: **Next up already contains all of
  those things — what is missing is knowing WHEN to see which one.** On recurring
  work: **there was nowhere for a recurring standard like cleaning a sink to
  go** — which
  produced the two-kinds-of-mattering frame (standards return by pressure,
  correctly; directed work returns by declaration, currently missing). On
  horizons: *"When do I review my goals? My roles? When do I visit whether I'm
  putting enough energy and effort into each?"* — answered structurally:
  horizon visits are sink-class work on the existing decay primitive; the
  mountain comes down on a clock. On Eisenhower: *"guilt and shame in three
  quadrants."* And a sustainability direction: the product should be able to
  outlive its maker — recorded as a thread, deliberately not built now.

- **2026-08-04 — AZIMUTH CHECK, at the owner's request. Three findings, recorded
  because they outrank anything currently on the roadmap.** The owner asked whether this
  app is what it needs to be, or is fulfilling thesis statements. The owner's own
  diagnostic answers a good deal of it.
  · **1. ELEVEN OF FOURTEEN NODE KINDS ARE EMPTY.** After a 1,173-item import and
  real use: action 1405, project 44, upkeep 1, resume-card 1, and **zero** of
  outcome, area, goal, waiting-for, aspiration, bother, pebble, journal, person,
  anchor. Eleven kinds with machinery, tests, ADRs and UI, holding nothing. Some
  are legitimately not-yet-reached; eleven of fourteen is not a gap but a signal
  that a good deal was built because the model said the noun should exist, not
  because use demanded it. **Every unused surface is paid for forever** by the
  a11y gate, the smoke walk and every future session.
  · **2. EVERYTHING RANKS ON *WHEN*. NOTHING RANKS ON WHAT MATTERS.** `nextUp`
  ranks hard-date → resume-card → pressure: date is time, pressure is time,
  resume is recency. Triage's routes had the same bias one level up — all six
  answered *when*, which is what 1.19.0's `filed` route corrected. So Next up
  picks by pressure across a flat pile of 1,405 items, and *"no feeling that I
  was seeing the right things"* is not a mood — it is that **nothing about
  importance is in the ranking function.**
  · **Law 4 is the correction and is HALF-built** *(corrected 2026-08-04 by the
  V2 deep pass — the first version of this entry said "unbuilt", which
  overstated)*. ADR-0013's four Review exceptions ARE implemented in
  `src/review.ts` — stalled, orphaned, unfed-goal, quiet-area, capped at 3.
  What is genuinely unbuilt is the **projection into surfacing**: Review is a
  separate read-only panel, and nothing it computes feeds `nextUp` or any
  runway surface. Containers hold things; they still do not inform what a
  reader is shown. The distinctive claim stands as the least-realised one, for
  the ranking half only.
  · **3. THE PROOF ASYMMETRY, which is the sharpest way to say all of it.** Law 2
  gives the reader a visible proof that nothing is LOST — the gauge, on screen,
  tappable, "everything returns · 0 silent". **There is no equivalent proof that
  what the reader is being shown is RIGHT.** The app can demonstrate its integrity and
  cannot demonstrate its judgement. The single highest-value thing to build is
  the law-4 analogue of the coverage gauge — but only after Q-11 says whether the
  problem is ranking or trust.
  · **And the paradigm reading, which is why this matters beyond a feature list.**
  The dominant capture-and-organise paradigm, and everything downstream of it,
  assumes the bottleneck is capture and
  organisation, because for the cognition those were designed around, retrieval
  and initiation are close to free. Quietkeep has built that half better than most
  commercial products — the write gate, the append-only log, the coverage proof,
  the decay primitive. **It is also the half that already exists elsewhere.** The
  half that would make this unlike any other planner is retrieval, initiation and
  trust, and that half is thin. The import proved it: capture was solved
  instantly, and what broke was *where did it go* and *is this the right thing*.
  · **Law 10 (AI never blocks) has no implementation at all.** No AI module
  exists. That is fine as a standing constraint on future work, and it should be
  labelled a constraint rather than counted as a law the app fulfils.

- **2026-08-04 — `main` is at `1.19.0` (`4b01ba6`), promoted on the owner's word to promote
  to main, carrying 1.18.4 with it.** Production can now answer WHERE. Promoted
  onto **Spine 264**, watched green on that exact commit with all 26 steps read
  individually (V-10) — including *A real second worker waits for the reader*,
  *The closed event list matches the vocabulary* (which guards the new `filed`
  route), and *Rendered accessibility*. Pushed with `git push origin staging:main`
  (§7c); receipt `6bfdd30..4b01ba6`, confirmed by `git ls-remote` rather than by
  the push output.

- **2026-08-04 — THE OWNER SAID WHAT ENDS THE DAY, AND IT IS NOT WHAT I INFERRED.**
  Read this before building anything else.
  · As reported: a huge backlog imported to work through and file in the right
  places, and the places kept turning out not to exist yet. That was
  the problem. A thing would leave the surface with no way to tell where, and
  there was no feeling of being shown the right things.
  · **What I had inferred, and it was wrong.** I read the first diagnostic as
  volume — a surface opening with 1,275 things asking — and built `pressureBands`
  (1.18.3) on that. The data was there and I misread it: **area 0, goal 0,
  outcome 0, waiting-for 0** against 1,405 actions. I called that "two nouns out
  of fourteen in use", an observation about usage. **It is the problem itself.**
  The places do not exist, so nothing can be filed into them. "On the Menu: 0"
  and "In the Not Now ledger: 0" said the same thing and I connected neither.
  · **The structural gap, read from the code rather than guessed.**
  `routeEvents` (`src/ui/triage-intents.ts:76`) takes **no parent**. All six
  routes set a CLOCK (`do-now`, `next-action`, `waiting-for`) or put the node on
  the MENU (`someday`, `reference`), or trash it. **Triage answers *when*, and
  never *where*.** Nothing on that surface can say "this belongs under that
  project", and the project cannot be created in the flow — parenting lives in
  the detail sheet (`#detail-parent-create`), which is a separate trip per item.
  For a 1,173-item import that is the whole difficulty.
  · **What is NOT the defect, checked rather than assumed:** the confirmation is
  not missing. `showUndo` renders a visible `Sent to {route}.` bar with an Undo.
  I first concluded it was invisible because `#triage-live` is `visually-hidden`,
  and that was wrong — the live region is the screen-reader channel and the bar
  is the visible one. What "Sent to Next action" cannot do is name a **place a
  person can go and look at**, because the route is a category and not a location.
  · **So the work is: file into a place from triage, and make the place when it
  is not there.** Not more measurement. `pressureBands` stays — it is honest and
  it costs nothing — but it is not the instrument that explains a day, and this
  entry supersedes the three places I said it was.

- **2026-08-04 — 1.19.0 (CAPABILITY) staged: triage answers WHERE, and makes the
  place.** The answer to what It was said actually ends a working day. Full
  reasoning in [ADR-0073](docs/adr/0073-triage-answers-where.md).
  · **What was missing.** `routeEvents` took no parent: all six routes set a
  clock, put the node on the Menu, or trashed it. So a 1,173-item import could be
  sorted by urgency from end to end and never once be FILED, and the only thing
  the app could say afterwards was `Sent to Next action` — a category, not
  somewhere a person can go and look. Parenting existed, in the detail sheet, one
  opened sheet per item, which is the climb law 4 forbids.
  · **What it does now.** A seventh route, `filed`, additive to the closed
  vocabulary (law 9). **Put it somewhere** offers every existing place plus a
  field to name one that does not exist — typing a name creates the place and
  files the item in ONE commit, from triage, without climbing.
  · **Law 1 holds without special pleading.** A new place has no clock, so it is
  newly silent and the gate CURES it in the same transaction; the item is then
  covered by clause (d). That is the honest arrangement rather than a loophole:
  **the place comes back and its contents come back with it**, which is what
  makes a filed thing findable instead of merely gone.
  · **The clock detail that would have made the whole feature useless.** Filing
  first cleared `demandClocksOf` — and the gate's capture cure sets a **`review`**
  clock, which that helper deliberately excludes. A filed item would have kept its
  own same-day return on top of the place's: filed, and still pestering you
  tomorrow. Caught by a test, fixed with `clocksOf`. Filing says where; the
  place's clock says when.
  · **Undo was a lie and is not now.** `undoRouteEvents` had a `default` branch
  emitting only `clarify.reopened`, so a filed item would have returned to the
  inbox **still sitting in the place it was just taken out of**. It unparents.
  · **Proved by planting:** removing the unparent, and removing the clock clear,
  each turn exactly one test red and only that one.
  · **The new surface joined the a11y gate in the same commit** (hub LESSONS §28)
  — and that gate immediately failed the new text field at **185x21** against the
  44px floor. The rule working, on the run that built it.
  · **Still owed:** nothing yet shows a place's CONTENTS on the runway when its
  review comes round. Filing puts things somewhere and the place returns; what it
  returns *with* is the next question, and one to ask the owner after use
  rather than to guess at.

- **2026-08-04 — 1.18.4 (ITERATION) staged: the label-in-name gate, and the five
  defects it found on its first run.** Hub LESSONS §29 has been the rule since
  2026-08-03 and was **prose in this repo** — the exact thing §29 itself is about.
  `auditNames` in `tools/a11y.mjs` now runs on every state in both themes.
  · **The ⓘ button was the §29 case exactly**, live in production:
  `aria-label="About Quietkeep, storage, and what's new"` on a button showing the
  letter `i`. A substring 2.5.3 check passes that because "about" contains an i —
  for a reason with nothing to do with the criterion, since nobody can *say* "i".
  Fixed with the markup icons already use: `aria-hidden` glyph, name in a
  `.visually-hidden` sentence, so there is no visible text for 2.5.3 to be about.
  · **"Work on this" answered only to the item's title** — the button showed
  *Work on this* and announced *"Work on a held thought"*. Labels now LEAD with
  the visible words and keep the title after a dash: 2.5.3 satisfied, §4's
  disambiguation kept. Same shape on *Split it back out* and *Take them off*.
  · **Both ways out of the ⓘ panel answered to "Close"**, plus three `Set`, two
  `Link`, two `Done` and two `Copy it`. All given distinct names.
  · **The duplicate half is REPORTED, not gated, on purpose.** Most collisions it
  finds are two of the owner's OWN items sharing a title. The app cannot make a
  person's titles unique and the store held actions in the low thousands, so gating
  it would go red on real content rather than on a defect — **a check that fails on the user's
  content is not measuring the app.** Four content-derived collisions remain
  visible as notes; every app-authored one was fixed.
  · **Two instrument bugs found before the gate was believed** (§33, §37): a
  `<select>`'s option list was being read as "the words on the control", and
  `textContent` ran a card's title into its status as "a held thoughtnot sorted
  yet". Both fixed first, so the 272 failures on the first run became 5 real
  defects and a lot of noise I had authored.

- **2026-08-04 — 1.18.3 (ITERATION) staged: the number that could explain a day
  ending.** The first real usage data arrived today and the report could not
  answer the only question that matters. It said `Clocks in use: review 1275` —
  which counts clocks that EXIST, not clocks that are ASKING. A day that ends
  early is a day whose surface opened with more on it than a person can face,
  and nothing in this app could say what that surface showed.
  · **`pressureBands` now reports what has come round again**, using the existing
  primitive rather than inventing anything: `isReadyAgain` for the count and
  `pressureWords` for the five bands the UI already speaks — *settled, coming
  round, ready again, been a while, been a good while*. **No new vocabulary, no
  cliff, and no "overdue"**, which is banned in schema, variable names and copy
  alike because for this audience that word is a shame surface and shame
  produces the avoidance that made the thing late (ADR-0010).
  · **Two things that are easy to get wrong, both pinned by tests and both
  proved by planting.** An item NEVER DONE is *ready again*, not the loudest
  band — `pressureOf` returns 0 for `lastDone == null` deliberately, and a store
  of fresh upkeeps reporting as a wall of "been a good while" would be exactly
  the shame surface the primitive exists to refuse. And an item with **no
  cadence is counted apart**, never folded into *settled*: "the source gave me
  null" is not "this is fine" (LESSONS §23), and folding them would understate
  how much is asking by however many there are.
  · The privacy property is untouched and still load-bearing: the new section
  emits only counts and the app's own fixed phrases, so the two-stores-different-
  words identical-output test covers it by construction.

- **2026-08-04 — `main` is at `1.18.2` (`db5552a`), promoted on the owner's word to promote
  to main.** Production no longer greets a first-time visitor with *"a newer
  version is ready"*. Promoted onto **Spine 256**, watched green on that exact
  commit with all **26** steps read individually (V-10) — including the new *"A
  real second worker waits for the reader"*. Then **Deploy 253**, whose
  Cloudflare steps RAN rather than skipping (six seconds each), its log reading
  `Deployed to PRODUCTION: https://quietkeep.pages.dev`. Pushed with
  `git push origin staging:main` (§7c); receipt `3dc1b2c..db5552a`, confirmed by
  `git ls-remote`.
  · **Carried in the same promote:** the §7h.3 fix, the real-second-worker walk
  now wired into the spine, the corrected panel measurements, the as-opened
  phone assertion, and `.doctrine-sync` adopted at hub `d593e21`.
  · **A number worth keeping, on how much of this discipline is mechanical.**
  The hub's LESSONS classify their own enforcement, so it can be counted: **14
  GATE (28%), 32 CHECKLIST (64%), 4 JUDGEMENT (8%)**. Two thirds is still a
  session remembering, which is what fails late in a long session — and today
  proved it both ways. The §7h.3 defect and the lesson-number collisions were
  caught by gates; the diagnostic goose chase, the backup nagging and an
  over-strict reading of the staging rule were caught by **The owner**, and all three
  were CHECKLIST or JUDGEMENT class. Doctrine §14 says the owner is never the test
  bench; today the owner was, three times. **The lever is converting CHECKLIST into
  GATE**, and that ratio is the measure of it.

- **2026-08-04 — 1.18.2 (ITERATION) staged: the real second worker, and the
  defect it found.** §7h says to prove the promotion path with a REAL second
  worker rather than a mocked registration, "because a mock proves the mock
  works". 1.18.1 shipped with that recorded as owed.
  [`tools/update-walk.mjs`](tools/update-walk.mjs) now does it: it serves a
  genuinely different `sw.js` from the walk's own server and lets Chromium's own
  update machinery run, asserting that the new worker waits and STOPS there,
  that it does not take over on its own, that the reader is told in words, and
  that their press is what promotes it to a page running the new build.
  · **It failed on its first run, and the failure was real and in production.** A
  brand-new visitor was told *"a newer version is ready"* thirty seconds into
  their first-ever visit — §7h.3, violated, shipped in 1.18.1.
  · **Why everything we had missed it, which is the lesson.** §7h.3's gate lives
  at the top of `updateIsReady` and `test/update.test.ts` asserts it there —
  correctly, and it passed throughout. But `controllerchange` never calls
  `updateIsReady`. `clients.claim()` in the worker's `activate` hands a
  first-ever visitor its first controller and fires `controllerchange` like any
  other swap, and the handler called `show()`. **The gate was not on the path
  that needed it**, and a unit test on a decision function cannot see the code
  path that never asks the decision function.
  · **One of the two failures was the instrument, and they are told apart.** The
  walk first waited with a `waitForFunction` whose predicate returned a Promise —
  always truthy on the first poll, so it returned immediately and asserted before
  the worker had installed. It read as a product failure and was a harness one;
  a swallowed `.catch` hid the difference (LESSONS §24, §32).
  · **Both proved by planting:** putting `skipWaiting()` back into `install`
  fails claims 1 and 2 — the original defect caught end-to-end rather than by
  reading source — and reverting the newcomer fix fails claim 5. Wired into the
  spine as *"A real second worker waits for the reader"*, so it is a gate and not
  a thing somebody ran once.

- **2026-08-04 — `main` is at `1.18.1` (`859a0c1`), promoted on the owner's word to promote
  to main and continue".** Production now lets the reader decide when the app
  changes. Promoted onto **Spine 251**, watched green on that exact commit with
  all 25 steps read individually (V-10) — typecheck, tests, the headless walk,
  rendered accessibility, two editions, no-localStorage. Then **Deploy 248**,
  whose Cloudflare steps RAN rather than skipping: six seconds each, which is
  what tells a real upload from a gracefully-skipped one that also exits 0. Its
  log says, in its own words: `Deployed to PRODUCTION: https://quietkeep.pages.dev`.
  Sync went out in the same run. Pushed with `git push origin staging:main`
  (§7c); receipt `daef1b3..859a0c1`, confirmed by `git ls-remote`.
  · **What production gained:** the §7h fix — a new version waits and says so,
  and nothing installs until the reader presses **Install it now**; the §7h.3
  newcomer gate; the diagnostic's cache/controller/waiting state and its
  **address**; and `Stores seen in the log` in place of `Devices`.
  · **The 1.18.0 → 1.18.1 hop still lands without asking**, because 1.18.0's code
  is what does the landing and could not be patched from here. Every update after
  this one asks. Said in the patch notes rather than left to be discovered.
  · **Still owed and unchanged by this promote:** the promotion path has never
  been driven end-to-end with a real second worker (§7h asks for exactly that);
  the ⓘ panel's budget is measured at 1280px where it reads 8,782px and is
  11,661px at 390px on an iPad-first project; and `#group-extras` is 5,695px of
  accumulated prose, which is the surface §4 wants folded.

- **2026-08-04 — 1.18.1 (ITERATION) staged: an update waits for the reader.**
  Doctrine §7h.1, and the last of the four §7h failures the hub gate found. Two
  of those four were the gate's fault and were fixed in the hub; this is the real
  one, and it had been in this repo since the first release.
  · **What was wrong, precisely.** `public/sw.js` called `skipWaiting()` inside
  `install`, under the comment *"Take over promptly: a half-updated shell is
  worse than a brief wait."* That is backwards. Taking over promptly does not
  replace the open page — that page keeps running the PREVIOUS release's markup
  and modules, while `activate` deletes the old cache, so every request it makes
  afterwards is served the NEW file. Old markup, new modules, nothing said. The
  comment described the exact state its own line was creating.
  · **Why it was not a one-line fix.** `src/ui/update.ts` was written *around*
  `skipWaiting()` and said so in its header: the prompt "is never 'apply the
  update'", and the button read `Reload now` for that reason. Honest words about
  a wrong model. The worker now waits, the page posts `SKIP_WAITING` on the
  reader's press and reloads only once the swap has HAPPENED — reloading first
  re-enters the same old worker and shows the line again, which is the loop a
  plain `location.reload()` produces once waiting works. Full reasoning in
  [ADR-0072](docs/adr/0072-an-update-waits-for-the-reader.md).
  · **Also fixed here, both found by reading the code rather than by the gate:**
  §7h.3's newcomer gate sat BELOW the `waiting` check, so a first visit that
  raced a worker into `installed` was told its brand-new install was an update;
  and the diagnostic now carries §7h.4's state — every cache rather than the
  first, whether a worker controls the page, whether one waits — plus the
  **address** it came from, which is what cost V-15 a round trip.
  · **`Devices seen in the log` is now `Stores seen in the log`**, after the owner
  read three ids as including the OmniFocus import. It counts one per store, and
  a store is per-origin — the same iPad has one per edition and a fresh one after
  a clear.
  · **Verified by planting, not by going green.** Putting `skipWaiting()` back
  into `install`, deleting the `message` handler, and leaving the cache name at
  the old release each turn exactly one test red and only that one. 957 tests
  pass, typecheck clean, a11y green in both themes, and the hub's `pwa-check`
  now passes all six checks with zero failures.
  · **Honestly not done:** the promotion path is asserted against the worker's
  SOURCE and the decision function's logic, never driven end-to-end with a real
  second worker, which is what §7h actually asks for. fauxplane's
  `checkUpdateStrip` is the thing to copy.
  · **And a constraint worth knowing before writing another changelog:** the ⓘ
  panel's 9,000px budget is now binding two releases running. 1.18.0 sat at
  8,813; this release's first draft reached **8,985 — fifteen pixels of
  headroom** — and the notes were shortened for the second release in a row.
  · **CORRECTED 2026-08-04 — that alarm was overstated, twice over.** Measuring
  it properly is what showed it, and the wrong version was acted on twice, so it
  is corrected here rather than tidied away.
  · **The panel a reader actually meets is fine.** It opens with every group
  FOLDED and the gate expands them all before measuring. As opened it is
  **1,796px — 1.5 screens on an iPad**, 2,321px (2.8 screens) at 390px. The
  8,551px figure needs a reader to open every group by hand. Those two states
  were being conflated.
  · **And the gate is NOT measuring the friendliest viewport.** The content
  column caps at **600px**, so every width from 600 to 1280 measures identically
  — **the iPad included, in both orientations**. For the reference platform the
  gate's number is exact. What is real is narrower: phones below 600px, where
  the fully-expanded panel reflows to 9,706px at 480px and 12,288px at 360px.
  · **So the notes did not need shortening twice, and the panel is not one
  release from breaking.** What was genuinely owed was one assertion of the
  AS-OPENED panel at a phone width, which the walk now carries. `#group-extras`
  is still the largest block at 5,695px expanded, and folding it further is a
  design question rather than an urgent defect. Numbers in
  [ADR-0072](docs/adr/0072-an-update-waits-for-the-reader.md).

- **2026-08-04 — THE FIRST REAL USAGE DATA THIS REPO HAS EVER HELD.** A §7f
  diagnostic arrived from a real production instance at real scale: the **sync
  edition, 1.18.0**, installed to the home screen, storage persisted, and
  paired across devices — not a test tab. The correction of 2026-08-03 said
  the dogfood gate has always been running and this repo held none of the data
  about what ends a day. It holds some now, and it is worth reading carefully
  before anyone builds anything.
  · **The first reading of this was WRONG, and it was corrected.** An early
  reading framed the counts as a USAGE pattern — actions accumulating, few let
  go. They are not that. **The store is overwhelmingly an OmniFocus import**,
  which arrived in one motion, so a let-go count measured against an import
  says nothing about habits — it describes a wall that was imported, not built
  inside this app, and reading it as accumulation invents a behaviour from an
  import artifact.
  · **What can still be said, with the import accounted for.** Two node kinds
  out of fourteen are in use, and nothing is on the Menu or in the Not Now
  ledger — so neither surface is carrying any load, which is a fact about the
  app's shape rather than about anyone. The import is a legitimate stress test
  at real scale (it is why it was built) and it means **this store is a scale
  fixture as much as a diary**. Any future reading of these counts must say
  which it is treating them as.
  · **The number that would explain a day ending is NOT in this report, and
  that is the finding to act on.** The diagnostic's `Clocks in use: review`
  line counts clocks that EXIST, not clocks that are DUE. A day that ends
  early is a day whose surface opened with more on it than a person can face,
  and this report cannot say what that surface showed. **The diagnostic should
  carry what is due today, and how far the oldest due item has run** — §7f's
  own rule is that when a session cannot see something, the check goes where
  the device can run it. That is the single highest-value addition to the
  diagnostic and it outranks the cosmetic gaps logged with it.
  · **This report does NOT close [V-15](docs/verifications.md)'s production
  half**, and the reason is the gap logged an hour earlier: **it does not name
  its origin.** Its cache reads `quietkeep-sync-1.18.0`, and since the promote
  BOTH `quietkeep-sync.pages.dev` and `staging.quietkeep-sync.pages.dev` serve
  1.18.0, so the string cannot say which. The missing `location.origin` line cost
  the exact verification it was logged for, one hour after being logged.

- **2026-08-04 — `main` is at `1.18.0` (`1dd696a`), promoted on the owner's word to promote
  and continue".** The CAPABILITY release: **the diagnostic report**. Pressing
  the build number at the bottom of the screen opens the whole app state as
  selectable text, with copy and share — so a fault is reported by pasting what
  the app knows rather than by photographing a screen (Doctrine §7f).
  · **Evidence, and what each piece does and does not prove.** Promoted onto
  **Spine 238**, watched green on `1dd696a` with all 22 steps opened and read
  individually rather than inferred from the run's conclusion (V-10) — typecheck,
  tests, the headless walk, rendered accessibility, network posture, two
  editions, banned vocabulary, the closed event list, the write-gate bypass
  check, and no-localStorage. Then **Deploy 235**, whose Cloudflare steps RAN
  rather than skipping — six seconds each, which is what distinguishes a real
  upload from a gracefully-skipped one that also exits 0. Its log says, in its
  own words: `Deployed to PRODUCTION: https://quietkeep.pages.dev`. The Sync
  edition went out in the same run, to `https://5343d35f.quietkeep-sync.pages.dev`.
  · **Promoted with `git push origin staging:main`** — Doctrine §7c, which
  promotes without a checkout and so cannot strand commits on the wrong branch.
  Receipt read: `a281597..1dd696a`. Confirmed by `git ls-remote`, not by the push
  output.
  · **What this release changes beyond the feature.** Production carries an
  instrument for the first time, which unblocks [V-15](docs/verifications.md)'s
  production half — open since 0.9.0, and blocked every time on the fact that no
  released build could answer it. One diagnostic from `quietkeep.pages.dev` now
  closes it, and every promote after this one is confirmable the same way.
  · **Carried in the same promote:** the SC 2.5.3 fix to the build stamp's spoken
  name, the verb-agreement fix, and the docs work of 2026-08-03 — the V-15
  narrowing, the dogfood-gate correction, and the §2 paste-block rule.
  · **Still owed, and now the top of the list:** the §7h `skipWaiting()` defect.
  Production is an offline-first app that does not let its reader decide when to
  take an update, so this promote reaches devices by taking over under whatever
  page is open. That is the next thing to fix.

- **2026-08-03 (the owner, correcting the record)** — **THE DOGFOOD GATE HAS ALWAYS
  BEEN RUNNING.** The correction: the gate has always been running, and the app
  not yet carrying a whole day is exactly what it is reporting. The resets are
  the measurement.
  · Sessions have written *"the gate has never started"* into the assessment, the
  plan, an ADR and a handoff prompt. **It is the single most consequential thing
  this repo has got wrong**, because it converted a daily failing measurement
  into an item waiting on the owner. It was never waiting on the owner.
  · **The reasoning error, kept because it will recur:** the repo counts no
  completed day, and a session read that as *the gate has not begun* rather than
  *the gate runs and the app keeps losing*. Hub LESSONS §23 is exactly this — "the
  source gave me null" is not "this is unknowable" — and its checklist item
  `null-is-not-unknowable` was already written, already printed before handoffs,
  and still missed, because it was filed as a rule about DATA and this was a
  process. **An absent record of success is not an absent attempt.**
  · **What it changes.** There is no "start the gate" work and never was. The
  work is finding out what ends a day, on the day it ends — and this repo holds
  **none of that data**, because sessions asked for promotes and on-device passes
  instead of asking what stopped the day. Every reset is a defect report nobody wrote
  down.
  · The definition at the top of this file now carries the correction, and so
  does ADR-0071. The 0.17.0 entry that first said it is annotated in place rather
  than rewritten.

- **2026-08-03 (the next session, tasked with confirming `*.pages.dev` and
  closing V-15)** — **V-15 does not close, and the reason is now narrowed
  rather than merely repeated.** A fresh container was the previous session's
  proposed test and it has now been run: this one booted at `19:42:51Z` and the
  first denial landed at `19:43:30.676Z`, thirty-nine seconds later. **The
  "policy binds at container start" theory is therefore falsified as a
  sufficient explanation** — a brand-new session does not pick the grant up
  either, so the grant is not reaching sessions at all. Five hosts were each
  probed exactly once and all five refused `403 to CONNECT`: both Quietkeep
  hosts, both Sync hosts, and **`noahjefferson.pages.dev`** — the hub's own
  site, which rules out anything Quietkeep-specific. Meanwhile `api.github.com`
  200, `registry.npmjs.org` 200, `raw.githubusercontent.com` 301,
  `github.com` 400: the proxy is healthy and the network is not the problem
  (Doctrine §15b requires that be measured per host, not asserted). Probing the
  other four after the first refusal is §15b item 3 and it earned its keep —
  reporting off the single denial would have missed that the hub is blocked too.
  · **The route to closing V-15 has changed, and this is the durable part.**
  Doctrine §7f says that when a session cannot verify something, the check goes
  into the diagnostic and *the device* runs it. The device can reach
  `quietkeep.pages.dev`; no session can. So the close is a probe behind the
  version stamp that fetches `/sw.js`, reads its `CACHE` constant, and prints it
  beside the compiled-in triplet — one press, pasted back as text, and better
  evidence than the fetch this session wanted. Not built here: 1.18.0 is
  awaiting the owner's pass and adding to `staging` would change what the owner is testing.
  · **A real defect found on the way — TWO of it, not the four first reported.**
  The hub gained `pwa-check.mjs` and Doctrine §7h *after* this repo last looked,
  so Quietkeep had never been measured against them. The gate reported four
  failures and **two of them were the gate's fault**, corrected in the hub the
  same day (`0eab669` and the commits around it). What is REAL, and stands:
  `public/sw.js` calls `skipWaiting()` inside its `install` listener
  (`public/sw.js:26`) and there is **no `message` listener**, so a new worker
  takes over under the open page — old markup, new modules, exactly the
  mixed-app failure Intersecting Parallels shipped for twenty-two releases.
  **Still true on `staging` at 1.18.0.** The odd part is that the *telling* is
  already built and good — `mountUpdatePrompt` and `UPDATE_WORDS` in
  `src/ui/update.ts` — so this app says "A newer version is ready" while the
  worker has already stopped waiting. The words are right and the mechanism
  underneath them is not.
  · **What was NOT wrong, so nobody re-reports it:** the app does say the words
  where a reader can see them, and the diagnostic DOES read the cache store, via
  `globalThis.caches?.keys()` at `src/ui/about.ts:1647`. The gate missed the
  second because optional chaining is not a literal `caches.keys()` — and the owner's
  own diagnostic report is what disproved it, by printing a real cache name the
  gate had just said nothing could read. §6: when a result looks absurd, suspect
  the instrument.
  · The cache names are correct — `quietkeep-1.17.4` on `main`,
  `quietkeep-1.18.0` on `staging`. Re-run with
  `node ../noahjefferson/pwa-check.mjs --repo .`
  · **`.doctrine-sync` — I first reported it absent, and that was a misreading.**
  The marker exists and was added in `9644761`, pointing at hub `972f966`; I ran
  the gate against the harness `claude/*` branch, which is a copy of `main`, and
  the marker lives on `staging`. Reading the right tree makes the gate useful
  instead of blank: the hub has moved to `3713da6` and the drift is **DOCTRINE §2,
  §7f and §7h, LESSONS 30–35, and `handoff-check.mjs`**. That is the list this
  repo is actually behind on, and it is why §7h went unmeasured here.
  · **Still deliberately NOT adopted.** Adopting asserts the drift was read and
  what this repo owes is known. §2, §7f and §7h were read in full this session
  and LESSONS 34 and 35 with them; **30 and 33 were not**, and the §7h debt is
  open rather than closed. Moving the marker now would assert a reconciliation
  that has not happened. Adopt when the `skipWaiting()` fix lands, not before.

- **2026-08-03 (told pages.dev had been allowed, then to hand off to another
  session)** — **the grant did not reach this session, and that is the finding.**
  Both hosts were refused at the gateway and the proxy logged it:
  `quietkeep.pages.dev:443` and `staging.quietkeep.pages.dev:443`, `403 to
  CONNECT`, 18:35:10Z and 18:35:11Z. The policy is **deny-by-default with an
  allowlist**, measured rather than assumed — `api.github.com` answers 200 from
  here while `example.com` and `cloudflare.com` are refused identically, so this
  is not a Quietkeep-specific block. A session's egress policy looks to be bound
  at container start, so a grant made mid-session cannot reach the session that
  is already running. Not retried in a loop: the agent-proxy README is explicit
  that policy denials are reported. Recorded against [V-15](docs/verifications.md).
  · **Three things were fixed on the way to handing off, all found by gates.**
  · **The hub's `handoff-check.mjs` was false-failing this repo** — it read
  `--project-name=([\w-]+)`, which cannot match `${{ env.PROJECT }}`, and
  `deploy.yml` parameterises the name (correctly). **The false positive was the
  lesser half**: `project` also feeds the §7 staging-URL assertion, so that
  check had NEVER RUN here — and on its first real run it found a genuine
  violation. `NOTES.md` had named the hostname in prose for weeks and never as
  a URL anyone could tap, which is a staged candidate not handed over. The
  **Staged and waiting on the owner** block above is the fix. Gate corrected in the
  hub (`972f966`) and proved by planting.
  · **A live SC 2.5.3 defect in 1.18.0's own new control.** Hub LESSONS §29
  landed today from a sibling and names the class: the build stamp read
  "1.18.0" while announcing itself as "Build — open the diagnostic report", so
  a voice-control user reads the button, says what it says, and nothing matches.
  **This repo's a11y gate has no label-in-name check**, so nothing here caught
  it — that gap is real and is left for the next session. Fixed by setting text
  and name in one place, verified in the rendered DOM rather than by reading
  the edit.
  · `.doctrine-sync` adopted at hub `972f966` after reading LESSONS §28 and
  §29 — an assertion the drift was read, not a formality.

- **2026-08-03** — **1.18.0 (CAPABILITY) "When something is wrong"** — the
  diagnostic report. **Not a planner feature**: `docs/data-constitution.md` had
  promised the reader one since it was written and nothing built it (the 1.9.1
  class, and the worst variety of it — a promise about what happens when
  something goes wrong), and Doctrine §7f now requires one in every app. Every
  outstanding verification here is the owner's, on the iPad; this is what makes them
  reportable without a photograph.
  · **The design is one rule: SHAPE, never CONTENT.** Other apps' diagnostics
  worry about location; this app's promise is that nothing readable leaves the
  device, and the report is the one artefact designed to leave. Counts, kinds,
  clock kinds, versions, storage numbers and states — never a title, a name, a
  note or plaintext. The `reentry.greeted` correction from 1.17.4 as a design
  rule: WHETHER and HOW MANY, never WHICH.
  · **The obvious test was not enough, and the failure taught the right one.** A
  substring sweep red-flagged a node titled *"the numbers"* colliding with the
  report's own sentence "diagnosed from the numbers above" — loud, and proving
  nothing. An empty-store differential over-fires the other way, flagging the
  app's own closed vocabulary. **The property that works: two stores of the same
  shape with entirely different words must produce byte-identical reports.**
  Nothing to allowlist, nothing to keep in step with the prose. Both forms kept
  — the sweep over the real store in the walk, the equality in the unit tests.
  · **No opt-in to include content**, stated rather than half-built: no
  diagnostic question a title would answer, and the export already IS the
  reproduction case (the constitution says so in the same paragraph).
  · **Records no event** — `deliverGeneratedSet`'s reason exactly, and a test
  plus a smoke assertion pin that "Last copy" does not move.
  · **§7e's baseline is a gate now**, because that clause ends "Make it a gate"
  in those words: the ⓘ control's accessible name, patch notes present, and
  *what it is NOT* — which had lived only in the thesis, where a reader of the
  app never goes.
  · **Two gate defects found by building this, both fixed here.** The panel's
  9,000px budget went red at 9,345 (baseline was 8,813 — only 187px of
  headroom), so the 1.18.0 notes were written short and both new paragraphs
  tightened; and the a11y focus-ring walk was **order-dependent** — `blur()`
  does not reset Chromium's sequential-focus starting point, so it resumed from
  the previous audit's focus and had to wrap the whole surface. Four new
  controls pushed two UNRELATED states past the budget, reporting
  "#journal-write is not keyboard-focusable" about a button that plainly is.
  Fixed by focusing the open dialog first, then **verified by planting an
  unreachable control and watching it go red in both themes** — the hub's own
  rule for when you change how a check measures.
  · **A mistake worth recording: `git checkout public/index.html` to remove
  that planted fault discarded every uncommitted change in the file** — the
  whole release's markup. Restored from the edits, sweep re-run clean. Undo a
  planted fault with a saved copy, never with a checkout of a file that holds
  unmerged work.
  · **And the thing the tests could not catch: I generated a real report and
  read it.** The first sentence it ever produced in anger was *"31 things in
  this store IS on no surface"* — the verb not agreeing with the count, on the
  one line in the app whose entire job is to be believed. Thirteen tests
  asserted the finding's content, its kinds, its ordering and its privacy, and
  not one of them read it as English. Fixed, and pinned both ways (singular and
  plural). **A property test proves a shape; only a person reading the output
  catches a sentence that makes the app look like it cannot count.**
  · 953 unit tests, the full walk, a11y both themes, every static gate.
  **Spine 228 green on `8610c1f`** (the release) and **Spine 229 green on
  `b2fd458`** (that plus the grammar fix) — all 22 steps opened and read
  individually, not inferred from the run's conclusion (V-10).
  **Not promoted — this one waits on the owner's on-device pass and the owner's word.**

- **2026-08-03 (promoted on the owner's word)** — **`main`
  fast-forwarded `bf0e2cb → a281597`**, carrying **1.17.4 "The tail"**. Spine
  224 watched green on `4240593` before the promote (`a281597` is that head plus
  one NOTES commit), ancestry verified fast-forward-only immediately before the
  push, the push then verified by READING `origin/main` rather than by reading
  the push output (the 2026-08-02 lesson), and **Deploy 222** green on `main` at
  the exact head afterwards — all 15 steps opened, both editions out.
  · Same limit as every promote here: production itself was not read
  ([V-15](docs/verifications.md)). The evidence is the deploy run's own green
  Cloudflare steps.
  · The "continue" half is **1.18.0 "When something is wrong"** — the diagnostic
  report. Not a planner feature: `docs/data-constitution.md` has promised the
  reader one since it was written and nothing built it, and Doctrine §7f now
  requires one in every app. It is the instrument that makes the six outstanding
  device checks reportable without a photograph.

- **2026-08-03** — **1.17.4 "The tail"** — the seam audit's sixteen unverified
  findings, each VERIFIED against source while being fixed (they had no skeptic
  pass), each code fix pinned by a `seam-t*` test in `test/seam-audit.test.ts`.
  · **Fifteen held; one half-refuted and recorded**: build-plan item 33's
  "annotate shipped" claim — the watermark blocker DID fall in 1.17.0, but the
  per-person delta has no code anywhere, so the item stays open on its merits
  and the refutation is written into the item.
  · **The deepest fix is the decline lifecycle.** `done.marked` used to null
  `n.notNow` in the fold while `done.unmarked` restored only `lastDone` — so
  done-then-undone dropped a standing decline from state for ever. The record
  now survives in state and ONE exported predicate (`standingDecline`,
  `requests.ts`) settles it for every reader — ledger, sheet, calendar
  exclusion, merge carry, merge picker (`canHold` parity was its own finding).
  ADR-0056 corrected in place: mechanism moved, rule unchanged.
  · **Payload declarations moved to reality**, not the other way:
  `reentry.greeted.shown` (booleans and a count, never node ids),
  `bother.routed` (`{route:'inbox'} | {park:true}` — 'inbox' was never even a
  `ClarifyRoute`), `dependency.declared` (both trailing fields optional, the
  meaningless `suspense` timestamp no longer written by anything).
  · **Counts and words**: the import summary counts JOINED notes the way the
  mapper writes them (the old 1.4.0 test asserted the line-count four lines
  above its own proof that one event is written — corrected); `menuCount` is
  the sum of the rendered groups; the purge words name the wide count so the ⓘ
  panel's two "things" numbers explain themselves; `recordDayWords` (time.ts)
  gives the ledger, the anchor line and the journal list the held list's
  far-year rule; "1 days" is gone from the report and the repeat words.
  · **Deleted rather than kept warm**: `firingCount` (its comment claimed a
  call site that did not exist; production asks `lastFiring !== null`).
  Docs drift corrected beside the claims: NOTES' three stale facts (main-at,
  hub wiring — verified against the hub's `index.html` — and the Code line),
  the vocabulary's `delta.recorded` watermark clause, anchors.ts's RRULE
  comment, build-plan items 33/34.
  · Deliberate-failure proofs watched red: reverting the fold fix reds
  `seam-t7` by name; reverting `menuCount` reds `seam-t3`. 940 unit tests
  green.
  · **The sweep found a latent flake in the walk, and it was the walk's own
  documented failure mode.** The 1.17.2 membership section filled
  `#search-input` with a bare `tpage.fill` immediately after `#about-close` —
  and `fillSearch`, the helper twenty lines up, exists precisely because
  "filling while a modal dialog is open (or still closing) resolves without
  the value landing". The box kept the previous query, the anchor never
  appeared, and the walk timed out on a row that was never going to be there.
  It passed in Spine 217–222 by timing luck. Instrumented rather than guessed
  at (the input's value was dumped on failure and read "fielding review"),
  then fixed by using the helper at both sites; three consecutive green runs
  afterwards. **A check that depends on luck is not a check** — and a helper
  written for a known race is worth nothing at the one call site that skips
  it. Appended to the hub's LESSONS.
  · **Spine 224 green on the exact head** (`4240593`) — all 22 steps opened
  and read individually, not inferred from the run's conclusion (V-10).
  **Not promoted without the owner's word.**

- **2026-08-03 (promoted on the owner's word)** — **`main` fast-forwarded
  `b797083 → bf0e2cb`**, carrying 1.17.2 "Membership" and 1.17.3 "What the seam
  audit found" to production. Fast-forward ancestry verified first; **Deploy 218
  green on that exact head**. Spine 220 had been watched green on `29a7063`;
  `bf0e2cb` is that head plus one docs-only NOTES commit. The "continue" half is
  1.17.4 — the seam audit's sixteen unverified tail findings, each to be
  verified against source while fixing (they had no skeptic pass; any that does
  not hold is recorded as refuted, not silently dropped).

- **2026-08-03** — **1.17.3, second commit: Spine 219 went RED and it was right
  twice.** The headless walk's panel-height gate failed on the 1.17.3 patch
  notes (9,273px against a 9,000px budget — ten long notes), and my local smoke
  had passed because I ran it BEFORE writing the changelog entry. That is
  **V-10, literally**: a gate run against a tree that is not the tree you ship
  is a gate you have not run. Notes trimmed to five, sweep re-run in the right
  order, and the walk's own words stand: the panel is for reading, not for a
  scroll of history.
  · **Spine 220 green on the exact head** (`29a7063`). Not promoted.

- **2026-08-03** — **1.17.3 "What the seam audit found"** — every verified
  finding fixed, each pinned by a named test.
  · **The audit's shape:** six adversarial finder lenses over the seams
  (membership, count agreement, record-vs-code drift, words honesty, write-path,
  lifecycle), 31 raw findings, the top 14 each attacked by a skeptic told to
  refute it. **None were refuted.** Twenty agents, ~2M tokens, every claim
  traced to file:line on both sides.
  · **The worst one was in the write path:** the `pebble.settled` fold case was
  the fold's ONE bypass of copy-on-write — `s.nodes.get` plus direct mutation —
  so a REJECTED batch containing a settle left the settle applied to live
  state, the class the 1.3.1 audit filed as severe. And nulling the weight
  stranded "Keep it after all": a kept pebble existed on NO surface. The case is
  now a no-op — the trash beside it does the removing, the raise's data
  survives, and untrash puts the weight back.
  · **A worry was offered as work.** `nextup`'s private NOT_ACTIONABLE (a
  byte-identical copy of the set `kinds.ts` was created to be the single home
  of, never imported) omitted `bother`, and `isAppClock` exempted only
  `gate:node.created` — so the bother cure read as an arrived demand, a fresh
  worry got a Done button before "whose is this?" was asked, and a DECLINED one
  sat under "Ready now" for ever. Fixed at the root: `bother` into the one
  shared set, `gate:bother.received` into `isAppClock` by that predicate's own
  doctrine (a cure inherits the intent of the event it cured; a worry entering
  has none about when). Heals old logs with no new events.
  · **The calendar carried the nag ADR-0056 removed:** a decline's park exported
  as an all-day event with a 9 am alarm. `exportsToCalendar` — one predicate for
  the file AND the count — now excludes bothers and standing declines.
  · **The paper contradicted the screen:** `todayCard`'s docstring promised "the
  SAME projections the screen uses" while calling raw `nextUp`; the screen
  subtracts chips and replan items (law 3). It reads `workSurface` now.
  · **The report disclosed private things:** journal entries as "New —
  (untitled)", pebbles/people/anchors as new work, in the one document that
  leaves the device. The four not-work kinds never enter `deltaBetween` now.
  · **The merge picker offered journal entries and anchors as survivors** — a
  titleless journal sorted FIRST as "(untitled)" — and an accepted fold hid real
  work from every surface with the gauge still zero (law 1 rides the chain to a
  demand-free survivor). The person/pebble clauses now cover both kinds, both
  directions. Also: trash is no longer offered on a merge survivor (sheet hides
  it, bulk skips-and-counts — the gate refused it after the preview promised
  it); a decline is no longer offered on demand-free kinds; and `mergePlan` no
  longer drops a source's OPEN wait when the survivor's wait had already CLOSED
  (`waiting.closed` sets the outcome without clearing `waitingOn`, and the old
  test was bare `!target.waitingOn`).
  · **The import panel denied its own default button:** "Nothing is merged —
  this is a replacement", said unconditionally, while focus landed on the
  ADDITIVE "Take in what I don't have". Both doors are now named truthfully,
  here and in the big-sample caveat.
  · **Two 1.15.0 tests had pinned the defective semantics** (settle nulls the
  weight) and were rewritten to the corrected design with the reason recorded.
  The membership table's own bother-in-next-up sentence was DISPROVED by the
  audit's verifier — the mechanism it described cannot occur — and the row now
  says so.
  · **Seventeen further findings are recorded and queued** (the un-verified
  tail: count seams like menuCount vs menuGroups and the ⓘ panel's two "held"
  numbers; payload-shape drift on `reentry.greeted` and `bother.routed`; stale
  records — build-plan 33/34, two NOTES facts, a vocabulary note; far-date
  years on three surfaces; "1 days" plurals; done-then-undone dropping a
  standing decline). None loses data. Next batch.

- **2026-08-03 (told everything found had pointed to an unfinished product,
  then to continue on the same footing)** — **1.17.2 "Membership"**, and a
  change of direction: **no new features. The seams, gated.**
  · **The owner is right, and the defect record says where the unfinishedness lives.**
  Three of the last four shipped defects were one defect in different clothes: a
  kind on a surface it does not belong on (journal entries in the coverage list,
  1.15.1; people in the todo list, 1.17.0; and this release's — the detail sheet
  offering date/start/repeat on every demand-free kind, refused by the gate
  after the tap). Each was found by READING, none by an instrument. The finds
  were luck; the misses are still out there.
  · **The fourth instance, fixed:** `temporal` was `!n.onMenu`, and the comment
  beside it stated the correct rule while the code broke it. Now
  `!n.onMenu && !DEMAND_FREE_KINDS.includes(n.kind)`. Reachable before the fix:
  search returns people and anchors and a result row opens the sheet; the todo
  list holds an off-Menu aspiration. `choosable` also gains `journal` and
  `anchor` — "Put it in today" was offered on a named period one search away.
  `resume-card` stays choosable with the reason written.
  · **The class, gated:** `test/membership.test.ts` — one declared table, kind ×
  surface for all sixteen list surfaces, a written reason per surface, computed
  over the 1.16.0 set-of-everything, checked both ways (actual ⊆ allowed AND
  expected-present, so no row can go vacuous — LESSONS 7g), plus totality over
  `NODE_KINDS` and an offered-then-refused check closed at both ends for dates.
  The `MERGE_DISPOSITION` idiom, fourth instance: a class closed, not an
  instance patched.
  · **Deliberate-failure proofs, all watched red:** reverting the 1.17.0 person
  exclusion reds the table naming both surfaces; reverting `choosable` reds the
  today test naming `anchor`; reverting the `temporal` fix reds exactly the four
  new smoke assertions that drive the real DOM (search → anchor sheet → groups
  hidden; same via a person).
  · **A seam audit is running in parallel** — six adversarial finder lenses
  (membership beyond the sheet, count agreement, record-vs-code drift, words
  honesty, write-path seams, lifecycle seams), findings then adversarially
  verified by skeptics told to refute. Confirmed findings get fixed with tests,
  not listed. ADR-0070.
  · **Spine 217 green on the exact head** (`6f2f81f`). Not promoted.

- **2026-08-03 (promoted on the owner's word)** — **`main` fast-forwarded
  `8ece530 → b797083`**, carrying **1.17.1** (what it costs to look). Spine 213
  watched green on the exact head before the promote, and **Deploy 211** green on
  `main` at the same sha after it, both editions out.
  · Same limit as every promote here: production itself was not read
  ([V-15](docs/verifications.md)). The evidence is the deploy run's own green
  Cloudflare steps.
  · **Everything built this session is now on production** — 1.14.2 through
  1.17.1. What is outstanding is entirely the owner's: the on-device pass, and the
  five physical checks (V-20, V-14, V-16/V-17, V-00 step 2, item 42).

- **2026-08-03 (promoted on the owner's word)** — **1.17.1 "What it costs to
  look"** — the read path measured, fixed and gated.
  · **The estimate had sat in the roadmap for months and nobody could check it**:
  "~18–20 full-state projection passes per commit (~220 ms today, 1.56 s at
  10k)", with the work deferred to item 42's on-device measurement. Correctly —
  this repo does not optimise against a guess. **1.16.0 built the instrument**,
  and timing it made the estimate a fact: **one refresh cost ~100 ms at 566
  things**, and the cost was not spread evenly — nine projections cost 4–16 ms
  each and the other eight under 0.3 ms. Every expensive one walks nodes asking
  for calendar distances.
  · **`Intl` formatter CONSTRUCTION was already cached; the formatting was not.**
  `formatToParts` is the expensive half. `calendarDaysBetween` resolves two
  instants per call, called once per node per clock per projection — and the
  `nowIso` side is **the same instant every time**, resolved from scratch on
  every one of thousands of calls.
  · **A memo on `localParts`: ~100 ms → ~22 ms**, A/B, three runs each. Four
  times, from caching one pure function. It inherits the `FORMATTERS` precedent
  directly above it rather than inventing a pattern.
  · The cached object is **frozen** — a memo hands one object to every caller,
  and the three-place rule in `fold.ts` exists because this repo has already paid
  for aliasing once. The key is **(zone, instant)**, pinned by a test: keyed on
  the instant alone it would hand a traveller the wrong day, which is worse than
  being slow.
  · **Two gates, failing for different reasons.** A structural one that cannot
  flake (identity — the same instant resolves to the same object), which is what
  the deliberate-failure proof reds; and a loose 250 ms wall-clock one in the
  spirit of the admit gate's 800 ms around a 55 ms operation. Plus the check that
  matters most: the same store answers the same after any number of refreshes.
  · **A correction made in the commit that found it.** The memo's first draft
  carried a NaN guard for malformed instants with a confident paragraph beside
  it. `formatToParts` **throws** on an invalid date — the branch was unreachable
  and the paragraph described behaviour the platform does not have. Replaced by
  the truth and a test pinning it.
  · **Item 42 is NOT closed.** The measurement that counts is still the iPad;
  this hardware is not that device. What changed is that the read path has a gate
  at all. ADR-0069.
  · **Spine 213 green on the exact head** (`616f51c`). Not promoted.

- **2026-08-03 (promoted on the owner's word)** — **`main` fast-forwarded
  `a796199 → 8ece530`**, carrying **1.17.0** (the staff call — anchors, and v1.5
  closed). Spine 210 watched green on the exact head before the promote, and
  **Deploy 208** green on `main` at the same sha after it, both editions out.
  · Same limit as every promote here: production itself was not read
  ([V-15](docs/verifications.md)). The evidence is the deploy run's own green
  Cloudflare steps.

- **2026-08-03 (promoted on the owner's word)** — **`main` fast-forwarded
  `59644a4 → a796199`**, carrying **1.16.0** (a set with everything in it). Spine
  206 watched green on the exact head before the promote — 22 steps, including
  `sample:check` on its first CI run — and **Deploy 204** green on `main` at the
  same sha after it, both editions out.
  · Same limit as every promote here: production itself was not read
  ([V-15](docs/verifications.md)). The evidence is the deploy run's own green
  Cloudflare steps.

- **2026-08-03 (promoted on the owner's word)** — **1.17.0 "The staff
  call"** — anchors, and **v1.5 closes**.
  · **ADR-0057 named three blockers and two were already answered in the code.**
  The silent-node one had its price written in the same paragraph
  (`DEMAND_FREE_KINDS`' own comment: a gate change plus a shipped surface, in one
  release) — that is what `person` paid in 0.15.0 and `journal` in 1.13.0, and it
  is paid here. The watermark one needed no new mechanism at all:
  `reportedBefore` already takes `{at, upToSeqByDevice}` and prefers the mark,
  `status.report.exported` already carries one, the fold already reads it. The
  blocker was that `anchor.fired` did not carry the field, not that the field had
  to be invented. **One mechanism, two writers.**
  · The test that matters stages the audit's own case on the anchor path: a
  second device delivers work stamped *before* the meeting that this device never
  saw. The watermark reports it; the time-only cut buries it. **Both directions
  asserted**, so the degraded mode is demonstrated rather than described.
  · **A person node has been a row in the todo list since the beginning.** Every
  person the owner had ever named sat among the work items with nothing to do about it. It
  predates `heldWork` (1.15.1), which is why nothing caught it — 1.13.0 and
  1.15.0 each added a kind to a hand-written list and neither revisited what was
  already in there. `person` and `anchor` both join the skip list: **one edit,
  four surfaces**, which is exactly what 1.15.1 was for.
  · **`status.report.exported` never declared `upToSeqByDevice`** — written by
  the UI and read by the fold for four releases, with the delta cut's correctness
  depending on it. A type lying by omission, found while giving `anchor.fired`
  the same field.
  · **The 1.16.0 coverage gate's node exemptions are now empty**, and nobody had
  to remember to delete the entry: a kind the set produces fails its own
  exemption. The mechanism working as designed, one release later.
  · **A test was rewritten for the third time, same reason each time.** "A held
  item with no clock at all is Later, not lost" kept reaching for a demand-free
  kind as its clockless vehicle — a pebble until 1.15.0, a person until now. It
  uses a child under a clocked parent now: the one clockless *work* item the app
  can produce.
  · `vocabulary`, `emitters:check` and the **a11y target gate** all caught real
  things: two banned words in new comments, two vocabulary notes gone false, and
  both new inputs at 21px against the 44px floor.
  · ADR-0068, B-36. **The Should—v1.5 list is empty after this**, and pebbles is
  struck from it at last.
  · **Spine 210 green on `1a24b4e`** — all 22 steps. Worth naming precisely: the
  code commit's own run (209 on `8f64495`) was **cancelled**, not failed —
  `spine.yml` sets `cancel-in-progress: true`, so the docs commit that landed a
  minute later superseded it. The green run is on the head that carries every
  line of the release, which is what V-10 asks for. Not promoted.

- **2026-08-03 (asked for enough test data across every category and type to
  surface real data errors)** — **1.16.0 "A set with everything in it"**.
  · **The number that made the case.** `src/sample.ts` was right when it was
  written at 0.22.0. Measured before building anything: the app emits **70** of
  its 90 event kinds and the sample contained **8**, plus 8 of 14 node kinds. So
  every surface built in sixteen releases — merges, dependencies, decisions, the
  ledger, the trash, Composed Today, focus, weight, the journal — **had never
  once been seen with data in it**, except whatever happened to be in a real
  store. 1.15.1 is the worked example of what that costs.
  · **A FILE, not an append.** The small set appends and admits "yours to sort
  out afterwards"; at ~560 things that trade is not fair, and no verb takes just
  those back out (law 9 — that is `import.merged` in costume). So it writes a
  `planner-log` file and the ordinary import brings it in, with the warning that
  already exists. No new destructive act.
  · **It records nothing**, deliberately. Both existing deliverers write
  `export.written`, which `copies.ts` reads to say "Last copy" — a generated file
  holds none of the real data, so recording one would make that row claim a backup
  that does not exist, in the one place somebody reads to decide if they are
  covered. Smoke pins the store's event count and its `export.written` count
  unchanged after making a set.
  · **`sample:check` generates the set for real and asks what came out** — not a
  grep, which would pass on a kind named in a comment. Both directions, like
  `emitters:check`. Nine exemptions with written reasons: eight device-local acts
  (a snapshot, a copy, another device's shard or greeting), and `anchor`, which
  would be a **silent node** and is refused by the gate — ADR-0057's deferral,
  arriving as a machine-checked consequence.
  · **The sweep is the half that answers the request.** Every projection over the
  folded set, asserting no `undefined` / `NaN` / `Invalid Date` /
  `[object Object]` / bare `null` in any rendered string — 4,000+ strings a run,
  including `eventWords` over all 1,569 events and the report in four formats.
  · **Two defects in the checks themselves, both found by planting.** The sweep
  first stringified whole nodes and reported 94 hits, every one its own
  scaffolding (`"parent":null`) — a check that flags its own instrumentation
  teaches you to ignore it. And the trigger-list check searched the journal's
  base64 ciphertext, where a random IV produced "gtd": **the second time that
  exact collision has happened here**, after 1.15.0's `'bb'` matching
  "pe-bb-le". Both now read authored words only.
  · Deliberate-failure proofs: removing one kind from the set reds `sample:check`
  naming that kind; removing the null branch from `ledgerRowWords` reds the sweep
  with `ledger.g1562: null asked · declined 3 Aug`.
  · ADR-0067, B-35. Nothing on any existing screen changed.
  · **Spine 206 green on the exact head** (`807dbbd`) — 22 steps now, the new one
  being `sample:check`, green on its first CI run. Not promoted.

- **2026-08-03 (promoted on the owner's word)** — **`main` fast-forwarded
  `60a45c8 → 59644a4`**, carrying **1.15.1** (what "held" means). Spine 202
  watched green on the exact head before the promote — all 21 steps — and
  **Deploy 200** green on `main` at the same sha after it, both editions out.
  · Same limit as every promote here: production itself was not read
  ([V-15](docs/verifications.md)). The evidence is the deploy run's own green
  Cloudflare steps.

- **2026-08-02 (continued on the owner's word)** — **1.15.1 "What *held* means"** — the item
  ADR-0065 left open, which reading the code turned from a question into a
  shipped defect.
  · **The coverage list was itemising journal entries as "(untitled) — held".**
  A journal entry has no title by design (ADR-0061), and `buildCoverage`
  renders `title || '(untitled)'` — so opening the gauge listed every private
  entry as a blank row. ADR-0061 excluded them from the todo list to prevent
  exactly that row; the coverage list was missed, and it is the *more*
  prominent surface because the gauge invites you to open it. Since 1.15.0
  active pebbles were listed there too.
  · **The cause is the 1.9.2 lesson repeating**: `heldGroups` carried a
  hand-written list of what is not work and the gauge had none, so the two
  drifted the moment a kind was added — 1.13.0 and 1.15.0, neither caught.
  · **`heldWork(state)` in `gate.ts`, read by four surfaces** that make the same
  claim: the gauge's total, the coverage list, the todo groups, and the ⓘ
  panel's "Things held" row. `silent` is untouched and still runs over every
  node — a proof that skips a kind proves nothing. `heldNodes` keeps its meaning
  for its ~28 other readers.
  · **Two more readers found by reading rather than by the plan.**
  `undatedCount` counted pebbles into "you have not decided about these yet",
  about the one kind there is nothing to decide about. And `searchHeld` now
  excludes pebbles — not about the set, but because a result row is a door to a
  work sheet whose every verb the gate must then refuse (the 1.9.2 audit's F-B).
  · **The import warning deliberately stays on the wider number**, four lines
  below a row that moved to the narrower one. An import replaces everything, and
  a warning may not round down. Both call sites now say which and why.
  · **The smoke assertion had been passing because the case was absent.**
  Rows-equal-the-gauge now runs with a pebble on, and again with a journal entry
  written. Reverting the coverage list alone reds four assertions; reverting the
  gauge alone reds three of the six new unit tests.
  · **A number the owner sees will drop** by however many entries and weights are
  held. The changelog says so plainly, including that 1.15.0's own note —
  "the count of what is covered does not move" — was half wrong.
  · ADR-0066. **Spine 202 green on the exact head** (`a3b3625`) — all 21 steps.
  Not promoted; 1.14.2, 1.15.0 and this wait on the owner's on-device pass together.
  · The cross-app lesson went to the hub under **LESSONS 7g**, not a new
  section: a correct check whose walk never contained the case is that section's
  "assert the fixture, not just the result" bullet in its quietest form.

- **2026-08-02 (promoted on the owner's word)** — **`main` fast-forwarded
  `601bae9 → 60a45c8`**, carrying **1.14.2** (every noun accounts for itself),
  the pebble **correction**, and **1.15.0** (load, not work). Spine 199 watched
  green on the exact head before the promote — all 21 steps, including the
  headless walk and the rendered accessibility pass — and **Deploy 196** green
  on `main` at the same sha after it, both editions out.
  · Same limit as every promote here: production itself was not read
  ([V-15](docs/verifications.md)). The evidence is the deploy run's own green
  Cloudflare steps.


- **2026-08-02 (told the thing already existed, and to stop asking without
  reviewing the project files first)** — **1.15.0 "Load, not work"** — the pebble
  consumer ADR-0014 described in the design phase, built at last.
  · **The owner was right, and the rule is now standing: read the files first.** I had
  carried pebbles as blocked on the owner's decision, repeatedly, when ADR-0014 answers
  it in its Consequences — "may depress capacity / WIP while active … the
  mechanism by which unresolved weight shows up in what the app asks of you,
  without ever becoming a task" — and the data constitution says the same. The
  correction is recorded beside the vocabulary entry and in the plan file.
  · **A sweep of everything else I had called "blocked on the owner" found three more
  already answered in the files.** Anchors: ADR-0057 defers them with four
  reasons and says what shipping them needs. Sync consent: ADR-0036 already
  requires each edition's panel to state "exactly what leaves the device", and
  `src/ui/security.ts` already has the section. The module offer trigger:
  build-plan item 322 records it as waiting on dogfooding, not on an opinion.
  **What is genuinely the owner's is only the physical checks** — V-14, V-16/V-17,
  V-00 step 2, V-20, and item 42's measurement. Those need physical verification, not
  judgement, and that is a much shorter list.
  · **No new nouns, no gate change, no vocabulary change.** `pebble` was in
  `NODE_KINDS` and in `DEMAND_FREE_KINDS`, so the write gate had been refusing
  to clock one for a year; the four events were declared and typed, and
  `Capacity` already named its four values. Only the reader was missing.
  · **Weight narrows THE OFFER and nothing else** — never the gauge (it proves
  law 1 over every node), never the todo list, never Composed Today (that is
  what you chose), never below one thing.
  · **One small thing changes nothing.** `HEAVY_AT` is 3, so a single pebble is
  sayable without consequence — an app that reacts to every one teaches you not
  to write them down, which is ADR-0014's own argument for the Menu from the
  other direction.
  · **Co-occurrence, never causation.** "Fewer things, *while* you have this
  much on." The `while` is load-bearing and pinned by a test that rejects
  because/due-to/caused, and by another that rejects any digit.
  · **A defect the tests caught before it shipped:** pebbles were appearing in
  the todo list, which is exactly what "becoming a task" looks like. Now
  excluded like journal entries — `heldNodes` still counts them so the gauge
  and the merge picker see them, `heldGroups` does not.
  · **And a latent fragility surfaced:** the journal test asserted the
  ciphertext `'bb'` never reaches state, and the word *pe-bb-le* matched it. A
  false positive on a real invariant is worse than no check; the fixture now
  uses a distinctive string.
  · **The timeline half does NOT ship**, and no timeline was invented to carry
  it. There is no plot surface in this app. Said rather than faked.
  · **And an older inconsistency surfaced, named rather than patched.**
  `heldNodes` counts every untrashed node; `heldGroups` skips what is not work.
  Those drifted apart in 1.13.0 when journal entries were excluded, and nobody
  noticed because `held.ts` still carried a comment saying they could not. The
  comment is corrected. The gauge now says "N held" where the list shows fewer
  rows — nothing is hidden, every excluded kind has its own surface, but "held"
  is doing two jobs in one word and that wants its own decision.
  · **The walk found a real defect, and that is the best thing it did.**
  Settling kept the node, so `heldNodes` counted it for ever — three later
  assertions comparing the gauge against rendered rows went red. Chasing that
  showed the node was **unreachable from every surface**: a settled pebble is in
  no list at all, having left the load entry by definition and never been in the
  todo list, while still inflating "held" for ever. Settling now emits
  `pebble.settled` AND `node.trashed`: the log keeps both facts, the trash view
  is the way back, and the count cannot climb behind a surface that shows
  nothing. My first two attempts at this — a second "Let it go" verb, then
  moving the walk to the end of the run — were both working around the defect
  rather than fixing it.
  · Two of my own smoke assertions were also simply wrong — the offer's
  behind-count, and expecting the gauge not to move — and were replaced with
  what is actually true.
  · ADR-0065, ACCESSIBILITY B-34, two a11y states, a smoke walk.

- **2026-08-02 (promoted on the owner's word)** — **`main` fast-forwarded
  `3a9776c → 601bae9`**, carrying **1.14.1**. Spine 195 watched green on the
  exact head before the promote; **Deploy 192** green on `main` at the same sha
  after it, both editions out. Same limit as every promote here: production
  itself was not read ([V-15](docs/verifications.md)).

- **2026-08-02 (promoted on the owner's word)** — **1.14.2 "Every noun accounts
  for itself"** — the generalisation of the two defects the same day produced.
  · **The shape, twice in one day.** `export.written` recorded since Phase 0 and
  read by nothing (ADR-0062); `snapshot.written` declared in Phase 0 and written
  by nothing (ADR-0063). Neither was visible: types compiled, gates passed, 864
  tests green. **A noun nothing writes breaks nothing** — it just means a feature
  the record insists exists does not.
  · **A sweep found 23 more kinds written by nothing, and exactly two carried a
  note saying so.** From outside, all 23 looked identical — and identical to the
  two that were real defects.
  · **New gate `emitters:check`.** Each kind is written by the app, or its own
  vocabulary entry says in words that it is not. Both directions: a kind the app
  DOES write must not still be described as unemitted, because a stale note is
  the next quiet lie and would be written by whoever finally wires the noun up.
  Both failure modes proved deliberately before trusting it.
  · **The first version was too coarse and I caught it by running it.** Paragraph
  splitting made all of section G one lump, so a note about one kind vouched for
  every kind beside it — the exact sloppiness the gate exists to refuse. Now
  parsed into per-kind blocks, so a note must sit BESIDE what it is about. One
  existing note (the `vault.*` supersession) lived in a different section
  entirely and was moved to where it belongs.
  · **What the 23 turned out to be:** reserved (the assist ladder, templates,
  terminology skins, consent), deferred with a named blocker (anchors and their
  delta; pebbles/capacity/WIP — see the correction below),
  superseded (the vault trio; the comms-sweep pair, replaced by a field on an
  upkeep node), redundant (`device.registered` — `State.devices` folds from the
  `device` field every event already carries), and correct by design
  (`replan.raised`, which ADR-0034 requires to stay unemitted).
  · **Two notes record open questions rather than answers**, deliberately:
  whether sync needs a `consent.granted` under ADR-0015, and that compaction —
  ADR-0001's fifth consequence — is entirely unbuilt.
  · ADR-0064. Nothing changes on screen; the bundle moves only because the patch
  notes live in it.
  · **CORRECTION, same day, and it is mine.** The note this release forced me to
  write beside `pebble.raised` said the question "what does a pebble actually
  depress?" had never been answered. **That is false.** ADR-0014 answers it in
  its Consequences, in terms: a pebble links to the nodes it affects and "may
  depress capacity / WIP while active", and it "annotates the timeline, so a
  stretch of low capacity has a visible reason — co-occurrence only, never
  causation". The data constitution says the same thing in the same words.
  `capacity.declared` even carries its own four-value payload. **Nothing about
  pebbles is undecided; the substrate is unbuilt**, which is a different thing
  and a much smaller one.
  · **The framing was mine and it appears nowhere else in this repo.** I put it
  in the plan file, repeated it in a readiness sweep, said it to the owner twice, and
  then shipped it into the vocabulary — one turn after writing the cross-app
  lesson that *an ADR's Consequences section is a build list, not prose, and the
  bullets nobody converts into work become the app's quietest lies*. I made
  exactly that mistake about exactly the document that answers it. The new gate
  did its job and demanded a sentence; the sentence I wrote was wrong.
  · **My supporting argument was also wrong.** "Next up cannot ask for less than
  one thing" is true of Next up and does not generalise: `COMPOSED_CAP` is 5,
  `OFFER_CAP` is 2, `REVIEW_CAP` is 3, and the timeline annotation needs no cap
  at all.

- **2026-08-02 (asked what else was already specified and not yet done, then to continue)** —
  **1.14.1 "Startup does not replay the world"** — the biggest thing the sweep
  found, and the same defect as 1.14.0 one layer down.
  · **ADR-0001's first consequence has never been true.** "Startup must not
  replay the world. State is `latest snapshot + tail fold`. The < 2 s
  cold-capture budget depends on this." `writeSnapshot` was written in Phase 0,
  exported, and exercised by four tests — **and had no caller outside the test
  suite.** The only production writer was `portability.ts`, storing a snapshot
  that arrived inside an imported file. So `loadState` found none, fell through,
  and folded the entire log on every launch, every reload, every return to the
  Home Screen.
  · **Nothing was ever wrong.** The fallback path is the correct path and the
  state it produced was right. What was lost was only the thing the machinery
  was built to buy — and the loss grows with an append-only log, forever.
  · **The app cuts one from the state it already holds.** Calling `writeSnapshot`
  at startup would re-read and re-fold the log, paying exactly the cost the
  photograph exists to avoid. `snapshotFrom` takes the state the session has just
  folded; the mark and the count come from the same object read synchronously, so
  the snapshot is internally consistent even if a commit lands mid-write.
  · **After `data-ready`, unawaited, and NOT on the commit queue.** Queueing it
  would put a clone of the whole state in front of the first capture.
  · **The threshold is a count, not a clock** — 500 events past the newest
  snapshot. A device used once a fortnight has a short tail and should do no
  work; elapsed time cannot tell the difference. Same reasoning ADR-0004 used
  for export staleness.
  · **Deliver, then record** — the snapshot lands before `snapshot.written` is
  committed, pinned by a test with a store that refuses to hold a photograph.
  The noun was declared in Phase 0 and unemitted until now.
  · **Safe to turn on because the guard predates it**: `loadState` recomputes
  snapshot-count plus tail against the log and falls back when it disagrees, so
  the worst case is a slow start, never a wrong state.
  · **Refused: compaction.** ADR-0001's fifth consequence is also unbuilt and
  `shard.compacted` also unemitted, but discarding history under a law that says
  data is never lost deserves a measurement first, not a rider.
  · **The headless walk measures it, on a synthetic store**: 615 events replayed
  before, **1 event after**. That is a real browser against real IndexedDB, and
  it is not a real iPad — item 42 is still the measurement that counts, and the
  changelog says in as many words that this release comes with no number for the
  reference device.
  · **The walk's first version of that proof was vacuous, and the smoke run
  caught it.** An import seeds a snapshot of its own, and the walk imports a
  backup — so the store was already covered and a reload correctly did nothing.
  The check would have passed with the caller deleted. It now empties the
  snapshots table first, staging the exact state every device was permanently in
  before this release.
  · ADR-0063; build-plan items 5 and 6 annotated with what actually happened.

- **2026-08-02 (promoted on the owner's word)** — **`main`
  fast-forwarded `155967b → 3a9776c`**, carrying **1.13.0** (the journal) and
  **1.14.0** (the copy, and the way back). Spine 192 watched green on the exact
  head before the promote — every step opened, including the headless walk and
  the rendered accessibility pass — and Deploy 189 green on `main` at the same
  sha after it, both editions out.
  · Same limit as every promote here: production itself was not read
  ([V-15](docs/verifications.md)). The evidence is the deploy run's own green
  Cloudflare step, not the apex URL serving the file.

- **2026-08-02 (asked whether clearing Safari's website data loses everything)** —
  **1.14.0 "The copy, and the way back"** — a question that turned out to be a
  release, because answering it honestly meant checking, and the checking found
  two decisions ADR-0004 took in the design phase and nobody built.
  · **The answer is yes.** `events`, `snapshots` and `kv` are three tables in one
  IndexedDB database, so clearing a browser's website data takes the lot.
  Persistent storage does not cover it and never claimed to: persistent mode
  means the browser will not clear the store *on its own* to make room.
  · **`export.written` had been written since Phase 0 and read by nothing.**
  Three call sites wrote it; nothing computed when the last copy left. ADR-0004's
  own consequence — "if it is forgotten, the app should say so plainly rather
  than let the user assume they are covered" — was simply not built, so the app
  let people assume. The panel now carries a **Last copy** date and one sentence
  when work has landed since.
  · **Not every `export.written` is a copy**, and this is the part that would
  have been a worse lie than the silence. One noun serves the whole export, the
  range *reading* copy that `inspectExport` refuses, and the calendar `.ics`.
  `WHOLE_COPY_SCOPES` lives beside the reader and `deliverCopy` refuses anything
  outside it — the 1.9.2 lesson applied, so the set cannot fall behind the
  writers.
  · **"Stale" is measured on the log, never on the clock** — ADR-0004's own
  definition, with its own warning attached ("must not fire on a device that is
  simply used less often"). And **strictly after** the copy event: a file never
  contains its own record, so at-or-after would leave the sentence on
  permanently, one millisecond after every export.
  · **The Restore-on-empty action existed only as a paragraph in ADR-0004.**
  "One action, one tap, into the picker." What existed was a file input inside
  the panel, inside a folding group, under a heading. It shows on an empty store
  now — `nodes.size === 0`, not "nothing held", which is also true of somebody
  who has finished everything.
  · **The finding that made it urgent: `kv` goes with the events.** `tour.seen`
  is a kv key, so after a clearing the walkthrough runs again and the app greets
  a person who has just lost everything with "Welcome to Quietkeep."
  · **The persistence sentence is worded definitionally, not as a platform
  claim.** V-00 measured the grant, the quota and a force-quit; it never measured
  the clearing path. That is **V-20**, filed, and the run is the restore walk —
  export, clear, observe, restore — so it answers the platform question and
  proves the new path on the same pass.
  · **The ADR index had been stale since 0038** — twenty-four records missing,
  and eleven of the filenames I first wrote for them were wrong until checked
  against disk. Filled and every link verified to resolve.
  · ADR-0062. Gates green, `staging`, Spine watched on the exact head.

- **2026-08-02 (chose kind-plus-encryption, and said to go)** —
  **1.13.0 "The journal"** — the last v1.5 item, and the one that was blocked on
  a decision rather than on work.
  · **The decision was the owner's because ADR-0005 said no session could make it.** Its
  overturn clause reads "Nothing about the vault split". ADR-0061 supersedes that
  clause; 0005 keeps a `Superseded by` header and is otherwise left exactly as
  written, per the ADR rules. Its other three bindings survive untouched and the
  release honours all of them.
  · **Q-10's objection never reached the journal**, and this is the part I had
  wrong for most of the session. Its argument — two apps, remember to check both,
  Next up forced to pick a side — is about work versus home, where both sides
  hold work that must return. The journal holds nothing that returns. And the
  lens it recommended was never an option: a lens filters what you LOOK AT, while
  encryption changes what the fold CAN read.
  · **The fold never touches ciphertext.** Entries are nodes; the surface reads
  the log and opens them in the UI (the 1.4.0 log-viewer pattern). No new
  `NodeState` field, no disposition entry, no three-place ceremony — and search
  cannot index the journal because there is nothing in state to index, which is
  stronger than remembering to exclude it. Entries carry no title, because a
  title would be plaintext in the log.
  · **`journal` joined `DEMAND_FREE_KINDS`**, verified by running the gate first:
  without it every private entry took a cure clock and came back on a work
  surface as an untitled row. Deliberate-failure proof pinned.
  · **The held list excludes journal entries; the coverage gauge still counts
  them.** The gauge PROVES law 1 over every node, and excluding a kind from a
  proof is how law 1 gets defined away — the merged-node finding of the 1.3.1
  audit. The held list is the todo list, which is a different question.
  · **PBKDF2-SHA-256 at 600,000 rounds**, the count stored with the salt so a
  later raise can still open older entries, and a count below the floor refused
  rather than honoured. Argon2id would have meant a WASM dependency; ADR-0005
  delegated this choice to the build, which I had been wrongly holding as
  the owner's.
  · **Unlocking proves the key against a real entry** before reporting success.
  A wrong passphrase derives a perfectly valid key that opens nothing, so
  unlocking on derivation alone would have shown an empty journal — which reads
  as "your entries are gone".
  · Refused and stated rather than half-built: no passphrase change (it would
  mean re-sealing every entry), no tags, no counts.
  · ADR-0061, ACCESSIBILITY B-32, vocabulary updated for `journal.sealed` and
  the superseded `vault.*` pair.

- **2026-08-02 (promoted on the owner's word)** — **`main` fast-forwarded
  `8cc85f9 → 155967b`**, carrying 1.12.0. Spine 188 watched green on the exact
  head before the promote; Deploy 185 green on `main` at the same sha after it,
  both editions out.

- **2026-08-02 (promoted on the owner's word)** — **1.12.0 "A person has a page
  of their own"** — and the records made true in both directions.
  · **`personView` had no caller.** It was written, exported and unit-tested in
  two files, and no surface anywhere called it: a projection with nowhere to
  render, the same "complete and unreachable" shape `node.merged` had before
  1.7.0. The `#people` surface only ever rendered `waitingOnAnyone`, which is
  owed-across-everyone, not any one person.
  · **And names on an item were dead text.** `<span>`s, so the one question a
  name raises — *what else is with them?* — could be asked from nowhere. That
  is the "dead lists become doors" work 1.6.0 did everywhere else and missed
  here, and it is a reachability defect before it is anything else: keyboard and
  screen-reader users could not get to a person at all.
  · Their own sheet is the home, so this costs no new chrome on the landing
  surface — which 1.11.0 had just finished simplifying.
  · **Two corrections to my own earlier claims.** The readiness sweep recorded
  "the bother flow and the staff-call/person lens are both shipped". The bother
  flow is; the lens was **half** shipped, and "staff-call lens" means the DELTA
  half, which waits on anchors. Build-plan item 33 is annotated rather than
  struck for the same reason — a build plan that marks a deferred thing done is
  the drift these records exist to prevent, and that cuts both ways.
  · Item 35 (the status report) IS struck, after checking all four formats
  against the code rather than against memory.
  · **The a11y gate caught its own driver.** The first version linked a person
  to a project, so nothing landed in the owed list and the registry entry
  matched nothing — the gate refusing to pass on an empty selector, exactly as
  designed. The entry is now scoped to the group so it cannot pass or fail on
  fixture shape.
  · A brittle smoke assertion fixed on the way past: it counted every
  `person.created` in the store and expected one, so it failed the moment any
  other section named anybody. It asks about Sam now, which is what it meant.
  · ACCESSIBILITY B-31. No ADR: this builds a recorded item on an existing
  projection and adds no new decision.

- **2026-08-02 (promoted on the owner's word)** — **`main` fast-forwarded
  `0745796 → 8cc85f9`**, carrying 1.11.0. Spine 186 watched green on the exact
  head before the promote; Deploy 183 green on `main` at the same sha after it.

- **2026-08-02 (promoted on the owner's word)** — **1.11.0 "A few things you
  could pick up"** — the menu shape required: queue towards offering what
  a person wants to choose to do, rather than a list of things waiting to be
  done.
  · **The way through was in the thesis's own wording.** §4's choice-overload
  finding is qualified — the direction holds "where options are SIMILAR and
  stakes are ambiguous" — so it does not condemn a small set of options that are
  deliberately unalike. The mechanism is `NextUpReason`, which already partitions
  the queue by WHY something is offered: **at most one item per reason**, capped
  at two. Nothing scored, nothing balanced; the classes do the work.
  · **The precedence is untouched.** A real date arriving today still leads.
  · **One wish rides along, and the guard is structural rather than copy.**
  `offerNow` returns it as a bare node with no reason, no pressure and no demand
  clock, so there is nothing for a surface to render as a demand, and it carries
  no Done — law 6's "deliberate promotion, never an obligation that accrued".
  · **The count is gone.** "8 things are asking" was a count of pending work on
  the landing surface — the nearest thing this app has to the backlog headline
  law 8 names outright — while the coverage gauge three lines up already states
  the honest totals.
  · **The smoke walk's anti-theatre check moved to the gauge**, and deliberately
  to `ready now` rather than `held`: a completed thing is still held, because law
  1 does not exempt finished work, so `held` is exactly the number that must not
  move when something is done.
  · A correction to my own working shorthand, for the record: I had been glossing
  **law 8 as "caps with true counts"**. It is *"Rest is legitimate"*, and its
  operative second clause is that the bounded surface is **never the backlog**.
  The repo's own citations of law 8 for caps are right on that clause; my gloss
  was lossy, and it happened to matter here.
  · ADR-0060, ACCESSIBILITY B-30, thesis §4 and §9 updated in the same commit.

- **2026-08-02 (promoted on the owner's word)** — **`main` fast-forwarded
  `f237a1f → 0745796`**, carrying 1.9.1, 1.9.2 and 1.10.0. Spine 183 watched
  green on the exact head before the promote; Deploy 180 green on `main` at the
  same sha after it. Three releases in one promote: the two gates the repo had
  claimed but never had, the audit of 1.4.0–1.9.1 and its nine findings, and the
  timer reframe.

- **2026-08-02 (decided: presence not progress, duration is chosen, and the
  abandoned outcome is dropped)** — **1.10.0 "What a fold takes with it" → the timer
  reframe** — three of the owner's decisions, and one of them corrected me mid-design.
  · **The recorded research and the shipped thing had drifted apart.** Thesis §4
  has always said the timer's value is that "two minutes" is a **cheap
  decision** — an activation aid. What shipped counted down and then asked
  whether you had finished, which is a constraint. The owner's reframe ("I will just
  get started" rather than "I will work within two minutes") was the thesis, not
  a new idea.
  · **The owner's correction, which went further than mine.** The owner proposed a plant that
  grows or a row of glyphs filling left to right, then caught it independently: that
  would make abandoning appear to have a consequence. The owner is right, and the same
  objection kills **the filling circle I had endorsed** — anything rendered
  part-way through a chosen span is a fraction, and a fraction is a score. A
  growth metaphor is worse still: a thing that can be stunted is the chain
  pattern in warmer clothes. Recorded in ADR-0059 because two of the three
  rejected shapes look like the fix.
  · **So: presence, not progress.** A pulsing mark that says only "on", and the
  commitment in a SENTENCE — "Twenty minutes, running." A sentence can hold
  something you are allowed to walk away from; a shape either completes or
  visibly does not.
  · **The length is chosen** — `timer.length.set` folded to
  `State.timerMinutes`, the `request.slot.set` shape, so it travels with the
  log. Set in Extras and **not** at the point of starting: showing options to
  someone stuck at activation is choice overload where it costs most (§4). Two
  minutes stays the default.
  · **The verdict is gone, and it should never have existed.** `do-now.timed`
  wrote `outcome: 'completed' | 'abandoned'` on every stop. Nobody saw the word
  — the log viewer says only that a timer ran — but it was permanent and it
  went into every export, and `src/requests.ts` says in terms that "a record of
  the times you did not do your own work is the ledger this app exists to NOT
  keep — the do-now offer's 'Not now' writes nothing, **ever**". The button
  that declined wrote nothing; the timer beside it wrote a verdict. Now a span
  and nothing else, the `focus.started`/`focus.ended` shape — and the chosen
  length is deliberately absent from the payload, so a shortfall cannot be
  subtracted (the arithmetic that deleted the report's "Started" section).
  · **Two defects the work found in itself.** A button that named one length
  while starting another, when the length was changed in Extras with an offer
  on screen — fixed with a targeted `relabelTimer`, after a full
  `triage.refresh()` in `refreshAll` turned out to rebuild the clarify card on
  every commit anywhere and change which card was showing mid-interaction. And
  the smoke walk left live work behind that later sections position off — the
  trap this file records twice already ("ITS OWN item"; "leave the inbox as this
  section found it"), which I walked into anyway and which cost a worktree
  bisect against the previous head to prove.
  · Thesis §4 rewritten in the same commit — it called the timer "a bounded
  commitment", which is no longer what it is. ADR-0059, ACCESSIBILITY B-29.

- **2026-08-01 (continued on the owner's word)** — **1.9.2 "What a fold takes with it"** —
  the adversarial audit of 1.4.0–1.9.1, nine releases and the longest this repo
  has gone without one. The findings share one cause worth stating before any
  of them: **1.7.0 wrote the merge as a hand-written list of what a fold
  carries, and every release after it added a `NodeState` field without
  visiting that list.** Nothing was ever deleted — the log is append-only and
  every field survived in state; only the projections excluded merged nodes, so
  the records had nowhere to show.
  · **F-A — a fold destroyed the source's decision log and its standing
  decline.** `decisions` (1.9.0) and `notNow` (1.8.0) were not in the carry
  list, and both readers exclude merged nodes. Fixed by READING through the
  fold (`src/merged.ts`) rather than copying: copies carry fresh event ids, so
  merge → unmerge → merge would leave duplicate decision rows that no verb in
  this app can remove, and `delta.decided` — a set difference on ids — would
  re-report them in the one artefact that leaves the device.
  · **F-A′ — and the decline's park WAS carried**, so folding a
  declined-and-parked duplicate into live work made that work go quiet under
  `merge:carried` with nothing explaining why. A decline's park is the decline,
  not a date about the work.
  · **F-G — the dependency arithmetic broke in both directions.** `feeds` and
  `leadDays` were never carried, and `dependencyView` drops a downstream with
  `mergedInto`, so an upstream's latest-start fell from a real number to null.
  "Start it today" became silence — the assembled-context half of law 3.
  · **F-B — targets were offered that the gate must refuse**, and the Menu was
  only one case: `aspiration` and `pebble` are demand-free by kind, refused by
  a different belt. Now one `canHold` predicate, asked by the picker and again
  at commit, plus a direction rule (a wish folds into a wish; work never folds
  into a wish).
  · **F-I — "Clear what I am holding" would not run AT ALL for anyone who had
  folded a duplicate.** `clearEvents` trashed only HELD nodes; a folded-away
  source is not held, so trashing the survivor silenced it and the belt refused
  the whole batch. Shipped in 1.7.0, never noticed, and **found by the new
  smoke walk within minutes of writing it** — the old walk always split its one
  fold back out, so no folded pair ever survived to the purge step. The
  function's comment said this "cannot violate law 1", which was true when it
  was written and stopped being true two releases later.
  · **F-C — a second reader of `todayFor`**, contradicting `composed.ts`'s
  "ONE reader" claim, which is the entire mechanism of expiry-by-projection.
  Pinned by a source scan.
  · **F-F — the 150-seed equivalence oracle had a blind spot exactly where the
  gate last changed.** Its generator emitted only 1.3.x-era kinds, so
  `node.unmerged` — the one branch the gate has gained since the oracle was
  frozen — had never once been generated. The coverage pin then found **eight
  more** silent-risk kinds it had never produced. Widened; the property still
  finds no divergence, which is worth recording as a result rather than as an
  absence.
  · **F-D/F-E — hygiene, and stated as hygiene.** Missing clone and backfill
  lines against the three-place rule. None misbehaved: nothing mutates a
  `notNow` in place, `Number.isFinite(undefined)` is false, `!undefined` is
  true. Writing the invariant GENERICALLY (for every object-valued key, assert
  identities differ) rather than as a field list found two more the audit had
  not spotted, including one in `sourceTags`.
  · **The durable half — `MERGE_DISPOSITION`.** Every `NodeState` field must be
  named as carried (with its noun), read-through (with its reader), or
  deliberately not carried (with the reason, in words). Totality is a compile
  error plus a runtime key-set check. A reasoned "no" is a fine answer; forcing
  the sentence is the mechanism. **F-H:** the test that guarded the merge was
  called *"…— nothing swallowed"* and asserted exactly the four things the
  1.7.0 list carried, so it shared the code's blind spot permanently. It keeps
  its assertions and gives up the claim.
  · ADR-0058, amending ADR-0053 under that record's own overturn clause
  ("only by evidence that it carried wrongly … the answer would be a smarter
  carry"). The cross-app lesson is in the hub's `LESSONS.md`.

- **2026-08-01 (promoted on the owner's word)** — **1.9.1 "The gates it
  claimed"** — the "say true things" patch turned on the repo itself. A sweep
  of everything the docs claim to check found three claims with nothing behind
  them, and two records that contradicted each other.
  · **The closed-event-list gate** (`npm run events:check`, tools/event-list.mjs):
  `isKnownKind` has refused unlisted kinds at runtime since Phase 0, and
  NOTHING ever asked whether the code's list and `docs/event-vocabulary.md`
  still named the same events — the file CLAUDE.md calls the source of truth
  could drift in silence. Now checked in both directions, plus the Silent?
  column, which the vocabulary itself calls "the machine-checkable form of
  product law 1" and which nothing had ever machine-checked. 88 kinds, both
  sides. Its first run FAILED — on my own parser, which read only the first
  backticked name and so dropped the ten nouns written as shared entries
  (`stakeholder.added` / `.removed`). The gate reported the doc as the thing
  at fault, which is the failure mode a gate must never have; fixed, and the
  fix is commented where it happened.
  · **The write-gate-bypass gate** (`npm run writegate:check`): "nothing
  outside the gate imports the store's write API" — claimed since the build
  plan was written, checked by nothing, while five legitimate raw-write sites
  accumulated. Raw writes are not forbidden; UNRECORDED ones are. The
  allowlist carries a reason per entry, and a stale entry fails too. Its first
  run found two I had not thought of (purge's `replaceAll([])`, snapshot's
  `putSnapshot`) — both fine, both now argued in writing.
  · **The four-banned-words claim was wrong, and the fix is the opposite of
  the obvious one.** The build plan named `overdue`/`late`/`missed`/`streak`;
  the grep covers two. `late` and `missed` cannot be gated at source —
  nearly every occurrence in `src/` is a comment explaining that the app never
  says them, and a grep cannot tell a prohibition from a violation. What
  matters is that a person never SEES one, and the smoke walk has swept the
  rendered page for all four all along. So the claim was corrected to describe
  what is actually true, and a second sweep added late in the walk, where the
  page carries far more real content than at the first.
  · **Two records that contradicted each other**: B-01 said no pressure
  surface exists (stale since 0.5.0 or so); B-05 named a "pressure gradient"
  as something that does. Neither was right. Of B-01's four redundant
  channels, **only position and text were ever built** — there is no fill bar
  and no luminance ramp in `app.css`, which is why the grayscale check still
  has nothing to strip. That is a stronger position than the old sentence
  implied and a visible gap at the same time, so both rows now say it.
  · Also corrected: the build plan's gate list never mentioned five gates that
  have been running all along (storage, headers, editions, workflows, thesis),
  and `deploy.yml` still carried an honesty note saying the deploy had never
  run green and the repo had no app shell — both long false.

- **2026-08-01 (after 1.9.0)** — **`main` fast-forwarded to `f237a1f` on
  the owner's word to promote**, carrying 1.8.0 (request slots, the Not Now ledger,
  the bother flow aligned to its own vocabulary) and 1.9.0 (stakeholders
  that are read, the decision log, the "Decided" report section, and the
  unreachable "Started" section deleted with a totality gate in its
  place). Spine runs 177–178 were watched green on those exact heads
  before the fast-forward; Deploy run 175 green on `main` at the same sha
  (V-10).

- **2026-08-01 (continued on the owner's word)** — **1.9.0 "What a meeting needs"** —
  build-plan item 31's remainder
  ([ADR-0057](docs/adr/0057-stakeholders-and-the-decision-log.md)). Three
  nouns that had existed since Phase 0 with no fold, no emitter and no
  reader got all three; one shipped surface lost a section that could never
  render.
  · **Stakeholders that are read**, and the design ruling I want kept: the
  obvious move was a dedicated `NodeState.stakeholders` on the OPR
  precedent, and it was WRONG — `n.opr` is a field because its cardinality
  differs, while stakeholders are multi-valued, which is what `people[]`
  already is. A second home would have contradicted itself on day one (a
  removal clearing the field while the sheet's people list and the person
  lens kept rendering the name — the OPR defect reintroduced by its own
  fix) and been silently dropped by a merge. Keeping one home also makes
  the healing perfect: every stakeholder linked since 0.15.0 appears with
  nothing re-entered.
  · **`stakeholder.removed` is the only subtraction in the vocabulary**
  (there is no `person.unlinked` noun at all), so it is scoped to person
  AND relation — taking somebody off must never strip their OPR. A removal
  naming nobody is a no-op, never a remove-all. Convergence is replay over
  the log's total order, which for a per-person payload IS per-person LWW —
  the `dependency.released` discipline.
  · **The decision log**: append-only, idempotent by event id, no LWW slot
  (two devices logging different decisions must end with both). Never
  edited, never removed — ADR-0048's rule — and the way back is stated in
  the hint: log the new decision, which is what a decision log is for.
  `meeting` is folded and rendered but written by nothing yet (law 9).
  · **A "Decided" section in the status report**, and the empty-guard
  taught about it — a fourth section without that is a document listing
  real decisions that also says "Nothing to report", which is the audit
  finding delta.ts already carries.
  · **The "Started" defect**: `ChangeKind` declared it, `HEADS` gave it a
  heading, `ORDER` gave it a slot, and nothing ever emitted it — every
  report shipped with a section that could not render. REMOVED rather than
  implemented: started-and-not-finished would become computable by
  subtraction across two consecutive reports, in a document you hand your
  manager, and this app has no in-progress state on purpose. Every
  candidate definition was dishonest (the `start` clock is the DEFER verb)
  or uncomputable (focus is invisible to a two-State diff; `todayFor` is
  deliberately unaskable). **The durable half is the invariant**: a
  `Record<ChangeKind, witness>` totality test now proves every declared
  kind reachable.
  · **Anchors deferred** (build-plan 34 stays open, and says so): an anchor
  node would be SILENT under law 1 today — not demand-free, no cure — so
  the coverage gauge would stop reading zero, and the gauge is what proves
  law 1. Plus `anchor.fired` carries no watermark, so its delta cut would
  be the degraded at-only one an audit already rescued the export path
  from. Needs a gate change plus a shipped surface: its own release.
  · Also: the report walked in smoke for the first time, and a dead
  `periodWords` import swept.

- **2026-08-01 (continued on the owner's word)** — **1.8.0 "Asking, and declining"** —
  request slots + the Not Now ledger
  ([ADR-0056](docs/adr/0056-request-slots-and-the-not-now-ledger.md)); the
  v1.5 line's last cheap item, built the moment its precondition (the park
  verbs, ADR-0045) had soaked. The direction was chosen by a full backlog
  sweep after the roadmap closed; the staff-call pack (anchors, delta,
  stakeholders, decision log) is the recorded runner-up.
  · **One noun, two homes, one write shape**: `request.declined` finally has
  emitters — the sheet's "Someone asked for this?" group and the bother
  flow's third branch, both through `declinePair` (the record + a deliberate
  park in one batch; the gate's cure stays as backstop only). `person` was
  widened to `NodeId | null` (the `waitingOn` precedent); `what` is the
  title snapshot (the consent-sentence rule; rename-proof, pinned).
  · **The bother flow aligned to the vocabulary**: event-vocabulary.md said
  "lands on the Not Now ledger with a park.set" from the start — the build
  trashed it and promised "it does not come back". The trash is gone; the
  relief holds because a park never demands. Copy, tests, and smoke all
  rewritten to the new truth.
  · **The ledger** lives behind ⓘ beside "Things you let go" — ADR-0050's
  species: capped 25, true count in words, rows are doors, one verb, a name
  and a date and NEVER a count (law 5, regex-asserted over the rendered
  words in smoke).
  · **The slot**: one weekday, `weekly:mon`…`weekly:sun`, `''` clears,
  refused-not-guessed; NOT a module — null slot means invisible, setting a
  day IS the opt-in. Exactly two effects: the sheet's "Park it until the
  request slot — back ⟨day⟩" button, and declines parking to the slot.
  Nothing at capture, ever.
  · **Un-declining is `clock.cleared{park}`** — no new noun; the gate cures
  the clear so the carried thing lands back today, covered. LWW convergence
  property-tested in both shard orders.
  · Rider: **imported repeats are counted** — "60 of them repeat on a
  rhythm" instead of the bare tag name "repeat" (the pre-1.4.0
  unnumbered-loss shape, closed).
  · Also found and fixed: the 1.7.0 ACCESSIBILITY.md edit had swallowed the
  "Part 2 — Findings register" heading; restored with B-27.

- **2026-08-01 (after 1.7.2)** — **`main` fast-forwarded to `e99aa80` on
  the owner's word to promote**, carrying 1.7.0 (folding duplicates, the twins range,
  the lens), 1.7.1 (the panel says what it means; only lines that mean
  something), and 1.7.2 (the panel folds, edition-truthful words, the
  thesis opens and is styled, toggle labels state the next press). Spine
  runs 172–174 were watched green on those exact heads before the
  fast-forward; Deploy run 171 green on `main` at the same sha (V-10).
  Both editions of everything photographed this morning are now in
  production.

- **2026-08-01 (the second round of screenshots)** — **1.7.2** — the owner kept
  reading the panel and found five more, including two that had never been
  true anywhere.
  · **The panel folds** ([ADR-0055](docs/adr/0055-the-panel-folds.md)): nothing
  separated the major sections and the panel carried too much, so **the sections
  collapse** — the alternative on the table being a separate settings screen.
  The fold is the smaller of the two options: Help / Your data /
  Extras / About behind real disclosure headers, closed by default, open set
  remembered per device (kv), the opening and the way out never folded, and
  the walkthrough's handoff unfolds Your data so its promise stays kept.
  · **Edition-truthful words** (ADR-0036 amended): found on Quietkeep Sync,
  where the default's copy lied — "there is no server", "the default
  app you are in never contacts anything at all". `src/ui/edition.ts` carries
  the word-level fact from the entry point's shape; the panel header and the
  walkthrough name the edition; `[data-edition]` paragraphs show their own
  build's truth. The artefact-level guarantee (module absent from the default
  bundle) is untouched.
  · **"Planning for Humans" never opened** — two SW defects and a CSP one.
  The navigation branch answered every slow navigation with the cached APP
  shell (tapping the link landed on the main screen) and wrote every
  navigation's body under `./index.html` — one good visit to the thesis
  would have replaced the cached app with an essay. Fixed: per-page cache
  keys, fallback to the page actually asked for. And the page itself carried
  an inline `<style>` that `style-src 'self'` refuses — the deployed thesis
  had rendered UNSTYLED since the day it shipped, unmeasured because no walk
  ever navigated there. Styles moved to `/why.css`; smoke now visits the
  page; both files in the SW shell.
  · **Toggle labels state the next press**: "Read the record" ↔ "Close the
  record", "Things you let go" ↔ "Close the list" — aria-expanded told a
  screen reader and told a sighted reader nothing.
  · B-26; changelog 1.7.2 (ITERATION) + SW cache together.

- **2026-08-01 (screenshots)** — **1.7.1** — five ⓘ-panel defects the owner
  photographed on device, all confirmed against source and fixed the same
  hour.
  · The walkthrough's last step said *"Next opens it…"* while the button on
  that step is relabelled **"Get started"** (tour.ts renames it on the final
  step; the copy was written against the old name) — it now names the real
  button and says what it opens.
  · The badge explainer had been wedged into the middle of "Reminders that
  reach you", ahead of the calendar's own snapshot caveat — whose "It" then
  read as the icon number. The caveat moved up beside the calendar's story
  and the badge block got its own heading.
  · **What's new printed raw code**: the release notes are rendered with
  textContent (innerHTML is banned), but the strings carried `&ldquo;`-class
  entities and `**` marks — so the panel showed the markup itself. The
  strings now carry real Unicode punctuation, and the renderer translates a
  note's `**lead**` into a real `<strong>` built from text nodes.
  CHANGELOG.md regenerates from the same array, so the two stay one.
  · **Stray rules cut the panel apart**: every `.storage-note` status region
  draws a `border-top`, and a dozen of them sit empty through the whole panel
  — each drew a full-width line, so "Save a copy first" was fenced off from
  the clearing buttons it guards and a section's caveat read as the next
  section's. `.storage-note:empty` now takes no room and draws no rule; the
  live regions stay in the tree.
  · **Caveats read as body text**: the small print under each control now
  sits in italics at the same registered `--ink-soft` pair: all
  the words are needed, but it was not done smartly. Posture changed,
  contrast did not.
  No behaviour changes; changelog 1.7.1 (ITERATION) + SW cache together.

- **2026-08-01 (after the promote)** — **1.7.0 "Duplicate handling and the
  lens"** — the owner's direct instruction in the promote message; the watch-list's
  first trigger fired and Q-10's recorded shape built
  ([ADR-0053](docs/adr/0053-folding-a-duplicate.md),
  [ADR-0054](docs/adr/0054-the-lens.md)).
  · **Folding a duplicate**: `node.merged` finally has its UI — and its law: a
  fold is a CARRY BATCH, never a bare event, because a bare `node.merged` is a
  data-loss verb. The batch carries every demand clock the survivor lacks
  (stamped `merge:carried`), the note (copy or join with a blank line — the
  merge decides for neither), people links, and children re-homed, then the
  fold itself. The survivor's own values always stand. Property-tested: date,
  note, person, child, each asserted survived.
  · **`node.unmerged`** — the release's one new noun, Silent-risk yes: a
  split-out node stands alone again and the gate cures it in the same batch.
  Unmerge restores standing, not the world; both directions share one LWW slot
  so shards converge. The survivor's sheet lists what folded into it, each row
  carrying its own "Split it back out" — the trash view's lesson applied.
  · **Legality computed, never refused after offer**: not itself, not its own
  descendant, people only into people; the picker offers `legalMergeTargets`
  and nothing else, filtered as you type.
  · **The twins range** "Sharing a name with something else": EXACT normalized
  equality, never fuzzy — a false "this is the same" costs more than a missed
  one.
  · **The lens** (src/lens.ts): one live top-level container filters the held
  list's ROWS, before the cap slices; the law-1 line renders every time it is
  on, with no count. The never-filter fence: gauge, Next up, replan, re-entry,
  search take no lens argument — the type system is the fence, the tests
  restate it. The choice is kv (`lens.root`), a device view preference, never
  an event; a dead root stands the lens down rather than filtering by a ghost.
  · The a11y gate's first run on the new surfaces found two real defects
  (fixed same commit, B-25): the merge filter's UA-default placeholder at
  4.08:1, and the lens select's `min-width:auto` pushing the page sideways
  257px at 320px/200%.

- **2026-08-01 (after 1.6.0)** — **`main` fast-forwarded to `c47e21e` on
  the owner's word to promote**, carrying 1.4.0 (notes, the readable record, per-node
  history), 1.5.0 (wholesale acts, "Things you let go", range copies), and
  1.6.0 (the tree, doors, Review's four, the session close, optional
  Composed Today). Spine runs 167–169 were watched green on those heads
  before the fast-forward; Deploy run 166 green on `main` at the same sha
  (V-10). The approved roadmap is now fully in production. Next, on the owner's
  word in the same message: duplicate handling and the Home/Work lens
  (Q-10's recorded shape).

- **2026-08-01 (late night)** — **1.6.0 "Seeing and choosing"** — the roadmap's
  last slotted release ([ADR-0051](docs/adr/0051-composed-today.md),
  [ADR-0052](docs/adr/0052-session-close.md)); build-plan items 26, 36, 39,
  and 40 struck through.
  · **The modules fold**: `module.enabled`/`disabled` had existed since
  Phase 0 with no emitter and no fold — `State.modules` is the fold, and
  Composed Today is the first customer.
  · **Composed Today, OPTIONAL** (required to be optional): an
  opt-in Extra off by default; two new nouns (`today.chosen`/`released`)
  folding to one LWW slot; **the expiry is the projection** — `composedFor`
  answers only for the current day, no reader takes a day argument, so
  "chosen and not done" is structurally uncomputable. Cap 5, stated in words
  at the button. The verb lives on the sheet; the strip above Next up is
  doors only.
  · **The tree** (src/tree-view.ts): roots + flattened rows, ONE
  parent→children map + explicit stack (10k-deep test), per-branch cap 25
  with true totals, behind the gauge-pattern control — never the landing
  view, rows carry one verb.
  · **Doors**: the Next-up behind list, the coverage rows, and the sheet's
  children rows all open the fresh node's sheet; `mountWork`/`mountFocus`/
  `mountAbout` grew the standard callbacks (the app.ts:471 lesson — call
  sites changed in the same commit).
  · **Review's four**: `quietAreas` (ADR-0013's dormant — areas HOLDING work
  where nothing finished in 30 days; unknowable rest excluded) and
  `unfedGoals` (unsupported goal; transitive, since goals are fed through
  projects; named "unfed" — "unsupported" is a banned token in the
  update-copy gate). The classes partition — a node is never listed twice —
  and REVIEW_CAP stays 3.
  · **The session close** (item 40) rides the comms chip's `surfacing` ramp
  as its second rider: the win in words, the gauge in WORDS (B-02), never a
  duration or a streak; it never survives a reload. It carries the day-end
  question (item 26): a thread from an EARLIER sitting still unspent gets
  one question, one door, one honest release —
  `resume.card.expired{toReviewQuestion:true}` set true at last by the one
  path that really is the question.

- **2026-08-01 (night)** — **1.5.0 "Wholesale"** — bulk acts on named ranges
  ([ADR-0049](docs/adr/0049-wholesale-acts.md)), the trash view
  ([ADR-0050](docs/adr/0050-things-you-let-go.md)), range export as a reading
  copy. Two of the owner's decisions govern it: the soak-gate is removed —
  correctness rests on the test coverage (the oracle, 737 unit tests, two
  audits) rather than on an elapsed waiting period — and notes recovery is
  the owner's chosen option (b): no repair tool, ever, with a full reimport
  of the OmniFocus data as the recovery path, on the owner's own timing.
  · **One new noun**, the roadmap's only one: `range.acted{scope, verb,
  count}`, written first in each chunk, `scope` the literal sentence agreed
  to (the consent-sentence rule). Deliberately unfolded.
  · **The machinery**: `planBulk`/`runBulk`/`undoBulk` (src/ui/bulk-intents)
  — byte-parity with the single intents (property-tested), the app's first
  chunked commits (~500 events each on the session's serialising queue), a
  per-chunk fresh check that skips-and-counts what moved on, and undo from
  facts captured at act time (the exact prior parent, the prior category).
  · **Two conflicts ruled on in ADR-0049**: receipts (counts of the APP's
  work) are legal during and after a bulk act, scores about the person never
  — law 5 stands unweakened; and Let-them-go auto-exports BEFORE the first
  trashed event (the migration precedent), with the ordering machine-checked
  by smoke — the repo's first export-before-destruction assertion.
  · **Range families**: `menu` ranges join the picker (promote semantics
  only, no conveyor — the six routes are illegal on wishes; ADR-0044
  amended). Hygiene tests split per family.
  · **The trash view is a FIX**: "You can still keep it after all" had been
  true for ten seconds — `#detail-untrash` was reachable only while the
  sheet stayed open, then no path back existed at all. "Things you let go"
  (25 + true count, one verb per row: open the sheet) is the path;
  `trashedNodes` beside `heldNodes`; search stays trash-free with its
  comment amended in the same commit.
  · **Range export is a rendering** (`planner-range-copy`): a range's events
  alone cannot fold legally under law 1, so a seedable partial file is not
  expressible — the reading copy is refused for import by construction and
  law 9 is untouchable. The scout also found `exportAll` imported dead in
  about.ts since the deliverCopy extraction — swept.

- **2026-08-01 (later)** — **1.4.0 "What a thing carries, and what the app
  did"** — the trust spine from the approved roadmap
  ([ADR-0047](docs/adr/0047-the-note-field.md),
  [ADR-0048](docs/adr/0048-the-log-viewer.md)).
  · **Notes on items**: a textarea on the sheet riding
  `node.field.set{field:'note'}` — the noun existed since Phase 0 with
  per-field LWW folding and NOTHING ever read `n.fields`; `noteOf` is the
  first real reader. `cleanNote` (src/note.ts) is shared with the importer:
  keeps `\n`/`\t`, strips format/control, caps 10k. Privacy class fixed in
  ADR-0047: title-class, plaintext in exports as titles are; the encryption
  binding governs the journal, a different domain.
  · **The importer carries notes**: the CSV Notes cell lands in full;
  TaskPaper note lines attach to the item above them (consecutive lines join
  as ONE `node.field.set` — two would be LWW overwriting itself); a leading
  orphan note attaches to nothing and is not counted as carried. The summary
  sentence inverted: "N notes come across with their items."
  · **`eventWords`** (src/log-words.ts): one plain-words line per event,
  total over all 84 kinds (totality test), "you" for deliberate acts, "the
  app" for cures — which say why ("so it would not go silent") — and an
  honest raw-name fallback for kinds newer than the build. Content never
  rides along: a note/journal line says one was written, never what.
  · **The log viewer** behind (i): read-only, newest day first, 50 per
  reveal with the true total, built on reveal (the coverage-list lesson).
  **Per-node history** on the sheet: "What happened to this", cures indented
  under their cause — the permanent answer to "it feels lost", and the
  surface whose absence let the OPR defect live unnoticed.
  · Quiet sheet line: "sorted as ⟨route⟩". a11y: `log view` and
  `detail sheet, history open` registry states + driver staging (the history
  audited on a captured item so the cure line is guaranteed present); B-22.

- **2026-08-01** — **`main` fast-forwarded to `19f4d1e` on the owner's word to promote and
  continue"**, carrying everything from 1.2.0 through 1.3.1: undo, search, the
  do-now and Next-up fixes, the "in project" place labels, the 1.2.3 trust
  patch, sort mode with named ranges and the defer verb, the admit() rework,
  and the fifteen audit fixes. Spine run 163 was watched green on that exact
  commit before the fast-forward; Deploy run 160 went green on `main` at the
  same sha (V-10). Production now carries the release the 30-day dogfood gate
  honestly starts on. Next per the approved roadmap: 1.4.0 "What a thing
  carries, and what the app did."

- **2026-07-31 (night)** — **1.3.1: the adversarial audit of 1.3.0, all fifteen
  findings fixed.** The release shipped green through every gate, so the audit
  was pointed at what the gates do NOT ask — and it found two CRITICAL mainline
  defects plus thirteen lesser ones, every finding verified with a repro before
  it was fixed and pinned with a test after.
  · **The two CRITICALs:** a due-dated item routed to Someday kept its date
  invisibly forever (the Menu group wins every surface, no replan card raises,
  the sheet hides temporal rows, sort hygiene excludes it — law 3 violated in
  the mainline). The someday/reference routes now shed the node's demand
  clocks in the same batch, and a new gate belt refuses Menu+demand-clock
  outright, oracle side included. And sort mode's route buttons acted on the
  card as painted — the sheet is one tap away, so the on-screen item could be
  completed or shelved and the stale tap still routed it; every act re-checks
  the live node now and refuses in words (the smoke fires a genuinely stale
  click to prove it).
  · **The gate grew three corrections** (ADR-0046 amended): the born set (the
  dirty-set rework was blind to ghosts `ensureNode` mints mid-batch and
  rejected batches the old scan accepted); `collectDependents` iterative (a
  deep chain returned a raw RangeError instead of a decision — pinned at
  10,000); and a stamp-disordered batch is refused rather than tolerated
  (`dependency.released` is the one non-commutative fold op; a disordered
  batch could make a cycle real in an append-only log). The refusal caught its
  first real bug the day it landed: undo's waiting-for branch emitted seqs out
  of order.
  · **The year-0099 pin found the fix was half-shipped**: `detail-intents` was
  corrected but `time.ts` itself still collapsed year 99 → 1999 through four
  raw `Date.UTC` calls (and `localDayKey` printed year 99 unpadded). One
  `utcMs` now lives in time.ts and every parts-built date goes through it —
  the deliberate-failure discipline working as designed: the test failed, and
  what it failed on was real.
  · Also: Leave-it laps instead of wedging; focus lands somewhere real after
  every sort action (a11y driver asserts it); "not before" yields to a
  same-day deadline; create-in-place collision checked against ALL live
  containers; estimate/temporal rows hidden on Menu items; the law-5 smoke
  regex actually catches count-forms ("19 of 240", "5 left") with #sort-entry
  excluded as the one sanctioned total. 710 unit tests green.

- **2026-07-31 (evening)** — **The roadmap session: from return engine to real
  planner.** The verdict then: no direction from that point on, and nothing a
  real planner system needs for people to actually use it. An 8-agent
  plan-mode workflow (3 recon, 3 design lenses, 2 adversarial judges) produced
  the approved direction — 1.2.3 → 1.3.0 → 1.4.0 ("what a thing carries, and
  what the app did") → 1.5.0 ("wholesale") → 1.6.0 ("seeing and choosing") —
  recorded in the session plan file; the releases land here as they ship.
  · **1.2.3 "Say true things"** (Spine run 160 green): the OPR defect fixed at
  both ends — `person.linked{relation:'opr'}` now folds into `NodeState.opr`
  (every existing log heals on refold) and the sheet emits `opr.assigned`
  forward; the importer's false notes header corrected and the summary states
  the loss ("N notes were in the file — notes are not carried across yet");
  the coverage list is built only while open (it was rebuilding ~4,300 hidden
  DOM elements per repaint at 1,429 held). `do-now.timed` and
  `estimate.recorded` are recorded IN the fold as deliberately unfolded.
  · The smoke's purge-reload check was a RACE, not a fact — a fixed 900ms then
  a selector already true on the old page, so a slow run read 102 stale cards.
  It waits for the navigation as an event now. The instructive part: my
  1.2.3 changes made it flip by timing alone, and the first bisection blamed
  an innocent edit — three consecutive greens after the deterministic wait is
  the actual sample.
  · **1.3.0 "A triage that can reach everything"** ([ADR-0044](docs/adr/0044-sort-mode-and-named-ranges.md),
  [ADR-0045](docs/adr/0045-the-start-verb.md), [ADR-0046](docs/adr/0046-admit-accumulator.md)):
  sort mode over named ranges (the 1,222 loose imported rows were structurally
  untriageable — the `captured` latch is correct AND meant no interaction
  could reach them); the triage card is a button opening the sheet; the parent
  picker narrows as you type, names each option's lineage, and creates-and-
  files in one commit; "Not before" rides the start clock the importer had
  been writing with no surface able to show it; the estimate emitter closes
  the unmet logged-from-v1 commitment. The admit() rework underneath: ONE
  accumulator + dirty-set silent check, whole-batch belts retained, held to
  the old control flow by a 150-seed equivalence oracle
  (test/admit-reference.ts) — **500 events @10k nodes: ~6,250ms → ~55ms**,
  with a CI perf gate the old code reds by an order of magnitude. The oracle
  also found the old flow spraying ineffective cures at merge-silenced nodes;
  the rework skips them and the belt owns the case (the one deliberate
  divergence, tested three ways).
  · Two defects the new gates caught before ship: within-one-commit ULIDs are
  not monotonic, so "oldest first by id" was shuffle order inside an import
  batch (ordering now rides the genesis stamp); and the sheet's temporal rows
  never hid for Menu items, so a date set there would be gate-legal and then
  unrenderable — the rows hide now, with promotion as the door (law 6's
  drift, caught in the same class the plan's law-judge struck for park).

- **2026-07-29 (evening, second promote)** — **`main` fast-forwarded to `44478be` on
  the owner's word to promote**, carrying 0.21.0 (today on paper) and **0.21.1 (the way out of the (i)
  panel)**. Spine run 88 watched green on that exact commit before the fast-forward.
  · **0.21.1 is a device fix. It was reported TWICE**, and the second report is the interesting
  one. The first got a `position: sticky` header, which is correct, which every engine in CI
  honours, and which does not hold on the iPad. **I reproduced the intended behaviour
  perfectly at three viewports** — that is precisely why the first fix was not a fix. When a
  mechanism verifies clean everywhere you can look and the report persists, the answer is to
  **remove the dependency, not to keep testing the mechanism**.
  · **Two bugs were introduced by the fix and caught before shipping**, both of which passed a
  casual look: `#about { display: flex }` outranks the UA's `dialog:not([open]) { display:
  none }`, so the panel closed and stayed on screen — a worse version of the bug being fixed;
  and `<input type="file">` fires a **bubbling** `cancel`, so the new Esc handler shut the
  panel the moment a file was chosen. The first was caught by asserting `checkVisibility()`
  rather than trusting `close()`; the second by the smoke walk.
  · **The underlying cause was length.** The panel rendered every release note at once and
  measured 17,000–25,000px. Fixing the header without that would have left it unusable to
  read. This is worth remembering as a shape: *the positioning complaint was a symptom, and
  the thing generating it was a surface nobody had measured.*
  · New gates are written against the **property** — "the way out is reachable from anywhere
  in the panel" — not against sticky, so they hold whatever CSS achieves it next.

- **2026-07-29 (evening)** — **`main` fast-forwarded to `be7a6a5` on the owner's word to promote**,
  carrying 0.17.1 (the audit fixes), 0.18.0 (rest mode) and 0.19.0 (the Menu and save-for).
  **Spine run 81 was watched green on that exact commit before the fast-forward** (V-10).
  · **Promoted to `be7a6a5` and NOT to the branch head, deliberately.** 0.20.0 (the bother
  flow) landed after the owner's instruction, so it is not what the owner asked for and it waits for the owner's
  word like everything else (Doctrine §7). The app is in active use today, and dropping an unasked
  capability mid-use is precisely what the staging gate exists to prevent.
  · Run 80 shows `cancelled` and that is not a failure: the 0.19.0 push was superseded by the
  Q-10 commit seconds later, and run 81 covers both.
  · **Q-10 closed** — recommending against building vaults; a lens, not a partition. This
  containment (0.13.0) already separates work from home if the owner wants it today.
  · **0.20.0 is on `staging`.** Sixth vocabulary-complete-but-unreachable capability found
  and closed. The count of those is now itself worth noticing: it has been the single most
  productive thing to look for in this codebase, ahead of any kind of code reading.

- **2026-07-29 (late afternoon)** — **0.17.1 (audit fixes) and 0.18.0 (rest mode) on
  `staging`, both watched green: Spine runs 76 and 78.** Rest mode was picked first on the
  reasoning that it is the one v1.5 item that protects the **dogfood gate itself** — thirty
  consecutive days, reset by any lapse, and a bad week is a certainty rather than a risk.
  The re-entry vocabulary had been complete and unreachable since the first draft, which is
  the fifth time this repo has shipped that shape ([ADR-0043](docs/adr/0043-re-entry-is-the-primary-path.md)).
  · **Operational note for future sessions: `curl` cannot reach `api.github.com` from this
  environment.** Three `Monitor` watches built on it ran their full loop and produced no
  output at all, which reads exactly like "still running" and is indistinguishable from a
  green result if you are not careful. **Only the `mcp__github__actions_*` tools work.** A
  poll that cannot fail is a poll that tells you nothing — the same lesson as the
  banned-vocabulary gate, in a different costume.
  · **`main` is unchanged at `574ae5f`.** The owner is using that build; 0.17.1 and 0.18.0 wait
  for the owner's word (Doctrine §7). Flagged to the owner that 0.17.1 carries the report-injection fix and
  is worth having before a status report goes out to anybody.

- **2026-07-29 (afternoon, after the promote)** — **Adversarial audit of 0.13.0–0.17.0,
  the five releases shipped in one sitting. Four real defects found, all mine, all shipped.**
  Ran unprompted while the owner began using the app, on the reasoning that finding
  the fifth thing here beats the owner finding it on day three.
  · **Review stayed silent about a stalled container** whose only remaining child was a
  SPENT resume card — the precise failure the surface exists to catch, hidden by another
  feature's residue. `held.ts` learned that a spent card is not work in 0.14.0 and
  `review.ts` was never told.
  · **A captured title could inject structure into a status report.** Titles are stored
  verbatim by design (the share target composes with newlines), so a multi-line one ended
  the list, opened a heading, and emitted a bare *"Nothing to report."* into a report about
  real work. I had written the CSV formula guard and not applied the same reasoning to
  Markdown. **This is a document handed to another person saying something untrue**, which
  is the most serious of the four.
  · **Work arriving by shard was invisible to every future report.** The delta cut on time,
  so another device's history — stamped before your last report, never seen, never reported —
  fell on the wrong side for ever. `status.report.exported` now carries a **per-device
  high-water mark**, the same structure a shard already uses; old marks fall back to the time
  cut, because data is never lost to updates.
  · **A let-go person was still named as running a tracked project.** `withWhom` checked
  liveness; `portfolio.ts` reached into `state.nodes` directly and did not. A confident wrong
  answer, on the surface whose only job is saying who has what.
  · **Three of the four are the same shape:** one concept, two places, one of them checking.
  Every fix collapses them into one function or one predicate rather than adding a second
  guard.
  · Also probed and **found clean:** resume cards never go silent (law 1); a card whose work
  is trashed disappears without orphaning; the sweep node is neither a stalled container nor
  silent; two devices starting a focus at the same instant converge regardless of arrival
  order; the parent picker never offers a non-container.
  · **Recorded, not fixed: no projection in this app scopes by vault.** The report is not
  uniquely affected — `heldNodes` and every other surface behave the same way — so making the
  report the one vault-aware surface would be worse than leaving it. Raised as Q-10.
  **Shipped as 0.17.1 ITERATION. 306 unit tests; six deliberate-failure proofs across the
  four fixes.**

- **2026-07-29 (afternoon)** — **`main` fast-forwarded to `c480796`, promoted on the owner's
  promote to main** — carrying 0.12.0 through 0.17.0 and the docs work. Spine run 72 was
  opened and **watched green on the staging head before the promote** (V-10); runs 67, 68 and
  70 had gone **red on the banned-vocabulary gate** after I reported nine gates green locally,
  and run 71 confirmed the fix. **On `main` at `574ae5f`: Spine run 74 green and Deploy run 70
  green, both watched** — the deploy is what makes "it is live" a fact rather than an
  inference from a successful push, and V-10 says the observed run gets written down. **Every item on the frozen v1 Must list is now built.** That
  is a statement about the list and not about a version: `NOTES.md`'s own definition of v1 done
  is the **dogfood gate** — thirty consecutive working days — and day one has not happened.
  **(Corrected 2026-08-03: this and every later "the gate has not started" was wrong. It has
  been running since this day and resetting daily. See the gate's own definition above.)**
  **The owner starts using the app today** and will give feedback as issues are found. V-14 remains
  the one claim no gate here can settle.
  **(Corrected 2026-08-10: V-14 was ANSWERED YES on device on 2026-08-09 and is
  closed. Every later line still calling it owed is stale — see
  `docs/verifications.md`, which is the record; this log entry is a snapshot of
  what was true on its own date.)**

- **2026-07-30** — **The QR encoder, and the boundary I drew in the wrong place.**
  Asked why there was still nothing about QR codes. Rightly: it was recorded
  as a decision in ADR-0037 and not built, because I had gated ALL of it behind V-16 —
  whether an iPad can *read* a code. V-16 blocks reading. Showing was never blocked,
  and I could have built it at any point in between.
  · `src/qr.ts`, hand-written: GF(256), Reed-Solomon, byte mode, single-block versions
  1–4, alignment, format information in both copies, all eight masks with the specified
  penalty score, an SVG renderer with a quiet zone, and `pairingUrl` putting the key in
  the FRAGMENT so it never reaches a server.
  · **What CI proves, and from first principles:** the field axioms (not a pasted
  table); the RS codeword against its DEFINING property, that every syndrome is zero;
  the codeword count COUNTED from free modules rather than looked up, with the data
  stream asserted to fill the region exactly; every data position visited once.
  · **What CI cannot prove is [V-17]**: the data/EC split is the one table recited
  rather than derived, and a wrong entry yields a matrix that passes every test here
  and that no scanner reads — the round trip would agree with itself, which is the
  verify-your-own-fake shape this session has now been caught by five times. One
  photograph settles it. Until then no surface may call pairing working.
  · **Two real bugs the tests caught while writing it.** The zigzag skipped the timing
  column only when a pair STARTED on it, so four modules were written twice and column
  6 never. And the format-information strip overwrote the timing patterns where they
  cross and turned the dark module light — invisible to every count-based check,
  because reserving a module twice is idempotent and the codeword total never moved.
  · My penalty test was also meaningless at first: it compared an all-dark grid against
  an all-light one, which are equally penalised. Uniform is not a neutral baseline; the
  rules are now measured as deltas from a checkerboard.
  · Unwired, like `seal.ts`, `relay.ts` and `sync.ts`. The reason there is no QR on
  screen is that the screen it belongs to is Quietkeep Sync, a separate deployment
  that does not exist yet (Doctrine §1).

- **2026-07-30** — **A copy offered when a newer version lands (0.26.0 CAPABILITY).**
  A requirement: offer a backup when an update is detected.
  · **It refuses to imply danger, because there is none of the kind it would imply.**
  The log is append-only, `state = fold(log)`, migrations are additive — an update
  cannot rewrite what is written. "Back up or lose your data" would be a manufactured
  alarm, which is a red wall in a sentence. The real reason is narrower and is stated:
  a release that behaves badly AFTER it lands, and a copy is a point to come back to.
  Tests assert the absence of the alarmist words AND the presence of the reassurance,
  so neither half can drift.
  · **`waiting` alone would have detected nothing on this app.** `sw.js` calls
  `skipWaiting()`, so a new worker activates without asking and `waiting` is empty by
  the time anything looks. `updateIsReady` therefore also treats "the active worker is
  not the one controlling this page" as an update — and excludes a first-ever load,
  where there is no controller and offering a copy of an empty store would be nonsense.
  · A line, never a modal: it does not overlap the capture box (asserted), closes from
  the first frame, and appears once — declining is an answer, not a question to ask
  again.
  · `deliverCopy` moved to `src/ui/export-copy.ts`. The closure it replaced carried a
  note saying a second copy of the deliver-then-record ordering "would be a second
  chance to get it wrong"; the update prompt needing the same thing is exactly the
  moment that note was written for.

- **2026-07-30** — **A gate cure is not a demand (0.25.1 ITERATION).** A second
  export, re-imported on 0.25.0 minutes after the promote: 2,897 events, 1,429 nodes,
  **zero `due` clocks** — every one of the 1,173 stale dates correctly dropped. Folded
  in the real zone (UTC-7, not Denver — inferred from the cure instants rather than
  assumed) the surfaces read **"Ready now: 1,055"** and the badge would have said
  **1,012**. Arithmetically correct and a complete falsehood about the day: nothing
  in the import had been dated.
  · **Third instance of one root cause.** `CALENDAR_KINDS`, then the passed-date
  import, now readiness: the app must not present its own bookkeeping as somebody's
  commitment. Fixed at the root this time — `Clock` now carries `source`, so every
  surface asks one question instead of guessing three ways.
  · **The predicate was wrong twice and the tests caught both.** "Any `gate:` source"
  is the tempting reading and it broke a deliberately promoted Menu item and an
  interrupted focus's resume card. **A cure inherits the intent of the event it
  cured** — `clarify.routed`, `replan.resolved`, `menu.item.promoted`,
  `capture.recorded` are all things somebody DID, and the cure is how that choice
  becomes "now". Only bare `node.created` says nothing about when.
  · Resume cards now set their OWN clock (`focus:resume`) instead of leaning on a
  cure. Every other deliberate act already declared its own; being the exception was
  what made it fragile.
  · **A deliberate-failure proof found the whole change untested**: removing `source`
  from the fold left all 530 passing. Now covered, including the SNAPSHOT round trip —
  without it an undated import would read "Later" on first load and "Ready now" after
  a reload, a surface changing its mind about your day based on how recently you
  opened it.
  · And "nothing is asking" no longer means the section vanishes: it states how many
  things are here undated, waiting on a decision. `undatedCount` is that number.

- **2026-07-30** — **a real OmniFocus import, and what 1,429 rows exposed
  (0.24.1 ITERATION, 0.25.0 CAPABILITY).**
  · **The alignment complaint was a mis-tap.** The border was on `.card-open`, not on
  `.card`, so the action buttons were siblings outside the visible box — and because
  the title is `flex: 1 1 auto` the wrap point moved with each title's length. On a
  long row "Done" wrapped alone, left-aligned, directly above the NEXT item. The box
  now belongs to `.card`, and the actions travel in one wrapper.
  · The a11y gate caught the first attempt (`flex: 0 0 auto` on the group pushed the
  page 192px sideways at 320px/200%), and the FIRST version of the new containment
  gate was a tautology — a flex container always encloses its children wherever the
  border is drawn, so it passed with the bug reintroduced. It now asserts that some
  element DRAWING A BORDER encloses every control, which is about the rendered result.
  · **My first diagnosis of the "needs a new plan" wall was wrong, and the data said
  so.** `raisesReplanCard` already ignores cure clocks — `HARD = ['due','suspense']`
  and cures are `review`. The 1,173 cards came from genuinely passed `due` dates the owner
  set in OmniFocus, earliest **2019-06-11**. Seven years of backlog, all of it past.
  · **So the importer no longer imports a date that has already gone.** A date that
  passed years ago in another planner is a record of a commitment somebody did not
  keep, not one they are carrying — manufacturing a fresh obligation from it is the
  same mistake as putting the app's own clocks in a calendar. The row arrives without
  a date, the gate cures it like anything dateless, and the summary says how many and
  why before anything is written.
  · **And no heading renders more than `LIST_CAP` = 25.** The dedicated replan
  surface has capped at three since it existed; the held list had no cap at all,
  which nobody noticed while the fixtures held eight things. The number held back is
  stated, and the smoke check asserts that revealing produces EXACTLY that many more
  rows — a cap that misreports what it hides is worse than no cap.
  · Proofs: border back on the title button reds the containment gate; removing the
  cap reds three checks; a more-row overstating by five reds the reveal check;
  importing a 2019 date reds the residue tests.

- **2026-07-30** — **Promoted to production: 0.21.1 through 0.24.0 in one step.**
  The owner's word, onto watched-green Spine run 103 (`d60271a`, all 14 steps), confirmed
  by Deploy run 100 on `main` reaching success at the Cloudflare step — never by
  reading production (V-15). Production had been on 0.21.1 while eight releases
  accumulated on `staging` — the gap responsible for a feature being expected
  that the running build did not yet have. The version now renders on the main
  screen, so that question answers itself from a screenshot.
  · What went out: sample work, both clearing modes, the calendar carrying only days
  the reader chose, the on-screen build number, the optional badge with the gauge
  stating the same figure, and the OmniFocus/TaskPaper/CSV import.
  · Sync stages 1–3b went with it and remain unreachable from any surface by design.

- **2026-07-30** — **The badge is optional, and work comes in from other planners
  (0.24.0 CAPABILITY).** Two requirements: make the badge optional too, and
  import an OmniFocus export to test at real scale.
  · **The badge switch lives in `kv`, not in the log.** A badge is a property of an
  installation — the same person may want it on the iPad and off on the phone — so an
  event would make one device's preference follow them onto the other, and would add
  a vocabulary noun for something that is not a fact about their life. Turning it off
  clears the icon in the SAME breath; a preference that waits for the next render
  reads as a switch that does not work.
  · The flag is module state read synchronously, because `render` is synchronous and
  a storage read on the path between a keystroke and a card appearing is the one
  thing this app must never make slower.
  · **`src/taskpaper.ts` reads TaskPaper AND OmniFocus CSV**, sniffed from the
  content rather than the filename — a file renamed between two apps is the normal
  case. Not `.ofocus-archive`: zipped XML of somebody's private sync format is a
  maintenance promise this project should not make, and a text format fails one line
  at a time instead of all at once.
  · **Hierarchy is the point.** Projects keep their children (indentation in
  TaskPaper, a named "Project" column in CSV), and a CSV project named by a child but
  never listed is CREATED rather than dropped — the alternative loses structure
  without losing rows, which nobody notices.
  · Imported dates become `due` and `start` — days somebody chose, so they survive
  `CALENDAR_KINDS` and give the calendar export something real to carry for the first
  time. `@flagged`, contexts, estimates and repeats are dropped and NAMED: this app
  has no priority field on purpose, and a silent discard is a different lie from an
  invented clock.
  · 2,000 rows parse, map and admit with nothing silent and every action parented —
  the scale test checks the parent map still resolves at the end, not just early.
  · Six proofs: no-immediate-clear and preference-ignored both red the badge tests;
  tabs-only indentation, project detection after tag stripping, silent tag discard and
  positional CSV columns each red their own.

- **2026-07-30** — **Two things Found on device on the device (0.23.2 ITERATION).**
  · **The calendar was exporting the app's own clocks as appointments.** Routing to
  Next action sets `clockKind: 'review'` at end of tomorrow — the app's resurfacing
  marker, not a date anybody typed — and `soonestClock` returns any kind, so nine
  items routed in one afternoon became nine all-day events on one day, each with a
  nine o'clock alarm. The reading offered: everything in the list had been given
  a date of today, apparently because the field could not be left blank.
  That reading was right, and so was the diagnosis.
  · **`CALENDAR_KINDS` = `due`, `start`, `suspense`, `park`.** The axis is *did the
  reader choose this day*, not *is it a deadline*: `due` comes only from
  `detail:due` or `replan:compress`, while `review` is what routing, repeats,
  bother handling, the comms sweep, replan's escalate/renegotiate and every gate
  cure set. `park` stays IN — an earlier audit settled that, because the held list
  already shows "parked until…" and dropping it made the app contradict its own
  screen. My first patch reversed that finding; the park test caught it.
  · **A planner that misreports your obligations to a calendar you trust is worse
  than one with no calendar export at all.** The app can be wrong on its own screen
  and be corrected by the next glance; it cannot follow the mistake back out of a
  diary.
  · **The ics fixtures were encoding the defect.** `clockAt` defaulted to
  `kind = 'review'`, so every test in that file asserted that the app's own markers
  belong in a calendar. Default is now `due`, and the regression is driven through
  `routeEvents` itself rather than a hand-written clock — the bug lived in the gap
  between what routing writes and what the export reads, and a fixture-shaped
  approximation of routing would have agreed with either side.
  · **The icon badge asserted a number no surface stated.** It counts `ready`
  correctly, but group headings deliberately carry no counts, so a red 1 on the
  home screen was unfindable inside the app — an unexplained demand, which is the
  one thing this app must never be. The gauge now says "N ready now" from the SAME
  variable that feeds the badge, and the panel explains what the number is.
  · My first smoke check for that was vacuous: it only asserted when the icon had
  been given a number, and at that point in the walk it had been given `clear`.
  A guard on a state the fixture never reaches is not a check.

- **2026-07-30** — **Clearing things out (0.23.0 CAPABILITY).** Settled, answering the open
  question: **both routes stay available, because the person controls their own
  data** — and **a verification stands in front of the act so it cannot be done
  easily, recommending a copy first, with the button to make one right there.**
  · **Two modes, because they are different promises.** *Clear what I'm holding*
  appends one `node.trashed` per held thing — the surfaces empty and the log still
  contains everything, so law 9 stays unqualified and an export taken afterwards is
  complete. *Start again from empty* calls `replaceAll([])`: the only operation in
  this app that destroys data on purpose. Offering only the first would be dishonest
  about what people want; offering only the second would make "clear the list" cost
  the history.
  · **The guard is a typed word, not a held button.** Hold-to-confirm is a dexterity
  test and tremor is a supported condition — a guard a shaking hand cannot pass locks
  somebody out of their own data. Case and stray spaces are forgiven; the check is on
  intent.
  · **The two words differ, and that is load-bearing.** With one shared word, typing
  it for the reversible mode and then switching would carry the authorisation across
  to the irreversible one. The UI half of the same protection: switching mode clears
  the field, asserted in smoke.
  · The backup is recommended with the button beside it, and the sentence above the
  go-ahead states whether a copy has been saved — a recommendation nobody acted on
  has to still be visible at the moment of the decision. It does not block; an adult
  who has read an accurate sentence may proceed.
  · Found while building it: `pick()` revealed the confirmation block before awaiting
  the store read, so the consequence line was briefly visible and EMPTY — a paragraph
  of nothing above the button, in the one place where the sentence is the entire
  safeguard.
  · The a11y gate now opens the confirmation in both audited dialog states rather
  than having the registry name a hidden element. A control that only exists after a
  click is still a control somebody reads, and exempting it would have exempted the
  typed-word box.
  · **Still roadmapped, not built: selecting ranges** (clear or export a chosen
  subset rather than everything), a dry run for bulk acts, and a way to view the log.

- **2026-07-30** — **Sample work (0.22.0 CAPABILITY).** A stated want: a
  set of test data that can be imported. A generator, never a file: a fixture with a
  literal date in it is wrong tomorrow and absurd next year, and every surface here
  is temporal, so a stale fixture exercises the wrong code paths rather than merely
  looking odd. Generated a year apart it describes the same relative situation, and
  that is asserted.
  · It goes in through `session.commit` — the app's own admit-and-append path — so
  the demonstration cannot show a state the app would refuse, and a bug in the
  generator surfaces as a plain refusal instead of as a corrupt store.
  · It contains the AWKWARD states on purpose: a passed date, something with
  another person in it, two unpressured things on the Menu, two unsorted notes, and
  real containment. The smoke checks read the store for each of those, not the copy
  on screen — a proof showed a button reporting "13 sample things" while committing
  nothing left the message assertion passing and reded only the three that read the
  database.
  · `capture.recorded` gains a `sample` source rather than borrowing `quick`, since
  a capture claiming a keystroke it never had is a lie in the one place the app
  keeps its history. Additive; every existing log stays readable.
  · **Two invariants I had wrong, both caught by tests.** The set was leaning on the
  gate's cures because the test helper folded the generator's output directly and
  never went through `admit`; and "a container held up only by its clocked children"
  is not a state this app has — containment satisfies the CHILD, so such a parent is
  still silent and is cured at creation like any other node. A law you can quote is
  not a law you have read.
  · Alongside it: an export's filename carried the UTC instant while the file's own
  contents stated the local day, so an evening calendar export was named tomorrow
  and said today. Found only because the session crossed midnight UTC and two smoke
  checks — themselves comparing a local day against `toISOString()` in a browser
  pinned to America/Denver — disagreed. Both checks had been wrong since they were
  written and passed for eighteen hours a day.
  · **The deploy's `cancel-in-progress` is now false on `main`.** Latest-wins is
  right for a preview and wrong for production: a superseded deploy leaves the
  previous release being served while the run's conclusion reads `cancelled` rather
  than `failure`, so nothing anywhere is red. A sibling app hit exactly this on a
  promote and it was harmless only by luck.

- **2026-07-29** — **Two builds, one branch — and the gate that makes the default's
  promise real ([ADR-0036](docs/adr/0036-two-builds-one-branch.md),
  [ADR-0037](docs/adr/0037-sync-design.md)).** A requirement: two apps: Quietkeep,
  always local-only, and a sync variant — *"Quietkeep is always the default"* —
  and asked how the industry does it.
  · **The industry answer**: overwhelmingly one codebase with sync as an opt-in
  module (Obsidian + Obsidian Sync, Standard Notes, Joplin). Two long-lived
  branches is the rare shape, and where it exists it is usually a governance split
  between different maintainers, not a privacy toggle.
  · **So: two Cloudflare sites, two builds, ONE branch.** The argument that
  settled it is concrete rather than aesthetic — 0.10.1 fixed a CRITICAL defect
  where a validated import file could destroy a store and then fail. On two
  branches that needs applying twice, and **the copy carrying a missed
  cherry-pick longer is the one with more exposure.**
  · **The guarantee is already in `public/_headers` and nobody had noticed.**
  `connect-src 'self'` means the default build **cannot reach another host — the
  browser refuses**, whatever code is in the bundle. That is enforcement, not
  discipline, and it is a far stronger promise than "sync is switched off".
  · **`tools/headers.mjs` is a new gate**, because that guarantee is one line and
  one line erodes quietly: a font host, a debug endpoint, a report collector.
  Proven by breaking it four ways — widening `connect-src` to a relay, a font
  CDN, removing `connect-src` so it is inherited rather than stated, and a
  `report-uri` — **all four went red**.
  · **Stages 1 to 3b are now built and on `staging`** (2026-07-30). No triplet
  bump and nothing reachable from a surface: `src/exchange.ts` (what a device
  holds, as coalesced ranges — because a per-device maximum is not a completeness
  claim and believing it is silent permanent loss), `src/seal.ts` (AES-256-GCM,
  fresh IV per seal, one refusal message for every cause, the summary sealed too
  because an unsealed one is a per-device write-rate graph), `src/relay.ts` plus
  `relay/worker.ts` (a mailbox per sync id, append-only, expiring, refusing
  anything not shaped like a seal), and `src/sync.ts` (the driver, ordered so a
  death mid-exchange leaves the device with strictly more than it had). 63 tests
  across the four, and every claim in their headers has a deliberate-failure proof
  behind it — three of those proofs found tests with no detection power at all,
  including the one asserting the relay cannot read anything, which passed with
  the plaintext on the wire.
  · **Gap repair needs no summary exchange.** `nextSeq` returns 0 for a device
  with no events, so seq starts at zero and a hole below a device's first range is
  PROVABLE from the local log alone. Nothing above the last range is ever
  requested — nothing proves it exists, and asking would post an unsatisfiable
  request on every open until it filled the mailbox.
  · **Stage 4 is built and proven, and blocked on a Cloudflare permission.**
  Pairing is by FILE — the file road was required first, 2026-07-30. One device writes a small
  JSON file carrying the key, the host and the pairing name; the other opens it.
  No camera, no decoder, nothing from V-16 or V-17. The QR is a nicer way to move
  the same 44 characters and can arrive later without changing pairing at all,
  because what pairing DOES is independent of how the key travels. Building the
  pretty rung before the working one was the mistake.
  · **`test/sync-end-to-end.test.ts` is the claim that sync works.** Two real
  sessions over separate stores, the real gate on every keystroke, real seal, real
  `exchangeOnce`, real `httpWire`, and the real relay `handle()` with its routing
  and status codes — only the socket is stood in for. Capture on A, exchange,
  exchange on B, and it is on B. Written because two defects got past 567 passing
  tests: every one of those checked a layer against a fake, and neither defect
  lived inside a layer. They lived in what the layers assumed about each other.
  · Those two defects, both fixed with tests that red on the old code: identity on
  the wire was `device#seq`, but `cureFor` stamps a cure with its cause's device
  AND seq, so the key identified a PAIR and dropped half of every capture; and
  arrivals were re-run through `admit`, which double-mints cures the store then
  refuses. Arrivals are a shard union now (`takeInEvents`), sharing the import
  button's road. Recorded on the hub as LESSONS §7e.
  · **What is left is not code.** The relay cannot be deployed: the Cloudflare
  credential publishes Pages but has no Workers permissions, so there is nowhere
  to create the KV namespace (V-18). Two permissions on the token — Workers KV
  Storage:Edit and Workers Scripts:Edit — and the relay workflow deploys, prints
  its URL, that URL goes in `src/relay-host.ts`, and the Sync edition builds and
  ships. `tools/editions.mjs` builds NO sync edition while that host is unset, so
  nothing can go out dialling a host that does not exist.
  · The sync design itself is recorded and stages 1-3b built. ADR-0037 names the
  three things that still need the owner's word: the doctrine wording (a sync id is
  account-shaped, and "no accounts, no server" stays true only of the default
  build), re-running V-03 against Apple's own documentation if push is ever
  added, and whether this is a **VERSION** — which is the owner's call and is not
  inferred from diff size.
  · Sync at the visibility boundaries, not in the background: leaving the app
  uploads, opening it pulls. True background execution buys only "current before
  you open it", and costs push, an install, an entitlement and V-03.
  · The exposure is written out in full in ADR-0037 rather than summarised — what
  a relay can never see, and what it unavoidably can: **when you use the app, how
  often, and from where.** For this audience that is the shape of your day, and it
  is stated at that weight rather than minimised.

- **2026-07-29** — **Two devices (0.11.0 CAPABILITY,
  [ADR-0035](docs/adr/0035-multi-device-shard-union.md)).** The requirement: multi-device sync is
  opt-in, and personal copies sync so one device can be picked up where another
  was left.
  · **The data model was already there and it was checked before anything was
  built**: folding two devices' logs through the real gate gives everything from
  both, iPhone-first equals iPad-first equals any interleaving, and nothing is
  left silent. `seqByDevice` and per-field last-writer-wins have carried this
  since the spine.
  · **What was missing was a route, not a merge.** [V-01](docs/verifications.md)
  settles that Safari has no directory picker, so ADR-0003's automatic folder
  mirror cannot exist on either device. This is the manual version of the
  same operation, needing no API Safari lacks and no network at all.
  · **It is not the merge law 9 forbids.** That means resolving two versions of
  one state, which cannot be done honestly, and `import.merged` stays banned.
  This is the union of single-writer shards — ADR-0003's own words — where two
  shards cannot disagree about what *happened*. ADR-0035 makes the distinction
  explicit so it is reviewable rather than assumed.
  · **Additive, so it cannot cost anything.** Restoring replaces and is dangerous
  by design; this removes nothing, so pressing it on the wrong file costs a few
  events. The two are separate buttons saying separate things, and the safe one
  is what focus lands on.
  · **Deletions travel**, so it converges rather than accumulating. Taking the
  same copy in twice costs nothing and says so — that is the ordinary case for
  anyone actually using two devices, and an unfiltered append would have thrown
  on the store's unique-id index.
  · **Stated limit, not hidden**: edit the same field on both devices before
  exchanging and last-writer-wins picks one silently.
  · **Not assumed for anyone else.** Connectivity on every device a person owns
  cannot be assumed, so nothing here touches the network and the app is complete
  without ever opening this.
  · Verified in **two real browser contexts** with separate IndexedDB stores:
  each captured its own items, one took in the other's copy, both sets survived,
  and a second exchange took nothing.
  · 188 tests, all 8 gates green. Lands on `staging`; waits for the owner's word.
  · **Still open, and the owner's call**: whether the manual exchange is low-friction
  enough in real use. If it is not, the next question is a transport — and every
  candidate (a relay, a native wrapper) crosses a line in the thesis, so it is a
  separate decision and a separate record, never an implementation detail.

- **2026-07-29** — **Three things Found on device on the device, and two the audit did
  (0.10.1 ITERATION).** All of it came from actually using the app, which no gate
  in this repo can substitute for.
  · **"There is nothing to mark the item done rather than starting a 2 minute
  timer."** Routing something to *Do now* clocked it for today and then offered
  no way to say you had done it, so a two-minute job sat under "Ready now" until
  you found it in the list. The timer also **started on its own**, turning a
  category into a stopwatch nobody asked for — the direction given: the two-minute timer
  is an offering, not a gate. It is now offered beside a **Done**, and
  Done is one tap before the timer, during it, and after it.
  · **"Doesn't ask you if you completed it in the two minutes."** Reaching zero
  committed `outcome: 'completed'` — **the app asserting, in a permanent log,
  that a person had finished something it never asked them about**, for an
  audience whose whole difficulty is with time. It now asks, and records nothing
  until answered. Neither answer is a failure.
  · **A bug underneath that report**: `#triage-donow` lived INSIDE the triage
  section, which hides itself the moment the inbox is clear — so routing your
  **last** item to *Do now* made the offer vanish, and a running timer went on to
  reach zero invisibly. The old comment said it lived "outside the card", which
  was true and not enough. It is now outside the section.
  · **"Pressing calendar shows no indication it did anything."** It always
  worked. The confirmation renders *above* the button, the panel is thousands of
  pixels tall, so by the time you had scrolled to the button the message was off
  the top of the screen. Moved below it.
  · **"There is no X to close the popup."** The only way out sat beneath every
  release note — **measured at 10,130px down**. There is now a sticky close at
  the top. At 320px and 200% text it first took **99% of the dialog**, which the
  a11y gate caught as WCAG 2.2 **2.4.11 Focus Not Obscured**; compacted to 48%
  with the title intact, and `scroll-margin-top` keeps focused controls clear of
  it. A `rem` threshold in the media query silently never matched — inside a
  media query `rem` resolves against the *initial* root font size, not the
  zoomed one.
  · **From the audit, CRITICAL and now fixed**: a file `inspectExport` called
  READY could destroy the store and then fail. Two records sharing an id passed
  inspection, the append hit the unique-id constraint **after** the clear, and
  the user's real items were gone — replaced by whichever rows landed first, with
  a raw database error on screen, under a patch note promising exactly the
  opposite. `inspectExport` now asks every question the store will ask (duplicate
  ids, and the gate's own shape rules from one shared definition), and
  `store.replaceAll` is **atomic**, because validation can never rule out a quota
  failure mid-write.
  · **Also from the audit**: `inspectExport` could throw (`fold` reads payloads
  unguarded, outside the only try) leaving the surface on "Reading it…" for ever;
  import bypassed every shape check the gate makes, so `seq: 1e999` produced a
  permanently unwritable store; and `DexieLogStore.reset()` cleared `kv`, so
  every successful import silently discarded the in-flight capture draft — the
  thing ADR-0008 exists to protect. `MemoryLogStore` never did, which is why no
  Node test could see it.
  · **A tooling lesson**: spreading `AppEvent` in a test took `tsc` from 2s to
  over 3 minutes. It is a large discriminated union and the spread distributes
  across every member.
  · 183 tests, all 8 gates green, both themes.

- **2026-07-29** — **The way back in (0.10.0 CAPABILITY).** The app could hand you
  your entire log and had **no way to read one back**. `importSeedingFresh` existed,
  was tested, and had no surface at all — so moving to a new device meant starting
  again, and the Export button produced a file nothing could open. For an app with
  no accounts and no server, that is not a missing feature; it is the "your data is
  yours" promise with no exit.
  · **Choose, be told, confirm.** `inspectExport` reads a file and describes it
  **without touching anything** — how many things, how many records, when it was
  made — and the destructive control does not appear until it has. It **never
  throws**: a corrupt or hostile file is an answer, not an exception, and this is
  the surface people reach for when something has already gone wrong.
  · **One definition.** `importSeedingFresh` re-asks the same function at the
  destructive boundary rather than trusting that the surface looked. The failure
  it prevents is a panel saying "37 things, ready" and the import then refusing,
  which is worse than either answer alone because the person has already decided.
  · **Saving a copy of what is here is offered first and listed first**, because
  import replaces and never merges (law 9) — and the app says so in those words.
  · **Found by the smoke walk, not by reasoning**: the panel's "Things held" used
  `nodes.size` while the gauge on the screen behind it used `heldNodes`, so one
  sentence read *"that file holds 8 things … replaces the 9 things on this
  device"* about a file exported from that device seconds earlier. Same words,
  two numbers, differing by whatever had been let go. Both now use `heldNodes`.
  · 178 tests, all 8 gates green, both themes. Four §6 deliberate-failure proofs;
  one (`items` counting every node) **stayed green on the first attempt** and got
  a real test before it counted.
  · Lands on `staging`; waits for the owner's word.
- **2026-07-29** — **A date that has gone by is a decision, not a row (0.9.0 CAPABILITY,
  [ADR-0034](docs/adr/0034-replan-cards-are-computed.md)).** `CLAUDE.md` has claimed since
  the beginning that product law 3 "carries teeth in code". **It did not.** `fold` had no
  `replan.raised` case at all, so a replan card could not exist in state, and a hard date
  three days behind you rendered as "ready now" — indistinguishable from something due this
  afternoon, which is the *past bucket* law 3 forbids, wearing the present tense.
  · **Only hard clocks raise a card.** The gate writes a `review` cure clock for **every
  capture**, so counting soft clocks would manufacture one shame surface per captured
  thought — law 3's forbidden bucket arriving through ADR-0011's front door. Recurring
  upkeep is carved out for the same reason: law 5 says an upkeep is never a failure to have
  not done yet, so a plant that wanted water on Tuesday comes round as a chip.
  · **Computed, never stored, and ADR-0012 could not have both.** It said "the fold
  generates `replan.raised`" one sentence after "a computed consequence… cannot go stale".
  `fold` is pure and has no clock, so it structurally cannot do the first; giving it one
  would break `state = fold(log)` and make the second false. Nothing emits `replan.raised`.
  ADR-0034 records it; ADR-0012 and the vocabulary are corrected in place rather than
  quietly rewritten.
  · **One item, one question.** `workSurface` excludes every id with a live card, chips
  included. The held list keeps them — the sum of its groups is what the coverage gauge
  counts — under **its own heading**, because a screenshot showed four of them filed as
  "Ready now" with Done buttons: the very defect the exclusion prevents, relocated. **No
  assertion caught that; looking at the render did.**
  · Five resolutions, none of which files a failure. Each retires the date it resolved —
  without that the card came straight back, so resolving it resolved nothing, and my own
  test caught it.
  · The cap is 3 (law 8) while the exclusion is uncapped, so the view states the **true
  total** and the list still holds every one. A cap that hides work is a lie by omission.
  · 170 tests, all 8 gates green, both themes. Four §6 deliberate-failure proofs run
  against the new smoke checks — drop the exclusion, drop the list branch, stop retiring
  the date, invent a date for an empty box — and **all four went red**.
  · **Then three skeptics ran, and the first version of this entry was too
  confident.** Everything below was reproduced, and fixed in the same release:
  · **A resolution retired one clock, not all of them.** A node with a passed `due`
  *and* a passed `suspense` came straight back for four of the five options —
  buttons that did nothing while announcing that they had. `compress` retired
  nothing at all, on reasoning true only when the passed clock *was* the `due`.
  **Fourteen of the fifteen (choice × clock-shape) cases had no test**; every
  existing call passed `'due'`.
  · **0.9.0 silently broke 0.8.0.** `ics.ts` selected calendar entries from an
  ALLOWLIST of group keys, so adding the `replan` group dropped every passed hard
  date out of the `.ics` — the one thing a reminder is most for — with all eight
  gates green, because the smoke check compares the file against the surface's own
  promised count and both moved together. Now an exclusion, so a new group
  defaults to included.
  · **Four gate checks were theatre.** The cap asserted against the constant the
  code uses (self-referential — raising it to five stayed green); the "order is
  total" test was `f(s) === f(s)`, true of any pure function; `card.fed` compared a
  constant with itself; and `replanWords` / `contextWords` / `countWords` had **no
  coverage at all**, so a card 400 days behind could read "that date was yesterday"
  and pass.
  · **Copy that was not true**: "a Menu item carries no clock" (the gate cures the
  cleared date, so it carries one — and law 6 governs *kinds*, not Menu
  membership); "the commitment this **fed**" (no dependency exists in the log to
  describe); "asked about once, in one place" (the held row still offers Done);
  "each branch terminates on its own rather than leaning on the gate's cure"
  (three of five do lean on it).
  · **An Area with a due date got five action-shaped buttons**, one of which turned
  it into a waiting-for — refused by Next-up under law 4 and offered here at the
  same moment. And `escalate` wrote `from: 'action'` into an append-only log
  whatever the node actually was.
  · **A recurring upkeep that had come round again was filed under "Done"** while
  the chip beside it offered it as live work — one node, two contradictory
  statements. Pre-existing, and ADR-0034 had just asserted otherwise.
  · **Known and unmeasured, recorded rather than papered over**: `.replan-context`
  renders only for a node carrying a `suspense` clock, and no surface can write one
  yet, so its *rendered contrast* is untested. Its wording and guards are
  unit-tested. The a11y comment previously called that omission a virtue.
  · Lands on `staging`; waits for the owner's word.
- **2026-07-29** — **The app can reach you when it is closed (0.8.0 CAPABILITY,
  [ADR-0033](docs/adr/0033-calendar-export-t1.md)).** This closes a hole in the **thesis**,
  not a missing feature: NOTES says the return "is not a feature — it is the structural
  property the whole schema exists to guarantee", and until now that guarantee held only
  **while the app was open**. Everything built so far depended on the owner remembering to look
  — which is precisely the capacity the app exists to compensate for.
  · **T1 per [ADR-0007](docs/adr/0007-notification-tiers.md)**: an `.ics` with `RRULE` and
  `VALARM`, handed to the OS calendar, which already has notification permission and
  already runs when this app does not. **No server**, which is part of what this app is.
  · **All-day events, so the file contains no `VTIMEZONE` and no `TZID` at all** — a clock
  here is an end-of-local-day instant, and a timed event would fire every reminder at
  23:59. The alarm is relative (`PT9H`), so the calendar resolves 9am *where the reader
  is*, without the file naming a zone. Tests pinned to Denver and Kiritimati (+14), as
  build-plan item 30 requires in so many words.
  · **One definition of what belongs in it**: the `ready`/`soon`/`later` groups from
  `held.ts`. A second rule would eventually disagree with the first and leave the user with
  a calendar quietly contradicting the app.
  · Escaping and folding are load-bearing, not housekeeping: a share-target capture
  composes text with **newlines**, and a bare newline terminates a property and corrupts
  the file. A test feeds it `a;b,c\d\nSUMMARY:INJECTED\nEND:VEVENT` and asserts one event
  survives. Folding is at 75 **octets** on a code-point boundary.
  · **T0's badge landed with it**, counting only the `ready` group — a badge showing
  everything you hold is a number that never falls, which is a nag rather than information.
  · The button is **never disabled**: with nothing to send it stays reachable and says so
  when pressed, because a disabled control is invisible to a keyboard user and explains
  nothing. That change came out of the a11y gate refusing to audit an unreachable ring.
  · **Still unverified, and it is the only verification that counts**: whether the OS
  calendar actually fires these alarms on a real iPad with the app closed. CI structurally
  cannot prove it.
  · 133 tests, all 8 gates green. Lands on `staging`; waits for the audit and the owner's word.
- **2026-07-29** — **What you are holding is a todo list now (0.7.0 CAPABILITY,
  [ADR-0031](docs/adr/0031-node-renamed.md), [ADR-0032](docs/adr/0032-held-list-grouped.md)).**
  A stated want: some sort of todo list, soon.
  · **Grouped**: Not sorted yet · Ready now · Coming up · Later · On the Menu · Done.
  Computed, stored nowhere, empty groups not rendered, and **no counts and no score** —
  they are headings, not a tally of things undone (law 5). **Totality is the load-bearing
  property**: every held node lands in exactly one group and the groups sum to the same
  number the coverage gauge claims, proven over a 60-node fuzz.
  · **Tick it off in place.** The card became a row with two controls; it had been one
  large button, which is why it could not gain a second (a button inside a button is
  invalid HTML).
  · **Rename** — the first addition to the closed vocabulary since it was written, so it
  cost an ADR rather than being absorbed quietly. `node.field.set` was the obvious reuse
  and is wrong: fold writes it to `n.fields`, never `n.title`, so it would store a shadow
  title no surface reads — the log lying rather than merely silent.
  · **An honesty fix**: a finished item keeps the gate's cure clock, and the list reported
  that as "returns today". It says `done` now.
  · **A real defect fixed**: `handleUrlEntrances` and its undo called `render()` bare,
  dropping `openDetail`, so after a link capture no card opened its sheet until the next
  re-render. Smoke asserts tappability after a URL capture, made to fail first.
  · **The a11y gate caught two more in my own work**: a group heading as an `<li
  role="presentation">` strips the listitem role and leaves a `<ul>` holding a
  non-listitem (serious axe `list` violation — the grouping would have been invisible to a
  screen reader), and `.card-done` was registered in a state where it does not exist, which
  the registry correctly refused as "matches nothing visible" rather than passing blind.
  · **ADR rule 4 applied to myself**: the first draft was one record covering rename *and*
  the list. "If it needs 'and', it is two records" — so it is two.
  · 109 tests, all 8 gates green. Lands on `staging`; waits for the audit and the owner's word.
- **2026-07-29** — **Phase 3.5: the app is a planner now, not a triage loop (0.6.0
  CAPABILITY).** Tap anything you are holding and a detail sheet opens: give it a real
  date or take one off, make it repeat (its own interval AND its own comfort window),
  take back a "done", keep something you had let go, or put it on the Menu. Every intent
  is built from events **already in the closed vocabulary** — nothing new was invented.
  · **Why this jumped the build-plan order** (a stated want: something to play with and
  test, and some sort of todo list soon): an audit of what the UI could
  actually emit found **11 of 90 event kinds**, no date input anywhere, and — worst —
  `upkeep.interval.set` had **no caller at all**, so the decay primitive and the Upkeep
  chips shipped in 0.5.0 were unreachable by construction. Phase 4 (focus anchors) would
  have added more engine to an app you still could not plan with.
  · Dates resolve by **probing the user's zone**, because no fixed UTC hour is inside the
  same local day everywhere — offsets run −12 to +14, so noon UTC on the key date is
  already tomorrow in Kiritimati. Tested in six zones including +14, +12:45 and −11.
  · The a11y gate caught the sheet overflowing **121px** at 320px/200% — the repeat row
  cannot fit on one line at that size — and it now becomes a column.
  · **Still missing, and named so it cannot be forgotten:** there is no **rename** (the
  vocabulary has no event for changing a title, so it needs a deliberate addition, not a
  slipped-in one) and no **Menu surface** yet, so someday/reference items are reachable
  only through the sheet.
- **2026-07-29** — **The Phase 3 audit (three skeptics) found a defect that could brick the
  app, and it shipped as 0.5.1 the same day.** 96 unit tests now, all 8 gates green.
  · **Severe, and live in production when found:** one malformed date anywhere in the log
  threw `RangeError` out of the render path — which runs *before* capture's submit listener
  is attached. A form with no submit listener does a **native GET navigation**, so anything
  typed in that state was cleared and destroyed with no error, permanently, across reloads.
  The data was intact and unreachable. It was a **regression** introduced by the V-13 fix:
  the old `friendly()` divided milliseconds and degraded to the harmless string
  "Invalid Date". Three locks now — `isValidIso` at every caller, the gate refusing
  non-instant dates at the door, and try/catch around every render including the first.
  · **Un-completable items:** two guards disagreed about an interval of 0, so an item could
  ride a stale cure clock for ever while Done did nothing. One predicate now.
  · **Vanishing work:** `due ?? start ?? suspense ?? review` was a precedence by *kind*
  named "soonest", so an item with a review-today and a due-next-month dropped off the
  surface entirely. Any demanding clock now counts.
  · **Law 4:** goals, areas, outcomes and projects were offered as the next thing to do,
  with a Done button. The runway is the only workspace.
  · Chips ignored the Menu and inbox exclusions (law 1 clause c); a ready upkeep rendered
  **twice** on one screen with two Done buttons; the gauge counted trashed nodes its own
  list omitted; NaN cadence produced the *loudest* phrase in the app; resume cards could
  never retire; focus stranded on `<body>`; failures were announced only to screen readers
  ([F-08](ACCESSIBILITY.md)).
  · **Two of my own gate checks were proven THEATER** and rebuilt: "the completed thing is
  no longer offered" passed with the fix deleted, and its comment falsely credited the smoke
  walk; "every held item is listed" only asserted `rows > 0` and passed with the list
  truncated to one. Both now ask the question that matters.
  · **Two false claims of mine corrected:** ADR-0030 said ranking "already knows where
  resume cards go" (nothing could retire one); `time.ts` justified its DST shortcut with
  "transitions happen between 01:00 and 03:00 in every zone", which an enumeration of all
  15,887 IANA transitions 1990–2040 disproved — Nuuk and Scoresbysund shift at 23:00, and
  Santiago falls back over midnight. The overlap is now resolved to the later instant and
  checked against an independent bisection oracle over 10,220 zone-days.
- **2026-07-29** — **Phase 3 (work mode) is building on `staging`: the app is now worth
  opening in the morning (0.5.0 CAPABILITY, [ADR-0030](docs/adr/0030-work-mode.md)).**
  It opens with **one thing to do**, chosen by a fixed precedence — hard landscape >
  resume cards > pressure > anything else whose clock arrived — and it says which tier
  fired, in words. **"Not this" records nothing**: no event, no field, no persistence, and
  the smoke walk counts the IndexedDB log before and after a skip to prove it rather than
  assert it. Behind the head sits a capped five; Upkeep chips carry the recurring things;
  and the coverage gauge became a **button** whose number opens into the itemised list that
  backs the claim. The decay primitive ([ADR-0010](docs/adr/0010-decay-primitive.md)) is
  now real code: `(elapsed − interval) / comfort_window`, continuous, unbounded, computed
  at read time and stored nowhere — `null` rather than `0` where there is no cadence, and
  **never-done is ready, not infinitely late**.
  · **[V-13](docs/verifications.md) is fixed first**, because everything here says
  "today": `src/time.ts` is a pure zone-aware primitive, the zone read once at the UI edge
  and threaded through `openSession` → the gate → the route intents, never stored in the
  log. The display path had the same bug (`friendly()` divided elapsed ms, so it said
  "today" at 23:00 about tomorrow). Eight zone tests pinned to Denver, Kiritimati (+14) and
  Chatham (+12:45); reverting the primitive fails five of them.
  · **The gates caught two real defects in my own work**, which is what they are for: a
  completed one-off was offered for ever (the gate re-clocks `done.marked` to keep it
  non-silent, so an explicit "done and not recurring is finished" check was needed), and
  `.coverage { display: flex }` **silently defeated the `hidden` attribute** — the list
  rendered expanded while `aria-expanded` said `false` ([F-07](ACCESSIBILITY.md)). A
  global `[hidden] { display: none !important }` is the structural fix.
  · The **banned-vocabulary gate rejected my own comments** for explaining the prohibition
  using the prohibited word. ADR-0010 says it belongs only in that record and the
  vocabulary, so the comments were reworded rather than the gate widened.
  · Deferred with a reason: build-plan item 22 (comms-sweep chip on focus-exit ramps)
  needs focus ramps, which are Phase 4.
  **70 unit tests, all 8 gates green. Lands on `staging`; waits for the adversarial audit
  and the owner's word.**
- **2026-07-28 (evening)** — **Phase 2 is building on `staging`: the app can triage what it
  holds (0.4.0 CAPABILITY, [ADR-0029](docs/adr/0029-triage-model.md)).** Two passes, both
  computed from the log: an optional **heat** pass (hot/cold, `heat.set`) and a forced-choice
  **clarify** pass with six routes, each committing `clarify.routed` **plus its own terminal
  event** in one gated commit — do-now/next-action/waiting-for clock, waiting-for also changes
  the node kind, someday/reference to the Menu, trash trashes. Building the §6 proof
  corrected a false claim I had written into the first draft: the gate's `clarify.routed`
  cure is **unreachable** — a node is always already covered by the time it is routed, and
  routing removes no coverage, so the cure never fires. The real floor is that a captured
  node is covered from capture onward; a bare route (terminal event forgotten) stays under
  its capture clock, and when that clock is also stripped it is `clock.cleared`'s cure that
  holds — both asserted, both made to fail first. `fold` learned
  `heat`/`route`/`sourceTags` (LWW-stamped; snapshot round-trip tested after the audit's lossy
  finding). The smoke walk captures six, drains the heat pass, routes all six ways and reads
  `0 silent` from the held gauge; a11y renders both passes in both themes.
  A 320px/200% overflow the triage grid introduced was caught by the a11y gate and fixed
  (`minmax(min(9rem,100%),1fr)`). The 0.3.0 promote to `main` was a real §7 pass (verified by
  fetch), the owner's earlier promote and continue this session.
- **2026-07-29** — **The Phase 2 adversarial audit ran (four skeptics) and it earned its
  keep.** Every finding was fixed on `staging` before any promote (45 unit tests now, all
  gates green):
  · **Crash on upgrade (live):** a pre-Phase-2 snapshot has no `sourceTags`, and the clarify
  queue threw on `.includes` with 2+ inbox items — the update breaking the inbox, which the
  data law forbids. `deserialiseState` now backfills the Phase-2 fields; `captured ?? true` is
  correct for legacy data.
  · **Inbox pollution:** membership was keyed on `route === null`, so any unrouted node (a
  person, a bother, a Menu-promoted action) would enter clarify and hard-fail its routes. Added
  a `captured` provenance latch; the inbox is captures-not-yet-routed only.
  · **`sourceTags` holed copy-on-write** (aliased the base node and the log payload) — now
  cloned on write and copied on store.
  · **Focus fell to `<body>` after every triage tap** (WCAG 2.4.3) — now moved to the prompt;
  the a11y gate activates a route and asserts it, made to fail first.
  · **do-now timer** mis-attached to the next card and could drop its outcome or double-commit —
  now in its own region, `finish()` idempotent, starts only on a landed route.
  · **Gate theater:** `.includes('0 silent')` is true for "10 silent" — now parses the number.
  · Documented (not patched): the same-day clock uses end-of-**UTC**-day ([V-13](docs/verifications.md)).
  **Promoted to `main` the same day** on the owner's word to promote and continue, onto spine run 31
  watched green — so `quietkeep.pages.dev` serves triage.
- **2026-07-27** — Repo bootstrapped (Doctrine §13 items 1–4). Verification pass
  run and recorded. v1 frozen. Event vocabulary defined. 19 ADRs written. The
  three docs generated. Build plan written. No application code.
- **2026-07-28 (evening)** — **Phase 1 is complete, and behind a strict CSP.** The three
  public capture entrances shipped — `/capture?text=`, Web Share Target, and the manifest
  `?capture=1` shortcut — each landing in the same gated `captureEvent`, each with a visible
  confirm and an undo, each scrubbing its query so a refresh cannot re-fire it. A strict
  `default-src 'none'` CSP landed in the same change (0.3.0, [ADR-0028](docs/adr/0028-public-capture-surfaces.md)),
  possible here because the app has no inline script; it is verified by `serve.mjs` applying
  the real `_headers` so every browser gate runs under it. Promoted 0.2.4 to `main` first
  (on the owner's word), so `quietkeep.pages.dev` serves the audited app.
- **2026-07-28 (evening)** — **The claimed a11y gate exists now, and it caught a real
  defect on its first run.** `tools/a11y.mjs` audits the *rendered* app in CI — per-state
  selector registry, computed contrast in both themes, axe 4.10.2, targets, and 320px at
  200% text. Its first run found **F-01**: the storage note sat inside the `<dl>`, invalid
  to assistive tech; fixed in the same commit the gate landed (B-08's rule, kept
  literally). Proven to bite both ways: a broken token → 16 failures, exit 1. Smoke also
  gained the cold-capture **CI proxy** — 134 ms boot / 67 ms write against generous
  bounds; the binding 2 s number remains a device reading. Shipped as 0.2.2.
- **2026-07-28 (evening)** — **The write path is serialized and the worst network is
  handled.** Two defects from the model-switch review fixed with proofs: concurrent
  commits could silently collide on `(device, seq)` — Dexie's index is non-unique — so
  commits now queue, with a test that fails when the queue is bypassed; and navigation was
  network-first with no deadline, so lie-fi could hang the shell past the 2-second budget —
  it now races a 2 s deadline and serves the cached shell while freshening behind.
  [ADR-0027](docs/adr/0027-cure-stamps.md) settles the tension the review surfaced: cures
  *share their cause's stamp* by design (replay determinism), so gap-freeness is defined
  over offered events and cures are derivable attachments. Releases 0.2.0 (ⓘ panel,
  export — which fixed the "export a copy" copy pointing at a door that didn't exist) and
  0.2.1 shipped with the changelog now a generated, gated artifact: CI asserts the head
  triplet equals the service-worker cache name and each bump matches its declared kind.
- **2026-07-28** — **Quietkeep ran on the iPad, and V-00's first half is answered.**
  `persist()` returned **true** with notifications granted, quota **38 GB**, and the app
  survived a force-quit with its data intact — the promise tested the only way that counts.
  The gauge read `1 held · 0 silent` off **2 events for 1 node**, which is the gate's cure
  firing on the device rather than only in Node. Step 2 — does `persisted()` still say yes
  tomorrow — is the half that matters and is still open.
- **2026-07-28** — **Phase 1: the app exists.** Shell, manifest, service worker, and the
  Dump surface — zero chrome, one line per card, drafts persisted per keystroke, every
  write through the gate and committed *before* the UI confirms. Two decisions the build
  plan deferred are settled in [ADR-0026](docs/adr/0026-ui-and-build.md): **no framework**
  (the platform does dialogs, focus and keyboard better than anything I would add) and
  **one esbuild step**, because TypeScript was chosen deliberately and browsers cannot
  strip types. The headless walk asserts the promise rather than the plumbing — capture,
  full reload, still there — and was made to fail first by dropping the write while
  leaving the "Held." confirmation in place, which is exactly the lie ADR-0008 exists to
  prevent. **`public/index.html` now exists, so the deploy stops skipping.** The shell
  also carries the V-00 storage panel, which unblocks the repo's oldest open check.
- **2026-07-28** — **The repo metadata is finished, and I was wrong about it twice.** The owner
  set all four §10 values and uploaded the social preview. I twice reported the `indexed`
  topic as still broken, quoting an API response — **the owner had fixed it before the first
  report.** The GitHub *search* API is a cached index, and its own stale `updated_at` was
  sitting in the same payload, frozen across four pushes, unread both times. The direct API
  403s through the proxy, so a session cannot read this repo's live metadata at all: §10
  confirmation is the owner's word and there is no second opinion. Recorded as
  [V-11](docs/verifications.md) — the error worth keeping is that "read back from the API"
  was reported as *stronger* than the owner's word when it was weaker.
- **2026-07-28** — **No spiral, and the mark came out of the dark.** A spiral is loss of
  control and anxiety-laden; it is now a flat product rule beside no red walls and no
  streaks. The palette inverted rather than paled — the three-step ladder needs ~9:1 of
  range, so lightening the field meant darkening the wall. It measures better than what it
  replaced and fixed a grayscale collapse at 32–48px nobody had caught.
- **2026-07-28** — **Quietkeep has a face.** Five candidates came back from image
  generation; the background that won is the one that says the epigraph — things set down,
  one small light — and the one that lost did so because it reads as an orbital diagram,
  which belongs to *clear-horizons*. **None of the three generated icons survived 48px**,
  so the mark was drawn instead: an icon is geometry, and contrast can be measured rather
  than re-rolled. `tools/brand.mjs` renders every size and checks them, and it was broken on
  purpose first — `1.41:1`, exit 1 — before being believed. Its own first version measured
  the type against itself and reported a meaningless `1.00:1`; it now measures the plate
  behind the text. [ADR-0025](docs/adr/0025-visual-identity.md), `ACCESSIBILITY.md` B-10.
- **2026-07-28** — **The repo is `njefferson/Quietkeep`**, and the deferred `LICENSE.md`
  Required Notice URL moved with it. Q-04 closed — Confirmed `quietkeep.pages.dev`
  clean, so V-04 is VERIFIED. Cloudflare secrets are in place and the deploy workflow
  exists, mapping `staging` to a preview URL so the §7 gate is something the owner can open rather
  than a convention I observe; it skips cleanly because there is still no app shell.
  **And the Spine gate turned out never to have passed** — four runs, four failures, all at
  `npm ci`, on invalid JSON in `package.json`. Every session had verified the spine by
  invoking the tools directly, which bypasses that file, so local was green while CI was
  red and nobody opened the run. Fixed, and **run 5 is the first green one**. Recorded as
  V-10 and in the hub's LESSONS.md; the rule is *if you cite a workflow, open the run.*
- **2026-07-28** — **The app is Quietkeep.** The choice was it and ran the App Store check on
  a real device. It cleared all five checks in the order ADR-0023 established, starting
  with saying it out loud. Q-02 closed after four names and thirty-odd further candidates;
  Q-04 unblocked to `quietkeep.pages.dev`. The round's candidates and their causes of death
  are appended to the graveyard — it is the trail the search took, and it stays open for
  reconsideration rather than closed as exhausted.
- **2026-07-28** — Named **Wynts**, then withdrew it the same day: it sounds like *wince*,
  which the app's own shame-free voice rules forbid. Every check run against it was a
  REGISTRY check; none said the word out loud. Saying it aloud is now check #1. The name
  never reached `main` — the staging gate contained it. Earlier: named Wynts after
  twenty-three candidates; *Detent* and
  *Parallax* both died to the proper checks (an App Store app; a same-category PM
  platform). Built **Phase 0** on `staging`: the property test caught a real bug where
  captured items were created with no way back to the user. Earlier the same day —
  named Perennial, then **withdrew it**: three software
  companies hold it, and checking on a real device found `perennial.pages.dev` already
  occupied. The recommendation rested on two searches that asked *"is another planner called this?"*
  instead of *"is this name taken in software?"* — the standing rule above exists so it
  does not recur. Also corrected V-04a (a VERIFIED row that was wrong, and the
  recommendation built on it), proved V-05 (`pages.dev` unreachable from a session) and
  V-09 (a query shape that returns SEO articles instead of products). Opened Q-06/Q-07 on
  the astro app's naming and hub description.
- **2026-07-27** — the owner answered all six open questions. Q-01, Q-03, Q-05 closed;
  Q-02 reopened as a rename. **Platform corrected: iPadOS is the reference platform,
  not a fallback** — the folder mirror demoted to a desktop convenience, export/import
  promoted to the durability story and moved into Phase 0, capture budget re-pinned to
  the iPad. V-06 (GFE) withdrawn as out of scope; V-07 promoted to **V-00** as the
  highest-value open check. Added to the hub's governed-apps list.
