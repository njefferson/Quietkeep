# The review of roles: the roles carrying live work, listed from the one longest since anything was done under it

Written 3 November 2026 against staging at release 3.27.1. This record changes no code. It states the
build of release 3.28.0 so that steps 13 and 14 can be run from it by agents that have not read the
design review, and it says where the source disagrees with what the design review assumed.

## 1. What this record decides

- One reading, stated once: the last act under a role, read from events the log already holds. No new
  event, no stored field, no new noun.
- One section on the Review door that lists the roles carrying live work from the one longest since an
  act, in words, with one press from each line to that role's own sheet.
- The three questions the design review left to the owner are taken as decided, and nothing here
  reopens them: an act under a role is what counts as having looked; the role lens comes after this
  release; another person's unavailable stretch is not in it.
- It is an order and not a threshold. No role is ever in a late state, because nothing here has a state.

## 2. What binds this, read from the source

- Law 6 and ADR-0014: a role is demand-free and the write boundary refuses a clock on one
  (`DEMAND_FREE_KINDS` in `src/events.ts` holds `role`; `src/gate.ts` refuses a clock on a demand-free
  kind). So the temporal primitive cannot be used and is not. A window on an identity would be a late
  state under another name.
- ADR-0054 and ADR-0092: where somebody looked is deliberately not recorded. `src/roles.ts` says the
  same one axis over and `src/contexts.ts` carries the argument. So opening a sheet is not an act.
- ADR-0096: a role is not a filter. Nothing here narrows anything.
- ADR-0117 and ADR-0120: the Review door has five exception classes, a cap of three, a count line, and
  a press that opens the whole list. ADR-0117 refuses, for the quiet-line class, any "how long since"
  and any ordering by staleness. That refusal is about that class's words and is kept for it; this
  record adds a different list beside the exceptions and does not touch the quiet-line rows. See section
  11 for the exact relationship, because a later reader will see the two and wonder.
- Model 5 of `docs/horizon-models.md`: a clock cannot ride a role, a descriptive readout of where
  attention went is kept, and copy telling the reader a named role was neglected is refused as a rebuke
  with a spreadsheet behind it. The sources named R13 to R15 in the design review are background. R15 is
  a result positive on average from general samples; under the rule in `CLAUDE.md` it informs nothing
  here and overrides nothing, and no cadence is proposed.
- Law 5 and `src/copies.ts`: a day, never a duration and never a count, where the figure would be a
  number about how far behind somebody is. See section 5 for how this record meets that.

## 3. What the source says that the design review did not

These are findings, each of which changes the build from what the plan assumed.

- The fold holds no time per node for most acts. `NodeState` carries `lastDone`, and `stamps` holds an
  ordering tuple for each last-writer-wins field, but a timed doing (`do-now.timed`) folds to a list of
  minutes with no time, `focus.started` survives only as the one current focus, and `role.attached` folds
  to a list of ids with no ordering at all. So the last act under a role cannot be read from state. It is
  read from the log, as events, and the function takes the log as an input.
- The browser surfaces have the log only through `session.store.all()`, which is asynchronous. The
  Review render in `src/ui/app.ts` is synchronous and runs on every commit. So the section's order is
  painted by a module of its own that reads the log once per change and caches, described in section 7.
  This is the cost of the choice the decided first question made, and it is stated, not hidden.
- `heldNodes` excludes roles, so the carriers of a role are found by `n.roles.includes(role.id)` over
  `heldNodes(state)`, exactly as `quietLines` does.
- The Review door is a stance. `main > section[data-stance-name]` that is not `hidden` becomes a door on
  the hub (`src/ui/hub.ts`). The Review section is hidden when it has no exceptions. A new section that
  is not inside it would be unreachable on a store with roles and no exceptions. So the new section goes
  inside `#review`, and `#review` stays visible when the section has something to show. That moves the
  review's old promise, that an empty review is not there, by exactly one case, stated in section 6.
