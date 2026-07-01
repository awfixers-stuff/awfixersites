import { toNextJsHandler } from "better-auth/next-js";

import { rejectBotUnlessHuman } from "./botid-server";
import { getAuth } from "./server";

/** Handlers from `toNextJsHandler(getAuth())` — Better Auth Next.js route adapter. */
export interface BetterAuthNextRouteHandlers {
  GET: (request: Request) => Response | Promise<Response>;
  POST: (request: Request) => Response | Promise<Response>;
  PATCH: (request: Request) => Response | Promise<Response>;
  PUT: (request: Request) => Response | Promise<Response>;
  DELETE: (request: Request) => Response | Promise<Response>;
}

let cachedHandlers: BetterAuthNextRouteHandlers | undefined;

function authHandlers(): BetterAuthNextRouteHandlers {
  cachedHandlers ??= toNextJsHandler(getAuth());
  return cachedHandlers;
}

async function withBotIdGate(
  request: Request,
  handler: (request: Request) => Response | Promise<Response>,
): Promise<Response> {
  const blocked = await rejectBotUnlessHuman();
  if (blocked) {
    return blocked;
  }
  return handler(request);
}

export function GET(request: Request) {
  return authHandlers().GET(request);
}

export async function POST(request: Request) {
  return withBotIdGate(request, (req) => authHandlers().POST(req));
}

export async function PATCH(request: Request) {
  return withBotIdGate(request, (req) => authHandlers().PATCH(req));
}

export async function PUT(request: Request) {
  return withBotIdGate(request, (req) => authHandlers().PUT(req));
}

export async function DELETE(request: Request) {
  return withBotIdGate(request, (req) => authHandlers().DELETE(req));
}
