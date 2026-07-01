import { routes } from "@vercel/config/v1";
import type { Redirect, VercelConfig } from "@vercel/config/v1/types";

const APP_BUILD = "bun --bun ../../scripts/vercel-build.ts";
export const legalAwfixerRedirect = (): Redirect =>
  routes.redirect("/legal/:path*", "https://legal.awfixer.llc/:path*", {
    permanent: true,
  }) as Redirect;

export type AppVercelOptions = {
  /** Vercel project display name */
  name: string;
  /** When false, skips /legal → legal.awfixer.llc (e.g. the legal site itself). Default true. */
  legalRedirect?: boolean;
  /** Include default cleanup cron. Default false for scaffold apps. */
  crons?: boolean;
  extraRedirects?: Redirect[];
};

export function createAppVercelConfig(options: AppVercelOptions): VercelConfig {
  const redirects: Redirect[] = [...(options.extraRedirects ?? [])];
  if (options.legalRedirect !== false) {
    redirects.push(legalAwfixerRedirect());
  }

  const crons = options.crons ? [{ path: "/api/cleanup", schedule: "0 0 * * *" }] : undefined;

  return {
    name: options.name,
    trailingSlash: false,
    cleanUrls: true,
    devCommand: "bun --bun run dev",
    installCommand: "bun install",
    buildCommand: APP_BUILD,
    framework: "nextjs",
    fluid: true,
    rewrites: [],
    redirects,
    headers: [
      routes.cacheControl("/static/(.*)", {
        public: true,
        maxAge: "1 week",
        immutable: true,
      }),
    ],
    ...(crons ? { crons } : {}),
  };
}