- `tools/a11y.mjs` creates one role, `Parent`, on the first card at its roles state, which comes before
  its review state. It does not create a second. The cap of three needs four roles to have something
  behind it, so the walk makes more roles through the same route, and section 8 says how many and why.
  Built as: the walk gives roles to up to four live action cards through the card sheet's own field, in
  a state of its own driven right after the review audits, and audits the whole order in a second state,
  `'every role in order'`, opened by the press, because the three containers the later state makes would
  otherwise turn the carriers into projects. The partition test and the markup tests are in
  `test/attended.test.ts` and not in `test/review.test.ts`.
- `review-all` and `sheet-review` already exist. The rest of the order goes behind the press the door
  already has, as the plan says, with no new dialog.

## 4. The one reading

### Where it lives

`src/attended.ts` (new). It imports `fold` types, `heldNodes` from `src/gate.ts`, `allRoles` from
`src/roles.ts`, `boundaryOf` from `src/day.ts`, `calendarDaysBetween` and `isValidIso` from
`src/time.ts`. It imports nothing from `src/review.ts`, `src/ui/`, or any caller, so `src/review.ts` can
import it without a cycle.

### The rule, stated once

The last act under a role is the newest `at` among the counted events that concern any node in the
role's set. Each part is fixed here.

- The role's set. The carriers are the held nodes whose `roles` list holds the role's id, resolved
  through state so a role that was let go carries nothing. The set is the carriers and every
  descendant of a carrier, found by walking `parent` over all nodes in state, finished and trashed
  descendants included, with an explicit stack and a seen set, because a log from another device can
  hold half a loop. A node is a member by the tree as it stands now. An act under a thing that has
  since been moved out is not counted, and an act on a thing since moved under a carrier is. That is
  the reading `quietLines` already makes, and it is stated so the two do not drift.
- A role carrying live work. A role is in the order when it has at least one carrier and some carrier
  is live or has a live held descendant. Liveness is not decided in this module. The caller passes
  `isLive`, and `src/review.ts` passes its own `isLiveWork`, so one definition of live work stays in
  one place. This module repeats only the shape of the walk, and section 10 holds the two together with a
  test that every role with a carrier is in exactly one of the quiet lines and the order.
- A role carrying nothing live is not in the order and stays with quiet lines. A role with no carrier is
  in neither, for the reason `quietLines` gives: staleness needs a before.
- The counted events, by kind. A closed list, and a kind not on it is not an act.
  - `done.marked` and `done.unmarked`: the reader marked or took back a done mark.
  - `do-now.timed`: a timed doing. Its `at` is the event's own `at`, never `endedAt`.
  - `focus.started`: a focus begun on a node in the set.
  - `capture.recorded`: a capture, counted by the node it created, which is a member once it is filed.
  - `node.created`: a thing made, a child under a carrier included.
  - `node.field.set` and `node.renamed`: a change of a field or a title.
  - `node.parented`: a thing filed under a member.
  - `clarify.routed`: a thing sorted.
  - `role.attached`: the writing of the role link itself, counted against the node named in the payload
    and falling back to the event's node, as the fold does.
- The events that are not acts. Everything the write boundary writes by itself, which is `clock.set` and
  `clock.cleared` cures, `replan.*`, `heat.set`, `resume.card.*`, `status.report.exported`, `anchor.*`,
  every `waiting.*` event, `node.trashed` and `node.untrashed`, `node.merged` and `node.unmerged`, and
  every event with no node. A trashing is a reader's decision, but it removes a thing from the role and
  the first decided question says an act is what the role was for, so it does not count. The list is
  closed on purpose: an event kind that arrives later is not an act until this list is amended.
- Two exclusions inside counted kinds. A `node.created` that carries `arrival`, and a `capture.recorded`
  whose `source` is `sample`, are not acts. An import lands in one commit with one `at`, and counting
  it would make every role look worked on the day somebody brought a planner in.
