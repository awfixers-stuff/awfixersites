import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-auth-app",
  legalRedirect: true,
  crons: false,
});
