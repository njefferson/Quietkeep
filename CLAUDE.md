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

## Two commit guards, and both refuse rather than doing the work for you
`.branch-guard` declares them with `also=`, so they run on EVERY commit —
promotes included, because they are about WHAT is being committed.

- **`tools/hooks/tour-fresh.sh`** — the walkthrough ships photographs of this
  app. A picture of a version that no longer exists is worse than none.
- **`tools/hooks/a11y-fresh.sh`** — a commit that changes the rendered app while
  `.a11y-stamp` still records the previous markup is refused. **2.23.1 passed
  twenty-five static gates and both picture-taking walks and went RED in CI on
  the a11y walk**, which had never been run locally because nothing asked for
  it. `npm run a11y` writes the receipt itself, and only on a clean run, so a
  failing walk cannot be stamped. About four minutes. (Hub LESSONS 126.)

Both name the one command instead of spending minutes inside a hook, because a
hook that silently spends four minutes is a hook somebody disables.

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

The steps it cannot run are PRINTED with the reason, never skipped in silence:
the checkout actions, `npm ci`, the browser install, and the hub gates, which run
from `../noahjefferson` here rather than from the CI-only `.hub-gates` checkout.
**Run those separately** — `privacy-check`, `privacy-mirror-check`, `quote-check`,
`docs-check` and `branch-guard`, each with `--repo .`.

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
