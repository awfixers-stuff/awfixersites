/** Apex domains that receive a `donate.<apex>` alias for the shared donate app. */
export const DONATE_APEX_DOMAINS = [
  "awfixer.church",
  "awfixer.army",
  "awfixer.codes",
  "awfixer.cloud",
  "awfixer.network",
  "awfixer.news",
  "awfixer.cash",
  "awfixer.space",
  "awfixer.me",
  "awfixer.llc",
  "legal.awfixer.llc",
  "careers.awfixer.llc",
  "agent.awfixer.codes",
] as const;

export function donateUrlForApex(apex: string): string {
  return `https://donate.${apex}`;
}
