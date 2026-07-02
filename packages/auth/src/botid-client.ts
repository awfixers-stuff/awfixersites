import { initBotId } from "botid/client/core";

import {
  BOTID_API_V1_ROUTES,
  BOTID_CLIENT_PROTECT_BASE,
  BOTID_OAUTH_PROTECT,
  type BotIdProtectRoute,
} from "./botid-protect";

export { BOTID_CLIENT_PROTECT_BASE };
export type { BotIdProtectRoute };

function botIdRouteKey(route: BotIdProtectRoute): string {
  return `${route.method}:${route.path}`;
}

/** Call once from each app's `instrumentation-client.ts` (Next.js 15.3+). */
export function registerAppBotId(extra: BotIdProtectRoute[] = []): void {
  const merged: BotIdProtectRoute[] = [...BOTID_CLIENT_PROTECT_BASE, ...extra];
  const seen: Record<string, true> = {};
  const protect: BotIdProtectRoute[] = [];
  for (const route of merged) {
    const key = botIdRouteKey(route);
    if (seen[key]) {
      continue;
    }
    seen[key] = true;
    protect.push(route);
  }
  initBotId({ protect });
}

/** BotID routes for api.awfixer.me (OAuth at /oauth, shared v1 APIs). */
export function registerApiBotId(): void {
  initBotId({ protect: [...BOTID_OAUTH_PROTECT, ...BOTID_API_V1_ROUTES] });
}
