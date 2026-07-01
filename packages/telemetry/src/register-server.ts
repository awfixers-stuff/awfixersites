import { registerProvider } from "./providers/registry";
import { initSentry, sentryProvider } from "./providers/sentry";
import { captureError } from "./track";

export function registerServerTelemetry(options: { app: string }): void {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  initSentry({ dsn, app: options.app });
  registerProvider(sentryProvider);
}

export function onRequestErrorTelemetry(
  error: unknown,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string },
): void {
  captureError(error, {
    path: request.path,
    routerKind: context.routerKind,
    routeType: context.routeType,
  });
}
