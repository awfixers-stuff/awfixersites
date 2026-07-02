# Routing Order Detail

Source: https://vercel.com/docs/routing#routing-order

## Layer interactions

### Firewall (layer 1)

Blocks before any routing. Custom WAF rules, IP blocks, rate limits, bot management. See `/vercel-security`.

### Skew Protection (layer 3)

Prevents version mismatch between static assets and server functions during active deployments. Clients may be redirected to fetch matching asset versions.

### Rolling Releases (layer 4)

Percentage-based traffic split between old and new production deployments. Enterprise feature.

### Bulk Redirects (layer 5)

Project-scoped, versioned redirect sets. Staged via API; activated without code deploy.

### Project Routes (layer 6)

Dashboard-managed rules. Override or supplement deployment config. Cannot configure middleware here.

### Deployment Routes (layer 7)

From `vercel.json`, `vercel.ts`, or `next.config.js`. Includes `headers`, `redirects`, `rewrites` arrays.

### Middleware (layer 8)

Edge function intercepting matched paths. Can rewrite, redirect, or modify headers dynamically.

### File System + Rewrites (layers 9–10)

App Router pages, API routes, then final rewrite transformations.

## Cache interaction

Routing resolves **before** CDN cache lookup. A cached 308 redirect will short-circuit later layers on cache hit.
