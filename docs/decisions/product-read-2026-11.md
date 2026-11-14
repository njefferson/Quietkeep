# The read of the app at release 3.28.2 against the product statement

Written 14 November 2026 from a read made on 13 November 2026. This record changes no code. It sets
down what one read-only pass over the source found when the app at release 3.28.2 was read against the
product statement, `docs/decisions/product-2026-11.md`, lines 88 to 190. Nothing was run in that pass.

- Every item marked PRESENT or PARTIAL carries a file and a line that was opened.
- Anything marked UNVERIFIED was not opened. It must be opened before any plan rests on it.
- The claims about part 1, the line and the find control, were opened again afterwards and held:
  `public/index.html` lines 175 to 199 (the line), lines 1157 to 1164 (the find section),
  `src/search.ts` line 65 (it matches titles only) and line 29 (the cap of 25, with the true total
  said), and `public/index.html` lines 293 and 306 (the two proof lines).
- Paths are under the repository root. `public/index.html` is written `html` below.

## The finding

Eight of the nine parts exist in part; for seven of those the missing half is a projection of events
already in the log; part 3 and the four widths are absent. The cause of the gap is placement and order,
not missing data: the app was built as jobs behind doors, and the statement is one surface.

## Where the first screen is built

The landing is the frame (`html:69-326`) plus the hub. The hub shows `#glance`, `#hub`, `#glance-after`,
the `data-always` sections and the `data-hub-part` buttons. Every other section appears only through a
hub door (`src/ui/hub.ts:153-216`, `public/app.css:3619`). The statement's parts 3, 4 and 7 to 9 are
mostly behind doors or sheets today.

## A. The nine parts

1. The line. PARTIAL.
   - The line is `#capture` (`html:177`), in the non-scrolling frame, so it is always on screen. It
     asks nothing (`src/ui/app.ts:2443`).
   - The finding control is `#search-input` (`html:1159`), inside the section `#search`, titled Find
     something. That is a hub door, not a control beside the line.
   - It matches titles only, capped at 25 (`src/search.ts:63`, `SEARCH_CAP`). It does not read notes.
   - Missing: the control beside the line, and reading any word. Fix is PROJECTION ONLY, plus moving
     the control.
2. The proof. PARTIAL.
   - Two lines stand in the frame. `#gauge` (`html:293`, `src/ui/app.ts:1192-1227`) says nothing here
     has gone quiet and gives a count ready now, and opens the sheet What comes back, and when
     (`html:3209`), with reason counts and every item.
   - `#assurance` (`html:306`, `src/ui/app.ts:1237`) says everything is accounted for and opens the
     sheet Where everything is. Its group counts must sum to the whole, and it says so if they do not
     (`src/assurance.ts:66-123`).
   - Neither is narrowed by the lens (header of `src/lens.ts`).
   - Missing: one line. PROJECTION ONLY (merging the two lines).
3. What moved. ABSENT.
   - There is no mark for since last looked, and no marking in place.
   - `#reentry`, the Welcome back section (`html:466`), appears only after 7 or more days away or an
     import (`src/reentry.ts:33,111`), and gives counts only.
   - `#replan` caps at 3 with the true count (`src/replan.ts:41`) and has a bulk act.
   - A change of a watched state is refused in words on the page (`html:1837`).
   - Missing: a last-looked watermark. NEEDS A NEW FIELD OR MARK. No event records a view
     (`src/attended.ts:12-14`). `deltaBetween` (`src/delta.ts:139`) can already compare two log points,
     and field-set times are in the log.
4. Now. PARTIAL.
   - `#nextup` (`html:540`) is a hub door, not on the landing.
   - The offer is capped at 2, each for a different reason (`src/offer.ts:66`). It shows why
     (`#nextup-why`), where it sits (`#nextup-place`), a first act, Start smaller (`html:602`), and the
     next fixed thing today (`#nextup-fixed`, `html:684`). The press that declines an offer records
     nothing (`src/nextup.ts:17`).
   - The way back is second, after a hard date (`src/nextup.ts:5-17`), not first.
   - Missing: Now on the first screen, and the way back first. PROJECTION ONLY (events
     `resume.card.created`, `interrupt.captured`).
