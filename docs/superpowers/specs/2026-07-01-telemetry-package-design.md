# Telemetry package + CLink design

Date: 2026-07-01

## Problem

The monorepo has ~22 Next.js apps deployed on separate branded apex domains
(awfixer.llc, awfixer.church, careers.awfixer.llc, etc.), with no telemetry
wired up yet. We want:

1. A shared package that gives every app a provider-agnostic way to send
   errors and events to Sentry and PostHog today, with X/Twitter pixel
   supportable later without touching app code.
2. A `CLink` component — a drop-in `next/link` replacement — that every app
   uses for all links, which automatically handles cross-domain tracking
   continuity, click tracking, UTM injection, and external-link hygiene,
   configured per app via a `clink.json` file.

## Package: `@awfixersites/telemetry`

New package at `packages/telemetry`, following the existing `ui`/`env`/`auth`
package conventions: raw `src/*.ts(x)` exports (no build step), extends
`../../src/tsconfig.react-library.json`, vitest via `../../src/vitest.next`,
added to the `workspace` catalog as `"@awfixersites/telemetry": "workspace:*"`.

```
packages/telemetry/
  src/
    providers/
      types.ts         # TelemetryProvider interface
      sentry.ts
      posthog.ts
      pixel.ts          # inert stub for future X/Twitter pixel
      registry.ts       # active providers, based on env vars present
    track.ts             # track(), identify(), pageview(), captureError()
    register.ts          # registerAppTelemetry() — client init
    register-server.ts   # registerServerTelemetry() + onRequestError — server init
    config/
      schema.ts           # zod schema for clink.json
      types.ts
    link/
      clink-provider.tsx  # <ClinkProvider config={...}>
      clink.tsx            # <CLink> component
      resolve-href.ts       # pure fn: (href, config, currentOrigin) -> resolved href + metadata
  package.json
  tsconfig.json
  vitest.config.ts
```

`posthog-js` already lives in the root `telemetry` catalog entry
(`workspaces.catalogs.telemetry`); `@sentry/nextjs` etc. already exist in the
`sentry` catalog. This package depends on both via `catalog:telemetry` /
`catalog:sentry`.

### Provider abstraction

`src/providers/types.ts` defines the common shape every provider implements,
all methods optional:

```ts
export interface TelemetryProvider {
  name: string;
  track?(event: string, properties?: Record<string, unknown>): void;
  identify?(distinctId: string, traits?: Record<string, unknown>): void;
  pageview?(url: string): void;
  captureError?(error: unknown, context?: Record<string, unknown>): void;
}
```

- `providers/sentry.ts` — `captureError` → `Sentry.captureException`;
  `track` → `Sentry.addBreadcrumb` (Sentry is not an events store).
- `providers/posthog.ts` — `track` → `posthog.capture`; `identify`;
  `pageview`; `captureError` → `posthog.captureException`.
- `providers/pixel.ts` — same interface, every method a no-op,
  `name: "pixel"`. Never registered until real X/Twitter pixel work happens;
  adding it later means filling in this one file, no app-code changes.
- `providers/registry.ts` — `getActiveProviders()` returns only providers
  actually initialized by `registerAppTelemetry`/`registerServerTelemetry`
  (gated on `NEXT_PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_POSTHOG_KEY` being set).

### Unified `track()` API

`src/track.ts` is the only module app code and CLink import for tracking —
no app ever imports `@sentry/*` or `posthog-js` directly:

```ts
export function track(event: string, properties?: Record<string, unknown>): void;
export function identify(distinctId: string, traits?: Record<string, unknown>): void;
export function pageview(url?: string): void;
export function captureError(error: unknown, context?: Record<string, unknown>): void;
```

Each fans out to `getActiveProviders()`, calling the matching method on each
provider if present. Each provider call is individually wrapped in
try/catch (`console.error` in dev) so one provider throwing never blocks
another provider or breaks the caller.

### Registration (client + server init)

Follows the existing `registerAppBotId` pattern (`packages/auth/src/botid-client.ts`),
called the same way from each app's `instrumentation-client.ts`.

`src/register.ts` — `registerAppTelemetry({ app: string })`:

```ts
import { registerAppTelemetry } from "@awfixersites/telemetry/register";
import { registerAppBotId } from "@awfixersites/auth/botid-client";

registerAppBotId();
registerAppTelemetry({ app: "about" });
```

