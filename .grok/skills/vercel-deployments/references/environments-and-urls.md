# Environments & Generated URLs

Source: https://vercel.com/docs/deployments/environments, https://vercel.com/docs/deployments/generated-urls

## System environment variables (deployment-scoped)

| Variable                        | Description                               |
| ------------------------------- | ----------------------------------------- |
| `VERCEL`                        | `"1"` when running on Vercel              |
| `VERCEL_ENV`                    | `production`, `preview`, or `development` |
| `VERCEL_URL`                    | Deployment hostname (no protocol)         |
| `VERCEL_BRANCH_URL`             | Branch-specific hostname                  |
| `VERCEL_PROJECT_PRODUCTION_URL` | Production domain (if set)                |

Framework-prefixed variants exist (e.g. `NEXT_PUBLIC_VERCEL_URL` for Next.js).

## Preview deployment suffix

Teams can configure a custom preview suffix (`preview.example.com`) instead of `*.vercel.app`.

## Promoting deployments

When auto-promotion is disabled:

1. Preview deployment succeeds
2. Manual "Promote to Production" in dashboard or API
3. Production domains repoint to promoted deployment

## Deploy Hooks detail

- Created per project in Settings → Git → Deploy Hooks
- `GET` or `POST` to hook URL triggers build from configured branch
- Does not require new commit
- Useful for headless CMS, cron external triggers, webhook receivers

## REST API deployment creation

1. Compute SHA-1 of each file
2. `POST /v13/deployments` with file references
3. Poll deployment status

For file upload SHA generation: https://vercel.com/kb/guide/how-do-i-generate-an-sha-for-uploading-a-file-to-the-vercel-api

## Deployment protection interaction

Standard Protection restricts preview/generated URLs. Code using `VERCEL_URL` for server-to-server calls on the same deployment must switch to relative paths or cookie-forwarding. See `/vercel-security`.
