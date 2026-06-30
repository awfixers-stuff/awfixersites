const AUTH_EMAIL_DOMAIN = "id.awfixer.army";

export function internalUserEmail(username: string) {
  const normalized = username.trim().toLowerCase();
  return `${normalized}@${AUTH_EMAIL_DOMAIN}`;
}

export function getAuthSecret() {
  const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing BETTER_AUTH_SECRET (or AUTH_SECRET).");
  }
  return secret;
}

function normalizeOrigin(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${trimmed.replace(/\/$/, "")}`;
}

function addOrigin(origins: Set<string>, value: string | undefined) {
  const origin = normalizeOrigin(value);
  if (origin) origins.add(origin);
}

function isLocalhostValue(value: string | undefined) {
  const normalized = normalizeOrigin(value);
  if (!normalized) return false;
  try {
    return new URL(normalized).hostname === "localhost";
  } catch {
    return value?.includes("localhost") ?? false;
  }
}

export function getAuthBaseUrl() {
  const configured =
    process.env.BETTER_AUTH_URL ?? process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  const normalizedConfigured = configured ? normalizeOrigin(configured) : undefined;
  const vercelOrigin = normalizeOrigin(process.env.VERCEL_URL);

  if (vercelOrigin && isLocalhostValue(normalizedConfigured)) {
    return vercelOrigin;
  }

  if (normalizedConfigured) {
    return normalizedConfigured;
  }

  if (vercelOrigin) {
    return vercelOrigin;
  }

  return "http://localhost:3000";
}

export function getPasskeyRpId() {
  const configured = process.env.AUTH_PASSKEY_RP_ID ?? process.env.BETTER_AUTH_RP_ID;
  if (configured && !(process.env.VERCEL_URL && configured === "localhost")) {
    return configured;
  }

  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL;
  }

  return "localhost";
}

export function getPasskeyRpName() {
  return process.env.AUTH_PASSKEY_RP_NAME ?? process.env.BETTER_AUTH_RP_NAME ?? "awfixer.army";
}

export function getTrustedOrigins() {
  const origins = new Set<string>();

  addOrigin(origins, getAuthBaseUrl());
  addOrigin(origins, process.env.NEXT_PUBLIC_APP_URL);
  addOrigin(origins, process.env.VERCEL_URL);
  addOrigin(origins, process.env.VERCEL_BRANCH_URL);

  if (process.env.NODE_ENV !== "production") {
    addOrigin(origins, "http://localhost:3000");
  }

  const extra = process.env.AUTH_TRUSTED_ORIGINS?.split(",");
  if (extra) {
    for (const origin of extra) {
      addOrigin(origins, origin);
    }
  }

  return [...origins];
}
