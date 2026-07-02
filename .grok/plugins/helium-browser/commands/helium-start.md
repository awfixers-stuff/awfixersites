---
name: helium-start
description: Start the persistent Helium MCP gateway (one browser connection, no repeated approval prompts)
---

Start the persistent Helium browser MCP gateway.

## Steps

1. Run:

   ```bash
   bash ${GROK_PLUGIN_ROOT}/scripts/start-persistent-server.sh
   ```

2. If Helium shows a remote debugging approval dialog, click **Allow once**. The gateway keeps that session alive — later agent turns will not re-prompt.

3. Verify with:

   ```bash
   bash ${GROK_PLUGIN_ROOT}/scripts/status.sh
   ```

4. To stop the gateway:
   ```bash
   bash ${GROK_PLUGIN_ROOT}/scripts/stop-persistent-server.sh
   ```

For zero approval prompts across restarts, close Helium and launch with `scripts/launch-helium-with-debug.sh` instead of the normal app shortcut.
