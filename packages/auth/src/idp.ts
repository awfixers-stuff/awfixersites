import { getAuthBaseUrl } from "./config";

export function getIdpOrigin() {
  return (
    process.env.AUTH_IDP_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_AUTH_IDP_URL?.replace(/\/$/, "") ??
    "https://auth.awfixer.me"
  );
}

export function getIdpSignInUrl(returnTo?: string) {
  const url = new URL("/", getIdpOrigin());
  if (returnTo) {
    url.searchParams.set("returnTo", returnTo);
  }
  return url.toString();
}

/** Query keys from an OIDC authorization request forwarded to the login page. */
export function isOidcAuthorizeQuery(searchParams: URLSearchParams) {
  return (
    searchParams.has("client_id") &&
    searchParams.has("response_type") &&
    searchParams.has("redirect_uri")
  );
}

export function buildOidcAuthorizeResumeUrl(searchParams: URLSearchParams) {
  const url = new URL("/api/auth/oauth2/authorize", getAuthBaseUrl());
  for (const [key, value] of searchParams.entries()) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}