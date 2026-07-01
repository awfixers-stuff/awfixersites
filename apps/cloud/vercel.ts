import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-cloud",
  legalRedirect: true,
  crons: false,
});
