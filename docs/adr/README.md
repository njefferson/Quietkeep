# Architecture decision records

Why these exist: the design phase decided a great deal, and a decision whose
reasoning is lost gets re-litigated by the next person to find it inconvenient —
usually a future session, usually at the worst moment.

There was no ADR convention anywhere in this family of apps before this repo, so
one is established here in the family's existing idiom rather than borrowed from
a generic template. It matches how `ACCESSIBILITY.md` and the hub's `LESSONS.md`
already behave: **short, numbered, append-only, never edited in place.**

## The rules

1. **Never edit a record to change its decision.** Write a new one and add a
   `Superseded by ADR-NNNN` line to the old. The old record stays, forever.
   Someone reading a two-year-old commit needs the reasoning that was live then.
2. **Every record names what would overturn it.** A decision with no falsifier is
   a preference wearing a decision's clothes.
3. **Only settled things go here.** Anything still open lives in
   [`NOTES.md`](../../NOTES.md) as a numbered question. A session does not get to
   close an open question by writing an ADR about it.
4. **One decision per record.** If it needs "and", it is two records.

## Format

```
# ADR-NNNN · <title>
Status · Date · Decision · Why · Consequences · What would overturn it
```

## Index

- **[0001](0001-event-sourced-log.md)**
  - Decision: State is a fold over an append-only event log
  - Status: Accepted
- **[0002](0002-storage-dexie-indexeddb.md)**
  - Decision: IndexedDB via Dexie; `localStorage` banned
  - Status: Accepted
- **[0003](0003-folder-mirror.md)**
  - Decision: Optional folder mirror, per-device shards, Chromium desktop only
  - Status: Accepted
- **[0004](0004-ios-path.md)**
  - Decision: iOS gets manual export/import, not a degraded folder mirror
  - Status: Accepted
- **[0005](0005-vaults-and-journal-encryption.md)**
  - Decision: Vaults per life-domain; journal encryption ships with the journal
  - Status: Accepted
- **[0006](0006-backups-and-import.md)**
  - Decision: Immutable timestamped exports; import seeds a fresh store, never merges
  - Status: Accepted
- **[0007](0007-notification-tiers.md)**
  - Decision: Notification ladder T0 → T3, each tier standing alone
  - Status: Accepted
- **[0008](0008-capture-endpoints.md)**
  - Decision: Multiple capture entrances; commit before confirm
  - Status: Accepted
- **[0009](0009-strategy-modules.md)**
  - Decision: Minimal invariant core plus toggleable modules
  - Status: Accepted
- **[0010](0010-decay-primitive.md)**
  - Decision: One decay primitive for everything temporal; no "overdue"
  - Status: Accepted
- **[0011](0011-no-silent-nodes-gate.md)**
  - Decision: The no-silent-nodes invariant is enforced at the write boundary
  - Status: Accepted
- **[0012](0012-no-past-bucket.md)**
  - Decision: A passed clock becomes a live replan card, never an archive row
  - Status: Accepted
- **[0013](0013-levels-push-down.md)**
  - Decision: Higher horizons project downward; the runway is the only workspace
  - Status: Accepted
- **[0014](0014-demand-free-types.md)**
  - Decision: Menu items and pebbles cannot carry clocks
  - Status: Accepted
- **[0015](0015-ai-never-blocks.md)**
  - Decision: Every assisted flow has a working offline rung
  - Status: Accepted
- **[0016](0016-gtd-marks-and-original-content.md)**
  - Decision: Never use the GTD® marks; all trigger-list content original
  - Status: Accepted
- **[0017](0017-licensing.md)**
  - Decision: PolyForm Noncommercial 1.0.0
  - Status: Accepted
- **[0019](0019-v1-freeze.md)**
  - Decision: v1 scope frozen; the dogfood gate defines done
  - Status: Accepted
- **[0018](0018-name-and-slug.md)**
  - Decision: Repo slug `Horizons`; subdomain qualified
  - Status: **Superseded by [0020](0020-name-perennial.md)**
- **[0020](0020-name-perennial.md)**
  - Decision: The name is Perennial — **and the candidate graveyard, which is still current**
  - Status: **Superseded by [0021](0021-name-reopened.md)**
