import { describe, expect, it } from "vitest";

import {
  BOTID_ARMY_ROUTES,
  BOTID_CLIENT_PROTECT_BASE,
  BOTID_DONATE_ROUTES,
  BOTID_TIPS_ROUTES,
} from "./botid-protect";

describe("botid-protect", () => {
  it("includes auth mutating methods for all apps", () => {
    const methodPresent: Record<string, true> = {};
    for (const route of BOTID_CLIENT_PROTECT_BASE) {
      methodPresent[route.method] = true;
    }
    expect(methodPresent.POST).toBe(true);
    expect(methodPresent.PATCH).toBe(true);
    expect(methodPresent.PUT).toBe(true);
    expect(methodPresent.DELETE).toBe(true);
    expect(BOTID_CLIENT_PROTECT_BASE.every((r) => r.path.startsWith("/api/auth"))).toBe(true);
  });

  it("merges app-specific routes without dropping base", () => {
    const merged = [...BOTID_CLIENT_PROTECT_BASE, ...BOTID_DONATE_ROUTES];
    expect(merged.length).toBe(BOTID_CLIENT_PROTECT_BASE.length + BOTID_DONATE_ROUTES.length);
    expect(merged.some((r) => r.path === "/api/create-payment-intent")).toBe(true);
  });

  it("uses deep analysis on high-value public POST APIs", () => {
    for (const route of [...BOTID_DONATE_ROUTES, ...BOTID_TIPS_ROUTES, ...BOTID_ARMY_ROUTES]) {
      expect(route.advancedOptions?.checkLevel).toBe("deepAnalysis");
    }
  });
});
