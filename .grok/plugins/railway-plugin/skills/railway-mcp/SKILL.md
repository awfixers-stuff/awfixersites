---
name: railway-mcp
description: >
  Railway MCP server setup expert. Use when configuring local or remote Railway
  MCP, choosing between stdio and OAuth endpoints, or troubleshooting MCP
  connection. Triggers on: "railway mcp", "mcp.railway.com", "railway setup agent",
  "railway mcp install". Use when the user runs /railway:mcp-setup.
---

# Railway MCP Setup

Railway offers two MCP endpoints. This plugin bundles both in `.mcp.json`.

## Quick setup

```bash
# All-in-one: skills + MCP + auth
railway setup agent          # local
railway setup agent --remote # remote

# MCP config only
railway mcp install
railway mcp install --remote
railway mcp install --agent claude-code
```

## Local MCP (recommended for this repo)

```json
{
  "command": "railway",
  "args": ["mcp"]
}
```

**Pros:** Shares CLI auth, broader tool set (deploy, variables, templates, logs)
**Cons:** Requires global `railway` CLI on PATH and logged in

### Local tools

- `check-railway-status`, `list-projects`, `create-project-and-link`
- `list-services`, `link-service`, `deploy`, `deploy-template`
- `list-variables`, `set-variables`, `generate-domain`
- `get-logs`

## Remote MCP

```json
{
  "type": "http",
  "url": "https://mcp.railway.com"
}
```

**Pros:** No local CLI, OAuth scoping, `railway-agent` for complex debugging
**Cons:** Narrower direct tools; delegate complex ops to `railway-agent`

### Remote tools

- `whoami`, `list-projects`, `create-project`, `list-services`
- `redeploy`, `accept-deploy` (destructive — confirms first)
- `railway-agent` — multi-step log analysis, debugging, configuration

## Decision guide

| Scenario                           | Choose                  |
| ---------------------------------- | ----------------------- |
| Working in awfixersites repo daily | Local                   |
| CI/automation headless             | Local + `RAILWAY_TOKEN` |
| No CLI installed                   | Remote                  |
| "Why is my service crashing?"      | Remote `railway-agent`  |
| Terraform IaC changes              | Skills, not MCP         |
| First-time setup                   | `railway setup agent`   |

## Verify connection

```bash
railway mcp          # starts stdio server (test locally)
railway whoami       # confirms auth
```

In agent session: use `/mcp` to list connected servers and available tools.

## Security

- Review LLM-requested destructive actions before approving
- Remote OAuth: scope to specific workspaces/projects
- Project tokens not accepted on remote MCP (user identity required)
- Limit production operations to non-critical paths when possible

Docs: https://docs.railway.com/ai/mcp-server
