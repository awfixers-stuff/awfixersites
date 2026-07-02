import { describe, expect, it } from "vitest";

import { CLINK_SAFE_DEFAULT, type ClinkConfig } from "../config/schema";
import { resolveHref } from "./resolve-href";

const baseConfig: ClinkConfig = {
  ...CLINK_SAFE_DEFAULT,
  network: ["awfixer.llc", "careers.awfixer.llc"],
  utm: { source: "about", medium: "referral", campaign: null },
  exclude: ["mailto:*", "tel:*", "^/legal"],
};

const ORIGIN = "https://about.awfixer.llc";

describe("resolveHref", () => {
  it("rewrites target ids to api clink urls", () => {
    expect(resolveHref("enlist", baseConfig, ORIGIN)).toEqual({
      href: "https://api.awfixer.me/l/enlist",
      internal: true,
    });
  });

  it("opens hyphenated target ids in a new tab", () => {
    expect(resolveHref("github-awfixer", baseConfig, ORIGIN)).toEqual({
      href: "https://api.awfixer.me/l/github-awfixer",
      internal: false,
      rel: "noopener noreferrer",
      target: "_blank",
    });
  });

  it("leaves relative paths untouched and marks them internal", () => {
    expect(resolveHref("/careers", baseConfig, ORIGIN)).toEqual({
      href: "/careers",
      internal: true,
    });
  });

  it("excludes mailto: links entirely", () => {
    expect(resolveHref("mailto:hi@awfixer.llc", baseConfig, ORIGIN)).toEqual({
      href: "mailto:hi@awfixer.llc",
      internal: true,
    });
  });

  it("excludes tel: links entirely", () => {
    expect(resolveHref("tel:+15555550100", baseConfig, ORIGIN)).toEqual({
      href: "tel:+15555550100",
      internal: true,
    });
  });

  it("excludes paths matching a regex pattern", () => {
    expect(resolveHref("/legal/terms", baseConfig, ORIGIN)).toEqual({
      href: "/legal/terms",
      internal: true,
    });
  });

  it("leaves same-origin absolute links untouched", () => {
    const result = resolveHref("https://about.awfixer.llc/team", baseConfig, ORIGIN);
    expect(result.href).toBe("https://about.awfixer.llc/team");
    expect(result.internal).toBe(true);
  });

  it("appends a posthog distinct id for cross-origin network links", () => {
    const result = resolveHref(
      "https://careers.awfixer.llc/openings",
      baseConfig,
      ORIGIN,
      "distinct-123",
    );
    expect(result.internal).toBe(true);
    expect(result.href).toBe("https://careers.awfixer.llc/openings?ph_distinct_id=distinct-123");
  });

  it("does not append a distinct id for network links when none is available", () => {
    const result = resolveHref("https://careers.awfixer.llc/openings", baseConfig, ORIGIN);
    expect(result.href).toBe("https://careers.awfixer.llc/openings");
  });

  it("appends utm params and external hygiene for external links", () => {
    const result = resolveHref("https://example.com/page", baseConfig, ORIGIN);
    expect(result.internal).toBe(false);
    expect(result.rel).toBe("noopener noreferrer");
    expect(result.target).toBe("_blank");
    const url = new URL(result.href);
    expect(url.searchParams.get("utm_source")).toBe("about");
    expect(url.searchParams.get("utm_medium")).toBe("referral");
    expect(url.searchParams.has("utm_campaign")).toBe(false);
  });

  it("does not override utm params the link already specifies", () => {
    const result = resolveHref(
      "https://example.com/page?utm_source=newsletter",
      baseConfig,
      ORIGIN,
    );
    const url = new URL(result.href);
    expect(url.searchParams.get("utm_source")).toBe("newsletter");
  });
});
