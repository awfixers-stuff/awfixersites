import type { LinkRegistry } from "./schema";

/** Fleet-wide TARGETID registry — single source of truth for clink redirects. */
export const LINKS = {
  about: { kind: "internal", path: "/about" },
  aacj: { kind: "internal", path: "/aacj" },
  account: { kind: "internal", path: "/" },
  careers: { kind: "internal", path: "/" },
  church: { kind: "internal", path: "/" },
  codes: { kind: "internal", path: "/" },
  donate: { kind: "internal", path: "/donate" },
  enlist: { kind: "internal", path: "/enlist" },
  legal: { kind: "internal", path: "/legal" },
  llc: { kind: "internal", path: "/" },
  news: { kind: "internal", path: "/" },
  ranks: { kind: "internal", path: "/ranks" },
  signin: { kind: "internal", path: "/sign-in" },
  tips: { kind: "internal", path: "/" },
  "auth-awfixer": {
    kind: "external",
    url: "https://auth.awfixer.me",
    utm: { source: "fleet", medium: "referral" },
  },
  "github-awfixer": {
    kind: "external",
    url: "https://github.com/awfixers-stuff",
    utm: { source: "fleet", medium: "referral" },
  },
  "legal-awfixer": {
    kind: "external",
    url: "https://legal.awfixer.llc",
    utm: { source: "fleet", medium: "referral" },
  },
} as const satisfies LinkRegistry;

export type TargetId = keyof typeof LINKS;

const registry = LINKS as LinkRegistry;

export function getLinkEntry(targetId: string) {
  return registry[targetId];
}

export function listTargetIds(): string[] {
  return Object.keys(registry);
}