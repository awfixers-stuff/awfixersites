# Auth system — security and functional review

Scope: `packages/auth/` (Better Auth configuration, Prisma models, admin helpers), `apps/auth/` (the IdP's Next.js app: pages, API route, UI wiring), and `docs/auth-deployment.md`. Reviewed 2026-07-01 by reading the actual runtime code paths (including the vendored `better-auth` and `@better-auth/passkey` plugin internals in `node_modules`) rather than assuming framework behavior.

The headline result: **the two most severe findings combine into a full, unauthenticated account-takeover chain that also defeats TOTP for every account**, because of how this app wires the passkey plugin's passwordless-signup feature. Everything else is secondary to fixing that.

---

## Critical

### C1. Unauthenticated passkey registration lets anyone take over any existing username

**Files:** `packages/auth/src/auth-options.ts:75-90`, `packages/auth/src/passkey-users.ts:15-77`, `packages/ui/src/auth/passkey-auth-form.tsx:70-84`, `packages/auth/src/client.ts:64-69`

The IdP configures the passkey plugin with:

```ts
passkey({
  registration: {
    requireSession: false,
    resolveUser: async ({ context }) => {
      ...
      const user = await findOrCreateUserForPasskey(usernameValue);
      return { id: user.id, name: user.username, displayName: user.displayUsername };
    },
  },
}),
```

`requireSession: false` tells `@better-auth/passkey` to skip its normal "you must already be logged in to register a new passkey" check (`resolveRegistrationUser` in the plugin, confirmed in `node_modules/.bun/@better-auth+passkey@1.6.18/.../index.mjs`). When there's no session cookie, the plugin falls back to the app-supplied `resolveUser(context)` — and this app's `resolveUser` is `findOrCreateUserForPasskey`, which does an `OR` lookup on `username`/`email` and, **if the user already exists, happily returns that user's id** so a brand-new WebAuthn credential gets attached to it.

The client-side "Create account" form (`PasskeyAuthForm`, mode `sign-up`) sends exactly that `context` as the raw, user-typed username with zero prior authentication:

```ts
export async function registerPasskeyForUsername(username: string, name?: string) {
  return authClient.passkey.addPasskey({ name, context: username.trim().toLowerCase() });
}
```

**Impact:** Anyone can open `https://auth.awfixer.me/?mode=sign-up`, type an existing username (e.g. `awfixer`, the example admin username in `AUTH_ADMIN_USERNAMES`), complete a WebAuthn ceremony with their own device/security key, and they now hold a valid, independent passkey credential bound to that victim's account — with no email confirmation, no password, no proof of ownership of anything. Combined with C2 below, this is immediate full account takeover, including of admin accounts, from an unauthenticated state.

**Fix:** `resolveUser` must never resolve to an _existing_ user when there is no session. Either:

- Only allow this codepath to **create** new users (return `undefined`/throw if `findOrCreateUserForPasskey` finds an existing row), and require an authenticated session (or a signed, single-use invite/verification token) to add a passkey to an account that already exists; or
- Require `requireSession: true` for registration, and expose a separate, explicitly-authenticated "add passkey" action for existing accounts (the settings page already has one — `AccountSettings`'s "Add passkey" button calls `authClient.passkey.addPasskey()` with an active session, which is the correct pattern and should be the _only_ way to attach a credential to an existing account).

---

### C2. Passkey sign-in never enforces TOTP — the "verify TOTP" step is client-side decoration only

**Files:** better-auth internals: `node_modules/.../better-auth/dist/plugins/two-factor/index.mjs:190-197`, `node_modules/.../@better-auth/passkey/dist/index.mjs` (session set at the authentication-verify route); app usage: `packages/ui/src/auth/passkey-auth-form.tsx:87-111`, `apps/auth/app/setup/totp/page.tsx`, `apps/auth/app/verify/totp/page.tsx`

Better Auth's `twoFactor` plugin enforces 2FA via an `after`-hook whose matcher is:

```js
matcher(context) {
  return context.path === "/sign-in/email" || context.path === "/sign-in/username" || context.path === "/sign-in/phone-number";
}
```

It only intercepts password/username/phone sign-in. It does **not** match the passkey plugin's authentication route, and the passkey plugin's own verify-authentication handler calls `setSessionCookie(ctx, ...)` directly and unconditionally on a successful WebAuthn assertion — there is no check anywhere in that path for `user.twoFactorEnabled`.

In other words: `authClient.signIn.passkey()` (the only sign-in method this app's UI exposes) **always returns a fully valid, complete session cookie**, regardless of whether the account has TOTP enabled. The redirect to `/verify/totp` that `PasskeyAuthForm` performs afterward is pure client-side routing — the session already works for every API call before that redirect ever happens. Anyone hitting the passkey endpoints directly (curl, a script, or simply not following the browser redirect) has full account access without ever entering a TOTP code.

This directly contradicts the documented security model: `packages/auth/HANDOFF.md` states "Enable + verify TOTP at `/setup/totp`" and "Every passkey sign-in continues through `/verify/totp`" as if it were an enforced gate, and the IdP's own UI copy says "Two-factor authentication is required for every AWFixer account." It isn't enforced — it's suggested.

**Compounding effect with C1:** even on accounts that dutifully enabled TOTP, C1 lets an attacker attach their own passkey and then sign in with it; C2 means that sign-in is not challenged for the TOTP the victim thinks is protecting them. TOTP currently provides **zero** protection against the passkey path, which is the only path real users take.

**Fix:** This needs a real server-side gate, not a client redirect. Options, roughly in order of how well they fit Better Auth's plugin model:

- Add a session hook (`databaseHooks.session.create.after` or a custom `after` hook keyed on the passkey verify-authentication path, mirroring what the `twoFactor` plugin does for password sign-in) that checks `user.twoFactorEnabled` and, if true, downgrades the newly created session to an unauthenticated/"pending 2FA" state (delete the session cookie, set the plugin's own `two_factor` cookie) exactly the way the `twoFactor` plugin does for its own matched routes.
- Alternatively/additionally, gate every sensitive server read (`getServerSession` call sites, OIDC token issuance, admin routes) on a real "2FA satisfied this session" claim rather than trusting the client to have visited `/verify/totp`. `packages/auth/src/account-setup.server.ts` already has `getAccountSetupForUser`/`getAccountSetupRedirect` logic for this, but it is **not called from anywhere** in `apps/auth` or `apps/account` (see F1 below) — wiring that into a real server-side check (e.g., in `server-session.ts` or a shared layout loader) would close both the enforcement gap and the dead-code issue at once.

---

## High

### H1. Open redirect on the IdP via unchecked `returnTo`

**Files:** `apps/auth/components/auth-page.tsx:48-50`, `apps/auth/app/setup/totp/page.tsx:19-28`, `apps/auth/app/verify/totp/page.tsx:19-28`

All three post-auth completion points do:

```ts
const destination = returnTo ?? codesSiteUrl;
window.location.assign(destination);
```

`returnTo` is taken verbatim from the query string with no validation. Contrast this with `packages/auth/src/referrer.ts`'s `resolveReferrerSite`, which _does_ validate that a `returnTo`/`redirect_uri` hostname matches a known `OAUTH_SITES` apex before using it for the "back to site" link — that validation exists in the codebase but isn't applied to the actual post-login redirect.

**Impact:** `https://auth.awfixer.me/?mode=sign-in&returnTo=https://evil.example/phish` is a valid link. A victim who clicks it is authenticating for real, on the real IdP domain, with their real passkey/TOTP — and is then bounced to an attacker-controlled page immediately after. That page can present a "session expired, sign in again" prompt or any other convincing follow-up. This is a classic IdP open-redirect/phishing amplifier: the trust boundary that makes people comfortable typing credentials on `auth.awfixer.me` is exactly what makes the post-login redirect dangerous if unchecked.

**Fix:** Reuse the existing `resolveReferrerSite`/host-allowlist logic (or a dedicated helper) to validate `returnTo` against `OAUTH_SITES` apexes (plus relative paths on the IdP itself) before calling `window.location.assign`. Fall back to `codesSiteUrl` for anything that doesn't match, exactly as `resolveReturnToReferrer` already does for the display case.

### H2. Reserved admin usernames can be claimed by whoever signs up first

**Files:** `packages/auth/src/account-setup.ts:45-60`, `packages/auth/src/auth-options.ts:107-143` (`databaseHooks.user.create.before`), `packages/auth/src/passkey-users.ts:41-58`

`resolveUserRole(username)` grants `role: "admin"` automatically, at account-creation time, to any signup whose username is in the comma-separated `AUTH_ADMIN_USERNAMES` env var. This runs unconditionally in the `user.create.before` hook and in `findOrCreateUserForPasskey` — there's no check that the "real" operator is the one creating the account, no invite token, no manual promotion step.

**Impact:** If the IdP goes live before the intended admin(s) actually register those usernames (e.g., during initial deployment, or after a database reset), anyone who signs up first with a reserved name becomes an administrator instantly. This is worsened by C1: even after the legitimate admin has registered, an attacker can still target that specific admin username through the account-takeover path.

**Fix:** Treat `AUTH_ADMIN_USERNAMES` as a _promotion allowlist to be applied by an operator_, not an auto-grant at signup. E.g., create the account as `role: "user"` always, and have a one-time bootstrap script / admin console action explicitly promote the configured usernames (idempotent, run once post-deploy, ideally requiring the account to already exist and have 2FA+passkey configured before promotion).

---

## Medium

### M1. Admin role can go stale on OAuth client apps after IdP revocation

**File:** `packages/auth/src/client-options.ts:35-49` (`mapProfileToUser`)

Satellite apps (e.g. `apps/account`) store `role` locally in their own session database, populated from the IdP's `role` claim at OAuth login time via `mapProfileToUser`. If an admin's role is later revoked on the IdP, any satellite app session/local user row created before the revocation keeps `role: "admin"` until that user's local session expires and they re-authenticate through the full OAuth flow. `isAdminSession` (`packages/auth/src/admin/guard.ts`) just checks this locally cached field.

**Impact:** Admin access on `account.awfixer.me` can outlive a revocation on the IdP for as long as the local session/refresh cycle allows.

**Fix:** Either shorten satellite session/refresh lifetimes for admin-capable apps, or have `isAdminSession`/admin routes re-validate role against the IdP (e.g., via the userinfo endpoint or a short-TTL cache) rather than trusting the locally cached claim indefinitely.

### M2. No durable rate limiting for a serverless deployment

**Files:** `packages/auth/src/auth-options.ts` (no `rateLimit` config), deployment target confirmed serverless via `apps/auth/vercel.ts`

Better Auth's default rate limiter is in-memory. On Vercel (Fluid Compute / serverless functions), instances are not guaranteed to be reused across requests, so an in-memory counter does not provide durable throttling in production. There is no explicit `rateLimit` storage configuration (e.g., backed by Postgres or Redis) anywhere in `auth-options.ts`.

**Impact:** Credential guessing against `/sign-in/email` and `/sign-in/username` (both enabled — see M3), and passkey/TOTP verification attempts, aren't reliably throttled once traffic is spread across multiple serverless instances.

**Fix:** Configure Better Auth's `rateLimit.storage` to use the database (or a shared store) instead of the default memory store, at minimum for `apps/auth` where this is the single shared identity provider for the whole fleet.

### M3. Password sign-in is enabled but unused in the UI — needless attack surface

**Files:** `packages/auth/src/auth-options.ts:46-51` (`emailAndPassword: { enabled: true, minPasswordLength: 8 }`), confirmed no app UI wires up `signInWithUsername`/`signUpWithUsername` or the `SignInForm`/`SignUpForm` components in `packages/ui/src/auth`

The IdP's UI is passkey-only, but `/api/auth/sign-in/email`, `/sign-in/username`, and `/sign-up/email` remain live endpoints (this is in fact the _only_ sign-in path that C2's TOTP gate actually protects, per the plugin matcher). `minPasswordLength: 8` is on the low side for an IdP fronting ~20 properties.

**Fix:** Decide deliberately: either (a) disable `emailAndPassword` entirely if it's not part of the intended UX (removing the surface, but also removing the one path where 2FA currently works correctly until C2 is fixed), or (b) keep it as an intentional 2FA-protected fallback and raise `minPasswordLength` (12+), and document why it's kept. Right now it looks like leftover default config rather than a decision.

### M4. Deployment role silently inferred instead of failing closed

**File:** `packages/auth/src/deployment.ts:1-22`

If `AUTH_DEPLOYMENT_ROLE` is unset, the role is guessed from whether `NEXT_PUBLIC_APP_URL`/`BETTER_AUTH_URL` contains the substring `"auth.awfixer"`, defaulting to `"client"` otherwise. This is convenient for local dev but risky in production: a misconfigured Vercel project (missing env var) silently becomes a fully-functioning "client" or "idp" deployment instead of failing loudly, which is exactly the kind of misconfiguration `docs/auth-deployment.md`'s own troubleshooting table is built to catch after the fact.

**Fix:** In production (`NODE_ENV === "production"`), require `AUTH_DEPLOYMENT_ROLE` explicitly and throw if it's missing, keeping the inference only for local dev.

---

## Low / hardening

### L1. No Content-Security-Policy on the IdP

**File:** `apps/auth/next.config.ts:3-13`

Good baseline headers are set (HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`), but there's no CSP. For the page that hosts the login/passkey/TOTP forms for the entire fleet, a CSP (even a moderately strict `default-src 'self'` with explicit allowances) meaningfully reduces XSS blast radius.

### L2. TOTP secrets and backup codes stored without app-level encryption at rest

**File:** `packages/auth/prisma/schema.prisma:38-49` (`TwoFactor.secret`, `TwoFactor.backupCodes`)

These are plain columns, protected only by database access controls. Given this Postgres instance is the shared identity store for the whole organization, consider encrypting these fields with an application-managed key (KMS-backed) so a database-only compromise doesn't also yield every account's live TOTP seeds.

### L3. `skipConsent: true` for all trusted OIDC clients (informational, not a bug)

**File:** `packages/auth/src/oauth-clients.ts:65-76`

Every satellite app is registered as a trusted client with consent skipped. This is reasonable for first-party apps under one operator, but it means a compromised or misconfigured satellite gets silent, no-prompt access to the `openid profile email offline_access` scopes for any user who signs in through it. Worth a one-line comment in the code recording that this is an intentional trust decision (so a future change doesn't "fix" it as an oversight) — not a required change.

---

## Functional findings (not security)

### F1. `getAccountSetupForUser`/`getAccountSetupRedirect` is dead code

**File:** `packages/auth/src/account-setup.server.ts`

This module computes whether a user has completed passkey + TOTP setup and what to redirect to, and is unit-tested (`account-setup.test.ts`), but nothing in `apps/auth` or `apps/account` calls it. The actual enforcement that exists today is duplicated, weaker, and purely client-side logic baked into `PasskeyAuthForm`/`TotpSetupForm`/`TotpVerifyForm`. This is the natural place to wire in the real fix for C2 — use it.

### F2. Documentation overstates enforcement

**Files:** `packages/auth/HANDOFF.md` ("Mandatory account setup" section), `docs/auth-deployment.md` (doesn't mention 2FA enforcement mechanics at all)

`HANDOFF.md` describes TOTP as effectively mandatory and guaranteed ("Every passkey sign-in continues through `/verify/totp`"). Until C2 is fixed, this should either be corrected to note it's client-enforced only, or (preferably) the doc should stay as-is and the code should be fixed to match it — the latter is recommended since "mandatory TOTP" is clearly the intended design.

### F3. `docs/auth-deployment.md` — no functional errors found, one gap

The deployment doc is otherwise accurate against the code read during this review (env var names, fallback order in `prisma.ts`/`config.ts`, the two deployment roles, the OAuth site table matches `oauth-sites.ts`). The one gap: it doesn't mention that `AUTH_TRUSTED_ORIGINS`/`VERCEL_URL`/`VERCEL_BRANCH_URL` are automatically added to `trustedOrigins` (`packages/auth/src/config.ts:80-100`) — worth a short note so operators understand why preview URLs "just work" without extra config, and so they know that trust extends to _all_ Vercel preview URLs for the project, not just ones they explicitly listed.

---

## Suggested remediation order

1. **C1 + C2 together** — these are the same class of bug (passkey path bypasses ownership and 2FA checks) and should be fixed in the same change: make passkey registration require either a session or a real ownership proof, and make passkey sign-in respect `twoFactorEnabled` server-side.
2. **H1** (open redirect) — small, self-contained fix reusing existing allowlist logic.
3. **H2** (admin auto-grant) — change to an explicit promotion step; low code cost, closes a real privilege-escalation path.
4. **M2/M3/M4** — production-hardening pass before the next full fleet deployment.
5. **L1–L3, F1–F3** — cleanup/hardening as time allows.
