#!/usr/bin/env bash
set -euo pipefail

PORT="${BROWSER_BRIDGE_MCP_PORT:-18794}"
BRIDGE_PORT="${BROWSER_BRIDGE_PORT:-18793}"
PID_FILE="${BROWSER_BRIDGE_PID_FILE:-${XDG_RUNTIME_DIR:-/tmp}/browser-bridge-mcp-${UID}.pid}"

echo "MCP gateway (HTTP): http://127.0.0.1:${PORT}/mcp"
echo "Extension bridge (WS): ws://127.0.0.1:${BRIDGE_PORT}/extension"

if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  echo "Gateway pid: $(cat "${PID_FILE}")"
else
  echo "Gateway: not running"
fi

BRIDGE_LOG="${BROWSER_BRIDGE_BRIDGE_LOG_FILE:-${HOME}/.grok/logs/browser-bridge-ws.log}"
MCP_LOG="${BROWSER_BRIDGE_LOG_FILE:-${HOME}/.grok/logs/browser-bridge-mcp.log}"

curl -sf "http://127.0.0.1:${BRIDGE_PORT}/healthz" 2>/dev/null | jq . || echo "Extension bridge: unreachable"
curl -sf "http://127.0.0.1:${PORT}/healthz" 2>/dev/null | jq . || echo "MCP gateway health: unreachable"

echo ""
echo "Logs:"
echo "  Bridge: ${BRIDGE_LOG}"
echo "  MCP:    ${MCP_LOG}"
echo ""
echo "Recent bridge logs (in-memory):"
curl -sf "http://127.0.0.1:${BRIDGE_PORT}/logs?limit=10" 2>/dev/null | jq '.logs[] | "\(.ts) [\(.level)] \(.component): \(.msg)"' -r || echo "  (unavailable)"