---
name: status
description: Check Railway CLI auth, project link, and service health for awfixersites
---

# Railway Status

Check Railway connectivity and project context for awfixersites.

## Steps

1. Load the `railway-cli` skill for command reference.

2. Run preflight checks:
   ```bash
   railway --version
   railway whoami
   railway status
   ```

3. If MCP is configured, call `check-railway-status` (local) or `whoami` (remote).

4. Check Terraform stack health:
   ```bash
   cd infra/backend && terraform validate 2>&1 || echo "Terraform not initialized"
   ```

5. Report structured summary:
   ```
   ## Railway Status
   - CLI: installed / missing
   - Auth: logged in as <user> / not authenticated
   - Linked project: <name> / not linked
   - Linked service: <name> / not linked
   - Environment: <env>
   - Terraform: valid / not initialized / errors
   ```

6. If not authenticated: guide user through `railway login`.
7. If not linked: suggest `/railway:link`.