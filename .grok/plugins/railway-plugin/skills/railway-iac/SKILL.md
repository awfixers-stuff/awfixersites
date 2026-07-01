---
name: railway-iac
description: >
  Railway Terraform provider expert for awfixersites — manage Railway projects,
  services, Postgres, volumes, variables, and custom domains for off-Vercel
  infrastructure. Use when writing railway_* resources, infra/backend Railway
  stack, importing Railway projects, or wiring DATABASE_URL into Vercel env vars.
  Triggers on: "railway terraform", "railway provider", "railway postgres",
  "railway service", "railway import". Use when the user runs /railway:iac.
---

# Railway IaC (awfixersites)

Railway hosts **off-Vercel services** — primarily Postgres and future backends
(Mailgun webhooks, workers). Next.js apps stay on Vercel; Railway URLs flow
into Vercel env vars via Terraform outputs.

## Provider setup

Already stubbed in `infra/backend/main.tf`:

```hcl
terraform {
  required_providers {
    railway = {
      source  = "terraform-community-providers/railway"
      version = "~> 0.6.2"
    }
  }
}

provider "railway" {
  # RAILWAY_TOKEN env var
}
```

Auth: `export RAILWAY_TOKEN=...` from railway.app/account/tokens.

## Core resources

### Project

```hcl
resource "railway_project" "awfixersites" {
  name                = "awfixersites"
  workspace_id        = var.railway_workspace_id
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
```

### Variables → Vercel env (cross-provider wiring)

Output Railway connection strings and reference in `vercel_project_environment_variable`:

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

See `railway-vercel-wiring` skill for the full matrix.

## Database topology

| Database | Serves | Vercel project |
|----------|--------|----------------|
| IdP Postgres | users, passkeys, OAuth registry | `awfixersites-auth-app` |
| Per-app session DB | local OAuth client sessions | each `awfixersites-<app>` |
| App DBs | enlistments, donations, etc. | `careers`, `donate`, etc. |

Canonical var: `PRISMA_DATABASE_URL` via `packages/env` and `packages/auth/src/prisma.ts`.

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

After import, run `terraform plan` until drift is minimal.

## Standard workflow

```bash
cd infra/backend
terraform init
terraform fmt -recursive ../..
terraform validate
terraform plan -out=tfplan
# Review plan carefully, then:
terraform apply tfplan
```

## Safety

1. **Never** rotate auth `DATABASE_URL` without a migration plan
2. Mark all connection strings `sensitive = true`
3. Separate Railway services per production database where `docs/auth-deployment.md` requires isolation
4. `terraform plan` before apply — watch for destructive volume replaces

## Related

- `railway-vercel-wiring` — cross-provider env var patterns
- `railway-cli` — ad-hoc discovery and debugging
- Terraform IaC skill in `.grok/skills/terraform-iac/`

Docs: https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs