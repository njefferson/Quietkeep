#!/bin/sh
# THE BLOCK THAT SAYS WHERE THE BRANCHES ARE IS CHECKED AT THE COMMIT.
#
# Declared by `also=` in .branch-guard, so `branch-guard.mjs` builds it into the
# generated pre-commit hook. It runs on EVERY commit, promotes included: this is
# about what is being committed, not about where.
#
# WHY. NOTES.md's branch-state block has named the wrong versions three times —
# through eighteen releases and five promotes — and nothing ever found it. The
# first was caught by a gate somebody has to remember to run, the second by a
# lesson arriving from another repo, the third only because a production version
# came back from the device and the block had to be opened to record it. A line
# that looks maintained is the one nobody re-reads.
#
# WHY HERE AND NOT IN THE SPINE. It compares the production line against
# `origin/main` as of this moment, which is what production serves while you
# work. On a runner at the promote, `origin/main` is already the merge, so the
# step would be red by construction on every promote. `tools/branch-state-check.mjs`
# says this at length; the short version is that CI is the wrong clock for it.
#
# IT IS MILLISECONDS. Two file reads and a `git show` — unlike its two
# neighbours here, it has no reason to refuse rather than do the work, so it
# does the work.
#
# NODE IS REQUIRED AND ITS ABSENCE IS A FAILURE, never a skip. A check that
# quietly stops running is the fail-open this whole mechanism exists to avoid.

if ! command -v node >/dev/null 2>&1; then
  echo "" >&2
  echo "  REFUSED — branch-state needs node and cannot find it." >&2
  echo "  A check that skips itself when its tool is missing is not a check." >&2
  echo "" >&2
  exit 1
fi

exec node tools/branch-state-check.mjs
