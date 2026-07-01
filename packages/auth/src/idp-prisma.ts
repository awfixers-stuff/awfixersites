import { getAuthDatabaseUrl } from "@awfixersites/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../generated/prisma/client";

const globalForIdpPrisma = globalThis as unknown as {
  idpPrisma: PrismaClient | undefined;
  idpPool: Pool | undefined;
};

function getIdpDatabaseUrl() {
  const connectionString = getAuthDatabaseUrl() ?? process.env.AUTH_IDP_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing IdP database URL. Set PRISMA_DATABASE_URL (or AUTH_IDP_DATABASE_URL) for admin operations.",
    );
  }

  return connectionString;
}

function createIdpPrismaClient() {
  const connectionString = getIdpDatabaseUrl();
  const pool = globalForIdpPrisma.idpPool ?? new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForIdpPrisma.idpPool = pool;
  }

  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (globalForIdpPrisma.idpPrisma) {
    return globalForIdpPrisma.idpPrisma;
  }

  const client = createIdpPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForIdpPrisma.idpPrisma = client;
  }

  return client;
}

/** IdP Postgres — use only in server code that manages users/OAuth (not OAuth client sessions). */
export const idpPrisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
