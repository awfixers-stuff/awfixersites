#!/usr/bin/env bash
set -euo pipefail

PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
REPO_ROOT="$(cd "${PLUGIN_ROOT}/../../.." && pwd)"

exec bash "${REPO_ROOT}/browser-bridge/scripts/launch-mcp.sh"