---
name: terraform-iac
description: >
  Terraform workflows for awfixersites infra — init, plan, apply, import, state,
  and module layout under infra/. Covers tfenv version pinning, backend setup,
  and coordinating Vercel + Railway providers. Use when working with Terraform,
  .tf files, terraform import, IaC, infra/backend, infra/firewall, or
  .terraform-version. Use when the user runs /terraform-iac.
---

# Terraform IaC (awfixersites)

Manage infrastructure declaratively. **Stay on Vercel for app hosting** — Terraform
orchestrates resources (projects, env vars, domains, firewall, Railway services),
not application code.

## Repo layout

```
infra/
  backend/main.tf          # Primary stack: vercel + railway providers
  firewall/<app>/main.tf   # Per-app Vercel firewall stubs (consolidate → for_each)
.terraform-version         # Pin: 1.15.7 (use tfenv)
src/vercel-deployment-checks.ts  # Project registry for for_each modules
apps/*/vercel.ts           # Build/deploy config (redirects, headers) — NOT duplicated in HCL
```

## Prerequisites

```bash
# Terraform (repo pins 1.15.7 via .terraform-version + tfenv)
terraform version

# Auth tokens (never commit)
export VERCEL_API_TOKEN=...        # vercel.com/account/tokens
export RAILWAY_TOKEN=...           # railway.app/account/tokens
```

## Standard workflow

Always run from the target module directory:

```bash
cd infra/backend
terraform init
terraform fmt -recursive ../..
terraform validate
terraform plan -out=tfplan
# Review plan carefully, then:
terraform apply tfplan
```

For per-app firewall modules:

```bash
cd infra/firewall/church
terraform init && terraform plan
```

## Import existing resources (preferred over recreate)

**Never delete Vercel projects to "start fresh".** Import live resources into state:

```bash
# Vercel project
terraform import vercel_project.church <project_id>

# Vercel project domain
terraform import vercel_project_domain.church <project_id>/<domain>

# Railway project
terraform import railway_project.backend <project_id>
```

Find IDs via dashboard or CLI (`bunx vercel project ls`, `railway status`).

After import, run `terraform plan` — drift should be minimal. Adjust HCL until plan is clean.

## Module consolidation (target architecture)

Replace 22 `infra/firewall/<app>/` roots with one module:

```hcl
# infra/modules/vercel-app/main.tf
variable "app_key" {}  # e.g. "church"
# Read project name from apps/<app_key>/vercel.ts or a generated apps.json
```

Drive `for_each` from the same registry as `buildVercelProjectRegistry()` in
`src/vercel-deployment-checks.ts`. Consider a codegen script:
`bun scripts/generate-terraform-apps.ts` → `infra/apps.auto.tfvars.json`.

## State backend

Local state exists under `infra/*/.terraform/`. For team use, migrate to remote:

- Terraform Cloud, S3 + DynamoDB, or compatible backend
- One state per stack (`backend`, `firewall`) or one unified state — pick one, document in `infra/README.md` when created

Add to `infra/backend/main.tf`:

```hcl
terraform {
  backend "remote" { ... }  # or s3, etc.
}
```

## Separation of concerns

| Layer | Owner | Examples |
|-------|-------|----------|
| App build behavior | `apps/*/vercel.ts` + `src/vercel-app-config.ts` | redirects, headers, crons, buildCommand |
| Platform resources | Terraform | project exists, domain attached, env vars, firewall |
| External services | Terraform (+ provider-specific skills) | Railway Postgres, Mailgun DNS |

## Safety rules

1. **Plan before every apply** — especially env var changes on auth/donate
2. **Pilot imports** on low-risk apps first: `church`, `donate`, then `auth` last
3. **Do not** put secret values in committed `.tf` — use `terraform.tfvars` (gitignored) or TF Cloud variables
4. **Do not** duplicate redirect rules from `vercel.ts` into HCL unless Vercel provider requires it for domains only
5. Run `terraform fmt` before committing `.tf` changes

## Related skills

- `/vercel-iac` — Vercel provider resources, project/env/domain patterns
- `/railway-iac` — Railway provider for databases and off-Vercel services

## Provider docs

- Vercel: https://registry.terraform.io/providers/vercel/vercel/latest/docs
- Railway: https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs