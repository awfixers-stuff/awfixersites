import type { BetterAuthPlugin } from "better-auth";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

import { getAuthBaseUrl } from "./config";
import { getIdpOrigin } from "./idp";
import {
  getOAuthRedirectUri,
  getOAuthSiteClient,
  getOAuthSiteKey,
  OAUTH_IDP_PROVIDER_ID,
} from "./oauth-clients";

export { getOAuthSiteKey } from "./oauth-clients";

export function getOAuthRedirectUriForApp() {
  return getOAuthRedirectUri(getAuthBaseUrl());
}

export function createOAuthClientPlugin(): BetterAuthPlugin {
  const site = getOAuthSiteClient(getOAuthSiteKey());
  const discoveryUrl = `${getIdpOrigin()}/api/auth/.well-known/openid-configuration`;

  return genericOAuth({
    config: [
      {
        providerId: OAUTH_IDP_PROVIDER_ID,
        discoveryUrl,
        issuer: getIdpOrigin(),
        clientId: site.clientId,
        clientSecret: site.clientSecret,
        redirectURI: getOAuthRedirectUriForApp(),
        scopes: ["openid", "profile", "email", "offline_access"],
        pkce: true,
        disableImplicitSignUp: false,
        mapProfileToUser: (profile) => {
          const sub = typeof profile.sub === "string" ? profile.sub : profile.id;
          if (!sub || typeof sub !== "string") {
            throw new Error("IdP profile is missing sub.");
          }
          return {
            id: sub,
            email: typeof profile.email === "string" ? profile.email : undefined,
            name: typeof profile.name === "string" ? profile.name : undefined,
            image: typeof profile.picture === "string" ? profile.picture : undefined,
            emailVerified:
              profile.email_verified === true || profile.emailVerified === true,
          };
        },
      },
    ],
  });
}