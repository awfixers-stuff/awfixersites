import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-army",
  donateApex: "awfixer.army",
  legalRedirect: true,
  crons: false,
});
