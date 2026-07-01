import { mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import base from "./vitest.base";

/** Monorepo browser test profile (root `test:browser`). */
export default mergeConfig(base, {
  plugins: [react({})],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
    },
  },
});
