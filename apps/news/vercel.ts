import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-news",
  legalRedirect: true,
  donateApex: "awfixer.news",
  crons: false,
});
