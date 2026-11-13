# CLAUDE.md — Quietkeep

Read the short page first, at /root/.claude/hub/plans/native/page.md. If that file is absent, the hub is not installed in this session: say so before any work, and commit and push nothing until the owner has answered.

## Facts first

What a session gets wrong from its prior about this app, each with what fails when it is broken.

- Storage is IndexedDB through Dexie; `localStorage` is banned outright. Fails: the Spine step `No localStorage` (`npm run storage:check`).
- State is the fold of an append-only event log, and nothing is stored that is not an event named in `docs/event-vocabulary.md`. Fails: the Spine step `The closed event list matches the vocabulary` (`npm run events:check`).
- An import seeds a fresh store and never merges. Fails: `test/import.test.ts`. Migrations are additive only. Fails: `test/migration-guard.test.ts`.
- There is no overdue, late or behind state, no streak and no score; a passed date becomes a present replan card. Fails: the Spine step `No banned vocabulary` (`npm run vocabulary`) and `test/replan.test.ts`.
- No node is silent: the write boundary refuses one that is on no surface, under no clock, not on the Menu and not parented to something under a clock. Fails: `test/spine.test.ts`.
- A role is demand-free, a node plus a link and never a container or a filter, so the gate refuses a clock on one. Fails: `test/facts.test.ts`. The app records nowhere that a reader looked at anything, so opening a sheet is not an act. Fails: `test/attended.test.ts`.
- The site's content policy allows scripts and styles from its own files only, so an inline style or script is refused. Fails: `test/facts.test.ts`.
- Every page the app links to is precached by the worker, or a navigation falls back to the app shell. Fails: the Spine step running `npm run help:check`.
- Nothing about the owner's person lands in any file. Fails: `test/privacy.test.ts` and the hub's privacy, quote and third-person gates.
- Every assisted flow has an offline rung, and a cloud rung needs consent naming what leaves the device; a general-population finding never overrides a refusal that rests on a finding about this audience. Held by the review alone.

## What this repo is
**Quietkeep** is a free, local-first planner for neurodivergent users, designed
against a *condition* rather than a diagnosis: low capacity, high demand,
interruption, and engagement that varies. Neurodivergent people are who meet
that condition most often and most severely, which is why the design aims there
and why the refusals are absolute. It is a static PWA with no accounts, no
telemetry and no server-side user data, deployed to Cloudflare Pages.

Naming the condition is what makes whole literatures legitimately applicable:
cognitive aids, structured handover, high-reliability work, distributed
cognition. None of them is reachable from a diagnosis alone, and all of them
bear on the design (`docs/planning-for-humans.md` §10b).

Tagline: *"Out of sight. Never out of mind."*
Epigraph: *"It holds the rest, so you can rest."*

A second edition, **Quietkeep Sync**, is built from the same tree by
`tools/editions.mjs`. The four deploy addresses:
- quietkeep.pages.dev (production)
- staging.quietkeep.pages.dev
- quietkeep-sync.pages.dev (production, Sync)
- staging.quietkeep-sync.pages.dev

## Read these first, in this order
1. [`NOTES.md`](NOTES.md): the repo source of truth. The thesis, the ten product laws, the frozen v1 scope, the open questions, the project facts.
2. [`docs/adr/`](docs/adr/): every settled architectural decision, one per file.
3. [`docs/event-vocabulary.md`](docs/event-vocabulary.md): the complete event noun list. All application state folds from this, and nothing is stored that is not an event named here.
4. [`docs/verifications.md`](docs/verifications.md): what has actually been checked and what merely looks checked. Consult it before assuming a platform fact.
5. [`docs/code-map.md`](docs/code-map.md): the shape of the source for somebody who has never opened it (event, fold, gate, projection, surface, and which files hold each). It is the only document whose job is what the shape is rather than what went wrong. Source comments are incident history for a reader already oriented; use the map to find a thing.

## Branches & releases
- `staging` and `main` only.
- Every product change lands on `staging` and waits for the owner's on-device pass and an explicit "promote".
- The promote route is a commit on `main` with `QUIETKEEP_PROMOTE=1` (declared in `.branch-guard`).
- Docs-only changes (this file, `NOTES.md`, `ACCESSIBILITY.md`, anything in `docs/`) may skip the staging gate.
- Releases are a `version.capability.iteration` triplet. The service-worker cache name carries the same triplet and is bumped with it.
- Every app shows its version on screen and what changed.

## The clone rolls back
The container reverts the clone to an earlier commit without warning. It is a property of the box, not an incident, and is not narrated.
- At the start of any turn that touches the tree, and after anything that took ten minutes:

    git fetch origin staging && git reset --hard origin/staging

