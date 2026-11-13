#!/bin/bash
# Calls the hub's plan-guard.mjs, which refuses the choice popup (AskUserQuestion)
# in every repository and passes every other call. The payload is read once
# because a second read gets nothing. When no gate can be found it passes.
set -uo pipefail

# ONCE. The payload is consumed by the first reader; a second read gets nothing
# and every check silently evaluates empty (the trap in this API's own
# reference example).
PAYLOAD="$(cat)"

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || true
GATE=""
[ -f ./plan-guard.mjs ] && GATE=./plan-guard.mjs
[ -z "$GATE" ] && [ -f /root/.claude/hub/plan-guard.mjs ] && GATE=/root/.claude/hub/plan-guard.mjs

if [ -n "$GATE" ]; then
  printf '%s' "$PAYLOAD" | exec node "$GATE"
fi
exit 0
