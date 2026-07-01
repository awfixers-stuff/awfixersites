---
name: vercel-routing
description: >
  Vercel routing expert from vercel.com/docs — request evaluation order (firewall,
  bulk redirects, project routes, deployment routes, middleware, rewrites), redirects,
  rewrites (internal and external), headers, bulk redirects, and project-level routing
  rules. Use when configuring vercel.json/vercel.ts redirects, debugging 404/redirect
  loops, or proxying APIs. Triggers on: "vercel redirect", "vercel rewrite",
  "routing middleware", "bulk redirects", "vercel headers". Use when the user runs
  /vercel-routing. Complements /vercel-project-config and /vercel-iac.
---

# Vercel Routing

Docs: https://vercel.com/docs/routing

Routing rules evaluate **before** cache and functions. awfixersites centralizes satellite redirects in `src/vercel-app-config.ts` → `apps/*/vercel.ts`.

## Request evaluation order

```
1. Firewall (WAF, DDoS, bot rules)
2. Microfrontends routing
3. Skew Protection
4. Rolling Releases
5. Bulk Redirects (project-level CSV/JSON)
6. Project Routes (dashboard/API, no deploy needed)
7. Deployment Routes (vercel.json / vercel.ts / next.config)
   ├─ Headers
   ├─ Redirects
   └─ Rewrites
8. Routing Middleware (middleware.ts / proxy.ts)
9. File System Routes (App Router / Pages)
10. Rewrites (URL transformation, final)
```

**Debugging tip:** If a request never reaches your app, check layers 1–7 first. Middleware runs after static route config but before filesystem matching.

## Redirects vs rewrites

| | Redirect | Rewrite (same app) | Rewrite (external) |
|---|----------|-------------------|-------------------|
| Browser URL | Changes | Unchanged | Unchanged |
| HTTP status | 301/302/307/308 | 200 (internal) | 200 (proxied) |
| Use for | SEO moves, HTTPS, locale | Clean URLs, A/B | API proxy, incremental migration |

### Redirect syntax (vercel.ts / vercel.json)

```typescript
import { routes } from "@vercel/config/v1";

// Permanent redirect with splat
routes.redirect("/old/:path*", "https://new.example.com/:path*", {
  permanent: true,
});

// Temporary
routes.redirect("/beta", "/v2", { permanent: false });
```

Status codes:
- `permanent: true` → 308 (or 301)
- `permanent: false` → 307 (or 302)

### Rewrite syntax

```json
{
  "rewrites": [
    { "source": "/blog/:slug", "destination": "/posts/:slug" },
    { "source": "/api/:path*", "destination": "https://api.example.com/:path*" }
  ]
}
```

External rewrites proxy through Vercel CDN — responses can be CDN-cached. See `/vercel-caching`.

## awfixersites redirect patterns

From `src/vercel-app-config.ts`:

| Pattern | Destination | Apps |
|---------|-------------|------|
| `/legal`, `/privacy`, `/terms`, `/security`, `/agreements` | `legal.awfixer.llc` | all satellites (opt-out on legal app) |
| `/careers/:path*` | `careers.awfixer.llc/:path*` | all except careers |
| `/donate`, `/donations` | `donate.<apex>` | apps with `donateApex` set |

```typescript
// apps/church/vercel.ts
import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export default createAppVercelConfig({
  name: "awfixersites-church",
  donateApex: "awfixer.church",
});
```

**Never duplicate** these redirects in Terraform or dashboard project routes unless intentionally overriding — `vercel.ts` is the source of truth for build/routing config.

## Headers

Security headers applied fleet-wide via `securityHeaders` in `src/security-headers.ts`:

```typescript
headers: [
  { source: "/(.*)", headers: [...securityHeaders] },
  routes.cacheControl("/static/(.*)", {
    public: true,
    maxAge: "1 week",
    immutable: true,
  }),
]
```

Function response headers **override** vercel.json/next.config headers for the same route.

## Bulk redirects

For thousands of URL changes — upload CSV/JSON/JSONL at project level:

```bash
# Project-level, no deploy required
# Dashboard: Project → Settings → Redirects → Bulk
```

CLI/API stages new redirect versions. Bulk redirects run **before** deployment-level redirects.

Format: source path → destination (see docs/routing/redirects/bulk-redirects).

## Project-level routing rules

Configure from dashboard or REST API **without deploying code**. Same actions as deployment routes except Routing Middleware.

Use when:
- Marketing needs URL changes without engineering deploy
- Emergency redirect during incident
- Rules that change frequently

Differences from deployment routes: https://vercel.com/docs/routing/project-routing-rules#differences-from-deployment-level-routes

## Routing Middleware

Next.js: `middleware.ts` at app root (or `src/middleware.ts`). Runs on Edge runtime.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Auth checks, geo routing, A/B, etc.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
```

Matcher config: https://vercel.com/docs/routing-middleware/api#match-paths-based-on-custom-matcher-config

**Deployment Protection** requires auth for middleware too — unauthenticated requests to protected previews are blocked before middleware runs.

## Common pitfalls

1. **Redirect loop** — source matches destination pattern; test with `curl -I`
2. **Splat ordering** — more specific rules should come first in array
3. **cleanUrls + trailingSlash** — awfixersites uses `cleanUrls: true`, `trailingSlash: false`
4. **Monorepo root** — redirects in `apps/foo/vercel.ts` apply to that project's root directory only
5. **External rewrite timeout** — proxied origins inherit function timeout limits
6. **OAuth redirects** — auth callback URLs must not be caught by satellite legal/careers redirects

## Debugging

```bash
curl -I https://awfixer.church/legal          # expect 308 → legal.awfixer.llc
curl -I https://awfixer.church/donate         # expect 308 → donate.awfixer.church
bunx vercel inspect <deployment>              # see configured middleware matchers
```

Check response headers: `x-vercel-id`, `location` (redirects), `x-matched-path` (rewrites).

## CLI

```bash
bunx vercel curl /api/health          # test with deployment protection bypass
bunx vercel httpstat /api/slow        # timing breakdown
```

## Related

- `/vercel-project-config` — vercel.ts property reference
- `/vercel-caching` — cache headers on routes
- `/vercel-security` — firewall runs before routing
- `/vercel-deployments` — redeploy after routing config changes

Deep references:
- [references/redirects-and-rewrites.md](references/redirects-and-rewrites.md)
- [references/routing-order.md](references/routing-order.md)