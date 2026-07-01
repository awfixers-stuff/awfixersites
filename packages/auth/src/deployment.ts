export type AuthDeploymentRole = "idp" | "client";

/** IdP hosts login + OIDC; client apps delegate auth to auth.awfixer.me. */
export function getAuthDeploymentRole(): AuthDeploymentRole {
  const role =
    process.env.AUTH_DEPLOYMENT_ROLE?.trim().toLowerCase() ??
    process.env.NEXT_PUBLIC_AUTH_DEPLOYMENT_ROLE?.trim().toLowerCase();

  if (role === "idp" || role === "client") {
    return role;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_DEPLOYMENT_ROLE must be set to 'idp' or 'client' in production.");
  }

  if (process.env.NEXT_PUBLIC_AUTH_OAUTH_SITE_KEY?.trim()) {
    return "client";
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "";
  if (appUrl.includes("auth.awfixer")) {
    return "idp";
  }

  return "client";
}

export function isAuthIdpDeployment() {
  return getAuthDeploymentRole() === "idp";
}

export function isAuthClientDeployment() {
  return getAuthDeploymentRole() === "client";
}
