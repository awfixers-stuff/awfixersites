import { initBotId } from "botid/client/core";

import { BOTID_CLIENT_PROTECT_BASE, type BotIdProtectRoute } from "./botid-protect";

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
