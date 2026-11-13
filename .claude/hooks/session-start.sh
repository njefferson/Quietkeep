#!/bin/bash
# Prints the session brief. Runs the hub's session-brief.mjs and
# branch-guard.mjs --install from /root/.claude/hub, and says so when the hub
# is absent.
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

if [ -f /root/.claude/hub/session-brief.mjs ]; then
  node /root/.claude/hub/session-brief.mjs --repo . 2>/dev/null || true
  node /root/.claude/hub/branch-guard.mjs --repo . --install >/dev/null 2>&1 || true
else
  echo "=== session brief · Quietkeep ==="
  echo ""
  echo "BRANCH: on $(git symbolic-ref --short HEAD 2>/dev/null || echo '(detached)'). Work commits to 'staging'; 'main' is production."
  echo ""
  echo "THE HUB IS NOT INSTALLED at /root/.claude/hub, so nothing guards a push in this session."
  echo "Say so before any work, and commit and push nothing until the owner has answered."
fi
