# Design review, November 2026: the first draft against what it was for

This document is a review of the first draft of Quietkeep. It is not a plan. It decides
nothing, builds nothing, and changes no surface, noun or behavior of the app. It is written in
passes, each adding its own section below the last, in this order: where the app is, what the
research already holds, what was asked, research additions, what stands and what falls and what
is missing, and a proposed shape. This pass writes the first two. Nothing in a later section is
anticipated here.

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
