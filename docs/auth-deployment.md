# Auth system — configuration and deployment

This guide covers how to configure and deploy the AWFixer identity stack (`@awfixersites/auth`). It focuses on environment variables and secrets that are easy to miss because most `apps/*/.env.example` files only list a subset of what production actually requires.

For architecture context and file locations, see [`packages/auth/HANDOFF.md`](../packages/auth/HANDOFF.md).

## Architecture at a glance

| Role              | Vercel project                        | Host                 | Database                                              |
| ----------------- | ------------------------------------- | -------------------- | ----------------------------------------------------- |
| **IdP**           | `apps/auth` → `awfixersites-auth-app` | `auth.awfixer.me`    | One Postgres for users, passkeys, TOTP, OAuth clients |
| **Account**       | `apps/account`                        | `account.awfixer.me` | Client session DB **and** IdP DB (admin)              |
| **OAuth clients** | Every other `apps/*`                  | Per-site apex domain | Per-app session Postgres (separate from IdP)          |

Sign-in flow:

1. User visits a satellite site (e.g. `awfixer.army/sign-in`).
2. The site redirects to the IdP (`auth.awfixer.me`) via OIDC.
3. User authenticates with passkey + TOTP on the IdP.
4. The IdP issues tokens; the satellite stores a local session in its own DB.

Synthetic emails (`{username}@id.awfixer.army`) are internal only and never shown in UI.

## Two deployment roles

The auth package runs in one of two modes, controlled by `AUTH_DEPLOYMENT_ROLE`:

| Value    | Used by                   | Behavior                                                       |
| -------- | ------------------------- | -------------------------------------------------------------- |
| `idp`    | `apps/auth`               | Hosts login, passkey registration, TOTP, and the OIDC provider |
| `client` | All other apps using auth | Delegates sign-in to the IdP via `genericOAuth`                |

In **production**, `AUTH_DEPLOYMENT_ROLE` must be set explicitly (`idp` or `client`); the app will fail to start if it is missing. In local development, the code infers `client` unless the app URL contains `auth.awfixer`.

`trustedOrigins` automatically includes `AUTH_TRUSTED_ORIGINS`, plus `VERCEL_URL` and `VERCEL_BRANCH_URL` when present — so Vercel preview deployments work without listing every preview URL manually.

## Databases

There are **two kinds** of Postgres URLs. Mixing them up is a common source of runtime errors.

### IdP database (users and OAuth registry)

Stores users, passkeys, two-factor secrets, and registered OAuth clients.

| Variable                   | Notes                                                      |
| -------------------------- | ---------------------------------------------------------- |
| `PRISMA_DATABASE_URL`      | **Canonical.** Preferred on Vercel and locally             |
| `DATABASE_URL`             | Accepted fallback                                          |
| `POSTGRES_URL`             | Accepted fallback                                          |
| `AUTH_PRISMA_DATABASE_URL` | Accepted fallback                                          |
| `AUTH_DATABASE_URL`        | Accepted fallback                                          |
| `AUTH_IDP_DATABASE_URL`    | Used by account admin routes when IdP URL must be explicit |

**Required on:** `apps/auth` (IdP), `apps/account` (admin pages only).

Initialize schema:

```bash
# From repo root — requires PRISMA_DATABASE_URL in .env.local or shell
bun run auth:push
```

### Client session database (per satellite app)

Each OAuth client app stores **local sessions** in its own Postgres. This is **not** the IdP user database.

| Variable                           | Notes                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `AUTH_CLIENT_DATABASE_URL`         | Default session DB for the app                                                           |
| `AUTH_<SITE>_SESSION_DATABASE_URL` | Per-site override, e.g. `AUTH_ARMY_SESSION_DATABASE_URL` when `AUTH_OAUTH_SITE_KEY=army` |

**Required on:** Every app with `AUTH_DEPLOYMENT_ROLE=client` that handles authenticated requests.

Each client app needs its schema pushed against **its** session URL. Point `AUTH_CLIENT_DATABASE_URL` at that database, then:

```bash
bun run auth:push
```

You can use one shared session database for local dev, but production should use separate databases (or at least separate schemas) per Vercel project.

## Secrets and environment variables

### Shared across all auth deployments

