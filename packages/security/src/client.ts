import arcjet from "@arcjet/next";

export type AppArcjetOptions = Omit<Parameters<typeof arcjet>[0], "key"> & {
  key?: string;
};

export function getArcjetKey(): string | undefined {
  const key = process.env.ARCJET_KEY?.trim();
  return key || undefined;
}

/**
 * Creates an Arcjet client when `ARCJET_KEY` (or `options.key`) is configured.
 * Returns `null` when security is not enabled for the current environment.
 */
export function createAppArcjet(options: AppArcjetOptions) {
  const key = options.key ?? getArcjetKey();
  if (!key) return null;
  return arcjet({ ...options, key });
}
