---
name: postgres
description: Railway Postgres provisioning, topology, and Prisma wiring for awfixersites
---

# Railway Postgres

Guide Postgres setup and wiring for awfixersites.

## Steps

1. Load `railway-postgres`, `railway-vercel-wiring`, and `railway-iac` skills.

2. Determine intent from "$ARGUMENTS":
   - No args → show current topology and env var matrix
   - "deploy" or "create" → provision Postgres
   - "wire" or "vercel" → show cross-provider Terraform pattern
   - App name (e.g. "auth") → show app-specific DB config

3. For provisioning, prefer Terraform:
   ```hcl
   resource "railway_service" "postgres" {
     project_id   = railway_project.awfixersites.id
     name         = "postgres"
     source_image = "ghcr.io/railwayapp-templates/postgres-ssl:16"
   }
   ```
   Or MCP: "Deploy a Postgres database"

4. Show Prisma integration:
   - Canonical var: `PRISMA_DATABASE_URL`
   - Resolver: `packages/env/src/index.ts`
   - Local push: `bun run auth:push`

5. Warn about volume safety — never replace Postgres volumes without backup.