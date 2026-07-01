import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-space",
  legalRedirect: true,
  donateApex: "awfixer.space",
  crons: false,
});
