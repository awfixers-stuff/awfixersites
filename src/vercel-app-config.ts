import { routes } from "@vercel/config/v1";
import type { HeaderRule, Redirect, VercelConfig } from "@vercel/config/v1/types";

import { securityHeaders } from "./security-headers.ts";

const APP_BUILD = "bun --bun ../../scripts/vercel-build.ts";
/** Install from monorepo root when Vercel Root Directory is `apps/<name>`. */
const INSTALL_COMMAND = "cd ../.. && bun install --frozen-lockfile";
const LEGAL_AWFIXER_BASE = "https://legal.awfixer.llc";

/** Legal URL prefixes on satellite apps → same path on legal.awfixer.llc (`/legal` splat flattens). */
const LEGAL_PATH_PREFIXES = ["legal", "privacy", "terms", "security", "agreements"] as const;

function legalPathRedirectDestination(
  prefix: (typeof LEGAL_PATH_PREFIXES)[number],
  withSplat: boolean,
): string {
  if (prefix === "legal") {
    return withSplat ? `${LEGAL_AWFIXER_BASE}/:path*` : `${LEGAL_AWFIXER_BASE}/legal`;
  }
  return withSplat ? `${LEGAL_AWFIXER_BASE}/${prefix}/:path*` : `${LEGAL_AWFIXER_BASE}/${prefix}`;
}

export function legalPathRedirects(): Redirect[] {
  const redirects: Redirect[] = [];

  for (const prefix of LEGAL_PATH_PREFIXES) {
    redirects.push(
      routes.redirect(`/${prefix}`, legalPathRedirectDestination(prefix, false), {
        permanent: true,
      }) as Redirect,
      routes.redirect(`/${prefix}/:path*`, legalPathRedirectDestination(prefix, true), {
        permanent: true,
      }) as Redirect,
    );
  }

  return redirects;
}

export const careersAwfixerRedirect = (): Redirect =>
  routes.redirect("/careers/:path*", "https://careers.awfixer.llc/:path*", {
    permanent: true,
  }) as Redirect;

export type AppVercelOptions = {
  /** Vercel project display name */
  name: string;
  /** When false, skips /legal → legal.awfixer.llc (e.g. the legal site itself). Default true. */
  legalRedirect?: boolean;
  /** When false, skips /careers → careers.awfixer.llc (e.g. the careers site itself). Default true. */
  careersRedirect?: boolean;
  /** Include default cleanup cron. Default false for scaffold apps. */
  crons?: boolean;
  extraRedirects?: Redirect[];
};

export function createAppVercelConfig(options: AppVercelOptions): VercelConfig {
  const redirects: Redirect[] = [...(options.extraRedirects ?? [])];
  if (options.legalRedirect !== false) {
    redirects.push(...legalPathRedirects());
  }
  if (options.careersRedirect !== false) {
    redirects.push(careersAwfixerRedirect());
  }

  const crons = options.crons ? [{ path: "/api/cleanup", schedule: "0 0 * * *" }] : undefined;

  const headers: HeaderRule[] = [
    {
      source: "/(.*)",
      headers: [...securityHeaders],
    },
    routes.cacheControl("/static/(.*)", {
      public: true,
      maxAge: "1 week",
      immutable: true,
    }) as HeaderRule,
  ];

  return {
    name: options.name,
    trailingSlash: false,
    cleanUrls: true,
    bunVersion: "1.x",
    devCommand: "bun --bun run dev",
    installCommand: INSTALL_COMMAND,
    buildCommand: APP_BUILD,
    framework: "nextjs",
    fluid: true,
    rewrites: [],
    redirects,
    headers,
    ...(crons ? { crons } : {}),
  };
}
