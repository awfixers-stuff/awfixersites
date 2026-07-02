# Railway Ecosystem (awfixersites)

Relational map of how Railway fits in the awfixersites fleet.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     awfixersites monorepo                    │
├─────────────────────────────────────────────────────────────┤
│  Vercel (22 Next.js apps)          Railway (off-Vercel)     │
│  ├── apps/*/vercel.ts              ├── Postgres services    │
│  ├── apps/*/middleware.ts          ├── future workers       │
│  └── PRISMA_DATABASE_URL ◄─────────┤   (Mailgun webhooks)  │
│       (via Terraform outputs)      └── volumes, env vars    │
├─────────────────────────────────────────────────────────────┤
│  Terraform (infra/backend/main.tf)                          │
│  ├── vercel provider → projects, domains, env vars          │
│  └── railway provider → projects, services, variables       │
└─────────────────────────────────────────────────────────────┘
```

## Decision matrix

| Need                                | Tool                              | Skill                        |
| ----------------------------------- | --------------------------------- | ---------------------------- |
| Provision Postgres in production    | Terraform `railway_*`             | `railway-iac`                |
| Quick ad-hoc deploy or debug        | Railway CLI / MCP                 | `railway-cli`, `railway-mcp` |
| Sync DATABASE_URL to Vercel         | Terraform cross-provider          | `railway-vercel-wiring`      |
| Pull vars for local dev             | `railway variables` or MCP        | `railway-variables`          |
| Deploy a template (Postgres, Redis) | `deploy-template` MCP or CLI      | `railway-postgres`           |
| Debug failing Railway deploy        | MCP `get-logs` or `railway-agent` | `deployment-debugger` agent  |
| Validate Terraform before apply     | `terraform plan`                  | `iac-validator` agent        |

## Database topology

| Database           | Serves                          | Vercel project            | Env var                            |
| ------------------ | ------------------------------- | ------------------------- | ---------------------------------- |
| IdP Postgres       | users, passkeys, OAuth registry | `awfixersites-auth-app`   | `PRISMA_DATABASE_URL`              |
| Per-app session DB | local OAuth client sessions     | each `awfixersites-<app>` | `AUTH_<SITE>_SESSION_DATABASE_URL` |
| App DBs            | enlistments, donations, etc.    | `careers`, `donate`, etc. | `PRISMA_DATABASE_URL`              |

Canonical resolver: `packages/env/src/index.ts` and `packages/auth/src/prisma.ts`.

## MCP choice

| Scenario                           | Use                                         |
| ---------------------------------- | ------------------------------------------- |
| Day-to-day coding in this repo     | **Local** (`railway mcp`) — shares CLI auth |
| No CLI installed / OAuth preferred | **Remote** (`mcp.railway.com`)              |
| Complex debugging                  | **Remote** `railway-agent` tool             |
| Terraform IaC changes              | **Skills** — MCP is for ops, not HCL        |

## Safety rules

1. Never rotate auth `DATABASE_URL` without a migration plan
2. Mark all connection strings `sensitive = true` in Terraform
3. `terraform plan` before every apply — watch volume replaces
4. CLI/MCP for discovery; Terraform owns durable config

## Related skills in this plugin

- `railway-cli` — CLI commands and workflows
- `railway-iac` — Terraform provider patterns
- `railway-postgres` — Postgres templates and topology
- `railway-variables` — env var management
- `railway-deployments` — deploy and redeploy
- `railway-mcp` — local vs remote MCP setup
- `railway-vercel-wiring` — cross-provider env var sync
