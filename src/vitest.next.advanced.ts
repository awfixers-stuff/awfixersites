import { mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import next from "./vitest.next";

/** Full Next apps: unit tests + optional Playwright browser projects. */
export default mergeConfig(next, {
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