- **[0021](0021-name-reopened.md)**
  - Decision: Perennial withdrawn; the name is reopened
  - Status: **Superseded by [0022](0022-name-wynts.md)**
- **[0022](0022-name-wynts.md)**
  - Decision: The name is Wynts — what you need to see
  - Status: **Superseded by [0023](0023-name-wynts-withdrawn.md)**
- **[0023](0023-name-wynts-withdrawn.md)**
  - Decision: Wynts withdrawn — it sounds like "wince"; the check order
  - Status: **Superseded by [0024](0024-name-quietkeep.md)**
- **[0024](0024-name-quietkeep.md)**
  - Decision: **The name is Quietkeep**
  - Status: Accepted
- **[0025](0025-visual-identity.md)**
  - Decision: The mark is drawn as SVG; the social background is generated
  - Status: Accepted
- **[0026](0026-ui-and-build.md)**
  - Decision: No UI framework; one esbuild type-strip step
  - Status: Accepted
- **[0027](0027-cure-stamps.md)**
  - Decision: Cures share their cause's stamp; commits are serialized
  - Status: Accepted
- **[0028](0028-public-capture-surfaces.md)**
  - Decision: URL/share/shortcut capture entrances; strict CSP
  - Status: Accepted
- **[0029](0029-triage-model.md)**
  - Decision: Triage: optional heat pass, forced-choice clarify, each route self-terminating
  - Status: Accepted
- **[0030](0030-work-mode.md)**
  - Decision: Work mode: pressure formula, fixed precedence, a skip that records nothing
  - Status: Accepted
- **[0031](0031-node-renamed.md)**
  - Decision: `node.renamed` — the first addition to the closed vocabulary
  - Status: Accepted
- **[0032](0032-held-list-grouped.md)**
  - Decision: What you are holding is grouped, and can be ticked off in place
  - Status: Accepted
- **[0033](0033-calendar-export-t1.md)**
  - Decision: The calendar file is all-day events with a relative alarm (T1)
  - Status: Accepted
- **[0034](0034-replan-cards-are-computed.md)**
  - Decision: Replan cards are computed, and only hard clocks raise them
  - Status: Accepted
- **[0035](0035-multi-device-shard-union.md)**
  - Decision: Two devices, by folding in a shard — opt-in, additive, no server
  - Status: Accepted
- **[0036](0036-two-builds-one-branch.md)**
  - Decision: Two builds from one branch; the default cannot sync and the browser enforces it
  - Status: Accepted
- **[0037](0037-sync-design.md)**
  - Decision: Quietkeep Sync — a relay that cannot read, gated against accident
  - Status: Accepted (design)
- **[0038](0038-containment-and-exceptions-review.md)**
  - Decision: Containment is a control, and Review is exceptions only
  - Status: Accepted
- **[0039](0039-focus-and-the-way-back.md)**
  - Decision: The resume card is written at the interruption, not at the exit
  - Status: Accepted
- **[0040](0040-the-person-lens.md)**
  - Decision: The person lens shows what nobody has named
  - Status: Accepted
- **[0041](0041-carrying-and-the-report.md)**
  - Decision: Carrying is not doing, and the report is a fold
  - Status: Accepted
- **[0042](0042-the-comms-sweep.md)**
  - Decision: The comms sweep appears on the way out, and nowhere else
  - Status: Accepted
- **[0043](0043-re-entry-is-the-primary-path.md)**
  - Decision: Re-entry is bounded by shape, not by restraint
  - Status: Accepted
- **[0044](0044-sort-mode-and-named-ranges.md)**
  - Decision: Sort mode — the second triage, over a range the user names
  - Status: Accepted
- **[0045](0045-the-start-verb.md)**
  - Decision: "Not before" — the defer verb rides the start clock
  - Status: Accepted
- **[0046](0046-admit-accumulator.md)**
  - Decision: The gate keeps one running accumulator
  - Status: Accepted
- **[0047](0047-the-note-field.md)**
  - Decision: The note — title-class content, not journal-class
  - Status: Accepted
