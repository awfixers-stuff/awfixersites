# vercel.json Properties Reference

Source: https://vercel.com/docs/project-configuration/vercel-json

## Redirect object

```json
{
  "source": "/old/:path*",
  "destination": "https://new.example.com/:path*",
  "permanent": true,
  "statusCode": 308
}
```

Optional: `has`, `missing` (conditional redirects).

## Rewrite object

```json
{
  "source": "/api/:path*",
  "destination": "https://backend.example.com/:path*"
}
```

## Header object

```json
{
  "source": "/(.*)",
  "headers": [
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

## Function config object

```json
{
  "maxDuration": 30,
  "regions": ["iad1"],
  "functionFailoverRegions": ["pdx1"],
  "runtime": "@vercel/node@3.0.0",
  "includeFiles": "lib/**",
  "excludeFiles": "tests/**",
  "supportsCancellation": true
}
```

## images config

```json
{
  "images": {
    "sizes": [640, 750, 828, 1080, 1200],
    "domains": ["images.example.com"],
    "remotePatterns": [{ "protocol": "https", "hostname": "**.example.com" }]
  }
}
```

## Git configuration (in vercel.json)

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "feature/*": false
    }
  }
}
```

## Monorepo notes

When Vercel Root Directory is `apps/<name>`:

- `vercel.ts` lives in `apps/<name>/vercel.ts`
- `installCommand` must reach monorepo root (`cd ../.. && bun install`)
- `buildCommand` references `../../scripts/vercel-build.ts`
