# railway-plugin

Claude Code / Grok plugin for Railway infrastructure in the **awfixersites** monorepo.

Railway hosts off-Vercel services (Postgres, future workers). Next.js apps stay on Vercel. Terraform in `infra/backend/main.tf` wires Railway `DATABASE_URL` outputs into Vercel `PRISMA_DATABASE_URL` env vars.

## Installation

Enable in `.grok/config.toml`:

```toml
[plugins]
enabled = ["helium-browser", "railway"]
```

Or test locally:

```bash
cc --plugin-dir .grok/plugins/railway-plugin
```

## Prerequisites

- Global `railway` CLI on PATH (do not use `bunx @railway/cli` — fails in this environment)
- `RAILWAY_TOKEN` for Terraform (`railway.app/account/tokens`)
- `VERCEL_API_TOKEN` for cross-provider wiring

```bash
railway login
export RAILWAY_TOKEN=...
export VERCEL_API_TOKEN=...
```

## Components

### Ecosystem map (`RAILWAY.md`)

Architecture diagram, decision matrix, database topology, and safety rules.

### Skills (7)

| Skill                   | Covers                                                  |
| ----------------------- | ------------------------------------------------------- |
| `railway-cli`           | CLI auth, link, deploy, logs, variables                 |
| `railway-iac`           | Terraform `railway_*` resources, import, apply workflow |
| `railway-postgres`      | Postgres templates, Prisma wiring, volume safety        |
| `railway-variables`     | Env var management, local pull, drift prevention        |
| `railway-deployments`   | Deploy, redeploy, failure diagnostics                   |
| `railway-mcp`           | Local vs remote MCP setup and decision guide            |
| `railway-vercel-wiring` | Cross-provider `DATABASE_URL` → `PRISMA_DATABASE_URL`   |

### Commands (10)

| Command              | Purpose                            |
| -------------------- | ---------------------------------- |
| `/railway:status`    | CLI auth, link, Terraform health   |
| `/railway:deploy`    | Deploy linked Railway service      |
| `/railway:logs`      | View or stream service logs        |
| `/railway:variables` | List, pull, or set variables       |
| `/railway:iac`       | Terraform stack overview           |
| `/railway:plan`      | Safe `terraform plan` with review  |
| `/railway:import`    | Import live resources into state   |
| `/railway:postgres`  | Postgres topology and provisioning |
| `/railway:link`      | Link directory to Railway project  |
| `/railway:mcp-setup` | Configure local or remote MCP      |

### Agents (2)

| Agent                 | Expertise                                            |
| --------------------- | ---------------------------------------------------- |
| `deployment-debugger` | Failed deploys, log analysis, DB connectivity        |
| `iac-validator`       | Pre-apply Terraform review, destructive op detection |

### MCP (2 servers)

| Server           | Config                            | Best for                      |
| ---------------- | --------------------------------- | ----------------------------- |
| `railway-local`  | `railway mcp` (stdio)             | Daily ops, broader tool set   |
| `railway-remote` | `https://mcp.railway.com` (OAuth) | Debugging via `railway-agent` |

Setup: `/railway:mcp-setup` or `railway setup agent`.

### Hooks

`SessionStart` injects Railway context when `infra/backend/main.tf`, `railway.toml`, or `.railway/` is detected.

## Quick start

```bash
# 1. Auth
railway login

# 2. Check status
/railway:status

# 3. Configure MCP
/railway:mcp-setup

# 4. Review Terraform
/railway:iac
/railway:plan
```

## Safety

- Never rotate auth `DATABASE_URL` without a migration plan
- `terraform plan` before every apply
- CLI/MCP for discovery; Terraform owns durable config
- Do not hand-copy DB URLs to Vercel dashboard

## Related

- `.grok/skills/terraform-iac/` — Terraform workflows
- `.grok/skills/vercel-iac/` — Vercel provider patterns
- [Railway MCP docs](https://docs.railway.com/ai/mcp-server)
- [Railway Terraform provider](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs)
