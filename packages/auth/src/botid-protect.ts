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

export const BOTID_OAUTH_PROTECT: BotIdProtectRoute[] = [
  { path: "/oauth/*", method: "POST" },
  { path: "/oauth/*", method: "PATCH" },
  { path: "/oauth/*", method: "PUT" },
  { path: "/oauth/*", method: "DELETE" },
];

export const BOTID_API_V1_ROUTES: BotIdProtectRoute[] = [
  {
    path: "/v1/tips",
    method: "POST",
    advancedOptions: { checkLevel: "deepAnalysis" },
  },
  {
    path: "/v1/donate/intents",
    method: "POST",
    advancedOptions: { checkLevel: "deepAnalysis" },
  },
  {
    path: "/v1/enlistments",
    method: "POST",
    advancedOptions: { checkLevel: "deepAnalysis" },
  },
];
