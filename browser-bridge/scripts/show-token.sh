#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=lib/token.sh
source "${SCRIPT_DIR}/lib/token.sh"

if ! browser_bridge_load_token "${BRIDGE_ROOT}"; then
  echo "No token yet. Run: bash ${BRIDGE_ROOT}/scripts/setup-token.sh" >&2
  exit 1
fi

echo "${BROWSER_BRIDGE_TOKEN}"