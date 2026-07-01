#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok() { printf '%b✓%b %s\n' "$GREEN" "$NC" "$1"; }
warn() { printf '%b!%b %s\n' "$YELLOW" "$NC" "$1"; }
fail() { printf '%b✗%b %s\n' "$RED" "$NC" "$1"; }

HELIUM_BIN="${HELIUM_EXECUTABLE:-$(command -v helium 2>/dev/null || true)}"
if [[ -z "${HELIUM_USER_DATA_DIR:-}" ]]; then
  if [[ -n "${XDG_CONFIG_HOME:-}" ]]; then
    HELIUM_USER_DATA_DIR="${XDG_CONFIG_HOME}/net.imput.helium"
  else
    HELIUM_USER_DATA_DIR="${HOME}/.config/net.imput.helium"
  fi
fi

PORT_FILE="${HELIUM_USER_DATA_DIR}/DevToolsActivePort"
GATEWAY_PORT="${HELIUM_MCP_PORT:-18791}"
GATEWAY_PID_FILE="${HELIUM_MCP_PID_FILE:-${XDG_RUNTIME_DIR:-/tmp}/helium-mcp-gateway-${UID}.pid}"
GATEWAY_HEALTH="http://127.0.0.1:${GATEWAY_PORT}/healthz"
GATEWAY_MCP="http://127.0.0.1:${GATEWAY_PORT}/mcp"
READY=0

echo "Helium Browser MCP — connection status"
echo

if [[ -n "$HELIUM_BIN" && -x "$HELIUM_BIN" ]]; then
  VERSION="$("$HELIUM_BIN" --version 2>/dev/null || echo unknown)"
  ok "Helium binary: ${HELIUM_BIN} (${VERSION})"
else
  fail "Helium binary not found on PATH"
  warn "Install from https://helium.computer or set HELIUM_EXECUTABLE"
  READY=1
fi

if pgrep -x helium >/dev/null 2>&1 || pgrep -f '/opt/helium/helium ' >/dev/null 2>&1; then
  ok "Helium process is running"
else
  fail "Helium is not running"
  warn "Start Helium before using browser automation tools"
  READY=1
fi

if [[ -d "$HELIUM_USER_DATA_DIR" ]]; then
  ok "User data dir: ${HELIUM_USER_DATA_DIR}"
else
  fail "User data dir missing: ${HELIUM_USER_DATA_DIR}"
  READY=1
fi

if [[ -f "$PORT_FILE" ]]; then
  PORT="$(head -n1 "$PORT_FILE" | tr -d '[:space:]')"
  WS_PATH="$(sed -n '2p' "$PORT_FILE" | tr -d '[:space:]')"
  ok "Remote debugging active on port ${PORT}"

  if curl -sf --max-time 2 "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
    ok "DevTools HTTP endpoint reachable at http://127.0.0.1:${PORT}"
  else
    warn "DevTools HTTP disabled (normal for UI-enabled remote debugging — WebSocket still works)"
  fi

  if [[ -n "$WS_PATH" ]]; then
    echo "  WebSocket: ws://127.0.0.1:${PORT}${WS_PATH}"
  fi
else
  fail "Remote debugging is not enabled (no DevToolsActivePort file)"
  warn "In Helium, open helium://inspect/#remote-debugging and enable remote debugging"
  warn "Accept the connection prompt if one appears"
  READY=1
fi

if command -v bun >/dev/null 2>&1; then
  ok "bun runtime available ($(bun --version 2>/dev/null || echo unknown))"
else
  fail "bun is required to run helium-devtools-mcp"
  READY=1
fi

if curl -sf --max-time 2 "${GATEWAY_HEALTH}" >/dev/null 2>&1; then
  ok "Persistent MCP gateway running at ${GATEWAY_MCP}"
  if [[ -f "${GATEWAY_PID_FILE}" ]]; then
    echo "  Gateway pid: $(cat "${GATEWAY_PID_FILE}")"
  fi
else
  fail "Persistent MCP gateway is not running"
  warn "Start it: bash .grok/plugins/helium-browser/scripts/start-persistent-server.sh"
  READY=1
fi

if curl -sf --max-time 1 "http://127.0.0.1:${HELIUM_DEBUG_PORT:-9222}/json/version" >/dev/null 2>&1; then
  ok "Classic debug port ${HELIUM_DEBUG_PORT:-9222} active (no per-connection approval)"
elif [[ -f "${PORT_FILE}" ]]; then
  ok "UI remote debugging active (approve once when starting the persistent gateway)"
else
  warn "No debug port — enable helium://inspect/#remote-debugging or use launch-helium-with-debug.sh"
  READY=1
fi

echo
if [[ "$READY" -eq 0 ]]; then
  ok "Ready — MCP tools can connect to your local Helium instance"
  exit 0
fi

warn "Not ready — fix the items above, then retry"
exit 1