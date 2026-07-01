---
name: helium-status
description: Check whether the local Helium browser is ready for MCP automation
---

Check connection readiness for the Helium browser MCP plugin.

## Steps

1. Run the status script:
   ```bash
   bash ${GROK_PLUGIN_ROOT}/scripts/status.sh
   ```

2. If remote debugging is not enabled, tell the user:
   - Open `helium://inspect/#remote-debugging` in Helium
   - Enable remote debugging
   - Accept any connection prompt

3. If all checks pass, confirm the agent can use `helium__*` MCP tools to control their browser.

4. If checks fail, load the `helium-troubleshooting` skill and walk through fixes.