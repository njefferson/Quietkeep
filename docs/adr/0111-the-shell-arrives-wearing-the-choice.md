# ADR-0111 · The shell arrives wearing the reader's choice, rather than correcting itself after

**Status:** Accepted · **Date:** 2026-08-26 ·
**Removes the cold-start flash of palette and mode** ·
**Touches:** [0002](0002-storage-dexie-indexeddb.md), [0110](0110-colour-is-checked-by-arithmetic.md) ·
**Cites:** hub `PALETTES.md`, hub LESSONS 142

## Decision

The service worker reads the reader's palette and mode out of IndexedDB and
writes them onto `<html>` in the bytes it serves, so both are correct on the
**first painted pixel**. The app's own `applyPalette` and `applyTheme` still run
and still own every later change; this is only about the first frame.

## The problem, and why it was called unfixable

Storage is IndexedDB (ADR-0002; `localStorage` is banned outright). IndexedDB is
asynchronous, so nothing could know which colours to wear until after the page
had already painted. Every cold start showed one beat of the default palette,
then settled to the choice.

That was recorded, in a shipped release note and in NOTES, as impossible to fix
"without storing the choice somewhere this app deliberately does not store
things". **That is true of `localStorage` and false in general.** A service
worker can read IndexedDB, and this app already has one serving the shell on
every launch. The reasoning had stopped at the first candidate.

**Measured, and it was two flashes rather than one.** On a device set to dark
with `light` chosen, `data-theme` was likewise absent when `<html>` was parsed —
so the mode flashed too, and day-to-night is a larger event than cream-to-paper.
Both come from the same read, so both are fixed by it.

## What was rejected

**A cover painted over the app until the read lands.** It trades a hue settle for
a blank screen — worse in light mode, where the veil is the bigger event — delays
first paint for everyone on a cold start, and introduces a failure mode where a
store that throws leaves the app blank until a timeout rescues it. The worker is
earlier than any veil can be: the attribute is in the markup before the parser
reaches `<head>`.

**The choice in `start_url` or a per-palette manifest.** It works, and it goes
stale the moment somebody changes their mind after installing — the shortcut
cannot be rewritten. The store stays the single source of truth instead.

That second one is not closed for the SPLASH SCREEN, which is a different
problem: an installed app's splash colour comes from the manifest captured at
install time and nothing the app does later can change it. Fixing that needs a
per-palette manifest chosen before the shortcut is saved, and rests on iOS
behaviour that must be measured on a device rather than assumed.

## How it is kept honest

- **The store is read, never created.** `indexedDB.open` on a name that does not
  exist CREATES it — an empty v1 with no object stores — and Dexie opening after
  that at v2 would run only the v2 upgrade, leaving `events` and `snapshots`
  absent and a first-ever visitor with a broken app. Hence the `databases()`
  guard, and an abort in `onupgradeneeded` behind it in case the two race.
- **Every failure path serves the shell exactly as before.** No store, no key, an
  unknown value, a throw, or a read slower than 250ms all resolve to "no choice",
  which is what a first visit legitimately is.
- **A value not on a known list never reaches the markup.** The worker holds the
  choosable families, and `npm run palettes:check` holds that list to
  `docs/palettes.json` in BOTH directions — a family missing from the worker
  would silently keep the flash for anyone who chose it; a name with no family
  behind it would be an injection site with no source.
- **The four constants it copies out of `src/` are checked against their
  sources.** The database name was written as `planner` first, which is
  `DexieLogStore`'s own default while the app passes `quietkeep`. Nothing throws
  when that is wrong: every path resolves to "no choice" and the feature does
  nothing at all on every launch, looking perfectly healthy.
- **The cached shell stays undressed.** The attribute goes on at SERVE time, so a
  reader who changes their mind is not served last week's choice out of a cache
  nobody thought to invalidate.
- **`color-scheme` follows `data-theme` in the stylesheet**, because the worker
  cannot add an inline style without risking a second `style` attribute. Without
  it an injected mode would fix the page and leave every `<select>`, date box and
  `<textarea>` painted for the device's mode for one beat — 3.3.0's defect back
  again, on the setting that exists to prevent it.

## The assertion, and why its timing is the whole thing

`tools/update-walk.mjs` step 8. Reading the attribute after the app has booted
proves **nothing**: the app sets both itself, so that check passes whether or not
the worker exists. The question is entirely *when*.

An init script runs BEFORE the document exists, so `document.documentElement` is
null there — the first version of this recorded an exception and would have
called a working fix broken. A `MutationObserver` on `document` fires the moment
`<html>` is appended, which is the moment the parser has read its attributes and
is the earliest observable point there is.

It asserts four things: a first visit is served undressed, a choice is on `<html>`
at parse time, the mode likewise on a device set to the other one, and the cached
copy stays neutral. Planted by disabling the injection; the two parse-time
assertions went red and the other two stayed green.