- The hub lives at /root/.claude/hub and is brought forward at each start by the dispatcher.
- Push before anything long: edit, commit, push, then start a walk. The walks take eight to fourteen minutes.
- Receipts are committed the moment their walk goes green, as their own commit.
- Never estimate how far back it went. Read `git log -1 --format=%cd`.

## What this repo's own hooks run
- `.claude/hooks/session-start.sh`: the stale-clone check, then the hub's `session-brief.mjs` and `branch-guard.mjs --install` from /root/.claude/hub. It says so when the hub is absent.
- `.claude/hooks/plan-guard.sh`: a shim to the hub's `plan-guard.mjs`, which refuses the choice popup and passes every other call.
- `.claude/hooks/stop-guard.sh`: a shim to the hub's `stop-guard.mjs`, kept at its path, which never refuses a stop.
- The commit guards. `.branch-guard` declares `work=staging`, `promote=main`, `escape=QUIETKEEP_PROMOTE`, and `also=` checks that run on every commit:
  - `tools/hooks/a11y-fresh.sh`: refuses a commit that changes the rendered app while `.a11y-stamp` records the previous markup. Lenient on `staging`, a refusal only on `main`. `npm run a11y` writes the receipt, only on a clean run, in about four minutes.
  - `tools/hooks/branch-state.sh`.
  - `tools/hub-pin-check.mjs`: the hub commit is written in two places, the marker and the `uses:` pin in `.github/workflows/spine.yml`, and they move together.
- `escape-also=QUIETKEEP_DEFER` is the named way past those checks. It prints what it deferred, and both checks are also CI steps, so it moves when, never whether.
- The tracked `.githooks/` files are generated by the hub's `branch-guard.mjs --install` and are never edited by hand.
- The commit-msg hook refuses a chat link, an attribution trailer or a model's name. The harness appends a trailer and a session link unless the repository's instructions say otherwise: this file says otherwise, and nothing committed here carries either. Commits before 2026-09-18 still carry both. That is published history and the owner's call; it is recorded here and not re-offered.

## The checks before a push
- `npm run spine` reads `.github/workflows/spine.yml` and runs every step on this machine, in order. It takes about eight minutes, most of it three browser walks. Options: `--list`, `--only <name>`, `--from <n>`. It keeps going past a failure and prints the verdict last.
- `npm run spine -- --parity` asserts that every `package.json` script is run by a workflow or declared in `.spine-exempt` with a reason, in both directions.
- The steps it prints as CI-only are run separately. The hub gates run from /root/.claude/hub.
  - `privacy-check`, `privacy-mirror-check`, `quote-check` and `branch-guard` take `--repo .`.
  - `docs-check` takes a positional path (`node /root/.claude/hub/docs-check.mjs .`) and dies on `--repo`.
  - `branch-guard` is run the way CI runs it, `--repo . --artefact`, which asserts the tracked `.githooks/pre-commit` matches `.branch-guard`. Plain `--repo .` checks only this clone's `.git/hooks`.
- This repo is the expensive one. The a11y walk, the smoke walk, `look`, `tour-shots` and the update walk each drive a real browser. Run the narrowest thing that answers the question and re-render only what changed.
- Privacy: CI checks the hub out and runs the canonical `privacy-check.mjs`. `test/privacy.test.ts` mirrors the patterns so plain `npm test` fails offline too. Prove a gate with a local plant, never a pushed one.
- The help gates:
  - `manual.mjs --check` proves `public/manual.html` matches `docs/manual.md`.
  - `manual-coverage.mjs` proves every surface the app has is named there.
  - `tools/help-check.mjs` (`npm run help:check`) reads each app set from the source that defines it (sort routes from `clarify.ts`, container words from `tree.ts`, kind words from `kind-words.ts`, destinations and the tree label from `index.html`) and holds each help surface to the sets it declares, in both directions. It also asserts that every page the app links to is precached, from the links.
  - An old name a page still mentions is wrapped in `<span data-was>`, per mention.
- The flowcharts: `docs/paths.html` is the source. `public/paths.html` and `public/paths.css` are the shipped page, split by `tools/paths.mjs` and gated by `paths:check`, because the CSP is `style-src 'self'; font-src 'self'` and the source carries no webfont. They are linked from Help, not the footer.
- `tools/pages-a11y.mjs` (`npm run pages:a11y`) measures every hosted page the app links to, only when one changes. Each is stamped in `.pages-a11y-stamp`, and the walk runs under the real headers. The population is derived from `index.html`. `plan.html` is `noindex` and linked from nowhere. Inline citation links are exempt under WCAG 2.5.8.
- The deployed host: `tools/deployed-check.mjs` (`npm run deployed:check`, `-- --prod`) reads what the host serves and compares it to the tree. An unreachable host is a SKIP, never a failure, so it is not a Spine step. Node's `fetch` needs `NODE_USE_ENV_PROXY=1` at startup, so the tool re-execs itself. A 200 proves nothing, because Cloudflare serves the root document for any unknown path, so it compares against the host's own root document.

