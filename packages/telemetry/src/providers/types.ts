export interface TelemetryProvider {
  name: string;
  track?(event: string, properties?: Record<string, unknown>): void;
  identify?(distinctId: string, traits?: Record<string, unknown>): void;
  pageview?(url: string): void;
  captureError?(error: unknown, context?: Record<string, unknown>): void;
  getDistinctId?(): string | undefined;
}
