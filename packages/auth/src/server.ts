import { betterAuth } from "better-auth";

import { createAuthOptions } from "./auth-options";
import { prisma } from "./prisma";

export const auth = betterAuth(createAuthOptions(prisma));

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
