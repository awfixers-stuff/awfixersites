import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-template",
  legalRedirect: false,
  careersRedirect: false,
  crons: false,
});
