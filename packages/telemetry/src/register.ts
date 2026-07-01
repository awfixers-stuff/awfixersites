import { initPosthog, posthogProvider } from "./providers/posthog";
import { registerProvider } from "./providers/registry";
import { initSentry, sentryProvider } from "./providers/sentry";

export function registerAppTelemetry(options: { app: string }): void {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (sentryDsn) {
    initSentry({ dsn: sentryDsn, app: options.app });
    registerProvider(sentryProvider);
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (posthogKey) {
    initPosthog({ apiKey: posthogKey, apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST });
    registerProvider(posthogProvider);
  }
}