5. Days. PARTIAL.
   - `#glance` (`html:385`, `src/glance.ts`) draws only days that hold something, including in the
     first week (`src/glance.ts:148-152`), so an empty today is not drawn.
   - It reaches 30 days (`src/glance.ts:36`). Stretches are drawn, capped at 4 (`:160-193`).
   - A day shows 3 titles and a count of the rest (`:43`), so a full day is not seen as full.
   - Latest start and room left are absent from the glance, which does not import `dependencies.ts`.
     They exist on the sheet (`src/ui/detail.ts:1271`), the offer (`src/nextup.ts:242`) and the replan
     card.
   - Today's row does not hold ready-again things. The glance skips the replan group
     (`src/glance.ts:128`), and ready-again lives in `src/held.ts:333`.
   - Missing: an empty today drawn, a full day seen as full, latest start and room left, ready-again
     things on today. PROJECTION ONLY (`dependency.declared`, `suspense.set`, `clock.set`,
     `upkeep.interval.set`, `done.marked`).
6. People. PARTIAL.
   - `#people` (`html:1002`, `src/ui/app.ts:950-1000`) lists by thing, not by person. A thing owed to
     the person shows its age in weeks (`src/ui/app.ts:969`). It also has a promised-to list
     (`html:1020`, `src/people.ts:252`).
   - `#glance-after` shows the group Waiting on others (`src/glance.ts:196`).
   - Per-person grouping exists only in the meeting view, In the room (`src/meeting.ts:86`).
   - The pointers for who holds the rest (`rest-with-them`, `rest-with-me`) appear on the sheet only
     (`src/ui/detail.ts:87,1035`), not in People.
   - Missing: grouping by person, the holds-the-rest pointers in People, and watched-through-a-person,
     which is absent. PROJECTION ONLY (`person.linked`, `waiting.opened`, `promise.released`,
     `holding.released`).
7. Not placed yet. PARTIAL.
   - `#glance-after` shows the group Still to sort, 3 titles with no when (`src/glance.ts:203`).
   - The held group Not sorted yet is newest first (`src/held.ts:366`).
   - Triage shows when a capture was written (`src/capture-context.ts:59`) but queues boss-tagged
     captures first, then oldest first (`src/triage.ts:27-37`).
   - Missing: the during-what of a capture. `capture.recorded` carries only `text`, `source` and
     `sourceTags[]` (`docs/event-vocabulary.md:256`). During focus could be derived from the times of
     `focus.started` and `focus.ended`. Anything else, such as a meeting, NEEDS A NEW FIELD.
8. Everything held. PARTIAL (scattered).
   - Roles with last attended exist only as the Review door's `#review-roles` (`html:1060`,
     `src/ui/review-roles.ts`, `attendedOrder` in `src/attended.ts`). They cover only roles carrying
     live work, 3 shown.
   - There is no per-role project line: its end, its next thing, its next date, whom it runs through.
   - Fragments exist: `lineView` (`src/roles.ts:120`), `trackPortfolio` (`src/portfolio.ts:59`),
     `servesNode` (`src/serves.ts:84`), `stalled` (`src/review.ts:127`, a Review exception only), and
     the unnamed remainder (`#roles-unnamed`).
   - Missing: the one line per project under each role. PROJECTION ONLY (`role.attached`, `node.parented`, `opr.assigned`,
     `suspense.set`, `clock.set`). `project.role.set` (execute or track) is a different sense of role
     from life roles.
9. Wants and weights. PARTIAL.
   - The Menu (`#menu-open`, `html:1106`; sheet `html:3786`) holds wants with no clock.
   - Weights are pebbles through `src/load.ts`. They are demand-free and cannot carry a clock
     (`docs/event-vocabulary.md:553`).
   - The only set-down with a return time is `park.set` (`returnAt`) from the bother flow.
   - Missing: weights with a return time. NEEDS A NEW FIELD OR RE-USE of `park.set`.

## B. Journal, data, help, settings. PARTIAL.

- It is two buttons: `#open-about` (`html:93`) and `#open-more`, Elsewhere in the app (`html:278`,
  sheet at `html:2374`). The sheet lists Settings, Colors, Your data, Help, How it works and About.
- The journal sits inside Your data (`html:2689`).
- `#contents-open` (`html:272`) is a third control.
- Missing: one small control for the four. PROJECTION ONLY.

## C. The widths. ABSENT.

- There is no four-position control.
- The nearest is the one-thing module: the control Just one thing, `#nextup-plain` (`html:644`), and
  the way out, `#nextup-plain-off` (`html:745`, `src/plain.ts`). It is written as `module.enabled`.
  When on, boot enters Next up (`src/ui/app.ts:2829`).
