---
name: railway-vercel-wiring
description: >
  Cross-provider wiring expert for awfixersites — sync Railway Postgres URLs
  into Vercel environment variables via Terraform. Use when connecting DATABASE_URL
  to PRISMA_DATABASE_URL, coordinating infra/backend stacks, or debugging env
  var drift between Railway and Vercel. Triggers on: "railway vercel", "database
  url vercel", "cross provider", "PRISMA_DATABASE_URL terraform".
---

# Railway ↔ Vercel Wiring (awfixersites)

**Single source of truth:** Terraform in `infra/backend/main.tf`.

Next.js apps on Vercel read DB URLs from env vars set by Terraform outputs from Railway.

## Pattern

```hcl
# 1. Railway provides the database
resource "railway_service" "auth_postgres" {
  project_id   = railway_project.awfixersites.id
  name         = "auth-postgres"
  source_image = "ghcr.io/railwayapp-templates/postgres-ssl:16"
}

# 2. Read the connection string
data "railway_variable" "auth_db_url" {
  service_id = railway_service.auth_postgres.id
  name       = "DATABASE_URL"
}

# 3. Push to Vercel
resource "vercel_project_environment_variable" "auth_db" {
  project_id = vercel_project.auth.id
  key        = "PRISMA_DATABASE_URL"
  value      = data.railway_variable.auth_db_url.value
  target     = ["production"]
  sensitive  = true
}
```

## Env var mapping

| Railway (source) | Vercel (target)                    | Vercel project          |
| ---------------- | ---------------------------------- | ----------------------- |
| `DATABASE_URL`   | `PRISMA_DATABASE_URL`              | `awfixersites-auth-app` |
| `DATABASE_URL`   | `PRISMA_DATABASE_URL`              | `awfixersites-<app>`    |
| session DB URL   | `AUTH_CLIENT_DATABASE_URL`         | auth satellites         |
| per-site session | `AUTH_<SITE>_SESSION_DATABASE_URL` | specific app            |

App code resolves via `packages/env/src/index.ts` — do not rename without updating that package.

## Separation of concerns

| Layer              | Owner                    | Location                              |
| ------------------ | ------------------------ | ------------------------------------- |
| App build/deploy   | Vercel                   | `apps/*/vercel.ts`                    |
| Platform resources | Terraform                | `infra/backend/main.tf`               |
| DB hosting         | Railway                  | `railway_service` resources           |
| Env var delivery   | Terraform cross-provider | `vercel_project_environment_variable` |

## Drift detection

```bash
cd infra/backend
terraform plan
```

If plan shows env var changes:

1. Check if someone hand-edited Vercel dashboard
2. Import or reconcile — never delete projects to "fix" drift
3. For auth DB changes: read `docs/auth-deployment.md` first

## Safety

1. Auth `PRISMA_DATABASE_URL` rotation = fleet-wide outage risk
2. Pilot on low-risk apps (`church`, `donate`) before `auth`
3. All connection strings: `sensitive = true`
4. After apply: trigger Vercel redeploy for affected projects

## Related

- `railway-iac` — Railway resource patterns
- `vercel-iac` skill in `.grok/skills/vercel-iac/`
- `terraform-iac` skill in `.grok/skills/terraform-iac/`
