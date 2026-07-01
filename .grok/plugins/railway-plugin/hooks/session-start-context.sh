#!/usr/bin/env bash
# Inject Railway context when awfixersites infra files are detected.
set -euo pipefail

PLUGIN_ROOT="${GROK_PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-}}"
if [[ -z "$PLUGIN_ROOT" ]]; then
  exit 0
fi

detected=()

if [[ -f "infra/backend/main.tf" ]] && grep -q 'railway' infra/backend/main.tf 2>/dev/null; then
  detected+=("infra/backend/main.tf (Railway provider)")
fi

if [[ -f "railway.toml" ]]; then
  detected+=("railway.toml")
fi

if [[ -d ".railway" ]]; then
  detected+=(".railway/ (CLI linked)")
fi

if [[ ${#detected[@]} -eq 0 ]]; then
  exit 0
fi

echo "Railway plugin: awfixersites Railway context detected."
echo "Signals: ${detected[*]}"
echo "Load RAILWAY.md from ${PLUGIN_ROOT}/RAILWAY.md for architecture map."
echo "Skills: railway-iac, railway-cli, railway-postgres, railway-vercel-wiring"
echo "Commands: /railway:status, /railway:plan, /railway:iac, /railway:mcp-setup"