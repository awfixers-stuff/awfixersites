---
name: vercel-project-config
description: >
  Vercel project configuration expert from vercel.com/docs — vercel.json and
  vercel.ts properties (build, redirects, rewrites, headers, crons, functions,
  regions, fluid, bunVersion), @vercel/config/v1 typed config, and awfixersites
  fleet patterns in src/vercel-app-config.ts. Use when editing apps/*/vercel.ts,
  adding crons/redirects/headers, or tuning build commands. Triggers on:
  "vercel.json", "vercel.ts", "project configuration", "vercel config",
  "buildCommand", "crons", "fluid compute". Use when the user runs
  /vercel-project-config. Complements /vercel-routing and /vercel-iac.
---

# Vercel Project Configuration

Docs: https://vercel.com/docs/project-configuration

Three configuration surfaces:

| Surface | Location | Version controlled |
|---------|----------|-------------------|
| **vercel.json** | Static JSON in repo | Yes |
| **vercel.ts** | Programmatic TS at build time | Yes |
| **Dashboard** | Project Settings | No (unless exported) |

**One config file per project** — vercel.json OR vercel.ts, not both.

awfixersites uses **vercel.ts** with `@vercel/config/v1` for typed, shared fleet config.

## awfixersites architecture

```
src/vercel-app-config.ts     # Shared redirect/header/build logic
apps/<name>/vercel.ts        # Per-app config (generated pattern)
src/security-headers.ts      # Fleet security headers
src/donate-domains.ts        # Donate subdomain helpers
```

Each app exports default config:

```typescript
// apps/church/vercel.ts
import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export default createAppVercelConfig({
  name: "awfixersites-church",
  donateApex: "awfixer.church",
});
```

### Fleet defaults (createAppVercelConfig)

| Property | Value | Notes |
|----------|-------|-------|
| `framework` | `"nextjs"` | |
| `bunVersion` | `"1.x"` | Bun runtime for functions |
| `fluid` | `true` | Fluid compute enabled |
| `cleanUrls` | `true` | Strip .html extensions |
| `trailingSlash` | `false` | |
| `buildCommand` | `bun --bun ../../scripts/vercel-build.ts` | Monorepo build script |
| `installCommand` | `cd ../.. && bun install --frozen-lockfile` | Root install |
| `devCommand` | `bun --bun run dev` | |
| `crons` | optional `/api/cleanup` daily | `crons: true` to enable |

### Per-app options (AppVercelOptions)

```typescript
type AppVercelOptions = {
  name: string;                    // Vercel project display name
  legalRedirect?: boolean;         // default true — /legal → legal.awfixer.llc
  careersRedirect?: boolean;       // default true — /careers → careers.awfixer.llc
  donateApex?: string;             // e.g. "awfixer.church" → /donate redirects
  crons?: boolean;                 // enable cleanup cron
  extraRedirects?: Redirect[];     // app-specific redirects
};
```

Opt-out examples:
- `apps/legal` — `legalRedirect: false`
- `apps/careers` — `careersRedirect: false`

## vercel.json / vercel.ts property reference

### Build & deploy

| Property | Type | Description |
|----------|------|-------------|
| `buildCommand` | string | Override build (dashboard + package.json) |
| `installCommand` | string | Override install |
| `devCommand` | string | Override dev server |
| `outputDirectory` | string | Build output dir (non-framework) |
| `framework` | string | Framework preset slug |
| `ignoreCommand` | string | Exit 0 = skip build |
| `bunVersion` | `"1.x"` | Use Bun runtime |
| `fluid` | boolean | Enable fluid compute |

### Routing

| Property | Type | Description |
|----------|------|-------------|
| `redirects` | Redirect[] | HTTP redirects (308/307) |
| `rewrites` | Rewrite[] | Internal/external URL mapping |
| `headers` | HeaderRule[] | Response headers + cache control |
| `bulkRedirectsPath` | string | Path to CSV/JSON bulk redirects file |
| `cleanUrls` | boolean | Remove file extensions from URLs |
| `trailingSlash` | boolean | Add/remove trailing slashes |

### Functions

| Property | Type | Description |
|----------|------|-------------|
| `functions` | Record<glob, config> | Per-function maxDuration, regions, runtime |
| `regions` | string[] | Default function regions |
| `functionFailoverRegions` | string[] | Failover regions (Enterprise) |
| `crons` | Cron[] | Scheduled function invocations |

### Other

| Property | Type | Description |
|----------|------|-------------|
| `images` | object | Image optimization config |
| `public` | boolean | Public deployment logs/source |
| `$schema` | string | `"https://openapi.vercel.sh/vercel.json"` |

## Typed config with @vercel/config/v1

```typescript
import { routes } from "@vercel/config/v1";
import type { Redirect, VercelConfig } from "@vercel/config/v1/types";

const redirect = routes.redirect("/old", "/new", { permanent: true });
const cacheHeader = routes.cacheControl("/assets/(.*)", {
  public: true,
  maxAge: "1 year",
  immutable: true,
});
```

Prefer typed helpers over raw JSON for fleet consistency.

## Functions configuration

```json
{
  "functions": {
    "app/api/heavy/route.ts": { "maxDuration": 60 },
    "app/api/**/*.ts": { "maxDuration": 30, "regions": ["iad1"] }
  }
}
```

With **fluid compute**, set memory in dashboard (not vercel.json). `maxDuration` still works in config.

ISR routes accept same `functions` config (glob match on page paths).

## Crons

```json
{
  "crons": [
    { "path": "/api/cleanup", "schedule": "0 0 * * *" }
  ]
}
```

- Production only
- Path must start with `/`
- Max path length: 512, schedule: 256
- Cron expression: standard 5-field (minute hour day month weekday)

CLI (beta):

```bash
vercel crons ls
vercel crons add --path /api/cleanup --schedule "0 0 * * *"
vercel crons run /api/cleanup
```

## What stays in vercel.ts (NOT Terraform)

From `/vercel-iac`:

- Redirects (legal, careers, donate)
- Security headers
- `fluid`, `bunVersion`, `cleanUrls`
- Crons
- Build/install/dev commands

Terraform owns: project resource, domains, env vars, firewall rules.

## What stays in dashboard (NOT vercel.ts)

- Environment variables (managed via Terraform in awfixersites)
- Git connection settings
- Deployment protection
- Team access / RBAC
- Analytics integrations

## Schema autocomplete

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json"
}
```

