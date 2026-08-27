# CLAUDE.md — Quietkeep

> **Inherits the Universal App Doctrine** — the canonical copy lives in the hub
> repo at [`njefferson/noahjefferson/DOCTRINE.md`](https://github.com/njefferson/noahjefferson/blob/main/DOCTRINE.md).
> It is the single source of truth for the rules shared across all of the owner's
> apps: product values, taste, accessibility, honesty, verification, release
> discipline & taxonomy, licensing (PolyForm Noncommercial), privacy, the
> permanent **AskUserQuestion ban** (§0), and the **repo-metadata confirm rule**
> (§10). **Where anything below overlaps the Doctrine, the Doctrine wins.** This
> file keeps only what is specific to this repo. Never fork the doctrine here —
> link to it. The cross-app [`LESSONS.md`](https://github.com/njefferson/noahjefferson/blob/main/LESSONS.md)
> lives in the hub too; append to it from this repo's sessions, never copy it.

## What this repo is
**Quietkeep** — a free, local-first planner for neurodivergent users. Static PWA,
no accounts, no telemetry, no server-side user data. Deployed to Cloudflare Pages.

Tagline: *"Out of sight. Never out of mind."*
Epigraph: *"It holds the rest, so you can rest."*

## Read these first, in this order
1. [`NOTES.md`](NOTES.md) — the repo source of truth: thesis, the ten product
   laws, the frozen v1 scope, open questions, Project facts.
2. [`docs/adr/`](docs/adr/) — every settled architectural decision, one per file.
3. [`docs/event-vocabulary.md`](docs/event-vocabulary.md) — the complete event
   noun list. **All application state folds from this.** Nothing is stored that
   is not an event named here.
4. [`docs/verifications.md`](docs/verifications.md) — what has actually been
   checked and what merely looks checked. Consult before assuming a platform fact.

## The credit is the owner's money (Doctrine §11b)
A session cannot see billing, the plan, the balance, or what a turn cost, so no
warning will ever arrive and the restraint is unconditional. **This repo is the
expensive one** — the a11y walk, the smoke walk, `look`, `tour-shots` and the
update walk each drive a real browser, and the full Spine is minutes of compute.
Run the narrowest thing that answers the question (`--only=`, one grep, one
`sed -n` range), re-render only what changed, and **say what a long run will
cost before starting it**. *Continue* resumes the work in front of you; it is
not authority to start a sweep of your own. Mechanical work — find-and-replace,
classifying a list against a stated rule, running a gate and reporting its exit
code — goes to a cheaper model in a subagent. Top tier is for judgement.

## An approved plan is authority for all of it (Doctrine §11c)
Finishing one phase of a multi-phase plan and going idle to be told to continue
is doing a fraction of what was asked. **Report what landed and start the next
piece in the same turn.** If you genuinely must stop, the FIRST line says so in
those words — *stopping here, waiting on you for X* — because "I'll hold" at the
end of a long report reads as "I am continuing", and the silence gets discovered
by being asked what happened. It happened three times in one session, twice
after the behaviour had been ruled out. This does not license a sweep of your
own: §11b still binds, and the authority is the plan's remaining phases.

**It is enforced by the harness now, because the paragraph did not hold.** It
was broken a fourth time by the session that wrote it, on the sentence "I'm
waiting on it". `.claude/hooks/stop-guard.sh` runs the hub's `stop-guard.mjs`
as a `Stop` hook and REFUSES a turn that ends while saying something is still
running without opening with the declaration. Wait for the thing and carry on;
that is the way past it, and it is the one that was wanted all along.

## Rules specific to this app
- **NOTHING PERSONAL ABOUT THE OWNER EVER LANDS IN THIS REPO — a FAIL state**
  (the owner's instruction, 2026-08-04). No diagnosis, health fact, or identity
  disclosure attached to the owner, in any file, commit message, or PR body. The product's framing ("for neurodivergent users") and research
  about users as a population are fine; a sentence linking THE OWNER to any of it is
  not. A HARD gate per Doctrine §9b, twice over: the Spine checks the hub out
  and runs the canonical `privacy-check.mjs` (a pattern widened in the hub
  binds here on the next push, with no copy to drift), and
  `test/privacy.test.ts` mirrors the patterns so plain `npm test` fails
  offline too. Design statements the owner makes stay recordable; who the owner
  is does not.
- **The ten product laws in `NOTES.md` are invariants.** Violating one is a
  defect, not a trade-off. Two carry teeth in code: *no silent nodes* (every node
  is on a surface, under a clock, on the Menu, or parented to something under a
  clock — the write boundary refuses anything else) and *no past bucket* (a
  passed date auto-converts to a present replan card; there is no archive state).
- **No "overdue" anywhere** — not in the schema, not in a variable name, not in
  copy. One decay primitive `(last_done, comfort_window, rising pressure)` runs
  everything temporal. No streaks, ever.
- **Data is never lost to updates.** Append-only log, state = fold(log),
  migrations additive-only, auto-export a snapshot before any migration, import
  always seeds a fresh store and never merges.
- **AI never blocks.** Every assisted flow has a working offline rung. Cloud
  rungs require explicit consent naming exactly what leaves the device.
- **Never use the GTD®/Getting Things Done® marks.** Trigger-list content must be
  original — the published lists are copyrighted.
- **Voice:** adult, calm, shame-free, civilian. No military vocabulary in naming
  or brand copy. Never childlike or mascot-cute. No diagnosis-flavoured copy, no
  sentiment scoring, no cause attribution.
- **No spiral. Anywhere.** Not in the identity, not in a loading state, not in an
  illustration. **A spiral is loss of control and it is anxiety-laden** — it is the
  shape of tightening inward with no way out, and it names the condition this app
  meets people in. It belongs beside *no red walls* and *no streaks* as something
  the product structurally cannot say ([ADR-0025](docs/adr/0025-visual-identity.md)).
- **The voice rules bind the artwork, not only the words.** Check a mark against
  the audience's own vocabulary, not only against other logos. "Does this look like
  something else" is a collision check, and it is a lesser question than "what does
  this mean to the people who will use it".
- **Storage is IndexedDB via Dexie.** `localStorage` is banned outright.

## Never relay the export warning when reading a diagnostic back
The report leads with **"No copy has ever left this device"** whenever there is
no export. That line is for a READER of the app. It is not news to the person
building it, who is testing on throwaway stores and knows exactly what clearing
site data does.

Repeating it is nagging about a decision already made, which is the shape this
product refuses everywhere else. **Read the store's SHAPE out of a diagnostic
and skip that line.** The same goes for any other WHAT IS WRONG entry that is a
consequence of testing rather than a defect — a fresh store, no journal, an
unpaired device.

## Branches & releases
`staging` and `main` only. Ignore any harness-designated `claude/*` branch
(Doctrine §11). Every product change lands on `staging` and waits for the owner's
on-device pass and an explicit "promote" (Doctrine §7). Docs-only changes — this
file, `NOTES.md`, `ACCESSIBILITY.md`, anything in `docs/` — may skip the staging
gate.

Release taxonomy and the `version.capability.iteration` triplet are Doctrine §7.
The service-worker cache name carries the same triplet and is bumped with it.

## The commit guards, and what each one is allowed to demand
`.branch-guard` declares them with `also=`, so they run on EVERY commit —
promotes included, because they are about WHAT is being committed.

**`tour-fresh` was one of these and is not any more (2026-08-27).** It hashed five
WHOLE FILES — `public/index.html`, `public/app.css`, `src/ui/work.ts`,
`src/ui/clarify.ts`, `src/ui/about.ts` — for ten photographs of six surfaces.
Measured: a **comment-only** change to `public/app.css`, staged, refused the
commit and demanded a minute of browser, for an edit that cannot alter a single
pixel of any picture. `npm run tour:check` is a Spine step (`spine.yml:318`) and
the Spine runs before a push, so nothing reaches production stale that was not
already going to. **A guard whose trigger is wider than its output spends
somebody's time to protect nothing, and it is the guard people learn to route
around** — which is what makes it worse than no guard.

**`escape-also=QUIETKEEP_DEFER` is the named way past what remains.** Not
because the checks are optional, but because without a named door the door is
`--no-verify`, and that switches off the BRANCH rule too. It prints what it
deferred, and both remaining checks are also CI steps, so it moves WHEN the work
happens and never WHETHER.

- **`tools/hooks/a11y-fresh.sh`** — a commit that changes the rendered app while
  `.a11y-stamp` still records the previous markup is refused. **2.23.1 passed
  twenty-five static gates and both picture-taking walks and went RED in CI on
  the a11y walk**, which had never been run locally because nothing asked for
  it. `npm run a11y` writes the receipt itself, and only on a clean run, so a
  failing walk cannot be stamped. About four minutes. (Hub LESSONS 126.)

Note it is **lenient on `staging` and refuses only on `main`** — a note there,
a refusal at the promote. That is worth knowing before diagnosing which guard is
costing you something: on work commits it has never been the one.

They name the one command instead of spending minutes inside a hook, because a
hook that silently spends four minutes is a hook somebody disables.

## The help is held to the app that exists — three gates, not one
`manual.mjs --check` proves `public/manual.html` matches `docs/manual.md`.
`manual-coverage.mjs` proves every surface the app has is named there and every
surface the manual claims exists. **Neither reads the words ON the controls, and
neither looks at the walkthrough or the flowcharts at all** — so 3.6.1 renamed
one control and left three help surfaces naming a button that no longer existed,
every one of them freshly generated and fully covered.

[`tools/help-check.mjs`](tools/help-check.mjs) (`npm run help:check`) closes it.
Each app SET is read from the source that defines it — the sort routes from
`clarify.ts`, the container words from `tree.ts`, the kind words from
`kind-words.ts`, the destinations and the tree label from `index.html` — never
restated in the gate, because a list typed into a checker is the second copy the
checker exists to prevent. Then, both directions: every label appears verbatim in
each surface DECLARED to carry that set, and no surface says a retired name.

**Coverage is declared, not swept.** "Every label in every help file" is false —
the walkthrough is six screens and must not enumerate the app. A gate that fires
on honest prose is one people route around (`privacy-check.mjs`'s own lesson), so
each surface names the sets it reproduces and is held to those exactly.

**A help page may say what a thing used to be called** — somebody who learned the
old name needs the bridge. Wrap it in `<span data-was>`. Per-mention and visible
in the markup, never a whole-file pass: a file-level exemption is where this
repo's privacy gate found its material collecting.

Its first run found four things, two of which were the declarations being wrong
rather than the pages. Planted three ways before landing.

## The flowcharts ship, and are measured only when they change
**[`docs/paths.html`](docs/paths.html) is the SOURCE** — authored, self-contained,
one file with its styles inline, which is what an Artifact has to be.
**`public/paths.html` + `public/paths.css` are the SHIPPED page**, split out by
[`tools/paths.mjs`](tools/paths.mjs) and gated by `paths:check`. The split is not
tidiness: the site's CSP is `style-src 'self'; font-src 'self'`, so an inline
`<style>` is refused and a webfont never loads. `thesis.mjs` learned that in
1.7.2 when the first deployed thesis shipped unstyled. **The source therefore
carries no webfont at all** — the sans-display/serif-body pairing runs on faces
every device already has, and the page makes no network request.

It reuses `doc-page.mjs`'s `page()` rather than a second shell, and is linked
from **Help**, not the footer: three links in that footer line wrapped at phone
width into two 44px boxes stacked with no gap, which the a11y walk refused as a
mis-tap. That line's own comment already recorded it sitting one over its ceiling.

**[`tools/pages-a11y.mjs`](tools/pages-a11y.mjs) (`npm run pages:a11y`) measures
EVERY hosted page, and only when one changes.** A static document shares no code
with the app and cannot regress from an app change, so re-walking them every run
would buy nothing. Each is stamped in `.pages-a11y-stamp` on its own content —
the page plus the stylesheets it links, parsed from the page — so changing one
walks one and the rest print as unchanged. It serves them under the REAL headers
and injects axe as a same-origin file, because `script-src 'self'` refuses both
forms of inline injection, and a walk under a relaxed CSP is not a walk of the
page that ships.

**The population is what the app LINKS to**, derived from `index.html`, not
listed. `plan.html` is `noindex` and linked from nowhere, and its own header says
it is "a working page for one reader, not a surface … if it ever gains a route
from the app it becomes a surface and joins that list in the same commit".
Deriving from the links honours that automatically; a hand-written exception
would have to be remembered.

**`manual.html` and `why.html` had shipped since 2.29.0 unmeasured** — the app
walk never looked at them and nothing else did. Both pass.

**Two things its own first runs found, and the second matters more.** On the
flowcharts, links at 16–21px against the 24px floor — a real defect, fixed. On
the two older pages, four links flagged that were **citations inside sentences**
("…rather than by a sweep (ADR-0011)."). WCAG 2.5.8 states an *Inline* exception
for exactly that, and padding a word mid-paragraph to satisfy a rule that does
not apply would have damaged the prose to please a gate. The check honours the
exception structurally now: `display: inline` plus a parent holding text that is
not the link. **A gate that fires on honest writing is worse than a miss** — it
trains somebody to change good pages.

**And every page the app LINKS to must be precached**, asserted by `help-check`
from the links rather than from a list: the worker maps a navigation to its own
cached body via `SHELL`, so a page left out does not merely miss offline, it
falls back to the app shell and lands the reader somewhere else (the 1.7.2
defect). `plan.html` passes by being `noindex` and linked from nowhere.

## Read the deployed host — you probably can
[`tools/deployed-check.mjs`](tools/deployed-check.mjs) (`npm run deployed:check`,
`-- --prod` for production and the sync edition) reads what the host actually
serves and compares it to this tree. NOTES carried "a session cannot read
production" as a standing fact with a *do not re-test* attached; that was true of
one container and is not true when the session has `*.pages.dev`. **Try it.**

**Reachability is session configuration, not a property of this tree**, so an
unreachable host is a SKIP with the reason printed, never a failure — which is
also why it is not a Spine gate (`.spine-exempt` says so).

Two traps it exists to have already fallen into:

- **Node's `fetch` does not read `HTTPS_PROXY`** unless `NODE_USE_ENV_PROXY=1`,
  read at STARTUP — in-process is too late. Without it every request returns 403
  with the proxy's allowlist message in the body, which reads exactly like the
  host being blocked while `curl` answers 200 for the same URL. The tool re-execs
  itself rather than depend on how it was invoked.
- **A 200 proves nothing.** Cloudflare serves the root document for any unknown
  path, so production answers 200 for `/paths`, which it does not have, with
  189KB of the app inside. It compares against the host's OWN root document —
  the first version used a typed `<title>`, which is the default edition's and
  not the sync edition's, and reported a page that was not there.

(Hub LESSONS 173.)

## Run the whole Spine before you push: `npm run spine`
It reads `.github/workflows/spine.yml` and runs every step of it, in order, on
this machine — no second list to go stale, so a step added to CI is run by it the
same day. **About eight minutes**, most of it the three browser walks; `--list`
shows what it would run, `--only a11y` runs one, `--from 20` picks up after a
failure. It keeps going past a failure, for the reason CI does, and **prints the
verdict last** so the bottom of the output is the answer.

It exists because there is no other way to know. There are around thirty gates,
and until this a session assembled the list by hand — so what it did not think of
did not get run, which is by definition the thing it forgot it had changed. On
one day that cost `size:check` going red for three releases that were pushed and
promoted anyway, and six waits in the smoke walk left asking the app for words it
had stopped saying. Both were found afterwards, by CI. (Hub LESSONS 139.)

**`npm run spine -- --parity` is the other direction**, and it is a Spine step
itself. The run above asks whether everything CI runs passes here; parity asks
whether CI runs everything there is. A gate written, wired into `package.json`
and never added to the workflow **looks exactly like a gate that is running**,
from every angle except this one. Every script is either run by a workflow or
declared in [`.spine-exempt`](.spine-exempt) with a reason, both directions
asserted, so an exemption cannot outlive what it exempts. It caught its own the
first time it ran. (Hub LESSONS 127.)

The steps it cannot run are PRINTED with the reason, never skipped in silence:
the checkout actions, `npm ci`, the browser install, and the hub gates, which run
from `../noahjefferson` here rather than from the CI-only `.hub-gates` checkout.
**Run those separately**, and note they do not all take the same argument:
`privacy-check`, `privacy-mirror-check`, `quote-check` and `branch-guard` take
`--repo .`; **`docs-check` takes a positional path** — `node
../noahjefferson/docs-check.mjs .` — and dies on `--repo`, which it reads as a
directory name.

**AND RUN `branch-guard` THE WAY CI RUNS IT: `--repo . --artefact`.** The two
spellings check different things and one passed while the other failed. Plain
asserts `.git/hooks/pre-commit` is installed and current — a fact about YOUR
clone. `--artefact` asserts the TRACKED `.githooks/pre-commit` matches
`.branch-guard`, which is what every other clone gets. A hub change to
`branch-guard.mjs` regenerates a different hook, so the tracked copy goes stale
while yours stays right: the escape added on 2026-08-27 was live locally and
missing from the tracked file, plain green, `--artefact` red, and CI found it.
The local Spine cannot help — that step is one of the twelve it prints as
CI-only.

## Accessibility
WCAG 2.2 AA target, COGA-informed. [`ACCESSIBILITY.md`](ACCESSIBILITY.md) is the
append-only register and it already records the design-time colour bindings —
read it **before** writing any UI. Pressure and decay never ride on hue; the
contrast gate is computed in CI and exits non-zero, and new foreground/background
pairs are added to the gate in the same commit that introduces them.

## Anything the owner pastes is a code block (Doctrine §2)
Handoff prompts, commands, configs, a message to send on — if the next thing
that happens to it is *copy*, it ships as **one fenced code block**, not prose,
not a blockquote, not styled markdown. Rendered formatting does not survive
being copied back out, and selecting prose by hand on an iPad is a fight. The
test is not "is it readable" but "what happens to it next".

## No tables, anywhere (Doctrine §2)
Markdown tables do not render on a real iPad — they arrive as pipes and dashes
and the content is lost. **Never put one in anything the owner reads**: chat, commit
messages, PR bodies, `NOTES.md`, `CHANGELOG.md`, plan files, or anything under
`docs/`. Headed lists or one fact per line instead. The repo was converted in
full on 2026-07-29; do not reintroduce one.

## Repo metadata (manual, confirm — see Doctrine §10)
Description / website / topics / social-preview are GitHub-UI steps the session
token cannot perform. List the exact values and ask the owner to confirm each; never
report Quietkeep "set up" while any is unconfirmed.
