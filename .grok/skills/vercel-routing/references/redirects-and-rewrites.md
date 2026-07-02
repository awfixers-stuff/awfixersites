# Redirects & Rewrites Reference

Source: https://vercel.com/docs/routing/redirects, https://vercel.com/docs/routing/rewrites

## Redirect conditions

```json
{
  "redirects": [
    {
      "source": "/:path((?!uk/).*)",
      "has": [{ "type": "header", "key": "x-vercel-ip-country", "value": "GB" }],
      "destination": "/uk/:path*",
      "permanent": false
    }
  ]
}
```

Supported `has` / `missing` condition types: `header`, `cookie`, `host`, `query`.

## Named groups and regex

- `:param` — named segment
- `:param*` — splat (zero or more segments)
- `:param(n)` — repeating n times
- `:param((?!exclude).*)` — negative lookahead regex

## External rewrite caching

External origin responses with `Cache-Control: s-maxage=N` are cached at Vercel CDN edge, reducing load on origin.

## next.config.js vs vercel.json

For Next.js apps, prefer `next.config.js` `redirects()` / `rewrites()` / `headers()` for framework-native patterns. awfixersites uses `vercel.ts` via `@vercel/config/v1` for typed, shared fleet config.

Both are "deployment routes" in the evaluation order.

## Microfrontends

Routes between multiple Vercel projects on the same domain. Runs early in routing order (step 2). See https://vercel.com/docs/microfrontends.
