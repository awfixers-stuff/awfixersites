---
name: mcp-setup
description: Configure Railway MCP (local or remote). Pass "remote" for OAuth endpoint.
---

# Railway MCP Setup

Configure Railway MCP for AI agent access.

## Steps

1. Load `railway-mcp` skill.

2. Check CLI:

   ```bash
   railway --version
   railway whoami
   ```

3. If "$ARGUMENTS" contains "remote":

   ```bash
   railway setup agent --remote
   ```

   Or MCP config only:

   ```bash
   railway mcp install --remote
   ```

   Explain: OAuth on first connect, includes `railway-agent` for debugging.

4. Otherwise (local, default):

   ```bash
   railway setup agent
   ```

   Or:

   ```bash
   railway mcp install
   ```

5. Reference plugin `.mcp.json` which bundles both servers:
   - `railway-local`: `command: railway, args: [mcp]`
   - `railway-remote`: `https://mcp.railway.com`

6. Verify: tell user to run `/mcp` to confirm servers appear.

7. Decision reminder:
   - Daily awfixersites work → local
   - Complex debugging → remote `railway-agent`
   - Terraform IaC → use skills, not MCP
