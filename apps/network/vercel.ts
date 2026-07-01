import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-network",
  legalRedirect: true,
  donateApex: "awfixer.network",
  crons: false,
});