- **[0048](0048-the-log-viewer.md)**
  - Decision: The record is readable — the log viewer and per-node history
  - Status: Accepted
- **[0049](0049-wholesale-acts.md)**
  - Decision: Wholesale acts — the preview is the dry run, the receipt explains the pile
  - Status: Accepted
- **[0050](0050-things-you-let-go.md)**
  - Decision: Things you let go — recovery, not an archive
  - Status: Accepted
- **[0051](0051-composed-today.md)**
  - Decision: Composed Today — optional, hand-chosen, expiring by projection
  - Status: Accepted
- **[0052](0052-session-close.md)**
  - Decision: The session close — peak-end, never a report card
  - Status: Accepted
- **[0053](0053-folding-a-duplicate.md)**
  - Decision: Folding a duplicate — the carry batch, the way back, the twins range
  - Status: Accepted, **amended by [0058](0058-what-a-fold-takes-with-it.md)**
- **[0054](0054-the-lens.md)**
  - Decision: The lens — what you look at, never what is held
  - Status: Accepted
- **[0055](0055-the-panel-folds.md)**
  - Decision: The panel folds — four groups, closed until asked
  - Status: Accepted
- **[0056](0056-request-slots-and-the-not-now-ledger.md)**
  - Decision: Request slots and the Not Now ledger
  - Status: Accepted
- **[0057](0057-stakeholders-and-the-decision-log.md)**
  - Decision: Stakeholders that are read, and the decision log
  - Status: Accepted
- **[0058](0058-what-a-fold-takes-with-it.md)**
  - Decision: What a fold takes with it
  - Status: Accepted
- **[0059](0059-presence-not-progress.md)**
  - Decision: The timer shows presence, not progress
  - Status: Accepted
- **[0060](0060-a-few-things-you-could-pick-up.md)**
  - Decision: A few things you could pick up
  - Status: Accepted
- **[0061](0061-the-journal-is-a-kind-not-a-vault.md)**
  - Decision: The journal is a kind, not a vault — **supersedes [0005](0005-vaults-and-journal-encryption.md)'s vault split**
  - Status: Accepted
- **[0062](0062-the-copy-and-the-way-back.md)**
  - Decision: The copy has a date and the way back is one tap — [ADR-0004](0004-ios-path.md) executed
  - Status: Accepted
- **[0063](0063-startup-does-not-replay-the-world.md)**
  - Decision: The session cuts a snapshot once per boot — [ADR-0001](0001-event-sourced-log.md)'s first consequence, executed
  - Status: Accepted
- **[0064](0064-every-noun-accounts-for-itself.md)**
  - Decision: Every event kind is written by the app, or the vocabulary says in words why it is not
  - Status: Accepted
- **[0065](0065-load-not-work.md)**
  - Decision: Unresolved weight narrows the offer and nothing else — [ADR-0014](0014-demand-free-types.md)'s pebble consequence, executed
  - Status: Accepted
- **[0066](0066-what-held-means.md)**
  - Decision: One predicate for "held as work" — the gauge, the list it itemises and the todo list read it
  - Status: Accepted
- **[0067](0067-a-set-with-everything-in-it.md)**
  - Decision: A generated set covering every kind, delivered as a file, with a coverage gate and a projection sweep over it
  - Status: Accepted
- **[0068](0068-the-staff-call.md)**
  - Decision: Anchors are named periods — demand-free, with a surface, and a delta cut on the existing watermark
  - Status: Accepted
- **[0069](0069-what-it-costs-to-look.md)**
  - Decision: `localParts` is memoised and the read path gets a gate — measured, not extrapolated
  - Status: Accepted
- **[0070](0070-membership.md)**
  - Decision: One kind × surface table with a written reason per surface, checked both ways over the set-of-everything
  - Status: Accepted
- **[0071](0071-the-diagnostic-report.md)**
  - Decision: A text diagnostic that carries SHAPE and never content, proved by two differently-worded stores producing identical reports
  - Status: Accepted
- **[0073](0073-triage-answers-where.md)**
  - Decision: Triage gains a `filed` route and makes the place when it is not there — every other route answered *when*, so an imported backlog could be sorted end to end and never filed
  - Status: Accepted
