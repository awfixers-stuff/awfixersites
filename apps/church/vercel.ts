import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-church",
  legalRedirect: true,
  careersRedirect: true,
  crons: true,
});
