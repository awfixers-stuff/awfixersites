---
name: import
description: Import existing Railway resources into Terraform state. Pass resource type and ID.
---

# Railway Import

Import live Railway resources into Terraform state at `infra/backend/`.

## Steps

1. Load `railway-iac` skill.
2. Discover existing resources:
   ```bash
   railway list
   railway status
   ```
3. Read `infra/backend/main.tf` — ensure matching `resource` blocks exist before import.

## Import commands

```bash
cd infra/backend
terraform init

# Project
terraform import railway_project.awfixersites <project_id>

# Service
terraform import railway_service.postgres <service_id>
```

If "$ARGUMENTS" provides `resource_type:resource_id`, construct the import command.

## Post-import

```bash
terraform plan
```

Goal: plan shows minimal drift. Adjust HCL until clean.

## Safety

- Never delete live resources to "start fresh"
- Import before apply on existing infrastructure
- Pilot on low-risk services first
