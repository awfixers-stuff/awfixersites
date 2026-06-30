import type { BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins/username";
import { passkey } from "@better-auth/passkey";
import type { PrismaClient } from "../generated/prisma/client";

import {
  getAuthBaseUrl,
  getAuthSecret,
  getPasskeyRpId,
  getPasskeyRpName,
  getTrustedOrigins,
  internalUserEmail,
} from "./config";
import { findOrCreateUserForPasskey } from "./passkey-users";

export function createAuthOptions(prisma: PrismaClient): BetterAuthOptions {
  return {
    appName: getPasskeyRpName(),
    baseURL: getAuthBaseUrl(),
    secret: getAuthSecret(),
    trustedOrigins: getTrustedOrigins(),
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
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
    advanced: {
      cookiePrefix: "awfixer_auth",
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
