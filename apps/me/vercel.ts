import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-me",
  legalRedirect: true,
  donateApex: "awfixer.me",
  crons: false,
});
