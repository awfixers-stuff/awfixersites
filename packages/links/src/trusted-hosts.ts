/** Production apex hosts trusted for internal clink redirects. */
export const TRUSTED_APEX_HOSTS = [
  "account.awfixer.me",
  "api.awfixer.me",
  "auth.awfixer.me",
  "tips.awfixer.me",
  "awfixer.army",
  "awfixer.church",
  "awfixer.codes",
  "awfixer.llc",
  "awfixer.news",
  "careers.awfixer.llc",
  "legal.awfixer.llc",
  "donate.awfixer.church",
] as const;

/** OAuth site key → production apex (for ?site= fallback). */
export const SITE_APEX: Record<string, string> = {
  account: "account.awfixer.me",
  api: "api.awfixer.me",
  army: "awfixer.army",
  auth: "auth.awfixer.me",
  church: "awfixer.church",
  careers: "careers.awfixer.llc",
  codes: "awfixer.codes",
  donate: "donate.awfixer.church",
  legal: "legal.awfixer.llc",
  llc: "awfixer.llc",
  news: "awfixer.news",
  tips: "tips.awfixer.me",
};

export function isTrustedHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return TRUSTED_APEX_HOSTS.some(
    (apex) => normalized === apex || normalized.endsWith(`.${apex}`),
  );
}

export function apexForSiteKey(siteKey: string | null | undefined): string | null {
  if (!siteKey) return null;
  return SITE_APEX[siteKey.trim().toLowerCase()] ?? null;
}