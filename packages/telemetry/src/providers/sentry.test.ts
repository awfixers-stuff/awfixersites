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
