import { getLinkEntry } from "./registry";
import type { ExternalLinkEntry, InternalLinkEntry, LinkEntry } from "./schema";
import { apexForSiteKey, isTrustedHost } from "./trusted-hosts";

export const DEFAULT_API_BASE = "https://api.awfixer.me";

const TARGET_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export function isTargetId(href: string): boolean {
  if (!href || href.includes("://") || href.startsWith("/") || href.includes(".")) {
    return false;
  }
  return TARGET_ID_PATTERN.test(href);
}

/** Hyphenated IDs are external; plain IDs are internal (fleet convention). */
export function isExternalTargetId(targetId: string): boolean {
  return targetId.includes("-");
}

export function clinkUrl(targetId: string, apiBase: string = DEFAULT_API_BASE): string {
  const base = apiBase.replace(/\/$/, "");
  return `${base}/l/${encodeURIComponent(targetId)}`;
}

export type ResolveLinkContext = {
  referer?: string | null;
  site?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
};

export type ResolvedLink = {
  url: string;
  internal: boolean;
  target?: "_blank";
  rel?: "noopener noreferrer";
};

function parseRefererHost(referer: string | null | undefined): string | null {
  if (!referer) return null;
  try {
    const host = new URL(referer).hostname.toLowerCase();
    return isTrustedHost(host) ? host : null;
  } catch {
    return null;
  }
}

function resolveInternalHost(context: ResolveLinkContext): string | null {
  const fromReferer = parseRefererHost(context.referer);
  if (fromReferer) return fromReferer;

  const fromSite = apexForSiteKey(context.site);
  if (fromSite) return fromSite;

  return null;
}

function appendUtm(
  url: URL,
  entry: ExternalLinkEntry,
  context: ResolveLinkContext,
): void {
  const source = context.utmSource ?? entry.utm?.source ?? "fleet";
  const medium = context.utmMedium ?? entry.utm?.medium ?? "referral";
  const campaign = entry.utm?.campaign ?? null;

  if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", source);
  if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", medium);
  if (campaign && !url.searchParams.has("utm_campaign")) {
    url.searchParams.set("utm_campaign", campaign);
  }
}

function resolveInternal(entry: InternalLinkEntry, context: ResolveLinkContext): ResolvedLink {
  const host = resolveInternalHost(context);
  if (!host) {
    throw new Error("Unable to resolve internal link host — missing Referer or ?site=.");
  }

  return {
    url: `https://${host}${entry.path}`,
    internal: true,
  };
}

function resolveExternal(entry: ExternalLinkEntry, context: ResolveLinkContext): ResolvedLink {
  const url = new URL(entry.url);
  appendUtm(url, entry, context);

  return {
    url: url.toString(),
    internal: false,
    target: "_blank",
    rel: "noopener noreferrer",
  };
}

export function resolveLink(targetId: string, context: ResolveLinkContext = {}): ResolvedLink {
  const entry = getLinkEntry(targetId) as LinkEntry | undefined;
  if (!entry) {
    throw new Error(`Unknown link target: ${targetId}`);
  }

  if (entry.kind === "internal") {
    if (isExternalTargetId(targetId)) {
      throw new Error(`Target "${targetId}" is hyphenated but registered as internal.`);
    }
    return resolveInternal(entry, context);
  }

  if (!isExternalTargetId(targetId)) {
    throw new Error(`Target "${targetId}" is external but missing a hyphen in its id.`);
  }

  return resolveExternal(entry, context);
}