- Today it opens on the hub landing (`src/ui/hub.ts:167`).
- After an absence it shows `#reentry` on that same landing, not a width.
- Device preferences kept as kv, not events, already exist (`lens.root`, `where.now`), so no event is
  strictly needed.

## D. Narrowing. PARTIAL.

- `#situation-open-hub` (`html:413`) and `#situation-open` open `#sheet-situation` (`html:3320`). It
  takes a place (`src/contexts.ts`), a length (`src/duration.ts:127`) and who is present
  (`src/people.ts:385`). Saved situations that name people open In the room.
- A role is not an input. The lens (`#lens`, `html:1206`) narrows by top-level root, list rows only.
- It narrows only `#nextup` and `#held` (`data-narrows`, `html:414`). It does not narrow the glance,
  People or Days.
- The line saying what is on exists (`html:520-522`). It states scope without a count
  (`src/duration.ts:182`). A one-press show of the other side is UNVERIFIED.
- Missing: role as an input, and narrowing of the glance, People and Days. PROJECTION ONLY, plus a
  device preference; role narrowing would read `role.attached`.

## E. The sheet (dialog `#detail`, `html:1480`)

- Note: PRESENT (`#detail-note`).
- When put down: PARTIAL. There is only the collapsed What happened to this (`html:2196`), whose
  content is UNVERIFIED. The when-written line is on the offer and triage, not the sheet.
- During what: ABSENT.
- First act: PARTIAL (the Too big to start step, `#detail-step`).
- Dates: PRESENT (date, not-before, check-back, repeat).
- People: PRESENT (`#detail-person`).
- Roles: PRESENT (`#detail-role`).
- Place: PRESENT (`#detail-context`).
- Sits under and leads up to: PRESENT (`#detail-parent`, `#detail-feeds`).
- Stands and would change it: PARTIAL. It shows only for upkeeps marked as arrangements
  (`src/ui/detail.ts:1344`).
- Decided: PRESENT (`#detail-decision`).
- Closing returns to the same place at the same width: UNVERIFIED.

## F. The acts

- Putting down: PRESENT (`src/ui/app.ts:2443`).
- Starting from Now: ABSENT. Next up has no start. The press Work on this is on held rows
  (`src/ui/app.ts:721`) and starts a focus session, not a width change.
- Placing: PRESENT on the sheet and in `#triage` and `#sort`.
- Settling what moved: PARTIAL. The replan choices are compress, escalate, move, new date, undate and
  to-menu (`src/ui/replan-intents.ts:278`). There is no plain confirm and no let-go among them. Let it
  go is on the sheet.

## G. D1 to D4

- D1 walk-in: PARTIAL. Capture takes no person; linking is on the sheet, and the person view is in
  `src/ui/detail.ts`.
- D2 staff call: PARTIAL. In the room (`src/meeting.ts:86`) and the status report
  (`src/delta.ts:217,312`). The report's order is moved, decided, still with someone else, coming up,
  which is not the order the statement gives in H7.
- D3 suspense: PARTIAL. The Carrying section (`html:993`, `src/portfolio.ts`) and per-node latest
  start. There is no single list of what each date feeds, with room left.
- D4 desk paper: PARTIAL. Capture, the proof, the held list, title search, and Print today
  (`src/today.ts:68`).

## H. First screen in DOM order

- `#skip-held` (`html:32`): NO PLACE
- `#wordmark` (`html:71`): NO PLACE
- `#clock` (`html:76`, opt-in, hidden): NO PLACE
- `#open-about` (`html:93`): part B
- `#stance-bar` and its controls (`html:143`, hidden on the landing): NO PLACE
- `#capture-form`, `#capture`, `#capture-many` (`html:175`): part 1
- `#capture-offer` (`html:195`): part 7 (wording UNVERIFIED)
- `#status` (`html:199`): part 1 receipt
- `#stance-return-row` (`html:219`): NO PLACE
- `#contents-open` (`html:272`): NO PLACE
- `#open-more` (`html:278`): part B
- `#gauge` (`html:293`) and `#assurance` (`html:306`): part 2
- `#update` (`html:318`): NO PLACE
- `#capture-room` (`html:364`): part 1
- `#glance` (`html:385`): part 5
- `#hub` and `#hub-doors` (`html:403`): NO PLACE (jobs doors)
- `#situation-open-hub` (`html:413`): Narrowing
- `#glance-after` (`html:425`): parts 6 and 7
- `#bother` (`html:452`): part 9, a stretch (hidden until used)
- `#reentry` (`html:466`): part 3
- `#nextup-plain-bar` (`html:744`), `#comms` (`html:951`), `#close` (`html:973`), `#composed`
  (`html:1073`): NO PLACE
