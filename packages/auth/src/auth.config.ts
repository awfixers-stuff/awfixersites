import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins/username";
import { passkey } from "@better-auth/passkey";

/**
 * CLI-only auth config for schema generation.
 * Uses a stub adapter so @better-auth/cli can load without a generated Prisma client.
 */
export const auth = betterAuth({
  appName: "awfixer.army",
  baseURL: "http://localhost:3000",
  secret: "cli-schema-generation-secret",
  database: prismaAdapter({} as never, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 32,
    }),
    passkey({
      rpID: "localhost",
      rpName: "awfixer.army",
    }),
  ],
});
