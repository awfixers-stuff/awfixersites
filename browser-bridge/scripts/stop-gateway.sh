#!/usr/bin/env bash
set -euo pipefail

PID_FILE="${BROWSER_BRIDGE_PID_FILE:-${XDG_RUNTIME_DIR:-/tmp}/browser-bridge-mcp-${UID}.pid}"
BRIDGE_PID_FILE="${BROWSER_BRIDGE_BRIDGE_PID_FILE:-${XDG_RUNTIME_DIR:-/tmp}/browser-bridge-ws-${UID}.pid}"

for file in "${PID_FILE}" "${BRIDGE_PID_FILE}"; do
  if [[ -f "${file}" ]]; then
    pid="$(cat "${file}")"
    if kill -0 "${pid}" 2>/dev/null; then
      kill "${pid}"
      echo "Stopped pid ${pid}"
    fi
    rm -f "${file}"
  fi
done