These are required on **both** the IdP and every OAuth client, but are **not** listed in most `apps/*/.env.example` files.

| Variable                        | Required          | Purpose                                                 |
| ------------------------------- | ----------------- | ------------------------------------------------------- |
| `AUTH_SECRET`                   | **Yes** (prod)    | Better Auth signing secret. Alias: `BETTER_AUTH_SECRET` |
| `AUTH_URL` or `BETTER_AUTH_URL` | **Yes**           | Canonical base URL of **this** deployment               |
| `NEXT_PUBLIC_APP_URL`           | **Yes** (clients) | Public site URL; used when building OAuth redirect URIs |

Generate a secret:

```bash
openssl rand -hex 32
```

Use the **same** `AUTH_SECRET` value on the IdP and all clients if you want consistent cookie/session signing across the fleet (recommended).

### IdP only (`apps/auth`)

Set these on the `awfixersites-auth-app` Vercel project.

| Variable                          | Required       | Purpose                                                                                          |
| --------------------------------- | -------------- | ------------------------------------------------------------------------------------------------ |
| `AUTH_DEPLOYMENT_ROLE`            | **Yes**        | `idp`                                                                                            |
| `PRISMA_DATABASE_URL`             | **Yes**        | IdP Postgres (see above)                                                                         |
| `AUTH_PASSKEY_RP_ID`              | **Yes** (prod) | WebAuthn relying party ID. Use `awfixer.me` in production so passkeys work across `*.awfixer.me` |
| `AUTH_PASSKEY_RP_NAME`            | Recommended    | Display name shown during passkey registration (default: `awfixer.army`)                         |
| `AUTH_ADMIN_USERNAMES`            | Recommended    | Comma-separated usernames promoted via `bun run --cwd packages/auth promote-admins`              |
| `AUTH_SNOWFLAKE_WORKER_ID`        | Recommended    | Snowflake worker id (0–1023); use distinct values if multiple writers                            |
| `AUTH_TRUSTED_ORIGINS`            | Recommended    | Comma-separated extra origins (preview URLs, alternate apex domains)                             |
| `AUTH_OAUTH_<SITE>_CLIENT_ID`     | Optional       | Defaults to `awfixer-<site>`                                                                     |
| `AUTH_OAUTH_<SITE>_CLIENT_SECRET` | **Yes** (prod) | One per satellite — see below                                                                    |
| `AUTH_OAUTH_<SITE>_REDIRECT_URLS` | Optional       | Override default redirect URIs for a site                                                        |

**Production IdP example (partial):**

```env
AUTH_DEPLOYMENT_ROLE=idp
AUTH_SECRET=<openssl rand -hex 32>
AUTH_URL=https://auth.awfixer.me
BETTER_AUTH_URL=https://auth.awfixer.me
PRISMA_DATABASE_URL=postgresql://...
AUTH_PASSKEY_RP_ID=awfixer.me
AUTH_PASSKEY_RP_NAME=AWFixer
AUTH_ADMIN_USERNAMES=awfixer
AUTH_SNOWFLAKE_WORKER_ID=0
AUTH_TRUSTED_ORIGINS=https://awfixer.army,https://account.awfixer.me
```

After the first deploy, promote configured admin usernames (accounts must exist first):

```bash
bun run --cwd packages/auth promote-admins
```

### OAuth client apps (all satellites)

Set these on each app's Vercel project. Copy from `apps/<name>/.env.example` and **add the missing rows** from the table below.

| Variable                          | Required       | Purpose                                                                                 |
| --------------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `AUTH_DEPLOYMENT_ROLE`            | **Yes**        | `client`                                                                                |
| `AUTH_OAUTH_SITE_KEY`             | **Yes**        | Lowercase site key — must match [`oauth-sites.ts`](../packages/auth/src/oauth-sites.ts) |
| `AUTH_CLIENT_DATABASE_URL`        | **Yes**        | This app's session Postgres                                                             |
| `AUTH_IDP_URL`                    | **Yes**        | `https://auth.awfixer.me`                                                               |
| `NEXT_PUBLIC_AUTH_IDP_URL`        | **Yes**        | Same as `AUTH_IDP_URL` (browser-accessible)                                             |
| `AUTH_SECRET`                     | **Yes** (prod) | Same signing secret as IdP                                                              |
| `AUTH_URL` / `BETTER_AUTH_URL`    | **Yes**        | This app's canonical URL                                                                |
| `NEXT_PUBLIC_APP_URL`             | **Yes**        | Same as `AUTH_URL` for most apps                                                        |
| `AUTH_OAUTH_<SITE>_CLIENT_ID`     | Optional       | Defaults to `awfixer-<site>`                                                            |
| `AUTH_OAUTH_<SITE>_CLIENT_SECRET` | **Yes** (prod) | Must match the value on the IdP                                                         |

