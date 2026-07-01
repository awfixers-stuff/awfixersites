import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-donate",
  legalRedirect: true,
  careersRedirect: false,
  crons: false,
});