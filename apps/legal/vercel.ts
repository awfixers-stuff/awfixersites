import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-legal",
  legalRedirect: false,
  careersRedirect: false,
  donateApex: "legal.awfixer.llc",
});
