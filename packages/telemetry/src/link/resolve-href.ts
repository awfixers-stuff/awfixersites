import type { ClinkConfig } from "../config/schema";

export type ResolvedHref = {
  href: string;
  internal: boolean;
  rel?: string;
  target?: string;
};

function isAbsoluteUrl(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

function isExcluded(href: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith("*")) {
      return href.startsWith(pattern.slice(0, -1));
    }
    try {
      return new RegExp(pattern).test(href);
    } catch {
      return href === pattern;
    }
  });
}

function hostnameOf(href: string, currentOrigin: string): string | null {
  try {
    return new URL(href, currentOrigin).hostname;
  } catch {
    return null;
  }
}

function isNetworkHost(hostname: string, network: string[]): boolean {
  return network.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

export function resolveHref(
  href: string,
  config: ClinkConfig,
  currentOrigin: string,
  distinctId?: string,
): ResolvedHref {
  if (isExcluded(href, config.exclude)) {
    return { href, internal: true };
  }

  if (!isAbsoluteUrl(href) || href.startsWith("/")) {
    return { href, internal: true };
  }

  const hostname = hostnameOf(href, currentOrigin);
  if (!hostname) {
    return { href, internal: true };
  }

  const currentHostname = hostnameOf(currentOrigin, currentOrigin) ?? "";
  const network = isNetworkHost(hostname, config.network);

  if (network) {
    if (hostname === currentHostname || !distinctId) {
      return { href, internal: true };
    }
    const url = new URL(href);
    url.searchParams.set("ph_distinct_id", distinctId);
    return { href: url.toString(), internal: true };
  }

  const url = new URL(href);
  if (config.utm) {
    if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", config.utm.source);
    if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", config.utm.medium);
    if (config.utm.campaign && !url.searchParams.has("utm_campaign")) {
      url.searchParams.set("utm_campaign", config.utm.campaign);
    }
  }

  return { href: url.toString(), internal: false, rel: "noopener noreferrer", target: "_blank" };
}
