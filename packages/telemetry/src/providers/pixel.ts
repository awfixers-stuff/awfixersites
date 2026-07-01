import type { TelemetryProvider } from "./types";

/**
 * Inert until X/Twitter pixel is implemented — never registered by
 * registerAppTelemetry/registerServerTelemetry today. Fill in the methods
 * below when pixel support is added; no app code needs to change.
 */
export const pixelProvider: TelemetryProvider = {
  name: "pixel",
  track() {},
  identify() {},
  pageview() {},
  captureError() {},
  getDistinctId() {
    return undefined;
  },
};