- Events written on another device count. They are acts by the same reader, and `at` is read as written.
- An event whose `at` is not a valid instant is skipped, never counted as the oldest or the newest.
- The role node's own events do not count. Renaming a role is a change to the role and is not an act
  under it.
- The newest wins. The result for a role is the newest valid `at` among its counted events, or null when
  there is none.
- Opening a sheet is not an act, and neither is reading an item. The vocabulary has no event for a view
  and ADR-0054 and ADR-0092 refuse to record where somebody looked. The error therefore runs toward
  calling a role quiet that was only read, which costs a glance and nothing else. The section says this
  in its own sentence, so a reader is never told a role was not looked at.

### The day

The day is the reader's day, the one `boundaryOf(state)` gives, in the session's zone. The span for a
role is `calendarDaysBetween(lastAct, nowIso, { zone, boundary: boundaryOf(state) })`. An act at two in
the morning with a boundary at three belongs to the day before and the span says so. A span below zero,
which clock skew from another device can produce, is read as zero.

### A role with live work and no act at all

It is ordered first, and its line says nothing was recorded under it, with no span. It cannot come from
a role just given to a thing, because the link write is itself an act, so the case is a role whose every
event had an unusable `at`. The ordering is total regardless.

### The order

Roles in the order are sorted by span, the largest first, then by name with `localeCompare` on the title,
then by id. The tie on span is a tie of whole days. Two roles whose last acts were different hours of
one day tie and fall to name, which is the same rule every list in this app uses for a set somebody
reads. There is no cut anywhere in the order and no value that separates a role from the rest.

### The function

In `src/attended.ts`:

- `export interface Attended { readonly role: NodeState; readonly lastActAt: string | null; readonly days: number | null }`
- `export function attendedOrder(state: State, log: readonly AppEvent[], nowIso: string, zone: string, isLive: (n: NodeState) => boolean): Attended[]`
  returns only roles carrying live work, in the order above. One pass over the log with a map from node
  to its newest counted `at`, then one pass over roles. Linear in events plus nodes.
- `export function rolesCarryingLive(state: State, isLive: (n: NodeState) => boolean): NodeState[]`
  the same set without the log, in name order. The render pass needs it synchronously to decide whether
  the section exists, and it is exactly the set `attendedOrder` returns.
- `export const ATTENDED_KINDS: readonly string[]` the closed list of counted kinds, exported so the test
  and the code-map read one list.
- `export function attendedWords(a: Attended): string` the line's words, section 5.

It stores nothing, writes nothing and adds no event.

## 5. The words

The line says what was done under a role and when, as facts.

- `attendedWords` returns, for a role with an act today, `something was done under it today`; yesterday,
  `something was done under it yesterday`; otherwise `something was done under it N days ago` using
  `daysWords` from `src/time.ts`, so `1 day` never reads `1 days`. For a role with no act on record,
  `nothing is on record under it`.
- The days are the only digits on any line. No count of roles, no count of things, no percentage.
- Meeting the law 5 rule in `src/copies.ts`. That file refuses `N days ago` for the export because the
  figure is a number about how far behind somebody is. Three other surfaces say it anyway and are
  accepted: `src/portfolio.ts` (`last moved N days ago`), `src/arrangement.ts` (`Last confirmed N days
  ago`) and `src/ui/detail.ts` (`confirmed N days ago`). This record follows those three and not the
  export, for a stated reason: here the day count is the order's only content, and a bare date would
  make the reader do the subtraction the order exists to save. What keeps it a fact and not a debt is
  that nothing carries it beyond the line: no color, no state, no mention of how many roles are
  further down, and a sentence under the heading that says it is an order and what it does not see.
  If the owner prefers the date form of `copyDayWords`, it is a one-function change in
  `attendedWords` and no other file moves.
