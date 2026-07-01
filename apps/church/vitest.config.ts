import { mergeConfig } from "vitest/config";
import advanced from "../../src/vitest.next.advanced";

export default mergeConfig(advanced, {
  test: {
    name: "@awfixersites/church",
  },
});
