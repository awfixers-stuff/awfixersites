import posthog from "posthog-js";

import type { TelemetryProvider } from "./types";

export function initPosthog(options: { apiKey: string; apiHost?: string }): void {
  posthog.init(options.apiKey, {
    api_host: options.apiHost ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
  });
}

export const posthogProvider: TelemetryProvider = {
  name: "posthog",
  track(event, properties) {
    posthog.capture(event, properties);
  },
  identify(distinctId, traits) {
    posthog.identify(distinctId, traits);
  },
  pageview(url) {
    posthog.capture("$pageview", { $current_url: url });
  },
  captureError(error, context) {
    posthog.captureException(error, context);
  },
  getDistinctId() {
    return posthog.get_distinct_id();
  },
};
