import { OAUTH_SITES } from "./oauth-sites";

export type ReferrerSite = {
  name: string;
  href: string;
};

const DEFAULT_REFERRER: ReferrerSite = {
  name: "AWFixer Codes",
  href: "https://awfixer.codes",
};

function normalizeHost(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function siteFromHost(hostname: string, port?: string): ReferrerSite | null {
  const host = normalizeHost(hostname);

  if (host === "localhost" || host === "127.0.0.1") {
    if (!port) return null;
    const site = OAUTH_SITES.find((entry) => String(entry.devPort) === port);
    if (!site) return null;
    return {
      name: site.name,
      href: `http://localhost:${site.devPort}`,
    };
  }

  const site = OAUTH_SITES.find((entry) => normalizeHost(entry.apex) === host);
  if (!site) return null;

  return {
    name: site.name,
    href: `https://${site.apex}`,
  };
}

function siteFromClientId(clientId: string): ReferrerSite | null {
  const site = OAUTH_SITES.find((entry) => clientId === `awfixer-${entry.key}`);
  if (!site) return null;

  return {
    name: site.name,
    href: `https://${site.apex}`,
  };
}

function siteFromUrl(url: URL): ReferrerSite | null {
  return siteFromHost(url.hostname, url.port || undefined);
}

function resolveReturnToReferrer(returnTo: string): ReferrerSite | null {
  if (!returnTo.startsWith("http://") && !returnTo.startsWith("https://")) {
    return null;
  }

  try {
    const url = new URL(returnTo);
    const site = siteFromUrl(url);
    if (!site) return null;

    return {
      name: site.name,
      href: returnTo,
    };
  } catch {
    return null;
  }
}

export function resolveReferrerSite(
  searchParams: URLSearchParams,
  defaultReferrer: ReferrerSite = DEFAULT_REFERRER,
): ReferrerSite {
  const returnTo = searchParams.get("returnTo");
  if (returnTo) {
    const fromReturnTo = resolveReturnToReferrer(returnTo);
    if (fromReturnTo) return fromReturnTo;
  }

  const redirectUri = searchParams.get("redirect_uri");
  if (redirectUri) {
    try {
      const url = new URL(redirectUri);
      const site = siteFromUrl(url);
      if (site) return site;
    } catch {
      // ignore invalid redirect_uri
    }
  }

  const clientId = searchParams.get("client_id");
  if (clientId) {
    const site = siteFromClientId(clientId);
    if (site) return site;
  }

  return defaultReferrer;
}

export function getBackToSiteLabel(referrer: ReferrerSite) {
  return `Back to ${referrer.name}`;
}
