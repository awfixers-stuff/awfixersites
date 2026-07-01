# @awfixersites/auth — Agent Handoff

Read this before touching auth.

## Architecture

| Role              | Host                                  | Purpose                                           |
| ----------------- | ------------------------------------- | ------------------------------------------------- |
| **IdP**           | `auth.awfixer.me` (`apps/auth`)       | Passkey + mandatory TOTP, username, OIDC provider |
| **Account**       | `account.awfixer.me` (`apps/account`) | User dashboard + admin (role-gated)               |
| **OAuth clients** | All other `apps/*`                    | Delegate sign-in to IdP via `genericOAuth`        |

Synthetic emails: `{username}@id.awfixer.army` — never shown in UI.

## Commands

```bash
bun run auth:generate   # prisma generate (packages/auth)
bun run auth:push       # prisma db push (requires PRISMA_DATABASE_URL)
bun run prisma:push     # auth + db packages
bun scripts/wire-oauth-apps.ts   # scaffold OAuth routes on satellite apps
```

## Env — IdP (`apps/auth`)

| Variable                     | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `AUTH_DEPLOYMENT_ROLE`       | `idp`                                              |
| `PRISMA_DATABASE_URL`        | IdP Postgres (users, passkeys, TOTP, OAuth apps)   |
| `AUTH_PASSKEY_RP_ID`         | `awfixer.me` in prod                               |
| `AUTH_ADMIN_USERNAMES`       | Comma-separated usernames promoted to `role=admin` |
| `AUTH_OAUTH_{SITE}_CLIENT_*` | One set per satellite app (see `oauth-sites.ts`)   |

## Env — OAuth client apps

| Variable                   | Purpose                        |
| -------------------------- | ------------------------------ |
| `AUTH_DEPLOYMENT_ROLE`     | `client`                       |
| `AUTH_OAUTH_SITE_KEY`      | Site key from `oauth-sites.ts` |
| `AUTH_CLIENT_DATABASE_URL` | Local session DB               |
| `AUTH_IDP_URL`             | `https://auth.awfixer.me`      |

Account app admin routes also need `PRISMA_DATABASE_URL` (or `AUTH_IDP_DATABASE_URL`) server-side.

## Mandatory account setup

1. Register passkey (username on sign-up)
2. Enable + verify TOTP at `/setup/totp`
3. Every passkey sign-in continues through `/verify/totp`

## Key files

```
packages/auth/src/
  auth-options.ts      # IdP plugins: username, passkey, twoFactor, oidcProvider
  oauth-sites.ts       # Registry of all satellite OAuth clients
  oauth-clients.ts     # Env-driven client config + trusted OIDC clients
  account-setup.ts     # Setup completeness helpers
  idp-prisma.ts        # IdP DB access for admin (not client session DB)
  admin/               # User + OAuth client admin queries
```

_Last updated: 2026-06-30._
