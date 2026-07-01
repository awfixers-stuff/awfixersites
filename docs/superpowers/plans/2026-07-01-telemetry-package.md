# Telemetry package + CLink rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@awfixersites/telemetry` — a provider-agnostic Sentry/PostHog(/future pixel) telemetry package with a unified `track()` API — and roll it out to all 21 apps, including a `CLink` component that automatically handles cross-domain tracking continuity, click tracking, UTM injection, and external-link hygiene via per-app `clink.json`.

**Architecture:** A `TelemetryProvider` interface (`track`/`identify`/`pageview`/`captureError`/`getDistinctId`, all optional) is implemented once per vendor (Sentry, PostHog, an inert pixel stub). A small in-memory registry holds whichever providers `registerAppTelemetry`/`registerServerTelemetry` actually initialized (gated on env vars). The unified `track()` API fans out to the registry with per-provider error isolation. `CLink` wraps `next/link`, reading per-app config from `clink.json` via a `ClinkProvider` React context, and resolves hrefs through a pure `resolveHref()` function (independently testable) before firing `track()` on click.

**Tech Stack:** Bun workspace, TypeScript (strict), `@sentry/nextjs` (catalog `sentry`), `posthog-js` (catalog `telemetry`), `zod` v4, vitest, Next.js 16 App Router.

## Global Constraints

- Package manager is Bun (`bun install`, `bun run <script>`), pinned to `1.3.14` — never use npm/yarn/pnpm commands.
- All new workspace deps must be added via the existing `catalog:` mechanism in the root `package.json`, never pinned ad hoc in a package's own `package.json`.
- `zod` is v4.4.3: `z.record()` requires **two** arguments (`z.record(keyType, valueType)`) — the one-argument v3 form does not compile.
- TypeScript is `strict: true` with `noUncheckedIndexedAccess: true` (`src/tsconfig.base.json`) — no implicit `any`, no unchecked array/object index access.
- Code style: double-quoted strings, semicolons, following the exact patterns already in `packages/auth/src` and `packages/ui/src` (verified during design — e.g. `import * as React from "react"` namespace style in client components, no explicit function return-type annotations on components).
- oxlint (`src/lint.json`) enforces `react/jsx-no-target-blank: "error"` — any `target="_blank"` anchor must carry `rel="noopener noreferrer"`.
- Every workspace package follows the no-build-step convention: `exports` in `package.json` point straight at `./src/*.ts(x)`, `tsconfig.json` extends `../../src/tsconfig.react-library.json`, `vitest.config.ts` wraps `../../src/vitest.next`, and package scripts are exactly: `lint`, `format`, `typecheck` (`tsgo -p tsconfig.json --noEmit`), `test` (`vitest -c vitest.config.ts`), `lint:fix`.
- Root-level verification commands (run after each task from repo root):
  - Package typecheck: `bun run --cwd packages/telemetry typecheck`
  - Package tests: `bun run --cwd packages/telemetry test`
  - Full repo typecheck (Part B tasks only, since they touch every app): `bun run typecheck`

---

## Task 1: Scaffold `@awfixersites/telemetry` + provider types + pixel stub

**Files:**
- Create: `packages/telemetry/package.json`
- Create: `packages/telemetry/tsconfig.json`
- Create: `packages/telemetry/vitest.config.ts`
- Create: `packages/telemetry/src/providers/types.ts`
- Create: `packages/telemetry/src/providers/pixel.ts`
- Modify: `package.json:93-100` (add `@awfixersites/telemetry` to the `workspace` catalog)

**Interfaces:**
- Produces: `TelemetryProvider` interface (`packages/telemetry/src/providers/types.ts`) — `{ name: string; track?(event: string, properties?: Record<string, unknown>): void; identify?(distinctId: string, traits?: Record<string, unknown>): void; pageview?(url: string): void; captureError?(error: unknown, context?: Record<string, unknown>): void; getDistinctId?(): string | undefined; }`. Every later provider/registry/track task consumes this exact shape.
- Produces: `pixelProvider: TelemetryProvider` (`packages/telemetry/src/providers/pixel.ts`), `name: "pixel"`, every method a no-op / returns `undefined`.

- [ ] **Step 1: Add the package to the workspace catalog**

Edit `package.json`, in the `workspaces.catalogs.workspace` object (currently ends with `"@awfixersites/content": "workspace:*"`):

```json
      "workspace": {
        "@awfixersites/ui": "workspace:*",
        "@awfixersites/auth": "workspace:*",
        "@awfixersites/db": "workspace:*",
        "@awfixersites/mdx": "workspace:*",
        "@awfixersites/env": "workspace:*",
        "@awfixersites/content": "workspace:*",
        "@awfixersites/telemetry": "workspace:*"
      },
```

- [ ] **Step 2: Create the package directory and files**

Create `packages/telemetry/package.json`:

```json
{
  "name": "@awfixersites/telemetry",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./track": "./src/track.ts",
    "./register": "./src/register.ts",
    "./register-server": "./src/register-server.ts",
    "./link": "./src/link/index.ts",
    "./config": "./src/config/schema.ts"
  },
  "scripts": {
    "lint": "oxlint -c ../../src/lint.json .",
    "format": "oxfmt -c ../../src/fmt.json . --check",
    "typecheck": "tsgo -p tsconfig.json --noEmit",
    "test": "vitest -c vitest.config.ts",
    "lint:fix": "oxlint -c ../../src/lint.json . --fix"
  },
  "dependencies": {
    "@sentry/nextjs": "catalog:sentry",
    "posthog-js": "catalog:telemetry",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:types",
    "@types/react": "catalog:types",
    "@types/react-dom": "catalog:types",
    "next": "catalog:nextjs",
    "react": "catalog:react",
    "typescript": "catalog:checking"
  }
}
```

Create `packages/telemetry/tsconfig.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../../src/tsconfig.react-library.json",
  "compilerOptions": {
    "paths": {
      "@awfixersites/telemetry/*": ["./src/*"]
    }
  },
  "include": ["src", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Create `packages/telemetry/vitest.config.ts`:

```ts
import { mergeConfig } from "vitest/config";
import base from "../../src/vitest.next";

export default mergeConfig(base, {
  test: {
    name: "@awfixersites/telemetry",
  },
});
```

Create `packages/telemetry/src/providers/types.ts`:

```ts
export interface TelemetryProvider {
  name: string;
  track?(event: string, properties?: Record<string, unknown>): void;
  identify?(distinctId: string, traits?: Record<string, unknown>): void;
  pageview?(url: string): void;
  captureError?(error: unknown, context?: Record<string, unknown>): void;
  getDistinctId?(): string | undefined;
}
```

Create `packages/telemetry/src/providers/pixel.ts`:

```ts
import type { TelemetryProvider } from "./types";

/**
 * Inert until X/Twitter pixel is implemented — never registered by
 * registerAppTelemetry/registerServerTelemetry today. Fill in the methods
 * below when pixel support is added; no app code needs to change.
 */
