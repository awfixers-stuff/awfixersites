import type { BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { setSessionCookie } from "better-auth/cookies";
import { username } from "better-auth/plugins/username";
import { twoFactor } from "better-auth/plugins/two-factor";
import { passkey } from "@better-auth/passkey";
import { oidcProvider } from "better-auth/plugins/oidc-provider";
import type { PrismaClient } from "../generated/prisma/client";

import { createOAuthClientPlugin } from "./client-options";
import {
  getAuthBasePath,
  getAuthBaseUrl,
  getAuthSecret,
  getPasskeyRpId,
  getPasskeyRpName,
  getTrustedOrigins,
  internalUserEmail,
} from "./config";
import { getAuthDeploymentRole, type AuthDeploymentRole } from "./deployment";
import { createUserForPasskeySignup, PasskeyUsernameTakenError } from "./passkey-users";
import { accountSetupGuardPlugin } from "./plugins/account-setup-guard";
import { passkeyTwoFactorPlugin } from "./plugins/passkey-two-factor";
import { getTrustedOidcClients } from "./oauth-clients";
import { generateSnowflakeId } from "./snowflake";

function sharedOptions(
  prisma: PrismaClient,
): Pick<
  BetterAuthOptions,
  "appName" | "baseURL" | "secret" | "trustedOrigins" | "database" | "advanced" | "rateLimit"
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
      database: {
        generateId: () => generateSnowflakeId(),
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
    },
  };
}

function createIdpAuthOptions(prisma: PrismaClient): BetterAuthOptions {
  return {
    ...sharedOptions(prisma),
    basePath: getAuthBasePath(),
    emailAndPassword: {
      enabled: false,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          input: false,
        },
      },
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
            try {
              const user = await createUserForPasskeySignup(usernameValue);
              return {
                id: user.id,
                name: user.username,
                displayName: user.displayUsername,
              };
            } catch (error) {
              if (error instanceof PasskeyUsernameTakenError) {
                throw new Error(error.message);
              }
              throw error;
            }
          },
          afterVerification: async ({ ctx, user }) => {
            const session = await ctx.context.internalAdapter.createSession(user.id);
            if (!session) {
              throw new Error("Unable to create session after passkey registration.");
            }

            const fullUser = await ctx.context.internalAdapter.findUserById(user.id);
            if (!fullUser) {
              throw new Error("User not found after passkey registration.");
            }

            await setSessionCookie(ctx, {
              session,
              user: fullUser,
            });
          },
        },
      }),
      twoFactor({
        issuer: "AWFixer",
        allowPasswordless: true,
        // Better Auth encrypts TOTP secrets and backup codes with AUTH_SECRET at rest.
        backupCodeOptions: {
          storeBackupCodes: "encrypted",
        },
      }),
      passkeyTwoFactorPlugin(),
      accountSetupGuardPlugin(),
      oidcProvider({
        loginPage: "/",
        trustedClients: getTrustedOidcClients(),
        scopes: ["openid", "profile", "email", "offline_access"],
        getAdditionalUserInfoClaim: async (user) => ({
          username: typeof user.username === "string" ? user.username : undefined,
          role: typeof user.role === "string" ? user.role : "user",
        }),
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
                role: "user",
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
    basePath: getAuthBasePath(),
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
