#!/usr/bin/env bash
set -euo pipefail

PID_FILE="${HELIUM_MCP_PID_FILE:-${XDG_RUNTIME_DIR:-/tmp}/helium-mcp-gateway-${UID}.pid}"

if [[ ! -f "${PID_FILE}" ]]; then
  echo "Helium MCP gateway is not running."
  exit 0
fi

PID="$(cat "${PID_FILE}")"
if kill -0 "${PID}" 2>/dev/null; then
  kill "${PID}" 2>/dev/null || true
  sleep 0.5
  kill -9 "${PID}" 2>/dev/null || true
  echo "Stopped Helium MCP gateway (pid ${PID})."
else
  echo "Stale PID file — gateway was not running."
fi

rm -f "${PID_FILE}"