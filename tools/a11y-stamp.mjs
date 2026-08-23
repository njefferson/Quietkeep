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
export const uiSources = () => {
  const dir = join(ROOT, 'src', 'ui');
  const ui = readdirSync(dir).filter((f) => f.endsWith('.ts')).sort()
    .map((f) => join('src', 'ui', f));
  return ['public/index.html', 'public/app.css', ...ui];
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

/** Written only after a walk with zero failures. A receipt for a run that
 *  failed would be a lie, and a lie in a stamp file is invisible. */
export const writeStamp = () => {
  writeFileSync(STAMP, `# Written by tools/a11y.mjs after a clean run. Not hand-edited.\nui=${uiHash()}\n`);
};