Add to vercel.json or reference in vercel.ts for IDE validation.

## vercel.ts vs vercel.json

Use **vercel.ts** when:
- Sharing config across fleet (awfixersites pattern)
- Dynamic config from env vars at build time
- Type safety with `@vercel/config/v1`

Use **vercel.json** when:
- Simple static config
- Non-TypeScript projects
- Quick prototyping

## Adding a new app

1. Create `apps/<name>/vercel.ts` using `createAppVercelConfig`
2. Set `name: "awfixersites-<name>"`
3. Set `donateApex` if property has donate subdomain
4. Opt out of legal/careers redirects if app IS legal/careers
5. Register in `buildVercelProjectRegistry()` (`src/vercel-deployment-checks.ts`)
6. Add Terraform `vercel_project` + domain in `infra/backend/` (`/vercel-iac`)
7. Redeploy to apply routing config

## Common changes

### Add redirect

```typescript
export default createAppVercelConfig({
  name: "awfixersites-example",
  extraRedirects: [
    routes.redirect("/old-page", "/new-page", { permanent: true }) as Redirect,
  ],
});
```

### Add security header

Edit `src/security-headers.ts` — applies fleet-wide via `createAppVercelConfig`.

### Enable cleanup cron

```typescript
createAppVercelConfig({ name: "...", crons: true });
```

Requires `/api/cleanup` route handler in the app.

### Change build command

Edit `APP_BUILD` constant in `src/vercel-app-config.ts` — affects all apps.

## Related

- `/vercel-routing` — how redirects/rewrites evaluate
- `/vercel-caching` — cache headers in config
- `/vercel-deployments` — redeploy after config changes
- `/vercel-iac` — Terraform for project/env/domain

Deep reference: [references/vercel-json-properties.md](references/vercel-json-properties.md)