export const pixelProvider: TelemetryProvider = {
  name: "pixel",
  track() {},
  identify() {},
  pageview() {},
  captureError() {},
  getDistinctId() {
    return undefined;
  },
};
```

- [ ] **Step 3: Install and verify**

Run: `bun install`
Expected: lockfile updates, no errors.

Run: `bun run --cwd packages/telemetry typecheck`
Expected: passes with no errors (two files, no logic to break).

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock packages/telemetry
git commit -m "$(cat <<'EOF'
feat(telemetry): scaffold @awfixersites/telemetry package

EOF
)"
```

---

## Task 2: Sentry provider

**Files:**
- Create: `packages/telemetry/src/providers/sentry.ts`
- Test: `packages/telemetry/src/providers/sentry.test.ts`

**Interfaces:**
- Consumes: `TelemetryProvider` from `./types` (Task 1).
- Produces: `initSentry(options: { dsn: string; app: string; environment?: string }): void` and `sentryProvider: TelemetryProvider` (`name: "sentry"`, implements `track` via `Sentry.addBreadcrumb`, `captureError` via `Sentry.captureException`). Consumed by `register.ts` (Task 6) and `register-server.ts` (Task 7).

- [ ] **Step 1: Write the failing test**

Create `packages/telemetry/src/providers/sentry.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const sentryMocks = vi.hoisted(() => ({
  init: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => sentryMocks);

import { initSentry, sentryProvider } from "./sentry";

describe("sentry provider", () => {
  beforeEach(() => {
    sentryMocks.init.mockClear();
    sentryMocks.addBreadcrumb.mockClear();
    sentryMocks.captureException.mockClear();
  });

  it("initSentry calls Sentry.init with dsn and app tag", () => {
    initSentry({ dsn: "https://key@sentry.io/1", app: "about" });
    expect(sentryMocks.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://key@sentry.io/1",
        initialScope: { tags: { app: "about" } },
      }),
    );
  });

  it("track adds a breadcrumb", () => {
    sentryProvider.track?.("clicked", { href: "/x" });
    expect(sentryMocks.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: "track", message: "clicked", data: { href: "/x" } }),
    );
  });

  it("captureError forwards to Sentry.captureException", () => {
    const error = new Error("boom");
    sentryProvider.captureError?.(error, { userId: "1" });
    expect(sentryMocks.captureException).toHaveBeenCalledWith(error, { extra: { userId: "1" } });
  });

  it("does not implement getDistinctId", () => {
    expect(sentryProvider.getDistinctId).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --cwd packages/telemetry test -- sentry.test.ts`
Expected: FAIL — `./sentry` module not found.

- [ ] **Step 3: Write the implementation**

Create `packages/telemetry/src/providers/sentry.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

import type { TelemetryProvider } from "./types";

export function initSentry(options: { dsn: string; app: string; environment?: string }): void {
  Sentry.init({
    dsn: options.dsn,
    environment: options.environment ?? process.env.NODE_ENV,
    initialScope: { tags: { app: options.app } },
  });
}

export const sentryProvider: TelemetryProvider = {
  name: "sentry",
  track(event, properties) {
    Sentry.addBreadcrumb({ category: "track", message: event, data: properties, level: "info" });
  },
  captureError(error, context) {
    Sentry.captureException(error, { extra: context });
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --cwd packages/telemetry test -- sentry.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/providers/sentry.ts packages/telemetry/src/providers/sentry.test.ts
git commit -m "$(cat <<'EOF'
feat(telemetry): add Sentry provider

EOF
)"
```

---

## Task 3: PostHog provider

**Files:**
- Create: `packages/telemetry/src/providers/posthog.ts`
- Test: `packages/telemetry/src/providers/posthog.test.ts`

**Interfaces:**
- Consumes: `TelemetryProvider` from `./types` (Task 1).
- Produces: `initPosthog(options: { apiKey: string; apiHost?: string }): void` and `posthogProvider: TelemetryProvider` (`name: "posthog"`, implements `track`, `identify`, `pageview`, `captureError`, `getDistinctId`). Consumed by `register.ts` (Task 6).

- [ ] **Step 1: Write the failing test**

Create `packages/telemetry/src/providers/posthog.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const posthogMocks = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  captureException: vi.fn(),
  get_distinct_id: vi.fn(() => "distinct-123"),
}));

vi.mock("posthog-js", () => ({ default: posthogMocks }));

import { initPosthog, posthogProvider } from "./posthog";

describe("posthog provider", () => {
  beforeEach(() => {
    posthogMocks.init.mockClear();
    posthogMocks.capture.mockClear();
    posthogMocks.identify.mockClear();
    posthogMocks.captureException.mockClear();
  });

  it("initPosthog calls posthog.init with apiKey and person_profiles", () => {
    initPosthog({ apiKey: "phc_test" });
    expect(posthogMocks.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ person_profiles: "identified_only" }),
    );
  });

  it("track calls posthog.capture", () => {
    posthogProvider.track?.("link_clicked", { href: "/x" });
    expect(posthogMocks.capture).toHaveBeenCalledWith("link_clicked", { href: "/x" });
  });

  it("identify calls posthog.identify", () => {
    posthogProvider.identify?.("user-1", { plan: "pro" });
    expect(posthogMocks.identify).toHaveBeenCalledWith("user-1", { plan: "pro" });
  });

  it("pageview captures a $pageview event", () => {
    posthogProvider.pageview?.("https://about.awfixer.llc/");
    expect(posthogMocks.capture).toHaveBeenCalledWith("$pageview", {
      $current_url: "https://about.awfixer.llc/",
    });
  });

  it("captureError forwards to posthog.captureException", () => {
    const error = new Error("boom");
    posthogProvider.captureError?.(error, { userId: "1" });
    expect(posthogMocks.captureException).toHaveBeenCalledWith(error, { userId: "1" });
  });

  it("getDistinctId returns posthog's distinct id", () => {
    expect(posthogProvider.getDistinctId?.()).toBe("distinct-123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --cwd packages/telemetry test -- posthog.test.ts`
Expected: FAIL — `./posthog` module not found.

- [ ] **Step 3: Write the implementation**

Create `packages/telemetry/src/providers/posthog.ts`:

```ts
import posthog from "posthog-js";

import type { TelemetryProvider } from "./types";

export function initPosthog(options: { apiKey: string; apiHost?: string }): void {
  posthog.init(options.apiKey, {
    api_host: options.apiHost ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
  });
}

export const posthogProvider: TelemetryProvider = {
  name: "posthog",
  track(event, properties) {
    posthog.capture(event, properties);
  },
  identify(distinctId, traits) {
    posthog.identify(distinctId, traits);
  },
  pageview(url) {
    posthog.capture("$pageview", { $current_url: url });
  },
  captureError(error, context) {
    posthog.captureException(error, context);
  },
  getDistinctId() {
    return posthog.get_distinct_id();
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --cwd packages/telemetry test -- posthog.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/providers/posthog.ts packages/telemetry/src/providers/posthog.test.ts
git commit -m "$(cat <<'EOF'
feat(telemetry): add PostHog provider

EOF
)"
```