- Words the copy never uses, held by a test that runs the same sweep `test/review.test.ts` runs over
  `reviewWords`: overdue, late, behind, neglected, neglect, ignored, forgotten, streak, score, rank,
  percent. That sweep matches substrings, so the section's words must also avoid any word containing
  `late` (for example `latest` and `related`), `fail` and `missed`. The test runs it over every line and
  every sentence the section can say.
- The heading is `Roles, by when something was last done under them`.
- The sentence under it is `The one with the longest wait since anything was done under it is first.
  This is an order, not a verdict. Opening a role to read it does not count, only doing something under
  it, so a role you have only been reading can sit near the top.` The builder may shorten it. It may not
  drop the clause about reading, which is the honest statement of what the order cannot see.

## 6. The section, element by element, in the order a reader and a screen reader meet it

Inside `#review`, after `#review-list`, a `<div id="review-roles" hidden>`.

1. `#review-roles-heading`, an `<h3 class="section">` carrying the heading above. Level three, because
   `#review-heading` is the level-two heading it sits under.
2. `#review-roles-words`, a `<p class="detail-hint">` with the sentence above.
3. `#review-roles-list`, a `<ul class="review-list">`. At most three rows, `REVIEW_CAP`, in the order.
   Each row is the existing row shape: an `<li class="review-item">` holding a
   `<button class="review-open">` holding `<span class="review-title">` with the role's name and
   `<span class="review-why">` with `attendedWords`. The press opens the role's own sheet, the same
   `openDetail(role)` the exception rows use, which shows the line view (`lineView`, ADR-0115).
4. `#review-roles-more`, a `<button class="linklike">` reading `Every role, in order`, present only when
   more than three roles are in the order. It opens `#sheet-review`, the sheet the door already has.

The section is absent, with `hidden` set, only when no role carries live work, and present once one
does. Corrected by the plan's own text for step 14: statement 15's case is one role carrying live work
with attention elsewhere, so an order of one line is an order, and the earlier rule of two or more would
have hidden exactly that case. This is a condition on the existence of an order and not a threshold on
any role.

`#sheet-review` gains, after `#review-all`, `<h3 id="review-all-roles-heading">` with the same heading
words, and `<ul id="review-all-roles" class="review-list">` with every row in the order, built by the
same row function. The existing `#review-all-words` and `#review-all` are unchanged. The two headings are
hidden together when the order is absent.

The region's old promise, that an empty review is not there, changes by one case and the record says
so. `#review` is hidden when there are no exceptions and no role carries live work. With one or more roles
carrying live work it is present, which puts the Review door on the hub for a reader with roles and no
exceptions. This is the cost of putting the order on the door, and it is a door that has
something behind it every time it shows.

No color carries anything. No bar, meter, progress element or ordinal numeral. The order is the position
of the lines and nothing else. The rows reuse `.review-open`, `.review-title` and `.review-why`, whose
pairs the contrast gate already holds, so no new foreground and background pair enters the gate.

### Layout

One column at phone width, 390 pixels, and in the wide arrangement the Review stance is already its own
column, so nothing is added. The rows are full width with a target at least `var(--target)` high, which
is 44 pixels. At 320 pixels and 200 percent text a long role name wraps inside the row
(`overflow-wrap: anywhere` is on `.review-title`) and the section adds no horizontal overflow. The CSS
change is one rule, `#review-roles { margin-top: 1rem; }`, and `#review-roles-heading` takes
`margin: 0 0 0.25rem`. Nothing else in `public/app.css` changes.

### Behavior, `src/ui/review-roles.ts` (new)

- `mountReviewRoles(session, now, deps)` returns `{ refresh }`. `deps` carries `openNode(node)`, the
  detail sheet's open, and `openAll()`, which opens `#sheet-review`.
- `refresh` is called inside `rerenderLists`, beside `glance.refresh()`. It does two things. First, from
  state alone, `rolesCarryingLive(state, isLiveWork)` decides whether the section exists and whether
  `#review` is shown. `src/ui/app.ts` takes that result into its existing line
  `region.hidden = rv.total === 0` so it reads `rv.total === 0 && rolesLive(st).length === 0`. Second, it reads
  `session.store.all()` once, calls `attendedOrder`, and paints the two lists.
