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
