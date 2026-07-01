import { describe, expect, it } from "vitest";

import { getAccountSetupRedirect, isAccountSetupComplete, resolveUserRole } from "./account-setup";

describe("isAccountSetupComplete", () => {
  it("requires passkey and TOTP", () => {
    expect(isAccountSetupComplete({ passkeyCount: 1, twoFactorEnabled: true })).toBe(true);
    expect(isAccountSetupComplete({ passkeyCount: 0, twoFactorEnabled: true })).toBe(false);
    expect(isAccountSetupComplete({ passkeyCount: 1, twoFactorEnabled: false })).toBe(false);
  });
});

describe("getAccountSetupRedirect", () => {
  it("routes incomplete TOTP users to setup", () => {
    expect(getAccountSetupRedirect({ passkeyCount: 1, twoFactorEnabled: false })).toBe(
      "/setup/totp",
    );
  });

  it("returns null when setup is complete", () => {
    expect(getAccountSetupRedirect({ passkeyCount: 1, twoFactorEnabled: true })).toBeNull();
  });
});

describe("resolveUserRole", () => {
  it("always returns user at account creation", () => {
    expect(resolveUserRole("awfixer")).toBe("user");
    expect(resolveUserRole("guest")).toBe("user");
  });
});