**Production client example (`apps/army`):**

```env
AUTH_DEPLOYMENT_ROLE=client
AUTH_OAUTH_SITE_KEY=army
AUTH_CLIENT_DATABASE_URL=postgresql://...
AUTH_IDP_URL=https://auth.awfixer.me
NEXT_PUBLIC_AUTH_IDP_URL=https://auth.awfixer.me
AUTH_SECRET=<same as IdP>
AUTH_URL=https://awfixer.army
BETTER_AUTH_URL=https://awfixer.army
NEXT_PUBLIC_APP_URL=https://awfixer.army
AUTH_OAUTH_ARMY_CLIENT_ID=awfixer-army
AUTH_OAUTH_ARMY_CLIENT_SECRET=<openssl rand -hex 32>
```

### Account app extras (`apps/account`)

The account app is an OAuth client **and** hosts admin UI that reads the IdP database directly.

| Variable                                         | Required       | Purpose                            |
| ------------------------------------------------ | -------------- | ---------------------------------- |
| All client variables above                       | **Yes**        | With `AUTH_OAUTH_SITE_KEY=account` |
| `PRISMA_DATABASE_URL` or `AUTH_IDP_DATABASE_URL` | **Yes**        | IdP Postgres for `/admin/*` routes |
| `AUTH_OAUTH_ACCOUNT_CLIENT_SECRET`               | **Yes** (prod) | OAuth secret (also set on IdP)     |

## OAuth client secrets — the easy-to-miss part

In development, missing `AUTH_OAUTH_<SITE>_CLIENT_SECRET` values are auto-filled with deterministic `dev-*` placeholders. **In production, both the IdP and the client app hard-fail without them.**

You need:

1. **On the IdP** — a secret for **every** registered satellite (20 sites today). Env pattern:

   ```
   AUTH_OAUTH_<SITE>_CLIENT_SECRET
   ```

   where `<SITE>` is the uppercase site key with hyphens converted to underscores (e.g. `donate` → `AUTH_OAUTH_DONATE_CLIENT_SECRET`).

2. **On each client app** — only that app's secret, matching the IdP value exactly.

Generate one secret per site:

```bash
openssl rand -hex 32
```

Store them in a password manager or Vercel's encrypted env vars. The IdP and the matching client **must** share the same value for each site.

### Registered OAuth sites

| `AUTH_OAUTH_SITE_KEY` | Env prefix             | Default client ID  | Production apex         |
| --------------------- | ---------------------- | ------------------ | ----------------------- |
| `account`             | `AUTH_OAUTH_ACCOUNT_`  | `awfixer-account`  | `account.awfixer.me`    |
| `army`                | `AUTH_OAUTH_ARMY_`     | `awfixer-army`     | `awfixer.army`          |
| `church`              | `AUTH_OAUTH_CHURCH_`   | `awfixer-church`   | `awfixer.church`        |
| `about`               | `AUTH_OAUTH_ABOUT_`    | `awfixer-about`    | `about.awfixer.me`      |
| `agent`               | `AUTH_OAUTH_AGENT_`    | `awfixer-agent`    | `agent.awfixer.codes`   |
| `branding`            | `AUTH_OAUTH_BRANDING_` | `awfixer-branding` | `branding.awfixer.me`   |
| `careers`             | `AUTH_OAUTH_CAREERS_`  | `awfixer-careers`  | `careers.awfixer.llc`   |
| `cash`                | `AUTH_OAUTH_CASH_`     | `awfixer-cash`     | `awfixer.cash`          |
| `cloud`               | `AUTH_OAUTH_CLOUD_`    | `awfixer-cloud`    | `awfixer.cloud`         |
| `club`                | `AUTH_OAUTH_CLUB_`     | `awfixer-club`     | `club.awfixer.me`       |
| `codes`               | `AUTH_OAUTH_CODES_`    | `awfixer-codes`    | `awfixer.codes`         |
| `donate`              | `AUTH_OAUTH_DONATE_`   | `awfixer-donate`   | `donate.awfixer.church` |
| `legal`               | `AUTH_OAUTH_LEGAL_`    | `awfixer-legal`    | `legal.awfixer.llc`     |
| `llc`                 | `AUTH_OAUTH_LLC_`      | `awfixer-llc`      | `awfixer.llc`           |
| `me`                  | `AUTH_OAUTH_ME_`       | `awfixer-me`       | `awfixer.me`            |
| `network`             | `AUTH_OAUTH_NETWORK_`  | `awfixer-network`  | `awfixer.network`       |
| `news`                | `AUTH_OAUTH_NEWS_`     | `awfixer-news`     | `awfixer.news`          |
| `party`               | `AUTH_OAUTH_PARTY_`    | `awfixer-party`    | `party.awfixer.me`      |
| `space`               | `AUTH_OAUTH_SPACE_`    | `awfixer-space`    | `awfixer.space`         |
| `tips`                | `AUTH_OAUTH_TIPS_`     | `awfixer-tips`     | `tips.awfixer.me`       |

