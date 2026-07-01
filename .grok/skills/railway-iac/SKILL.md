---
name: railway-iac
description: >
  Railway Terraform provider expert for awfixersites — manage Railway projects,
  services, Postgres, volumes, variables, and custom domains for off-Vercel
  infrastructure (databases, Mailgun-adjacent services, background workers).
  Use when writing railway_* resources, infra/backend Railway stack, importing
  Railway projects, or wiring DATABASE_URL into Vercel env vars. Triggers on:
  "railway terraform", "railway provider", "railway postgres", "railway service".
  Use when the user runs /railway-iac.
---

# Railway IaC (awfixersites)

Railway hosts **off-Vercel services** — primarily Postgres and any future backends
(Mailgun webhooks, workers, etc.). Next.js apps stay on Vercel; Railway URLs flow
into Vercel env vars via Terraform outputs.

## Provider setup

```hcl
terraform {
  required_providers {
    railway = {
      source  = "terraform-community-providers/railway"
      version = "~> 0.6"
    }
  }
}

provider "railway" {
  # RAILWAY_TOKEN env var
}
```

Stub in `infra/backend/main.tf` alongside the Vercel provider.

## Core resources

### Project

```hcl
resource "railway_project" "awfixersites" {
  name           = "awfixersites"
  workspace_id   = var.railway_workspace_id
  default_environment = true
}
```

### Postgres service

```hcl
resource "railway_service" "postgres" {
  project_id = railway_project.awfixersites.id
  name       = "postgres"

  source_image = "ghcr.io/railwayapp-templates/postgres-ssl:16"
}

resource "railway_variable" "postgres_url" {
  service_id = railway_service.postgres.id
  name       = "DATABASE_URL"
  # Railway injects this automatically for template services — prefer data source
}
```

### Variables → Vercel env (cross-provider wiring)

In `infra/backend/`, output Railway connection strings and reference them in
`vercel_project_environment_variable` resources:

```hcl
output "auth_database_url" {
  value     = railway_variable.auth_db_url.value
  sensitive = true
}

resource "vercel_project_environment_variable" "auth_db" {
  project_id = vercel_project.auth.id
  key        = "PRISMA_DATABASE_URL"
  value      = railway_variable.auth_db_url.value
  target     = ["production"]
  sensitive  = true
}
```

This keeps **one source of truth** for DB URLs instead of hand-copying in the Vercel dashboard.

## Database topology (matches app architecture)

| Database | Serves | Vercel project |
|----------|--------|----------------|
| IdP Postgres | users, passkeys, OAuth registry | `awfixersites-auth-app` |
| Per-app session DB | local OAuth client sessions | each `awfixersites-<app>` |
| App DBs | enlistments, donations, etc. | `careers`, `donate`, etc. |

Local dev can share one DB; production should be separate per `docs/auth-deployment.md`.

App code resolves URLs via `packages/env` and `packages/auth/src/prisma.ts` —
canonical var is `PRISMA_DATABASE_URL`.

## Import existing Railway resources

```bash
cd infra/backend
terraform import railway_project.awfixersites <project_id>
terraform import railway_service.postgres <service_id>
```

Find IDs: Railway dashboard → project settings, or:

```bash
railway status
railway list
```

## CLI (ad-hoc ops)

```bash
railway --version
railway login
railway link
railway variables
railway logs
```

CLI is for debugging and discovery; **Terraform owns durable config**.

Note: use the global `railway` command on PATH. Do not use `bunx @railway/cli` — it fails in this environment. The `railway` npm package is the TypeScript SDK, not the CLI.

## Mailgun and other external services

Mailgun is **not** on Vercel or Railway by default. Options:

1. **DNS-only in Terraform** — MX/TXT/CNAME records for Mailgun domain verification (Cloudflare or DNS provider resource)
2. **Railway service** — webhook receiver or email worker if you deploy one
3. **Separate provider** — if a Mailgun Terraform provider exists, add to `infra/backend/main.tf`

Resend is used in `apps/tips` today (`RESEND_API_KEY`); Mailgun would follow the same
pattern: Railway/Terraform provisions nothing for the API itself — just env vars on the
relevant Vercel project.

## Safety

1. **Never** rotate `DATABASE_URL` on auth without a migration plan — IdP downtime breaks all satellites
2. Mark all connection strings `sensitive = true` in Terraform
3. Use separate Railway services per production database where `docs/auth-deployment.md` requires isolation
4. `terraform plan` before apply — watch for destructive replaces on volumes

## Related

- `/terraform-iac` — init, state, module layout
- `/vercel-iac` — push Railway outputs into Vercel env vars

Docs: https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs