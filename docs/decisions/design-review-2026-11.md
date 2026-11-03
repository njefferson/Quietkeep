# Design review, November 2026: the first draft against what it was for

This document is a review of the first draft of Quietkeep. It is not a plan. It decides
nothing, builds nothing, and changes no surface, noun or behavior of the app. It is written in
passes, each adding its own section below the last, in this order: where the app is, what the
research already holds, what was asked, what the other research and plans already hold, research
additions (written in two passes, R1 to R20 and then R21 to R28), what stands and what falls and
what is missing, and a proposed shape. The first pass wrote the first two sections, the second
wrote what was asked, the third wrote the other research and plans and the first research
additions, the fourth continued the research additions, and the fifth wrote the last two sections.
The note on reading just below was written for the first two sections and is true of them only;
the later sections say how they are read at their own heads.

The first draft means the app as the record describes it on the day of reading: the release at
the head of the changelog, and everything the decision records say about how it got there.

## How to read the first two sections

- Facts only. Each line says what a file says and names the file in brackets at its end.
  Judgment (what stands, what falls, what is missing) belongs to a later section and none is made
  here.
- Where two files disagree, both are given and the line opens with the word Disagreement. They
  are collected again in one list at the end of "Where the app is", so a later pass can find
  them without rereading.
- Where something was searched for and not found, the line says not found and names what was
  searched.
- Reading coverage, stated so a later pass knows what was and was not read whole. Read whole or
  nearly so: the code map, both research catalogs, the event vocabulary, the manual, the decision
  index (all 126 rows) and the decision records the sections below lean on (0008, 0010, 0013,
  0029, 0054, 0060, 0073, 0085, 0086, 0092, 0096, 0108). Read in part: NOTES.md, about ten
  thousand lines, most of them the release log and cold-read records; its thesis, laws, scope,
  dogfood gate, open and closed questions, known defects and Block register were read and the
  rest was searched. The changelog was read by its 311 release headings and its newest releases.
  Source files were read where a line below names one. [this pass]
- Laws are listed as the cited record names them by number. For records numbered 0100 and above
  only the index row was checked unless the record is listed above, so an absence there means
  not found, not none. [this pass]

---

## Where the app is

### What the app is, in the record's own terms

- Quietkeep is a free, local-first planner: a static progressive web app, no accounts, no
  telemetry, no server-side user data, deployed to Cloudflare Pages. [CLAUDE.md]
- The thesis: most planners serve someone whose problem is organizing what they already
  remember; this one serves someone whose problem is that a thing leaves their head and does not
  come back. Capture relief is real and immediate, and the returning is the part that never
  happens, so the return is structural and not habitual. [NOTES.md, Thesis]
- The audience is neurodivergent people and the target is a condition: low capacity, high
  demand, interruption, and engagement that varies. Naming the condition is what makes four
  literatures applicable: cognitive aids, structured handover, high-reliability work and
  distributed cognition. [NOTES.md, Thesis; docs/planning-for-humans.md, section 10b]
- The rule that comes with the framing: a general-population finding may inform a design and may
  never override a refusal that rests on a finding about this audience. The test before citing a
  general literature is whether the finding was measured on people for whom the failure it
  prevents is expensive; if not it is background, not grounds. [CLAUDE.md; NOTES.md, Thesis]
- The failure the app exists to prevent, stated 2026-08-28: a missed day must not become a new
  list to sort. The target is rules you trust to put what matters on top, not a clear inbox.
  [NOTES.md, Thesis]
- Architecture in the code map's one sentence: an event is appended to a log, state is a pure
  fold of that log, every screen is a pure projection of that state, and nothing writes except
  through one gate. [docs/code-map.md]
- The five layers, in the order data moves: the closed vocabulary (src/events.ts), the fold
  (src/fold.ts), the write boundary (src/gate.ts), the projections (the rest of src/, no I/O and
  no writes), and the surfaces (src/ui/, split into files that build events and files that
  render). [docs/code-map.md]
- Storage is IndexedDB through Dexie, the store holds the log and never folded state, and
  localStorage is banned outright and gated. [docs/code-map.md; CLAUDE.md]
- Size as the code map states it: 125 TypeScript files, roughly 22,000 lines of code under
  19,000 lines of comment. [docs/code-map.md]
- Release history: 311 release headings from 0.1.0 to 3.26.2, the newest dated 2026-09-21. Three
  VERSION releases: 1.0.0 (2026-07-31), 2.0.0 (2026-08-10, anything put down is a task straight
  away), 3.0.0 (2026-08-24, the page becomes a hub and stances). [CHANGELOG.md]
- Disagreement, version one. CHANGELOG.md carries a VERSION release 1.0.0 saying every
  capability is in place. NOTES.md ("What VERSION 1 means") says version one is reached only when
  every item of the v1 Must list exists and the decider says so, and that sessions do not propose
  it. The 3.26.2 release note says the July version-one note's claim of daily use was not true.
  [CHANGELOG.md; NOTES.md]

### The ten laws

Stated in NOTES.md ("The ten product laws") as invariants; violating one is a defect and not a
trade-off.

1. Return engine. Every node is on a surface now, under a clock, on the Menu, or parented to
   something under a clock; the write boundary refuses anything else. No silent nodes.
2. Coverage gauge. A one-line element proving law 1, tappable to show each item's return date.
3. No past bucket. A passed date becomes a present replan card with context assembled, never an
   archive row.
4. Levels push down. The runway is the only workspace; higher horizons project lineage and health
   downward; altitude views are inspection modes. NOTES.md records that this law is about
   altitude and was misread as being about navigation.
5. One decay primitive, (last_done, comfort_window, rising pressure), runs everything temporal.
   No late state anywhere, no red walls, no streaks.
6. Demand-free types exist. Menu items and pebbles cannot carry clocks; acting on one is a
   deliberate promotion.
7. The app plots and the human interprets. No sentiment scoring, no cause attribution, no
   diagnosis-flavored copy.
8. Rest is legitimate. Re-entry after absence is the primary designed path and the greeting is
   bounded: next up, at most three triage items, the gauge, an amnesty offer, never the backlog.
9. Data is never lost to updates. Append-only log, state is the fold, additive migrations,
   snapshot before migration, import seeds a fresh store and never merges.
10. AI never blocks. Every assisted flow has a working offline rung; cloud rungs need consent
    naming what leaves the device. No assisted rung of any kind ships today
    [docs/event-vocabulary.md, assist.offered].

- Two laws carry teeth in code: no silent nodes (the write boundary refuses or cures) and no
  past bucket. [CLAUDE.md]
- The Won't list, each a law made concrete: sentiment scoring and cause attribution; streaks,
  chains and completion percentages as motivation; an archive or missed bucket; telemetry; any
  cloud feature without an offline rung; gamification, points, mascots; social features, sharing
  by default, accounts. [NOTES.md, Scope]
- Refusals added by evidence: rejection sensitivity as an entity to design around; the claim that
  capture quiets the mind (resting on the Zeigarnik effect); dyslexia fonts; varying alarm sounds;
  graded escalation; mood check-ins of any form. [NOTES.md, Scope]
- Kinds that cannot carry a clock, from DEMAND_FREE_KINDS: aspiration, pebble, person, journal,
  anchor, context, role. [src/events.ts]

### What the record says about use

- The v1 definition of done is a dogfood gate: thirty consecutive working days with three
  clauses (recurring meetings and walk-in interruptions run from the app's views, every suspense
  lives in the app, nothing on paper that the app does not hold). Under thirty days the gate
  resets. [NOTES.md, v1 definition of done]
- Corrected 2026-08-03 in the same file: the gate has been running since release 0.17.0 and
  resets constantly, and the resets are the measurement. The failures are the dataset and the
  repository holds none of them. The question that matters is what ended the day. [NOTES.md;
  CLAUDE.md]
- The Block register was opened 2026-08-04 and redefined 2026-08-05 before holding an entry. An
  entry records the shape and class of what blocked a day, whether it was a hard block or an
  adjustment, and the release that answers it; never an instance. It holds no entry (the file
  reads "no entries yet"), and tools/blocks.mjs is declared in .spine-exempt as red on purpose
  until the first entry lands. [NOTES.md, The Block register; .spine-exempt]
- Closed 2026-08-21 by evidence: no session of real use has gone past a fresh import or a handful
  of sample items, so the counter never had anything to count and every recorded reset was the
  app being unenterable at the door. [NOTES.md, The Block register]
- ADR-0073's context section names three things found in use on a large imported backlog that
  ended a working day: the places to put things did not exist, a routed thing vanished without
  saying where it went, and nothing gave grounds to believe the surface was showing the right
  things. [docs/adr/0073-triage-answers-where.md]
- One question is open in NOTES.md (Q-16, the mark); fifteen are closed. [NOTES.md, Open
  questions]

### The surfaces the app has

Names are the app's own, from the manual's "Every screen" list and the ten data-stance-name
values in public/index.html; the file is the code map's kind (a projection in src/, a surface in
src/ui/). The structure: the landing surface is a hub, a list of doors, and each job is a
stance, a section shown alone with one way back. [docs/manual.md; public/index.html;
docs/adr/0108-the-page-is-a-hub-and-the-work-is-a-stance.md]

