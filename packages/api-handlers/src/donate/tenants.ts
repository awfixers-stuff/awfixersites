export type DonateTenant = {
  id: string;
  host: string;
  displayName: string;
  tagline: string;
  parentUrl: string;
  contactEmail: string;
};

const DEFAULT_TENANT: DonateTenant = {
  id: "church",
  host: "donate.awfixer.church",
  displayName: "AWFixer's Church",
  tagline: "Support the mission behind every AWFixer property.",
  parentUrl: "https://awfixer.church",
  contactEmail: "contact@awfixer.church",
};

/** donate.<apex> host → branding for that property. Funds always go to the church nonprofit. */
const TENANTS: Record<string, DonateTenant> = {
  "donate.awfixer.church": {
    id: "church",
    host: "donate.awfixer.church",
    displayName: "AWFixer's Church",
    tagline: "Carry the question into the world.",
    parentUrl: "https://awfixer.church",
    contactEmail: "contact@awfixer.church",
  },
  "donate.awfixer.army": {
    id: "army",
    host: "donate.awfixer.army",
    displayName: "AWFixer Army",
    tagline: "Fund disciplined action in the field.",
    parentUrl: "https://awfixer.army",
    contactEmail: "contact@awfixer.army",
  },
  "donate.awfixer.codes": {
    id: "codes",
    host: "donate.awfixer.codes",
    displayName: "AWFixer Codes",
    tagline: "Back the platform layer for teams who ship.",
    parentUrl: "https://awfixer.codes",
    contactEmail: "codes@awfixer.me",
  },
  "donate.awfixer.cloud": {
    id: "cloud",
    host: "donate.awfixer.cloud",
    displayName: "AWFixer Cloud",
    tagline: "Sustain the infrastructure that keeps us running.",
    parentUrl: "https://awfixer.cloud",
    contactEmail: "developers@awfixer.llc",
  },
  "donate.awfixer.network": {
    id: "network",
    host: "donate.awfixer.network",
    displayName: "AWFixer Network",
    tagline: "Strengthen connectivity across the property graph.",
    parentUrl: "https://awfixer.network",
    contactEmail: "developers@awfixer.llc",
  },
  "donate.awfixer.news": {
    id: "news",
    host: "donate.awfixer.news",
    displayName: "AWFixer News",
    tagline: "Fund independent journalism without the filter.",
    parentUrl: "https://awfixer.news",
    contactEmail: "developers@awfixer.llc",
  },
  "donate.awfixer.cash": {
    id: "cash",
    host: "donate.awfixer.cash",
    displayName: "AWFixer Cash",
    tagline: "Support financial rails for church-owned commerce.",
    parentUrl: "https://awfixer.cash",
    contactEmail: "developers@awfixer.llc",
  },
  "donate.awfixer.space": {
    id: "space",
    host: "donate.awfixer.space",
    displayName: "AWFixer Space",
    tagline: "Invest in long-horizon mission programs.",
    parentUrl: "https://awfixer.space",
    contactEmail: "developers@awfixer.llc",
  },
  "donate.awfixer.me": {
    id: "me",
    host: "donate.awfixer.me",
    displayName: "awfixer.me",
    tagline: "Support the identity layer of the network.",
    parentUrl: "https://awfixer.me",
    contactEmail: "contact@theautist.me",
  },
  "donate.awfixer.llc": {
    id: "llc",
    host: "donate.awfixer.llc",
    displayName: "AWFixer LLC",
    tagline: "Back oversight and operations across the portfolio.",
    parentUrl: "https://awfixer.llc",
    contactEmail: "developers@awfixer.llc",
  },
  "donate.legal.awfixer.llc": {
    id: "legal",
    host: "donate.legal.awfixer.llc",
    displayName: "AWFixer Legal",
    tagline: "Support canonical legal and compliance work.",
    parentUrl: "https://legal.awfixer.llc",
    contactEmail: "legal@awfixer.me",
  },
  "donate.careers.awfixer.llc": {
    id: "careers",
    host: "donate.careers.awfixer.llc",
    displayName: "AWFixer Careers",
    tagline: "Fund the people building across the movement.",
    parentUrl: "https://careers.awfixer.llc",
    contactEmail: "careers@awfixer.me",
  },
  "donate.agent.awfixer.codes": {
    id: "agent",
    host: "donate.agent.awfixer.codes",
    displayName: "AWFixer Agent",
    tagline: "Support autonomous tooling across the ecosystem.",
    parentUrl: "https://agent.awfixer.codes",
    contactEmail: "contact@agent.awfixer.codes",
  },
};

export { DONATE_APEX_DOMAINS, donateUrlForApex } from "../../../../src/donate-domains.js";

export function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  return host.split(":")[0]?.toLowerCase() ?? null;
}

export function resolveTenant(host: string | null | undefined): DonateTenant {
  const normalized = normalizeHost(host);
  if (!normalized) return DEFAULT_TENANT;
  return TENANTS[normalized] ?? DEFAULT_TENANT;
}

export function listKnownTenants(): DonateTenant[] {
  return Object.values(TENANTS);
}
