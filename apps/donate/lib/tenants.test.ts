import { describe, expect, it } from "vitest";

import { donateUrlForApex } from "../../../src/donate-domains.ts";
import { normalizeHost, resolveTenant } from "./tenants.ts";

describe("normalizeHost", () => {
  it("strips port and lowercases", () => {
    expect(normalizeHost("Donate.AWFixer.Church:3000")).toBe("donate.awfixer.church");
  });
});

describe("resolveTenant", () => {
  it("returns church tenant for donate.awfixer.church", () => {
    const tenant = resolveTenant("donate.awfixer.church");
    expect(tenant.id).toBe("church");
    expect(tenant.displayName).toBe("AWFixer's Church");
  });

  it("falls back to church for unknown hosts", () => {
    const tenant = resolveTenant("donate.example.com");
    expect(tenant.id).toBe("church");
  });
});

describe("donateUrlForApex", () => {
  it("builds donate subdomain urls", () => {
    expect(donateUrlForApex("awfixer.codes")).toBe("https://donate.awfixer.codes");
  });
});