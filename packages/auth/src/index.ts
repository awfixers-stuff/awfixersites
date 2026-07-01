export {
  authClient,
  registerPasskeyForUsername,
  signInWithUsername,
  signUpWithUsername,
  type AuthClient,
  type AuthSession,
} from "./client";

export { signInWithAwfixerIdp, redirectToIdpSignUp } from "./oauth-login";
export {
  getIdpOrigin,
  getIdpSignInUrl,
  isOidcAuthorizeQuery,
  buildOidcAuthorizeResumeUrl,
} from "./idp";
export { getBackToSiteLabel, resolveReferrerSite, type ReferrerSite } from "./referrer";
export {
  getAuthDeploymentRole,
  isAuthClientDeployment,
  isAuthIdpDeployment,
  type AuthDeploymentRole,
} from "./deployment";
export { getOAuthSiteKey, getOAuthRedirectUri, OAUTH_IDP_PROVIDER_ID } from "./oauth-clients";
export { OAUTH_SITES, type OAuthSiteKey } from "./oauth-sites";
export { isAccountSetupComplete, resolveUserRole } from "./account-setup";

export { useSession, useIsAuthenticated } from "./session";
export { internalUserEmail } from "./config";
