import type { Client } from "better-auth/plugins/oidc-provider";

import {
  getOAuthSiteByKey,
  isOAuthSiteKey,
  OAUTH_SITES,
  type OAuthSiteKey,
} from "./oauth-sites";

export type { OAuthSiteKey } from "./oauth-sites";

export type OAuthSiteClient = {
  key: OAuthSiteKey;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUrls: string[];
};

function parseRedirectUrls(value: string | undefined, fallbacks: string[]) {
  const fromEnv = value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : fallbacks;
}

function resolveClientSecret(envKey: string, value: string | undefined) {
  if (value) {
    return value;
  }
  if (process.env.NODE_ENV !== "production") {
    return `dev-${envKey.toLowerCase().replace(/_/g, "-")}`;
  }
  throw new Error(`Missing ${envKey} for OAuth client configuration.`);
}

function envKeyForSite(siteKey: OAuthSiteKey) {
  return siteKey.toUpperCase().replace(/-/g, "_");
}

function defaultRedirectUrls(siteKey: OAuthSiteKey) {
  const site = getOAuthSiteByKey(siteKey);
  return [
    `http://localhost:${site.devPort}/api/auth/oauth2/callback/${OAUTH_IDP_PROVIDER_ID}`,
    `https://${site.apex}/api/auth/oauth2/callback/${OAUTH_IDP_PROVIDER_ID}`,
  ];
}

/** Registered OAuth2/OIDC relying parties for awfixer sites. */
export function getOAuthSiteClients(): OAuthSiteClient[] {
  return OAUTH_SITES.map((site) => {
    const envKey = envKeyForSite(site.key);
    const clientId = process.env[`AUTH_OAUTH_${envKey}_CLIENT_ID`] ?? `awfixer-${site.key}`;
    const secretEnvKey = `AUTH_OAUTH_${envKey}_CLIENT_SECRET`;

    return {
      key: site.key,
      name: site.name,
      clientId,
      clientSecret: resolveClientSecret(secretEnvKey, process.env[secretEnvKey]),
      redirectUrls: parseRedirectUrls(
        process.env[`AUTH_OAUTH_${envKey}_REDIRECT_URLS`],
        defaultRedirectUrls(site.key),
      ),
    };
  });
}

export function getTrustedOidcClients(): (Client & { skipConsent?: boolean })[] {
  return getOAuthSiteClients().map((site) => ({
    clientId: site.clientId,
    clientSecret: site.clientSecret,
    name: site.name,
    type: "web",
    redirectUrls: site.redirectUrls,
    disabled: false,
    skipConsent: true,
    metadata: { site: site.key },
  }));
}

export function getOAuthSiteClient(key: OAuthSiteKey): OAuthSiteClient {
  const client = getOAuthSiteClients().find((entry) => entry.key === key);
  if (!client) {
    throw new Error(`Unknown OAuth site key: ${key}`);
  }
  return client;
}

export function getOAuthSiteKey(): OAuthSiteKey {
  const key =
    process.env.AUTH_OAUTH_SITE_KEY?.trim().toLowerCase() ??
    process.env.NEXT_PUBLIC_AUTH_OAUTH_SITE_KEY?.trim().toLowerCase();

  if (key && isOAuthSiteKey(key)) {
    return key;
  }

  throw new Error(
    `Missing or invalid AUTH_OAUTH_SITE_KEY. Expected one of: ${OAUTH_SITES.map((site) => site.key).join(", ")}.`,
  );
}

export function getOAuthRedirectUri(appBaseUrl: string) {
  return `${appBaseUrl.replace(/\/$/, "")}/api/auth/oauth2/callback/${OAUTH_IDP_PROVIDER_ID}`;
}

export const OAUTH_IDP_PROVIDER_ID = "awfixer-idp";