- The read is keyed by `state.eventCount` and the reader's day key and is cached, so a render with
  neither changed paints from the cache with no read. A newer render that starts before an older read
  resolves wins, by a sequence number, so a slow read can never paint over a newer state.
- Between a commit and the read resolving, the section paints the cached order if there is one and
  otherwise stays hidden. The first paint of a session therefore waits on one log read, the same cost the
  log viewer and the purge count already pay. The build measures the function over the big sample the
  way `test/read-perf.test.ts` measures the other readers and states the figure in the decision record.
  A container number is a measurement of something else (the standing rule on the test page), so the
  record says that and does not claim the device number.
- It writes no event and holds no state beyond the cache.
- `src/plain.ts`: `#review` is already in the hidden list, so the section, being inside it, goes with
  it on the worst day. No new region is added to `<main>`, so `tools/plain.mjs` needs no edit. The builder
  runs it and records the result.

## 7. Files the build changes and creates

Step 13, in Quietkeep:
- created: `src/attended.ts`, `test/attended.test.ts`
- nothing else.

Step 14, in Quietkeep:
- created: `src/ui/review-roles.ts`, `docs/adr/0128-the-order-of-roles-by-the-last-act.md`
- changed: `src/review.ts` (it imports `attendedOrder` and `rolesCarryingLive`, and exports `isLiveWork`
  so the caller can pass it; nothing in any existing function changes), `src/ui/app.ts` (the mount, the
  refresh in `rerenderLists`, the `region.hidden` line), `public/index.html` (the section and the two
  sheet elements), `public/app.css` (the one rule), `tools/a11y.mjs`, `docs/manual.md`,
  `public/manual.html` (generated by `npm run manual`), `docs/adr/README.md` (the index row, held by
  `npm run adr:check`), `docs/code-map.md`, `CHANGELOG.md` (generated by `npm run changelog`),
  `src/ui/changelog.ts`, `public/sw.js` (the cache name), `NOTES.md`, `test/review.test.ts` (the
  partition test, section 10), `.a11y-stamp` (written by the walk itself on a clean run), the color
  inventory file the extraction writes, `public/tour/` (section 12), and `public/app.js` with its map if
  the bundle is tracked and `npm run build` rewrites it.
- `tools/size-check.mjs`: edited only on the second send the plan describes, by the dated route its own
  header gives.
- `tools/surfaces.mjs`: no edit expected. It derives its list from the markup and the registry.
  Touched only if its gate reports a gap.
- `tools/help-check.mjs`: no `COVERS` row. No help surface reproduces a set this section owns, and a
  declaration that a file lists a set in full must be true. The section has no `data-stance-name`, so the
  stance-name set is unchanged. The builder runs `npm run help:check` and records that it stays green.
- `ACCESSIBILITY.md`: a register row only for a finding the walk makes.
- `docs/structural-assessment.md` is not touched. This release derives no date and is not on that plan.
- The ceiling is the plan's: `src/`, `public/`, `test/`, `tools/`, `docs/`, `CHANGELOG.md`, `NOTES.md`,
  `ACCESSIBILITY.md`, `.a11y-stamp`. Nothing is written outside it.

## 8. The walk, `tools/a11y.mjs`

