#!/usr/bin/env bash
# Persistent HTTP MCP gateway for the AWFixer Browser Bridge extension.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=lib/token.sh
source "${SCRIPT_DIR}/lib/token.sh"

if ! browser_bridge_load_token "${BRIDGE_ROOT}"; then
  browser_bridge_ensure_token "${BRIDGE_ROOT}"
  echo "Generated bridge token. Copy it into the extension popup:"
  echo "${BROWSER_BRIDGE_TOKEN}"
  echo ""
fi

PORT="${BROWSER_BRIDGE_MCP_PORT:-18794}"
PID_FILE="${BROWSER_BRIDGE_PID_FILE:-${XDG_RUNTIME_DIR:-/tmp}/browser-bridge-mcp-${UID}.pid}"
LOG_FILE="${BROWSER_BRIDGE_LOG_FILE:-${HOME}/.grok/logs/browser-bridge-mcp.log}"
HEALTH_URL="http://127.0.0.1:${PORT}/healthz"
MCP_URL="http://127.0.0.1:${PORT}/mcp"

mkdir -p "$(dirname "${LOG_FILE}")"

gateway_running() {
  if [[ -f "${PID_FILE}" ]]; then
    local pid
    pid="$(cat "${PID_FILE}")"
    if kill -0 "${pid}" 2>/dev/null; then
      if curl -sf --max-time 2 "${HEALTH_URL}" >/dev/null 2>&1; then
        return 0
      fi
    fi
  fi
  return 1
}

echo "Building extension (if needed)..."
(cd "${BRIDGE_ROOT}" && bun install && bun run build:extension)

bash "${SCRIPT_DIR}/ensure-bridge.sh"

if gateway_running; then
  echo "Browser Bridge MCP gateway already running (pid $(cat "${PID_FILE}"), ${MCP_URL})"
  exit 0
fi

echo "Starting Browser Bridge MCP gateway on port ${PORT}..."
echo "Gateway logs: ${LOG_FILE}"

nohup env BROWSER_BRIDGE_TOKEN="${BROWSER_BRIDGE_TOKEN:-}" bunx supergateway@latest \
  --stdio "env BROWSER_BRIDGE_TOKEN=${BROWSER_BRIDGE_TOKEN:-} bun ${BRIDGE_ROOT}/mcp/src/index.ts" \
  --port "${PORT}" \
  --outputTransport streamableHttp \
  --streamableHttpPath /mcp \
  --healthEndpoint /healthz \
  --logLevel none \
  >>"${LOG_FILE}" 2>&1 &

GATEWAY_PID=$!
echo "${GATEWAY_PID}" > "${PID_FILE}"

for _ in $(seq 1 30); do
  if curl -sf --max-time 1 "${HEALTH_URL}" >/dev/null 2>&1; then
    echo "Browser Bridge MCP gateway ready at ${MCP_URL} (pid ${GATEWAY_PID})"
    echo "Load unpacked extension from: ${BRIDGE_ROOT}/extension/dist"
    exit 0
  fi
  if ! kill -0 "${GATEWAY_PID}" 2>/dev/null; then
    echo "Gateway failed to start. Check ${LOG_FILE}" >&2
    rm -f "${PID_FILE}"
    exit 1
  fi
  sleep 0.5
done

echo "Gateway started but health check timed out. Check ${LOG_FILE}" >&2
exit 1