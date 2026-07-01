import { describe, expect, it } from "vitest";

import { CLINK_SAFE_DEFAULT, parseClinkConfig, parseClinkConfigSafe } from "./schema";

describe("clinkConfigSchema", () => {
  it("parses a fully specified config", () => {
    const input = {
      network: ["awfixer.llc"],
      utm: { source: "about", medium: "referral", campaign: "spring" },
      click: { event: "link_clicked", properties: { app: "about" } },
      exclude: ["mailto:*"],
    };
    expect(parseClinkConfig(input)).toEqual(input);
  });

  it("applies defaults for an empty object", () => {
    expect(parseClinkConfig({})).toEqual({
      network: [],
      click: { event: "link_clicked", properties: {} },
      exclude: [],
    });
  });

  it("throws on invalid types", () => {
    expect(() => parseClinkConfig({ network: "not-an-array" })).toThrow();
  });

  it("parseClinkConfigSafe returns the safe default and an error on invalid input", () => {
    const result = parseClinkConfigSafe({ network: "not-an-array" });
    expect(result.config).toEqual(CLINK_SAFE_DEFAULT);
    expect(result.error).not.toBeNull();
  });

  it("parseClinkConfigSafe returns the parsed config and no error on valid input", () => {
    const result = parseClinkConfigSafe({ network: ["awfixer.llc"] });
    expect(result.error).toBeNull();
    expect(result.config.network).toEqual(["awfixer.llc"]);
  });
});
