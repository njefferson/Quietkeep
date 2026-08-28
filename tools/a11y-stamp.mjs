#!/usr/bin/env node
// THE A11Y WALK'S RECEIPT — 2026-08-22.
//
// 2.23.1 moved three regions of the work surface, passed all twenty-five static
// gates, and went RED in CI on the accessibility walk. The walk had not been run
// locally, because nothing asked for it and the fast gates all said yes.
//
// LESSONS 126: when a gate exists in a fast form and a slow form, a session runs
// the fast one and reasons from a docstring describing the slow one. The
// missing static direction was added to `plain.mjs` in the same release, and
// that closes THAT hole — but it does not close the general one, which is that
// the walk measures rendered states no static read can reach: contrast per
// state, focus rings, target separation, axe, the 320px/200% reflow.
//
// So the walk leaves a receipt. `a11y.mjs` writes this file on a clean run,
// stamped with a hash of the same UI sources `tour-shots.mjs` watches, and
// `tools/hooks/a11y-fresh.sh` refuses a commit that changes those sources while
// the stamp still records the old ones.
//
// SHAPED EXACTLY LIKE THE TOUR GUARD, deliberately — same sources, same staged
// check, same refusal rather than doing four minutes of browser inside a hook.
// A pre-commit hook that silently spends four minutes is a hook people disable,
// and a disabled hook protects nothing. It names the one command.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * EVERYTHING THAT CAN CHANGE A RENDERED STATE — which is not the same list
 * `tour-shots.mjs` watches, and the first version of this file borrowed that
 * one by mistake.
 *
 * Tour-shots watches five files because those are what its ten PHOTOGRAPHS are
 * of. The a11y walk measures every state in the app: contrast per state, focus
 * rings, target separation, axe, the 320px-at-200% reflow. Any module that
 * renders can break any of those.
 *
 * Caught by noticing rather than by a failure: 2.25.0 changed a standing line
 * rendered from `src/ui/app.ts`, which was not on the borrowed list, so the
 * receipt would have stayed valid across a change to what a reader sees. A
 * guard whose input set is narrower than the thing it guards is a guard with a
 * hole in the middle, and it reports green through it.
 *
 * The cost is real and accepted: nearly every product commit now needs the
 * walk. That is four minutes against what 2.23.1 cost, which was a red CI, a
 * follow-up release, and a filter shipped into the mode built for the worst day.
 */
/**
 * WIDENED FROM `src/ui/` TO ALL OF `src/` ON 2026-08-28, and it is the same hole
 * this docstring already describes one level up.
 *
 * The list was every `.ts` under `src/ui/`. But the words on the screen are not
 * all written there: `offer.ts` owns the line above the list of things you could
 * pick up, `nextup.ts` owns every reason a card gives, `log-words.ts` owns the
 * history, `held.ts` owns the holding line. 3.8.0 changed a rendered sentence in
 * `src/offer.ts` and this receipt could not see it — so the walk's own guarantee
 * would have carried across a change to what a reader reads.
 *
 * The honest input set is the bundle's input set. `public/app.js` is generated
 * from all of `src/` and IS what the walk serves, which is exactly why
 * `bundle-fresh.mjs` compares the bundle against the newest file under `src/`
 * and not under `src/ui/`. Two guards on one artefact disagreeing about what
 * feeds it is how one of them ends up with the hole.
 *
 * The cost goes up and is accepted, on the same terms as before: a change to a
 * module that renders nothing now asks for the walk too. A guard whose input set
 * is narrower than the thing it guards reports green through the gap, and this
 * file's own comment says so about the previous version of this list.
 */
export const uiSources = () => {
  const out = [];
  const walk = (rel) => {
    for (const e of readdirSync(join(ROOT, rel), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (e.isDirectory()) walk(join(rel, e.name));
      else if (e.name.endsWith('.ts')) out.push(join(rel, e.name));
    }
  };
  walk('src');
  return ['public/index.html', 'public/app.css', ...out];
};

/** Kept as a name for the two callers that print it. */
export const UI_SOURCES = uiSources();

export const STAMP = join(ROOT, '.a11y-stamp');

export const uiHash = () => {
  const h = createHash('sha256');
  for (const rel of UI_SOURCES) h.update(readFileSync(join(ROOT, rel)));
  return h.digest('hex').slice(0, 16);
};

export const readStamp = () => {
  if (!existsSync(STAMP)) return null;
  return (readFileSync(STAMP, 'utf8').match(/^ui=([0-9a-f]+)$/m) ?? [])[1] ?? null;
};

/**
 * Written only after a walk with zero failures. A receipt for a run that failed
 * would be a lie, and a lie in a stamp file is invisible.
 *
 * TAKES THE HASH AS AN ARGUMENT SINCE 2026-08-28, and the caller reads it at
 * the START of the walk. It used to compute the hash HERE, at the end — so a
 * source file edited during the four minutes the browser was running got
 * certified by a walk that had never seen it. That is not hypothetical: it
 * happened on 3.8.0, to the release notes, while the walk that would have
 * measured them was already halfway through.
 *
 * Passing the start hash makes the failure visible instead of silent — the
 * stamp records what was actually walked, the tree no longer matches it, and
 * `a11y-fresh.mjs` refuses the commit and asks for another walk. Which is
 * correct: the tree on disk was never measured.
 */
export const writeStamp = (hash = uiHash()) => {
  writeFileSync(STAMP, `# Written by tools/a11y.mjs after a clean run. Not hand-edited.\nui=${hash}\n`);
};
