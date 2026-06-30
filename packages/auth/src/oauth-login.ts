"use client";

import { authClient } from "./client";
import { getIdpSignInUrl } from "./idp";
import { OAUTH_IDP_PROVIDER_ID } from "./oauth-clients";

export async function signInWithAwfixerIdp(callbackURL: string) {
  return authClient.signIn.oauth2({
    providerId: OAUTH_IDP_PROVIDER_ID,
    callbackURL,
    scopes: ["openid", "profile", "email", "offline_access"],
  });
}

export function redirectToIdpSignUp(returnTo?: string) {
  const url = new URL(getIdpSignInUrl(returnTo));
  url.searchParams.set("mode", "sign-up");
  window.location.assign(url.toString());
}