#!/bin/bash
# Printed into every session. Everything it says was already written down and
# none of it was being read — see noahjefferson/session-brief.mjs for why.
#
# The hub may not be checked out beside this repo. The brief SAYS SO when it is
# missing rather than staying quiet, which is the whole point: a session that
# does not know the doctrine could not be checked must not assume it was.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
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
