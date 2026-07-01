#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=lib/token.sh
source "${SCRIPT_DIR}/lib/token.sh"

REGENERATE=false
if [[ "${1:-}" == "--regenerate" ]]; then
  REGENERATE=true
  rm -f "$(browser_bridge_token_file "${BRIDGE_ROOT}")"
fi

if [[ "${REGENERATE}" == "true" ]] || ! browser_bridge_load_token "${BRIDGE_ROOT}"; then
  browser_bridge_ensure_token "${BRIDGE_ROOT}"
  echo "Created new browser bridge token."
else
  echo "Using existing browser bridge token."
fi

echo ""
echo "Copy this into the extension popup → Auth token:"
echo ""
echo "${BROWSER_BRIDGE_TOKEN}"
echo ""

if command -v wl-copy >/dev/null 2>&1; then
  printf '%s' "${BROWSER_BRIDGE_TOKEN}" | wl-copy
  echo "Copied to clipboard (wl-copy)."
elif command -v xclip >/dev/null 2>&1; then
  printf '%s' "${BROWSER_BRIDGE_TOKEN}" | xclip -selection clipboard
  echo "Copied to clipboard (xclip)."
elif command -v xsel >/dev/null 2>&1; then
  printf '%s' "${BROWSER_BRIDGE_TOKEN}" | xsel --clipboard --input
  echo "Copied to clipboard (xsel)."
else
  echo "No clipboard tool found — copy from above."
fi

echo ""
echo "Restart the gateway so the server picks up the token:"
echo "  bash ${BRIDGE_ROOT}/scripts/stop-gateway.sh && bash ${BRIDGE_ROOT}/scripts/start-gateway.sh"