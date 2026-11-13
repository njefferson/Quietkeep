#!/bin/bash
# Calls the hub's stop-guard.mjs at its kept path, which since 12 November 2026
# is a shell that never refuses a stop; it exits 0 when the hub is absent.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
[ -f /root/.claude/hub/stop-guard.mjs ] || exit 0
exec node /root/.claude/hub/stop-guard.mjs
