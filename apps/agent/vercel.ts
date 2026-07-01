import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-agent",
  legalRedirect: true,
  crons: false,
});
