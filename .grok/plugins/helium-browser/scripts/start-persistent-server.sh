#!/usr/bin/env bash
# Keeps a single helium-devtools-mcp process (and browser CDP session) alive.
# Grok connects via HTTP so new agent sessions do not re-trigger Helium approval dialogs.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

PORT="${HELIUM_MCP_PORT:-18791}"
PID_FILE="${HELIUM_MCP_PID_FILE:-${XDG_RUNTIME_DIR:-/tmp}/helium-mcp-gateway-${UID}.pid}"
LOG_FILE="${HELIUM_MCP_LOG_FILE:-${HOME}/.grok/logs/helium-mcp-gateway.log}"
HEALTH_URL="http://127.0.0.1:${PORT}/healthz"
MCP_URL="http://127.0.0.1:${PORT}/mcp"

mkdir -p "$(dirname "${LOG_FILE}")"

is_running() {
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

if is_running; then
  echo "Helium MCP gateway already running (pid $(cat "${PID_FILE}"), ${MCP_URL})"
  exit 0
fi

echo "Starting persistent Helium MCP gateway on port ${PORT}..."
echo "Logs: ${LOG_FILE}"

nohup bunx supergateway@latest \
  --stdio "bash ${PLUGIN_ROOT}/scripts/launch-mcp-inner.sh" \
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
    echo "Helium MCP gateway ready at ${MCP_URL} (pid ${GATEWAY_PID})"
    echo "Browser CDP session is held open by this process — approve Helium once if prompted."
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