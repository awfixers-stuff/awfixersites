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

  it("getDistinctId one provider throwing does not stop the others", () => {
    const failing = {
      name: "failing",
      getDistinctId: vi.fn(() => {
        throw new Error("boom");
      }),
    } satisfies TelemetryProvider;
    const ok = {
      name: "ok",
      getDistinctId: vi.fn(() => "valid-id"),
    } satisfies TelemetryProvider;
    registerProvider(failing);
    registerProvider(ok);
    expect(() => getDistinctId()).not.toThrow();
    expect(getDistinctId()).toBe("valid-id");
  });
});
