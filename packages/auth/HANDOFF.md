# @workspace/auth — Agent Handoff

Read this before touching auth. The package is **scaffolded, DB-synced, and wired into `apps/web`.**

## Mission

Better Auth for awfixer.army with:

- **Usernames + passwords** (via username plugin)
- **Passkeys** (via `@better-auth/passkey`)
- **No email or phone signup** in the product — users never see or enter an email/phone
- **Postgres** via Prisma 7 + Prisma Data Platform (`AUTH_DATABASE_URL` in repo root `.env`)

Better Auth still requires an `email` column internally. We satisfy that with synthetic addresses:

```
{username}@id.awfixer.army
```

See `src/config.ts` → `internalUserEmail()`. Never expose these to users.

---

## What is done

| Area                                                        | Status                         |
| ----------------------------------------------------------- | ------------------------------ |
| `packages/auth` package scaffold                            | Done                           |
| Better Auth server (`src/server.ts`, `src/auth-options.ts`) | Done                           |
| Username + passkey plugins                                  | Done                           |
| Prisma schema (`prisma/schema.prisma`)                      | Generated + pushed to Postgres |
| Prisma client (`generated/prisma/`)                         | Generated locally (gitignored) |
| Passkey-first user creation (`src/passkey-users.ts`)        | Done                           |
| Client helpers (`src/client.ts`)                            | Done                           |
| Nix flake + direnv for Prisma on NixOS                      | Done (repo root)               |
| `apps/web` integration                                      | Done                           |
| Auth UI (sign-in / sign-up / passkey)                       | Done                           |
| Next.js API route `/api/auth/[...all]`                      | Done                           |

---

## File map

```
packages/auth/
├── HANDOFF.md              ← you are here
├── package.json
├── prisma.config.ts        ← Prisma 7 datasource URL (reads AUTH_DATABASE_URL)
├── prisma/
│   └── schema.prisma       ← Better Auth tables: user, session, account, verification, passkey
├── src/
│   ├── auth.config.ts      ← CLI-only stub for `auth:generate` (no real Prisma client)
│   ├── auth-options.ts     ← Shared Better Auth config (plugins, hooks)
│   ├── server.ts           ← `export const auth = betterAuth(...)`
│   ├── client.ts           ← `authClient` + signUp/signIn/passkey helpers
│   ├── next-js.ts          ← Re-export of `toNextJsHandler` for apps/web
│   ├── config.ts           ← env helpers, internalUserEmail, RP ID/name
│   ├── prisma.ts           ← PrismaClient with @prisma/adapter-pg + pg Pool
│   ├── passkey-users.ts    ← findOrCreateUserForPasskey for passkey-only registration
│   └── index.ts            ← re-exports
```

**Important split:** `auth.config.ts` exists only so `@better-auth/cli generate` can run without a generated Prisma client. Runtime code uses `server.ts` + real `prisma.ts`.

---

## Environment (repo root `.env`)

Loaded by direnv (`.envrc` → `use flake` + `dotenv_if_exists`).

| Variable                   | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `AUTH_DATABASE_URL`        | Postgres connection (Prisma CLI + runtime)                              |
| `AUTH_PRISMA_DATABASE_URL` | Fallback alias                                                          |
| `BETTER_AUTH_SECRET`       | Session signing (32+ chars)                                             |
| `BETTER_AUTH_URL`          | Server base URL, e.g. `http://localhost:3000`                           |
| `NEXT_PUBLIC_APP_URL`      | Fallback for base URL                                                   |
| `AUTH_PASSKEY_RP_ID`       | WebAuthn RP ID — `localhost` dev; **must be production domain in prod** |
| `AUTH_PASSKEY_RP_NAME`     | Display name for passkey prompts                                        |

**Set by Nix flake (do not put in `.env`):**

- `PRISMA_SCHEMA_ENGINE_BINARY`
- `PRISMA_QUERY_ENGINE_BINARY`
- `PRISMA_FMT_BINARY`
- `OPENSSL_LIB_DIR` / `OPENSSL_INCLUDE_DIR`
- `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

### First-time dev setup

```bash
cd /home/awfixer/Projects/awfixer.army
direnv allow          # if not already
# confirm: echo $PRISMA_SCHEMA_ENGINE_BINARY

