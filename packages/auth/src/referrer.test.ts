import { describe, expect, it } from "vitest";

import { resolveSafeReturnTo } from "./referrer";

const fallback = "https://awfixer.codes";

describe("resolveSafeReturnTo", () => {
  it("returns fallback when returnTo is missing", () => {
    expect(resolveSafeReturnTo(undefined, fallback)).toBe(fallback);
  });

  it("allows relative paths on the IdP", () => {
    expect(resolveSafeReturnTo("/settings", fallback)).toBe("/settings");
  });

  it("allows known oauth site hosts", () => {
    expect(resolveSafeReturnTo("https://awfixer.codes/dashboard", fallback)).toBe(
      "https://awfixer.codes/dashboard",
    );
  });

  it("rejects unknown external hosts", () => {
    expect(resolveSafeReturnTo("https://evil.example/phish", fallback)).toBe(fallback);
  });

  it("rejects protocol-relative paths", () => {
    expect(resolveSafeReturnTo("//evil.example/phish", fallback)).toBe(fallback);
  });
});
