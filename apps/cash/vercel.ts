import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-cash",
  legalRedirect: true,
  donateApex: "awfixer.cash",
  crons: false,
});
