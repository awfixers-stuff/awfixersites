#!/usr/bin/env bash
# Grok/Cursor stdio MCP entrypoint. index.ts auto-starts the WebSocket bridge on connect.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=lib/token.sh
source "${SCRIPT_DIR}/lib/token.sh"

if ! browser_bridge_load_token "${BRIDGE_ROOT}"; then
  browser_bridge_ensure_token "${BRIDGE_ROOT}"
fi

export BROWSER_BRIDGE_TOKEN
exec bun "${BRIDGE_ROOT}/mcp/src/index.ts"