---

## Task 4: Provider registry

**Files:**
- Create: `packages/telemetry/src/providers/registry.ts`
- Test: `packages/telemetry/src/providers/registry.test.ts`

**Interfaces:**
- Consumes: `TelemetryProvider` from `./types` (Task 1).
- Produces: `registerProvider(provider: TelemetryProvider): void`, `getActiveProviders(): TelemetryProvider[]`, `resetProviders(): void`. Consumed by `track.ts` (Task 5), `register.ts` (Task 6), `register-server.ts` (Task 7).

- [ ] **Step 1: Write the failing test**

Create `packages/telemetry/src/providers/registry.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { getActiveProviders, registerProvider, resetProviders } from "./registry";
import type { TelemetryProvider } from "./types";

describe("provider registry", () => {
  beforeEach(() => resetProviders());

  it("starts empty", () => {
    expect(getActiveProviders()).toEqual([]);
  });

  it("registers a provider", () => {
    const provider: TelemetryProvider = { name: "test" };
    registerProvider(provider);
    expect(getActiveProviders()).toEqual([provider]);
  });

  it("does not register the same provider name twice", () => {
    registerProvider({ name: "test" });
    registerProvider({ name: "test" });
    expect(getActiveProviders()).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --cwd packages/telemetry test -- registry.test.ts`
Expected: FAIL — `./registry` module not found.

- [ ] **Step 3: Write the implementation**

Create `packages/telemetry/src/providers/registry.ts`:

```ts
import type { TelemetryProvider } from "./types";

const registered: TelemetryProvider[] = [];

export function registerProvider(provider: TelemetryProvider): void {
  if (registered.some((existing) => existing.name === provider.name)) return;
  registered.push(provider);
}

export function getActiveProviders(): TelemetryProvider[] {
  return registered;
}

export function resetProviders(): void {
  registered.length = 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --cwd packages/telemetry test -- registry.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/providers/registry.ts packages/telemetry/src/providers/registry.test.ts
git commit -m "$(cat <<'EOF'
feat(telemetry): add provider registry

EOF
)"
```

---

## Task 5: Unified `track()` API

**Files:**
- Create: `packages/telemetry/src/track.ts`
- Test: `packages/telemetry/src/track.test.ts`

**Interfaces:**
- Consumes: `getActiveProviders` from `./providers/registry` (Task 4); `registerProvider`, `resetProviders` from the same module (test only).
- Produces: `track(event: string, properties?: Record<string, unknown>): void`, `identify(distinctId: string, traits?: Record<string, unknown>): void`, `pageview(url?: string): void`, `captureError(error: unknown, context?: Record<string, unknown>): void`, `getDistinctId(): string | undefined`. Consumed by `register-server.ts` (Task 7) and `link/clink.tsx` (Task 10).

- [ ] **Step 1: Write the failing test**

Create `packages/telemetry/src/track.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerProvider, resetProviders } from "./providers/registry";
import type { TelemetryProvider } from "./providers/types";
import { captureError, getDistinctId, identify, pageview, track } from "./track";

describe("track", () => {
  beforeEach(() => resetProviders());

  it("fans out track() to every registered provider", () => {
    const a = { name: "a", track: vi.fn() } satisfies TelemetryProvider;
    const b = { name: "b", track: vi.fn() } satisfies TelemetryProvider;
    registerProvider(a);
    registerProvider(b);
    track("clicked", { href: "/x" });
    expect(a.track).toHaveBeenCalledWith("clicked", { href: "/x" });
    expect(b.track).toHaveBeenCalledWith("clicked", { href: "/x" });
  });

  it("one provider throwing does not stop the others", () => {
    const failing = {
      name: "failing",
      track: vi.fn(() => {
        throw new Error("boom");
      }),
    } satisfies TelemetryProvider;
    const ok = { name: "ok", track: vi.fn() } satisfies TelemetryProvider;
    registerProvider(failing);
    registerProvider(ok);
    expect(() => track("clicked")).not.toThrow();
    expect(ok.track).toHaveBeenCalledWith("clicked", undefined);
  });

  it("is a no-op with zero providers registered", () => {
    expect(() => track("clicked")).not.toThrow();
  });

  it("identify only calls providers that implement identify", () => {
    const withIdentify = { name: "a", identify: vi.fn() } satisfies TelemetryProvider;
    const withoutIdentify = { name: "b" } satisfies TelemetryProvider;
    registerProvider(withIdentify);
    registerProvider(withoutIdentify);
    identify("user-1", { plan: "pro" });
    expect(withIdentify.identify).toHaveBeenCalledWith("user-1", { plan: "pro" });
  });

  it("pageview forwards to registered providers", () => {
    const provider = { name: "a", pageview: vi.fn() } satisfies TelemetryProvider;
    registerProvider(provider);
    pageview("https://about.awfixer.llc/");
    expect(provider.pageview).toHaveBeenCalledWith("https://about.awfixer.llc/");
  });

  it("pageview falls back to an empty string when no url and no window", () => {
    const provider = { name: "a", pageview: vi.fn() } satisfies TelemetryProvider;
    registerProvider(provider);
    pageview();
    expect(provider.pageview).toHaveBeenCalledWith("");
  });

  it("captureError fans out to providers implementing captureError", () => {
    const provider = { name: "a", captureError: vi.fn() } satisfies TelemetryProvider;
    registerProvider(provider);
    const error = new Error("boom");
    captureError(error, { userId: "1" });
    expect(provider.captureError).toHaveBeenCalledWith(error, { userId: "1" });
  });

  it("getDistinctId returns the first provider's non-empty id", () => {
    registerProvider({ name: "a", getDistinctId: () => "abc" });
    expect(getDistinctId()).toBe("abc");
  });

  it("getDistinctId returns undefined when no provider has one", () => {
    registerProvider({ name: "a" });
    expect(getDistinctId()).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --cwd packages/telemetry test -- track.test.ts`
Expected: FAIL — `./track` module not found.

- [ ] **Step 3: Write the implementation**

Create `packages/telemetry/src/track.ts`:

```ts
import { getActiveProviders } from "./providers/registry";

function safeCall(fn: () => void, providerName: string, method: string): void {
  try {
    fn();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[telemetry] ${providerName}.${method} failed`, error);
    }
  }
}

export function track(event: string, properties?: Record<string, unknown>): void {
  for (const provider of getActiveProviders()) {
    if (!provider.track) continue;
    safeCall(() => provider.track?.(event, properties), provider.name, "track");
  }
}

