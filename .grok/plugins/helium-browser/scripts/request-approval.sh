#!/usr/bin/env bash
# Waits for you to approve remote debugging in Helium, then starts the persistent gateway.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

HELIUM_BIN="${HELIUM_EXECUTABLE:-$(command -v helium 2>/dev/null || true)}"
USER_DATA="${HELIUM_USER_DATA_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/net.imput.helium}"
PORT_FILE="${USER_DATA}/DevToolsActivePort"
INSPECT_URL="helium://inspect/#remote-debugging"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Approve Helium remote debugging                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [[ -z "${HELIUM_BIN}" ]]; then
  echo "Helium not found on PATH."
  exit 1
fi

helium_running() {
  pgrep -f '/opt/helium/helium ' >/dev/null 2>&1
}

if ! helium_running; then
  echo "Starting Helium on the remote debugging page..."
  nohup "${HELIUM_BIN}" "${INSPECT_URL}" >/dev/null 2>&1 &
  for _ in $(seq 1 30); do
    helium_running && break
    sleep 0.5
  done
  sleep 2
fi

if ! helium_running; then
  echo "Open Helium manually, then re-run this script."
  exit 1
fi

# Focus the inspect page (new tab if needed).
"${HELIUM_BIN}" "${INSPECT_URL}" >/dev/null 2>&1 &
sleep 1

echo "In Helium, on the page: ${INSPECT_URL}"
echo ""
echo "  1. Turn ON  \"Enable remote debugging\" (if it is off)"
echo "  2. Look for a pending connection / Allow button on THAT page"
echo "     (it may not be a separate popup — check the inspect page itself)"
echo "  3. Click Allow / Confirm"
echo ""
echo "This script will retry the connection every 3 seconds (up to 3 min)..."
echo ""

cd /tmp
bun add puppeteer-core @modelcontextprotocol/sdk >/dev/null 2>&1 || true

for attempt in $(seq 1 60); do
  if [[ ! -f "${PORT_FILE}" ]]; then
    echo "[${attempt}/60] Waiting for DevToolsActivePort — enable remote debugging in Helium"
    sleep 3
    continue
  fi

  PORT="$(head -n1 "${PORT_FILE}" | tr -d '[:space:]')"
  WS_PATH="$(sed -n '2p' "${PORT_FILE}" | tr -d '[:space:]')"
  WS="ws://127.0.0.1:${PORT}${WS_PATH}"

  if bun -e "
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.connect({ browserWSEndpoint: process.argv[1], defaultViewport: null });
const n = (await browser.pages()).length;
await browser.disconnect();
console.log('CONNECTED ' + n);
" "$WS" 2>/dev/null | grep -q CONNECTED; then
    echo ""
    echo "Approved! Browser connection works ($(bun -e "
import puppeteer from 'puppeteer-core';
const b = await puppeteer.connect({ browserWSEndpoint: process.argv[1], defaultViewport: null });
console.log((await b.pages()).length + ' tabs');
await b.disconnect();
" "$WS" 2>/dev/null))"
    echo ""
    echo "Starting persistent MCP gateway..."
    "${SCRIPT_DIR}/stop-persistent-server.sh" 2>/dev/null || true
    "${SCRIPT_DIR}/start-persistent-server.sh"
    echo ""
    echo "Done. The gateway will keep this session — you should not be prompted again."
    exit 0
  fi

  echo "[${attempt}/60] Connection blocked — click Allow on ${INSPECT_URL}"
  # Re-open inspect page every 10 attempts in case the tab was lost.
  if (( attempt % 10 == 0 )); then
    "${HELIUM_BIN}" "${INSPECT_URL}" >/dev/null 2>&1 &
  fi
  sleep 3
done

echo ""
echo "Timed out. Either:"
echo "  • Click Allow on ${INSPECT_URL} and re-run this script"
echo "  • Or close Helium and use: bash ${PLUGIN_ROOT}/scripts/launch-helium-with-debug.sh"
exit 1