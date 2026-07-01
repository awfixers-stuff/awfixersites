---
name: vercel-iac
description: >
  Vercel Terraform provider expert for awfixersites — manage 22 Next.js projects,
  domains, env vars, deployment settings, and firewall rules while keeping apps
  on Vercel. Use when importing Vercel projects, writing vercel_* resources,
  syncing env vars, firewall IaC, infra/firewall, or apps/*/vercel.ts coordination.
  Triggers on: "vercel terraform", "vercel provider", "vercel project import",
  "vercel env", "vercel firewall". Use when the user runs /vercel-iac.
---

# Vercel IaC (awfixersites)

Manage Vercel **platform resources** via Terraform. Application deploy config stays in
`apps/*/vercel.ts` (generated from `src/vercel-app-config.ts`).

## Fleet overview

~22 apps under `apps/*`, each with `vercel.ts` naming `awfixersites-<app>` (e.g.
`awfixersites-church` → `apps/church`). Registry: `buildVercelProjectRegistry()` in
`src/vercel-deployment-checks.ts`.

Auth is special: `apps/auth` → `awfixersites-auth-app` (IdP). See `docs/auth-deployment.md`
for the env var matrix before changing any auth project resources.

## Provider setup

```hcl
terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.16"
    }
  }
}

provider "vercel" {
  # VERCEL_API_TOKEN env var, or:
  # api_token = var.vercel_api_token
  team_id = var.vercel_team_id  # if using a team scope
}
```

Already stubbed in `infra/backend/main.tf` and `infra/firewall/*/main.tf`.

## Core resources

### Project

```hcl
resource "vercel_project" "church" {
  name      = "awfixersites-church"
  framework = "nextjs"

  # Match apps/church/vercel.ts — root directory is apps/church in Vercel dashboard
  root_directory = "apps/church"

  # Build settings mirror createAppVercelConfig() defaults:
  build_command   = "bun --bun ../../scripts/vercel-build.ts"
  install_command = "cd ../.. && bun install --frozen-lockfile"
  dev_command     = "bun --bun run dev"

  # Omit git repo linkage if managed outside Terraform
}
```

### Domain

```hcl
resource "vercel_project_domain" "church" {
  project_id = vercel_project.church.id
  domain     = "awfixer.church"
}
```

Donate lives separately: `awfixersites-donate` → `donate.awfixer.church`.

### Environment variables

```hcl
resource "vercel_project_environment_variable" "church_auth_role" {
  project_id = vercel_project.church.id
  key        = "AUTH_DEPLOYMENT_ROLE"
  value      = "client"
  target     = ["production", "preview"]
  # sensitive = true for secrets
}
```

**Import existing projects** rather than recreate — OAuth redirect URIs and
`AUTH_OAUTH_*` secrets are tied to live project IDs.

```bash
terraform import vercel_project.church prj_xxxxxxxx
```

### Firewall

Per-app stubs in `infra/firewall/<app>/main.tf`. Consolidate into a shared module
with `for_each` over app keys. Match rules to Vercel dashboard → Firewall.

## What stays in vercel.ts (not Terraform)

From `src/vercel-app-config.ts`:

- Redirects: `/legal`, `/privacy`, `/terms`, `/careers`, `/donate`
- Security headers
- `fluid: true`, `bunVersion`, `cleanUrls`
- Crons (e.g. `/api/cleanup` on some apps)

These are **build/routing config** committed with the app. Terraform should not
duplicate them unless migrating to `vercel_project` routing resources (usually unnecessary).

## CLI (ad-hoc ops)

```bash
bunx vercel --version
bunx vercel project ls
bunx vercel env ls <project>
bunx vercel link   # local dev only — .vercel is gitignored
```

Use CLI for discovery during import; use Terraform for durable management.

## Import playbook (per app)

1. Get project ID: `bunx vercel project ls | grep awfixersites-church`
2. Write minimal `vercel_project` resource matching live settings
3. `terraform import vercel_project.church <id>`
4. `terraform plan` — iterate HCL until plan is empty
5. Import domains and critical env vars
6. Repeat for next app; do `auth` last

## Env var categories (by app type)

| Category | Apps | Keys |
|----------|------|------|
| Auth client | Most satellites | `AUTH_DEPLOYMENT_ROLE=client`, `AUTH_SECRET`, `AUTH_CLIENT_DATABASE_URL`, `AUTH_OAUTH_*` |
| Auth IdP | `auth` | `AUTH_DEPLOYMENT_ROLE=idp`, `PRISMA_DATABASE_URL` |
| Donations | `donate` | Stripe keys + church tenant metadata |
| Telemetry | Many | `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY` |

Full matrix: `docs/auth-deployment.md`.

## Safety

- Preview deployments rely on `VERCEL_URL` in auth (`packages/auth/src/config.ts`) — keep preview env vars intact
- BotID (`botid` package) is Vercel-specific — no Terraform equivalent needed
- Deployment checks: status names must match `deploymentCheckStatusName()` in `src/vercel-deployment-checks.ts`

## Related

- `/terraform-iac` — general workflow, state, module layout
- `/railway-iac` — Postgres and services outside Vercel

Docs: https://registry.terraform.io/providers/vercel/vercel/latest/docs