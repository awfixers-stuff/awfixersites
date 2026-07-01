/** OAuth relying-party registry — one entry per satellite app (not the IdP). */
export const OAUTH_SITES = [
  { key: "account", name: "AWFixer Account", apex: "account.awfixer.me", devPort: 3020 },
  { key: "army", name: "AWFixer Army", apex: "awfixer.army", devPort: 3000 },
  { key: "church", name: "AWFixer Church", apex: "awfixer.church", devPort: 3001 },
  { key: "about", name: "AWFixer About", apex: "about.awfixer.me", devPort: 3003 },
  { key: "agent", name: "AWFixer Agent", apex: "agent.awfixer.codes", devPort: 3004 },
  { key: "branding", name: "AWFixer Branding", apex: "branding.awfixer.me", devPort: 3005 },
  { key: "careers", name: "AWFixer Careers", apex: "careers.awfixer.llc", devPort: 3006 },
  { key: "cash", name: "AWFixer Cash", apex: "awfixer.cash", devPort: 3007 },
  { key: "cloud", name: "AWFixer Cloud", apex: "awfixer.cloud", devPort: 3008 },
  { key: "club", name: "AWFixer Club", apex: "club.awfixer.me", devPort: 3009 },
  { key: "codes", name: "AWFixer Codes", apex: "awfixer.codes", devPort: 3010 },
  { key: "donate", name: "AWFixer Donate", apex: "donate.awfixer.church", devPort: 3011 },
  { key: "legal", name: "AWFixer Legal", apex: "legal.awfixer.llc", devPort: 3012 },
  { key: "llc", name: "AWFixer LLC", apex: "awfixer.llc", devPort: 3013 },
  { key: "me", name: "AWFixer Me", apex: "awfixer.me", devPort: 3014 },
  { key: "network", name: "AWFixer Network", apex: "awfixer.network", devPort: 3015 },
  { key: "news", name: "AWFixer News", apex: "awfixer.news", devPort: 3016 },
  { key: "party", name: "AWFixer Party", apex: "party.awfixer.me", devPort: 3017 },
  { key: "space", name: "AWFixer Space", apex: "awfixer.space", devPort: 3018 },
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