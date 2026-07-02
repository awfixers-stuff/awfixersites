import { getOAuthSiteByKey, isOAuthSiteKey } from "../../packages/auth/src/oauth-sites.ts";

/** Shared Previewkit secrets every satellite app needs for Autonoma preview runs. */
export const SHARED_SATELLITE_SECRETS = [
  "ARCJET_KEY",
  "AUTH_IDP_URL",
  "NEXT_PUBLIC_AUTH_IDP_URL",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST",
] as const;

/** IdP-only secrets for apps/auth. */
export const AUTH_APP_SECRETS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "BETTER_AUTH_URL",
  "AUTH_URL",
  "AUTH_TRUSTED_ORIGINS",
  "AUTH_PASSKEY_RP_ID",
  "AUTH_PASSKEY_RP_NAME",
] as const;

export function secretsForApp(appName: string): string[] {
  if (appName === "auth") {
    return [...AUTH_APP_SECRETS, "ARCJET_KEY", "NEXT_PUBLIC_SENTRY_DSN"];
  }

  const keys = [...SHARED_SATELLITE_SECRETS];
  if (appName === "template") {
    keys.push("AUTH_DEPLOYMENT_ROLE", "AUTH_OAUTH_SITE_KEY");
    return [...new Set(keys)];
  }

  if (isOAuthSiteKey(appName)) {
    keys.push(
      "AUTH_OAUTH_SITE_KEY",
      "AUTH_DEPLOYMENT_ROLE",
      "AUTH_SECRET",
      "AUTH_URL",
      "BETTER_AUTH_URL",
    );
    const site = getOAuthSiteByKey(appName);
    const siteKey = site.key.toUpperCase();
    keys.push(`AUTH_OAUTH_${siteKey}_CLIENT_ID`, `AUTH_OAUTH_${siteKey}_CLIENT_SECRET`);
  }

  return [...new Set(keys)];
}