Source of truth: [`packages/auth/src/oauth-sites.ts`](../packages/auth/src/oauth-sites.ts).

Default OAuth redirect URI per client:

```
https://<apex>/api/auth/oauth2/callback/awfixer-idp
```

## Local development

1. Create repo root `.env.local` (loaded by `.envrc` via `dotenv_if_exists`):

   ```env
   # IdP
   AUTH_DEPLOYMENT_ROLE=idp
   AUTH_SECRET=dev-local-secret-change-me
   PRISMA_DATABASE_URL=postgresql://...
   BETTER_AUTH_URL=http://localhost:3000
   AUTH_URL=http://localhost:3000
   AUTH_PASSKEY_RP_ID=localhost

   # OAuth client secrets — dev placeholders are auto-generated if omitted,
   # but setting them explicitly avoids surprises when NODE_ENV=production
   # AUTH_OAUTH_ARMY_CLIENT_SECRET=dev-secret
   ```

2. Push auth schema: `bun run auth:push`

3. Run the IdP: `cd apps/auth && bun run dev` (default port 3000; use `next dev -p <port>` if another app already occupies 3000)

4. For a client app, add client-specific vars to `.env.local` (or use separate env when running that app). Use the IdP port from step 3 and the client's dev port from [`oauth-sites.ts`](../packages/auth/src/oauth-sites.ts) (army = 3000, account = 3020, etc.):

   ```env
   AUTH_DEPLOYMENT_ROLE=client
   AUTH_OAUTH_SITE_KEY=army
   AUTH_CLIENT_DATABASE_URL=postgresql://...
   AUTH_IDP_URL=http://localhost:3000
   NEXT_PUBLIC_AUTH_IDP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Scaffold OAuth routes on new apps: `bun scripts/wire-oauth-apps.ts`
6. Enable Vercel BotID on new apps: `bun scripts/apply-botid-apps.ts` (adds `withBotId` to `next.config.ts` and `instrumentation-client.ts`). For bespoke POST APIs, call `rejectBotUnlessHuman()` in the route handler and extend `registerAppBotId()` with routes from `@awfixersites/auth/botid-protect`. **Do not** add BotID to server-to-server webhooks (e.g. Stripe `api/webhook`).

## Vercel deployment checklist

Deploy in this order:

### 1. IdP (`apps/auth`)

- [ ] Provision IdP Postgres; run `bun run auth:push` against it
- [ ] Set all IdP env vars (see above)
- [ ] Set **all 20** `AUTH_OAUTH_<SITE>_CLIENT_SECRET` values on the IdP project
- [ ] Set `AUTH_PASSKEY_RP_ID=awfixer.me`
- [ ] Deploy `awfixersites-auth-app`
- [ ] Confirm `https://auth.awfixer.me/api/auth/.well-known/openid-configuration` returns JSON

### 2. Each OAuth client

For every `apps/*` except `auth`:

