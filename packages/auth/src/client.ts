"use client";

import { createAuthClient } from "better-auth/react";
import { usernameClient, genericOAuthClient, twoFactorClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

import type { Auth } from "./server";
import { getAuthBasePath, internalUserEmail } from "./config";
import { isAuthClientDeployment } from "./deployment";

function getAuthClientBase() {
  const gateway = process.env.NEXT_PUBLIC_AUTH_API_URL?.trim().replace(/\/$/, "");
  if (gateway) {
    const url = new URL(gateway);
    return { baseURL: url.origin, basePath: url.pathname || "/oauth" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  return {
    baseURL: appUrl,
    basePath: getAuthBasePath(),
  };
}

const authClientBase = getAuthClientBase();

function createIdpClientPlugins() {
  return [
    usernameClient(),
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const returnTo = params.get("returnTo");
          const destination = returnTo
            ? `/verify/totp?returnTo=${encodeURIComponent(returnTo)}`
            : "/verify/totp";
          window.location.assign(destination);
        }
      },
    }),
  ];
}

export const authClient = createAuthClient({
  baseURL: authClientBase.baseURL,
  basePath: authClientBase.basePath,
  plugins: isAuthClientDeployment() ? [genericOAuthClient()] : createIdpClientPlugins(),
});

export type AuthClient = typeof authClient;
export type AuthSession = Auth["$Infer"]["Session"];

export async function signUpWithUsername(input: {
  username: string;
  password: string;
  displayUsername?: string;
}) {
  const username = input.username.trim().toLowerCase();
  const displayUsername = input.displayUsername?.trim() || username;

  return authClient.signUp.email({
    email: internalUserEmail(username),
    password: input.password,
    name: username,
    username,
    displayUsername,
  });
}

export async function signInWithUsername(input: { username: string; password: string }) {
  return authClient.signIn.username({
    username: input.username.trim().toLowerCase(),
    password: input.password,
  });
}

export async function registerPasskeyForUsername(username: string, name?: string) {
  return authClient.passkey.addPasskey({
    name,
    context: username.trim().toLowerCase(),
  });
}
