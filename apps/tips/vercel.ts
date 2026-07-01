import { createAppVercelConfig } from "../../src/vercel-app-config.ts";

export const config = createAppVercelConfig({
  name: "awfixersites-tips",
  legalRedirect: true,
  crons: false,
});
