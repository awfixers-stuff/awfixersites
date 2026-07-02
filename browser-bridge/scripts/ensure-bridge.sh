#!/usr/bin/env bash
# Idempotently start the extension WebSocket bridge (127.0.0.1:18793).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

QUIET=0
if [[ "${1:-}" == "--quiet" ]]; then
  QUIET=1
fi

if [[ "${QUIET}" -eq 1 ]]; then
  bun "${BRIDGE_ROOT}/mcp/src/ensure-bridge-cli.ts" >/dev/null
else
  bun "${BRIDGE_ROOT}/mcp/src/ensure-bridge-cli.ts"
fi