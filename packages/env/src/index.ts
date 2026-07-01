/**
 * Postgres URL resolution for dev (repo root `.env.local`) and Vercel (project env).
 * Canonical variable: PRISMA_DATABASE_URL (Prisma Data Platform).
 */

function isPostgresUrl(value: string | undefined): value is string {
  if (!value?.trim()) return false;
  const url = value.trim();
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

function firstPostgresUrl(candidates: (string | undefined)[]): string | undefined {
  for (const candidate of candidates) {
    if (isPostgresUrl(candidate)) {
      return candidate.trim();
    }
  }
  return undefined;
}

export function getAppDatabaseUrl(): string | undefined {
  return firstPostgresUrl([
    process.env.PRISMA_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.ENLIST_DATABASE_URL,
    process.env.AUTH_PRISMA_DATABASE_URL,
    process.env.AUTH_DATABASE_URL,
  ]);
}

/** IdP / default auth Prisma — not OAuth client session DBs (see `packages/auth/src/prisma.ts`). */
export function getAuthDatabaseUrl(): string | undefined {
  return firstPostgresUrl([
    process.env.PRISMA_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.AUTH_PRISMA_DATABASE_URL,
    process.env.AUTH_DATABASE_URL,
  ]);
}
