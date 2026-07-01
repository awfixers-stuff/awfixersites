import { describe, expect, it } from "vitest";

import { withAppUtils } from "./next-config";

describe("withAppUtils", () => {
  it("returns a Next.js config factory", () => {
    const configFactory = withAppUtils({ reactStrictMode: true });
    expect(typeof configFactory).toBe("function");
  });
});
