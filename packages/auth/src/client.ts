"use client";

import { createAuthClient } from "better-auth/react";
import { usernameClient, genericOAuthClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

import type { Auth } from "./server";
import { internalUserEmail } from "./config";
import { isAuthClientDeployment } from "./deployment";

const baseURL = process.env.NEXT_PUBLIC_APP_URL;

export const authClient = createAuthClient({
  baseURL,
  plugins: isAuthClientDeployment() ? [genericOAuthClient()] : [usernameClient(), passkeyClient()],
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