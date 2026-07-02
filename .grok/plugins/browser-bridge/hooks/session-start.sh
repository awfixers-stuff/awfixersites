#!/usr/bin/env bash
# Start the extension WebSocket bridge early so Chrome can connect before the first tool call.
set -euo pipefail

PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-}"
if [[ -z "${PLUGIN_ROOT}" ]]; then
  exit 0
fi

REPO_ROOT="$(cd "${PLUGIN_ROOT}/../../.." && pwd)"
ENSURE_CLI="${REPO_ROOT}/browser-bridge/mcp/src/ensure-bridge-cli.ts"

if [[ ! -f "${ENSURE_CLI}" ]]; then
  echo "Browser Bridge plugin: ensure script not found at ${ENSURE_CLI}" >&2
  exit 0
fi

if bun "${ENSURE_CLI}" >/dev/null 2>&1; then
  echo "Browser Bridge: WebSocket bridge ready (ws://127.0.0.1:18793/extension)."
  echo "Load unpacked extension from ${REPO_ROOT}/browser-bridge/extension/dist if needed."
else
  echo "Browser Bridge: failed to start WebSocket bridge — check ~/.grok/logs/browser-bridge-ws.log"
fi