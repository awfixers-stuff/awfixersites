import { defineConfig } from "vitest/config";

/** Shared defaults for workspace packages and scaffold Next apps. */
export default defineConfig({
  test: {
    passWithNoTests: true,
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
});
