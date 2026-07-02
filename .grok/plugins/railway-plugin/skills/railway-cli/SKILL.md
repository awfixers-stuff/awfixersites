---
name: railway-cli
description: >
  Railway CLI expert for awfixersites. Use when deploying services, linking
  projects, pulling variables, viewing logs, or managing Railway from the
  terminal. Triggers on: "railway cli", "railway deploy", "railway logs",
  "railway link", "railway status", "railway". Use when the user
  runs /railway:status, /railway:deploy, /railway:logs, or /railway:link.
---

# Railway CLI (awfixersites)

CLI is for **debugging and discovery**. Terraform owns durable config.

## Installation

Use the global `railway` CLI (patched and on PATH in this environment):

```bash
railway --version
which railway
```

Do not use `bunx @railway/cli` — it fails here. The `railway` npm package is the TypeScript SDK, not the CLI.

## Authentication

```bash
railway login
export RAILWAY_TOKEN=...      # for CI/Terraform
railway whoami
```

## Project linking

```bash
railway link        # interactive — picks project + service
railway status      # current link context
railway list        # all projects
```

Creates `.railway/` metadata locally. Do not commit secrets from this directory.

## Common commands

| Task                   | Command                           |
| ---------------------- | --------------------------------- |
| Deploy current service | `railway up`                      |
| View logs              | `railway logs`                    |
| Follow logs            | `railway logs --follow`           |
| List variables         | `railway variables`               |
| Set variable           | `railway variables set KEY=value` |
| Open dashboard         | `railway open`                    |
| Run locally            | `railway run <cmd>`               |
| Shell into service     | `railway shell`                   |

## Environment targeting

```bash
railway environment          # list environments
railway environment link <env>
```

Production changes require explicit confirmation — never deploy to production without user approval.

## MCP bootstrap

```bash
railway setup agent          # local MCP + skills
railway setup agent --remote # remote MCP at mcp.railway.com
railway mcp install          # write MCP config to detected tools
```

See `railway-mcp` skill for local vs remote decision guide.

## awfixersites conventions

- Run CLI from repo root or the linked service directory
- Use global `railway` on PATH — do not invoke via `bunx`
- After discovering IDs via CLI, codify in `infra/backend/main.tf` via Terraform import
- Do not hand-copy `DATABASE_URL` to Vercel dashboard — use Terraform cross-wiring

## Troubleshooting

| Symptom               | Fix                                      |
| --------------------- | ---------------------------------------- |
| "Not logged in"       | `railway login`                          |
| "No project linked"   | `railway link`                           |
| Wrong service context | `railway link` again                     |
| Token expired         | Regenerate at railway.app/account/tokens |

Docs: https://docs.railway.com/cli