- **[0072](0072-an-update-waits-for-the-reader.md)**
  - Decision: The new worker waits and only the reader's decision releases it — `skipWaiting()` on install was creating the half-updated shell its own comment claimed to prevent
  - Status: Accepted
- **[0074](0074-arrangements-that-run-without-you.md)**
  - Decision: An arrangement is a field on an upkeep, and its clock measures confirmation — its failure mode is silence, so the thing under a clock is *did you check*, never *did it happen*
  - Status: Accepted · shipped 1.21.0
- **[0075](0075-the-header-clock.md)**
  - Decision: The header clock says the time, the remainder and a count, and refuses the fourth thing — the dial answers a question that was never the problem; the remainder is the gradient
  - Status: Accepted · shipped 1.22.0
- **[0076](0076-assembled-context-on-the-cards.md)**
  - Decision: Assembled context belongs on the card where the decision is made — the half of ADR-0012 that was never delivered
  - Status: Accepted · shipped 1.23.0
- **[0077](0077-when-you-cannot-start.md)**
  - Decision: The two things you can do when you cannot start, both on the offer — name a first step, or say it is heavy
  - Status: Accepted · shipped 1.24.0
- **[0078](0078-what-the-gates-did-not-look-at.md)**
  - Decision: Two gates that measured everything except whether the page was right — each measured a property of the page rather than the page
  - Status: Accepted · shipped 1.24.1
- **[0079](0079-a-way-past-a-card.md)**
  - Decision: Triage gets a way past a card, and it records nothing — every pass had paths in and no path out, while Next up has had "Not this" since ADR-0030
  - Status: Accepted · shipped 1.25.0
- **[0080](0080-dating-a-place.md)**
  - Decision: A place gets a return date, and it is a review clock offered on the receipt
  - Status: Accepted · shipped 1.26.0 · V2 stage 3
- **[0081](0081-waiting-for-a-thing-rather-than-a-date.md)**
  - Decision: An item may wait for another item to be finished, and that is law 1's fifth clause
  - Status: Accepted · shipped 1.30.0
- **[0082](0082-put-it-down.md)**
  - Decision: Put it down — the exit that is neither done nor deleted, reversible, leaving no browsable pile and no count
  - Status: Accepted · shipped 1.32.0
- **[0083](0083-four-destinations.md)**
  - Decision: Help, Settings, Your data and How it works stop being folds inside the ⓘ and become their own screens, reached from More — one surface at a time
  - Status: Accepted · supersedes [0055](0055-the-panel-folds.md)
- **[0084](0084-the-guarantee-is-the-product.md)**
  - Decision: The guarantee is the product and it has to be openable — the proof (why each thing comes back) before the inventory (what is in here)
  - Status: Accepted
- **[0085](0085-sorting-is-not-the-corridor.md)**
  - Decision: Capture covers. Sorting is a door, never the corridor
  - Status: Accepted
- **[0086](0086-a-thing-is-a-task-the-moment-it-exists.md)**
  - Decision: A thing is a task the moment it exists
  - Status: Accepted · shipped 2.0.0
- **[0087](0087-a-cure-is-not-somebody-asking.md)**
  - Decision: A cure is not somebody asking, and every cured kind is classified
  - Status: Accepted · shipped 2.0.1
- **[0088](0088-the-claim-and-the-tree-are-places.md)**
  - Decision: The coverage claim and the alignment tree stop unfolding into the workspace and become sheets, opened from the controls that always stated them
  - Status: Accepted · shipped 2.0.5 · extends [0083](0083-four-destinations.md), amends [0013](0013-levels-push-down.md) and [0084](0084-the-guarantee-is-the-product.md)
- **[0089](0089-the-menu-is-a-place.md)**
  - Decision: The Menu becomes a sheet — the third and last inline expander off the work surface — and law 6 stops being maintained and becomes structural, because a dialog cannot remember it was open
  - Status: Accepted · shipped 2.0.7 · extends [0088](0088-the-claim-and-the-tree-are-places.md)
