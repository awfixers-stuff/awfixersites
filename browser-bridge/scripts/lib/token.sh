#!/usr/bin/env bash
# Shared token loader for browser-bridge scripts.
set -euo pipefail

browser_bridge_token_file() {
  local bridge_root="${1:?bridge root required}"
  echo "${bridge_root}/.bridge-token"
}

browser_bridge_load_token() {
  local bridge_root="${1:?bridge root required}"
  local token_file
  token_file="$(browser_bridge_token_file "${bridge_root}")"

  if [[ -f "${token_file}" ]]; then
    BROWSER_BRIDGE_TOKEN="$(tr -d '[:space:]' < "${token_file}")"
    export BROWSER_BRIDGE_TOKEN
    return 0
  fi

  unset BROWSER_BRIDGE_TOKEN
  return 1
}

browser_bridge_ensure_token() {
  local bridge_root="${1:?bridge root required}"
  local token_file
  token_file="$(browser_bridge_token_file "${bridge_root}")"

  if [[ -f "${token_file}" ]] && [[ -s "${token_file}" ]]; then
    BROWSER_BRIDGE_TOKEN="$(tr -d '[:space:]' < "${token_file}")"
    export BROWSER_BRIDGE_TOKEN
    return 0
  fi

  mkdir -p "$(dirname "${token_file}")"
  BROWSER_BRIDGE_TOKEN="$(openssl rand -hex 32)"
  printf '%s\n' "${BROWSER_BRIDGE_TOKEN}" > "${token_file}"
  chmod 600 "${token_file}"
  export BROWSER_BRIDGE_TOKEN
}