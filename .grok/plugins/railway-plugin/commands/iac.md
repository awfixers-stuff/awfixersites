---
name: iac
description: Open Railway Terraform IaC guidance and show current infra/backend state
---

# Railway IaC

Navigate Railway Terraform infrastructure for awfixersites.

## Steps

1. Load `railway-iac`, `railway-vercel-wiring`, and `terraform-iac` skills.

2. Read current stack:
   ```bash
   ls -la infra/backend/
   cat infra/backend/main.tf
   ```

3. Check Terraform state:
   ```bash
   cd infra/backend
   terraform init -backend=false 2>/dev/null || true
   terraform validate 2>&1
   ```

4. Summarize:
   - Provider versions pinned in `main.tf`
   - Railway resources defined (or stub state)
   - Cross-provider wiring to Vercel (if any)
   - Import candidates (resources in dashboard but not in state)

5. Suggest next action based on "$ARGUMENTS":
   - No args → show status and available commands
   - "plan" → run `/railway:plan`
   - "import" → run `/railway:import`
   - Resource name → show relevant HCL patterns from `railway-iac` skill