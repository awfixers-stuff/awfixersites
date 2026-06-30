import type { Client } from "better-auth/plugins/oidc-provider";

export type OAuthSiteKey = "army" | "church";

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

/** Registered OAuth2/OIDC relying parties for awfixer sites. */
export function getOAuthSiteClients(): OAuthSiteClient[] {
  const armyClientId = process.env.AUTH_OAUTH_ARMY_CLIENT_ID ?? "awfixer-army";
  const churchClientId = process.env.AUTH_OAUTH_CHURCH_CLIENT_ID ?? "awfixer-church";

  return [
    {
      key: "army",
      name: "AWFixer Army",
      clientId: armyClientId,
      clientSecret: resolveClientSecret(
        "AUTH_OAUTH_ARMY_CLIENT_SECRET",
        process.env.AUTH_OAUTH_ARMY_CLIENT_SECRET,
      ),
      redirectUrls: parseRedirectUrls(process.env.AUTH_OAUTH_ARMY_REDIRECT_URLS, [
        "http://localhost:3000/api/auth/oauth2/callback/awfixer-idp",
        "https://awfixer.army/api/auth/oauth2/callback/awfixer-idp",
      ]),
    },
    {
      key: "church",
      name: "AWFixer Church",
      clientId: churchClientId,
      clientSecret: resolveClientSecret(
        "AUTH_OAUTH_CHURCH_CLIENT_SECRET",
        process.env.AUTH_OAUTH_CHURCH_CLIENT_SECRET,
      ),
      redirectUrls: parseRedirectUrls(process.env.AUTH_OAUTH_CHURCH_REDIRECT_URLS, [
        "http://localhost:3001/api/auth/oauth2/callback/awfixer-idp",
        "https://awfixer.church/api/auth/oauth2/callback/awfixer-idp",
      ]),
    },
  ];
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
  if (key === "army" || key === "church") {
    return key;
  }
  throw new Error(
    "Missing or invalid AUTH_OAUTH_SITE_KEY. Expected \"army\" or \"church\" on OAuth client apps.",
  );
}

export function getOAuthRedirectUri(appBaseUrl: string) {
  return `${appBaseUrl.replace(/\/$/, "")}/api/auth/oauth2/callback/${OAUTH_IDP_PROVIDER_ID}`;
}
export const OAUTH_IDP_PROVIDER_ID = "awfixer-idp";