## Rules specific to this app
- **The condition framing widens what may be researched. It never relaxes a refusal.** Ordinary productivity research is built on streaks, gamification, priority ranking, nudges and completion metrics, all of which this app structurally may not do. A general-population finding may inform a design; it may never override a refusal that rests on a finding about this audience, and where the two conflict the narrower finding governs. A general-population result is averaged over people for whom the failure is cheap. The test before citing anything: would this finding have been measured on people for whom the failure it prevents is expensive? If not, it is background, not grounds.
- **Nothing personal about the owner ever lands in this repo.** No diagnosis, health fact or identity disclosure attached to the owner, in any file, commit message or PR body. This is a FAIL state, gated twice: the hub's `privacy-check.mjs` in CI, and `test/privacy.test.ts` under plain `npm test`. The product's framing and research about users as a population are fine. Design statements the owner makes stay recordable; who the owner is does not.
- **The ten product laws in `NOTES.md` are invariants.** Violating one is a defect, not a trade-off. Two carry teeth in code: no silent nodes (every node is on a surface, under a clock, on the Menu, or parented to something under a clock, and the write boundary refuses anything else) and no past bucket (a passed date auto-converts to a present replan card; there is no archive state).
- **No "overdue" anywhere**: not in the schema, a variable name or copy. One decay primitive, `(last_done, comfort_window, rising pressure)`, runs everything temporal. No streaks, ever.
- **Data is never lost to updates.** Append-only log, state = fold(log), additive-only migrations, an auto-export of a snapshot before any migration, and import always seeds a fresh store and never merges.
- **AI never blocks.** Every assisted flow has a working offline rung. Cloud rungs require explicit consent naming exactly what leaves the device.
- **Never use the GTD or Getting Things Done marks.** Trigger-list content must be original, because the published lists are copyrighted.
- **Voice:** adult, calm, shame-free, civilian. No military vocabulary in naming or brand copy. Never childlike or mascot-cute. No diagnosis-flavored copy, no sentiment scoring, no cause attribution.
- **No spiral anywhere**: not in the identity, a loading state or an illustration. A spiral is loss of control and is anxiety-laden; it is the shape of tightening inward with no way out. It belongs beside no red walls and no streaks as something the product structurally cannot say ([ADR-0025](docs/adr/0025-visual-identity.md)).
- **The voice rules bind the artwork, not only the words.** Check a mark against the audience's own vocabulary, not only against other logos. "What does this mean to the people who will use it" is the larger question than "does this look like something else".

## Reading a diagnostic back
The report leads with "No copy has ever left this device" whenever there is no export. That line is for a reader of the app, not for the person building it. Read the store's shape out of a diagnostic and skip that line. The same goes for any other WHAT IS WRONG entry that is a consequence of testing: a fresh store, no journal, an unpaired device.

## The closing question
A report from this repo closes on what ended the day. A promote and a device pass are a status line at most, never the question. The Block register in `NOTES.md` takes the shape and class of what blocked a day, never an instance; the instance stays outside the repo. `tools/blocks.mjs` refuses an empty register. It is exempt from the Spine today and joins it in the commit that adds the first entry, when the exemption line is deleted.

## Accessibility
WCAG 2.2 AA target, COGA-informed. [`ACCESSIBILITY.md`](ACCESSIBILITY.md) is the append-only register and records the design-time color bindings; read it before writing any UI. Pressure and decay never ride on hue. The contrast gate is computed in CI, and new foreground/background pairs are added to the gate in the same commit that introduces them.

## Repo metadata
Description, website, topics and social preview are GitHub-UI steps the session cannot perform. List the exact values and ask the owner to confirm each. Never report the repo set up while any is unconfirmed.

## Where things are
- `NOTES.md`: thesis, product laws, v1 scope, open questions, the Block register.
- `docs/adr/`: the settled decisions.
- `docs/`: the event vocabulary, verifications, code map, manual, flowchart source.
- `tools/`: the gates and renderers. `.spine-exempt` lists what no workflow runs, and why.
- `ACCESSIBILITY.md`: the accessibility register.
- `CHANGELOG.md`: written from `src/ui/changelog.ts`.
- `test/`: the unit tests, including `test/privacy.test.ts`.
- The hub at /root/.claude/hub: `plans/native/` (the short page, the roles, the procedures), `DOCTRINE.md` with `doctrine/never.md` and `doctrine/apps.md`, `REPOS.md`, and `LESSONS.md` (append to it from this repo's sessions, never copy it).