export function identify(distinctId: string, traits?: Record<string, unknown>): void {
  for (const provider of getActiveProviders()) {
    if (!provider.identify) continue;
    safeCall(() => provider.identify?.(distinctId, traits), provider.name, "identify");
  }
}

export function pageview(url?: string): void {
  const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
  for (const provider of getActiveProviders()) {
    if (!provider.pageview) continue;
    safeCall(() => provider.pageview?.(target), provider.name, "pageview");
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  for (const provider of getActiveProviders()) {
    if (!provider.captureError) continue;
    safeCall(() => provider.captureError?.(error, context), provider.name, "captureError");
  }
}

export function getDistinctId(): string | undefined {
  for (const provider of getActiveProviders()) {
    const id = provider.getDistinctId?.();
    if (id) return id;
  }
  return undefined;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --cwd packages/telemetry test -- track.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/track.ts packages/telemetry/src/track.test.ts
git commit -m "$(cat <<'EOF'
feat(telemetry): add unified track/identify/pageview/captureError API

EOF
)"
```

---

## Task 6: Client registration (`registerAppTelemetry`)

**Files:**
- Create: `packages/telemetry/src/register.ts`
- Test: `packages/telemetry/src/register.test.ts`

**Interfaces:**
- Consumes: `registerProvider` from `./providers/registry` (Task 4); `initSentry`, `sentryProvider` from `./providers/sentry` (Task 2); `initPosthog`, `posthogProvider` from `./providers/posthog` (Task 3).
- Produces: `registerAppTelemetry(options: { app: string }): void`, reading `NEXT_PUBLIC_SENTRY_DSN` and `NEXT_PUBLIC_POSTHOG_KEY` (+ optional `NEXT_PUBLIC_POSTHOG_HOST`) from `process.env`. Consumed by every app's `instrumentation-client.ts` (Task 11).

- [ ] **Step 1: Write the failing test**

Create `packages/telemetry/src/register.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const registryMocks = vi.hoisted(() => ({ registerProvider: vi.fn() }));
const sentryMocks = vi.hoisted(() => ({ initSentry: vi.fn(), sentryProvider: { name: "sentry" } }));
const posthogMocks = vi.hoisted(() => ({
  initPosthog: vi.fn(),
  posthogProvider: { name: "posthog" },
}));

vi.mock("./providers/registry", () => registryMocks);
vi.mock("./providers/sentry", () => sentryMocks);
vi.mock("./providers/posthog", () => posthogMocks);

import { registerAppTelemetry } from "./register";

describe("registerAppTelemetry", () => {
  beforeEach(() => {
    registryMocks.registerProvider.mockClear();
    sentryMocks.initSentry.mockClear();
    posthogMocks.initPosthog.mockClear();
    vi.unstubAllEnvs();
  });

  it("registers sentry only when NEXT_PUBLIC_SENTRY_DSN is set", () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://key@sentry.io/1");
    registerAppTelemetry({ app: "about" });
    expect(sentryMocks.initSentry).toHaveBeenCalledWith({
      dsn: "https://key@sentry.io/1",
      app: "about",
    });
    expect(registryMocks.registerProvider).toHaveBeenCalledWith(sentryMocks.sentryProvider);
    expect(posthogMocks.initPosthog).not.toHaveBeenCalled();
  });

  it("registers posthog only when NEXT_PUBLIC_POSTHOG_KEY is set", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    registerAppTelemetry({ app: "about" });
    expect(posthogMocks.initPosthog).toHaveBeenCalledWith({
      apiKey: "phc_test",
      apiHost: undefined,
    });
    expect(registryMocks.registerProvider).toHaveBeenCalledWith(posthogMocks.posthogProvider);
  });

  it("registers neither provider when no env vars are set", () => {
    registerAppTelemetry({ app: "about" });
    expect(registryMocks.registerProvider).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --cwd packages/telemetry test -- register.test.ts`
Expected: FAIL — `./register` module not found.

- [ ] **Step 3: Write the implementation**

Create `packages/telemetry/src/register.ts`:

```ts
import { initPosthog, posthogProvider } from "./providers/posthog";
import { registerProvider } from "./providers/registry";
import { initSentry, sentryProvider } from "./providers/sentry";

export function registerAppTelemetry(options: { app: string }): void {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (sentryDsn) {
    initSentry({ dsn: sentryDsn, app: options.app });
    registerProvider(sentryProvider);
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey) {
    initPosthog({ apiKey: posthogKey, apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST });
    registerProvider(posthogProvider);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --cwd packages/telemetry test -- register.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/register.ts packages/telemetry/src/register.test.ts
git commit -m "$(cat <<'EOF'
feat(telemetry): add registerAppTelemetry client init

EOF
)"
```

---

## Task 7: Server registration + `onRequestError`

**Files:**
- Create: `packages/telemetry/src/register-server.ts`
- Test: `packages/telemetry/src/register-server.test.ts`

**Interfaces:**
- Consumes: `registerProvider` from `./providers/registry` (Task 4); `initSentry`, `sentryProvider` from `./providers/sentry` (Task 2); `captureError` from `./track` (Task 5).
- Produces: `registerServerTelemetry(options: { app: string }): void` (reads `SENTRY_DSN`, falling back to `NEXT_PUBLIC_SENTRY_DSN`) and `onRequestErrorTelemetry(error: unknown, request: { path: string; method: string; headers: Record<string, string> }, context: { routerKind: string; routePath: string; routeType: string }): void`. Both consumed by every app's new `instrumentation.ts` (Task 11).

- [ ] **Step 1: Write the failing test**

Create `packages/telemetry/src/register-server.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const registryMocks = vi.hoisted(() => ({ registerProvider: vi.fn() }));
const sentryMocks = vi.hoisted(() => ({ initSentry: vi.fn(), sentryProvider: { name: "sentry" } }));
const trackMocks = vi.hoisted(() => ({ captureError: vi.fn() }));

vi.mock("./providers/registry", () => registryMocks);
vi.mock("./providers/sentry", () => sentryMocks);
vi.mock("./track", () => trackMocks);

import { onRequestErrorTelemetry, registerServerTelemetry } from "./register-server";

describe("registerServerTelemetry", () => {
  beforeEach(() => {
    registryMocks.registerProvider.mockClear();
    sentryMocks.initSentry.mockClear();
    trackMocks.captureError.mockClear();
    vi.unstubAllEnvs();
  });

  it("initializes sentry when SENTRY_DSN is set", () => {
    vi.stubEnv("SENTRY_DSN", "https://key@sentry.io/1");
    registerServerTelemetry({ app: "about" });
    expect(sentryMocks.initSentry).toHaveBeenCalledWith({
      dsn: "https://key@sentry.io/1",
      app: "about",
    });
    expect(registryMocks.registerProvider).toHaveBeenCalledWith(sentryMocks.sentryProvider);
  });

  it("falls back to NEXT_PUBLIC_SENTRY_DSN when SENTRY_DSN is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://key@sentry.io/2");
    registerServerTelemetry({ app: "about" });
    expect(sentryMocks.initSentry).toHaveBeenCalledWith({
      dsn: "https://key@sentry.io/2",
      app: "about",
    });
  });

  it("does nothing when no dsn is configured", () => {
    registerServerTelemetry({ app: "about" });
    expect(sentryMocks.initSentry).not.toHaveBeenCalled();
  });
});

describe("onRequestErrorTelemetry", () => {
  it("forwards the error and route context to captureError", () => {
    const error = new Error("boom");
    onRequestErrorTelemetry(
      error,
      { path: "/x", method: "GET", headers: {} },
      { routerKind: "App Router", routePath: "/x", routeType: "render" },
    );
    expect(trackMocks.captureError).toHaveBeenCalledWith(error, {
      path: "/x",
      routerKind: "App Router",
      routeType: "render",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --cwd packages/telemetry test -- register-server.test.ts`
Expected: FAIL — `./register-server` module not found.

- [ ] **Step 3: Write the implementation**

Create `packages/telemetry/src/register-server.ts`:

```ts
import { registerProvider } from "./providers/registry";
import { initSentry, sentryProvider } from "./providers/sentry";
import { captureError } from "./track";

export function registerServerTelemetry(options: { app: string }): void {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  initSentry({ dsn, app: options.app });
  registerProvider(sentryProvider);
}

export function onRequestErrorTelemetry(
  error: unknown,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string },
): void {
  captureError(error, {
    path: request.path,
    routerKind: context.routerKind,
    routeType: context.routeType,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --cwd packages/telemetry test -- register-server.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/register-server.ts packages/telemetry/src/register-server.test.ts
git commit -m "$(cat <<'EOF'
feat(telemetry): add server registration + onRequestError hook

EOF
)"
```

---

## Task 8: `clink.json` config schema

**Files:**
- Create: `packages/telemetry/src/config/schema.ts`
- Test: `packages/telemetry/src/config/schema.test.ts`

**Interfaces:**
- Produces: `clinkConfigSchema` (zod schema), `type ClinkConfig`, `CLINK_SAFE_DEFAULT: ClinkConfig`, `parseClinkConfig(input: unknown): ClinkConfig` (throws on invalid), `parseClinkConfigSafe(input: unknown): { config: ClinkConfig; error: z.ZodError | null }`. Consumed by `link/clink-provider.tsx` and `link/resolve-href.ts` (Tasks 9–10) and the rollout script (Task 11).

- [ ] **Step 1: Write the failing test**

Create `packages/telemetry/src/config/schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { CLINK_SAFE_DEFAULT, parseClinkConfig, parseClinkConfigSafe } from "./schema";

describe("clinkConfigSchema", () => {
  it("parses a fully specified config", () => {
    const input = {
      network: ["awfixer.llc"],
      utm: { source: "about", medium: "referral", campaign: "spring" },
      click: { event: "link_clicked", properties: { app: "about" } },
      exclude: ["mailto:*"],
    };
    expect(parseClinkConfig(input)).toEqual(input);
  });

  it("applies defaults for an empty object", () => {
    expect(parseClinkConfig({})).toEqual({
      network: [],
      click: { event: "link_clicked", properties: {} },
      exclude: [],
    });
  });

  it("throws on invalid types", () => {
    expect(() => parseClinkConfig({ network: "not-an-array" })).toThrow();
  });

  it("parseClinkConfigSafe returns the safe default and an error on invalid input", () => {
    const result = parseClinkConfigSafe({ network: "not-an-array" });
    expect(result.config).toEqual(CLINK_SAFE_DEFAULT);
    expect(result.error).not.toBeNull();
  });

  it("parseClinkConfigSafe returns the parsed config and no error on valid input", () => {
    const result = parseClinkConfigSafe({ network: ["awfixer.llc"] });
    expect(result.error).toBeNull();
    expect(result.config.network).toEqual(["awfixer.llc"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --cwd packages/telemetry test -- schema.test.ts`
Expected: FAIL — `./schema` module not found.

- [ ] **Step 3: Write the implementation**

Create `packages/telemetry/src/config/schema.ts`:

```ts
import { z } from "zod";

export const clinkConfigSchema = z.object({
  network: z.array(z.string()).default([]),
  utm: z
    .object({
      source: z.string(),
      medium: z.string().default("referral"),
      campaign: z.string().nullable().default(null),
    })
    .optional(),
  click: z
    .object({
      event: z.string().default("link_clicked"),
      properties: z.record(z.string(), z.unknown()).default({}),
    })
    .default({ event: "link_clicked", properties: {} }),
  exclude: z.array(z.string()).default([]),
});

export type ClinkConfig = z.infer<typeof clinkConfigSchema>;

export const CLINK_SAFE_DEFAULT: ClinkConfig = {
  network: [],
  click: { event: "link_clicked", properties: {} },
  exclude: [],
};

export function parseClinkConfig(input: unknown): ClinkConfig {
  return clinkConfigSchema.parse(input);
}

export function parseClinkConfigSafe(input: unknown): {
  config: ClinkConfig;
  error: z.ZodError | null;
} {
  const result = clinkConfigSchema.safeParse(input);
  if (result.success) return { config: result.data, error: null };
  return { config: CLINK_SAFE_DEFAULT, error: result.error };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --cwd packages/telemetry test -- schema.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/config
git commit -m "$(cat <<'EOF'
feat(telemetry): add clink.json config schema

EOF
)"
```

---

## Task 9: `resolveHref` pure function

**Files:**
- Create: `packages/telemetry/src/link/resolve-href.ts`
- Test: `packages/telemetry/src/link/resolve-href.test.ts`

**Interfaces:**
- Consumes: `ClinkConfig`, `CLINK_SAFE_DEFAULT` from `../config/schema` (Task 8).
- Produces: `type ResolvedHref = { href: string; internal: boolean; rel?: string; target?: string }` and `resolveHref(href: string, config: ClinkConfig, currentOrigin: string, distinctId?: string): ResolvedHref`. Consumed by `link/clink.tsx` (Task 10).

- [ ] **Step 1: Write the failing test**

Create `packages/telemetry/src/link/resolve-href.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { CLINK_SAFE_DEFAULT, type ClinkConfig } from "../config/schema";
import { resolveHref } from "./resolve-href";

const baseConfig: ClinkConfig = {
  ...CLINK_SAFE_DEFAULT,
  network: ["awfixer.llc", "careers.awfixer.llc"],
  utm: { source: "about", medium: "referral", campaign: null },
  exclude: ["mailto:*", "tel:*", "^/legal"],
};

const ORIGIN = "https://about.awfixer.llc";

describe("resolveHref", () => {
  it("leaves relative paths untouched and marks them internal", () => {
    expect(resolveHref("/careers", baseConfig, ORIGIN)).toEqual({
      href: "/careers",
      internal: true,
    });
  });

  it("excludes mailto: links entirely", () => {
    expect(resolveHref("mailto:hi@awfixer.llc", baseConfig, ORIGIN)).toEqual({
      href: "mailto:hi@awfixer.llc",
      internal: true,
    });
  });

  it("excludes tel: links entirely", () => {
    expect(resolveHref("tel:+15555550100", baseConfig, ORIGIN)).toEqual({
      href: "tel:+15555550100",
      internal: true,
    });
  });

  it("excludes paths matching a regex pattern", () => {
    expect(resolveHref("/legal/terms", baseConfig, ORIGIN)).toEqual({
      href: "/legal/terms",
      internal: true,
    });
  });

  it("leaves same-origin absolute links untouched", () => {
    const result = resolveHref("https://about.awfixer.llc/team", baseConfig, ORIGIN);
    expect(result.href).toBe("https://about.awfixer.llc/team");
    expect(result.internal).toBe(true);
  });

  it("appends a posthog distinct id for cross-origin network links", () => {
    const result = resolveHref(
      "https://careers.awfixer.llc/openings",
      baseConfig,
      ORIGIN,
      "distinct-123",
    );
    expect(result.internal).toBe(true);
    expect(result.href).toBe("https://careers.awfixer.llc/openings?ph_distinct_id=distinct-123");
  });

  it("does not append a distinct id for network links when none is available", () => {
    const result = resolveHref("https://careers.awfixer.llc/openings", baseConfig, ORIGIN);
    expect(result.href).toBe("https://careers.awfixer.llc/openings");
  });

  it("appends utm params and external hygiene for external links", () => {
    const result = resolveHref("https://example.com/page", baseConfig, ORIGIN);
    expect(result.internal).toBe(false);
    expect(result.rel).toBe("noopener noreferrer");
    expect(result.target).toBe("_blank");
    const url = new URL(result.href);
    expect(url.searchParams.get("utm_source")).toBe("about");
    expect(url.searchParams.get("utm_medium")).toBe("referral");
    expect(url.searchParams.has("utm_campaign")).toBe(false);
  });

  it("does not override utm params the link already specifies", () => {
    const result = resolveHref("https://example.com/page?utm_source=newsletter", baseConfig, ORIGIN);
    const url = new URL(result.href);
    expect(url.searchParams.get("utm_source")).toBe("newsletter");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --cwd packages/telemetry test -- resolve-href.test.ts`
Expected: FAIL — `./resolve-href` module not found.

- [ ] **Step 3: Write the implementation**

Create `packages/telemetry/src/link/resolve-href.ts`:

```ts
import type { ClinkConfig } from "../config/schema";

export type ResolvedHref = {
  href: string;
  internal: boolean;
  rel?: string;
  target?: string;
};

function isAbsoluteUrl(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

function isExcluded(href: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith("*")) {
      return href.startsWith(pattern.slice(0, -1));
    }
    try {
      return new RegExp(pattern).test(href);
    } catch {
      return href === pattern;
    }
  });
}

function hostnameOf(href: string, currentOrigin: string): string | null {
  try {
    return new URL(href, currentOrigin).hostname;
  } catch {
    return null;
  }
}

function isNetworkHost(hostname: string, network: string[]): boolean {
  return network.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

export function resolveHref(
  href: string,
  config: ClinkConfig,
  currentOrigin: string,
  distinctId?: string,
): ResolvedHref {
  if (isExcluded(href, config.exclude)) {
    return { href, internal: true };
  }

  if (!isAbsoluteUrl(href) || href.startsWith("/")) {
    return { href, internal: true };
  }

  const hostname = hostnameOf(href, currentOrigin);
  if (!hostname) {
    return { href, internal: true };
  }

  const currentHostname = hostnameOf(currentOrigin, currentOrigin) ?? "";
  const network = isNetworkHost(hostname, config.network);

  if (network) {
    if (hostname === currentHostname || !distinctId) {
      return { href, internal: true };
    }
    const url = new URL(href);
    url.searchParams.set("ph_distinct_id", distinctId);
    return { href: url.toString(), internal: true };
  }

  const url = new URL(href);
  if (config.utm) {
    if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", config.utm.source);
    if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", config.utm.medium);
    if (config.utm.campaign && !url.searchParams.has("utm_campaign")) {
      url.searchParams.set("utm_campaign", config.utm.campaign);
    }
  }

  return { href: url.toString(), internal: false, rel: "noopener noreferrer", target: "_blank" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --cwd packages/telemetry test -- resolve-href.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/link/resolve-href.ts packages/telemetry/src/link/resolve-href.test.ts
git commit -m "$(cat <<'EOF'
feat(telemetry): add resolveHref pure function for CLink

EOF
)"
```

---

## Task 10: `ClinkProvider` + `CLink` components

**Files:**
- Create: `packages/telemetry/src/link/clink-provider.tsx`
- Create: `packages/telemetry/src/link/clink.tsx`
- Create: `packages/telemetry/src/link/index.ts`

**Interfaces:**
- Consumes: `CLINK_SAFE_DEFAULT`, `parseClinkConfigSafe`, `ClinkConfig` from `../config/schema` (Task 8); `resolveHref` from `./resolve-href` (Task 9); `getDistinctId`, `track` from `../track` (Task 5).
- Produces: `ClinkProvider({ config: unknown; children: React.ReactNode })`, `useClinkConfig(): ClinkConfig`, `CLink` (drop-in `next/link` replacement, `CLinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & { href: string }`). Re-exported from `./index.ts`, which is the package's `./link` export subpath. Consumed by every app's `app/layout.tsx` and by call sites currently using `next/link` (Tasks 11–12).

No dedicated test file for this task: `ClinkProvider`'s only real logic is `parseClinkConfigSafe`, already fully covered by `config/schema.test.ts` (Task 8); `CLink`'s only real logic is `resolveHref`, already fully covered by `resolve-href.test.ts` (Task 9). Both components here are thin wiring with no untested branches — the repo has no existing component-rendering test precedent (`vitest.next.ts` runs in `environment: "node"`, no DOM), so this task is implementation + typecheck only, no render test.

- [ ] **Step 1: Write `ClinkProvider`**

Create `packages/telemetry/src/link/clink-provider.tsx`:

```tsx
"use client";

import * as React from "react";

import { CLINK_SAFE_DEFAULT, parseClinkConfigSafe, type ClinkConfig } from "../config/schema";

const ClinkContext = React.createContext<ClinkConfig>(CLINK_SAFE_DEFAULT);

function ClinkProvider({ config, children }: { config: unknown; children: React.ReactNode }) {
  const resolved = React.useMemo<ClinkConfig>(() => {
    const { config: parsed, error } = parseClinkConfigSafe(config);
    if (error) {
      if (process.env.NODE_ENV !== "production") {
        throw new Error(`[telemetry] invalid clink.json: ${error.message}`);
      }
      console.error("[telemetry] invalid clink.json, falling back to safe defaults", error);
    }
    return parsed;
  }, [config]);

  return <ClinkContext.Provider value={resolved}>{children}</ClinkContext.Provider>;
}

function useClinkConfig(): ClinkConfig {
  return React.useContext(ClinkContext);
}

export { ClinkProvider, useClinkConfig };
```

- [ ] **Step 2: Write `CLink`**

Create `packages/telemetry/src/link/clink.tsx`:

```tsx
"use client";

import NextLink from "next/link";
import * as React from "react";

import { getDistinctId, track } from "../track";
import { useClinkConfig } from "./clink-provider";
import { resolveHref } from "./resolve-href";

type CLinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

function CLink({ href, onClick, rel, target, ...rest }: CLinkProps) {
  const config = useClinkConfig();
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const resolved = resolveHref(href, config, currentOrigin, getDistinctId());

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    track(config.click.event, {
      ...config.click.properties,
      href: resolved.href,
      internal: resolved.internal,
    });
    onClick?.(event);
  }

  return (
    <NextLink
      {...rest}
      href={resolved.href}
      rel={resolved.rel ?? rel}
      target={resolved.target ?? target}
      onClick={handleClick}
    />
  );
}

export { CLink };
export type { CLinkProps };
```

- [ ] **Step 3: Write the barrel export**

Create `packages/telemetry/src/link/index.ts`:

```ts
export { CLink } from "./clink";
export type { CLinkProps } from "./clink";
export { ClinkProvider, useClinkConfig } from "./clink-provider";
```

- [ ] **Step 4: Verify the whole package**

Run: `bun run --cwd packages/telemetry typecheck`
Expected: passes with no errors.

Run: `bun run --cwd packages/telemetry test`
Expected: PASS — all tests from Tasks 2–9 (34 tests total) still pass.

Run: `bun run --cwd packages/telemetry lint`
Expected: no errors (in particular, no `react/jsx-no-target-blank` violation — `CLink` always pairs `target="_blank"` with `rel="noopener noreferrer"` from `resolveHref`).

- [ ] **Step 5: Commit**

```bash
git add packages/telemetry/src/link
git commit -m "$(cat <<'EOF'
feat(telemetry): add ClinkProvider and CLink components

EOF
)"
```

---

## Task 11: Rollout script — wire every app to the telemetry package

**Files:**
- Create: `scripts/apply-telemetry-apps.ts`
- Modify (via script, not by hand): `apps/*/package.json`, `apps/*/next.config.ts`, `apps/*/instrumentation-client.ts`, `apps/*/.env.example`, `apps/*/app/layout.tsx`
- Create (via script): `apps/*/clink.json`, `apps/*/instrumentation.ts`

**Interfaces:**
- Consumes: `registerAppTelemetry` (`@awfixersites/telemetry/register`, Task 6), `registerServerTelemetry` + `onRequestErrorTelemetry` (`@awfixersites/telemetry/register-server`, Task 7), `ClinkProvider` (`@awfixersites/telemetry/link`, Task 10).
- Verified structurally uniform across all 21 apps prior to writing this script: every `app/layout.tsx` has exactly one `{children}` occurrence; every `next.config.ts` has a `transpilePackages: [` array literal; every `instrumentation-client.ts` follows the `registerAppBotId()` pattern (see `scripts/apply-botid-apps.ts` for the precedent this script follows).

- [ ] **Step 1: Write the script**

Create `scripts/apply-telemetry-apps.ts`:

```ts
#!/usr/bin/env bun
/**
 * Wire @awfixersites/telemetry (init + CLink) into every Next app under apps/.
 * Run from repo root: bun scripts/apply-telemetry-apps.ts
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const appsDir = resolve(repoRoot, "apps");

function patchPackageJson(appDir: string): boolean {
  const path = resolve(appDir, "package.json");
  if (!existsSync(path)) return false;
  const pkg = JSON.parse(readFileSync(path, "utf8")) as {
    dependencies?: Record<string, string>;
  };
  pkg.dependencies ??= {};
  if (pkg.dependencies["@awfixersites/telemetry"]) return false;
  pkg.dependencies["@awfixersites/telemetry"] = "catalog:workspace";
  pkg.dependencies = Object.fromEntries(
    Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
  return true;
}

function patchNextConfig(appDir: string): boolean {
  const path = resolve(appDir, "next.config.ts");
  if (!existsSync(path)) return false;
  const content = readFileSync(path, "utf8");
  if (content.includes("@awfixersites/telemetry")) return false;
  if (!/transpilePackages:\s*\[/.test(content)) return false;
  const patched = content.replace(
    /transpilePackages:\s*\[/,
    'transpilePackages: ["@awfixersites/telemetry", ',
  );
  writeFileSync(path, patched);
  return true;
}

function patchInstrumentationClient(appDir: string, appName: string): boolean {
  const path = resolve(appDir, "instrumentation-client.ts");
  if (!existsSync(path)) return false;
  let content = readFileSync(path, "utf8");
  if (content.includes("registerAppTelemetry")) return false;
  if (!content.includes('from "@awfixersites/telemetry/register"')) {
    content = `import { registerAppTelemetry } from "@awfixersites/telemetry/register";\n${content}`;
  }
  content = `${content.trimEnd()}\nregisterAppTelemetry({ app: "${appName}" });\n`;
  writeFileSync(path, content);
  return true;
}

function writeInstrumentationServer(appDir: string, appName: string): boolean {
  const path = resolve(appDir, "instrumentation.ts");
  if (existsSync(path)) return false;
  const content = `import { onRequestErrorTelemetry, registerServerTelemetry } from "@awfixersites/telemetry/register-server";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerServerTelemetry({ app: "${appName}" });
  }
}

export const onRequestError = onRequestErrorTelemetry;
`;
  writeFileSync(path, content);
  return true;
}

function writeClinkJson(appDir: string, appName: string): boolean {
  const path = resolve(appDir, "clink.json");
  if (existsSync(path)) return false;
  const config = {
    network: [],
    utm: { source: appName, medium: "referral", campaign: null },
    click: { event: "link_clicked", properties: { app: appName } },
    exclude: ["mailto:*", "tel:*"],
  };
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
  return true;
}

function patchEnvExample(appDir: string): boolean {
  const path = resolve(appDir, ".env.example");
  if (!existsSync(path)) return false;
  const content = readFileSync(path, "utf8");
  if (content.includes("NEXT_PUBLIC_SENTRY_DSN")) return false;
  const addition =
    "NEXT_PUBLIC_SENTRY_DSN=\nNEXT_PUBLIC_POSTHOG_KEY=\nNEXT_PUBLIC_POSTHOG_HOST=\n";
  writeFileSync(path, `${content.trimEnd()}\n${addition}`);
  return true;
}

function patchLayout(appDir: string): boolean {
  const path = resolve(appDir, "app/layout.tsx");
  if (!existsSync(path)) return false;
  let content = readFileSync(path, "utf8");
  if (content.includes("ClinkProvider")) return false;
  if ((content.match(/\{children\}/g) ?? []).length !== 1) {
    console.warn(`  skip layout wrap: unexpected {children} count in ${path}`);
    return false;
  }
  content = content.replace(
    "{children}",
    "<ClinkProvider config={clinkConfig}>{children}</ClinkProvider>",
  );
  const imports =
    'import { ClinkProvider } from "@awfixersites/telemetry/link";\nimport clinkConfig from "../clink.json";\n';
  content = `${imports}${content}`;
  writeFileSync(path, content);
  return true;
}

for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const appName = dirent.name;
  const appDir = resolve(appsDir, appName);
  if (!existsSync(resolve(appDir, "next.config.ts"))) continue;

  const results = {
    "package.json": patchPackageJson(appDir),
    "next.config.ts": patchNextConfig(appDir),
    "instrumentation-client.ts": patchInstrumentationClient(appDir, appName),
    "instrumentation.ts": writeInstrumentationServer(appDir, appName),
    "clink.json": writeClinkJson(appDir, appName),
    ".env.example": patchEnvExample(appDir),
    "app/layout.tsx": patchLayout(appDir),
  };

  const applied = Object.entries(results)
    .filter(([, changed]) => changed)
    .map(([file]) => file);
  if (applied.length > 0) {
    console.log(`${appName}: ${applied.join(", ")}`);
  }
}
```

- [ ] **Step 2: Run the script**

Run: `bun scripts/apply-telemetry-apps.ts`
Expected: prints one line per app (21 lines) listing all 7 files touched per app.

- [ ] **Step 3: Install and verify every app typechecks**

Run: `bun install`
Expected: lockfile updates for the 21 apps' new `@awfixersites/telemetry` dependency, no errors.

Run: `bun run typecheck`
Expected: every workspace (including all 21 apps and `packages/telemetry`) passes. If any app fails because its `app/layout.tsx` had an unexpected shape (the script's `patchLayout` guard printed a `skip layout wrap` warning), fix that app's `layout.tsx` by hand: wrap the JSX rendering `{children}` with `<ClinkProvider config={clinkConfig}>...</ClinkProvider>` and add the same two import lines the script uses, matching where `{children}` actually appears in that file.

Run: `bun run lint`
Expected: no new errors introduced by the script's edits.

- [ ] **Step 4: Spot-check one app by hand**

Read `apps/about/app/layout.tsx`, `apps/about/next.config.ts`, `apps/about/instrumentation-client.ts`, `apps/about/instrumentation.ts`, and `apps/about/clink.json` to confirm the edits match the intent (ClinkProvider wraps children, telemetry registered with `app: "about"`, clink.json has `network: []` and `utm.source: "about"`).

- [ ] **Step 5: Commit**

```bash
git add scripts/apply-telemetry-apps.ts apps package.json bun.lock
git commit -m "$(cat <<'EOF'
feat(telemetry): wire @awfixersites/telemetry into every app

EOF
)"
```

---

## Task 12: Swap `next/link` for `CLink` everywhere

**Files:**
- Create: `scripts/apply-clink-imports.ts`
- Modify (via script): every file matching `import Link from "next/link";` under `apps/` and `packages/` (53 files confirmed during design, all using the exact default-import form)
- Modify: `packages/ui/package.json` (add `@awfixersites/telemetry` dependency — `packages/ui/src/auth/passkey-auth-form.tsx` uses `next/link` and needs the new import to resolve)

**Interfaces:**
- Consumes: `CLink` exported from `@awfixersites/telemetry/link` (Task 10). Because `CLink`'s prop type is `Omit<React.ComponentProps<typeof NextLink>, "href"> & { href: string }` — a superset of `next/link`'s props — aliasing the import (`import { CLink as Link } from "@awfixersites/telemetry/link";`) requires no changes to any JSX call site.

- [ ] **Step 1: Add `@awfixersites/telemetry` to `packages/ui`**

Edit `packages/ui/package.json`, in `dependencies` (currently starts with `"@awfixersites/auth": "catalog:workspace",`), add alphabetically:

```json
    "@awfixersites/auth": "catalog:workspace",
    "@awfixersites/telemetry": "catalog:workspace",
```

- [ ] **Step 2: Write the codemod script**

Create `scripts/apply-clink-imports.ts`:

```ts
#!/usr/bin/env bun
/**
 * Replace `import Link from "next/link";` with the CLink-backed alias
 * everywhere in apps/ and packages/. Run from repo root:
 * bun scripts/apply-clink-imports.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const roots = ["apps", "packages"].map((dir) => resolve(repoRoot, dir));

const OLD_IMPORT = 'import Link from "next/link";';
const NEW_IMPORT = 'import { CLink as Link } from "@awfixersites/telemetry/link";';
const SKIP_DIRS = new Set(["node_modules", ".next", "dist"]);

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      files.push(full);
    }
  }
  return files;
}

let changed = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    const content = readFileSync(file, "utf8");
    if (!content.includes(OLD_IMPORT)) continue;
    writeFileSync(file, content.replace(OLD_IMPORT, NEW_IMPORT));
    changed += 1;
    console.log(`patched: ${file}`);
  }
}
console.log(`${changed} file(s) patched`);
```

- [ ] **Step 3: Run the script**

Run: `bun scripts/apply-clink-imports.ts`
Expected: prints 53 `patched: ...` lines (52 under `apps/`, 1 under `packages/ui/src/auth/passkey-auth-form.tsx`), then `53 file(s) patched`. If the count differs, some file used a non-default-import form for `next/link` — grep for `from "next/link"` and check it manually; do not force-patch a form the script doesn't recognize.

- [ ] **Step 4: Verify**

Run: `bun install`
Expected: lockfile updates for `packages/ui`'s new dependency, no errors.

Run: `bun run typecheck`
Expected: every workspace passes — in particular, every file that used `<Link href="...">` still typechecks against `CLinkProps`, since `href` there is always a string literal or template string, matching `CLinkProps["href"]: string`.

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/apply-clink-imports.ts apps packages/ui bun.lock
git commit -m "$(cat <<'EOF'
feat(telemetry): swap next/link for CLink across the monorepo

EOF
)"
```

---

## Post-plan follow-up (not part of this plan)

- Actual X/Twitter pixel implementation — fill in `packages/telemetry/src/providers/pixel.ts` and register it in `register.ts`/`register-server.ts` behind a new env var, once pixel support is prioritized.
- Populate each app's `clink.json` `network` list with real production domains once the full app→domain map is confirmed (deferred during design — see `docs/superpowers/specs/2026-07-01-telemetry-package-design.md`).
- Set real `NEXT_PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_POSTHOG_KEY` values per app in Vercel project env (not committed to `.env.example`).
