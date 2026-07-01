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
