# Cache-Control Headers Reference

Source: https://vercel.com/docs/caching/cache-control-headers, https://vercel.com/docs/headers/cache-control-headers

## Required for CDN caching

At least one of:
- `s-maxage=<seconds>`
- `s-maxage=<seconds>, stale-while-revalidate=<seconds>`
- `s-maxage=<seconds>, stale-while-revalidate=<seconds>, stale-if-error=<seconds>`

`proxy-revalidate` is NOT supported.

## stale-while-revalidate

Serves stale content immediately while fetching fresh copy in background. Good for content tolerating brief staleness.

## stale-if-error

Serves stale content if origin returns error. Resilience pattern for flaky backends.

## Cache key composition

CDN cache key includes:
- URL path and query string
- `Vary` header values (specified request headers)
- `Accept` and `Accept-Encoding` (automatic)

## Next.js App Router caching

| API | Layer |
|-----|-------|
| `fetch(url, { cache: 'force-cache' })` | Runtime cache |
| `fetch(url, { next: { revalidate: N } })` | ISR + CDN |
| `export const revalidate = N` | ISR for page |
| `export const dynamic = 'force-dynamic'` | No static/ISR cache |
| `unstable_cache()` / `'use cache'` | Data cache (Next 15+) |

## External origin caching

Rewrites to external URLs can cache responses when origin returns `Cache-Control: s-maxage=N`.