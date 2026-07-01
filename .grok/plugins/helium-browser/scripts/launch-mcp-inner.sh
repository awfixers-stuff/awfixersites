#!/usr/bin/env bash
# Inner MCP server — started once by the persistent gateway, not by Grok directly.
set -euo pipefail

if [[ -z "${HELIUM_EXECUTABLE:-}" ]]; then
  HELIUM_EXECUTABLE="$(command -v helium 2>/dev/null || true)"
fi

if [[ -z "${HELIUM_USER_DATA_DIR:-}" ]]; then
  if [[ -n "${XDG_CONFIG_HOME:-}" ]]; then
    HELIUM_USER_DATA_DIR="${XDG_CONFIG_HOME}/net.imput.helium"
  else
    HELIUM_USER_DATA_DIR="${HOME}/.config/net.imput.helium"
  fi
fi

export HELIUM_EXECUTABLE
export HELIUM_USER_DATA_DIR

PORT_FILE="${HELIUM_USER_DATA_DIR}/DevToolsActivePort"
CONNECT_ARGS=()

# Classic debug port — no approval UI.
if curl -sf --max-time 1 "http://127.0.0.1:${HELIUM_DEBUG_PORT:-9222}/json/version" >/dev/null 2>&1; then
  CONNECT_ARGS=(--browser-url "http://127.0.0.1:${HELIUM_DEBUG_PORT:-9222}")
# UI remote debugging — use the WebSocket path from DevToolsActivePort.
elif [[ -f "${PORT_FILE}" ]]; then
  PORT="$(head -n1 "${PORT_FILE}" | tr -d '[:space:]')"
  WS_PATH="$(sed -n '2p' "${PORT_FILE}" | tr -d '[:space:]')"
  if [[ -n "${PORT}" && -n "${WS_PATH}" ]]; then
    CONNECT_ARGS=(--wsEndpoint "ws://127.0.0.1:${PORT}${WS_PATH}")
  else
    CONNECT_ARGS=(--autoConnect)
  fi
else
  CONNECT_ARGS=(--autoConnect)
fi

exec bunx helium-devtools-mcp@1.1.1-helium.1 \
  "${CONNECT_ARGS[@]}" \
  --no-usage-statistics \
  "$@"