cd packages/auth
npm run generate      # creates generated/prisma/
npm run push          # sync schema (already done once; re-run if schema changes)
npm run typecheck
```

**No Bun in the Nix shell.** Use `npm` for auth package scripts. Workspace install at repo root may still use `bun install` (outside flake).

---

## Commands

From repo root:

```bash
npm run auth:generate   # prisma generate
npm run auth:push       # prisma db push
npm run auth:typecheck
```

From `packages/auth`:

```bash
npm run auth:generate   # regenerate prisma/schema.prisma from auth.config.ts
npm run generate        # prisma generate → generated/prisma/
npm run push            # push schema to Postgres
npm run migrate         # prefer this for production once migrations are introduced
npm run dev             # prisma studio
```

After changing plugins in `auth-options.ts`, run:

```bash
npm run auth:generate -- --yes   # or the script as written
# merge any manual prisma/schema.prisma tweaks (see Prisma 7 note below)
npm run generate && npm run push
```

---

## Auth flows (implemented in package, not in UI)

### Username + password signup

`signUpWithUsername()` in `src/client.ts` calls `authClient.signUp.email()` with synthetic email + username fields. Server hook in `auth-options.ts` `databaseHooks.user.create.before` normalizes email/username.

### Username + password sign-in

`signInWithUsername()` → `authClient.signIn.username()`.

### Passkey registration (no existing session)

`passkey({ registration: { requireSession: false, resolveUser } })` in `auth-options.ts`.

Client passes username as `context` query param:

```ts
authClient.passkey.addPasskey({ name, context: username });
```

`resolveUser` → `findOrCreateUserForPasskey()` creates user + credential account with random password if new.

### Passkey sign-in

`authClient.signIn.passkey()` — standard Better Auth flow.

---

## Prisma 7 notes (read before editing schema)

1. **No `url` in `schema.prisma` datasource** — URL lives in `prisma.config.ts`.
2. **Runtime client needs an adapter**, not `datasourceUrl`:

   ```ts
   // src/prisma.ts — @prisma/adapter-pg + pg Pool
   new PrismaClient({ adapter: new PrismaPg(pool) });
   ```

3. **`generated/prisma/` is gitignored** — every clone must run `npm run generate`.
4. Schema was applied via **`db push`**, not migrations. For production CI, add `prisma/migrations/` and switch to `migrate deploy`.

---

## Next agent: required work (in order)

### 1. Wire `apps/web` to `@workspace/auth`

- [x] Add `"@workspace/auth": "workspace:*"` to `apps/web/package.json`
- [x] Add `transpilePackages: ["@workspace/ui", "@workspace/auth"]` in `apps/web/next.config.ts`
- [x] Add tsconfig paths for `@workspace/auth` (mirror `@workspace/db` pattern in `apps/web/tsconfig.json`)

### 2. Next.js API route

Create `apps/web/app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@workspace/auth/server";
import { toNextJsHandler } from "@workspace/auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

`@workspace/auth/next-js` re-exports `toNextJsHandler` from `better-auth/next-js` so apps/web does not need a direct `better-auth` dependency for the API route.

### 3. Auth client base URL

`src/client.ts` sets `baseURL: process.env.NEXT_PUBLIC_APP_URL` in `createAuthClient`.

### 4. Fix client ↔ server type import

`src/client.ts` uses `import type { auth } from "./server"`, which is erased at build time. `server.ts` / `prisma.ts` are never imported as values from client components.

### 5. Build auth UI in `packages/ui`

Implemented in `packages/ui/src/auth/`:

- `sign-in-form.tsx` — username + password sign-in, plus passkey sign-in
- `sign-up-form.tsx` — username + password sign-up, plus passkey registration
- `passkey-button.tsx` — `AddPasskeyButton` and `SignInWithPasskeyButton`
- `index.ts` — public exports

Pages are thin wrappers in `apps/web/app/(auth)/sign-in` and `apps/web/app/(auth)/sign-up`.

### 6. Session in layout

- Optional: `authClient.useSession()` in header for signed-in state
- Protect routes later (enlist admin, etc.) — out of scope unless requested

### 7. Production env

On Vercel / deploy:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` = production origin
- `AUTH_DATABASE_URL`
- `AUTH_PASSKEY_RP_ID` = bare domain (e.g. `awfixer.army`, not URL with path)
- `AUTH_TRUSTED_ORIGINS` if preview URLs needed

### 8. Turbo / CI

- [x] Add `@workspace/auth` to `turbo.json` typecheck pipeline — picked up automatically via `^typecheck` dependency graph
- [x] CI must run `npm run generate` in `packages/auth` before `apps/web` build (or commit generated client — currently gitignored)

---

## Known issues / pitfalls

1. **`@better-auth/cli` version mismatch** — CLI is `1.4.21`, runtime is `1.6.18`. Schema generation works; watch for CLI drift.

2. **`@prisma/client-runtime-utils`** — the generated Prisma client declares this as a dependency. It is added to `@workspace/auth` dependencies so the Next.js bundler can resolve it.

3. **Synthetic email uniqueness** — tied to username. Changing `AUTH_EMAIL_DOMAIN` breaks existing users.

4. **Passkey RP ID** — must match the browser origin hostname. `localhost` only works on `http://localhost:3000`.

5. **Nix without direnv** — Prisma CLI fails on NixOS without flake env. Always `nix develop` or `direnv allow`.

6. **`npm install` at repo root** — fails on `workspace:*` protocol; use `bun install` for workspace deps, then `nix develop` for Prisma commands.

7. **Phone/email plugins** — intentionally not installed. Do not add `@better-auth` email-otp or phone-number plugins unless requirements change.

---

## Verification checklist

Before marking auth integration complete:

```bash
# In nix develop / direnv shell
cd packages/auth && npm run typecheck
cd packages/auth && npm run generate

cd packages/ui && bun run typecheck
cd apps/web && bun run typecheck
cd apps/web && bun run build

# Manual
# - Sign up with username/password
# - Sign out / sign in
# - Register passkey (platform or cross-platform)
# - Sign in with passkey
# - Confirm no email/phone fields in UI
# - Confirm user row in Prisma Studio has @id.awfixer.army email
```

---

## Related packages

| Package         | Role                                                      |
| --------------- | --------------------------------------------------------- |
| `@workspace/db` | Convex — enlistment form submissions (separate from auth) |
| `@workspace/ui` | Shared components — auth UI lives here                    |
| `apps/web`      | Next.js app — API route + pages only                      |

Enlistment (`@workspace/ui/enlist`) is public and unrelated to auth sessions unless you later gate it.

---

## Quick reference: exports

```ts
// Server (API routes, server components only)
import { auth } from "@workspace/auth/server";

// Client (use client components)
import {
  authClient,
  signUpWithUsername,
  signInWithUsername,
  registerPasskeyForUsername,
} from "@workspace/auth/client";

// Next.js handler
import { toNextJsHandler } from "@workspace/auth/next-js";

// Types
import type { Session } from "@workspace/auth/server";
```

---

_Last updated: 2026-06-15. Schema pushed to Prisma Postgres. Web integration complete._
