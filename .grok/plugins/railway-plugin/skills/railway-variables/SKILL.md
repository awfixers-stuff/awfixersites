---
name: railway-variables
description: >
  Railway environment variable expert for awfixersites. Use when listing, setting,
  or syncing Railway variables to local .env files or Vercel projects. Triggers on:
  "railway variables", "railway env", "pull variables", "DATABASE_URL sync".
  Use when the user runs /railway:variables.
---

# Railway Variables (awfixersites)

## CLI operations

```bash
# List all variables for linked service
railway variables

# Set a variable
railway variables set KEY=value

# Delete a variable
railway variables delete KEY
```

## Pull to local .env

```bash
railway variables --json > /tmp/railway-vars.json
# Or use MCP: list-variables → save to .env.local
```

**Never commit** pulled secrets. `.env.local` is gitignored.

## awfixersites variable matrix

| Variable                           | Source                     | Destination                                 |
| ---------------------------------- | -------------------------- | ------------------------------------------- |
| `DATABASE_URL`                     | Railway Postgres service   | Terraform → `PRISMA_DATABASE_URL` on Vercel |
| `RAILWAY_TOKEN`                    | railway.app/account/tokens | Shell env / TF Cloud (never commit)         |
| `AUTH_CLIENT_DATABASE_URL`         | Railway session DB         | Vercel auth satellite apps                  |
| `AUTH_<SITE>_SESSION_DATABASE_URL` | Per-app session DB         | Specific Vercel project                     |

Resolver: `packages/env/src/index.ts`

## Terraform (durable config)

```hcl
resource "railway_variable" "custom" {
  service_id = railway_service.postgres.id
  name       = "PGSSLMODE"
  value      = "require"
}
```

For connection strings Railway auto-injects, prefer data sources over hardcoding.

## Cross-provider sync

Production flow:

1. Railway service exposes `DATABASE_URL`
2. Terraform reads via `railway_variable` data source or output
3. Terraform writes `vercel_project_environment_variable`
4. Vercel redeploy picks up new value

**Do not** set production DB URLs via CLI if Terraform manages them — causes drift.

## Safety

- Mark all DB URLs `sensitive = true` in Terraform
- Rotating auth `DATABASE_URL` requires migration plan — coordinate with auth team
- Preview/staging vars may differ — check environment scope before apply
