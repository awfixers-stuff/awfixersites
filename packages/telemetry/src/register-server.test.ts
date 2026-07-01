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
    vi.stubEnv("SENTRY_DSN", undefined);
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://key@sentry.io/2");
    registerServerTelemetry({ app: "about" });
    expect(sentryMocks.initSentry).toHaveBeenCalledWith({
      dsn: "https://key@sentry.io/2",
      app: "about",
    });
  });

  it("does nothing when no dsn is configured", () => {
    vi.stubEnv("SENTRY_DSN", undefined);
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", undefined);
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