- **[0090](0090-a-way-past-the-stack.md)**
  - Decision: A visible, touch-reachable jump to the held list, shown only when something is in the way — the `.skip` link had served keyboard and screen-reader users only, and autofocus kept it out of the forward tab order
  - Status: Accepted · shipped 2.0.8 · extends [0089](0089-the-menu-is-a-place.md)
- **[0091](0091-a-control-looks-like-a-control.md)**
  - Decision: Every control on the work surface carries a border or a fill, and the jump gains a return leg — 5 of the 7 prose-styled controls were every route off the page, and nothing anywhere returned the reader to the top
  - Status: Accepted · shipped 2.1.0 · extends [0090](0090-a-way-past-the-stack.md)
- **[0092](0092-contexts.md)**
  - Decision: Contexts — a demand-free node plus a cross-cutting link saying where a thing can be DONE, and a device preference for where you are that narrows the offer and the list; unlabelled fits everywhere and law 1 never reads it
  - Status: Accepted · shipped 2.2.0
- **[0093](0093-a-way-to-each-part-of-the-page.md)**
  - Decision: A contents sheet listing every live block of the runway, named and counted by the blocks themselves, behind a viewport-fixed door — and the held list becomes a real section with a focusable heading; not tabs, because a partition means remembering to check the other one
  - Status: Accepted · shipped 2.3.0 · extends [0090](0090-a-way-past-the-stack.md), [0091](0091-a-control-looks-like-a-control.md)
- **[0094](0094-a-card-says-what-it-is.md)**
  - Decision: One reader-facing word per node kind, defined once and stated first on a card's own line and on the detail sheet — the app had fourteen kinds and no word for any of them, so a goal and a loose to-do drew identically; `action` stays deliberately unmarked
  - Status: Accepted · shipped 2.4.0
- **[0095](0095-what-a-thing-is-for.md)**
  - Decision: A card says what it serves — the highest live horizon above it — as one descriptive line; law 4's downward half, built for the first time. Never a destination, no count, no score, and it does not change the offer's ordering
  - Status: Accepted · shipped 2.5.0 · answers Q-11 · extends [0013](0013-levels-push-down.md)
- **[0096](0096-roles.md)**
  - Decision: A role is a cross-cutting link saying WHO work is for — an identity crossing areas, so it can never be a container; plus "Where the attention is", a readout of live work per role that is sorted by name, has no bar or target, and states the unnamed remainder
  - Status: Accepted · shipped 2.6.0 · settles Q-13 · extends [0092](0092-contexts.md)
- **[0097](0097-the-offer-reads-interest.md)**
  - Decision: Inside the `ready` tier only, the offer breaks ties on the heat the reader already set — hot, unsaid, cold — and says so on the card; routed by nd-collisions entry 5, which also REFUSES the importance rank that was the alternative
  - Status: Accepted · shipped 2.7.0 · closes Q-11 · extends [0029](0029-triage-model.md), [0030](0030-work-mode.md)
- **[0098](0098-the-apps-own-size.md)**
  - Decision: A size control scaling this app's type on this device as a MULTIPLE of the reader's own setting — and `--target` becomes `max(2.75rem, 44px)` first, because the floor shrank with the text and 24 controls fell under 44px at an ordinary reduced setting
  - Status: Accepted · shipped 2.8.0 · extends [0059](0059-presence-not-progress.md)
- **[0099](0099-the-first-screen.md)**
  - Decision: The worry entry, the load entry and sort's door leave the runway and become derived rows in Contents; the coverage gauge moves to the top where it can be read before the list it reassures about. Measured, not argued: Next up 0.48 → 0.43 screens, and a floor of about 0.36 that no rearrangement can beat in this shell
  - Status: Accepted · shipped 2.8.1 · extends [0093](0093-a-way-to-each-part-of-the-page.md)
- **[0100](0100-the-frame-stays.md)**
  - Decision: The page becomes a flex column of viewport height with one scrolling child; capture, the proof and the destinations sit outside the scroller and never move. NOT fixed and NOT sticky — both were ruled out by measurements already in this repo — but the flex-column shape every sheet has proved on the reference device since 1.40.0, carried up to the document
  - Status: Accepted · shipped 2.9.0 · follows [0099](0099-the-first-screen.md)
