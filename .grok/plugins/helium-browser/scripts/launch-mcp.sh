#!/usr/bin/env bash
# Ensures the persistent gateway is running, then prints its URL.
# Grok should connect via HTTP (see .mcp.json), not spawn a fresh stdio MCP each session.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"${SCRIPT_DIR}/start-persistent-server.sh"