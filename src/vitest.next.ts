import { mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import base from "./vitest.base";

/** Next.js apps: React + optional browser tests via vitest.config.ts in each app. */
export default mergeConfig(base, {
  plugins: [react({})],
  test: {
    environment: "node",
    setupFiles: [],
  },
});
