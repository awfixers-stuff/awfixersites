import { mergeConfig } from "vitest/config";
import base from "../../src/vitest.next";

export default mergeConfig(base, {
  test: {
    name: "@awfixersites/branding",
  },
});
