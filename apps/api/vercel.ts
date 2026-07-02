import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-api",
  legalRedirect: false,
  careersRedirect: false,
  crons: true,
});