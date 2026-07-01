import { mergeConfig } from "vitest/config";
import base from "../../src/vitest.base";

export default mergeConfig(base, {
  test: {
    name: "@awfixersites/content",
  },
});
