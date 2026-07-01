"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { getBackToSiteLabel, resolveReferrerSite } from "@awfixersites/auth/referrer";

const codesSiteUrl = process.env.NEXT_PUBLIC_CODES_SITE_URL ?? "https://awfixer.codes";

const defaultReferrer = {
  name: "AWFixer Codes",
  href: codesSiteUrl,
} as const;

export function useReferrerSite() {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const site = resolveReferrerSite(searchParams, defaultReferrer);
    return {
      ...site,
      backLabel: getBackToSiteLabel(site),
    };
  }, [searchParams]);
}
