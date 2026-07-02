---
name: vercel-deployments
description: >
  Vercel deployments expert from vercel.com/docs — environments (local, preview,
  production, custom), deployment methods (Git, CLI, hooks, REST API), generated
  URLs, promote/rollback, redeploy, retention, and deployment checks. Use when
  shipping, debugging builds, managing preview vs production, or configuring
  deploy hooks and CI. Triggers on: "vercel deploy", "preview deployment",
  "promote to production", "rollback", "deploy hook", "vercel environments".
  Use when the user runs /vercel-deployments. Complements /vercel-iac (Terraform).
---

# Vercel Deployments

Docs: https://vercel.com/docs/deployments

Every successful build creates a **deployment** with a unique URL. awfixersites ships ~22 Next.js apps via Git → Vercel; Terraform manages project metadata (`/vercel-iac`), not deployment lifecycle.

## Environments

| Environment    | Trigger                                           | URL                        |
| -------------- | ------------------------------------------------- | -------------------------- |
| **Local**      | `vercel dev`, `next dev`                          | `localhost`                |
| **Preview**    | PR, non-prod branch push, `vercel` (no `--prod`)  | `*.vercel.app`, branch URL |
| **Production** | merge to prod branch, `vercel --prod`             | custom domain + prod alias |
| **Custom**     | `vercel deploy --target=staging` (Pro/Enterprise) | attached domain            |

Each environment has **separate env vars**. Preview deployments expose `VERCEL_URL` — auth satellites depend on this (`packages/auth/src/config.ts`). Never break preview env vars when changing auth.

### Local workflow (awfixersites)

```bash
cd apps/church
bunx vercel link          # once — .vercel is gitignored
bunx vercel env pull      # → .env.local
bun run dev               # or: bunx vercel dev
```

Monorepo apps use Root Directory `apps/<name>` in Vercel dashboard. Link from inside the app directory.

### Preview URLs

Two URL types per deployment:

- **Branch URL** — always points to latest on that branch (`project-git-branch-team.vercel.app`)
- **Commit URL** — immutable for that deployment (`project-<hash>-team.vercel.app`)

Auth OAuth redirect URIs must include both preview and production URLs. See `docs/auth-deployment.md`.

### Custom environments (Pro: 1, Enterprise: 12)

```bash
vercel deploy --target=staging
vercel pull --environment=staging
vercel env add MY_KEY staging
```

## Deployment methods

### 1. Git (primary for awfixersites)

Push to connected repo → automatic deployment. Supported: GitHub, GitLab, Bitbucket, Azure DevOps.

Dashboard can deploy from a specific Git reference (commit/branch) without a new push.

### 2. Vercel CLI

```bash
bunx vercel              # preview deployment
bunx vercel --prod       # production
bunx vercel build        # local build artifact (CI)
bunx vercel build --prod # production build locally
```

CI/CD: set `VERCEL_TOKEN` (not `--token` in logs). Link project once, then deploy with token.

### 3. Deploy Hooks

HTTP GET/POST to unique URL triggers deployment **without a new commit**. Requires connected Git repo.

```bash
vercel deploy-hooks ls
vercel deploy-hooks create cms-rebuild --ref main
```

Use for CMS rebuilds, scheduled external triggers, or webhook integrations.

### 4. REST API

Upload files by SHA → create deployment. For custom CI, multi-tenant, or non-Git workflows.

```bash
# Discovery
bunx vercel list
bunx vercel inspect <deployment-url> --logs
bunx vercel inspect <deployment-url> --wait
```

## Managing deployments

Dashboard: Project → Deployments → filter by branch/status/environment.

| Action                    | When                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| **Redeploy**              | Bad build cache, env var change, outage resiliency, analytics enable |
| **Promote to production** | Manual promotion when auto-promote disabled                          |
| **Rollback**              | Revert production to previous deployment                             |
| **Delete**                | Cleanup; breaks instant rollback and PR integration links            |
| **Assign domain**         | Point custom domain to any deployment                                |

### Rollback

```bash
# CLI workflow — see docs/deployments/rollback-production-deployment
bunx vercel rollback
```

Instant rollback requires the target deployment still exists (check retention policy).

### Redeploy with/without build cache

Redeploy when:

- Environment variables changed (values don't apply until redeploy)
- Build & Development Settings changed
- Suspected stale build cache
- Redirect/rewrite config changed

Choose "use existing build cache" only when source unchanged and cache is trusted.

### Deployment retention

Configure auto-delete of old deployments. Deleting removes instant-rollback target.

Settings: Project → Settings → Deployment Retention (or team security settings).

## Deployment checks

Vercel supports GitHub-style checks on deployments. awfixersites status names must match `deploymentCheckStatusName()` in `src/vercel-deployment-checks.ts`.

Checks can block promotion. Re-request failed checks via REST API or dashboard.

## Inspecting deployments

Dashboard → Deployment → Resources tab shows:

- Middleware matchers
- Static assets (sizes)
- Functions (runtime, region, size)

CLI:

```bash
bunx vercel inspect <url> --logs
bunx vercel bisect --good <url> --bad <url>   # binary search regressions
bunx vercel logs
```

## Generated URLs and auth

`VERCEL_URL` / `VERCEL_BRANCH_URL` are system env vars. With **Standard Deployment Protection**, production generated URLs become restricted — use relative fetch paths or pass cookies on server-side requests.

```typescript
// Client: use relative paths when protection enabled
fetch("/api/data"); // not fetch(`${process.env.VERCEL_URL}/api/data`)

// Server: forward cookies from incoming request
const headers = { cookie: request.headers.get("cookie") ?? "" };
fetch(`${request.nextUrl.origin}/api/data`, { headers });
```

## Skew protection & rolling releases

- **Skew Protection** — ensures client/server asset versions match during deploys
- **Rolling Releases** — gradually routes traffic to new deployment

Both run in routing layer before cache. See `/vercel-routing`.

## awfixersites fleet notes

- Build command (all apps): `bun --bun ../../scripts/vercel-build.ts`
- Install: `cd ../.. && bun install --frozen-lockfile`
- Project names: `awfixersites-<app>` (auth: `awfixersites-auth-app`)
- Config in `apps/*/vercel.ts` — redeploy after routing/header/cron changes
- Terraform owns domains/env vars; redeploy needed after env var Terraform apply

## Decision tree

```
Need to ship code?
├─ Normal PR workflow → Git push (preview auto-created)
├─ Hotfix to production → merge to main OR vercel --prod
├─ Test without commit → vercel (preview)
├─ External trigger → deploy hook
├─ Revert live site → rollback production deployment
├─ Env var changed → redeploy (or wait for next Git push)
└─ Bad build cache → redeploy without cache
```

## Related

- `/vercel-project-config` — vercel.ts build/routing config
- `/vercel-iac` — Terraform project/domain/env management
- `/vercel-security` — deployment protection on preview URLs
- `/vercel-domains` — assign domains to deployments

Deep reference: [references/environments-and-urls.md](references/environments-and-urls.md)
