// EXAMPLE CONFIG, EDIT BEFORE DEPLOYING

import { routes, deploymentEnv } from "@vercel/config/v1";
import {
  type VercelConfig,
  MatchableValue,
  ImageConfig,
  BuildConfig,
  BuildItem,
  Redirect,
  Rewrite,
} from "@vercel/config/v1/types";
import { redirect } from "next/navigation";

export const config: VercelConfig = {
  name: "",
  trailingSlash: false,
  cleanUrls: true,
  devCommand: "bun --bun run dev",
  buildCommand: "bun --bun run build",
  installCommand: "bun --bun install",
  framework: "nextjs",

  rewrites: [],

  fluid: true,

  redirects: [],

  headers: [
    routes.cacheControl("/static/(.*)", {
      public: true,
      maxAge: "1 week",
      immutable: true,
    }),
  ],

  crons: [{ path: "/api/cleanup", schedule: "0 0 * * *" }],
};
