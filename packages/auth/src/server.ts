import { betterAuth } from "better-auth";

import type { AwfixerBetterAuthServer, AwfixerBetterAuthSession } from "./auth-types";
import { createAuthOptions } from "./auth-options";
import { prisma } from "./prisma";

let authInstance: AwfixerBetterAuthServer | undefined;

/** Lazily initializes Better Auth on first use (runtime env, not build). */
export function getAuth(): AwfixerBetterAuthServer {
  if (!authInstance) {
    authInstance = betterAuth(createAuthOptions(prisma)) as AwfixerBetterAuthServer;
  }
  return authInstance;
}

export type Auth = AwfixerBetterAuthServer;
export type Session = AwfixerBetterAuthSession;

/** @deprecated Use `getAuth()` — lazy init for runtime env. */
export const auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
