/**
 * Postgres URL resolution for dev (repo root `.env.local`) and Vercel (project env).
 * Prefer explicit AUTH_* / DATABASE_URL; fall back to shared Prisma Data Platform URLs.
 */
export function getAppDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.PRISMA_DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.ENLIST_DATABASE_URL ??
    process.env.AUTH_DATABASE_URL
  );
}

/** IdP / default auth Prisma — not OAuth client session DBs (see `packages/auth/src/prisma.ts`). */
export function getAuthDatabaseUrl(): string | undefined {
  return (
    process.env.AUTH_DATABASE_URL ??
    process.env.AUTH_PRISMA_DATABASE_URL ??
    process.env.PRISMA_DATABASE_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL
  );
}
