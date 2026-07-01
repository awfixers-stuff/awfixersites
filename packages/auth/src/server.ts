import { betterAuth } from "better-auth";

import { createAuthOptions } from "./auth-options";
import { prisma } from "./prisma";

let authInstance: ReturnType<typeof betterAuth> | undefined;

/** Lazily initializes Better Auth on first use (runtime env, not build). */
export function getAuth() {
  authInstance ??= betterAuth(createAuthOptions(prisma));
  return authInstance;
}

export type Auth = ReturnType<typeof getAuth>;
export type Session = Auth["$Infer"]["Session"];

/** @deprecated Use `getAuth()` — lazy init for runtime env. */
export const auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
