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
