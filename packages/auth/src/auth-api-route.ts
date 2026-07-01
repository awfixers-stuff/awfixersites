import { toNextJsHandler } from "better-auth/next-js";

import { getAuth } from "./server";

type AuthHandlers = ReturnType<typeof toNextJsHandler>;

let cachedHandlers: AuthHandlers | undefined;

function authHandlers(): AuthHandlers {
  cachedHandlers ??= toNextJsHandler(getAuth());
  return cachedHandlers;
}

export function GET(request: Request) {
  return authHandlers().GET(request);
}

export function POST(request: Request) {
  return authHandlers().POST(request);
}

export function PATCH(request: Request) {
  return authHandlers().PATCH(request);
}

export function PUT(request: Request) {
  return authHandlers().PUT(request);
}

export function DELETE(request: Request) {
  return authHandlers().DELETE(request);
}
