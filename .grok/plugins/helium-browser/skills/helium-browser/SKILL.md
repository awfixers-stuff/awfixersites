---
name: helium-browser
description: Control and debug the user's local Helium browser (helium.computer) via DevTools MCP. Use when automating Helium, testing web apps in the user's real browser, taking screenshots, inspecting network/console, profiling performance, or debugging pages the user already has open. Triggers on "helium browser", "my browser", "local browser", "helium tab", or when helium MCP tools are available. Do NOT use for headless scraping of arbitrary sites — prefer firecrawl for that.
---

## What this plugin does

Connects to the **running Helium browser on this machine** via `helium-devtools-mcp` (a Helium-patched fork of chrome-devtools-mcp). Tools are exposed as `helium__*` (e.g. `helium__navigate_page`, `helium__take_snapshot`).

Unlike launching a fresh Chrome profile, `--autoConnect` attaches to the user's existing Helium session — their tabs, cookies, extensions, and logins.

## Prerequisites

### One-time setup (persistent connection — avoids repeated approval prompts)

Grok connects to a **local MCP gateway** that keeps one browser CDP session alive. Start it once per login session:

```bash
bash ${GROK_PLUGIN_ROOT}/scripts/start-persistent-server.sh
```

Approve Helium **once** when the gateway first connects. Later agent turns reuse the same session — no more prompts.

### Browser debugging

Either mode works:

**A. UI remote debugging** (current Helium session): open `helium://inspect/#remote-debugging`, enable it, approve once when the gateway starts.

**B. Classic debug port** (zero prompts): close Helium, then launch with:

```bash
bash ${GROK_PLUGIN_ROOT}/scripts/launch-helium-with-debug.sh
```

Run `${GROK_PLUGIN_ROOT}/scripts/status.sh` to verify readiness.

## Core concepts

**Browser lifecycle**: The MCP server connects to the running Helium instance; it does not start Helium. If connection fails, check remote debugging first.

**Page selection**: Tools operate on the currently selected page. Use `helium__list_pages`, then `helium__select_page` to switch context.

**Element interaction**: Use `helium__take_snapshot` to get page structure with element `uid`s. If an element isn't found, take a fresh snapshot.

## Workflow patterns

### Before interacting with a page

1. `helium__list_pages` — see what's open
2. `helium__select_page` — pick the target tab
3. `helium__take_snapshot` — understand page structure
4. Interact with `helium__click`, `helium__fill`, `helium__navigate_page`, etc.

### Efficient data retrieval

- Use `filePath` for large outputs (screenshots, snapshots, traces)
- Use pagination (`pageIdx`, `pageSize`) to minimize data
- Set `includeSnapshot: false` on input actions unless you need updated page state

### Tool selection

- **Automation/interaction**: `helium__take_snapshot` (text-based, faster)
- **Visual inspection**: `helium__take_screenshot`
- **Custom data**: `helium__evaluate_script`

### Parallel execution

Maintain order: list/select page → wait → snapshot → interact. You can parallelize independent read-only calls.

## When to use Helium vs other tools

| Task                                   | Use                              |
| -------------------------------------- | -------------------------------- |
| Test a page the user has open          | Helium MCP                       |
| Debug with user's real session/cookies | Helium MCP                       |
| Scrape arbitrary public URLs           | Firecrawl                        |
| Headless CI-style automation           | Firecrawl or chrome-devtools-mcp |

## Privacy

Helium MCP exposes the full contents of the user's browser to the agent. Never exfiltrate passwords, tokens, or personal data. Warn the user before navigating to sensitive pages if appropriate.