- **[0101](0101-the-frame-stands-down.md)**
  - Decision: Past half the viewport the frame stops being a frame and the document scrolls again, rather than scrolling inside itself and cutting the proof line through the middle of its own sentence; two thresholds, so a height near the line cannot flip on every measurement
  - Status: Accepted · shipped 2.9.2 · amends [0100](0100-the-frame-stays.md)
- **[0102](0102-the-inventory-is-folded.md)**
  - Decision: What you are holding keeps everything and stops standing open — its body is a disclosure, closed on arrival, whose summary names every non-empty group and carries no counts. Measured: the runway was 4,247px with this list 2,387px of it, and seven items appeared on the landing surface twice or three times. Not the fold ADR-0083/0088 refused, because for the LAST block "how much stands in front of you" and "how far you have to travel" are the same quantity; and a fold is not a switch, which is why it is not a sheet
  - Status: Accepted · shipped 2.12.0 · extends [0032](0032-held-list-grouped.md), [0099](0099-the-first-screen.md) · narrows [0083](0083-four-destinations.md), [0088](0088-the-claim-and-the-tree-are-places.md)
- **[0103](0103-the-card-states-no-moving-number.md)**
  - Decision: The offer card states no number that moves on its own — `#nextup-left` ("About 2h 30m left today", the one permitted number) comes off, and the remainder of the day keeps the home it already had on the opt-in header clock. The card forbade exactly this for the line beneath it, the clock is opt-in because "a day is not a countdown" while the card said it to everybody, the two rendered the same arithmetic at once for anyone with the clock on, and the line's own prospective defence needed the item's duration, which renders only in the detail sheet
  - Status: Accepted · shipped 2.12.2 · narrows [0059](0059-presence-not-progress.md), [0010](0010-decay-primitive.md)
- **[0104](0104-the-worst-day-is-the-whole-screen.md)**
  - Decision: "Just one thing" is a fact about the screen, not about the card — the work surface below the offer is not displayed while it is on, leaving capture and its receipt, the proof line, More and the ⓘ, the update strip and a running focus session. Measured at 390×844 with the mode ON: five controls on the card and fourteen controls and 65 words standing underneath it, the same fourteen and the same 65 as with the mode off, for four releases. The strip is a stylesheet rule generated from the list, because every section below the offer has an owner that repaints it and a rule cannot be outrun by a repaint
  - Status: Accepted · shipped 2.14.0 · extends [0090](0090-a-way-past-the-stack.md)
- **[0105](0105-the-exit-is-not-inside-the-state.md)**
  - Decision: A control that undoes a state does not live inside anything that state can hide — the bar carrying the only way out of "Just one thing" moves out of the offer card, which is hidden whenever nothing is asking. Rendered: mode on with nothing to offer left capture, the proof line, More, the ⓘ and the footer, and no control anywhere that turns the mode off. The defect predates ADR-0104 and its cost does not; nothing about the exit's markup changed in that release, which is why no diff and no release note could see it. The containment is asserted statically now, not stated in a comment written inside the container it forbids
  - Status: Accepted · shipped 2.14.1 · consequence of [0104](0104-the-worst-day-is-the-whole-screen.md)

- **[0106](0106-no-pronoun-for-anybody.md)**
  - Decision: The app has no pronoun for anybody — the reader is *you*, another person is their *name*, and where neither works the answer is *they*. No pronoun preference is collected for the reader and no pronoun field for recorded people. Measured before deciding: zero gendered third-person pronouns across 7,213 shipped strings in 114 files and both pages, the reader addressed in the second person throughout, and `peopleWords` taking a count rather than a person — so no code path can generate a pronoun for anybody. A setting for the reader has nothing to set; a field for third parties is a datum that is silently wrong when stale or guessed and that the app has no use for, and not collecting it is stronger than collecting it correctly. The property already held and nothing asserted it, which is this repo's most expensive recurring shape
  - Status: Accepted · gated by `tools/voice-pronouns.mjs`, both rules watched red on a plant
