import * as Sentry from "@sentry/nextjs";

import type { TelemetryProvider } from "./types";

export function initSentry(options: { dsn: string; app: string; environment?: string }): void {
  Sentry.init({
    dsn: options.dsn,
    environment: options.environment ?? process.env.NODE_ENV,
    initialScope: { tags: { app: options.app } },
  });
}

export const sentryProvider: TelemetryProvider = {
  name: "sentry",
  track(event, properties) {
    Sentry.addBreadcrumb({ category: "track", message: event, data: properties, level: "info" });
  },
  captureError(error, context) {
    Sentry.captureException(error, { extra: context });
  },
};
