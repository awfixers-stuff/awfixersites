import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { isOAuthSiteKey, OAUTH_SITES } from "./oauth-sites";

describe("OAUTH_SITES registry", () => {
  it("covers every satellite app except auth", () => {
    const appsDir = resolve(import.meta.dirname, "../../../apps");
    const appDirs = readdirSync(appsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => name !== "auth");

    const registryKeys = new Set(OAUTH_SITES.map((site) => site.key));
    for (const appName of appDirs) {
      expect(isOAuthSiteKey(appName), `missing oauth site for ${appName}`).toBe(true);
    }
  });
});
