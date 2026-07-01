import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-careers",
  legalRedirect: true,
  careersRedirect: false,
  donateApex: "careers.awfixer.llc",
  crons: false,
});
