#!/bin/sh
# THE ACCESSIBILITY WALK IS RUN WHEN THE RENDERED APP CHANGES — enforced at the
# moment of the change, which is here.
#
# Declared by `also=` in .branch-guard, so `branch-guard.mjs` builds it into the
# generated pre-commit hook. It runs on EVERY commit, promotes included: this is
# about what is being committed, not about where.
#
# WHY. 2.23.1 moved three regions of the work surface, passed twenty-five static
# gates and the picture-taking walks, and went RED in CI on this one — because
# nothing had asked for it and every fast gate said yes. The specific hole was
# closed in `plain.mjs` the same day, but the general one cannot be: this walk
# measures contrast per state, focus rings, target separation, axe and the
# 320px/200% reflow, and none of that is readable from a file. LESSONS 126.
#
# WHY IT REFUSES RATHER THAN RUNNING THE WALK FOR YOU. Four minutes of browser
# inside a pre-commit hook is a hook people disable, and a disabled hook protects
# nothing. It names the one command — the same trade `tour-fresh.sh` makes.
#
# NODE IS REQUIRED AND ITS ABSENCE IS A FAILURE, never a skip. A check that
# quietly stops running is the fail-open this whole mechanism exists to avoid.

if ! command -v node >/dev/null 2>&1; then
  echo "" >&2
  echo "  REFUSED — a11y-fresh needs node and cannot find it." >&2
  echo "  A check that skips itself when its tool is missing is not a check." >&2
  echo "" >&2
  exit 1
fi

exec node tools/a11y-fresh.mjs --staged
