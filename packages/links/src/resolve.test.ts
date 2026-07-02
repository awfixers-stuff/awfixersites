import { describe, expect, it } from "vitest";

import { clinkUrl, isExternalTargetId, isTargetId, resolveLink } from "./resolve";

describe("isTargetId", () => {
  it("accepts fleet target ids", () => {
    expect(isTargetId("enlist")).toBe(true);
    expect(isTargetId("github-awfixer")).toBe(true);
  });

  it("rejects urls and paths", () => {
    expect(isTargetId("/enlist")).toBe(false);
    expect(isTargetId("https://awfixer.army")).toBe(false);
    expect(isTargetId("awfixer.army")).toBe(false);
  });
});

describe("isExternalTargetId", () => {
  it("uses hyphen convention", () => {
    expect(isExternalTargetId("enlist")).toBe(false);
    expect(isExternalTargetId("github-awfixer")).toBe(true);
  });
});

describe("clinkUrl", () => {
  it("builds api redirect urls", () => {
    expect(clinkUrl("enlist", "https://api.awfixer.me")).toBe(
      "https://api.awfixer.me/l/enlist",
    );
  });
});

describe("resolveLink", () => {
  it("resolves internal links from referer host", () => {
    const result = resolveLink("enlist", {
      referer: "https://awfixer.army/ranks",
    });
    expect(result).toEqual({
      url: "https://awfixer.army/enlist",
      internal: true,
    });
  });

  it("resolves internal links from site fallback", () => {
    const result = resolveLink("donate", { site: "news" });
    expect(result.url).toBe("https://awfixer.news/donate");
  });

  it("resolves external links with utm params", () => {
    const result = resolveLink("github-awfixer", { utmSource: "army" });
    expect(result.internal).toBe(false);
    expect(result.target).toBe("_blank");
    const url = new URL(result.url);
    expect(url.origin).toBe("https://github.com");
    expect(url.searchParams.get("utm_source")).toBe("army");
    expect(url.searchParams.get("utm_medium")).toBe("referral");
  });

  it("throws for unknown targets", () => {
    expect(() => resolveLink("missing-id", { site: "army" })).toThrow(/Unknown link target/);
  });
});