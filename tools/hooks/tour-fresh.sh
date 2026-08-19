#!/bin/sh
# THE WALKTHROUGH'S PICTURES ARE REGENERATED WHEN THE APP CHANGES — enforced at
# the moment of the change, which is here.
#
# Declared by `also=` in .branch-guard, so `branch-guard.mjs` builds it into the
# generated pre-commit hook. It runs on EVERY commit, promotes included: this is
# about what is being committed, not about where.
#
# WHY A HOOK AND NOT A NOTE. The walkthrough ships photographs of this app's own
# UI. A help screen illustrated with a version that no longer exists is worse
# than one with no pictures at all — writing that has gone stale reads as stale,
# and a screenshot reads as proof. The repo has found the same stale-record
# defect in four places, and the only thing that has ever actually stopped it is
# a check that runs whether or not anyone remembered it.
#
# WHY IT REFUSES RATHER THAN REGENERATING FOR YOU. Rendering ten pictures takes
# about a minute of browser. A pre-commit hook that silently spends a minute —
# or worse, hangs — is a hook people disable, and a disabled hook protects
# nothing. It names the one command instead.
#
# NODE IS REQUIRED AND ITS ABSENCE IS A FAILURE, never a skip. A check that
# quietly stops running is the fail-open this whole mechanism exists to avoid.

if ! command -v node >/dev/null 2>&1; then
  echo "" >&2
  echo "  REFUSED — tour-fresh needs node and cannot find it." >&2
  echo "  A check that skips itself when its tool is missing is not a check." >&2
  echo "" >&2
  exit 1
fi

exec node tools/tour-shots.mjs --staged