- [ ] Provision a session Postgres for that Vercel project
- [ ] Run `bun run auth:push` against the session DB
- [ ] Set client env vars including `AUTH_SECRET`, `AUTH_OAUTH_<SITE>_CLIENT_SECRET`, and `AUTH_CLIENT_DATABASE_URL`
- [ ] Set `NEXT_PUBLIC_APP_URL` to the production apex URL
- [ ] Deploy the Vercel project
- [ ] Test `/sign-in` → IdP redirect → callback → authenticated session

### 3. Account admin

- [ ] Set `PRISMA_DATABASE_URL` (or `AUTH_IDP_DATABASE_URL`) on `apps/account`
- [ ] Confirm `AUTH_ADMIN_USERNAMES` is set on the **IdP** for your operator username
- [ ] Visit `https://account.awfixer.me/admin` after signing in

### Vercel project settings

All apps use the monorepo build script (`scripts/vercel-build.ts`):

- **Root Directory:** `apps/<name>`
- **Install:** `cd ../.. && bun install --frozen-lockfile`
- **Build:** `bun --bun ../../scripts/vercel-build.ts`

Env vars are **per Vercel project**. There is no shared env across projects unless you use Vercel's shared environment variable features manually.

Mark sensitive values (`AUTH_SECRET`, all `*_CLIENT_SECRET`, database URLs) as **Sensitive** in the Vercel dashboard.

## Troubleshooting missing-variable errors

Auth initializes lazily at **runtime** (first request to `/api/auth/*`), not at build time. A successful Vercel build does not mean auth env is complete.

| Error                                                                    | Fix                                                                                                                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Missing BETTER_AUTH_SECRET (or AUTH_SECRET)`                            | Set `AUTH_SECRET` on this Vercel project                                                                                                 |
| `Missing AUTH_OAUTH_<SITE>_CLIENT_SECRET for OAuth client configuration` | Set the client secret on **this** project. On the IdP, you need secrets for **all** sites                                                |
| `Missing or invalid AUTH_OAUTH_SITE_KEY`                                 | Set `AUTH_OAUTH_SITE_KEY` to a key from the table above                                                                                  |
| `Missing AUTH_CLIENT_DATABASE_URL (or AUTH_<SITE>_SESSION_DATABASE_URL)` | Provision session Postgres; set `AUTH_CLIENT_DATABASE_URL`                                                                               |
| `Missing auth database URL. Set PRISMA_DATABASE_URL...`                  | IdP (or misconfigured role): set `PRISMA_DATABASE_URL`                                                                                   |
| `Missing IdP database URL...`                                            | Account admin: set `PRISMA_DATABASE_URL` or `AUTH_IDP_DATABASE_URL`                                                                      |
| OAuth redirect mismatch                                                  | Ensure `NEXT_PUBLIC_APP_URL` / `AUTH_URL` matches the deployed apex; check `AUTH_OAUTH_<SITE>_REDIRECT_URLS` on IdP if using custom URLs |
| Passkey fails on production                                              | Set `AUTH_PASSKEY_RP_ID=awfixer.me` on IdP; do not use a subdomain as RP ID                                                              |
| Preview deployment auth fails                                            | Add the preview origin to `AUTH_TRUSTED_ORIGINS` on the IdP                                                                              |

## Commands reference

```bash
bun run auth:generate      # Regenerate Prisma client (packages/auth)
bun run auth:push          # Push auth schema to configured database
bun run prisma:push        # Push auth + db packages
bun scripts/wire-oauth-apps.ts   # Add OAuth routes to satellite apps
```

## Related files

| File                                                                          | Purpose                                       |
| ----------------------------------------------------------------------------- | --------------------------------------------- |
| [`packages/auth/src/config.ts`](../packages/auth/src/config.ts)               | Secret, base URL, passkey RP, trusted origins |
| [`packages/auth/src/oauth-clients.ts`](../packages/auth/src/oauth-clients.ts) | Client secret resolution (throws in prod)     |
| [`packages/auth/src/prisma.ts`](../packages/auth/src/prisma.ts)               | IdP vs client database URL selection          |
| [`packages/auth/src/deployment.ts`](../packages/auth/src/deployment.ts)       | IdP vs client role detection                  |
| [`packages/auth/.env.example`](../packages/auth/.env.example)                 | Full variable template for local dev          |
