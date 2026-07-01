import { afterEach, describe, expect, it, vi } from "vitest";

import { createAppArcjet, getArcjetKey } from "./client";

describe("getArcjetKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns undefined when ARCJET_KEY is unset", () => {
    vi.stubEnv("ARCJET_KEY", "");
    expect(getArcjetKey()).toBeUndefined();
  });

  it("returns a trimmed ARCJET_KEY", () => {
    vi.stubEnv("ARCJET_KEY", "  ajkey_test  ");
    expect(getArcjetKey()).toBe("ajkey_test");
  });
});

describe("createAppArcjet", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when no key is configured", () => {
    vi.stubEnv("ARCJET_KEY", "");
    expect(createAppArcjet({ rules: [] })).toBeNull();
  });

  it("creates a client when a key is provided", () => {
    const client = createAppArcjet({ key: "ajkey_test", rules: [] });
    expect(client).not.toBeNull();
  });
});
