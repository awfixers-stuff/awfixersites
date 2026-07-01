import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-codes",
  legalRedirect: true,
  careersRedirect: false,
});
