---
name: railway-postgres
description: >
  Railway Postgres expert for awfixersites — template deployment, SSL connections,
  database topology, and Prisma integration. Use when provisioning Postgres,
  configuring DATABASE_URL, or planning database isolation. Triggers on:
  "railway postgres", "postgres template", "database url", "prisma database".
  Use when the user runs /railway:postgres.
---

# Railway Postgres (awfixersites)

## Template image

Production Postgres uses the Railway template:

```hcl
resource "railway_service" "postgres" {
  project_id   = railway_project.awfixersites.id
  name         = "postgres"
  source_image = "ghcr.io/railwayapp-templates/postgres-ssl:16"
}
```

Or via MCP/CLI:

```text
Deploy a Postgres database
```

```bash
railway deploy --template postgres
```

## Connection strings

Railway injects `DATABASE_URL`, `PGHOST`, `PGPORT`, etc. automatically for template services.

awfixersites canonical var: **`PRISMA_DATABASE_URL`**

Resolution order in `packages/env/src/index.ts`:

1. `PRISMA_DATABASE_URL`
2. `DATABASE_URL`
3. `POSTGRES_URL`
4. App-specific fallbacks (`AUTH_PRISMA_DATABASE_URL`, etc.)

## Topology (production)

| DB       | Purpose                       | Isolation                                      |
| -------- | ----------------------------- | ---------------------------------------------- |
| IdP      | users, passkeys, OAuth apps   | **Dedicated** — downtime breaks all satellites |
| Session  | per-app OAuth client sessions | Per-app or shared (see auth docs)              |
| App data | enlistments, donations, tips  | Per-app where required                         |

Local dev may share one DB. Production follows `docs/auth-deployment.md` and `packages/auth/HANDOFF.md`.

## Prisma integration

```bash
# After pulling DATABASE_URL locally
bun run auth:push       # prisma db push (auth IdP)
```

Connection via `packages/db/src/prisma.ts` and `packages/auth/src/prisma.ts`.

## Volumes

Postgres data persists on Railway volumes. **Never** let Terraform replace a volume without backup.

Watch `terraform plan` for:

```
# railway_volume.postgres must be replaced
```

If seen: stop, backup, plan migration — do not auto-apply.

## Wiring to Vercel

Never hand-copy URLs. Use Terraform:

```hcl
resource "vercel_project_environment_variable" "auth_db" {
  project_id = vercel_project.auth.id
  key        = "PRISMA_DATABASE_URL"
  value      = railway_variable.auth_db_url.value
  target     = ["production"]
  sensitive  = true
}
```

See `railway-vercel-wiring` skill.