- **[0107](0107-an-import-carries-the-words-you-wrote.md)**
  - Decision: An import creates contexts from the tags on a line and records an estimate from `@estimate`, both of which were dropped and named as losses before this. Names match case-insensitively and are created in the first spelling seen, so one word is one place; tags on a project are carried too, because `placesReaching` makes a container's label reach everything inside it. `@flagged` stays dropped for its original reason — a flag is a priority mark and this app has no priority field. Not the inference `docs/nd-collisions.md` entry 23 refuses: a tag is a word the person typed, in the system they typed it in, which is what entry 24 says a context node is. What it cost to leave it: a 1,432-item OmniFocus import arrived carrying ONE context, and `fitsHere`'s load-bearing "unlabelled fits everywhere" default hid the loss perfectly by never showing an empty screen
  - Status: Accepted · three plants watched red — tags dropped again, estimates parsed but never stamped, and a context node made per item instead of per name

- **[0108](0108-the-page-is-a-hub-and-the-work-is-a-stance.md)**
  - Decision: The runway stops being the workspace. The app becomes a hub — one surface you come up to — and a set of stances, each a full screen that is only one job. Not tabs: ADR-0093's refusal rested on a partition meaning you must remember to check the other one, and a hub is entered from a surface that lists every place and what is waiting in it, so the forgetting has nowhere to happen. That argument was also made at a desk — one long page with navigation is a desktop shape, and these apps are used on a tablet by touch, where one block fills the screen and position in a document reads as nothing at all. Measured: ADR-0099 found reordering moved the offer 42px against a 0.36-screen floor, ADR-0100 lifted the frame out of the scroller, and ADR-0101 then had to stand that frame down at 175% text where it is 474px against a 422px cap — each step correct, each buying less, the wrong object being optimised. The runway is 15 conditional sections beside 21 dialogs, and no ordering of 15 blocks produces a sense of place, because a document has a position rather than places
  - Status: Accepted · reverses [0093](0093-a-way-to-each-part-of-the-page.md)'s conclusion, supersedes the workspace half of [0100](0100-the-frame-stays.md)

- **[0109](0109-the-wide-arrangement.md)**
  - Decision: Above 900px the job view shows the hub beside the job; below it nothing changes. Not a new decision — ADR-0108 specified this second arrangement and built for it, which is why stances are sections toggled by a class rather than dialogs. Measured rather than guessed: the body caps at 46rem so every viewport from 768px up rendered identically, wasting 132px each side on a tablet in landscape and 272px at 1280; the hub asks for 276px at its natural width, so 280 + 24 between + a 560 floor for the job + 16 padding each side is 896, hence 900. A pinned sidebar rather than a grid, because grid rows couple the columns and left 230px of dead space in the job column — the hub is one tall box beside a flow of many, which is not a grid of rows. Nothing in src/ changed. The way back stays at every width. One stance, not several, and said so rather than left looking forgotten
  - Status: Accepted · executes the second arrangement of [0108](0108-the-page-is-a-hub-and-the-work-is-a-stance.md)

**This index went fifteen records stale before anyone noticed**, from 0074 to
0088 — every record written between 5 and 11 August. Nothing gates it, and a
missing row is invisible in exactly the way a wrong row is not: the index reads
as complete whatever is absent from it, which is the same shape as the stale
paragraph the hub's own CLAUDE.md records under *one file, two answers*.

Adding only the newest would have been worse than adding none — it would have
put a current date on a list still missing fourteen records. If this drifts
again the answer is a gate that compares `ls docs/adr/0*.md` against the rows
here, not another catch-up.

**Provisional** means: decided well enough to build on, and explicitly awaiting the
owner's word. It is not the same as Accepted, and it is not the same as open.

**Superseded pending** means the decision is known to be changing but the replacement does
not exist yet. The naming chain used it between [0021](0021-name-reopened.md) and
[0024](0024-name-quietkeep.md), when it was settled that the name had to change before any
replacement existed. **No record is in that state now.** It is documented because the
situation recurs, and a record that stays accurate about its own obsolescence is better
than one quietly describing a decision that no longer holds.

**The naming chain reads 0018 → 0020 → 0021 → 0022 → 0023 → 0024**, and every step stays.
[0020](0020-name-perennial.md) also carries the **candidate graveyard**, which remains
current and authoritative regardless of that record's superseded status.
