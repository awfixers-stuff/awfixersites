import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-llc",
  legalRedirect: false,
  crons: false,
});
