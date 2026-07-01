---
name: plan
description: Run terraform plan on infra/backend Railway stack and review changes
---

# Railway Terraform Plan

Run a safe `terraform plan` for the Railway + Vercel backend stack.

## Preflight

1. Load `railway-iac` and `terraform-iac` skills.
2. Verify tokens are available (do not print values):
   ```bash
   test -n "$RAILWAY_TOKEN" && echo "RAILWAY_TOKEN: set" || echo "RAILWAY_TOKEN: missing"
   test -n "$VERCEL_API_TOKEN" && echo "VERCEL_API_TOKEN: set" || echo "VERCEL_API_TOKEN: missing"
   ```
3. If tokens missing, tell user to export them — never commit or log token values.

## Plan

```bash
cd infra/backend
terraform init
terraform fmt -check -recursive ../.. 2>&1 || terraform fmt -recursive ../..
terraform validate
terraform plan -out=tfplan
```

## Review

Present plan summary:
- Resources to add / change / destroy
- **Flag any destroy operations** — especially `railway_volume` replaces
- **Flag env var changes** on auth-related resources
- Sensitive value changes (show as `(sensitive)` only)

## Safety gates

Stop and warn if plan includes:
- `railway_volume` must be replaced
- `PRISMA_DATABASE_URL` changes on auth project
- Any `destroy` on production-tagged resources

Ask user for explicit confirmation before suggesting `terraform apply`.

Do NOT run `terraform apply` unless user explicitly requests it.