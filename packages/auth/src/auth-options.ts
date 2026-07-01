import type { BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins/username";
import { passkey } from "@better-auth/passkey";
import { oidcProvider } from "better-auth/plugins/oidc-provider";
import type { PrismaClient } from "../generated/prisma/client";

import { createOAuthClientPlugin } from "./client-options";
import {
  getAuthBaseUrl,
  getAuthSecret,
  getPasskeyRpId,
  getPasskeyRpName,
  getTrustedOrigins,
  internalUserEmail,
} from "./config";
import { getAuthDeploymentRole, type AuthDeploymentRole } from "./deployment";
import { findOrCreateUserForPasskey } from "./passkey-users";
import { getTrustedOidcClients } from "./oauth-clients";

function sharedOptions(
  prisma: PrismaClient,
): Pick<
  BetterAuthOptions,
  "appName" | "baseURL" | "secret" | "trustedOrigins" | "database" | "advanced"
> {
  return {
    appName: getPasskeyRpName(),
    baseURL: getAuthBaseUrl(),
    secret: getAuthSecret(),
    trustedOrigins: getTrustedOrigins(),
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    advanced: {
      cookiePrefix: "awfixer_auth",
    },
  };
}

function createIdpAuthOptions(prisma: PrismaClient): BetterAuthOptions {
  return {
    ...sharedOptions(prisma),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {},
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 32,
        usernameNormalization: (value) => value.toLowerCase(),
        usernameValidator: (value) => /^[a-z0-9_][a-z0-9_-]*[a-z0-9_]$|^[a-z0-9_]$/.test(value),
      }),
      passkey({
        rpID: getPasskeyRpId(),
        rpName: getPasskeyRpName(),
        origin: getTrustedOrigins(),
        registration: {
          requireSession: false,
          resolveUser: async ({ context }) => {
            if (!context || typeof context !== "string" || context.trim().length < 3) {
              throw new Error("Username is required to register a passkey.");
            }

            const usernameValue = context.trim().toLowerCase();
            const user = await findOrCreateUserForPasskey(usernameValue);
            return {
              id: user.id,
              name: user.username,
              displayName: user.displayUsername,
            };
          },
        },
      }),
      oidcProvider({
        loginPage: "/",
        trustedClients: getTrustedOidcClients(),
        scopes: ["openid", "profile", "email", "offline_access"],
        __skipDeprecationWarning: true,
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          before: async (user, ctx) => {
            const body = ctx?.body as Record<string, unknown> | undefined;
            const usernameValue =
              typeof body?.username === "string" ? body.username.trim().toLowerCase() : undefined;

            if (!usernameValue) {
              return { data: user };
            }

            return {
              data: {
                ...user,
                email: internalUserEmail(usernameValue),
                emailVerified: true,
                name: usernameValue,
                username: usernameValue,
                displayUsername: usernameValue,
              },
            };
          },
        },
      },
    },
  };
}

function createOAuthRelyingPartyOptions(prisma: PrismaClient): BetterAuthOptions {
  return {
    ...sharedOptions(prisma),
    emailAndPassword: {
      enabled: false,
    },
    plugins: [createOAuthClientPlugin()],
  };
}

export function createAuthOptions(
  prisma: PrismaClient,
  role: AuthDeploymentRole = getAuthDeploymentRole(),
): BetterAuthOptions {
  if (role === "idp") {
    return createIdpAuthOptions(prisma);
  }
  return createOAuthRelyingPartyOptions(prisma);
}