- `#menu-open` (`html:1106`): part 9
- `#roles-open` (`html:1124`): part 8 (partial)
- `#arrangements-open` (`html:1131`): NO PLACE
- `#horizons-open` (`html:1143`): part 8 (the end each thing serves)
- `#dated-open` (`html:1151`): part 5

## I. Candidates to judge, not findings

Each item below is something the read flagged against the statement's Refused paragraph. None is a
finding. Whether each is truly refused is judged when its piece is planned, with the source and the
statement open together.

Note: the statement itself asks for when it was last attended to on a role (part 8). So the roles line
flagged below, the one ordered by longest since attended, is a candidate that may fall.

- Marks of a passed date, and ages:
  - A line that names an answer owed on a date, and a line saying when a thing last moved, in days
    (`src/portfolio.ts:113-134`).
  - A negative room figure worded as days gone by (`src/dependencies.ts:146-151`).
  - An age in weeks on a thing owed to a person (`src/ui/app.ts:969`, `src/people.ts:407`).
  - Roles ordered by longest since attended, each with a day count (`src/attended.ts`,
    `attendedWords`).
  - A line saying nothing has finished in a month (`src/review.ts`, about line 220).
- Counts of what was done: per-role timed minutes (`src/roles.ts:264`); a count of things outstanding
  (`src/portfolio.ts`).
- Order of importance, urgency raised:
  - `heat.set` hot and cold (`src/nextup.ts:654`).
  - Boss-tagged captures first (`src/triage.ts:27-37`).
  - A boss-tagged run goes one level hotter (`docs/event-vocabulary.md:73`).
- Fitting work into gaps: `fitsWithin` removes things whose estimate exceeds the length
  (`src/duration.ts:173`).
- Setup flow, template, meter: the walkthrough (`src/ui/tour.ts`), `template.loaded` and the sample
  sets. The manual's section Name a meeting says a report counts how much the three questions can
  reach, which would be a meter; the exact line is UNVERIFIED.
- Promised relief: the copy at `html:1837` about no longer holding a thing in mind, and the empty-state
  copy of `#empty` (`html:1210`) about not having to remember to look.
- A second account of what another person said, or a reward record: the Not Now ledger
  (`src/requests.ts`, `request.declined`), `menu.item.promoted`, and the save-for target and saved
  figures (`html:1875`).
- A tidying part: `#review` (`html:1042`), the merge section for the same thing twice, the purge
  section Clearing things out (`html:2760`), and bulk acts in Sort a batch.
- Searched and not found:
  - A run-of-days count: comments only, plus the banned kind substring (`src/events.ts:724`).
  - A word for a passed date: none.
  - A mood question: none (capacity is four self-declared words).
  - A width the screen changes itself: `offerCapFor` returns the cap unchanged (`src/load.ts:140`);
    only `#reentry` appears on its own.
  - A trait-based mode: none.

## Not read or not settled

- Hue carrying pressure (the CSS and the palette): UNVERIFIED.
- Manual line numbers: UNVERIFIED.
- `docs/decisions/roles-review-2026-11.md` and `docs/decisions/glance-2026-11.md`: read only in part.
- The `#detail-history` content: UNVERIFIED.
- Held-row text in the card rendering of `src/ui/app.ts`: only the Work on this part was read.
- The `#capture-offer` wording: UNVERIFIED.
- Whether closing the sheet returns to the same place: UNVERIFIED.
- Whether `src/gate.ts` refuses a clock on a pebble beyond what the vocabulary document says: not
  opened.
- The `data-narrows` behavior of a press showing the other side: not opened.

## The order of pieces

The statement ranks its own parts, what matters on top, so the build follows the statement's order, top
down, each piece on its own approved page. In order:

1. Part 1, the line whole, with Find beside it reading any word. Release 3.29.0. Design in
   `docs/decisions/find-2026-11.md`.
2. The proof as one line, which ADR-0099 and ADR-0125 hold apart on purpose today.
3. What moved, which first needs a rule for since the person last looked that records no looking.
4. Now on the first screen.
5. Days brought to the statement.
6. The width control, once parts 1 to 5 stand on one screen.
7. Parts 6 to 9, narrowing, the sheet and starting from Now, not yet split into pieces.

Only the first is approved work.
