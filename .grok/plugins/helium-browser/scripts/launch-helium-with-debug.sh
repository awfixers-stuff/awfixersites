#!/usr/bin/env bash
# Launch Helium with a persistent localhost debug port (classic CDP mode).
# This avoids the per-connection approval dialog from helium://inspect remote debugging.
#
# Usage: close Helium first, then run this script.
set -euo pipefail

PORT="${HELIUM_DEBUG_PORT:-9222}"

if [[ -z "${HELIUM_EXECUTABLE:-}" ]]; then
  HELIUM_EXECUTABLE="$(command -v helium 2>/dev/null || true)"
fi

if [[ -z "${HELIUM_EXECUTABLE}" ]]; then
  echo "Helium binary not found. Set HELIUM_EXECUTABLE or install Helium." >&2
  exit 1
fi

if pgrep -x helium >/dev/null 2>&1 || pgrep -f '/opt/helium/helium ' >/dev/null 2>&1; then
  echo "Helium is already running. Close it completely, then re-run this script." >&2
  echo "Classic --remote-debugging-port must be set at browser startup." >&2
  exit 1
fi

echo "Starting Helium with --remote-debugging-port=${PORT} ..."
exec "${HELIUM_EXECUTABLE}" \
  --remote-debugging-port="${PORT}" \
  "$@"