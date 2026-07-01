# @awfixersites/auth — Agent Handoff

Read this before touching auth.

## Architecture

| Role              | Host                                  | Purpose                                           |
| ----------------- | ------------------------------------- | ------------------------------------------------- |
| **IdP**           | `auth.awfixer.me` (`apps/auth`)       | Passkey + mandatory TOTP, username, OIDC provider |
| **Account**       | `account.awfixer.me` (`apps/account`) | User dashboard + admin (role-gated)               |
| **OAuth clients** | All other `apps/*`                    | Delegate sign-in to IdP via `genericOAuth`        |

Synthetic emails: `{username}@id.awfixer.army` — never shown in UI.

User IDs are **Snowflake** decimal strings (`packages/auth/src/snowflake.ts`), generated via `advanced.generateId`.

## Commands

```bash
bun run auth:generate   # prisma generate (packages/auth)
bun run auth:push       # prisma db push (requires PRISMA_DATABASE_URL)
bun run prisma:push     # auth + db packages
bun run --cwd packages/auth promote-admins   # one-time admin promotion post-deploy
bun scripts/wire-oauth-apps.ts   # scaffold OAuth routes on satellite apps
```

## Env — IdP (`apps/auth`)

| Variable                     | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `AUTH_DEPLOYMENT_ROLE`       | `idp` (required in production)                   |
| `PRISMA_DATABASE_URL`        | IdP Postgres (users, passkeys, TOTP, OAuth apps) |
| `AUTH_PASSKEY_RP_ID`         | `awfixer.me` in prod                             |
| `AUTH_ADMIN_USERNAMES`       | Comma-separated usernames for `promote-admins`   |
| `AUTH_SNOWFLAKE_WORKER_ID`   | Snowflake worker id (0–1023) per deployment      |
| `AUTH_OAUTH_{SITE}_CLIENT_*` | One set per satellite app (see `oauth-sites.ts`) |

## Env — OAuth client apps

| Variable                   | Purpose                           |
| -------------------------- | --------------------------------- |
| `AUTH_DEPLOYMENT_ROLE`     | `client` (required in production) |
| `AUTH_OAUTH_SITE_KEY`      | Site key from `oauth-sites.ts`    |
| `AUTH_CLIENT_DATABASE_URL` | Local session DB                  |
| `AUTH_IDP_URL`             | `https://auth.awfixer.me`         |

Account app admin routes also need `PRISMA_DATABASE_URL` (or `AUTH_IDP_DATABASE_URL`) server-side.

## Mandatory account setup (server-enforced)

1. Register passkey (username on sign-up; existing usernames are rejected)
2. Enable + verify TOTP at `/setup/totp` (session created after passkey registration)
3. Every passkey sign-in with TOTP enabled is challenged server-side (`passkey-two-factor` plugin) before a full session is issued
4. OIDC authorize/token/userinfo reject incomplete accounts (`account-setup-guard` plugin)

`returnTo` redirects are validated against registered OAuth site apexes (`resolveSafeReturnTo`).

## Security notes

- Password sign-in is **disabled** on the IdP (`emailAndPassword.enabled: false`).
- TOTP secrets and backup codes are encrypted at rest by Better Auth using `AUTH_SECRET`.
- Admin role is **not** granted at signup; run `promote-admins` after deploy.
- Satellite admin routes re-check role against IdP userinfo (`isAdminSessionFresh`).
- Rate limiting uses database storage (durable on serverless).

## Key files

```
packages/auth/src/
  auth-options.ts           # IdP plugins + hooks
  snowflake.ts              # Snowflake user/id generation
  plugins/
    passkey-two-factor.ts   # Server-side TOTP gate for passkey sign-in
    account-setup-guard.ts  # Blocks OIDC for incomplete accounts
  passkey-users.ts          # Sign-up user creation (create-only)
  oauth-sites.ts            # Registry of all satellite OAuth clients
  oauth-clients.ts          # Env-driven client config + trusted OIDC clients
  account-setup.ts          # Setup completeness helpers
  account-setup.server.ts   # Server-side setup checks
  server-session.ts         # getServerSession / getAuthenticatedSession
  idp-prisma.ts             # IdP DB access for admin (not client session DB)
  admin/                    # User + OAuth client admin queries
```

_Last updated: 2026-07-01._
