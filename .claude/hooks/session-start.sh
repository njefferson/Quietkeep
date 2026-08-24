#!/bin/bash
# Printed into every session. Everything it says was already written down and
# none of it was being read — see noahjefferson/session-brief.mjs for why.
#
# The hub may not be checked out beside this repo. The brief SAYS SO when it is
# missing rather than staying quiet, which is the whole point: a session that
# does not know the doctrine could not be checked must not assume it was.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
# IS THIS CLONE THE ONE ON THE REMOTE? (3.0.1)
#
# The container re-cloned at a months-old commit THREE TIMES in one session.
# Each time the tree looked completely normal — a real repo, a real branch, tests
# that pass — and the work of the day was simply not in it. Twice it was measured
# against before anybody noticed, and once a merge was built on the stale tip
# that would have rewritten production history had it been pushed.
#
# Nothing about a stale clone announces itself. So ask, once, before the session
# has a chance to conclude anything from it. One fetch of one branch.
BR="$(git symbolic-ref --short HEAD 2>/dev/null || echo '')"
if [ -n "$BR" ]; then
  git fetch --quiet origin "$BR" 2>/dev/null || true
  BEHIND="$(git rev-list --count "HEAD..origin/$BR" 2>/dev/null || echo 0)"
  if [ "${BEHIND:-0}" -gt 0 ]; then
    echo ""
    echo "*** THIS CLONE IS STALE — $BEHIND commit(s) behind origin/$BR. ***"
    echo "    The tree looks normal and is not. Do not measure anything against"
    echo "    it, and do not build a merge on it. Catch up first:"
    echo ""
    echo "      git reset --hard origin/$BR"
    echo ""
  fi
fi

if [ -f ../noahjefferson/session-brief.mjs ]; then
  node ../noahjefferson/session-brief.mjs --repo . 2>/dev/null || true
  node ../noahjefferson/branch-guard.mjs --repo . --install >/dev/null 2>&1 || true
else
  echo "=== session brief · Quietkeep ==="
  echo ""
  echo "BRANCH: on $(git symbolic-ref --short HEAD 2>/dev/null || echo '(detached)'). Work commits to 'staging'; 'main' is production."
  echo ""
  echo "THE HUB IS NOT CHECKED OUT beside this repo, so the doctrine, the cross-app"
  echo "LESSONS record and the repo map are ALL UNAVAILABLE this session. Nothing has"
  echo "verified that this repo is current with any of them. Say so rather than"
  echo "assuming, and do not claim a hub gate ran."
fi