Reads `NEXT_PUBLIC_SENTRY_DSN` and `NEXT_PUBLIC_POSTHOG_KEY`; a missing var
means that provider is skipped, not an error. PostHog is initialized with
`person_profiles: "identified_only"`. Sentry client init tags
`initialScope: { tags: { app } }`.

`src/register-server.ts` — `registerServerTelemetry({ app: string })` and
`onRequestErrorTelemetry`, called from a new `instrumentation.ts` per app
(none exist yet — this is new wiring):

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerServerTelemetry } = await import("@awfixersites/telemetry/register-server");
    registerServerTelemetry({ app: "about" });
  }
}
export { onRequestErrorTelemetry as onRequestError } from "@awfixersites/telemetry/register-server";
```

`onRequestErrorTelemetry` wires into Next.js's `onRequestError` hook to
auto-capture server-side rendering/route errors via `captureError()`.

## CLink + `clink.json`

### Config shape

`src/config/schema.ts` defines a zod schema for each app's `clink.json`:

```json
{
  "network": ["awfixer.llc", "careers.awfixer.llc", "awfixer.church"],
  "utm": { "source": "about", "medium": "referral", "campaign": null },
  "click": { "event": "link_clicked", "properties": { "app": "about" } },
  "exclude": ["mailto:*", "tel:*", "^/legal"]
}
```

- `network` — domains treated as internal to the awfixer ecosystem (same
  idea as the existing `DONATE_APEX_DOMAINS` list in
  `src/donate-domains.ts`, but explicit per app in `clink.json` rather than
  a shared hidden import).
- `utm` — default `utm_source`/`utm_medium`/`utm_campaign` appended to
  external (non-network) links, unless the link already specifies its own.
- `click` — event name + extra properties merged into every automatic
  `track()` call CLink fires on click.
- `exclude` — glob/regex patterns (`mailto:`, `tel:`, path prefixes) CLink
  passes through untouched — no param injection, no click tracking.

### Components

`src/link/clink-provider.tsx` — `<ClinkProvider config={clinkConfig}>`,
added once in each app's `app/layout.tsx` (alongside the existing
`<ThemeProvider>`). Validates config with the zod schema on mount: throws in
dev on invalid config (fail fast), logs and falls back to a safe default
("everything external, no injection, no exclude matching") in production so
a bad config never breaks navigation.

`src/link/clink.tsx` — `<CLink href="..." ...>`, a drop-in replacement for
`next/link` used everywhere in every app. Resolves the href via
`resolve-href.ts`:

1. Check `exclude` — if matched, render a plain passthrough link, no
   tracking, no params.
2. Determine internal vs external via the `network` list.
3. Internal + different origin than the current page → append PostHog's
   distinct ID as a query param (PostHog's documented cross-domain linking
   approach), so the destination app's `registerAppTelemetry` init can
   `identify()`/alias on load and stitch the session.
4. External (not in `network`) → append configured UTM params (unless the
   link already sets its own), force `rel="noopener noreferrer"`, default
   `target="_blank"` (overridable via props).
5. On click (any non-excluded link): fire
   `track(click.event, { ...click.properties, href, internal })` via the
   unified `track()` API before navigation proceeds.

`resolve-href.ts` is a pure function
`(href, config, currentOrigin) -> { href, rel, target }`, independently
unit-testable without React, never mutating `mailto:`/`tel:`/excluded hrefs.

## Error handling

- `track()`/`identify()`/`pageview()`/`captureError()` never throw — each
  provider call wrapped individually; one provider failing never blocks
  another or breaks the caller.
- Missing env vars → provider silently not registered, not an error
  (expected for local dev without keys).
- Invalid `clink.json` → dev: throw immediately. Prod: log + fall back to
  safe defaults; links keep working, just without the extra behavior.

## Testing (vitest, per existing package convention)

- `resolve-href.test.ts` — internal vs external classification, UTM
  injection (respects existing params), exclude pattern matching, PostHog
  id param only added cross-origin.
- `track.test.ts` — fan-out to mocked providers; one throwing provider
  doesn't stop others; no-op when zero providers registered.
- `config/schema.test.ts` — valid config parses; invalid config (bad
  domain, wrong types) rejected with a clear zod error.
- `providers/registry.test.ts` — env var presence/absence correctly gates
  provider registration.

## Out of scope for this pass

- Actual X/Twitter pixel implementation (stub only).
- Rolling `registerAppTelemetry`/`instrumentation.ts`/`clink.json` +
  `ClinkProvider` out to all 22 apps, and replacing existing `next/link`
  usages with `CLink` — this design covers the package itself; adoption
  across apps is a follow-up once the package is reviewed.