A new state, `'roles by last act'`, with its own `REGISTRY` entry beside `'review'`:
`#review-roles-heading`, `#review-roles-words`, `#review-roles-list .review-title`,
`#review-roles-list .review-why`. The existing `'review'` entry is not extended, because the section is
absent at that state and the registry refuses a selector that matches nothing. a second state,
`'every role in order'`, holds `#review-all-roles-heading`, `#review-all-roles .review-title` and
`#review-all-roles .review-why`, and is opened by the press inside the first state (corrected in the
build: the later state's containers would take the roles out of the order). The press `#review-roles-more` is not registered, because it carries the ordinary
`linklike` pair that `.review-count` already holds, and it is audited by the focus-ring and
target audits of its state.

What the walk's seed must hold so that every selector matches. At the review state the first card
already carries `Parent`, made at the roles state earlier in the file. The new state, driven
immediately after the review audits and before `'everything worth a look'`, makes three more roles
through the same route a person uses, the card sheet's `#detail-role` field and `#detail-role-set`,
each on a different live card, so that four roles carry live work and the cap of three has something
behind it. Names are plain words with no digits. The cards are the ones the surrounding state already
counts with its `spare` check. If there are fewer than four live cards at that point the walk makes the
missing card through the capture form, as it does elsewhere, and never writes state directly.

Assertions, each a `pass` or `fail` line in the walk's style, run in both themes:

- the section is absent with no role carrying live work (the empty store), and present once one does
- the section sits inside `#review` after `#review-list`, and its heading is a level-three heading
- text order: the heading, the sentence, then the rows, in DOM order, equal the order of section 6, and
  the same elements sorted by rendered top edge are in that order too
- at most three rows show on the surface, and `#review-roles-more` is present with four roles
- the rows read most-recent last: the walk acted under one role just now, so that role is the last of
  the four in the whole list and its line says `today`
- every line's words match the pattern of section 5 and carry no digit except a day count, and contain
  none of the refused words
- no `progress`, `meter` or `[role="progressbar"]` anywhere in the section, the way the roles readout is
  checked
- targets: every `.review-open` and the more press at least 44 pixels in both dimensions' minimum, the
  way the walk measures every control
- both themes at 390 by 844; and at 320 wide and 200 percent text, horizontal overflow of the section at
  most one pixel
- presses: a role row opens that role's own sheet, which shows the line view, and closes back to the
  Review; `#review-roles-more` opens `#sheet-review` with all four roles in `#review-all-roles`, uncapped,
  and the sheet's focus returns to the press on close
- absence: with the role links removed from all but one thing, or with an empty store, the section is
  hidden and `#review` is hidden when there are no exceptions
- plain mode: with the one-thing module on, `#review` and so the section are not displayed

The five audits, contrast, axe, accessible names, separation and targets, and focus rings on
`.review-open` and the more press, run for the new state, and `auditFocusRings` is called with the same
state name, which `tools/surfaces.mjs` holds equal to the set audited for contrast. The live-region gate
and the announce check run and stay green with no change, because the section declares no live region.

## 9. The manual and the help

`docs/manual.md`:
- a new heading `### See your roles by what was done last`, under "When you want to" directly after
  `### See what you have named`, saying in the reader's words: that the Review screen now lists the
  roles that carry something live, the one with the longest wait since anything was done under it first;
  that doing something under a role means marking something done, timing it, focusing on it, putting
  something down under it, changing it, or giving the role to a thing; that reading a role or opening a
  sheet is not counted and the app does not keep a record of where you looked, so a role you have only
  been reading can sit near the top; that it is an order and not a judgment, and no role in it is in
  trouble; that it appears when any role carries something live; and that three show with a button to all
  of them. It carries no claim the tests do not hold.
- under "Every screen", "The work surface", the bullet `- **Worth a look**` gains a clause naming the
  roles order, and the bullet `- **Everything worth a look**` gains a clause saying the roles order is
  in it too.
- `npm run manual` regenerates `public/manual.html`. `npm run manual:check` and `npm run manual:coverage`
  both pass. The coverage check reads the bold names against the headings in `public/index.html` in one
  direction and the bullets in the other, so the heading words of section 5 are the ones the manual
  quotes.

## 10. Tests

`test/attended.test.ts` (step 13), built from events through `fold` in the style of
`test/reading.test.ts`, with the test's own simple `isLive` (a node is live when it has no `lastDone`):

- a role with one done mark under a thing that carries it: last act is that mark's `at`
- two roles ordered by their last act, the older first
- the writing of the link counts as an act: a role given to a thing today is dated today
- a role with a carrier and nothing live is left out of the order
- a role with no carrier is left out
- the newest of several acts wins, across a done mark, a timed doing and a field change
- a tie on whole days breaks by name, then by id
- the day boundary: with a boundary set to three in the morning, an act at two in the morning is the
  previous day, and with midnight it is the same day
- a thing carrying two roles counts for both
- a descendant of a carrier counts: a done mark on a child of a tagged project dates the role
- a trashed or finished descendant's earlier act still counts, and its trashing does not
- a counted kind outside the list is not an act: a `clock.set`, a `heat.set` and a `replan.resolved`
  under a carrier leave the last act where it was
- an import-stamped `node.created` and a `sample` capture are not acts
- an event with an invalid `at` is skipped
- an act on the role node itself, a rename of it, does not date it
- a future `at` reads as zero days
- the empty store: no rows and no error; and a store with one role carrying live work returns that one
  role from `attendedOrder` while `rolesCarryingLive` returns the same one
- `ATTENDED_KINDS` holds exactly the kinds of section 4, and every one is a kind in the event union
- `attendedWords`: today, yesterday, `2 days ago`, `1 day` never `1 days`, and the no-act line; and none
  of them matches the refused vocabulary sweep, substrings included

Step 14 adds, in `test/review.test.ts`:

- the partition: over a store with carried roles in every state, every role that has a carrier is in
  exactly one of `quietLines` and `attendedOrder` called with `isLiveWork`, and a role with no carrier
  is in neither
- `reviewExceptions` and its cap are unchanged: its `total`, `shown` and ranking are identical on the
  stores the existing tests use, which pass without an edit

Step 14 adds, in `test/attended.test.ts`:

- the section's two lists are built from one order: the surface's rows are the first three of the sheet's
- the markup puts `#review-roles` inside `#review` after `#review-list`, and `#review-all-roles` inside
  `#sheet-review`; the text of the section's rules in `public/app.css` contains neither `--accent` nor
  `--warm`
- the function over the big sample set finishes inside the budget `test/read-perf.test.ts` states for the
  other readers, and the figure is printed

The ordinary `npm test` runs first. Every existing test passes unchanged apart from the files this record
creates or names.

## 11. How this sits with ADR-0117 and the quiet lines

ADR-0117 says of the quiet-line class that it carries no count, no duration, no `how long since` and no
ordering by staleness. That is a statement about a finding. A finding is an exception, it is ranked, it is
capped, and it is a claim that something is wrong. The order here makes no such claim: it has no cut, no
rank among exceptions, and nothing in it is a finding. The two lists partition the roles that have ever
carried work. A role with nothing live is a quiet line, whose words are unchanged. A role with something
live is in the order. A role is never in both, and the partition test in section 10 holds that.

The new ADR says this in its first paragraph and amends ADR-0117 only by adding a pointer to itself under
its own `What this does not do`, so a reader of the older record finds the order.

## 12. Photographs

The tour tool hashes five whole files: `public/index.html`, `public/app.css`, `src/ui/work.ts`,
`src/ui/clarify.ts` and `src/ui/about.ts`. Two of them change in this release, so `npm run tour:check`
goes red until the pictures are re-rendered. None of the pictures shows the Review screen, so none changes
in content. Step 14 runs `npm run tour:shots` once after the markup is final, commits the regenerated
files, and does not judge the four that vary from run to run by the tool's own note.

## 13. The release note, and the notes beside it

Release 3.28.0, kind CAPABILITY, dated 2026-11-03. Written as the new head of `RELEASES` in
`src/ui/changelog.ts`, with `CHANGELOG.md` generated by `npm run changelog` and the cache name in
`public/sw.js` becoming `quietkeep-3.28.0`. `npm run changelog:check` holds the three together. In the
reader's words, one idea to a line:

- **Worth a look now lists your roles from the one longest since anything was done under it.** If any of
  your roles carries something that is still live, a short list shows the three whose last
  activity is oldest first, with how many days ago something was last done under each, and a button
  to all of them. Each line opens that role.
- **Doing something is what counts.** Marking a thing done, timing it, focusing on it, putting something
  down under it, changing it, or giving the role to a thing all count. Opening a role or reading a thing
  does not, because the app does not keep a record of where you looked.
- **It is an order and nothing more.** No role is called late or in trouble, nothing is counted, nothing
  is colored, and nothing is stored for it. It is worked out from what the app already holds.
- **Still not right:** a role you only read, and never act under, can sit near the top. Roles with
  nothing live are still listed on their own line as before, not here. The list needs the whole history
  read once, which on a very large store may add a moment before it appears. It does not say what to do
  about a role near the top.

`NOTES.md`: the bullet that begins with the bare staging address, `https://staging.quietkeep.pages.dev`,
read by `tools/branch-state-check.mjs`, is rewritten to say 3.28.0 and what it carries, ahead of the
3.27.1 text it replaces. The bullet that begins `PRODUCTION CARRIES 3.26.1` stays as it is, because
nothing is promoted. The Block register is not touched.

## 14. Cautions found while reading, each with what the build does about it

- The Review section is hidden when empty and the door is derived from that. Putting the order inside it
  changes when the Review door shows, once, as section 6 says. If the first screen's door row is measured
  by the smoke walk, the walk runs as it stands and the hand-back names any check that went red.
- `isLiveWork` in `src/review.ts` is a private function. Step 14 exports it with no change to its body.
  The comment above it records that a concept stated in two places drifted once, so the export is the
  fix and not a copy.
- `liveBeneath` inside `quietLines` is a closure over a local map. The order's liveness walk is a second
  walk of the same shape over a map this module builds. The partition test is the guard. A third
  consumer would be the moment to lift the walk into one shared function, and that is not done here
  because it would change an existing function the plan does not name.
- The order reads the whole log. The log viewer and the purge count read it the same way on open. This
  reads it after a change. If the measured cost on the big sample is over the budget the other readers
  keep, the build hands back FAILED with the figure and does not weaken the test or the budget.
- The size check cannot start a browser on the build machine and only CI counts the shell's words. The
  section adds words to `public/index.html`. The plan's second send raises that one budget by the dated
  route, to the count CI prints.
- The refused-word sweep in `test/review.test.ts` is a substring match. Words such as `latest` and
  `related` trip it. The section's words avoid them and the new test runs the same sweep.
- `src/reach.ts` holds NUL bytes, found by an earlier reading and left for the documentation plan. The
  build does not touch it.
- A trashed carrier carries nothing, because `heldNodes` excludes it. A role whose only carrier was
  trashed is therefore not in the order and is a quiet line if it ever carried work, as it is today.

## 15. What this does not do

- No new event, kind, relation, field or stored value.
- No threshold, window, late state, color, bar, count of roles, score, rank, percentage or streak.
- No copy that says a role was neglected, and none that says the reader failed anything.
- No role lens, no filter, no role at the sorting step, no change to Carrying.
- No record that a sheet was opened, and no use of one.
- No cadence and no reminder: the order is read when the reader goes to the Review screen and never
  pushes anything.
- No change to `quietLines`, `REVIEW_CAP`, the ranking of the five exception classes, or the count line.

## 16. What would overturn this

A reader who opens the section and never presses a line, while the three lines keep reading as the same
roles for weeks. That would say the order is read as information about a life and not as a way into a
role, and the remedy would be removing the section, not adding a cue. Also a store where acts are
recorded almost only under containers and roles are carried by leaf actions, which would date every role
by its newest leaf and tell nothing; the walk through descendants handles the normal shape, and a store
shaped otherwise is a finding for the Block register and not for this record.
