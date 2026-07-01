---
name: helium-troubleshooting
description: Diagnose Helium browser MCP connection issues. Trigger when helium MCP tools fail, list_pages returns errors, DevToolsActivePort is missing, or the user asks how to connect Helium to the agent.
---

## Troubleshooting wizard

When Helium MCP tools fail, follow this sequence.

### Step 1: Run the status script

```bash
bash ${GROK_PLUGIN_ROOT}/scripts/status.sh
```

This checks: Helium binary, running process, user data dir, `DevToolsActivePort`, and bun availability.

### Step 2: Repeated approval prompts

Chrome/Helium shows a **new approval dialog each time a fresh MCP process connects** to the browser. Fix: use the persistent gateway (not per-session stdio spawn).

```bash
bash ${GROK_PLUGIN_ROOT}/scripts/start-persistent-server.sh
```

Confirm Grok MCP config uses `http://127.0.0.1:18791/mcp` (HTTP), not a stdio `launch-mcp.sh` command.

For **zero prompts ever**, restart Helium with the classic debug port:
```bash
bash ${GROK_PLUGIN_ROOT}/scripts/launch-helium-with-debug.sh
```

### Step 3: Enable remote debugging (most common fix)

Error pattern: `Could not find DevToolsActivePort` or `Could not connect to Chrome in .../net.imput.helium`

This means Helium is running but remote debugging is off.

1. Ask the user to confirm Helium is open
2. Instruct them: open `helium://inspect/#remote-debugging` in Helium
3. Enable the **remote debugging** checkbox
4. Accept any connection prompt (once, when starting the persistent gateway)
5. Retry `helium__list_pages`

### Step 3: Verify configuration

Read `.grok/plugins/helium-browser/.mcp.json` and confirm:

- Command: `bash ${GROK_PLUGIN_ROOT}/scripts/launch-mcp.sh`
- Plugin is **trusted** (project plugins require `grok plugin install ./.grok/plugins/helium-browser --trust` or trust via `/plugins`)
- Plugin is **enabled** in `.grok/config.toml` under `[plugins] enabled`

Optional env overrides:

| Variable | Purpose |
|----------|---------|
| `HELIUM_EXECUTABLE` | Path to Helium binary (auto-detected from PATH) |
| `HELIUM_USER_DATA_DIR` | Profile dir (default: `~/.config/net.imput.helium`) |

### Step 4: Fallback — explicit browser URL

If `--autoConnect` fails in a sandboxed environment, read `DevToolsActivePort` manually:

```bash
cat ~/.config/net.imput.helium/DevToolsActivePort
# line 1 = port, line 2 = websocket path
```

Then configure `--browser-url=http://127.0.0.1:<port>` in the launch script args.

### Step 5: Check MCP logs

```bash
tail -f ~/.grok/logs/mcp/helium.stderr.log
```

### Step 6: Manual server test

```bash
HELIUM_EXECUTABLE="$(command -v helium)" \
HELIUM_USER_DATA_DIR="$HOME/.config/net.imput.helium" \
bunx helium-devtools-mcp@1.1.1-helium.1 --autoConnect --no-usage-statistics
```

Server should print the disclaimer and wait on stdin (MCP handshake). Ctrl+C to exit.

## Platform notes

**Linux (NixOS)**: Helium is often installed via nix at `/etc/profiles/per-user/<user>/bin/helium`. The launcher auto-detects it from PATH.

**macOS**: Profile at `~/Library/Application Support/net.imput.helium`

**Windows**: Profile at `%LOCALAPPDATA%\imput\Helium\User Data`