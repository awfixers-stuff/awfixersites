---
name: vercel-caching
description: >
  Vercel caching expert from vercel.com/docs — CDN cache, ISR, runtime cache,
  image cache, Cache-Control headers (s-maxage, CDN-Cache-Control,
  Vercel-CDN-Cache-Control), Vary, purge/invalidate, request collapsing, and
  debugging stale content. Use when fixing stale pages, tuning cache headers,
  purging CDN, or optimizing data fetching. Triggers on: "vercel cache",
  "CDN cache", "stale content", "purge cache", "ISR", "s-maxage",
  "runtime cache". Use when the user runs /vercel-caching.
---

# Vercel Caching

Docs: https://vercel.com/docs/caching

Vercel caches at multiple layers. Requests check each layer in order; first hit wins.

```
Client → PoP → CDN Cache → ISR Cache → Vercel Function → Runtime Cache → Backend
```

## Cache layers

| Layer             | What                                        | Control                                                   |
| ----------------- | ------------------------------------------- | --------------------------------------------------------- |
| **CDN cache**     | Full HTTP responses at edge                 | `Cache-Control`, `vercel.json` headers                    |
| **ISR cache**     | Pre-rendered pages (durable, single region) | Next.js `revalidate`, `generateStaticParams`              |
| **Runtime cache** | Data inside functions                       | `fetch` with cache, `getCache()` from `@vercel/functions` |
| **Image cache**   | Optimized images                            | Automatic via Image Optimization                          |
| **Build cache**   | Build artifacts                             | Remote cache for monorepos                                |

awfixersites sets static asset caching in `createAppVercelConfig()`:

```typescript
routes.cacheControl("/static/(.*)", {
  public: true,
  maxAge: "1 week",
  immutable: true,
});
```

## CDN cache

### When to use

- Static pages same for all users
- API responses that change infrequently
- Hashed static assets (`/_next/static/`)
- SSR pages with predictable TTL

### When NOT to use

- User-specific content without `Vary` header
- Responses with sensitive data
- Content that changes every request

### Cache-Control directives

Function responses need one of:

- `s-maxage=N`
- `s-maxage=N, stale-while-revalidate=Z`
- `s-maxage=N, stale-while-revalidate=Z, stale-if-error=Z`

```typescript
export async function GET() {
  return new Response(JSON.stringify({ data: "value" }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

### Three-tier header control

| Header                     | Affects                       | Returned to browser |
| -------------------------- | ----------------------------- | ------------------- |
| `Cache-Control`            | Browser + shared caches       | Yes                 |
| `CDN-Cache-Control`        | Downstream CDNs (not browser) | Yes                 |
| `Vercel-CDN-Cache-Control` | Vercel CDN only               | No                  |

```typescript
headers: {
  "Cache-Control": "max-age=10",                    // browser: 10s
  "CDN-Cache-Control": "max-age=60",                // other CDNs: 60s
  "Vercel-CDN-Cache-Control": "max-age=3600",       // Vercel edge: 1h
}
```

Without `CDN-Cache-Control`, Vercel strips `s-maxage` and `stale-while-revalidate` before sending to browser.

### Priority

Function response headers **override** `vercel.json` / `next.config.js` headers for the same route.

### Static files

Automatic CDN caching for deployment lifetime. Hashed filenames persist across deployments.

Browser headers: `max-age=N, public` or `max-age=N, immutable`.

### Vary header

Cache different responses per request header value. Requires caching directive to take effect.

```typescript
return Response.json(content, {
  headers: {
    "Cache-Control": "s-maxage=3600",
    Vary: "X-Vercel-IP-Country",
  },
});
```

Vercel CDN already varies on `Accept` and `Accept-Encoding` by default.

### Debug cache hits

Check response header `x-vercel-cache`:

- `HIT` — served from CDN
- `MISS` — fetched from origin
- `STALE` — served stale while revalidating
- `BYPASS` — cache skipped

```bash
curl -I https://awfixer.church/static/logo.png | grep -i x-vercel-cache
```

## ISR (Incremental Static Regeneration)

Next.js App Router:

```typescript
export const revalidate = 3600; // seconds

// Or per-fetch
const res = await fetch(url, { next: { revalidate: 60 } });
```

ISR stores in durable storage in function region. CDN checks ISR before invoking function.

### Request collapsing

Multiple simultaneous requests for same uncached content → single backend call. Protects origin during traffic spikes.

## Runtime cache

For data fetched inside functions — region-aware, persists across invocations.

```typescript
import { getCache } from "@vercel/functions";

const cache = getCache();
const cached = await cache.get("user:123");
if (!cached) {
  const data = await db.user.find("123");
  await cache.set("user:123", data, { ttl: 300 });
}
```

Use instead of in-process `Map`/`LRU` in serverless — process memory is not shared.

Next.js `fetch(..., { cache: "force-cache" })` also uses runtime cache layer.

## Purging CDN cache

```bash
bunx vercel cache purge                    # all cache types
bunx vercel cache purge --type cdn         # CDN only
bunx vercel cache purge --type data        # data cache (ISR)
bunx vercel cache invalidate --tag my-tag  # tag-based (foreground revalidate)
bunx vercel cache dangerously-delete --tag my-tag  # immediate purge
```

| Method                 | Behavior                                                       |
| ---------------------- | -------------------------------------------------------------- |
| **invalidate**         | Marks stale; revalidates on next request (safe)                |
| **dangerously-delete** | Immediate purge; next request blocks on origin (use carefully) |

Purge by: deployment URL, cache tag, source image (image optimization).

Dashboard: Project → Settings → Caches, or deployment → ... → Purge Cache.

### When to purge

- Content updated outside normal revalidation window
- Emergency content removal
- After env var change affecting rendered output (often easier to redeploy)

## Image cache

Automatic after first Image Optimization request. Persists across deployments for static and remote images.

## Build / remote cache

Monorepo build artifact caching — separate from request caching. See Vercel Remote Caching for Turborepo.

## awfixersites patterns

1. **Static assets** — 1 week immutable via vercel.ts headers on `/static/(.*)`
2. **Security headers** — `Cache-Control: no-store` on sensitive API routes (set in route handlers)
3. **Auth sessions** — never CDN-cache authenticated responses
4. **Satellite pages** — default Next.js static/ISR; no custom ISR tuning fleet-wide yet

## Debugging stale content

1. Check `x-vercel-cache` header
2. Verify function returns correct `Cache-Control`
3. Check if function headers override vercel.json
4. Purge CDN: `vercel cache purge --type cdn`
5. For ISR: `vercel cache purge --type data`
6. Redeploy if build cache suspect

```bash
bunx vercel cache purge --type cdn
# or diagnose:
# https://vercel.com/docs/caching/cdn-cache/debug-cache-issues
```

## Related

- `/vercel-routing` — headers defined in vercel.ts
- `/vercel-project-config` — headers property in vercel.json
- `/vercel-deployments` — redeploy vs purge decision

Deep reference: [references/cache-control-headers.md](references/cache-control-headers.md)
