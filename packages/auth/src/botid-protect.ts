/** Routes registered with Vercel BotID client `initBotId({ protect })`. */
export type BotIdProtectRoute = {
  path: string;
  method: string;
  advancedOptions?: { checkLevel?: "deepAnalysis" | "basic" };
};

/** Shared across all Next apps — extend per app for bespoke API routes. */
export const BOTID_CLIENT_PROTECT_BASE: BotIdProtectRoute[] = [
  { path: "/api/auth/*", method: "POST" },
  { path: "/api/auth/*", method: "PATCH" },
  { path: "/api/auth/*", method: "PUT" },
  { path: "/api/auth/*", method: "DELETE" },
];

export const BOTID_DONATE_ROUTES: BotIdProtectRoute[] = [
  {
    path: "/api/create-payment-intent",
    method: "POST",
    advancedOptions: { checkLevel: "deepAnalysis" },
  },
];

export const BOTID_TIPS_ROUTES: BotIdProtectRoute[] = [
  {
    path: "/api/submit-tip",
    method: "POST",
    advancedOptions: { checkLevel: "deepAnalysis" },
  },
];

export const BOTID_ARMY_ROUTES: BotIdProtectRoute[] = [
  {
    path: "/api/enlistments",
    method: "POST",
    advancedOptions: { checkLevel: "deepAnalysis" },
  },
];
