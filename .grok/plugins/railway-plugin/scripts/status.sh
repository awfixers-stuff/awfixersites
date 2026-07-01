#!/usr/bin/env bash
# Railway connectivity preflight for awfixersites.
set -euo pipefail

echo "=== Railway Preflight ==="

if command -v railway >/dev/null 2>&1; then
  CLI="railway"
else
  echo "FAIL: Railway CLI not found on PATH. Ensure global 'railway' is installed."
  exit 1
fi

echo "CLI: $($CLI --version 2>/dev/null || echo 'version check failed')"
echo "Path: $(command -v railway)"

if $CLI whoami >/dev/null 2>&1; then
  echo "Auth: OK ($($CLI whoami 2>/dev/null))"
else
  echo "Auth: NOT LOGGED IN — run: railway login"
fi

if $CLI status >/dev/null 2>&1; then
  echo "Link: OK"
  $CLI status 2>/dev/null
else
  echo "Link: NOT LINKED — run: railway link"
fi

if [[ -f "infra/backend/main.tf" ]]; then
  echo "Terraform: infra/backend/main.tf present"
else
  echo "Terraform: infra/backend/main.tf not found"
fi

echo "=== Done ==="