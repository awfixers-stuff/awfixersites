import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins/username";
import { twoFactor } from "better-auth/plugins/two-factor";
import { passkey } from "@better-auth/passkey";
import { oidcProvider } from "better-auth/plugins/oidc-provider";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

/**
 * CLI-only auth config for schema generation.
 * Uses a stub adapter so @better-auth/cli can load without a generated Prisma client.
 */
export const auth = betterAuth({
  appName: "auth.awfixer.me",
  baseURL: "http://localhost:3000",
  secret: "cli-schema-generation-secret",
  database: prismaAdapter({} as never, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  advanced: {
    cookiePrefix: "awfixer_auth",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 32,
    }),
    passkey({
      rpID: "localhost",
      rpName: "auth.awfixer.me",
    }),
    twoFactor({
      issuer: "AWFixer",
      allowPasswordless: true,
    }),
    oidcProvider({
      loginPage: "/",
      trustedClients: [],
      __skipDeprecationWarning: true,
    }),
    genericOAuth({
      config: [
        {
          providerId: "awfixer-idp",
          discoveryUrl: "https://auth.awfixer.me/api/auth/.well-known/openid-configuration",
          clientId: "cli-client",
          clientSecret: "cli-secret",
        },
      ],
    }),
  ],
});