- The ten named stances in public/index.html: See what is next (#nextup), Sort what you put down
  (#triage), What slipped (#replan), Do one thing (#focus), What you are working toward
  (#portfolio, whose own heading reads Carrying), People (#people, heading With other people),
  Is the ladder in the right place (#review), Tend what recurs
  (#upkeep), Find something (#search), Everything you are holding (#held). Sections without that
  attribute: #bother, #reentry, #comms, #close, #composed, #menu, #update. [public/index.html]
- ADR-0108 lists eight ways of attending the stances are meant to serve (putting something down,
  sorting, choosing what to do now, doing one thing, reckoning with what slipped, tending what
  recurs, waiting on someone, planning) and says the last has no home in the app. [ADR-0108]

Each entry: what it does, why it was built (record or release), laws the record names.

- Where do you want to be? (the hub; src/ui/hub.ts, src/stance.ts). Does: a list of doors, one
  per job with something behind it, each saying what is behind it; inside a job that job is the
  whole screen with one way back and a plus for putting a thought down; a stance whose section
  is not live resolves to the hub; above 900px the hub sits beside the job. Why: release 3.0.0,
  ADR-0108 (reverses ADR-0093's conclusion, supersedes the workspace half of ADR-0100; the
  earlier shape was fifteen conditional sections in one scroller beside twenty-one dialogs),
  ADR-0109 (the wide arrangement). Laws: 4 and 8 (ADR-0108 header). [docs/manual.md; ADR-0108;
  ADR-0109; CHANGELOG.md 3.0.0]
- Hold it (#capture-form; one text field first on the screen, a button, More room for a larger
  box). Does: commits one capture and asks nothing. Why: ADR-0008 (commit before confirm,
  entrances, two-second budget), ADR-0085 and ADR-0086 (capture covers; a thing is a task the
  moment it exists, release 2.0.0). Laws: 1 (ADR-0008). [public/index.html; docs/adr/0008;
  ADR-0085; ADR-0086]
- See what is next, called Next up (src/nextup.ts, src/offer.ts, src/plain.ts). Does: offers one
  thing and states why from a closed set of seven reasons (hard-date, unblocked, resume,
  pressure, ready, beneath, unsorted), plus at most one wish from the Menu; controls are Done,
  Not this (records nothing), Start smaller, This one is heavy, That is enough for now, and Just
  one thing (offer capped at one, screen stripped to the offer). Why: ADR-0030 (fixed
  precedence), ADR-0060 (up to two unalike offers, OFFER_CAP is 2, at most one per reason),
  ADR-0077 (start smaller, heavy), ADR-0086, ADR-0097 (heat breaks ties; the source says it was
  widened beyond one tier in 3.8.1), ADR-0103, ADR-0104, ADR-0105. Laws: 1 (0030); 1, 6, 8 (0060);
  1, 3 (0077); 3, 5, 7 (0097).
  [src/nextup.ts; src/offer.ts; docs/manual.md; docs/adr/README.md]
- Sort what you put down (src/triage.ts, src/ui/clarify.ts, src/ui/sort.ts; door #triage-open).
  Does: one card at a time; an optional hot-or-cold pass when a few are waiting; nine choices;
  undo; the pile is counted once a card is in front of you; Sort a batch runs the same cards over
  a range the reader names (one import, everything under a project, a typed word), with a
  preview, a saved copy and an undo. Why: ADR-0029, ADR-0044, ADR-0049, ADR-0073, ADR-0079,
  ADR-0085 (reached only through its door), ADR-0113, ADR-0114. Laws: 1 (0029); 5, 6, 8 (0044);
  1, 5, 9 (0049); 1, 4, 9 (0073); 1, 5 (0079). [docs/manual.md; docs/adr/README.md]
- What slipped, called Needs a new plan (#replan; src/replan.ts). Does: a hard date went by;
  five ways forward including taking the date off; one line settles all of them at once; nothing
  marked done or deleted; a passed review clock raises nothing. Why: ADR-0012, ADR-0034 (cards
  are computed at read time, never stored, and only hard clocks raise them). Laws: 3, 4, 5, 6, 8
  (0034). [docs/manual.md; docs/adr/0034; NOTES.md]
- Welcome back (#reentry; src/reentry.ts). Does: after an absence says what came round; the
  amnesty moves passed dates to the Menu in one act; the shape of reentry.greeted.shown holds
  room for next up, at most three triage items and the gauge only; it also appears once after an
  import. Why: ADR-0043 (release 0.18.0). Laws: 8, 6 (0043). [docs/manual.md;
  docs/event-vocabulary.md; docs/adr/README.md]
- Do one thing (#focus; src/focus.ts, src/timer.ts, src/ui/focus.ts). Does: a focus anchor on
  an item; an interruption captured during focus writes a resume card at the moment of the
  interruption, with an optional five-word cue; a timer that shows it is running and never a
  countdown, with a length chosen from two, five, ten, twenty or thirty minutes; Coming up for
  air after a long stretch; a session close with no verdict. Why: ADR-0039, ADR-0052, ADR-0059.
  Laws: 5, 7, 8 (0052); 5 (0059). [docs/manual.md; docs/event-vocabulary.md; docs/adr/README.md]
- Tend what recurs, called Upkeep (#upkeep; src/pressure.ts, src/comms.ts,
  src/arrangement.ts). Does: things that come back on an interval and comfort window with
  pressure said in words; the comms sweep, which appears on the way out of focus and nowhere
  else; arrangements, upkeeps that run without you, where the clock measures the last
  confirmation, with two free-text fields (where it stands, what would change it); Running
  without you lists them. Why: ADR-0010, ADR-0042, ADR-0074, ADR-0121. Laws: 5 (0010, 0042,
  0074). Recorded defect: confirmArrangementEvents has no caller in src/. [docs/manual.md;
  NOTES.md, Known and not yet fixed]
- Everything you are holding (#held; src/held.ts, src/lens.ts, src/tree-view.ts). Does: the
  complete list in groups (ready now, coming up, later, on the Menu, not sorted yet, needs a new
  plan); folded away until asked; ticked off in place; a lens narrows its rows to one branch
  without touching the offer, the proof line or search. Why: ADR-0032, ADR-0054, ADR-0102. Laws:
  1, 5, 6 (0032); 1, 3, 8 (0054). [docs/manual.md; ADR-0054]
- The coverage proof (src/gate.ts coverageProof, src/assurance.ts). Does: the gauge states that
  everything is accounted for; Where everything is lists each group with a count that must sum
  to the whole and says so if it does not; the review exceptions the app computes appear as doors.
  Why: ADR-0084 (the guarantee has to be openable), ADR-0088, ADR-0099 (gauge moved above the
  list), ADR-0125 (the proof of judgment, law 4's analogue). Laws: 1 (0084); 4, 8 (0088); 5 and
  7 as grounds for refusing any rank (0125). [docs/manual.md; docs/adr/README.md]
- Find something (#search; src/search.ts). Does: opens what it finds, changes nothing, keeps no
  record of what was looked for; reaches a released thing only by a typed name. Why: not found as
  the subject of any row in the decision index. [docs/manual.md; docs/event-vocabulary.md]
- What you are working toward, and Your projects, areas and goals (src/horizons.ts,
  src/serves.ts, src/tree-view.ts; both behind a button per the manual). Does: goals, areas and
  outcomes, empty ones
  included; every card says in one line what it serves, never as a destination; the tree is an
  inspection and never the landing view. Why: ADR-0013, ADR-0038, ADR-0088, ADR-0095 (release
  2.5.0). Laws: 4 (0013, 0093, 0095); 1, 5, 7 (0095); 4, 8 (0038). [docs/manual.md;
  docs/adr/README.md]
- Worth a look, called Is the ladder in the right place (#review; src/review.ts). Does: computed
  exceptions, never curated: stalled (no next action), orphaned (no parent), unfed goals, quiet
  lines (a role that has carried work and carries nothing live now), quiet areas; at most three
  are shown, the count line says how many, and pressing it opens the whole list. Why: ADR-0013,
  ADR-0038, ADR-0117, ADR-0120. Laws: 4 (0013); 4, 8 (0038). [src/review.ts; docs/manual.md;
  docs/adr/README.md]
- With other people (#people; src/people.ts, src/requests.ts). Does: both directions of
  obligation by person; never says how long anybody was kept waiting; the Not Now ledger records
  a declined request; request slots; a decision log. Relations on a person link: opr,
  stakeholder, waiting-on, requested-by, mentioned, promised-to, rest-with-them, rest-with-me.
  Why: ADR-0040, ADR-0056, ADR-0057, ADR-0122 (release 3.20.0), releases 0.15.0 and 2.20.0.
  Laws: 1, 5 (0040); 1, 5 (0056); 9, 1 (0057). [docs/event-vocabulary.md; docs/manual.md;
  docs/adr/README.md]
- Carrying (#portfolio; src/portfolio.ts; the section whose stance name is What you are working
  toward). Does: projects somebody else executes, marked track, each with who runs it, when an
  answer is owed and what is outstanding; a track project emits no next actions, only
  waiting-fors and upkeep check-ins. Why: release 0.16.0, ADR-0041 (carrying is not doing, and
  the report is a fold). Laws: 5 (0041). [public/index.html; src/portfolio.ts; NOTES.md, Must;
  docs/adr/README.md]
- How you are, and anything weighing on you (src/load.ts, src/ui/load-ui.ts). Does: pebbles (load
  that is not work, three sizes, no clock) and a capacity declared in four words, one of which is
  unsure. Why: ADR-0014, ADR-0065. Laws: 6 (0014); 7, 1, 6 (0065). See the pebble Disagreement
  below. [docs/event-vocabulary.md; docs/manual.md; docs/adr/README.md]
- The Menu (#menu; src/menu.ts). Does: wants with no clocks in six categories (the vocabulary
  names read, try, go, make, research, save-for); one
  wish rides in the offer; promoting one is deliberate; it is a sheet since release 2.0.7. The
  3.26.0 release note and entry 26 call the fifth category look into. Why:
  ADR-0014, ADR-0060, ADR-0089. Laws: 6 (0014, 0060, 0089). [docs/event-vocabulary.md;
  docs/manual.md; docs/adr/README.md]
- Chosen for today, and Print today (#composed; src/composed.ts, src/today.ts). Does: an opt-in
  module; what the reader picked for today expires by projection at the day's end, so a thing
  chosen yesterday and not done is structurally uncomputable; Print today is one page. Why:
  ADR-0051. Laws: 3, 5 (0051). [docs/event-vocabulary.md; docs/manual.md]
- What's the situation? and In the room (src/situations.ts, src/meeting.ts, src/contexts.ts,
  src/duration.ts, src/people.ts). Does: three answers narrow both the offer and the list (where
  you are, how long you have, who is with you); a situation can be named and saved; In the room
  opens a saved situation that names people and shows what is outstanding with each, as an
  inspection that narrows nothing. Why: ADR-0092, ADR-0118, ADR-0119, ADR-0123. Laws: 1, 3, 7
  (0092). [docs/manual.md; docs/adr/README.md]
- Where the attention is (src/roles.ts). Does: two readouts per named role, both sorted by name
  with words in place of numbers and no bar, target or balance; a role's own sheet lists the
  live work carrying it and the horizons that work sits under. Why: ADR-0096 (release 2.6.0),
  ADR-0115, release 2.24.0 for the timed-minutes readout. Laws: 7, 5 (0096). [src/roles.ts;
  docs/adr/0096-roles.md]
- The days ahead (src/dated.ts, src/ics.ts), What comes back and when, and Send to my calendar.
  Does: dated work by day in the reader's zone; the calendar file is all-day events with a
  relative alarm and is the notification bridge; the in-app view and the file read one selection.
  Why: ADR-0007, ADR-0033, ADR-0124. Laws: 6 (0033). [docs/manual.md; docs/adr/README.md]
- Something on your mind that isn't a task? (#bother; src/bother.ts). Does: free text, then one
  question about whose it is (mine to solve, mine to track, not mine to carry); the flow cannot
  end without a route or a park with a return clock; not mine to carry lands on the Not Now
  ledger. Why: releases 1.5.0 and 1.8.0; ADR-0056 for the ledger. Laws: 1, 5 (0056).
  [docs/event-vocabulary.md; NOTES.md, Should]
- Telling someone where things are (src/delta.ts, src/anchors.ts). Does: a
  report that is the fold of the log at two points, cut at a named recurring period or at the
  last export; Copy it, Markdown, spreadsheet, Print. Why: ADR-0041, ADR-0068. Laws: 5 (0041);
  1, 9, 5, 6 (0068). [docs/manual.md; docs/adr/README.md]
- The journal (src/journal.ts, src/seal.ts). Does: a kind whose payload is always encrypted; the
  fold never reads it. Why: ADR-0061 (supersedes the vault split of ADR-0005). Laws: 6, 1, 7
  (0061). [docs/event-vocabulary.md; docs/adr/README.md]
- Your data (src/exchange.ts, src/copies.ts, src/portability.ts, src/purge.ts, src/sync.ts,
  src/relay.ts). Does: export, import (seeds a fresh store, never merges), dated copies, sample
  sets, purge with a copy first, an optional folder mirror on Chromium desktop, and in the Sync
  edition pairing a second device through a relay that cannot read what it carries. Why: ADR-0003,
  ADR-0004, ADR-0006, ADR-0035, ADR-0036, ADR-0037, ADR-0062, ADR-0067, ADR-0107, ADR-0114.
  Laws: 9 (0035); 9, 10 (0037). [docs/manual.md; docs/adr/README.md]
- The information panel and its destinations: Help, How it works, Settings, Colors, If something
  is wrong (src/ui/about.ts, src/diagnostic.ts, src/palette.ts, src/theme.ts, src/scale.ts).
  Does: what the app is and is not, install steps per platform, patch notes from one source
  (src/ui/changelog.ts), a diagnostic of shape and never content, a size control, palettes held
  by arithmetic, and an update that waits for the reader. Why: ADR-0071, ADR-0072, ADR-0083,
  ADR-0098, ADR-0110, ADR-0111. Laws: 1, 5 (0071). [docs/manual.md; docs/adr/README.md]

### The nouns of the event vocabulary

- One record type: id, kind from a closed list, vault, node, at, device, per-device sequence
  number, payload. There is no second table of current state. Conflicts resolve per field,
  last writer wins, which is why node.field.set carries exactly one field. The list is closed
  and additive only. [docs/event-vocabulary.md, sections 1 and 5]
- Node kinds in src/events.ts, sixteen: action, outcome, project, area, goal, waiting-for,
  upkeep, aspiration, bother, pebble, journal, person, resume-card, anchor, context, role.
  [src/events.ts]
- Event families, by the document's own letters. A, node lifecycle: node.created,
  node.kind.changed, node.field.set, node.renamed, node.parented, node.unparented, node.trashed,
  node.untrashed, node.merged, node.unmerged. B, temporal: clock.set, clock.cleared,
  upkeep.interval.set, done.marked, done.unmarked, anchor.defined, anchor.fired, replan.raised,
  replan.resolved, park.set. C, capture and triage: capture.recorded, heat.set, clarify.routed,
  clarify.reopened, do-now.timed, bother.received, bother.owned, bother.routed, assist.offered,
  assist.applied. D, focus: focus.started, focus.ended, interrupt.captured, resume.card.created,
  resume.card.spent, resume.card.expired. E, work domain: waiting.opened, waiting.closed,
  dependency.declared, dependency.released, node.released, node.reclaimed, after.set,
  after.cleared, suspense.set, project.role.set, opr.assigned, stakeholder.added,
  stakeholder.removed, decision.logged, delta.recorded, status.report.exported,
  request.declined, timer.length.set, day.boundary.set, request.slot.set, comms.sweep.scheduled,
  comms.sweep.ran. F, load: pebble.raised, pebble.settled, capacity.declared, wip.limit.set,
  estimate.recorded. G, structure and store: vault.created, vault.locked, vault.unlocked,
  device.registered, situation.saved, situation.forgotten, module.enabled, module.disabled,
  consent.granted, consent.revoked, snapshot.written, schema.migrated, export.written,
  shard.folded, import.seeded, terminology.skin.applied, template.loaded, shard.compacted.
  H, people and journal: person.created, person.linked, promise.released, holding.released,
  context.created, context.attached, context.detached, role.created, role.attached,
  role.detached, journal.entry.written, journal.sealed, journal.tag.attached. I, Menu and
  re-entry: menu.item.added, menu.item.removed, menu.item.promoted, save-for.updated,
  lapse.migration.ran, reentry.greeted, amnesty.offered, amnesty.accepted. J, wholesale acts:
  range.acted. K, composed today: today.chosen, today.released. [docs/event-vocabulary.md]
- The document says unemitted, and says why, for: replan.raised (computed instead), assist.offered
  and assist.applied, wip.limit.set, delta.recorded, comms.sweep.scheduled and comms.sweep.ran
  (superseded by a field on an upkeep), vault.created, vault.locked, vault.unlocked,
  device.registered, consent.granted, consent.revoked, schema.migrated, terminology.skin.applied,
  template.loaded, shard.compacted, journal.tag.attached. [docs/event-vocabulary.md]
- Subtractions, the events that take a link away, each scoped to one person and one relation (or
  one node and one context or role): stakeholder.removed, promise.released, holding.released,
  context.detached, role.detached. [docs/event-vocabulary.md]
- What is deliberately not an event: where you are, how long you have and who is with you are
  device view preferences kept as key-value entries, as is the lens root, because a trail of
  where somebody was is not a fact about their work. [docs/code-map.md; ADR-0054; ADR-0092;
  src/contexts.ts]
- Disagreement, node kinds. docs/event-vocabulary.md section 2 lists fourteen kinds and omits
  context and role, which src/events.ts carries and the same document describes under family H.
  [docs/event-vocabulary.md; src/events.ts]
- Disagreement, two meanings of role. project.role.set takes execute or track and says whether a
  project's next actions are offered to the reader (src/nextup.ts reads it as p.role); the role
  kind is an identity that crosses areas. Both use the word role. [docs/event-vocabulary.md;
  src/nextup.ts]

#### The place noun

- There is no event or kind named place in the closed vocabulary. Searched: the family list above
  and the sixteen kinds. [docs/event-vocabulary.md; src/events.ts]
- The reader-facing word place is used for two different things. First, the kind context, which
  src/kind-words.ts gives the reader-facing word A place: where a thing can be done, linked by
  context.attached. Second, the container a thing is filed into by the Put it somewhere route,
  made by triage when it does not exist, an ordinary container kind (a project by default; the
  reader can say it is an area afterward). [src/kind-words.ts; ADR-0073; docs/manual.md]
- The manual uses the word for both in the same file: Where can this be done? on a thing's own
  panel and the three questions under What's the situation? are about the context; making a new
  place while filing a thing and saying which kind of place it is are about the container.
  ADR-0080 gives a container a return date, offered on the receipt after filing. [docs/manual.md;
  docs/adr/0080-dating-a-place.md]

#### The context noun, as shipped

- Meaning: where a thing can be done, as distinct from where it lives (the tree gives a thing one
  parent). A demand-free node plus a many-to-many link, never a parent. Shipped 2.2.0, ADR-0092,
  which answers the vault question Q-10 asked nineteen days earlier. [ADR-0092; NOTES.md Q-10]
- Reader words: A place; Where can this be done? on an item's panel; The places you have in the
  readout. [src/kind-words.ts; docs/manual.md]
- What reads it. fitsHere is a pure predicate: an unlabeled thing fits every answer, which keeps
  the filter from emptying a store nobody has labeled. It is applied as a post-filter after the
  offer's ranking (src/ui/work.ts) and to the held list's rows (src/ui/app.ts); the ranking and
  its tests are untouched. placesReaching adds every ancestor's contexts to a thing's own, so a
  place on a project reaches everything inside it. The saved situation carries a context and a
  length. The import turns a line's tags into contexts. The diagnostic counts how much a
  situation can reach. [src/contexts.ts; src/ui/work.ts; src/ui/app.ts; ADR-0107;
  src/diagnostic.ts]
- What it narrows: the offer and the held list's rows. What it never narrows: the coverage proof,
  the clock a thing carries, or what is held. Law 1 does not read it. [ADR-0092; src/contexts.ts]
- Companion axes composed at the same call site: how long you have (fitsWithin; no estimate fits
  any window) and who is with you (fitsWith; nobody named fits). All three are device
  preferences. [docs/nd-collisions.md entry 24; src/ui/work.ts]
- Reversal on record: ADR-0054, the lens (dated 2026-08-01), lists tags or a context field among
  the alternatives it refused. ADR-0092 (dated 2026-08-17) builds one and says ADR-0054's binding
  on the lens binds it identically. [ADR-0054; ADR-0092]

#### The role noun, as shipped

- Meaning: who work is for, an identity that crosses areas; a demand-free node plus a many-to-many
  link, and for that reason never a container. Shipped 2.6.0, ADR-0096, which settles Q-13
  thirteen days after Q-13 named the shape. [ADR-0096; NOTES.md Q-13]
- What reads it. rolesOf shows a role's name on an item's card and sheet. roleLoads counts live
  work per role and states the unnamed remainder separately. roleAttention sums minutes a timer
  measured per role, finished or not (release 2.24.0). lineView is a role's own sheet: the live
  work carrying it and the distinct horizons that work sits under (ADR-0115). quietLines is a
  Review exception: a role that has carried work and carries nothing live now, ranked below
  unfed goals and above quiet areas, fourth of five (ADR-0117, ADR-0120). [src/roles.ts;
  src/review.ts; ADR-0115; ADR-0117; ADR-0120]
- What it narrows: nothing. ADR-0096 says in terms that a role is not a filter, because an
  identity does not change during a day. No ranking in src/nextup.ts reads a role node. [ADR-0096;
  searched src/nextup.ts, src/offer.ts, src/held.ts]
- Sorting an input into a role: the sorting card has nine choices and none is a role; a role is
  attached on an item's own panel. [docs/manual.md]
- Not found: any record that a role, or anything else, was looked at. The vocabulary has no event
  for a view, and the manual, ADR-0054 and ADR-0092 say that where you looked is deliberately not
  recorded. roleAttention reads timer sessions only. [docs/event-vocabulary.md; docs/manual.md;
  ADR-0054; ADR-0092; src/roles.ts]
- Disagreement, roles and clocks. NOTES.md Q-13 says a role node carries its own review clock
  like any horizon and that the question of when to review roles is answered by the same return
  as everything else. src/events.ts lists role in DEMAND_FREE_KINDS, src/gate.ts refuses a clock
  on one, and ADR-0096 states it. [NOTES.md Q-13; src/events.ts; src/gate.ts; ADR-0096]

### The capture and clarify route, counted

- Thought to a node on a surface under a clock: two actions and no question. Type into the one
  field, which has focus on arrival, then press Hold it. The commit comes before the
  confirmation, and in the same transaction the gate gives the capture a same-day review clock,
  so the node is covered from the moment of capture. [public/index.html; docs/adr/0008;
  docs/adr/0085; docs/nd-collisions.md entry 27]
- Where it then is. It is offered as work in Next up, last among the ordinary tiers (ADR-0086
  says fifth, behind a hard date, an unblocked antecedent, a resume card, pressure and an arrived
  clock), with the words that you put it down. It is listed in What you are holding under not
  sorted yet. [ADR-0086; docs/manual.md; src/nextup.ts]
- Other entrances: /capture?text=, a manifest shortcut, a share target on Chromium, the plus
  inside a job, and the interrupt gesture; the budget is two seconds, cold. [ADR-0008;
  docs/planning-for-humans.md section 3]
- Sorting is reached only through its door, never shown on arrival and never turned on by a
  capture. [ADR-0085]
- Per card in sorting, as documented: an optional hot-or-cold press when a few are waiting
  (hot ones are offered first; cold hides nothing); then one press of one of nine choices. Do now,
  Next action, Waiting for, Someday, Reference, Trash, Put it somewhere, Say where it can be
  done, Not this one. [docs/manual.md; ADR-0029; CHANGELOG.md]
- What each route writes. Do now: a same-day review clock and a visible two-minute timer. Next
  action: a review clock one day out. Waiting for: a kind change and a review clock three days
  out. Someday and Reference: onto the Menu. Trash: node.trashed. Put it somewhere: node.parented
  into a place, made on the spot if absent, clearing the item's own clocks so the place's clock
  carries it. [ADR-0029; ADR-0073]
- Extra presses. Someday asks once for one of six Menu kinds, with a way past that says where the
  thing goes (release 3.26.0); entry 26 records that this made Someday two presses where it had
  been one. Reference still files under read without asking. Put it somewhere is a pick or a
  typed name. Say where it can be done is a pick or a typed name (release 3.13.0: before it, the
  only way was to open the item, expand its panel and scroll). [docs/nd-collisions.md entry 26;
  CHANGELOG.md; docs/manual.md]
- Disagreement, entry 27's mark. docs/nd-collisions.md entry 27 routes putting the context
  question on the sorting card as a V2-candidate with no since-written line; the manual lists
  Say where it can be done among the nine choices and the changelog announces it. [docs/nd-
  collisions.md; docs/manual.md; CHANGELOG.md]
- Where the catalog says the cost still lands: filing, not capture. [docs/nd-collisions.md
  entry 27]

### The temporal primitive, as applied today

- The primitive: (last_done, comfort_window, rising pressure). Pressure is computed at read time,
  continuous and unbounded above, never stored. Less than zero is comfortable, zero is ready
  again, above zero counts comfort windows past ready. A thing never done is ready, not late.
  [src/pressure.ts; ADR-0010]
- It exists only for a node with a cadence: hasCadence requires a finite interval and comfort
  window both above zero, and pressureOf returns null otherwise. In the event vocabulary that is
  upkeep.interval.set (intervalDays, comfortWindowDays) and the fields built on an upkeep:
  arrangement (lastDone reads as last confirmed) and the comms sweep. [src/pressure.ts;
  docs/event-vocabulary.md]
- Days are counted as the reader's days: the day boundary is a stated hour from midnight to
  eleven, null reads as midnight, and nothing infers it. [docs/event-vocabulary.md,
  day.boundary.set; src/pressure.ts]
- Everything else temporal is a clock in one of five kinds (due, start, suspense, review, park),
  and every clock the app writes is day-granular: there is no time of day anywhere in the schema,
  decided in entry 9. [docs/event-vocabulary.md; docs/nd-collisions.md entry 9]
- The gate writes clocks too (cures). isAppClock separates a clock a person set from one the gate
  wrote, and several surfaces depend on the distinction. [docs/code-map.md]
- Disagreement, one answer or four. Release 3.26.1 records that four parts of the app work out
  when a thing comes back in four different ways, that two screens can name different dates for
  one thing, and that the first half of the fix (recording whether a person or the app chose each
  clock) landed with the unification still to come. [CHANGELOG.md 3.26.1;
  docs/structural-assessment.md named in NOTES.md]
- A passed hard clock (due, suspense) raises a replan card computed at read time; a passed review
  clock raises nothing; replan wording gets vaguer as time passes. [ADR-0034; NOTES.md Thesis]
- Offer order, fixed and not a score. A real date outranks everything and unsorted is last among
  the ordinary tiers; ADR-0086 names what unsorted ranks behind as a hard date, an unblocked
  antecedent, a resume card, pressure and an arrived clock. A horizon that has come round is
  offered only when nothing else is asking (entry 3, release 2.13.0). Heat (hot, unsaid, cold)
  breaks ties inside every tier since 3.8.1, beneath pressure, and the card says so; inside
  unsorted a day's own captures come before an import's (release 2.26.0). [src/nextup.ts;
  ADR-0086; ADR-0097; docs/nd-collisions.md entry 3]
- A review clock belongs to places and areas, and a dormant area is a Review exception. [ADR-0013;
  ADR-0080]
- Not found: any input to pressure or to ranking that records when a thing, a role or a surface
  was last looked at. Searched: the event vocabulary, src/pressure.ts, src/nextup.ts.

### Disagreements and gaps found while reading, collected

- Rest mode. docs/planning-for-humans.md section 6 and docs/nd-collisions.md entry 22 say rest
  mode does not exist and was never built (corrected 2026-08-30), and entries 8 and 20 name it as
  a protection. NOTES.md, Should list, still marks rest mode and auto re-entry done in 0.18.0.
  [those three files]
- Pebbles and the offer. docs/planning-for-humans.md section 7 says the behavior of a pebble
  depressing the offer was reversed in 1.34.0 (offerCapFor returns a constant; what bends is which
  things are offered, never how many), and entry 2 says a low day reaches for lighter work. Entry
  10 still says pebbles narrow the offer and never below one, and ADR-0065's index row says
  unresolved weight narrows the offer. [those files]
- A citation held and refused. docs/planning-for-humans.md sections 1 and 8 tag Masicampo and
  Baumeister established. NOTES.md (Scope, refusals) refuses the claim that capture quiets the
  mind, and entry 28 records declining the same citation. [those files]
- What Carrying names. docs/manual.md lists Carrying as the weights the reader said they were
  carrying. public/index.html gives the heading Carrying to the track portfolio (#portfolio),
  and src/plain.ts calls that section Carrying, a count and a list. The weights live behind How
  you are, and anything weighing on you. [docs/manual.md; public/index.html; src/plain.ts]
- Choice overload. docs/planning-for-humans.md section 4's heading text still tags it established
  with contested magnitude; the canon index there moved it to contested on 2026-08-09. [that file]
- Where heat breaks ties. ADR-0097's index row and entry 5 say the offer breaks ties on heat
  inside the ready tier only. src/nextup.ts says the confinement ended in 3.8.1 and heat now
  breaks ties in every tier, beneath pressure. [docs/adr/README.md; docs/nd-collisions.md;
  src/nextup.ts]
- Negative findings. Section 10 lists four; the canon index lists three, omitting the finding that
  information transfer between neurotypes did not replicate. [that file]
- Unbuilt arrows. Section 4 describes a breakdown ladder and batch assist; the event vocabulary
  says no assisted rung of any kind ships. [docs/planning-for-humans.md; docs/event-vocabulary.md]
- The ninth destination. NOTES.md (the section on what a cold read is) says entry 30 spends its
  whole length arguing against a ninth sort destination for a worry. Entry 30 of
  docs/nd-collisions.md is about monitoring a condition and carries no such argument. Searched
  that file for destination, ninth, worry and bother: four hits, of which the nearest are entry
  24's refusal of a menu of named situational screens (every axis stays a filter over the one
  offer, never a set of destinations) and entry 6's open question about the worry box behind the
  Contents door. Entry 16 refuses a third and fourth offer class. [NOTES.md; docs/nd-collisions.md]
- Where the numbers live. The numbered entries that releases and NOTES.md cite (entries 3, 28 and
  30) are in docs/nd-collisions.md, which has entries 1 to 34. docs/planning-for-humans.md numbers
  sections 1 to 11 and not entries. CHANGELOG.md cites neither catalog by number; it names
  Planning for Humans in releases 1.7.2, 1.38.4 and 3.7.0. [those files]
- Entry 31's one build. The entry says the replan card may say plainly that reconsidering is the
  ordinary reason a date passes. Searched src/ for reconsider, change your mind, changed their
  mind and ordinary reason; not found outside the changelog's own text. [docs/nd-collisions.md;
  src/]
- Entry 27 still routes as V2-candidate (see the disagreement under the capture route).
  [docs/nd-collisions.md]
- Known defect list: confirmArrangementEvents has no caller; the test page the doctrine asks for
  does not exist; the two receipts that reach nobody were answered by ADR-0126. [NOTES.md, Known
  and not yet fixed]

---

## What the research already holds

### The two catalogs, and how they are marked

- docs/planning-for-humans.md is the source of the shipped page public/why.html (the Spine holds
  the two in sync). Its sections 1 to 11 carry findings with an epistemic tag from a closed set:
  established, emerging, community-construct, negative finding; the canon index adds contested.
  [docs/planning-for-humans.md; tools/thesis.mjs]
- docs/nd-collisions.md has entries 1 to 34 and a top-five list placed after entry 29. Each entry
  carries a what-happens line, an evidence line from a closed set (Strong, Moderate, Contested,
  Community, Disproven), how conventional systems make it worse, what the app already does, and a
  routing mark (V2-candidate, later, refuse, or shipped with a release). Its header says it was a
  false receipt in both directions until it was rewritten, and that it is held by
  tools/collisions.mjs. [docs/nd-collisions.md]
- The frame the collision catalog sits in: the app is a prosthesis, not a treatment, citing a
  2025 network meta-analysis finding that non-pharmacological interventions lack demonstrated
  efficacy on core adult ADHD symptoms. [docs/nd-collisions.md header]

### Entries of docs/planning-for-humans.md

Each line: claim, literature, where and on whom if the entry says, what the section itself points
at, and who else cites it. Population is written not stated where the entry does not give one.
Points at means the arrows inside the section; cited by means another file names the section, as
found by search and not guaranteed complete.

- Section 1, why return is the whole product. Time-based prospective memory is less reliable than
  event-based; offloaded intentions reduce rehearsal and move the reliability burden to the store;
  a specific plan quiets intrusive thoughts. Prospective memory, Barkley, Gilbert, Masicampo and
  Baumeister; tagged established. Population not stated. Points at: law 1 (ADR-0011), law 2,
  ADR-0007 (the calendar file as cue conversion). Cited by: none found by number.
  [docs/planning-for-humans.md]
- Section 2, why there is no late state. Procrastination is mood repair (Sirois and Pychyl);
  extrinsic scores can undermine valued tasks (Deci and Ryan); ego depletion and working-memory
  training transfer are negative findings; care tasks are morally neutral (KC Davis,
  community-construct). Population not stated. Points at: law 5 (ADR-0010), law 3 (ADR-0012).
  Cited by: entry 26 (overjustification). [docs/planning-for-humans.md; docs/nd-collisions.md]
- Section 3, interruption, focus and getting back. A suspended goal decays and is recovered by
  cues (Altmann and Trafton); a cue written in the interruption lag cuts resumption lag (Trafton);
  interrupted work costs stress and effort (Mark); attention residue (Leroy); event boundaries
  (Radvansky); monotropism and hyperfocus are emerging; the interruption protocol is a
  practitioner technique, community-construct. Population not stated. Points at: the focus
  anchor, resume cards, the interrupt gesture with a two-second budget (ADR-0008). Cited by:
  none found by number. [docs/planning-for-humans.md]
- Section 4, clarify, breakdown and the two-minute rule. Structure carries the benefit of
  problem-solving (D'Zurilla); specific if-then plans raise follow-through (Gollwitzer); choice
  overload in the section is tagged established with contested magnitude and moved to contested
  in the canon index. Population not stated. Points at: forced-choice routing, ADR-0060, ADR-0059,
  ADR-0015 (breakdown ladder, batch assist). Cited by: ADR-0059 and ADR-0060 (both name thesis
  section 4). [docs/planning-for-humans.md; docs/adr/0059; docs/adr/0060]
- Section 5, upkeep, habit and honest timelines. Habit automaticity takes a median of about 66
  days with a range from about 18 to over 250 (Lally); stable context cues beat intention (Wood and
  Neal); both established. Population not stated. Points at: ADR-0013 (upkeep chips surface where
  the person already is). Cited by: none found by number. [docs/planning-for-humans.md]
- Section 6, rest, lapse and re-entry. Autistic burnout recovery needs reduced demand (Raymaker,
  qualitative); spoon theory is a community metaphor; peak-end rule (Kahneman); alexithymia
  (Bird and Cook, elevated in autistic populations). Points at: law 8, the bounded greeting, the
  amnesty, rest mode (the section says not built), self-declared capacity, the session close.
  Cited by: none found by number. [docs/planning-for-humans.md]
- Section 7, load, capacity and pebbles. A work-in-progress limit method (community-construct);
  buffers in dependent chains (Goldratt, operations research); the planning fallacy is not fixed
  by experience (Kahneman and Tversky). Points at: ADR-0014, buffer burn on dependency dates,
  estimates logged from v1; carries the note that pebbles depressing the offer was reversed in
  1.34.0. Cited by: none found by number. [docs/planning-for-humans.md]
- Section 8, bother, worry and things that are not tasks. Postponing worry to a set time and place
  reduces worry (Borkovec); a plan quiets intrusion (Masicampo and Baumeister). Points at: the
  bother flow, the Not Now ledger, request slots, the comms sweep. Cited by: none found by number.
  [docs/planning-for-humans.md]
- Section 9, where the interest actually comes from. Interest-based activation (Dodson) and
  rejection sensitivity are community-constructs; the latter is now a named refusal. Points at:
  Not this, the Menu, ADR-0060. Cited by: ADR-0060 (section 9). [docs/planning-for-humans.md;
  docs/adr/0060]
- Section 10, the negative findings as prohibitions. Ego depletion did not replicate; working-memory
  training does not transfer; the 21-day habit has no basis; information transfer between
  neurotypes did not replicate (a pre-registered study across three sites, N = 311, overturning an
  N = 72 original). Cited by: entry 32 repeats the last. [docs/planning-for-humans.md;
  docs/nd-collisions.md]
- Section 10b, the field this app is in. Personal Information Management names project
  fragmentation (Jones; Bergman); Bellotti and colleagues, CHI 2004, found knowledge workers
  proficient at keeping track and complaining about the effort of it, which this section turns
  into the premise that the target is cost and not rescue. Cited by: entry 34 (fragmentation).
  [docs/planning-for-humans.md; docs/nd-collisions.md]
- Section 10b, what the app is aimed at, 2026-09-01. Condition and not diagnosis; the four
  literatures; the rule that a general finding never overrides a refusal. Cited by: CLAUDE.md,
  NOTES.md Thesis, entry 34. [docs/planning-for-humans.md; CLAUDE.md]
- Section 10b, a third literature. A surgical safety checklist across eight hospitals in eight
  cities cut deaths from 1.5 percent to 0.8 and complications from 11.0 to 7.0 (Haynes, 2009); the
  same checklist mandated across 101 hospitals in one province, about 109,000 procedures before
  and 106,000 after, did not significantly change mortality (odds ratio 0.91, P = 0.13) or
  complications (Urbach, 2014). The pair is the finding: a structure does not do the work by
  existing; the prohibition is that nothing may assume offering a shape produces the outcome the
  shape was measured with. Patients in hospitals; not measured on this audience. [docs/planning-
  for-humans.md]
- Section 10b, one claim not leaned on. The curb-cut effect: named instances are real and some are
  quantified (about four in five caption users have no hearing loss, from survey and industry
  sources); the general principle has a denominator problem. The instance may be said and the rule
  may not. [docs/planning-for-humans.md]
- Section 11, five claimed differences: a decay-based upkeep lane, unified suspend-capture-resume,
  bother triage ending in clock-guaranteed routes, a horizon-integrity engine, a pebble load
  ledger. Stated as claims; the competitive pass is V-08 in docs/verifications.md and the section
  says it has not been run. [docs/planning-for-humans.md]
- The canon index lists, by tag: established (twenty named sources and findings), emerging
  (monotropism, hyperfocus), contested (choice overload, demand avoidance as a distinct profile,
  rejection sensitivity as an entity), community-construct (Dodson, rejection sensitivity, spoon
  theory, KC Davis, the work-in-progress limit method, Cirillo), negative findings (three).
  [docs/planning-for-humans.md]

### Entries of docs/nd-collisions.md

Each line: the claim, the literature and its grade, where and on whom it was measured if the
entry says, the routing mark, and what cites it. The cites are the ones found by search and are
not guaranteed complete.

- 1, task initiation cost. The gap between intention and action at the point of performance
  (Barkley). Strong; the adult attention-deficit executive-function literature. Shipped in 1.28.0
  (the first-step verb on the offer). Cited by: ADR-0077 (entries 1 and 2).
- 2, the wall of awful. Emotional debt attached to an avoided task (Mahan's coinage). Community.
  Refused avoidance detection; the pebble route reversed to refuse 2026-08-17; shipped as weight in
  1.34.0. Cited by: ADR-0077 (entries 1 and 2), NOTES.md Q-12, entries 8 and 23.
- 3, out of sight, out of mind. Cue-dependent prospective memory failure (Einstein and McDaniel),
  offloading cost (Gilbert). Strong; called the thesis. Shipped: 1.27.0 contents on a returning
  place, 2.13.0 contents named in the offer, 2.8.1 proof line moved up. Cited by: ADR-0025,
  ADR-0080, ADR-0090 (which corrects it on focality), docs/brand-collisions.md, NOTES.md (the
  wall of 3.23.18).
- 4, time blindness. Temporal myopia (Barkley), duration misestimation both ways. Strong for the
  phenomenon, moderate for the model. Shipped as the approach vocabulary. Cited by: ADR-0075.
- 5, interest-based motivation. Dodson's interest, novelty, challenge, urgency, passion. Community.
  Shipped in 2.7.0 as a heat tie-break (see the heat Disagreement); an importance rank is refused
  in terms. Cited by: ADR-0097, ADR-0125, NOTES.md Q-11 and Q-12.
- 6, autistic inertia and switching cost. Monotropism (Murray, Lesser and Lawson) and inertia
  (Buckle and colleagues). Moderate for monotropism, community for inertia. Refuse timeboxing and
  scheduled rotation. Owns an open question: whether reaching a thing through the Contents door
  costs more than scrolling past it. Cited by: none found by number; the entry names ADR-0039,
  ADR-0042 and ADR-0099.
- 7, hyperfocus. Absorption with collapsed time and suppressed interoception (Ashinoff and
  Abu-Akel). Moderate. Shipped in 2.7.1 (next fixed thing on the focus surface, as a name and
  never a countdown). Cited by: none found by number.
- 8, demand avoidance. Newson's coinage; self-imposed demands count. Contested. Refuse further
  building; called the best-defended collision in the app. Cited by: NOTES.md Q-12, entries 2
  and 23.
- 9, waiting mode. An upcoming fixed event makes the hours before it unusable. Community. Refused
  because the app has no time of day, decided by the evidence in the file; the honest half is the
  header clock. Cited by: ADR-0103.
- 10, spoon budgeting. Finite daily capacity (Miserandino). Community for the metaphor, moderate
  for pacing; the pacing evidence comes from post-exertional conditions, a different population.
  Shipped in 2.7.2 as a label change. Cited by: none found by number. See the pebble
  Disagreement.
- 11, all-or-nothing restart failure. Burns' distortion and the abstinence violation effect
  (Marlatt). Community with a moderate analogue. Refuse; called the most completely routed
  collision. Cited by: none found by number.
- 12, novelty decay. Dodson's novelty; median 30-day retention in the category near 3 to 4
  percent. Moderate; the numbers are solid and the novelty attribution is an inference. Refuse
  manufactured novelty. Cited by: none found by number; ADR-0085 carries the same retention
  figure, and the entry names the dogfood gate as the instrument.
- 13, urgency addiction. Dodson's urgency, Steel's temporal motivation theory. Community. Folded
  into entry 4 and shipped with it. Cited by: none found by number.
- 14, transition costs between contexts. Task-switch cost (Monsell), amplified several-fold in
  attention-deficit and autism per the entry. Strong. Refuse anything push-shaped beyond the two
  lowest notification tiers. Cited by: none found by number.
- 15, rejection sensitivity meeting reminders. Disproven as stated (no measure of its own); strong
  underneath (emotional dysregulation in adult attention-deficit). Shipped as a voice gate on
  notification copy. Cited by: none found by number.
- 16, choice overload. Iyengar and Lepper with Scheibehenne's meta-analytic caveat. Contested; the
  classic result replicates poorly. The cap of two stands on comparison cost at activation. Refuse
  a third and fourth offer class. Cited by: none found by number; ADR-0060 argues from the same
  reason.
- 17, working-memory loss between capture and action. Baddeley; loss of encoding context. Strong.
  Shipped in 1.29.0 (capture context on the triage card). Cited by: ADR-0108 (entries 17 and
  18); ADR-0076 cites the catalog without a number.
- 18, the planning and doing gap. Planning as procrastination (Sirois and Pychyl). Community.
  Refuse curation surfaces; the constraint was honored when the law-4 projection was built (2.5.0).
  Cited by: ADR-0108.
- 19, body doubling. Coaching-community practice. Community. Refuse simulated or networked
  accountability; the printable today card is the portable artifact. Cited by: entries 25, 32, 33.
- 20, special-interest integration. Interest-driven engagement in autistic people. Moderate.
  Refuse anything algorithmic; answers Q-12. Cited by: NOTES.md Q-12.
- 21, follow-through on other people's pieces. Prospective memory with no natural cue. Community.
  Refuse new mechanism. Cited by: none found by number; the entry names ADR-0029, ADR-0040,
  ADR-0041, ADR-0056 and ADR-0068.
- 22, rest guilt. Raymaker's burnout findings. Community. Refuse any activity summary. Carries the
  correction that rest mode does not exist. Cited by: none found by number.
- 23, cold start. Upfront configuration cost and reactance. Community, with strong and contested
  pieces named and the comparison it exists to weigh untested for any population. V2-candidate:
  ask once, in the flow, declinable; refuse setup wizards, template choosers, completion meters and
  inference. Cited by: ADR-0107 (entries 23 and 24), ADR-0123 (entries 23 and 24).
- 24, situated retrieval. Event-based prospective memory and implementation intentions (strong,
  general populations), environmental context-dependent memory (narrower than its reputation), the
  planning fallacy against self-reported durations. Strong for mechanisms; nothing has measured the
  product claim or whether asking costs less than scanning. All three axes shipped as post-filters.
  Cited by: ADR-0107, ADR-0118, ADR-0123.
- 25, outstanding promises. Intentions that matter to another person are executed more reliably
  (Meacham; Brandimonte and colleagues; Kliegel and colleagues). Strong for the mechanism, with
  outcome evidence: a 79-study review covering 68,275 people in 22 countries (Hotte-Meunier,
  2024); Fletcher 2014 on an adult cohort; Eakin 2004 on 33 marriages against 26 controls.
  Ungraded: whether seeing a list of what you owe helps. Shipped in 2.20.0 under a different
  relation and a stricter rule. Cited by: ADR-0122 (as the shipping standard), entries 32 and 33.
- 26, the reward-led menu. Behavioral activation is strong but measured against depression, a
  different population; delay-discounting meta-analysis (Marx and colleagues, 37 comparisons,
  3,763 participants). Community for the practice as packaged. Refuse a named feature or any use
  tracking; the category picker shipped in 2.23.0 and 3.26.0. Cited by: none found by number;
  the entry names ADR-0014, ADR-0060 and ADR-0065.
- 27, the cost of recording decides whether recording happens. Two pre-registered experiments on
  the effort of setting a reminder across memory loads: effortful reminders are set less and the
  accuracy benefit is attenuated (Chiu and Gilbert, 2024). Strong. Routed V2-candidate: context on
  the sorting card (the changelog and manual show it present; see the capture-route
  Disagreement). Cited by: ADR-0117.
- 28, trusting a store completely creates the exposure. Trusted reminders reduce intention
  maintenance (Dupre and Ball, 2026, N = 320); a 50 percent reliable store did not substitute.
  Moderate. Shipped, with the 50 percent condition as a design rule. Cited by: NOTES.md (the
  fixes of 3.23.18 and 3.23.22); the entry itself names ADR-0084.
- 29, miscalibration about one's own memory runs both ways. Underconfidence in unaided memory,
  scaling with load; older adults overconfident. Strong. Refuse nudging toward less offloading and
  refuse validating a prediction afterward. Cited by: entry 32.
- 30, monitoring a condition. Monitoring is attentionally demanding and rationed by context; a
  replication of a dual-process account partly failed. Strong for the cost, contested for the
  decomposition. Routed V2-candidate; ADR-0121 builds it as two fields on arrangement and the
  entry's own mark does not say so. Cited by: ADR-0121 (entries 30 and 31).
- 31, most things that did not happen were not forgotten. Diary study of 102 distance-learning
  students and 1,823 intentions, 565 not accomplished: reprioritized 33.6 percent, lack of time
  17.2, fatigue 15.2, other 10.6, forgetting 9.6, external 8.9, health 5.0 (Haas, Hering, Scarampi
  and Martarelli, 2026); perceived importance had no effect on fulfillment. Strong for the
  ordering, moderate for the proportions; one student population. Refuse measurement and
  why-not-done prompts. Cited by: ADR-0121 (entries 30 and 31).
- 32, two people leave one conversation holding different amounts. Grounding failure (Clark and
  Brennan); repair windows (Schegloff); memory conformity after discussion, 71 percent mistaken
  recall in the different-video paradigm (Gabbert, Memon and Allan, 2003); natural couples did
  worse when a structure was imposed (Wegner, Erber and Raymond, 1991); 22 dyads (Heasman and
  Gillespie, 2018); information transfer between neurotypes did not replicate (N = 311). Strong
  for the failure and for the prohibition, contested for whether any artifact helps. Shipped in
  3.20.0 as a pair of pointer relations. Cited by: ADR-0122, NOTES.md Q-15, entry 33.
- 33, a role changes hands. Structured handoff protocol: 10,740 admissions at nine sites, medical
  errors down 23 percent and preventable adverse events down 30 percent, non-preventable events
  unchanged (Starmer and colleagues, 2014). Strong for structured verbal handover with a read-back,
  measured on a verbal, synchronous, two-person exchange in hospitals; does not transfer to
  anything the app could do alone. Routed later; refuse any claim the app performs a handover.
  Cited by: NOTES.md Q-15.
- 34, work spanning several unrelated domains. Polymathy is measurable on breadth, depth and
  integration; no established link to autism or attention-deficit found. Moderate for the
  construct, unevidenced for the link. Refuse trait-based modes. The accommodation, the role noun,
  already shipped. Cited by: none found outside the file.
- The top-five list after entry 29: place return with contents (1.27.0), capture context (1.29.0),
  the smaller-bite verb (1.28.0), the waiting-mode offer (refused), this one is heavy (1.34.0).
  [docs/nd-collisions.md]

### Which entries bear on the questions asked of the first draft

Seven questions, each with the entries that bear on it and whether any does.

- The cost of landing one item. Bears: entry 27 (Strong; the entry that states it), entries 17 and
  23, entry 1; planning-for-humans section 1 (capture relief) and section 4 (batch assist keeps
  capture and decision apart); ADR-0008, ADR-0085, ADR-0086. Not found: a measurement of presses
  per sorting route. [both catalogs; ADRs]
- Reading a system at a glance. Bears in part: entry 3 (visible is the only kind remembered), entry
  28 (a store the reader cannot check behaves like a half-reliable one), entry 16 (the list is the
  interface), entry 6's open question (a switch versus a scroll), entry 24's untested crux;
  planning-for-humans section 10b (project fragmentation; Bellotti); ADR-0084, ADR-0099, ADR-0108,
  ADR-0125. Not found: glance, board and wall as constructs in either catalog (searched both).
- Time laid out in space, and extent. Bears in part: entry 4 (a due date as a cliff; gradient),
  entry 9 (no time of day; gap-fitting refused), entry 13, section 7 (buffers); ADR-0075,
  ADR-0124. Not found: a catalog entry on time laid out spatially, or on things with extent; the
  vocabulary has point clocks only, and spans exist only as timed doing (do-now.timed, focus).
- Roles, and a review of roles to find the one not looked at. Bears in part: entry 34 (the role
  noun as the accommodation), entry 23 (roles named in cold start), entry 18 (curation surfaces
  refused); section 10b; ADR-0096, ADR-0115, ADR-0117, NOTES.md Q-13. Not found: any entry on
  reviewing roles, or on neglect measured by not having looked (searched role in both catalogs).
- Contexts, and what is to hand. Bears: entry 24 (Strong for retrieval mechanisms, untested
  whether asking costs less than scanning), entry 27 (the cost of recording the axis), entry 23,
  entry 14; section 5 (stable context cues) and section 3 (event boundaries). Not found: what is
  physically to hand as a construct.
- Deferring the sorting of an interruption. Bears: section 3 (the cue at the interruption, the
  interrupt gesture, the shape of the interruption protocol), section 4 (capture and decision kept
  apart), entries 6, 14, 17, 27; ADR-0008, ADR-0039, ADR-0079, ADR-0085.
- Why systems are abandoned, and what survives. Bears: entry 12 (retention near 3 to 4 percent),
  entries 11, 15, 18, 28, 29, 31; sections 2 and 6; section 10b (Bellotti: people succeed with
  elaborate manual systems at a cost in effort); ADR-0085; NOTES.md dogfood correction. Not found: any entry on
  why paper, walls or boards survive; the only board method named is the work-in-progress limit
  method in section 7, community-construct.

---

## What was asked

Written in the second pass. In the first two sections, this pass means the first pass; this
section is the second. It records what the app is supposed to do, as it has been asked for, in
design statements of the app in this review's own words. Nothing is quoted. No statement names or
describes who made it, and no particulars of anybody's day or work are recorded. Where a statement
rests on something shown in a photograph, only the properties that bear on design are written and
the contents are not.

Later sections cite a statement by its number. The statements are the measure the first draft is
held against and not findings; whether the first draft meets one is for the later sections to say.

### Sources and coverage

- NOTES.md: the thesis, the failure the app exists to prevent (stated 2026-08-28), the v1
  definition of done and its correction (2026-08-03), and the Block register and its redefinition
  (2026-08-05). [NOTES.md]
- CLAUDE.md: the condition framing and its hazard, the privacy rule, and the rule that a report
  closes on what ended the day. [CLAUDE.md]
- The record of the session in which this review was commissioned, read in place by search and
  never copied. All 41 messages typed by a person were listed by date. Those of 31 October and 1
  November 2026 concern the hub's updates, repository security settings, how a branch is promoted
  and how work is run; none states a design intent for the app and none is used below. Those of 2
  November 2026, from the one that carried a photograph of a wall board and a pad of paper through
  the one asking that finished research not be done again, state the intent in statements 1 to 20.
  One message of that day says another session is changing the hub and its updates are to be used
  here later; that bears on when staging is promoted and on nothing in the design.
- Not recorded, on purpose: the contents of the board and the pad, any particular of anybody's
  day, and anything about who made a statement. A register entry is a shape and never an
  instance, and the same line is held here.

### The measure for this review, stated 2 November 2026

The instrument that survives

1. A system that fails leaves an instrument behind, and that instrument is the measure. What a
   person runs when giving up on a planner is a record of what the planner lacked, so its
   properties are read as design statements and its contents are not recorded. [stated 2026-11-02]
2. One surface, read at a glance. What is needed for the day, the week and the weeks ahead is
   visible together, without opening anything, choosing a view or scrolling a list. [stated
   2026-11-02]
3. Time is laid out in space. The current week is a strip and the next thirty days are a column.
   Things that span several weeks are lanes projected against the thirty days, so that extent is
   seen as length and is not worked out from two dates. [stated 2026-11-02]
4. Landing a thing costs one line, and sorting waits for a moment chosen later. Every unplanned
   thing (a note from a call, a reminder somebody drops by to give, a meeting that suddenly
   appears) is written once, in one place, so that the day does not stop to deal with each
   interruption. Where the thing belongs is decided at a time set aside for sorting. [stated
   2026-11-02]
5. The unowned stays visible. A problem not yet addressed, with no project and no date, is kept
   on the surface and is not filed out of sight. [stated 2026-11-02]
6. What depends on another person stays visible: things waited on from others, future dates that
   must be planned around, and stretches when somebody else is unavailable. [stated 2026-11-02]
7. Grain follows length. Long-term work appears as titles; short-term work carries notes
   underneath. [stated 2026-11-02]

The boundary

8. The app is not asked to become a management tool. The instrument's lessons are carried by its
   properties, and each property is tested, one at a time, against a person under the condition
   with nobody reporting to that person. The ones that pass are in scope: a glance at one
   surface, a one-line landing with the sorting deferred, time laid out with extent, the unowned
   kept visible, and waiting on another person. The one that fails is out: assigning work to
   people and tracking what each carries. A separate management surface is not part of the
   design. The test was put in an answer to a question about drift and was accepted the same day.
   [stated 2026-11-02]
9. The app stays aimed at the condition. No diagnosis is a prerequisite for using it, and no role
   is a prerequisite for benefiting from it. Two goals, a planner for people under the condition
   and a new kind of management tooling, are not chased as one, and a candidate that serves only
   the second is out. [stated 2026-11-02]
10. Depending on another person is in; delegating work and tracking who carries it is out.
    Everyone waits on other people and that belongs in any plan; handing work on and following
    its progress is a different product. [stated 2026-11-02]

Roles and contexts

11. Roles and contexts are different axes, and they cross. A role is what a person is to others
    and what is held in that capacity. A context is where the person is and what is to hand. A
    person has several of each, and more than two contexts. [stated 2026-11-02]
12. Two roles can share a context, and the person chooses what to do there. [stated 2026-11-02]
13. Filtering by role gives control over what is being chosen from. The names do not matter; the
    distinction does. [stated 2026-11-02]
14. A role-based system runs in three directions, and all three are owed. Sort: an input is sorted
    to the role it belongs to and aligned against what the person has, such as time, resources
    and what is to hand. List: what has been sorted is listed, so the person can see what to do
    now that it is sorted and can choose from it. Review: the roles are looked across to find the
    one being neglected. [stated 2026-11-02]
15. Neglect is of a role, and it is measured by not having looked, never by lateness. A role is
    neglected when attention was elsewhere and nobody looked at it, not when a date went by. The
    tie to the app's refusal of any late state is this review's reading; the rest is as stated.
    [stated 2026-11-02]
16. Contexts are fluid, and some stay physical. They shift as technology shifts: a phone is
    always to hand, so having one narrows nothing; a grocery list must still be available to add
    to and to shop from; at home, or anywhere a phone is available, research and calls can be
    done. [stated 2026-11-02]
17. A meeting is a context whose list is its agenda. Certain meetings need certain things shown
    while the person is in them, and agendas for those meetings must be plannable ahead. [stated
    2026-11-02]
18. A context shows its own items unless the person chooses otherwise. With a work context in
    force the home items are not shown, and with a home context in force the work items are not;
    each is shown only on choice. [stated 2026-11-02]

How the review itself is run

19. Nothing is built on the first draft until it has been reviewed. The review records what the
    app does, why it does it, what it is supposed to do, and the intent as it has been
    communicated throughout, and then says which parts stand. [stated 2026-11-02]
20. Learn from others rather than derive again. What others have done, and the way it was done,
    is read before anything is designed; what the catalogs already hold is not researched again
    unless a new entry is written to verify or expand it. [stated 2026-11-02]

### Standing statements already in the record

These were made before this review and are still binding. The review rests on them and does not
restate them at length.

21. What ends an attempt is the dataset. The failures are the data, and a report closes on what
    stopped the day, not on whether a promote is due or a device pass was made. [stated
    2026-08-03; NOTES.md, v1 definition of done; CLAUDE.md]
22. Evidence is the shape and the class, never an instance. A Block register entry records the
    shape of what blocked a day, its class, whether it was a hard block or an adjustment, and the
    release that answers it; the particulars stay outside the repository. [stated 2026-08-05;
    NOTES.md, The Block register]
23. A missed day must not become a new list to sort. The target is rules trusted to put what
    matters on top, not a clear inbox; noise is acceptable and being unable to see past it is
    not. [stated 2026-08-28; NOTES.md, Thesis]
24. The audience is neurodivergent people and the target is a condition: low capacity, high
    demand, interruption, and engagement that varies. Naming the condition is what makes
    cognitive aids, structured handover, high-reliability work and distributed cognition
    applicable. [undated in the files; NOTES.md, Thesis; CLAUDE.md]
25. The condition framing widens what may be researched and never relaxes a refusal. A
    general-population finding may inform a design and may never override a refusal that rests on
    a finding about this audience. The test before citing a general literature is whether the
    finding was measured on people for whom the failure it prevents is expensive; if not, it is
    background and not grounds. [undated in the files; CLAUDE.md; NOTES.md, Thesis]
26. Nothing personal about any person lands in the repository: no diagnosis, health fact or
    identity disclosure attached to a real person, in any file, commit message or pull request
    description. The shape of a use is recordable and an instance is not. [stated 2026-08-04
    according to CLAUDE.md; held by the privacy gate]

---

## What the other research and plans already hold

Written in the third pass. The inventory above read two research catalogs and the decision records.
The repository also holds research and plans directly under docs/ that the inventory did not read.
This section reads them, in the inventory's line shape, so that the outside reading in the next
section starts from what the repository already holds and repeats none of it.

### How this section is read

- Facts only, each line naming the file it came from in brackets at its end. A line that corrects a
  not-found line of the inventory opens with the word Correction. A line that records two files
  disagreeing, or a file disagreeing with the tree, opens with Disagreement, and all of them are
  collected again at the end of this section.
- The seven questions of the inventory are numbered in its order: Q1 the cost of landing one item;
  Q2 reading a system at a glance; Q3 time laid out in space, and extent; Q4 roles, and a review of
  roles to find the one not looked at; Q5 contexts, and what is to hand; Q6 deferring the sorting of
  an interruption; Q7 why systems are abandoned, and what survives. A line says which questions it
  bears on, and names a numbered statement of "What was asked" where it bears on one directly. A
  line that bears on none says so.
- Where and on whom: none of the documents below reports a measurement of its own. They are
  surveys of practice, a design derived from a stated demand, and plans. A line says practice, not
  measured, wherever a document describes a method and gives no evidence for it. Where a line rests
  on a measured finding, it names the catalog entry that holds the measurement, and the measurement
  is that entry's.
- Cited by: found by searching every tracked file for the document's file name, outside
  node_modules, dist, public and .git, as the inventory did. Not guaranteed complete.

### What was read, and what was skipped

- Read whole: docs/horizon-models.md, docs/what-it-should-be.md, docs/structural-assessment.md,
  docs/planning-vocabularies.md, docs/plan-situated.md and docs/plan-routed.md.
- Read in part: docs/build-plan.md (lines 1 to 40 and 100 to 335, and the numbered item lines of
  the module list and phase 0); docs/verifications.md (the opening, the heading of every row, and
  the row V-08).
- Read around each citation of the research file: ADR-0095, ADR-0096 and ADR-0118. Read beyond the
  citation: ADR-0115 and ADR-0119, because they decide how a role line and a meeting are shown.
- Skipped, each for a reason: docs/brand-collisions.md (the identity of the mark, not planning
  research), docs/data-constitution.md (promises about stored data), docs/relay-operations.md
  (running the sync relay), docs/manual.md (the help, generated into a shipped page),
  docs/code-map.md and docs/event-vocabulary.md (read in the first pass), the four JSON files under
  docs/ (generated data) and docs/paths.html (the flowchart source).

### docs/horizon-models.md, a survey of models for working at different horizons

- What it is. Seventeen models surveyed against the ten laws, then three closing sections numbered
  1 to 3 in their own series; a line below says model N or section N. Its filter is the laws, and it
  says the shapes of military models may ship while their words may not. NOTES.md dates it
  2026-08-04. Where and on whom: it names no population and no measurement for any model; each
  account of how a model fails is the document's own reading of practice. Cited by: ADR-0095,
  ADR-0096, ADR-0115, ADR-0118, ADR-0119, the decision index, NOTES.md (seven mentions),
  docs/plan-situated.md (five), docs/nd-collisions.md (one), and comments in src/serves.ts,
  src/roles.ts, src/situations.ts, src/meeting.ts and src/taskpaper.ts. [docs/horizon-models.md;
  NOTES.md; docs/adr]
- Model 1, lines of effort. A named line crosses the organization chart and links tasks from
  different units to an end state by logic of purpose, which makes it a graph over a tree; it decays
  when the assessment rhythm that keeps it alive turns into slideware. Practice, not measured;
  origin in army and joint doctrine. The document says a line of effort and the role of Q-13 are the
  same shape. Kept under the laws: the line as a link kind, purpose projected downward, and the
  split between measuring an effect and measuring performance. Refused: assessment slides, a
  mandatory rhythm, the vocabulary. Bears on Q4. [docs/horizon-models.md]
- Model 2, commander's intent and backward planning. A short statement of purpose lets the bottom of
  an organization act when the plan breaks; backward planning turns a distant date into a fact about
  when to start. Practice, not measured. The document records backward planning as already shipped
  (a feeds relation with a lead estimate, a computed latest start, buffer burn and the replan card,
  release 0.12.0). Bears on Q3. [docs/horizon-models.md]
- Model 3, effects versus tasks. A task is what is done; an effect is the change it was meant to
  produce; the descriptive half is kept and the predictive half refused under law 7. The document
  records that the outcome kind held no nodes at the time of the azimuth check. Practice; the
  framework itself was withdrawn for joint use in 2008 by the document's account. Bears on none of
  the seven. [docs/horizon-models.md]
- Model 4, horizons of focus. The horizons are a reflection prompt that readers mistake for a
  system layer; no artifact links a high horizon to a next action; three pieces are missing, a link
  artifact, computed health, and a cadence that does not rest on the reviewer's own executive
  function. Practice, not measured. Law 4 is described as the deliberate inversion, with the
  horizons coming down on a clock. Bears on Q4 and Q7. [docs/horizon-models.md]
- Model 5, roles and goals. The role is the organizing axis. Each week the roles are listed, one or
  two goals are chosen for each, and the goals are placed on the calendar first. The roles sheet has
  no memory, so two missed weekly sessions leave the system gone rather than stale and the missed
  session does the rest; software versions did not take because the product is the ritual. The
  document says a role is the closest civilian ancestor of the role of Q-13, that a clock cannot
  ride a role because a role is demand-free (law 6, ADR-0014) so the container the role labels
  carries it, and that a descriptive readout of where attention went per role is kept while any
  per-role quota, and any copy telling the reader a named role was neglected, is refused as a
  rebuke with a spreadsheet behind it. Practice, not measured. Bears on Q4 and Q7; statements 14
  and 15. [docs/horizon-models.md]
- Model 6, objectives and key results. Failure modes named: sandbagging, cascade theater, key
  results turning into task lists, Goodhart effects, and the grade migrating into evaluation. The
  software for it survived by reducing alignment to numbers, as quarterly data entry in a tab apart
  from the work. Practice; the failure modes are called well documented with no source named. Bears
  on Q7. [docs/horizon-models.md]
- Model 7, hoshin kanri and the X-matrix. One page whose correlation dots make an unsupported
  objective visible by construction, filled by a negotiation between levels; it fails when the page
  outlives the negotiation, laminated and wrong by March. The unfed-goal and quiet-area exceptions
  are recorded as the empty row computed instead of inked. Practice, not measured. Bears on Q2 and
  Q7. [docs/horizon-models.md]
- Model 8, balanced scorecard strategy maps. The arrows are hypotheses never tested, and the
  scorecard degrades to indicators and status colors because software keeps the numbers and drops
  the arrows. Practice. Bears on none directly; in part on Q2, as the failed form of a one-page
  view. [docs/horizon-models.md]
- Model 9, theory of change. An explicit assumption on every arrow is its distinctive move; it is
  written for funders and rarely consulted at the bottom. Practice. Bears on none of the seven.
  [docs/horizon-models.md]
- Model 10, impact mapping. A named actor stands between the goal and the work, and a deliverable
  with no path to the goal is not built; it is a workshop artifact, stale in a week. Practice. The
  document says the person lens already makes a goal reached through a person expressible. Bears on
  none of the seven; statement 10 in part. [docs/horizon-models.md]
- Model 11, V2MOM. The plan names what will stop it inside the plan; annual essays become plaques.
  The document records the Block register as the same idea aimed at the product. Practice. Bears
  on Q7. [docs/horizon-models.md]
- Model 12, the 12 week year. The most action-productive model in the survey runs on a weekly score
  and a peer meeting, and is refused almost whole; the one fragment kept is that a shorter horizon
  shrinks projection error. Practice. Bears on Q3 and Q7. [docs/horizon-models.md]
- Model 13, north star metric. One metric with a tree of inputs; for a person the premise collapses
  a life into a number. Practice. Bears on none of the seven. [docs/horizon-models.md]
- Model 14, pyramid of clarity. A mainstream task tool did ship the linkage, then computed a
  percentage and a status color from it, in a view a person must climb to. Practice, observed in a
  product. Bears on Q2, as a view nobody visits, and on Q7. [docs/horizon-models.md]
- Model 15, the other software that tried. A freeform outliner or database holds any structure and
  computes nothing; one tool computes an aging score; one holds a daily ritual and stops at the
  week; one re-derives goals every day and has nothing holding anything after a lapse. The shared
  lesson: they compute nothing, the wrong thing, or the right thing on a habit that cannot be
  assumed. Practice, product behavior as of writing. Bears on Q7, and on Q3 for the week-horizon
  tool. [docs/horizon-models.md]
- Model 16, the wheel of life. A self-rated radar of eight to ten life areas, read for lopsidedness
  at a glance. The document says it thrives in journals because there it is a drawing and not a
  system, and fails in software as a dashboard demanding data entry. The readout shape is kept with
  one correction: the app never computes the rating and plots only where attention went. Practice,
  not measured. Bears on Q2, Q4 and Q7. [docs/horizon-models.md]
- Model 17, Wardley mapping. Set aside as situational awareness rather than horizon alignment.
  Bears on none of the seven. [docs/horizon-models.md]
- Section 1, why planning software never offers these views. Five reasons: task lists are trees
  and the links are graphs; the artifacts need a human cadence that software can only nag; strategy
  and execution live in different tools; scoring is the easy and wrong implementation; some of the
  artifacts are records of a negotiation and are posters without it. Practice. Bears on Q4 and Q7.
  [docs/horizon-models.md]
- Section 2, what survives the laws, with the state of each: the reverse walk (built in release
  3.12.0, ADR-0115); the cross-cutting line; downward lineage projection (built in 2.5.0,
  ADR-0095); computed orphan visibility, whose unbuilt half the document names as feeding the
  exceptions into surfacing; backward planning (shipped); the descriptive delta; the attention
  readout (named in ADR-0013, and recorded built in 2.24.0 by docs/plan-situated.md); effects
  versus tasks (gated on evidence); obstacles named inside the plan (the Block register).
  [docs/horizon-models.md; docs/plan-situated.md]
- Section 3, what is refused by name: cascaded numeric targets; status lights; scoring of any kind;
  mandatory cadences and review rituals; alignment theater, which includes promote buttons for empty
  altitude nouns, the full tree as a landing view, and the rule that altitude views are inspection
  modes and not workspaces; manufactured urgency. [docs/horizon-models.md]

### docs/what-it-should-be.md, a plan of record, written from the demand alone

- What it is. Written without opening the source, from the demand, on 2026-08-10 at release 1.42.x;
  named by NOTES.md as one of the two documents that decide what gets built, and held by
  tools/roadmaps.mjs, which requires every item of its status block to name a state. Where and on
  whom: no measurement is reported; the demand is stated as a condition of one person, and the
  document says it was written deliberately blind, then compared against the built app last. Cited
  by: ADR-0086, docs/structural-assessment.md, docs/planning-for-humans.md, tools/roadmaps.mjs,
  .github/workflows/spine.yml, NOTES.md and a docblock in src/nextup.ts. [docs/what-it-should-be.md]
- Part 1, the demand. A person is always thinking of something and cannot see what is not being
  thought of, so coverage cannot be verified from the inside. Four consequences: capture relieves
  only the one thing captured; a list shows what is in it and cannot show what is missing; only a
  claim about the container helps and it must be checkable cheaply from outside at the moment of
  doubt; trust is dichotomous, so a container that holds most things is untrusted and does not
  recover, because one discovered exception invalidates every past assurance. The app is for
  execution and the answer must be shown, not looked up. The modal session is a return after an
  absence, and anything asked of a person must cost the same however long the absence was; the test
  is whether the data degrades or the app starts lying after three weeks skipped. Bears on Q2 and
  Q7; statement 23. [docs/what-it-should-be.md]
- Part 2, the design. Three moments and no fourth: put (cost as near zero as physics allows), next
  (some capacity now, say what to do), proof (is the container holding, one look, no reading).
  One screen: a place to put something down that is always present, one thing to do with its reason
  in a sentence from a small closed vocabulary, and one line asserting that the container holds.
  An item is offerable the instant it exists, and sorting is for three things only: anchoring it,
  attaching it under something, retiring it, none of which is load-bearing for the guarantee. The
  order is deterministic with no learned rank. Declining is free and records nothing, and relief
  must be symmetric between doing and declining. Capacity is declared and never inferred, and it
  changes which things are offered and never how many. Everything said is a fact about the world and
  nothing is a fact about the person, with no counting anywhere the person arrives. The layout is
  fixed forever and the contents are computed. Bears on Q1, Q2 and Q6; statements 2, 4 and 21.
  [docs/what-it-should-be.md]
- Part 3, the comparison. The guarantee the code enforced was that every node has a clock, a
  surface, a menu place or a clocked parent; the guarantee a reader reads is that the thing will
  come back as something to act on; they came apart in one place, a captured thought that was
  covered and not offerable. Five surfaces are named as consequences of that one decision: the
  sorting queue, the forced-choice card, the lighter preliminary pass, the count and the arrival
  corridor. [docs/what-it-should-be.md]
- Part 4 and its status block, measured 2026-09-16 at release 3.24.8. Four items, each with its
  state. Make an unrefined item offerable: done in 2.0.0. Restate the guarantee as the reader's
  version and enforce it: open, because the silence test in src/gate.ts still asks the schema
  question. Demote sorting to refinement: refused by a later record, ADR-0113, which established a
  standing count of the pile as an inventory that measures what is present and not the person, and
  whose overturn clause says the remedy would be to change what the number counts and not to take
  the answer away. Re-ask what the remaining surfaces are for: partly moot, the arrival corridor
  being gone while ADR-0108 rebuilt the entry as a hub door, heat feeding the offer's tie-break, and
  the queue and the forced-choice card remaining. The status block adds that the remaining work is
  subtractive and that no cold read will propose it. Three checks owed before building are listed,
  one corrected (the offer boundary excluded unclarified captures for a reason written in ADR-0030),
  two still open: that nothing else depends on an unclarified state, and whether a large unrefined
  backlog gives a sensible offer in arrival order on real data. [docs/what-it-should-be.md]
- Disagreement, resolved inside the file. Part 2 says no counting anywhere the person arrives; the
  status block records that ADR-0113 later established a standing count of the pile and that the
  later record governs. [docs/what-it-should-be.md]

### docs/structural-assessment.md, a plan of record, measured at release 3.24.1 and 3.26.0

- What it is. A census of where the app's projections disagree with each other, then an ordered
  remedy; named by NOTES.md as the second of the two documents that decide what gets built, held by
  tools/roadmaps.mjs. Where and on whom: it is a census of the source, five read-only passes, with
  each claim naming a file and line; it says its reading was verified against source and history and
  was not adversarially refuted. Cited by: tools/roadmaps.mjs, .github/workflows/spine.yml,
  docs/what-it-should-be.md, test/clock-intent.test.ts, NOTES.md (two) and this review.
  [docs/structural-assessment.md]
- The census. Dates: thirty-two places read the clocks of a node to answer when it comes back, in
  eight incompatible rules, with four functions turning a date into words that disagree at the
  edges and eleven disagreements between surfaces. Coverage precedence: one function restated three
  times, six rounds of the same ordering mistake. Counts: two populations printed on one sheet, and
  three incompatible meanings of under. Reachability: a live region shipped visually hidden three
  times. Gates: twelve exist to hold two hand copies together. The shipped page is 59 percent
  commentary. Bears on Q2, since a glance reads the same sentence on every surface only if the
  surfaces share one reading, and on Q3, since any new surface that lays dates out reads the clocks
  of a node unless the one reading described below exists. [docs/structural-assessment.md]
- The status block, measured 2026-09-16 at 3.26.0. Phase 0, six dead ends: all done, in 3.24.3,
  3.24.6 (two) and 3.26.0 (three); they include the interruption route with no way back, the
  Someday default reading Read, and hot and cold not being revisable. Phase 1, one reading per node:
  open, its first step landed (the intent record is complete and typed) while src/reading.ts does
  not exist and the thirty-two derivations stand. Phase 2, one precedence chain: open. Phase 3, one
  population per count: open, with ADR-0113 to be read first. Phase 4, the reachability gate asks
  whether a sentence is seen: done in 3.24.8. Phase 5, retire the eight duplications: open, two
  parts landed. Phase 6, halve the shipped page: open and untouched. Three decisions are listed as
  awaiting a choice: the date rule, the count on the information sheet, and the phase order.
  [docs/structural-assessment.md]
- Bears on Q6. The interruption route with no way back is its Phase 0 item, done in 3.24.6, with
  the offer stripped on the worst day in 3.24.7. [docs/structural-assessment.md]
- Disagreement with the tree. Phase 5 says the workflow audit stays off by the hub's call and that
  the Spine does not enable it; .github/workflows/spine.yml now carries the audit switched on, with
  a comment saying why. The other Phase 5 facts read here agree with the tree: tools/hooks/
  tour-fresh.sh is still on disk, and src/reading.ts does not exist. [docs/structural-assessment.md;
  .github/workflows/spine.yml]

### docs/planning-vocabularies.md, which of three vocabularies owns what

- What it is. A mapping of military planning doctrine, project management practice and this app,
  term by term, with the rule that doctrine owns the thinking, project practice owns the
  decomposition and this app owns the return. It says the app holds work, not reasoning, refuses
  containers for intent, information requirements, facts and assumptions or a restated mission, and
  gives an eight-step sequence for one person with no staff, after which only the tasks with their
  holders and dates, and the conditions as changes lines, go into the app. Where and on whom: none;
  the document says the identities and dates of the doctrine manuals were confirmed from the
  publisher on 2026-08-31 and the content was written from memory and not checked. Cited by: no
  tracked file names it. Bears on none of the seven in full; in part on Q2, through its test that a
  standing list holds only what would change what the reader does if told, and on statement 10
  through its mapping of who holds what. [docs/planning-vocabularies.md]

### docs/plan-situated.md, the plan and resume point for situations

- What it is. A plan written after fourteen situations were put to the app on 2026-08-21, with nine
  phases and a state block updated with the work. Its finding: thirteen of the fourteen are queries
  against a situation and the app had one answer; no session of real use had gone past a fresh
  import or a handful of sample items; on an import of about a thousand actions there were zero
  contexts, roles, areas, goals and people, so the built machinery had nothing to work with. Where
  and on whom: measured on the app's own stores, an import fixture of 840 actions under 42 projects
  with 518 passed dates and nothing situational, and the thirteen-item sample; no people. Cited by:
  docs/plan-routed.md (three), docs/nd-collisions.md (three) and NOTES.md (one).
  [docs/plan-situated.md]
- State by phase. Phase 0 done. Phase 1: the core defect fixed in 2.15.0, an import landing in the
  inbox and offered one at a time; the situational question in the flow left open, later closed by
  docs/plan-routed.md. Phase 2 complete (2.16.0, 2.17.0, 2.18.0 and 2.18.1): a container's kind
  chosen when it is made, a review clock on a container without converting it, a sheet listing every
  goal, area and outcome with the empty ones included, and bulk put-under. Phase 3 complete
  (2.19.0 and 2.19.1): how long you have, and the count of what is dated today. Phase 4 done in
  2.20.0: the promised-to relation, built with no field that could age a promise. Phase 5 done:
  where you are and how long you have moved behind one door in 2.21.0, named situations as events,
  and the attention readout per role in 2.24.0. Phase 6 done in 2.22.0: a way to read the re-entry
  report that writes nothing. Phase 7 done in 2.23.0: the Menu category chosen at write time and a
  second door to naming a first step. Phase 8 done in 2.23.1. Bears on Q1, Q3, Q4 and Q5.
  [docs/plan-situated.md]
- The attention readout. The document draws the line between load, what a role carries, and
  attention, what it was given: a role can carry nine things and have had none of the reader's time.
  The readout reads timed minutes from the do-now timer, never completions, is sorted by name, and
  carries no proportion and no target; it was held back for three releases because it renders
  empty on a store that has not used the timer. Bears on Q4. [docs/plan-situated.md]
- Measured in screens and pixels. After the phases, rendering at phone and tablet width found the
  situation door 2129 pixels below the offer on a phone (3.84 screens) and 1983 on a tablet, inside
  the section it narrows; fixed in 2.23.1 to 64 pixels above the offer at both widths. The import
  fixture reads 1.8 screens and 26 controls with one thing offered. At width 768 every card spans
  the full width, the width of 1180 (tablet landscape) was never measured, and no maximum measure
  was set. Bears on Q2. [docs/plan-situated.md]
- The fourteen situations, walked. The two answered only in part: a free weekend, because the
  longest duration choice is 120 minutes so having a lot of time has no positive expression; and a
  spare twenty minutes with no preparation, because with no preparation is not a question the app
  can be asked. Bears on Q3 and Q5. [docs/plan-situated.md]
- Disagreement within the file. The summary says eleven answered and three in part; the list
  beneath it marks twelve answered and two in part. [docs/plan-situated.md]
- Disagreement with another file. The resume block's last lines name an old version for one branch
  and a count of releases the other branch is ahead; docs/plan-routed.md says such claims were
  removed from the plans because a second copy goes wrong on the next promote, and that the one
  place for them is the branch-state block of NOTES.md. [docs/plan-situated.md; docs/plan-routed.md]
- Disagreement with another file. The block says a session cannot read the deployed site, the
  network policy answering the connect with a refusal for the hosting domain; CLAUDE.md says a
  session probably can and names tools/deployed-check.mjs. Which holds depends on the session's
  configuration, as CLAUDE.md says. [docs/plan-situated.md; CLAUDE.md]

### docs/plan-routed.md, what the research routes next

- What it is. A second plan written 2026-08-23 after plan-situated.md finished, in which every item
  traces to a numbered catalog entry carrying that entry's own evidence grade, and anything derived
  from the code is ranked last and says so. Its premise is catalog entries 23 and 3: a taxonomy is
  treated as a prerequisite when it should be an outcome, and filing removes the cue that was doing
  the remembering, so the work is to make the app useful at nearly zero taxonomy. Where and on
  whom: it rests on the catalog's grades and on the same import fixture; it states that a real
  import of 1,173 items left eleven of fourteen node kinds at zero. Cited by:
  tools/branch-state-check.mjs and a comment in src/contexts.ts. [docs/plan-routed.md]
- State. Phases 3, 4, 5, 6 and 7 done in 2.25.0, 2.26.0 and 2.27.0; phase 1 done in 2.28.0, its
  trigger being the situation sheet with no place named; phase 2 not built, deliberately, because
  role and container have no dead end to ask at and manufacturing one would be a first-run
  organizing flow; the plan is closed. The phases are: ask once in the flow; the same mechanism for
  role and container; the arrival as a fact and not a debt; an import's size not outranking an
  ordinary day; a long answer routing to the Menu; presence as a third filter axis; a place
  reaching what is under it. Bears on Q1 (phases 1, 3 and 4), Q3 (phase 5, on the reasoning that a
  block of open time is limited by want and not by duration, which it takes from entry 24), and Q5
  (phases 6 and 7). [docs/plan-routed.md]
- Refusals carried forward. A setup wizard, template chooser or first-run organizing flow; a
  completion meter for how much structure exists; inferring a context, role or container from
  behavior; inferring structure from the free text of a situation; gap-fitting against clock time,
  since the schema has no time of day; a hard cutoff that makes a mis-estimated item vanish; a menu
  of named situational screens; a bespoke meeting mode, which waits on the person axis; and
  exclusive places, because a place that hides everything not labeled with it reconstructs the
  untrusted filter, so the default that an unlabeled thing fits every answer is load-bearing. Bears
  on Q3 and Q5; statements 17 and 18. [docs/plan-routed.md]
- A sequence, not a disagreement. The refusal of a bespoke meeting mode names a wait for the person
  axis; ADR-0119, dated 2026-08-30, built a meeting as an inspection mode over the people in a
  saved situation, and not as a filter. [docs/plan-routed.md; docs/adr/0119-a-meeting-is-somewhere-you-can-stand.md]

### docs/build-plan.md, the v1 build sequence

- What it is. The architecture and the build order for v1, written after the decision records and
  the event vocabulary, ordered by what day one of the dogfood gate needs. Forty-three numbered
  items in nine phases; by a search for items that open struck through, nine carry a done mark and
  thirty-four carry no state mark. Section 5 carries a status note dated 2026-08-01 saying which
  gates were live and that grayscale legibility was not built. Section 7 lists seven questions open
  before code, among them the name, the iPadOS persistence check, the journal key derivation and
  what earns a module offer. Where and on whom: it reports no measurement; item 9 sets a budget and
  says it is a test. Cited by: seventeen files, NOTES.md (fourteen mentions) and ten decision
  records among them. [docs/build-plan.md]
- Items that bear on the questions. Item 9: the write path measured cold, under two seconds, on the
  tablet that is the reference platform, as a test and not an aspiration; item 42 repeats it as a
  measurement of cold start and capture budget on that device. Item 8: a dump surface with no
  chrome, one line per card. Item 12: an interrupt gesture, pin and capture, available from every
  screen. Item 21: a coverage gauge, tappable, showing each item's return date. Item 29: the
  lowest notification tier, whose parts are permission, badge and glance surfaces. Item 38: an
  attention-distribution readout, descriptive and never prescriptive. Item 37: the review kept to a
  short ranked handful because an exhaustive list is a backlog. Bears on Q1, Q2, Q4 and Q6.
  [docs/build-plan.md]
- Phase 6 opens by saying it is where the gate is won or lost, and that without the work half the
  desk paper stays. A practice claim, not measured; it is the repository's one sentence about why a
  paper system persists. Bears on Q7. [docs/build-plan.md]
- Disagreement. Item 32 defines a role as a mode, Execute or Track, where Track emits no next
  actions and keeps only waiting-fors and check-ins; the role that shipped (ADR-0096, release
  2.6.0) is an identity a thing carries and crosses areas, and item 32 carries no state mark. The
  Track mode sits beside statement 10, which keeps depending on another person in and tracking who
  carries delegated work out. [docs/build-plan.md; docs/adr/0096-roles.md]

### docs/verifications.md, the one row about comparison

- V-08, a competitive pass on the five claimed differences, is marked not run and deferred on
  purpose, because it informs positioning copy and nothing in v1's design; its trigger is before the
  first public release copy is written. The five claims are the decay lane, unified suspend capture
  and resume, bother triage with clock-guaranteed routes, the horizon-integrity engine and the
  pebble load ledger. docs/planning-for-humans.md section 11 states the same five as claims and says
  the pass was not run. No file in the repository records a comparison of any other tool against the
  instrument that survives a failed system (statement 1). [docs/verifications.md;
  docs/planning-for-humans.md]

### The seven questions after these documents

Each line says what these documents add and what is still held by no entry in the repository. The
outside reading that follows is aimed at the second half of each line only.

- Q1, the cost of landing one item. Added: a time budget for capture, under two seconds cold on the
  reference tablet (build-plan items 9 and 42, the second not marked done); an import measured in
  controls and screens (plan-situated); the arrival sentence and the ask-once rule (plan-routed);
  an item offerable the instant it exists (what-it-should-be, done in 2.0.0). Correction: the
  inventory's not-found line was a measurement of presses per sorting route; that stands, narrowed,
  because time and screens are measured and presses per route are not. Still held by no entry: a
  measurement or a finding on presses per route.
- Q2, reading a system at a glance. Correction: the inventory found no glance, board or wall as a
  construct in either catalog. These documents hold the glance in one form, the proof as one look
  and no reading on a screen whose layout never changes (what-it-should-be), a one-page matrix that
  fails as a poster (model 7), a radar read at a glance that survives on paper (model 16), a
  glance surface named in the notification tiers (build-plan item 29), and reachability measured in
  screens (plan-situated). Still held by no entry: a physical wall or board as a construct, and any
  evidence on what a glanceable surface does for a reader.
- Q3, time laid out in space, and extent. Correction in part: backward planning from a far date is
  shipped and surveyed (models 1 and 2); the longest duration choice is 120 minutes and a free
  weekend is answered in part (plan-situated); a long answer routes to the Menu (plan-routed);
  thirty-two derivations of when a thing comes back stand, with the one reading not built
  (structural-assessment). Still held by no entry: time laid out spatially for one person, and
  things with extent drawn as length.
- Q4, roles, and a review of roles. Correction: the inventory found no entry on reviewing roles.
  The weekly role review is surveyed as practice that decays on a missed session, with neglect copy
  refused (model 5); the attention readout per role is built on timed minutes (plan-situated); the
  review clock rides the container a role labels and not the role (models 5 and section 2). None of
  these measures neglect as not having looked. Still held by no entry: neglect of a role measured
  by not having looked, and any evidence on reviewing a set of roles.
- Q5, contexts, and what is to hand. Added: three narrowing answers built, where you are, how long
  you have and who is with you (plan-situated, plan-routed); the default that an unlabeled thing
  fits every answer, load-bearing; exclusive places refused; a meeting built as an inspection mode
  over people and not as a filter (ADR-0119). Still held by no entry: what is physically to hand as
  a construct, a meeting whose list is its agenda, and any evidence on whether a context should hide
  other domains by default.
- Q6, deferring the sorting of an interruption. Added: the interruption route with a way back (done
  in 3.24.6 and 3.24.7); sorting is not load-bearing for the guarantee and demoting it to
  refinement is refused by ADR-0113; the interrupt gesture from every screen (build-plan item 12).
  The catalogs already answer this question; no fetch is aimed at it.
- Q7, why systems are abandoned, and what survives. Added: homework is abandoned first, trust is
  dichotomous and does not recover, the modal session is a return after an absence
  (what-it-should-be); five structural reasons software does not hold these views and the tool
  roster (horizon-models); a machine with nothing to work on because a taxonomy was a prerequisite
  (plan-situated, plan-routed). Correction in part: the inventory found no entry on why paper
  survives; two practice sentences exist, the wheel thriving in journals as a drawing (model 16)
  and the desk paper staying without the work half (build-plan phase 6), neither measured. Still
  held by no entry: why walls and boards survive as a construct, and what ends the attempt as a
  measured class.

### Disagreements collected from this section

- structural-assessment.md Phase 5 says the workflow audit stays off; spine.yml switches it on.
- plan-situated.md counts eleven situations answered and three in part; its own list marks twelve
  and two.
- plan-situated.md names an old version and a releases-ahead count for the branches; plan-routed.md
  says those claims live only in the branch-state block of NOTES.md.
- plan-situated.md says a session cannot read the deployed site; CLAUDE.md says it probably can.
- horizon-models.md section 3 states the inspection-mode rule for altitude views; ADR-0115,
  ADR-0118, ADR-0119 and source comments cite it for role lines, situations and meetings, and
  statements 13 and 18 ask for narrowing by role and by context, which roles.ts and ADR-0115
  refuse for a role and ADR-0119 refuses for a meeting, while the shipped answers narrow by place,
  duration and person. The assessment decides what that means.
- build-plan.md item 32 defines a role as a mode; the shipped role is an identity.
- horizon-models.md records the outcome kind as holding no nodes; plan-situated.md records the kind
  chosen at creation from 2.16.0; neither says how many exist.

---

## Research additions

Written in the third pass, and numbered R1 onward; the next pass continues the numbering. An entry
is written only for one of three reasons, and says which. Gap: a question with no entry anywhere in
the repository bearing on it, as the section above leaves it. Verify: an entry whose claim the
assessment will rest on and whose source the entry does not name or measure. Expand: an entry that
bears on a question only in part. A question the catalogs already answer gets one line and no fetch,
and Q1 and Q6 are of that kind here.

### How the outside sources were read

- The page-fetch tool refused two hosts at name resolution, in the session's own words outside its
  allowed network domains: philarchive.org, which would have returned the abstract page of the
  1995 space paper (R6), and hci.ucsd.edu, which would have returned the draft of the 2000
  distributed-cognition paper (R5). The tool said to stop trying further hosts once a second failed
  the same way, so no other fetch host was tried and no other route to those two was taken. What
  they would have answered: the full abstract and the populations of the two sources.
- Every entry below therefore rests on what the web search tool returned: bibliographic records,
  abstracts and secondary summaries. No primary text was opened for any source. Each entry says
  where its figures come from, and a figure that came from a press summary or a forum is marked as
  such. An entry that an assessment would have to rest on is to be read against the primary text
  first, and the entry says so.
- The app's own test is applied to each source: was the finding measured on people for whom the
  failure it prevents is expensive. Grounds means yes. Background means no, and a general
  population result is background even where it is large. A method with no measurement is recorded
  as practice, and none of the entries overrides a refusal.
- Methods are named by author, year and a description, and the titles that carry a method's
  registered name are not written in this section. The repository already names two of them: see
  horizon-models.md model 4 and model 16, and planning-for-humans.md section 7.

### Boards, piles and why paper is used (gap, Q2 and Q7)

- R1, Malone, 1983, How do people organize their desks? Implications for the design of office
  information systems, ACM Transactions on Office Information Systems. Office desks hold two units:
  files, which are titled and arranged, and piles, which are neither; both serve finding and
  reminding, and files were hard because choosing a classification was hard. Where and on whom:
  interviews and office tours with about ten office workers, by a secondary summary, which also says
  the study is not statistically generalizable. Verdict: background. Reason: gap, Q2 and Q7; no
  catalog entry says why a pile of unsorted things persists as a reminder, and statement 5 keeps the
  unowned visible. Read through a secondary summary; read the primary before resting on the
  reminding function, whose wording was not confirmed.
- R2, Kidd, 1994, The marks are on the knowledge worker, CHI 1994. Knowledge workers carried little
  written material, rarely consulted filed material at their desks, and used a cluttered desk as a
  holding area for current inputs and ideas; the author concludes that software should support
  informing and not filing. Where and on whom: interviews of two to three hours with twelve
  knowledge workers, by the search extract; a later case study of a legal
  team found strong agreement with the core definitions and questioned some secondary ones.
  Verdict: background. Reason: gap, Q2 and Q7; it is the measured counterpart of R1 for what is held
  in view and not filed, and bears on statements 4 and 5.
- R3, Wears, Perry, Wilson, Galliers and Fone, 2007, Emergency department status boards:
  user-evolved artefacts for inter- and intra-group coordination, Cognition, Technology and Work.
  Status boards in a United States emergency department and a United Kingdom pediatric ward were
  strikingly similar in form and use; front-line staff evolved them with little supervisory control,
  and a companion paper by two of the authors cautions that standardizing or computerizing such a
  board risks losing latent properties that matter to safe working. Where and on whom: observation
  of clinical staff in two hospital settings, where a coordination failure is expensive. Verdict:
  background, because the failure prevented is group coordination in a hospital and not one person
  dropping an intention; it names a risk for any digital version of a board and grounds nothing in
  the app. Reason: gap, Q2 and Q7; a board as a construct is held by no entry, and the document
  names it only as a wall poster in horizon-models.md model 7. The companion paper's caution is from
  the same search extract and was not opened.
- R4, Xiao and colleagues, 2007, What whiteboards in a trauma center operating suite can teach us
  about emergency department communication, Annals of Emergency Medicine. Staff use of a whiteboard
  in a surgical trauma unit was observed and photographed; the board supported task management, task
  articulation and resource planning and tracking, and the authors advise that any electronic
  replacement keep those functions. Where and on whom: observation of trauma-unit staff; the full
  author list was not confirmed. Verdict: background, for the reason given in R3. Reason: gap, Q2;
  its three functions are a measured account of what a board does that a list does not, and bear on
  statements 3 and 6 (extent, and what waits on others).

### Distributed cognition, space and situation awareness (gap, Q2 and Q3)

- R5, Hollan, Hutchins and Kirsh, 2000, Distributed cognition: toward a new foundation for
  human-computer interaction research, ACM Transactions on Computer-Human Interaction. The paper
  argues that research should study whole environments and how people coordinate their activity
  within them, treating cognition as distributed across people and artifacts. Where and on whom: the
  extract is a partial abstract only; the settings it draws on were not confirmed, and the draft was
  at a blocked host. Verdict: background, a framework and not a measurement. Reason: gap; the
  thesis names distributed cognition as a literature and no entry holds a finding from it. Not to be
  rested on until the primary is read.
- R6, Kirsh, 1995, The intelligent use of space, Artificial Intelligence. A classification of how
  people arrange the items around them: arrangements that simplify choice, arrangements that
  simplify perception, and dynamics that reduce internal computation; the author argues that
  arranging items is part of how people think and plan. Where and on whom: observation of videos of
  cooking, assembly and packing, supermarket and workshop observation, and experiments with people
  playing a falling-blocks game, by the abstract as the search extract gave it; the abstract page was
  at a blocked host. Verdict: background; the people were competent adults and the failure is not
  expensive to them. Reason: gap, Q2 and Q3; it is the nearest finding to time laid out in space as
  an arrangement that lowers the cost of perception, and nothing in either catalog says so.
- R7, Endsley, 1995, Toward a theory of situation awareness in dynamic systems, Human Factors. A
  model of situation awareness in three levels: perceiving the elements of a situation, comprehending
  them, and projecting them into the near future, with attention and working memory as limits on
  each. Where and on whom: a theoretical model built on dynamic decision making in several domains;
  its measurement work, not read here, is in aviation and air traffic. Verdict: background; the
  failure is expensive to the operators but is not this audience's. Reason: gap, Q2 and Q3; reading
  a system at a glance is the first level and a layout of time ahead is the third, and the thesis
  names situation awareness without an entry. Level two was not described in any extract.
- R8, Weick and Sutcliffe, Managing the Unexpected, first edition 2001 and third edition 2015, with
  the field studies of La Porte, Roberts and Rochlin in 1987 and 1988 behind it. High-reliability
  organizing rests on five principles, named in the third edition as failure, simplification,
  operations, resilience and expertise, and began as fieldwork on organizations with hazardous work
  and few accidents, two of them naval aircraft carriers. Where and on whom: field studies of
  organizations where failure is catastrophic; practice and ethnography, not an experiment. Verdict:
  background as a pointer only; the extracts gave the names of the principles and not their
  definitions, so nothing in the assessment may rest on this entry until the definitions are read.
  Reason: gap, Q2 and Q7; high-reliability work is one of the four literatures the thesis names and
  no entry holds it.

### Time laid out, and what is known of calendars and schedules (gap, Q2 and Q3)

- R9, Huang, Yang and Morwitz, 2022, How using a paper versus mobile calendar influences everyday
  planning and plan fulfillment, Journal of Consumer Psychology; the year is the one the press
  summaries agree on and the issue was not confirmed. Three experiments. In the first, 129
  undergraduates were assigned at random to a paper or a mobile calendar for two weeks, and paper
  users fulfilled plans at 53 percent against 33 percent; the authors explain it by the paper
  calendar giving a broader view of nearby activities, and in a second experiment the paper
  advantage became marginal when the mobile condition was told to take a big-picture view. Where and
  on whom: undergraduates in the first experiment, the other samples not being described in the
  extract, by university and college press summaries and a trade write-up; the journal article was
  not opened. Verdict: background. The people are not the
  audience, and the outcome, on-time fulfillment of plans, is a completion measure this app
  refuses to compute about the reader; what it offers is a mechanism, a broad stable view over time,
  and the finding that the view and not the paper carried the effect. Reason: gap, Q2 and Q3; no
  entry says what laying time out in view does for a reader. Read the primary before any figure is
  cited from it.
- R10, Tungare, Perez-Quinones and Sams, 2008, An exploratory study of calendar use. A survey of 98
  people, interviews with 16, and an examination of calendar artifacts, among faculty, staff and
  students; findings include reliance on paper calendars even among regular users of electronic
  ones, the use of multiple reminder alarms, and wide use of calendars for reporting and for
  keeping a record. Verdict: background; a descriptive study of a university population. Reason: gap,
  Q3 and Q7; it is the one observation in the reading of what people do with a calendar when a
  digital one is at hand. The extract carried the abstract and the method summary only.
- R11, Safren and colleagues, 2010, Cognitive behavioral therapy vs relaxation with educational
  support for medication-treated adults with ADHD and persistent symptoms, JAMA. Eighty-six
  symptomatic adults already on medication were randomized to twelve individual sessions of
  cognitive behavioral therapy or relaxation with educational support; the first module of four
  sessions trained organizing and planning with a calendar and a task list; responders were 53
  percent against 23 percent on a clinician global rating and 67 against 33 percent on an
  attention-deficit rating scale, and gains held at 6 and 12 months among responders. Where and on
  whom: adults with the condition, which is the audience; figures from secondary summaries. Verdict:
  grounds, narrowly. The finding is that a calendar and task-list skill set taught by a therapist,
  inside a package, was followed by better symptom ratings than a control; it does not isolate the
  calendar, it concerns a trained skill and not a tool that offers a shape unaided, and the
  catalog's own frame (nd-collisions.md header) records that non-pharmacological interventions lack
  demonstrated efficacy on core adult symptoms. It grounds no feature, and it does not override
  any refusal. Reason: gap, Q3 and Q7; it is the one finding on a calendar-and-list system measured
  on the audience.
- R12, Knight, Sartini and Spriggs, 2015, Evaluating visual activity schedules as evidence-based
  practice for individuals with autism spectrum disorders. A review of studies published from 1993
  to 2013 of visual activity schedules, in which 31 studies met the inclusion criteria and 16 were
  of acceptable quality; the national autism practice reviews (a 2020 update by Steinbrenner, Hume
  and colleagues, building on Wong and colleagues, 2015) class visual supports as an evidence-based
  practice for children and young adults on the spectrum. Where and on whom:
  students on the autism spectrum, mostly in structured settings. Verdict: grounds, narrowly, for
  the claim that a sequence laid out in view helps autistic students carry out the sequence, since
  the people are part of the audience and the failure is expensive to them; background for adults,
  and for time laid out at the scale of weeks, which a daily activity schedule is not. Reason: gap,
  Q2 and Q3; it is the one body of evidence on laying a sequence out visibly for people under the
  condition. The second review's figures were not read.

### Roles, and a review of roles (gap, Q4)

- R13, Merton, 1957, The role-set: problems in sociological theory. A role-set is the complement of
  role relationships a person has by holding one social status, so one status carries an array of
  relationships and not one role; a person holds several statuses, which Merton named a status set.
  Where and on whom: a theoretical essay, practice and not measurement; the second term's definition
  was not confirmed from the essay. Verdict: background. Reason: gap, Q4; the review's statement 11
  defines a role as what a person is to others and what is held in that capacity, which matches a
  role defined by its relationships, and the app's role noun is an identity a thing carries with
  relationships held in a separate noun, the person. Expand: ADR-0096 and Q-13 define the noun and
  no entry names where the definition comes from.
- R14, Marks and MacDermid, 1996, Multiple roles and the self: a theory of role balance, Journal of
  Marriage and the Family. Role balance is the tendency to engage fully in every role of one's role
  system, with an even-handed alertness the authors liken to mindfulness; the main hypothesis was
  that more balance goes with less role strain and depression and with higher self-esteem and
  ease. Where and on whom: two studies by the abstract; the samples were not recovered by two
  searches. Verdict: background, and it must not be rested on until the samples are read. Reason:
  gap, Q4; it is a construct of attentiveness to every role, measured by engagement and not by
  lateness, which is the nearest to statement 15 that the search found. The wording of the
  definition is from a later essay quoting it.
- R15, Harkin and colleagues, 2016, Does monitoring goal progress promote goal attainment? A
  meta-analysis of the experimental evidence, Psychological Bulletin. A pooled analysis of 138
  studies and 19,951 people randomized to a monitoring-promotion condition or a control: the
  interventions raised monitoring frequency and modestly improved goal attainment (d about 0.40),
  with larger effects where progress was physically recorded and where it was reported or made
  public. Where and on whom: general-population samples, most concerning health goals; the public
  category held three studies and a wide interval. Verdict: background, and the case the app's own
  rule warns of: a result positive on average, built on interventions that raise the frequency of a
  scheduled look and measured by attainment, in people for whom a missed look is cheap. It does not
  override the refusal of a mandatory review cadence. Reason: gap, Q4; no entry holds any evidence
  on reviewing progress. Figures are from the abstract as the search extract gave it and a press
  release.

### Contexts and what is to hand (gap, Q5)

- R16, Kreiner, 2006, Consequences of work-home segmentation or integration: a person-environment
  fit perspective, Journal of Organizational Behavior. Among 325 workers across many occupations and
  organizations, the fit between a person's preferred segmentation of work from home and the
  segmentation the workplace provides predicted work-home conflict, stress and satisfaction; the
  record says the result challenges earlier work advocating integration as the remedy. Where and on
  whom: a survey of working adults in the general population. Verdict: background. Reason: gap, Q5;
  statement 18 sets a default that a context shows its own items unless the person chooses
  otherwise, which is a segmentation default, and no entry says whether people differ in preferring
  it. The effect sizes and the fit combinations were not in the extract.
- R17, Allen, 2001, revised 2015, the workflow book that introduced context lists, whose title is
  a registered mark and is not written here; horizon-models.md model 4 names it. A context is the
  place or tool a next action needs, so a person at a home desk is in several at once; the 2015
  revision was made to reflect a decade of change in information technology, by an encyclopedia
  entry; practitioners on an online forum for the method report that phone work sits inside computer
  work and not the reverse, that a
  task doable on either is awkward to tag, and some have dropped contexts because estimating
  priority, energy and time costs more than it returns. Where and on whom: practice and user
  reports, not measurement; the book was not opened, and the forum posts are individual reports.
  Verdict: practice, background. Reason: expand, Q5; horizon-models.md model 4 treats the method's
  selection criteria in one line, and the nesting of one context inside another is the shape of
  statement 16, where a phone is always to hand and narrows nothing. What the 2015 edition says
  about contexts was not confirmed.

### Notebook methods and a board method (expand, Q7 and Q6)

- R18, Carroll, 2018, the book setting out a notebook method with a monthly migration step, whose
  title carries the method's registered name and is not written here. At the
  end of each period every open item is reviewed and rewritten forward only if it is still worth the
  time; otherwise it is moved to a separate collection or dropped, and the method's own site frames
  migration as distilling what is worth the effort. Guides add that an item that keeps moving
  without progress is either being avoided or was never important; that reading is a guide's, not
  the book's. Where and on whom: practice, not measured; one guide's figure claiming an improvement
  in goal achievement was found unsupported and is disregarded. Verdict: practice. Reason: expand,
  Q7 and Q6; the repository names the method once, in passing, and nothing says what migration does
  to a stale item. The answer is that no item stays open without a decision at a chosen time, which
  the replan card also does at the moment a date passes.
- R19, Ayobi, Sonne, Marshall and Cox, 2018, Flexible and mindful self-tracking: design implications
  from paper journals of the notebook method (the published subtitle carries the method's
  registered name, which is not written here), CHI 2018. An analysis of public posts of paper
  journals shared on a photo-sharing site, arguing that digital self-tracking is often too rigid for
  everyday needs, that the paper form is customizable, and that tracking should support mindful
  engagement and balance, against a behavior-change paradigm. Where and on whom: a corpus of public
  posts and not interviews, so nothing is known of the posters; no finding about migration appeared
  in the extracts. Verdict: background. Reason: expand, Q7; it is the one academic study of the
  paper method, it bears on why a flexible paper form survives, and it is recorded here so that it
  is not read as evidence about stale items.
- R20, Benson and Barry, 2011, the book adapting kanban to one person's work, whose title carries
  the method's name and is not written here. Two rules, visualize the work and limit work in
  progress, adapted from a manufacturing flow system; the authors say they wrote it because
  everyone they spoke to was overloaded. Where and on whom: practice, not measured; a search for
  peer-reviewed evidence of effect on personal productivity found none. Verdict: practice,
  background. Reason: expand, Q2 and Q7; planning-for-humans.md section 7 takes only the limit on
  work in progress, tagged a community construct, and the first rule, a board that shows all the
  work at once, is the half that bears on the glance and is not in the catalog.

### Read and not entered

- Sohn, Li, Lee, Smith, Scott and Griswold, 2005, Place-Its: a study of location-based reminders on
  mobile phones, UbiComp. A ten-person, two-week study found location-based reminders useful
  despite low accuracy because people use location in nuanced ways. Not entered: it is the
  mechanism entry 24 already holds, and says nothing about what is physically to hand.
- The 2008 diary study of reminders in situ by Sohn and colleagues was not found by search and is
  not entered; a NASA diary study of everyday prospective memory by Holbrook and Dismukes, 2009,
  was returned and not read.
- Searched and not found: a source on what is physically to hand as a planning axis, and a source
  that measures neglect of a role by not having looked (R14 is the nearest, and its samples were not
  recovered); both stay held by no entry. Not searched: a meeting whose list is its agenda, because
  it is a design statement with the person axis already built (ADR-0119) and not a method named in
  this pass. Q1 and Q6 are answered by the catalogs, in entry 27 and in sections 3 and 4 of
  planning-for-humans.md, and got no search.

### How the outside sources were read in the fourth pass

- Written in the fourth pass; the numbering continues from R21. Before any fetch the pass read what
  the environment's proxy reports at its status address. The report says the proxy is enabled and
  that no relay failure was recorded; it lists no allowed hosts, so reachability was learned one
  fetch at a time.
- One page-fetch host was refused at name resolution, in the tool's words outside the session's
  allowed network domains: csel.eng.ohio-state.edu, which would have returned the full text of the
  2004 review of trust in automation (R26), the one source here whose claim about how trust is lost
  and regained the repository's own files lean on. The tool said to stop trying further sites once a
  host failed that way, so no other host was tried for it and no other route was taken.
- One page was fetched and read, the abstract page of the 2026 interview study (R22). Everything else
  rests on what the web search tool returned: bibliographic records, abstracts and secondary
  summaries. No primary text was opened. A figure from a secondary summary says so in its entry, and
  no assessment may lean on one until the primary is read.
- The app's own test is applied as before: grounds where the finding was measured on people for
  whom the failure it prevents is expensive, background otherwise, practice where nothing was
  measured. None of the entries below overrides a refusal.

### Why attempts end, as a measured class (gap, Q7)

- R21, Phillips and Zhao, 1993, Predictors of assistive technology abandonment, Assistive
  Technology. A survey of 227 adults with various disabilities about how devices were chosen,
  obtained, performed and used. Secondary sources report that about 29 percent of devices were
  abandoned completely, most often in the first year, and that a change in the needs of the user
  showed the strongest association with abandonment, with the user's own input in choosing the
  device also associated; the authors conclude that services should attend to the long-term needs of
  the people using a device. Where and on whom: adults with disabilities who had been given physical
  and sensory devices, so a population for whom losing the function is costly, and a class of tool
  that is not a planner. Verdict: grounds, narrowly, for the class of cause (an attempt ends when the
  person's needs move out from under the tool, and when the person had no say in its shape); background
  for the rate, which is for devices. Reason: gap, Q7; it is the only entry in the repository that
  measures what ended use as a class, and the register's first entry is a class. The percentage and
  the ordering of factors are from secondary summaries; read the primary before citing either.
- R22, Chen, Meng and Nie, 2026, a paper on the challenges of task management for adults with ADHD,
  preprint accepted to a 2026 computer-supported cooperative work conference. Twenty-two
  semi-structured interviews with adults who identify as having the condition, then a follow-up
  study with 20 different adults who evaluated 13 speculative design concepts. The abstract holds
  that the difficulty comes from an emotional and relational mismatch with existing tools, which
  assume consistent self-regulation and linear time, and not from a lack of willpower, and that task
  management is carried out with other people and not alone. Where and on whom: the audience, by
  self-identification, qualitatively. Verdict: grounds, narrowly, for the single claim that a tool
  assuming steady self-regulation and an orderly sense of time is a mismatch; the abstract was the
  only text read, so the claim is recorded and not leaned on. The design direction the authors take
  from it, a social or machine companion that co-regulates, is not a finding and collides with
  statements 8 and 10 and with the rule that nothing assisted may block; it is not carried. Reason:
  gap, Q7. The abstract page did not report why people stop using calendars or lists, which is the
  question this entry was sought for; that part stays unanswered by it.
- R23, Desrochers, Tuson and Magee, 2019, a conference paper that surveyed adults with and without
  ADHD and found dissatisfaction among those with the condition with the tools available to them;
  the title, venue and sample size were not recovered, and the finding is from a search summary of
  a 2026 paper that cites it. The same summary says earlier work found calendars, lists, planners
  and reminders rated as much less effective by adults with the condition than by others, while
  adoption looked similar. Where and on whom: adults with the condition, the audience, by survey.
  Verdict: grounds in principle and not leaned on, because neither the sample nor the instrument
  was read. Reason: gap, Q7; it would be the one measure that adoption and benefit come apart for
  this audience, which is the shape of an attempt that ends without a stated cause. Read the primary
  first.
- R24, a 2026 master's thesis at a Danish university on a digital task management assistant for
  adults with ADHD; the author was not recovered. Its stated reasons that people stop using digital
  productivity tools soon after installing them are heavy manual input, high upkeep and switching
  between apps. Where and on whom: a thesis with a user-centered exploration of unstated size, not
  peer reviewed. Verdict: practice, background. Reason: expand, Q7; the three reasons match what the
  survey of horizon models (models 6, 14 and 15) finds in software for goals, and are recorded so
  the match is visible, not as evidence.

### Why paper and boards survive, and trust after a miss (gap and verify, Q2 and Q7)

- R25, Sellen and Harper, 2002 (reprinted 2003), The Myth of the Paperless Office. An account of
  why paper persists in offices, built on the concept of affordances, the activities an object
  allows. A review names four affordances of paper: tangibility, spatial flexibility, tailorability
  and manipulability. Where and on whom: the book's fieldwork in workplaces; the extracts did not
  describe the studies, and nothing about whiteboards was confirmed. Verdict: background. Reason:
  gap, Q2 and Q7; it is the construct the inventory found absent, a reason a medium survives that
  is stated in terms of what it lets a person do with it, and spatial flexibility is the nearest
  statement to time laid out in space. The four names are from one review of the book; read the
  book before relying on them.
- R26, Lee and See, 2004, Trust in automation: designing for appropriate reliance, Human Factors.
  A review of trust between people and automated systems. Trust guides reliance when full
  understanding of a system is impractical; trustworthiness has three bases (performance, process
  and purpose); appropriate trust has calibration, resolution and specificity, meaning that trust
  should match what the system can do, should change as what it can do changes, and should attach to
  the part that earned it. Where and on whom: a synthesis of studies of operators of automated
  systems, in settings where failure is costly but not this audience. Verdict: background. Reason:
  verify, Q7; what-it-should-be.md and entry 28 hold that trust in a container is all or nothing and
  does not recover after one discovered exception. This review's searches did not confirm that claim
  in this source, and the full text was at the refused host, so the claim stays the repository's own
  reading and no assessment may attribute it to this paper.
- R27, Rogelberg and colleagues on meeting agendas, reported in a 2019 practitioner article and
  interviews; the peer-reviewed papers were not reached. Having an agenda is reported as a poor
  predictor of attendees' perception that a meeting was effective; agendas written as questions to
  be answered, built from attendees' requests and with named owners, are advised; and a 41-country
  survey (Geimer, Leach, DeSimone, Rogelberg and Warr) found fewer than half of respondents calling
  meetings an effective use of time. Where and on whom: working adults in general, by survey and
  advice. Verdict: background and practice. Reason: gap, Q5; statement 17 asks that a meeting be a
  context whose list is its agenda. This is the nearest outside account and it says only that an
  agenda by itself does not make a meeting work; what it does not say is what a person needs shown
  while inside one. Read the journal papers before citing a figure.

### What is to hand (gap, Q5)

- R28, practice guidance from a national ADHD organization's article on prospective memory in
  adults, with two indirect studies named by the search. The guidance: make a cue unmissable where
  the action happens, such as a note on the door that must be passed, and place a reminder in more
  than one place, because relying less on internal memory makes remembering more reliable. A
  separate study of event-based prospective memory found that cues outside the focus of attention
  changed whether they were noticed, in people without the condition; a study in the attention
  disorders literature found that adults with the condition use predictive information from the
  environment less well, in a response-inhibition task and not a memory task. Where and on whom:
  the guidance is practice, not measured; the two studies are lab tasks, one on the general
  population and one on the audience in a different task. Verdict: practice, background; the second
  study is not grounds because it measures inhibition. Reason: gap, Q5; it is the only outside text
  found on what is physically at the place of action as a planning fact. The measured mechanism
  behind it is already held by entry 24, and no entry measures it for this audience.

### Read and not entered in the fourth pass

- Whittaker and Hirschberg, 2001, The character, value and management of personal paper archives,
  ACM Transactions on Computer-Human Interaction, volume 8, number 2. Only the record was returned;
  nothing about its findings, including any reminding function of piles, was confirmed. Not entered,
  and R1 stays read through a secondary summary.
- Riemer-Reiss and Wacker, 2000, Factors associated with assistive technology discontinuance, Journal
  of Rehabilitation, volume 66, number 3. Only the citation was confirmed. A later study by the same
  authors of 53 college students with disabilities was returned, reporting a high abandonment rate;
  its figure was not read, and it adds nothing to R21 that would not be restated from a summary.
- Werner-Seidler and colleagues on goal neglect in depression, a lab prospective memory task; goal
  neglect there means a gap between a remembered goal and action, which is not neglect of a role by
  not having looked. Not entered.
- The experience sampling work on covert task-relevant goal states (a 2023 report) and on attention
  split across several active goals (Vogt, De Houwer and Crombez, 2011): single-task lab studies. Not
  entered.
- Emmons-era experience sampling of personal strivings, a 1991 study of 54 college women: bears on
  how important goals show up in daily events and not on whether a role was looked at. Not entered.
- Searched and not found: a measurement of presses or seconds per sorting route; a source that
  measures why paper, walls or boards survive for people under the condition; a source that
  measures neglect of a role by not having looked.

### The properties that sources and catalog entries agree a surviving system has

Each property names the entries that support it, catalog entries by number and section, outside
entries by R number. A mark after each says whether the support was measured on people for whom the
failure is expensive (grounds), measured elsewhere (background) or described without measurement
(practice). A property supported only by background and practice is a design hypothesis, not a
finding about this audience.

- Landing is nearly free, and the sorting waits. Supports: entry 27 (measured, general adults, the
  strongest), entry 17, what-it-should-be.md Part 2 (practice), R1 and R2 (background; piles and
  cluttered desks as holding areas held in view). Mark: background plus one repository design, no
  grounds.
- The whole is visible without opening anything. Supports: entry 3, R3 and R4 (boards in hospital
  units, background), R25 (spatial flexibility, background), R12 (grounds, narrowly, for a sequence
  laid out in view for autistic students), and the paper calendar contrast in the existing R9 and
  R10 (background). Mark: one narrow grounds, the rest background.
- The form can be reshaped by its user as needs change. Supports: R21 (grounds, narrowly, for the
  class of cause), R3 (boards evolved by their users), R25 (tailorability), R19 and R20 as already
  entered (practice and background), and the dropping of contexts that cost more than they return in
  R17. Mark: one narrow grounds.
- Upkeep costs less than it returns, and no data entry lives apart from the work. Supports:
  horizon-models.md models 6, 14 and 15 (practice), R24 (practice), R17, planning-for-humans.md
  section 10b (Bellotti, background). Mark: practice and background.
- A tool does not assume steady self-regulation or an orderly sense of time. Supports: R22 (grounds,
  narrowly, abstract only), R23 (grounds in principle, not leaned on), horizon-models.md model 5 (a
  roles sheet with no memory leaves the system gone after two missed sessions; practice),
  what-it-should-be.md Part 1 (the modal session is a return after an absence). Mark: grounds in
  principle, none leaned on.
- The container can be trusted, and one discovered gap costs the trust. Supports: entry 28 (moderate,
  general adults), what-it-should-be.md Part 1 (practice), R26 (background, and the loss claim
  itself unconfirmed). Mark: background; the dichotomy is the repository's reading.
- Unsorted things may stay held without being filed out of sight. Supports: R1, R2 (background),
  R18 (practice; a periodic decision on every open item), statement 5. Mark: background and
  practice.
- The cost of coming back does not depend on how long the absence was. Supports:
  what-it-should-be.md Part 1 (practice), horizon-models.md models 5 and 7 (practice, systems that
  outlive their ritual or negotiation), entry 12 (retention near 3 to 4 percent, moderate). Mark:
  practice plus one moderate figure.

Still held by no entry after this pass, one line each:

- What is physically to hand as a planning axis. Held by practice only (R28) and the measured
  retrieval mechanism of entry 24; no source measured it for this audience. Nothing was found that
  makes it a construct of its own.
- Neglect of a role measured by not having looked. Nothing was found in this pass or in the third;
  R14 stays the nearest, and its samples remain unread. Two goal-neglect and goal-attention lines
  were read and set aside as measuring something else.
- A meeting whose list is its agenda. R27 is the nearest and measures only that an agenda alone does
  not predict a good meeting, in general adults. Nothing was found on what a person under load needs
  shown while in a meeting.

---

## What stands, what falls, what is missing

Written in the fifth pass. It measures the first draft, as the first section describes it, against the
twenty-six design statements, the catalog entries the inventory names, the repository's own research
and plans with the open items of both plans of record, and the research additions R1 to R28. It
decides nothing and builds nothing; the proposal is in the section after this one.

### How this section is read

- Three verdicts, one to a line, and the line opens with it. Stands: the first draft meets the
  statements or is neutral to them, and no change is called for by this review. Falls: the form the
  first draft shipped contradicts a statement, and nothing in the record is a finding about this
  audience that would hold the form in place; the line names what changes. Missing: a statement asks
  for something that no surface does.
- A line names the statement or entry that decides it. A refusal that rests on a collision entry is
  never overridden here by a general finding. Where such a refusal binds a verdict, the line names the
  entry.
- Every outside entry is background except R11, R12, R21 and R22, which are grounds narrowly, and
  every one of them rests on a search extract or an abstract. No figure from any research addition is
  used in this section. The figures that appear come from the repository's own files.
- Entries 24 and 27 were measured on adults in general. They are used here as background that points
  a direction, which is lower cost, and never to override a refusal.
- Words about the first draft are facts from the first three sections. Where this section reads a
  source file again, it says so.

### The ten laws

- Law 1, return engine. Stands. Statements 5, 21 and 23 and entry 3 decide. Every captured thing is
  covered from the moment it exists. One open item the record already names: the silence test in the
  write boundary asks the schema's question (a clock, a surface, a Menu place or a clocked parent) and
  not the reader's question (will this come back as something to act on). Statement 5 is the reader's
  version, and it is what a glance must show. [docs/what-it-should-be.md, part 4]
- Law 2, coverage gauge. Stands. Entry 28 decides, with the first part of what-it-should-be: a store
  that cannot be checked cheaply at the moment of doubt behaves like a half-reliable one. The gauge is
  one line and must stay one line when anything new lands beside it.
- Law 3, no past bucket. Stands. Statement 23 decides. It binds anything that lays time out: a strip
  that draws the days of the calendar week that have gone by, as rows of their own, is an archive by
  position. This review reads statement 3's current week as the seven days from today.
- Law 4, levels push down. Stands. The inspection-mode rule of horizon-models.md section 3 refuses
  the full tree as a landing view and refuses altitude views as workspaces, and statement 2 asks for
  the weeks ahead on one surface. They do not collide: the glance is the runway laid out in time, which
  is live work and which law 4 calls the only workspace, and not an altitude view. Statement 7 (long
  work as titles) is lineage projected downward onto a lane. So the rule binds the tree and the
  horizons and does not bind a view of live work arranged by date. Narrowing by role is decided
  further down.
- Law 5, one decay primitive. Stands, with a prerequisite. Entry 4 and ADR-0010 are untouched by any
  statement. The prerequisite is the thirty-two derivations of when a thing comes back, in eight
  rules, and release 3.26.1 recording two screens that name different dates for one thing
  [docs/structural-assessment.md; CHANGELOG.md]. A surface whose whole job is to set dates side by
  side shows every one of those disagreements at once, so the one reading (phase 1, src/reading.ts,
  not built) comes before the glance or inside the same release.
- Law 6, demand-free types. Stands. A role, a context and a person cannot carry a clock, and nothing
  proposed below gives one a clock. NOTES.md Q-13 says a role carries its own review clock; the gate,
  the event vocabulary and ADR-0096 agree with each other that it cannot, and they govern.
- Law 7, the app plots and the human interprets. Stands. Statement 15 is the point of pressure on
  it, because measuring neglect by not having looked needs a record of looking; that is settled in
  the temporal section below without recording a look.
- Law 8, rest is legitimate. Stands. Statement 23 and the first part of what-it-should-be (the cost of
  coming back is the same however long the absence was) decide. A glance that begins at today and
  draws no past satisfies it by construction, and the bounded greeting stays as it is.
- Law 9, data is never lost to updates. Stands. Everything proposed below is a projection or an
  additive event.
- Law 10, AI never blocks. Stands. No assisted rung ships, and nothing asked needs one.

### The surfaces

- Where do you want to be? (the hub). Falls, as the landing. Statement 2 (read at a glance, without
  choosing a view) and the second part of what-it-should-be (one screen, a layout fixed forever,
  contents computed) decide. The hub is a list of doors, so nothing of the days ahead is visible until
  a door is chosen. The earlier shape, fifteen conditional sections in one scroller, is why ADR-0108
  exists, so the remedy is not a return to a scroller: it is one fixed surface with a bounded reading,
  and the doors stay beneath it. The doors stand.
- Hold it. Stands. Statement 4, ADR-0008 and entry 27 decide: one field, first on the screen, two
  actions and no question.
- Next up. Stands. Statements 21 and 23 decide. One thing with its reason answers the moment called
  next, which a glance does not replace.
- Sort what you put down. Stands, with its cost unmeasured. Statement 4 decides, and ADR-0085 keeps
  sorting behind its door. The route is measured in the section on the capture route below.
- What slipped. Stands. Law 3 and ADR-0034.
- Welcome back. Stands. Law 8.
- Do one thing. Stands. Statement 4 (the day does not stop for each interruption) and section 3 of
  planning-for-humans.md: the resume card is written at the moment of the interruption.
- Upkeep. Stands. The recorded defect (confirmArrangementEvents has no caller) is not a question of
  this review.
- Everything you are holding. Stands, as the complete inventory, and it cannot be the glance. It is a
  grouped list, folded away until asked, and statement 2 asks for what is needed without opening
  anything or scrolling a list.
- The coverage proof. Stands. Entry 28.
- Find something. Stands. Neutral to every statement.
- What you are working toward, and Your projects, areas and goals. Stands. Statement 7: long work
  appears as titles.
- Worth a look (the review). Stands as built, for the exceptions it computes about horizons. It does
  not do the review direction for roles; see the role section.
- With other people. Stands. Statement 6 and statement 10: waiting on someone, and having promised
  someone, are depending on another person.
- Carrying (the track portfolio). Falls, in part. Statements 8 and 10 decide. Recording who runs a
  project somebody else executes, and the assignment events behind it, are assigning work to people
  and following what each carries, which statement 10 puts out. What stays is what a track project
  emits, waiting-fors and check-ins, because those are depending on another person. Build-plan item 32
  (a role as the Execute or Track mode) is the same shape and is already unlike the role that shipped.
  Entry 33 supports it from the other side: nothing the app does is to be claimed as a handover. The
  change is to the surface; the events already written stay in the log (law 9).
- How you are, and anything weighing on you. Stands. Neutral to the statements. The pebble
  disagreement in the inventory is not this review's.
- The Menu. Stands. Law 6.
- Chosen for today, and Print today. Stands. Statement 2. The printed page is the portable glance;
  R9 and R10 are background that paper persists beside a digital calendar, and no figure is leaned on.
- What's the situation? and In the room. Stands for the three axes. The gaps against statements 16,
  17 and 18 are in the context section.
- Where the attention is. Stands as built (words, name order, no bar and no target). It measures
  minutes the do-now timer measured, which is effort and not looking; see the role section.
- The days ahead, What comes back and when, and Send to my calendar. Stands. It is the nearest thing
  in the first draft to statement 3: dated work by day in the reader's zone, with the in-app view and
  the calendar file reading one selection. It draws no extent. That single selection is the right
  seam for a glance to be built on.
- Something on your mind that isn't a task? Stands. Statement 4.
- Telling someone where things are. Stands. The person is telling someone where things are, which is
  not following what someone else carries. Entry 33 still refuses any claim that the app performs a
  handover.
- The journal. Stands. Neutral.
- Your data. Stands. Law 9.
- The information panel and its destinations. Stands. Neutral.

### The capture and clarify route against the cost of landing one item

- Landing. Stands. Two actions and no question, with the commit before the confirmation and a
  same-day clock given in the same transaction. Entry 27 (set a reminder less when it is effortful,
  adults in general) points the same way, and statement 4 asks for exactly this.
- Sorting waits. Stands. Sorting is reached only through its door and is never shown on arrival or
  turned on by a capture. This is statement 4's second half.
- Where the cost lands. The catalog says filing and not capture (entry 27's note). As documented, one
  press settles Do now, Next action, Waiting for, Reference, Trash and Not this one; Someday is two
  since release 3.26.0 (a Menu kind is asked, with a way past); Put it somewhere and Say where it can
  be done are one pick or a typed name. Presses and seconds per route are measured nowhere in the
  repository. So the first draft cannot say whether the mechanism of entry 27 is operating inside
  sorting, and this review does not call any route a fall without a measurement. Verdict: the route
  stands, with the Someday ask recorded as the one press added after the fact.
- Missing: the measurement itself. The test page the doctrine asks for does not exist (a known
  defect in NOTES.md), so every number about cost on the reference tablet is a container number. An
  instrument that runs the route on the device and prints presses and median seconds is owed before
  anyone claims the route is cheap.
- The unowned. Missing, on the one surface. Statement 5 keeps a problem with no project and no date
  in view. A capture is offered last among the ordinary tiers in Next up, listed in Everything you are
  holding under not sorted yet (folded), and counted once a sorting card is in front of the reader
  (ADR-0113). Each of those needs a press or a fold opened, so the unowned is kept and not kept in
  view.

### The context noun and the place noun against the contexts distinction

- The nouns. Stand. Statement 11 makes a context (where the person is, what is to hand) and a place a
  thing lives (the tree gives a thing one parent) different axes that cross. The model keeps them
  apart: different kinds, a many-to-many link against one parent.
- The word. Falls. The reader sees place for the context and place for the container, on a card whose
  adjacent choices are Put it somewhere and Say where it can be done. Statement 13 says the names do
  not matter and the distinction does, and the distinction is the thing that is blurred. The change
  is wording only, in src/kind-words.ts and the manual, and it is not a change of any noun.
- Statement 18, a context shows its own items unless the person chooses otherwise. Stands for
  narrowing. A thing labeled for another place does not fit the answer, an unlabeled thing fits every
  answer, and the narrowing is a post-filter on the offer and the held rows that never touches the
  coverage proof (src/contexts.ts, read again for this section). That is statement 18 for labeled
  things. The refusal of exclusive places in plan-routed.md binds: hiding everything not labeled for
  the answer rebuilds the filter nobody trusts (entry 28), so the default for an unlabeled thing is
  not to be changed.
- Statement 18, shown only on choice. Missing. Nothing lets the reader look across to the other
  context's items on purpose without changing the answer that narrows everything.
- Statement 16, contexts are fluid and some stay physical. Missing. Searched src/contexts.ts for a
  standing set, nesting and always-to-hand: found only the unlabeled default. A phone that is always to
  hand, so that a thing needing only a phone fits every answer, is not expressible; the plan-situated
  walk already recorded two situations answered only in part for the same reason. What is physically to
  hand is held by no entry (R28 is practice), so this rests on statement 16 and entry 24's mechanism.
- Statement 17, a meeting is a context whose list is its agenda. Missing. In the room is an
  inspection over a saved situation that names people and shows what is outstanding with each
  (ADR-0119), and plan-routed.md refuses a bespoke meeting mode. An agenda planned ahead, items put
  under a meeting before it happens, has no home. No outside entry says what a person needs shown
  while in a meeting (R27 is background and says an agenda alone does not make a meeting work), so
  this is the least supported of the missing items and does not belong in a first release.

### The role noun against three directions

- The noun. Stands. Statements 11 and 12 decide, with entry 34: a role is an identity that crosses
  areas, a node plus a many-to-many link, so two roles can share a context and the person chooses
  there. R13 is background and matches statement 11's definition; it grounds nothing.
- Filtering by role (statement 13). Missing. ADR-0096 refuses on the ground that an identity does not
  change during a day. That is a design argument and not a finding about this audience, so it does not
  bind as a refusal resting on one. The rule that does bind is trust: a narrowing hides only what it
  labels for elsewhere, leaves the proof alone, and says in its own line that it is on (ADR-0054's
  binding on the lens, which ADR-0092 says binds contexts identically). A role lens chosen on purpose
  meets both. The inspection-mode rule concerns altitude views and does not apply to a role.
- Direction one, sort. Missing. The sorting card has nine choices and none is a role; a role is
  attached on the item's own panel. Say where it can be done already aligns an input against what is
  to hand. Entry 27 and plan-routed.md bound the remedy: a press added to every card for every
  reader is the cost entry 27 describes, and a first-run organizing flow is refused. So the sort
  direction needs a path that adds no press to a card for a reader who has no roles.
- Direction two, list. Stands for the role's own sheet, which lists the live work carrying the role
  and the horizons it sits under (ADR-0115). Missing for choosing among what has been sorted, which is
  statement 13 again.
- Direction three, review. Missing, and it is the largest of the three. The Review door computes quiet
  lines, a role that has carried work and carries nothing live now. That finds a role with no live
  work. Statement 15 describes the other case: a role with live work that nobody has looked at while
  attention was elsewhere. A role carrying many live things and untouched for weeks is invisible to
  the Review, to the attention readout unless the do-now timer happened to be used on it, and to
  pressure. Horizon-models.md model 5 records that a weekly roles review decays when two sessions are
  missed (practice), and refuses any copy that tells the reader a named role was neglected. That
  refusal binds: nothing below uses the word, and the order of facts is the whole readout. R14 (role
  balance) is the nearest outside account, background, and its samples were not read. R15 is the case
  the repository's rule warns of, a result positive on average from general samples; it does not
  override the refusal of a mandatory review cadence, and none is proposed.

### The temporal primitive against neglect by not having looked

- Stands, and it is the wrong instrument for this. The primitive needs a finite interval and a
  comfort window above zero, and a role is demand-free and cannot carry either. Giving a role a
  window would break law 6 and put a rising pressure on an identity.
- What statement 15 needs is an order and not a threshold: the roles listed from the least recently
  attended. An order with no threshold has no state that can be late, so the tie to the refusal of any
  late state holds by construction. Plain facts in the order, in words, with no count and no color.
- The source of attended. Any act in the log under a node that carries the role: a done mark, a timed
  doing, a focus, a capture or a change of a field. Those events exist (families B, C, D and A of the
  vocabulary), so no new event is needed to find the last of them.
- What that does not see. Opening a role's sheet or reading an item without acting. The vocabulary has
  no event for a view, and ADR-0054 and ADR-0092 refuse to record where somebody looked because a trail
  of where somebody was is not a fact about their work. Recording passive looks would reverse both
  decisions and add a log of attention to a private app. An act under a role is the strongest sign of
  having looked and its absence is the weaker sign of not having looked, so the error runs toward
  calling a role quiet that was only read, which costs a glance and nothing else. This is the first
  question below.
- Containers keep their review clocks (horizon-models.md model 5 and section 2) and a passed review
  clock raises nothing (ADR-0034); neither is changed.

### What is missing, collected

- A surface that shows the day, the week and the weeks ahead together (statements 2, 3 and 7).
- Extent drawn as length (statement 3). The vocabulary has a start clock and a due clock, so a node
  that carries both has an extent already; nothing draws it.
- The unowned, kept in view on the one surface (statement 5).
- A stretch when another person is unavailable (statement 6, third clause). This one has no noun and
  would be new to the vocabulary.
- A review of roles by last attended (statements 14 and 15).
- A role as a narrowing chosen on purpose (statement 13), and a role at the sorting step that costs a
  reader with no roles nothing (statement 14).
- A context that is always to hand, and a look across to another context on choice (statements 16
  and 18).
- A meeting whose list is its agenda, planned ahead (statement 17).
- One reading of when a thing comes back (structural-assessment.md, phase 1), which every dated
  surface depends on.
- The measurement of presses and seconds per route, on the device (statement 21).

---

## A proposed shape

Written in the fifth pass. It is the smallest next capability that would make the app readable at a
glance and cheap to land a thing in. It is stated as what the reader would see and do, and nothing is
designed beyond that. It is a proposal for the owner to decide on and not a plan.

### What the reader would see

- One surface above the doors on the landing, in a fixed layout with computed contents and nothing to
  configure. From the top: the line to put a thing down, which is Hold it as it is today; the
  coverage line as it is today; a strip of the seven days from today; below it a column of the next
  thirty days; and a few bounded groups beneath, what is being waited on from others and what is not
  yet sorted.
- In the strip and the column, what is dated on each day, shown as titles. A node that carries both a
  start clock and a due clock is drawn as a lane against the column, so its extent is seen as length.
  Long work appears as a title on its lane. Short work carries its note line under its day (the note
  field exists). Nothing before today is drawn.
- Waiting-fors from others in their own row with who they are waited on from, using the kinds and
  relations that exist. The not-yet-sorted group shows a bounded few with the count stated and one
  press to open the whole group, the way the Review door is bounded; those are the unowned, kept in
  view and not filed out of it.
- Nothing in it is a score, a percentage, a streak or a rank, and no day is colored for pressure.
  Order and words carry everything, so the surface reads in text order for a reader who does not see
  the layout.

### What the reader would do

- Put a thing down in the line at the top, as today, and nothing else is asked.
- Press a title to open the sheet it already has. Press the count of the unsorted to open the group.
  The doors beneath the surface stay where they are, and nothing is removed in this release.

### Nouns

- None new to the event vocabulary. The start clock, the due clock, the waiting-for kind, the note
  field and the capture events all exist. One derived name, a lane, is a projection of a node that
  carries both clocks and is stored nowhere.
- One reading comes first inside the release: the glance, the days-ahead view and the calendar file
  read dates through a single function, because a surface that sets dates side by side will otherwise
  contradict itself (law 5, above).

### Why this one first

- It is the only item that answers statements 2, 3, 5 and 7 together, and it adds no press to landing
  a thing, which statement 4 and entry 27 want kept that way.
- It is all projection, so it is reversible and cannot lose data. It builds on the days-ahead view's
  single selection.
- Its support from outside is background: entry 3 (what is visible is what is remembered, strong),
  R25 and the boards of R3 and R4 (background), and R12 (grounds, narrowly, for a sequence laid out
  in view for autistic students, at the scale of a day and not of weeks). That makes it a hypothesis
  about this audience and not a finding. The Block register's first entry is where it is tested, by
  whether the paper beside the app goes away (statement 21).
- A new surface owes the accessibility walk, the live-region gate, the manual coverage check and the
  precache list in the commit that creates it, and a layout that is spatial must also read in order.

### Left for later releases, undesigned

- The review of roles by last attended, then the role lens, then a role at the sorting step; the
  standing set of contexts that are always to hand and the look across; the meeting agenda; the
  subtraction in Carrying; the away stretch of another person. The order is the order of the support
  found, and each is a separate decision.

### Questions only the owner can settle

1. What counts as having looked at a role?
   - Recommended: an act under it, taken from events already in the log, so no new event and no
     record of looking.
   - Or: also record that a role's sheet was opened, which is a new event and reverses the deliberate
     non-recording in ADR-0054 and ADR-0092.
2. Is a role a narrowing the reader can choose?
   - Recommended: yes, a lens chosen on purpose, off by default, hiding only what is labeled for
     another role and saying that it is on, built after the glance.
   - Or: keep ADR-0096's refusal, so the role's own sheet is the only list by role.
3. What happens to the part of Carrying that records who runs a project?
   - Recommended: retire it from the surface and keep waiting-fors and check-ins, with the events
     staying in the log.
   - Or: leave Carrying as it is.
4. Is another person's unavailable stretch in the first release?
   - Recommended: no. It needs one new event, and the first release should be all projection. Add it
     after the glance has been used.
   - Or: include it now, with the new event.
