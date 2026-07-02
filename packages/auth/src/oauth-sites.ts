/** OAuth relying-party registry — one entry per satellite app (not the IdP). */
export const OAUTH_SITES = [
  { key: "account", name: "AWFixer Account", apex: "account.awfixer.me", devPort: 3020 },
  { key: "army", name: "AWFixer Army", apex: "awfixer.army", devPort: 3000 },
  { key: "church", name: "AWFixer Church", apex: "awfixer.church", devPort: 3001 },
  { key: "careers", name: "AWFixer Careers", apex: "careers.awfixer.llc", devPort: 3006 },
  { key: "codes", name: "AWFixer Codes", apex: "awfixer.codes", devPort: 3010 },
  { key: "donate", name: "AWFixer Donate", apex: "donate.awfixer.church", devPort: 3011 },
  { key: "legal", name: "AWFixer Legal", apex: "legal.awfixer.llc", devPort: 3012 },
  { key: "llc", name: "AWFixer LLC", apex: "awfixer.llc", devPort: 3013 },
  { key: "news", name: "AWFixer News", apex: "awfixer.news", devPort: 3016 },
  { key: "tips", name: "AWFixer Tips", apex: "tips.awfixer.me", devPort: 3019 },
] as const;

export type OAuthSiteKey = (typeof OAUTH_SITES)[number]["key"];

const SITE_KEYS = new Set<string>(OAUTH_SITES.map((site) => site.key));

export function isOAuthSiteKey(value: string): value is OAuthSiteKey {
  return SITE_KEYS.has(value);
}

export function getOAuthSite(key: OAuthSiteKey) {
  const site = OAUTH_SITES.find((entry) => entry.key === key);
  if (!site) {
    throw new Error(`Unknown OAuth site key: ${key}`);
  }
  return site;
}

export function getOAuthSiteByKey(key: string) {
  if (!isOAuthSiteKey(key)) {
    throw new Error(`Unknown OAuth site key: ${key}`);
  }
  return getOAuthSite(key);
}
