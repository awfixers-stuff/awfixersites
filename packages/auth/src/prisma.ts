import { getAuthDatabaseUrl as resolveAuthDatabaseUrl } from "@awfixersites/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getAuthDatabaseUrl() {
  const role = process.env.AUTH_DEPLOYMENT_ROLE?.trim().toLowerCase();
  if (role === "client") {
    const siteKey = process.env.AUTH_OAUTH_SITE_KEY?.trim().toUpperCase();
    const siteUrl =
      siteKey && process.env[`AUTH_${siteKey}_SESSION_DATABASE_URL`]
        ? process.env[`AUTH_${siteKey}_SESSION_DATABASE_URL`]
        : undefined;
    const clientUrl = process.env.AUTH_CLIENT_DATABASE_URL ?? siteUrl;
    if (!clientUrl) {
      throw new Error(
        "Missing AUTH_CLIENT_DATABASE_URL (or AUTH_<SITE>_SESSION_DATABASE_URL) for OAuth client apps.",
      );
    }
    return clientUrl;
  }

  const connectionString = resolveAuthDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "Missing auth database URL. Set PRISMA_DATABASE_URL (or DATABASE_URL / POSTGRES_URL) in .env.local.",
    );
  }
  return connectionString;
}

function createPrismaClient() {
  const connectionString = getAuthDatabaseUrl();

  const pool = globalForPrisma.pool ?? new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

/** Lazy Prisma client — no DB URL required until first query. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
